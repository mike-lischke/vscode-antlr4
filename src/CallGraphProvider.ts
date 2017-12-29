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

export class AntlrCallGraphProvider extends AntlrTextContentProvider {

    public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
        const sourceUri = vscode.Uri.parse(uri.query);
        const command = uri.fragment;

        return vscode.workspace.openTextDocument(sourceUri).then(document => {
            // We need the currently active editor for the caret position.
            // If there is one we were triggered (or activated) from that.
            // If not the user probably switched preview windows. In that case we use
            // the last position stored when we had an active editor.
            let fileName = document.fileName;
            let baseName = path.basename(fileName, path.extname(fileName));

            let graph = this.backend.getReferenceGraph(fileName);
            let data = [];
            for (let entry of graph) {
                let references: string[] = [];
                for (let ref of entry[1].rules) {
                    references.push(ref);
                }
                for (let ref of entry[1].tokens) {
                    references.push(ref);
                }
                data.push({ name: entry[0], references: references });
            }

            // Content Security Policy
            const nonce = new Date().getTime() + '' + new Date().getMilliseconds();
            const scripts = [
                Utils.getMiscPath('utils.js', this.context),
                Utils.getMiscPath("call-graph.js", this.context)
            ];
            let diagram = `<!DOCTYPE html>
                <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.getStyles(uri)}
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

                        .rule-initial {
                            font-size: 28pt;
                            color: rgba(96, 125, 189, 0.75);
                            font-weight: bold;
                            vertical-align: middle;
                            padding-left: 10px;
                        }

                        .rule-initial-small {
                            font-size: 16pt;
                            color: rgba(96, 125, 189, 0.75);
                            font-weight: bold;
                            vertical-align: middle;
                        }

                        .rule-index {
                            font-size: 8pt;
                        }

                        body.vscode-light .icon { filter: invert(100%); -webkit-filter: invert(100%); }
                        #container { margin-top: 40px; }
                        svg { display: block; }
                        body { padding-left: 20px; }
                        .icon-box { font: 10pt monospace; margin-left: 0px; }
                        .icon.save { background-image: url("${Utils.getMiscPath('save.svg', this.context)}"); }

                    </style>
                </head>

                <body>
                    <div class="header"><span class="rule-initial">Ⓒ</span>
                        <span class="icon-box">
                            <a onClick="exportToSVG('call-graph', '');" style="cursor: pointer; cursor: hand; margin-left: 15px;"><span class="rule-initial-small">⤑</span> Save to file</a>
                        </span>
                    </div>

                    <div id="container">
                        <svg width="2000" , height="2000">
                        </svg>
                        <script src="https://d3js.org/d3.v4.min.js"></script>
                    </div>
                    <script>var data = ${JSON.stringify(data)}</script>
                    ${this.getScripts(nonce, scripts)}
                </body>
            </html>`;

            return diagram;
        });
    };
};
