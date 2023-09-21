/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
    TextDocument, Position, CancellationToken, CompletionItem, ProviderResult, CompletionList,
} from "vscode";
import { AntlrFacade } from "../backend/facade.js";
import { translateCompletionKind } from "./Symbol.js";

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
        _token: CancellationToken): ProviderResult<CompletionList> {

        return new Promise((resolve, reject) => {
            this.backend.getCodeCompletionCandidates(document.fileName, position.character, position.line + 1)
                .then((candidates) => {
                    const completionList: CompletionItem[] = [];
                    candidates.forEach((info) => {
                        const item = new CompletionItem(info.name, translateCompletionKind(info.kind));
                        item.sortText = sortKeys[info.kind] + info.name;
                        item.detail = (info.description !== undefined) ? info.description : details[info.kind];

                        completionList.push(item);
                    });

                    resolve(new CompletionList(completionList, false));
                }).catch((reason) => {
                    reject(reason);
                });
        });
    }
}
