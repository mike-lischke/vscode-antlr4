/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";
import * as fs from "fs";

import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, Command, EventEmitter, Event, window } from "vscode";
import { AntlrFacade } from "../backend/facade";
import { DebuggerConsumer } from "./AntlrDebugAdapter";
import { GrapsDebugger } from "../backend/GrapsDebugger";

export class ParserSymbolsProvider implements TreeDataProvider<ParserSymbol>, DebuggerConsumer {
    private _onDidChangeTreeData = new EventEmitter<ParserSymbol | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private backend: AntlrFacade) { }

    public debugger: GrapsDebugger;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    debuggerStopped(): void {
        // no-op
    }

    getTreeItem(element: ParserSymbol): TreeItem {
        return element;
    }

    getChildren(element?: ParserSymbol): Thenable<ParserSymbol[]> {
        if (!element) {
            let editor = window.activeTextEditor;
            if (this.debugger) {
                let symbols = this.debugger.parserSymbols;
                let list: ParserSymbol[] = [];
                for (let i = 0; i < symbols.length; ++i) {
                    let caption = i + ": " + symbols[i];
                    list.push(new ParserSymbol(caption, TreeItemCollapsibleState.None, {
                        title: "<unused>",
                        command: "",
                        arguments: []
                    }));
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
        light: path.join(__dirname, '..', '..', '..', 'misc', 'rule.svg'),
        dark: path.join(__dirname, '..', '..', '..', 'misc', 'rule.svg')
    };

    contextValue = 'parserSymbols';
}
