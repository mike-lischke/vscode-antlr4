/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

/* eslint-disable max-classes-per-file */

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider.js";

export class ParserSymbol extends TreeItem {

    public override iconPath = {
        light: path.join(__dirname, "..", "..", "..", "misc", "rule-light.svg"),
        dark: path.join(__dirname, "..", "..", "..", "misc", "rule-dark.svg"),
    };

    public override contextValue = "parserSymbols";

    public constructor(
        public override readonly label: string,
        public override readonly collapsibleState: TreeItemCollapsibleState,
        command?: Command,
    ) {
        super(label, collapsibleState);
        this.command = command;
    }

}

export class ParserSymbolsProvider extends AntlrTreeDataProvider<ParserSymbol> {

    public override getChildren(element?: ParserSymbol): ProviderResult<ParserSymbol[]> {
        return new Promise((resolve) => {
            if (!element) {
                let rules: string[] | undefined;
                if (this.currentFile) {
                    rules = this.backend.getRuleList(this.currentFile);
                }

                const list: ParserSymbol[] = [];
                if (rules) {
                    rules.forEach((rule, index) => {
                        const info = this.backend.infoForSymbol(this.currentFile!, rule);
                        const parameters: Command = { title: "", command: "" };
                        const caption = `${index}: ${rules![index]}`;
                        if (info && info.definition) {
                            parameters.title = "";
                            parameters.command = "antlr.selectGrammarRange";
                            parameters.arguments = [info.definition.range];
                        }

                        list.push(new ParserSymbol(caption, TreeItemCollapsibleState.None, parameters));
                    });
                }

                resolve(list);
            }
        });
    }
}
