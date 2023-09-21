/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { TextDocument, Position, CancellationToken, Hover, ProviderResult, HoverProvider } from "vscode";

import { AntlrFacade } from "../backend/facade.js";

import { symbolDescriptionFromEnum } from "./Symbol.js";

import * as path from "path";

export class AntlrHoverProvider implements HoverProvider {
    public constructor(private backend: AntlrFacade) { }

    public provideHover(document: TextDocument, position: Position, _token: CancellationToken): ProviderResult<Hover> {
        return new Promise((resolve) => {
            const info = this.backend.symbolInfoAtPosition(document.fileName, position.character, position.line + 1,
                true);
            if (!info) {
                resolve(undefined);
            } else {
                const description = symbolDescriptionFromEnum(info.kind);

                resolve(new Hover([
                    "**" + description + "**\ndefined in: " + path.basename(info.source),
                    { language: "antlr", value: (info.definition ? info.definition.text : "") },
                ]));
            }
        });
    }
}
