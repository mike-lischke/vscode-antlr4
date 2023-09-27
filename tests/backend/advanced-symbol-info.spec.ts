/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { AntlrFacade } from "../../src/backend/facade.js";

describe("Advanced Symbol Information", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.

    it("RRD diagram", () => {
        const dummy = new RegExp("");
        let diagram = backend.getRRDScript("tests/backend/test-data/TLexer.g4", "Any", dummy, 0);
        expect(diagram).toEqual(["new Diagram(new Choice(0, new Stack(new Sequence(new Terminal('Foo'), " +
            "new Terminal('Dot'), new Optional(new Terminal('Bar')), new Terminal('DotDot'), new Terminal('Baz'), " +
            "new Terminal('Bar')))))", false]);

        diagram = backend.getRRDScript("tests/backend/test-data/TParser.g4", "idarray", dummy, 0);
        expect(diagram).toEqual(["new ComplexDiagram(new Choice(0, new Stack(new Sequence(new Terminal('OpenCurly'), " +
            "new NonTerminal('id'), new ZeroOrMore(new Choice(0, new Stack(new Sequence(new Terminal('Comma'), " +
            "new NonTerminal('id'))))), new Terminal('CloseCurly')))))", false]);

        diagram = backend.getRRDScript("tests/backend/test-data/TParser.g4", "expr", dummy, 0);
        expect(diagram).toEqual(["new ComplexDiagram(new Choice(0, new Stack(new Sequence(new NonTerminal('expr'), " +
            "new Terminal('Star'), new NonTerminal('expr'))), new Stack(new Sequence(new NonTerminal('expr'), " +
            "new Terminal('Plus'), new NonTerminal('expr'))), new Stack(new Sequence(new Terminal('OpenPar'), " +
            "new NonTerminal('expr'), new Terminal('ClosePar'))), new Stack(new Sequence(new Comment" +
            "('<assoc=right>'), new NonTerminal('expr'), new Terminal('QuestionMark'), new NonTerminal('expr'), " +
            "new Terminal('Colon'), new NonTerminal('expr'))), new Stack(new Sequence(new Comment('<assoc=right>'), " +
            "new NonTerminal('expr'), new Terminal('Equal'), new NonTerminal('expr'))), new Stack(new Sequence(" +
            "new NonTerminal('id'))), new Stack(new Sequence(new NonTerminal('flowControl'))), new Stack(new " +
            "Sequence(new Terminal('INT'))), new Stack(new Sequence(new Terminal('String')))))", false],
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
