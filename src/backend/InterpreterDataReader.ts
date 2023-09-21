/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as fs from "fs";

import { ATN, ATNDeserializer, Vocabulary } from "antlr4ng";

export interface IInterpreterData {
    atn: ATN;
    vocabulary: Vocabulary;
    ruleNames: string[];
    channels: string[]; // Only valid for lexer grammars.
    modes: string[]; // ditto
}

export class InterpreterDataReader {

    public static parseFile(fileName: string): IInterpreterData {
        const ruleNames: string[] = [];
        const channels: string[] = [];
        const modes: string[] = [];

        const literalNames = [];
        const symbolicNames = [];
        const source = fs.readFileSync(fileName, "utf8");
        const lines = source.split("\n");
        let index = 0;
        let line = lines[index++];
        if (line !== "token literal names:") {
            throw new Error("Unexpected data entry");
        }

        do {
            line = lines[index++];
            if (line.length === 0) {
                break;
            }
            literalNames.push(line === "null" ? "" : line);
        } while (true);

        line = lines[index++];
        if (line !== "token symbolic names:") {
            throw new Error("Unexpected data entry");
        }

        do {
            line = lines[index++];
            if (line.length === 0) {
                break;
            }
            symbolicNames.push(line === "null" ? "" : line);
        } while (true);

        line = lines[index++];
        if (line !== "rule names:") {
            throw new Error("Unexpected data entry");
        }

        do {
            line = lines[index++];
            if (line.length === 0) {
                break;
            }
            ruleNames.push(line);
        } while (true);

        line = lines[index++];
        if (line === "channel names:") { // Additional lexer data.
            do {
                line = lines[index++];
                if (line.length === 0) {
                    break;
                }
                channels.push(line);
            } while (true);

            line = lines[index++];
            if (line !== "mode names:") {
                throw new Error("Unexpected data entry");
            }

            do {
                line = lines[index++];
                if (line.length === 0) {
                    break;
                }
                modes.push(line);
            } while (true);
        }

        line = lines[index++];
        if (line !== "atn:") {
            throw new Error("Unexpected data entry");
        }

        line = lines[index++];
        const elements = line.split(",");
        let value;

        //const serializedATN = new Uint16Array(elements.length);
        const serializedATN: number[] = [];
        for (let i = 0; i < elements.length; ++i) {
            const element = elements[i];
            if (element.startsWith("[")) {
                value = Number(element.substring(1).trim());
            } else if (element.endsWith("]")) {
                value = Number(element.substring(0, element.length - 1).trim());
            } else {
                value = Number(element.trim());
            }
            serializedATN[i] = value;
        }

        const deserializer = new ATNDeserializer();

        return {
            atn: deserializer.deserialize(serializedATN),
            vocabulary: new Vocabulary(literalNames, symbolicNames, []),
            ruleNames,
            channels,
            modes,
        };
    }
}
