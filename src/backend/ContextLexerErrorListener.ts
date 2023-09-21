/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { BaseErrorListener, Recognizer, RecognitionException, LexerATNSimulator, Token } from "antlr4ng";

import { IDiagnosticEntry, DiagnosticType } from "./types.js";

export class ContextLexerErrorListener extends BaseErrorListener<LexerATNSimulator> {
    public constructor(private errorList: IDiagnosticEntry[]) {
        super();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override syntaxError<T extends Token>(recognizer: Recognizer<LexerATNSimulator>, offendingSymbol: T | null,
        line: number, charPositionInLine: number, msg: string, _e: RecognitionException | null): void {
        const error: IDiagnosticEntry = {
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
