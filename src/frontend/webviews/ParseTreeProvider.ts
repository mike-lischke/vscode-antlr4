/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as path from "path";

import * as vscode from "vscode";

import { WebviewProvider, IWebviewShowOptions } from "./WebviewProvider";
import { FrontendUtils } from "../FrontendUtils";
import { IDebuggerConsumer } from "../AntlrDebugAdapter";
import { GrammarDebugger } from "../../backend/GrammarDebugger";

export class AntlrParseTreeProvider extends WebviewProvider implements IDebuggerConsumer {

    public debugger: GrammarDebugger;

    public refresh(): void {
        if (this.currentEditor) {
            this.update(this.currentEditor);
        }
    }

    public debuggerStopped(uri: vscode.Uri): void {
        this.updateContent(uri);
    }

    public async generateContent(webView: vscode.Webview, uri: vscode.Uri,
        _options: IWebviewShowOptions): Promise<string> {
        const graph = this.debugger.currentParseTree;

        // Content Security Policy
        const nonce = this.generateNonce();
        const scripts: string[] = [
            //FrontendUtils.getMiscPath("utils.js", this.context, webView),
            //FrontendUtils.getMiscPath("parse-tree.js", this.context, webView),
            //FrontendUtils.getOutPath("src/webview-scripts/ParseTreeRenderer.js", this.context, webView),
        ];
        const rendererPath = FrontendUtils.getOutPath("src/webview-scripts/ParseTreeRenderer.js", this.context,
            webView);
        const communicationPath = FrontendUtils.getOutPath("src/webview-scripts/Communication.js", this.context,
            webView);
        const graphLibPath = FrontendUtils.getNodeModulesPath("d3/dist/d3.js", this.context);

        const settings = vscode.workspace.getConfiguration("antlr4.debug");
        const horizontal = settings.visualParseTreeHorizontal ? true : false;
        const clustered = settings.visualParseTreeClustered ? true : false;

        const diagram = `<!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.generateContentSecurityPolicy(uri)}
                    ${this.getStyles(webView)}
                    <base target="_blank">
                    <script src="${graphLibPath}"></script>
                    <script>
                        let parseTreeRenderer;
                        let exportToSVG;
                    </script>
                </head>

            <body>
                <div class="header"><span class="parse-tree-color"><span class="graph-initial">Ⓟ</span>arse Tree</span>
                    <span class="action-box">
                        Tree
                        <span class="switch">
                            <span class="switch-border">
                                <input id="switch1" type="checkbox" onClick="parseTreeRenderer.toggleTreeType(this)"/>
                                <label for="switch1"></label>
                                <span class="switch-handle-top"></span>
                            </span>
                        </span>
                        Cluster&nbsp;&nbsp;
                        Horizontal
                        <span class="switch">
                            <span class="switch-border">
                                <input id="switch2" type="checkbox"
                                    onClick="parseTreeRenderer.toggleOrientation(this)"/>
                                <label for="switch2"></label>
                                <span class="switch-handle-top"></span>
                            </span>
                        </span>
                        Vertical&nbsp;&nbsp;
                        <a onClick="parseTreeRenderer.changeNodeSize(0.9);">
                            <span class="parse-tree-color" style="font-size: 120%; font-weight: 800;
                                cursor: pointer; vertical-align: middle;">-</span>
                        </a>
                        Node Size
                        <a onClick="parseTreeRenderer.changeNodeSize(1.1);">
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
                <script type="module">
                    import { ParseTreeRenderer } from "${rendererPath}";
                    import { Communication } from "${communicationPath}";

                    exportToSVG = Communication.exportToSVG;
                    parseTreeRenderer = new ParseTreeRenderer();

                    parseTreeRenderer.loadNewTree({
                        parseTreeData: ${JSON.stringify(graph)},
                        useCluster: ${clustered.toString()},
                        horizontal: ${horizontal.toString()},
                        width: 1000,
                        height: 1000,
                        initialScale: 0.75,
                        initialTranslateX: ${horizontal ? 200 : 500},
                        initialTranslateY: ${horizontal ? 400 : 50},
                    });
                    parseTreeRenderer.initSwitches();
                </script>
            </body>
        </html>`;

        return Promise.resolve(diagram);
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
