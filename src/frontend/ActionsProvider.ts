/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, 2021, Mike Lischke
 *
 * See LICENSE file for more info.
 */

/* eslint-disable max-classes-per-file */

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, TextEditor, TreeView, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";
import { LexicalRange, CodeActionType } from "../backend/facade";
import { Utils, RangeHolder } from "./Utils";

export class ActionsProvider extends AntlrTreeDataProvider<TreeItem> {

    public actionTree: TreeView<TreeItem>;

    private namedActionsRoot: RootEntry;
    private parserActionsRoot: RootEntry;
    private lexerActionsRoot: RootEntry;
    private predicatesRoot: RootEntry;

    private namedActions: ChildEntry[] = [];
    private parserActions: ChildEntry[] = [];
    private lexerActions: ChildEntry[] = [];
    private predicates: ChildEntry[] = [];

    public update(editor: TextEditor): void {
        const position = editor.selection.active;

        const list = [...this.namedActions, ...this.parserActions, ...this.lexerActions, ...this.predicates];
        const action = Utils.findInListFromPosition(list, position.character, position.line + 1);
        if (action) {
            void this.actionTree.reveal(action, { select: true });
        }
    }

    public getParent?(element: TreeItem): ProviderResult<TreeItem> {
        if (element instanceof RootEntry) {
            return undefined;
        }

        return (element as ChildEntry).parent;
    }

    public getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
        if (!element) {
            return this.createRootEntries();
        }

        return new Promise((resolve, reject) => {
            if (!this.currentFile) {
                resolve(undefined);

                return;
            }

            try {
                let listType: CodeActionType;
                let parent: RootEntry;
                let list: ChildEntry[];
                switch (element.id) {
                    case "parserActions": {
                        this.parserActions = [];
                        list = this.parserActions;
                        listType = CodeActionType.Parser;
                        parent = this.parserActionsRoot;

                        break;
                    }

                    case "lexerActions": {
                        this.lexerActions = [];
                        list = this.lexerActions;
                        listType = CodeActionType.Lexer;
                        parent = this.parserActionsRoot;

                        break;
                    }

                    case "semanticPredicates": {
                        this.predicates = [];
                        list = this.predicates;
                        listType = CodeActionType.Predicate;
                        parent = this.parserActionsRoot;
                        break;
                    }

                    default: {
                        this.namedActions = [];
                        list = this.namedActions;
                        listType = CodeActionType.Named;
                        parent = this.parserActionsRoot;

                        break;
                    }
                }

                const actions = this.backend.listActions(this.currentFile, listType);

                actions.forEach((action) => {
                    /*                    let caption = action
                        ? action.description!.substr(1, action.description!.length - 2)
                        : "<unused>";*/
                    let caption;
                    if (action.description!.includes("\n")) {
                        caption = "<multi line block>";
                    } else {
                        caption = action.description!;
                    }

                    const command = action ? {
                        title: "Select Grammar Range",
                        command: "antlr.selectGrammarRange",
                        arguments: [action.definition!.range],
                    } : undefined;
                    const range = action ? action.definition!.range : undefined;

                    const item = new ChildEntry(parent, caption.trim(), listType, range, command);
                    list.push(item);
                });

                resolve(list);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Generates the root entries for the actions treeview.
     *
     * @returns A promise resolving to a list of root tree items.
     */
    private createRootEntries(): ProviderResult<TreeItem[]> {
        return new Promise((resolve, reject) => {
            try {
                const rootList: RootEntry[] = [];

                this.namedActionsRoot = new RootEntry("Named Actions", "namedActions");
                this.namedActionsRoot.tooltip = "Code which is embedded into the generated files " +
                    "at specific locations (like the head of the file). " +
                    "This code does not take part in the parsing process and is not represented in the ATN.";
                rootList.push(this.namedActionsRoot);

                this.parserActionsRoot = new RootEntry("Parser Actions", "parserActions");
                this.parserActionsRoot.tooltip = "Code which is embedded into the generated parser " +
                    "code and executed as part of the parsing process. There are also a transition for each " +
                    "action, but they are not used from the generated parser (all action indices are -1).";
                rootList.push(this.parserActionsRoot);

                this.lexerActionsRoot = new RootEntry("Lexer Actions", "lexerActions");
                this.lexerActionsRoot.tooltip = "Lexer rules are executed purely as a state machine without " +
                    "any embedded code. Instead lexer actions are held in a list and executed using the action index " +
                    "given in the action transition.";
                rootList.push(this.lexerActionsRoot);

                this.predicatesRoot = new RootEntry("Semantic Predicates", "semanticPredicates");
                this.predicatesRoot.tooltip = "Semantic predicates are code snippets which can enable or disable " +
                    "a specific alternative in a rule. They are also not embedded and addressed by an index " +
                    "like lexer actions. Their ATN representation is a predicate transition.";
                rootList.push(this.predicatesRoot);

                resolve(rootList);
            } catch (e) {
                reject(e);
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

export class ChildEntry extends TreeItem implements RangeHolder {

    private static imageBaseNames: Map<CodeActionType, string> = new Map([
        [CodeActionType.Named, "named-action"],
        [CodeActionType.Parser, "parser-action"],
        [CodeActionType.Lexer, "lexer-action"],
        [CodeActionType.Predicate, "predicate"],
    ]);

    public contextValue = "action";

    public constructor(
        public readonly parent: RootEntry,
        label: string,
        type: CodeActionType,
        public readonly range?: LexicalRange,
        command_?: Command) {

        super(label, TreeItemCollapsibleState.None);
        this.command = command_;

        const baseName = ChildEntry.imageBaseNames.get(type);
        if (baseName) {
            this.contextValue = baseName;
            this.iconPath = {
                light: path.join(__dirname, "..", "..", "..", "misc", baseName + "-light.svg"),
                dark: path.join(__dirname, "..", "..", "..", "misc", baseName + "-dark.svg"),
            };
        }

    }
}
