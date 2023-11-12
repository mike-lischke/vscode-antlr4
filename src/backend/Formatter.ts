/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Interval, Token } from "antlr4ng";

import { IFormattingOptions } from "../types.js";
import { ANTLRv4Lexer } from "../parser/ANTLRv4Lexer.js";

/** Insert markers are what the output pipeline (see below) is made of (if not direct token indices). */
type InsertMarker = number;

const formatIntroducer = "$antlr-format";

/** Enum used to address a specific alignment status in the alignment map. */
enum AlignmentType {
    Colon,
    FirstToken,
    Label,
    LexerCommand,
    Action,
    TrailingComment,

    /** Align all of label, action, trailing comment and lexer command (whatever comes first). */
    Trailers
}

/** All alignments in the order they will be evaluated. */
const allAlignments = [
    AlignmentType.Colon, AlignmentType.FirstToken, AlignmentType.Label, AlignmentType.Action,
    AlignmentType.LexerCommand, AlignmentType.TrailingComment, AlignmentType.Trailers,
];

/**
 * Holds line number and group index for a specific alignment. For each alignment type there's an own
 * status, to allow multiple alignments per line and ordered processing.
 */
interface IAlignmentStatus {
    /** The line number of the last alignment entry in the current group (if there's one currently). */
    lastLine: number;

    /** A list of output pipeline indices for groups of alignments. */
    groups: number[][];
}

export class GrammarFormatter {
    // Some predefined insert markers:
    // Token markers (EOF is -1).
    public static readonly LineBreak = -2;

    public static readonly Space = -3;
    public static readonly Tab = -4;

    public static readonly Undefined = 0;

    // Markers for a group of elements.
    public static readonly Whitespace = -100;
    public static readonly Comment = -101;

    // Action markers.
    public static readonly WhitespaceEraser = -102; // Marker for any future whitespace to be ignored.
    public static readonly Error = -103;

    // Block markers.
    public static readonly Range = -100000;           // Indirect index into the range list.
    public static readonly Alignment = -200000;       // Indirect index into the alignment groups list.
    public static readonly WhitespaceBlock = -300000;  // Indirect index into the whitespace list.

    private options: IFormattingOptions;

    // The pipeline contains markers for constructing the final text.
    // A marker is either an index in the token list (if >= 0) or one of the special markers
    // (when < 0), like space, line break, alignment and range markers.
    private outputPipeline: InsertMarker[];

    private currentIndentation: number;
    private formattingDisabled: boolean; // When true no formatting takes place.

    private currentLine: number;
    private currentColumn: number;

    // When a block has been determined to fit as a whole on a single line (relevant only if
    // allowShortBlocksOnASingleLine is true), this var directs line break handling.
    // Note: counting begins on the most outer block that can be formatted on a single line, which is not necessarily
    //       the rule itself.
    private singleLineBlockNesting: number;

    // A list of index pairs describing start and end of a token sequence in the original token stream.
    // This is mostly used to avoid having to place a large list of action tokens in the generated list.
    private ranges: Array<[InsertMarker, InsertMarker]>;
    private currentRangeIndex: InsertMarker; // When scanning a range this contains the start token index.
    private rangeStart: number; // Holds the start index of a range when collecting.

    // For each possible alignment type (colon, first token, trailing predicate, trailing comment etc.)
    // there's one status record in this map.
    private alignments = new Map<AlignmentType, IAlignmentStatus>();
    private whitespaceList: string[]; // A list of strings containing whitespaces to insert for alignment.

    public constructor(private tokens: Token[]) { }

    /**
     * This is the main formatting routine.
     *
     * @param options Options that control the formatting process. Can be overridden in the code.
     * @param start The character index in the input to start from.
     * @param stop The character index in the input to end with.
     * @returns A tuple containing the formatted text as well as new start/stop indices that should be used
     *          to replace the old text range.
     */
    public formatGrammar(options: IFormattingOptions, start: number, stop: number): [string, number, number] {
        if (this.tokens.length === 0 || options.disabled) {
            return ["", -1, -1];
        }

        this.setDefaultOptions();
        this.options = Object.assign(this.options, options); // Overwrite default values with passed in values.
        if (this.options.columnLimit! <= 0) {
            this.options.columnLimit = 1e30;
        }

        this.outputPipeline = [];
        this.currentIndentation = 0;
        this.singleLineBlockNesting = 0;

        this.ranges = [];
        this.currentRangeIndex = GrammarFormatter.Undefined;
        this.rangeStart = -1;

        this.alignments.clear();
        this.whitespaceList = [];

        // Position info of the target text.
        this.currentColumn = 0;
        this.currentLine = 1;
        this.formattingDisabled = false;

        let coalesceWhitespaces = false; // Set in situations where we don't want multiple consecutive whitespaces.
        let inBraces = false; // Set between {} (e.g. in options).
        let inMeta = false;   // Set for meta commands (grammar, import, mode etc.).
        let inRule = false;   // Set when we are processing a lexer or parser rule.
        let inNamedAction = false; // Ditto for a named action.
        let inLexerCommand = false; // Ditto for a lexer command (the part starting with ->).
        let inCatchFinally = false; // Ditto for catch/finally blocks.

        let inSingleLineRule = false; // Set when an entire rule is placed on a single line.
        let minLineInsertionPending = false; // Set when the min line setting must be enforced after next line break.

        // Start by determining the actual formatting range. This is specified for the unformatted text,
        // which allows the caller to use it directly to replace the old text.
        let startIndex = this.tokenFromIndex(start, true);
        const endIndex = this.tokenFromIndex(stop, false);

        // Adjust the start index if we are within a single line comment which is part of a comment block
        // and we are reflowing comment text. Include all single line comment entries of that block.
        // For other comment types this is not necessary, as they are blocks by nature.
        if (this.options.reflowComments && this.tokens[startIndex].type === ANTLRv4Lexer.LINE_COMMENT) {
            let runningIndex = startIndex;
            while (runningIndex > 0) {
                if (this.tokens[runningIndex--].text!.indexOf(formatIntroducer) >= 0) {
                    break; // Don't include comment lines containing (potential) formatting instructions.
                }

                // The comment must be the only non-whitespace token on the line.
                if (this.tokens[runningIndex].type !== ANTLRv4Lexer.WS
                    || this.tokens[runningIndex].line + 1 !== this.tokens[runningIndex + 1].line) {
                    break;
                }
                startIndex = runningIndex + 1;

                if (this.tokens[--runningIndex].type !== ANTLRv4Lexer.LINE_COMMENT) {
                    break;
                }
            }
        }

        let targetStart = this.tokens[startIndex].start;
        let startRow = this.tokens[startIndex].line;
        const targetStop = this.tokens[endIndex].stop;

        // If the start token doesn't begin at the first column walk back in the text to ensure the target
        // range starts directly after a line break, to allow fixing the indentation on the start line.
        targetStart -= this.tokens[startIndex].column;

        // Next step is to determine the context the start token is in.
        let run = startIndex;
        let done = false;
        while (run > 0 && !done) {
            switch (this.tokens[run].type) {
                case ANTLRv4Lexer.SEMI: {
                    // Top level or options block.
                    let localRun = run;
                    while (localRun-- > 0 && !done) {
                        switch (this.tokens[localRun].type) {
                            case ANTLRv4Lexer.OPTIONS:
                            case ANTLRv4Lexer.TOKENS:
                            case ANTLRv4Lexer.CHANNELS: { // These tokens include an opening curly brace.
                                // Increase indentation if the token is not
                                // on the same line as the start token (in which case we would do that
                                // in the main formatting loop then).
                                if (this.tokens[localRun].line < startRow) {
                                    ++this.currentIndentation;
                                    inBraces = true;
                                }

                                // Determine if we are in an assignment or between them.
                                localRun = startIndex;
                                let type = 0;
                                do {
                                    type = this.tokens[localRun].type;
                                    if (type !== ANTLRv4Lexer.WS
                                        && type !== ANTLRv4Lexer.LINE_COMMENT
                                        && type !== ANTLRv4Lexer.BLOCK_COMMENT
                                        && type !== ANTLRv4Lexer.DOC_COMMENT) {
                                        break;
                                    }
                                } while (localRun-- > 0);
                                coalesceWhitespaces = type !== ANTLRv4Lexer.SEMI;
                                done = true;
                                break;
                            }

                            // These are indicators for not being in a braced block.
                            case ANTLRv4Lexer.BEGIN_ACTION:
                            case ANTLRv4Lexer.END_ACTION:
                            case ANTLRv4Lexer.COLON:
                            case ANTLRv4Lexer.COLONCOLON:
                            case ANTLRv4Lexer.OR: {
                                done = true;
                                break;
                            }

                            default: {
                                break;
                            }
                        }
                    }
                    done = true;

                    break;
                }

                case ANTLRv4Lexer.COLON: { // Also pretty clear. We are in a rule.
                    if (this.tokens[run].line < startRow) {
                        ++this.currentIndentation;
                        inRule = true;
                        coalesceWhitespaces = true;
                    }
                    done = true;

                    break;
                }

                case ANTLRv4Lexer.AT: { // A named action. Want this to be formatted as a whole.
                    startRow = this.tokens[run].line;
                    startIndex = run;
                    targetStart = this.tokens[run].start;
                    done = true;

                    break;
                }

                case ANTLRv4Lexer.OPTIONS:
                case ANTLRv4Lexer.TOKENS:
                case ANTLRv4Lexer.CHANNELS: // These tokens include an opening curly brace.
                case ANTLRv4Lexer.BEGIN_ACTION:
                    // A braced block.
                    if (this.tokens[run].line < startRow) {
                        ++this.currentIndentation;
                        inBraces = true;
                    }
                    done = true;
                    break;
                case ANTLRv4Lexer.RBRACE:
                case ANTLRv4Lexer.END_ACTION:
                    done = true;
                    break;
                case ANTLRv4Lexer.LPAREN:
                    if (this.tokens[run].line < startRow) {
                        ++this.currentIndentation;
                    }
                    --run;
                    break;
                case ANTLRv4Lexer.RPAREN:
                    if (this.tokens[run].line < startRow) {
                        --this.currentIndentation;
                    }
                    --run;
                    break;
                default:
                    --run;
                    break;
            }
        }

        // Here starts the main formatting loop.
        this.currentLine = startRow;
        this.pushCurrentIndentation();
        for (let i = startIndex; i <= endIndex; ++i) {
            const token = this.tokens[i];

            // If no whitespace is coming up we don't need the eraser marker anymore.
            if (token.type !== ANTLRv4Lexer.WS && this.lastEntryIs(GrammarFormatter.WhitespaceEraser)) {
                this.outputPipeline.pop();
            }

            if (minLineInsertionPending && token.type !== ANTLRv4Lexer.WS && token.type !== ANTLRv4Lexer.LINE_COMMENT) {
                minLineInsertionPending = false;
                this.ensureMinEmptyLines();
            }

            switch (token.type) {
                case ANTLRv4Lexer.WS: {
                    if (i === 0 || this.formattingDisabled) {
                        // Ignore leading whitespaces at the beginning of the grammar.
                        break;
                    }

                    const nextType = this.tokens[i + 1].type;
                    const localCommentAhead = (nextType === ANTLRv4Lexer.LINE_COMMENT
                        || nextType === ANTLRv4Lexer.BLOCK_COMMENT || nextType === ANTLRv4Lexer.DOC_COMMENT);

                    if (this.lastEntryIs(GrammarFormatter.WhitespaceEraser)) {
                        // And ignore these incoming whitespaces if there is an eraser marker
                        // (unless comments after a line break follow, which we want to stay on their line).
                        this.outputPipeline.pop();

                        if (!localCommentAhead) {
                            break;
                        }
                    }

                    // Analyze whitespaces, we can have a mix of tab/space and line breaks here.
                    const text = token.text!.replace("\r\n", "\n");
                    const hasLineBreaks = text.indexOf("\n") >= 0;
                    if (!localCommentAhead || !hasLineBreaks) {
                        if (!hasLineBreaks || coalesceWhitespaces || this.singleLineBlockNesting > 0) {
                            if (!this.lastEntryIs(GrammarFormatter.Whitespace)) {
                                this.addSpace();
                            }
                            break;
                        }
                    }

                    const parts = text.split("\n");
                    let breakCount = 0;

                    // Limit the number of line breaks before a comment right after a left parenthesis.
                    if (localCommentAhead && this.lastCodeTokenIs(ANTLRv4Lexer.LPAREN)
                        && !this.options.keepEmptyLinesAtTheStartOfBlocks) {
                        breakCount = 1;
                    } else {
                        // Take into account any line breaks that are already in the pipeline.
                        let j = this.outputPipeline.length - 1;
                        while (j >= 0) {
                            if (this.entryIs(j, GrammarFormatter.LineBreak)) {
                                ++breakCount;
                            } else {
                                break;
                            }
                            --j;
                        }

                        breakCount = Math.max(breakCount, parts.length - 1);
                        breakCount = Math.min(breakCount, this.options.maxEmptyLinesToKeep! + 1);
                    }
                    this.removeTrailingWhitespaces();

                    const lineBreaks: number[] = Array(breakCount).fill(GrammarFormatter.LineBreak);
                    this.outputPipeline.push(...lineBreaks);
                    this.currentLine += breakCount;
                    this.currentColumn = 0;

                    // Ensure empty lines only if still have something to format.
                    if (i < endIndex && minLineInsertionPending) {
                        minLineInsertionPending = false;
                        this.ensureMinEmptyLines();
                    }
                    this.pushCurrentIndentation();

                    break;
                }

                case ANTLRv4Lexer.SEMI: {
                    this.removeTrailingWhitespaces();

                    // Single line mode here can be caused by 2 situations:
                    // single line block from the last alt or single line rule.
                    // In the first case we have to end single line mode now, otherwise
                    // after the alignment handling.
                    if (!inSingleLineRule) {
                        this.singleLineBlockNesting = 0;
                    }

                    // Even if the rule is on a single line we have to check for semicolon placement,
                    // because in case of a hanging colon only the body of the rule is on a single line,
                    // while name and semicolon are placed on own lines.
                    const canAlignSemicolon = !inMeta && (!inSingleLineRule || this.options.alignColons === "hanging"
                        || this.options.alignSemicolons !== "none");
                    if (canAlignSemicolon && !inBraces && inRule) {
                        switch (this.options.alignSemicolons) {
                            case "none": {
                                break;
                            }

                            case "ownLine": {
                                this.addLineBreak(!this.options.singleLineOverrulesHangingColon);
                                break;
                            }
                            case "hanging": {
                                this.addLineBreak(true);
                                this.pushCurrentIndentation(true);
                                break;
                            }

                            default: {
                                break;
                            }
                        }
                    }
                    this.add(i);


                    if (!inBraces && this.currentIndentation > 0) {
                        --this.currentIndentation;
                    }

                    // Now we can end single line mode in any case (if not done yet above).
                    this.singleLineBlockNesting = 0;
                    inSingleLineRule = false;

                    if (this.currentIndentation === 0) {
                        minLineInsertionPending = true;

                        if (inMeta) {
                            this.addLineBreak();
                        }
                    } else {
                        this.addLineBreak();
                        this.pushCurrentIndentation();
                    }

                    coalesceWhitespaces = false;
                    inLexerCommand = false;
                    inMeta = false;
                    if (!inBraces) {
                        inRule = false;
                    }
                    break;
                }

                case ANTLRv4Lexer.OPTIONS:
                case ANTLRv4Lexer.TOKENS:
                case ANTLRv4Lexer.CHANNELS: { // These tokens include an opening curly brace.
                    this.add(i);

                    coalesceWhitespaces = true;

                    ++this.currentIndentation;
                    inBraces = true;

                    if (!this.nonBreakingTrailerAhead(i)) {
                        this.addLineBreak();
                        this.pushCurrentIndentation();
                    }

                    break;
                }

                case ANTLRv4Lexer.RBRACE: {
                    this.removeTrailingWhitespaces();
                    this.addLineBreak();
                    if (this.currentIndentation > 0) {
                        --this.currentIndentation;
                    }
                    this.pushCurrentIndentation();
                    this.add(i);

                    minLineInsertionPending = this.currentIndentation === 0;

                    inBraces = false;
                    coalesceWhitespaces = false;
                    inRule = false;
                    break;
                }

                case ANTLRv4Lexer.BEGIN_ACTION: {
                    if (this.formattingDisabled) {
                        break;
                    }

                    if (this.options.alignTrailers) {
                        this.addAlignmentEntry(AlignmentType.Trailers);
                    } else if (this.options.alignActions) {
                        this.addAlignmentEntry(AlignmentType.Action);
                    }

                    this.add(i++);
                    if (inCatchFinally && this.tokens[i].text !== "\n") {
                        this.addLineBreak();
                    }

                    // Find the action end token (or the last in the given source range).
                    const actionStart = i;
                    while (i <= endIndex
                        && this.tokens[i].type !== Token.EOF
                        && this.tokens[i].type !== ANTLRv4Lexer.END_ACTION) {
                        ++i;
                    }

                    // Add a new range for the action code.
                    this.addRaw(actionStart, i - 1);
                    if (i <= endIndex) {
                        if (inCatchFinally && this.tokens[i - 1].text !== "\n") {
                            this.addLineBreak();
                        }
                        this.add(i);
                        this.addSpace();

                        minLineInsertionPending = this.currentIndentation === 0;
                        if (!inRule) {
                            inNamedAction = false;
                            coalesceWhitespaces = false;
                        }
                        inCatchFinally = false;
                    }

                    break;
                }

                case ANTLRv4Lexer.LINE_COMMENT:
                case ANTLRv4Lexer.BLOCK_COMMENT: {
                    this.processFormattingCommands(i);
                    // [falls-through]
                }

                case ANTLRv4Lexer.DOC_COMMENT: {
                    // If this comment is the first non-whitespace entry on the current line
                    // some extra processing is required.
                    const hasLineContent = this.lineHasNonWhitespaceContent();
                    let comment = token.text!;
                    if (hasLineContent) {
                        if (token.type === ANTLRv4Lexer.LINE_COMMENT) {
                            // There's something before the comment on the current line.
                            // Trigger normal alignment handling then.
                            if (this.options.alignTrailers) {
                                this.addAlignmentEntry(AlignmentType.Trailers);
                            } else if (this.options.alignTrailingComments) {
                                this.addAlignmentEntry(AlignmentType.TrailingComment);
                            }
                        }
                    } else if (comment.indexOf(formatIntroducer) < 0
                        && this.options.reflowComments
                        && token.type === ANTLRv4Lexer.LINE_COMMENT) {
                        // Scan forward and collect all consecutive single line comments lines
                        // which stand alone on a line.
                        while (true) {
                            let nextToken = this.tokens[i + 1];
                            if (nextToken.type === Token.EOF) {
                                break;
                            }
                            const content = nextToken.text!; // Must be whitespaces.
                            if (content.split("\n").length > 2) { // More than a single line break. Stop here.
                                break;
                            }

                            nextToken = this.tokens[i + 2];
                            if (nextToken.type !== ANTLRv4Lexer.LINE_COMMENT
                                || nextToken.text!.indexOf(formatIntroducer) >= 0) {
                                break;
                            }

                            comment += "\n" + nextToken.text;
                            i += 2;
                            this.processFormattingCommands(i);
                        }
                    }

                    if (this.options.reflowComments && comment.indexOf("\n") > 0) {
                        const formatted = this.reflowComment(comment, token.type);
                        const whitespaceIndex = GrammarFormatter.WhitespaceBlock - this.whitespaceList.length;
                        this.outputPipeline.push(whitespaceIndex);
                        this.whitespaceList.push(formatted);

                        // Update the current line member.
                        for (const char of formatted) {
                            if (char === "\n") {
                                ++this.currentLine;
                            }
                        }

                        this.addLineBreak();
                        this.pushCurrentIndentation();
                    } else {
                        this.add(i);
                        if (token.type === ANTLRv4Lexer.LINE_COMMENT) {
                            if (this.currentIndentation > 0) {
                                this.addLineBreak();
                                this.pushCurrentIndentation();
                            }
                        } else {
                            this.addSpace();
                        }
                    }

                    break;
                }

                case ANTLRv4Lexer.ASSIGN:
                case ANTLRv4Lexer.PLUS_ASSIGN: {
                    if (this.options.spaceBeforeAssignmentOperators) {
                        if (!this.lastEntryIs(GrammarFormatter.Whitespace)) {
                            this.addSpace();
                        }
                        this.add(i);
                        this.addSpace();
                    } else {
                        if (this.lastEntryIs(GrammarFormatter.Whitespace)) {
                            this.removeLastEntry();
                        }
                        this.add(i);
                    }
                    break;
                }

                case ANTLRv4Lexer.AT: {
                    if (inRule) {
                        this.removeTrailingWhitespaces();
                        if (this.options.ruleInternalsOnSingleLine) {
                            this.addSpace();
                        } else {
                            this.addLineBreak();
                            ++this.currentIndentation;
                            this.pushCurrentIndentation();
                            --this.currentIndentation;
                        }
                    } else {
                        inNamedAction = true;
                    }

                    this.add(i);
                    this.add(GrammarFormatter.WhitespaceEraser);
                    break;
                }

                case ANTLRv4Lexer.COLON: {
                    ++this.currentIndentation;

                    let { singleLineLength } = this.getBlockInfo(i, new Set([ANTLRv4Lexer.SEMI]));
                    singleLineLength += this.currentColumn;
                    if (this.options.allowShortRulesOnASingleLine
                        && singleLineLength <= (2 * this.options.columnLimit! / 3)) {
                        ++this.singleLineBlockNesting;
                        inSingleLineRule = true;
                    }

                    switch (this.options.alignColons) {
                        case "hanging": {
                            this.removeTrailingWhitespaces();

                            const forceNewLine = !this.options.singleLineOverrulesHangingColon;
                            this.addLineBreak(forceNewLine);
                            this.pushCurrentIndentation(forceNewLine);
                            this.add(i);
                            this.addSpace();
                            break;
                        }
                        case "none": {
                            this.removeTrailingWhitespaces();
                            this.add(i);
                            if (!this.nonBreakingTrailerAhead(i) && !inSingleLineRule) {
                                this.addLineBreak();
                                this.pushCurrentIndentation();
                            } else {
                                this.addSpace();
                            }
                            break;
                        }

                        case "trailing": {
                            this.removeTrailingWhitespaces();
                            if (this.singleLineBlockNesting > 0) {
                                this.addAlignmentEntry(AlignmentType.Colon);
                                this.add(GrammarFormatter.WhitespaceEraser);
                            }
                            this.add(i);
                            if (!this.nonBreakingTrailerAhead(i) && !inSingleLineRule) {
                                this.addLineBreak();
                                this.pushCurrentIndentation();
                            } else {
                                this.addSpace();
                            }
                            break;
                        }

                        default: {
                            break;
                        }
                    }

                    // Aligning the first token only makes sense if the entire rule is on a single line.
                    if (this.options.alignFirstTokens && inSingleLineRule) {
                        this.addAlignmentEntry(AlignmentType.FirstToken);
                        this.add(GrammarFormatter.WhitespaceEraser);
                    }

                    break;
                }

                case ANTLRv4Lexer.COLONCOLON:
                    this.removeTrailingWhitespaces();
                    this.add(i);
                    this.add(GrammarFormatter.WhitespaceEraser);
                    break;

                case ANTLRv4Lexer.IMPORT:
                case ANTLRv4Lexer.GRAMMAR:
                case ANTLRv4Lexer.MODE: {
                    if (!inNamedAction && !inRule) {
                        // We increase the current indentation here only to have an easier time
                        // when handling the ending semicolon. Otherwise we would have to add
                        // extra checks to know which command the semicolon ends.
                        ++this.currentIndentation;
                        coalesceWhitespaces = true;
                        inMeta = true;
                    }
                    this.add(i);

                    break;
                }

                case ANTLRv4Lexer.FRAGMENT:
                case ANTLRv4Lexer.PRIVATE:
                case ANTLRv4Lexer.PROTECTED:
                case ANTLRv4Lexer.PUBLIC:
                case ANTLRv4Lexer.TOKEN_REF:
                case ANTLRv4Lexer.RULE_REF: {
                    if (!inNamedAction && !inBraces) {
                        inRule = true;
                    }

                    coalesceWhitespaces = true;
                    this.add(i);
                    if (!inLexerCommand) {
                        this.addSpace();
                    }
                    break;
                }

                case ANTLRv4Lexer.PLUS:
                case ANTLRv4Lexer.QUESTION:
                case ANTLRv4Lexer.STAR: {
                    this.removeTrailingWhitespaces();
                    this.add(i);

                    this.addSpace();
                    break;
                }

                case ANTLRv4Lexer.OR: {
                    // Starts a new alt. If we are in the first single line nesting level
                    // (not to be confused with block nesting, we can have the first single line block
                    // at, say, block nesting 10), we have to end the current single line block
                    // (which is the previous alt) and see if we can start a new one.
                    if (this.singleLineBlockNesting > 1) {
                        this.addSpace();
                    } else {
                        if (!inSingleLineRule) {
                            // If we are in a single line rule block it means we are not ending a
                            // single line alt block.
                            this.singleLineBlockNesting = 0;

                            this.removeTrailingTabsAndSpaces();
                            if (this.outputPipeline.length > 0 && !this.lastEntryIs(GrammarFormatter.LineBreak)) {
                                this.addLineBreak();
                            }
                            this.pushCurrentIndentation();

                            const { containsAlts, singleLineLength } = this.getBlockInfo(i,
                                new Set([ANTLRv4Lexer.OR, ANTLRv4Lexer.SEMI]));

                            // See if we should enter single line mode.
                            if ((!containsAlts || this.options.allowShortBlocksOnASingleLine)
                                && singleLineLength <= (this.options.columnLimit! / 2 + 3)) {
                                ++this.singleLineBlockNesting;
                            }
                        }
                    }

                    this.add(i);
                    this.addSpace();
                    break;
                }

                case ANTLRv4Lexer.LPAREN: {
                    if (inLexerCommand) {
                        this.add(i);
                        break;
                    }

                    if (this.singleLineBlockNesting > 0) {
                        // If we are already in single line mode add a nesting level.
                        // It's impossible to have a multi line block within a single line block.
                        // The other way around it's well possible, though.
                        // See a few lines below why we increase by 2.
                        this.singleLineBlockNesting += 2;
                        ++this.currentIndentation;
                        this.add(i);
                    } else {
                        // First check if we can put the entire block on a single line (if the block option is set).
                        if (this.options.allowShortBlocksOnASingleLine) {
                            let { singleLineLength } = this.getBlockInfo(i, new Set([ANTLRv4Lexer.RPAREN]));
                            singleLineLength += this.currentColumn;

                            if (singleLineLength <= (2 * this.options.columnLimit! / 3)) {
                                // Increase by 2: one for the block and one for the first alt.
                                // We increase for the alt even if there's no content or only a single alt.
                                // Doing that simplifies handling when closing the block.
                                this.singleLineBlockNesting += 2;
                            }
                        }

                        if (this.singleLineBlockNesting === 0) {
                            if (this.options.breakBeforeParens) {
                                this.removeTrailingWhitespaces();
                                this.addLineBreak();
                                this.pushCurrentIndentation();
                            }

                            this.add(i);
                            ++this.currentIndentation;

                            this.addLineBreak();
                            this.pushCurrentIndentation();

                            if (this.options.allowShortBlocksOnASingleLine) {
                                // If the entire block is too long, see if the first alt would fit on a single line.
                                let { singleLineLength } = this.getBlockInfo(i,
                                    new Set([ANTLRv4Lexer.OR, ANTLRv4Lexer.RPAREN]));
                                singleLineLength += this.currentColumn;
                                if (singleLineLength <= (this.options.columnLimit! / 2 + 3)) {
                                    ++this.singleLineBlockNesting;
                                }
                            }
                        } else {
                            this.add(i);
                            this.add(GrammarFormatter.WhitespaceEraser);
                            ++this.currentIndentation;
                        }

                    }

                    break;
                }

                case ANTLRv4Lexer.RPAREN: {
                    if (inLexerCommand) {
                        this.add(i);
                        break;
                    }

                    if (this.singleLineBlockNesting > 0) {
                        // If we are in single line mode when we end an alt it means
                        // the nesting counter was increased for it. Hence we can count down here.
                        --this.singleLineBlockNesting;
                    }

                    if (this.currentIndentation > 0) {
                        --this.currentIndentation;
                    }

                    this.removeTrailingWhitespaces();

                    // If the single line counter is still > 0 it means the entire block is
                    // to be formatted on a single line.
                    if (this.singleLineBlockNesting > 0) {
                        this.add(i);
                    } else {
                        this.addLineBreak();
                        this.pushCurrentIndentation();
                        this.add(i);
                    }

                    this.addSpace();

                    if (this.singleLineBlockNesting > 0) {
                        // Now decrease single line block counter for the closing parenthesis too.
                        --this.singleLineBlockNesting;
                    }
                    break;
                }

                case ANTLRv4Lexer.GT: {
                    this.removeTrailingWhitespaces();
                    this.add(i);
                    break;
                }

                case ANTLRv4Lexer.RARROW: {
                    inLexerCommand = true;
                    if (this.options.alignTrailers) {
                        this.addAlignmentEntry(AlignmentType.Trailers);
                    } else if (this.options.alignLexerCommands) {
                        this.addAlignmentEntry(AlignmentType.LexerCommand);
                    } else {
                        if (!this.lastEntryIs(GrammarFormatter.Space)) {
                            this.addSpace();
                        }
                    }
                    this.add(i);
                    this.addSpace();
                    break;
                }

                case ANTLRv4Lexer.COMMA: {
                    this.removeTrailingWhitespaces();
                    this.add(i);
                    if (inBraces) {
                        coalesceWhitespaces = false; // For tokens block.
                        if (!this.nonBreakingTrailerAhead(i)) {
                            this.addLineBreak();
                            this.pushCurrentIndentation();
                        }
                    } else {
                        this.addSpace();
                    }
                    break;
                }

                case ANTLRv4Lexer.POUND: {
                    // Starting a label. They are not trailing per se, but we treat them so
                    // if not in single line mode, as they look similar like trailing comments.
                    let willUseAlignment = false;
                    if (!inSingleLineRule) {
                        // Labels can only be specified for top level alts, hence we test on the entire
                        // rule if we are in single line mode, not the current alt's mode.
                        if (this.options.alignTrailers) {
                            willUseAlignment = true;
                            this.addAlignmentEntry(AlignmentType.Trailers);
                        } else if (this.options.alignLabels) {
                            willUseAlignment = true;
                            this.addAlignmentEntry(AlignmentType.Label);
                        }
                    }

                    if (!willUseAlignment && !this.lastEntryIs(GrammarFormatter.Space)) {
                        this.addSpace();
                    }
                    this.add(i);
                    this.addSpace();
                    break;
                }

                case ANTLRv4Lexer.BEGIN_ARGUMENT: {
                    if (this.formattingDisabled) {
                        break;
                    }

                    this.removeTrailingWhitespaces();
                    this.add(i++);

                    // Find the argument end token.
                    const argumentStartIndex = i;
                    while (this.tokens[i].type !== Token.EOF && this.tokens[i].type !== ANTLRv4Lexer.END_ARGUMENT) {
                        ++i;
                    }

                    // Add a new range for the action code.
                    this.addRaw(argumentStartIndex, i);
                    break;
                }

                case ANTLRv4Lexer.CATCH:
                case ANTLRv4Lexer.FINALLY: {
                    inCatchFinally = true;
                    this.removeTrailingWhitespaces();
                    this.addLineBreak();
                    this.add(i);
                    break;
                }

                case ANTLRv4Lexer.RETURNS:
                case ANTLRv4Lexer.LOCALS: {
                    this.removeTrailingWhitespaces();
                    if (this.options.ruleInternalsOnSingleLine) {
                        this.addSpace();
                    } else {
                        this.addLineBreak();
                        ++this.currentIndentation;
                        this.pushCurrentIndentation();
                        --this.currentIndentation;
                    }
                    this.add(i);
                    break;
                }

                case ANTLRv4Lexer.STRING_LITERAL:
                    this.add(i);
                    this.addSpace();
                    break;

                case Token.EOF:
                    // Ensure a line break at the end of the text.
                    this.removeTrailingWhitespaces();
                    this.addLineBreak();
                    break;

                default:
                    coalesceWhitespaces = true;
                    this.add(i);
                    break;
            }
        }

        if (this.lastEntryIs(GrammarFormatter.WhitespaceEraser)) {
            this.removeLastEntry();
        }

        // If we ended with an alignment entry, we apply it only if the selected range ends in whitespaces.
        if (this.tokens[endIndex].type !== ANTLRv4Lexer.WS) {
            // If the end index is not at a whitespace then we neither apply any trailing alignments nor
            // keep trailing whitespaces in our output pipeline.
            if (this.lastEntryIs(GrammarFormatter.Alignment)) {
                this.removeLastEntry();
            }
            this.removeTrailingWhitespaces();
        }

        // If formatting was disabled and never enabled again we have to add the raw text to
        // output pipeline as well.
        if (this.formattingDisabled && this.rangeStart > -1) {
            this.addRaw(this.rangeStart, endIndex);
        }

        // Output phase: compose all collected entries into a result string.
        // Start with computing all alignments.
        this.computeAlignments();

        let result = "";
        let pendingLineComment = -1;
        let hadErrorOnLine = false;
        for (const entry of this.outputPipeline) {
            switch (entry) {
                case GrammarFormatter.LineBreak: {
                    if (pendingLineComment > -1) {
                        if (result.length > 0) {
                            const lastChar = result[result.length - 1];
                            if (lastChar !== " " && lastChar !== "\t" && lastChar !== "\n") {
                                result += " ";
                            }
                        }
                        result += this.tokens[pendingLineComment].text;
                        pendingLineComment = -1;
                    }
                    result += "\n";
                    hadErrorOnLine = false;

                    break;
                }

                case GrammarFormatter.Space: {
                    result += " ";

                    break;
                }

                case GrammarFormatter.Tab: {
                    result += "\t";

                    break;
                }

                case GrammarFormatter.WhitespaceEraser: {// Ignore.
                    break;
                }

                case GrammarFormatter.Error: {
                    if (!hadErrorOnLine) { // Don't output more than one error per line.
                        result += "<<Unexpected input or wrong formatter command>>";
                        hadErrorOnLine = true;
                    }

                    break;
                }

                default:
                    if (entry < 0) {
                        // One of the block markers. Alignment blocks are removed at this point and
                        // replaced by whitespace indices.
                        if (this.isWhitespaceBlock(entry)) {
                            result += this.whitespaceList[-(entry - GrammarFormatter.WhitespaceBlock)];
                        } else if (this.isRangeBlock(entry)) {
                            // Copy an entire block.
                            const rangeIndex = -(entry - GrammarFormatter.Range);
                            const tokenStart = this.ranges[rangeIndex][0];
                            const tokenEnd = this.ranges[rangeIndex][1];
                            const interval = Interval.of(this.tokens[tokenStart].start,
                                this.tokens[tokenEnd].stop);
                            result += this.tokens[0].inputStream!.getText(interval);
                        }
                    } else {
                        if (this.tokens[entry].type === ANTLRv4Lexer.LINE_COMMENT) {
                            // Ensure we don't print out a line comment before anything
                            // but a line break.
                            pendingLineComment = entry;
                            break;
                        }
                        result += this.tokens[entry].text;
                    }
                    break;
            }
        }

        if (pendingLineComment > 0) {
            if (result.length > 0) {
                const lastChar = result[result.length - 1];
                if (lastChar !== " " && lastChar !== "\t" && lastChar !== "\n") {
                    result += " ";
                }
            }
            result += this.tokens[pendingLineComment].text;
        }

        return [result, targetStart, targetStop];
    }

    private setDefaultOptions() {
        this.options = {};
        this.options.alignTrailingComments = false;
        this.options.allowShortBlocksOnASingleLine = true;
        this.options.breakBeforeBraces = false;
        this.options.columnLimit = 100;
        this.options.indentWidth = 4;
        this.options.continuationIndentWidth = this.options.indentWidth;
        this.options.keepEmptyLinesAtTheStartOfBlocks = false;
        this.options.maxEmptyLinesToKeep = 1;
        this.options.reflowComments = true;
        this.options.spaceBeforeAssignmentOperators = true;
        this.options.tabWidth = 4;
        this.options.useTab = true;

        this.options.alignColons = "none";
        this.options.allowShortRulesOnASingleLine = true;
        this.options.alignSemicolons = "ownLine";
        this.options.singleLineOverrulesHangingColon = true;
        this.options.breakBeforeParens = false;
        this.options.ruleInternalsOnSingleLine = false;
        this.options.minEmptyLines = 0;
        this.options.groupedAlignments = true;
        this.options.alignFirstTokens = false;
        this.options.alignLexerCommands = false;
        this.options.alignActions = false;
        this.options.alignLabels = true;
        this.options.alignTrailers = false;
    }

    /**
     * Is the value at the given index in the token list of the given type?
     *
     * @param index The index for the value.
     * @param marker The marker type for which to test.
     *
     * @returns True if the value is of the given type.
     */
    private entryIs(index: number, marker: InsertMarker): boolean {
        if (index < 0 || index >= this.outputPipeline.length) {
            return false;
        }

        const entry = this.outputPipeline[index];
        switch (marker) {
            case GrammarFormatter.Whitespace: {
                return entry === GrammarFormatter.LineBreak || entry === GrammarFormatter.Space
                    || entry === GrammarFormatter.Tab;
            }

            case GrammarFormatter.Space: {
                return entry === GrammarFormatter.Space;
            }

            case GrammarFormatter.Tab: {
                return entry === GrammarFormatter.Tab;
            }

            case GrammarFormatter.LineBreak: {
                return entry === GrammarFormatter.LineBreak;
            }

            case GrammarFormatter.Comment: {
                if (entry < 0) {
                    return false;
                }
                const token = this.tokens[entry];

                return token.type === ANTLRv4Lexer.BLOCK_COMMENT || token.type === ANTLRv4Lexer.LINE_COMMENT
                    || token.type === ANTLRv4Lexer.DOC_COMMENT;
            }

            default: {
                if (entry < 0) {
                    return entry === marker;
                }
                const token = this.tokens[entry];

                return token.type === marker;
            }
        }
    }

    private lastEntryIs(marker: InsertMarker): boolean {
        return this.entryIs(this.outputPipeline.length - 1, marker);
    }

    private lineHasNonWhitespaceContent(): boolean {
        let index = this.outputPipeline.length;
        while (--index > 0) {
            if (this.outputPipeline[index] !== GrammarFormatter.Space
                && this.outputPipeline[index] !== GrammarFormatter.Tab) {
                break;
            }
        }
        if (index <= 0) {
            return false;
        }

        return this.outputPipeline[index] !== GrammarFormatter.LineBreak;
    }

    /**
     * Skips over all comments and whitespaces backwards and checks the value of the value after that.
     *
     * @param marker The marker type for which to test.
     *
     * @returns True if the last non-whitespace token is of the given type.
     */
    private lastCodeTokenIs(marker: InsertMarker): boolean {
        let i = this.outputPipeline.length - 1;
        while (i >= 0) {
            if (!this.entryIs(i, GrammarFormatter.WhitespaceEraser)
                && !this.entryIs(i, GrammarFormatter.Whitespace)
                && !this.entryIs(i, GrammarFormatter.LineBreak)
                && !this.entryIs(i, GrammarFormatter.Comment)) {
                break;
            }
            --i;
        }
        if (i < 0 || this.outputPipeline[i] < 0) {
            return false;
        }

        return this.tokens[this.outputPipeline[i]].type === marker;
    }

    private removeLastEntry() {
        if (this.formattingDisabled) {
            return;
        }

        const lastEntry = this.outputPipeline[this.outputPipeline.length - 1];
        this.outputPipeline.pop();
        switch (lastEntry) {
            case GrammarFormatter.WhitespaceEraser:
                break; // Ignore.
            case GrammarFormatter.LineBreak:
                --this.currentLine;
                break;
            case GrammarFormatter.Tab: {
                const offset = this.currentColumn % this.options.tabWidth!;
                this.currentColumn -= (offset > 0 ? offset : this.options.tabWidth!);
                break;
            }

            default:
                --this.currentColumn;
                break;
        }
        console.assert(this.currentLine >= 0, "Current line can never be less than 0");
        console.assert(this.currentColumn >= 0, "Current column can never be less than 0");
    }

    /**
     * Scans backwards and removes any pipeline entry up to the first non-space entry.
     */
    private removeTrailingTabsAndSpaces() {
        if (this.formattingDisabled) {
            return;
        }

        while (this.lastEntryIs(GrammarFormatter.Space) || this.lastEntryIs(GrammarFormatter.Tab)) {
            this.removeLastEntry();
        }
    }

    /**
     * Scans backwards and removes any pipeline entry up to the first non-whitespace entry.
     */
    private removeTrailingWhitespaces() {
        if (this.formattingDisabled) {
            return;
        }

        while (this.lastEntryIs(GrammarFormatter.Whitespace)) {
            this.removeLastEntry();
        }
    }

    private pushCurrentIndentation(force = false) {
        if (this.formattingDisabled || (!force && this.singleLineBlockNesting > 0)) {
            return;
        }

        if (this.options.useTab) {
            const tabs: number[] = Array(this.currentIndentation).fill(GrammarFormatter.Tab);
            this.outputPipeline.push(...tabs);
            this.currentColumn = this.currentIndentation * this.options.tabWidth!;
        } else {
            const spaces: number[] = Array(this.currentIndentation * (this.options.indentWidth ?? 4))
                .fill(GrammarFormatter.Space);
            this.outputPipeline.push(...spaces);
            this.currentColumn = this.currentIndentation * this.options.indentWidth!;
        }
    }

    private applyLineContinuation() {
        while (this.lastEntryIs(GrammarFormatter.Space) || this.lastEntryIs(GrammarFormatter.Tab)) {
            this.removeLastEntry();
        }

        if (!this.lastEntryIs(GrammarFormatter.LineBreak)) {
            this.outputPipeline.push(GrammarFormatter.LineBreak);
            ++this.currentLine;
        }
        this.currentColumn = 0;
        this.pushCurrentIndentation(true);
        if (this.options.useTab) {
            this.outputPipeline.push(GrammarFormatter.Tab);
        } else {
            const spaces: number[] = Array(this.options.continuationIndentWidth).fill(GrammarFormatter.Space);
            this.outputPipeline.push(...spaces);
        }
        this.currentColumn += this.options.continuationIndentWidth!;
    }

    /**
     * Adds the given marker to the output pipeline and updates current line + column.
     *
     * @param marker The marker to add.
     */
    private add(marker: InsertMarker) {
        if (this.formattingDisabled) {
            return;
        }

        /**
         * Helper function to insert a block with embedded line breaks.
         *
         * @param token The token for which to enter the block.
         */
        const insertBlock = (token: Token): void => {
            const parts = token.text!.split("\n");
            if (parts.length === 1) {
                this.currentColumn += token.text!.length;
            } else {
                this.currentLine += parts.length - 1;
                this.currentColumn = this.computeLineLength(parts[parts.length - 1]);
            }
            this.outputPipeline.push(marker);
        };

        switch (marker) {
            case GrammarFormatter.WhitespaceEraser: { // Doesn't move current position.
                this.outputPipeline.push(marker);

                return;
            }

            case GrammarFormatter.LineBreak: {
                this.outputPipeline.push(marker);
                ++this.currentLine;
                this.currentColumn = 0;

                return;
            }

            default: {
                let token: Token | undefined;
                if (marker >= 0) {
                    token = this.tokens[marker];
                }

                if (token) {
                    switch (token.type) {
                        case ANTLRv4Lexer.BLOCK_COMMENT: {
                            insertBlock(token);

                            return;
                        }

                        case ANTLRv4Lexer.ACTION_CONTENT: { // Action content can contain line breaks.
                            insertBlock(this.tokens[marker]);

                            return;
                        }

                        default: {
                            const tokenLength = token.stop - token.start + 1;
                            if (this.currentColumn + tokenLength > this.options.columnLimit!) {
                                // Note: this implementation works on non-aligned content and allows alignments
                                // after the word wrapping.
                                // In cases where alignment moves text beyond the column limit, we don't do
                                // another word wrapping round. Instead we let alignments overrule the column limit.
                                // The same applies for exceeding of the column limit caused by deep/large indentation,
                                // where the indentation already goes beyond that limit.
                                if (this.lineHasNonWhitespaceContent()) {
                                    this.applyLineContinuation();
                                }
                            }
                            this.currentColumn += tokenLength;
                            this.outputPipeline.push(marker);
                            break;
                        }
                    }
                } else {
                    ++this.currentColumn;
                    this.outputPipeline.push(marker);
                }

                break;
            }
        }
    }

    /**
     * Returns the index for the token which covers the given character index.
     * If no token can be found for that position return the EOF token index.
     *
     * @param charIndex The character index to examine.
     * @param first If this is true the search behavior is changed and returns the first token on the line
     *              where the found token is on.
     *
     * @returns The index of the token as requested.
     */
    private tokenFromIndex(charIndex: number, first: boolean): number {
        // Sanity checks first.
        if (charIndex < 0) {
            return 0;
        }
        if (charIndex >= this.tokens[0].inputStream!.size) {
            return this.tokens.length - 1;
        }

        for (let i = 0; i < this.tokens.length; ++i) {
            const token = this.tokens[i];
            if (token.start > charIndex) {
                if (i === 0) {
                    return i;
                }
                --i;

                if (!first) {
                    return i;
                }

                const row = this.tokens[i].line;
                while (i > 0 && this.tokens[i - 1].line === row) {
                    --i;
                }

                return i;
            }
        }

        return this.tokens.length - 1;
    }

    /**
     * Computes the length of the given text, with tab stops.
     * There must be no line breaks in the text.
     *
     * @param text The line for which to return the length.
     *
     * @returns The computed length, which is equal to the line length if there are no tabs in the text.
     */
    private computeLineLength(text: string): number {
        let length = 0;
        for (const char of text) {
            if (char === "\t") {
                // Round up column offset to next tab stop.
                const offsetToNextTabStop = this.options.tabWidth! - (this.currentColumn % this.options.tabWidth!);
                length += offsetToNextTabStop;
            } else {
                ++length;
            }
        }

        return length;
    }

    /**
     * Used only for real tokens (indices), e.g. in non-formatting mode.
     * Inserts a range for the given start and end markers.
     * No processing takes place, except for line/column updates.
     *
     * @param start The start index for the raw range.
     * @param stop The end index for the raw range.
     */
    private addRaw(start: InsertMarker, stop: InsertMarker): void {
        const interval = Interval.of(this.tokens[start].start, this.tokens[stop].stop);
        const text = this.tokens[0].inputStream!.getText(interval);

        if (text.indexOf("\n") >= 0) {
            const parts = text.split("\n");
            this.currentLine += parts.length - 1;
            this.currentColumn = this.computeLineLength(parts[parts.length - 1]);
        } else {
            this.currentColumn += this.computeLineLength(text);
        }
        this.ranges.push([start, stop]);
        this.outputPipeline.push(GrammarFormatter.Range - this.currentRangeIndex++);
    }

    private addSpace() {
        if (this.outputPipeline.length > 0
            && !this.lastEntryIs(GrammarFormatter.Space)
            && !this.lastEntryIs(ANTLRv4Lexer.LINE_COMMENT)) {
            this.add(GrammarFormatter.Space);
        }
    }

    private addLineBreak(force = false) {
        if (this.singleLineBlockNesting === 0 || force) {
            // If the current line ends with tabs/spaces, remove them first.
            while (this.lastEntryIs(GrammarFormatter.Space) || this.lastEntryIs(GrammarFormatter.Tab)) {
                this.removeLastEntry();
            }
            this.add(GrammarFormatter.LineBreak);
        }
    }

    /**
     * Ensure there are at least as many empty lines as specified in the options,
     * but not more than max empty lines.
     */
    private ensureMinEmptyLines(): void {
        if (this.formattingDisabled) {
            return;
        }

        if (this.options.minEmptyLines! > 0) {
            let lineBreakCount = Math.min(this.options.minEmptyLines!, this.options.maxEmptyLinesToKeep!) + 1;
            for (let i = this.outputPipeline.length - 1; i > 0 && lineBreakCount > 0; --i) {
                if (this.entryIs(i, GrammarFormatter.LineBreak)) {
                    --lineBreakCount;
                } else if (!this.entryIs(i, GrammarFormatter.Whitespace)) {
                    break;
                }
            }

            const lineBreaks: number[] = Array(lineBreakCount).fill(GrammarFormatter.LineBreak);
            this.outputPipeline.push(...lineBreaks);
            this.currentLine += lineBreakCount;
            if (lineBreakCount > 0) {
                this.currentColumn = 0;
            }
        } else if (!this.lastEntryIs(GrammarFormatter.LineBreak)) {
            this.addLineBreak();
        }
    }

    /**
     * Starting from position i this methods scans forward in the input token list to determine
     * if the current block contains alternatives and how long it would be (in characters) if the block would be
     * formatted on a single line.
     * If there's a single line comment before the stoppers we cannot put the block on a single line.
     * If there's one after the stopper account for that too.
     *
     * @param i The position to start scanning from. Should point to either a colon or an opening parenthesis.
     * @param stoppers A set of token types that make the scan stop.
     *
     * @returns An object containing a flag the indicates if the given block contains alternatives and a number
     *          that gives the length of the block if it was to be formatted all on a single line.
     */
    private getBlockInfo(i: number, stoppers: Set<number>): { containsAlts: boolean; singleLineLength: number; } {
        let containsAlts = false;
        let singleLineLength = 1;
        let nestingLevel = 0;

        let token = this.tokens[i];
        if (token.type === ANTLRv4Lexer.COLON || token.type === ANTLRv4Lexer.OR) {
            ++singleLineLength; // One for the space after these two.
        }

        const checkTrailingComment = () => {
            while (this.tokens[++i].type === ANTLRv4Lexer.WS) {
                if (this.tokens[i].text!.indexOf("\n") >= 0) {
                    break;
                }
            }
            if (this.tokens[i].type === ANTLRv4Lexer.LINE_COMMENT) {
                singleLineLength += this.tokens[i].text!.length;
            }
        };

        while (++i < this.tokens.length) {
            token = this.tokens[i];
            switch (token.type) {
                case ANTLRv4Lexer.WS: {
                    // Ignore whitespaces here. We pretend there is always a single space char
                    // between tokens and we will add them below (except for certain tokens).
                    break;
                }

                case ANTLRv4Lexer.LPAREN: {
                    ++nestingLevel;
                    ++singleLineLength;
                    break;
                }

                case ANTLRv4Lexer.RPAREN: {
                    // No need to add a space here (we have one from the previous token).
                    ++singleLineLength;

                    if (nestingLevel > 0) {
                        --nestingLevel;
                    } else {
                        // No check here if RPAREN is in the list of stoppers.
                        // If it is we return. If not and we got an RPAREN at nesting level 0
                        // we found an unbalanced block and return also.
                        checkTrailingComment();

                        return { containsAlts, singleLineLength };
                    }

                    break;
                }

                case ANTLRv4Lexer.SEMI: {
                    ++singleLineLength;
                    if (stoppers.has(ANTLRv4Lexer.SEMI)) {
                        checkTrailingComment();

                        return { containsAlts, singleLineLength };
                    }
                    break;
                }

                case ANTLRv4Lexer.QUESTION:
                case ANTLRv4Lexer.STAR:
                case ANTLRv4Lexer.PLUS: {
                    ++singleLineLength; // No addition for a space. That happened already.
                    break;
                }

                case ANTLRv4Lexer.LINE_COMMENT: {
                    // Single line comments cannot be formatted on a single line (they would hide what follows).
                    // Signal that by a large overall length.
                    return { containsAlts, singleLineLength: 1e100 };
                }

                case ANTLRv4Lexer.BLOCK_COMMENT:
                case ANTLRv4Lexer.DOC_COMMENT: {
                    // If the comment contains a line break we cannot format the block as single line.
                    if (token.text!.indexOf("\n") >= 0) {
                        return { containsAlts, singleLineLength: 1e100 };
                    } else {
                        singleLineLength += token.text!.length + 1;
                    }
                    break;
                }

                case ANTLRv4Lexer.BEGIN_ACTION:
                case ANTLRv4Lexer.ACTION_CONTENT:
                case ANTLRv4Lexer.END_ACTION: {
                    // No extra space. These are entire blocks we take over as they are.
                    if (token.text === "\n") {
                        return { containsAlts, singleLineLength: 1e100 };
                    } else {
                        ++singleLineLength;
                    }
                    break;
                }

                case ANTLRv4Lexer.OR: {
                    if (nestingLevel === 0) {
                        if (stoppers.has(ANTLRv4Lexer.OR)) {
                            checkTrailingComment();

                            return { containsAlts, singleLineLength };
                        }
                        containsAlts = true;
                    }
                    singleLineLength += 2;
                    break;
                }

                case ANTLRv4Lexer.NOT: {
                    ++singleLineLength; // Unary NOT, no space after that.
                    break;
                }

                default:
                    if (token.text) {
                        singleLineLength += token.text.length;
                    }
                    ++singleLineLength; // Add one for a space char which must follow this token.
                    break;
            }
        }

        // We should never arrive here, since we bail out above when the block end was found.
        return { containsAlts, singleLineLength };
    }

    /**
     * Determines if there is an element after the given position which should go
     * on the current line (line comment, lexer commands).
     *
     * @param i The position to start from.
     *
     * @returns True if there's something should be kept on the same line.
     */
    private nonBreakingTrailerAhead(i: number): boolean {
        if (this.tokens[++i].type === ANTLRv4Lexer.WS) {
            if (this.tokens[i].text!.indexOf("\n") >= 0) {
                return false;
            }
            ++i;
        }

        return this.tokens[i].type === ANTLRv4Lexer.LINE_COMMENT
            || this.tokens[i].type === ANTLRv4Lexer.RARROW
            || this.tokens[i].type === ANTLRv4Lexer.LPAREN;
    }

    /**
     * Scans the given comment for any of the formatter commands and parses them out.
     *
     * @param index The index of the comment token.
     */
    private processFormattingCommands(index: number): void {

        const resetAlignmentStatus = (alignments: AlignmentType[]): void => {
            for (const type of alignments) {
                const status = this.alignments.get(type);
                if (status) {
                    status.lastLine = -1;
                }
            }
        };

        let text = this.tokens[index].text!;
        text = text.substring(2, text.length).trim();
        if (text.startsWith(formatIntroducer)) {
            const entries = text.substring(formatIntroducer.length + 1).split(",");
            for (const entry of entries) {
                const groups = /(\w+)(?:(?:\s*:)?\s*)?(\w+|[0-9]+)?/i.exec(entry.trim());
                if (groups) {
                    switch (groups[1]) {
                        case "reset": {
                            this.setDefaultOptions();
                            break;
                        }
                        case "on":
                        case "true": {
                            this.formattingDisabled = false;
                            if (this.rangeStart > -1) {
                                this.addRaw(this.rangeStart, index - 1);
                            }
                            break;
                        }
                        case "off":
                        case "false": {
                            this.formattingDisabled = true;
                            this.rangeStart = index;
                            break;
                        }

                        case "alignTrailingComments":
                        case "allowShortBlocksOnASingleLine":
                        case "breakBeforeBraces":
                        case "keepEmptyLinesAtTheStartOfBlocks":
                        case "reflowComments":
                        case "spaceBeforeAssignmentOperators":
                        case "useTab":
                        case "allowShortRulesOnASingleLine":
                        case "singleLineOverrulesHangingColon":
                        case "breakBeforeParens":
                        case "ruleInternalsOnSingleLine":
                        case "groupedAlignments":
                        case "alignFirstTokens":
                        case "alignLexerCommands":
                        case "alignActions":
                        case "alignLabels":
                        case "alignTrailers": {
                            if ((
                                groups.length > 2 && (groups[2] === "true" || groups[2] === "false")
                            )
                                || groups[2] === "on"
                                || groups[2] === "off") {
                                this.options[groups[1]] = (groups[2] === "true" || groups[2] === "on");

                                // Some additional handling for alignments. Switching an alignment means
                                // that the alignment group for that alignment is finished.
                                switch (groups[1]) {
                                    case "groupedAlignments": {
                                        resetAlignmentStatus(allAlignments);
                                        break;
                                    }
                                    case "alignTrailingComments": {
                                        resetAlignmentStatus([AlignmentType.TrailingComment]);
                                        break;
                                    }
                                    case "alignFirstTokens": {
                                        resetAlignmentStatus([AlignmentType.FirstToken]);
                                        break;
                                    }
                                    case "alignLexerCommands": {
                                        resetAlignmentStatus([AlignmentType.LexerCommand]);
                                        break;
                                    }
                                    case "alignActions": {
                                        resetAlignmentStatus([AlignmentType.Action]);
                                        break;
                                    }
                                    case "alignLabels": {
                                        resetAlignmentStatus([AlignmentType.Label]);
                                        break;
                                    }
                                    case "alignTrailers": {
                                        resetAlignmentStatus([AlignmentType.Trailers]);
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                            } else {
                                this.add(GrammarFormatter.Error);
                            }
                            break;
                        }

                        case "columnLimit":
                        case "continuationIndentWidth":
                        case "indentWidth":
                        case "maxEmptyLinesToKeep":
                        case "tabWidth":
                        case "minEmptyLines": {
                            if (groups.length > 2) {
                                const value = parseInt(groups[2], 10);
                                if (value !== undefined) {
                                    this.options[groups[1]] = value;
                                } else {
                                    this.add(GrammarFormatter.Error);
                                }
                            } else {
                                this.add(GrammarFormatter.Error);
                            }
                            break;
                        }

                        case "alignColons": {
                            if (groups.length > 2) {
                                const value = groups[2];
                                if (value === "none" || value === "trailing" || value === "hanging") {
                                    this.options.alignColons = value;
                                } else {
                                    this.add(GrammarFormatter.Error);
                                }
                            } else {
                                this.add(GrammarFormatter.Error);
                            }
                            break;
                        }
                        case "alignSemicolons": {
                            if (groups.length > 2) {
                                const value = groups[2];
                                if (value === "none" || value === "ownLine" || value === "hanging") {
                                    this.options.alignSemicolons = value;
                                } else {
                                    this.add(GrammarFormatter.Error);
                                }
                            } else {
                                this.add(GrammarFormatter.Error);
                            }
                            break;
                        }
                        default: {
                            this.add(GrammarFormatter.Error);
                            break;
                        }
                    }
                }
            }
        }
    }

    /**
     * Inserts an alignment marker for the current alignment group for the given type.
     * If there's currently no active group a new one is started. This happens also if the current
     * position does not qualify for the current group.
     *
     * @param type The type of the alignment to add.
     */
    private addAlignmentEntry(type: AlignmentType): void {
        if (!this.alignments.has(type)) {
            this.alignments.set(type, { lastLine: -1, groups: [] });
        }

        const status = this.alignments.get(type)!;

        // While we allow multiple different alignment types on a single line, we don't want the same type
        // more than once on a line.
        if (status.lastLine !== this.currentLine) {
            if (this.lineHasNonWhitespaceContent()) {
                // Don't remove any indentation.
                this.removeTrailingTabsAndSpaces();
            }

            let startNewGroup = true;
            if (status.lastLine > -1) {
                // There's an active group. See if we can append the new entry to it.
                if (!this.options.groupedAlignments || status.lastLine + 1 === this.currentLine) {
                    // We can extend the active group.
                    startNewGroup = false;

                    // Groups consist of indices into the output pipeline.
                    status.groups[status.groups.length - 1].push(this.outputPipeline.length);
                }
            }

            if (startNewGroup) {
                status.groups.push([this.outputPipeline.length]);
            }
            this.outputPipeline.push(GrammarFormatter.Alignment);

            status.lastLine = this.currentLine;
        }
    }

    /**
     * Goes through the alignment groups for each alignment type. Each member is examined to find the column to
     * align to. The alignment markers in the output pipeline are replaced by indices into our whitespace list, which
     * gets the text to insert for a specific position. This way we don't change the output pipeline (which would
     * invalidate group indices).
     */
    private computeAlignments(): void {
        for (const type of allAlignments) {
            const alignment = this.alignments.get(type);
            if (alignment) {
                for (const group of alignment.groups) {
                    // If the group only consists of a single member then ignore it.
                    if (group.length === 1) {
                        if (group[0] < this.outputPipeline.length) {
                            if (this.entryIs(group[0] - 1, GrammarFormatter.Whitespace)
                                || this.entryIs(group[0] - 1, ANTLRv4Lexer.LPAREN)) {
                                this.outputPipeline[group[0]] = GrammarFormatter.WhitespaceEraser;
                            } else {
                                this.outputPipeline[group[0]] = GrammarFormatter.Space;
                            }
                        }
                        continue;
                    }

                    const columns: number[] = [];
                    for (const member of group) {
                        // For partial formatting it can happen we removed the last alignment entry
                        // in the pipeline. However the associated alignment group still exists and
                        // may here try to access a non-existing pipeline entry.
                        if (member < this.outputPipeline.length) {
                            console.assert(this.outputPipeline[member] <= GrammarFormatter.Alignment);
                            columns.push(this.columnForEntry(member));
                        }
                    }

                    // Determine the largest column and bring this up to the next tab stop (if we are using tabs)
                    // or add a single space to the highest column value and align all others to this position.
                    const useTabs = this.options.useTab;
                    let maxColumn = Math.max(...columns);
                    if (useTabs) {
                        maxColumn += this.options.tabWidth! - (maxColumn % this.options.tabWidth!);
                    } else {
                        ++maxColumn;
                    }

                    // Compute required whitespace inserts and store them in the whitespace list.
                    // Replace the alignment markers in the current group with the indices in that list.
                    for (let i = 0; i < group.length; ++i) {
                        const whitespaceIndex = GrammarFormatter.WhitespaceBlock - this.whitespaceList.length;
                        this.outputPipeline[group[i]] = whitespaceIndex;

                        let whitespaces;
                        if (useTabs) {
                            let tabCount = Math.floor((maxColumn - columns[i]) / this.options.tabWidth!);
                            if ((maxColumn - columns[i]) % this.options.tabWidth! !== 0) {
                                ++tabCount;
                            }
                            whitespaces = Array(tabCount).fill("\t").join("");
                        } else {
                            whitespaces = Array(maxColumn - columns[i]).fill(" ").join("");
                        }
                        this.whitespaceList.push(whitespaces);
                    }
                }
            }
        }
    }

    /**
     * Determines the column offset of the given entry in the output pipeline.
     *
     * @param offset The offset for which to return the column.
     *
     * @returns The computed column.
     */
    private columnForEntry(offset: number): number {
        let result = 0;

        // Scan back to last line break.
        let run = offset;
        while (--run > -1) {
            if (this.outputPipeline[run] === GrammarFormatter.LineBreak) {
                break;
            }
        }

        // Now sum up the individual entries. Need to collect text here since ranges
        // as well as lexer tokens can contain tabs.
        let text = "";
        while (++run < offset) {
            const entry = this.outputPipeline[run];
            switch (entry) {
                case GrammarFormatter.Space:
                    text += " ";
                    break;
                case GrammarFormatter.Tab:
                    text += "\t";
                    break;
                case GrammarFormatter.WhitespaceEraser: // Ignore.
                case GrammarFormatter.Error:
                    break;
                default:
                    // We cannot see alignment markers here (as we are currently processing one),
                    // nor whitespace blocks (we are inserting them afterwards).
                    if (entry < 0) {
                        if (this.isRangeBlock(entry)) {
                            // Copy an entire block.
                            const rangeIndex = -(entry - GrammarFormatter.Range);
                            const startIndex = this.ranges[rangeIndex][0];
                            const endIndex = this.ranges[rangeIndex][1];
                            const interval = Interval.of(this.tokens[startIndex].start,
                                this.tokens[endIndex].stop);
                            text += this.tokens[0].inputStream!.getText(interval);
                        } else if (this.isWhitespaceBlock(entry)) {
                            const whitespaceIndex = -(entry - GrammarFormatter.WhitespaceBlock);
                            text += this.whitespaceList[whitespaceIndex];
                        }
                    } else {
                        text += this.tokens[entry].text;
                    }
                    break;

            }
        }

        for (const char of text) {
            if (char === "\t") {
                result += this.options.tabWidth! - (result % this.options.tabWidth!);
            } else {
                ++result;
            }
        }

        return result;
    }

    /**
     * Reformats the given comment so that it does not go beyond the column limit, but fills the available space.
     * It will fix indentation as well as leading * on block/doc comments. Lines starting with a dash will be kept
     * on an own line, to avoid breaking lists/enumerations (but the column limit is still enforced).
     *
     * The function should only be called for comments spanning at least 2 lines.
     *
     * @param comment The comment to reformat.
     * @param type Specifies what type of comment we have (a collection of single line comments or a block/doc comment).
     * @returns The formatted comment.
     */
    private reflowComment(comment: string, type: number): string {
        const result: string[] = [];
        let lineIntroducer = (type === ANTLRv4Lexer.LINE_COMMENT) ? "// " : " * ";
        const lines = comment.split("\n");

        let lineIndex = 0;
        let pipeline = lines[lineIndex++].split(/ |\t/).filter((entry: string) => {
            return entry.length > 0;
        });
        let line: string;

        // We use a leading star only if the second line has one. Otherwise they are all removed (if any).
        if (type !== ANTLRv4Lexer.LINE_COMMENT) {
            if (!lines[1].trim().startsWith("*")) {
                lineIntroducer = " ";
            }

            const last = lines[lines.length - 1].trim().slice(0, -2);
            if (last.length === 0) {
                lines.pop();
            } else {
                lines[lines.length - 1] = last;
            }
        }

        // Take over everything unchanged until the first space or line break.
        // If there's only the comment introducer on the first line, keep it that way and start
        // on the next line with the processing.
        let isFirst = false;
        if (pipeline.length === 1) {
            result.push(pipeline[0]);
            line = lineIntroducer;
            isFirst = true;
        } else {
            line = pipeline[0] + " ";
        }

        let index = 1;
        let column = this.computeLineLength(line);
        while (true) {
            while (index < pipeline.length) {
                if (this.currentColumn + column + pipeline[index].length > this.options.columnLimit!) {
                    // Don't push the trailing space we added before.
                    result.push(line.slice(0, -1));
                    line = lineIntroducer;
                    column = this.computeLineLength(line);
                }
                line += pipeline[index++] + " ";
                column = this.computeLineLength(line);
            }

            // Pipeline exhausted. Load next source line.
            if (lineIndex === lines.length) {
                break;
            }

            pipeline = lines[lineIndex++].split(/ |\t/).filter((entry: string) => {
                return entry.length > 0;
            });
            index = 0;

            if (pipeline.length > 0) {
                // Remove line introducer (if there's one). Can make the pipeline empty if it only consists of that.
                const first = pipeline[0];
                if (type === ANTLRv4Lexer.LINE_COMMENT) {
                    if (first === "//") {
                        pipeline = pipeline.slice(1);
                    } else {
                        pipeline[0] = first.substring(2);
                    }
                } else {
                    if (first === "*") {
                        pipeline = pipeline.slice(1);
                    } else {
                        if (first.startsWith("*")) {
                            pipeline[0] = first.substring(1);
                        }
                    }
                }
            }

            if (pipeline.length === 0) {
                // Keep empty lines. Push the current line only if this is not still the first line
                // (because we already pushed it already).
                if (!isFirst) {
                    result.push(line.slice(0, -1));
                }
                result.push(lineIntroducer);
                line = lineIntroducer;
            }
            isFirst = false;
        }

        if (line.length > 0) {
            result.push(line.slice(0, -1));
        }

        if (type !== ANTLRv4Lexer.LINE_COMMENT) {
            result.push(" */");
        }

        const indentation = (this.options.useTab)
            ? "\t".repeat(this.currentIndentation)
            : " ".repeat(this.currentIndentation * this.options.indentWidth!);

        return result.join("\n" + indentation);
    }

    /**
     * Tests if the marker belongs to the range block.
     *
     * @param marker The marker to test.
     *
     * @returns True if the marker is a range marker.
     */
    private isRangeBlock = (marker: InsertMarker): boolean => {
        return (marker <= GrammarFormatter.Range) && (marker > GrammarFormatter.Alignment);
    };

    /**
     * Tests if the marker belongs to the whitespace block.
     *
     * @param marker The marker to test.
     *
     * @returns True if the marker is a whitespace marker.
     */
    private isWhitespaceBlock = (marker: InsertMarker): boolean => {
        return (marker <= GrammarFormatter.WhitespaceBlock);
    };
}
