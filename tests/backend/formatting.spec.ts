/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as fs from "fs";

import { AntlrFacade } from "../../src/backend/facade.js";
import { positionToIndex, indexToPosition } from "./test-helpers.js";

interface ITestRange {
    source: {
        start: {
            column: number;
            row: number;
        };
        end: {
            column: number;
            row: number;
        };
    };
    target: {
        start: {
            column: number;
            row: number;
        };
        end: {
            column: number;
            row: number;
        };
    };
    result: string;
}

describe("Formatting", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.

    it("With all options (except alignment)", () => {
        // Format a file with all kinds of syntactic elements. Start out with default
        // formatting options and change them in the file to test all variations.
        const [text] = backend.formatGrammar("tests/backend/formatting/raw.g4", {}, 0, 1e10);

        //fs.writeFileSync("tests/backend/formatting-results/raw2.g4", text, "utf8");
        const expected = fs.readFileSync("tests/backend/formatting-results/raw.g4", { encoding: "utf8" });
        expect(expected).toEqual(text);
    });

    it("Alignment formatting", () => {
        //createAlignmentGrammar();

        // Load a large file with all possible alignment combinations (50 rules for each permutation),
        // checking so also the overall performance (9600 rules).
        const [text] = backend.formatGrammar("tests/backend/formatting/alignment.g4", {}, 0, 1e10);

        //fs.writeFileSync("tests/backend/formatting-results/alignment.g4", text, "utf8");
        const expected = fs.readFileSync("tests/backend/formatting-results/alignment.g4", { encoding: "utf8" });
        expect(expected).toEqual(text);
    });

    it("Ranged formatting", () => {
        let [text, targetStart, targetStop] = backend.formatGrammar("tests/backend/formatting/raw.g4", {}, -10, -20);
        expect(text).toHaveLength(0);
        expect(targetStart).toEqual(0);
        expect(targetStop).toEqual(4);

        const rangeTests = JSON.parse(fs.readFileSync("tests/backend/formatting/ranges.json",
            { encoding: "utf8" })) as ITestRange[];
        const source = fs.readFileSync("tests/backend/formatting/raw.g4", { encoding: "utf8" });
        for (let i = 1; i <= rangeTests.length; ++i) {
            const rangeTest = rangeTests[i - 1];

            // Range ends are non-inclusive.
            const startIndex = positionToIndex(source, rangeTest.source.start.column, rangeTest.source.start.row);
            const stopIndex = positionToIndex(source, rangeTest.source.end.column, rangeTest.source.end.row) - 1;
            [text, targetStart, targetStop] = backend.formatGrammar("tests/backend/formatting/raw.g4", {},
                startIndex, stopIndex);

            const [startColumn, startRow] = indexToPosition(source, targetStart);
            const [stopColumn, stopRow] = indexToPosition(source, targetStop + 1);
            const range = {
                start: { column: startColumn, row: startRow }, end: { column: stopColumn, row: stopRow },
            };

            //fs.writeFileSync("tests/backend/formatting-results/" + rangeTest.result, text, "utf8");
            const expected = fs.readFileSync("tests/backend/formatting-results/" + rangeTest.result,
                { encoding: "utf8" });
            expect(range).toStrictEqual(rangeTest.target);
            expect(expected).toEqual(text);
        }
    });
});
