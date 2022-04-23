/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import {
    TextDocument, Position, CancellationToken, Range, Uri, ProviderResult, WorkspaceEdit, RenameProvider,
} from "vscode";
import { AntlrFacade } from "../backend/facade";

export class AntlrRenameProvider implements RenameProvider {
    public constructor(private backend: AntlrFacade) { }

    public provideRenameEdits(document: TextDocument, position: Position, newName: string,
        _token: CancellationToken): ProviderResult<WorkspaceEdit> {

        return new Promise((resolve) => {
            const info = this.backend.symbolInfoAtPosition(document.fileName, position.character, position.line + 1,
                false);

            if (info) {
                const result = new WorkspaceEdit();
                const occurrences = this.backend.getSymbolOccurrences(document.fileName, info.name);
                for (const symbol of occurrences) {
                    if (symbol.definition) {
                        const range = new Range(
                            symbol.definition.range.start.row - 1,
                            symbol.definition.range.start.column,
                            symbol.definition.range.end.row - 1,
                            symbol.definition.range.start.column + info.name.length,
                        );
                        result.replace(Uri.file(symbol.source), range, newName);
                    }
                }
                resolve(result);
            } else {
                resolve(undefined);
            }

        });
    }
}
