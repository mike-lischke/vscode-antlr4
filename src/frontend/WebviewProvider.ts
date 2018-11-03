/*
 * This file is released under the MIT license.
 * Copyright (c) 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

const path = require("path");

import { AntlrFacade, SymbolKind } from "../backend/facade";
import { Utils } from "./Utils";
import { window, workspace, TextEditor, ExtensionContext, Uri, WebviewPanel, Position, ViewColumn } from "vscode";

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
    protected lastEditor: TextEditor | undefined; // Vscode doesn't tell us which editor lost activation on switch.

    constructor(
        protected backend: AntlrFacade,
        protected context: ExtensionContext
    ) { }

    public showWebview(source: TextEditor | Uri, options: WebviewShowOptions) {
        this.lastEditor = (source instanceof Uri) ? undefined : source;
        let uri = (source instanceof Uri) ? source : source.document.uri;
        if (this.webViewMap.has(uri)) {
            let [panel, _] = this.webViewMap.get(uri)!;
            panel.title = options.title;
            panel.webview.html = this.generateContent(this.lastEditor ? this.lastEditor : uri, options);
            //panel.reveal(); Steals focus.
            return;
        }

        let panel = window.createWebviewPanel(
            'antlr4-vscode-webview', options.title, ViewColumn.Two,
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
                    css.push(Utils.getMiscPath("light.css", this.context, false));
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
                    css.push(Utils.getMiscPath("light.css", this.context, false));
                    css.push(Utils.getMiscPath("dark.css", this.context, false));
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

    protected generateContent(source: TextEditor | Uri, options: WebviewShowOptions): string {
        return "";
    }

    public update(editor: TextEditor) {
        if (this.webViewMap.has(editor.document.uri)) {
            let [panel, options] = this.webViewMap.get(editor.document.uri)!;
            panel.webview.html = this.generateContent(editor, options);
            //panel.reveal();
        }
    }

    protected sendMessage(editor: TextEditor, args: any): boolean {
        if (this.webViewMap.has(editor.document.uri)) {
            let [panel, options] = this.webViewMap.get(editor.document.uri)!;
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

    // A few support functions taken from the markdown preview extension.
    protected fixHref(resource: Uri, href: string): string {
        if (!href) {
            return href;
        }

        // Use href if it is already an URL.
        if (Uri.parse(href).scheme) {
            return href;
        }

        // Use href as file URI if it is absolute.
        if (Utils.isAbsolute(href)) {
            return Uri.file(href).with({ scheme: 'vscode-resource' }).toString();
        }

        // Use a workspace relative path if there is a workspace.
        let rootPath = workspace.rootPath;
        if (rootPath) {
            return Uri.file(path.join(rootPath, href)).with({ scheme: 'vscode-resource' }).toString();
        }

        // Otherwise look relative to the grammar file.
        return Uri.file(path.join(path.dirname(resource.fsPath), href)).with({ scheme: 'vscode-resource' }).toString();
    }

    protected computeCustomStyleSheetIncludes(uri: Uri): string {
        const styles = workspace.getConfiguration("antlr4")['customcss'];
        if (styles && Array.isArray(styles) && styles.length > 0) {
            return styles.map((style) => {
                return `<link rel="stylesheet" href="${this.fixHref(uri, style)}" type="text/css" media="screen">`;
            }).join('\n');
        }
        return '';
    }

    protected getStyles(uri: Uri): string {
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
    protected findCurrentRule(editor: TextEditor): [string | undefined, number | undefined] {
        let fileName = editor.document.uri.fsPath;
        let caret: Position | undefined;
        caret = editor.selection.active;

        let result = this.backend.ruleFromPositionFast(fileName, editor.document.getText(), caret.character, caret.line + 1);
        if (!result)
            return [undefined, undefined];
        return result;
    }


    // Keep track of all created panels, to avoid duplicates.
    private webViewMap: Map<Uri, [WebviewPanel, WebviewShowOptions]> = new Map();
}
