/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */

/* eslint-disable max-classes-per-file */

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";

export class LexerSymbolsProvider extends AntlrTreeDataProvider<LexerSymbol> {

    public getChildren(element?: LexerSymbol): ProviderResult<LexerSymbol[]> {
        if (!element) {
            let vocabulary;
            if (this.currentFile) {
                vocabulary = this.backend.getLexerVocabulary(this.currentFile);
            }

            if (vocabulary) {
                const list: LexerSymbol[] = [];
                list.push(new LexerSymbol("-1: EOF", TreeItemCollapsibleState.None, {
                    title: "<unused>",
                    command: "",
                    arguments: [],
                }));

                for (let i = 0; i <= vocabulary.maxTokenType; ++i) {
                    const literal = vocabulary.getLiteralName(i);
                    const symbolic = vocabulary.getSymbolicName(i);
                    let caption = i + ": ";
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

                    const info = this.backend.infoForSymbol(this.currentFile!,
                        symbolic ? symbolic : literal!.substr(1, literal!.length - 2));
                    const parameters: Command = { title: "", command: "" };
                    if (info && info.definition) {
                        parameters.title = "";
                        parameters.command = "antlr.selectGrammarRange";
                        parameters.arguments = [ info.definition.range ];
                    }
                    list.push(new LexerSymbol(caption, TreeItemCollapsibleState.None, parameters));
                }

                return new Promise((resolve) => {
                    resolve(list);
                });
            }
        }

        return new Promise((resolve) => {
            resolve([]);
        });
    }
}

export class LexerSymbol extends TreeItem {

    public iconPath = {
        light: path.join(__dirname, "..", "..", "..", "misc", "token-light.svg"),
        dark: path.join(__dirname, "..", "..", "..", "misc", "token-dark.svg"),
    };

    public contextValue = "lexerSymbols";

    public constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command,
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

}
