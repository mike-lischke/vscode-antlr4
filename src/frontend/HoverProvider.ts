/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { TextDocument, Position, CancellationToken, Hover, ProviderResult, HoverProvider } from "vscode";

import { AntlrFacade } from "../backend/facade";

import { symbolDescriptionFromEnum } from "./Symbol";

import * as path from "path";

export class AntlrHoverProvider implements HoverProvider {
    public constructor(private backend: AntlrFacade) { }

    public provideHover(document: TextDocument, position: Position, _token: CancellationToken): ProviderResult<Hover> {
        return new Promise((resolve, reject) => {
            this.backend.symbolInfoAtPosition(document.fileName, position.character, position.line + 1, true)
                .then((info) => {
                    if (!info) {
                        resolve(undefined);
                    } else {
                        const description = symbolDescriptionFromEnum(info.kind);

                        resolve(new Hover([
                            "**" + description + "**\ndefined in: " + path.basename(info.source),
                            { language: "antlr", value: (info.definition ? info.definition.text : "") },
                        ]));
                    }
                }).catch((reason) => {
                    reject(reason);
                });
        });
    }
}
