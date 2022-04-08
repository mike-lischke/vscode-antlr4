/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as vm from "vm";
import * as fs from "fs";

import {
    ATNState, ATNStateType, BlockStartState, PlusBlockStartState, StarLoopEntryState, TransitionType,
    RuleTransition, StarBlockStartState, RuleStartState, NotSetTransition, DecisionState, PredicateTransition,
} from "antlr4ts/atn";

import { ISentenceGenerationOptions, RuleMappings, PredicateFunction } from "./facade";
import { IntervalSet } from "antlr4ts/misc";

import { printableUnicodePoints, fullUnicodeSet } from "./Unicode";
import { IInterpreterData } from "./InterpreterDataReader";
import { LexerPredicateSymbol, ParserPredicateSymbol } from "./ContextSymbolTable";
import { SourceContext } from "./SourceContext";

/**
 * This class generates a number of strings, each valid input for a given ATN.
 */
export class SentenceGenerator {
    // Allow evaluating predicates.
    public runPredicate?: PredicateFunction;

    private lexerPredicates: LexerPredicateSymbol[];
    private parserPredicates: ParserPredicateSymbol[];

    private printableUnicode: IntervalSet;

    // Convergence data for recursive rule invocations. We count here the invocation of each alt
    // of a decision state.
    private convergenceFactor: number;
    private lexerDecisionCounts: Map<number, number[]>;
    private parserDecisionCounts: Map<number, number[]>;

    private minParserIterations: number;
    private maxParserIterations: number;
    private minLexerIterations: number;
    private maxLexerIterations: number;
    private maxRecursions: number;
    private ruleInvocations = new Map<string, number>();

    private ruleMappings?: RuleMappings;

    // To limit recursions we need to track through which rules we are walking currently.
    private parserStack: number[] = [];

    /**
     * @param context The context for the grammar file.
     * @param lexerData The generated lexer data for this grammar.
     * @param parserData The generated parser data for this grammar.
     * @param actionFile The name of a file that allows executing predicates/actions.
     */
    public constructor(
        context: SourceContext,
        private lexerData: IInterpreterData,
        private parserData: IInterpreterData | undefined,
        actionFile: string | undefined) {

        this.printableUnicode = printableUnicodePoints({
            excludeCJK: true,
            excludeRTL: true,
            limitToBMP: true,
            includeLineTerminators: true,
        });

        // Get the symbols for all predicates (to enable predicate evaluation).
        this.lexerPredicates = context.symbolTable.getNestedSymbolsOfTypeSync(LexerPredicateSymbol);
        this.parserPredicates = context.symbolTable.getNestedSymbolsOfTypeSync(ParserPredicateSymbol);

        this.parserPredicates.forEach((value, index) => {
            console.log(`${index}: ${value.context!.text}`);
        });

        // Need to disable a number of linter checks in order to allow importing the action file.
        if (actionFile) {
            const code = fs.readFileSync(actionFile, { encoding: "utf-8" }) + `
            const runPredicate = (predicate) => eval(predicate);
            runPredicate;
            `;

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.runPredicate = vm.runInNewContext(code) as PredicateFunction;
        }
    }

    /**
     * Generates a single sentence for the given rule.
     *
     * @param options A number of settings that control the generation process.
     * @param start The ATN start state of the rule for which to generate the sentence.
     *
     * @returns A string that can successfully be parsed by the rule.
     */
    public generate(options: ISentenceGenerationOptions, start: RuleStartState): string {

        this.convergenceFactor = options.convergenceFactor || 0.25;

        this.minParserIterations = options.minParserIterations || 0;
        if (this.minParserIterations < 0) {
            this.minParserIterations = 0;
        } else {
            this.minParserIterations = Math.floor(this.minParserIterations);
        }

        this.maxParserIterations = options.maxParserIterations || this.minParserIterations + 1;
        if (this.maxParserIterations < this.minParserIterations) {
            this.maxParserIterations = this.minParserIterations + 1;
        } else {
            this.maxParserIterations = Math.ceil(this.maxParserIterations);
        }

        this.minLexerIterations = options.minLexerIterations || 0;
        if (this.minLexerIterations < 0) {
            this.minLexerIterations = 0;
        } else {
            this.minLexerIterations = Math.floor(this.minLexerIterations);
        }

        this.maxLexerIterations = options.maxLexerIterations || this.minLexerIterations + 10;
        if (this.maxLexerIterations < this.minLexerIterations) {
            this.maxLexerIterations = this.minLexerIterations + 10;
        } else {
            this.maxLexerIterations = Math.ceil(this.maxLexerIterations);
        }

        this.maxRecursions = (!options.maxRecursions || options.maxRecursions < 1) ? 3 : options.maxRecursions;

        this.ruleInvocations.clear();
        this.ruleMappings = options.ruleMappings;

        this.lexerDecisionCounts = new Map<number, number[]>();
        this.parserDecisionCounts = new Map<number, number[]>();

        this.parserStack.length = 0;

        const [result] = this.generateFromATNSequence(start, start.stopState, start.atn === this.lexerData.atn);

        return result;
    }

    public sempred(ruleIndex: number, predIndex: number, inLexer: boolean): boolean {
        if (this.runPredicate) {
            let predicate = "";
            if (inLexer) {
                if (predIndex < this.lexerPredicates.length) {
                    predicate = this.lexerPredicates[predIndex].context!.text;
                }
            } else {
                if (predIndex < this.parserPredicates.length) {
                    predicate = this.parserPredicates[predIndex].context!.text;
                }
            }

            if (predicate.length > 2) {
                predicate = predicate.substr(1, predicate.length - 2); // Remove outer curly braces.
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return this.runPredicate(predicate);
                } catch (e) {
                    throw Error(`There was an error while evaluating predicate "${predicate}". ` +
                        `Evaluation returned: ` + String(e));
                }
            }
        }

        return true;
    }

    /**
     * @param inLexer A flag to tell where to lookup the symbol name.
     * @param index The rule index to convert.
     *
     * @returns The name of the rule with the given index.
     */
    private getRuleName(inLexer: boolean, index: number): string | undefined {
        if (inLexer) {
            return this.lexerData.ruleNames[index];
        }

        if (this.parserData) {
            return this.parserData.ruleNames[index];
        }
    }

    /**
     * Records the invocation of the given rule.
     *
     * @param name The name of the rule.
     *
     * @returns True if that rule's invocation count is less than the maximum recursion count.
     */
    private invokeRule(name: string): boolean {
        const count = this.ruleInvocations.get(name);
        if (count) {
            if (count < this.maxRecursions) {
                this.ruleInvocations.set(name, count + 1);

                return true;
            }

            return false;
        }

        this.ruleInvocations.set(name, 1);

        return true;
    }

    /**
     * Remove one invocation step for the given rule. If the count is zero after that, then the rule is removed
     * from the invocation list altogether.
     *
     * @param name The name of the rule.
     */
    private leaveRule(name: string) {
        let count = this.ruleInvocations.get(name);
        if (count) {
            --count;
            if (count === 0) {
                this.ruleInvocations.delete(name);
            } else {
                this.ruleInvocations.set(name, count);
            }
        }
    }

    /**
     * Processes a single sequence of ATN states (a rule or a single alt in a block).
     *
     * @param start The node from where to start walking.
     * @param stop The node that ends the sequence to walk over.
     * @param addSpace If true a space char is added between each ATN node label.
     *
     * @returns The generated string and a flag that indicates if the process succeeded.
     */
    private generateFromATNSequence(start: ATNState, stop: ATNState, addSpace: boolean): [string, boolean] {
        const inLexer = start.atn === this.lexerData.atn;
        const isRule = start.stateType === ATNStateType.RULE_START;

        let ruleName: string | undefined;
        if (isRule) {
            // Check if there's a predefined result for the given rule.
            ruleName = this.getRuleName(inLexer, start.ruleIndex);
            if (!ruleName) {
                return ["", false];
            }

            const mapping = this.ruleMappings?.get(ruleName);
            if (mapping) {
                return [addSpace ? mapping + " " : mapping, false];
            }

            if (!this.invokeRule(ruleName)) {
                return [addSpace ? "⨱ " : "⨱", false];
            }
        }


        let result = "";
        let blockedByPredicate = false;

        let run = start;
        while (run !== stop) {
            switch (run.stateType) {
                case ATNStateType.BLOCK_START: {
                    result += this.generateFromDecisionState(run as BlockStartState, !inLexer);
                    run = (run as BlockStartState).endState;

                    break;
                }

                case ATNStateType.PLUS_BLOCK_START: {
                    const loopBack = (run as PlusBlockStartState).loopBackState;
                    const count = this.getRandomLoopCount(inLexer, true);
                    for (let i = 0; i < count; ++i) {
                        result += this.generateFromDecisionState(run as PlusBlockStartState, !inLexer);
                    }

                    run = loopBack.transition(1).target;

                    break;
                }

                case ATNStateType.STAR_LOOP_ENTRY: {
                    const slEntry = run as StarLoopEntryState;
                    const blockStart = this.blockStart(slEntry);
                    if (blockStart) {
                        const count = this.getRandomLoopCount(inLexer, false);
                        for (let i = 0; i < count; ++i) {
                            result += this.generateFromDecisionState(blockStart, !inLexer);
                        }
                    }
                    run = this.loopEnd(slEntry) || stop;

                    break;
                }

                default: {
                    const transition = run.transition(0);
                    switch (transition.serializationType) {
                        case TransitionType.RULE: { // Transition into a sub rule.
                            run = (transition as RuleTransition).followState;
                            const ruleStart = transition.target as RuleStartState;
                            const [text] = this.generateFromATNSequence(ruleStart, ruleStart.stopState, !inLexer);
                            result += text;

                            break;
                        }

                        case TransitionType.WILDCARD: {
                            let text = "";
                            if (inLexer) {
                                // Any char from the entire Unicode range. The generator takes care to pick only
                                // valid characters.
                                [text] = this.getRandomCharacterFromInterval(fullUnicodeSet);
                            } else {
                                // Pick a random lexer rule.
                                const ruleIndex = Math.floor(Math.random() *
                                    this.lexerData.atn.ruleToStartState.length);
                                const state: RuleStartState = this.lexerData.atn.ruleToStartState[ruleIndex];
                                [text] = this.generateFromATNSequence(state, state.stopState, !inLexer);

                            }
                            result += text;
                            run = transition.target;

                            break;
                        }

                        case TransitionType.PREDICATE: {
                            // Evaluate the predicate if possible (or assume it succeeds if not).
                            // If evaluation returns false then return immediately with a flag to tell the caller
                            // to use a different decision (if possible).
                            const predicateTransition = transition as PredicateTransition;
                            blockedByPredicate = !this.sempred(run.ruleIndex, predicateTransition.predIndex, inLexer);
                            run = blockedByPredicate ? stop : transition.target;
                            break;
                        }

                        default: {
                            // Any other basic transition. See if there is a label we can use.
                            if (inLexer) {
                                if (transition.label) {
                                    let label = transition.label;
                                    if (transition instanceof NotSetTransition) {
                                        label = label.complement(IntervalSet.COMPLETE_CHAR_SET);
                                    }
                                    result += this.getRandomCharacterFromInterval(label);
                                }
                            } else {
                                if (transition.label && transition.label.maxElement > -1) {
                                    const randomIndex = Math.floor(Math.random() * transition.label.size);
                                    const token = this.getIntervalElement(transition.label, randomIndex);
                                    const tokenIndex = this.lexerData.atn.ruleToTokenType.indexOf(token);
                                    if (tokenIndex === -1) {
                                        // Found a virtual token. Either use its mapping as value or
                                        // its name for the output.
                                        const tokenName = this.lexerData.vocabulary.getSymbolicName(token);
                                        if (tokenName) {
                                            const mapping = this.ruleMappings?.get(tokenName);
                                            if (mapping) {
                                                result += addSpace ? mapping + " " : mapping;
                                            } else {
                                                result += addSpace ? tokenName + " " : tokenName;
                                            }
                                        } else {
                                            result += `[Cannot generate value for virtual token ${token}]`;
                                        }
                                    } else {
                                        const state = this.lexerData.atn.ruleToStartState[tokenIndex];
                                        const [text] = this.generateFromATNSequence(state, state.stopState, !inLexer);
                                        result += text;
                                    }
                                }
                            }
                            run = transition.target;

                            break;
                        }
                    }
                }
            }
        }

        if (isRule) {
            this.leaveRule(ruleName!);
            if (addSpace) {
                return [result + " ", blockedByPredicate];
            }
        }

        return [result, blockedByPredicate];
    }

    /**
     * Picks a random entry from all possible alternatives. Each alt gets a specific weight depending on its
     * previous invocations (the higher the invocation count the smaller the weight).
     *
     * If a decision is blocked by a failing predicate then an attempt is made to select another random decision.
     * If none is left for consideration then an empty string is returned.
     *
     * @param state The state from which to select on decision.
     * @param addSpace If true a space char is added between each ATN node label.
     *
     * @returns The generated string.
     */
    private generateFromDecisionState(state: DecisionState, addSpace: boolean): string {
        let result = "";
        let blocked = false; // Current decision blocked by a predicate?

        do {
            const decision = this.getRandomDecision(state);
            if (decision < 0) {
                return "";
            }

            // The alt counts are initialized in the call above if they don't exist yet.
            const decisionCounts = state.atn === this.lexerData.atn
                ? this.lexerDecisionCounts
                : this.parserDecisionCounts;
            const altCounts = decisionCounts.get(state.decision)!;
            ++altCounts[decision];

            let endState;
            switch (state.stateType) {
                case ATNStateType.STAR_BLOCK_START:
                case ATNStateType.BLOCK_START: {
                    endState = (state as BlockStartState).endState;
                    break;
                }

                case ATNStateType.PLUS_BLOCK_START: {
                    endState = (state as PlusBlockStartState).loopBackState;
                    break;
                }

                default: {
                    throw new Error("Unhandled state type in sentence generator");
                }
            }

            [result, blocked] = this.generateFromATNSequence(state.transition(decision).target, endState, addSpace);
            if (blocked) {
                altCounts[decision] = 1e6; // Set a large execution count to effectively disable this decision.
            }
        } while (blocked);

        return result;
    }

    /**
     * Determines a random decision (one of the outgoing transitions) depending on the already taken
     * transitions. If the decision state has an exit state (for ?, * and + operators) this exit state
     * always has a weight of 1, so it will always serve as exit point if other weights become to low.
     *
     * @param state The decision state to examine.
     *
     * @returns A random decision index.
     */
    private getRandomDecision(state: DecisionState): number {
        const decisionCounts = state.atn === this.lexerData.atn ? this.lexerDecisionCounts : this.parserDecisionCounts;

        const weights = new Array<number>(state.numberOfTransitions).fill(1);
        let altCounts = decisionCounts.get(state.decision);
        if (!altCounts) {
            altCounts = new Array<number>(state.numberOfTransitions).fill(0);
            decisionCounts.set(state.decision, altCounts);
        } else {
            for (let i = 0; i < altCounts.length; ++i) {
                weights[i] = Math.pow(this.convergenceFactor, altCounts[i]);
            }
        }

        const sum = weights.reduce((accumulated, current) => {
            return accumulated + current;
        });
        let randomValue = Math.random() * sum;
        let randomIndex = 0;
        while (randomIndex < altCounts.length) {
            randomValue -= weights[randomIndex];
            if (randomValue < 0) {
                return randomIndex;
            }
            ++randomIndex;
        }


        return -1;
    }

    /**
     * Goes through all transitions of the given state to find a loop end state.
     *
     * @param state The state to go from.
     *
     * @returns The found state or undefined.
     */
    private loopEnd(state: ATNState): ATNState | undefined {
        for (const transition of state.getTransitions()) {
            if (transition.target.stateType === ATNStateType.LOOP_END) {
                return transition.target;
            }
        }
    }

    private blockStart(state: StarLoopEntryState): StarBlockStartState | undefined {
        for (const transition of state.getTransitions()) {
            if (transition.target.stateType === ATNStateType.STAR_BLOCK_START) {
                return transition.target as StarBlockStartState;
            }
        }
    }

    /**
     * Returns the value at the given index. In order to avoid converting large intervals
     * into equally large arrays we take a different approach here to find the value.
     * It's assumed the given index is always in range.
     *
     * @param set The interval set from which to return a value.
     * @param index The value index in this set.
     *
     * @returns The value at index `index`.
     */
    private getIntervalElement(set: IntervalSet, index: number): number {
        let runningIndex = 0;
        for (const interval of set.intervals) {
            const intervalSize = interval.b - interval.a + 1;
            if (index < runningIndex + intervalSize) {
                return interval.a + index - runningIndex;
            }
            runningIndex += intervalSize;
        }

        return runningIndex;
    }

    private getRandomCharacterFromInterval(set: IntervalSet): String {
        const validSet = this.printableUnicode.and(set);
        if (validSet.size === 0) {
            return "✖︎";
        }

        return String.fromCodePoint(this.getIntervalElement(validSet, Math.floor(Math.random() * validSet.size)));
    }

    private getRandomLoopCount(inLexer: boolean, forPlusLoop: boolean): number {
        let min = inLexer ? this.minLexerIterations : this.minParserIterations;
        if (forPlusLoop && min === 0) {
            min = 1;
        }
        const max = inLexer ? this.maxLexerIterations : this.maxParserIterations;

        return Math.floor(Math.random() * (max - min + 1) + min);
    }

}
