/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as fs from "fs";

import { AntlrFacade } from "../../src/backend/facade.js";
import { SymbolKind } from "../../src/types.js";

describe("Symbol Info Retrieval (t.g4)", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.

    it("Symbol Listing 1", () => {
        const info = backend.symbolInfoAtPosition("tests/backend/test-data/t.g4", 7, 2, true);
        expect(info).toBeDefined();
        if (info) {
            expect(info.name).toEqual("B");
            expect(info.source).toEqual("tests/backend/test-data/t.g4");
            expect(info.kind).toEqual(SymbolKind.LexerRule);

            expect(info.definition).toBeDefined();
            if (info.definition) {
                expect(info.definition.text).toEqual("B: 'B';");
                expect(info.definition.range.start.column).toEqual(0);
                expect(info.definition.range.start.row).toEqual(7);
                expect(info.definition.range.end.column).toEqual(6);
                expect(info.definition.range.end.row).toEqual(7);
            }
        }
    });

    it("listTopLevelSymbols", () => {
        const symbols = backend.listTopLevelSymbols("tests/backend/test-data/t.g4", true);
        expect(symbols).toHaveLength(10);

        const info = symbols[8];
        expect(info.name).toEqual("x");
        expect(info.source).toEqual("tests/backend/test-data/t.g4");
        expect(info.kind).toEqual(SymbolKind.ParserRule);

        expect(info.definition).toBeDefined();
        if (info.definition) {
            expect(info.definition.text).toEqual("x: A | B | C;");
            expect(info.definition.range.start.column).toEqual(0);
            expect(info.definition.range.start.row).toEqual(2);
            expect(info.definition.range.end.column).toEqual(12);
            expect(info.definition.range.end.row).toEqual(2);
        }
    });

    it("Diagnostics 1", () => {
        const diagnostics = backend.getDiagnostics("tests/backend/test-data/t.g4");
        expect(diagnostics).toHaveLength(2);

        expect(diagnostics[0].message).toEqual("Unknown token reference 'ZZ'");
        expect(diagnostics[0].range.start.column).toEqual(3);
        expect(diagnostics[0].range.start.row).toEqual(3);
        expect(diagnostics[0].range.end.column).toEqual(5);
        expect(diagnostics[0].range.end.row).toEqual(3);

        expect(diagnostics[1].message).toEqual("Unknown channel 'BLAH'");
        expect(diagnostics[1].range.start.column).toEqual(18);
        expect(diagnostics[1].range.start.row).toEqual(8);
        expect(diagnostics[1].range.end.column).toEqual(22);
        expect(diagnostics[1].range.end.row).toEqual(8);
    });

    it("reparse", () => {
        backend.loadGrammar("tests/backend/test-data/t.g4");
        try {
            backend.setText("tests/backend/test-data/t.g4", "grammar A; a:: b \n| c; c: b+;");
            backend.reparse("tests/backend/test-data/t.g4");
            let diagnostics = backend.getDiagnostics("tests/backend/test-data/t.g4");

            expect(diagnostics).toHaveLength(4);

            expect(diagnostics[0].message).toEqual("mismatched input '::' expecting {BEGIN_ARGUMENT, " +
                "OPTIONS, 'returns', 'locals', 'throws', COLON, AT}");
            expect(diagnostics[0].range.start.column).toEqual(12);
            expect(diagnostics[0].range.start.row).toEqual(1);
            expect(diagnostics[0].range.end.column).toEqual(14);
            expect(diagnostics[0].range.end.row).toEqual(1);

            expect(diagnostics[1].message).toEqual("mismatched input '|' expecting {BEGIN_ARGUMENT, " +
                "OPTIONS, 'returns', 'locals', 'throws', COLON, AT}");
            expect(diagnostics[1].range.start.column).toEqual(0);
            expect(diagnostics[1].range.start.row).toEqual(2);
            expect(diagnostics[1].range.end.column).toEqual(1);
            expect(diagnostics[1].range.end.row).toEqual(2);

            backend.setText("tests/backend/test-data/t.g4", "grammar A; a: b \n| c; c: b+;");
            backend.reparse("tests/backend/test-data/t.g4");
            diagnostics = backend.getDiagnostics("tests/backend/test-data/t.g4");

            expect(diagnostics).toHaveLength(2);

            expect(diagnostics[0].message).toEqual("Unknown parser rule 'b'");
            expect(diagnostics[0].range.start.column).toEqual(14);
            expect(diagnostics[0].range.start.row).toEqual(1);
            expect(diagnostics[0].range.end.column).toEqual(15);
            expect(diagnostics[0].range.end.row).toEqual(1);

            expect(diagnostics[1].message).toEqual("Unknown parser rule 'b'");
            expect(diagnostics[1].range.start.column).toEqual(8);
            expect(diagnostics[1].range.start.row).toEqual(2);
            expect(diagnostics[1].range.end.column).toEqual(9);
            expect(diagnostics[1].range.end.row).toEqual(2);
        } finally {
            backend.releaseGrammar("tests/backend/test-data/t.g4");
        }
    });

    it("Symbol Listing 2", () => {
        backend.loadGrammar("tests/backend/test-data/TParser.g4");
        const symbols = backend.listTopLevelSymbols("tests/backend/test-data/TParser.g4", true);
        expect(symbols).toHaveLength(56);

        const info = symbols[38];
        expect(info.name).toEqual("Mode2");
        expect(info.source).toEqual("tests/backend/test-data/TLexer.g4");
        expect(info.kind).toEqual(SymbolKind.LexerMode);

        expect(info.definition).toBeDefined();
        if (info.definition) {
            expect(info.definition.text).toEqual("mode Mode2;");
            expect(info.definition.range.start.column).toEqual(0);
            expect(info.definition.range.start.row).toEqual(86);
            expect(info.definition.range.end.column).toEqual(10);
            expect(info.definition.range.end.row).toEqual(86);
        }

        let [ruleName] = backend.ruleFromPosition("tests/backend/test-data/TParser.g4", 37, 103);
        expect(ruleName).toEqual("expr");
        [ruleName] = backend.ruleFromPosition("tests/backend/test-data/TParser.g4", 100, 123);
        expect(ruleName).toBeUndefined();
        [ruleName] = backend.ruleFromPosition("tests/backend/test-data/TParser.g4", 2, 119)!;
        expect(ruleName).toEqual("any");
        [ruleName] = backend.ruleFromPosition("tests/backend/test-data/TParser.g4", 103, 82)!;
        expect(ruleName).toEqual("special");
        [ruleName] = backend.ruleFromPosition("tests/backend/test-data/TParser.g4", 64, 68);
        expect(ruleName).toBeUndefined();

        [ruleName] = backend.ruleFromPosition("tests/backend/test-data/TLexer.g4", 62, 77)!;
        expect(ruleName).toEqual("Comment");
        [ruleName] = backend.ruleFromPosition("tests/backend/test-data/TLexer.g4", 0, 50)!;
        expect(ruleName).toEqual("ID");
    });

    it("Editing", () => {
        // Change the source. This will release the lexer reference and reload it.
        // If that does not work we'll get a lot of unknown-symbol errors (for all lexer symbols).
        const source = fs.readFileSync("tests/backend/test-data/TParser.g4", "utf8");
        backend.setText("tests/backend/test-data/TParser.g4", source + "\nblah: any idarray;");
        backend.reparse("tests/backend/test-data/TParser.g4");

        // This also updates the symbol reference counts.
        const parserDiags = backend.getDiagnostics("tests/backend/test-data/TParser.g4");
        expect(parserDiags).toHaveLength(0);
    });

    it("Diagnostics 2", () => {
        const lexerDiags = backend.getDiagnostics("tests/backend/test-data/TLexer.g4");
        expect(lexerDiags).toHaveLength(0);

        let refCount = backend.countReferences("tests/backend/test-data/TParser.g4", "Semicolon");
        expect(refCount).toEqual(4);

        refCount = backend.countReferences("tests/backend/test-data/TLexer.g4", "Bar");
        expect(refCount).toEqual(2);
        backend.releaseGrammar("tests/backend/test-data/TParser.g4");
    });

    it("Symbol ranges", () => {
        let symbol = backend.enclosingSymbolAtPosition("tests/backend/test-data/TParser.g4", 100, 4);
        expect(symbol).toBeDefined();
        expect(symbol!.definition).toBeDefined();
        expect(symbol!.definition!.range.start.row).toEqual(3);
        expect(symbol!.definition!.range.start.column).toEqual(5);
        expect(symbol!.definition!.range.end.row).toEqual(5);
        expect(symbol!.definition!.range.end.column).toEqual(0);

        symbol = backend.enclosingSymbolAtPosition("tests/backend/test-data/TParser.g4", 9, 34); // action block
        expect(symbol).toBeDefined();
        expect(symbol?.definition).toBeDefined();
        if (symbol?.definition) {
            expect(symbol.definition.range.start.row).toEqual(30);
            expect(symbol.definition.range.start.column).toEqual(17);
            expect(symbol.definition.range.end.row).toEqual(37);
            expect(symbol.definition.range.end.column).toEqual(0);
        }

        symbol = backend.enclosingSymbolAtPosition("tests/backend/test-data/TParser.g4", 1000, 1000); // beyond EOF
        expect(symbol).toBeUndefined();

        // argument action block
        symbol = backend.enclosingSymbolAtPosition("tests/backend/test-data/TParser.g4", 79, 82);
        expect(symbol).toBeDefined();
        expect(symbol?.definition).toBeDefined();
        if (symbol?.definition) {
            expect(symbol.definition.range.start.row).toEqual(82);
            expect(symbol.definition.range.start.column).toEqual(63);
            expect(symbol.definition.range.end.row).toEqual(82);
            expect(symbol.definition.range.end.column).toEqual(89);
        }

        // same pos, rule context
        symbol = backend.enclosingSymbolAtPosition("tests/backend/test-data/TParser.g4", 79, 82, true);
        expect(symbol).toBeDefined();
        expect(symbol?.definition).toBeDefined();
        if (symbol?.definition) {
            expect(symbol.definition.range.start.row).toEqual(82);
            expect(symbol.definition.range.start.column).toEqual(0);
            expect(symbol.definition.range.end.row).toEqual(90);
            expect(symbol.definition.range.end.column).toEqual(0);
        }
    });
});
