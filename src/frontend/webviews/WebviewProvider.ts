/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { join } from "path";

import { window, workspace, TextEditor, ExtensionContext, Uri, WebviewPanel, Webview, ViewColumn } from "vscode";

import { AntlrFacade } from "../../backend/facade.js";
import { FrontendUtils } from "../FrontendUtils.js";

export interface IWebviewShowOptions {
    fullList?: boolean;

    title: string;
}

export interface IWebviewMessage {
    [key: string]: unknown;
}

/**
 * The base class for all text document content providers, holding a number of support members needed by them.
 */
export class WebviewProvider {
    protected currentRule: string | undefined;
    protected currentRuleIndex: number | undefined;

    // Keep track of all created panels, to avoid duplicates.
    private webViewMap = new Map<String, [WebviewPanel, IWebviewShowOptions]>();

    public constructor(protected backend: AntlrFacade, protected context: ExtensionContext) { }

    public showWebview(uri: Uri, options: IWebviewShowOptions): void {
        const uriString = uri.toString();

        if (this.webViewMap.has(uriString)) {
            const [existingPanel] = this.webViewMap.get(uriString)!;
            existingPanel.title = options.title;
            this.webViewMap.set(uriString, [existingPanel, options]);
            if (!this.updateContent(uri)) {
                existingPanel.webview.html = this.generateContent(existingPanel.webview, uri, options);
            }

            return;
        }

        const panel = window.createWebviewPanel("antlr4-vscode-webview", options.title, ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        this.webViewMap.set(uriString, [panel, options]);

        panel.onDidDispose(() => {
            this.webViewMap.delete(uriString);
        });

        panel.webview.html = this.generateContent(panel.webview, uri, options);

        panel.webview.onDidReceiveMessage((message: IWebviewMessage) => {
            if (this.handleMessage(message)) {
                return;
            }

            switch (message.command) {
                case "saveSVG": { // Save a single file, with confirmation.
                    if (typeof message.svg === "string" && typeof message.name === "string") {
                        const css: string[] = [];
                        css.push(FrontendUtils.getMiscPath("light.css", this.context));

                        const customStyles = workspace.getConfiguration("antlr4")
                            .customCSS as string | string[] | undefined;
                        if (customStyles && Array.isArray(customStyles)) {
                            for (const style of customStyles) {
                                css.push(style);
                            }
                        } else if (customStyles) {
                            css.push(customStyles);
                        }

                        let svg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n';
                        svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
                            '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' + message.svg;

                        let cssText = `<defs><style type="text/css"><![CDATA[\n`;
                        for (const stylesheet of css) {
                            const styles = FrontendUtils.readFile(stylesheet);
                            cssText += this.extractRRDStyles(styles) + "\n";
                        }
                        cssText += ` ]]>\n</style></defs></svg>`;

                        svg = svg.replace("</svg>", cssText);

                        try {
                            if (typeof message.type === "string") {
                                const section = "antlr4." + message.type;
                                const saveDir = workspace.getConfiguration(section).saveDir as string ?? "";

                                if (message.command === "saveSVG") {
                                    const target = join(saveDir, message.name + "." + message.type);
                                    FrontendUtils.exportDataWithConfirmation(target,
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        { "Scalable Vector Graphic": ["svg"] }, svg, []);
                                }
                            }
                        } catch (error) {
                            void window.showErrorMessage("Couldn't write SVG file: " + String(error));
                        }
                    }

                    break;
                }

                case "saveSVGDirect": { // Save a list of files, without confirmation.
                    const css: string[] = [];
                    css.push(FrontendUtils.getMiscPath("light.css", this.context));

                    const customStyles = workspace.getConfiguration("antlr4")
                        .customCSS as string | string[] | undefined;
                    if (customStyles && Array.isArray(customStyles)) {
                        for (const style of customStyles) {
                            css.push(style);
                        }
                    } else if (customStyles) {
                        css.push(customStyles);
                    }

                    let svg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n';
                    svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
                        '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';

                    let cssText = `<defs><style type="text/css"><![CDATA[\n`;
                    for (const stylesheet of css) {
                        const styles = FrontendUtils.readFile(stylesheet);
                        cssText += this.extractRRDStyles(styles) + "\n";
                    }
                    cssText += ` ]]>\n</style></defs></svg>`;

                    try {
                        if (typeof message.type === "string") {
                            const section = "antlr4." + message.type;
                            const saveDir = workspace.getConfiguration(section).saveDir as string ?? "";

                            const data = message.data as { [key: string]: string; };
                            for (const [key, value] of Object.entries(data)) {
                                const target = join(saveDir, key + ".svg");

                                const content = svg + value.replace("</svg>", cssText);
                                FrontendUtils.exportData(target, content);
                            }
                        }

                        void window.showInformationMessage("Diagrams successfully written.");
                    } catch (error) {
                        void window.showErrorMessage("Couldn't write SVG file: " + String(error));
                    }

                    break;
                }

                case "saveHTML": {
                    if (typeof message.type === "string" && typeof message.name === "string") {
                        const css: string[] = [];
                        css.push(FrontendUtils.getMiscPath("light.css", this.context));
                        css.push(FrontendUtils.getMiscPath("dark.css", this.context));
                        const customStyles = workspace.getConfiguration("antlr4").customCSS as string | string[];
                        if (customStyles && Array.isArray(customStyles)) {
                            for (const style of customStyles) {
                                css.push(style);
                            }
                        }

                        try {
                            const section = "antlr4." + message.type;
                            const saveDir = workspace.getConfiguration(section).saveDir as string ?? "";
                            const target = join(saveDir, message.name + "." + message.type);
                            FrontendUtils.exportDataWithConfirmation(target,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                { HTML: ["html"] }, message.html as string, css);
                        } catch (error) {
                            void window.showErrorMessage("Couldn't write HTML file: " + String(error));
                        }
                    }

                    break;
                }

                default: {
                    break;
                }
            }
        }, undefined, this.context.subscriptions);
    }

    public update(editor: TextEditor): void {
        if (this.webViewMap.has(editor.document.uri.toString())) {
            const [panel, options] = this.webViewMap.get(editor.document.uri.toString())!;
            if (!this.updateContent(editor.document.uri)) {
                panel.webview.html = this.generateContent(panel.webview, editor.document.uri, options);
            }
        }
    }

    protected generateContent(_webview: Webview, _source: Uri, _options: IWebviewShowOptions): string {
        return "";
    }

    /**
     * Constructs the required CSP entry for webviews, which allows them to load local files.
     *
     * @param webview The view for which to return the CSP tag.
     * @param nonce A nonce for scripts.
     *
     * @returns The CSP string.
     */
    protected generateContentSecurityPolicy(webview: Webview, nonce: string): string {
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none';
            script-src 'nonce-${nonce}';
            script-src-attr 'unsafe-inline';
            font-src ${webview.cspSource};
            style-src ${webview.cspSource} 'self' 'unsafe-inline';
            img-src ${webview.cspSource} 'self' "/>
        `;
    }

    protected updateContent(_uri: Uri): boolean {
        return false;
    }

    protected sendMessage(uri: Uri, args: IWebviewMessage): boolean {
        if (this.webViewMap.has(uri.toString())) {
            const [panel] = this.webViewMap.get(uri.toString())!;
            void panel.webview.postMessage(args);

            return true;
        }

        return false;
    }

    // Can be overridden by descendants to handle specific messages.
    // Must return true when default handling shouldn't take place.
    protected handleMessage(_message: IWebviewMessage): boolean {
        return false;
    }

    protected getStyles(webView: Webview): string {
        const baseStyles = [
            FrontendUtils.getMiscPath("common.css", this.context, webView),
            FrontendUtils.getMiscPath("light.css", this.context, webView),
            FrontendUtils.getMiscPath("dark.css", this.context, webView),
        ];

        const defaults = baseStyles.map((link) => {
            return `<link rel="stylesheet" type="text/css" href="${link}">`;
        }).join("\n");

        const paths = workspace.getConfiguration("antlr4").customCSS as string | string[];
        if (paths && Array.isArray(paths) && paths.length > 0) {
            return defaults + "\n" + paths.map((stylePath) => {
                return `<link rel="stylesheet" href="${webView.asWebviewUri(Uri.parse(stylePath)).toString()}" ` +
                    "type=\"text/css\" media=\"screen\" />";
            }).join("\n");
        }

        return defaults;
    }

    protected getScripts(nonce: string, scripts: string[]): string {
        return scripts.map((source) => {
            return `<script type="module" src="${source}" nonce="${nonce}"></script>`;
        }).join("\n");
    }

    protected generateNonce(): string {
        return `${new Date().getTime()}${new Date().getMilliseconds()}`;
    }

    /**
     * Helper method to extract and minify the style sheet content from a given text.
     *
     * @param text The text to extract the style sheet from.
     *
     * @returns The extracted style sheet.
     */
    private extractRRDStyles(text: string): string {
        const first = text.indexOf("svg.railroad-diagram");
        let last = text.lastIndexOf("svg.railroad-diagram");
        last = text.lastIndexOf("}", last);

        const result = text.substring(first, last + 1);

        return result.replace(/\n/g, "").replace(/\s\s+/g, " ");
    }
}
