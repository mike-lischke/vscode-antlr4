/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";

import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, Command, Event, EventEmitter, window, Uri } from "vscode";
import { AntlrFacade } from "../backend/facade";
import { DebuggerConsumer } from "./AntlrDebugAdapter";
import { GrapsDebugger } from "../backend/GrapsDebugger";

export class ModesProvider implements TreeDataProvider<ModeEntry>, DebuggerConsumer {
    private _onDidChangeTreeData = new EventEmitter<ModeEntry | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private backend: AntlrFacade) { }

    public debugger: GrapsDebugger;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    debuggerStopped(uri: Uri): void {
        // no-op
    }

    getTreeItem(element: ModeEntry): TreeItem {
        return element;
    }

    getChildren(element?: ModeEntry): Thenable<ModeEntry[]> {
        if (!element) {
            let editor = window.activeTextEditor;
            if (this.debugger) {
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

export class ModeEntry extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

    iconPath = {
        light: path.join(__dirname, '..', '..', '..', 'misc', 'mode.svg'),
        dark: path.join(__dirname, '..', '..', '..', 'misc', 'mode.svg')
    };

    contextValue = 'lexerSymbols';
}
