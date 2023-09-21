/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as path from "path";
import { Uri, Webview } from "vscode";

import { WebviewProvider } from "./WebviewProvider.js";
import { FrontendUtils } from "../FrontendUtils.js";
import { ICallGraphEntry } from "../../webview-scripts/types.js";

export class CallGraphProvider extends WebviewProvider {

    public override generateContent(webview: Webview, uri: Uri): string {
        const fileName = uri.fsPath;
        const baseName = path.basename(fileName, path.extname(fileName));

        const graph = this.backend.getReferenceGraph(fileName);
        const data: ICallGraphEntry[] = [];
        for (const entry of graph) {
            const references: string[] = [];
            for (const ref of entry[1].rules) {
                references.push(ref);
            }

            for (const ref of entry[1].tokens) {
                references.push(ref);
            }

            data.push({ name: entry[0], references });
        }

        const rendererScriptPath = FrontendUtils.getOutPath("src/webview-scripts/CallGraphRenderer.js", this.context,
            webview);
        const exportScriptPath = FrontendUtils.getOutPath("src/webview-scripts/GraphExport.js", this.context,
            webview);
        const graphLibPath = FrontendUtils.getNodeModulesPath(webview, "d3/dist/d3.js", this.context);
        const nonce = this.generateNonce();

        const diagram = `<!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8"/>
                    ${this.generateContentSecurityPolicy(webview, nonce)}
                    ${this.getStyles(webview)}
                    <base href="${uri.toString(true)}">
                    <script nonce="${nonce}" src="${graphLibPath}"></script>
                    <script nonce="${nonce}">
                        let callGraphRenderer;
                        let graphExport;
                    </script>
                </head>

            <body>
                <div class="header"><span class="call-graph-color"><span class="graph-initial">Ⓒ</span>all Graph</span>
                    <span class="action-box">
                        <a onClick="callGraphRenderer.changeDiameter(0.8);">
                            <span class="call-graph-color" style="font-size: 120%; font-weight: 800; cursor: pointer;
                                vertical-align: middle;">-</span>
                        </a>
                        <span style="margin-left: -5px; margin-right: -5px; cursor: default;">Change radius</span>
                        <a onClick="callGraphRenderer.changeDiameter(1.2);">
                            <span class="call-graph-color" style="font-size: 120%; font-weight: 800; cursor: pointer;
                                vertical-align: middle;">+</span>
                        </a>&nbsp;
                        Save to SVG
                        <a onClick="graphExport.exportToSVG('call-graph', '${baseName}');">
                            <span class="call-graph-save-image" />
                        </a>
                    </span>
                </div>

                <div id="container">
                    <svg></svg>
                </div>
                <script nonce="${nonce}" type="module">
                    import { CallGraphRenderer } from "${rendererScriptPath}";
                    import { GraphExport } from "${exportScriptPath}";

                    const data = ${JSON.stringify(data)};
                    callGraphRenderer = new CallGraphRenderer(data);
                    graphExport = new GraphExport();

                    callGraphRenderer.render();
                </script>

            </body>
        </html>`;

        return diagram;
    }
}
