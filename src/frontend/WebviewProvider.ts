/*
 * This file is released under the MIT license.
 * Copyright (c) 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

const path = require("path");
import * as vscode from "vscode";

import { AntlrFacade, SymbolKind } from "../backend/facade";
import { Utils } from "./Utils";

export interface WebviewShowOptions {
    title: string;
    [key: string]: boolean | number | string;
}

/**
 * The base class for all text document content providers, holding a number of support members needed them.
 */
export class WebviewProvider {
    protected currentRule: string | undefined;
    protected currentRuleIndex: number | undefined;
    protected lastEditor: vscode.TextEditor | undefined; // Vscode doesn't tell us which editor lost activation on switch.

    constructor(
        protected backend: AntlrFacade,
        protected context: vscode.ExtensionContext
    ) { }

    public showWebview(source: vscode.TextEditor | vscode.Uri, options: WebviewShowOptions) {
        this.lastEditor = (source instanceof vscode.Uri) ? undefined : source;
        let uri = (source instanceof vscode.Uri) ? source : source.document.uri;
        if (this.webViewMap.has(uri)) {
            let [panel, _] = this.webViewMap.get(uri);
            panel.title = options.title;
            panel.webview.html = this.generateContent(this.lastEditor ? this.lastEditor : uri, options);
            //panel.reveal(); Steals focus.
            return;
        }

        let panel = vscode.window.createWebviewPanel(
            'antlr4-vscode-webview', options.title, vscode.ViewColumn.Three,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        this.webViewMap.set(uri, [panel, options]);

        panel.webview.html = this.generateContent(this.lastEditor ? this.lastEditor : uri, options);
        panel.onDidDispose(() => {
            this.webViewMap.delete(uri);
        }, null, this.context.subscriptions);
    }

    public generateContent(source: vscode.TextEditor | vscode.Uri, options: WebviewShowOptions): string {
        return "";
    }

    public update(editor: vscode.TextEditor) {
        if (this.webViewMap.has(editor.document.uri)) {
            let [panel, options] = this.webViewMap.get(editor.document.uri);
            panel.webview.html = this.generateContent(editor, options);
            //panel.reveal();
        }
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
            return vscode.Uri.file(href).with({ scheme: 'vscode-resource' }).toString();
        }

        // Use a workspace relative path if there is a workspace.
        let rootPath = vscode.workspace.rootPath;
        if (rootPath) {
            return vscode.Uri.file(path.join(rootPath, href)).with({ scheme: 'vscode-resource' }).toString();
        }

        // Otherwise look relative to the grammar file.
        return vscode.Uri.file(path.join(path.dirname(resource.fsPath), href)).with({ scheme: 'vscode-resource' }).toString();
    }

    protected computeCustomStyleSheetIncludes(uri: vscode.Uri): string {
        const styles = vscode.workspace.getConfiguration("antlr4")['customcss'];
        if (styles && Array.isArray(styles) && styles.length > 0) {
            return styles.map((style) => {
                return `<link rel="stylesheet" href="${this.fixHref(uri, style)}" type="text/css" media="screen">`;
            }).join('\n');
        }
        return '';
    }

    protected getStyles(uri: vscode.Uri): string {
        const baseStyles = [
            Utils.getMiscPath("light.css", this.context, true),
            Utils.getMiscPath("dark.css", this.context, true)
        ];

        return `${baseStyles.map(href => `<link rel="stylesheet" type="text/css" href="${href}">`).join('\n')}
			${this.computeCustomStyleSheetIncludes(uri)}`;
    }

    protected getScripts(nonce: string, scripts: string[]): string {
        return scripts
            .map(source => `<script type="text/javascript" src="${source}" nonce="${nonce}"></script>`).join('\n');
    }

    /**
     * Queries the current text editor for a caret position (or loads that from the position cache)
     * and tries to get a rule from the backend.
     */
    protected findCurrentRule(editor: vscode.TextEditor): [string | undefined, number | undefined] {
        let fileName = editor.document.uri.fsPath;
        let caret: vscode.Position | undefined;
        caret = editor.selection.active;

        let result = this.backend.ruleFromPosition(fileName, caret.character, caret.line + 1);
        if (!result)
            return [undefined, undefined];
        return result;
    }


    // Keep track of all created panels, to avoid duplicates.
    private webViewMap: Map<vscode.Uri, [vscode.WebviewPanel, WebviewShowOptions]> = new Map();
}
