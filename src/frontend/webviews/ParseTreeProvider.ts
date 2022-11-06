/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { basename } from "path";

import { Uri, Webview, workspace } from "vscode";

import { WebviewProvider, IWebviewShowOptions } from "./WebviewProvider";
import { FrontendUtils } from "../FrontendUtils";
import { IDebuggerConsumer } from "../AntlrDebugAdapter";
import { GrammarDebugger } from "../../backend/GrammarDebugger";

export class ParseTreeProvider extends WebviewProvider implements IDebuggerConsumer {

    public debugger: GrammarDebugger;

    public debuggerStopped(uri: Uri): void {
        this.updateContent(uri);
    }

    public generateContent(webview: Webview, uri: Uri, _options: IWebviewShowOptions): string {
        const graph = this.debugger.currentParseTree;

        const rendererScriptPath = FrontendUtils.getOutPath("src/webview-scripts/ParseTreeRenderer.js", this.context,
            webview);
        const exportScriptPath = FrontendUtils.getOutPath("src/webview-scripts/GraphExport.js", this.context,
            webview);
        const graphLibPath = FrontendUtils.getNodeModulesPath(webview, "d3/dist/d3.js", this.context);

        const settings = workspace.getConfiguration("antlr4.debug");
        const horizontal = settings.get<boolean>("visualParseTreeHorizontal", true);
        const clustered = settings.get<boolean>("visualParseTreeClustered", false);
        const nonce = this.generateNonce();

        const diagram = `<!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.generateContentSecurityPolicy(webview, nonce)}
                    ${this.getStyles(webview)}
                    <base target="_blank">
                    <script nonce="${nonce}" src="${graphLibPath}"></script>
                    <script nonce="${nonce}">
                        let parseTreeRenderer;
                        let graphExport;
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
                        <a onClick="graphExport.exportToSVG('parse-tree', '${basename(uri.fsPath)}');">
                            <span class="parse-tree-save-image" />
                        </a>
                    </span>
                </div>

                <svg></svg>
                <script nonce="${nonce}" type="module">
                    import { ParseTreeRenderer } from "${rendererScriptPath}";
                    import { GraphExport } from "${exportScriptPath}";

                    // Register a listener for data changes.
                    window.addEventListener("message", (event) => {
                        switch (event.data.command) {
                            case "updateParseTreeData": {
                                parseTreeRenderer.loadNewTree({ parseTreeData: event.data.treeData });

                                break;
                            }

                            default:
                        }
                    });

                    parseTreeRenderer = new ParseTreeRenderer();
                    graphExport = new GraphExport();

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

        return diagram;
    }

    public updateContent(uri: Uri): boolean {
        const graph = this.debugger.currentParseTree;
        this.sendMessage(uri, {
            command: "updateParseTreeData",
            treeData: graph,
        });

        return true;
    }
}
