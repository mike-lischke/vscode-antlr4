/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */

/* eslint-disable max-classes-per-file */

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";

export class ModesProvider extends AntlrTreeDataProvider<ModeEntry> {

    public getTreeItem(element: ModeEntry): TreeItem {
        return element;
    }

    public getChildren(element?: ModeEntry): ProviderResult<ModeEntry[]> {
        if (!element) {
            let modes;
            if (this.currentFile) {
                modes = this.backend.getModes(this.currentFile);
            }

            if (modes) {
                const list: ModeEntry[] = [];
                for (const mode of modes) {
                    list.push(new ModeEntry(mode, TreeItemCollapsibleState.None, {
                        title: "<unused>",
                        command: "",
                        arguments: [],
                    }));
                }

                return new Promise((resolve) => {
                    resolve(list);
                });
            }
        }

        return new Promise((resolve) => {
            resolve([]);
        });
    }

}

export class ModeEntry extends TreeItem {

    public iconPath = {
        light: path.join(__dirname, "..", "..", "..", "misc", "mode-light.svg"),
        dark: path.join(__dirname, "..", "..", "..", "misc", "mode-dark.svg"),
    };

    public contextValue = "lexerSymbols";

    public constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command,
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

}
