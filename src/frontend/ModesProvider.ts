/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, Event, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";

export class ModesProvider extends AntlrTreeDataProvider<ModeEntry> {

    getTreeItem(element: ModeEntry): TreeItem {
        return element;
    }

    getChildren(element?: ModeEntry): ProviderResult<ModeEntry[]> {
        if (!element) {
            var modes;
            if (this.currentFile) {
                modes = this.backend.getModes(this.currentFile);
            }

            if (modes) {
                let list: ModeEntry[] = [];
                for (let mode of modes) {
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
        light: path.join(__dirname, '..', '..', '..', 'misc', 'mode-light.svg'),
        dark: path.join(__dirname, '..', '..', '..', 'misc', 'mode-dark.svg')
    };

    contextValue = 'lexerSymbols';
}
