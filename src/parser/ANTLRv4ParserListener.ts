// Generated from grammars/ANTLRv4Parser.g4 by ANTLR 4.13.1

import { ErrorNode, ParseTreeListener, ParserRuleContext, TerminalNode } from "antlr4ng";


import { GrammarSpecContext } from "./ANTLRv4Parser.js";
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
import { NamedActionContext } from "./ANTLRv4Parser.js";
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
import { LabeledLexerElementContext } from "./ANTLRv4Parser.js";
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
import { TerminalRuleContext } from "./ANTLRv4Parser.js";
import { ElementOptionsContext } from "./ANTLRv4Parser.js";
import { ElementOptionContext } from "./ANTLRv4Parser.js";
import { IdentifierContext } from "./ANTLRv4Parser.js";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `ANTLRv4Parser`.
 */
export class ANTLRv4ParserListener implements ParseTreeListener {
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.grammarSpec`.
     * @param ctx the parse tree
     */
    enterGrammarSpec?: (ctx: GrammarSpecContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.grammarSpec`.
     * @param ctx the parse tree
     */
    exitGrammarSpec?: (ctx: GrammarSpecContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.grammarType`.
     * @param ctx the parse tree
     */
    enterGrammarType?: (ctx: GrammarTypeContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.grammarType`.
     * @param ctx the parse tree
     */
    exitGrammarType?: (ctx: GrammarTypeContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.prequelConstruct`.
     * @param ctx the parse tree
     */
    enterPrequelConstruct?: (ctx: PrequelConstructContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.prequelConstruct`.
     * @param ctx the parse tree
     */
    exitPrequelConstruct?: (ctx: PrequelConstructContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.optionsSpec`.
     * @param ctx the parse tree
     */
    enterOptionsSpec?: (ctx: OptionsSpecContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.optionsSpec`.
     * @param ctx the parse tree
     */
    exitOptionsSpec?: (ctx: OptionsSpecContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.option`.
     * @param ctx the parse tree
     */
    enterOption?: (ctx: OptionContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.option`.
     * @param ctx the parse tree
     */
    exitOption?: (ctx: OptionContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.optionValue`.
     * @param ctx the parse tree
     */
    enterOptionValue?: (ctx: OptionValueContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.optionValue`.
     * @param ctx the parse tree
     */
    exitOptionValue?: (ctx: OptionValueContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.delegateGrammars`.
     * @param ctx the parse tree
     */
    enterDelegateGrammars?: (ctx: DelegateGrammarsContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.delegateGrammars`.
     * @param ctx the parse tree
     */
    exitDelegateGrammars?: (ctx: DelegateGrammarsContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.delegateGrammar`.
     * @param ctx the parse tree
     */
    enterDelegateGrammar?: (ctx: DelegateGrammarContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.delegateGrammar`.
     * @param ctx the parse tree
     */
    exitDelegateGrammar?: (ctx: DelegateGrammarContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.tokensSpec`.
     * @param ctx the parse tree
     */
    enterTokensSpec?: (ctx: TokensSpecContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.tokensSpec`.
     * @param ctx the parse tree
     */
    exitTokensSpec?: (ctx: TokensSpecContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.channelsSpec`.
     * @param ctx the parse tree
     */
    enterChannelsSpec?: (ctx: ChannelsSpecContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.channelsSpec`.
     * @param ctx the parse tree
     */
    exitChannelsSpec?: (ctx: ChannelsSpecContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.idList`.
     * @param ctx the parse tree
     */
    enterIdList?: (ctx: IdListContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.idList`.
     * @param ctx the parse tree
     */
    exitIdList?: (ctx: IdListContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.namedAction`.
     * @param ctx the parse tree
     */
    enterNamedAction?: (ctx: NamedActionContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.namedAction`.
     * @param ctx the parse tree
     */
    exitNamedAction?: (ctx: NamedActionContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.actionScopeName`.
     * @param ctx the parse tree
     */
    enterActionScopeName?: (ctx: ActionScopeNameContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.actionScopeName`.
     * @param ctx the parse tree
     */
    exitActionScopeName?: (ctx: ActionScopeNameContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.actionBlock`.
     * @param ctx the parse tree
     */
    enterActionBlock?: (ctx: ActionBlockContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.actionBlock`.
     * @param ctx the parse tree
     */
    exitActionBlock?: (ctx: ActionBlockContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.argActionBlock`.
     * @param ctx the parse tree
     */
    enterArgActionBlock?: (ctx: ArgActionBlockContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.argActionBlock`.
     * @param ctx the parse tree
     */
    exitArgActionBlock?: (ctx: ArgActionBlockContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.modeSpec`.
     * @param ctx the parse tree
     */
    enterModeSpec?: (ctx: ModeSpecContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.modeSpec`.
     * @param ctx the parse tree
     */
    exitModeSpec?: (ctx: ModeSpecContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.rules`.
     * @param ctx the parse tree
     */
    enterRules?: (ctx: RulesContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.rules`.
     * @param ctx the parse tree
     */
    exitRules?: (ctx: RulesContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.ruleSpec`.
     * @param ctx the parse tree
     */
    enterRuleSpec?: (ctx: RuleSpecContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.ruleSpec`.
     * @param ctx the parse tree
     */
    exitRuleSpec?: (ctx: RuleSpecContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.parserRuleSpec`.
     * @param ctx the parse tree
     */
    enterParserRuleSpec?: (ctx: ParserRuleSpecContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.parserRuleSpec`.
     * @param ctx the parse tree
     */
    exitParserRuleSpec?: (ctx: ParserRuleSpecContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.exceptionGroup`.
     * @param ctx the parse tree
     */
    enterExceptionGroup?: (ctx: ExceptionGroupContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.exceptionGroup`.
     * @param ctx the parse tree
     */
    exitExceptionGroup?: (ctx: ExceptionGroupContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.exceptionHandler`.
     * @param ctx the parse tree
     */
    enterExceptionHandler?: (ctx: ExceptionHandlerContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.exceptionHandler`.
     * @param ctx the parse tree
     */
    exitExceptionHandler?: (ctx: ExceptionHandlerContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.finallyClause`.
     * @param ctx the parse tree
     */
    enterFinallyClause?: (ctx: FinallyClauseContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.finallyClause`.
     * @param ctx the parse tree
     */
    exitFinallyClause?: (ctx: FinallyClauseContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.rulePrequel`.
     * @param ctx the parse tree
     */
    enterRulePrequel?: (ctx: RulePrequelContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.rulePrequel`.
     * @param ctx the parse tree
     */
    exitRulePrequel?: (ctx: RulePrequelContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.ruleReturns`.
     * @param ctx the parse tree
     */
    enterRuleReturns?: (ctx: RuleReturnsContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.ruleReturns`.
     * @param ctx the parse tree
     */
    exitRuleReturns?: (ctx: RuleReturnsContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.throwsSpec`.
     * @param ctx the parse tree
     */
    enterThrowsSpec?: (ctx: ThrowsSpecContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.throwsSpec`.
     * @param ctx the parse tree
     */
    exitThrowsSpec?: (ctx: ThrowsSpecContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.localsSpec`.
     * @param ctx the parse tree
     */
    enterLocalsSpec?: (ctx: LocalsSpecContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.localsSpec`.
     * @param ctx the parse tree
     */
    exitLocalsSpec?: (ctx: LocalsSpecContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.ruleAction`.
     * @param ctx the parse tree
     */
    enterRuleAction?: (ctx: RuleActionContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.ruleAction`.
     * @param ctx the parse tree
     */
    exitRuleAction?: (ctx: RuleActionContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.ruleModifiers`.
     * @param ctx the parse tree
     */
    enterRuleModifiers?: (ctx: RuleModifiersContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.ruleModifiers`.
     * @param ctx the parse tree
     */
    exitRuleModifiers?: (ctx: RuleModifiersContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.ruleModifier`.
     * @param ctx the parse tree
     */
    enterRuleModifier?: (ctx: RuleModifierContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.ruleModifier`.
     * @param ctx the parse tree
     */
    exitRuleModifier?: (ctx: RuleModifierContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.ruleBlock`.
     * @param ctx the parse tree
     */
    enterRuleBlock?: (ctx: RuleBlockContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.ruleBlock`.
     * @param ctx the parse tree
     */
    exitRuleBlock?: (ctx: RuleBlockContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.ruleAltList`.
     * @param ctx the parse tree
     */
    enterRuleAltList?: (ctx: RuleAltListContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.ruleAltList`.
     * @param ctx the parse tree
     */
    exitRuleAltList?: (ctx: RuleAltListContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.labeledAlt`.
     * @param ctx the parse tree
     */
    enterLabeledAlt?: (ctx: LabeledAltContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.labeledAlt`.
     * @param ctx the parse tree
     */
    exitLabeledAlt?: (ctx: LabeledAltContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerRuleSpec`.
     * @param ctx the parse tree
     */
    enterLexerRuleSpec?: (ctx: LexerRuleSpecContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerRuleSpec`.
     * @param ctx the parse tree
     */
    exitLexerRuleSpec?: (ctx: LexerRuleSpecContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerRuleBlock`.
     * @param ctx the parse tree
     */
    enterLexerRuleBlock?: (ctx: LexerRuleBlockContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerRuleBlock`.
     * @param ctx the parse tree
     */
    exitLexerRuleBlock?: (ctx: LexerRuleBlockContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerAltList`.
     * @param ctx the parse tree
     */
    enterLexerAltList?: (ctx: LexerAltListContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerAltList`.
     * @param ctx the parse tree
     */
    exitLexerAltList?: (ctx: LexerAltListContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerAlt`.
     * @param ctx the parse tree
     */
    enterLexerAlt?: (ctx: LexerAltContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerAlt`.
     * @param ctx the parse tree
     */
    exitLexerAlt?: (ctx: LexerAltContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerElements`.
     * @param ctx the parse tree
     */
    enterLexerElements?: (ctx: LexerElementsContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerElements`.
     * @param ctx the parse tree
     */
    exitLexerElements?: (ctx: LexerElementsContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerElement`.
     * @param ctx the parse tree
     */
    enterLexerElement?: (ctx: LexerElementContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerElement`.
     * @param ctx the parse tree
     */
    exitLexerElement?: (ctx: LexerElementContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.labeledLexerElement`.
     * @param ctx the parse tree
     */
    enterLabeledLexerElement?: (ctx: LabeledLexerElementContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.labeledLexerElement`.
     * @param ctx the parse tree
     */
    exitLabeledLexerElement?: (ctx: LabeledLexerElementContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerBlock`.
     * @param ctx the parse tree
     */
    enterLexerBlock?: (ctx: LexerBlockContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerBlock`.
     * @param ctx the parse tree
     */
    exitLexerBlock?: (ctx: LexerBlockContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerCommands`.
     * @param ctx the parse tree
     */
    enterLexerCommands?: (ctx: LexerCommandsContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerCommands`.
     * @param ctx the parse tree
     */
    exitLexerCommands?: (ctx: LexerCommandsContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerCommand`.
     * @param ctx the parse tree
     */
    enterLexerCommand?: (ctx: LexerCommandContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerCommand`.
     * @param ctx the parse tree
     */
    exitLexerCommand?: (ctx: LexerCommandContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerCommandName`.
     * @param ctx the parse tree
     */
    enterLexerCommandName?: (ctx: LexerCommandNameContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerCommandName`.
     * @param ctx the parse tree
     */
    exitLexerCommandName?: (ctx: LexerCommandNameContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerCommandExpr`.
     * @param ctx the parse tree
     */
    enterLexerCommandExpr?: (ctx: LexerCommandExprContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerCommandExpr`.
     * @param ctx the parse tree
     */
    exitLexerCommandExpr?: (ctx: LexerCommandExprContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.altList`.
     * @param ctx the parse tree
     */
    enterAltList?: (ctx: AltListContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.altList`.
     * @param ctx the parse tree
     */
    exitAltList?: (ctx: AltListContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.alternative`.
     * @param ctx the parse tree
     */
    enterAlternative?: (ctx: AlternativeContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.alternative`.
     * @param ctx the parse tree
     */
    exitAlternative?: (ctx: AlternativeContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.element`.
     * @param ctx the parse tree
     */
    enterElement?: (ctx: ElementContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.element`.
     * @param ctx the parse tree
     */
    exitElement?: (ctx: ElementContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.labeledElement`.
     * @param ctx the parse tree
     */
    enterLabeledElement?: (ctx: LabeledElementContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.labeledElement`.
     * @param ctx the parse tree
     */
    exitLabeledElement?: (ctx: LabeledElementContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.ebnf`.
     * @param ctx the parse tree
     */
    enterEbnf?: (ctx: EbnfContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.ebnf`.
     * @param ctx the parse tree
     */
    exitEbnf?: (ctx: EbnfContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.blockSuffix`.
     * @param ctx the parse tree
     */
    enterBlockSuffix?: (ctx: BlockSuffixContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.blockSuffix`.
     * @param ctx the parse tree
     */
    exitBlockSuffix?: (ctx: BlockSuffixContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.ebnfSuffix`.
     * @param ctx the parse tree
     */
    enterEbnfSuffix?: (ctx: EbnfSuffixContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.ebnfSuffix`.
     * @param ctx the parse tree
     */
    exitEbnfSuffix?: (ctx: EbnfSuffixContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.lexerAtom`.
     * @param ctx the parse tree
     */
    enterLexerAtom?: (ctx: LexerAtomContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.lexerAtom`.
     * @param ctx the parse tree
     */
    exitLexerAtom?: (ctx: LexerAtomContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.atom`.
     * @param ctx the parse tree
     */
    enterAtom?: (ctx: AtomContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.atom`.
     * @param ctx the parse tree
     */
    exitAtom?: (ctx: AtomContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.notSet`.
     * @param ctx the parse tree
     */
    enterNotSet?: (ctx: NotSetContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.notSet`.
     * @param ctx the parse tree
     */
    exitNotSet?: (ctx: NotSetContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.blockSet`.
     * @param ctx the parse tree
     */
    enterBlockSet?: (ctx: BlockSetContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.blockSet`.
     * @param ctx the parse tree
     */
    exitBlockSet?: (ctx: BlockSetContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.setElement`.
     * @param ctx the parse tree
     */
    enterSetElement?: (ctx: SetElementContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.setElement`.
     * @param ctx the parse tree
     */
    exitSetElement?: (ctx: SetElementContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.block`.
     * @param ctx the parse tree
     */
    enterBlock?: (ctx: BlockContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.block`.
     * @param ctx the parse tree
     */
    exitBlock?: (ctx: BlockContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.ruleref`.
     * @param ctx the parse tree
     */
    enterRuleref?: (ctx: RulerefContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.ruleref`.
     * @param ctx the parse tree
     */
    exitRuleref?: (ctx: RulerefContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.characterRange`.
     * @param ctx the parse tree
     */
    enterCharacterRange?: (ctx: CharacterRangeContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.characterRange`.
     * @param ctx the parse tree
     */
    exitCharacterRange?: (ctx: CharacterRangeContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.terminalRule`.
     * @param ctx the parse tree
     */
    enterTerminalRule?: (ctx: TerminalRuleContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.terminalRule`.
     * @param ctx the parse tree
     */
    exitTerminalRule?: (ctx: TerminalRuleContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.elementOptions`.
     * @param ctx the parse tree
     */
    enterElementOptions?: (ctx: ElementOptionsContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.elementOptions`.
     * @param ctx the parse tree
     */
    exitElementOptions?: (ctx: ElementOptionsContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.elementOption`.
     * @param ctx the parse tree
     */
    enterElementOption?: (ctx: ElementOptionContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.elementOption`.
     * @param ctx the parse tree
     */
    exitElementOption?: (ctx: ElementOptionContext) => void;
    /**
     * Enter a parse tree produced by `ANTLRv4Parser.identifier`.
     * @param ctx the parse tree
     */
    enterIdentifier?: (ctx: IdentifierContext) => void;
    /**
     * Exit a parse tree produced by `ANTLRv4Parser.identifier`.
     * @param ctx the parse tree
     */
    exitIdentifier?: (ctx: IdentifierContext) => void;

    visitTerminal(node: TerminalNode): void {}
    visitErrorNode(node: ErrorNode): void {}
    enterEveryRule(node: ParserRuleContext): void {}
    exitEveryRule(node: ParserRuleContext): void {}
}

