/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

import { TextDocument, Position, CancellationToken, Range, Location, Uri } from 'vscode';
import * as path from "path";

import { AntlrLanguageSupport } from 'antlr4-graps';

export class DefinitionProvider {
    constructor(private backend: AntlrLanguageSupport) { }

    public provideDefinition(document: TextDocument, position: Position, token: CancellationToken) {
        let info = this.backend.infoForSymbol(document.fileName, position.character, position.line + 1);

        return new Promise(function (resolve, reject) {
            if (!info)
                resolve();
            else {
                let basePath = path.dirname(document.fileName);
                // VS code shows the text for the range given here on holding ctrl/cmd, which is rather
                // useless given that we show this info already in the hover provider. So, in order
                // to limit the amount of text we only pass on the smallest range which is possible.
                // Yet we need the correct start position to not break the goto-definition feature.
                if (info.definition) {
                    let position = new Position(info.definition.start.row - 1, info.definition.start.column);
                    resolve(new Location(Uri.file(basePath + "/" + info.source), position));
                } else {
                    // Empty for built-in entities.
                    let position = new Position(0, 0);
                    resolve(new Location(undefined, position));
                }
            }
        });
    };
};
