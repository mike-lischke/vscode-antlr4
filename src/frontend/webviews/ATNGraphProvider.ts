/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as fs from "fs-extra";
import * as path from "path";

import { ATNStateType } from "antlr4ng";

import { window, workspace, Uri, TextEditor, Webview } from "vscode";

import { WebviewProvider, IWebviewMessage } from "./WebviewProvider.js";
import { FrontendUtils } from "../FrontendUtils.js";
import {
    IATNGraphData, IATNGraphLayoutNode, IATNGraphRendererData, IATNStateSaveMessage,
} from "../../webview-scripts/types.js";

interface IATNStatePosition {
    fx?: number;
    fy?: number;
}

// ATN graph state info for a single rule.
interface IATNStateEntry {
    scale: number;
    translation: { x: number | undefined; y: number | undefined; };
    statePositions: {
        [key: number]: IATNStatePosition;
    };
}

interface IATNStateMap {
    [key: string]: IATNStateEntry;
}

interface IATNFileStateMap {
    [key: string]: IATNStateMap;
}

export class ATNGraphProvider extends WebviewProvider {

    // All ATN state entries per file, per rule. Initially filled from the extension code.
    public static cachedATNTransformations: IATNFileStateMap = {};

    public static addStatesForGrammar(root: string, grammar: string): void {
        const hash = FrontendUtils.hashForPath(grammar);
        const atnCacheFile = path.join(root, "cache", hash + ".atn");
        if (fs.existsSync(atnCacheFile)) {
            const data = fs.readFileSync(atnCacheFile, { encoding: "utf-8" });
            try {
                const fileEntry = JSON.parse(data) as IATNStateMap;
                ATNGraphProvider.cachedATNTransformations[hash] = fileEntry;
            } catch (e) {
                // Ignore cache loading errors.
            }
        }
    }

    public override generateContent(webview: Webview, uri: Uri): string {
        const graphData = this.prepareRenderData(uri);

        const basePath = FrontendUtils.getOutPath("", this.context, webview) + "/";
        const rendererScriptPath = FrontendUtils.getOutPath("src/webview-scripts/ATNGraphRenderer.js", this.context,
            webview);
        const exportScriptPath = FrontendUtils.getOutPath("src/webview-scripts/GraphExport.js", this.context,
            webview);
        const graphLibPath = FrontendUtils.getNodeModulesPath(webview, "d3/dist/d3.js", this.context);

        const name = graphData.ruleName ?? "";
        const nonce = this.generateNonce();

        return `<!DOCTYPE html>
            <html style="width: 100%, height: 100%">
                <head>
                    <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
                    ${this.generateContentSecurityPolicy(webview, nonce)}
                    ${this.getStyles(webview)}
                    <base href="${basePath}" />
                    <script nonce="${nonce}" src="${graphLibPath}"></script>
                    <script nonce="${nonce}">
                        let atnGraphRenderer;
                        let graphExport;
                    </script>
                </head>
                <body>
                    <div class="header">
                        <span class="graphTitle atn-graph-color">ATN</span>
                        <div class="saveSVGButton" onClick="graphExport.exportToSVG('rrd', '${name}');"
                            title="Save this diagram to an SVG file"
                        ></div>
                        <div onClick="atnGraphRenderer.resetTransformation();"
                            title="Restore the initial graph transformation"
                            style="font-size: 150%; font-weight: 800; cursor: pointer;
                                vertical-align: middle; margin-left: 8px;"
                        >↺</div>

                        <label class="ruleLabel">${name}</label>
                        <div class="badge" title="The index of this rule in the grammar">${this.currentRuleIndex}</div>
                    </div>

                    <svg style="height: 100vh;">
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

                    <script nonce="${nonce}" type="module">
                        import { ATNGraphRenderer } from "${rendererScriptPath}";
                        import { GraphExport, vscode } from "${exportScriptPath}";

                        graphExport = new GraphExport();
                        atnGraphRenderer = new ATNGraphRenderer(vscode);
                        atnGraphRenderer.render(${JSON.stringify(graphData)});
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
    public override update(editor: TextEditor, forced = false): void {
        // Keep track of the currently selected rule in the given editor and trigger a visual update
        // if the ATN graph is currently visible.
        const caret = editor.selection.active;
        const [selectedRule, selectedRuleIndex] =
            this.backend.ruleFromPosition(editor.document.fileName, caret.character, caret.line + 1);

        if (this.currentRule !== selectedRule || forced) {
            this.currentRule = selectedRule;
            this.currentRuleIndex = selectedRuleIndex;
            super.update(editor);
        }
    }

    protected override handleMessage(message: IWebviewMessage): boolean {
        const saveMessage = message as IATNStateSaveMessage;

        if (saveMessage.command === "saveATNState") {
            // This is the bounce back from the script code for our call to `cacheATNLayout` triggered from
            // the `update()` function.
            const hash = FrontendUtils.hashForPath(saveMessage.uri.fsPath);
            const basePath = path.dirname(saveMessage.uri.fsPath);
            const atnCachePath = path.join(basePath, ".antlr/cache");

            let fileEntry = ATNGraphProvider.cachedATNTransformations[hash];
            if (!fileEntry) {
                fileEntry = {};
            }

            const { x: translateX, y: translateY, k: scale } = saveMessage.transform;

            // Convert the given translation back to what it was before applying the scaling, as that is what we need
            // to specify when we restore the translation.
            const ruleEntry: IATNStateEntry = {
                scale,
                translation: { x: translateX / scale, y: translateY / scale },
                statePositions: {},
            };

            for (const node of saveMessage.nodes) {
                ruleEntry.statePositions[node.id] = {
                    fx: node.fx ?? undefined,
                    fy: node.fy ?? undefined,
                };
            }

            fileEntry[saveMessage.rule] = ruleEntry;
            ATNGraphProvider.cachedATNTransformations[hash] = fileEntry;

            fs.ensureDirSync(atnCachePath);
            try {
                fs.writeFileSync(path.join(atnCachePath, hash + ".atn"), JSON.stringify(fileEntry),
                    { encoding: "utf-8" });
            } catch (error) {
                void window.showErrorMessage(`Couldn't write ATN state data for: ${saveMessage.uri.fsPath} (${hash})`);
            }

            return true;
        }

        return false;
    }

    protected override updateContent(uri: Uri): boolean {
        const graphData = this.prepareRenderData(uri);

        this.sendMessage(uri, {
            command: "updateATNTreeData",
            graphData,
            ruleIndex: this.currentRuleIndex,
        });

        return true;
    }

    private prepareRenderData(uri: Uri): IATNGraphRendererData {
        const ruleName = this.currentRule ? this.currentRule.replace(/\$/g, "$$") : undefined;

        const configuration = workspace.getConfiguration("antlr4.atn");
        const maxLabelCount = configuration.get<number>("maxLabelCount", 3);

        const hash = FrontendUtils.hashForPath(uri.fsPath);
        const fileTransformations = ATNGraphProvider.cachedATNTransformations[hash] ?? {};

        let initialScale = 0.5;
        let initialTranslation = {};

        const setPosition = (node: IATNGraphLayoutNode, position?: IATNStatePosition): void => {
            // If no transformation data is available, give the start and end nodes a fixed vertical
            // position and a horizontal initial position (which is not the same as a fixed position)
            // to get the graph rendered near the svg center.
            // The same positions are used when the user resets the transformation.
            const fx = position?.fx;
            const fy = position?.fy;
            switch (node.type) {
                case ATNStateType.RULE_START: {
                    node.fy = fy ?? 0;
                    if (fx !== undefined) {
                        node.fx = fx;
                    } else {
                        node.x = -1000;
                    }
                    break;
                }

                case ATNStateType.RULE_STOP: {
                    node.fy = fy ?? 0;
                    if (fx !== undefined) {
                        node.fx = fx;
                    } else {
                        node.x = 1000;
                    }
                    break;
                }

                default: {
                    node.fx = position?.fx;
                    node.fy = position?.fy;

                    break;
                }
            }
        };

        let graphData: IATNGraphData | undefined;
        if (ruleName) {
            try {
                graphData = this.backend.getATNGraph(uri.fsPath, ruleName);

                if (graphData) {
                    const ruleTransformation = fileTransformations[ruleName];
                    if (ruleTransformation) {
                        initialScale = ruleTransformation.scale;

                        initialTranslation = ruleTransformation.translation;

                        for (const node of graphData.nodes as IATNGraphLayoutNode[]) {
                            setPosition(node, ruleTransformation.statePositions[node.id]);
                        }
                    } else {
                        for (const node of graphData.nodes as IATNGraphLayoutNode[]) {
                            setPosition(node);
                        }
                    }
                }
            } catch (e) {
                // Ignore errors.
            }
        }

        const result = {
            uri,
            ruleName,
            maxLabelCount,
            graphData,
            initialScale,
            initialTranslation,
        };

        return result;
    }
}
