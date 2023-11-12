/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

// Need explicit any and any-spread for constructor functions.
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { LiteralSymbol, BlockSymbol, BaseSymbol, VariableSymbol, SymbolConstructor } from "antlr4-c3";
import { ParseTree, ParserRuleContext, TerminalNode } from "antlr4ng";

import { ANTLRv4ParserListener } from "../parser/ANTLRv4ParserListener.js";
import {
    LexerRuleSpecContext, ParserRuleSpecContext, TokensSpecContext, ChannelsSpecContext,
    ModeSpecContext, DelegateGrammarContext, TerminalDefContext, RulerefContext,
    BlockContext, AlternativeContext, RuleBlockContext, EbnfSuffixContext,
    OptionsSpecContext, ActionBlockContext, ArgActionBlockContext, LabeledElementContext,
    LexerRuleBlockContext, LexerAltContext, ElementContext, LexerElementContext, Action_Context,
    LexerCommandContext, OptionContext, OptionValueContext, ANTLRv4Parser,
} from "../parser/ANTLRv4Parser.js";

import {
    ContextSymbolTable, FragmentTokenSymbol, TokenSymbol, TokenReferenceSymbol, RuleSymbol, RuleReferenceSymbol,
    VirtualTokenSymbol, TokenChannelSymbol, LexerModeSymbol, ImportSymbol, AlternativeSymbol, EbnfSuffixSymbol,
    ArgumentSymbol, OperatorSymbol, GlobalNamedActionSymbol, ExceptionActionSymbol, FinallyActionSymbol,
    ParserActionSymbol, LexerActionSymbol, OptionsSymbol, OptionSymbol, LexerPredicateSymbol,
    ParserPredicateSymbol, LocalNamedActionSymbol, LexerCommandSymbol,
} from "./ContextSymbolTable.js";

import { SourceContext } from "./SourceContext.js";

import { ANTLRv4Lexer } from "../parser/ANTLRv4Lexer.js";

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

export class DetailsListener extends ANTLRv4ParserListener {
    private symbolStack: BaseSymbol[] = [];

    public constructor(private symbolTable: ContextSymbolTable, private imports: string[]) {
        super();
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

    public override enterParserRuleSpec = (ctx: ParserRuleSpecContext): void => {
        this.pushNewSymbol(RuleSymbol, ctx, ctx.RULE_REF()!.getText());
    };

    public override exitParserRuleSpec = (_ctx: ParserRuleSpecContext): void => {
        this.popSymbol();
    };

    public override enterRuleBlock = (ctx: RuleBlockContext): void => {
        this.pushNewSymbol(BlockSymbol, ctx, "");
    };

    public override exitRuleBlock = (): void => {
        this.popSymbol();
    };

    public override enterLexerRuleSpec = (ctx: LexerRuleSpecContext): void => {
        if (ctx.FRAGMENT()) {
            this.pushNewSymbol(FragmentTokenSymbol, ctx, ctx.TOKEN_REF()!.getText());
        } else {
            this.pushNewSymbol(TokenSymbol, ctx, ctx.TOKEN_REF()!.getText());
        }
    };

    public override exitLexerRuleSpec = (): void => {
        this.popSymbol();
    };

    public override enterLexerRuleBlock = (ctx: LexerRuleBlockContext): void => {
        this.pushNewSymbol(BlockSymbol, ctx, "");
    };

    public override exitLexerRuleBlock = (_ctx: LexerRuleBlockContext): void => {
        this.popSymbol();
    };

    public override enterBlock = (ctx: BlockContext): void => {
        this.pushNewSymbol(BlockSymbol, ctx, "");
    };

    public override exitBlock = (_ctx: BlockContext): void => {
        this.popSymbol();
    };

    public override enterAlternative = (ctx: AlternativeContext): void => {
        this.pushNewSymbol(AlternativeSymbol, ctx, "");
    };

    public override exitAlternative = (_ctx: AlternativeContext): void => {
        this.popSymbol();
    };

    public override enterLexerAlt = (ctx: LexerAltContext): void => {
        this.pushNewSymbol(AlternativeSymbol, ctx, "");
    };

    public override exitLexerAlt = (_ctx: LexerAltContext): void => {
        this.popSymbol();
    };

    public override exitTokensSpec = (ctx: TokensSpecContext): void => {
        const idList = ctx.idList();
        if (idList) {
            for (const identifier of idList.identifier()) {
                this.addNewSymbol(VirtualTokenSymbol, ctx, identifier.getText());
            }
        }
    };

    public override exitChannelsSpec = (ctx: ChannelsSpecContext): void => {
        const idList = ctx.idList();
        if (idList) {
            for (const identifier of idList.identifier()) {
                this.addNewSymbol(TokenChannelSymbol, ctx, identifier.getText());
            }
        }
    };

    public override exitTerminalDef = (ctx: TerminalDefContext): void => {
        let token = ctx.TOKEN_REF();
        if (token) {
            this.addNewSymbol(TokenReferenceSymbol, ctx, token.getText());
        } else {
            // Must be a string literal then.
            token = ctx.STRING_LITERAL();
            if (token) {
                const refName = unquote(token.getText(), "'");
                this.addNewSymbol(LiteralSymbol, token, refName, refName);
            }
        }
    };

    public override exitRuleref = (ctx: RulerefContext): void => {
        const token = ctx.RULE_REF();
        if (token) {
            this.addNewSymbol(RuleReferenceSymbol, ctx, token.getText());
        }
    };

    public override exitModeSpec = (ctx: ModeSpecContext): void => {
        this.addNewSymbol(LexerModeSymbol, ctx, ctx.identifier().getText());
    };

    public override exitDelegateGrammar = (ctx: DelegateGrammarContext): void => {
        const context = ctx.identifier()[ctx.identifier().length - 1];
        if (context) {
            const name = SourceContext.definitionForContext(context, false)!.text;
            this.addNewSymbol(ImportSymbol, context, name);
            this.imports.push(name);
        }
    };

    public override enterOptionsSpec = (ctx: OptionsSpecContext): void => {
        this.pushNewSymbol(OptionsSymbol, ctx, "options");
    };

    public override exitOptionsSpec = (_ctx: OptionsSpecContext): void => {
        this.popSymbol();
    };

    public override exitOption = (ctx: OptionContext): void => {
        const option = ctx.identifier().getText();
        const valueContext = ctx.getRuleContext(0, OptionValueContext);
        if (valueContext && valueContext.getChildCount() > 0) {
            const symbol = this.addNewSymbol(OptionSymbol, valueContext.getChild(0)!, option);
            symbol.value = valueContext.getText();
            if (option === "tokenVocab") {
                this.imports.push(valueContext.getText());
            }
        }
    };

    /**
     * Handles all types of native actions in various locations, instead of doing that in individual listener methods.
     *
     * @param ctx The parser context for the action block.
     */
    public override exitActionBlock = (ctx: ActionBlockContext): void => {
        let run = ctx.parent as ParserRuleContext | null;

        while (run) {
            switch (run.ruleIndex) {
                case ANTLRv4Parser.RULE_optionValue: {
                    // The grammar allows to assign a native action block to an option variable, but ANTLR4 itself
                    // doesn't accept that. So we ignore it here too.
                    return;
                }

                // eslint-disable-next-line no-underscore-dangle
                case ANTLRv4Parser.RULE_action_: {
                    // Global level named action, like @parser.
                    const localContext = run as Action_Context;
                    let prefix = "";

                    const actionScopeName = localContext.actionScopeName();
                    if (actionScopeName) {
                        prefix = actionScopeName.getText() + "::";
                    }

                    const symbol = this.addNewSymbol(GlobalNamedActionSymbol, ctx,
                        prefix + localContext.identifier().getText());
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
    };

    /**
     * Handles argument action code blocks.
     *
     * @param ctx The parser context for the action block.
     */
    public override exitArgActionBlock = (ctx: ArgActionBlockContext): void => {
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
    };

    public override exitEbnfSuffix = (ctx: EbnfSuffixContext): void => {
        this.addNewSymbol(EbnfSuffixSymbol, ctx, ctx.getText());
    };

    public override enterLexerCommand = (ctx: LexerCommandContext): void => {
        this.pushNewSymbol(LexerCommandSymbol, ctx, ctx.lexerCommandName().getText());
    };

    public override exitLexerCommand = (_ctx: LexerCommandContext): void => {
        this.popSymbol();
    };

    public override exitLabeledElement = (ctx: LabeledElementContext): void => {
        this.addNewSymbol(VariableSymbol, ctx, ctx.identifier().getText());
    };

    public override visitTerminal = (node: TerminalNode): void => {
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
                this.addNewSymbol(OperatorSymbol, node, node.getText());
                break;
            }

            default: {
                // Ignore the rest.
                break;
            }
        }
    };

    private currentSymbol<T extends BaseSymbol>(): T | undefined {
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
    private addNewSymbol<T extends BaseSymbol>(type: new (...args: any[]) => T, context: ParseTree,
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
    private pushNewSymbol<T extends BaseSymbol, Args extends unknown[]>(type: SymbolConstructor<T, Args>,
        context: ParseTree, ...args: Args): BaseSymbol {
        const symbol = this.symbolTable.addNewSymbolOfType<T, Args>(type, this.currentSymbol(), ...args);
        symbol.context = context;
        this.symbolStack.push(symbol);

        return symbol;
    }

    private popSymbol(): BaseSymbol | undefined {
        return this.symbolStack.pop();
    }
}
