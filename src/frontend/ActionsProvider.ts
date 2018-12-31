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

export class ActionsProvider extends AntlrTreeDataProvider<TreeItem> {

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        if (!element) {
            let list: RootEntry[] = [];

            list.push(new RootEntry("(Named) Actions", "0"));
            list.push(new RootEntry("Semantic Predicates", "1"));

            return new Promise(resolve => {
                resolve(list);
            });
        }

        let actions: SymbolInfo[] = [];
        let returnPredicates = element.id == "1";
        if (this.currentFile) {
            actions = this.backend.listActions(this.currentFile);
            actions = actions.filter(action => action.isPredicate == returnPredicates);
        }

        let list: TreeItem[] = [];
        let index = 0;
        for (let action of actions) {
            let caption = index++ + ": ";
            let content = action.description!.substr(1, action.description!.length - 2);
            if (content.includes("\n")) {
                caption += "<multi line block>";
            } else {
                caption += content;
            }

            let item: TreeItem;
            if (returnPredicates) {
                item = new PredicateEntry(caption.trim(), {
                    title: "",
                    command: "antlr.selectGrammarRange",
                    arguments: [action.definition!.range]
                })
            } else {
                item = new ActionEntry(caption.trim(), {
                    title: "",
                    command: "antlr.selectGrammarRange",
                    arguments: [action.definition!.range]
                })
            }
            list.push(item);
        }
        return new Promise(resolve => {
            resolve(list);
        });
    }
}

export class RootEntry extends TreeItem {

    constructor(label: string, id: string) {
        super(label, TreeItemCollapsibleState.Expanded);
        this.id = id;
    }

    contextValue = 'actions';
}

export class ActionEntry extends TreeItem {

    constructor(label: string, command_?: Command) {
        super(label, TreeItemCollapsibleState.None);
        this.command = command_;

        this.iconPath = {
            light: path.join(__dirname, '..', '..', '..', 'misc', 'action.svg'),
            dark: path.join(__dirname, '..', '..', '..', 'misc', 'action.svg')
        };

    }

    contextValue = 'action';
}

export class PredicateEntry extends TreeItem {

    constructor(label: string, command_?: Command) {
        super(label, TreeItemCollapsibleState.None);
        this.command = command_;

        this.iconPath = {
            light: path.join(__dirname, '..', '..', '..', 'misc', 'predicate.svg'),
            dark: path.join(__dirname, '..', '..', '..', 'misc', 'predicate.svg')
        };

    }

    contextValue = 'predicate';
}
