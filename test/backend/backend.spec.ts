/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as fs from "fs";

import { AntlrFacade } from "../../src/backend/facade";
import { IRuleMappings, SymbolKind } from "../../src/backend/types";
import { SourceContext } from "../../src/backend/SourceContext";
import { positionToIndex, indexToPosition } from "./test-helpers";

interface ITestRange {
    source: {
        start: {
            column: number;
            row: number;
        };
        end: {
            column: number;
            row: number;
        };
    };
    target: {
        start: {
            column: number;
            row: number;
        };
        end: {
            column: number;
            row: number;
        };
    };
    result: string;
}

describe("vscode-antlr4 Backend Tests:", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.

    jest.setTimeout(50000);

    describe("Base Handling:", () => {
        it("Create Backend", () => {
            expect(1).toBe(1);
            expect(backend).toHaveProperty("loadGrammar");
            expect(backend).toHaveProperty("releaseGrammar");
            expect(backend).toHaveProperty("reparse");
            expect(backend).toHaveProperty("infoForSymbol");
            expect(backend).toHaveProperty("listTopLevelSymbols");
            expect(backend).toHaveProperty("getDiagnostics");
        });

        let c1: SourceContext;
        it("Load Grammar", () => {
            c1 = backend.loadGrammar("test/backend/t.g4");
            expect(c1).toBeInstanceOf(SourceContext);
        });

        it("Unload grammar", () => {
            backend.releaseGrammar("test/backend/t.g4");
            let context = backend.loadGrammar("test/backend/t.g"); // Non-existing grammar.
            expect(context).toBeInstanceOf(SourceContext);
            expect(context).not.toEqual(c1);

            backend.releaseGrammar("test/backend/t.g");
            c1 = backend.loadGrammar("test/backend/t.g4");
            context = backend.loadGrammar("test/backend/t.g4");
            expect(context).toEqual(c1);
            backend.releaseGrammar("test/backend/t.g4");
        });
    });

    describe("Symbol Info Retrieval (t.g4):", () => {
        it("infoForSymbol", () => {
            const info = backend.symbolInfoAtPosition("test/backend/t.g4", 7, 2, true);
            expect(info).toBeDefined();
            if (info) {
                expect(info.name).toEqual("B");
                expect(info.source).toEqual("test/backend/t.g4");
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
            const symbols = backend.listTopLevelSymbols("test/backend/t.g4", true);
            expect(symbols).toHaveLength(10);

            const info = symbols[8];
            expect(info.name).toEqual("x");
            expect(info.source).toEqual("test/backend/t.g4");
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

        it("getDiagnostics", () => {
            const diagnostics = backend.getDiagnostics("test/backend/t.g4");
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
            backend.loadGrammar("test/backend/t.g4");
            try {
                backend.setText("test/backend/t.g4", "grammar A; a:: b \n| c; c: b+;");
                backend.reparse("test/backend/t.g4");
                let diagnostics = backend.getDiagnostics("test/backend/t.g4");

                expect(diagnostics).toHaveLength(4);

                expect(diagnostics[0].message).toEqual("mismatched input '::' expecting {BEGIN_ARGUMENT, " +
                    "'options', 'returns', 'locals', 'throws', COLON, AT}");
                expect(diagnostics[0].range.start.column).toEqual(12);
                expect(diagnostics[0].range.start.row).toEqual(1);
                expect(diagnostics[0].range.end.column).toEqual(14);
                expect(diagnostics[0].range.end.row).toEqual(1);

                expect(diagnostics[1].message).toEqual("mismatched input '|' expecting {BEGIN_ARGUMENT, " +
                    "'options', 'returns', 'locals', 'throws', COLON, AT}");
                expect(diagnostics[1].range.start.column).toEqual(0);
                expect(diagnostics[1].range.start.row).toEqual(2);
                expect(diagnostics[1].range.end.column).toEqual(1);
                expect(diagnostics[1].range.end.row).toEqual(2);

                backend.setText("test/backend/t.g4", "grammar A; a: b \n| c; c: b+;");
                backend.reparse("test/backend/t.g4");
                diagnostics = backend.getDiagnostics("test/backend/t.g4");

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
                backend.releaseGrammar("test/backend/t.g4");
            }
        });
    });

    describe("Symbol Info Retrieval (TParser.g4):", () => {
        it("Symbol Listing", () => {
            backend.loadGrammar("test/backend/TParser.g4");
            const symbols = backend.listTopLevelSymbols("test/backend/TParser.g4", true);
            expect(symbols).toHaveLength(56);

            const info = symbols[38];
            expect(info.name).toEqual("Mode2");
            expect(info.source).toEqual("test/backend/TLexer.g4");
            expect(info.kind).toEqual(SymbolKind.LexerMode);

            expect(info.definition).toBeDefined();
            if (info.definition) {
                expect(info.definition.text).toEqual("mode Mode2;");
                expect(info.definition.range.start.column).toEqual(0);
                expect(info.definition.range.start.row).toEqual(86);
                expect(info.definition.range.end.column).toEqual(10);
                expect(info.definition.range.end.row).toEqual(86);
            }

            let [ruleName] = backend.ruleFromPosition("test/backend/TParser.g4", 37, 103);
            expect(ruleName).toEqual("expr");
            [ruleName] = backend.ruleFromPosition("test/backend/TParser.g4", 100, 123);
            expect(ruleName).toBeUndefined();
            [ruleName] = backend.ruleFromPosition("test/backend/TParser.g4", 2, 119)!;
            expect(ruleName).toEqual("any");
            [ruleName] = backend.ruleFromPosition("test/backend/TParser.g4", 103, 82)!;
            expect(ruleName).toEqual("special");
            [ruleName] = backend.ruleFromPosition("test/backend/TParser.g4", 64, 68);
            expect(ruleName).toBeUndefined();

            [ruleName] = backend.ruleFromPosition("test/backend/TLexer.g4", 62, 77)!;
            expect(ruleName).toEqual("Comment");
            [ruleName] = backend.ruleFromPosition("test/backend/TLexer.g4", 0, 50)!;
            expect(ruleName).toEqual("ID");
        });

        it("Editing", () => {
            // Change the source. This will release the lexer reference and reload it.
            // If that does not work we'll get a lot of unknown-symbol errors (for all lexer symbols).
            const source = fs.readFileSync("test/backend/TParser.g4", "utf8");
            backend.setText("test/backend/TParser.g4", source + "\nblah: any idarray;");
            backend.reparse("test/backend/TParser.g4");

            // This also updates the symbol reference counts.
            const parserDiags = backend.getDiagnostics("test/backend/TParser.g4");
            expect(parserDiags).toHaveLength(0);
        });

        it("getDiagnostics", () => {
            const lexerDiags = backend.getDiagnostics("test/backend/TLexer.g4");
            expect(lexerDiags).toHaveLength(0);

            let refCount = backend.countReferences("test/backend/TParser.g4", "Semicolon");
            expect(refCount).toEqual(4);

            refCount = backend.countReferences("test/backend/TLexer.g4", "Bar");
            expect(refCount).toEqual(2);
            backend.releaseGrammar("test/backend/TParser.g4");
        });

        it("Symbol ranges", () => {
            let symbol = backend.enclosingSymbolAtPosition("test/backend/TParser.g4", 100, 4); // options {} block
            expect(symbol).toBeDefined();
            expect(symbol!.definition).toBeDefined();
            expect(symbol!.definition!.range.start.row).toEqual(3);
            expect(symbol!.definition!.range.start.column).toEqual(5);
            expect(symbol!.definition!.range.end.row).toEqual(5);
            expect(symbol!.definition!.range.end.column).toEqual(0);

            symbol = backend.enclosingSymbolAtPosition("test/backend/TParser.g4", 9, 34); // action block
            expect(symbol).toBeDefined();
            expect(symbol?.definition).toBeDefined();
            if (symbol?.definition) {
                expect(symbol.definition.range.start.row).toEqual(30);
                expect(symbol.definition.range.start.column).toEqual(17);
                expect(symbol.definition.range.end.row).toEqual(37);
                expect(symbol.definition.range.end.column).toEqual(0);
            }

            symbol = backend.enclosingSymbolAtPosition("test/backend/TParser.g4", 1000, 1000); // beyond EOF
            expect(symbol).toBeUndefined();

            // argument action block
            symbol = backend.enclosingSymbolAtPosition("test/backend/TParser.g4", 79, 82);
            expect(symbol).toBeDefined();
            expect(symbol?.definition).toBeDefined();
            if (symbol?.definition) {
                expect(symbol.definition.range.start.row).toEqual(82);
                expect(symbol.definition.range.start.column).toEqual(63);
                expect(symbol.definition.range.end.row).toEqual(82);
                expect(symbol.definition.range.end.column).toEqual(89);
            }

            // same pos, rule context
            symbol = backend.enclosingSymbolAtPosition("test/backend/TParser.g4", 79, 82, true);
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

    describe("Advanced Symbol Information:", () => {

        it("RRD diagram", () => {
            let diagram = backend.getRRDScript("test/backend/TLexer.g4", "Any");
            expect(diagram).toEqual("Diagram(Choice(0, Sequence(Terminal('Foo'), Terminal('Dot'), " +
                "Optional(Terminal('Bar')), Terminal('DotDot'), Terminal('Baz'), Terminal('Bar')))).addTo()");

            diagram = backend.getRRDScript("test/backend/TParser.g4", "idarray");
            expect(diagram).toEqual("ComplexDiagram(Choice(0, Sequence(Terminal('OpenCurly'), " +
                "NonTerminal('id'), ZeroOrMore(Choice(0, Sequence(Terminal('Comma'), NonTerminal('id')))), " +
                "Terminal('CloseCurly')))).addTo()");

            diagram = backend.getRRDScript("test/backend/TParser.g4", "expr");
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

        it("Reference Graph", async () => {
            const graph = await backend.getReferenceGraph("test/backend/TParser.g4");
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

    describe("ATN Related:", () => {
        it("ATN Rule Graph, split grammar", async () => {
            // Need code generation here. Details will be tested later. The ATN retrieval will fail
            // anyway when generation fails.
            const files = await backend.generate("grammars/ANTLRv4Parser.g4", {
                outputDir: "generated",
                language: "Typescript",
                alternativeJar: "antlr/antlr4-typescript-4.9.0-SNAPSHOT-complete.jar",
            });
            files.forEach((file) => {
                const diagnostics = backend.getDiagnostics(file);
                if (diagnostics.length > 0) {
                    console.log(JSON.stringify(diagnostics, undefined, 4));
                }
                expect(diagnostics).toHaveLength(0);
            });

            const graph = backend.getATNGraph("grammars/ANTLRv4Parser.g4", "ruleModifier");

            try {
                expect(graph).toBeDefined();
                if (graph) {
                    expect(graph.nodes).toHaveLength(4);
                    expect(graph.nodes[0].name).toEqual("56");
                    expect(graph.nodes[0].type).toEqual(2);
                    expect(graph.nodes[1].name).toEqual("364");
                    expect(graph.nodes[1].type).toEqual(1);
                    expect(graph.nodes[2].name).toEqual("365");
                    expect(graph.nodes[2].type).toEqual(1);
                    expect(graph.nodes[3].name).toEqual("57");
                    expect(graph.nodes[3].type).toEqual(7);

                    expect(graph.links).toHaveLength(3);
                    expect(graph.links[0].source).toEqual(0);
                    expect(graph.links[0].target).toEqual(1);
                    expect(graph.links[0].type).toEqual(1);
                    expect(graph.links[0].labels).toHaveLength(1);
                    expect(graph.links[0].labels[0]).toStrictEqual({ content: "ε" });

                    expect(graph.links[1].source).toEqual(1);
                    expect(graph.links[1].target).toEqual(2);
                    expect(graph.links[1].type).toEqual(7);
                    expect(graph.links[1].labels).toHaveLength(5);
                    expect(graph.links[1].labels[0]).toStrictEqual({ content: "Set Transition", class: "heading" });
                    expect(graph.links[1].labels[3]).toStrictEqual({ content: "'public'" });

                    expect(graph.links[2].source).toEqual(2);
                    expect(graph.links[2].target).toEqual(3);
                    expect(graph.links[2].type).toEqual(1);
                    expect(graph.links[2].labels).toHaveLength(1);
                    expect(graph.links[2].labels[0]).toStrictEqual({ content: "ε" });
                }
            } finally {
                fs.rmSync("generated", { recursive: true, force: true });
                backend.releaseGrammar("grammars/ANTLRv4Parser.g4");
            }
        });
    });

    describe("Code Generation:", () => {
        afterEach(() => {
            backend.releaseGrammar("test/backend/TParser.g4");
            backend.releaseGrammar("test/backend/TLexer.g4");
            backend.releaseGrammar("test/backend/t2.g4");
            backend.releaseGrammar("test/backend/TParser2.g4");
            backend.releaseGrammar("test/backend/TLexer2.g4");

            fs.rmSync("generated", { recursive: true, force: true });
        });

        it("A standard generation run (CSharp), split grammar", async () => {
            let result = await backend.generate("test/backend/TParser.g4", {
                outputDir: "generated",
                language: "CSharp",
            });
            expect(result).toEqual(["test/backend/TLexer.g4", "test/backend/TParser.g4"]);

            expect(fs.existsSync("generated/TLexer.cs")).toBeTruthy();
            expect(fs.existsSync("generated/TParser.cs")).toBeTruthy();
            expect(fs.existsSync("generated/TParserBaseListener.cs")).toBeTruthy();
            expect(fs.existsSync("generated/TParserListener.cs")).toBeTruthy();
            expect(fs.existsSync("generated/TParserVisitor.cs")).toBeFalsy(); // Not created by default.

            expect(fs.existsSync("generated/TParser.interp"));
            expect(fs.existsSync("generated/TLexer.interp"));

            // Release the grammars, so no interpreter data exists anymore.
            backend.releaseGrammar("test/backend/TParser.g4");
            backend.releaseGrammar("test/backend/TLexer.g4");

            let temp = backend.getATNGraph("test/backend/TLexer.g4", "Dollar");
            expect(temp).toBeUndefined();
            temp = backend.getATNGraph("test/backend/TParser.g4", "stat");
            expect(temp).toBeUndefined();

            // Load interpreter data only (no real generation happens), using the data generated above.
            result = await backend.generate("test/backend/TParser.g4", {
                outputDir: "generated",
                language: "CSharp",
                loadOnly: true,
            });

            // No dependencies are returned since data is only loaded, not generated.
            expect(result).toHaveLength(0);

            // Now load the lexer data too.
            result = await backend.generate("test/backend/TLexer.g4", {
                outputDir: "generated",
                language: "CSharp",
                loadOnly: true,
            });

            const dollarGraph = backend.getATNGraph("test/backend/TLexer.g4", "Dollar");
            const statGraph = backend.getATNGraph("test/backend/TParser.g4", "stat");

            expect(dollarGraph).toBeDefined();
            if (dollarGraph) {
                expect(dollarGraph.nodes).toHaveLength(7);
                expect(dollarGraph.nodes[0].name).toEqual("45");
                expect(dollarGraph.nodes[0].type).toEqual(2);
                expect(dollarGraph.nodes[1].name).toEqual("140");
                expect(dollarGraph.nodes[1].type).toEqual(1);
                expect(dollarGraph.nodes[4].name).toEqual("143");
                expect(dollarGraph.nodes[4].type).toEqual(1);
                expect(dollarGraph.nodes[5].name).toEqual("144");
                expect(dollarGraph.nodes[5].type).toEqual(1);

                expect(dollarGraph.links).toHaveLength(6);
                expect(dollarGraph.links[1].source).toEqual(1);
                expect(dollarGraph.links[1].target).toEqual(2);
                expect(dollarGraph.links[1].type).toEqual(5);
                expect(dollarGraph.links[1].labels).toHaveLength(2);
                expect(dollarGraph.links[1].labels[0])
                    .toStrictEqual({ content: "Atom Transition", class: "heading" });
                expect(dollarGraph.links[1].labels[1]).toStrictEqual({ content: "'$'" });

                expect(dollarGraph.links[2].source).toEqual(2);
                expect(dollarGraph.links[2].target).toEqual(3);
                expect(dollarGraph.links[2].type).toEqual(1);
                expect(dollarGraph.links[2].labels).toHaveLength(1);
                expect(dollarGraph.links[2].labels[0]).toStrictEqual({ content: "ε" });

                expect(dollarGraph.links[5].source).toEqual(5);
                expect(dollarGraph.links[5].target).toEqual(6);
                expect(dollarGraph.links[5].type).toEqual(1);
                expect(dollarGraph.links[5].labels).toHaveLength(1);
                expect(dollarGraph.links[5].labels[0]).toStrictEqual({ content: "ε" });
            }

            expect(statGraph).toBeDefined();
            if (statGraph) {
                expect(statGraph.nodes).toHaveLength(15);
                expect(statGraph.nodes[0].id.toString()).toEqual(statGraph.nodes[0].name);
                expect(statGraph.nodes[0].name).toEqual("12");
                expect(statGraph.nodes[0].type).toEqual(2);
                expect(statGraph.nodes[6].id.toString()).toEqual(statGraph.nodes[6].name);
                expect(statGraph.nodes[6].name).toEqual("80");
                expect(statGraph.nodes[6].type).toEqual(1);
                expect(statGraph.nodes[10].name).toEqual("86");
                expect(statGraph.nodes[10].type).toEqual(1);
                expect(statGraph.nodes[13].name).toEqual("83");
                expect(statGraph.nodes[13].type).toEqual(1);
                expect(statGraph.nodes[2].name).toEqual("79");
                expect(statGraph.nodes[2].id).toEqual(79);
                expect(statGraph.nodes[5].name).toEqual("expr");
                expect(statGraph.nodes[5].id).toEqual(-2);
                expect(statGraph.nodes[9].name).toEqual("expr");
                expect(statGraph.nodes[9].id).toEqual(-3);

                expect(statGraph.links).toHaveLength(15);
                expect(statGraph.links[1].source).toEqual(1);
                expect(statGraph.links[1].target).toEqual(2);
                expect(statGraph.links[1].type).toEqual(1);
                expect(statGraph.links[1].labels).toHaveLength(1);
                expect(statGraph.links[1].labels[0]).toStrictEqual({ content: "ε" });

                expect(statGraph.links[4].source).toEqual(3);
                expect(statGraph.links[4].target).toEqual(6);
                expect(statGraph.links[4].type).toEqual(3);
                expect(statGraph.links[4].labels).toHaveLength(1);
                expect(statGraph.links[4].labels[0]).toStrictEqual({ content: "ε" });

                expect(statGraph.links[12].source).toEqual(11);
                expect(statGraph.links[12].target).toEqual(13);
                expect(statGraph.links[12].type).toEqual(5);
                expect(statGraph.links[12].labels).toHaveLength(2);
                expect(statGraph.links[12].labels[0])
                    .toStrictEqual({ content: "Atom Transition", class: "heading" });
                expect(statGraph.links[12].labels[1]).toStrictEqual({ content: "';'" });
            }
        });

        it("Interpreter load w/o existing data, split grammar", async () => {
            const result = await backend.generate("test/backend/TParser.g4", {
                outputDir: "generated",
                language: "CSharp",
                loadOnly: true,
            });
            expect(result).toHaveLength(0);
            expect(!fs.existsSync("generated/"));

            const graph = backend.getATNGraph("test/backend/TParser.g4", "stat");
            expect(graph).toBeUndefined();
        });

        it("A generation run with settings, split grammar (typescript, cpp)", async () => {
            fs.mkdirSync("generated/typescript", { recursive: true });
            expect(fs.existsSync("generated/typescript")).toBeTruthy();

            // Path names are relative to the given base dir.
            let result = await backend.generate("test/backend/TParser.g4", {
                baseDir: process.cwd(),
                libDir: "generated/typescript",
                outputDir: "generated",
                language: "typescript",
                package: "parser",
                listeners: false,
                visitors: true,
            });
            expect(result).toEqual(["test/backend/TLexer.g4", "test/backend/TParser.g4"]);

            expect(fs.existsSync("generated/TLexer.ts")).toBeTruthy();
            expect(fs.existsSync("generated/TParser.ts")).toBeTruthy();
            expect(fs.existsSync("generated/TParserListener.ts")).toBeFalsy();
            expect(fs.existsSync("generated/TParserVisitor.ts")).toBeTruthy();

            backend.releaseGrammar("test/backend/TParser.g4");
            backend.releaseGrammar("test/backend/TLexer.g4");

            // The same grammar for the C++ target.
            fs.mkdirSync("generated/cpp", { recursive: true });
            expect(fs.existsSync("generated/cpp")).toBeTruthy();

            result = await backend.generate("test/backend/TParser.g4", {
                baseDir: process.cwd(),
                libDir: "generated/cpp",
                outputDir: "generated",
                language: "Cpp",
                package: "parser",
                listeners: true,
                visitors: false,
            });
            expect(result).toEqual(["test/backend/TLexer.g4", "test/backend/TParser.g4"]);

            expect(fs.existsSync("generated/TLexer.cpp")).toBeTruthy();
            expect(fs.existsSync("generated/TParser.cpp")).toBeTruthy();
            expect(fs.existsSync("generated/TParserBaseListener.cpp")).toBeTruthy();
            expect(fs.existsSync("generated/TParserListener.cpp")).toBeTruthy();
            expect(fs.existsSync("generated/TParserBaseVisitor.cpp")).toBeFalsy();
            expect(fs.existsSync("generated/TParserVisitor.cpp")).toBeFalsy();
        });

        it("Generation with semantic error, combined grammar (C++)", async () => {
            // File contains left recursive rule which are detected only by the ANTLR.
            // Hence we need a generation run to report them.
            const parserDiags = backend.getDiagnostics("test/backend/t2.g4");
            expect(parserDiags).toHaveLength(0); // No error here yet.

            await backend.generate("test/backend/t2.g4", {
                outputDir: "generated",
                language: "Cpp",
                package: "parser",
                listeners: false,
                visitors: true,
                alternativeJar: "antlr/antlr-4.9.2-complete.jar",
            });
            expect(parserDiags).toHaveLength(3);
        });

        it("Generation with Java exception, combined grammar (Java)", async () => {
            // Testing a grammar with an awful lot of (implicit) lexer tokens.
            // Crashes ANTLR and we need to report that separately.
            try {
                await backend.generate("test/backend/OddExpr.g4", {
                    outputDir: "generated",
                    language: "Java",
                    package: "parser",
                    listeners: false,
                    visitors: true,
                    alternativeJar: "antlr/antlr-4.9.2-complete.jar",
                });
            } catch (error) {
                expect(error).toContain("java.lang.UnsupportedOperationException: Serialized ATN data " +
                    "element 101246 element 11 out of range 0..65535");
            }
        });

        it("Generation with errors, split grammar (C++)", async () => {
            // Asking for parser generation, getting lexer error back.
            const result = await backend.generate("test/backend/TParser2.g4", {
                outputDir: "generated",
                language: "Cpp",
                package: "parser",
                listeners: false,
                visitors: false,
                alternativeJar: "antlr/antlr-4.9.2-complete.jar",
            });
            expect(result).toEqual(["test/backend/TLexer2.g4", "test/backend/TParser2.g4"]);
            const diagnostics = backend.getDiagnostics("test/backend/TLexer2.g4");
            expect(diagnostics).toHaveLength(1);
            expect(diagnostics[0].message).toEqual("cannot find tokens file test/backend/nonexisting.tokens");
        });
    });

    describe("Test for Bugs:", () => {
        it("Lexer token in a set-element context", () => {
            const info = backend.symbolInfoAtPosition("test/backend/TParser.g4", 30, 93, true);
            expect(info).toBeDefined();
            if (info) {
                expect(info.name).toEqual("Semicolon");
                expect(info.source).toEqual("test/backend/TLexer.g4");
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
            backend.releaseGrammar("test/backend/TParser.g4");
            const selfDiags = backend.getSelfDiagnostics();
            expect(selfDiags.contextCount).toEqual(0);
        });
    });

    // TODO: sentence generation is not ready yet.
    // Due to the nature of language definition by rules, we often generate invalid content.
    // This need investigation.
    describe("Sentence Generation:", () => {
        beforeAll(async () => {
            let result = await backend.generate("grammars/ANTLRv4Parser.g4", {
                outputDir: "generated",
                language: "CSharp",
                alternativeJar: "antlr/antlr-4.9.2-complete.jar",
            });

            for (const file of result) {
                const diagnostics = backend.getDiagnostics(file);
                if (diagnostics.length > 0) {
                    if (diagnostics[0].message.includes("no non-fragment rules")) {
                        diagnostics.shift();
                    } else {
                        console.log("Generation error: " + diagnostics[0].message);
                    }
                }
                expect(diagnostics).toHaveLength(0);
            }

            // The ANTLR4 grammar is a split grammar, so we have to explicitly load the other parts we need here.
            result = await backend.generate("grammars/ANTLRv4Lexer.g4", { outputDir: "generated", loadOnly: true });
            result = await backend.generate("grammars/ANTLRv4LexBasic.g4", { outputDir: "generated", loadOnly: true });
            result = await backend.generate("test/backend/sentences.g4", { outputDir: "generated", language: "Java" });
            for (const file of result) {
                const diagnostics = backend.getDiagnostics(file);
                if (diagnostics.length > 0) {
                    console.log("Generation error: " + diagnostics[0].message);
                }
                expect(diagnostics).toHaveLength(0);
            }
        });

        // Sentence generation is random for variable parts and it happens pretty frequently that generated
        // sentences are ambiguous. Hence we only test that such generated content can be parsed error free.
        it("Simple lexer sentence generation", () => {
            // A grammar made specifically for sentence generation.
            const tester = (sentence: string) => {
                //console.log(symbolicName + ": " + sentence);
                const [_tokens, error] = backend.lexTestInput("test/backend/sentences.g4", sentence);
                expect(error).toHaveLength(0);
            };

            const vocabulary = backend.getLexerVocabulary("test/backend/sentences.g4")!;
            for (let i = 1; i <= vocabulary.maxTokenType; ++i) {
                const symbolicName = vocabulary.getSymbolicName(i);
                backend.generateSentence("test/backend/sentences.g4", symbolicName!, {
                    maxLexerIterations: 15,
                    maxParserIterations: 15,
                }, tester);
            }
        });

        it("ANTLR4 lexer sentence generation", () => {
            const lexerTokens = [
                "DOC_COMMENT",
                "BLOCK_COMMENT",
                "LINE_COMMENT",
                "INT",
                "STRING_LITERAL",
                "OPTIONS",
                "CHANNELS",
                "RBRACE",
                "PLUS_ASSIGN",
                "ID",
            ];

            const tester = (token: string, sentence: string) => {
                //console.log(token + ": " + sentence);
                expect(sentence.length).toBeGreaterThan(0);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [_, error] = backend.lexTestInput("grammars/ANTLRv4Lexer.g4", sentence);
                expect(error).toHaveLength(0);

            };

            for (const token of lexerTokens) {
                backend.generateSentence("grammars/ANTLRv4Lexer.g4", token, {
                    count: 5,
                    maxLexerIterations: 10,
                    maxParserIterations: 10,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                }, tester.bind(this, token));
            }
        });

        it("Parser sentence generation", () => {
            const tester = (rule: string, sentence: string) => {
                //console.log(rule + ": " + sentence);
                const errors = backend.parseTestInput("test/backend/sentences.g4", sentence, rule);
                expect(errors).toHaveLength(0);

            };

            const rules = backend.getRuleList("test/backend/sentences.g4")!;
            for (const rule of rules) {
                backend.generateSentence("test/backend/sentences.g4", rule, {
                    count: 10,
                    minLexerIterations: 3,
                    maxLexerIterations: 5,
                    minParserIterations: 0,
                    maxParserIterations: 3,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                }, tester.bind(this, rule));
            }
        });

        it("Generation with definitions", () => {
            const ruleMappings: IRuleMappings = {
                /* eslint-disable @typescript-eslint/naming-convention */
                DIGITS: "12345",
                SimpleIdentifier: "Mike",
                UnicodeIdentifier: "µπåƒ",
                /* eslint-enable @typescript-eslint/naming-convention */
            };

            const tester = (rule: string, sentence: string) => {
                //console.log(rule + ": " + sentence);
                const errors = backend.parseTestInput("test/backend/sentences.g4", sentence, rule);
                expect(errors).toHaveLength(0);

                // In addition to error free generation check also that only known elements are in the sentence.
                sentence = sentence.replace(/12345/g, "");
                sentence = sentence.replace(/DEADBEEF/g, "");
                sentence = sentence.replace(/Mike/g, "");
                sentence = sentence.replace(/µπåƒ/g, "");
                sentence = sentence.replace(/red/g, "");
                sentence = sentence.replace(/green/g, "");
                sentence = sentence.replace(/blue/g, "");
                sentence = sentence.replace(/[0-9{},.:]/g, "");
                sentence = sentence.trim();
                //console.log(rule + ": " + sentence);
                expect(sentence).toHaveLength(0);
            };

            const rules = backend.getRuleList("test/backend/sentences.g4")!;
            for (const rule of rules) {
                backend.generateSentence("test/backend/sentences.g4", rule, {
                    count: 10,
                    maxLexerIterations: 7,
                    maxParserIterations: 7,
                    ruleMappings,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                }, tester.bind(this, rule));
            }
        });

        afterAll(() => {
            backend.releaseGrammar("test/backend/sentences.g4");
            backend.releaseGrammar("test/backend/CPP14.g4");
            fs.rmSync("generated", { recursive: true, force: true });
        });
    });

    describe("Formatting:", () => {
        it("With all options (except alignment)", () => {
            // Format a file with all kinds of syntactic elements. Start out with default
            // formatting options and change them in the file to test all variations.
            const [text] = backend.formatGrammar("test/backend/formatting/raw.g4", {}, 0, 1e10);

            //fs.writeFileSync("test/backend/formatting-results/raw2.g4", text, "utf8");
            const expected = fs.readFileSync("test/backend/formatting-results/raw.g4", { encoding: "utf8" });
            expect(expected).toEqual(text);
        });

        it("Alignment formatting", () => {
            //createAlignmentGrammar();

            // Load a large file with all possible alignment combinations (50 rules for each permutation),
            // checking so also the overall performance (9600 rules).
            const [text] = backend.formatGrammar("test/backend/formatting/alignment.g4", {}, 0, 1e10);

            //fs.writeFileSync("test/backend/formatting-results/alignment.g4", text, "utf8");
            const expected = fs.readFileSync("test/backend/formatting-results/alignment.g4", { encoding: "utf8" });
            expect(expected).toEqual(text);
        });

        it("Ranged formatting", () => {
            let [text, targetStart, targetStop] = backend.formatGrammar("test/backend/formatting/raw.g4", {}, -10, -20);
            expect(text).toHaveLength(0);
            expect(targetStart).toEqual(0);
            expect(targetStop).toEqual(4);

            const rangeTests = JSON.parse(fs.readFileSync("test/backend/formatting/ranges.json",
                { encoding: "utf8" })) as ITestRange[];
            const source = fs.readFileSync("test/backend/formatting/raw.g4", { encoding: "utf8" });
            for (let i = 1; i <= rangeTests.length; ++i) {
                const rangeTest = rangeTests[i - 1];

                // Range ends are non-inclusive.
                const startIndex = positionToIndex(source, rangeTest.source.start.column, rangeTest.source.start.row);
                const stopIndex = positionToIndex(source, rangeTest.source.end.column, rangeTest.source.end.row) - 1;
                [text, targetStart, targetStop] = backend.formatGrammar("test/backend/formatting/raw.g4", {},
                    startIndex, stopIndex);

                const [startColumn, startRow] = indexToPosition(source, targetStart);
                const [stopColumn, stopRow] = indexToPosition(source, targetStop + 1);
                const range = {
                    start: { column: startColumn, row: startRow }, end: { column: stopColumn, row: stopRow },
                };

                //fs.writeFileSync("test/backend/formatting-results/" + rangeTest.result, text, "utf8");
                const expected = fs.readFileSync("test/backend/formatting-results/" + rangeTest.result,
                    { encoding: "utf8" });
                expect(range).toStrictEqual(rangeTest.target);
                expect(expected).toEqual(text);
            }
        });
    });

    describe("Debugger:", () => {
        it("Run interpreter", async () => {
            await backend.generate("test/backend/CPP14.g4", {
                outputDir: "generated",
                language: "Java",
                alternativeJar: "antlr/antlr-4.9.2-complete.jar",
            });
            try {
                const code = fs.readFileSync("test/backend/code.cpp", { encoding: "utf8" });
                const d = backend.createDebugger("test/backend/CPP14.g4", "", "generated");
                expect(d).toBeDefined();
                if (d) {
                    d.start(0, code, false);
                    //const tree = d!.currentParseTree;
                    //console.log(util.inspect(tree, false, null, true));

                    // TODO: test step-in/out/over/ as well as breakpoints.
                }
            } finally {
                backend.releaseGrammar("test/backend/CPP14.g4");
                fs.rmSync("generated", { recursive: true, force: true });
            }
        });
    });
});
