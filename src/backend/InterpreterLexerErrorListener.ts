/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { BaseErrorListener, LexerATNSimulator, Token, Recognizer, ATNSimulator, RecognitionException } from "antlr4ng";

export class InterpreterLexerErrorListener extends BaseErrorListener<LexerATNSimulator> {
    public constructor(private eventSink: (event: string | symbol, ...args: unknown[]) => void) {
        super();
    }

    public override syntaxError<T extends Token>(recognizer: Recognizer<ATNSimulator>, offendingSymbol: T | undefined,
        line: number, charPositionInLine: number, msg: string, _e: RecognitionException | null): void {
        this.eventSink("output", `Lexer error (${line}, ${charPositionInLine + 1}): ${msg}`,
            recognizer.inputStream.getSourceName(), line, charPositionInLine, true);
    }
}
