/*
 * The MIT License (MIT)
 * http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2014 Bart Kiers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
*/

/*
 * Translated to TS and modified by Mike Lischke.
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { TerminalNode } from "antlr4ng";

import { ANTLRv4ParserVisitor } from "../parser/ANTLRv4ParserVisitor.js";
import { ANTLRv4Lexer } from "../parser/ANTLRv4Lexer.js";
import {
    ParserRuleSpecContext, RuleAltListContext, LexerRuleSpecContext, LexerAltListContext, LexerAltContext,
    LexerElementsContext, LexerElementContext, LabeledLexerElementContext, AltListContext, AlternativeContext,
    ElementContext, LabeledElementContext, EbnfContext, EbnfSuffixContext, LexerAtomContext, AtomContext,
    NotSetContext, BlockSetContext, CharacterRangeContext, TerminalRuleContext, SetElementContext,

    RuleBlockContext, LexerRuleBlockContext, ElementOptionsContext,
} from "../parser/ANTLRv4Parser.js";

export class RuleVisitor extends ANTLRv4ParserVisitor<string> {

    public constructor(private scripts: Map<string, string>) {
        super();
    }

    public defaultResult(): string {
        return "";
    }

    public override visitParserRuleSpec = (ctx: ParserRuleSpecContext): string => {
        if (!ctx.getRuleContext(0, RuleBlockContext)) {
            return "# Syntax Error #";
        }

        const diagram = "ComplexDiagram(" + this.visitRuleAltList(ctx.ruleBlock().ruleAltList()) + ").addTo()";
        this.scripts.set(ctx.RULE_REF()!.getText(), diagram);

        return diagram;
    };

    public override visitRuleAltList = (ctx: RuleAltListContext): string => {
        let script = "Choice(0";
        const alternatives = ctx.labeledAlt();
        for (const alternative of alternatives) {
            script += ", " + this.visitAlternative(alternative.alternative());
        }

        return script + ")";
    };

    public override visitLexerRuleSpec = (ctx: LexerRuleSpecContext): string => {
        if (!ctx.getRuleContext(0, LexerRuleBlockContext)) {
            return "# Syntax Error #";
        }

        const diagram = "Diagram(" + this.visitLexerAltList(ctx.lexerRuleBlock()!.lexerAltList()) + ").addTo()";

        this.scripts.set(ctx.TOKEN_REF()!.getText(), diagram);

        return diagram;
    };

    public override visitLexerAltList = (ctx: LexerAltListContext): string => {
        let script = "Choice(0";

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

        for (const element of ctx.lexerElement()) {
            if (script.length > 0) {
                script += ", ";
            }
            script += this.visitLexerElement(element);
        }

        return "Sequence(" + script + ")";
    };

    public override visitLexerElement = (ctx: LexerElementContext): string => {
        const hasEbnfSuffix = (ctx.ebnfSuffix() !== null);

        if (ctx.labeledLexerElement()) {
            if (hasEbnfSuffix) {
                return this.visitEbnfSuffix(ctx.ebnfSuffix()!) + "(" +
                    this.visitLabeledLexerElement(ctx.labeledLexerElement()!) + ")";
            } else {
                return this.visitLabeledLexerElement(ctx.labeledLexerElement()!);
            }
        } else if (ctx.lexerAtom()) {
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
            return "Comment('" + ctx.actionBlock()!.getText() + "?')";
        } else {
            return "Comment('{ action code }')";
        }
    };

    public override visitLabeledLexerElement = (ctx: LabeledLexerElementContext): string => {
        if (ctx.lexerAtom()) {
            return this.visitLexerAtom(ctx.lexerAtom()!);
        } else if (ctx.block()) {
            return this.visitAltList(ctx.block()!.altList());
        }

        return "";
    };

    public override visitAltList = (ctx: AltListContext): string => {
        let script = "Choice(0";
        for (const alternative of ctx.alternative()) {
            script += ", " + this.visitAlternative(alternative);
        }

        return script + ")";
    };

    public override visitAlternative = (ctx: AlternativeContext): string => {
        let script = "";

        const optionsContext = ctx.elementOptions();
        if (optionsContext) {
            script += this.visitElementOptions(optionsContext);
        }

        for (const element of ctx.element()) {
            if (script.length > 0) {
                script += ", ";
            }
            script += this.visitElement(element);
        }

        return "Sequence(" + script + ")";
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
            return "Comment('" + ctx.actionBlock()!.getText() + "?')";
        } else {
            return "Comment('{ action code }')";
        }
    };

    public override visitElementOptions = (ctx: ElementOptionsContext): string => {
        return "Comment('" + ctx.getText() + "')";
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

        if (text === "?") {
            return "Optional";
        } else if (text === "*") {
            return "ZeroOrMore";
        } else {
            return "OneOrMore";
        }
    };

    public override visitLexerAtom = (ctx: LexerAtomContext): string => {
        if (ctx.characterRange()) {
            return this.visitCharacterRange(ctx.characterRange()!);
        } else if (ctx.terminalRule()) {
            return this.visitTerminalRule(ctx.terminalRule()!);
        } else if (ctx.notSet()) {
            return this.visitNotSet(ctx.notSet()!);
        } else if (ctx.LEXER_CHAR_SET()) {
            return this.visitTerminal(ctx.LEXER_CHAR_SET()!);
        }

        const options = ctx.elementOptions();
        if (options) {
            const text = this.visitElementOptions(options);
            if (text !== "") {
                return "Sequence(Terminal('any char'), Comment(" + text + ")";
            }
        }

        return "Terminal('any char')";
    };

    public override visitAtom = (ctx: AtomContext): string => {
        if (ctx.characterRange()) {
            return this.visitCharacterRange(ctx.characterRange()!);
        } else if (ctx.terminalRule()) {
            return this.visitTerminalRule(ctx.terminalRule()!);
        } else if (ctx.ruleref()) {
            return this.visitTerminal(ctx.ruleref()!.RULE_REF()!);
        } else if (ctx.notSet()) {
            return this.visitNotSet(ctx.notSet()!);
        }

        const options = ctx.elementOptions();
        if (options) {
            const text = this.visitElementOptions(options);
            if (text !== "") {
                return "Sequence(NonTerminal('any token'), Comment(" + text + ")";
            }
        }

        return "NonTerminal('any token')";
    };

    public override visitNotSet = (ctx: NotSetContext): string => {
        if (ctx.setElement() != null) {
            return "Sequence(Comment('not'), " + this.visitSetElement(ctx.setElement()!) + ")";
        } else {
            return "Sequence(Comment('not'), " + this.visitBlockSet(ctx.blockSet()!) + ")";
        }
    };

    public override visitBlockSet = (ctx: BlockSetContext): string => {
        let script = "Choice(0";
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
            return this.escapeTerminal(ctx.STRING_LITERAL(0)!) + " .. " + this.escapeTerminal(ctx.STRING_LITERAL(1)!);
        }

        return this.escapeTerminal(ctx.STRING_LITERAL(0)!) + " .. ?";
    };

    public override visitTerminalRule = (ctx: TerminalRuleContext): string => {
        if (ctx.TOKEN_REF()) {
            return this.visitTerminal(ctx.TOKEN_REF()!);
        } else {
            return this.visitTerminal(ctx.STRING_LITERAL()!);
        }
    };

    public override visitTerminal = (node: TerminalNode): string => {
        switch (node.symbol.type) {
            case ANTLRv4Lexer.STRING_LITERAL:
            case ANTLRv4Lexer.LEXER_CHAR_SET:
                return "Terminal('" + this.escapeTerminal(node) + "')";

            case ANTLRv4Lexer.TOKEN_REF:
                return "Terminal('" + node.getText() + "')";

            default:
                return "NonTerminal('" + node.getText() + "')";
        }
    };

    private escapeTerminal(node: TerminalNode): string {
        const text = node.getText();
        const escaped = text.replace(/\\/g, "\\\\");

        switch (node.symbol.type) {
            case ANTLRv4Lexer.STRING_LITERAL:
                return "\\'" + escaped.substring(1, escaped.length - 1).replace(/'/g, "\\'") + "\\'";
            default:
                return escaped.replace(/'/g, "\\'");
        }
    }
}
