/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import { AntlrFacade } from "../backend/facade";
import {
    DocumentRangeFormattingEditProvider, TextDocument, FormattingOptions, CancellationToken, ProviderResult, TextEdit,
    Range, workspace
} from "vscode";

export class AntlrFormattingProvider implements DocumentRangeFormattingEditProvider {
    constructor(private backend: AntlrFacade) { }

    provideDocumentRangeFormattingEdits(document: TextDocument, range: Range, options: FormattingOptions,
        token: CancellationToken): ProviderResult<TextEdit[]> {

        let start = document.offsetAt(range.start);
        let end = document.offsetAt(range.end) - 1; // Make the end inclusive.

        let formatOptions = workspace.getConfiguration("antlr4.format");
        let text = "";
        [text, start, end] = this.backend.formatGrammarFast(document.fileName, document.getText(), Object.assign({}, formatOptions), start, end);
        let resultRange = range.with(document.positionAt(start), document.positionAt(end + 1));

        return [TextEdit.replace(resultRange, text)];
    }
};
