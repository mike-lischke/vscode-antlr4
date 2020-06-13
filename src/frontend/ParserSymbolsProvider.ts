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

export class ParserSymbolsProvider extends AntlrTreeDataProvider<ParserSymbol> {

    public getChildren(element?: ParserSymbol): ProviderResult<ParserSymbol[]> {
        if (!element) {
            let rules;
            if (this.currentFile) {
                rules = this.backend.getRuleList(this.currentFile);
            }

            if (rules) {
                const list: ParserSymbol[] = [];
                for (let i = 0; i < rules.length; ++i) {
                    const caption = i + ": " + rules[i];
                    const info = this.backend.infoForSymbol(this.currentFile!, rules[i]);
                    const parameters: Command = { title: "", command: "" };
                    if (info && info.definition) {
                        parameters.title = "";
                        parameters.command = "antlr.selectGrammarRange";
                        parameters.arguments = [ info.definition.range ];
                    }

                    list.push(new ParserSymbol(caption, TreeItemCollapsibleState.None, parameters));
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

export class ParserSymbol extends TreeItem {

    public iconPath = {
        light: path.join(__dirname, "..", "..", "..", "misc", "rule-light.svg"),
        dark: path.join(__dirname, "..", "..", "..", "misc", "rule-dark.svg"),
    };

    public contextValue = "parserSymbols";

    public constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command,
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

}
