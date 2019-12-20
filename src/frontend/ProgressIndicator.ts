/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { StatusBarAlignment, StatusBarItem, window } from "vscode";

export class ProgressIndicator {
    private static progressChars: string = "⠁⠃⠅⡁⢁⠡⠑⠉⠁⠃⠇⡃⢃⠣⠓⠋⠃⠃⠇⡇⢇⠧⠗⠏⠇⠇⠇⡇⣇⡧⡗⡏⡇⡇⡇⡇⣇⣧⣗⣏⣇⣇⣇⣇⣇⣧⣷⣯⣧⣧⣧⣧⣧⣧⣷⣿⣿⣿⣿⣿⣿⣿⣿";

    private statusBarItem: StatusBarItem;
    private timer: any;
    private progress = 0;

    constructor() {
        this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 0);
        this.statusBarItem.hide();
        this.statusBarItem.tooltip = "ANTLR4 generating interpreter data";
    }

    startAnimation() {
        this.statusBarItem.show();
        this.timer = setInterval(() => {
            let index = this.progress % ProgressIndicator.progressChars.length;
            this.statusBarItem.text = "ANTLR " + ProgressIndicator.progressChars.charAt(index);
            this.progress++;
        }, 50);
    }

    stopAnimation() {
        clearInterval(this.timer);
        this.timer = null;
        this.statusBarItem.hide();
    }
}
