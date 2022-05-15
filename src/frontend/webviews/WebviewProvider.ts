/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { basename, join } from "path";

import { window, workspace, TextEditor, ExtensionContext, Uri, WebviewPanel, Webview, ViewColumn } from "vscode";

import { AntlrFacade } from "../../backend/facade";
import { FrontendUtils } from "../FrontendUtils";

export interface IWebviewShowOptions {
    [key: string]: boolean | number | string;

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
                case "alert": {
                    if (typeof message.text === "string") {
                        void window.showErrorMessage(message.text);
                    } else {
                        void window.showErrorMessage(String(message));
                    }

                    return;
                }

                case "saveSVG": {
                    if (typeof message.svg === "string" && typeof message.name === "string") {
                        const css: string[] = [];
                        css.push(FrontendUtils.getMiscPath("light.css", this.context));
                        const customStyles = workspace.getConfiguration("antlr4").customCSS as string | string[];
                        if (customStyles && Array.isArray(customStyles)) {
                            for (const style of customStyles) {
                                css.push(style);
                            }
                        }

                        let svg = '<?xml version="1.0" standalone="no"?>\n';
                        for (const stylesheet of css) {
                            svg += `<?xml-stylesheet href="${basename(stylesheet)}" type="text/css"?>\n`;
                        }

                        svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
                            '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' + message.svg;

                        try {
                            if (typeof message.type === "string") {
                                const section = "antlr4." + message.type;
                                const saveDir = workspace.getConfiguration(section).saveDir as string ?? "";
                                const target = join(saveDir, message.name + "." + message.type);
                                FrontendUtils.exportDataWithConfirmation(target,
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    { "Scalable Vector Graphic": ["svg"] }, svg, css,
                                );
                            }
                        } catch (error) {
                            void window.showErrorMessage("Couldn't write SVG file: " + String(error));
                        }
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

    protected generateContent(_webView: Webview, _source: Uri, _options: IWebviewShowOptions): string {
        return "";
    }

    /**
     * Constructs the required CSP entry for webviews, which allows them to load local files.
     *
     * @returns The CSP string.
     */
    protected generateContentSecurityPolicy(): string {
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'self';
            script-src vscode-resource: 'self' 'unsafe-inline' 'unsafe-eval' https:;
            style-src vscode-resource: 'self' 'unsafe-inline';
            img-src vscode-resource: 'self' "/>
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
                    "type=\"text/css\" media=\"screen\">";
            }).join("\n");
        }

        return defaults;
    }

    protected getScripts(nonce: string, scripts: string[]): string {
        return scripts.map((source) => {
            return `<script type="text/javascript" src="${source}" nonce="${nonce}"></script>`;
        }).join("\n");
    }

    protected generateNonce(): string {
        return `${new Date().getTime()}${new Date().getMilliseconds()}`;
    }
}
