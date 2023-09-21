/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { AntlrFacade } from "../../src/backend/facade.js";

describe("Advanced Symbol Information", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.

    it("RRD diagram", () => {
        let diagram = backend.getRRDScript("tests/backend/test-data/TLexer.g4", "Any");
        expect(diagram).toEqual("Diagram(Choice(0, Sequence(Terminal('Foo'), Terminal('Dot'), " +
            "Optional(Terminal('Bar')), Terminal('DotDot'), Terminal('Baz'), Terminal('Bar')))).addTo()");

        diagram = backend.getRRDScript("tests/backend/test-data/TParser.g4", "idarray");
        expect(diagram).toEqual("ComplexDiagram(Choice(0, Sequence(Terminal('OpenCurly'), " +
            "NonTerminal('id'), ZeroOrMore(Choice(0, Sequence(Terminal('Comma'), NonTerminal('id')))), " +
            "Terminal('CloseCurly')))).addTo()");

        diagram = backend.getRRDScript("tests/backend/test-data/TParser.g4", "expr");
        expect(diagram).toEqual("ComplexDiagram(Choice(0, Sequence(NonTerminal('expr'), " +
            "Terminal('Star'), NonTerminal('expr'))," +
            " Sequence(NonTerminal('expr'), Terminal('Plus'), NonTerminal('expr')), Sequence(Terminal('OpenPar')," +
            " NonTerminal('expr'), Terminal('ClosePar')), Sequence(Comment('<assoc=right>'), NonTerminal('expr')" +
            ", Terminal('QuestionMark'), NonTerminal('expr'), Terminal('Colon'), NonTerminal('expr')), " +
            "Sequence(Comment('<assoc=right>'), NonTerminal('expr'), Terminal('Equal'), NonTerminal('expr'))," +
            " Sequence(NonTerminal('id')), Sequence(NonTerminal('flowControl')), Sequence(Terminal('INT')), " +
            "Sequence(Terminal('String')))).addTo()",
        );
    });

    it("Reference Graph", () => {
        const graph = backend.getReferenceGraph("tests/backend/test-data/TParser.g4");
        expect(graph.size).toEqual(48);

        let element = graph.get("TParser.expr");
        expect(element).toBeDefined();
        if (element) {
            expect(element.tokens.size).toEqual(9);
            expect(element.tokens).toContain("TLexer.QuestionMark");
        }

        element = graph.get("TParser.flowControl");
        expect(element).toBeDefined();
        if (element) {
            expect(element.rules.size).toEqual(1);
            expect(element.tokens.size).toEqual(2);
            expect(element.literals.size).toEqual(1);
            expect(element.rules).toContain("TParser.expr");
            expect(element.tokens).toContain("TLexer.Continue");
            expect(element.literals.has("return")).toBeTruthy();
        }
    });
});
