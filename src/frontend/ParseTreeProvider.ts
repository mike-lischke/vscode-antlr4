/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

const path = require("path");
const fs = require("fs");

import * as vscode from "vscode";

import { WebviewProvider, WebviewShowOptions } from "./WebviewProvider";
import { Utils } from "./Utils";
import { DebuggerConsumer } from "./AntlrDebugAdapter";
import { GrapsDebugger } from "../backend/GrapsDebugger";

export class AntlrParseTreeProvider extends WebviewProvider implements DebuggerConsumer {

    public debugger: GrapsDebugger;

    refresh(): void {
        if (this.lastEditor) {
            this.update(this.lastEditor);
        }
    }

    debuggerStopped(): void {
        // no-op
    }

    public generateContent(uri: vscode.Uri, options: WebviewShowOptions): string {
        let graph = this.debugger.currentParseTree;

        // Content Security Policy
        const nonce = new Date().getTime() + '' + new Date().getMilliseconds();
        const scripts = [
            Utils.getMiscPath('utils.js', this.context, true),
            Utils.getMiscPath("parse-tree.js", this.context, true)
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
                        var useCluster = false;
                        var horizontal = true;
                        const width = 1000, height = 1000;
                        const initialScale = 0.75;
                        const initialTranslateX = 500;
                        const initialTranslateY = 250;
                    </script>
                </head>

            <body>
                <div class="header"><span class="parse-tree-color"><span class="graph-initial">Ⓟ</span>arse Tree</span>
                    <span class="action-box">
                        Tree
                        <span class="switch">
                            <span class="switch-border">
                                <input id="switch1" type="checkbox" onClick="toggleTreeType(this)"/>
                                <label for="switch1"></label>
                                <span class="switch-handle-top"></span>
                            </span>
                        </span>
                        Cluster&nbsp;&nbsp;
                        Horizontal
                        <span class="switch">
                            <span class="switch-border">
                                <input id="switch2" type="checkbox" onClick="toggleOrientation(this)"/>
                                <label for="switch2"></label>
                                <span class="switch-handle-top"></span>
                            </span>
                        </span>
                        Vertical&nbsp;&nbsp;
                        <a onClick="changeNodeSize(0.9);"><span class="parse-tree-color" style="font-size: 120%; font-weight: 800; cursor: pointer; vertical-align: middle;">-</span></a>
                        Node Size
                        <a onClick="changeNodeSize(1.1);"><span class="parse-tree-color" style="font-size: 120%; font-weight: 800; cursor: pointer; vertical-align: middle;">+</span></a>&nbsp;&nbsp;
                        Save to file<a onClick="exportToSVG('parse-tree', '${path.basename(uri.fsPath)}');"><span class="parse-tree-save-image" /></a>
                    </span>
                </div>

                <svg></svg>
                ${this.getScripts(nonce, scripts)}
                <script>update(root);</script>
            </body>
        </html>`;

        //fs.writeFileSync("~/Downloads/tree.html", diagram);
        return diagram;
    };
};
