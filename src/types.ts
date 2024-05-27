/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export enum GrammarType {
    Unknown,
    Parser,
    Lexer,
    Combined,
}

/** Multiple symbol kinds can be involved in a symbol lookup. */
export enum SymbolGroupKind {
    TokenRef,
    RuleRef,
    LexerMode,
    TokenChannel,
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

export interface ISymbolInfo {
    kind: SymbolKind;
    name: string;
    source: string;
    definition?: IDefinition;

    /** Used for code completion. Provides a small description for certain symbols. */
    description?: string;
}

export enum DiagnosticType {
    Hint,
    Info,
    Warning,
    Error,
}

export interface IDiagnosticEntry {
    type: DiagnosticType;
    message: string;
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

    /** Offset in the line. */
    offset: number;
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
 * This interface is what exported parse trees are made of, which are created by the debugger interface.
 * Each node stands either for an invoked rule, a terminal node or an error node.
 * NOTE: there's a copy of the it in webview-scripts/types.ts, so keep them in sync!
 */
export interface IParseTreeNode {
    type: "rule" | "terminal" | "error";

    /** A unique id for D3.js. */
    id: number;

    /** Only valid for the rule node type. */
    ruleIndex?: number;
    name: string;
    start?: ILexerToken;
    stop?: ILexerToken;
    range?: IIndexRange;

    /** Only valid for non-rule nodes. */
    symbol?: ILexerToken;

    /** Available for all node types, but empty for non-rule types. */
    children: IParseTreeNode[];
}

/**
 * All references of a rule (both lexer and parser) to other rules and string literals.
 * Lexer rules obviously cannot have any parser rule reference. String literals are mostly interesting
 * for parser rules to check for implicit lexer tokens.
 */
export interface IReferenceNode {
    kind: SymbolKind;
    rules: Set<string>;
    tokens: Set<string>;
    literals: Set<string>;
}

export enum CodeActionType {
    GlobalNamed,
    LocalNamed,
    ParserAction,
    LexerAction,
    ParserPredicate,
    LexerPredicate,
}

/** Options used by the parser files generation. */
export interface IGenerationOptions {
    /**
     * The folder in which to run the generation process. Should be an absolute path for predictable results.
     * Used internally only.
     */
    baseDir?: string;

    /** Search path for the ANTLR tool. */
    libDir?: string;

    /** The folder where to place generated files in (relative to baseDir or absolute) (default: grammar dir). */
    outputDir?: string;

    /** Package or namespace name for generated files (default: none). */
    package?: string;

    /** The target language for the generated files. (default: what's given in the grammar or Java). */
    language?: string;

    /** Generate listener files if set (default: true). */
    listeners?: boolean;

    /** Generate visitor files if set (default: false). */
    visitors?: boolean;

    /** Don't generate anything. Just try to load interpreter data and do interpreter setup. */
    loadOnly?: boolean;

    /** Used with `loadOnly` to generate if no interpreter data exists yet. */
    generateIfNeeded?: boolean;

    /** Use this path to find the Java binary instead of JAVA_HOME */
    javaHomeOverride?: string;

    /** Use this jar for work instead of the built-in one(s). */
    alternativeJar?: string;

    /** Any additional parameter you want to send to ANTLR4 for generation (e.g. "-XdbgST"). */
    additionalParameters?: string | string[];
}

/**
 * Options used by the sentence generation.
 */
export interface ISentenceGenerationOptions {
    /** The number of sentences to generate in one call. */
    count?: number;

    /** Clear output on each run (used for output printing in the UI). */
    clear?: boolean;

    /**
     * Determines how quick the weight for a decision to be select converges towards 0 (between 0 and 1, default: 0.25).
     * Each time a decision is taken its weight will decrease. The lower the weight is, compared to other decisions from
     * a particular decision state, the less likely will it be selected.
     */
    convergenceFactor?: number;

    /**
     * The minimum number of iterations used for `+` and `*` loops in the parser (default: 1 for `+`, 0 for `*`).
     * Must be a positive integer (or 0) and must be smaller than maxParserIterations (if that is given).
     * If set to 0 then for `+` loops 1 is used, automatically.
     */
    minParserIterations?: number;

    /**
     * The maximum number of iterations in the parser. Must be a number > 0 and > minParserIterations.
     * If that is not the case or the value is not specified then it is set to minParserIterations + 1.
     */
    maxParserIterations?: number;

    /**
     * The minimum number of iterations in the lexer (default: 1 for `+`, 0 for `*`).
     * Must be a positive integer (or 0) and must be smaller than maxLexerIterations (if that is given).
     * If set to 0 then for `+` loops 1 is used, automatically.
     */
    minLexerIterations?: number;

    /**
     * The maximum number of iterations in the lexer. Must be a number > 0 and > than minLexerIterations.
     * If that is not the case or the value is not specified then it is set to minLexerIterations + 10.
     */
    maxLexerIterations?: number;

    /** The maximum number of recursions (rules calling themselves directly or indirectly, default: 3). */
    maxRecursions?: number;

    /** The string to use when the maximum recursion level was reached (default: "⨱"). */
    maxRecursionLabel?: string;

    /**
     * A mapping of rule names to string literals, which should be used instead of running the generation for that rule.
     */
    ruleMappings?: IRuleMappings;

    /** The name of a file which contains code to evaluate grammar actions and predicates. */
    actionFile?: string;
}

/**
 * Mappings from rule names to strings, which define output to use for specific rules when generating sentences.
 */
export interface IRuleMappings {
    [key: string]: string | string[];
}

/**
 * Options for grammar text formatting. Some names, values and meanings have been taken from clang-format
 * (http://clang.llvm.org/docs/ClangFormatStyleOptions.html), but may have slight variations tailored towards
 * ANTLR grammars. Deviations from that are mentioned in comments, otherwise see clang-format and the documentation for
 * descriptions + examples.
 */
export interface IFormattingOptions {
    /** Index signature to allow accessing properties via brackets. */
    [key: string]: boolean | number | string | undefined;

    /** Default: false */
    disabled?: boolean;

    /** Default: false */
    alignTrailingComments?: boolean;

    /** Default: true; */
    allowShortBlocksOnASingleLine?: boolean;

    /** When true start predicates and actions on a new line. Default: false. */
    breakBeforeBraces?: boolean;

    /** Default: 100 chars. */
    columnLimit?: number;

    /** For line continuation (only used if useTab is false). Default: same as indentWith. */
    continuationIndentWidth?: number;

    /** Default: 4 chars. */
    indentWidth?: number;

    /** Default: false. */
    keepEmptyLinesAtTheStartOfBlocks?: boolean;

    /** Default: 1. */
    maxEmptyLinesToKeep?: number;

    /** Default: true. */
    reflowComments?: boolean;

    /** Default: true */
    spaceBeforeAssignmentOperators?: boolean;

    /** Default: 4. */
    tabWidth?: number;

    /** Default: true. */
    useTab?: boolean;

    /**
     * Values not found in clang-format:
     * When set to "none" places the colon directly behind the rule name. Trailing alignment aligns colons of
     * consecutive single line rules (with at least one whitespace between rule name and colon). Hanging alignment
     * moves the colon to the next line (after the normal indentation, aligning it so with the alt pipe chars).
     * Default: none.
     */
    alignColons?: "none" | "trailing" | "hanging";

    /**
     * When `allowShortRulesOnASingleLine` is true and `alignColon` is set to "hanging" this setting determines which
     * gets precedence. If true (the default) a rule is placed on a single line if it fits, ignoring the "hanging"
     * setting.
     */
    singleLineOverrulesHangingColon?: boolean;

    /** Like allowShortBlocksOnASingleLine, but for entire rules. Default: true. */
    allowShortRulesOnASingleLine?: boolean;

    /**
     * Place semicolon behind last code token or on an own line (with or w/o indentation). Default: ownLine
     * (no indentation). This setting has no effect for non-rule commands that end with a semicolon
     * (e.g. "grammar Test;", "import Blah;" etc.). Such commands are always placed on a single line.
     */
    alignSemicolons?: "none" | "ownLine" | "hanging";

    /** For blocks: if true puts opening parentheses on an own line. Default: false. */
    breakBeforeParens?: boolean;

    /**
     * Place rule internals (return value, local variables, @init, @after) all on a single line, if true.
     * Default: false.
     */
    ruleInternalsOnSingleLine?: boolean;

    /** Between top level elements, how many empty lines must exist? Default: 0. */
    minEmptyLines?: number;

    /**
     * When true alignments are organized in groups of lines where they apply. These line groups are separated
     * by lines where a specific alignment type does not appear. Default: true.
     */
    groupedAlignments?: boolean;

    /** Align first tokens in rules after the colon. Default: false. */
    alignFirstTokens?: boolean;

    /** Align arrows from lexer commands. Default: false. */
    alignLexerCommands?: boolean;

    /** Align actions ({} blocks in rules) and predicates. Default: false. */
    alignActions?: boolean;

    /** Align alt labels (# name). Default: true. */
    alignLabels?: boolean;

    /**
     * When true a single alignment for labels, actions, lexer commands and trailing comments is used instead of
     * individual alignments for each type. This avoids large whitespace runs if you have a mix of these types.
     * Setting alignTrailers disables the individual alignment settings of the mentioned types.
     */
    alignTrailers?: boolean;
}

export type PredicateFunction = (predicate: string) => boolean;

export interface IContextDetails {
    type: GrammarType;
    unreferencedRules: string[];
    imports: string[];
}

export interface ISelfDiagnostics {
    contextCount: number;
}
