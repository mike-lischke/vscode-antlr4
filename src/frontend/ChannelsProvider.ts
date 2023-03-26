/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

/* eslint-disable max-classes-per-file */

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, ProviderResult } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";

export class ChannelEntry extends TreeItem {

    public override iconPath = {
        light: path.join(__dirname, "..", "..", "..", "misc", "channel-light.svg"),
        dark: path.join(__dirname, "..", "..", "..", "misc", "channel-dark.svg"),
    };

    public override contextValue = "channels";

    public constructor(
        public override readonly label: string,
        public override readonly collapsibleState: TreeItemCollapsibleState,
        command?: Command,
    ) {
        super(label, collapsibleState);
        this.command = command;
    }

}

export class ChannelsProvider extends AntlrTreeDataProvider<ChannelEntry> {

    public override getChildren(element?: ChannelEntry): ProviderResult<ChannelEntry[]> {
        if (!element) {
            let channels;
            if (this.currentFile) {
                channels = this.backend.getChannels(this.currentFile);
            }

            if (channels) {
                const list: ChannelEntry[] = [];
                for (const channel of channels) {
                    if (!channel || channel === "null") {
                        continue;
                    }
                    list.push(new ChannelEntry(channel, TreeItemCollapsibleState.None, {
                        title: "<unused>",
                        command: "",
                        arguments: [],
                    }));
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
