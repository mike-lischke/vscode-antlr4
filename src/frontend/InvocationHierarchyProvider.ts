/*
 * This file is released under the MIT license.
 * Copyright (c) 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, TextEditor, TreeView, ProviderResult, Range } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";
import { HierarchyNode, HierarchyType } from "../backend/facade";

export class InvocationHierarchyProvider extends AntlrTreeDataProvider<ReferenceItem> {

    public hierarchyTree: TreeView<ReferenceItem>;

    public update(editor: TextEditor) {
        if (!this.currentFile) {
            return;
        }

        let position = editor.selection.active;
        let info = this.backend.symbolInfoAtPosition(editor.document.fileName, position.character, position.line + 1, false);
        if (info) {/*
            if (word[0] == "'") {
                word = word.substring(1, word.length - 1);
            }*/
            if (info.name != this.lastSymbol) {
                this.lastSymbol = info.name;
                this.refresh(editor.document);
            }
        }
    }

    getParent?(element: ReferenceItem): ProviderResult<ReferenceItem> {
        return element.parent;
    }

    getChildren(element?: ReferenceItem): ProviderResult<ReferenceItem[]> {
        if (!this.currentFile || !this.lastSymbol) {
            return;
        }

        let name = this.lastSymbol;
        let result: ReferenceItem[] = [];
        if (!element) {
            let list = this.backend.getInvocationhierarchy(this.currentFile, name);
            for (let entry of list) {
                let item = new ReferenceItem(entry, undefined);
                result.push(item);
            }
        } else {
            for (let entry of element.node.callees) {
                let item = new ReferenceItem(entry, element);
                result.push(item);
            }
        }
        return new Promise(resolve => {
            resolve(result);
        });
    }

    private lastSymbol: string;
}

export class ReferenceItem extends TreeItem {

    constructor(public node: HierarchyNode, public parent?: ReferenceItem, command_?: Command) {
        super(node.name, (node.callees.length > 0) ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None);
        this.command = command_;

        let iconName = "";
        switch (node.type) {
            case HierarchyType.File: iconName = "grammar"; break;
            case HierarchyType.Rule: iconName = "group"; break;
            case HierarchyType.Token: iconName = "reference"; break;
            case HierarchyType.Literal: iconName = "literal"; break;
        }

        this.iconPath = {
            light: path.join(__dirname, '..', '..', '..', 'misc', iconName + '-light.svg'),
            dark: path.join(__dirname, '..', '..', '..', 'misc', iconName + '-dark.svg')
        };

    }

    contextValue = 'invocationHierarchy';
}
