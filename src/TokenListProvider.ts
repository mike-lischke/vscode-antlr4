/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";
import * as fs from "fs";

import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, Command, EventEmitter, Event, window } from "vscode";
import { AntlrLanguageSupport, GrapsDebugger } from "antlr4-graps";
import { DebuggerConsumer } from "./AntlrDebugger";

export class TokenListProvider implements TreeDataProvider<TokenItem>, DebuggerConsumer {
    private _onDidChangeTreeData = new EventEmitter<TokenItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private backend: AntlrLanguageSupport) { }

    public debugger: GrapsDebugger; // Set by the AntlrDebugSession when launching the session.

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TokenItem): TreeItem {
        return element;
    }

    getChildren(element?: TokenItem): Thenable<TokenItem[]> {
        if (!element) {
            let editor = window.activeTextEditor;
            if (editor && editor.document.languageId === "antlr" && this.debugger) {
                let tokens = this.debugger.tokenList;
                let list: TokenItem[] = [];
                for (let i = 0, j = 0; i < tokens.length; ++i, ++j) {
                    let token = tokens[i];

                    // Add placeholders for skipped tokens.
                    while (j < token.tokenIndex) {
                        list.push(new TokenItem("-- skipped --", TreeItemCollapsibleState.None, {
                            title: "<unused>",
                            command: "",
                            arguments: []
                        }));

                        ++j;
                    }

                    // Note: lines are already one-based, need to make columns one-based too.
                    let caption = token.tokenIndex + ": " + token.type + " \"" + this.escapeText(token.text) + "\"" +
                        " [" + token.line + ", " + (token.offset + 1) + "]";
                    if (token.channel != 0) {
                        if (token.channel == 1) {
                            caption += " hidden";
                        } else {
                            caption += " channel: " + token.channel;
                        }
                    }
                    list.push(new TokenItem(caption, TreeItemCollapsibleState.None, {
                        title: "<unused>",
                        command: "",
                        arguments: [token]
                    }));
                }
                return new Promise(resolve => {
                    resolve(list);
                });
            }
        }

        return new Promise(resolve => {
            resolve([]);
        });
    }

    private escapeText(text: string): string {
        let result = "";
        for (let c of text) {
            switch (c) {
                case "\r":
                    result += "\\r";
                    break;

                case "\n":
                    result += "\\n";
                break;

                case "\t":
                    result += "\\t";
                break;

                default:
                    result += c;
                    break;
            }
        }

        return result;
    }
}

class TokenItem extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

    iconPath = {
        light: path.join(__dirname, '..', '..', 'misc', 'token-light.svg'),
        dark: path.join(__dirname, '..', '..', 'misc', 'token-dark.svg')
    };

    contextValue = 'tokenList';
}
