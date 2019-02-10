/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict";

import {
    ATN, ATNState, ATNStateType, BlockStartState, PlusBlockStartState, StarLoopEntryState, TransitionType, RuleTransition,
    StarBlockStartState, RuleStartState, LoopEndState, NotSetTransition
} from "antlr4ts/atn";
import { Vocabulary } from "antlr4ts";

import { SentenceGenerationOptions } from "./facade";
import { IntervalSet } from "antlr4ts/misc";

import { printableUnicodePoints, FULL_UNICODE_SET } from "./Unicode";

/**
 * This class generates a number of strings, each valid input for a given ATN.
 */
export class SentenceGenerator {
    /**
     * @param lexerATN For lexer rule lookups.
     * @param ruleMap The lexer rule index map to go from token name to token rule index.
     * @param vocabulary The lexer vocabulary to lookup text for token value.
     */
    constructor(private lexerATN: ATN, private ruleMap: ReadonlyMap<string, number>,
        private vocabulary: Vocabulary, private lexerRuleNames: string[],
        private parserRuleNames?: string[]) {
    }

    public generate(options: SentenceGenerationOptions, start: RuleStartState, definitions?: Map<string, string>): string {
        this.convergenceFactor = options.convergenceFactor || 0.25;

        this.allPaths = options.allPaths || false;
        this.maxIterations = (!options.maxIterations || options.maxIterations < 0) ? 1 : options.maxIterations;
        this.maxRecursions = (!options.maxRecursions || options.maxRecursions < 0) ? 1 : options.maxRecursions;
        this.minLength = (!options.minTokenLength || options.minTokenLength < 1) ? 1 : options.minTokenLength;
        this.maxLength = (!options.maxTokenLength || options.maxTokenLength < 1) ? 256 : options.maxTokenLength;
        if (this.maxLength < this.minLength) {
            this.maxLength = this.minLength;
        }

        this.definitions.clear();
        if (definitions) {
            this.definitions = definitions;
        }

        this.lexerDecisionCounts = new Map<number, number[]>();
        this.parserDecisionCounts = new Map<number, number[]>();

        this.lexerStack.length = 0;
        this.parserStack.length = 0;
        this.generateUnicodeCollection();

        if (start.atn == this.lexerATN) {
            return this.generateFromLexerSequence(start, start.stopState);
        }

        let [result, flag] = this.generateFromSequence(start, start.stopState);
        if (flag) {
            return "Error: all paths in this rule lead to endless recursion.";
        }
        return result[0];
    }

    /**
     * Creates a cross product of input strings.
     */
    private combine(lhs: string[], rhs: string[], delimiter: string): string[] {
        if (lhs.length == 0) {
            return rhs;
        }
        if (rhs.length == 0) {
            return lhs;
        }

        let result: string[] = [];
        for (let i = 0; i < lhs.length; ++i) {
            for (let j = 0; j < rhs.length; ++j) {
                result.push(lhs[i] + delimiter + rhs[j]);
            }
        }
        return result;
    }

    private addChar(list: string[], subResult: string) {
        if (list.length == 0) {
            list.push(subResult);
            return;
        }

        for (let index = 0; index < list.length; ++index) {
            list[index] += subResult;
        }
    }

    /**
     * Processes a single sequence of lexer ATN states.
     */
    private generateFromLexerSequence(start: ATNState, stop: ATNState): string {
        let result: string = "";

        let isRule = start instanceof RuleStartState;
        if (isRule) {
            this.lexerStack.push(start.ruleIndex);
        }

        let run = start;
        while (run != stop) {
            switch (run.stateType) {
                case ATNStateType.BLOCK_START: {
                    result += this.generateFromLexerBlock(run as BlockStartState);
                    run = (run as BlockStartState).endState;

                    break;
                }

                case ATNStateType.PLUS_BLOCK_START: {
                    for (let i = 0; i < this.maxIterations; ++i) {
                        result += this.generateFromLexerBlock(run as BlockStartState);
                    }

                    run = (run as PlusBlockStartState).loopBackState;
                    run = this.loopEnd(run) || stop;

                    break;
                }

                case ATNStateType.STAR_LOOP_ENTRY: {
                    let loopStart = this.blockStart(run as StarLoopEntryState);

                    for (let i = 0; i < this.maxIterations; ++i) {
                        result += this.generateFromLexerBlock(loopStart);
                    }

                    run = this.loopEnd(run) || stop;

                    break;
                }

                default: {
                    let transition = run.transition(0);
                    switch (transition.serializationType) {
                        case TransitionType.RULE: { // Transition into a sub rule.
                            run = (transition as RuleTransition).followState;
                            let ruleStart = transition.target as RuleStartState;
                            let ruleName = this.lexerRuleNames[ruleStart.ruleIndex];
                            if (ruleName && this.definitions.has(ruleName)) {
                                result += this.definitions.get(ruleName);
                                break;
                            }

                            result += this.generateFromLexerSequence(ruleStart, ruleStart.stopState);

                            break;
                        }

                        case TransitionType.WILDCARD: {
                            // Any char from the entire Unicode range. The generator takes care to pick only
                            // valid characters.
                            result += this.getRandomCharacterFromInterval(FULL_UNICODE_SET);
                            run = transition.target;

                            break;
                        }

                        default:
                            // Any other basic transition. See if there is a label we can use.
                            // In lexer rules we always use a random value (one of a set or a list of alts) as we are
                            // dealing with characters here and it makes no sense to create all possible variations
                            // for Unicode code points.
                            if (transition.label) {
                                let label = transition.label;
                                if (transition instanceof NotSetTransition) {
                                    label = label.complement(IntervalSet.COMPLETE_CHAR_SET);
                                }
                                result += this.getRandomCharacterFromInterval(label);
                            }
                            run = transition.target;
                    }
                }
            }
        }

        if (isRule) {
            this.lexerStack.pop();
        }

        return result;
    }

    /**
     * Picks a random entry from all possible alternatives. Each alt gets a specific weight depending on its
     * previous invocation (the higher the invocation count the less the weight).
     */
    private generateFromLexerBlock(start: BlockStartState): string {
        let weights = new Array<number>(start.numberOfTransitions).fill(1);
        let altCounts = this.lexerDecisionCounts.get(start.decision);
        if (!altCounts) {
            altCounts = new Array<number>(start.numberOfTransitions).fill(0);
            this.lexerDecisionCounts.set(start.decision, altCounts);
        } else {
            for (let i = 0; i < altCounts.length; ++i) {
                weights[i] = Math.pow(this.convergenceFactor, altCounts[i]);
            }
        }

        let sum = weights.reduce((accumulated, current) => accumulated + current);
        if (sum == 0) {
            return "";
        }

        let randomValue = Math.random() * sum;
        let randomIndex = 0;
        while (true) {
            randomValue -= weights[randomIndex];
            if (randomValue < 0) {
                break;
            }
            ++randomIndex;
        }

        ++altCounts[randomIndex];
        let result = this.generateFromLexerSequence(start.transition(randomIndex).target, start.endState);
        --altCounts[randomIndex];

        return result;
    }

    /**
     * Processes a chain of parser rule states.
     * @returns A tuple of generated strings and a flag indicating if we bailed out because the maximum recursion count
     *          was reached.
     */
    private generateFromSequence(start: ATNState, stop: ATNState): [string, boolean] {
        let result: string = "";
        let maxRecursionReached = false;

        let isRule = start instanceof RuleStartState;
        if (isRule) {
            let maxRecursionReached = this.recursionCount((start as RuleStartState).ruleIndex, false) > this.maxRecursions;
            if (maxRecursionReached) {
                return [result, true];
            }

            this.parserStack.push(start.ruleIndex);
            this.parserStack2.push(this.parserRuleNames![start.ruleIndex]);
        }

        let run = start;
        while (run != stop) {
            switch (run.stateType) {
                case ATNStateType.BLOCK_START: {
                    let [subResult, flag] = this.generateFromBlock(run as BlockStartState, this.allPaths);
                    if (flag) {
                        maxRecursionReached = true;
                        run = stop;
                        break;
                    }
                    result += + subResult;
                    run = (run as BlockStartState).endState;

                    break;
                }

                case ATNStateType.PLUS_BLOCK_START: {
                    let iteration = 0;
                    let hadResult = false;
                    while (iteration++ <= this.maxIterations) {
                        let [subResult, flag] = this.generateFromBlock(run as BlockStartState, this.allPaths);
                        if (!flag) {
                            hadResult = true;
                            result += subResult;
                        }
                    }
                    if (hadResult) {
                        run = (run as PlusBlockStartState).loopBackState;
                        run = this.loopEnd(run) || stop;
                    } else {
                        maxRecursionReached = true;
                        run = stop;
                    }

                    break;
                }

                case ATNStateType.STAR_LOOP_ENTRY: {
                    let loopStart = this.blockStart(run as StarLoopEntryState);

                    let iteration = 0;
                    while (iteration++ < this.maxIterations) {
                        let [subResult, flag] = this.generateFromBlock(loopStart, this.allPaths);
                        if (flag) {
                            // We can ignore a recursion block here, since a Kleene star loop is optional.
                            break;
                        }
                        result += subResult;
                    }

                    run = this.loopEnd(run) || stop;

                    break;
                }

                default: {
                    let transition = run.transition(0);
                    switch (transition.serializationType) {
                        case TransitionType.RULE: {
                            run = (transition as RuleTransition).followState;
                            let ruleStart = transition.target as RuleStartState;

                            let ruleName = this.parserRuleNames![ruleStart.ruleIndex];
                            if (ruleName && this.definitions.has(ruleName)) {
                                result += this.definitions.get(ruleName);
                                continue;
                            }

                            let [subResult, flag] = this.generateFromSequence(ruleStart, ruleStart.stopState);
                            if (flag) {
                                maxRecursionReached = true;
                                result = "";
                                run = stop;
                            } else {
                                result += subResult;
                            }

                            break;
                        }

                        case TransitionType.WILDCARD: {
                            // A wild card transition in parser rules allows for any
                            // token value. Pick a random one from the list of lexer rules.
                            let ruleIndex;
                            let ruleName;
                            while (true) {
                                ruleIndex = Math.floor(Math.random() * (this.ruleMap.size));
                                ruleName = this.lexerRuleNames[ruleIndex];

                                if (ruleName != "EOF") { // Try again if we hit the EOF token.
                                    break;
                                }
                            }
                            if (!ruleName) {
                                continue;
                            }

                            if (this.definitions.has(ruleName)) {
                                result += this.definitions.get(ruleName);
                                continue;
                            }

                            let state: RuleStartState = this.lexerATN.ruleToStartState[ruleIndex];
                            result += this.generateFromLexerSequence(state, state.stopState);
                            run = transition.target;

                            break;
                        }

                        default: {
                            if (transition.label) {
                                let size = transition.label.size;
                                let fixedIndex = -1
                                if (!this.allPaths) {
                                    fixedIndex = Math.floor(Math.random() * size);
                                }

                                let localResult: string[] = [];
                                for (let i = 0; i < size; ++i) {
                                    if (fixedIndex > -1 && fixedIndex != i) {
                                        continue;
                                    }

                                    // Here we try to convert the token value to a lexer rule index. This is however
                                    // not 100% reliable, as a lexer rule can return any token value by explicitly
                                    // setting the return type (which doesn't happen often fortunately).
                                    let token = this.getIntervalElement(transition.label, i);
                                    let ruleName = this.vocabulary.getSymbolicName(token);
                                    if (!ruleName) {
                                        continue;
                                    }

                                    if (ruleName == "EOF") {
                                        run = stop;
                                        break;
                                    }

                                    if (this.definitions.has(ruleName)) {
                                        localResult.push(this.definitions.get(ruleName)!);
                                        continue;
                                    }

                                    let state: RuleStartState = this.lexerATN.ruleToStartState[this.ruleMap.get(ruleName)!];
                                    if (!state) {
                                        localResult.push("<<undefined lexer rule: " + ruleName + ">>")
                                    } else {
                                        localResult.push(...this.generateFromLexerSequence(state, state.stopState));
                                    }
                                }
                                result += localResult;
                            }
                            run = transition.target;

                            break;
                        }
                    }
                }
            }
        }

        if (isRule) {
            this.parserStack.pop();
            this.parserStack2.pop();
            //console.log(this.parserStack.length);
        }

        return [result, maxRecursionReached];
    }

    /**
     * Processes a non-loop block .
     * @returns A list of generated strings and a flag indicating if we only saw recursive paths.
     */
    private generateFromBlock(start: BlockStartState, allPaths: boolean): [string, boolean] {
        let result: string = "";
        if (allPaths) {
            // Count the paths which were taken out because they reached the max recursion count.
            // If this number equals the available transitions the entire block is recursion-blocked.
            let recursionBlocked = 0;
            for (let i = 0; i < start.numberOfTransitions; ++i) {
                // If nothing is returned it means we went through an optional part (provided we did not hit a max
                // recursion case). Add an empty entry for this case.
                let [localResult, flag] = this.generateFromSequence(start.transition(i).target, start.endState);
                if (flag) {
                    ++recursionBlocked;
                } else {
                    result += localResult;
                }
            }
            return [result, recursionBlocked == start.numberOfTransitions];
        }

        // In order to know which path is available in the random selection, even after
        // we tried out some and hit a recursion block, we need to keep a list of indices.
        let availableIndices: number[] = [];
        for (let i = 0; i < start.numberOfTransitions; ++i) {
            availableIndices.push(i);
        }

        while (availableIndices.length > 0) {
            let randomIndex = Math.floor(Math.random() * availableIndices.length);
            let [localResult, flag] = this.generateFromSequence(
                start.transition(availableIndices[randomIndex]).target, start.endState
            );
            if (flag) {
                // Start over with another random index if we hit a recursion block.
                availableIndices.splice(randomIndex, 1);
            } else {
                result += localResult;
                break;
            }
        }

        return [result, availableIndices.length == 0];
    }

    /**
     * Counts how many times the given rule is on the stack already.
     *
     * @param rule The rule to count.
     * @param forLexer A flag telling if that's a lexer or parser rule.
     */
    private recursionCount(rule: number, forLexer: boolean): number {
        if (forLexer) {
            return this.lexerStack.reduce(function (count, value) {
                return (value == rule) ? count + 1 : count;
            }, 0);
        }

        return this.parserStack.reduce(function (count, value) {
            return (value == rule) ? count + 1 : count;
        }, 0);
    }

    /**
     * Goes through all transitions of the given state to find a loop end state.
     * If found that state is returned, otherwise nothing.
     *
     * @param state The state to go from.
     */
    private loopEnd(state: ATNState): ATNState | undefined {
        for (let transition of state.getTransitions()) {
            if (transition.target instanceof LoopEndState) {
                return transition.target;
            }
        }
    }

    private blockStart(state: StarLoopEntryState): StarBlockStartState {
        for (let transition of state.getTransitions()) {
            if (transition.target instanceof StarBlockStartState) {
                return transition.target;
            }
        }

        return state.transition(0).target as StarBlockStartState; // Can never happen.
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

    /**
     * Generates a collection of Unicode code points matching the given Unicode codeblocks/categories.
     */
    private generateUnicodeCollection() {
        this.unicodeIntervalSet = printableUnicodePoints({ excludeCJK: true, excludeRTL: true, limitToBMP: false });
    }

    private getRandomCharacterFromInterval(set: IntervalSet): String {
        let validSet = this.unicodeIntervalSet.and(set);
        if (validSet.size == 0) {
            return "";
        }

        return String.fromCodePoint(this.getIntervalElement(validSet, Math.floor(Math.random() * validSet.size)));
    }

    private unicodeIntervalSet: IntervalSet;

    // Convergence data for recursive rule invocations. We count here the invocation of each alt
    // of a decision state.
    private convergenceFactor: number;
    private lexerDecisionCounts: Map<number, number[]>;
    private parserDecisionCounts: Map<number, number[]>;

    private minLength: number;
    private maxLength: number;
    private allPaths: boolean;
    private maxIterations: number;
    private maxRecursions: number;
    private definitions: Map<string, string> = new Map();

    // To limit recursions we need to track through which rules we are walking currently.
    private parserStack: number[] = [];
    private parserStack2: string[] = [];
    private lexerStack: number[] = [];
};
