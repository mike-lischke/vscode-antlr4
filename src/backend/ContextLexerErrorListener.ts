/*
 * This file is released under the MIT license.
 * Copyright (c) 2020 Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { ANTLRErrorListener, Recognizer, RecognitionException } from "antlr4ts";

import { Override } from "antlr4ts/Decorators";
import { DiagnosticEntry, DiagnosticType } from "./facade";

export class ContextLexerErrorListener implements ANTLRErrorListener<number> {
    public constructor(private errorList: DiagnosticEntry[]) {
    }

    @Override
    public syntaxError<T extends number>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number,
        charPositionInLine: number, msg: string, e: RecognitionException | undefined): void {
        const error: DiagnosticEntry = {
            type: DiagnosticType.Error,
            message: msg,
            range: {
                start: {
                    column: charPositionInLine,
                    row: line,
                },
                end: {
                    column: charPositionInLine + 1,
                    row: line,
                },
            },
        };

        this.errorList.push(error);
    }
}

