/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict";

import {
    ATN, ATNState, ATNStateType, BlockStartState, PlusBlockStartState, StarLoopEntryState, TransitionType,
    RuleTransition, StarBlockStartState, RuleStartState, NotSetTransition, DecisionState
} from "antlr4ts/atn";

import { SentenceGenerationOptions, RuleMappings } from "./facade";
import { IntervalSet } from "antlr4ts/misc";

import { printableUnicodePoints, FULL_UNICODE_SET } from "./Unicode";
import { InterpreterData } from "./InterpreterDataReader";

/**
 * This class generates a number of strings, each valid input for a given ATN.
 */
export class SentenceGenerator {
    /**
     * @param lexerATN For lexer rule lookups.
     * @param ruleMap The lexer rule index map to go from token name to token rule index.
     * @param vocabulary The lexer vocabulary to lookup text for token value.
     */
    constructor(
        private lexerData: InterpreterData, private parserData?: InterpreterData) {

        this.printableUnicode = printableUnicodePoints({ excludeCJK: true, excludeRTL: true, limitToBMP: false });
    }

    public generate(options: SentenceGenerationOptions, start: RuleStartState, ruleDefinitions?: RuleMappings): string {

        this.convergenceFactor = options.convergenceFactor || 0.25;

        this.maxIterations = (!options.maxIterations || options.maxIterations < 1) ? 3 : options.maxIterations;
        this.maxRecursions = (!options.maxRecursions || options.maxRecursions < 1) ? 3 : options.maxRecursions;

        this.ruleInvocations.clear();
        this.ruleDefinitions.clear();
        if (ruleDefinitions) {
            this.ruleDefinitions = ruleDefinitions;
        }

        this.lexerDecisionCounts = new Map<number, number[]>();
        this.parserDecisionCounts = new Map<number, number[]>();

        this.parserStack.length = 0;

        return this.generateFromATNSequence(start, start.stopState, true).trim();
    }

    /**
     * Returns the name of the rule with the given index.
     *
     * @param inLexer A flag to tell where to lookup the symbol name.
     * @param index The rule index to convert.
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
     * Records the invocation of the given rule and returns true if that rule's invocation count is less
     * than the maximum recursion count.
     *
     * @param name The name of the rule.
     */
    private invokeRule(name: string): boolean {
        let count = this.ruleInvocations.get(name);
        if (count) {
            if (count < this.maxRecursions) {
                this.ruleInvocations.set(name, count + 1);
            }
            return false;
        }

        this.ruleInvocations.set(name, 1);
        return true;
    }

    /**
     * Remove one invocation step for the given rule. If the count is zero after that, then the rule is removed
     * from the invocation list alltogether.
     *
     * @param name The name of the rule.
     */
    private leaveRule(name: string) {
        let count = this.ruleInvocations.get(name);
        if (count) {
            --count;
            if (count == 0) {
                this.ruleInvocations.delete(name);
            } else {
                this.ruleInvocations.set(name, count);
            }
        }
    }

    /**
     * Processes a single sequence of ATN states (a rule or a single alt in a block).
     */
    private generateFromATNSequence(start: ATNState, stop: ATNState, addSpace: boolean): string {
        let inLexer = start.atn == this.lexerData.atn;
        let isRule = start.stateType == ATNStateType.RULE_START;

        let ruleName: string | undefined;
        if (isRule) {
            // Check if there's a predefined result for the given rule.
            ruleName = this.getRuleName(inLexer, start.ruleIndex);
            if (!ruleName) {
                return "";
            }

            let mapping = this.ruleDefinitions.get(ruleName);
            if (mapping) {
                return addSpace ? mapping + " " : mapping;
            }

            if (!this.invokeRule(ruleName)) {
                return addSpace ? "42 " : "42";
            }
        }


        let result: string = "";

        let run = start;
        while (run != stop) {
            switch (run.stateType) {
                case ATNStateType.BLOCK_START: {
                    result += this.generateFromDecisionState(run as BlockStartState, !inLexer);
                    run = (run as BlockStartState).endState;

                    break;
                }

                case ATNStateType.PLUS_BLOCK_START: {
                    let loopBack = (run as PlusBlockStartState).loopBackState;
                    let count = Math.floor(Math.random() * (this.maxIterations - 1)) + 1;
                    for (let i = 0; i < count; ++i) {
                        result += this.generateFromATNSequence(run.transition(0).target, loopBack, !inLexer);
                        result += this.generateFromDecisionState(run as PlusBlockStartState, !inLexer);
                    }

                    run = loopBack.transition(1).target;

                    break;
                }

                case ATNStateType.STAR_LOOP_ENTRY: {
                    let slEntry = run as StarLoopEntryState;
                    let blockStart = this.blockStart(slEntry);
                    if (blockStart) {
                        let count = Math.floor(Math.random() * this.maxIterations);
                        for (let i = 0; i < count; ++i) {
                            result += this.generateFromATNSequence(blockStart, slEntry.loopBackState, !inLexer);
                        }
                    }
                    run = this.loopEnd(slEntry) || stop;

                    break;
                }

                default: {
                    let transition = run.transition(0);
                    switch (transition.serializationType) {
                        case TransitionType.RULE: { // Transition into a sub rule.
                            run = (transition as RuleTransition).followState;
                            let ruleStart = transition.target as RuleStartState;
                            result += this.generateFromATNSequence(ruleStart, ruleStart.stopState, !inLexer);

                            break;
                        }

                        case TransitionType.WILDCARD: {
                            if (inLexer) {
                                // Any char from the entire Unicode range. The generator takes care to pick only
                                // valid characters.
                                result += this.getRandomCharacterFromInterval(FULL_UNICODE_SET);
                            } else {
                                // Pick a random lexer rule.
                                let ruleIndex = Math.floor(Math.random() * this.lexerData.atn.ruleToStartState.length);
                                let state: RuleStartState = this.lexerData.atn.ruleToStartState[ruleIndex];
                                result += this.generateFromATNSequence(state, state.stopState, !inLexer);
                            }
                            run = transition.target;

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
                                    let randomIndex = Math.floor(Math.random() * transition.label.size);
                                    let token = this.getIntervalElement(transition.label, randomIndex);
                                    let tokenIndex = this.lexerData.atn.ruleToTokenType.indexOf(token);
                                    if (tokenIndex === -1) {
                                        // If there's no token type then it means we have a virtual token here.
                                        // See if there's a mapping for it.
                                        let tokenName = this.lexerData.vocabulary.getSymbolicName(token);
                                        if (tokenName) {
                                            let mapping = this.ruleDefinitions.get(tokenName);
                                            if (mapping) {
                                                result += addSpace ? mapping + " " : mapping;
                                            }
                                        } else {
                                            result += `[Cannot generate value for virtual token ${token}]`;
                                        }
                                    } else {
                                        let state = this.lexerData.atn.ruleToStartState[tokenIndex];
                                        result += this.generateFromATNSequence(state, state.stopState, !inLexer);
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
                return result + " ";
            }
        }
        return result;
    }

    /**
     * Picks a random entry from all possible alternatives. Each alt gets a specific weight depending on its
     * previous invocations (the higher the invocation count the smaller the weight).
     */
    private generateFromDecisionState(state: DecisionState, addSpace: boolean): string {
        let decision = this.getRandomDecision(state);

        // The alt counts are initialized in the call above if they don't exist yet.
        let decisionCounts = state.atn == this.lexerData.atn ? this.lexerDecisionCounts : this.parserDecisionCounts;
        let altCounts = decisionCounts.get(state.decision)!;
        ++altCounts[decision];

        let startState;
        let endState;
        switch (state.stateType) {
            case ATNStateType.BLOCK_START: {
                startState = state;
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

        let result = "";
        if (startState != endState) {
            result = this.generateFromATNSequence(state.transition(decision).target, endState, addSpace);
        }
        --altCounts[decision];

        return result;
    }

    /**
     * Determines a random decision (one of the outgoing transitions) depending on the already taken
     * transitions. If the decision state has an exit state (for ?, * and + operators) this exit state
     * always has a weight of 1, so it will always serve as exit point if other weights become to low.
     *
     * @param state The decision state to examine.
     */
    private getRandomDecision(state: DecisionState): number {
        let decisionCounts = state.atn == this.lexerData.atn ? this.lexerDecisionCounts : this.parserDecisionCounts;

        let weights = new Array<number>(state.numberOfTransitions).fill(1);
        let altCounts = decisionCounts.get(state.decision);
        if (!altCounts) {
            altCounts = new Array<number>(state.numberOfTransitions).fill(0);
            decisionCounts.set(state.decision, altCounts);
        } else {
            for (let i = 0; i < altCounts.length; ++i) {
                weights[i] = Math.pow(this.convergenceFactor, altCounts[i]);
            }
        }

        let sum = weights.reduce((accumulated, current) => accumulated + current);
        let randomValue = Math.random() * sum;
        let randomIndex = 0;
        while (true) {
            randomValue -= weights[randomIndex];
            if (randomValue < 0) {
                return randomIndex;
            }
            ++randomIndex;
        }
    }

    /**
     * Goes through all transitions of the given state to find a loop end state.
     * If found that state is returned, otherwise nothing.
     *
     * @param state The state to go from.
     */
    private loopEnd(state: ATNState): ATNState | undefined {
        for (let transition of state.getTransitions()) {
            if (transition.target.stateType == ATNStateType.LOOP_END) {
                return transition.target;
            }
        }
    }

    private blockStart(state: StarLoopEntryState): StarBlockStartState | undefined {
        for (let transition of state.getTransitions()) {
            if (transition.target.stateType == ATNStateType.STAR_BLOCK_START) {
                return transition.target as StarBlockStartState;
            }
        }
    }

    /**
     * Returns the value at the given index. In order to avoid converting large intervals
     * into equally large arrays we take a different approach here to find the value.
     * It's assumed the given index is always in range.
     */
    private getIntervalElement(set: IntervalSet, index: number): number {
        let runningIndex = 0;
        for (let interval of set.intervals) {
            let intervalSize = interval.b - interval.a + 1;
            if (index < runningIndex + intervalSize) {
                return interval.a + index - runningIndex;
            }
            runningIndex += intervalSize;
        }
        return runningIndex;
    }

    private getRandomCharacterFromInterval(set: IntervalSet): String {
        let validSet = this.printableUnicode.and(set);
        return String.fromCodePoint(this.getIntervalElement(validSet, Math.floor(Math.random() * validSet.size)));
    }

    private printableUnicode: IntervalSet;

    // Convergence data for recursive rule invocations. We count here the invocation of each alt
    // of a decision state.
    private convergenceFactor: number;
    private lexerDecisionCounts: Map<number, number[]>;
    private parserDecisionCounts: Map<number, number[]>;

    private maxIterations: number;
    private maxRecursions: number;
    private ruleInvocations: Map<string, number> = new Map();
    private ruleDefinitions: RuleMappings = new Map();

    // To limit recursions we need to track through which rules we are walking currently.
    private parserStack: number[] = [];
};
