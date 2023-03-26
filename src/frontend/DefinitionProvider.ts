/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
    TextDocument, Position, CancellationToken, Range, Location, Uri, ProviderResult, DefinitionProvider,
} from "vscode";
import { AntlrFacade } from "../backend/facade";

export class AntlrDefinitionProvider implements DefinitionProvider {
    public constructor(private backend: AntlrFacade) { }

    public provideDefinition(document: TextDocument, position: Position,
        _token: CancellationToken): ProviderResult<Location> {
        return new Promise((resolve) => {
            const info = this.backend.symbolInfoAtPosition(document.fileName, position.character, position.line + 1,
                true);

            if (!info) {
                resolve(null);
            } else {
                // VS code shows the text for the range given here on holding ctrl/cmd, which is rather
                // useless given that we show this info already in the hover provider. So, in order
                // to limit the amount of text we only pass on the smallest range which is possible.
                // Yet we need the correct start position to not break the goto-definition feature.
                if (info.definition) {
                    const range = new Range(
                        info.definition.range.start.row - 1,
                        info.definition.range.start.column,
                        info.definition.range.end.row - 1,
                        info.definition.range.end.column,
                    );

                    resolve(new Location(Uri.file(info.source), range));
                } else {
                    // Empty for built-in entities.
                    resolve(new Location(Uri.parse(""), new Position(0, 0)));
                }
            }
        });
    }
}
