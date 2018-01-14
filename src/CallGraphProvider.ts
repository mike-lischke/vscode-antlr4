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
                        <script src="https://d3js.org/d3.v4.min.js"></script>
                        <script>
                            var data = ${JSON.stringify(data)};
                        </script>
                        ${this.getScripts(nonce, scripts)}
                    </head>

                <body>
                    <div class="header"><span class="call-graph-color"><span class="rule-initial">Ⓒ</span>all Graph</span>
                        <span class="action-box">
                            <a onClick="changeDiameter(0.8);"><span class="call-graph-color">-</span></a>
                            <span style="margin-left: -5px; margin-right: -5px; cursor: default;">Change radius</span>
                            <a onClick="changeDiameter(1.2);"><span class="call-graph-color">+</span></a>&nbsp;&nbsp;
                            <a onClick="exportToSVG('call-graph', '${baseName}');"><span class="rule-initial-small call-graph-color">⤑</span> Save to file</a>
                        </span>
                    </div>

                    <div id="container">
                        <svg></svg>
                    </div>
                    <script>render();</script>
                </body>
            </html>`;

            return diagram;
        });
    };
};
