/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";

export class ImportsProvider extends AntlrTreeDataProvider<Import> {

    getChildren(element?: Import): ProviderResult<Import[]> {
        if (!element) {
            let dependencies;
            if (this.currentFile) {
                dependencies = this.backend.getDependencies(this.currentFile);
            }

            if (dependencies) {
                let imports: Import[] = [];
                for (let dep of dependencies) {
                    imports.push(new Import(path.basename(dep), TreeItemCollapsibleState.None, {
                        title: "<unused>",
                        command: "antlr.openGrammar",
                        arguments: [dep]
                    }));
                }
                return new Promise(resolve => {
                    resolve(imports);
                });
            }
        }

        return new Promise(resolve => {
            resolve([]);
        });
    }
}

export class Import extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

    iconPath = {
        light: path.join(__dirname, '..', '..', '..', 'misc', 'dependency-light.svg'),
        dark: path.join(__dirname, '..', '..', '..', 'misc', 'dependency-dark.svg')
    };

    contextValue = 'grammar-dependency';
}
