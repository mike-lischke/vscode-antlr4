/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

import { TextDocument, Position, CancellationToken, Range, Location, Uri, SymbolInformation } from 'vscode';
import { SymbolKind as vscSymbolKind, ProviderResult } from 'vscode';
import * as path from "path";

import { AntlrFacade, SymbolKind } from "../backend/facade";

import { symbolDescriptionFromEnum, translateSymbolKind } from './Symbol';

export class SymbolProvider {
    constructor(private backend: AntlrFacade) {}

    provideDocumentSymbols (document: TextDocument, token: CancellationToken): ProviderResult<SymbolInformation[]> {
        var symbols = this.backend.listSymbolsFast(document.fileName, document.getText(), false);

        let basePath = path.dirname(document.fileName);
        var symbolsList = [];
        for (let symbol of symbols) {
            if (!symbol.definition) {
                continue;
            }
            let startRow = symbol.definition.range.start.row > 0 ? symbol.definition.range.start.row - 1 : 0;
            let endRow = symbol.definition.range.end.row > 0 ? symbol.definition.range.end.row - 1 : 0;
            let range = new Range(startRow, symbol.definition.range.start.column, endRow, symbol.definition.range.end.column);
            let location = new Location(Uri.file(symbol.source), range);

            var description = symbolDescriptionFromEnum(symbol.kind);
            const kind = translateSymbolKind(symbol.kind);
            let totalTextLength = symbol.name.length + description.length + 1;
            if (symbol.kind == SymbolKind.LexerMode && totalTextLength < 80) {
                // Add a marker to show parts which belong to a particular lexer mode.
                // Not 100% perfect (i.e. right aligned, as symbol and description use different fonts), but good enough.
                var markerWidth = 80 - totalTextLength;
                description += " " + "-".repeat(markerWidth);
            }
            let info = new SymbolInformation(symbol.name, kind, description, location);
            symbolsList.push(info);
        }
        return symbolsList;
    };
};
