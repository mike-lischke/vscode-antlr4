/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as path from "path";
import { TreeItem, TreeItemCollapsibleState, Command } from "vscode";

export class ParserSymbolItem extends TreeItem {

    public override iconPath = {
        light: path.join(__dirname, "..", "misc", "rule-light.svg"),
        dark: path.join(__dirname, "..", "misc", "rule-dark.svg"),
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
