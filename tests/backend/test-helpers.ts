/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import fs from "fs";

/**
 * Generates the alignment.g4 grammar from formatting options in the alignment-template.g4 file.
 */
export const createAlignmentGrammar = (): void => {
    let grammar = "grammar alignment;\n\n// $antlr-format reset, columnLimit 200\n";
    const template = fs.readFileSync("tests/backend/formatting/alignment-template.g4", { encoding: "utf8" });
    const sections = template.split("\n");

    // For each section create 100 rules with some random parts.
    for (const section of sections) {
        grammar += "\n" + section + "\n";

        // Make it 30 lexer rules and 20 parser rules (less parser rules as we always use grouped alignments for them).
        for (let i = 0; i < 30; ++i) {
            if (i === 0) {
                grammar += "// $antlr-format groupedAlignments off\n";
            } else if (i === 15) {
                grammar += "// $antlr-format groupedAlignments on\n";
            }

            const ruleNameFillCount = Math.random() * 25 + 1;
            const useLexerAction = Math.random() < 0.5;
            const useComment = Math.random() < 0.5;
            const usePredicate = Math.random() < 0.5;
            const useAction = Math.random() < 0.5;

            const filler = "_".repeat(ruleNameFillCount);
            let line = `Keyword${filler}${i}:'Keyword${filler}${i}'`;

            if (useAction) {
                if (usePredicate) {
                    // Both, action and predicate. Make order random too.
                    if (Math.random() < 0.5) {
                        line += "{domeSomething($text);} ";
                        line += "{doesItBlend()}? ";
                    } else {
                        line += "{doesItBlend()}? ";
                        line += "{domeSomething($text);} ";
                    }
                } else {
                    line += "{domeSomething($text);} ";
                }
            } else if (usePredicate) {
                line += "{doesItBlend()}? ";
            }

            if (useLexerAction) {
                const type = Math.random() < 0.5 ? "mode" : "type";
                line += "-> " + type + "(SomethingReallyMeaningful) ";
            }

            line += ";";
            if (useComment) {
                line += " // Specified in the interest of formatting.";
            }

            grammar += line + "\n";
        }

        grammar += "// $antlr-format groupedAlignments on\n";
        for (let i = 0; i < 20; ++i) {
            if (i === 0) {
                grammar += "// $antlr-format allowShortRulesOnASingleLine false, allowShortBlocksOnASingleLine false\n";
            } else if (i === 10) {
                grammar += "// $antlr-format allowShortRulesOnASingleLine true, allowShortBlocksOnASingleLine true\n";
            }

            const ruleNameFillCount = Math.random() * 25 + 1;
            const useComment = Math.random() < 0.25;
            const action = Math.random() < 0.25 ? "{doSomething($text);}" : " ";
            const predicate = Math.random() < 0.25 ? "{doesItBlend}?" : " ";
            const useLabels = Math.random() < 0.5;

            let line = `rule${"_".repeat(ruleNameFillCount)}${i}: (`;

            if (useComment) {
                line += predicate + "alt1" + action + "ruleA// Mom look, a trailing comment.\n";
                line += "|" + predicate + "____alt2" + action + "ruleB// And another comment.\n";
                line += "|" + predicate + "____alt3" + action + "ruleB/* Not aligned comment.*/\n";
            } else {
                line += predicate + "alt1" + action + "ruleA|____alt2" + action + "ruleB";
            }
            line += ")";

            if (!useLabels) {
                line += "rule_ | rule__ | rule____ | rule________ ";
            } else {
                line += "rule_ # label_ | rule__ # label__ | rule____ #label____| rule________#label________ ";
            }

            line += action + predicate + ";";
            if (useComment) {
                line += " // Final trailing comment.";
            }

            grammar += line + "\n";
        }
    }

    fs.writeFileSync("tests/backend/formatting/alignment.g4", grammar, "utf8");
};

/**
 * Converts the given position in the text to a character index (assuming 4 chars tab width).
 *
 * @param text The text for which to convert the position.
 * @param column The position in the text line.
 * @param row The line in the text.
 *
 * @returns The character index in the text for the given position.
 */
export const positionToIndex = (text: string, column: number, row: number): number => {
    let currentRow = 1; // Remember: row numbers in ANTLR4 are one-based.
    let currentColumn = 0;

    for (let i = 0; i < text.length; ++i) {
        if (row < currentRow) { // Happens when the column value was greater than previous column width.
            return i - 1;
        }

        if (currentRow === row && currentColumn === column) {
            return i;
        }
        switch (text[i]) {
            case "\n": {
                currentColumn = 0;
                ++currentRow;
                break;
            }
            case "\t": {
                currentColumn += 4 - (currentColumn % 4);
                break;
            }
            default:
                ++currentColumn;
                break;
        }
    }

    return text.length;
};

/**
 * Converts the given character index into a column/row pair (assuming 4 chars tab width).
 *
 * @param text The text for which to convert the index.
 * @param index The character index in the text.
 *
 * @returns A [column, row] tuple with the position of the given index.
 */
export const indexToPosition = (text: string, index: number): [number, number] => {
    let currentRow = 1;
    let currentColumn = 0;
    for (let i = 0; i < text.length; ++i) {
        if (i === index) {
            return [currentColumn, currentRow];
        }
        switch (text[i]) {
            case "\n": {
                currentColumn = 0;
                ++currentRow;
                break;
            }
            case "\t": {
                currentColumn += 4 - (currentColumn % 4);
                break;
            }
            default:
                ++currentColumn;
                break;
        }
    }

    return [currentColumn, currentRow];
};
