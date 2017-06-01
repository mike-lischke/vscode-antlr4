/*
 * This file is released under the MIT license.
 * Copyright (c) 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

const path = require("path");
import * as vscode from "vscode";

import { AntlrLanguageSupport, SymbolKind } from "antlr4-graps";
import { AntlrTextContentProvider } from "./TextContentProvider";
import { Utils } from "./Utils";

export class AntlrRailroadDiagramProvider extends AntlrTextContentProvider {
    public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
        const sourceUri = vscode.Uri.parse(uri.query);
        const command = uri.fragment;

        return vscode.workspace.openTextDocument(sourceUri).then(document => {
            vscode.window.showTextDocument(document);

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

            let rule = this.backend.ruleFromPosition(fileName, caret.character, caret.line + 1);
            if (!rule) {
                return "";
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
                    ${this.getStyles(uri, "rrd")}
                    <base href="${document.uri.toString(true)}">

                    <style>
                        .icon {
                            width: 1em;
                            height: 1em;
                            display: inline-block;
                            background-repeat: no-repeat;
                            background-position: center bottom;
                        }

                        .header {
                            position: fixed;
                            font-size: 14pt;
                            z-index: 9999;
                            top: 0;
                            left: 0;
                            right: 0;
                            background-color: var(--background-color);
                            height: 30px;
                        }

                        body.vscode-light .icon { filter: invert(100%); -webkit-filter: invert(100%); }
                        #container { margin-top: 30px; }
                        svg { display: block; }
                        body { padding-left: 20px; }
                        .icon-box { font: 10pt monospace; margin-left: 0px; }
                        .icon.save { background-image: url("${Utils.getMiscPath('save.svg', this.context)}"); }

                    </style>
                </head>

                <body>
                ${this.getScripts(nonce, scripts)}
            `;

            if (command == "full") {
                diagram += `
                    <div class="header">
                        <span class="icon-box">
                            <a onClick="exportToHTML('rrd', '${baseName}');" style="cursor: pointer; cursor: hand;">Save all diagrams in an HTML file <span class="icon save" title="Save to disk"></span></a>
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
                    <div class="header">${rule}
                        <span class="icon-box">
                            <a onClick="exportToSVG('rrd', '${rule}');" style="cursor: pointer; cursor: hand;">| Save to file: <span class="icon save" title="Save to disk"></span></a>
                        </span>
                    </div>
                    <div id="container" style="transform: scale(1, 1); transform-origin: 0 0; width: 100%">
                        <script>${this.backend.getRRDScript(fileName, rule)}</script>
                    </div>
                `;
            }
            diagram += `</body></html>`;

            return diagram;
        });
    };
};
