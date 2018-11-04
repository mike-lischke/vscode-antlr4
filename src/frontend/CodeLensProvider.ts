/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import { workspace, CodeLensProvider, TextDocument, CancellationToken, CodeLens, Range, Command, EventEmitter, Event } from "vscode";
import { SymbolInfo, AntlrFacade, SymbolKind } from "../backend/facade";

class SymbolCodeLens extends CodeLens {
    constructor(public symbol: SymbolInfo, range: Range) {
        super(range);
    }
};


export class AntlrCodeLensProvider implements CodeLensProvider {    
    // from https://github.com/eamodio/vscode-gitlens/blob/806a9f312be3f034ba052a573ed400709a9b6cb3/src/codelens/gitCodeLensProvider.ts#L81-L100
    private _onDidChangeCodeLenses = new EventEmitter<void>();
    public get onDidChangeCodeLenses(): Event<void> {
        return this._onDidChangeCodeLenses.event;
    }
    
    constructor(private backend: AntlrFacade) { }

    public reset(reason?: 'idle' | 'saved') {
        this._onDidChangeCodeLenses.fire();
    }

    public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Thenable<CodeLens[]> {
        if (workspace.getConfiguration("antlr4.referencesCodeLens")["enabled"] !== true) {
            return [];
        }

        this.documentName = document.fileName;
        let symbols = this.backend.listSymbols(document.fileName, false);
        var lenses = [];
        for (let symbol of symbols) {
            if (!symbol.definition) {
                continue;
            }
            switch (symbol.kind) {
                case SymbolKind.FragmentLexerToken:
                case SymbolKind.LexerToken:
                case SymbolKind.LexerMode:
                case SymbolKind.ParserRule: {
                    let range = new Range(symbol.definition.range.start.row - 1, symbol.definition.range.start.column,
                        symbol.definition.range.end.row - 1, symbol.definition.range.end.column);
                    let lens = new SymbolCodeLens(symbol, range);
                    lenses.push(lens);
                }
                default:
                    break;
            }
        }
        return lenses;
    }

    public resolveCodeLens(codeLens: CodeLens, token: CancellationToken): CodeLens | Thenable<CodeLens> {
        let refs = this.backend.countReferences(this.documentName, (codeLens as SymbolCodeLens).symbol.name);
        codeLens.command = {
            title: refs + " references",
            command: "",
            arguments: undefined
        };
        return codeLens;
    }

    private documentName: string;
};
