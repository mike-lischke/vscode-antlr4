/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as path from "path";

import * as vscode from "vscode";

import { WebviewProvider, WebviewShowOptions } from "./WebviewProvider";
import { Utils } from "./Utils";
import { DebuggerConsumer } from "./AntlrDebugAdapter";
import { GrammarDebugger } from "../backend/GrammarDebugger";

export class AntlrParseTreeProvider extends WebviewProvider implements DebuggerConsumer {

    public debugger: GrammarDebugger;

    public refresh(): void {
        if (this.currentEditor) {
            this.update(this.currentEditor);
        }
    }

    public debuggerStopped(uri: vscode.Uri): void {
        this.updateContent(uri);
    }

    public generateContent(webView: vscode.Webview, uri: vscode.Uri, options: WebviewShowOptions): string {
        const graph = this.debugger.currentParseTree;

        // Content Security Policy
        const nonce = new Date().getTime() + "" + new Date().getMilliseconds();
        const scripts = [
            Utils.getMiscPath("utils.js", this.context, webView),
            Utils.getMiscPath("parse-tree.js", this.context, webView),
        ];
        const graphLibPath = Utils.getNodeModulesPath("d3/dist/d3.js", this.context);

        const settings = vscode.workspace.getConfiguration("antlr4.debug");
        const horizontal = settings.visualParseTreeHorizontal ? 1 : 0;
        const clustered = settings.visualParseTreeClustered ? 1 : 0;

        const diagram = `<!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.generateContentSecurityPolicy(uri)}
                    ${this.getStyles(webView)}
                    <base target="_blank">
                    <script src="${graphLibPath}"></script>
                    <script>
                        var parseTreeData = ${JSON.stringify(graph)};
                        var useCluster = ${clustered};
                        var horizontal = ${horizontal};
                        const width = 1000, height = 1000;
                        const initialScale = 0.75;
                        const initialTranslateX = ${horizontal ? 200 : 500};
                        const initialTranslateY = ${horizontal ? 400 : 50};
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
                        <a onClick="changeNodeSize(0.9);">
                            <span class="parse-tree-color" style="font-size: 120%; font-weight: 800;
                                cursor: pointer; vertical-align: middle;">-</span>
                        </a>
                        Node Size
                        <a onClick="changeNodeSize(1.1);">
                            <span class="parse-tree-color" style="font-size: 120%; font-weight: 800; cursor: pointer;
                                vertical-align: middle;">+</span>
                        </a>&nbsp;&nbsp;
                        Save to SVG
                        <a onClick="exportToSVG('parse-tree', '${path.basename(uri.fsPath)}');">
                            <span class="parse-tree-save-image" />
                        </a>
                    </span>
                </div>

                <svg></svg>
                ${this.getScripts(nonce, scripts)}
                <script>initSwitches(); update(root);</script>
            </body>
        </html>`;

        return diagram;
    }

    protected updateContent(uri: vscode.Uri): boolean {
        const graph = this.debugger.currentParseTree;
        this.sendMessage(uri, {
            command: "updateParseTreeData",
            treeData: graph,
        });

        return true;
    }
}
