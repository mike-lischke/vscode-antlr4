/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

"use strict";

import * as fs from "fs";

import { ATN } from "antlr4ts/atn";
import { Vocabulary, VocabularyImpl } from "antlr4ts";
import { CompatibleATNDeserializer } from "./CompatibleATNDeserializer";

export class InterpreterData {
    atn: ATN;
    vocabulary: Vocabulary;
    ruleNames: string[];
    channels: string[]; // Only valid for lexer grammars.
    modes: string[]; // ditto
};

export class InterpreterDataReader {

    static parseFile(fileName: string): InterpreterData {
        let result = new InterpreterData();
        result.ruleNames = [];
        result.channels = [];
        result.modes = [];

        let step = 0;
        let literalNames = [];
        let symbolicNames = [];
        let source = fs.readFileSync(fileName, 'utf8');
        let lines = source.split("\n");
        let index = 0;
        let line = lines[index++];
        if (line !== "token literal names:") {
            throw new Error("Unexpected data entry");
        }

        do {
            line = lines[index++];
            if (line.length == 0) {
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
            if (line.length == 0) {
                break;
            }
            symbolicNames.push(line === "null" ? "" : line);
        } while (true);

        result.vocabulary = new VocabularyImpl(literalNames, symbolicNames, []);

        line = lines[index++];
        if (line !== "rule names:") {
            throw new Error("Unexpected data entry");
        }

        do {
            line = lines[index++];
            if (line.length == 0) {
                break;
            }
            result.ruleNames.push(line);
        } while (true);

        line = lines[index++];
        if (line === "channel names:") { // Additional lexer data.
            do {
                line = lines[index++];
                if (line.length == 0) {
                    break;
                }
                result.channels.push(line);
            } while (true);

            line = lines[index++];
            if (line !== "mode names:") {
                throw new Error("Unexpected data entry");
            }

            do {
                line = lines[index++];
                if (line.length == 0) {
                    break;
                }
                result.modes.push(line);
            } while (true);
        };

        line = lines[index++];
        if (line !== "atn:") {
            throw new Error("Unexpected data entry");
        }

        line = lines[index++];
        let elements = line.split(",");
        let value;
        let serializedATN = new Uint16Array(elements.length);
        for (let i = 0; i < elements.length; ++i) {
            let element = elements[i];
            if (element.startsWith("["))
                value = Number(element.substring(1).trim());
            else if (element.endsWith("]"))
                value = Number(element.substring(0, element.length - 1).trim());
            else
                value = Number(element.trim());
            serializedATN[i] = value;
        }

        let deserializer = new CompatibleATNDeserializer();
        result.atn = deserializer.deserialize(serializedATN);
        return result;
    }
};
