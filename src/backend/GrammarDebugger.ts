/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { EventEmitter } from "events";

import { CharStreams, CommonTokenStream, CommonToken, ParserRuleContext, Token } from "antlr4ts";
import { ParseTree, ErrorNode, TerminalNode } from "antlr4ts/tree";
import { ScopedSymbol, VariableSymbol } from "antlr4-c3";

import { IInterpreterData } from "./InterpreterDataReader";
import { ILexerToken, ILexicalRange, IParseTreeNode, PredicateFunction } from "./types";

import { RuleSymbol } from "./ContextSymbolTable";
import { SourceContext } from "./SourceContext";
import {
    GrammarLexerInterpreter, InterpreterLexerErrorListener, GrammarParserInterpreter, InterpreterParserErrorListener,
    RunMode,
} from "./GrammarInterpreters";

import * as vm from "vm";
import * as fs from "fs";

export interface IGrammarBreakPoint {
    source: string;
    validated: boolean;
    line: number;
    id: number;
}

export interface IGrammarStackFrame {
    name: string;
    source: string;
    next: ILexicalRange[];
}

/**
 * This class provides debugging support for a grammar.
 */
export class GrammarDebugger extends EventEmitter {
    // Interpreter data for the main grammar as well as all imported grammars.
    private lexerData: IInterpreterData | undefined;
    private parserData: IInterpreterData | undefined;

    private lexer: GrammarLexerInterpreter;
    private tokenStream: CommonTokenStream;
    private parser: GrammarParserInterpreter | undefined;
    private parseTree: ParserRuleContext | undefined;

    private breakPoints = new Map<number, IGrammarBreakPoint>();
    private nextBreakPointId = 0;

    public constructor(private contexts: SourceContext[], actionFile: string) {
        super();

        if (this.contexts.length === 0) {
            return;
        }

        let predicateFunction;

        if (actionFile) {
            const code = fs.readFileSync(actionFile, { encoding: "utf-8" }) + `
            const runPredicate = (predicate) => eval(predicate);
            runPredicate;
            `;

            predicateFunction = vm.runInNewContext(code) as PredicateFunction;
        }

        // The context list contains all dependencies of the main grammar (which is the first entry).
        // There can be only one context with lexer data (either the main context if that represents a combined
        // grammar) or a dedicated lexer context. Parser data is merged into one set (by ANTLR4) even if there
        // are sub grammars. We need sub grammar contexts for breakpoint validation and call stacks.
        if (this.isValid) {
            // Set up the required structures with an empty input stream.
            // On start we will replace that with the actual input.
            let lexerName = "";
            for (const context of this.contexts) {
                const [lexerData, parserData] = context.interpreterData;
                if (!this.lexerData && lexerData) {
                    this.lexerData = lexerData;
                    lexerName = context.fileName;
                }

                if (!this.parserData && parserData) {
                    this.parserData = parserData;
                }
            }

            const eventSink = (event: string | symbol, ...args: unknown[]): void => {
                setImmediate((_) => { return this.emit(event, args); });
            };

            if (this.lexerData) {
                const stream = CharStreams.fromString("");
                this.lexer = new GrammarLexerInterpreter(predicateFunction, this.contexts[0], lexerName,
                    this.lexerData, stream);
                this.lexer.removeErrorListeners();
                this.lexer.addErrorListener(new InterpreterLexerErrorListener(eventSink));
                this.tokenStream = new CommonTokenStream(this.lexer);
            }

            if (this.parserData) {
                this.parser = new GrammarParserInterpreter(eventSink, predicateFunction, this.contexts[0],
                    this.parserData, this.tokenStream);
                this.parser.buildParseTree = true;
                this.parser.removeErrorListeners();
                this.parser.addErrorListener(new InterpreterParserErrorListener(eventSink));
            }
        }
    }

    public get isValid(): boolean {
        return this.contexts.find((context) => { return !context.isInterpreterDataLoaded; }) === undefined;
    }

    public start(startRuleIndex: number, input: string, noDebug: boolean): void {
        const stream = CharStreams.fromString(input);
        this.lexer.inputStream = stream;

        if (!this.parser) {
            this.sendEvent("end");

            return;
        }

        this.parseTree = undefined;
        this.parser.breakPoints.clear();

        if (noDebug) {
            this.parser.setProfile(false).then(() => {
                if (this.parser) {
                    this.parseTree = this.parser.parse(startRuleIndex);
                }

                this.sendEvent("end");
            }).catch((reason) => {
                this.sendEvent("error", reason);
            });
        } else {
            this.breakPoints.forEach((breakPoint) => {
                this.validateBreakPoint(breakPoint);
            });

            this.parseTree = this.parser.start(startRuleIndex);
            this.continue();
        }
    }

    public continue(): void {
        if (this.parser) {
            this.parseTree = this.parser.continue(RunMode.Normal);
        }
    }

    public stepIn(): void {
        if (this.parser) {
            this.parseTree = this.parser.continue(RunMode.StepIn);
        }
    }

    public stepOut(): void {
        if (this.parser) {
            this.parseTree = this.parser.continue(RunMode.StepOut);
        }
    }

    public stepOver(): void {
        if (this.parser) {
            this.parseTree = this.parser.continue(RunMode.StepOver);
        }
    }

    public stop(): void {
        // no-op
    }

    public pause(): void {
        // no-op
    }

    public clearBreakPoints(): void {
        this.breakPoints.clear();
        if (this.parser) {
            this.parser.breakPoints.clear();
        }
    }

    public addBreakPoint(path: string, line: number): IGrammarBreakPoint {
        const breakPoint: IGrammarBreakPoint = {
            source: path,
            validated: false,
            line,
            id: this.nextBreakPointId++,
        };
        this.breakPoints.set(breakPoint.id, breakPoint);

        void this.validateBreakPoint(breakPoint);

        return breakPoint;
    }

    /**
     * @returns the list of tokens in the test input.
     */
    public get tokenList(): Token[] {
        this.tokenStream.fill();

        return this.tokenStream.getTokens();
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

        return this.parser.ruleNames.findIndex((entry) => {
            return entry === ruleName;
        });
    }

    public get currentParseTree(): IParseTreeNode | undefined {
        if (!this.parseTree) {
            return undefined;
        }

        const aa = this.parseContextToNode(this.parseTree);

        return aa;
    }

    public get currentStackTrace(): IGrammarStackFrame[] {
        const result: IGrammarStackFrame[] = [];
        if (this.parser) {
            for (const frame of this.parser.callStack) {
                const externalFrame = <IGrammarStackFrame>{
                    name: frame.name,
                    source: frame.source,
                    next: [],
                };

                for (const next of frame.next) {
                    if (next.context instanceof ParserRuleContext) {
                        const start = next.context.start;
                        const stop = next.context.stop;
                        externalFrame.next.push({
                            start: { column: start.charPositionInLine, row: start.line },
                            end: { column: stop ? stop.charPositionInLine : 0, row: stop ? stop.line : start.line },
                        });
                    } else {
                        const terminal = (next.context as TerminalNode).symbol;
                        const length = terminal.stopIndex - terminal.startIndex + 1;
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
     *
     * @param index The index of the entry to return info for.
     *
     * @returns A string representation of the stack frame.
     */
    public getStackInfo(index: number): string {
        if (!this.parser || index < 0 || index > this.parser.callStack.length) {
            return "Invalid Stack Frame";
        }
        const frame = this.parser.callStack[this.parser.callStack.length - index - 1];

        return "Context " + frame.name;
    }

    public async getVariables(index: number): Promise<Array<[string, string]>> {
        const result: Array<[string, string]> = [];
        if (!this.parser || index < 0 || index > this.parser.callStack.length) {
            return [];
        }
        const frame = this.parser.callStack[this.parser.callStack.length - index - 1];

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

            const parent = run as ScopedSymbol;
            const symbols = await parent.getNestedSymbolsOfType(VariableSymbol);

            // Coalesce variable names and look up the value.
            const variables: Set<string> = new Set<string>();
            for (const symbol of symbols) {
                variables.add(symbol.name);
            }
            /*
            for (const variable of variables) {
                // TODO: there are no variables stored in the interpreter.
                // Possible solution: handle that manually with the help of the symbol table.
            }*/
        }

        return result;
    }

    public tokenTypeName(token: CommonToken): string {
        // For implicit tokens we use the same approach like ANTLR4 does for the naming.
        return this.lexer.vocabulary.getSymbolicName(token.type) || `T__${token.type}`;
    }

    private sendEvent(event: string, ...args: unknown[]) {
        setImmediate((_) => {
            this.emit(event, ...args);
        });
    }

    private parseContextToNode(tree: ParseTree): IParseTreeNode {
        if (tree instanceof ParserRuleContext) {
            const children: IParseTreeNode[] = [];
            if (tree.children) {
                for (const child of tree.children) {
                    if ((child instanceof TerminalNode) && (child.symbol.type === Token.EOF)) {
                        continue;
                    }
                    children.push(this.parseContextToNode(child));
                }
            }

            return {
                type: "rule",
                ruleIndex: tree.ruleIndex,
                name: this.parser!.ruleNames[tree.ruleIndex],
                start: this.convertToken(tree.start as CommonToken),
                stop: this.convertToken(tree.stop as CommonToken),
                id: this.computeHash(tree),
                range: {
                    startIndex: tree.sourceInterval.a,
                    stopIndex: tree.sourceInterval.b,
                    length: tree.sourceInterval.length,
                },
                children,
            };
        } else if (tree instanceof ErrorNode) {
            const symbol = this.convertToken(tree.symbol as CommonToken);

            return {
                type: "error",
                symbol,
                id: this.computeHash(tree.symbol as CommonToken),
                name: symbol ? symbol.name : "<no name>",
                children: [],
            };
        } else {
            // Must be a terminal node then.
            const token = (tree as TerminalNode).symbol as CommonToken;
            const symbol = this.convertToken((tree as TerminalNode).symbol as CommonToken);

            return {
                type: "terminal",
                symbol,
                id: this.computeHash(token),
                name: symbol ? symbol.name : "<no name>",
                children: [],
            };
        }
    }

    /**
     * A simple hash function for rule contexts and common tokens.
     *
     * @param input The value to create the hash for.
     *
     * @returns The computed hash.
     */
    private computeHash(input: ParserRuleContext | CommonToken): number {
        let hash = 0;
        if (input instanceof ParserRuleContext) {
            // Seed with a value that for sure goes beyond any possible token index.
            hash = (31 * hash) + input.start.inputStream!.size;
            if (input.parent) {
                // Multiple invocations of the same rule which matches nothing appear as nodes in the parse tree with
                // the same start token, so we need an additional property to tell them apart: the child index.
                hash = (31 * hash) + input.parent.children!.findIndex((element) => {
                    return element === input;
                });
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

    private convertToken(token: CommonToken): ILexerToken | undefined {
        if (!token) {
            return;
        }

        return {
            text: token.text ? token.text : "",
            type: token.type,
            name: this.tokenTypeName(token),
            line: token.line,
            offset: token.charPositionInLine,
            channel: token.channel,
            tokenIndex: token.tokenIndex,
            startIndex: token.startIndex,
            stopIndex: token.stopIndex,
        };
    }

    /**
     * Validates a breakpoint's position.
     * Breakpoints are aligned either to the first or the last rule line, hence the debugger
     * can only break on enter or on exit of the rule.
     *
     * @param breakPoint The breakpoint to validate.
     */
    private validateBreakPoint(breakPoint: IGrammarBreakPoint) {
        const context = this.contexts.find((entry) => {
            return entry.fileName === breakPoint.source;
        });

        if (!context || !this.parserData) {
            return;
        }

        // Assuming here a rule always starts in column 0.
        const rule = context.enclosingSymbolAtPosition(0, breakPoint.line, true);
        if (rule) {
            breakPoint.validated = true;

            // Main and sub grammars are combined in the ATN (and interpreter data), which means
            // the rule index must be looked up in the main context, regardless of the source file.
            const index = this.ruleIndexFromName(rule.name);
            if (breakPoint.line === rule.definition!.range.end.row) {
                // If the breakpoint's line is on the rule's end (the semicolon) then
                // use the rule's end state for break.
                const stop = this.parserData.atn.ruleToStopState[index];
                this.parser!.breakPoints.add(stop);
            } else {
                const start = this.parserData.atn.ruleToStartState[index];
                this.parser!.breakPoints.add(start);
                breakPoint.line = rule.definition!.range.start.row;
            }

            this.sendEvent("breakpointValidated", breakPoint);
        }
    }
}


