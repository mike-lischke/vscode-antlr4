/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { AntlrFacade } from "../backend/facade";
import {
    DocumentRangeFormattingEditProvider, TextDocument, FormattingOptions, CancellationToken, ProviderResult, TextEdit,
    Range, workspace,
} from "vscode";

export class AntlrFormattingProvider implements DocumentRangeFormattingEditProvider {
    public constructor(private backend: AntlrFacade) { }

    public provideDocumentRangeFormattingEdits(document: TextDocument, range: Range, _options: FormattingOptions,
        _token: CancellationToken): ProviderResult<TextEdit[]> {

        let start = document.offsetAt(range.start);
        let end = document.offsetAt(range.end) - 1; // Make the end inclusive.

        const formatOptions = workspace.getConfiguration("antlr4.format");
        let text = "";
        [text, start, end] = this.backend.formatGrammar(document.fileName, Object.assign({}, formatOptions), start,
            end);
        const resultRange = range.with(document.positionAt(start), document.positionAt(end + 1));

        return [TextEdit.replace(resultRange, text)];
    }
}
