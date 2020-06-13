/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2020 Mike Lischke
 *
 * See LICENSE file for more info.
 */

/* eslint-disable max-classes-per-file */

import {
    workspace, CodeLensProvider, TextDocument, CancellationToken, CodeLens, Range, EventEmitter, Event,
} from "vscode";
import { SymbolInfo, AntlrFacade, SymbolKind } from "../backend/facade";

class SymbolCodeLens extends CodeLens {
    public constructor(public symbol: SymbolInfo, range: Range) {
        super(range);
    }
}

export class AntlrCodeLensProvider implements CodeLensProvider {
    private changeEvent = new EventEmitter<void>();
    private documentName: string;

    public constructor(private backend: AntlrFacade) { }

    public get onDidChangeCodeLenses(): Event<void> {
        return this.changeEvent.event;
    }

    public refresh(): void {
        this.changeEvent.fire();
    }

    public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Thenable<CodeLens[]> {
        if (workspace.getConfiguration("antlr4.referencesCodeLens").enabled !== true) {
            return [];
        }

        this.documentName = document.fileName;
        const symbols = this.backend.listTopLevelSymbols(document.fileName, false);
        const lenses = [];
        for (const symbol of symbols) {
            if (!symbol.definition) {
                continue;
            }
            switch (symbol.kind) {
                case SymbolKind.FragmentLexerToken:
                case SymbolKind.LexerRule:
                case SymbolKind.LexerMode:
                case SymbolKind.ParserRule: {
                    const range = new Range(symbol.definition.range.start.row - 1, symbol.definition.range.start.column,
                        symbol.definition.range.end.row - 1, symbol.definition.range.end.column);
                    const lens = new SymbolCodeLens(symbol, range);
                    lenses.push(lens);
                }
                default:
                    break;
            }
        }

        return lenses;
    }

    public resolveCodeLens(codeLens: CodeLens, token: CancellationToken): CodeLens | Thenable<CodeLens> {
        const refs = this.backend.countReferences(this.documentName, (codeLens as SymbolCodeLens).symbol.name);
        codeLens.command = {
            title: (refs === 1) ? "1 reference" : refs + " references",
            command: "",
            arguments: undefined,
        };

        return codeLens;
    }
}
