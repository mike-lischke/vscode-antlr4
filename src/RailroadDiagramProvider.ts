/*
 * This file is released under the MIT license.
 * Copyright (c) 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

const path = require("path");
import * as vscode from "vscode";

import { AntlrLanguageSupport, SymbolKind } from "antlr4-graps";

export class AntlrRailroadDiagramProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private positionCache: Map<string, vscode.Position> = new Map();

    constructor(
        private backend: AntlrLanguageSupport,
        private context: vscode.ExtensionContext
    ) { }

    public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
        const sourceUri = vscode.Uri.parse(uri.query);
        const command = uri.fragment;

        return vscode.workspace.openTextDocument(sourceUri).then(document => {
            vscode.window.showTextDocument(document);

            // We need the currently active editor for the caret position.
            // If there is one we were triggered (or activated) from that.
            // If not the user probably switched preview windows. In that case we use
            // the last position stored when we had an active editor.
            let fileName = document.fileName;
            let caret: vscode.Position | undefined;
            let editor = vscode.window.activeTextEditor;
            if (editor && editor.document == document) {
                caret = editor.selection.active;
                this.positionCache.set(fileName, caret);
            } else if (this.positionCache.has(fileName)) {
                caret = this.positionCache.get(fileName);
            }
            if (!caret) {
                return "";
            }

            let rule = this.backend.ruleFromPosition(fileName, caret.character, caret.line + 1);

            // Content Security Policy
            const nonce = new Date().getTime() + '' + new Date().getMilliseconds();
            let diagram = `<!DOCTYPE html>
                <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.getStyles(uri)}
                    <base href="${document.uri.toString(true)}">

                    <style>
                        .icon.zoom-out {
                            background-image: url("${this.getMiscPath('zoom-out.svg')}");
                        }

                        .icon.zoom-in {
                            background-image: url("${this.getMiscPath('zoom-in.svg')}");
                        }

                        .icon.zoom-reset {
                            background-image: url("${this.getMiscPath('zoom-reset.svg')}");
                           	width: 0.7em;
                            height: 1em;
                        }

                        .icon.save {
                            background-image: url("${this.getMiscPath('save.svg')}");
                        }

                    </style>
                </head>

                <body>
                ${this.getScripts(nonce)}
            `;

            if (command == "full") {
                diagram += `
                    <div class="header">
                        <span class="icon-box">
                            <a onClick="save();" style="cursor: pointer; cursor: hand;"><span class="icon save"></span></a>
                        </span>
                    </div>
                    <div id="container">`;
                var symbols = this.backend.listSymbols(document.fileName, false);
                for (let symbol of symbols) {
                    if (symbol.kind == SymbolKind.LexerToken
                        || symbol.kind == SymbolKind.ParserRule
                        || symbol.kind == SymbolKind.FragmentLexerToken) {
                        let script = this.backend.getRRDScript(fileName, symbol.name);
                        diagram += `<h3>${symbol.name}</h3>\n<script class="rrdSource">${script}</script>\n\n`;
                    }
                }
                diagram += `</div>`;
            } else {
                diagram += `
                    <div class="header">${rule}
                        <span class="icon-box">
                            <a onClick="zoom(1.25);" style="cursor: pointer; cursor: hand;"><span class="icon zoom-in"></span></a>
                            <a onClick="resetZoom();" style="cursor: pointer; cursor: hand;"><span class="icon zoom-reset"></span></a>
                            <a onClick="zoom(0.82);" style="cursor: pointer; cursor: hand;"><span class="icon zoom-out"></span></a>
                            <a onClick="save();" style="cursor: pointer; cursor: hand;"><span class="icon save"></span></a>
                        </span>
                    </div>
                    <div id="container" style="transform: scale(1, 1); transform-origin: 0 0; width: 100%">
                        <script class="rrdSource">${this.backend.getRRDScript(fileName, rule)}</script>
                    </div>
                `;
            }
            diagram += `</body></html>`;

            return diagram;
        });
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    // A few support functions taken from the markdown preview extension.
    private getMiscPath(file: string): string {
        return vscode.Uri.file(this.context.asAbsolutePath(path.join('misc', file))).toString();
    }

    private isAbsolute(p: string): boolean {
        return path.normalize(p + '/') === path.normalize(path.resolve(p) + '/');
    }

    private fixHref(resource: vscode.Uri, href: string): string {
        if (!href) {
            return href;
        }

        // Use href if it is already an URL.
        if (vscode.Uri.parse(href).scheme) {
            return href;
        }

        // Use href as file URI if it is absolute.
        if (this.isAbsolute(href)) {
            return vscode.Uri.file(href).toString();
        }

        // Use a workspace relative path if there is a workspace.
        let rootPath = vscode.workspace.rootPath;
        if (rootPath) {
            return vscode.Uri.file(path.join(rootPath, href)).toString();
        }

        // Otherwise look relative to the grammar file.
        return vscode.Uri.file(path.join(path.dirname(resource.fsPath), href)).toString();
    }

    private computeCustomStyleSheetIncludes(uri: vscode.Uri): string {
        const styles = vscode.workspace.getConfiguration('antlr4.rrd')['customcss'];
        if (styles && Array.isArray(styles) && styles.length > 0) {
            return styles.map((style) => {
                return `<link rel="stylesheet" href="${this.fixHref(uri, style)}" type="text/css" media="screen">`;
            }).join('\n');
        }
        return '';
    }

    private getStyles(uri: vscode.Uri): string {
        const baseStyles = [
            this.getMiscPath('rrd.css')
        ];

        return `${baseStyles.map(href => `<link rel="stylesheet" type="text/css" href="${href}">`).join('\n')}
			${this.computeCustomStyleSheetIncludes(uri)}`;
    }

    private getScripts(nonce: string): string {
        const scripts = [
            this.getMiscPath('utils.js'),
            this.getMiscPath("railroad-diagrams.js")
        ];
        return scripts
            .map(source => `<script src="${source}" nonce="${nonce}"></script>`).join('\n');
    }

}

export function getRrdUri(uri: vscode.Uri, command: string): vscode.Uri {
    return uri.with({ scheme: 'antlr.rrd', path: uri.fsPath, fragment: command, query: uri.toString() });
}
