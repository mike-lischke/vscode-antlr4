/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2022 Mike Lischke
 *
 * See LICENSE file for more info.
 */

/* eslint-disable max-classes-per-file */

import {
    workspace, CodeLensProvider, TextDocument, CancellationToken, CodeLens, Range, EventEmitter, Event, ProviderResult,
} from "vscode";
import { ISymbolInfo, AntlrFacade, SymbolKind } from "../backend/facade";

class SymbolCodeLens extends CodeLens {
    public constructor(public symbol: ISymbolInfo, range: Range) {
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

    public provideCodeLenses(document: TextDocument, _token: CancellationToken): ProviderResult<CodeLens[]> {
        return new Promise((resolve, reject) => {
            if (workspace.getConfiguration("antlr4.referencesCodeLens").enabled !== true) {
                resolve(null);
            } else {
                this.documentName = document.fileName;
                this.backend.listTopLevelSymbols(document.fileName, false).then((symbols) => {
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
                                const range = new Range(
                                    symbol.definition.range.start.row - 1,
                                    symbol.definition.range.start.column,
                                    symbol.definition.range.end.row - 1,
                                    symbol.definition.range.end.column,
                                );
                                const lens = new SymbolCodeLens(symbol, range);
                                lenses.push(lens);

                                break;
                            }

                            default:
                        }
                    }

                    resolve(lenses);

                }).catch((reason) => {
                    reject(reason);
                });
            }

        });
    }

    public resolveCodeLens(codeLens: CodeLens, _token: CancellationToken): ProviderResult<CodeLens> {
        const refs = this.backend.countReferences(this.documentName, (codeLens as SymbolCodeLens).symbol.name);
        codeLens.command = {
            title: (refs === 1) ? "1 reference" : `${refs} references`,
            command: "",
            arguments: undefined,
        };

        return codeLens;
    }
}
