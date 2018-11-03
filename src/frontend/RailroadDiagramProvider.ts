/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

const path = require("path");
import * as vscode from "vscode";

import { AntlrFacade, SymbolKind } from "../backend/facade";
import { WebviewProvider, WebviewShowOptions } from "./WebviewProvider";
import { Utils } from "./Utils";

export class AntlrRailroadDiagramProvider extends WebviewProvider {
    public generateContent(editor: vscode.TextEditor, options: WebviewShowOptions): string {
        let caret = editor.selection.active;

        let fileName = editor.document.fileName;
        let [ruleName, ruleIndex] = this.backend.ruleFromPositionFast(fileName, editor.document.getText(), caret.character, caret.line + 1);
        if (!ruleName) {
            return "";
        }

        if (!ruleName) {
            ruleName = "?";
        }

        let baseName = path.basename(fileName, path.extname(fileName));

        // Content Security Policy
        const nonce = new Date().getTime() + '' + new Date().getMilliseconds();
        const scripts = [
            Utils.getMiscPath('utils.js', this.context, true),
            Utils.getMiscPath("railroad-diagrams.js", this.context, true)
        ];

        let diagram = `<!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                ${this.getStyles(editor.document.uri)}
                <base href="${editor.document.uri.toString(true)}">
            </head>

            <body>
            ${this.getScripts(nonce, scripts)}
        `;

        if (options.fullList) {
            diagram += `
                <div class="header"><span class="rrd-color"><span class="graph-initial">Ⓡ</span>rd&nbsp;&nbsp;</span>All rules
                    <span class="action-box">
                    Save to HTML<a onClick="exportToHTML('rrd', '${baseName}');"><span class="rrd-save-image" /></a>
                    </span>
                </div>
                <div id="container">`;
            var symbols = this.backend.listSymbolsFast(fileName, editor.document.getText(), false);
            for (let symbol of symbols) {
                if (symbol.kind == SymbolKind.LexerToken
                    || symbol.kind == SymbolKind.ParserRule
                    || symbol.kind == SymbolKind.FragmentLexerToken) {
                    let script = this.backend.getRRDScriptFast(fileName, editor.document.getText(), symbol.name);
                    diagram += `<h3>${symbol.name}</h3>\n<script>${script}</script>\n\n`;
                }
            }
            diagram += `</div>`;
        } else {
            diagram += `
                <div class="header"><span class="rrd-color"><span class="graph-initial">Ⓡ</span>ule&nbsp;&nbsp;</span>&nbsp;&nbsp;${ruleName} <span class="rule-index">(rule index: ${ruleIndex})</span>
                    <span class="action-box">
                    Save to SVG<a onClick="exportToSVG('rrd', '${ruleName}');"><span class="rrd-save-image" /></a>
                    </span>
                </div>
                <div id="container">
                    <script>${this.backend.getRRDScriptFast(fileName, editor.document.getText(), ruleName)}</script>
                </div>
            `;
        }
        diagram += `</body></html>`;

        return diagram;
    }
};
