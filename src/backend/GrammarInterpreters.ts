/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

// I want to keep all related classes (most of them really small) in a single place.
/* eslint-disable max-classes-per-file */

/* eslint-disable no-underscore-dangle */

import {
    LexerInterpreter, ParserInterpreter, TokenStream, ParserRuleContext, RecognitionException,
    BaseErrorListener, Recognizer, Token, Lexer, RuleContext, CharStream, ATNState, RuleStartState, Transition,
    ATNSimulator, TerminalNode, LexerATNSimulator, ParserATNSimulator, ATNStateType, TransitionType,
} from "antlr4ng";

import { BaseSymbol, VariableSymbol, ScopedSymbol, BlockSymbol } from "antlr4-c3";

import { IInterpreterData } from "./InterpreterDataReader.js";
import {
    ContextSymbolTable, RuleReferenceSymbol, RuleSymbol, EbnfSuffixSymbol, LexerPredicateSymbol,
    ParserPredicateSymbol, LexerActionSymbol, ParserActionSymbol,
} from "./ContextSymbolTable.js";
import { SourceContext } from "./SourceContext.js";
import { PredicateFunction } from "./types.js";
import { TerminalRuleContext } from "../parser/ANTLRv4Parser.js";

export enum RunMode {
    Normal,
    StepIn,
    StepOver,
    StepOut
}

export interface IInternalStackFrame {
    name: string;
    source?: string;
    current: BaseSymbol[];
    next: BaseSymbol[];
}

export class GrammarLexerInterpreter extends LexerInterpreter {
    private predicates: LexerPredicateSymbol[];

    public constructor(
        private runPredicate: PredicateFunction | undefined,
        private mainContext: SourceContext,
        grammarFileName: string,
        lexerData: IInterpreterData,
        input: CharStream) {

        super(grammarFileName, lexerData.vocabulary, lexerData.ruleNames, lexerData.channels, lexerData.modes,
            lexerData.atn, input);

        this.mainContext.symbolTable.getNestedSymbolsOfType(LexerPredicateSymbol).then((symbols) => {
            this.predicates = symbols;
        }).catch(() => {
            this.predicates = [];
        });
    }

    public override sempred(_localctx: RuleContext | null, ruleIndex: number, predIndex: number): boolean {
        if (this.runPredicate) {
            if (predIndex < this.predicates.length) {
                let predicate = this.predicates[predIndex].context!.getText();
                if (predicate.length > 2) {
                    predicate = predicate.substring(1, predicate.length - 1); // Remove outer curly braces.
                    try {
                        return this.runPredicate(predicate);
                    } catch (e) {
                        throw Error(`There was an error while evaluating predicate "${predicate}". ` +
                            "Evaluation returned: " + String(e));
                    }
                }
            }
        }

        return true;
    }

    public override action(_localctx: RuleContext | null, _ruleIndex: number, _actionIndex: number): void {
        // not used yet
    }
}

export class GrammarParserInterpreter extends ParserInterpreter {
    public breakPoints = new Set<ATNState>();
    public callStack: IInternalStackFrame[];
    public pauseRequested = false;

    private startIsPrecedenceRule: boolean;
    private predicates: ParserPredicateSymbol[];

    public constructor(
        private eventSink: (event: string | symbol, ...args: unknown[]) => void,
        private runPredicate: PredicateFunction | undefined,
        private mainContext: SourceContext,
        parserData: IInterpreterData,
        input: TokenStream) {

        super(mainContext.fileName, parserData.vocabulary, parserData.ruleNames, parserData.atn, input);

        this.mainContext.symbolTable.getNestedSymbolsOfType(ParserPredicateSymbol).then((symbols) => {
            this.predicates = symbols;
        }).catch(() => {
            this.predicates = [];
        });

    }

    public start(startRuleIndex: number): ParserRuleContext {
        this.pauseRequested = false;
        this.callStack = [];
        const startRuleStartState: RuleStartState = this.atn.ruleToStartState[startRuleIndex];
        this._rootContext = this.createInterpreterRuleContext(undefined, ATNState.INVALID_STATE_NUMBER, startRuleIndex);
        if (startRuleStartState.isPrecedenceRule) {
            this.enterRecursionRule(this.rootContext, startRuleStartState.stateNumber, startRuleIndex, 0);
        } else {
            this.enterRule(this.rootContext, startRuleStartState.stateNumber, startRuleIndex);
        }
        this.startIsPrecedenceRule = startRuleStartState.isPrecedenceRule;

        return this.rootContext;
    }

    // eslint-disable-next-line jsdoc/require-returns-check
    /**
     * Resume parsing from the current ATN state until the end or we hit a breakpoint.
     *
     * @param runMode The mode to use for further run.
     *
     * @returns The context with which we ended the run.
     */
    public continue(runMode: RunMode): ParserRuleContext {
        // Need the current step depth for step over/out.
        const stackDepth = this.callStack.length;

        // If we are not going to jump into a rule then make step over a step in.
        // This way we can use step over exclusively for rule processing.
        let p = this.atnState;
        if (p.transitions[0].serializationType !== TransitionType.RULE && runMode === RunMode.StepOver) {
            runMode = RunMode.StepIn;
        }

        // We don't stop directly on the break point state but on the next rule/non-epsilon transition.
        let breakPointPending = false;
        while (true) {
            if (this.pauseRequested) {
                this.pauseRequested = false;
                runMode = RunMode.StepIn; // Stop at next possible position.
            }

            if (this.breakPoints.has(p) && p.stateType !== ATNStateType.RULE_STOP) {
                // Don't mark a pending rule end break point here. That has already been handled.
                breakPointPending = true;
                runMode = RunMode.StepIn;
            }

            switch (p.stateType) {
                case ATNStateType.RULE_STOP: {
                    if (this._ctx.isEmpty()) {
                        // End of start rule.
                        if (this.startIsPrecedenceRule) {
                            const result = this._ctx;
                            const parentContext = this._parentContextStack.pop()!;
                            this.unrollRecursionContexts(parentContext[0]);
                            this.eventSink("end");

                            return result;
                        } else {
                            this.exitRule();
                            this.eventSink("end");

                            return this.rootContext;
                        }
                    }

                    this.callStack.pop();
                    this.visitRuleStopState(p);
                    if ((runMode === RunMode.StepOut && stackDepth === this.callStack.length + 1)
                        || (runMode === RunMode.StepOver && stackDepth === this.callStack.length)) {
                        // Reached the rule end right before a step over/out.
                        // Continue with step-in to stop at the next work item.
                        runMode = RunMode.StepIn;
                    }
                    break;
                }

                case ATNStateType.RULE_START: {
                    const ruleName = this.ruleNameFromIndex(this.atnState.ruleIndex);
                    if (ruleName) {
                        const ruleSymbol = this.mainContext.resolveSymbol(ruleName);
                        if (ruleSymbol) {
                            // Get the source name from the symbol's symbol table (which doesn't
                            // necessarily correspond to the one we have set for the debugger).
                            const st = ruleSymbol.symbolTable as ContextSymbolTable;
                            this.callStack.push({
                                name: ruleName,
                                current: [ruleSymbol],
                                next: [ruleSymbol],
                                source: st.owner ? st.owner.fileName : undefined,
                            });
                        } else {
                            throw new Error("Cannot find rule \"" + ruleName + "\" - debugging aborted.");
                        }
                    }
                    // [fall-through]
                }

                default: {
                    try {
                        this.visitState(p);
                    } catch (e) {
                        if (e instanceof RecognitionException) {
                            this.state = this.atn.ruleToStopState[p.ruleIndex].stateNumber;
                            this.context.exception = e;
                            this.errorHandler.reportError(this, e);
                            this.recover(e);
                        } else {
                            throw e;
                        }
                    }
                    break;
                }
            }

            // Update the list of next symbols if there's a label or rule ahead.
            p = this.atnState;
            if (p.transitions.length === 1) {
                const transition = p.transitions[0];
                switch (transition.serializationType) {
                    case TransitionType.RULE:
                    case TransitionType.ATOM:
                    case TransitionType.NOT_SET:
                    case TransitionType.RANGE:
                    case TransitionType.SET:
                    case TransitionType.WILDCARD: {
                        const lastStackFrame = this.callStack[this.callStack.length - 1];
                        lastStackFrame.current = lastStackFrame.next;
                        this.computeNextSymbols(lastStackFrame, transition);
                        if (runMode === RunMode.StepIn) {
                            if (breakPointPending) {
                                this.eventSink("stopOnBreakpoint");
                            } else {
                                this.eventSink("stopOnStep");
                            }

                            return this.rootContext;
                        }
                        break;
                    }

                    case TransitionType.EPSILON: { // Stop on the rule's semicolon.
                        if (transition.target.stateType === ATNStateType.RULE_STOP) {
                            const isBreakPoint = this.breakPoints.has(transition.target);
                            if (runMode === RunMode.StepIn || isBreakPoint) {
                                const lastStackFrame = this.callStack[this.callStack.length - 1];
                                lastStackFrame.current = lastStackFrame.next;
                                this.computeNextSymbols(lastStackFrame, transition);
                                if (isBreakPoint) {
                                    this.eventSink("stopOnBreakpoint");
                                } else {
                                    this.eventSink("stopOnStep");
                                }

                                return this.rootContext;
                            }
                        }

                        break;
                    }

                    default:
                }
            }
        }
    }

    public override sempred(_localctx: RuleContext | null, ruleIndex: number, predIndex: number): boolean {
        if (this.runPredicate) {
            if (predIndex < this.predicates.length) {
                let predicate = this.predicates[predIndex].context!.getText();
                if (predicate.length > 2) {
                    predicate = predicate.substring(1, predicate.length - 1); // Remove outer curly braces.
                    try {
                        return this.runPredicate(predicate);
                    } catch (e) {
                        throw Error(`There was an error while evaluating predicate "${predicate}". ` +
                            "Evaluation returned: " + String(e));
                    }
                }
            }
        }

        return true;
    }

    public override action(_localctx: RuleContext | null, _ruleIndex: number, _actionIndex: number): void {
        // not used yet
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
    private computeNextSymbols(frame: IInternalStackFrame, transition: Transition) {
        frame.next = [];

        const terminalMatches = (node: TerminalNode): boolean => {
            const type = this.tokenIndexFromName(node.symbol.text);
            const currentType = this.inputStream.LA(1);
            if (type === currentType
                && transition.matches(currentType, Lexer.MIN_CHAR_VALUE, Lexer.MAX_CHAR_VALUE)) {
                return true;
            }

            return false;
        };

        for (const source of frame.current) {
            const candidates = this.nextCandidates(source);
            for (const candidate of candidates) {
                if (candidate instanceof RuleReferenceSymbol) {
                    frame.next.push(candidate);
                } else {
                    if (candidate.name === ";") { // Special case: end of rule.
                        frame.next.push(candidate);
                    } else if (candidate.context instanceof TerminalRuleContext) {
                        if (candidate.context.TOKEN_REF()) {
                            if (terminalMatches(candidate.context.TOKEN_REF()!)) {
                                frame.next.push(candidate);
                            }
                        }
                    } else if (candidate.context instanceof TerminalNode) {
                        if (terminalMatches(candidate.context)) {
                            frame.next.push(candidate);
                        }
                    }
                }
            }
        }
    }

    /**
     * @param start The symbol to start searching from.
     * @returns A list of reachable leaf symbols from the given symbol.
     */
    private nextCandidates(start: BaseSymbol): BaseSymbol[] {
        const result: BaseSymbol[] = [];

        // We can get a rule symbol as start, which means we want to get the candidates
        // from the rule's block, instead its sibling (which is another rule).
        let next: BaseSymbol | undefined;
        if (start instanceof RuleSymbol) {
            next = start.children[1]; // 3 children in a rule: the colon, the rule block and the semicolon.
        } else {
            // unknown other case. Continue with the next directly following symbol.
            next = start.nextSibling;

            // Check EBNF suffixes first.
            if (next instanceof EbnfSuffixSymbol) {
                switch (next.name[0]) {
                    case "?": { // The previous symbol was optional. We are done with it.
                        next = next.nextSibling;
                        break;
                    }

                    case "+":
                    case "*": { // A loop - the previous symbol is again a candidate.
                        result.push(start);
                        next = next.nextSibling;
                        break;
                    }

                    default: {
                        break;
                    }
                }
            } else if (next instanceof VariableSymbol) {
                // Skip over variables (element labels) and their operator.
                next = next.nextSibling;
                if (next) {
                    next = next.nextSibling;
                }
            } else if (next instanceof ParserActionSymbol || next instanceof LexerActionSymbol) {
                // Also skip over action blocks.
                next = next.nextSibling;
            } else if (next instanceof ParserPredicateSymbol || next instanceof LexerPredicateSymbol) {
                // Need 2 skips for predicates.
                next = next.nextSibling;
                if (next) {
                    next = next.nextSibling;
                }
            }

            if (!next) {
                // Nothing more in the current alt. Walk up the parent chain until we find a block with content.
                let block = start;
                while (true) {
                    if (block.parent instanceof RuleSymbol && block.lastSibling) {
                        result.push(block.lastSibling); // The semicolon.

                        return result;
                    }

                    block = (block.parent as ScopedSymbol).parent!;
                    next = block.nextSibling;
                    if (next) {
                        if (next instanceof EbnfSuffixSymbol) {
                            switch (next.name[0]) {
                                case "?": {
                                    next = next.nextSibling;
                                    break;
                                }

                                case "+":
                                case "*": {
                                    // Include the candidates from the previous block again.
                                    result.push(...this.candidatesFromBlock(block as ScopedSymbol));
                                    next = next.nextSibling;
                                    break;
                                }

                                default: {
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
            if (next.name[0] === "?" || next.name[0] === "*") {
                const subResult = this.nextCandidates(next);
                result.push(...subResult);
            }
        }

        return result;
    }

    private candidatesFromBlock(block: ScopedSymbol): BaseSymbol[] {
        const result: BaseSymbol[] = [];
        for (const symbol of block.children) {
            let next = (symbol instanceof ScopedSymbol) ? symbol.firstChild : undefined;
            if (next instanceof VariableSymbol) { // Jump over variable assignments.
                next = next.nextSibling;
                if (next) {
                    next = next.nextSibling;
                }
            } else if (next instanceof ParserActionSymbol || next instanceof LexerActionSymbol) {
                // Also skip over action blocks.
                next = next.nextSibling;
            } else if (next instanceof ParserPredicateSymbol || next instanceof LexerPredicateSymbol) {
                // Need 2 skips for predicates.
                next = next.nextSibling;
                if (next) {
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
                    if (next.name[0] === "?" || next.name[0] === "*") {
                        const subResult = this.nextCandidates(next);
                        result.push(...subResult);
                    }
                }
            }
        }

        return result;
    }

    private tokenIndexFromName(tokenName: string): number {
        const vocab = this.vocabulary;
        for (let i = 0; i <= vocab.maxTokenType; ++i) {
            if (vocab.getSymbolicName(i) === tokenName) {
                return i;
            }
        }

        // Implicit literals don't have a symbolic name.
        // Therefor we do another search run here for the literal "name".
        for (let i = 0; i <= vocab.maxTokenType; ++i) {
            if (vocab.getLiteralName(i) === tokenName) {
                return i;
            }
        }

        return -1;
    }
}

export class InterpreterLexerErrorListener extends BaseErrorListener<LexerATNSimulator> {
    public constructor(private eventSink: (event: string | symbol, ...args: unknown[]) => void) {
        super();
    }

    public override syntaxError<T extends Token>(recognizer: Recognizer<ATNSimulator>, offendingSymbol: T | undefined,
        line: number, charPositionInLine: number, msg: string, _e: RecognitionException | null): void {
        this.eventSink("output", `Lexer error (${line}, ${charPositionInLine + 1}): ${msg}`,
            recognizer.inputStream.getSourceName(), line, charPositionInLine, true);
    }
}

export class InterpreterParserErrorListener extends BaseErrorListener<ParserATNSimulator> {
    public constructor(private eventSink: (event: string | symbol, ...args: unknown[]) => void) {
        super();
    }

    public override syntaxError<T extends Token>(recognizer: Recognizer<ATNSimulator>, offendingSymbol: T | undefined,
        line: number, charPositionInLine: number, msg: string, _e: RecognitionException | null): void {
        this.eventSink("output", `Parser error (${line}, ${charPositionInLine + 1}): ${msg}`,
            recognizer.inputStream.getSourceName(), line, charPositionInLine, true);
    }
}
