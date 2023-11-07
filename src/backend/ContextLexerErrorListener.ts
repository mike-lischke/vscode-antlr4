/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { BaseErrorListener, Recognizer, RecognitionException, Token, ATNSimulator } from "antlr4ng";

import { IDiagnosticEntry, DiagnosticType } from "../types.js";

export class ContextLexerErrorListener extends BaseErrorListener {
    public constructor(private errorList: IDiagnosticEntry[]) {
        super();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public override syntaxError<S extends Token, T extends ATNSimulator>(_recognizer: Recognizer<T>,
        _offendingSymbol: S | null, line: number, column: number, msg: string, _e: RecognitionException | null): void {
        const error: IDiagnosticEntry = {
            type: DiagnosticType.Error,
            message: msg,
            range: {
                start: {
                    column,
                    row: line,
                },
                end: {
                    column: column + 1,
                    row: line,
                },
            },
        };

        this.errorList.push(error);
    }
}
