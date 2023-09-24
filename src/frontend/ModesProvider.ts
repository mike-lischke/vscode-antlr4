/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { TreeItem, TreeItemCollapsibleState, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider.js";
import { ModeEntry } from "./ModeEntry.js";

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
