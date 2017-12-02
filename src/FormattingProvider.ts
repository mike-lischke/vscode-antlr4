/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import { AntlrLanguageSupport } from "antlr4-graps";
import {
    DocumentRangeFormattingEditProvider, TextDocument, FormattingOptions, CancellationToken, ProviderResult, TextEdit,
    Range, workspace
} from "vscode";

export class AntlrFormattingProvider implements DocumentRangeFormattingEditProvider {
    constructor(private backend: AntlrLanguageSupport) { }

    provideDocumentRangeFormattingEdits(document: TextDocument, range: Range, options: FormattingOptions,
        token: CancellationToken): ProviderResult<TextEdit[]> {

        let start = document.offsetAt(range.start);
        let end = document.offsetAt(range.end) - 1; // Make the end inclusive.

        let formatOptions = workspace.getConfiguration("antlr4.format");
        let grapsOptions = {
            "alignTrailingComments": formatOptions["alignTrailingComments"],
            "allowShortBlocksOnASingleLine": formatOptions["allowShortBlocksOnASingleLine"],
            "breakBeforeBraces": formatOptions["breakBeforeBraces"],
            "columnLimit": formatOptions["columnLimit"],
            "continuationIndentWidth": formatOptions["continuationIndentWidth"],
            "indentWidth": formatOptions["indentWidth"],
            "keepEmptyLinesAtTheStartOfBlocks": formatOptions["keepEmptyLinesAtTheStartOfBlocks"],
            "maxEmptyLinesToKeep": formatOptions["maxEmptyLinesToKeep"],
            "reflowComments": formatOptions["reflowComments"],
            "spaceBeforeAssignmentOperators": formatOptions["spaceBeforeAssignmentOperators"],
            "tabWidth": formatOptions["tabWidth"],
            "useTab": formatOptions["useTab"],
            "alignColons": formatOptions["alignColons"],
            "singleLineOverrulesHangingColon": formatOptions["singleLineOverrulesHangingColon"],
            "allowShortRulesOnASingleLine": formatOptions["allowShortRulesOnASingleLine"],
            "alignSemicolons": formatOptions["alignSemicolons"],
            "breakBeforeParens": formatOptions["breakBeforeParens"],
            "ruleInternalsOnSingleLine": formatOptions["ruleInternalsOnSingleLine"],
            "minEmptyLines": formatOptions["minEmptyLines"],
            "groupedAlignments": formatOptions["groupedAlignments"],
            "alignFirstTokens": formatOptions["alignFirstTokens"],
            "alignLexerCommands": formatOptions["alignLexerCommands"],
            "alignActions": formatOptions["alignActions"],
            "alignLabels": formatOptions["alignLabels"],
            "alignTrailers": formatOptions["alignTrailers"]
        };
        let text = "";
        [text, start, end] = this.backend.formatGrammar(document.fileName, grapsOptions, start, end);
        let resultRange = range.with(document.positionAt(start), document.positionAt(end + 1));

        return [TextEdit.replace(resultRange, text)];
    }
};
