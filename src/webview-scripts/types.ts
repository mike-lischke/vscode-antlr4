/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

// Types for use in webview modules.

import { Uri } from "vscode";

import { TransitionType } from "antlr4ng";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3";

export interface IWebviewMessage {
    [key: string]: unknown;
}

/** Describes the structure of the object returned by `acquireVsCodeApi()`. */
export interface IVSCode {
    postMessage(message: IWebviewMessage): void;
    getState(): unknown;
    setState(state: unknown): void;
}

declare const acquireVsCodeApi: () => IVSCode;

export const vscode = acquireVsCodeApi();

/**
 * A range within a text. Just like the range object in vscode the end position is not included in the range.
 * Hence when start and end position are equal the range is empty.
 */

export interface ILexicalRange {
    start: { column: number; row: number; };
    end: { column: number; row: number; };
}

/** The definition of a single symbol (range and content it is made of). */
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
 * This interface is a duplicate of the same named interface in backend/types.ts. We need the duplication
 * because it's used both, in the (CommonJS) extension code and the (ESM) webview code.
 */
export interface IParseTreeNode {
    type: "rule" | "terminal" | "error";
    id: number; // A unique id for D3.js.

    ruleIndex?: number; // Only valid for the rule node type.
    name: string;
    start?: ILexerToken; // ditto
    stop?: ILexerToken; // ditto
    range?: IIndexRange; // ditto

    symbol?: ILexerToken; // Only valid for non-rule nodes.

    children: IParseTreeNode[]; // Available for all node types, but empty for non-rule types.
}

export interface IATNGraphRendererData {
    uri: Uri;
    ruleName?: string;
    maxLabelCount: number;
    graphData?: IATNGraphData;
    initialScale: number;
    initialTranslation: { x?: number; y?: number; };
}

export interface IATNGraphUpdateMessageData {
    command: "updateATNTreeData";
    ruleIndex?: number;
    graphData: IATNGraphRendererData;
}

export interface IATNStateSaveMessage extends IWebviewMessage {
    command: "saveATNState";
    nodes: IATNGraphLayoutNode[];
    uri: Uri;
    rule: string;
    transform: d3.ZoomTransform;
}

export interface IATNNode {
    id: number; // A unique number (positive for state numbers, negative for rule nodes)
    name: string;

    // We use the INVALID_TYPE in this field to denote a rule node.
    type: number;
}

export interface IATNLink {
    source: number;
    target: number;
    type: TransitionType;
    labels: Array<{ content: string; class?: string; }>;
}

/**
 * Contains the link + node values which describe the ATN graph for a single rule.
 */
export interface IATNGraphData {
    nodes: IATNNode[];
    links: IATNLink[];
}

export interface IATNGraphLayoutNode extends SimulationNodeDatum, IATNNode {
    width?: number;
    endX?: number;
    endY?: number;
}

export interface IATNGraphLayoutLink extends SimulationLinkDatum<IATNGraphLayoutNode> {
    type: TransitionType;
    labels: Array<{ content: string; class?: string; }>;
}

export interface ICallGraphEntry {
    name: string;
    kind: SymbolKind;
    rules: string[];
    tokens: string[];
}

/* eslint-disable @typescript-eslint/naming-convention */

// Temporary definitions for the ATN state types, because the current definition in antlr4ng requires an import of that
// package which is not possible in the webview module.
export const enum ATNStateType {
    INVALID_TYPE = 0,
    BASIC = 1,
    RULE_START = 2,
    BLOCK_START = 3,
    PLUS_BLOCK_START = 4,
    STAR_BLOCK_START = 5,
    TOKEN_START = 6,
    RULE_STOP = 7,
    BLOCK_END = 8,
    STAR_LOOP_BACK = 9,
    STAR_LOOP_ENTRY = 10,
    PLUS_LOOP_BACK = 11,
    LOOP_END = 12,
}

export enum SymbolKind {
    Unknown,

    Terminal,
    Keyword,
    TokenVocab,
    Import,
    BuiltInLexerToken,
    VirtualLexerToken,
    FragmentLexerToken,
    LexerRule,
    BuiltInMode,
    LexerMode,
    BuiltInChannel,
    TokenChannel,
    ParserRule,
    Operator,
    Option,
    TokenReference,
    RuleReference,
    LexerCommand,

    // Native code.
    GlobalNamedAction,
    LocalNamedAction,
    ExceptionAction,
    FinallyAction,
    ParserAction,
    LexerAction,
    ParserPredicate,
    LexerPredicate,
    Arguments,
}