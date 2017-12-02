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
import { Utils } from "./Utils";

/**
 * The base class for all text document content providers, holding a number of support members needed them.
 */
export class AntlrTextContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    protected positionCache: Map<string, vscode.Position> = new Map();
    protected currentRule: string | undefined;
    protected currentRuleIndex: number | undefined;
    protected lastUri: vscode.Uri | undefined; // Vscode doesn't tell us which editor lost activation on switch.

    constructor(
        protected backend: AntlrLanguageSupport,
        protected context: vscode.ExtensionContext
    ) { }

    public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
        return new Promise(function (resolve, reject) {
            resolve("");
        });
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    // A few support functions taken from the markdown preview extension.
    protected fixHref(resource: vscode.Uri, href: string): string {
        if (!href) {
            return href;
        }

        // Use href if it is already an URL.
        if (vscode.Uri.parse(href).scheme) {
            return href;
        }

        // Use href as file URI if it is absolute.
        if (Utils.isAbsolute(href)) {
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

    protected computeCustomStyleSheetIncludes(uri: vscode.Uri, section: string): string {
        const styles = vscode.workspace.getConfiguration("antlr4." + section)['customcss'];
        if (styles && Array.isArray(styles) && styles.length > 0) {
            return styles.map((style) => {
                return `<link rel="stylesheet" href="${this.fixHref(uri, style)}" type="text/css" media="screen">`;
            }).join('\n');
        }
        return '';
    }

    protected getStyles(uri: vscode.Uri, section: string): string {
        const baseStyles = [
            Utils.getMiscPath(section + ".css", this.context),
            Utils.getMiscPath(section + "-dark.css", this.context)
        ];

        return `${baseStyles.map(href => `<link rel="stylesheet" type="text/css" href="${href}">`).join('\n')}
			${this.computeCustomStyleSheetIncludes(uri, section)}`;
    }

    protected getScripts(nonce: string, scripts: string[]): string {
        return scripts
            .map(source => `<script type="text/javascript" src="${source}" nonce="${nonce}"></script>`).join('\n');
    }

    /**
     * Queries the current text editor for a caret position (or loads that from the position cache)
     * and tries to get a rule from the backend.
     */
    protected findCurrentRule(editorUri: vscode.Uri): [string | undefined, number | undefined] {
        // We need the currently active editor for the caret position.
        // If there is one we were triggered (or activated) from that.
        // If not the user probably switched preview windows. In that case we use
        // the last position stored when we had an active editor.
        let fileName = editorUri.fsPath;
        let caret: vscode.Position | undefined;
        let editor = vscode.window.activeTextEditor;
        if (editor && editor.document.uri.fsPath === editorUri.fsPath) {
            caret = editor.selection.active;
            this.positionCache.set(fileName, caret);
        } else if (this.positionCache.has(fileName)) {
            caret = this.positionCache.get(fileName);
        }
        if (!caret) {
            return [undefined, undefined];
        }

        let result = this.backend.ruleFromPosition(fileName, caret.character, caret.line + 1);
        if (!result)
            return [undefined, undefined];
        return result;
    }
}

export function getTextProviderUri(uri: vscode.Uri, section: string, command: string): vscode.Uri {
    return uri.with({ scheme: "antlr." + section, path: uri.fsPath, fragment: command, query: uri.toString() });
}
