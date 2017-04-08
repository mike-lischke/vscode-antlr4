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
    private waiting: boolean = false;
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private positionCache: Map<string, vscode.Position> = new Map();

    constructor(
        private backend: AntlrLanguageSupport,
        private context: vscode.ExtensionContext
    ) { }

    public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
        const sourceUri = vscode.Uri.parse(uri.query);

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
            let scriptPath = path.resolve(__dirname, 'railroad-diagrams.js');

			// Content Security Policy
			const nonce = new Date().getTime() + '' + new Date().getMilliseconds();
            let diagram = `<!DOCTYPE html>
                <html>
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.getStyles(uri)}
                    <base href="${document.uri.toString(true)}">
                </head>

                <body>
                <script>

                </script>
                ${this.getScripts(nonce)}
                Zoom: <span style="font-size: 30px;">
                    <a onClick="zoom(1.25);" style="cursor: pointer; cursor: hand;">⊕</a>
                    <a onClick="resetZoom();" style="cursor: pointer; cursor: hand;">⊙</a>
                    <a onClick="zoom(0.82);" style="cursor: pointer; cursor: hand;">⊖</a>
                </span>

                <h1>${rule}</h1>
                <div id="container" style="transform: scale(1, 1); transform-origin: 0 0;">
                    <script> ${this.backend.getRRDScript(fileName, rule)}</script>
                </div>
            </body></html>`;

            return diagram;
        });
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        if (!this.waiting) {
            this.waiting = true;
            setTimeout(() => {
                this.waiting = false;
                this._onDidChange.fire(uri);
            }, 300);
        }
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
			.map(source => `<script src="${source}" nonce="${nonce}"></script>`)
			.join('\n');
	}

}

export function getRrdUri(uri: vscode.Uri): vscode.Uri {
    return uri.with({ scheme: 'antlr.rrd', path: uri.fsPath + '.rendered', query: uri.toString() });
}
