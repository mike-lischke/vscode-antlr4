/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as path from "path";

import { WebviewProvider, WebviewShowOptions } from "./WebviewProvider";
import { Utils } from "./Utils";
import { TextEditor, Uri, Webview } from "vscode";

export class AntlrCallGraphProvider extends WebviewProvider {

    public generateContent(webView: Webview, source: TextEditor | Uri, options: WebviewShowOptions): string {
        const uri = (source instanceof Uri) ? source : source.document.uri;

        const fileName = uri.fsPath;
        const baseName = path.basename(fileName, path.extname(fileName));

        const graph = this.backend.getReferenceGraph(fileName);
        const data = [];
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

        const nonce = new Date().getTime() + "" + new Date().getMilliseconds();
        const scripts = [
            Utils.getMiscPath("utils.js", this.context, webView),
            Utils.getMiscPath("call-graph.js", this.context, webView),
        ];
        const graphLibPath = Utils.getNodeModulesPath("d3/dist/d3.js", this.context);

        const diagram = `<!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8"/>
                    ${this.generateContentSecurityPolicy(source)}
                    ${this.getStyles(webView)}
                    <base href="${uri.toString(true)}">
                    <script src="${graphLibPath}"></script>
                    <script>
                        var data = ${JSON.stringify(data)};
                    </script>
                    ${this.getScripts(nonce, scripts)}
                </head>

            <body>
                <div class="header"><span class="call-graph-color"><span class="graph-initial">Ⓒ</span>all Graph</span>
                    <span class="action-box">
                        <a onClick="changeDiameter(0.8);">
                            <span class="call-graph-color" style="font-size: 120%; font-weight: 800; cursor: pointer;
                                vertical-align: middle;">-</span>
                        </a>
                        <span style="margin-left: -5px; margin-right: -5px; cursor: default;">Change radius</span>
                        <a onClick="changeDiameter(1.2);">
                            <span class="call-graph-color" style="font-size: 120%; font-weight: 800; cursor: pointer;
                                vertical-align: middle;">+</span>
                        </a>&nbsp;
                        Save to SVG
                        <a onClick="exportToSVG('call-graph', '${baseName}');">
                            <span class="call-graph-save-image" />
                        </a>
                    </span>
                </div>

                <div id="container">
                    <svg></svg>
                </div>
                <script>render();</script>
            </body>
        </html>`;

        return diagram;
    }
}
