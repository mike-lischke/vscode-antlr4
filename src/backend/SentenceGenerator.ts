/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict";

import * as fs from "fs";

import {
    ATN, ATNState, ATNStateType, BlockStartState, DecisionState, ATNType, PlusBlockStartState, StarLoopEntryState, TransitionType, RuleTransition, BlockEndState, StarBlockStartState, RuleStartState, LoopEndState, NotSetTransition
} from "antlr4ts/atn";
import { Vocabulary, Token } from "antlr4ts";

import { SentenceGenerationOptions } from "../backend/facade";
import { IntervalSet } from "antlr4ts/misc";

/**
 * This class generates a number of strings, each valid input for a given ATN.
 */
export class SentenceGenerator {
    /**
     * @param lexerAtn For lexer rule lookups.
     * @param ruleMap The lexer rule index map to go from token value to token rule index.
     * @param vocabulary The lexer vocabulary to lookup text for token value.
     */
    constructor(private atn: ATN, private ruleMap: ReadonlyMap<string, number>,
        private vocabulary: Vocabulary, private lexerRuleNames: string[],
        private parserRuleNames: string[]) {
    }

    public generate(options: SentenceGenerationOptions, start: RuleStartState, definitions?: Map<string, string>): string[] {
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

        this.lexerStack.length = 0;
        this.parserStack.length = 0;
        if (start.atn == this.atn) {
            return this.generateFromLexerSequence(start, start.stopState, this.maxLength);
        }
        let [result, flag] = this.generateFromSequence(start, start.stopState);
        if (flag) {
            return ["Error: all paths in this rule lead to endless recursion."];
        }
        return result;
    }

    private combine(lhs: string[], rhs: string[], delimiter: string): string[] {
        if (lhs.length == 0) {
            return rhs;
        }
        if (rhs.length == 0) {
            return lhs;
        }

        // Take a random entry in lhs and combine this with all entries in rhs.
        // For the rest of lhs pick a random entry from rhs.
        let result: string[] = [];
        let randomLhs = Math.floor(Math.random() * lhs.length);
        for (let i = 0; i < lhs.length; ++i) {
            if (i == randomLhs) {
                for (let right of rhs) {
                    if (right.length == 0) {
                        result.push(lhs[i]);
                    } else {
                        result.push(lhs[i] + delimiter + right);
                    }
                }
                continue;
            }

            let right = rhs[Math.floor(Math.random() * rhs.length)];
            if (right.length == 0) {
                result.push(lhs[i]);
            } else {
                result.push(lhs[i] + delimiter + right);
            }
        }
        return result;
    }

    private addChar(list: string[], char: string) {
        if (list.length == 0) {
            list.push(char);
            return;
        }

        for (let index = 0; index < list.length; ++index) {
            list[index] += char;
        }
    }

    /**
     * Distributes a value equally over all entries in the list, starting with startIndex.
     * Since only integral numbers are used a rest might be left over which is added
     * to the last entry in the list.
     */
    private distribute(list: number[], startIndex: number, value: number) {
        let part = Math.floor(value / (list.length - startIndex));
        for (let i = startIndex; i < list.length; ++i) {
            list[i] += part;
            value -= part;
        }
        if (value > 0) {
            list[list.length - 1] += value;
        }
    }

    /**
     * Processes a single sequence of lexer ATN states.
     */
    private generateFromLexerSequence(start: ATNState, stop: ATNState, availableLength: number): string[] {
        let result: string[] = [];
        let tokenLength = Math.floor(this.minLength + Math.random() * availableLength);

        let isRule = start instanceof RuleStartState;
        if (isRule) {
            this.lexerStack.push(start.ruleIndex);
        }

        // Count loops in the rule to allow distributing the token length to each.
        let run = start;
        let loopCounts: number[] = [];
        let alreadyTaken = 0;
        while (run != stop) {
            switch (run.stateType) {
                case ATNStateType.BLOCK_START: {
                    // Assume at least one "loop" for a block.
                    loopCounts.push(1);
                    ++alreadyTaken;
                    run = (run as BlockStartState).endState;
                    break;
                }

                case ATNStateType.PLUS_BLOCK_START: {
                    // At least one run for a plus loop.
                    loopCounts.push(1);
                    ++alreadyTaken;
                    run = (run as PlusBlockStartState).loopBackState;
                    run = this.loopEnd(run) || stop;
                    break;
                }

                case ATNStateType.STAR_LOOP_ENTRY: {
                    // No initial count for a star loop.
                    loopCounts.push(0);
                    run = this.loopEnd(run) || stop;

                    break;
                }

                default: {
                    // Here we have no decision state and hence only single transitions.
                    // Take any transition label into account for our loop count computation.
                    let transition = run.transition(0);
                    if (transition.label) {
                        ++alreadyTaken;
                    }

                    if (transition.serializationType == TransitionType.RULE) {
                        // Assume at least one "loop" for a sub rule.
                        loopCounts.push(1);
                        ++alreadyTaken;
                        run = (transition as RuleTransition).followState;
                    } else {
                        run = transition.target;
                    }
                    break;
                }
            }
        }

        // Now see how many elements are left and distribute them equally over
        // all seen blocks and loops.
        if (loopCounts.length > 0 && tokenLength > alreadyTaken) {
            this.distribute(loopCounts, 0, tokenLength - alreadyTaken);
        }

        // Note: for now we do not use the allPath settings for lexer rules as this often leads to many
        //       useless combinations (full Unicode charset, conditional alts etc.).
        run = start;
        let loopIndex = 0;
        while (run != stop) {
            switch (run.stateType) {
                case ATNStateType.BLOCK_START: {
                    let subResult = this.generateFromLexerBlock(run as BlockStartState, loopCounts[loopIndex], false);
                    result = this.combine(result, subResult, "");

                    // Blocks may not use all the length we allowed for,
                    // so determine what was used and distribute the rest
                    // to other blocks + loops.
                    let used = subResult.reduce(function (max, value) {
                        return value.length > max ? value.length : max;
                    }, 0);
                    this.distribute(loopCounts, loopIndex + 1, loopCounts[loopIndex] - used);
                    ++loopIndex;
                    run = (run as BlockStartState).endState;

                    break;
                }

                case ATNStateType.PLUS_BLOCK_START: {
                    while (loopCounts[loopIndex] > 0) {
                        let subResult = this.generateFromLexerBlock(run as BlockStartState, loopCounts[loopIndex], false);
                        result = this.combine(result, subResult, "");

                        // Each loop run may produce results with more than one char length.
                        // Take this into account for overall loop count.
                        let used = subResult.reduce(function (max, value) {
                            return value.length > max ? value.length : max;
                        }, 0);
                        loopCounts[loopIndex] -= used;
                    }

                    ++loopIndex;
                    run = (run as PlusBlockStartState).loopBackState;
                    run = this.loopEnd(run) || stop;

                    break;
                }

                case ATNStateType.STAR_LOOP_ENTRY: {
                    let loopStart = this.blockStart(run as StarLoopEntryState);
                    let end = loopStart.endState;

                    while (loopCounts[loopIndex] > 0) {
                        let subResult = this.generateFromLexerBlock(loopStart, loopCounts[loopIndex], false);
                        result = this.combine(result, subResult, "");

                        // Each loop run may produce results with more than one char length.
                        // Take this into account for overall loop count.
                        let used = subResult.reduce(function (max, value) {
                            return value.length > max ? value.length : max;
                        }, 0);
                        loopCounts[loopIndex] -= used;
                    }

                    run = this.loopEnd(run) || stop;
                    ++loopIndex;

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
                                result = this.combine(result, [this.definitions.get(ruleName)!], "");
                                break;
                            }

                            if (this.recursionCount(ruleStart.ruleIndex, true) < this.maxIterations) {
                                let subResult = this.generateFromLexerSequence(ruleStart, ruleStart.stopState,
                                    loopCounts[loopIndex]);
                                result = this.combine(result, subResult, "");

                                // Subrules may not use all the length we allowed for,
                                // so determine what was used and distribute the rest
                                // to other blocks + loops.
                                let used = subResult.reduce(function (max, value) {
                                    return value.length > max ? value.length : max;
                                }, 0);
                                this.distribute(loopCounts, loopIndex + 1, loopCounts[loopIndex] - used);
                            } else {
                                // This sequence shall not contribute anything to the overall result.
                                result.length = 0;
                                run = stop;
                            }
                            ++loopIndex;

                            break;
                        }

                        case TransitionType.WILDCARD: {
                            // Any char from the entire Unicode range.
                            // Grammars shouldn't use that actually (there are too many unusable code points),
                            // but we have to support it.
                            let char = String.fromCharCode(Math.floor(Math.random() * 0x10ffff));
                            this.addChar(result, char);
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
                                let index = Math.floor(Math.random() * label.size);
                                let char = String.fromCharCode(this.getIntervalElement(label, index));
                                this.addChar(result, char);
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
     * Processes a non-loop block (all-path setting applies here).
     */
    private generateFromLexerBlock(start: BlockStartState, availableLength: number, allPaths: boolean): string[] {
        let fixedIndex = -1;
        if (!allPaths) {
            fixedIndex = Math.floor(Math.random() * start.numberOfTransitions);
        }

        let result: string[] = [];
        for (let i = 0; i < start.numberOfTransitions; ++i) {
            if (fixedIndex > -1 && i != fixedIndex) {
                continue;
            }

            result.push(...this.generateFromLexerSequence(start.transition(i).target, start.endState, availableLength));
        }

        return result;
    }

    /**
     * Processes a chain of parser rule states.
     * @returns A tuple of generated strings and a flag indicating if we bailed out because the maximum recursion count
     *          was reached.
     */
    private generateFromSequence(start: ATNState, stop: ATNState): [string[], boolean] {
        let result: string[] = [];
        let maxRecursionReached = false;

        let isRule = start instanceof RuleStartState;
        if (isRule) {
            let maxRecursionReached = this.recursionCount((start as RuleStartState).ruleIndex, false) > this.maxRecursions;
            if (maxRecursionReached) {
                return [result, true];
            }

            //console.log(start.ruleIndex + " (" + this.parserRuleNames[start.ruleIndex] + ")");
            this.parserStack.push(start.ruleIndex);
            this.parserStack2.push(this.parserRuleNames[start.ruleIndex]);
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
                    result = this.combine(result, subResult, " ");
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
                            result = this.combine(result, subResult, " ");
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
                        result = this.combine(result, subResult, " ");
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

                            let ruleName = this.parserRuleNames[ruleStart.ruleIndex];
                            if (ruleName && this.definitions.has(ruleName)) {
                                result = this.combine(result, [this.definitions.get(ruleName)!], " ");
                                continue;
                            }

                            let [subResult, flag] = this.generateFromSequence(ruleStart, ruleStart.stopState);
                            if (flag) {
                                maxRecursionReached = true;
                                result.length = 0;
                                run = stop;
                            } else {
                                result = this.combine(result, subResult, " ");
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
                                result = this.combine(result, [this.definitions.get(ruleName)!], " ");
                                continue;
                            }

                            let state: RuleStartState = this.atn.ruleToStartState[ruleIndex];
                            result = this.combine(result, this.generateFromLexerSequence(state, state.stopState, this.maxLength - this.minLength), " ");
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

                                    let state: RuleStartState = this.atn.ruleToStartState[this.ruleMap.get(ruleName)!];
                                    if (!state) {
                                        localResult.push("<<undefined lexer rule: " + ruleName + ">>")
                                    } else {
                                        localResult.push(...this.generateFromLexerSequence(state, state.stopState, this.maxLength - this.minLength));
                                    }
                                }
                                result = this.combine(result, localResult, " ");
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
     * Processes a non-loop block (all-path setting applies here).
     * @returns A list of generated strings and a flag indicating if we only saw recursive paths.
     */
    private generateFromBlock(start: BlockStartState, allPaths: boolean): [string[], boolean] {
        let result: string[] = [];
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
                    if (localResult.length == 0) {
                        localResult.push("");
                    }
                    result.push(...localResult);
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
                if (localResult.length == 0) {
                    localResult.push("");
                }
                result.push(...localResult);
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
