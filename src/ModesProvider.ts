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

export class ModesProvider implements TreeDataProvider<ModeEntry>, DebuggerConsumer {
    private _onDidChangeTreeData = new EventEmitter<ModeEntry | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private backend: AntlrLanguageSupport) { }

    public debugger: GrapsDebugger;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ModeEntry): TreeItem {
        return element;
    }

    getChildren(element?: ModeEntry): Thenable<ModeEntry[]> {
        if (!element) {
            let editor = window.activeTextEditor;
            if (editor && editor.document.languageId === "antlr" && this.debugger) {
                let list: ModeEntry[] = [];
                for (let mode of this.debugger.modes) {
                    list.push(new ModeEntry(mode, TreeItemCollapsibleState.None, {
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

class ModeEntry extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

    iconPath = {
        light: path.join(__dirname, '..', '..', 'misc', 'mode-light.svg'),
        dark: path.join(__dirname, '..', '..', 'misc', 'mode-dark.svg')
    };

    contextValue = 'lexerSymbols';
}
