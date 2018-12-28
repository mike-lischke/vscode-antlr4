/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import { TreeDataProvider, TreeItem, Event, EventEmitter, TextDocument } from "vscode";
import { AntlrFacade } from "../backend/facade";

export class AntlrTreeDataProvider<T> implements TreeDataProvider<T> {
    private _onDidChangeTreeData = new EventEmitter<T>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(protected backend: AntlrFacade) { }

    refresh(document: TextDocument): void {
        if (document.languageId === "antlr" && document.uri.scheme === "file") {
            this.currentFile = document.fileName;
        } else {
            this.currentFile = undefined;
        }
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: T): TreeItem {
        return element;
    }

    getChildren(element?: T): Thenable<T[]> {
        return new Promise(resolve => {
            resolve([]);
        });
    }

    protected currentFile: string | undefined;
}
