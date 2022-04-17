/*
 * This file is released under the MIT license.
 * Copyright (c) 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

// Types for use in webview modules. Don't use them in extension code, as this file is transpiled as ES module,
// not like the extension code as CommonJS.

import { ATNStateType, TransitionType } from "antlr4ts/atn";

/**
 * A range within a text. Just like the range object in vscode the end position is not included in the range.
 * Hence when start and end position are equal the range is empty.
 */

export interface ILexicalRange {
    start: { column: number; row: number };
    end: { column: number; row: number };
}
// The definition of a single symbol (range and content it is made of).

export interface IDefinition {
    text: string;
    range: ILexicalRange;
}

/**
 * Contains a number of values for a lexer token. Used when constructing a token list and parse trees in the debugger.
 */
export interface ILexerToken {
    [key: string]: string | number | object;

    text: string;
    type: number;
    name: string;
    line: number;
    offset: number; // Offset in the line.
    channel: number;
    tokenIndex: number;
    startIndex: number;
    stopIndex: number;
}

export enum ParseTreeNodeType {
    Rule,
    Terminal,
    Error
}

/**
 * Describes the a range in an input stream (character indexes in a char stream or token indexes in a token stream).
 * Indexes can be < 0 if there's no input representation for a tree node (e.g. when it did not match anything).
 */
export interface IIndexRange {
    startIndex: number;
    stopIndex: number;
    length: number;
}

/**
 * This node class is what exported parse trees are made of, which are created by the debugger interface.
 * Each node stands either for an invoked rule, a terminal node or an error node.
 */
export interface IParseTreeNode {
    type: ParseTreeNodeType;
    id: number; // A unique id for D3.js.

    ruleIndex?: number; // Only valid for the rule node type.
    name: string;
    start?: ILexerToken; // ditto
    stop?: ILexerToken; // ditto
    range?: IIndexRange; // ditto

    symbol?: ILexerToken; // Only valid for non-rule nodes.

    children: IParseTreeNode[]; // Available for all node types, but empty for non-rule types.
}

export interface IAtnNode {
    id: number; // A unique number (positive for state numbers, negative for rule nodes)
    name: string;
    type: ATNStateType;

    // Cached position values.
    fx?: number;
    fy?: number;
}

export interface IAtnLink {
    source: number;
    target: number;
    type: TransitionType;
    labels: Array<{ content: string; class?: string }>;
}

/**
 * Contains the link + node values which describe the ATN graph for a single rule.
 */
export interface IAtnGraphData {
    nodes: IAtnNode[];
    links: IAtnLink[];
}
