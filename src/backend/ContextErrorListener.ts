/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ANTLRErrorListener, Recognizer, RecognitionException, Token, CommonToken } from "antlr4ts";

import { Override } from "antlr4ts/Decorators";
import { IDiagnosticEntry, DiagnosticType } from "./types";

export class ContextErrorListener implements ANTLRErrorListener<CommonToken> {
    public constructor(private errorList: IDiagnosticEntry[]) {
    }

    @Override
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public syntaxError<T extends Token>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined,
        line: number, charPositionInLine: number, msg: string, _e: RecognitionException | undefined): void {
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
            error.range.end.column = charPositionInLine + offendingSymbol.stopIndex - offendingSymbol.startIndex + 1;
        }
        this.errorList.push(error);
    }
}
