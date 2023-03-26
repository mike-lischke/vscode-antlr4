/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

/* eslint-disable max-classes-per-file */

import {
    workspace, CodeLensProvider, TextDocument, CancellationToken, CodeLens, Range, EventEmitter, Event, ProviderResult,
} from "vscode";
import { AntlrFacade } from "../backend/facade";
import { ISymbolInfo, SymbolKind } from "../backend/types";

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
        return new Promise((resolve) => {
            if (workspace.getConfiguration("antlr4.referencesCodeLens").enabled !== true) {
                resolve(null);
            } else {
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
