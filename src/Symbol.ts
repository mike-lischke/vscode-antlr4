/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict'

import * as vscode from 'vscode';
import * as graps from 'antlr4-graps';

/**
 * Provides a textual expression for a native symbol kind.
 */
export function symbolDescriptionFromEnum(kind: number): string { // TODO: graps.SymbolKind is not known here, fix that.
  // Could be localized.
  switch (kind) {
    case graps.SymbolKind.LexerToken:
      return "Lexer Token";
    case graps.SymbolKind.VirtualLexerToken:
      return "Virtual Lexer Token";
    case graps.SymbolKind.FragmentLexerToken:
      return "Fragment Lexer Token";
    case graps.SymbolKind.BuiltInLexerToken:
      return "Predefined Lexer Token";
    case graps.SymbolKind.ParserRule:
      return "Parser Rule";
    case graps.SymbolKind.LexerMode:
      return "Lexer Mode";
    case graps.SymbolKind.BuiltInMode:
      return "Predefined Lexer Mode";
    case graps.SymbolKind.TokenChannel:
      return "Token Channel";
    case graps.SymbolKind.BuiltInChannel:
      return "Predefined Token Channel";
    case graps.SymbolKind.Import:
      return "Grammar Import";
    case graps.SymbolKind.TokenVocab:
      return "Token Vocabulary";

    default:
      return "Unknown type";
  }
}

/**
 * Converts the native symbol kind to a vscode symbol kind.
 */
export function translateSymbolKind(kind: /* graps.SymbolKind */ number): vscode.SymbolKind { // TODO: same here
  switch (kind) {
    case graps.SymbolKind.LexerToken:
      return vscode.SymbolKind.Function;
    case graps.SymbolKind.VirtualLexerToken:
      return vscode.SymbolKind.Enum;
    case graps.SymbolKind.FragmentLexerToken:
      return vscode.SymbolKind.Function;
    case graps.SymbolKind.BuiltInLexerToken:
      return vscode.SymbolKind.Property;
    case graps.SymbolKind.ParserRule:
      return vscode.SymbolKind.Method;
    case graps.SymbolKind.LexerMode:
      return vscode.SymbolKind.Variable;
    case graps.SymbolKind.BuiltInMode:
      return vscode.SymbolKind.Variable;
    case graps.SymbolKind.TokenChannel:
      return vscode.SymbolKind.Variable;
    case graps.SymbolKind.BuiltInChannel:
      return vscode.SymbolKind.Variable;
    case graps.SymbolKind.Import:
      return vscode.SymbolKind.Module;
    case graps.SymbolKind.TokenVocab:
      return vscode.SymbolKind.Module;

    default:
      return vscode.SymbolKind.Null;
  }
}
