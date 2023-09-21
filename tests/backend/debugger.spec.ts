/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as fs from "fs";

import { AntlrFacade } from "../../src/backend/facade.js";

xdescribe("Debugger", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.

    it("Run interpreter", async () => {
        await backend.generate("tests/backend/test-data/CPP14.g4", {
            outputDir: "generated-debugger",
            language: "Java",
        });
        try {
            const code = fs.readFileSync("tests/backend/test-data/code.cpp", { encoding: "utf8" });
            const d = backend.createDebugger("tests/backend/test-data/CPP14.g4", "", "generated");
            expect(d).toBeDefined();

            if (d) {
                d.start(0, code, false);
                //const tree = d!.currentParseTree;
                //console.log(util.inspect(tree, false, null, true));

                // TODO: test step-in/out/over/ as well as breakpoints.
            }
        } finally {
            backend.releaseGrammar("tests/backend/test-data/CPP14.g4");
            fs.rmSync("generated-debugger", { recursive: true, force: true });
        }
    });
});
