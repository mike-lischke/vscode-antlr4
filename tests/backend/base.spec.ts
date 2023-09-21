/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { AntlrFacade } from "../../src/backend/facade.js";
import { SourceContext } from "../../src/backend/SourceContext.js";

describe("Base Handling", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.

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
        c1 = backend.loadGrammar("tests/backend/t.g4");
        expect(c1).toBeInstanceOf(SourceContext);
    });

    it("Unload grammar", () => {
        backend.releaseGrammar("tests/backend/t.g4");
        let context = backend.loadGrammar("tests/backend/t.g"); // Non-existing grammar.
        expect(context).toBeInstanceOf(SourceContext);
        expect(context).not.toEqual(c1);

        backend.releaseGrammar("tests/backend/t.g");
        c1 = backend.loadGrammar("tests/backend/t.g4");
        context = backend.loadGrammar("tests/backend/t.g4");
        expect(context).toEqual(c1);
        backend.releaseGrammar("tests/backend/t.g4");
    });
});
