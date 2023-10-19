/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { TreeItem, TextEditor, TreeView, ProviderResult } from "vscode";

import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider.js";
import { CodeActionType } from "../types.js";
import { FrontendUtils } from "./FrontendUtils.js";
import { ActionsRootEntry } from "./ActionsRootEntry.js";
import { ActionChildEntry } from "./ActionChildEntry.js";

export class ActionsProvider extends AntlrTreeDataProvider<TreeItem> {

    public actionTree: TreeView<TreeItem>;

    private globalNamedActionsRoot: ActionsRootEntry;
    private localNamedActionsRoot: ActionsRootEntry;
    private parserActionsRoot: ActionsRootEntry;
    private lexerActionsRoot: ActionsRootEntry;
    private parserPredicatesRoot: ActionsRootEntry;
    private lexerPredicatesRoot: ActionsRootEntry;

    private globalNamedActions: ActionChildEntry[] = [];
    private localNamedActions: ActionChildEntry[] = [];
    private parserActions: ActionChildEntry[] = [];
    private lexerActions: ActionChildEntry[] = [];
    private parserPredicates: ActionChildEntry[] = [];
    private lexerPredicates: ActionChildEntry[] = [];

    public update(editor: TextEditor): void {
        const position = editor.selection.active;

        let action = FrontendUtils.findInListFromPosition(this.globalNamedActions, position.character,
            position.line + 1);

        if (!action) {
            action = FrontendUtils.findInListFromPosition(this.localNamedActions, position.character,
                position.line + 1);
        }

        if (!action) {
            action = FrontendUtils.findInListFromPosition(this.parserActions, position.character, position.line + 1);
        }

        if (!action) {
            action = FrontendUtils.findInListFromPosition(this.lexerActions, position.character, position.line + 1);
        }

        if (!action) {
            action = FrontendUtils.findInListFromPosition(this.parserPredicates, position.character, position.line + 1);
        }

        if (!action) {
            action = FrontendUtils.findInListFromPosition(this.lexerPredicates, position.character, position.line + 1);
        }

        if (action) {
            void this.actionTree.reveal(action, { select: true });
        }
    }

    public getParent?(element: TreeItem): ProviderResult<TreeItem> {
        if (element instanceof ActionsRootEntry) {
            return undefined;
        }

        return (element as ActionChildEntry).parent;
    }

    public override getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
        if (!this.currentFile) {
            return null;
        }

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
                let parent: ActionsRootEntry;
                let list: ActionChildEntry[];

                switch (element.id) {
                    case "parserActions": {
                        this.parserActions = [];
                        list = this.parserActions;
                        listType = CodeActionType.ParserAction;
                        parent = this.parserActionsRoot;

                        break;
                    }

                    case "lexerActions": {
                        this.lexerActions = [];
                        list = this.lexerActions;
                        listType = CodeActionType.LexerAction;
                        parent = this.lexerActionsRoot;

                        break;
                    }

                    case "parserPredicates": {
                        this.parserPredicates = [];
                        list = this.parserPredicates;
                        listType = CodeActionType.ParserPredicate;
                        parent = this.parserPredicatesRoot;

                        break;
                    }

                    case "lexerPredicates": {
                        this.lexerPredicates = [];
                        list = this.lexerPredicates;
                        listType = CodeActionType.LexerPredicate;
                        parent = this.lexerPredicatesRoot;

                        break;
                    }

                    case "globalNamedActions": {
                        this.globalNamedActions = [];
                        list = this.globalNamedActions;
                        listType = CodeActionType.GlobalNamed;
                        parent = this.globalNamedActionsRoot;

                        break;
                    }

                    default: {
                        this.localNamedActions = [];
                        list = this.localNamedActions;
                        listType = CodeActionType.LocalNamed;
                        parent = this.localNamedActionsRoot;

                        break;
                    }
                }

                const actions = this.backend.listActions(this.currentFile, listType);

                actions.forEach((action, index) => {
                    let caption = action.name.length > 0 ? action.name : String(index);
                    if (action.description) {
                        if (action.description.includes("\n")) {
                            caption += ": <multi line block>";
                        } else {
                            caption += ": " + action.description;
                        }
                    }

                    const range = action && action.definition ? action.definition.range : undefined;
                    const command = action ? {
                        title: "Select Grammar Range",
                        command: "antlr.selectGrammarRange",
                        arguments: [range],
                    } : undefined;

                    const item = new ActionChildEntry(parent, caption.trim(), listType, range, command);
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
            if (!this.currentFile) {
                return null;
            }

            try {
                const rootList: ActionsRootEntry[] = [];

                const counts = this.backend.getActionCounts(this.currentFile);

                if ((counts.get(CodeActionType.GlobalNamed) ?? 0) > 0) {
                    this.globalNamedActionsRoot = new ActionsRootEntry("Global Named Actions", "globalNamedActions");
                    this.globalNamedActionsRoot.tooltip = "Code which is embedded into the generated files " +
                        "at specific locations (like the head of the file).\n\n" +
                        "This code does not take part in the parsing process and is not represented in the ATN.";
                    rootList.push(this.globalNamedActionsRoot);
                }

                if ((counts.get(CodeActionType.LocalNamed) ?? 0) > 0) {
                    this.localNamedActionsRoot = new ActionsRootEntry("Local Named Actions", "localNamedActions");
                    this.localNamedActionsRoot.tooltip = "Code which is embedded into the generated parser code " +
                        "for a rule, like initialization code (@init). \n\n" +
                        "This code is directly executed during the parsing process, but is not represented in the ATN.";
                    rootList.push(this.localNamedActionsRoot);
                }

                if ((counts.get(CodeActionType.ParserAction) ?? 0) > 0) {
                    this.parserActionsRoot = new ActionsRootEntry("Parser Actions", "parserActions");
                    this.parserActionsRoot.tooltip = "Code which is embedded into the generated parser " +
                        "code and executed as part of the parsing process. There are also transitions in the ATN for " +
                        "each action, but they are not used from the generated parser (all action indices are -1).";
                    rootList.push(this.parserActionsRoot);
                }

                if ((counts.get(CodeActionType.LexerAction) ?? 0) > 0) {
                    this.lexerActionsRoot = new ActionsRootEntry("Lexer Actions", "lexerActions");
                    this.lexerActionsRoot.tooltip = "Lexer rules are executed in a state machine without " +
                        "any embedded code. However lexer actions are held in generated private methods addressed " +
                        "by an action index given in the action transition between 2 ATN nodes.";
                    rootList.push(this.lexerActionsRoot);
                }

                if ((counts.get(CodeActionType.ParserPredicate) ?? 0) > 0) {
                    this.parserPredicatesRoot = new ActionsRootEntry("Parser Predicates", "parserPredicates");
                    this.parserPredicatesRoot.tooltip = "Semantic predicates are code snippets which can enable or " +
                        "disable a specific alternative in a rule. They are generated in separate methods and are " +
                        "addressed by an index just like lexer actions.\n\n" +
                        "The ATN representation of a predicate is a predicate transition between 2 ATN nodes.";
                    rootList.push(this.parserPredicatesRoot);
                }

                if ((counts.get(CodeActionType.LexerPredicate) ?? 0) > 0) {
                    this.lexerPredicatesRoot = new ActionsRootEntry("Lexer Predicates", "lexerPredicates");
                    this.lexerPredicatesRoot.tooltip = "Semantic predicates are code snippets which can enable or " +
                        "disable a specific alternative in a rule. They are generated in separate methods and are " +
                        "addressed by an index just like lexer actions.\n\n" +
                        "The ATN representation of a predicate is a predicate transition between 2 ATN nodes.";
                    rootList.push(this.lexerPredicatesRoot);
                }

                resolve(rootList);
            } catch (e) {
                reject(e);
            }
        });
    }
}
