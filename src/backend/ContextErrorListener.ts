/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { ANTLRErrorListener, Recognizer, RecognitionException, Token, CommonToken } from 'antlr4ts';

import { Override } from 'antlr4ts/Decorators';
import { DiagnosticEntry, DiagnosticType } from '../backend/facade';

export class ContextLexerErrorListener implements ANTLRErrorListener<number> {
    constructor(private errorList: DiagnosticEntry[]) {
    }

    @Override
    syntaxError<T extends number>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number,
        charPositionInLine: number, msg: string, e: RecognitionException | undefined): void {
        let error: DiagnosticEntry = {
            type: DiagnosticType.Error,
            message: msg,
            range: { start: { column: charPositionInLine, row: line }, end: { column: charPositionInLine + 1, row: line }}
        }

        this.errorList.push(error);
    }
};

export class ContextErrorListener implements ANTLRErrorListener<CommonToken> {
    constructor(private errorList: DiagnosticEntry[]) {
    }

    @Override
    syntaxError<T extends Token>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number,
        charPositionInLine: number, msg: string, e: RecognitionException | undefined): void {
        let error: DiagnosticEntry = {
            type: DiagnosticType.Error,
            message: msg,
            range: { start: { column: charPositionInLine, row: line }, end: { column: charPositionInLine + 1, row: line }}
        }

        if (offendingSymbol) {
            error.range.end.column = charPositionInLine + offendingSymbol.stopIndex - offendingSymbol.startIndex + 1;
        }
        this.errorList.push(error);
    }
};
