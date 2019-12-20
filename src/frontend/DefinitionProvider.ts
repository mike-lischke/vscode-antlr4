/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import {
    TextDocument, Position, CancellationToken, Range, Location, Uri, ProviderResult, DefinitionProvider
} from 'vscode';
import { AntlrFacade } from '../backend/facade';

export class AntlrDefinitionProvider implements DefinitionProvider {
    constructor(private backend: AntlrFacade) { }

    public provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Location> {
        let info = this.backend.symbolInfoAtPosition(document.fileName, position.character, position.line + 1, true);

        if (!info) {
            return undefined;
        }

        // VS code shows the text for the range given here on holding ctrl/cmd, which is rather
        // useless given that we show this info already in the hover provider. So, in order
        // to limit the amount of text we only pass on the smallest range which is possible.
        // Yet we need the correct start position to not break the goto-definition feature.
        if (info.definition) {
            let range = new Range(
                info.definition.range.start.row - 1, info.definition.range.start.column,
                info.definition.range.end.row - 1, info.definition.range.end.column
            );
            return new Location(Uri.file(info.source), range);
        } else {
            // Empty for built-in entities.
            let position = new Position(0, 0);
            return new Location(Uri.parse(""), position);
        }
    };
};
