/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as vscode from "vscode";
import { SymbolKind } from "../backend/facade";

/**
 * Provides a textual expression for a native symbol kind.
 *
 * @param kind The kind of symbol for which a description is needed.
 *
 * @returns The description.
 */
export const symbolDescriptionFromEnum = (kind: SymbolKind): string => {
    // Could be localized.
    switch (kind) {
        case SymbolKind.LexerRule: {
            return "Lexer Token";
        }
        case SymbolKind.VirtualLexerToken: {
            return "Virtual Lexer Token";
        }
        case SymbolKind.FragmentLexerToken: {
            return "Fragment Lexer Token";
        }
        case SymbolKind.BuiltInLexerToken: {
            return "Predefined Lexer Token";
        }
        case SymbolKind.ParserRule: {
            return "Parser Rule";
        }
        case SymbolKind.LexerMode: {
            return "Lexer Mode";
        }
        case SymbolKind.BuiltInMode: {
            return "Predefined Lexer Mode";
        }
        case SymbolKind.TokenChannel: {
            return "Token Channel";
        }
        case SymbolKind.BuiltInChannel: {
            return "Predefined Token Channel";
        }
        case SymbolKind.Import: {
            return "Grammar Import";
        }
        case SymbolKind.TokenVocab: {
            return "Token Vocabulary";
        }

        default: {
            return "Unknown type";
        }
    }
};

/**
 * Converts the native symbol kind to a vscode symbol kind.
 *
 * @param kind The kind of symbol for which the vscode kind is needed.
 *
 * @returns The vscode symbol kind for the given ANTLR4 kind.
 */
export const translateSymbolKind = (kind: SymbolKind): vscode.SymbolKind => {
    switch (kind) {
        case SymbolKind.LexerRule: {
            return vscode.SymbolKind.Function;
        }
        case SymbolKind.VirtualLexerToken: {
            return vscode.SymbolKind.Enum;
        }
        case SymbolKind.FragmentLexerToken: {
            return vscode.SymbolKind.Function;
        }
        case SymbolKind.BuiltInLexerToken: {
            return vscode.SymbolKind.Property;
        }
        case SymbolKind.ParserRule: {
            return vscode.SymbolKind.Method;
        }
        case SymbolKind.LexerMode: {
            return vscode.SymbolKind.Variable;
        }
        case SymbolKind.BuiltInMode: {
            return vscode.SymbolKind.Variable;
        }
        case SymbolKind.TokenChannel: {
            return vscode.SymbolKind.Variable;
        }
        case SymbolKind.BuiltInChannel: {
            return vscode.SymbolKind.Variable;
        }
        case SymbolKind.Import: {
            return vscode.SymbolKind.Module;
        }
        case SymbolKind.TokenVocab: {
            return vscode.SymbolKind.Module;
        }

        default: {
            return vscode.SymbolKind.Null;
        }
    }
};

/**
 * Converts the native symbol kind to a vscode completion item kind.
 *
 * @param kind The kind of symbol for which return the completion item kind.
 *
 * @returns The vscode completion item kind.
 */
export const translateCompletionKind = (kind: SymbolKind): vscode.CompletionItemKind => {
    switch (kind) {
        case SymbolKind.Keyword: {
            return vscode.CompletionItemKind.Keyword;
        }

        case SymbolKind.LexerRule: {
            return vscode.CompletionItemKind.Text;
        }
        case SymbolKind.VirtualLexerToken: {
            return vscode.CompletionItemKind.Text;
        }
        case SymbolKind.FragmentLexerToken: {
            return vscode.CompletionItemKind.Text;
        }
        case SymbolKind.BuiltInLexerToken: {
            return vscode.CompletionItemKind.Constant;
        }

        case SymbolKind.ParserRule: {
            return vscode.CompletionItemKind.Method;
        }
        case SymbolKind.LexerMode: {
            return vscode.CompletionItemKind.Enum;
        }
        case SymbolKind.BuiltInMode: {
            return vscode.CompletionItemKind.Constant;
        }
        case SymbolKind.TokenChannel: {
            return vscode.CompletionItemKind.Property;
        }
        case SymbolKind.BuiltInChannel: {
            return vscode.CompletionItemKind.Constant;
        }
        case SymbolKind.Import: {
            return vscode.CompletionItemKind.Module;
        }
        case SymbolKind.TokenVocab: {
            return vscode.CompletionItemKind.Module;
        }

        case SymbolKind.Action:
        case SymbolKind.Predicate: {
            return vscode.CompletionItemKind.Snippet;
        }

        default: {
            return vscode.CompletionItemKind.Text;
        }
    }
};
