/*
 * This file is released under the MIT license.
 * Copyright (c) 2023, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as fs from "fs";

import { AntlrFacade } from "../../src/backend/facade";

describe("Debugger", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.
    jest.setTimeout(30000);

    it("Run interpreter", async () => {
        await backend.generate("test/backend/test-data/CPP14.g4", {
            outputDir: "generated-debugger",
            language: "Java",
            alternativeJar: "antlr/antlr-4.9.2-complete.jar",
        });
        try {
            const code = fs.readFileSync("test/backend/test-data/code.cpp", { encoding: "utf8" });
            const d = backend.createDebugger("test/backend/test-data/CPP14.g4", "", "generated");
            expect(d).toBeDefined();
            if (d) {
                d.start(0, code, false);
                //const tree = d!.currentParseTree;
                //console.log(util.inspect(tree, false, null, true));

                // TODO: test step-in/out/over/ as well as breakpoints.
            }
        } finally {
            backend.releaseGrammar("test/backend/test-data/CPP14.g4");
            fs.rmSync("generated-debugger", { recursive: true, force: true });
        }
    });
});
