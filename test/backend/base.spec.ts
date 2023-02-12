/*
 * This file is released under the MIT license.
 * Copyright (c) 2023, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { AntlrFacade } from "../../src/backend/facade";
import { SourceContext } from "../../src/backend/SourceContext";

describe("Base Handling", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.
    jest.setTimeout(30000);

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
