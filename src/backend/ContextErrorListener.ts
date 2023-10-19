/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { BaseErrorListener, Recognizer, RecognitionException, Token, ParserATNSimulator } from "antlr4ng";

import { IDiagnosticEntry, DiagnosticType } from "../types.js";

export class ContextErrorListener extends BaseErrorListener<ParserATNSimulator> {
    public constructor(private errorList: IDiagnosticEntry[]) {
        super();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override syntaxError<T extends Token>(recognizer: Recognizer<ParserATNSimulator>, offendingSymbol: T | null,
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

        if (offendingSymbol) {
            error.range.end.column = charPositionInLine + offendingSymbol.stop - offendingSymbol.start + 1;
        }
        this.errorList.push(error);
    }
}
