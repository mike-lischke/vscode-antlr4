/*
 * This file is released under the MIT license.
 * Copyright (c) 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

import * as fs from "fs-extra";
import * as path from "path";

import { WebviewProvider, WebviewShowOptions } from "./WebviewProvider";
import { Utils } from "./Utils";
import { window, workspace, Uri, commands, TextEditor } from "vscode";

// ATN graph state info for a single rule.
export class ATNStateEntry {
    scale: number;
    translation: { x: number, y: number };
    states: { id: number, fx: number, fy: number }[];
};

export class AntlrATNGraphProvider extends WebviewProvider {

    // All ATN state entries per file, per rule. Initially filled from the extension code.
    public static atnStates: Map<string, Map<string, ATNStateEntry>> = new Map();

    public static addStatesForGrammar(root: string, grammar: string) {
        let hash = Utils.hashFromPath(grammar);
        let atnCacheFile = path.join(root, "cache", hash + ".atn");
        if (fs.existsSync(atnCacheFile)) {
            let data = fs.readFileSync(atnCacheFile, { encoding: "utf-8" });
            let fileEntry = new Map(JSON.parse(data));
            AntlrATNGraphProvider.atnStates.set(hash, <Map<string, ATNStateEntry>>fileEntry);
        }
    }

    public generateContent(source: TextEditor | Uri, options: WebviewShowOptions): string {
        if (!this.currentRule) {
            return `<html><body><span style="color: #808080; font-size: 16pt;">No rule selected</span></body><html>`;
        }

        let html = fs.readFileSync(Utils.getMiscPath("atngraph-head.html", this.context, false), { encoding: "utf-8" });
        let code = fs.readFileSync(Utils.getMiscPath("atngraph.js", this.context, false), { encoding: "utf-8" });

        const scripts = [
            Utils.getMiscPath('utils.js', this.context, true),
        ];

        let uri = (source instanceof Uri) ? source : source.document.uri;
        html = html.replace("##header##", `
                ${this.getStyles(uri)}
                <base target="_blank" />`.replace(/\$/g, "$$"));

        html = html.replace(/##objectName##/g, this.currentRule.replace(/\$/g, "$$"));
        html = html.replace(/##index##/g, this.currentRuleIndex ? "" + this.currentRuleIndex : "?");

        let maxLabelCount = workspace.getConfiguration("antlr4.atn")["maxLabelCount"];
        html = html.replace("##maxLabelCount##", maxLabelCount > 1 ? maxLabelCount : 5);
        html += `  var width = 1000, height = 1000\n\n`;

        let data;
        if (source instanceof Uri) {
            data = this.backend.getATNGraph(uri.fsPath, this.currentRule);
        } else {
            data = this.backend.getATNGraphFast(uri.fsPath, source.document.getText(), this.currentRule)
        }
        if (data) {
            let scale = !this.cachedRuleStates || Number.isNaN(this.cachedRuleStates.scale)
                ? "0.5 * Math.exp(-nodes.length / 50) + 0.1"
                : this.cachedRuleStates.scale;

            let transX = !this.cachedRuleStates || !this.cachedRuleStates.translation.x || Number.isNaN(this.cachedRuleStates.translation.x)
                ? "width * (1 - initialScale)"
                : this.cachedRuleStates.translation.x.toString();

            let transY = !this.cachedRuleStates || !this.cachedRuleStates.translation.y || Number.isNaN(this.cachedRuleStates.translation.y)
                ? "height * (1 - initialScale)"
                : this.cachedRuleStates.translation.y.toString();

            if (this.cachedRuleStates) {
                for (let node of data.nodes) {
                    let state = this.cachedRuleStates.states.find(function (element): boolean {
                        return element.id === node.id;
                    });

                    if (state) {
                        if (state.fx) {
                            node["fx"] = state.fx;
                        }
                        if (state.fy) {
                            node["fy"] = state.fy;
                        }
                    }
                }

            }

            html += "  var nodes = " + JSON.stringify(data.nodes) + "\n";
            html += "  var links = " + JSON.stringify(data.links) + "\n\n";

            html += `  var initialScale = ${scale};\n`;
            html += `  var initialTranslateX = ${transX};\n`;
            html += `  var initialTranslateY = ${transY};\n`;

            const nonce = new Date().getTime() + '' + new Date().getMilliseconds();
            html += `${code}\n</script>\n${this.getScripts(nonce, scripts)}</div></body>`;

        } else {
            html += "  var nodes = []\n";
            html += "  var links = []\n\n";

            html += `  var initialScale = 1;\n`;
            html += `  var initialTranslateX = 0;\n`;
            html += `  var initialTranslateY = 0;\n`;

            html += `</script><br/><span style="color: #808080; font-size: 16pt;">No ATN data found
                    (code generation must run at least once in internal or external mode)</span></div></body>`;
        }

        return html;
    };

    public update(editor: TextEditor, forced: boolean = false) {
        let [currentRule, ruleIndex] = this.findCurrentRule(editor);
        if (!this.lastEditor || this.lastEditor !== editor || this.currentRule !== currentRule || forced) {
            let hash = Utils.hashFromPath(editor.document.fileName);
            let cachedStates = AntlrATNGraphProvider.atnStates.get(hash);

            if (!cachedStates || !currentRule) {
                this.cachedRuleStates = undefined;
            } else {
                this.cachedRuleStates = cachedStates.get(currentRule);
            }

            // Update content only if this is the first invocation, editors were switched or
            // the currently selected rule changed.
            if (this.lastEditor) {
                if (this.sendMessage(editor, {
                    command: "cacheATNLayout",
                    file: editor.document.fileName,
                    rule: this.currentRule
                })) {
                    this.lastEditor = editor;
                    this.currentRule = currentRule;
                    this.currentRuleIndex = ruleIndex;
                    super.update(editor);
                };
            } else {
                this.lastEditor = editor;
                this.currentRule = currentRule;
                this.currentRuleIndex = ruleIndex;
                super.update(editor);
            }
        }
    }

    protected handleMessage(message: any): boolean {
        if (message.command == "saveATNState") {
            // This is the bounce back from the script code for our call to `cacheATNState` triggered from
            // the `update()` function.
            let hash = Utils.hashFromPath(message.file);
            let basePath = path.dirname(message.file);
            let atnCachePath = path.join(basePath, ".antlr/cache");

            let fileEntry = AntlrATNGraphProvider.atnStates.get(hash);
            if (!fileEntry) {
                fileEntry = new Map();
            }

            let scale = 1;
            let translateX = 0;
            let translateY = 0;
            let temp = message.transform.split(/[(), ]/);
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
            let ruleEntry: ATNStateEntry = { scale: scale, translation: { x: translateX / scale, y: translateY / scale }, states: [] };
            for (let node of message.nodes) {
                ruleEntry.states.push({ id: node.id, fx: node.fx, fy: node.fy });
            }
            fileEntry.set(message.rule, ruleEntry);
            AntlrATNGraphProvider.atnStates.set(hash, fileEntry);

            fs.ensureDirSync(atnCachePath);
            try {
                fs.writeFileSync(path.join(atnCachePath, hash + ".atn"), JSON.stringify(Array.from(fileEntry)), { encoding: "utf-8" });
            } catch (error) {
                window.showErrorMessage("Couldn't write ATN state data for: " + message.file + "(" + hash + ")");
            }

            return true;
        }
        return false;
    }

    // Set by the update method if there's cached state data for the current rule.
    private cachedRuleStates: ATNStateEntry | undefined;
};
