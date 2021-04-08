/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2021, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import {
    TextDocument, Position, CancellationToken,  CompletionItem, ProviderResult, CompletionList,
} from "vscode";
import { AntlrFacade } from "../backend/facade";
import { translateCompletionKind } from "./Symbol";

// Determines the sort order in the completion list. One value for each SymbolKind.
const sortKeys = [
    "01", // Keyword
    "06", // TokenVocab
    "07", // Import
    "03", // BuiltInLexerToken
    "03", // VirtualLexerToken
    "03", // FragmentLexerToken
    "03", // LexerToken
    "05", // BuiltInMode
    "05", // LexerMode
    "02", // BuiltInChannel
    "02", // TokenChannel
    "04", // ParserRule
    "08", // Action
    "09", // Predicate
    "00", // Operator
    "10", // Option
];

// Descriptions for each symbol kind.
const details = [
    "Keyword",                // Keyword
    undefined,                // TokenVocab
    undefined,                // Import
    "Built-in lexer token",   // BuiltInLexerToken
    "Virtual lexer token",    // VirtualLexerToken
    "Fragment lexer token",   // FragmentLexerToken
    "Lexer token",            // LexerToken
    "Built-in lexer mode",    // BuiltInMode
    "Lexer mode",             // LexerMode
    "Built-in token channel", // BuiltInChannel
    "Token channel",          // TokenChannel
    "Parser rule",            // ParserRule
    "Action",                 // Action
    "Predicate",              // Predicate
    "Operator",               // Operators usually come with an own description from the backend.
    "Grammar option",
];

export class AntlrCompletionItemProvider {
    public constructor(private backend: AntlrFacade) { }

    public provideCompletionItems(document: TextDocument, position: Position,
        token: CancellationToken): ProviderResult<CompletionList> {

        const candidates = this.backend.getCodeCompletionCandidates(document.fileName, position.character,
            position.line + 1);
        const completionList: CompletionItem[] = [];

        candidates.forEach((info) => {
            const item = new CompletionItem(info.name, translateCompletionKind(info.kind));
            item.sortText = sortKeys[info.kind] + info.name;
            item.detail = (info.description !== undefined) ? info.description : details[info.kind];

            completionList.push(item);
        });

        return new CompletionList(completionList, false);
    }
}
