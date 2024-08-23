/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { TreeItemCollapsibleState, Command, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider.js";
import { ParserSymbolItem } from "./ParserSymbolItem.js";

export class ParserSymbolsProvider extends AntlrTreeDataProvider<ParserSymbolItem> {

    public override getChildren(element?: ParserSymbolItem): ProviderResult<ParserSymbolItem[]> {
        return new Promise((resolve) => {
            if (!element) {
                let rules: string[] | undefined;
                if (this.currentFile) {
                    rules = this.backend.getRuleList(this.currentFile);
                }

                const list: ParserSymbolItem[] = [];
                if (rules) {
                    rules.forEach((rule, index) => {
                        const info = this.backend.infoForSymbol(this.currentFile!, rule);
                        const parameters: Command = { title: "", command: "" };
                        const caption = `${index}: ${rules[index]}`;
                        if (info && info.definition) {
                            parameters.title = "";
                            parameters.command = "antlr.selectGrammarRange";
                            parameters.arguments = [info.definition.range];
                        }

                        list.push(new ParserSymbolItem(caption, TreeItemCollapsibleState.None, parameters));
                    });
                }

                resolve(list);
            }
        });
    }
}
