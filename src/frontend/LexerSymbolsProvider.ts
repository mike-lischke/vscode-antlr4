/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";

import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, Command, EventEmitter, window, Uri } from "vscode";
import { AntlrFacade } from "../backend/facade";
import { DebuggerConsumer } from "./AntlrDebugAdapter";
import { GrapsDebugger } from "../backend/GrapsDebugger";

export class LexerSymbolsProvider implements TreeDataProvider<LexerSymbol>, DebuggerConsumer {
    private _onDidChangeTreeData = new EventEmitter<LexerSymbol | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private backend: AntlrFacade) { }

    public debugger: GrapsDebugger;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    debuggerStopped(uri: Uri): void {
        // no-op
    }

    getTreeItem(element: LexerSymbol): TreeItem {
        return element;
    }

    getChildren(element?: LexerSymbol): Thenable<LexerSymbol[]> {
        if (!element) {
            let editor = window.activeTextEditor;
            if (this.debugger) {
                let symbols = this.debugger.lexerSymbols;
                let list: LexerSymbol[] = [];
                for (let i = 0; i < symbols.length; ++i) {
                    let [literal, symbolicName] = symbols[i];
                    let caption = "";
                    if (!literal && !symbolicName) {
                        caption = "<unused>";
                    } else {
                        caption = i + ": " + symbolicName;
                        if (literal)  {
                            caption += ", " + literal;
                        }
                    }
                    list.push(new LexerSymbol(caption, TreeItemCollapsibleState.None, {
                        title: "<unused>",
                        command: "",
                        arguments: []
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

}

export class LexerSymbol extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

    iconPath = {
        light: path.join(__dirname, '..', '..', '..', 'misc', 'lexer-token.svg'),
        dark: path.join(__dirname, '..', '..', '..', 'misc', 'lexer-token.svg')
    };

    contextValue = 'lexerSymbols';
}
