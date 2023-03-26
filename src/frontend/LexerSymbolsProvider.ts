/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

/* eslint-disable max-classes-per-file */

import { Vocabulary } from "antlr4ts";
import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";

export class LexerSymbolItem extends TreeItem {

    public override iconPath = {
        light: path.join(__dirname, "..", "..", "..", "misc", "token-light.svg"),
        dark: path.join(__dirname, "..", "..", "..", "misc", "token-dark.svg"),
    };

    public override contextValue = "lexerSymbols";

    public constructor(
        public override readonly label: string,
        public override readonly collapsibleState: TreeItemCollapsibleState,
        command?: Command,
    ) {
        super(label, collapsibleState);
        this.command = command;
    }
}

export class LexerSymbolsProvider extends AntlrTreeDataProvider<LexerSymbolItem> {

    public override getChildren(element?: LexerSymbolItem): ProviderResult<LexerSymbolItem[]> {
        return new Promise((resolve) => {
            if (!element) {
                let vocabulary;
                if (this.currentFile) {
                    vocabulary = this.backend.getLexerVocabulary(this.currentFile);
                }

                if (vocabulary) {
                    const items: LexerSymbolItem[] = [];
                    items.push(new LexerSymbolItem("-1: EOF", TreeItemCollapsibleState.None, {
                        title: "<unused>",
                        command: "",
                        arguments: [],
                    }));
                    for (let i = 0; i <= vocabulary.maxTokenType; ++i) {
                        items.push(this.generateTreeItem(i, vocabulary));
                    }

                    resolve(items);
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }

    private generateTreeItem(index: number, vocabulary: Vocabulary): LexerSymbolItem {
        const literal = vocabulary.getLiteralName(index);
        const symbolic = vocabulary.getSymbolicName(index);
        let caption = `${index}: `;
        if (!literal && !symbolic) {
            caption += "<unused>";
        } else {
            if (symbolic) {
                caption += symbolic;
            } else {
                caption += "<implicit token>";
            }

            if (literal) {
                caption += " (" + literal + ")";
            }
        }

        const alternative = literal ?? "";
        const info = this.backend.infoForSymbol(this.currentFile ?? "",
            symbolic ?? alternative.substring(1, alternative.length - 2));

        const parameters: Command = { title: "", command: "" };
        if (info && info.definition) {
            parameters.title = "";
            parameters.command = "antlr.selectGrammarRange";
            parameters.arguments = [info.definition.range];
        }

        return new LexerSymbolItem(caption, TreeItemCollapsibleState.None, parameters);
    }
}
