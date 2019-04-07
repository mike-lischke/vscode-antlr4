/*
 * This file is released under the MIT license.
 * Copyright (c) 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { TextDocument, Position, Location, CancellationToken, Range, Uri, ProviderResult, ReferenceProvider, ReferenceContext } from 'vscode';
import { AntlrFacade } from '../backend/facade';

export class AntlrReferenceProvider implements ReferenceProvider {
    constructor(private backend: AntlrFacade) { }

    public provideReferences(document: TextDocument, position: Position, context: ReferenceContext,
        token: CancellationToken): ProviderResult<Location[]> {
            let info = this.backend.symbolInfoAtPosition(document.fileName, position.character, position.line + 1, false);

            if (!info) {
                return undefined;
            }

            let result: Location[] = [];
            let occurences = this.backend.getSymbolOccurences(document.fileName, info.name);
            for (let symbol of occurences) {
                if (symbol.definition) {
                    let range = new Range(
                        symbol.definition.range.start.row - 1, symbol.definition.range.start.column,
                        symbol.definition.range.end.row - 1, symbol.definition.range.start.column + info.name.length
                    );
                    let location = new Location(Uri.file(symbol.source), range);
                    result.push(location);
                }
            }

            return result;
        }
};
