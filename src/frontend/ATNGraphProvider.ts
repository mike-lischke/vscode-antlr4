/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as fs from "fs-extra";
import * as path from "path";

import { WebviewProvider, WebviewShowOptions, WebviewMessage } from "./WebviewProvider";
import { Utils } from "./Utils";
import { window, workspace, Uri, TextEditor, Webview } from "vscode";
import { ATNNode } from "../backend/facade";

// ATN graph state info for a single rule.
export interface ATNStateEntry {
    scale: number;
    translation: { x: number; y: number };
    states: Array<{ id: number; fx: number; fy: number }>;
}

export class AntlrATNGraphProvider extends WebviewProvider {

    // All ATN state entries per file, per rule. Initially filled from the extension code.
    public static atnStates = new Map<string, Map<string, ATNStateEntry>>();

    // Set by the update method if there's cached state data for the current rule.
    private cachedRuleStates: ATNStateEntry | undefined;

    public static addStatesForGrammar(root: string, grammar: string): void {
        const hash = Utils.hashForPath(grammar);
        const atnCacheFile = path.join(root, "cache", hash + ".atn");
        if (fs.existsSync(atnCacheFile)) {
            const data = fs.readFileSync(atnCacheFile, { encoding: "utf-8" });
            const fileEntry = new Map(JSON.parse(data));
            AntlrATNGraphProvider.atnStates.set(hash, <Map<string, ATNStateEntry>>fileEntry);
        }
    }

    public generateContent(webView: Webview, source: TextEditor | Uri, options: WebviewShowOptions): string {
        if (!this.currentRule) {
            return `<!DOCTYPE html>
                <html>
                    <head>
                        ${this.generateContentSecurityPolicy(source)}
                    </head>
                    <body><span style="color: #808080; font-size: 16pt;">No rule selected</span></body>
                </html>`;
        }

        let html = fs.readFileSync(Utils.getMiscPath("atngraph-head.html", this.context), { encoding: "utf-8" });
        const code = fs.readFileSync(Utils.getMiscPath("atngraph.js", this.context), { encoding: "utf-8" });

        const scripts = [
            Utils.getMiscPath("utils.js", this.context, webView),
        ];

        const uri = (source instanceof Uri) ? source : source.document.uri;
        html = html.replace("##header##", `
            ${this.generateContentSecurityPolicy(source)}
            ${this.getStyles(webView)}
            <base target="_blank" />
        `.replace(/\$/g, "$$"));

        const graphLibPath = Utils.getNodeModulesPath("d3/dist/d3.js", this.context);
        html = html.replace("##d3path##", graphLibPath);

        html = html.replace(/##objectName##/g, this.currentRule.replace(/\$/g, "$$"));
        html = html.replace(/##index##/g, this.currentRuleIndex ? "" + this.currentRuleIndex : "?");

        const maxLabelCount = workspace.getConfiguration("antlr4.atn").maxLabelCount as number;
        html = html.replace("##maxLabelCount##", (maxLabelCount > 1 ? maxLabelCount : 5).toString());
        html += "  var width = 1000, height = 1000;\n\n";

        const data = this.backend.getATNGraph(uri.fsPath, this.currentRule);
        if (data) {
            const scale = !this.cachedRuleStates || Number.isNaN(this.cachedRuleStates.scale)
                ? "0.5 * Math.exp(-nodes.length / 50) + 0.1"
                : this.cachedRuleStates.scale;

            const transX = !this.cachedRuleStates
                || !this.cachedRuleStates.translation.x
                || Number.isNaN(this.cachedRuleStates.translation.x)
                ? "width * (1 - initialScale)"
                : this.cachedRuleStates.translation.x.toString();

            const transY = !this.cachedRuleStates
                || !this.cachedRuleStates.translation.y
                || Number.isNaN(this.cachedRuleStates.translation.y)
                ? "height * (1 - initialScale)"
                : this.cachedRuleStates.translation.y.toString();

            if (this.cachedRuleStates) {
                for (const node of data.nodes) {
                    const state = this.cachedRuleStates.states.find((element): boolean => element.id === node.id);

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

            html += "  var nodes = " + JSON.stringify(data.nodes) + "\n";
            html += "  var links = " + JSON.stringify(data.links) + "\n\n";

            html += `  var initialScale = ${scale};\n`;
            html += `  var initialTranslateX = ${transX};\n`;
            html += `  var initialTranslateY = ${transY};\n`;

            const nonce = new Date().getTime() + "" + new Date().getMilliseconds();
            html += `${code}\n</script>\n${this.getScripts(nonce, scripts)}</div></body>`;

        } else {
            html += "  var nodes = []\n";
            html += "  var links = []\n\n";

            html += "  var initialScale = 1;\n";
            html += "  var initialTranslateX = 0;\n";
            html += "  var initialTranslateY = 0;\n";

            html += `</script><br/><span style="color: #808080; font-size: 16pt;">No ATN data found
                    (code generation must run at least once in internal or external mode)</span></div></body>`;
        }

        return html + "</html>";
    }

    public update(editor: TextEditor, forced = false): void {
        const [currentRule, ruleIndex] = this.findCurrentRule(editor);
        if (!this.currentEditor || this.currentEditor !== editor || this.currentRule !== currentRule || forced) {
            const hash = Utils.hashForPath(editor.document.fileName);
            const cachedStates = AntlrATNGraphProvider.atnStates.get(hash);

            if (!cachedStates || !currentRule) {
                this.cachedRuleStates = undefined;
            } else {
                this.cachedRuleStates = cachedStates.get(currentRule);
            }

            // Update content only if this is the first invocation, editors were switched or
            // the currently selected rule changed.
            if (this.currentEditor) {
                if (this.sendMessage(editor.document.uri, {
                    command: "cacheATNLayout",
                    file: editor.document.fileName,
                    rule: this.currentRule,
                })) {
                    this.currentEditor = editor;
                    this.currentRule = currentRule;
                    this.currentRuleIndex = ruleIndex;
                    super.update(editor);
                }
            } else {
                this.currentEditor = editor;
                this.currentRule = currentRule;
                this.currentRuleIndex = ruleIndex;
                super.update(editor);
            }
        }
    }

    protected handleMessage(message: WebviewMessage): boolean {
        if (message.command === "saveATNState") {
            // This is the bounce back from the script code for our call to `cacheATNLayout` triggered from
            // the `update()` function.
            const hash = Utils.hashForPath(message.file);
            const basePath = path.dirname(message.file);
            const atnCachePath = path.join(basePath, ".antlr/cache");

            let fileEntry = AntlrATNGraphProvider.atnStates.get(hash);
            if (!fileEntry) {
                fileEntry = new Map();
            }

            let scale = 1;
            let translateX = 0;
            let translateY = 0;
            const temp = (message.transform as string).split(/[(), ]/);
            for (let i = 0; i < temp.length; ++i) {
                if (temp[i] === "translate") {
                    translateX = Number(temp[++i]);
                    translateY = Number(temp[++i]);
                } else if (temp[i] === "scale") {
                    scale = Number(temp[++i]);
                }
            }

            // Convert the given translation back to what it was before applying the scaling, as that is what we need
            // to specify when we restore the translation.
            const ruleEntry: ATNStateEntry = {
                scale,
                translation: { x: translateX / scale, y: translateY / scale },
                states: [],
            };

            for (const node of (message.nodes as ATNNode[])) {
                ruleEntry.states.push({ id: node.id, fx: node.fx as number, fy: node.fy as number });
            }
            fileEntry.set(message.rule, ruleEntry);
            AntlrATNGraphProvider.atnStates.set(hash, fileEntry);

            fs.ensureDirSync(atnCachePath);
            try {
                fs.writeFileSync(path.join(atnCachePath, hash + ".atn"), JSON.stringify(Array.from(fileEntry)),
                    { encoding: "utf-8" });
            } catch (error) {
                void window.showErrorMessage("Couldn't write ATN state data for: " + message.file + "(" + hash + ")");
            }

            return true;
        }

        return false;
    }
}
