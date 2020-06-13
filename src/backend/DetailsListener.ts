/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { ANTLRv4ParserListener } from "../parser/ANTLRv4ParserListener";
import {
    LexerRuleSpecContext, ParserRuleSpecContext, TokensSpecContext, ChannelsSpecContext,
    ModeSpecContext, DelegateGrammarContext, OptionContext, TerminalRuleContext, RulerefContext,
    OptionValueContext, BlockContext, AlternativeContext, RuleBlockContext, EbnfSuffixContext,
    OptionsSpecContext, ActionBlockContext, ArgActionBlockContext, LabeledElementContext,
    LexerRuleBlockContext, LexerAltContext, ElementContext, LexerElementContext,
} from "../parser/ANTLRv4Parser";

import {
    ContextSymbolTable, FragmentTokenSymbol, TokenSymbol, TokenReferenceSymbol, RuleSymbol, RuleReferenceSymbol,
    VirtualTokenSymbol, TokenChannelSymbol, LexerModeSymbol, ImportSymbol,
    AlternativeSymbol, EbnfSuffixSymbol, OptionsSymbol, ActionSymbol, ArgumentSymbol, OperatorSymbol, OptionSymbol,
    PredicateMarkerSymbol,
} from "./ContextSymbolTable";

import { SourceContext } from "./SourceContext";

import { ScopedSymbol, LiteralSymbol, BlockSymbol, Symbol, VariableSymbol } from "antlr4-c3";

export class DetailsListener implements ANTLRv4ParserListener {
    private currentSymbol: Symbol | undefined;

    public constructor(private symbolTable: ContextSymbolTable, private imports: string[]) { }

    public enterLexerRuleSpec(ctx: LexerRuleSpecContext): void {
        const tokenRef = ctx.TOKEN_REF();
        if (tokenRef) {
            if (ctx.FRAGMENT()) {
                this.currentSymbol = this.symbolTable.addNewSymbolOfType(FragmentTokenSymbol, undefined, tokenRef.text);
                this.currentSymbol.context = ctx;
            } else {
                this.currentSymbol = this.symbolTable.addNewSymbolOfType(TokenSymbol, undefined, tokenRef.text);
                this.currentSymbol.context = ctx;
            }
        }
    }

    public enterParserRuleSpec(ctx: ParserRuleSpecContext): void {
        this.currentSymbol = this.symbolTable.addNewSymbolOfType(RuleSymbol, undefined, ctx.RULE_REF().text);
        this.currentSymbol.context = ctx;
    }

    public exitParserRuleSpec(ctx: ParserRuleSpecContext): void {
        const symbol = this.symbolTable.addNewSymbolOfType(TokenSymbol, this.currentSymbol as ScopedSymbol, ";");
        try {
            symbol.context = ctx.SEMI();
        } catch (e) {
            // ignore
        }

        if (this.currentSymbol) {
            this.currentSymbol = this.currentSymbol.parent as ScopedSymbol;
        }
    }

    public enterRuleBlock(ctx: RuleBlockContext): void {
        this.currentSymbol = this.symbolTable.addNewSymbolOfType(BlockSymbol, this.currentSymbol as ScopedSymbol, "");
    }

    public exitRuleBlock(ctx: RuleBlockContext): void {
        if (this.currentSymbol) {
            this.currentSymbol = this.currentSymbol.parent as ScopedSymbol;
        }
    }

    public enterLexerRuleBlock(ctx: LexerRuleBlockContext): void {
        this.currentSymbol = this.symbolTable.addNewSymbolOfType(BlockSymbol, this.currentSymbol as ScopedSymbol, "");
    }

    public exitLexerRuleBlock(ctx: LexerRuleBlockContext): void {
        if (this.currentSymbol) {
            this.currentSymbol = this.currentSymbol.parent as ScopedSymbol;
        }
    }

    public enterBlock(ctx: BlockContext): void {
        this.currentSymbol = this.symbolTable.addNewSymbolOfType(BlockSymbol, this.currentSymbol as ScopedSymbol, "");
        this.currentSymbol.context = ctx;
    }

    public exitBlock(ctx: BlockContext): void {
        if (this.currentSymbol) {
            this.currentSymbol = this.currentSymbol.parent as ScopedSymbol;
        }
    }

    public enterAlternative(ctx: AlternativeContext): void {
        this.currentSymbol = this.symbolTable.addNewSymbolOfType(AlternativeSymbol,
            this.currentSymbol as ScopedSymbol, "");
        this.currentSymbol.context = ctx;
    }

    public exitAlternative(ctx: AlternativeContext): void {
        if (this.currentSymbol) {
            this.currentSymbol = this.currentSymbol.parent as ScopedSymbol;
        }
    }

    public enterLexerAlt(ctx: LexerAltContext): void {
        this.currentSymbol = this.symbolTable.addNewSymbolOfType(AlternativeSymbol,
            this.currentSymbol as ScopedSymbol, "");
        this.currentSymbol.context = ctx;
    }

    public exitLexerAlt(ctx: LexerAltContext): void {
        if (this.currentSymbol) {
            this.currentSymbol = this.currentSymbol.parent as ScopedSymbol;
        }
    }

    public enterTokensSpec(ctx: TokensSpecContext): void {
        const idList = ctx.idList();
        if (idList) {
            for (const identifier of idList.identifier()) {
                const symbol = this.symbolTable.addNewSymbolOfType(VirtualTokenSymbol, undefined, identifier.text);
                symbol.context = ctx;
            }
        }
    }

    public enterTerminalRule(ctx: TerminalRuleContext): void {
        if (this.currentSymbol) {
            if (ctx.TOKEN_REF()) {
                const refName = ctx.TOKEN_REF()!.text;
                const symbol = this.symbolTable.addNewSymbolOfType(TokenReferenceSymbol,
                    this.currentSymbol as ScopedSymbol, refName);
                symbol.context = ctx.TOKEN_REF();
            } else {
                // Must be a string literal then.
                const refName = unquote(ctx.STRING_LITERAL()!.text, "'");
                const symbol = this.symbolTable.addNewSymbolOfType(LiteralSymbol, this.currentSymbol as ScopedSymbol,
                    refName, refName);
                symbol.context = ctx.STRING_LITERAL();
            }
        }
    }

    public enterRuleref(ctx: RulerefContext): void {
        if (ctx.RULE_REF() && this.currentSymbol) {
            const refName = ctx.RULE_REF()!.text;
            const symbol = this.symbolTable.addNewSymbolOfType(RuleReferenceSymbol, this.currentSymbol as ScopedSymbol,
                refName);
            symbol.context = ctx.RULE_REF();
        }
    }

    public enterChannelsSpec(ctx: ChannelsSpecContext): void {
        const idList = ctx.idList();
        if (idList) {
            for (const identifier of idList.identifier()) {
                const symbol = this.symbolTable.addNewSymbolOfType(TokenChannelSymbol, undefined, identifier.text);
                symbol.context = ctx;
            }
        }
    }

    public exitModeSpec(ctx: ModeSpecContext): void {
        const symbol = this.symbolTable.addNewSymbolOfType(LexerModeSymbol, undefined, ctx.identifier().text);
        symbol.context = ctx;
    }

    public exitDelegateGrammar(ctx: DelegateGrammarContext): void {
        const context = ctx.identifier()[ctx.identifier().length - 1];
        if (context) {
            const name = SourceContext.definitionForContext(context, false)!.text;
            const symbol = this.symbolTable.addNewSymbolOfType(ImportSymbol, undefined, name);
            symbol.context = ctx;
            this.imports.push(name);
        }
    }

    public enterOptionsSpec(ctx: OptionsSpecContext): void {
        this.currentSymbol = this.symbolTable.addNewSymbolOfType(OptionsSymbol, undefined, "options");
        this.currentSymbol.context = ctx;
    }

    public exitOption(ctx: OptionContext): void {
        const option = ctx.identifier().text;
        const value = ctx.tryGetRuleContext(0, OptionValueContext);
        if (value) {
            const symbol = this.symbolTable.addNewSymbolOfType(OptionSymbol, this.currentSymbol as ScopedSymbol,
                option);
            symbol.value = value.text;
            symbol.context = ctx;
            if (option === "tokenVocab") {
                this.imports.push(value.text);
            }
        }
    }

    public enterEbnfSuffix(ctx: EbnfSuffixContext): void {
        const symbol = this.symbolTable.addNewSymbolOfType(EbnfSuffixSymbol, this.currentSymbol as ScopedSymbol,
            ctx.text);
        symbol.context = ctx;
    }

    public enterActionBlock(ctx: ActionBlockContext): void {
        const symbol = this.symbolTable.addNewSymbolOfType(ActionSymbol, this.currentSymbol as ScopedSymbol, "action");
        symbol.context = ctx;
    }

    public enterArgActionBlock(ctx: ArgActionBlockContext): void {
        const symbol = this.symbolTable.addNewSymbolOfType(ArgumentSymbol, this.currentSymbol as ScopedSymbol,
            "argument");
        symbol.context = ctx;
    }

    public enterLabeledElement(ctx: LabeledElementContext): void {
        const symbol = this.symbolTable.addNewSymbolOfType(VariableSymbol, this.currentSymbol as ScopedSymbol,
            ctx.identifier().text);
        symbol.context = ctx;

        if (ctx.childCount > 1) {
            const operator = this.symbolTable.addNewSymbolOfType(OperatorSymbol, this.currentSymbol as ScopedSymbol,
                ctx.getChild(1).text);
            operator.context = ctx.getChild(1);
        }
    }

    public exitElement(ctx: ElementContext): void {
        if (ctx.QUESTION() && this.currentSymbol) {
            const child = (this.currentSymbol as ScopedSymbol).lastChild;
            if (child instanceof ActionSymbol) {
                child.isPredicate = true;
                const questionMark = this.symbolTable.addNewSymbolOfType(PredicateMarkerSymbol,
                    this.currentSymbol as ScopedSymbol, "?");
                questionMark.context = ctx.QUESTION();
            }
        }
    }

    public exitLexerElement(ctx: LexerElementContext): void {
        if (ctx.QUESTION() && this.currentSymbol) {
            const child = (this.currentSymbol as ScopedSymbol).lastChild;
            if (child instanceof ActionSymbol) {
                child.isPredicate = true;
                const questionMark = this.symbolTable.addNewSymbolOfType(PredicateMarkerSymbol,
                    this.currentSymbol as ScopedSymbol, "?");
                questionMark.context = ctx.QUESTION();
            }
        }
    }
}

/**
 * Removes outer quotes from the input.
 *
 * @param input The input to clean up.
 * @param quoteChar The quote char to remove.
 *
 * @returns The cleaned string.
 */
const unquote = (input: string, quoteChar?: string): string => {
    quoteChar = quoteChar || '"';
    if (input[0] === quoteChar && input[input.length - 1] === quoteChar) {
        return input.slice(1, input.length - 1);
    }

    return input;
};
