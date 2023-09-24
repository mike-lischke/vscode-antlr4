/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { TreeItemCollapsibleState, ProviderResult } from "vscode";

import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider.js";
import { ChannelEntry } from "./ChannelEntry.js";

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
