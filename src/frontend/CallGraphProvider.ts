/*
 * This file is released under the MIT license.
 * Copyright (c) 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

const path = require("path");
import * as vscode from "vscode";

import { WebviewProvider, WebviewShowOptions } from "./WebviewProvider";
import { Utils } from "./Utils";
import { TextEditor, Uri } from "vscode";

export class AntlrCallGraphProvider extends WebviewProvider {

    public generateContent(source: TextEditor | Uri, options: WebviewShowOptions): string {
        let uri = (source instanceof Uri) ? source : source.document.uri;

        let fileName = uri.fsPath;
        let baseName = path.basename(fileName, path.extname(fileName));

        let graph = (source instanceof Uri) ? this.backend.getReferenceGraph(fileName) : this.backend.getReferenceGraphFast(fileName, source.document.getText());
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
            Utils.getMiscPath('utils.js', this.context, true),
            Utils.getMiscPath("call-graph.js", this.context, true)
        ];
        let diagram = `<!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.getStyles(uri)}
                    <base href="${uri.toString(true)}">
                    <script src="https://d3js.org/d3.v4.min.js"></script>
                    <script>
                        var data = ${JSON.stringify(data)};
                    </script>
                    ${this.getScripts(nonce, scripts)}
                </head>

            <body>
                <div class="header"><span class="call-graph-color"><span class="graph-initial">Ⓒ</span>all Graph</span>
                    <span class="action-box">
                        <a onClick="changeDiameter(0.8);"><span class="call-graph-color" style="font-size: 120%; font-weight: 800; cursor: pointer; vertical-align: middle;">-</span></a>
                        <span style="margin-left: -5px; margin-right: -5px; cursor: default;">Change radius</span>
                        <a onClick="changeDiameter(1.2);"><span class="call-graph-color" style="font-size: 120%; font-weight: 800; cursor: pointer; vertical-align: middle;">+</span></a>&nbsp;
                        Save to SVG<a onClick="exportToSVG('call-graph', '${baseName}');"><span class="call-graph-save-image" /></a>
                    </span>
                </div>

                <div id="container">
                    <svg></svg>
                </div>
                <script>render();</script>
            </body>
        </html>`;

        return diagram;
    };
};
