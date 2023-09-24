/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ATNSimulator, BaseErrorListener, ParserATNSimulator, RecognitionException, Recognizer, Token } from "antlr4ng";

export class InterpreterParserErrorListener extends BaseErrorListener<ParserATNSimulator> {
    public constructor(private eventSink: (event: string | symbol, ...args: unknown[]) => void) {
        super();
    }

    public override syntaxError<T extends Token>(recognizer: Recognizer<ATNSimulator>, offendingSymbol: T | undefined,
        line: number, charPositionInLine: number, msg: string, _e: RecognitionException | null): void {
        this.eventSink("output", `Parser error (${line}, ${charPositionInLine + 1}): ${msg}`,
            recognizer.inputStream.getSourceName(), line, charPositionInLine, true);
    }
}
