/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";

import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, Command, Event, EventEmitter, window } from "vscode";
import { AntlrFacade } from "../backend/facade";

export class ParserSymbolsProvider implements TreeDataProvider<ParserSymbol> {
    private _onDidChangeTreeData = new EventEmitter<ParserSymbol | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private backend: AntlrFacade) { }

    refresh(fileName: string): void {
        this.currentFile = fileName;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ParserSymbol): TreeItem {
        return element;
    }

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
                        parameters.command = "revealLine";
                        parameters.arguments = [];
                        parameters.arguments.push({ lineNumber: info.definition.range.start.row - 1, at: "top" });
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

    private currentFile: string | undefined;
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
        light: path.join(__dirname, '..', '..', '..', 'misc', 'rule.svg'),
        dark: path.join(__dirname, '..', '..', '..', 'misc', 'rule.svg')
    };

    contextValue = 'parserSymbols';
}
