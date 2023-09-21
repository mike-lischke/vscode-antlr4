/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { basename, extname } from "path";

import { TextEditor, Uri, Webview } from "vscode";

import { SymbolKind } from "../../backend/types.js";
import { WebviewProvider, IWebviewShowOptions } from "./WebviewProvider.js";
import { FrontendUtils } from "../FrontendUtils.js";

export class RailroadDiagramProvider extends WebviewProvider {

    public override generateContent(webview: Webview, uri: Uri, options: IWebviewShowOptions): string {
        const fileName = uri.fsPath;
        const baseName = basename(fileName, extname(fileName));

        const nonce = this.generateNonce();
        const scripts = [
            FrontendUtils.getMiscPath("railroad-diagrams.js", this.context, webview),
        ];
        const exportScriptPath = FrontendUtils.getOutPath("src/webview-scripts/GraphExport.js", this.context,
            webview);

        if (!this.currentRule || this.currentRuleIndex === undefined) {
            return `<!DOCTYPE html>
                <html>
                    <head>
                        ${this.generateContentSecurityPolicy(webview, nonce)}
                    </head>
                    <body><span style="color: #808080; font-size: 16pt;">No rule selected</span></body>
                </html>`;
        }

        let diagram = `<!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="Content-type" content="text/html; charset=UTF-8"/>
                ${this.generateContentSecurityPolicy(webview, nonce)}
                ${this.getStyles(webview)}
                <base href="${uri.toString(true)}">
                <script nonce="${nonce}">
                    let graphExport;
                </script>
            </head>

            <body>
            ${this.getScripts(nonce, scripts)}`;

        if (options.fullList) {
            diagram += `
                <div class="header">
                    <span class="rrd-color"><span class="graph-initial">Ⓡ</span>rd&nbsp;&nbsp;</span>All rules
                    <span class="action-box">
                        Save to HTML<a onClick="graphExport.exportToHTML('rrd', '${baseName}');">
                            <span class="rrd-save-image" />
                        </a>
                    </span>
                </div>
                <div id="container">`;

            const symbols = this.backend.listTopLevelSymbols(fileName, false);
            for (const symbol of symbols) {
                if (symbol.kind === SymbolKind.LexerRule
                    || symbol.kind === SymbolKind.ParserRule
                    || symbol.kind === SymbolKind.FragmentLexerToken) {
                    const script = this.backend.getRRDScript(fileName, symbol.name);
                    diagram += `<h3 class="${symbol.name}-class">${symbol.name}</h3>
                        <script nonce="${nonce}">${script}</script>`;
                }
            }
            diagram += "</div>";
        } else {
            diagram += `
                <div class="header">
                    <span class="rrd-color">
                        <span class="graph-initial">Ⓡ</span>ule&nbsp;&nbsp;
                    </span>
                        &nbsp;&nbsp;${this.currentRule} <span class="rule-index">(rule index: ${this.currentRuleIndex})
                    </span>
                    <span class="action-box">
                        Save to SVG
                        <a onClick="graphExport.exportToSVG('rrd', '${this.currentRule}');">
                            <span class="rrd-save-image" />
                        </a>
                    </span>
                </div>
                <div id="container">
                    <script nonce="${nonce}" >${this.backend.getRRDScript(fileName, this.currentRule)}</script>
                </div>`;
        }

        diagram += `
            <script nonce="${nonce}" type="module">
                import { GraphExport } from "${exportScriptPath}";

                graphExport = new GraphExport();
            </script>
        </body></html>`;

        return diagram;
    }

    /**
     * Called when the webview must be updated. This can happen when:
     * - The user switched to another editor, which holds an ANTLR4 grammar.
     * - The user moved the caret in an editor holding a grammar.
     * - New data was generated for the grammar in that editor.
     *
     * @param editor The editor that holds a grammar.
     * @param forced If true update regardless of the selected rule (e.g. when new ATN data was generated).
     */
    public override update(editor: TextEditor, forced = false): void {
        // Keep track of the currently selected rule in the given editor and trigger a visual update
        // if the ATN graph is currently visible.
        const caret = editor.selection.active;
        const [rule, index] = this.backend.ruleFromPosition(editor.document.fileName, caret.character, caret.line + 1);

        if (!rule || index === undefined) {
            super.update(editor);

            return;
        }

        if (this.currentRule !== rule || this.currentRuleIndex !== index || forced) {
            this.currentRule = rule;
            this.currentRuleIndex = index;

            super.update(editor);
        }
    }
}
