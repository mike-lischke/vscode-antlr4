/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

/* eslint-disable max-classes-per-file */

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";

export class Import extends TreeItem {

    public override iconPath = {
        light: path.join(__dirname, "..", "..", "..", "misc", "dependency-light.svg"),
        dark: path.join(__dirname, "..", "..", "..", "misc", "dependency-dark.svg"),
    };

    public override contextValue = "grammar-dependency";

    public constructor(
        public override readonly label: string,
        public override readonly collapsibleState: TreeItemCollapsibleState,
        command?: Command,
    ) {
        super(label, collapsibleState);
        this.command = command;
    }

}

export class ImportsProvider extends AntlrTreeDataProvider<Import> {

    public override getChildren(element?: Import): ProviderResult<Import[]> {
        if (!element) {
            let dependencies;
            if (this.currentFile) {
                dependencies = this.backend.getDependencies(this.currentFile);
            }

            if (dependencies) {
                const imports: Import[] = [];
                for (const dep of dependencies) {
                    imports.push(new Import(path.basename(dep), TreeItemCollapsibleState.None, {
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
