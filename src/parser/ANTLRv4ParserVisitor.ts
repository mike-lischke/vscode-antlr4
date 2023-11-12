// Generated from grammars/ANTLRv4Parser.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from "antlr4ng";


import { GrammarSpecContext } from "./ANTLRv4Parser.js";
import { GrammarDeclContext } from "./ANTLRv4Parser.js";
import { GrammarTypeContext } from "./ANTLRv4Parser.js";
import { PrequelConstructContext } from "./ANTLRv4Parser.js";
import { OptionsSpecContext } from "./ANTLRv4Parser.js";
import { OptionContext } from "./ANTLRv4Parser.js";
import { OptionValueContext } from "./ANTLRv4Parser.js";
import { DelegateGrammarsContext } from "./ANTLRv4Parser.js";
import { DelegateGrammarContext } from "./ANTLRv4Parser.js";
import { TokensSpecContext } from "./ANTLRv4Parser.js";
import { ChannelsSpecContext } from "./ANTLRv4Parser.js";
import { IdListContext } from "./ANTLRv4Parser.js";
import { Action_Context } from "./ANTLRv4Parser.js";
import { ActionScopeNameContext } from "./ANTLRv4Parser.js";
import { ActionBlockContext } from "./ANTLRv4Parser.js";
import { ArgActionBlockContext } from "./ANTLRv4Parser.js";
import { ModeSpecContext } from "./ANTLRv4Parser.js";
import { RulesContext } from "./ANTLRv4Parser.js";
import { RuleSpecContext } from "./ANTLRv4Parser.js";
import { ParserRuleSpecContext } from "./ANTLRv4Parser.js";
import { ExceptionGroupContext } from "./ANTLRv4Parser.js";
import { ExceptionHandlerContext } from "./ANTLRv4Parser.js";
import { FinallyClauseContext } from "./ANTLRv4Parser.js";
import { RulePrequelContext } from "./ANTLRv4Parser.js";
import { RuleReturnsContext } from "./ANTLRv4Parser.js";
import { ThrowsSpecContext } from "./ANTLRv4Parser.js";
import { LocalsSpecContext } from "./ANTLRv4Parser.js";
import { RuleActionContext } from "./ANTLRv4Parser.js";
import { RuleModifiersContext } from "./ANTLRv4Parser.js";
import { RuleModifierContext } from "./ANTLRv4Parser.js";
import { RuleBlockContext } from "./ANTLRv4Parser.js";
import { RuleAltListContext } from "./ANTLRv4Parser.js";
import { LabeledAltContext } from "./ANTLRv4Parser.js";
import { LexerRuleSpecContext } from "./ANTLRv4Parser.js";
import { LexerRuleBlockContext } from "./ANTLRv4Parser.js";
import { LexerAltListContext } from "./ANTLRv4Parser.js";
import { LexerAltContext } from "./ANTLRv4Parser.js";
import { LexerElementsContext } from "./ANTLRv4Parser.js";
import { LexerElementContext } from "./ANTLRv4Parser.js";
import { LexerBlockContext } from "./ANTLRv4Parser.js";
import { LexerCommandsContext } from "./ANTLRv4Parser.js";
import { LexerCommandContext } from "./ANTLRv4Parser.js";
import { LexerCommandNameContext } from "./ANTLRv4Parser.js";
import { LexerCommandExprContext } from "./ANTLRv4Parser.js";
import { AltListContext } from "./ANTLRv4Parser.js";
import { AlternativeContext } from "./ANTLRv4Parser.js";
import { ElementContext } from "./ANTLRv4Parser.js";
import { LabeledElementContext } from "./ANTLRv4Parser.js";
import { EbnfContext } from "./ANTLRv4Parser.js";
import { BlockSuffixContext } from "./ANTLRv4Parser.js";
import { EbnfSuffixContext } from "./ANTLRv4Parser.js";
import { LexerAtomContext } from "./ANTLRv4Parser.js";
import { AtomContext } from "./ANTLRv4Parser.js";
import { NotSetContext } from "./ANTLRv4Parser.js";
import { BlockSetContext } from "./ANTLRv4Parser.js";
import { SetElementContext } from "./ANTLRv4Parser.js";
import { BlockContext } from "./ANTLRv4Parser.js";
import { RulerefContext } from "./ANTLRv4Parser.js";
import { CharacterRangeContext } from "./ANTLRv4Parser.js";
import { TerminalDefContext } from "./ANTLRv4Parser.js";
import { ElementOptionsContext } from "./ANTLRv4Parser.js";
import { ElementOptionContext } from "./ANTLRv4Parser.js";
import { IdentifierContext } from "./ANTLRv4Parser.js";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `ANTLRv4Parser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class ANTLRv4ParserVisitor<Result> extends AbstractParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.grammarSpec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGrammarSpec?: (ctx: GrammarSpecContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.grammarDecl`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGrammarDecl?: (ctx: GrammarDeclContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.grammarType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGrammarType?: (ctx: GrammarTypeContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.prequelConstruct`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPrequelConstruct?: (ctx: PrequelConstructContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.optionsSpec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOptionsSpec?: (ctx: OptionsSpecContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.option`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOption?: (ctx: OptionContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.optionValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOptionValue?: (ctx: OptionValueContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.delegateGrammars`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDelegateGrammars?: (ctx: DelegateGrammarsContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.delegateGrammar`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDelegateGrammar?: (ctx: DelegateGrammarContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.tokensSpec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTokensSpec?: (ctx: TokensSpecContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.channelsSpec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitChannelsSpec?: (ctx: ChannelsSpecContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.idList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdList?: (ctx: IdListContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.action_`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAction_?: (ctx: Action_Context) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.actionScopeName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitActionScopeName?: (ctx: ActionScopeNameContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.actionBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitActionBlock?: (ctx: ActionBlockContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.argActionBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArgActionBlock?: (ctx: ArgActionBlockContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.modeSpec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitModeSpec?: (ctx: ModeSpecContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.rules`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRules?: (ctx: RulesContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.ruleSpec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRuleSpec?: (ctx: RuleSpecContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.parserRuleSpec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParserRuleSpec?: (ctx: ParserRuleSpecContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.exceptionGroup`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExceptionGroup?: (ctx: ExceptionGroupContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.exceptionHandler`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExceptionHandler?: (ctx: ExceptionHandlerContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.finallyClause`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFinallyClause?: (ctx: FinallyClauseContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.rulePrequel`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRulePrequel?: (ctx: RulePrequelContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.ruleReturns`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRuleReturns?: (ctx: RuleReturnsContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.throwsSpec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitThrowsSpec?: (ctx: ThrowsSpecContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.localsSpec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLocalsSpec?: (ctx: LocalsSpecContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.ruleAction`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRuleAction?: (ctx: RuleActionContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.ruleModifiers`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRuleModifiers?: (ctx: RuleModifiersContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.ruleModifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRuleModifier?: (ctx: RuleModifierContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.ruleBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRuleBlock?: (ctx: RuleBlockContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.ruleAltList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRuleAltList?: (ctx: RuleAltListContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.labeledAlt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLabeledAlt?: (ctx: LabeledAltContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerRuleSpec`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerRuleSpec?: (ctx: LexerRuleSpecContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerRuleBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerRuleBlock?: (ctx: LexerRuleBlockContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerAltList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerAltList?: (ctx: LexerAltListContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerAlt`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerAlt?: (ctx: LexerAltContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerElements`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerElements?: (ctx: LexerElementsContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerElement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerElement?: (ctx: LexerElementContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerBlock?: (ctx: LexerBlockContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerCommands`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerCommands?: (ctx: LexerCommandsContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerCommand`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerCommand?: (ctx: LexerCommandContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerCommandName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerCommandName?: (ctx: LexerCommandNameContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerCommandExpr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerCommandExpr?: (ctx: LexerCommandExprContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.altList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAltList?: (ctx: AltListContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.alternative`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAlternative?: (ctx: AlternativeContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.element`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElement?: (ctx: ElementContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.labeledElement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLabeledElement?: (ctx: LabeledElementContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.ebnf`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEbnf?: (ctx: EbnfContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.blockSuffix`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBlockSuffix?: (ctx: BlockSuffixContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.ebnfSuffix`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEbnfSuffix?: (ctx: EbnfSuffixContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.lexerAtom`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLexerAtom?: (ctx: LexerAtomContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.atom`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAtom?: (ctx: AtomContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.notSet`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNotSet?: (ctx: NotSetContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.blockSet`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBlockSet?: (ctx: BlockSetContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.setElement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSetElement?: (ctx: SetElementContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.block`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBlock?: (ctx: BlockContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.ruleref`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRuleref?: (ctx: RulerefContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.characterRange`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCharacterRange?: (ctx: CharacterRangeContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.terminalDef`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTerminalDef?: (ctx: TerminalDefContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.elementOptions`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElementOptions?: (ctx: ElementOptionsContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.elementOption`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitElementOption?: (ctx: ElementOptionContext) => Result;
    /**
     * Visit a parse tree produced by `ANTLRv4Parser.identifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifier?: (ctx: IdentifierContext) => Result;
}

