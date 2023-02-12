/*
 * This file is released under the MIT license.
 * Copyright (c) 2023, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { AntlrFacade } from "../../src/backend/facade";
import { SymbolKind } from "../../src/backend/types";

describe("Test for Bugs", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.
    jest.setTimeout(30000);

    it("Lexer token in a set-element context", () => {
        const info = backend.symbolInfoAtPosition("test/backend/test-data/TParser.g4", 30, 93, true);
        expect(info).toBeDefined();
        if (info) {
            expect(info.name).toEqual("Semicolon");
            expect(info.source).toEqual("test/backend/test-data/TLexer.g4");
            expect(info.kind).toEqual(SymbolKind.LexerRule);
            expect(info.definition).toBeDefined();
            if (info.definition) {
                expect(info.definition.text).toEqual("Semicolon: ';';");
                expect(info.definition.range.start.column).toEqual(0);
                expect(info.definition.range.start.row).toEqual(59);
                expect(info.definition.range.end.column).toEqual(14);
                expect(info.definition.range.end.row).toEqual(59);
            }
        }
        backend.releaseGrammar("test/backend/test-data/TParser.g4");
        const selfDiags = backend.getSelfDiagnostics();
        expect(selfDiags.contextCount).toEqual(0);
    });
});
