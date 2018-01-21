/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

const path = require("path");
import * as vscode from "vscode";

import { AntlrLanguageSupport, SymbolKind, GrapsDebugger } from "antlr4-graps";
import { AntlrTextContentProvider } from "./TextContentProvider";
import { Utils } from "./Utils";
import { DebuggerConsumer } from "./AntlrDebugger";

export class AntlrParseTreeProvider extends AntlrTextContentProvider implements DebuggerConsumer {

    public debugger: GrapsDebugger;

    private uri: vscode.Uri;

    refresh(): void {
        this.update(this.uri);
    }

    public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
        this.uri = uri;

        let graph = this.debugger.currentParseTree;

        // Content Security Policy
        const nonce = new Date().getTime() + '' + new Date().getMilliseconds();
        const scripts = [
            Utils.getMiscPath('utils.js', this.context),
            Utils.getMiscPath("parse-tree.js", this.context)
        ];

        let diagram = `<!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.getStyles(uri)}
                    <base target="_blank">
                    <script src="https://d3js.org/d3.v4.min.js"></script>
                    <script>
                        var data = ${JSON.stringify(graph)};
                        var useCluster = true;
                        const width = 1000, height = 1000;
                        const initialScale = 0.5;
                        const initialTranslateX = 500;
                        const initialTranslateY = 250;
                    </script>
                </head>

            <body>
                <div class="header"><span class="parse-tree-color"><span class="rule-initial">Ⓟ</span>arse Tree</span>&nbsp;&nbsp;
                    <span class="action-box">
                        Tree
                        <span class="switch">
                            <span class="switch-border">
                                <input id="switch1" type="checkbox" checked onclick='toggleParseTree(this)'; />
                                <label for="switch1"></label>
                                <span class="switch-handle-top"></span>
                            </span>
                        </span>
                        Cluster&nbsp;&nbsp;
                        <a onClick="changeDiameter(1.2);"><span class="parse-tree-color"><b>-</b></span></a>
                        Node Size
                        <a onClick="changeDiameter(1.2);"><span class="parse-tree-color"><b>+</b></span></a>&nbsp;&nbsp;
                        <a onClick="changeDiameter(1.2);"><span class="parse-tree-color">-</span></a>
                        Node Separation
                        <a onClick="changeDiameter(1.2);"><span class="parse-tree-color">+</span></a>&nbsp;&nbsp;
                        <a onClick="exportToSVG('parse-tree', '${path.basename(this.uri.fsPath)}');"><span class="rule-initial-small parse-tree-color">⤑</span> Save to file</a>
                    </span>
                </div>

                <svg></svg>
                ${this.getScripts(nonce, scripts)}
                <script>render();</script>
            </body>
        </html>`;

        return new Promise(resolve => { resolve(diagram); });
    };
};
