/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

interface IVSCode {
    postMessage(message: { [key: string]: unknown }): void;
    getState(): unknown;
    setState(state: unknown): void;
}

declare const acquireVsCodeApi: () => IVSCode;

const vscode = acquireVsCodeApi();

// These values directly correspond to the settings section names containing a "saveDir" entry.
export type GraphType = "rrd" | "atn" | "call-graph";

export class Communication {
    /**
     * Used for debugging, to show a message.
     *
     * @param message The message to show.
     */
    public static showMessage(message: string): void {
        vscode.postMessage({ command: "alert", text: message });
    }

    /**
     * Triggers the SVG export for a graph.
     *
     * @param type The type of the graph.
     * @param name A name for that graph.
     */
    public static exportToSVG(type: GraphType, name: string): void {
        // Saving the SVG is delegated to the extension to allow asking the user for a target file.
        const svg = document.querySelectorAll("svg")[0];
        const args = {
            command: "saveSVG",
            name,
            type,
            svg: svg.outerHTML,
        };

        vscode.postMessage(args);
    }

    /**
     * Triggers the HTML export for a graph.
     *
     * @param type The type of the graph.
     * @param name A name for that graph.
     */
    public static exportToHTML(type: GraphType, name: string): void {
        // When exporting the HTML content we have to remove our scripts (e.g. to avoid running image
        // generation again which happened already in vscode) and other internal elements.
        // Additionally we have to make all style sheet references relative.
        // That requires a deep copy of the entire DOM to avoid messing with the webview display.
        try {
            const workDocument = document.cloneNode(true) as Document;
            workDocument.querySelectorAll("script").forEach((e) => {
                e.parentNode?.removeChild(e);
            });

            workDocument.querySelectorAll(".header").forEach((e) => {
                e.parentNode?.removeChild(e);
            });

            workDocument.querySelectorAll("link").forEach((e) => {
                e.href = e.href.replace(/^.*[\\/]/, "");
            });

            const html = workDocument.querySelectorAll("html")[0];
            const args = { command: "saveHTML", name, type, html: html.outerHTML };

            vscode.postMessage(args);
        } catch (error) {
            this.showMessage("JS Error: " + String(error));
        }
    }

    static {
        // Used to send messages from the extension to this webview.
        window.addEventListener("message", (event) => {
            switch (event.data.command) {
                /*case "cacheATNLayout": {
                    const args = {
                        command: "saveATNState",
                        nodes,
                        file: event.data.file,
                        rule: event.data.rule,
                        transform: parseTreeRenderer.transform,
                    };

                    vscode.postMessage(args);
                    break;
                }*/

                case "updateParseTreeData": {
                    //parseTreeRenderer.loadNewTree({ parseTreeData: event.data.treeData });

                    break;
                }

                default:
            }
        });
    }
}
