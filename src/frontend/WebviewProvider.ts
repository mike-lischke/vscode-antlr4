/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

const path = require("path");

import { AntlrFacade, SymbolKind } from "../backend/facade";
import { Utils } from "./Utils";
import { window, workspace, TextEditor, ExtensionContext, Uri, WebviewPanel, Webview, ViewColumn } from "vscode";

export interface WebviewShowOptions {
    title: string;
    [key: string]: boolean | number | string;
}

/**
 * The base class for all text document content providers, holding a number of support members needed by them.
 */
export class WebviewProvider {
    protected currentRule: string | undefined;
    protected currentRuleIndex: number | undefined;
    protected currentEditor: TextEditor | undefined;

    constructor(
        protected backend: AntlrFacade,
        protected context: ExtensionContext
    ) { }

    public showWebview(source: TextEditor | Uri, options: WebviewShowOptions) {
        this.currentEditor = (source instanceof Uri) ? undefined : source;
        let uri = (source instanceof Uri) ? source : source.document.uri;
        let uriString = uri.toString();
        if (this.webViewMap.has(uriString)) {
            let [panel, _] = this.webViewMap.get(uriString)!;
            panel.title = options.title;
            if (!this.updateContent(uri)) {
                panel.webview.html = this.generateContent(panel.webview,
                    this.currentEditor ? this.currentEditor : uri, options);
            }

            return;
        }

        let panel = window.createWebviewPanel(
            'antlr4-vscode-webview', options.title, ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        this.webViewMap.set(uriString, [panel, options]);

        panel.webview.html = this.generateContent(panel.webview,
            this.currentEditor ? this.currentEditor : uri, options);
        panel.onDidDispose(() => {
            this.webViewMap.delete(uriString);
        }, null, this.context.subscriptions);

        panel.webview.onDidReceiveMessage(message => {
            if (this.handleMessage(message)) {
                return;
            }

            switch (message.command) {
                case "alert": {
                    window.showErrorMessage(message.text);
                    return;
                }

                case "saveSVG": {
                    let css: string[] = [];
                    css.push(Utils.getMiscPath("light.css", this.context));
                    let customStyles = workspace.getConfiguration("antlr4")['customcss'];
                    if (customStyles && Array.isArray(customStyles)) {
                        for (let style of customStyles) {
                            css.push(style);
                        }
                    }

                    let svg = '<?xml version="1.0" standalone="no"?>\n'
                    for (let stylesheet of css) {
                        svg += `<?xml-stylesheet href="${path.basename(stylesheet)}" type="text/css"?>\n`;
                    }

                    svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
                        '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' + message.svg;

                    try {
                        Utils.exportDataWithConfirmation(path.join(workspace.getConfiguration("antlr4." + message.type)["saveDir"] || "",
                           message.name + "." + message.type), { "SVG": ["svg"] }, svg, css);
                    } catch (error) {
                        window.showErrorMessage("Couldn't write SVG file: " + error);
                    }

                    break;
                }

                case "saveHTML": {
                    let css: string[] = [];
                    css.push(Utils.getMiscPath("light.css", this.context));
                    css.push(Utils.getMiscPath("dark.css", this.context));
                    let customStyles = workspace.getConfiguration("antlr4")['customcss'];
                    if (customStyles && Array.isArray(customStyles)) {
                        for (let style of customStyles) {
                            css.push(style);
                        }
                    }

                    try {
                        Utils.exportDataWithConfirmation(path.join(workspace.getConfiguration("antlr4." + message.type)["saveDir"] || "",
                            message.name + "." + message.type), { "HTML": ["html"] }, message.html, css);
                    } catch (error) {
                        window.showErrorMessage("Couldn't write HTML file: " + error);
                    }
                    break;
                }
            }
        }, undefined, this.context.subscriptions);
    }

    protected generateContent(webView: Webview, source: TextEditor | Uri, options: WebviewShowOptions): string {
        return "";
    }

    protected generateContentSecurityPolicy(_: TextEditor | Uri): string {
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'self';
            script-src vscode-resource: 'self' 'unsafe-inline' 'unsafe-eval' https:;
            style-src vscode-resource: 'self' 'unsafe-inline';
            img-src vscode-resource: 'self' "/>
        `;
    }

    protected updateContent(uri: Uri): boolean {
        return false;
    }

    public update(editor: TextEditor) {
        if (this.webViewMap.has(editor.document.uri.toString())) {
            let [panel, options] = this.webViewMap.get(editor.document.uri.toString())!;
            if (!this.updateContent(editor.document.uri)) {
                panel.webview.html = this.generateContent(panel.webview, editor, options);
            }
        }
    }

    protected sendMessage(uri: Uri, args: any): boolean {
        if (this.webViewMap.has(uri.toString())) {
            let [panel, _] = this.webViewMap.get(uri.toString())!;
            panel.webview.postMessage(args);
            return true;
        }
        return false;
    }

    // Can be overridden by descendants to handle specific messages.
    // Must return true when default handling shouldn't take place.
    protected handleMessage(message: any): boolean {
        return false;
    }

    protected getStyles(webView: Webview): string {
        const baseStyles = [
            Utils.getMiscPath("light.css", this.context, webView),
            Utils.getMiscPath("dark.css", this.context, webView)
        ];

        let defaults = baseStyles.map(link => `<link rel="stylesheet" type="text/css" href="${link}">`).join('\n');

        const paths = workspace.getConfiguration("antlr4")['customcss'];
        if (paths && Array.isArray(paths) && paths.length > 0) {
            return defaults + "\n" + paths.map(path =>
              `<link rel="stylesheet" href="${webView.asWebviewUri(path)}" type="text/css" media="screen">`).join('\n');
        }
        return defaults;
    }

    protected getScripts(nonce: string, scripts: string[]): string {
        return scripts
            .map(source => `<script type="text/javascript" src="${source}" nonce="${nonce}"></script>`).join('\n');
    }

    /**
     * Queries the current text editor for a caret position (or loads that from the position cache)
     * and tries to get a rule from the backend.
     */
    protected findCurrentRule(editor: TextEditor): [string | undefined, number | undefined] {
        let fileName = editor.document.uri.fsPath;
        let caret = editor.selection.active;

        let result = this.backend.ruleFromPosition(fileName, caret.character, caret.line + 1);
        if (!result)
            return [undefined, undefined];
        return result;
    }


    // Keep track of all created panels, to avoid duplicates.
    private webViewMap: Map<String, [WebviewPanel, WebviewShowOptions]> = new Map();
}
