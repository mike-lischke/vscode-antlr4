/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { basename, extname } from "path";

import { TextEditor, Uri, Webview, workspace } from "vscode";

import { SymbolKind } from "../../types.js";
import { WebviewProvider, IWebviewShowOptions } from "./WebviewProvider.js";
import { FrontendUtils } from "../FrontendUtils.js";

export class RailroadDiagramProvider extends WebviewProvider {
    public override generateContent(webview: Webview, uri: Uri, options: IWebviewShowOptions): string {
        const fileName = uri.fsPath;
        const baseName = basename(fileName, extname(fileName));

        const nonce = this.generateNonce();

        const basePath = FrontendUtils.getOutPath("", this.context, webview) + "/";
        const diagramScriptPath = FrontendUtils.getMiscPath("railroad-diagrams.js", this.context, webview);
        const diagramImports = `import { Start, Choice, ComplexDiagram, Diagram, Sequence, Stack, ` +
            `Comment, Terminal, NonTerminal, Optional, ZeroOrMore, OneOrMore, Options } from "${diagramScriptPath}";\n`;
        const exportScriptPath = FrontendUtils.getOutPath("src/webview-scripts/GraphExport.js", this.context,
            webview);
        const stripPattern = new RegExp(workspace.getConfiguration("antlr4.rrd").stripNamePart as string ?? "");
        const wrapAfter = workspace.getConfiguration("antlr4.rrd").wrapAfter as number ?? 0;

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
                <base href="${basePath}" />
                <script nonce="${nonce}">
                    let graphExport;

                    function filterElements(filter) {
                        const re = new RegExp(filter);
                        const container = document.getElementById("container");
                        const h3List = container.querySelectorAll("h3");
                        h3List.forEach((element) => {
                            const name = element.textContent;
                            if (name && !name.match(re)) {
                                element.style.display = "none";
                                element.nextElementSibling.style.display = "none";
                            } else {
                                element.style.display = "block";
                                element.nextElementSibling.style.display = "block";
                            }
                        });
                    };
                </script>
            </head>

            <body>`;

        if (options.fullList) {
            diagram += `
                <div class="header">
                    <div class="graphTitle rrd-graph-color">RRD</div>
                    <div class="saveHTMLButton" onClick="graphExport.exportToHTML('rrd', '${baseName}');"
                        title="Save all diagrams to an HTML page"
                    >
                    </div>
                    <div class="saveSVGButton" onClick="graphExport.exportToSVGFiles('rrd');"
                        title="Save all diagrams to individual files"
                    ></div>
                    <label id="filterLabel">Filter: </label>
                    <input
                        type="text" id="filter" placeholder="Example: .*List$"
                        oninput="filterElements(this.value)"
                        title="Show only elements whose names match the given regular expression"
                    />
                </div>
                <div id="container">`;

            diagram += `<script nonce="${nonce}" type="module">${diagramImports}` +
                `const parent = document.getElementById("container");
                Options.AR = 10;
                Options.VS = 16;\n`;

            const symbols = this.backend.listTopLevelSymbols(fileName, false);
            for (const symbol of symbols) {
                if (symbol.kind === SymbolKind.LexerRule
                    || symbol.kind === SymbolKind.ParserRule
                    || symbol.kind === SymbolKind.FragmentLexerToken) {
                    const [code, wrapped] = this.backend.getRRDScript(fileName, symbol.name, stripPattern, wrapAfter);
                    const name = symbol.name;

                    diagram += `Options.INTERNAL_ALIGNMENT = ${wrapped ? "'left'" : "'center'"};
                        const ${name} = document.createElement("h3"); ${name}.textContent = ` +
                        `"${symbol.name}"; ${name}.id = "${name}"; parent.appendChild(${name});
                        const ${name}SVG = ${code}.addTo(parent);
                        ${name}SVG.setAttribute("id", "${name}");
                        ${name}SVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                        ${name}SVG.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
                        `;
                }
            }
            diagram += "</script></div>";
        } else {
            const [code, wrapped] = this.backend.getRRDScript(fileName, this.currentRule, stripPattern, wrapAfter);

            diagram += `
                <div class="header">
                    <div class="graphTitle rrd-graph-color">RRD</div>
                    <div class="saveSVGButton" onClick="graphExport.exportToSVG('rrd', '${this.currentRule}');"
                        title="Save this diagram to an SVG file"
                    ></div>

                    <label class="ruleLabel">${this.currentRule}</label>
                    <div class="badge" title="The index of this rule in the grammar">${this.currentRuleIndex}</div>
                </div>
                <div id="container">
                    <script nonce="${nonce}" type="module">
                        ${diagramImports}
                        const parent = document.getElementById("container");
                        Options.INTERNAL_ALIGNMENT = ${wrapped ? "'left'" : "'center'"};
                        Options.AR = 10;
                        Options.VS = 16;
                        const svg = ${code}.addTo(parent);
                        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                        svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
                    </script>
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
