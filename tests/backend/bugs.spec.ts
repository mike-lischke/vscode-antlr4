/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { AntlrFacade } from "../../src/backend/facade.js";
import { SymbolKind } from "../../src/types.js";

describe("Test for Bugs", () => {
    let backend: AntlrFacade;

    beforeAll(() => {
        backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.
    });

    it("Lexer token in a set-element context", () => {
        const info = backend.symbolInfoAtPosition("tests/backend/test-data/TParser.g4", 30, 93, true);
        expect(info).toBeDefined();
        if (info) {
            expect(info.name).toEqual("Semicolon");
            expect(info.source).toEqual("tests/backend/test-data/TLexer.g4");
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
        backend.releaseGrammar("tests/backend/test-data/TParser.g4");
        const selfDiags = backend.getSelfDiagnostics();
        expect(selfDiags.contextCount).toEqual(0);
    });
});
