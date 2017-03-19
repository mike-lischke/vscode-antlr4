/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

import { TextDocument, Position, CancellationToken, Range, Location, Uri, Hover } from 'vscode';

import { AntlrLanguageSupport } from "antlr4-graps";

import { symbolDescriptionFromEnum } from '../src/Symbol';

export class HoverProvider {
    constructor(private backend: AntlrLanguageSupport) { }

    public provideHover(document: TextDocument, position: Position, token: CancellationToken) {
        var info = this.backend.infoForSymbol(document.fileName, position.character, position.line + 1);

        return new Promise(function (resolve, reject) {
            if (!info)
                resolve();
            else {
                const description = symbolDescriptionFromEnum(info.kind);
                resolve(new Hover([
                    "**" + description + "**\ndefined in: " + info.source,
                    { language: "antlr", value: (info.definition? info.definition.text : "") }
                ]));
            }
        });
    };
}
