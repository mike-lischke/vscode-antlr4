/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";
import * as fs from "fs";

import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, Command, EventEmitter, Event, window } from "vscode";
import { AntlrFacade } from "../backend/facade";

export class ImportsProvider implements TreeDataProvider<Import> {
    private _onDidChangeTreeData = new EventEmitter<Import | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private backend: AntlrFacade) { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Import): TreeItem {
        return element;
    }

    getChildren(element?: Import): Thenable<Import[]> {
        if (!element) {
            let editor = window.activeTextEditor;
            if (editor && editor.document.languageId === "antlr") {
                let dependencies = this.backend.getDependencies(editor.document.fileName);
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

class Import extends TreeItem {

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
