/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";

import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, Command, EventEmitter, window, Uri } from "vscode";
import { DebuggerConsumer } from "./AntlrDebugAdapter";
import { AntlrFacade } from "../backend/facade";
import { GrapsDebugger } from "../backend/GrapsDebugger";

export class ChannelsProvider implements TreeDataProvider<ChannelEntry>, DebuggerConsumer {
    private _onDidChangeTreeData = new EventEmitter<ChannelEntry | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private backend: AntlrFacade) { }

    public debugger: GrapsDebugger;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    debuggerStopped(uri: Uri): void {
        // no-op
    }

    getTreeItem(element: ChannelEntry): TreeItem {
        return element;
    }

    getChildren(element?: ChannelEntry): Thenable<ChannelEntry[]> {
        if (!element) {
            let editor = window.activeTextEditor;
            if (this.debugger) {
                let list: ChannelEntry[] = [];
                for (let channel of this.debugger.channels) {
                    if (!channel || channel == "null") {
                        continue;
                    }
                    list.push(new ChannelEntry(channel, TreeItemCollapsibleState.None, {
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

export class ChannelEntry extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

    iconPath = {
        light: path.join(__dirname, '..', '..', '..', 'misc', 'channel.svg'),
        dark: path.join(__dirname, '..', '..', '..', 'misc', 'channel.svg')
    };

    contextValue = 'lexerSymbols';
}
