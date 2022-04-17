/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as vscode from "vscode";

import { SymbolKind } from "../backend/types";

const symbolDescriptionMap = new Map<SymbolKind, string>([
    [SymbolKind.Terminal, "Terminal"],
    [SymbolKind.Keyword, "Keyword"],
    [SymbolKind.TokenVocab, "Token Vocabulary"],
    [SymbolKind.Import, "Import"],
    [SymbolKind.BuiltInLexerToken, "Built-in Lexer Token"],
    [SymbolKind.VirtualLexerToken, "Virtual Lexer Token"],
    [SymbolKind.FragmentLexerToken, "Fragment Lexer Token"],
    [SymbolKind.LexerRule, "Lexer Rule"],
    [SymbolKind.BuiltInMode, "Built-in Lexer Mode"],
    [SymbolKind.LexerMode, "Lexer Mode"],
    [SymbolKind.BuiltInChannel, "Built-in Token Channel"],
    [SymbolKind.TokenChannel, "Token Channel"],
    [SymbolKind.ParserRule, "Parser Rule"],
    [SymbolKind.Operator, "Operator"],
    [SymbolKind.Option, "Grammar Option"],
    [SymbolKind.TokenReference, "Token (Lexer Rule) Reference"],
    [SymbolKind.RuleReference, "Parser Rule Reference"],
    [SymbolKind.GlobalNamedAction, "Global Named Action"],
    [SymbolKind.LocalNamedAction, "Local Named Action"],
    [SymbolKind.LexerCommand, "Lexer Command"],
    [SymbolKind.ExceptionAction, "Exception Action Code"],
    [SymbolKind.FinallyAction, "Finally Action Code"],
    [SymbolKind.ParserAction, "Parser Action"],
    [SymbolKind.LexerAction, "Lexer Action"],
    [SymbolKind.ParserPredicate, "Parser Predicate"],
    [SymbolKind.LexerPredicate, "Lexer Predicate"],
    [SymbolKind.Arguments, "Native Arguments"],
]);

/**
 * Provides a textual expression for a native symbol kind.
 *
 * @param kind The kind of symbol for which a description is needed.
 *
 * @returns The description.
 */
export const symbolDescriptionFromEnum = (kind: SymbolKind): string => {
    return symbolDescriptionMap.get(kind) || "Unknown";
};

const symbolCodeTypeMap = new Map<SymbolKind, vscode.SymbolKind>([
    [SymbolKind.Terminal, vscode.SymbolKind.EnumMember],
    [SymbolKind.Keyword, vscode.SymbolKind.Key],
    [SymbolKind.TokenVocab, vscode.SymbolKind.Module],
    [SymbolKind.Import, vscode.SymbolKind.Module],
    [SymbolKind.BuiltInLexerToken, vscode.SymbolKind.Enum],
    [SymbolKind.VirtualLexerToken, vscode.SymbolKind.Enum],
    [SymbolKind.FragmentLexerToken, vscode.SymbolKind.Enum],
    [SymbolKind.LexerRule, vscode.SymbolKind.Function],
    [SymbolKind.BuiltInMode, vscode.SymbolKind.Variable],
    [SymbolKind.LexerMode, vscode.SymbolKind.Variable],
    [SymbolKind.BuiltInChannel, vscode.SymbolKind.Number],
    [SymbolKind.TokenChannel, vscode.SymbolKind.Number],
    [SymbolKind.ParserRule, vscode.SymbolKind.Function],
    [SymbolKind.Operator, vscode.SymbolKind.Operator],
    [SymbolKind.Option, vscode.SymbolKind.Object],
    [SymbolKind.TokenReference, vscode.SymbolKind.Function],
    [SymbolKind.RuleReference, vscode.SymbolKind.Function],
    [SymbolKind.GlobalNamedAction, vscode.SymbolKind.Struct],
    [SymbolKind.LocalNamedAction, vscode.SymbolKind.Struct],
    [SymbolKind.LexerCommand, vscode.SymbolKind.Struct],
    [SymbolKind.ExceptionAction, vscode.SymbolKind.Struct],
    [SymbolKind.FinallyAction, vscode.SymbolKind.Struct],
    [SymbolKind.ParserAction, vscode.SymbolKind.Struct],
    [SymbolKind.LexerAction, vscode.SymbolKind.Struct],
    [SymbolKind.ParserPredicate, vscode.SymbolKind.Event],
    [SymbolKind.LexerPredicate, vscode.SymbolKind.Event],
    [SymbolKind.Arguments, vscode.SymbolKind.TypeParameter],
]);

/**
 * Converts the native symbol kind to a vscode symbol kind.
 *
 * @param kind The kind of symbol for which the vscode kind is needed.
 *
 * @returns The vscode symbol kind for the given ANTLR4 kind.
 */
export const translateSymbolKind = (kind: SymbolKind): vscode.SymbolKind => {
    return symbolCodeTypeMap.get(kind) || vscode.SymbolKind.Null;
};

const symbolCompletionTypeMap = new Map<SymbolKind, vscode.CompletionItemKind>([
    [SymbolKind.Terminal, vscode.CompletionItemKind.EnumMember],
    [SymbolKind.Keyword, vscode.CompletionItemKind.Keyword],
    [SymbolKind.TokenVocab, vscode.CompletionItemKind.Module],
    [SymbolKind.Import, vscode.CompletionItemKind.Module],
    [SymbolKind.BuiltInLexerToken, vscode.CompletionItemKind.Enum],
    [SymbolKind.VirtualLexerToken, vscode.CompletionItemKind.Enum],
    [SymbolKind.FragmentLexerToken, vscode.CompletionItemKind.Enum],
    [SymbolKind.LexerRule, vscode.CompletionItemKind.Function],
    [SymbolKind.BuiltInMode, vscode.CompletionItemKind.Variable],
    [SymbolKind.LexerMode, vscode.CompletionItemKind.Variable],
    [SymbolKind.BuiltInChannel, vscode.CompletionItemKind.Value],
    [SymbolKind.TokenChannel, vscode.CompletionItemKind.Value],
    [SymbolKind.ParserRule, vscode.CompletionItemKind.Function],
    [SymbolKind.Operator, vscode.CompletionItemKind.Operator],
    [SymbolKind.Option, vscode.CompletionItemKind.User],
    [SymbolKind.TokenReference, vscode.CompletionItemKind.Function],
    [SymbolKind.RuleReference, vscode.CompletionItemKind.Function],
    [SymbolKind.GlobalNamedAction, vscode.CompletionItemKind.Struct],
    [SymbolKind.LocalNamedAction, vscode.CompletionItemKind.Struct],
    [SymbolKind.LexerCommand, vscode.CompletionItemKind.Struct],
    [SymbolKind.ExceptionAction, vscode.CompletionItemKind.Struct],
    [SymbolKind.FinallyAction, vscode.CompletionItemKind.Struct],
    [SymbolKind.ParserAction, vscode.CompletionItemKind.Struct],
    [SymbolKind.LexerAction, vscode.CompletionItemKind.Struct],
    [SymbolKind.ParserPredicate, vscode.CompletionItemKind.Event],
    [SymbolKind.LexerPredicate, vscode.CompletionItemKind.Event],
    [SymbolKind.Arguments, vscode.CompletionItemKind.TypeParameter],
]);


/**
 * Converts the native symbol kind to a vscode completion item kind.
 *
 * @param kind The kind of symbol for which return the completion item kind.
 *
 * @returns The vscode completion item kind.
 */
export const translateCompletionKind = (kind: SymbolKind): vscode.CompletionItemKind => {
    return symbolCompletionTypeMap.get(kind) || vscode.CompletionItemKind.Text;
};
