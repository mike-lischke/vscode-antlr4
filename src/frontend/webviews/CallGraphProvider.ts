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

                    <label>Diameter: </label>
                    <div class="large" onClick="callGraphRenderer.changeDiameter(0.8);">-</div>
                    <span class="large">/</span>
                    <div class="large" onClick="callGraphRenderer.changeDiameter(1.2);">+</div>
                    <label>Traverse:</label>

                    <label class="checkboxHost">
                        <input id="traverseCheckbox" type="checkbox" onClick="callGraphRenderer.toggleTraverse();" />
                        <span class="checkMark" />
                    </label>

                    <label>Delay:</label>
                    <input
                        id="traverseDelayInput"
                        type="text"
                        title="The delay between to steps"
                        onInput="callGraphRenderer.updateTraverseDelay(this.value);"
                    /> ms
                    <label>Hide Tokens:</label>

                    <label class="checkboxHost" title="Show or hide tokens in the graph">
                        <input
                            id="hideTokensCheckbox"
                            type="checkbox"
                            onClick="callGraphRenderer.toggleHideTokens();"
                        />
                        <span class="checkMark" />
                    </label>

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
