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
            data.push({
                name: entry[0],
                kind: entry[1].kind,
                rules: Array.from(entry[1].rules),
                tokens: Array.from(entry[1].tokens),
            });
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
                    <script nonce="${nonce}" src="${graphLibPath}"></script>
                    <script nonce="${nonce}">
                        let callGraphRenderer;
                        let graphExport;
                    </script>
                </head>

            <body>
                <div id="header" class="header">
                    <span class="graphTitle call-graph-color">Call Graph</span>

                    <div class="saveSVGButton" onClick="graphExport.exportToSVG('call-graph', '${baseName}');"
                        title="Save this diagram to an SVG file"
                    ></div>

                    <label style="margin-left: 8px">Radius: </label>
                    <div onClick="callGraphRenderer.changeDiameter(0.8);"
                        style="font-size: 120%; font-weight: 800; cursor: pointer; vertical-align: middle;">-</div>
                    <span style="font-size: 120%; font-weight: 800; margin: 0 2px; cursor: default;">/</span>
                    <div onClick="callGraphRenderer.changeDiameter(1.2);"
                        style="font-size: 120%; font-weight: 800; cursor: pointer; vertical-align: middle;">+</div>
                </div>

                <svg style="width: 100%; height: 100vh;"></svg>

                <script nonce="${nonce}" type="module">
                    import { CallGraphRenderer } from "${rendererScriptPath}";
                    import { GraphExport, vscode } from "${exportScriptPath}";

                    const data = ${JSON.stringify(data)};
                    callGraphRenderer = new CallGraphRenderer(vscode, data);
                    graphExport = new GraphExport();

                    callGraphRenderer.render();
                </script>

            </body>
        </html>`;

        return diagram;
    }
}
