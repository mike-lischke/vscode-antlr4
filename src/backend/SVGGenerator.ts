/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

// Parts written by Bart Kiers, licensed under the MIT license, (c) 2014.

import { ParseTree, TerminalNode } from "antlr4ng";

import { ANTLRv4ParserVisitor } from "../parser/ANTLRv4ParserVisitor.js";
import { ANTLRv4Lexer } from "../parser/ANTLRv4Lexer.js";
import {
    ParserRuleSpecContext, RuleAltListContext, LexerRuleSpecContext, LexerAltListContext, LexerAltContext,
    LexerElementsContext, LexerElementContext, AltListContext, AlternativeContext,
    ElementContext, LabeledElementContext, EbnfContext, EbnfSuffixContext, LexerAtomContext, AtomContext,
    NotSetContext, BlockSetContext, CharacterRangeContext, TerminalDefContext, SetElementContext,
    ElementOptionsContext,
} from "../parser/ANTLRv4Parser.js";

/**
 * A class to generate JS code which can be used with the railroad-diagrams library to generate SVG diagrams.
 */
export class SVGGenerator extends ANTLRv4ParserVisitor<string> {

    // A tracker of the element's character count which was last added.
    // This is used to decide when to wrap a sequence into a new line.
    #nestedCharLength: number;

    // Keeps track whether there was a wrap in the last visit.
    #isWrapped = false;

    #requestedRuleName = "";
    #stripPattern: RegExp;
    #wrapAfter: number;
    #done = false;

    /**
     * @returns True if the last visit caused a wrap.
     */
    public get isWrapped(): boolean {
        return this.#isWrapped;
    }

    /**
     * Generates the code for the given parse tree, for a given rule.
     *
     * @param tree The parse tree to generate code for.
     * @param name The name of a rule to generate code for.
     * @param strip A string to strip from the rule name before using it in the generated code.
     * @param wrapAfter The number of characters after sequences are wrapped (if > 0).
     *
     * @returns The generated JavaScript code and a flag telling whether one of the rules had to be wrapped.
     */
    public generate(tree: ParseTree, name: string, strip: RegExp, wrapAfter: number): [string, boolean] {
        this.#requestedRuleName = name;
        this.#done = false;
        this.#isWrapped = false;
        this.#stripPattern = strip;
        this.#wrapAfter = wrapAfter;

        const code = this.visit(tree)!;

        return [code, this.#isWrapped];
    }

    public override visitParserRuleSpec = (ctx: ParserRuleSpecContext): string => {
        this.#nestedCharLength = 0;
        const ruleName = ctx.RULE_REF()!.getText();
        if (ruleName === this.#requestedRuleName) {
            this.#done = true;

            return `new ComplexDiagram(${this.visitRuleAltList(ctx.ruleBlock().ruleAltList())})`;
        }

        return "";
    };

    public override visitRuleAltList = (ctx: RuleAltListContext): string => {
        let script = "new Choice(0";
        let maxChildCharLength = 0;

        const alternatives = ctx.labeledAlt();
        for (const alternative of alternatives) {
            script += ", " + this.visitAlternative(alternative.alternative());
            if (this.#nestedCharLength > maxChildCharLength) {
                maxChildCharLength = this.#nestedCharLength;
            }
        }

        this.#nestedCharLength = maxChildCharLength;

        return script + ")";
    };

    public override visitLexerRuleSpec = (ctx: LexerRuleSpecContext): string => {
        const ruleName = ctx.TOKEN_REF()!.getText();
        if (ruleName === this.#requestedRuleName) {
            this.#done = true;

            return "new Diagram(" + this.visitLexerAltList(ctx.lexerRuleBlock()!.lexerAltList()) + ")";
        }

        return "";
    };

    public override visitLexerAltList = (ctx: LexerAltListContext): string => {
        let script = "new Choice(0";

        for (const alternative of ctx.lexerAlt()) {
            script += ", " + this.visitLexerAlt(alternative);
        }

        return script + ")";
    };

    public override visitLexerAlt = (ctx: LexerAltContext): string => {
        if (ctx.lexerElements()) {
            return this.visitLexerElements(ctx.lexerElements()!);
        }

        return "";
    };

    public override visitLexerElements = (ctx: LexerElementsContext): string => {
        let script = "";

        let currentLength = 0;
        for (const element of ctx.lexerElement()) {
            if (script.length > 0) {
                if (currentLength > 4) {
                    script += "), new Sequence(";
                    currentLength = 0;
                } else {
                    script += ", ";
                }
            }
            script += this.visitLexerElement(element);
        }

        if (script.length === 0) {
            script = "new Comment('<empty alt>', { cls: 'rrd-warning' })";
        }

        return "new Stack(new Sequence(" + script + "))";
    };

    public override visitLexerElement = (ctx: LexerElementContext): string => {
        const hasEbnfSuffix = (ctx.ebnfSuffix() !== null);

        if (ctx.lexerAtom()) {
            if (hasEbnfSuffix) {
                return this.visitEbnfSuffix(ctx.ebnfSuffix()!) + "(" + this.visitLexerAtom(ctx.lexerAtom()!) + ")";
            } else {
                return this.visitLexerAtom(ctx.lexerAtom()!);
            }
        } else if (ctx.lexerBlock()) {
            if (hasEbnfSuffix) {
                return this.visitEbnfSuffix(ctx.ebnfSuffix()!) + "(" +
                    this.visitLexerAltList(ctx.lexerBlock()!.lexerAltList()) + ")";
            } else {
                return this.visitLexerAltList(ctx.lexerBlock()!.lexerAltList());
            }
        } else if (ctx.QUESTION()) {
            return "new Comment('" + ctx.actionBlock()!.getText() + "?', { cls: 'rrd-predicate' })";
        } else {
            return "new Comment('{ action code }')";
        }
    };

    public override visitAltList = (ctx: AltListContext): string => {
        let script = "new Choice(0";
        let maxChildCharLength = 0;
        for (const alternative of ctx.alternative()) {
            script += ", " + this.visitAlternative(alternative);
            if (this.#nestedCharLength > maxChildCharLength) {
                maxChildCharLength = this.#nestedCharLength;
            }
        }
        this.#nestedCharLength = maxChildCharLength;

        return script + ")";
    };

    public override visitAlternative = (ctx: AlternativeContext): string => {
        let script = "";

        const optionsContext = ctx.elementOptions();
        if (optionsContext) {
            script += this.visitElementOptions(optionsContext);
        }

        const wrapAfter = this.#wrapAfter || 1e6;

        let currentCharLength = 0;
        let maxChildCharLength = 0;
        for (const element of ctx.element()) {
            const subScript = this.visitElement(element);
            if (currentCharLength > maxChildCharLength) {
                maxChildCharLength = currentCharLength;
            }
            currentCharLength += this.#nestedCharLength;

            if (script.length > 0) {
                if (currentCharLength > wrapAfter) {
                    this.#isWrapped = true;
                    script += "), new Sequence(";
                    currentCharLength = this.#nestedCharLength;
                } else {
                    script += ", ";
                }
            }

            script += subScript;
        }

        this.#nestedCharLength = Math.max(maxChildCharLength, currentCharLength);

        if (script.length === 0) {
            script = "new Comment('<empty alt>', { cls: 'rrd-warning' })";
        }

        return "new Stack(new Sequence(" + script + "))";
    };

    public override visitElement = (ctx: ElementContext): string => {
        const hasEbnfSuffix = (ctx.ebnfSuffix() !== null);

        if (ctx.labeledElement()) {
            if (hasEbnfSuffix) {
                return this.visitEbnfSuffix(ctx.ebnfSuffix()!) + "(" +
                    this.visitLabeledElement(ctx.labeledElement()!) + ")";
            } else {
                return this.visitLabeledElement(ctx.labeledElement()!);
            }
        } else if (ctx.atom()) {
            if (hasEbnfSuffix) {
                return this.visitEbnfSuffix(ctx.ebnfSuffix()!) + "(" + this.visitAtom(ctx.atom()!) + ")";
            } else {
                return this.visitAtom(ctx.atom()!);
            }
        } else if (ctx.ebnf()) {
            return this.visitEbnf(ctx.ebnf()!);
        } else if (ctx.QUESTION()) {
            return "new Comment('" + ctx.actionBlock()!.getText() + "?', { cls: 'rrd-predicate' })";
        } else {
            return "new Comment('{ action code }')";
        }
    };

    public override visitElementOptions = (ctx: ElementOptionsContext): string => {
        return "new Comment('" + ctx.getText() + "')";
    };

    public override visitLabeledElement = (ctx: LabeledElementContext): string => {
        if (ctx.atom()) {
            return this.visitAtom(ctx.atom()!);
        } else {
            return this.visitAltList(ctx.block()!.altList());
        }
    };

    public override visitEbnf = (ctx: EbnfContext): string => {
        if (!ctx.block()) {
            return "# Syntax Error #";
        }

        if (ctx.blockSuffix()) {
            return this.visitEbnfSuffix(ctx.blockSuffix()!.ebnfSuffix()) + "(" +
                this.visitAltList(ctx.block()!.altList()) + ")";
        } else {
            return this.visitAltList(ctx.block()!.altList());
        }
    };

    public override visitEbnfSuffix = (ctx: EbnfSuffixContext): string => {
        const text = ctx.getText();

        let result = "new ";
        if (text === "?") {
            result += "Optional";
        } else if (text === "*") {
            result += "ZeroOrMore";
        } else {
            result += "OneOrMore";
        }

        return result;
    };

    public override visitLexerAtom = (ctx: LexerAtomContext): string => {
        if (ctx.characterRange()) {
            return this.visitCharacterRange(ctx.characterRange()!);
        } else if (ctx.terminalDef()) {
            return this.visitTerminalDef(ctx.terminalDef()!);
        } else if (ctx.notSet()) {
            return this.visitNotSet(ctx.notSet()!);
        } else if (ctx.LEXER_CHAR_SET()) {
            return this.visitTerminal(ctx.LEXER_CHAR_SET()!);
        }

        const options = ctx.elementOptions();
        if (options) {
            const text = this.visitElementOptions(options);
            if (text !== "") {
                return "new Sequence(new Terminal('any char'), new Comment(" + text + "))";
            }
        }

        return "new Terminal('any char')";
    };

    public override visitAtom = (ctx: AtomContext): string => {
        if (ctx.terminalDef()) {
            return this.visitTerminalDef(ctx.terminalDef()!);
        } else if (ctx.ruleref()) {
            return this.visitTerminal(ctx.ruleref()!.RULE_REF()!);
        } else if (ctx.notSet()) {
            return this.visitNotSet(ctx.notSet()!);
        }

        const options = ctx.elementOptions();
        if (options) {
            const text = this.visitElementOptions(options);
            if (text !== "") {
                return "new Sequence(new NonTerminal('any token'), new Comment(" + text + "))";
            }
        }

        return "new NonTerminal('any token')";
    };

    public override visitNotSet = (ctx: NotSetContext): string => {
        if (ctx.setElement() != null) {
            return "new Sequence(new Comment('not'), " + this.visitSetElement(ctx.setElement()!) + ")";
        } else {
            return "new Sequence(new Comment('not'), " + this.visitBlockSet(ctx.blockSet()!) + ")";
        }
    };

    public override visitBlockSet = (ctx: BlockSetContext): string => {
        let script = "new Choice(0";
        for (const element of ctx.setElement()) {
            script += ", " + this.visitSetElement(element);
        }

        return script + ")";
    };

    public override visitSetElement = (ctx: SetElementContext): string => {
        if (ctx.characterRange()) {
            return this.visitCharacterRange(ctx.characterRange()!);
        } else if (ctx.TOKEN_REF()) {
            return this.visitTerminal(ctx.TOKEN_REF()!);
        } else if (ctx.STRING_LITERAL()) {
            return this.visitTerminal(ctx.STRING_LITERAL()!);
        }

        return this.visitTerminal(ctx.LEXER_CHAR_SET()!);
    };

    public override visitCharacterRange = (ctx: CharacterRangeContext): string => {
        // The second literal can be non-existing (e.g. if not properly quoted).
        if (ctx.STRING_LITERAL().length > 1) {
            return "\"" + this.escapeTerminal(ctx.STRING_LITERAL(0)!) + " .. " +
                this.escapeTerminal(ctx.STRING_LITERAL(1)!) + "\"";
        }

        return this.escapeTerminal(ctx.STRING_LITERAL(0)!) + " .. ?";
    };

    public override visitTerminalDef = (ctx: TerminalDefContext): string => {
        if (ctx.TOKEN_REF()) {
            return this.visitTerminal(ctx.TOKEN_REF()!);
        } else {
            return this.visitTerminal(ctx.STRING_LITERAL()!);
        }
    };

    public override visitTerminal = (node: TerminalNode): string => {
        switch (node.symbol.type) {
            case ANTLRv4Lexer.STRING_LITERAL:
            case ANTLRv4Lexer.LEXER_CHAR_SET: {
                const content = this.escapeTerminal(node).replace(this.#stripPattern, "");
                this.#nestedCharLength = content.length;

                return `new Terminal('${content}')`;
            }

            case ANTLRv4Lexer.TOKEN_REF: {
                const content = node.getText().replace(this.#stripPattern, "");
                this.#nestedCharLength = content.length;

                return `new Terminal('${content}')`;
            }

            default: {
                const content = node.getText().replace(this.#stripPattern, "");
                this.#nestedCharLength = content.length;

                return `new NonTerminal('${content}')`;
            }
        }
    };

    protected override shouldVisitNextChild(_node: ParseTree, _currentResult: string): boolean {
        return !this.#done;
    }

    private escapeTerminal(node: TerminalNode): string {
        // Escape the backslashes.
        let text = node.getText().replace(/\\/g, "\\\\");

        // Escape the quotes.
        text = text.replace(/'/g, "\\'");

        return text;
    }

}
