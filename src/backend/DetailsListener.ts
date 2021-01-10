/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2020, Mike Lischke
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
    ExceptionHandlerContext, FinallyClauseContext, RuleActionContext, LexerCommandContext, OptionContext,
    OptionValueContext,
} from "../parser/ANTLRv4Parser";

import {
    ContextSymbolTable, FragmentTokenSymbol, TokenSymbol, TokenReferenceSymbol, RuleSymbol, RuleReferenceSymbol,
    VirtualTokenSymbol, TokenChannelSymbol, LexerModeSymbol, ImportSymbol, AlternativeSymbol, EbnfSuffixSymbol,
    ArgumentSymbol, OperatorSymbol, NamedActionSymbol,
    ExceptionHandlerSymbol, FinallyClauseSymbol, ParserActionSymbol, LexerActionSymbol, ActionSymbol, OptionsSymbol,
    OptionSymbol,
    PredicateSymbol,
} from "./ContextSymbolTable";

import { SourceContext } from "./SourceContext";

import { ScopedSymbol, LiteralSymbol, BlockSymbol, Symbol, VariableSymbol } from "antlr4-c3";
import { ParseTree } from "antlr4ts/tree";

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
        const tokenRef = ctx.TOKEN_REF();
        if (tokenRef) {
            if (ctx.FRAGMENT()) {
                this.pushNewSymbol(FragmentTokenSymbol, ctx, tokenRef.text);
            } else {
                this.pushNewSymbol(TokenSymbol, ctx, tokenRef.text);
            }
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
        this.pushNewSymbol(OptionsSymbol, ctx, "");
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

    public enterNamedAction(ctx: NamedActionContext): void {
        this.pushNewSymbol(NamedActionSymbol, ctx, "");
    }

    public exitNamedAction(): void {
        const action = this.popSymbol() as NamedActionSymbol;
        this.symbolTable.defineNamedAction(action.lastChild!);
    }

    public enterExceptionHandler(ctx: ExceptionHandlerContext): void {
        this.pushNewSymbol(ExceptionHandlerSymbol, ctx, "");
    }

    public exitExceptionHandler(ctx: ExceptionHandlerContext): void {
        const action = this.popSymbol() as NamedActionSymbol;
        this.symbolTable.defineParserAction(action.lastChild!);
    }

    public enterFinallyClause(ctx: FinallyClauseContext): void {
        this.pushNewSymbol(FinallyClauseSymbol, ctx, "");
    }

    public exitFinallyClause(ctx: FinallyClauseContext): void {
        const action = this.popSymbol() as FinallyClauseSymbol;
        this.symbolTable.defineParserAction(action.lastChild!);
    }

    public enterRuleAction(ctx: RuleActionContext): void {
        this.pushNewSymbol(ParserActionSymbol, ctx, "");
    }

    public exitRuleAction(ctx: RuleActionContext): void {
        const action = this.popSymbol() as ParserActionSymbol;
        this.symbolTable.defineParserAction(action.lastChild!);
    }

    public exitEbnfSuffix(ctx: EbnfSuffixContext): void {
        this.addNewSymbol(EbnfSuffixSymbol, ctx, ctx.text);
    }

    public exitActionBlock(ctx: ActionBlockContext): void {
        const parent = ctx.parent;
        if (parent) {
            parent.children?.forEach((tree, index) => {
                if (tree === ctx) {
                    if (index + 1 < parent.childCount) {
                        const next = parent.getChild(index + 1);
                        if (next.text === "?") {
                            // This is actually a predicate.
                            this.addNewSymbol(PredicateSymbol, ctx, "");
                        }
                    }
                }
            });
        }

        this.addNewSymbol(ActionSymbol, ctx, "");
    }

    public exitLexerCommand(ctx: LexerCommandContext): void {
        const command = this.addNewSymbol(LexerActionSymbol, ctx, ctx.lexerCommandName().text);
        this.symbolTable.defineLexerAction(command);
    }

    public exitArgActionBlock(ctx: ArgActionBlockContext): void {
        this.addNewSymbol(ArgumentSymbol, ctx, "");
    }

    public exitLabeledElement(ctx: LabeledElementContext): void {
        this.addNewSymbol(VariableSymbol, ctx, ctx.identifier().text);

        if (ctx.childCount > 1) {
            this.addNewSymbol(OperatorSymbol, ctx, ctx.getChild(1).text);
        }
    }

    /**
     * Checks if the element is an action or predicate and (if so) defines it in the symbol table as such.
     *
     * @param ctx The context for the element.
     */
    public exitElement(ctx: ElementContext): void {
        // We must have an action symbol in the symbol table already and the owning alternative on the TOS,
        // if there's an action block in the element context.
        if (ctx.actionBlock()) {
            // Pure action or predicate?
            const child = this.currentSymbol<AlternativeSymbol>()!.lastChild!;
            if (ctx.QUESTION()) {
                this.symbolTable.definePredicate(child);
            } else {
                this.symbolTable.defineParserAction(child);
            }
        }
    }

    /**
     * Checks if the lexer element is an action or predicate. Same handling as for parser elements.
     *
     * @param ctx The context for the element.
     */
    public exitLexerElement(ctx: LexerElementContext): void {
        if (ctx.actionBlock()) {
            const element = this.currentSymbol<AlternativeSymbol>()!.lastChild!;
            if (ctx.QUESTION() && element.previousSibling) {
                this.symbolTable.definePredicate(element.previousSibling);
            } else {
                this.symbolTable.defineLexerAction(element);
            }
        }
    }

    /**public visitTerminal = (node: TerminalNode): string => {
        this.addNewSymbol(Symbol, node, node.text);

        return node.text;
    };*/

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
    private pushNewSymbol<T extends ScopedSymbol>(type: new (...args: any[]) => T, context: ParseTree,
        ...args: any[]): ScopedSymbol {
        const symbol = this.symbolTable.addNewSymbolOfType<T>(type, this.currentSymbol(), ...args);
        symbol.context = context;
        this.symbolStack.push(symbol);

        return symbol;
    }

    private popSymbol(): Symbol | undefined {
        return this.symbolStack.pop();
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
