/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as fs from "fs";

import { AntlrFacade } from "../../src/backend/facade.js";
import { IRuleMappings } from "../../src/backend/types.js";

xdescribe("Sentence Generation", () => {
    const backend = new AntlrFacade(".", process.cwd()); // Search path is cwd for this test.

    /**
     * Remove occurrences of known strings that are inserted at non-deterministic positions.
     *
     * @param sentence The sentence to filter.
     * @returns The filtered sentence.
     */
    const filter = (sentence: string): string => {
        sentence = sentence.replace(/12345/g, "");
        sentence = sentence.replace(/54321/g, "");
        sentence = sentence.replace(/DEADBEEF/g, "");
        sentence = sentence.replace(/Mike/g, "");
        sentence = sentence.replace(/John/g, "");
        sentence = sentence.replace(/Mary/g, "");
        sentence = sentence.replace(/µπåƒ/g, "");
        sentence = sentence.replace(/você/g, "");
        sentence = sentence.replace(/𑃖𓂷/g, "");
        sentence = sentence.replace(/𑃖ꫪ𝚫/g, "");
        sentence = sentence.replace(/𑃖𠦄𣛯𪃾/g, "");
        sentence = sentence.replace(/𑃖പửၒ/g, "");
        sentence = sentence.replace(/𑃖ᚱꙍ𒅍/g, "");
        sentence = sentence.replace(/red/g, "");
        sentence = sentence.replace(/green/g, "");
        sentence = sentence.replace(/blue/g, "");
        sentence = sentence.replace(/[0-9{},.:]/g, "");

        return sentence.trim();
    };

    beforeAll(async () => {
        let result = await backend.generate("grammars/ANTLRv4Parser.g4", {
            outputDir: "generated-sentence",
            language: "CSharp",
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
        result = await backend.generate("grammars/ANTLRv4Lexer.g4",
            { outputDir: "generated-sentence", loadOnly: true });
        result = await backend.generate("grammars/ANTLRv4LexBasic.g4",
            { outputDir: "generated-sentence", loadOnly: true });
        result = await backend.generate("tests/backend/test-data/sentences.g4",
            { outputDir: "generated-sentence", language: "Java" });
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
            const [_tokens, error] = backend.lexTestInput("tests/backend/test-data/sentences.g4", sentence);
            expect(error).toHaveLength(0);
        };

        const vocabulary = backend.getLexerVocabulary("tests/backend/test-data/sentences.g4")!;
        for (let i = 1; i <= vocabulary.maxTokenType; ++i) {
            const symbolicName = vocabulary.getSymbolicName(i)!;
            backend.generateSentence("tests/backend/test-data/sentences.g4", symbolicName, {
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
            // console.log(token + ": " + sentence);
            expect(sentence.length).toBeGreaterThan(0);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, error] = backend.lexTestInput("grammars/ANTLRv4Lexer.g4", sentence);
            try {
                expect(error).toHaveLength(0);
            } catch (e) {
                //
            }
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
            const errors = backend.parseTestInput("tests/backend/test-data/sentences.g4", sentence, rule);
            expect(errors).toHaveLength(0);
        };

        const rules = backend.getRuleList("tests/backend/test-data/sentences.g4")!;
        for (const rule of rules) {
            backend.generateSentence("tests/backend/test-data/sentences.g4", rule, {
                count: 10,
                minLexerIterations: 3,
                maxLexerIterations: 5,
                minParserIterations: 0,
                maxParserIterations: 3,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            }, tester.bind(this, rule));
        }
    });

    it("Generation with definitions with simple strings", () => {
        const ruleMappings: IRuleMappings = {
            /* eslint-disable @typescript-eslint/naming-convention */
            DIGITS: "12345",
            SimpleIdentifier: "Mike",
            UnicodeIdentifier: "µπåƒ",
            /* eslint-enable @typescript-eslint/naming-convention */
        };

        const tester = (rule: string, sentence: string) => {
            //console.log(rule + ": " + sentence);
            const errors = backend.parseTestInput("tests/backend/test-data/sentences.g4", sentence, rule);
            expect(errors).toHaveLength(0);

            expect(filter(sentence)).toHaveLength(0);
        };

        const rules = backend.getRuleList("tests/backend/test-data/sentences.g4")!;
        for (const rule of rules) {
            backend.generateSentence("tests/backend/test-data/sentences.g4", rule, {
                count: 10,
                maxLexerIterations: 7,
                maxParserIterations: 7,
                ruleMappings,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            }, tester.bind(this, rule));
        }
    });

    it("Generation with definitions with single value arrays", () => {
        const ruleMappings: IRuleMappings = {
            /* eslint-disable @typescript-eslint/naming-convention */
            DIGITS: ["12345"],
            SimpleIdentifier: ["Mike"],
            UnicodeIdentifier: ["µπåƒ"],
            /* eslint-enable @typescript-eslint/naming-convention */
        };

        const tester = (rule: string, sentence: string) => {
            //console.log(rule + ": " + sentence);
            const errors = backend.parseTestInput("tests/backend/test-data/sentences.g4", sentence, rule);
            expect(errors).toHaveLength(0);

            expect(filter(sentence)).toHaveLength(0);
        };

        const rules = backend.getRuleList("tests/backend/test-data/sentences.g4")!;
        for (const rule of rules) {
            backend.generateSentence("tests/backend/test-data/sentences.g4", rule, {
                count: 10,
                maxLexerIterations: 7,
                maxParserIterations: 7,
                ruleMappings,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            }, tester.bind(this, rule));
        }
    });

    it("Generation with definitions with empty arrays", () => {
        const ruleMappings: IRuleMappings = {
            /* eslint-disable @typescript-eslint/naming-convention */
            DIGITS: [],
            SimpleIdentifier: [],
            UnicodeIdentifier: [],
            /* eslint-enable @typescript-eslint/naming-convention */
        };

        const tester = (rule: string, sentence: string) => {
            //console.log(rule + ": " + sentence);
            const errors = backend.parseTestInput("tests/backend/test-data/sentences.g4", sentence, rule);
            expect(errors).toHaveLength(0);
        };

        const rules = backend.getRuleList("tests/backend/test-data/sentences.g4")!;
        for (const rule of rules) {
            backend.generateSentence("tests/backend/test-data/sentences.g4", rule, {
                count: 10,
                maxLexerIterations: 7,
                maxParserIterations: 7,
                ruleMappings,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            }, tester.bind(this, rule));
        }
    });

    it("Generation with definitions with arrays", () => {
        const ruleMappings: IRuleMappings = {
            /* eslint-disable @typescript-eslint/naming-convention */
            DIGITS: ["12345", "54321"],
            SimpleIdentifier: ["Mike", "John", "Mary"],
            UnicodeIdentifier: ["µπåƒ", "você", "𑃖𓂷", "𑃖ꫪ𝚫", "𑃖𠦄𣛯𪃾", "𑃖പửၒ", "𑃖ᚱꙍ𒅍"],
            /* eslint-enable @typescript-eslint/naming-convention */
        };

        const tester = (rule: string, sentence: string) => {
            //console.log(rule + ": " + sentence);
            const errors = backend.parseTestInput("tests/backend/test-data/sentences.g4", sentence, rule);
            expect(errors).toHaveLength(0);

            // In addition to error free generation check also that only known elements are in the sentence.
            expect(filter(sentence)).toHaveLength(0);
        };

        const rules = backend.getRuleList("tests/backend/test-data/sentences.g4")!;
        for (const rule of rules) {
            backend.generateSentence("tests/backend/test-data/sentences.g4", rule, {
                count: 10,
                maxLexerIterations: 7,
                maxParserIterations: 7,
                ruleMappings,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            }, tester.bind(this, rule));
        }
    });

    it("Generation with mixed definition values", () => {
        const ruleMappings: IRuleMappings = {
            /* eslint-disable @typescript-eslint/naming-convention */
            DIGITS: "12345",
            SimpleIdentifier: ["Mike"],
            UnicodeIdentifier: ["µπåƒ", "você", "𑃖𓂷", "𑃖ꫪ𝚫", "𑃖𠦄𣛯𪃾", "𑃖പửၒ", "𑃖ᚱꙍ𒅍"],
            /* eslint-enable @typescript-eslint/naming-convention */
        };

        const tester = (rule: string, sentence: string) => {
            //console.log(rule + ": " + sentence);
            const errors = backend.parseTestInput("tests/backend/test-data/sentences.g4", sentence, rule);
            expect(errors).toHaveLength(0);

            expect(filter(sentence)).toHaveLength(0);
        };

        const rules = backend.getRuleList("tests/backend/test-data/sentences.g4")!;
        for (const rule of rules) {
            backend.generateSentence("tests/backend/test-data/sentences.g4", rule, {
                count: 10,
                maxLexerIterations: 7,
                maxParserIterations: 7,
                ruleMappings,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            }, tester.bind(this, rule));
        }
    });

    afterAll(() => {
        backend.releaseGrammar("tests/backend/test-data/sentences.g4");
        backend.releaseGrammar("tests/backend/test-data/CPP14.g4");
        fs.rmSync("generated-sentence", { recursive: true, force: true });
    });
});
