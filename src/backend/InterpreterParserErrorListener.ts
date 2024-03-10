/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ATNSimulator, BaseErrorListener, RecognitionException, Recognizer, Token } from "antlr4ng";

export class InterpreterParserErrorListener extends BaseErrorListener {
    public constructor(private eventSink: (event: string | symbol, ...args: unknown[]) => void) {
        super();
    }

    public override syntaxError<S extends Token, T extends ATNSimulator>(recognizer: Recognizer<T>,
        _offendingSymbol: S | null, line: number, column: number, msg: string,
        _e: RecognitionException | null): void {
        this.eventSink("output", `Parser error (${line}, ${column + 1}): ${msg}`,
            recognizer.inputStream!.getSourceName(), line, column, true);
    }
}
