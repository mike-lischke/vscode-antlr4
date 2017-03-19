/*
 * This file is released under the MIT license.
 * Copyright (c) 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

import { TextDocument, Position, CancellationToken, Location, CompletionItem, CompletionItemKind } from 'vscode';

import { AntlrLanguageSupport } from "antlr4-graps";

import { translateCompletionKind } from '../src/Symbol';

export class AntlrCompletionItemProvider {
    constructor(private backend: AntlrLanguageSupport) { }

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken) {

        let candidates = this.backend.getCodeCompletionCandidates(document.fileName, position.character, position.line + 1);

        return new Promise(function (resolve, reject) {
            let completionList: CompletionItem[] = [];

            candidates.forEach((info) => {
                let kind: CompletionItemKind;
                completionList.push(new CompletionItem(info.name, translateCompletionKind(info.kind)));
            });

            resolve(completionList);
        });
    };
}
