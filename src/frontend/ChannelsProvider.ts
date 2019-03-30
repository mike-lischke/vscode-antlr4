/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as path from "path";

import { TreeItem, TreeItemCollapsibleState, Command, Event } from "vscode";
import { AntlrTreeDataProvider } from "./AntlrTreeDataProvider";

export class ChannelsProvider extends AntlrTreeDataProvider<ChannelEntry> {

    getChildren(element?: ChannelEntry): Thenable<ChannelEntry[]> {
        if (!element) {
            var channels;
            if (this.currentFile) {
                channels = this.backend.getChannels(this.currentFile);
            }

            if (channels) {
                let list: ChannelEntry[] = [];
                for (let channel of channels) {
                    if (!channel || channel == "null") {
                        continue;
                    }
                    list.push(new ChannelEntry(channel, TreeItemCollapsibleState.None, {
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

export class ChannelEntry extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        command_?: Command
    ) {
        super(label, collapsibleState);
        this.command = command_;
    }

    iconPath = {
        light: path.join(__dirname, '..', '..', '..', 'misc', 'channel-light.svg'),
        dark: path.join(__dirname, '..', '..', '..', 'misc', 'channel-dark.svg')
    };

    contextValue = 'channels';
}
