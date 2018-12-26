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

export class LexerSymbolsProvider implements TreeDataProvider<LexerSymbol> {
    private _onDidChangeTreeData = new EventEmitter<LexerSymbol | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private backend: AntlrFacade) { }

    refresh(fileName: string): void {
        this.currentFile = fileName;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: LexerSymbol): TreeItem {
        return element;
    }

    getChildren(element?: LexerSymbol): Thenable<LexerSymbol[]> {
        if (!element) {
            let vocabulary;
            if (this.currentFile) {
                vocabulary = this.backend.getLexerVocabulary(this.currentFile);
            }

            if (vocabulary) {
                let list: LexerSymbol[] = [];
                list.push(new LexerSymbol("-1: EOF", TreeItemCollapsibleState.None, {
                    title: "<unused>",
                    command: "",
                    arguments: []
                }));

                for (let i = 0; i <= vocabulary.maxTokenType; ++i) {
                    let literal = vocabulary.getLiteralName(i);
                    let symbolic = vocabulary.getSymbolicName(i);
                    let caption = "";
                    if (!literal && !symbolic) {
                        caption = "<unused>";
                    } else {
                        caption = i + ": ";
                        if (symbolic) {
                            caption += symbolic;
                        } else {
                            caption += "<implic token>"
                        }

                        if (literal) {
                            caption += " (" + literal + ")";
                        }
                    }

                    let info = this.backend.infoForSymbol(this.currentFile!, symbolic ? symbolic : literal!.substr(1, literal!.length - 2));
                    let parameters: Command = { title: "", command: "" };
                    if (info && info.definition) {
                        parameters.title = ""
                        parameters.command = "revealLine";
                        parameters.arguments = [];
                        parameters.arguments.push({ lineNumber: info.definition.range.start.row - 1, at: "top" });
                    }
                    list.push(new LexerSymbol(caption, TreeItemCollapsibleState.None, parameters));
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

export class LexerSymbol extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

    iconPath = {
        light: path.join(__dirname, '..', '..', '..', 'misc', 'lexer-token.svg'),
        dark: path.join(__dirname, '..', '..', '..', 'misc', 'lexer-token.svg')
    };

    contextValue = 'lexerSymbols';
}
