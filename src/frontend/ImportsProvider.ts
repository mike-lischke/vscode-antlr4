/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as path from "path";

import { TreeItemCollapsibleState, ProviderResult } from "vscode";

import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider.js";
import { ImportTreeItem } from "./ImportTreeItem.js";

export class ImportsProvider extends AntlrTreeDataProvider<ImportTreeItem> {

    public override getChildren(element?: ImportTreeItem): ProviderResult<ImportTreeItem[]> {
        if (!element) {
            let dependencies;
            if (this.currentFile) {
                dependencies = this.backend.getDependencies(this.currentFile);
            }

            if (dependencies) {
                const imports: ImportTreeItem[] = [];
                for (const dep of dependencies) {
                    imports.push(new ImportTreeItem(path.basename(dep), TreeItemCollapsibleState.None, {
                        title: "<unused>",
                        command: "antlr.openGrammar",
                        arguments: [dep],
                    }));
                }

                return new Promise((resolve) => {
                    resolve(imports);
                });
            }
        }

        return new Promise((resolve) => {
            resolve([]);
        });
    }
}
