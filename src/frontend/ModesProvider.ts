/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
/* eslint-disable max-classes-per-file */

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";

export class ModeEntry extends TreeItem {

    public override iconPath = {
        light: path.join(__dirname, "..", "..", "..", "misc", "mode-light.svg"),
        dark: path.join(__dirname, "..", "..", "..", "misc", "mode-dark.svg"),
    };

    public override contextValue = "lexerSymbols";

    public constructor(
        public override readonly label: string,
        public override readonly collapsibleState: TreeItemCollapsibleState,
        command?: Command,
    ) {
        super(label, collapsibleState);
        this.command = command;
    }
}

export class ModesProvider extends AntlrTreeDataProvider<ModeEntry> {

    public override getTreeItem(element: ModeEntry): TreeItem {
        return element;
    }

    public override getChildren(element?: ModeEntry): ProviderResult<ModeEntry[]> {
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
