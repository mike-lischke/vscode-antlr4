/*
 * This file is released under the MIT license.
 * Copyright (c) 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

const path = require("path");
import * as vscode from "vscode";

import { AntlrLanguageSupport } from "antlr4-graps";

export class AntlrRailroadDiagramProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private defaultCSS = `<style>
        h1 {
            font-size: 1.5em;
        }

        /*===== Dark styles =====*/
        body.vscode-dark svg.railroad-diagram { /* DIAGRAM_CLASS setting */
            background: rgba(255, 255, 255, 0.05);
        }

        body.vscode-dark svg.railroad-diagram path { /* The connection lines. */
            stroke-width: 2;
            stroke: darkgray;
            fill: rgba(0, 0, 0, 0);
        }

        body.vscode-dark svg.railroad-diagram text { /* All text except comments. */
            font: bold 12px Hack, "Source Code Pro", monospace;
            text-anchor: middle;
            fill: #404040; /* Use fill instead of color for svg text. */
        }

        body.vscode-dark svg.railroad-diagram text.comment { /* Comment text */
            font: italic 12px Hack, "Source Code Pro", monospace;
            fill: white;
        }

        body.vscode-dark svg.railroad-diagram g.non-terminal rect { /* The non-terminal boxes. */
            stroke-width: 2;
            stroke: #404040;
            fill: rgba(255, 255, 255, 1);
        }

        body.vscode-dark svg.railroad-diagram g.terminal rect { /* The terminal boxes. */
            stroke-width: 2;
            stroke: #404040;
            fill: rgba(255, 255, 255, 0.7);
        }

        body.vscode-dark svg.railroad-diagram text.diagram-text { /* Multiple choice text, not working atm. */
            font-size: 12px  Hack, "Source Code Pro", monospace;
            fill: red;
        }

        body.vscode-dark svg.railroad-diagram path.diagram-text { /* Multiple choice text, not working atm. */
            stroke-width: 1;
            stroke: red;
            fill: white;
            cursor: help;
        }

        body.vscode-dark svg.railroad-diagram g.diagram-text:hover path.diagram-text { /* Multiple choice text, not working atm. */
            fill: #f00;
        }

        /*===== Light styles =====*/
        body.vscode-light svg.railroad-diagram { /* DIAGRAM_CLASS setting */
            background: rgba(0, 0, 0, 0.05);
        }

        body.vscode-light svg.railroad-diagram path { /* The connection lines. */
            stroke-width: 2;
            stroke: darkgray;
            fill: rgba(0, 0, 0, 0);
        }

        body.vscode-light svg.railroad-diagram text { /* All text except comments. */
            font: bold 12px  Hack, "Source Code Pro", monospace;
            text-anchor: middle;
            fill: #404040; /* Use fill instead of color for svg text. */
        }

        body.vscode-light svg.railroad-diagram text.comment { /* Comment text */
            font: italic 12px  Hack, "Source Code Pro", monospace;
            fill: #404040;
        }

        body.vscode-light svg.railroad-diagram g.non-terminal rect { /* The non-terminal boxes. */
            stroke-width: 2;
            stroke: #404040;
            fill: rgba(255, 255, 255, 1);
        }

        body.vscode-light svg.railroad-diagram g.terminal rect { /* The terminal boxes. */
            stroke-width: 2;
            stroke: #404040;
            fill: rgba(0, 0, 0, 0.1);
        }

        body.vscode-light svg.railroad-diagram text.diagram-text { /* Multiple choice text, not working atm. */
            font-size: 12px  Hack, "Source Code Pro", monospace;
            fill: red;
        }

        body.vscode-light svg.railroad-diagram path.diagram-text { /* Multiple choice text, not working atm. */
            stroke-width: 1;
            stroke: red;
            fill: red;
            cursor: help;
        }

        body.vscode-light svg.railroad-diagram g.diagram-text:hover path.diagram-text { /* Multiple choice text, not working atm. */
            fill: #f00;
        }

        </style>
    `;

    constructor(private backend: AntlrLanguageSupport) { }

    public provideTextDocumentContent(uri: vscode.Uri): string {
        let editor = vscode.window.activeTextEditor;
        if (!editor || !(editor.document.languageId === "antlr")) {
            return "";
        }
        let fileName = editor.document.fileName;
        let caret = editor.selection.active;
        let rule = this.backend.ruleFromPosition(fileName, caret.character, caret.line + 1);
        let scriptPath = path.resolve(__dirname, 'railroad-diagrams.js');

        let diagram = `<!DOCTYPE html><html><head>`;
        let customCSSPath = vscode.workspace.getConfiguration("antlr4.railroaddiagram")["customcss"];
        if (customCSSPath || customCSSPath.length > 0) {
            diagram += `<link href="${customCSSPath}" rel="stylesheet" type="text/css" />`;
        } else {
            diagram += this.defaultCSS;
        }

        diagram += `<script src='${scriptPath}'></script></head>
            <body>
            <h1 id='ident'>${rule}</h1>
            <div>
            <script> ${this.backend.getRRDScript(fileName, rule)}</script>
            </div>
            </body></html>`;

        return diagram;
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

}
