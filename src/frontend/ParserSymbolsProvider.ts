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

export class ParserSymbolsProvider extends AntlrTreeDataProvider<ParserSymbol> {

    getChildren(element?: ParserSymbol): Thenable<ParserSymbol[]> {
        if (!element) {
            let rules;
            if (this.currentFile) {
                rules = this.backend.getRuleList(this.currentFile);
            }

            if (rules) {
                let list: ParserSymbol[] = [];
                for (let i = 0; i < rules.length; ++i) {
                    let caption = i + ": " + rules[i];
                    let info = this.backend.infoForSymbol(this.currentFile!, rules[i]);
                    let parameters: Command = { title: "", command: "" };
                    if (info && info.definition) {
                        parameters.title = ""
                        parameters.command = "antlr.selectGrammarRange";
                        parameters.arguments = [ info.definition!.range ];
                    }

                    list.push(new ParserSymbol(caption, TreeItemCollapsibleState.None, parameters));
                }
                return new Promise(resolve => {
                    resolve(list);
                });
            }
        }

        return new Promise(resolve => {
            resolve([]);
        });
    }
}

export class ParserSymbol extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

    iconPath = {
        light: path.join(__dirname, '..', '..', '..', 'misc', 'rule-light.svg'),
        dark: path.join(__dirname, '..', '..', '..', 'misc', 'rule-dark.svg')
    };

    contextValue = 'parserSymbols';
}
