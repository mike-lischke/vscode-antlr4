/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";
import { SymbolInfo } from "../backend/facade";

export class ActionsProvider extends AntlrTreeDataProvider<ActionEntry> {

    getChildren(element?: ActionEntry): Thenable<ActionEntry[]> {
        if (!element) {
            let actions: SymbolInfo[] = [];
            if (this.currentFile) {
                actions = this.backend.listActions(this.currentFile);
            }

            let list: ActionEntry[] = [];
            for (let action of actions) {
                let caption = action.description!.substr(1, action.description!.length - 2);
                if (caption.includes("\n")) {
                    caption = "<multi line block>";
                }
                list.push(new ActionEntry(caption.trim(), action.isPredicate || false, TreeItemCollapsibleState.None, {
                    title: "",
                    command: "antlr.selectGrammarRange",
                    arguments: [ action.definition!.range ]
                }));
            }
            return new Promise(resolve => {
                resolve(list);
            });
        }

        return new Promise(resolve => {
            resolve([]);
        });
    }

}

export class ActionEntry extends TreeItem {

    constructor(label: string, isPredicate: boolean, state: TreeItemCollapsibleState, command_?: Command) {
        super(label, state);
        this.command = command_;

        this.iconPath = {
            light: path.join(__dirname, '..', '..', '..', 'misc', (isPredicate ? 'predicate' : 'action') + '.svg'),
            dark: path.join(__dirname, '..', '..', '..', 'misc', (isPredicate ? 'predicate' : 'action') + '.svg')
        };

    }

    contextValue = 'actions';
}
