/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

import { TextDocument, Position, CancellationToken, Range, Location, Uri, SymbolInformation } from 'vscode';
import { SymbolKind as vscSymbolKind } from 'vscode';
import * as path from "path";

import { AntlrLanguageSupport, SymbolKind } from 'antlr4-graps';

import { symbolDescriptionFromEnum, translateSymbolKind } from './Symbol';

export class SymbolProvider {
    constructor(private backend: AntlrLanguageSupport) {}

    provideDocumentSymbols (document: TextDocument, token: CancellationToken) {
        var symbols = this.backend.listSymbols(document.fileName, false);

        return new Promise(function (resolve, reject) {
            let basePath = path.dirname(document.fileName);
            var symbolsList = [];
            for (let symbol of symbols) {
                let start = symbol.definition.start.row > 0 ? symbol.definition.start.row - 1 : 0;
                let stop = symbol.definition.end.row > 0 ? symbol.definition.end.row - 1 : 0;
                let range = new Range(start, symbol.definition.start.column, stop, symbol.definition.end.column + 1);
                let location = new Location(Uri.file(basePath + "/" + symbol.source), range);

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
            resolve(symbolsList);
        });
    };
};
