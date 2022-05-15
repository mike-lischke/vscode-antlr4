/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2021, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as fs from "fs-extra";
import * as path from "path";

import { WebviewProvider, IWebviewMessage } from "./WebviewProvider";
import { FrontendUtils } from "../FrontendUtils";
import { window, workspace, Uri, TextEditor, Webview } from "vscode";
import { IATNGraphLayoutNode } from "../../webview-scripts/types";

// ATN graph state info for a single rule.
export interface IAtnStateEntry {
    scale: number;
    translation: { x: number; y: number };
    states: Array<{ id: number; fx?: number | null; fy?: number | null }>;
}

interface IATNStateSaveMessage extends IWebviewMessage {
    command: "saveATNState";
    nodes: IATNGraphLayoutNode[];
    file: string;
    rule: string;
    transform: d3.ZoomTransform;
}

export class ATNGraphProvider extends WebviewProvider {

    // All ATN state entries per file, per rule. Initially filled from the extension code.
    public static atnStates = new Map<string, Map<string, IAtnStateEntry>>();

    // Set by the update method if there's cached state data for the current rule.
    private cachedRuleStates: IAtnStateEntry | undefined;

    public static addStatesForGrammar(root: string, grammar: string): void {
        const hash = FrontendUtils.hashForPath(grammar);
        const atnCacheFile = path.join(root, "cache", hash + ".atn");
        if (fs.existsSync(atnCacheFile)) {
            const data = fs.readFileSync(atnCacheFile, { encoding: "utf-8" });
            try {
                const fileEntry = new Map<string, IAtnStateEntry>(JSON.parse(data) as Map<string, IAtnStateEntry>);
                ATNGraphProvider.atnStates.set(hash, fileEntry);
            } catch (e) {
                // Ignore cache loading errors.
            }
        }
    }

    public generateContent(webView: Webview, uri: Uri): string {
        if (!this.currentRule) {
            return `<!DOCTYPE html>
                <html>
                    <head>
                        ${this.generateContentSecurityPolicy()}
                    </head>
                    <body><span style="color: #808080; font-size: 16pt;">No rule selected</span></body>
                </html>`;
        }

        const data = this.backend.getATNGraph(uri.fsPath, this.currentRule);
        if (!data) {
            return `<!DOCTYPE html>
                <html>
                    <head>
                        ${this.generateContentSecurityPolicy()}
                    </head>
                    <body><span style="color: #808080; font-size: 16pt;">No ATN data found
                    (code generation must run at least once in internal or external mode)</span></body>
                </html>`;
        }

        const rendererScriptPath = FrontendUtils.getOutPath("src/webview-scripts/ATNGraphRenderer.js", this.context,
            webView);
        const exportScriptPath = FrontendUtils.getOutPath("src/webview-scripts/GraphExport.js", this.context,
            webView);
        const graphLibPath = FrontendUtils.getNodeModulesPath("d3/dist/d3.js", this.context);

        const scale = !this.cachedRuleStates || Number.isNaN(this.cachedRuleStates.scale)
            ? 0.5
            : this.cachedRuleStates.scale;

        const initialTranslation = {
            x: this.cachedRuleStates?.translation.x,
            y: this.cachedRuleStates?.translation.y,
        };

        if (this.cachedRuleStates) {
            for (const node of data.nodes as IATNGraphLayoutNode[]) {
                const state = this.cachedRuleStates.states.find((element): boolean => {
                    return element.id === node.id;
                });

                if (state) {
                    if (state.fx) {
                        node.fx = state.fx;
                    }
                    if (state.fy) {
                        node.fy = state.fy;
                    }
                }
            }
        }

        const objectName = this.currentRule.replace(/\$/g, "$$");
        const configuration = workspace.getConfiguration("antlr4.atn");
        const maxLabelCount = configuration.get<number>("maxLabelCount", 3);

        return `<!DOCTYPE html>
            <html style="width: 100%, height: 100%">
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.generateContentSecurityPolicy()}
                    ${this.getStyles(webView)}
                    <base target="_blank">
                    <script src="${graphLibPath}"></script>
                    <script>
                        let atnGraphRenderer;
                        let graphExport;
                    </script>
                </head>
                <body>
                    <script src="${graphLibPath}"></script>
                    <div class="header">
                        <span class="atn-graph-color">
                            <span class="graph-initial">Ⓡ</span>ule&nbsp;&nbsp;</span>
                            ${objectName}
                            <span class="rule-index">(rule index: ${this.currentRuleIndex ?? "?"})</span>
                        <span class="action-box">
                            Reset display <a onClick="atnGraphRenderer.resetTransformation();">
                            <span class="atn-graph-color" style="font-size: 120%; font-weight: 800; cursor: pointer;
                                vertical-align: middle;">↺</span></a>&nbsp;
                            Save to file<a onClick="graphExport.exportToSVG('atn', '${objectName}');">
                                <span class="atn-graph-save-image" />
                            </a>
                        </span>
                    </div>

                    <svg>
                        <defs>
                            <filter id="white-glow" x="-150%" y="-150%" width="300%" height="300%">
                                <feFlood result="flood" flood-color="#ffffff" flood-opacity="0.15" />
                                <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in" />
                                <feMorphology in="mask" result="dilated" operator="dilate" radius="5" />
                                <feGaussianBlur in="dilated" result="blurred" stdDeviation="5" />
                                <feMerge>
                                    <feMergeNode in="blurred" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            <filter id="black-glow" x="-1000%" y="-1000%" width="2000%" height="2000%">
                                <feFlood result="flood" flood-color="#000000" flood-opacity="0.15" />
                                <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in" />
                                <feMorphology in="mask" result="dilated" operator="dilate" radius="4" />
                                <feGaussianBlur in="dilated" result="blurred" stdDeviation="5" />
                                <feMerge>
                                    <feMergeNode in="blurred" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            <marker id="transitionEndCircle" viewBox="0 -5 10 10" refX="31" refY="0" markerWidth="7"
                                markerHeight="7" orient="auto" class="marker">
                                <path d="M0,-4L10,0L0,4" />
                            </marker>
                            <marker id="transitionEndRect" viewBox="0 -5 10 10" refX="10" refY="0" markerWidth="7"
                                markerHeight="7" orient="auto" class="marker">
                                <path d="M0,-4L10,0L0,4" />
                            </marker>
                        </defs>
                    </svg>

                    <script type="module">
                        import { ATNGraphRenderer } from "${rendererScriptPath}";
                        import { GraphExport, vscode } from "${exportScriptPath}";

                        atnGraphRenderer = new ATNGraphRenderer({
                            objectName: "${objectName}",
                            maxLabelCount: ${maxLabelCount},
                            data: ${JSON.stringify(data)},
                            initialScale: ${scale},
                            initialTranslation: ${JSON.stringify(initialTranslation)},
                        });

                        // Register a listener for data changes.
                        window.addEventListener("message", (event) => {
                            switch (event.data.command) {
                                case "cacheATNLayout": {
                                    const args = {
                                        command: "saveATNState",
                                        nodes: atnGraphRenderer.nodes,
                                        file: event.data.file,
                                        rule: event.data.rule,
                                        transform: atnGraphRenderer.currentTransformation,
                                    };

                                    vscode.postMessage(args);

                                    break;
                                }

                                default:
                            }
                        });

                        atnGraphRenderer.render();
                    </script>
                </body>
            </html>
        `;
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
    public update(editor: TextEditor, forced = false): void {
        // Keep track of the currently selected rule in the given editor and trigger a visual update
        // if the ATN graph is currently visible.
        const caret = editor.selection.active;
        const [selectedRule, selectedRuleIndex] =
            this.backend.ruleFromPosition(editor.document.fileName, caret.character, caret.line + 1);

        if (this.currentRule !== selectedRule || forced) {
            const hash = FrontendUtils.hashForPath(editor.document.fileName);
            const cachedStates = ATNGraphProvider.atnStates.get(hash);

            if (!cachedStates || !selectedRule) {
                this.cachedRuleStates = undefined;
            } else {
                this.cachedRuleStates = cachedStates.get(selectedRule);
            }

            this.currentRule = selectedRule;
            this.currentRuleIndex = selectedRuleIndex;
            if (this.sendMessage(editor.document.uri, {
                command: "cacheATNLayout",
                file: editor.document.fileName,
                rule: this.currentRule,
            })) {
                super.update(editor);
            }
        }
    }

    protected handleMessage(message: IWebviewMessage): boolean {
        const saveMessage = message as IATNStateSaveMessage;

        if (saveMessage.command === "saveATNState") {
            // This is the bounce back from the script code for our call to `cacheATNLayout` triggered from
            // the `update()` function.
            const hash = FrontendUtils.hashForPath(saveMessage.file);
            const basePath = path.dirname(saveMessage.file);
            const atnCachePath = path.join(basePath, ".antlr/cache");

            let fileEntry = ATNGraphProvider.atnStates.get(hash);
            if (!fileEntry) {
                fileEntry = new Map();
            }

            const { x: translateX, y: translateY, k: scale } = saveMessage.transform;

            // Convert the given translation back to what it was before applying the scaling, as that is what we need
            // to specify when we restore the translation.
            const ruleEntry: IAtnStateEntry = {
                scale,
                translation: { x: translateX / scale, y: translateY / scale },
                states: [],
            };

            for (const node of saveMessage.nodes) {
                ruleEntry.states.push({ id: node.id, fx: node.fx, fy: node.fy as number });
            }

            fileEntry.set(saveMessage.rule, ruleEntry);
            ATNGraphProvider.atnStates.set(hash, fileEntry);

            fs.ensureDirSync(atnCachePath);
            try {
                fs.writeFileSync(path.join(atnCachePath, hash + ".atn"), JSON.stringify(fileEntry),
                    { encoding: "utf-8" });
            } catch (error) {
                void window.showErrorMessage(`Couldn't write ATN state data for: ${saveMessage.file} (${hash})`);
            }

            return true;
        }

        return false;
    }
}
