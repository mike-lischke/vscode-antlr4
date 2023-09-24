/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as path from "path";
import { TreeItem, TreeItemCollapsibleState, Command } from "vscode";

export class ImportTreeItem extends TreeItem {

    public override iconPath = {
        light: path.join(__dirname, "..", "misc", "dependency-light.svg"),
        dark: path.join(__dirname, "..", "misc", "dependency-dark.svg"),
    };

    public override contextValue = "grammar-dependency";

    public constructor(
        public override readonly label: string,
        public override readonly collapsibleState: TreeItemCollapsibleState,
        command?: Command,
    ) {
        super(label, collapsibleState);
        this.command = command;
    }
}
