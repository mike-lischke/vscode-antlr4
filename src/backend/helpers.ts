/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import type { BaseSymbol } from "antlr4-c3";
import { ParserRuleContext, TerminalNode, type ParseTree } from "antlr4ng";

import { ANTLRv4Parser, type GrammarSpecContext, type ModeSpecContext } from "../parser/ANTLRv4Parser.js";
import { SymbolKind, type IDefinition } from "../types.js";
import { ArgumentsSymbol } from "./parser-symbols/ArgumentsSymbol.js";
import { BuiltInChannelSymbol } from "./parser-symbols/BuiltInChannelSymbol.js";
import { BuiltInModeSymbol } from "./parser-symbols/BuiltInModeSymbol.js";
import { BuiltInTokenSymbol } from "./parser-symbols/BuiltInTokenSymbol.js";
import { ExceptionActionSymbol } from "./parser-symbols/ExceptionActionSymbol.js";
import { FinallyActionSymbol } from "./parser-symbols/FinallyActionSymbol.js";
import { FragmentTokenSymbol } from "./parser-symbols/FragmentTokenSymbol.js";
import { GlobalNamedActionSymbol } from "./parser-symbols/GlobalNamedActionSymbol.js";
import { ImportSymbol } from "./parser-symbols/ImportSymbol.js";
import { LexerActionSymbol } from "./parser-symbols/LexerActionSymbol.js";
import { LexerCommandSymbol } from "./parser-symbols/LexerCommandSymbol.js";
import { LexerModeSymbol } from "./parser-symbols/LexerModeSymbol.js";
import { LexerPredicateSymbol } from "./parser-symbols/LexerPredicateSymbol.js";
import { LocalNamedActionSymbol } from "./parser-symbols/LocalNamedActionSymbol.js";
import { OperatorSymbol } from "./parser-symbols/OperatorSymbol.js";
import { ParserActionSymbol } from "./parser-symbols/ParserActionSymbol.js";
import { ParserPredicateSymbol } from "./parser-symbols/ParserPredicateSymbol.js";
import { RuleReferenceSymbol } from "./parser-symbols/RuleReferenceSymbol.js";
import { TerminalSymbol } from "./parser-symbols/TerminalSymbol.js";
import { TokenChannelSymbol } from "./parser-symbols/TokenChannelSymbol.js";
import { TokenReferenceSymbol } from "./parser-symbols/TokenReferenceSymbol.js";
import { TokenSymbol } from "./parser-symbols/TokenSymbol.js";
import { VirtualTokenSymbol } from "./parser-symbols/VirtualTokenSymbol.js";
import { RuleSymbol } from "./parser-symbols/RuleSymbol.js";

export interface ISourceContext {
    sourceId: string;
    fileName: string;

    removeDependency(context: ISourceContext): void;
}

const symbolToKindMap: Map<new () => BaseSymbol, SymbolKind> = new Map([
    [GlobalNamedActionSymbol, SymbolKind.GlobalNamedAction],
    [LocalNamedActionSymbol, SymbolKind.LocalNamedAction],
    [ImportSymbol, SymbolKind.Import],
    [BuiltInTokenSymbol, SymbolKind.BuiltInLexerToken],
    [VirtualTokenSymbol, SymbolKind.VirtualLexerToken],
    [FragmentTokenSymbol, SymbolKind.FragmentLexerToken],
    [TokenSymbol, SymbolKind.LexerRule],
    [BuiltInModeSymbol, SymbolKind.BuiltInMode],
    [LexerModeSymbol, SymbolKind.LexerMode],
    [BuiltInChannelSymbol, SymbolKind.BuiltInChannel],
    [TokenChannelSymbol, SymbolKind.TokenChannel],
    [RuleSymbol, SymbolKind.ParserRule],
    [OperatorSymbol, SymbolKind.Operator],
    [TerminalSymbol, SymbolKind.Terminal],
    [TokenReferenceSymbol, SymbolKind.TokenReference],
    [RuleReferenceSymbol, SymbolKind.RuleReference],
    [LexerCommandSymbol, SymbolKind.LexerCommand],

    [ExceptionActionSymbol, SymbolKind.ExceptionAction],
    [FinallyActionSymbol, SymbolKind.FinallyAction],
    [ParserActionSymbol, SymbolKind.ParserAction],
    [LexerActionSymbol, SymbolKind.LexerAction],
    [ParserPredicateSymbol, SymbolKind.ParserPredicate],
    [LexerPredicateSymbol, SymbolKind.LexerPredicate],
    [ArgumentsSymbol, SymbolKind.Arguments],
]);

/**
 * Maps a symbol to a symbol kind.
 *
 * @param symbol The symbol to map.
 *
 * @returns The symbol kind.
 */
export const getKindFromSymbol = (symbol: BaseSymbol): SymbolKind => {
    if (symbol.name === "tokenVocab") {
        return SymbolKind.TokenVocab;
    }

    return symbolToKindMap.get(symbol.constructor as typeof BaseSymbol) || SymbolKind.Unknown;
};

/**
 * @param ctx The context to get info for.
 * @param keepQuotes A flag indicating if quotes should be kept if there are any around the context's text.
 *
 * @returns The definition info for the given rule context.
 */
export const definitionForContext = (ctx: ParseTree | undefined, keepQuotes: boolean): IDefinition | undefined => {
    if (!ctx) {
        return undefined;
    }

    const result: IDefinition = {
        text: "",
        range: {
            start: { column: 0, row: 0 },
            end: { column: 0, row: 0 },
        },
    };

    if (ctx instanceof ParserRuleContext) {
        let start = ctx.start!.start;
        let stop = ctx.stop!.stop;

        result.range.start.column = ctx.start!.column;
        result.range.start.row = ctx.start!.line;
        result.range.end.column = ctx.stop!.column;
        result.range.end.row = ctx.stop!.line;

        // For mode definitions we only need the init line, not all the lexer rules following it.
        if (ctx.ruleIndex === ANTLRv4Parser.RULE_modeSpec) {
            const modeSpec = ctx as ModeSpecContext;
            stop = modeSpec.SEMI().symbol.stop;
            result.range.end.column = modeSpec.SEMI().symbol.column;
            result.range.end.row = modeSpec.SEMI().symbol.line;
        } else if (ctx.ruleIndex === ANTLRv4Parser.RULE_grammarSpec) {
            // Similar for entire grammars. We only need the introducer line here.
            const grammarDecl = (ctx as GrammarSpecContext).grammarDecl();
            stop = grammarDecl.SEMI().symbol.stop;
            result.range.end.column = grammarDecl.SEMI().symbol.column;
            result.range.end.row = grammarDecl.SEMI().symbol.line;

            start = grammarDecl.grammarType().start!.start;
            result.range.start.column = grammarDecl.grammarType().start!.column;
            result.range.start.row = grammarDecl.grammarType().start!.line;
        }

        const inputStream = ctx.start?.tokenSource?.inputStream;
        if (inputStream) {
            try {
                result.text = inputStream.getTextFromRange(start, stop);
            } catch {
                // The method getText uses an unreliable JS String API which can throw on larger texts.
                // In this case we cannot return the text of the given context.
                // A context with such a large size is probably an error case anyway (unfinished multi line comment
                // or unfinished action).
            }
        }
    } else if (ctx instanceof TerminalNode) {
        result.text = ctx.getText();

        result.range.start.column = ctx.symbol.column;
        result.range.start.row = ctx.symbol.line;
        result.range.end.column = ctx.symbol.column + result.text.length;
        result.range.end.row = ctx.symbol.line;
    }

    if (keepQuotes || result.text.length < 2) {
        return result;
    }

    const quoteChar = result.text[0];
    if ((quoteChar === '"' || quoteChar === "`" || quoteChar === "'")
        && quoteChar === result.text[result.text.length - 1]) {
        result.text = result.text.substring(1, result.text.length - 1);
    }

    return result;
};
