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
import { AntlrTextContentProvider } from "./TextContentProvider";
import { Utils } from "./Utils";

export class AntlrRailroadDiagramProvider extends AntlrTextContentProvider {
    public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
        const sourceUri = vscode.Uri.parse(uri.query);
        const command = uri.fragment;

        return vscode.workspace.openTextDocument(sourceUri).then(document => {
            // We need the currently active editor for the caret position.
            // If there is one we were triggered (or activated) from that.
            // If not the user probably switched preview windows. In that case we use
            // the last position stored when we had an active editor.
            let fileName = document.fileName;
            let caret: vscode.Position | undefined;
            let editor = vscode.window.activeTextEditor;
            if (editor && editor.document == document) {
                caret = editor.selection.active;
                this.positionCache.set(fileName, caret);
            } else if (this.positionCache.has(fileName)) {
                caret = this.positionCache.get(fileName);
            }
            if (!caret) {
                return "";
            }

            let [ruleName, ruleIndex] = this.backend.ruleFromPosition(fileName, caret.character, caret.line + 1);
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
                Utils.getMiscPath('utils.js', this.context),
                Utils.getMiscPath("railroad-diagrams.js", this.context)
            ];
            let diagram = `<!DOCTYPE html>
                <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.getStyles(uri)}
                    <base href="${document.uri.toString(true)}">
                </head>

                <body>
                ${this.getScripts(nonce, scripts)}
            `;

            if (command == "full") {
                diagram += `
                    <div class="header"><span class="rrd-color"><span class="graph-initial">Ⓡ</span>rd&nbsp;&nbsp;</span>All rules
                        <span class="action-box">
                        Save to HTML<a onClick="exportToHTML('rrd', '${baseName}');"><span class="rrd-save-image" /></a>
                        </span>
                    </div>
                    <div id="container">`;
                var symbols = this.backend.listSymbols(document.fileName, false);
                for (let symbol of symbols) {
                    if (symbol.kind == SymbolKind.LexerToken
                        || symbol.kind == SymbolKind.ParserRule
                        || symbol.kind == SymbolKind.FragmentLexerToken) {
                        let script = this.backend.getRRDScript(fileName, symbol.name);
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
                        <script>${this.backend.getRRDScript(fileName, ruleName)}</script>
                    </div>
                `;
            }
            diagram += `</body></html>`;

            return diagram;
        });
    };
};
