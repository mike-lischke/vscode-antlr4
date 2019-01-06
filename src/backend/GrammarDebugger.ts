/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { EventEmitter } from "events";

import {
    ANTLRInputStream,
    CommonTokenStream, CommonToken, ParserRuleContext, Token, Lexer, Parser
} from "antlr4ts";

import {
    ATNStateType, Transition} from "antlr4ts/atn";

import { ParseTree, ErrorNode, TerminalNode } from "antlr4ts/tree";

import { Symbol, ScopedSymbol, BlockSymbol, VariableSymbol } from "antlr4-c3";

import { InterpreterData } from "./InterpreterDataReader";
import {
    LexerToken, ParseTreeNode, ParseTreeNodeType, LexicalRange, IndexRange
} from "./facade";

import {
    AlternativeSymbol, RuleReferenceSymbol, EbnfSuffixSymbol, RuleSymbol, ActionSymbol
} from "./ContextSymbolTable";

import { SourceContext } from "./SourceContext";
import {
    GrammarLexerInterpreter, InterpreterLexerErrorListener, GrammarParserInterpreter, InterpreterParserErrorListener, RunMode,
    InternalStackFrame, PredicateEvaluator
} from "./GrammarInterpreters";

export interface GrapsBreakPoint {
    source: string;
    validated: boolean;
    line: number;
    id: number;
}

export interface GrapsStackFrame {
    name: string;
    source: string;
    next: LexicalRange[];
}

/**
 * This class provides debugging support for a grammar.
 */
export class GrammarDebugger extends EventEmitter {
    constructor(private contexts: SourceContext[], actionFile: string) {
        super();

        if (this.contexts.length == 0) {
            return;
        }

        if (actionFile) {
            // Always fully reload the script to allow changing it between parse runs.
            delete require.cache[require.resolve(actionFile)];
            const { PredicateEvaluator, evaluateLexerPredicate, evaluateParserPredicate } = require(actionFile);
            if (PredicateEvaluator) {
                this.predicateEvaluator = new PredicateEvaluator();
            } else {
                this.predicateEvaluator = { evaluateLexerPredicate: evaluateLexerPredicate, evaluateParserPredicate: evaluateParserPredicate };
            }
        }

        // The context list contains all dependencies of the main grammar (which is the first entry).
        // There can be only one context with lexer data (either the main context if that represents a combined
        // grammar) or a dedicated lexer context. Parser data is merged into one set (by ANTLR4) even if there
        // are sub grammars. We need sub grammar contexts for breakpoint validation and call stacks.
        if (this.isValid) {
            // Set up the required structures with an empty input stream.
            // On start we will replace that with the actual input.
            let lexerName = "";
            for (let context of this.contexts) {
                let [lexerData, parserData] = context.interpreterData;
                if (!this.lexerData && lexerData) {
                    this.lexerData = lexerData;
                    lexerName = context.fileName;
                }

                if (!this.parserData && parserData) {
                    this.parserData = parserData;
                }
            }

            let eventSink = (event: string | symbol, ...args: any[]): boolean => {
                return this.emit(event, args);
            };

            if (this.lexerData) {
                let stream = new ANTLRInputStream("");
                this.lexer = new GrammarLexerInterpreter(this.predicateEvaluator, this.contexts[0], lexerName, this.lexerData, stream);
                this.lexer.removeErrorListeners();
                this.lexer.addErrorListener(new InterpreterLexerErrorListener(eventSink));
                this.tokenStream = new CommonTokenStream(this.lexer);
            }

            if (this.parserData) {
                this.parser = new GrammarParserInterpreter(eventSink, this.predicateEvaluator, this.contexts[0], this.parserData, this.tokenStream);
                this.parser.buildParseTree = true;
                this.parser.removeErrorListeners();
                this.parser.addErrorListener(new InterpreterParserErrorListener(eventSink));
            }
        }
    }

    public get isValid() {
        return this.contexts.find(context => !context.isInterpreterDataLoaded) == undefined;
    }

    public start(startRuleIndex: number, input: string, noDebug: boolean) {
        let stream = new ANTLRInputStream(input);
        this.lexer.inputStream = stream;

        if (!this.parser) {
            this.sendEvent("end");
            return;
        }

        this.parseTree = undefined;
        this.parser.breakPoints.clear();

        if (noDebug) {
            //this.parser.setProfile(true);
            this.parseTree = this.parser.parse(startRuleIndex);
            this.sendEvent("end");
        } else {
            for (let bp of this.breakPoints) {
                this.validateBreakPoint(bp[1]);
            }

            this.parser.start(startRuleIndex);
            this.continue();
        }
    }

    public continue() {
        if (this.parser) {
            this.parseTree = this.parser.continue(RunMode.Normal);
        }
    }

    public stepIn() {
        if (this.parser) {
            this.parseTree = this.parser.continue(RunMode.StepIn);
        }
    }

    public stepOut() {
        if (this.parser) {
            this.parseTree = this.parser.continue(RunMode.StepOut);
        }
    }

    public stepOver() {
        if (this.parser) {
            this.parseTree = this.parser.continue(RunMode.StepOver);
        }
    }

    public stop() {
        // no-op
    }

    public pause() {
    }

    public clearBreakPoints(): void {
        this.breakPoints.clear();
        if (this.parser) {
            this.parser.breakPoints.clear();
        }
    }

    public addBreakPoint(path: string, line: number): GrapsBreakPoint {
        let breakPoint = <GrapsBreakPoint>{ source: path, validated: false, line: line, id: this.nextBreakPointId++ };
        this.breakPoints.set(breakPoint.id, breakPoint);
        this.validateBreakPoint(breakPoint);

        return breakPoint;
    }

    public get tokenList(): LexerToken[] {
        this.tokenStream.fill();
        let result: LexerToken[] = [];
        for (let token of this.tokenStream.getTokens()) {
            let entry = this.convertToken(<CommonToken>token);
            if (entry) {
                result.push(entry);
            }
        }
        return result;
    }

    public get errorCount(): number {
        if (!this.parser) {
            return 0;
        }

        return this.parser.numberOfSyntaxErrors;
    }

    public get inputSize(): number {
        if (!this.parser) {
            return 0;
        }

        return this.parser.inputStream.size;
    }

    public ruleNameFromIndex(ruleIndex: number): string | undefined {
        if (!this.parser) {
            return;
        }
        if (ruleIndex < 0 || ruleIndex >= this.parser.ruleNames.length) {
            return;
        }
        return this.parser.ruleNames[ruleIndex];
    }

    public ruleIndexFromName(ruleName: string): number {
        if (!this.parser) {
            return -1;
        }
        return this.parser.ruleNames.findIndex(entry => entry == ruleName);
    }

    public get currentParseTree(): ParseTreeNode | undefined {
        if (!this.parseTree) {
            return undefined;
        }

        return this.parseContextToNode(this.parseTree);
    }

    public get currentStackTrace(): GrapsStackFrame[] {
        let result: GrapsStackFrame[] = [];
        if (this.parser) {
            for (let frame of this.parser.callStack) {
                let externalFrame = <GrapsStackFrame>{
                    name: frame.name,
                    source: frame.source,
                    next: []
                }

                for (let next of frame.next) {
                    if (next.context instanceof ParserRuleContext) {
                        let start = next.context.start;
                        let stop = next.context.stop;
                        externalFrame.next.push({
                            start: { column: start.charPositionInLine, row: start.line },
                            end: { column: stop ? stop.charPositionInLine : 0, row: stop ? stop.line : start.line },
                        });
                    } else {
                        let terminal = (next.context as TerminalNode).symbol;
                        let length = terminal.stopIndex - terminal.startIndex + 1;
                        externalFrame.next.push({
                            start: { column: terminal.charPositionInLine, row: terminal.line },
                            end: { column: terminal.charPositionInLine + length, row: terminal.line },
                        });
                    }
                }
                result.push(externalFrame);
            }
        }
        return result.reverse();
    }

    public get currentTokenIndex(): number {
        return this.tokenStream.index;
    }

    /**
     * Return a string describing the stack frame at the given index.
     * Note: we return the stack trace reverted, so we have to account for that here.
     */
    public getStackInfo(index: number): string {
        if (!this.parser || index < 0 || index > this.parser.callStack.length) {
            return "Invalid Stack Frame";
        }
        let frame = this.parser.callStack[this.parser.callStack.length - index - 1];
        return "Context " + frame.name;
    }

    public getVariables(index: number): [string, string][] {
        let result: [string, string][] = [];
        if (!this.parser || index < 0 || index > this.parser.callStack.length) {
            return [];
        }
        let frame = this.parser.callStack[this.parser.callStack.length - index - 1];

        // There's always at least one current symbol in the given frame.
        // Go up the parent chain to find the rule symbol which contains this current symbol.
        let run = frame.current[0];
        while (run && !(run instanceof RuleSymbol)) {
            run = run.parent as ScopedSymbol;
        }

        if (run) {
            // Walk up the parent chain of the current parser rule context to find the
            // corresponding context for our stack frame.
            let context = this.parser.context;
            while (index-- > 0) {
                context = context.parent!;
            }

            let symbols = (run as ScopedSymbol).getNestedSymbolsOfType(VariableSymbol);

            // Coalesce variable names and look up the value.
            let variables: Set<string> = new Set<string>();
            for (let symbol of symbols) {
                variables.add(symbol.name);
            }
            for (let variable of variables) {
                // TODO: there are no variables stored in the interpreter.
                // Possible solution: handle that manually with the help of the symbol table.
            }
        }

        return result;
    }

    public sendEvent(event: string, ...args: any[]) {
        setImmediate(_ => {
            this.emit(event, ...args);
        });
    }

    private parseContextToNode(tree: ParseTree): ParseTreeNode {
        let result = new ParseTreeNode();
        result.children = [];
        if (tree instanceof ParserRuleContext) {
            result.type = ParseTreeNodeType.Rule;
            result.ruleIndex = tree.ruleIndex;
            result.name = this.parser!.ruleNames[tree.ruleIndex];
            result.start = this.convertToken(tree.start as CommonToken);
            result.stop = this.convertToken(tree.stop as CommonToken);
            result.id = this.computeHash(tree);


            result.range = new IndexRange();
            result.range.startIndex = tree.sourceInterval.a;
            result.range.stopIndex = tree.sourceInterval.b;
            result.range.length = tree.sourceInterval.length;

            if (tree.children) {
                for (let child of tree.children) {
                    if ((child instanceof TerminalNode) && (child.symbol.type == Token.EOF)) {
                        continue;
                    }
                    result.children.push(this.parseContextToNode(child));
                }
            }
        } else if (tree instanceof ErrorNode) {
            result.type = ParseTreeNodeType.Error;
            result.symbol = this.convertToken(tree.symbol as CommonToken);
            result.id = this.computeHash(tree.symbol as CommonToken);
            if (result.symbol) {
                result.name = result.symbol.name;
            } else {
                result.name = "<no name>";
            }
        } else {
            // Must be a terminal node then.
            result.type = ParseTreeNodeType.Terminal;
            let token = (tree as TerminalNode).symbol as CommonToken;
            result.symbol = this.convertToken(token);
            result.id = this.computeHash(token);

            if (result.symbol) {
                result.name = result.symbol.name;
            } else {
                result.name = "<no name>";
            }
        }

        return result;
    }

    /**
     * A simple hash function for rule contexts and common tokens.
     */
    private computeHash(input: ParserRuleContext | CommonToken): number {
        var hash = 0;
        if (input instanceof ParserRuleContext) {
            hash = (31 * hash) + input.start.inputStream!.size; // Seed with a value that for sure goes beyond any possible token index.
            if (input.parent) {
                // Multiple invocations of the same rule which matches nothing appear as nodes in the parse tree with the same
                // start token, so we need an additional property to tell them apart: the child index.
                hash = (31 * hash) + input.parent.children!.findIndex((element) => element == input);
            }
            hash = (31 * hash) + input.depth();
            hash = (31 * hash) + input.ruleIndex;
            hash = (31 * hash) + input.start.type >>> 0;
            hash = (31 * hash) + input.start.tokenIndex >>> 0;
            hash = (31 * hash) + input.start.channel >>> 0;
        } else if (input instanceof CommonToken) {
            hash = (31 * hash) + input.tokenIndex >>> 0;
            hash = (31 * hash) + input.type >>> 0;
            hash = (31 * hash) + input.channel >>> 0;
        }

        return hash;
    }

    private convertToken(token: CommonToken): LexerToken | undefined {
        if (!token) {
            return;
        }

        return {
            text: token.text ? token.text : "",
            type: token.type,
            // For implicit tokens we use the same approach like ANTLR4 does for the naming.
            name: this.lexer.vocabulary.getSymbolicName(token.type) || "T__" + token.type,
            line: token.line,
            offset: token.charPositionInLine,
            channel: token.channel,
            tokenIndex: token.tokenIndex,
            startIndex: token.startIndex,
            stopIndex: token.stopIndex
        }
    }

    /**
     * Validates a breakpoint's position.
     * Breakpoints are aligned either to the first or the last rule line, hence the debugger
     * can only break on enter or on exit of the rule.
     * @param breakPoint The breakpoint to validate.
     */
    private validateBreakPoint(breakPoint: GrapsBreakPoint) {
        let context = this.contexts.find(context => context.fileName == breakPoint.source);
        if (!context || !this.parserData) {
            return;
        }

        // Assuming here a rule always starts in column 0.
        let rule = context.enclosingSymbolAtPosition(0, breakPoint.line, true);
        if (rule) {
            breakPoint.validated = true;

            // Main and sub grammars are combined in the ATN (and interpreter data), which means
            // the rule index must be looked up in the main context, regardless of the source file.
            let index = this.ruleIndexFromName(rule.name);
            if (breakPoint.line == rule.definition!.range.end.row) {
                // If the breakpoint's line is on the rule's end (the semicolon) then
                // use the rule's end state for break.
                let stop = this.parserData.atn.ruleToStopState[index];
                this.parser!.breakPoints.add(stop);
            } else {
                let start = this.parserData.atn.ruleToStartState[index];
                this.parser!.breakPoints.add(start);
                breakPoint.line = rule.definition!.range.start.row;
            }
            this.sendEvent("breakpointValidated", breakPoint);
        }
    }

    // Interpreter data for the main grammar as well as all imported grammars.
    private lexerData: InterpreterData | undefined;
    private parserData: InterpreterData | undefined;

    private lexer: GrammarLexerInterpreter;
    private tokenStream: CommonTokenStream;
    private parser: GrammarParserInterpreter | undefined;
    private parseTree: ParserRuleContext | undefined;

    private breakPoints: Map<number, GrapsBreakPoint> = new Map();
    private nextBreakPointId = 0;

    // Evaluation is possible either via an evaluator class or 2 evaluator functions.
    public predicateEvaluator?: PredicateEvaluator;
    public evaluateLexerPredicate?: (lexer: Lexer, ruleIndex: number, actionIndex: number, predicate: string) => boolean;
    public evaluateParserPredicate?: (parser: Parser, ruleIndex: number, actionIndex: number, predicate: string) => boolean;
}


