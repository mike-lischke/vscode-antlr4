/*
 * This file is released under the MIT license.
 * Copyright (c) 2019, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import {
    TextDocument, Position, Location, CancellationToken, Range, Uri, ProviderResult, ReferenceProvider,
    ReferenceContext,
} from "vscode";

import { AntlrFacade } from "../backend/facade";

export class AntlrReferenceProvider implements ReferenceProvider {
    public constructor(private backend: AntlrFacade) { }

    public provideReferences(document: TextDocument, position: Position, _context: ReferenceContext,
        _token: CancellationToken): ProviderResult<Location[]> {
        return new Promise((resolve) => {
            const info = this.backend.symbolInfoAtPosition(document.fileName, position.character, position.line + 1,
                false);

            const result: Location[] = [];
            if (info) {
                const occurrences = this.backend.getSymbolOccurrences(document.fileName, info.name);
                for (const symbol of occurrences) {
                    if (symbol.definition) {
                        const range = new Range(
                            symbol.definition.range.start.row - 1,
                            symbol.definition.range.start.column,
                            symbol.definition.range.end.row - 1,
                            symbol.definition.range.start.column + info.name.length,
                        );
                        const location = new Location(Uri.file(symbol.source), range);
                        result.push(location);
                    }
                }

                resolve(result);
            }
        });
    }
}
