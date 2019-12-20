/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { SymbolGroupKind, SymbolKind, DiagnosticEntry, DiagnosticType } from './facade';
import { ContextSymbolTable, TokenSymbol, RuleSymbol } from './ContextSymbolTable';
import { ANTLRv4ParserListener } from '../parser/ANTLRv4ParserListener';
import {
    TerminalRuleContext, RulerefContext, SetElementContext, LexerCommandContext, LexerRuleSpecContext,
    ParserRuleSpecContext, ActionBlockContext
} from '../parser/ANTLRv4Parser';

import { Token, ParserRuleContext } from 'antlr4ts';
import { TerminalNode } from 'antlr4ts/tree';

export class SemanticListener implements ANTLRv4ParserListener {
    constructor(private diagnostics: DiagnosticEntry[], private symbolTable: ContextSymbolTable) { }

    // Check references to other lexer tokens.
    exitTerminalRule = function(ctx: TerminalRuleContext) {
        let tokenRef = ctx.TOKEN_REF();
        if (tokenRef) {
            let symbol = tokenRef.text;
            this.checkSymbolExistance(true, SymbolGroupKind.TokenRef, symbol, "Unknown token reference", tokenRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    }

    // Check references to other parser rules.
    exitRuleref = function(ctx: RulerefContext) {
        let ruleRef = ctx.RULE_REF();
        if (ruleRef) {
            let symbol = ruleRef.text;
            this.checkSymbolExistance(true, SymbolGroupKind.RuleRef, symbol, "Unknown parser rule", ruleRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    }

    // Check references to other lexer tokens.
    exitSetElement = function(ctx: SetElementContext) {
        let tokenRef = ctx.TOKEN_REF();
        if (tokenRef) {
            let symbol = tokenRef.text;
            this.checkSymbolExistance(true, SymbolGroupKind.TokenRef, symbol, "Unknown token reference", tokenRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    }

    // Check references to modes + channels in lexer actions.
    exitLexerCommand = function(ctx: LexerCommandContext) {
        let lexerCommandExpr = ctx.lexerCommandExpr();
        let lexerCommandExprId = lexerCommandExpr ? lexerCommandExpr.identifier() : undefined;
        if (lexerCommandExprId) {
            let name = ctx.lexerCommandName().text;
            let kind = SymbolGroupKind.TokenRef;

            let value = name.toLowerCase();
            if (value == "pushmode" || value == "mode") {
                name = "mode";
                kind = SymbolGroupKind.LexerMode;
            } else if (value == "channel") {
                kind = SymbolGroupKind.TokenChannel;
            }
            let symbol = lexerCommandExprId.text;
            this.checkSymbolExistance(true, kind, symbol, "Unknown " + name, lexerCommandExprId.start);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    }

    // Check definition of a lexer token.
    exitLexerRuleSpec = function(ctx: LexerRuleSpecContext) {
        let tokenRef = ctx.TOKEN_REF();
        let name = tokenRef.text;

        // The symbol table already contains an entry for this symbol. So we can only partially use that
        // for duplicate checks. `seenSymbols` tracks occurrences for symbols in the main symbol table.
        let seenSymbol = this.seenSymbols.get(name);
        if (seenSymbol) {
            this.reportDuplicateSymbol(name, tokenRef.symbol, seenSymbol);
        } else {
            // Check if there are dependencies which already have this symbol, expressed by the fact
            // that the found symbol is not defined in the main symbol table.
            let symbol = this.symbolTable.resolve(name) as TokenSymbol;
            if (symbol.root != this.symbolTable) {
                let start = symbol.context instanceof ParserRuleContext ?
                    symbol.context.start : (symbol.context as TerminalNode).symbol;
                this.reportDuplicateSymbol(name, tokenRef.symbol, symbol.context ? start : undefined);
            } else {
                // Otherwise we haven't come across this symbol yet.
                this.seenSymbols.set(name, tokenRef.symbol);
            }
        }
    }

    // Check definition of a parser rule.
    exitParserRuleSpec = function(ctx: ParserRuleSpecContext) {
        // Same processing here as for lexer rules.
        let ruleRef = ctx.RULE_REF();
        let name = ruleRef.text;
        let seenSymbol = this.seenSymbols.get(name);
        if (seenSymbol) {
            this.reportDuplicateSymbol(name, ruleRef.symbol, seenSymbol);
        } else {
            let symbol = this.symbolTable.resolve(name) as RuleSymbol;
            if (symbol.root != this.symbolTable) {
                let start;
                if (symbol.context instanceof ParserRuleContext) {
                    start = symbol.context.start;
                } else if (symbol.context instanceof TerminalNode) {
                    start = symbol.context.symbol;
                }
                this.reportDuplicateSymbol(name, ruleRef.symbol, start);
            } else {
                this.seenSymbols.set(name, ruleRef.symbol);
            }
        }
    }

    protected checkSymbolExistance(mustExist: boolean, kind: SymbolGroupKind, symbol: string, message: string, offendingToken: Token) {
        if (this.symbolTable.symbolExistsInGroup(symbol, kind, false) != mustExist) {
            let entry: DiagnosticEntry = {
                type: DiagnosticType.Error,
                message: message + " '" + symbol + "'",
                range: {
                    start: {
                        column: offendingToken.charPositionInLine,
                        row: offendingToken.line
                    },
                    end: {
                        column: offendingToken.charPositionInLine + offendingToken.stopIndex - offendingToken.startIndex + 1,
                        row: offendingToken.line
                    }
                }
            }
            this.diagnostics.push(entry);
        }
    }

    protected reportDuplicateSymbol(symbol: string, offendingToken: Token, previousToken: Token | undefined) {
        let entry: DiagnosticEntry = {
            type: DiagnosticType.Error,
            message: "Duplicate symbol '" + symbol + "'",
            range: {
                start: {
                    column: offendingToken.charPositionInLine,
                    row: offendingToken.line
                },
                end: {
                    column: offendingToken.charPositionInLine + offendingToken.stopIndex - offendingToken.startIndex + 1,
                    row: offendingToken.line
                }
            }
        }
        this.diagnostics.push(entry);
    }

    private seenSymbols: Map<string, Token> = new Map();
}
