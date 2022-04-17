/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as path from "path";
import * as vscode from "vscode";

import { SymbolKind } from "../../backend/types";
import { WebviewProvider, IWebviewShowOptions } from "./WebviewProvider";
import { FrontendUtils } from "../FrontendUtils";

export class AntlrRailroadDiagramProvider extends WebviewProvider {

    public async generateContent(webView: vscode.Webview, editor: vscode.TextEditor,
        options: IWebviewShowOptions): Promise<string> {
        const caret = editor.selection.active;

        const fileName = editor.document.fileName;
        const [ruleName, ruleIndex = -1] = this.backend.ruleFromPosition(fileName, caret.character, caret.line + 1);
        if (!ruleName) {
            return "";
        }

        const baseName = path.basename(fileName, path.extname(fileName));

        // Content Security Policy
        const nonce = this.generateNonce();
        const scripts = [
            FrontendUtils.getMiscPath("utils.js", this.context, webView),
            FrontendUtils.getMiscPath("railroad-diagrams.js", this.context, webView),
        ];

        let diagram = `<!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="Content-type" content="text/html; charset=UTF-8"/>
                ${this.generateContentSecurityPolicy(editor)}
                ${this.getStyles(webView)}
                <base href="${editor.document.uri.toString(true)}">
            </head>

            <body>
            ${this.getScripts(nonce, scripts)}
        `;

        if (options.fullList) {
            diagram += `
                <div class="header">
                    <span class="rrd-color"><span class="graph-initial">Ⓡ</span>rd&nbsp;&nbsp;</span>All rules
                    <span class="action-box">
                    Save to HTML<a onClick="exportToHTML('rrd', '${baseName}');"><span class="rrd-save-image" /></a>
                    </span>
                </div>
                <div id="container">`;
            const symbols = await this.backend.listTopLevelSymbols(fileName, false);
            for (const symbol of symbols) {
                if (symbol.kind === SymbolKind.LexerRule
                    || symbol.kind === SymbolKind.ParserRule
                    || symbol.kind === SymbolKind.FragmentLexerToken) {
                    const script = this.backend.getRRDScript(fileName, symbol.name);
                    diagram += `<h3 class="${symbol.name}-class">${symbol.name}</h3>\n<script>${script}</script>\n\n`;
                }
            }
            diagram += "</div>";
        } else {
            diagram += `
                <div class="header">
                    <span class="rrd-color">
                        <span class="graph-initial">Ⓡ</span>ule&nbsp;&nbsp;
                    </span>&nbsp;&nbsp;${ruleName} <span class="rule-index">(rule index: ${ruleIndex})</span>
                    <span class="action-box">
                    Save to SVG<a onClick="exportToSVG('rrd', '${ruleName}');"><span class="rrd-save-image" /></a>
                    </span>
                </div>
                <div id="container">
                    <script>${this.backend.getRRDScript(fileName, ruleName)}</script>
                </div>
            `;
        }
        diagram += "</body></html>";

        return diagram;
    }
}
