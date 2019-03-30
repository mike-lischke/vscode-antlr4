/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import {
    LexerInterpreter, ParserInterpreter, TokenStream, CommonToken, ParserRuleContext, RecognitionException,
    ANTLRErrorListener, Recognizer, Token, Lexer, RuleContext, CharStream, Parser
} from "antlr4ts";

import { RuleStartState, ATNState, ATNStateType, TransitionType, Transition } from "antlr4ts/atn";
import { TerminalNode } from "antlr4ts/tree";
import { Symbol, VariableSymbol, ScopedSymbol, BlockSymbol } from "antlr4-c3";

import { InterpreterData } from "./InterpreterDataReader";
import { ContextSymbolTable, ActionSymbol, RuleReferenceSymbol, RuleSymbol, EbnfSuffixSymbol, AlternativeSymbol } from "./ContextSymbolTable";
import { SourceContext } from "./SourceContext";
import { LexerElementContext, ElementContext } from "../parser/ANTLRv4Parser";

export interface PredicateEvaluator {
    evaluateLexerPredicate(recognizer: Lexer, ruleIndex: number, actionIndex: number, predicate: string): boolean;
    evaluateParserPredicate(recognizer: Parser, ruleIndex: number, actionIndex: number, predicate: string): boolean;
}

export class GrammarLexerInterpreter extends LexerInterpreter {
    constructor(
        private evaluator: PredicateEvaluator | undefined,
        private mainContext: SourceContext,
        grammarFileName: string,
        lexerData: InterpreterData,
        input: CharStream) {

        super(grammarFileName, lexerData.vocabulary, lexerData.ruleNames, lexerData.channels, lexerData.modes, lexerData.atn, input);
        this.predicates = this.mainContext.symbolTable.getNestedSymbolsOfType(ActionSymbol)
            .filter((action => action.isPredicate && action.context!.parent instanceof LexerElementContext));
    }

    sempred(_localctx: RuleContext | undefined, ruleIndex: number, predIndex: number): boolean {
        if (this.evaluator) {
            if (predIndex < this.predicates.length) {
                let predicate = this.predicates[predIndex].context!.text;
                predicate = predicate.substr(1, predicate.length - 2); // Remove outer curly braces.
                try {
                    return this.evaluator.evaluateLexerPredicate(this, ruleIndex, predIndex, predicate);
                } catch (e) {
                    throw Error(`There was an error while evaluating predicate "${predicate}". Evaluation returned: ` + e);
                }
            }
        }
        return true;
    }
    private predicates: ActionSymbol[];
}

export class GrammarParserInterpreter extends ParserInterpreter {
    public breakPoints: Set<ATNState> = new Set<ATNState>();
    public callStack: InternalStackFrame[];
    public pauseRequested = false;
    constructor(
        private eventSink: (event: string | symbol, ...args: any[]) => void,
        private evaluator: PredicateEvaluator | undefined,
        private mainContext: SourceContext,
        parserData: InterpreterData,
        input: TokenStream) {

        super(mainContext.fileName, parserData.vocabulary, parserData.ruleNames, parserData.atn, input);
        this.predicates = this.mainContext.symbolTable.getNestedSymbolsOfType(ActionSymbol)
            .filter((action => action.isPredicate && action.context!.parent instanceof ElementContext));
    }

    start(startRuleIndex: number) {
        this.pauseRequested = false;
        this.callStack = [];
        let startRuleStartState: RuleStartState = this._atn.ruleToStartState[startRuleIndex];
        this._rootContext = this.createInterpreterRuleContext(undefined, ATNState.INVALID_STATE_NUMBER, startRuleIndex);
        if (startRuleStartState.isPrecedenceRule) {
            this.enterRecursionRule(this._rootContext, startRuleStartState.stateNumber, startRuleIndex, 0);
        } else {
            this.enterRule(this._rootContext, startRuleStartState.stateNumber, startRuleIndex);
        }
        this.startIsPrecedenceRule = startRuleStartState.isPrecedenceRule;
    }

    /**
     * Resume parsing from the current ATN state until the end or we hit a breakpoint.
     */
    continue(runMode: RunMode): ParserRuleContext {
        // Need the current step depth for step over/out.
        let stackDepth = this.callStack.length;

        // If we are not going to jump into a rule then make step over a step in.
        // This way we can use step over exclusively for rule processing.
        let p = this.atnState;
        if (p.transition(0).serializationType != TransitionType.RULE && runMode == RunMode.StepOver) {
            runMode = RunMode.StepIn;
        }

        // We don't stop directly on the break point state but on the next rule/non-epsilon transition.
        let breakPointPending = false;
        while (true) {
            if (this.pauseRequested) {
                this.pauseRequested = false;
                runMode = RunMode.StepIn; // Stop at next possible position.
            }

            if (this.breakPoints.has(p) && p.stateType != ATNStateType.RULE_STOP) {
                // Don't mark a pending rule end break point here. That has already been handled.
                breakPointPending = true;
                runMode = RunMode.StepIn;
            }

            switch (p.stateType) {
                case ATNStateType.RULE_STOP: {
                    if (this._ctx.isEmpty) {
                        // End of start rule.
                        if (this.startIsPrecedenceRule) {
                            let result: ParserRuleContext = this._ctx;
                            let parentContext = this._parentContextStack.pop()!;
                            this.unrollRecursionContexts(parentContext[0]);
                            this.eventSink("end");
                            return result;
                        } else {
                            this.exitRule();
                            this.eventSink("end");
                            return this._rootContext;
                        }
                    }

                    this.callStack.pop();
                    this.visitRuleStopState(p);
                    if ((runMode == RunMode.StepOut && stackDepth == this.callStack.length + 1)
                        || (runMode == RunMode.StepOver && stackDepth == this.callStack.length)) {
                        // Reached the rule end right before a step over/out.
                        // Continue with step-in to stop at the next work item.
                        runMode = RunMode.StepIn;
                    }
                    break;
                }

                case ATNStateType.RULE_START: {
                    let frame = new InternalStackFrame();
                    let ruleName = this.ruleNameFromIndex(this.atnState.ruleIndex);
                    if (ruleName) {
                        let ruleSymbol = this.mainContext.resolveSymbol(ruleName);
                        if (ruleSymbol) {
                            // Get the source name from the symbol's symbol table (which doesn't
                            // necessarily correspond to the one we have set for the debugger).
                            let st = ruleSymbol.symbolTable as ContextSymbolTable;
                            if (st.owner) {
                                frame.source = st.owner.fileName;
                            }
                            frame.name = ruleName;
                            frame.current = [ruleSymbol];
                            frame.next = [ruleSymbol];
                            this.callStack.push(frame);
                        } else {
                            throw new Error("Cannot find rule \"" + ruleName + "\" - debugging aborted.");
                        }
                    }
                    // fall through
                }

                default:
                    try {
                        this.visitState(p);
                    } catch (e) {
                        if (e instanceof RecognitionException) {
                            this.state = this._atn.ruleToStopState[p.ruleIndex].stateNumber;
                            this.context.exception = e;
                            this.errorHandler.reportError(this, e);
                            this.recover(e);
                        } else {
                            throw e;
                        }
                    }
                    break;
            }

            // Update the list of next symbols if there's a label or rule ahead.
            p = this.atnState;
            if (p.numberOfTransitions == 1) {
                let transition = p.transition(0);
                switch (transition.serializationType) {
                    case TransitionType.RULE:
                    case TransitionType.ATOM:
                    case TransitionType.NOT_SET:
                    case TransitionType.RANGE:
                    case TransitionType.SET:
                    case TransitionType.WILDCARD: {
                        let lastStackFrame = this.callStack[this.callStack.length - 1];
                        lastStackFrame.current = lastStackFrame.next;
                        this.computeNextSymbols(lastStackFrame, transition);
                        if (runMode == RunMode.StepIn) {
                            if (breakPointPending) {
                                this.eventSink("stopOnBreakpoint");
                            } else {
                                this.eventSink("stopOnStep");
                            }

                            return this._rootContext;
                        }
                        break;
                    }

                    case TransitionType.EPSILON: { // Stop on the rule's semicolon.
                        if (transition.target.stateType == ATNStateType.RULE_STOP) {
                            let isBreakPoint = this.breakPoints.has(transition.target);
                            if (runMode == RunMode.StepIn || isBreakPoint) {
                                let lastStackFrame = this.callStack[this.callStack.length - 1];
                                lastStackFrame.current = lastStackFrame.next;
                                this.computeNextSymbols(lastStackFrame, transition);
                                if (isBreakPoint) {
                                    this.eventSink("stopOnBreakpoint");
                                } else {
                                    this.eventSink("stopOnStep");
                                }

                                return this._rootContext;
                            }
                        }
                    }
                }
            }
        }
    }

    sempred(_localctx: RuleContext | undefined, ruleIndex: number, predIndex: number): boolean {
        if (this.evaluator) {
            if (predIndex < this.predicates.length) {
                let predicate = this.predicates[predIndex].context!.text;
                predicate = predicate.substr(1, predicate.length - 2); // Remove outer curly braces.
                try {
                    return this.evaluator.evaluateParserPredicate(this, ruleIndex, predIndex, predicate);
                } catch (e) {
                    throw Error(`There was an error while evaluating predicate "${predicate}". Evaluation returned: ` + e);
                }
            }
        }
        return true;
    }

    action(_localctx: RuleContext | undefined, ruleIndex: number, actionIndex: number): void {
        let i = 0;
    }

    private ruleNameFromIndex(ruleIndex: number): string | undefined {
        if (ruleIndex < 0 || ruleIndex >= this.ruleNames.length) {
            return;
        }
        return this.ruleNames[ruleIndex];
    }

    /**
     * Determines which symbols correspond to the target state we reach from the given transition.
     * Even though the prediction algorithm determines a single path through the ATN we may get
     * more than one result for ambiguities, since at the moment we only know a part of the path.
     *
     * @param frame The frame from which to compute the next symbol list.
     * @param transition The transition to the next ATN state for which we want the symbol.
     */
    private computeNextSymbols(frame: InternalStackFrame, transition: Transition) {
        frame.next = [];

        let targetRule = "";
        if (transition.target.stateType == ATNStateType.RULE_START) {
            targetRule = this.ruleNameFromIndex(transition.target.ruleIndex)!;
        }

        for (let source of frame.current) {
            let candidates = this.nextCandidates(source);
            for (let candidate of candidates) {
                if (candidate instanceof RuleReferenceSymbol) {
                    if (candidate.name == targetRule) {
                        frame.next.push(candidate);
                    }
                } else {
                    if (candidate.name == ";") { // Special case: end of rule.
                        frame.next.push(candidate);
                    } else if (candidate.context instanceof TerminalNode) {
                        let type = this.tokenIndexFromName(candidate.context.symbol.text!);
                        let currentType = this.inputStream.LA(1);
                        if (type == currentType
                            && transition.matches(currentType, Lexer.MIN_CHAR_VALUE, Lexer.MAX_CHAR_VALUE)) {
                            frame.next.push(candidate);
                        }

                    }
                }
            }
        }
    }

    /**
     * Returns a list of reachable leaf symbols from the given symbol.
     */
    private nextCandidates(start: Symbol): Symbol[] {
        let result: Symbol[] = [];

        // We can get a rule symbol as start, which means we want to get the candidates
        // from the rule's block, instead its sibling (which is another rule).
        let next: Symbol | undefined;
        if (start instanceof RuleSymbol) {
            next = start.children[0]; // 2 children in a rule: the rule block and the semicolon.
        } else {
            // Any other case. Continue with the next directly following symbol.
            next = start.nextSibling;

            // Check EBNF suffixes first.
            if (next instanceof EbnfSuffixSymbol) {
                switch (next.name[0]) {
                    case '?': { // The previous symbol was optional. We are done with it.
                        next = next.nextSibling;
                        break;
                    }
                    case '+':
                    case '*': { // A loop - the previous symbol is again a candidate.
                        result.push(start);
                        next = next.nextSibling;
                        break;
                    }
                }
            } else if (next instanceof VariableSymbol) {
                // Skip over variables (element labels) and their operator.
                next = next.nextSibling;
                if (next) {
                    next = next.nextSibling;
                }
            } else if (next instanceof ActionSymbol) {
                // Also skip over action blocks.
                next = next.nextSibling;

                // If the next symbol is a question mark, this block is actually a predicate.
                if (next && next.name == "?") {
                    next = next.nextSibling;
                }
            }

            if (!next) {
                // Nothing more in the current alt. Walk up the parent chain until we find a block with content.
                let block = start;
                while (true) {
                    if (block.parent instanceof RuleSymbol) {
                        result.push(block.lastSibling); // The semicolon.
                        return result;
                    }

                    block = (block.parent as ScopedSymbol).parent!;
                    next = block.nextSibling;
                    if (next) {
                        if (next instanceof EbnfSuffixSymbol) {
                            switch (next.name[0]) {
                                case '?': {
                                    next = next.nextSibling;
                                    break;
                                }
                                case '+':
                                case '*': {
                                    // Include the candidates from the previous block again.
                                    result.push(...this.candidatesFromBlock(block as ScopedSymbol));
                                    next = next.nextSibling;
                                    break;
                                }
                            }
                        }

                        if (next) {
                            break;
                        }
                    }
                }
            }
        }

        if (next instanceof BlockSymbol) {
            result.push(...this.candidatesFromBlock(next));
        } else {
            result.push(next);
        }

        // Check cardinality which allows optional elements.
        next = next.nextSibling;
        if (next instanceof EbnfSuffixSymbol) {
            if (next.name[0] == '?' || next.name[0] == '*') {
                let subResult = this.nextCandidates(next);
                result.push(...subResult);
            }
        }

        return result;
    }

    private candidatesFromBlock(block: ScopedSymbol): Symbol[] {
        let result: Symbol[] = [];
        for (let alt of block.children) {
            let next: Symbol | undefined = (alt as AlternativeSymbol).children[0];
            if (next instanceof VariableSymbol) { // Jump over variable assignments.
                next = next.nextSibling;
                if (next) {
                    next = next.nextSibling;
                }
            } else if (next instanceof ActionSymbol) { // Actions/predicates.
                next = next.nextSibling;
                if (next && next.name == "?") {
                    next = next.nextSibling;
                }
            }

            if (next) {
                if (next instanceof BlockSymbol) {
                    result.push(...this.candidatesFromBlock(next));
                } else {
                    result.push(next);
                }

                // Check cardinality which allows optional elements.
                next = next.nextSibling;
                if (next instanceof EbnfSuffixSymbol) {
                    if (next.name[0] == '?' || next.name[0] == '*') {
                        let subResult = this.nextCandidates(next);
                        result.push(...subResult);
                    }
                }
            }
        }

        return result;
    }

    private tokenIndexFromName(tokenName: string): number {
        let vocab = this.vocabulary;
        for (let i = 0; i <= vocab.maxTokenType; ++i) {
            if (vocab.getSymbolicName(i) == tokenName) {
                return i;
            }
        }

        // Implicit literals don't have a symbolic name.
        // Therefor we do another search run here for the literal "name".
        for (let i = 0; i <= vocab.maxTokenType; ++i) {
            if (vocab.getLiteralName(i) == tokenName) {
                return i;
            }
        }

        return -1;
    }

    private startIsPrecedenceRule: boolean;
    private predicates: ActionSymbol[];
}

export enum RunMode {
    Normal,
    StepIn,
    StepOver,
    StepOut
}

export class InternalStackFrame {
    name: string;
    source: string;
    current: Symbol[];
    next: Symbol[];
}

export class InterpreterLexerErrorListener implements ANTLRErrorListener<number> {
    constructor(private eventSink: (event: string | symbol, ...args: any[]) => void) {
    }

    syntaxError<T extends number>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number,
        charPositionInLine: number, msg: string, e: RecognitionException | undefined): void {
        this.eventSink("output", `Lexer error (${line}, ${charPositionInLine + 1}): ${msg}`, recognizer.inputStream!.sourceName, line, charPositionInLine, true);
    }
}

export class InterpreterParserErrorListener implements ANTLRErrorListener<CommonToken> {
    constructor(private eventSink: (event: string | symbol, ...args: any[]) => void) {
    }

    syntaxError<T extends Token>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number, charPositionInLine: number, msg: string, e: RecognitionException | undefined): void {
        this.eventSink("output", `Parser error (${line}, ${charPositionInLine + 1}): ${msg}`, recognizer.inputStream!.sourceName, line, charPositionInLine, true);
    }
}
