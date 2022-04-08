/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2021, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as fs from "fs-extra";
import * as path from "path";

import { WebviewProvider, IWebviewShowOptions, IWebviewMessage } from "./WebviewProvider";
import { FrontendUtils } from "./FrontendUtils";
import { window, workspace, Uri, TextEditor, Webview } from "vscode";
import { IAtnNode } from "../backend/facade";

// ATN graph state info for a single rule.
export interface IAtnStateEntry {
    scale: number;
    translation: { x: number; y: number };
    states: Array<{ id: number; fx: number; fy: number }>;
}

export class AntlrAtnGraphProvider extends WebviewProvider {

    // All ATN state entries per file, per rule. Initially filled from the extension code.
    public static atnStates = new Map<string, Map<string, IAtnStateEntry>>();

    // Set by the update method if there's cached state data for the current rule.
    private cachedRuleStates: IAtnStateEntry | undefined;

    public static addStatesForGrammar(root: string, grammar: string): void {
        const hash = FrontendUtils.hashForPath(grammar);
        const atnCacheFile = path.join(root, "cache", hash + ".atn");
        if (fs.existsSync(atnCacheFile)) {
            const data = fs.readFileSync(atnCacheFile, { encoding: "utf-8" });
            const fileEntry = new Map<string, IAtnStateEntry>(JSON.parse(data) as Map<string, IAtnStateEntry>);
            AntlrAtnGraphProvider.atnStates.set(hash, fileEntry);
        }
    }

    public async generateContent(webView: Webview, source: TextEditor | Uri,
        _options: IWebviewShowOptions): Promise<string> {
        if (!this.currentRule) {
            return `<!DOCTYPE html>
                <html>
                    <head>
                        ${this.generateContentSecurityPolicy(source)}
                    </head>
                    <body><span style="color: #808080; font-size: 16pt;">No rule selected</span></body>
                </html>`;
        }

        let miscPath = FrontendUtils.getMiscPath("atngraph-head.html", this.context);
        let html = fs.readFileSync(miscPath, { encoding: "utf-8" });

        miscPath = FrontendUtils.getMiscPath("atngraph.js", this.context);
        const code = fs.readFileSync(miscPath, { encoding: "utf-8" });

        const scripts = [
            FrontendUtils.getMiscPath("utils.js", this.context, webView),
        ];

        const uri = (source instanceof Uri) ? source : source.document.uri;
        html = html.replace("##header##", `
            ${this.generateContentSecurityPolicy(source)}
            ${this.getStyles(webView)}
            <base target="_blank" />
        `.replace(/\$/g, "$$"));

        const graphLibPath = FrontendUtils.getNodeModulesPath("d3/dist/d3.js", this.context);
        html = html.replace("##d3path##", graphLibPath);

        html = html.replace(/##objectName##/g, this.currentRule.replace(/\$/g, "$$"));
        html = html.replace(/##index##/g, this.currentRuleIndex !== undefined ? String(this.currentRuleIndex) : "?");

        const maxLabelCount = workspace.getConfiguration("antlr4.atn").maxLabelCount as number;
        html = html.replace("##maxLabelCount##", (maxLabelCount > 1 ? maxLabelCount : 5).toString());
        html += "  const width = 1000, height = 1000;\n\n";

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

            html += "  const nodes = " + JSON.stringify(data.nodes) + "\n";
            html += "  const links = " + JSON.stringify(data.links) + "\n\n";

            html += `  const initialScale = ${scale};\n`;
            html += `  const initialTranslateX = ${transX};\n`;
            html += `  const initialTranslateY = ${transY};\n`;

            const nonce = `${new Date().getTime()}${new Date().getMilliseconds()}`;
            html += `${code}\n</script>\n${this.getScripts(nonce, scripts)}</div></body>`;

        } else {
            html += "  const nodes = []\n";
            html += "  const links = []\n\n";

            html += "  const initialScale = 1;\n";
            html += "  const initialTranslateX = 0;\n";
            html += "  const initialTranslateY = 0;\n";

            html += `</script><br/><span style="color: #808080; font-size: 16pt;">No ATN data found
                    (code generation must run at least once in internal or external mode)</span></div></body>`;
        }

        fs.writeFileSync("/Users/mike/Downloads/atn.html", html + "</html>");

        return Promise.resolve(html + "</html>");
    }

    public update(editor: TextEditor, forced = false): void {
        const [currentRule, ruleIndex] = this.findCurrentRule(editor);
        if (!this.currentEditor || this.currentEditor !== editor || this.currentRule !== currentRule || forced) {
            const hash = FrontendUtils.hashForPath(editor.document.fileName);
            const cachedStates = AntlrAtnGraphProvider.atnStates.get(hash);

            if (!cachedStates || !currentRule) {
                this.cachedRuleStates = undefined;
            } else {
                this.cachedRuleStates = cachedStates.get(currentRule);
            }

            // Update content only if this is the first invocation, editors were switched or
            // the currently selected rule changed.
            this.currentEditor = editor;
            this.currentRule = currentRule;
            this.currentRuleIndex = ruleIndex;
            if (this.currentEditor) {
                if (this.sendMessage(editor.document.uri, {
                    command: "cacheATNLayout",
                    file: editor.document.fileName,
                    rule: this.currentRule,
                })) {
                    super.update(editor);
                }
            } else {
                super.update(editor);
            }
        }
    }

    protected handleMessage(message: IWebviewMessage): boolean {
        if (message.command === "saveATNState") {
            // This is the bounce back from the script code for our call to `cacheATNLayout` triggered from
            // the `update()` function.
            const hash = FrontendUtils.hashForPath(message.file as string);
            const basePath = path.dirname(message.file as string);
            const atnCachePath = path.join(basePath, ".antlr/cache");

            let fileEntry = AntlrAtnGraphProvider.atnStates.get(hash);
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
            const ruleEntry: IAtnStateEntry = {
                scale,
                translation: { x: translateX / scale, y: translateY / scale },
                states: [],
            };

            for (const node of (message.nodes as IAtnNode[])) {
                ruleEntry.states.push({ id: node.id, fx: node.fx as number, fy: node.fy as number });
            }
            fileEntry.set(message.rule as string, ruleEntry);
            AntlrAtnGraphProvider.atnStates.set(hash, fileEntry);

            fs.ensureDirSync(atnCachePath);
            try {
                fs.writeFileSync(path.join(atnCachePath, hash + ".atn"), JSON.stringify(fileEntry),
                    { encoding: "utf-8" });
            } catch (error) {
                void window.showErrorMessage(`Couldn't write ATN state data for: ${String(message.file)} (${hash})`);
            }

            return true;
        }

        return false;
    }
}
