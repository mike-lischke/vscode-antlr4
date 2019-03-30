/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, TextEditor, TreeView, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";
import { SymbolInfo, LexicalRange } from "../backend/facade";
import { Utils } from "./Utils";

export class ActionsProvider extends AntlrTreeDataProvider<TreeItem> {

    public actionTree: TreeView<TreeItem>;

    public update(editor: TextEditor) {
        let position = editor.selection.active;

        let action = Utils.findInListFromPosition(this.actions, position.character, position.line + 1);
        if (action) {
            this.actionTree.reveal(action, { select: true });
            return;
        }
        let predicate = Utils.findInListFromPosition(this.predicates, position.character, position.line + 1);
        if (predicate) {
            this.actionTree.reveal(predicate, { select: true });
            return;
        }
    }

    getParent?(element: TreeItem): ProviderResult<TreeItem> {
        if (element == this.actionsTreeItem || element == this.predicatesTreeItem) {
            return null;
        }

        if (this.actions.find(action => action == element)) {
            return this.actionsTreeItem;
        }

        return this.predicatesTreeItem;
    }

    getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
        if (!element) {
            let list: RootEntry[] = [];

            this.actionsTreeItem = new RootEntry("(Named) Actions", "0");
            list.push(this.actionsTreeItem);
            this.predicatesTreeItem = new RootEntry("Semantic Predicates", "1");
            list.push(this.predicatesTreeItem );

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
                item = new PredicateEntry(caption.trim(), action.definition!.range, {
                    title: "",
                    command: "antlr.selectGrammarRange",
                    arguments: [action.definition!.range]
                })
            } else {
                item = new ActionEntry(caption.trim(), action.definition!.range, {
                    title: "",
                    command: "antlr.selectGrammarRange",
                    arguments: [action.definition!.range]
                })
            }
            list.push(item);
        }

        if (returnPredicates) {
            this.predicates = list as Array<PredicateEntry>;
        } else {
            this.actions = list as Array<ActionEntry>;
        }

        return new Promise(resolve => {
            resolve(list);
        });
    }

    private actionsTreeItem: RootEntry;
    private predicatesTreeItem: RootEntry;

    private actions: ActionEntry[] = [];
    private predicates: PredicateEntry[] = [];
}

export class RootEntry extends TreeItem {

    constructor(label: string, id: string) {
        super(label, TreeItemCollapsibleState.Expanded);
        this.id = id;
    }

    contextValue = 'actions';
}

export class ActionEntry extends TreeItem {

    constructor(label: string, public range: LexicalRange, command_?: Command) {
        super(label, TreeItemCollapsibleState.None);
        this.command = command_;

        this.iconPath = {
            light: path.join(__dirname, '..', '..', '..', 'misc', 'action-light.svg'),
            dark: path.join(__dirname, '..', '..', '..', 'misc', 'action-dark.svg')
        };

    }

    contextValue = 'action';
}

export class PredicateEntry extends TreeItem {

    constructor(label: string, public range: LexicalRange, command_?: Command) {
        super(label, TreeItemCollapsibleState.None);
        this.command = command_;

        this.iconPath = {
            light: path.join(__dirname, '..', '..', '..', 'misc', 'predicate-light.svg'),
            dark: path.join(__dirname, '..', '..', '..', 'misc', 'predicate-dark.svg')
        };

    }

    contextValue = 'predicate';
}
