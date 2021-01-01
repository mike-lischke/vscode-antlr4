/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */

/* eslint-disable max-classes-per-file */

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, TextEditor, TreeView, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";
import { SymbolInfo, LexicalRange } from "../backend/facade";
import { Utils, RangeHolder } from "./Utils";

export class ActionsProvider extends AntlrTreeDataProvider<TreeItem> {

    public actionTree: TreeView<TreeItem>;

    private actionsTreeItem: RootEntry;
    private predicatesTreeItem: RootEntry;

    private actions: ActionEntry[] = [];
    private predicates: PredicateEntry[] = [];

    public update(editor: TextEditor): void {
        const position = editor.selection.active;

        const action = Utils.findInListFromPosition(this.actions, position.character, position.line + 1);
        if (action) {
            void this.actionTree.reveal(action, { select: true });

            return;
        }

        const predicate = Utils.findInListFromPosition(this.predicates, position.character, position.line + 1);
        if (predicate) {
            void this.actionTree.reveal(predicate, { select: true });
        }
    }

    public getParent?(element: TreeItem): ProviderResult<TreeItem> {
        if (element === this.actionsTreeItem || element === this.predicatesTreeItem) {
            return null;
        }

        if (this.actions.find((action) => action === element)) {
            return this.actionsTreeItem;
        }

        return this.predicatesTreeItem;
    }

    public getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
        return new Promise((resolve, reject) => {
            if (!element) {
                const childList: RootEntry[] = [];

                this.actionsTreeItem = new RootEntry("(Named) Actions", "0");
                this.actionsTreeItem.tooltip = "A list of named actions for native code parts and code actions to " +
                    "execute during parsing/lexing";
                childList.push(this.actionsTreeItem);
                this.predicatesTreeItem = new RootEntry("Semantic + Precedence Predicates", "1");
                this.predicatesTreeItem.tooltip = "A list of semantic predicates used in this grammar and precedence " +
                    "predicates used internally by direct left recursive rules.";
                childList.push(this.predicatesTreeItem);

                resolve(childList);
            } else {
                let actions: SymbolInfo[] = [];
                const returnPredicates = element.id === "1";
                if (this.currentFile) {
                    actions = this.backend.listActions(this.currentFile);
                    actions = actions.filter((action) => action.isPredicate === returnPredicates);
                }

                const list: TreeItem[] = [];
                let index = 0;
                for (const action of actions) {
                    let caption = index++ + ": ";
                    const content = action.description!.substr(1, action.description!.length - 2);
                    if (content.includes("\n")) {
                        caption += "<multi line block>";
                    } else {
                        caption += content;
                    }

                    const command = {
                        title: "Select Grammar Range",
                        command: "antlr.selectGrammarRange",
                        arguments: [action.definition!.range],
                    };

                    let item: TreeItem;
                    if (returnPredicates) {
                        item = new PredicateEntry(caption.trim(), action.definition!.range, command);
                    } else {
                        item = new ActionEntry(caption.trim(), action.definition!.range, command);
                    }
                    list.push(item);
                }

                if (returnPredicates) {
                    this.predicates = list as PredicateEntry[];
                } else {
                    this.actions = list as ActionEntry[];
                }

                resolve(list);
            }
        });
    }
}

export class RootEntry extends TreeItem {

    public contextValue = "actions";

    public constructor(label: string, id: string) {
        super(label, TreeItemCollapsibleState.Expanded);
        this.id = id;
    }
}

export class ActionEntry extends TreeItem implements RangeHolder {

    public contextValue = "action";

    public constructor(label: string, public range: LexicalRange, command_?: Command) {
        super(label, TreeItemCollapsibleState.None);
        this.command = command_;

        this.iconPath = {
            light: path.join(__dirname, "..", "..", "..", "misc", "action-light.svg"),
            dark: path.join(__dirname, "..", "..", "..", "misc", "action-dark.svg"),
        };

    }
}

export class PredicateEntry extends TreeItem implements RangeHolder {

    public contextValue = "predicate";

    public constructor(label: string, public range: LexicalRange, command_?: Command) {
        super(label, TreeItemCollapsibleState.None);
        this.command = command_;

        this.iconPath = {
            light: path.join(__dirname, "..", "..", "..", "misc", "predicate-light.svg"),
            dark: path.join(__dirname, "..", "..", "..", "misc", "predicate-dark.svg"),
        };

    }
}
