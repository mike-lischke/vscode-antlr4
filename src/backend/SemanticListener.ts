/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { SymbolGroupKind, DiagnosticEntry, DiagnosticType } from "./facade";
import { ContextSymbolTable, TokenSymbol, RuleSymbol } from "./ContextSymbolTable";
import { ANTLRv4ParserListener } from "../parser/ANTLRv4ParserListener";
import {
    TerminalRuleContext, RulerefContext, SetElementContext, LexerCommandContext, LexerRuleSpecContext,
    ParserRuleSpecContext,
} from "../parser/ANTLRv4Parser";

import { Token, ParserRuleContext } from "antlr4ts";
import { TerminalNode } from "antlr4ts/tree";

export class SemanticListener implements ANTLRv4ParserListener {

    private seenSymbols = new Map<string, Token>();

    public constructor(private diagnostics: DiagnosticEntry[], private symbolTable: ContextSymbolTable) { }

    // Check references to other lexer tokens.
    public exitTerminalRule = (ctx: TerminalRuleContext): void => {
        const tokenRef = ctx.TOKEN_REF();
        if (tokenRef) {
            const symbol = tokenRef.text;
            this.checkSymbolExistance(true, SymbolGroupKind.TokenRef, symbol, "Unknown token reference",
                tokenRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };

    // Check references to other parser rules.
    public exitRuleref = (ctx: RulerefContext): void => {
        const ruleRef = ctx.RULE_REF();
        if (ruleRef) {
            const symbol = ruleRef.text;
            this.checkSymbolExistance(true, SymbolGroupKind.RuleRef, symbol, "Unknown parser rule", ruleRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };

    // Check references to other lexer tokens.
    public exitSetElement = (ctx: SetElementContext): void => {
        const tokenRef = ctx.TOKEN_REF();
        if (tokenRef) {
            const symbol = tokenRef.text;
            this.checkSymbolExistance(true, SymbolGroupKind.TokenRef, symbol, "Unknown token reference",
                tokenRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };

    // Check references to modes + channels in lexer actions.
    public exitLexerCommand = (ctx: LexerCommandContext): void => {
        const lexerCommandExpr = ctx.lexerCommandExpr();
        const lexerCommandExprId = lexerCommandExpr ? lexerCommandExpr.identifier() : undefined;
        if (lexerCommandExprId) {
            let name = ctx.lexerCommandName().text;
            let kind = SymbolGroupKind.TokenRef;

            const value = name.toLowerCase();
            if (value === "pushmode" || value === "mode") {
                name = "mode";
                kind = SymbolGroupKind.LexerMode;
            } else if (value === "channel") {
                kind = SymbolGroupKind.TokenChannel;
            }
            const symbol = lexerCommandExprId.text;
            this.checkSymbolExistance(true, kind, symbol, "Unknown " + name, lexerCommandExprId.start);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };

    // Check definition of a lexer token.
    public exitLexerRuleSpec = (ctx: LexerRuleSpecContext): void => {
        const tokenRef = ctx.TOKEN_REF();
        const name = tokenRef.text;

        // The symbol table already contains an entry for this symbol. So we can only partially use that
        // for duplicate checks. `seenSymbols` tracks occurrences for symbols in the main symbol table.
        const seenSymbol = this.seenSymbols.get(name);
        if (seenSymbol) {
            this.reportDuplicateSymbol(name, tokenRef.symbol, seenSymbol);
        } else {
            // Check if there are dependencies which already have this symbol, expressed by the fact
            // that the found symbol is not defined in the main symbol table.
            const symbol = this.symbolTable.resolve(name) as TokenSymbol;
            if (symbol.root !== this.symbolTable) {
                const start = symbol.context instanceof ParserRuleContext ?
                    symbol.context.start : (symbol.context as TerminalNode).symbol;
                this.reportDuplicateSymbol(name, tokenRef.symbol, symbol.context ? start : undefined);
            } else {
                // Otherwise we haven't come across this symbol yet.
                this.seenSymbols.set(name, tokenRef.symbol);
            }
        }
    };

    // Check definition of a parser rule.
    public exitParserRuleSpec = (ctx: ParserRuleSpecContext): void => {
        // Same processing here as for lexer rules.
        const ruleRef = ctx.RULE_REF();
        const name = ruleRef.text;
        const seenSymbol = this.seenSymbols.get(name);
        if (seenSymbol) {
            this.reportDuplicateSymbol(name, ruleRef.symbol, seenSymbol);
        } else {
            const symbol = this.symbolTable.resolve(name) as RuleSymbol;
            if (symbol.root !== this.symbolTable) {
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
    };

    protected checkSymbolExistance(mustExist: boolean, kind: SymbolGroupKind, symbol: string, message: string,
        offendingToken: Token): void {
        if (this.symbolTable.symbolExistsInGroup(symbol, kind, false) !== mustExist) {
            const entry: DiagnosticEntry = {
                type: DiagnosticType.Error,
                message: message + " '" + symbol + "'",
                range: {
                    start: {
                        column: offendingToken.charPositionInLine,
                        row: offendingToken.line,
                    },
                    end: {
                        column: offendingToken.charPositionInLine + offendingToken.stopIndex -
                            offendingToken.startIndex + 1,
                        row: offendingToken.line,
                    },
                },
            };
            this.diagnostics.push(entry);
        }
    }

    protected reportDuplicateSymbol(symbol: string, offendingToken: Token, previousToken: Token | undefined): void {
        const entry: DiagnosticEntry = {
            type: DiagnosticType.Error,
            message: "Duplicate symbol '" + symbol + "'",
            range: {
                start: {
                    column: offendingToken.charPositionInLine,
                    row: offendingToken.line,
                },
                end: {
                    column: offendingToken.charPositionInLine + offendingToken.stopIndex -
                        offendingToken.startIndex + 1,
                    row: offendingToken.line,
                },
            },
        };
        this.diagnostics.push(entry);
    }
}
