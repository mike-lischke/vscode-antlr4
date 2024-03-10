/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { LexerInterpreter, ParserRuleContext, CharStream } from "antlr4ng";

import { IInterpreterData } from "./InterpreterDataReader.js";
import { LexerPredicateSymbol } from "./ContextSymbolTable.js";
import { SourceContext } from "./SourceContext.js";
import { PredicateFunction } from "../types.js";

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

    public override sempred(_localctx: ParserRuleContext | null, ruleIndex: number, predIndex: number): boolean {
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

    public override action(_localctx: ParserRuleContext | null, _ruleIndex: number, _actionIndex: number): void {
        // not used yet
    }
}
