'use strict'

const vscode = require("vscode");

/**
 * Provides a textual expression for a native symbol kind.
 */
exports.symbolDescriptionFromEnum = function(backend, kind) {
  // Could be localized.
  switch (kind) {
    case backend.SymbolKind.LexerToken:
      return "Lexer Token";
    case backend.SymbolKind.VirtualLexerToken:
      return "Virtual Lexer Token";
    case backend.SymbolKind.FragmentLexerToken:
      return "Fragment Lexer Token";
    case backend.SymbolKind.BuiltInLexerToken:
      return "Predefined Lexer Token";
    case backend.SymbolKind.ParserRule:
      return "Parser Rule";
    case backend.SymbolKind.LexerMode:
      return "Lexer Mode";
    case backend.SymbolKind.BuiltInMode:
      return "Predefined Lexer mode";
    case backend.SymbolKind.TokenChannel:
      return "Token Channel";
    case backend.SymbolKind.BuiltInChannel:
      return "Predefined Token Channel";
    case backend.SymbolKind.Import:
      return "Grammar Import";
    case backend.SymbolKind.TokenVocab:
      return "Token Vocabulary";

    default:
      return "Unknown type";
  }
};

/**
 * Converts the native symbol kind to a vscode symbol kind.
 */
exports.translateSymbolKind = function(backend, kind) {
  switch (kind) {
    case backend.SymbolKind.LexerToken:
      return vscode.SymbolKind.Function;
    case backend.SymbolKind.VirtualLexerToken:
      return vscode.SymbolKind.Enum;
    case backend.SymbolKind.FragmentLexerToken:
      return vscode.SymbolKind.Function;
    case backend.SymbolKind.BuiltInLexerToken:
      return vscode.SymbolKind.Property;
    case backend.SymbolKind.ParserRule:
      return vscode.SymbolKind.Method;
    case backend.SymbolKind.LexerMode:
      return vscode.SymbolKind.Variable;
    case backend.SymbolKind.BuiltInMode:
      return vscode.SymbolKind.Variable;
    case backend.SymbolKind.TokenChannel:
      return vscode.SymbolKind.Variable;
    case backend.SymbolKind.BuiltInChannel:
      return vscode.SymbolKind.Variable;
    case backend.SymbolKind.Import:
      return vscode.SymbolKind.Module;
    case backend.SymbolKind.TokenVocab:
      return vscode.SymbolKind.Module;

    default:
      return vscode.SymbolKind;
  }
}
