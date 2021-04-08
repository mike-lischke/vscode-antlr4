/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2021, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { ANTLRv4ParserListener } from "../parser/ANTLRv4ParserListener";
import {
    LexerRuleSpecContext, ParserRuleSpecContext, TokensSpecContext, ChannelsSpecContext,
    ModeSpecContext, DelegateGrammarContext, TerminalRuleContext, RulerefContext,
    BlockContext, AlternativeContext, RuleBlockContext, EbnfSuffixContext,
    OptionsSpecContext, ActionBlockContext, ArgActionBlockContext, LabeledElementContext,
    LexerRuleBlockContext, LexerAltContext, ElementContext, LexerElementContext, NamedActionContext,
    LexerCommandContext, OptionContext, OptionValueContext, ANTLRv4Parser,
} from "../parser/ANTLRv4Parser";

import {
    ContextSymbolTable, FragmentTokenSymbol, TokenSymbol, TokenReferenceSymbol, RuleSymbol, RuleReferenceSymbol,
    VirtualTokenSymbol, TokenChannelSymbol, LexerModeSymbol, ImportSymbol, AlternativeSymbol, EbnfSuffixSymbol,
    ArgumentSymbol, OperatorSymbol, GlobalNamedActionSymbol, ExceptionActionSymbol, FinallyActionSymbol,
    ParserActionSymbol, LexerActionSymbol, OptionsSymbol, OptionSymbol, LexerPredicateSymbol,
    ParserPredicateSymbol, LocalNamedActionSymbol,
    LexerCommandSymbol,
    TerminalSymbol,
} from "./ContextSymbolTable";

import { SourceContext } from "./SourceContext";

import { LiteralSymbol, BlockSymbol, Symbol, VariableSymbol } from "antlr4-c3";
import { ParseTree, TerminalNode } from "antlr4ts/tree";
import { ANTLRv4Lexer } from "../parser/ANTLRv4Lexer";

export class DetailsListener implements ANTLRv4ParserListener {
    private symbolStack: Symbol[] = [];

    public constructor(private symbolTable: ContextSymbolTable, private imports: string[]) { }

    public enterParserRuleSpec(ctx: ParserRuleSpecContext): void {
        this.pushNewSymbol(RuleSymbol, ctx, ctx.RULE_REF().text);
    }

    public exitParserRuleSpec(ctx: ParserRuleSpecContext): void {
        this.popSymbol();
    }

    public enterRuleBlock(ctx: RuleBlockContext): void {
        this.pushNewSymbol(BlockSymbol, ctx, "");
    }

    public exitRuleBlock(): void {
        this.popSymbol();
    }

    public enterLexerRuleSpec(ctx: LexerRuleSpecContext): void {
        if (ctx.FRAGMENT()) {
            this.pushNewSymbol(FragmentTokenSymbol, ctx, ctx.TOKEN_REF().text);
        } else {
            this.pushNewSymbol(TokenSymbol, ctx, ctx.TOKEN_REF().text);
        }
    }

    public exitLexerRuleSpec(): void {
        this.popSymbol();
    }

    public enterLexerRuleBlock(ctx: LexerRuleBlockContext): void {
        this.pushNewSymbol(BlockSymbol, ctx, "");
    }

    public exitLexerRuleBlock(ctx: LexerRuleBlockContext): void {
        this.popSymbol();
    }

    public enterBlock(ctx: BlockContext): void {
        this.pushNewSymbol(BlockSymbol, ctx, "");
    }

    public exitBlock(ctx: BlockContext): void {
        this.popSymbol();
    }

    public enterAlternative(ctx: AlternativeContext): void {
        this.pushNewSymbol(AlternativeSymbol, ctx, "");
    }

    public exitAlternative(ctx: AlternativeContext): void {
        this.popSymbol();
    }

    public enterLexerAlt(ctx: LexerAltContext): void {
        this.pushNewSymbol(AlternativeSymbol, ctx, "");
    }

    public exitLexerAlt(ctx: LexerAltContext): void {
        this.popSymbol();
    }

    public exitTokensSpec(ctx: TokensSpecContext): void {
        const idList = ctx.idList();
        if (idList) {
            for (const identifier of idList.identifier()) {
                this.addNewSymbol(VirtualTokenSymbol, ctx, identifier.text);
            }
        }
    }

    public exitChannelsSpec(ctx: ChannelsSpecContext): void {
        const idList = ctx.idList();
        if (idList) {
            for (const identifier of idList.identifier()) {
                this.addNewSymbol(TokenChannelSymbol, ctx, identifier.text);
            }
        }
    }

    public exitTerminalRule(ctx: TerminalRuleContext): void {
        let token = ctx.TOKEN_REF();
        if (token) {
            this.addNewSymbol(TokenReferenceSymbol, ctx, token.text);
        } else {
            // Must be a string literal then.
            token = ctx.STRING_LITERAL();
            if (token) {
                const refName = unquote(token.text, "'");
                this.addNewSymbol(LiteralSymbol, token, refName, refName);
            }
        }
    }

    public exitRuleref(ctx: RulerefContext): void {
        const token = ctx.RULE_REF();
        if (token) {
            this.addNewSymbol(RuleReferenceSymbol, ctx, token.text);
        }
    }

    public exitModeSpec(ctx: ModeSpecContext): void {
        this.addNewSymbol(LexerModeSymbol, ctx, ctx.identifier().text);
    }

    public exitDelegateGrammar(ctx: DelegateGrammarContext): void {
        const context = ctx.identifier()[ctx.identifier().length - 1];
        if (context) {
            const name = SourceContext.definitionForContext(context, false)!.text;
            this.addNewSymbol(ImportSymbol, context, name);
            this.imports.push(name);
        }
    }

    public enterOptionsSpec(ctx: OptionsSpecContext): void {
        this.pushNewSymbol(OptionsSymbol, ctx, "options");
    }

    public exitOptionsSpec(ctx: OptionsSpecContext): void {
        this.popSymbol();
    }

    public exitOption(ctx: OptionContext): void {
        const option = ctx.identifier().text;
        const valueContext = ctx.tryGetRuleContext(0, OptionValueContext);
        if (valueContext && valueContext.childCount > 0) {
            const symbol = this.addNewSymbol(OptionSymbol, valueContext.getChild(0), option);
            symbol.value = valueContext.text;
            if (option === "tokenVocab") {
                this.imports.push(valueContext.text);
            }
        }
    }

    /**
     * Handles all types of native actions in various locations, instead of doing that in individual listener methods.
     *
     * @param ctx The parser context for the action block.
     */
    public exitActionBlock(ctx: ActionBlockContext): void {
        let run = ctx.parent;

        while (run) {
            switch (run.ruleIndex) {
                case ANTLRv4Parser.RULE_optionValue: {
                    // The grammar allows to assign a native action block to an option variable, but ANTLR4 itself
                    // doesn't accept that. So we ignore it here too.
                    return;
                }

                case ANTLRv4Parser.RULE_namedAction: {
                    // Global level named action, like @parser.
                    const localContext = run as NamedActionContext;
                    let prefix = "";
                    if (localContext.actionScopeName()) {
                        prefix = localContext.actionScopeName()?.text + "::";
                    }

                    const symbol = this.addNewSymbol(GlobalNamedActionSymbol, ctx,
                        prefix + localContext.identifier().text);
                    this.symbolTable.defineNamedAction(symbol);

                    return;
                }

                case ANTLRv4Parser.RULE_exceptionHandler: {
                    this.addNewSymbol(ExceptionActionSymbol, ctx);

                    return;
                }

                case ANTLRv4Parser.RULE_finallyClause: {
                    this.addNewSymbol(FinallyActionSymbol, ctx);

                    return;
                }

                case ANTLRv4Parser.RULE_ruleAction: {
                    // Rule level named actions, like @init.
                    const symbol = this.addNewSymbol(LocalNamedActionSymbol, ctx, this.ruleName);
                    this.symbolTable.defineNamedAction(symbol);

                    return;
                }

                case ANTLRv4Parser.RULE_lexerElement: {
                    // Lexer inline action or predicate.
                    const localContext = run as LexerElementContext;
                    if (localContext.QUESTION()) {
                        const symbol = this.addNewSymbol(LexerPredicateSymbol, ctx);
                        this.symbolTable.definePredicate(symbol);
                    } else {
                        const symbol = this.addNewSymbol(LexerActionSymbol, ctx);
                        this.symbolTable.defineLexerAction(symbol);
                    }

                    return;
                }

                case ANTLRv4Parser.RULE_element: {
                    // Parser inline action or predicate.
                    const localContext = run as ElementContext;
                    if (localContext.QUESTION()) {
                        const symbol = this.addNewSymbol(ParserPredicateSymbol, ctx);
                        this.symbolTable.definePredicate(symbol);
                    } else {
                        const symbol = this.addNewSymbol(ParserActionSymbol, ctx);
                        this.symbolTable.defineParserAction(symbol);
                    }

                    return;
                }

                default: {
                    run = run.parent;

                    break;
                }
            }
        }
    }

    /**
     * Handles argument action code blocks.
     *
     * @param ctx The parser context for the action block.
     */
    public exitArgActionBlock(ctx: ArgActionBlockContext): void {
        if (this.symbolStack.length === 0) {
            return;
        }

        let run = ctx.parent;
        while (run && run !== this.symbolStack[0].context) {
            run = run.parent;
        }

        if (run) {
            switch (run.ruleIndex) {
                case ANTLRv4Parser.RULE_exceptionHandler: {
                    this.addNewSymbol(ArgumentSymbol, ctx, "exceptionHandler");

                    break;
                }

                case ANTLRv4Parser.RULE_finallyClause: {
                    this.addNewSymbol(ArgumentSymbol, ctx, "finallyClause");

                    break;
                }

                case ANTLRv4Parser.RULE_ruleReturns: {
                    this.addNewSymbol(ArgumentSymbol, ctx, "ruleReturns");

                    break;
                }

                case ANTLRv4Parser.RULE_localsSpec: {
                    this.addNewSymbol(ArgumentSymbol, ctx, "localsSpec");

                    break;
                }

                case ANTLRv4Parser.RULE_ruleref: {
                    this.addNewSymbol(ArgumentSymbol, ctx, "ruleRef");

                    break;
                }

                case ANTLRv4Parser.RULE_parserRuleSpec: {
                    this.addNewSymbol(ArgumentSymbol, ctx, "parserRuleSpec");

                    break;
                }

                default: {
                    break;
                }
            }
        }
    }

    public exitEbnfSuffix(ctx: EbnfSuffixContext): void {
        this.addNewSymbol(EbnfSuffixSymbol, ctx, ctx.text);
    }

    public enterLexerCommand(ctx: LexerCommandContext): void {
        this.pushNewSymbol(LexerCommandSymbol, ctx, ctx.lexerCommandName().text);
    }

    public exitLexerCommand(ctx: LexerCommandContext): void {
        this.popSymbol();
    }

    public exitLabeledElement(ctx: LabeledElementContext): void {
        this.addNewSymbol(VariableSymbol, ctx, ctx.identifier().text);
    }

    public visitTerminal = (node: TerminalNode): void => {
        // Ignore individual terminals under certain circumstances.
        if (this.currentSymbol() instanceof LexerCommandSymbol) {
            return;
        }

        switch (node.symbol.type) {
            case ANTLRv4Lexer.COLON:
            case ANTLRv4Lexer.COLONCOLON:
            case ANTLRv4Lexer.COMMA:
            case ANTLRv4Lexer.SEMI:
            case ANTLRv4Lexer.LPAREN:
            case ANTLRv4Lexer.RPAREN:
            case ANTLRv4Lexer.LBRACE:
            case ANTLRv4Lexer.RBRACE:
            case ANTLRv4Lexer.RARROW:
            case ANTLRv4Lexer.LT:
            case ANTLRv4Lexer.GT:
            case ANTLRv4Lexer.ASSIGN:
            case ANTLRv4Lexer.QUESTION:
            case ANTLRv4Lexer.STAR:
            case ANTLRv4Lexer.PLUS_ASSIGN:
            case ANTLRv4Lexer.PLUS:
            case ANTLRv4Lexer.OR:
            case ANTLRv4Lexer.DOLLAR:
            case ANTLRv4Lexer.RANGE:
            case ANTLRv4Lexer.DOT:
            case ANTLRv4Lexer.AT:
            case ANTLRv4Lexer.POUND:
            case ANTLRv4Lexer.NOT: {
                this.addNewSymbol(OperatorSymbol, node, node.text);
                break;
            }

            default: {
                if (node.symbol.type !== ANTLRv4Lexer.ACTION_CONTENT) {
                    this.addNewSymbol(TerminalSymbol, node, node.text);
                }

                break;
            }
        }
    };

    private currentSymbol<T extends Symbol>(): T | undefined {
        if (this.symbolStack.length === 0) {
            return undefined;
        }

        return this.symbolStack[this.symbolStack.length - 1] as T;
    }

    /**
     * Adds a new symbol to the current symbol TOS.
     *
     * @param type The type of the symbol to add.
     * @param context The symbol's parse tree, to allow locating it.
     * @param args The actual arguments for the new symbol.
     *
     * @returns The new symbol.
     */
    private addNewSymbol<T extends Symbol>(type: new (...args: any[]) => T, context: ParseTree,
        ...args: any[]): T {
        const symbol = this.symbolTable.addNewSymbolOfType(type, this.currentSymbol(), ...args);
        symbol.context = context;

        return symbol;
    }

    /**
     * Creates a new symbol and starts a new scope with it on the symbol stack.
     *
     * @param type The type of the symbol to add.
     * @param context The symbol's parse tree, to allow locating it.
     * @param args The actual arguments for the new symbol.
     *
     * @returns The new scoped symbol.
     */
    private pushNewSymbol<T extends Symbol>(type: new (...args: any[]) => T, context: ParseTree,
        ...args: any[]): Symbol {
        const symbol = this.symbolTable.addNewSymbolOfType<T>(type, this.currentSymbol(), ...args);
        symbol.context = context;
        this.symbolStack.push(symbol);

        return symbol;
    }

    private popSymbol(): Symbol | undefined {
        return this.symbolStack.pop();
    }

    /**
     * The symbol stack usually contains entries beginning with a rule context, followed by a number of blocks and alts
     * as well as additional parts like actions or predicates.
     * This function returns the name of the first symbol, which represents the rule (parser/lexer) which we are
     * currently walking over.
     *
     * @returns The rule name from the start symbol.
     */
    private get ruleName(): string {
        return this.symbolStack.length === 0 ? "" : this.symbolStack[0].name;
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
