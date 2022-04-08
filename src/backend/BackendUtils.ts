/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2021, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { ParserRuleContext } from "antlr4ts";
import { ParseTree, TerminalNode } from "antlr4ts/tree";

export class BackendUtils {
    /**
     * Get the lowest level parse tree, which covers the given position.
     *
     * @param root The start point to search from.
     * @param column The position in the given row.
     * @param row The row position to search for.
     *
     * @returns The parse tree which covers the given position or undefined if none could be found.
     */
    public static parseTreeFromPosition = (root: ParseTree, column: number, row: number): ParseTree | undefined => {
        // Does the root node actually contain the position? If not we don't need to look further.
        if (root instanceof TerminalNode) {
            const terminal = (root);
            const token = terminal.symbol;
            if (token.line !== row) { return undefined; }

            const tokenStop = token.charPositionInLine + (token.stopIndex - token.startIndex + 1);
            if (token.charPositionInLine <= column && tokenStop >= column) {
                return terminal;
            }

            return undefined;
        } else {
            const context = (root as ParserRuleContext);
            if (!context.start || !context.stop) { // Invalid tree?
                return undefined;
            }

            if (context.start.line > row || (context.start.line === row && column < context.start.charPositionInLine)) {
                return undefined;
            }

            const tokenStop = context.stop.charPositionInLine + (context.stop.stopIndex - context.stop.startIndex + 1);
            if (context.stop.line < row || (context.stop.line === row && tokenStop < column)) {
                return undefined;
            }

            if (context.children) {
                for (const child of context.children) {
                    const result = BackendUtils.parseTreeFromPosition(child, column, row);
                    if (result) {
                        return result;
                    }
                }
            }

            return context;

        }
    };

}
