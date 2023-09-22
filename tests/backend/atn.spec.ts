/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as fs from "fs";
import * as path from "path";

import { AntlrFacade } from "../../src/backend/facade.js";

describe("ATN Tests", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.

    it("ATN Rule Graph, split grammar", async () => {
        // Need code generation here. Details will be tested later. The ATN retrieval will fail
        // anyway when generation fails.
        const files = await backend.generate("grammars/ANTLRv4Parser.g4", {
            outputDir: "generated-atn",
            language: "TypeScript",
            alternativeJar: path.join(process.cwd(), "node_modules/antlr4ng-cli/antlr4-4.13.2-SNAPSHOT-complete.jar"),
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
            fs.rmSync("generated-atn", { recursive: true, force: true });
            backend.releaseGrammar("grammars/ANTLRv4Parser.g4");
        }
    });
});
