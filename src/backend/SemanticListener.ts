/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Token, ParserRuleContext, TerminalNode } from "antlr4ng";

import { IDiagnosticEntry, DiagnosticType, SymbolGroupKind } from "../types.js";
import { ContextSymbolTable } from "./ContextSymbolTable.js";
import { ANTLRv4ParserListener } from "../parser/ANTLRv4ParserListener.js";
import {
    TerminalDefContext, RulerefContext, SetElementContext, LexerCommandContext, LexerRuleSpecContext,
    ParserRuleSpecContext,
} from "../parser/ANTLRv4Parser.js";


export class SemanticListener extends ANTLRv4ParserListener {

    private seenSymbols = new Map<string, Token>();

    public constructor(private diagnostics: IDiagnosticEntry[], private symbolTable: ContextSymbolTable) {
        super();
    }

    // Check references to other lexer tokens.
    public override exitTerminalDef = (ctx: TerminalDefContext): void => {
        const tokenRef = ctx.TOKEN_REF();
        if (tokenRef) {
            const symbol = tokenRef.getText();
            this.checkSymbolExistence(true, SymbolGroupKind.TokenRef, symbol, "Unknown token reference",
                tokenRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };

    // Check references to other parser rules.
    public override exitRuleref = (ctx: RulerefContext): void => {
        const ruleRef = ctx.RULE_REF();
        if (ruleRef) {
            const symbol = ruleRef.getText();
            this.checkSymbolExistence(true, SymbolGroupKind.RuleRef, symbol, "Unknown parser rule", ruleRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };

    // Check references to other lexer tokens.
    public override exitSetElement = (ctx: SetElementContext): void => {
        const tokenRef = ctx.TOKEN_REF();
        if (tokenRef) {
            const symbol = tokenRef.getText();
            this.checkSymbolExistence(true, SymbolGroupKind.TokenRef, symbol, "Unknown token reference",
                tokenRef.symbol);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };

    // Check references to modes + channels in lexer actions.
    public override exitLexerCommand = (ctx: LexerCommandContext): void => {
        const lexerCommandExpr = ctx.lexerCommandExpr();
        const lexerCommandExprId = lexerCommandExpr ? lexerCommandExpr.identifier() : undefined;
        if (lexerCommandExprId) {
            let name = ctx.lexerCommandName().getText();
            let kind = SymbolGroupKind.TokenRef;

            const value = name.toLowerCase();
            if (value === "pushmode" || value === "mode") {
                name = "mode";
                kind = SymbolGroupKind.LexerMode;
            } else if (value === "channel") {
                kind = SymbolGroupKind.TokenChannel;
            }
            const symbol = lexerCommandExprId.getText();
            this.checkSymbolExistence(true, kind, symbol, "Unknown " + name, lexerCommandExprId.start!);
            this.symbolTable.incrementSymbolRefCount(symbol);
        }
    };

    // Check definition of a lexer token.
    public override exitLexerRuleSpec = (ctx: LexerRuleSpecContext): void => {
        const tokenRef = ctx.TOKEN_REF()!;
        const name = tokenRef.getText();

        // The symbol table already contains an entry for this symbol. So we can only partially use that
        // for duplicate checks. `seenSymbols` tracks occurrences for symbols in the main symbol table.
        const seenSymbol = this.seenSymbols.get(name);
        if (seenSymbol) {
            this.reportDuplicateSymbol(name, tokenRef.symbol, seenSymbol);
        } else {
            // Otherwise we haven't come across this symbol yet.
            this.seenSymbols.set(name, tokenRef.symbol);
            void this.resolveAndReportDuplicate(name, tokenRef);
        }
    };

    // Check definition of a parser rule.
    public override exitParserRuleSpec = (ctx: ParserRuleSpecContext): void => {
        // Same processing here as for lexer rules.
        const ruleRef = ctx.RULE_REF()!;
        const name = ruleRef.getText();
        const seenSymbol = this.seenSymbols.get(name);
        if (seenSymbol) {
            this.reportDuplicateSymbol(name, ruleRef.symbol, seenSymbol);
        } else {
            this.seenSymbols.set(name, ruleRef.symbol);
            void this.resolveAndReportDuplicate(name, ruleRef);
        }
    };

    protected checkSymbolExistence(mustExist: boolean, kind: SymbolGroupKind, symbol: string, message: string,
        offendingToken: Token): void {
        if (this.symbolTable.symbolExistsInGroup(symbol, kind, false) !== mustExist) {
            const entry: IDiagnosticEntry = {
                type: DiagnosticType.Error,
                message: message + " '" + symbol + "'",
                range: {
                    start: {
                        column: offendingToken.column,
                        row: offendingToken.line,
                    },
                    end: {
                        column: offendingToken.column + offendingToken.stop -
                            offendingToken.start + 1,
                        row: offendingToken.line,
                    },
                },
            };
            this.diagnostics.push(entry);
        }
    }

    protected reportDuplicateSymbol(symbol: string, offendingToken: Token, _previousToken: Token | undefined): void {
        const entry: IDiagnosticEntry = {
            type: DiagnosticType.Error,
            message: "Duplicate symbol '" + symbol + "'",
            range: {
                start: {
                    column: offendingToken.column,
                    row: offendingToken.line,
                },
                end: {
                    column: offendingToken.column + offendingToken.stop -
                        offendingToken.start + 1,
                    row: offendingToken.line,
                },
            },
        };
        this.diagnostics.push(entry);
    }

    private async resolveAndReportDuplicate(name: string, ruleRef: TerminalNode): Promise<void> {
        // Check if there are dependencies which already have this symbol, expressed by the fact
        // that the found symbol is not defined in the main symbol table.
        const symbol = await this.symbolTable.resolve(name);
        if (symbol) {
            if (symbol.root !== this.symbolTable) {
                let start: Token | null = null;
                if (symbol.context instanceof ParserRuleContext) {
                    start = symbol.context.start;
                } else if (symbol.context instanceof TerminalNode) {
                    start = symbol.context.symbol;
                }
                this.reportDuplicateSymbol(name, ruleRef.symbol, start ?? undefined);
            }
        }

    }
}
