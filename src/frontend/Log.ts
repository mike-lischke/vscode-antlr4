/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { type OutputChannel } from "vscode";

export type LogLevel = "none" | "error" | "warn" | "info" | "debug";

/** A typical logger class. */
export class Log {
    static #logLevel: LogLevel = "error";
    static #channel: OutputChannel | undefined;

    public static updateLogLevel(level: LogLevel): void {
        this.#logLevel = level;
    }

    public static setChannel(channel: OutputChannel): void {
        this.#channel = channel;
    }

    public static info(message: string): void {
        if (this.#logLevel !== "none") {
            this.print(["[info] " + message], false);
        }
    }

    public static debug(message: string): void {
        this.print(["[debug] " + message], false);
    }

    public static warn(message: string): void {
        this.print(["[warn] " + message], false);
    }

    public static error(lines: unknown[] | string): void {
        if (typeof lines === "string") {
            Log.print([lines], true);
        } else {
            Log.print(lines, true);
        }
    }

    private static print(lines: unknown[], revealOutput: boolean): void {
        if (!this.#channel) {
            return;
        }

        lines.forEach((line) => {
            if (typeof line === "string") {
                this.#channel!.appendLine(line);
            } else if (line instanceof Error) {
                this.#channel!.appendLine(line.stack ?? line.message);
            } else {
                this.#channel!.appendLine(String(line));
            }
        });

        if (revealOutput) {
            this.#channel.show(true);
        }
    }

}
