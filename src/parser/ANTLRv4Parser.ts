// Generated from grammars/ANTLRv4Parser.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";

import { ANTLRv4ParserListener } from "./ANTLRv4ParserListener.js";
import { ANTLRv4ParserVisitor } from "./ANTLRv4ParserVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;


export class ANTLRv4Parser extends antlr.Parser {
    public static readonly TOKEN_REF = 1;
    public static readonly RULE_REF = 2;
    public static readonly LEXER_CHAR_SET = 3;
    public static readonly DOC_COMMENT = 4;
    public static readonly BLOCK_COMMENT = 5;
    public static readonly LINE_COMMENT = 6;
    public static readonly INT = 7;
    public static readonly STRING_LITERAL = 8;
    public static readonly UNTERMINATED_STRING_LITERAL = 9;
    public static readonly BEGIN_ARGUMENT = 10;
    public static readonly BEGIN_ACTION = 11;
    public static readonly OPTIONS = 12;
    public static readonly TOKENS = 13;
    public static readonly CHANNELS = 14;
    public static readonly IMPORT = 15;
    public static readonly FRAGMENT = 16;
    public static readonly LEXER = 17;
    public static readonly PARSER = 18;
    public static readonly GRAMMAR = 19;
    public static readonly PROTECTED = 20;
    public static readonly PUBLIC = 21;
    public static readonly PRIVATE = 22;
    public static readonly RETURNS = 23;
    public static readonly LOCALS = 24;
    public static readonly THROWS = 25;
    public static readonly CATCH = 26;
    public static readonly FINALLY = 27;
    public static readonly MODE = 28;
    public static readonly COLON = 29;
    public static readonly COLONCOLON = 30;
    public static readonly COMMA = 31;
    public static readonly SEMI = 32;
    public static readonly LPAREN = 33;
    public static readonly RPAREN = 34;
    public static readonly LBRACE = 35;
    public static readonly RBRACE = 36;
    public static readonly RARROW = 37;
    public static readonly LT = 38;
    public static readonly GT = 39;
    public static readonly ASSIGN = 40;
    public static readonly QUESTION = 41;
    public static readonly STAR = 42;
    public static readonly PLUS_ASSIGN = 43;
    public static readonly PLUS = 44;
    public static readonly OR = 45;
    public static readonly DOLLAR = 46;
    public static readonly RANGE = 47;
    public static readonly DOT = 48;
    public static readonly AT = 49;
    public static readonly POUND = 50;
    public static readonly NOT = 51;
    public static readonly ID = 52;
    public static readonly WS = 53;
    public static readonly ERRCHAR = 54;
    public static readonly END_ARGUMENT = 55;
    public static readonly UNTERMINATED_ARGUMENT = 56;
    public static readonly ARGUMENT_CONTENT = 57;
    public static readonly END_ACTION = 58;
    public static readonly UNTERMINATED_ACTION = 59;
    public static readonly ACTION_CONTENT = 60;
    public static readonly UNTERMINATED_CHAR_SET = 61;
    public static readonly RULE_grammarSpec = 0;
    public static readonly RULE_grammarDecl = 1;
    public static readonly RULE_grammarType = 2;
    public static readonly RULE_prequelConstruct = 3;
    public static readonly RULE_optionsSpec = 4;
    public static readonly RULE_option = 5;
    public static readonly RULE_optionValue = 6;
    public static readonly RULE_delegateGrammars = 7;
    public static readonly RULE_delegateGrammar = 8;
    public static readonly RULE_tokensSpec = 9;
    public static readonly RULE_channelsSpec = 10;
    public static readonly RULE_idList = 11;
    public static readonly RULE_action_ = 12;
    public static readonly RULE_actionScopeName = 13;
    public static readonly RULE_actionBlock = 14;
    public static readonly RULE_argActionBlock = 15;
    public static readonly RULE_modeSpec = 16;
    public static readonly RULE_rules = 17;
    public static readonly RULE_ruleSpec = 18;
    public static readonly RULE_parserRuleSpec = 19;
    public static readonly RULE_exceptionGroup = 20;
    public static readonly RULE_exceptionHandler = 21;
    public static readonly RULE_finallyClause = 22;
    public static readonly RULE_rulePrequel = 23;
    public static readonly RULE_ruleReturns = 24;
    public static readonly RULE_throwsSpec = 25;
    public static readonly RULE_localsSpec = 26;
    public static readonly RULE_ruleAction = 27;
    public static readonly RULE_ruleModifiers = 28;
    public static readonly RULE_ruleModifier = 29;
    public static readonly RULE_ruleBlock = 30;
    public static readonly RULE_ruleAltList = 31;
    public static readonly RULE_labeledAlt = 32;
    public static readonly RULE_lexerRuleSpec = 33;
    public static readonly RULE_lexerRuleBlock = 34;
    public static readonly RULE_lexerAltList = 35;
    public static readonly RULE_lexerAlt = 36;
    public static readonly RULE_lexerElements = 37;
    public static readonly RULE_lexerElement = 38;
    public static readonly RULE_lexerBlock = 39;
    public static readonly RULE_lexerCommands = 40;
    public static readonly RULE_lexerCommand = 41;
    public static readonly RULE_lexerCommandName = 42;
    public static readonly RULE_lexerCommandExpr = 43;
    public static readonly RULE_altList = 44;
    public static readonly RULE_alternative = 45;
    public static readonly RULE_element = 46;
    public static readonly RULE_predicateOptions = 47;
    public static readonly RULE_predicateOption = 48;
    public static readonly RULE_labeledElement = 49;
    public static readonly RULE_ebnf = 50;
    public static readonly RULE_blockSuffix = 51;
    public static readonly RULE_ebnfSuffix = 52;
    public static readonly RULE_lexerAtom = 53;
    public static readonly RULE_atom = 54;
    public static readonly RULE_notSet = 55;
    public static readonly RULE_blockSet = 56;
    public static readonly RULE_setElement = 57;
    public static readonly RULE_block = 58;
    public static readonly RULE_ruleref = 59;
    public static readonly RULE_characterRange = 60;
    public static readonly RULE_terminalDef = 61;
    public static readonly RULE_elementOptions = 62;
    public static readonly RULE_elementOption = 63;
    public static readonly RULE_identifier = 64;

    public static readonly literalNames = [
        null, null, null, null, null, null, null, null, null, null, null, 
        null, null, null, null, "'import'", "'fragment'", "'lexer'", "'parser'", 
        "'grammar'", "'protected'", "'public'", "'private'", "'returns'", 
        "'locals'", "'throws'", "'catch'", "'finally'", "'mode'"
    ];

    public static readonly symbolicNames = [
        null, "TOKEN_REF", "RULE_REF", "LEXER_CHAR_SET", "DOC_COMMENT", 
        "BLOCK_COMMENT", "LINE_COMMENT", "INT", "STRING_LITERAL", "UNTERMINATED_STRING_LITERAL", 
        "BEGIN_ARGUMENT", "BEGIN_ACTION", "OPTIONS", "TOKENS", "CHANNELS", 
        "IMPORT", "FRAGMENT", "LEXER", "PARSER", "GRAMMAR", "PROTECTED", 
        "PUBLIC", "PRIVATE", "RETURNS", "LOCALS", "THROWS", "CATCH", "FINALLY", 
        "MODE", "COLON", "COLONCOLON", "COMMA", "SEMI", "LPAREN", "RPAREN", 
        "LBRACE", "RBRACE", "RARROW", "LT", "GT", "ASSIGN", "QUESTION", 
        "STAR", "PLUS_ASSIGN", "PLUS", "OR", "DOLLAR", "RANGE", "DOT", "AT", 
        "POUND", "NOT", "ID", "WS", "ERRCHAR", "END_ARGUMENT", "UNTERMINATED_ARGUMENT", 
        "ARGUMENT_CONTENT", "END_ACTION", "UNTERMINATED_ACTION", "ACTION_CONTENT", 
        "UNTERMINATED_CHAR_SET"
    ];
    public static readonly ruleNames = [
        "grammarSpec", "grammarDecl", "grammarType", "prequelConstruct", 
        "optionsSpec", "option", "optionValue", "delegateGrammars", "delegateGrammar", 
        "tokensSpec", "channelsSpec", "idList", "action_", "actionScopeName", 
        "actionBlock", "argActionBlock", "modeSpec", "rules", "ruleSpec", 
        "parserRuleSpec", "exceptionGroup", "exceptionHandler", "finallyClause", 
        "rulePrequel", "ruleReturns", "throwsSpec", "localsSpec", "ruleAction", 
        "ruleModifiers", "ruleModifier", "ruleBlock", "ruleAltList", "labeledAlt", 
        "lexerRuleSpec", "lexerRuleBlock", "lexerAltList", "lexerAlt", "lexerElements", 
        "lexerElement", "lexerBlock", "lexerCommands", "lexerCommand", "lexerCommandName", 
        "lexerCommandExpr", "altList", "alternative", "element", "predicateOptions", 
        "predicateOption", "labeledElement", "ebnf", "blockSuffix", "ebnfSuffix", 
        "lexerAtom", "atom", "notSet", "blockSet", "setElement", "block", 
        "ruleref", "characterRange", "terminalDef", "elementOptions", "elementOption", 
        "identifier",
    ];

    public get grammarFileName(): string { return "ANTLRv4Parser.g4"; }
    public get literalNames(): (string | null)[] { return ANTLRv4Parser.literalNames; }
    public get symbolicNames(): (string | null)[] { return ANTLRv4Parser.symbolicNames; }
    public get ruleNames(): string[] { return ANTLRv4Parser.ruleNames; }
    public get serializedATN(): number[] { return ANTLRv4Parser._serializedATN; }

    protected createFailedPredicateException(predicate?: string, message?: string): antlr.FailedPredicateException {
        return new antlr.FailedPredicateException(this, predicate, message);
    }

    public constructor(input: antlr.TokenStream) {
        super(input);
        this.interpreter = new antlr.ParserATNSimulator(this, ANTLRv4Parser._ATN, ANTLRv4Parser.decisionsToDFA, new antlr.PredictionContextCache());
    }
    public grammarSpec(): GrammarSpecContext {
        let localContext = new GrammarSpecContext(this.context, this.state);
        this.enterRule(localContext, 0, ANTLRv4Parser.RULE_grammarSpec);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 130;
            this.grammarDecl();
            this.state = 134;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 61440) !== 0) || _la === 49) {
                {
                {
                this.state = 131;
                this.prequelConstruct();
                }
                }
                this.state = 136;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 137;
            this.rules();
            this.state = 141;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 28) {
                {
                {
                this.state = 138;
                this.modeSpec();
                }
                }
                this.state = 143;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 144;
            this.match(ANTLRv4Parser.EOF);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public grammarDecl(): GrammarDeclContext {
        let localContext = new GrammarDeclContext(this.context, this.state);
        this.enterRule(localContext, 2, ANTLRv4Parser.RULE_grammarDecl);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 146;
            this.grammarType();
            this.state = 147;
            this.identifier();
            this.state = 148;
            this.match(ANTLRv4Parser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public grammarType(): GrammarTypeContext {
        let localContext = new GrammarTypeContext(this.context, this.state);
        this.enterRule(localContext, 4, ANTLRv4Parser.RULE_grammarType);
        try {
            this.state = 155;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.LEXER:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 150;
                this.match(ANTLRv4Parser.LEXER);
                this.state = 151;
                this.match(ANTLRv4Parser.GRAMMAR);
                }
                break;
            case ANTLRv4Parser.PARSER:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 152;
                this.match(ANTLRv4Parser.PARSER);
                this.state = 153;
                this.match(ANTLRv4Parser.GRAMMAR);
                }
                break;
            case ANTLRv4Parser.GRAMMAR:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 154;
                this.match(ANTLRv4Parser.GRAMMAR);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public prequelConstruct(): PrequelConstructContext {
        let localContext = new PrequelConstructContext(this.context, this.state);
        this.enterRule(localContext, 6, ANTLRv4Parser.RULE_prequelConstruct);
        try {
            this.state = 162;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.OPTIONS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 157;
                this.optionsSpec();
                }
                break;
            case ANTLRv4Parser.IMPORT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 158;
                this.delegateGrammars();
                }
                break;
            case ANTLRv4Parser.TOKENS:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 159;
                this.tokensSpec();
                }
                break;
            case ANTLRv4Parser.CHANNELS:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 160;
                this.channelsSpec();
                }
                break;
            case ANTLRv4Parser.AT:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 161;
                this.action_();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public optionsSpec(): OptionsSpecContext {
        let localContext = new OptionsSpecContext(this.context, this.state);
        this.enterRule(localContext, 8, ANTLRv4Parser.RULE_optionsSpec);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 164;
            this.match(ANTLRv4Parser.OPTIONS);
            this.state = 170;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 1 || _la === 2) {
                {
                {
                this.state = 165;
                this.option();
                this.state = 166;
                this.match(ANTLRv4Parser.SEMI);
                }
                }
                this.state = 172;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 173;
            this.match(ANTLRv4Parser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public option(): OptionContext {
        let localContext = new OptionContext(this.context, this.state);
        this.enterRule(localContext, 10, ANTLRv4Parser.RULE_option);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 175;
            this.identifier();
            this.state = 176;
            this.match(ANTLRv4Parser.ASSIGN);
            this.state = 177;
            this.optionValue();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public optionValue(): OptionValueContext {
        let localContext = new OptionValueContext(this.context, this.state);
        this.enterRule(localContext, 12, ANTLRv4Parser.RULE_optionValue);
        let _la: number;
        try {
            this.state = 190;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.TOKEN_REF:
            case ANTLRv4Parser.RULE_REF:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 179;
                this.identifier();
                this.state = 184;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 48) {
                    {
                    {
                    this.state = 180;
                    this.match(ANTLRv4Parser.DOT);
                    this.state = 181;
                    this.identifier();
                    }
                    }
                    this.state = 186;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                }
                break;
            case ANTLRv4Parser.STRING_LITERAL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 187;
                this.match(ANTLRv4Parser.STRING_LITERAL);
                }
                break;
            case ANTLRv4Parser.BEGIN_ACTION:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 188;
                this.actionBlock();
                }
                break;
            case ANTLRv4Parser.INT:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 189;
                this.match(ANTLRv4Parser.INT);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public delegateGrammars(): DelegateGrammarsContext {
        let localContext = new DelegateGrammarsContext(this.context, this.state);
        this.enterRule(localContext, 14, ANTLRv4Parser.RULE_delegateGrammars);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 192;
            this.match(ANTLRv4Parser.IMPORT);
            this.state = 193;
            this.delegateGrammar();
            this.state = 198;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 31) {
                {
                {
                this.state = 194;
                this.match(ANTLRv4Parser.COMMA);
                this.state = 195;
                this.delegateGrammar();
                }
                }
                this.state = 200;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 201;
            this.match(ANTLRv4Parser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public delegateGrammar(): DelegateGrammarContext {
        let localContext = new DelegateGrammarContext(this.context, this.state);
        this.enterRule(localContext, 16, ANTLRv4Parser.RULE_delegateGrammar);
        try {
            this.state = 208;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 8, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 203;
                this.identifier();
                this.state = 204;
                this.match(ANTLRv4Parser.ASSIGN);
                this.state = 205;
                this.identifier();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 207;
                this.identifier();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public tokensSpec(): TokensSpecContext {
        let localContext = new TokensSpecContext(this.context, this.state);
        this.enterRule(localContext, 18, ANTLRv4Parser.RULE_tokensSpec);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 210;
            this.match(ANTLRv4Parser.TOKENS);
            this.state = 212;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 1 || _la === 2) {
                {
                this.state = 211;
                this.idList();
                }
            }

            this.state = 214;
            this.match(ANTLRv4Parser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public channelsSpec(): ChannelsSpecContext {
        let localContext = new ChannelsSpecContext(this.context, this.state);
        this.enterRule(localContext, 20, ANTLRv4Parser.RULE_channelsSpec);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 216;
            this.match(ANTLRv4Parser.CHANNELS);
            this.state = 218;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 1 || _la === 2) {
                {
                this.state = 217;
                this.idList();
                }
            }

            this.state = 220;
            this.match(ANTLRv4Parser.RBRACE);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public idList(): IdListContext {
        let localContext = new IdListContext(this.context, this.state);
        this.enterRule(localContext, 22, ANTLRv4Parser.RULE_idList);
        let _la: number;
        try {
            let alternative: number;
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 222;
            this.identifier();
            this.state = 227;
            this.errorHandler.sync(this);
            alternative = this.interpreter.adaptivePredict(this.tokenStream, 11, this.context);
            while (alternative !== 2 && alternative !== antlr.ATN.INVALID_ALT_NUMBER) {
                if (alternative === 1) {
                    {
                    {
                    this.state = 223;
                    this.match(ANTLRv4Parser.COMMA);
                    this.state = 224;
                    this.identifier();
                    }
                    }
                }
                this.state = 229;
                this.errorHandler.sync(this);
                alternative = this.interpreter.adaptivePredict(this.tokenStream, 11, this.context);
            }
            this.state = 231;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 31) {
                {
                this.state = 230;
                this.match(ANTLRv4Parser.COMMA);
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public action_(): Action_Context {
        let localContext = new Action_Context(this.context, this.state);
        this.enterRule(localContext, 24, ANTLRv4Parser.RULE_action_);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 233;
            this.match(ANTLRv4Parser.AT);
            this.state = 237;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 13, this.context) ) {
            case 1:
                {
                this.state = 234;
                this.actionScopeName();
                this.state = 235;
                this.match(ANTLRv4Parser.COLONCOLON);
                }
                break;
            }
            this.state = 239;
            this.identifier();
            this.state = 240;
            this.actionBlock();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public actionScopeName(): ActionScopeNameContext {
        let localContext = new ActionScopeNameContext(this.context, this.state);
        this.enterRule(localContext, 26, ANTLRv4Parser.RULE_actionScopeName);
        try {
            this.state = 245;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.TOKEN_REF:
            case ANTLRv4Parser.RULE_REF:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 242;
                this.identifier();
                }
                break;
            case ANTLRv4Parser.LEXER:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 243;
                this.match(ANTLRv4Parser.LEXER);
                }
                break;
            case ANTLRv4Parser.PARSER:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 244;
                this.match(ANTLRv4Parser.PARSER);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public actionBlock(): ActionBlockContext {
        let localContext = new ActionBlockContext(this.context, this.state);
        this.enterRule(localContext, 28, ANTLRv4Parser.RULE_actionBlock);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 247;
            this.match(ANTLRv4Parser.BEGIN_ACTION);
            this.state = 251;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 60) {
                {
                {
                this.state = 248;
                this.match(ANTLRv4Parser.ACTION_CONTENT);
                }
                }
                this.state = 253;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 254;
            this.match(ANTLRv4Parser.END_ACTION);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public argActionBlock(): ArgActionBlockContext {
        let localContext = new ArgActionBlockContext(this.context, this.state);
        this.enterRule(localContext, 30, ANTLRv4Parser.RULE_argActionBlock);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 256;
            this.match(ANTLRv4Parser.BEGIN_ARGUMENT);
            this.state = 260;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 57) {
                {
                {
                this.state = 257;
                this.match(ANTLRv4Parser.ARGUMENT_CONTENT);
                }
                }
                this.state = 262;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 263;
            this.match(ANTLRv4Parser.END_ARGUMENT);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public modeSpec(): ModeSpecContext {
        let localContext = new ModeSpecContext(this.context, this.state);
        this.enterRule(localContext, 32, ANTLRv4Parser.RULE_modeSpec);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 265;
            this.match(ANTLRv4Parser.MODE);
            this.state = 266;
            this.identifier();
            this.state = 267;
            this.match(ANTLRv4Parser.SEMI);
            this.state = 271;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 1 || _la === 16) {
                {
                {
                this.state = 268;
                this.lexerRuleSpec();
                }
                }
                this.state = 273;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public rules(): RulesContext {
        let localContext = new RulesContext(this.context, this.state);
        this.enterRule(localContext, 34, ANTLRv4Parser.RULE_rules);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 277;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 7405574) !== 0)) {
                {
                {
                this.state = 274;
                this.ruleSpec();
                }
                }
                this.state = 279;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ruleSpec(): RuleSpecContext {
        let localContext = new RuleSpecContext(this.context, this.state);
        this.enterRule(localContext, 36, ANTLRv4Parser.RULE_ruleSpec);
        try {
            this.state = 282;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 19, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 280;
                this.parserRuleSpec();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 281;
                this.lexerRuleSpec();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public parserRuleSpec(): ParserRuleSpecContext {
        let localContext = new ParserRuleSpecContext(this.context, this.state);
        this.enterRule(localContext, 38, ANTLRv4Parser.RULE_parserRuleSpec);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 285;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 7405568) !== 0)) {
                {
                this.state = 284;
                this.ruleModifiers();
                }
            }

            this.state = 287;
            this.match(ANTLRv4Parser.RULE_REF);
            this.state = 289;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 288;
                this.argActionBlock();
                }
            }

            this.state = 292;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 23) {
                {
                this.state = 291;
                this.ruleReturns();
                }
            }

            this.state = 295;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 25) {
                {
                this.state = 294;
                this.throwsSpec();
                }
            }

            this.state = 298;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 24) {
                {
                this.state = 297;
                this.localsSpec();
                }
            }

            this.state = 303;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 12 || _la === 49) {
                {
                {
                this.state = 300;
                this.rulePrequel();
                }
                }
                this.state = 305;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 306;
            this.match(ANTLRv4Parser.COLON);
            this.state = 307;
            this.ruleBlock();
            this.state = 308;
            this.match(ANTLRv4Parser.SEMI);
            this.state = 309;
            this.exceptionGroup();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public exceptionGroup(): ExceptionGroupContext {
        let localContext = new ExceptionGroupContext(this.context, this.state);
        this.enterRule(localContext, 40, ANTLRv4Parser.RULE_exceptionGroup);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 314;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 26) {
                {
                {
                this.state = 311;
                this.exceptionHandler();
                }
                }
                this.state = 316;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 318;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 27) {
                {
                this.state = 317;
                this.finallyClause();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public exceptionHandler(): ExceptionHandlerContext {
        let localContext = new ExceptionHandlerContext(this.context, this.state);
        this.enterRule(localContext, 42, ANTLRv4Parser.RULE_exceptionHandler);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 320;
            this.match(ANTLRv4Parser.CATCH);
            this.state = 321;
            this.argActionBlock();
            this.state = 322;
            this.actionBlock();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public finallyClause(): FinallyClauseContext {
        let localContext = new FinallyClauseContext(this.context, this.state);
        this.enterRule(localContext, 44, ANTLRv4Parser.RULE_finallyClause);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 324;
            this.match(ANTLRv4Parser.FINALLY);
            this.state = 325;
            this.actionBlock();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public rulePrequel(): RulePrequelContext {
        let localContext = new RulePrequelContext(this.context, this.state);
        this.enterRule(localContext, 46, ANTLRv4Parser.RULE_rulePrequel);
        try {
            this.state = 329;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.OPTIONS:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 327;
                this.optionsSpec();
                }
                break;
            case ANTLRv4Parser.AT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 328;
                this.ruleAction();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ruleReturns(): RuleReturnsContext {
        let localContext = new RuleReturnsContext(this.context, this.state);
        this.enterRule(localContext, 48, ANTLRv4Parser.RULE_ruleReturns);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 331;
            this.match(ANTLRv4Parser.RETURNS);
            this.state = 332;
            this.argActionBlock();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public throwsSpec(): ThrowsSpecContext {
        let localContext = new ThrowsSpecContext(this.context, this.state);
        this.enterRule(localContext, 50, ANTLRv4Parser.RULE_throwsSpec);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 334;
            this.match(ANTLRv4Parser.THROWS);
            this.state = 335;
            this.identifier();
            this.state = 340;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 31) {
                {
                {
                this.state = 336;
                this.match(ANTLRv4Parser.COMMA);
                this.state = 337;
                this.identifier();
                }
                }
                this.state = 342;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public localsSpec(): LocalsSpecContext {
        let localContext = new LocalsSpecContext(this.context, this.state);
        this.enterRule(localContext, 52, ANTLRv4Parser.RULE_localsSpec);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 343;
            this.match(ANTLRv4Parser.LOCALS);
            this.state = 344;
            this.argActionBlock();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ruleAction(): RuleActionContext {
        let localContext = new RuleActionContext(this.context, this.state);
        this.enterRule(localContext, 54, ANTLRv4Parser.RULE_ruleAction);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 346;
            this.match(ANTLRv4Parser.AT);
            this.state = 347;
            this.identifier();
            this.state = 348;
            this.actionBlock();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ruleModifiers(): RuleModifiersContext {
        let localContext = new RuleModifiersContext(this.context, this.state);
        this.enterRule(localContext, 56, ANTLRv4Parser.RULE_ruleModifiers);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 351;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            do {
                {
                {
                this.state = 350;
                this.ruleModifier();
                }
                }
                this.state = 353;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 7405568) !== 0));
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ruleModifier(): RuleModifierContext {
        let localContext = new RuleModifierContext(this.context, this.state);
        this.enterRule(localContext, 58, ANTLRv4Parser.RULE_ruleModifier);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 355;
            _la = this.tokenStream.LA(1);
            if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 7405568) !== 0))) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ruleBlock(): RuleBlockContext {
        let localContext = new RuleBlockContext(this.context, this.state);
        this.enterRule(localContext, 60, ANTLRv4Parser.RULE_ruleBlock);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 357;
            this.ruleAltList();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ruleAltList(): RuleAltListContext {
        let localContext = new RuleAltListContext(this.context, this.state);
        this.enterRule(localContext, 62, ANTLRv4Parser.RULE_ruleAltList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 359;
            this.labeledAlt();
            this.state = 364;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 45) {
                {
                {
                this.state = 360;
                this.match(ANTLRv4Parser.OR);
                this.state = 361;
                this.labeledAlt();
                }
                }
                this.state = 366;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public labeledAlt(): LabeledAltContext {
        let localContext = new LabeledAltContext(this.context, this.state);
        this.enterRule(localContext, 64, ANTLRv4Parser.RULE_labeledAlt);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 367;
            this.alternative();
            this.state = 370;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 50) {
                {
                this.state = 368;
                this.match(ANTLRv4Parser.POUND);
                this.state = 369;
                this.identifier();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerRuleSpec(): LexerRuleSpecContext {
        let localContext = new LexerRuleSpecContext(this.context, this.state);
        this.enterRule(localContext, 66, ANTLRv4Parser.RULE_lexerRuleSpec);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 373;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 16) {
                {
                this.state = 372;
                this.match(ANTLRv4Parser.FRAGMENT);
                }
            }

            this.state = 375;
            this.match(ANTLRv4Parser.TOKEN_REF);
            this.state = 377;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 12) {
                {
                this.state = 376;
                this.optionsSpec();
                }
            }

            this.state = 379;
            this.match(ANTLRv4Parser.COLON);
            this.state = 380;
            this.lexerRuleBlock();
            this.state = 381;
            this.match(ANTLRv4Parser.SEMI);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerRuleBlock(): LexerRuleBlockContext {
        let localContext = new LexerRuleBlockContext(this.context, this.state);
        this.enterRule(localContext, 68, ANTLRv4Parser.RULE_lexerRuleBlock);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 383;
            this.lexerAltList();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerAltList(): LexerAltListContext {
        let localContext = new LexerAltListContext(this.context, this.state);
        this.enterRule(localContext, 70, ANTLRv4Parser.RULE_lexerAltList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 385;
            this.lexerAlt();
            this.state = 390;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 45) {
                {
                {
                this.state = 386;
                this.match(ANTLRv4Parser.OR);
                this.state = 387;
                this.lexerAlt();
                }
                }
                this.state = 392;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerAlt(): LexerAltContext {
        let localContext = new LexerAltContext(this.context, this.state);
        this.enterRule(localContext, 72, ANTLRv4Parser.RULE_lexerAlt);
        let _la: number;
        try {
            this.state = 398;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 37, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 393;
                this.lexerElements();
                this.state = 395;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 37) {
                    {
                    this.state = 394;
                    this.lexerCommands();
                    }
                }

                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                // tslint:disable-next-line:no-empty
                {
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerElements(): LexerElementsContext {
        let localContext = new LexerElementsContext(this.context, this.state);
        this.enterRule(localContext, 74, ANTLRv4Parser.RULE_lexerElements);
        let _la: number;
        try {
            this.state = 406;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.TOKEN_REF:
            case ANTLRv4Parser.LEXER_CHAR_SET:
            case ANTLRv4Parser.STRING_LITERAL:
            case ANTLRv4Parser.BEGIN_ACTION:
            case ANTLRv4Parser.LPAREN:
            case ANTLRv4Parser.DOT:
            case ANTLRv4Parser.NOT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 401;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 400;
                    this.lexerElement();
                    }
                    }
                    this.state = 403;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2314) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & 294913) !== 0));
                }
                break;
            case ANTLRv4Parser.SEMI:
            case ANTLRv4Parser.RPAREN:
            case ANTLRv4Parser.RARROW:
            case ANTLRv4Parser.OR:
                this.enterOuterAlt(localContext, 2);
                // tslint:disable-next-line:no-empty
                {
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerElement(): LexerElementContext {
        let localContext = new LexerElementContext(this.context, this.state);
        this.enterRule(localContext, 76, ANTLRv4Parser.RULE_lexerElement);
        let _la: number;
        try {
            this.state = 420;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.TOKEN_REF:
            case ANTLRv4Parser.LEXER_CHAR_SET:
            case ANTLRv4Parser.STRING_LITERAL:
            case ANTLRv4Parser.DOT:
            case ANTLRv4Parser.NOT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 408;
                this.lexerAtom();
                this.state = 410;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (((((_la - 41)) & ~0x1F) === 0 && ((1 << (_la - 41)) & 11) !== 0)) {
                    {
                    this.state = 409;
                    this.ebnfSuffix();
                    }
                }

                }
                break;
            case ANTLRv4Parser.LPAREN:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 412;
                this.lexerBlock();
                this.state = 414;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (((((_la - 41)) & ~0x1F) === 0 && ((1 << (_la - 41)) & 11) !== 0)) {
                    {
                    this.state = 413;
                    this.ebnfSuffix();
                    }
                }

                }
                break;
            case ANTLRv4Parser.BEGIN_ACTION:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 416;
                this.actionBlock();
                this.state = 418;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 41) {
                    {
                    this.state = 417;
                    this.match(ANTLRv4Parser.QUESTION);
                    }
                }

                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerBlock(): LexerBlockContext {
        let localContext = new LexerBlockContext(this.context, this.state);
        this.enterRule(localContext, 78, ANTLRv4Parser.RULE_lexerBlock);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 422;
            this.match(ANTLRv4Parser.LPAREN);
            this.state = 423;
            this.lexerAltList();
            this.state = 424;
            this.match(ANTLRv4Parser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerCommands(): LexerCommandsContext {
        let localContext = new LexerCommandsContext(this.context, this.state);
        this.enterRule(localContext, 80, ANTLRv4Parser.RULE_lexerCommands);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 426;
            this.match(ANTLRv4Parser.RARROW);
            this.state = 427;
            this.lexerCommand();
            this.state = 432;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 31) {
                {
                {
                this.state = 428;
                this.match(ANTLRv4Parser.COMMA);
                this.state = 429;
                this.lexerCommand();
                }
                }
                this.state = 434;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerCommand(): LexerCommandContext {
        let localContext = new LexerCommandContext(this.context, this.state);
        this.enterRule(localContext, 82, ANTLRv4Parser.RULE_lexerCommand);
        try {
            this.state = 441;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 45, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 435;
                this.lexerCommandName();
                this.state = 436;
                this.match(ANTLRv4Parser.LPAREN);
                this.state = 437;
                this.lexerCommandExpr();
                this.state = 438;
                this.match(ANTLRv4Parser.RPAREN);
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 440;
                this.lexerCommandName();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerCommandName(): LexerCommandNameContext {
        let localContext = new LexerCommandNameContext(this.context, this.state);
        this.enterRule(localContext, 84, ANTLRv4Parser.RULE_lexerCommandName);
        try {
            this.state = 445;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.TOKEN_REF:
            case ANTLRv4Parser.RULE_REF:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 443;
                this.identifier();
                }
                break;
            case ANTLRv4Parser.MODE:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 444;
                this.match(ANTLRv4Parser.MODE);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerCommandExpr(): LexerCommandExprContext {
        let localContext = new LexerCommandExprContext(this.context, this.state);
        this.enterRule(localContext, 86, ANTLRv4Parser.RULE_lexerCommandExpr);
        try {
            this.state = 449;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.TOKEN_REF:
            case ANTLRv4Parser.RULE_REF:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 447;
                this.identifier();
                }
                break;
            case ANTLRv4Parser.INT:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 448;
                this.match(ANTLRv4Parser.INT);
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public altList(): AltListContext {
        let localContext = new AltListContext(this.context, this.state);
        this.enterRule(localContext, 88, ANTLRv4Parser.RULE_altList);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 451;
            this.alternative();
            this.state = 456;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 45) {
                {
                {
                this.state = 452;
                this.match(ANTLRv4Parser.OR);
                this.state = 453;
                this.alternative();
                }
                }
                this.state = 458;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public alternative(): AlternativeContext {
        let localContext = new AlternativeContext(this.context, this.state);
        this.enterRule(localContext, 90, ANTLRv4Parser.RULE_alternative);
        let _la: number;
        try {
            this.state = 468;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.TOKEN_REF:
            case ANTLRv4Parser.RULE_REF:
            case ANTLRv4Parser.STRING_LITERAL:
            case ANTLRv4Parser.BEGIN_ACTION:
            case ANTLRv4Parser.LPAREN:
            case ANTLRv4Parser.LT:
            case ANTLRv4Parser.DOT:
            case ANTLRv4Parser.NOT:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 460;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 38) {
                    {
                    this.state = 459;
                    this.elementOptions();
                    }
                }

                this.state = 463;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                do {
                    {
                    {
                    this.state = 462;
                    this.element();
                    }
                    }
                    this.state = 465;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 2310) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & 294913) !== 0));
                }
                break;
            case ANTLRv4Parser.SEMI:
            case ANTLRv4Parser.RPAREN:
            case ANTLRv4Parser.OR:
            case ANTLRv4Parser.POUND:
                this.enterOuterAlt(localContext, 2);
                // tslint:disable-next-line:no-empty
                {
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public element(): ElementContext {
        let localContext = new ElementContext(this.context, this.state);
        this.enterRule(localContext, 92, ANTLRv4Parser.RULE_element);
        let _la: number;
        try {
            this.state = 488;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 56, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 470;
                this.labeledElement();
                this.state = 473;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case ANTLRv4Parser.QUESTION:
                case ANTLRv4Parser.STAR:
                case ANTLRv4Parser.PLUS:
                    {
                    this.state = 471;
                    this.ebnfSuffix();
                    }
                    break;
                case ANTLRv4Parser.TOKEN_REF:
                case ANTLRv4Parser.RULE_REF:
                case ANTLRv4Parser.STRING_LITERAL:
                case ANTLRv4Parser.BEGIN_ACTION:
                case ANTLRv4Parser.SEMI:
                case ANTLRv4Parser.LPAREN:
                case ANTLRv4Parser.RPAREN:
                case ANTLRv4Parser.OR:
                case ANTLRv4Parser.DOT:
                case ANTLRv4Parser.POUND:
                case ANTLRv4Parser.NOT:
                    // tslint:disable-next-line:no-empty
                    {
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 475;
                this.atom();
                this.state = 478;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case ANTLRv4Parser.QUESTION:
                case ANTLRv4Parser.STAR:
                case ANTLRv4Parser.PLUS:
                    {
                    this.state = 476;
                    this.ebnfSuffix();
                    }
                    break;
                case ANTLRv4Parser.TOKEN_REF:
                case ANTLRv4Parser.RULE_REF:
                case ANTLRv4Parser.STRING_LITERAL:
                case ANTLRv4Parser.BEGIN_ACTION:
                case ANTLRv4Parser.SEMI:
                case ANTLRv4Parser.LPAREN:
                case ANTLRv4Parser.RPAREN:
                case ANTLRv4Parser.OR:
                case ANTLRv4Parser.DOT:
                case ANTLRv4Parser.POUND:
                case ANTLRv4Parser.NOT:
                    // tslint:disable-next-line:no-empty
                    {
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 480;
                this.ebnf();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 481;
                this.actionBlock();
                this.state = 486;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 41) {
                    {
                    this.state = 482;
                    this.match(ANTLRv4Parser.QUESTION);
                    this.state = 484;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                    if (_la === 38) {
                        {
                        this.state = 483;
                        this.predicateOptions();
                        }
                    }

                    }
                }

                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public predicateOptions(): PredicateOptionsContext {
        let localContext = new PredicateOptionsContext(this.context, this.state);
        this.enterRule(localContext, 94, ANTLRv4Parser.RULE_predicateOptions);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 490;
            this.match(ANTLRv4Parser.LT);
            this.state = 491;
            this.predicateOption();
            this.state = 496;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 31) {
                {
                {
                this.state = 492;
                this.match(ANTLRv4Parser.COMMA);
                this.state = 493;
                this.predicateOption();
                }
                }
                this.state = 498;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 499;
            this.match(ANTLRv4Parser.GT);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public predicateOption(): PredicateOptionContext {
        let localContext = new PredicateOptionContext(this.context, this.state);
        this.enterRule(localContext, 96, ANTLRv4Parser.RULE_predicateOption);
        try {
            this.state = 506;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 58, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 501;
                this.elementOption();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 502;
                this.identifier();
                this.state = 503;
                this.match(ANTLRv4Parser.ASSIGN);
                this.state = 504;
                this.actionBlock();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public labeledElement(): LabeledElementContext {
        let localContext = new LabeledElementContext(this.context, this.state);
        this.enterRule(localContext, 98, ANTLRv4Parser.RULE_labeledElement);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 508;
            this.identifier();
            this.state = 509;
            _la = this.tokenStream.LA(1);
            if(!(_la === 40 || _la === 43)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            this.state = 512;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.TOKEN_REF:
            case ANTLRv4Parser.RULE_REF:
            case ANTLRv4Parser.STRING_LITERAL:
            case ANTLRv4Parser.DOT:
            case ANTLRv4Parser.NOT:
                {
                this.state = 510;
                this.atom();
                }
                break;
            case ANTLRv4Parser.LPAREN:
                {
                this.state = 511;
                this.block();
                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ebnf(): EbnfContext {
        let localContext = new EbnfContext(this.context, this.state);
        this.enterRule(localContext, 100, ANTLRv4Parser.RULE_ebnf);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 514;
            this.block();
            this.state = 516;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (((((_la - 41)) & ~0x1F) === 0 && ((1 << (_la - 41)) & 11) !== 0)) {
                {
                this.state = 515;
                this.blockSuffix();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public blockSuffix(): BlockSuffixContext {
        let localContext = new BlockSuffixContext(this.context, this.state);
        this.enterRule(localContext, 102, ANTLRv4Parser.RULE_blockSuffix);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 518;
            this.ebnfSuffix();
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ebnfSuffix(): EbnfSuffixContext {
        let localContext = new EbnfSuffixContext(this.context, this.state);
        this.enterRule(localContext, 104, ANTLRv4Parser.RULE_ebnfSuffix);
        let _la: number;
        try {
            this.state = 532;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.QUESTION:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 520;
                this.match(ANTLRv4Parser.QUESTION);
                this.state = 522;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 41) {
                    {
                    this.state = 521;
                    this.match(ANTLRv4Parser.QUESTION);
                    }
                }

                }
                break;
            case ANTLRv4Parser.STAR:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 524;
                this.match(ANTLRv4Parser.STAR);
                this.state = 526;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 41) {
                    {
                    this.state = 525;
                    this.match(ANTLRv4Parser.QUESTION);
                    }
                }

                }
                break;
            case ANTLRv4Parser.PLUS:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 528;
                this.match(ANTLRv4Parser.PLUS);
                this.state = 530;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 41) {
                    {
                    this.state = 529;
                    this.match(ANTLRv4Parser.QUESTION);
                    }
                }

                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public lexerAtom(): LexerAtomContext {
        let localContext = new LexerAtomContext(this.context, this.state);
        this.enterRule(localContext, 106, ANTLRv4Parser.RULE_lexerAtom);
        let _la: number;
        try {
            this.state = 542;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 66, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 534;
                this.characterRange();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 535;
                this.terminalDef();
                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 536;
                this.notSet();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 537;
                this.match(ANTLRv4Parser.LEXER_CHAR_SET);
                }
                break;
            case 5:
                this.enterOuterAlt(localContext, 5);
                {
                this.state = 538;
                this.match(ANTLRv4Parser.DOT);
                this.state = 540;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 38) {
                    {
                    this.state = 539;
                    this.elementOptions();
                    }
                }

                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public atom(): AtomContext {
        let localContext = new AtomContext(this.context, this.state);
        this.enterRule(localContext, 108, ANTLRv4Parser.RULE_atom);
        let _la: number;
        try {
            this.state = 551;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.TOKEN_REF:
            case ANTLRv4Parser.STRING_LITERAL:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 544;
                this.terminalDef();
                }
                break;
            case ANTLRv4Parser.RULE_REF:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 545;
                this.ruleref();
                }
                break;
            case ANTLRv4Parser.NOT:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 546;
                this.notSet();
                }
                break;
            case ANTLRv4Parser.DOT:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 547;
                this.match(ANTLRv4Parser.DOT);
                this.state = 549;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 38) {
                    {
                    this.state = 548;
                    this.elementOptions();
                    }
                }

                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public notSet(): NotSetContext {
        let localContext = new NotSetContext(this.context, this.state);
        this.enterRule(localContext, 110, ANTLRv4Parser.RULE_notSet);
        try {
            this.state = 557;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 69, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 553;
                this.match(ANTLRv4Parser.NOT);
                this.state = 554;
                this.setElement();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 555;
                this.match(ANTLRv4Parser.NOT);
                this.state = 556;
                this.blockSet();
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public blockSet(): BlockSetContext {
        let localContext = new BlockSetContext(this.context, this.state);
        this.enterRule(localContext, 112, ANTLRv4Parser.RULE_blockSet);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 559;
            this.match(ANTLRv4Parser.LPAREN);
            this.state = 560;
            this.setElement();
            this.state = 565;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 45) {
                {
                {
                this.state = 561;
                this.match(ANTLRv4Parser.OR);
                this.state = 562;
                this.setElement();
                }
                }
                this.state = 567;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 568;
            this.match(ANTLRv4Parser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public setElement(): SetElementContext {
        let localContext = new SetElementContext(this.context, this.state);
        this.enterRule(localContext, 114, ANTLRv4Parser.RULE_setElement);
        let _la: number;
        try {
            this.state = 580;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 73, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 570;
                this.match(ANTLRv4Parser.TOKEN_REF);
                this.state = 572;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 38) {
                    {
                    this.state = 571;
                    this.elementOptions();
                    }
                }

                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 574;
                this.match(ANTLRv4Parser.STRING_LITERAL);
                this.state = 576;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 38) {
                    {
                    this.state = 575;
                    this.elementOptions();
                    }
                }

                }
                break;
            case 3:
                this.enterOuterAlt(localContext, 3);
                {
                this.state = 578;
                this.characterRange();
                }
                break;
            case 4:
                this.enterOuterAlt(localContext, 4);
                {
                this.state = 579;
                this.match(ANTLRv4Parser.LEXER_CHAR_SET);
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public block(): BlockContext {
        let localContext = new BlockContext(this.context, this.state);
        this.enterRule(localContext, 116, ANTLRv4Parser.RULE_block);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 582;
            this.match(ANTLRv4Parser.LPAREN);
            this.state = 593;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 12 || _la === 29 || _la === 49) {
                {
                this.state = 584;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 12) {
                    {
                    this.state = 583;
                    this.optionsSpec();
                    }
                }

                this.state = 589;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                while (_la === 49) {
                    {
                    {
                    this.state = 586;
                    this.ruleAction();
                    }
                    }
                    this.state = 591;
                    this.errorHandler.sync(this);
                    _la = this.tokenStream.LA(1);
                }
                this.state = 592;
                this.match(ANTLRv4Parser.COLON);
                }
            }

            this.state = 595;
            this.altList();
            this.state = 596;
            this.match(ANTLRv4Parser.RPAREN);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public ruleref(): RulerefContext {
        let localContext = new RulerefContext(this.context, this.state);
        this.enterRule(localContext, 118, ANTLRv4Parser.RULE_ruleref);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 598;
            this.match(ANTLRv4Parser.RULE_REF);
            this.state = 600;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 10) {
                {
                this.state = 599;
                this.argActionBlock();
                }
            }

            this.state = 603;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 38) {
                {
                this.state = 602;
                this.elementOptions();
                }
            }

            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public characterRange(): CharacterRangeContext {
        let localContext = new CharacterRangeContext(this.context, this.state);
        this.enterRule(localContext, 120, ANTLRv4Parser.RULE_characterRange);
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 605;
            this.match(ANTLRv4Parser.STRING_LITERAL);
            this.state = 606;
            this.match(ANTLRv4Parser.RANGE);
            this.state = 607;
            this.match(ANTLRv4Parser.STRING_LITERAL);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public terminalDef(): TerminalDefContext {
        let localContext = new TerminalDefContext(this.context, this.state);
        this.enterRule(localContext, 122, ANTLRv4Parser.RULE_terminalDef);
        let _la: number;
        try {
            this.state = 617;
            this.errorHandler.sync(this);
            switch (this.tokenStream.LA(1)) {
            case ANTLRv4Parser.TOKEN_REF:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 609;
                this.match(ANTLRv4Parser.TOKEN_REF);
                this.state = 611;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 38) {
                    {
                    this.state = 610;
                    this.elementOptions();
                    }
                }

                }
                break;
            case ANTLRv4Parser.STRING_LITERAL:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 613;
                this.match(ANTLRv4Parser.STRING_LITERAL);
                this.state = 615;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
                if (_la === 38) {
                    {
                    this.state = 614;
                    this.elementOptions();
                    }
                }

                }
                break;
            default:
                throw new antlr.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public elementOptions(): ElementOptionsContext {
        let localContext = new ElementOptionsContext(this.context, this.state);
        this.enterRule(localContext, 124, ANTLRv4Parser.RULE_elementOptions);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 619;
            this.match(ANTLRv4Parser.LT);
            this.state = 620;
            this.elementOption();
            this.state = 625;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            while (_la === 31) {
                {
                {
                this.state = 621;
                this.match(ANTLRv4Parser.COMMA);
                this.state = 622;
                this.elementOption();
                }
                }
                this.state = 627;
                this.errorHandler.sync(this);
                _la = this.tokenStream.LA(1);
            }
            this.state = 628;
            this.match(ANTLRv4Parser.GT);
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public elementOption(): ElementOptionContext {
        let localContext = new ElementOptionContext(this.context, this.state);
        this.enterRule(localContext, 126, ANTLRv4Parser.RULE_elementOption);
        try {
            this.state = 637;
            this.errorHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this.tokenStream, 84, this.context) ) {
            case 1:
                this.enterOuterAlt(localContext, 1);
                {
                this.state = 630;
                this.identifier();
                }
                break;
            case 2:
                this.enterOuterAlt(localContext, 2);
                {
                this.state = 631;
                this.identifier();
                this.state = 632;
                this.match(ANTLRv4Parser.ASSIGN);
                this.state = 635;
                this.errorHandler.sync(this);
                switch (this.tokenStream.LA(1)) {
                case ANTLRv4Parser.TOKEN_REF:
                case ANTLRv4Parser.RULE_REF:
                    {
                    this.state = 633;
                    this.identifier();
                    }
                    break;
                case ANTLRv4Parser.STRING_LITERAL:
                    {
                    this.state = 634;
                    this.match(ANTLRv4Parser.STRING_LITERAL);
                    }
                    break;
                default:
                    throw new antlr.NoViableAltException(this);
                }
                }
                break;
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }
    public identifier(): IdentifierContext {
        let localContext = new IdentifierContext(this.context, this.state);
        this.enterRule(localContext, 128, ANTLRv4Parser.RULE_identifier);
        let _la: number;
        try {
            this.enterOuterAlt(localContext, 1);
            {
            this.state = 639;
            _la = this.tokenStream.LA(1);
            if(!(_la === 1 || _la === 2)) {
            this.errorHandler.recoverInline(this);
            }
            else {
                this.errorHandler.reportMatch(this);
                this.consume();
            }
            }
        }
        catch (re) {
            if (re instanceof antlr.RecognitionException) {
                localContext.exception = re;
                this.errorHandler.reportError(this, re);
                this.errorHandler.recover(this, re);
            } else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return localContext;
    }

    public static readonly _serializedATN: number[] = [
        4,1,61,642,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,
        6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,
        2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,
        7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,
        2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,33,
        7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,39,
        2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,46,
        7,46,2,47,7,47,2,48,7,48,2,49,7,49,2,50,7,50,2,51,7,51,2,52,7,52,
        2,53,7,53,2,54,7,54,2,55,7,55,2,56,7,56,2,57,7,57,2,58,7,58,2,59,
        7,59,2,60,7,60,2,61,7,61,2,62,7,62,2,63,7,63,2,64,7,64,1,0,1,0,5,
        0,133,8,0,10,0,12,0,136,9,0,1,0,1,0,5,0,140,8,0,10,0,12,0,143,9,
        0,1,0,1,0,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,2,1,2,3,2,156,8,2,1,3,1,
        3,1,3,1,3,1,3,3,3,163,8,3,1,4,1,4,1,4,1,4,5,4,169,8,4,10,4,12,4,
        172,9,4,1,4,1,4,1,5,1,5,1,5,1,5,1,6,1,6,1,6,5,6,183,8,6,10,6,12,
        6,186,9,6,1,6,1,6,1,6,3,6,191,8,6,1,7,1,7,1,7,1,7,5,7,197,8,7,10,
        7,12,7,200,9,7,1,7,1,7,1,8,1,8,1,8,1,8,1,8,3,8,209,8,8,1,9,1,9,3,
        9,213,8,9,1,9,1,9,1,10,1,10,3,10,219,8,10,1,10,1,10,1,11,1,11,1,
        11,5,11,226,8,11,10,11,12,11,229,9,11,1,11,3,11,232,8,11,1,12,1,
        12,1,12,1,12,3,12,238,8,12,1,12,1,12,1,12,1,13,1,13,1,13,3,13,246,
        8,13,1,14,1,14,5,14,250,8,14,10,14,12,14,253,9,14,1,14,1,14,1,15,
        1,15,5,15,259,8,15,10,15,12,15,262,9,15,1,15,1,15,1,16,1,16,1,16,
        1,16,5,16,270,8,16,10,16,12,16,273,9,16,1,17,5,17,276,8,17,10,17,
        12,17,279,9,17,1,18,1,18,3,18,283,8,18,1,19,3,19,286,8,19,1,19,1,
        19,3,19,290,8,19,1,19,3,19,293,8,19,1,19,3,19,296,8,19,1,19,3,19,
        299,8,19,1,19,5,19,302,8,19,10,19,12,19,305,9,19,1,19,1,19,1,19,
        1,19,1,19,1,20,5,20,313,8,20,10,20,12,20,316,9,20,1,20,3,20,319,
        8,20,1,21,1,21,1,21,1,21,1,22,1,22,1,22,1,23,1,23,3,23,330,8,23,
        1,24,1,24,1,24,1,25,1,25,1,25,1,25,5,25,339,8,25,10,25,12,25,342,
        9,25,1,26,1,26,1,26,1,27,1,27,1,27,1,27,1,28,4,28,352,8,28,11,28,
        12,28,353,1,29,1,29,1,30,1,30,1,31,1,31,1,31,5,31,363,8,31,10,31,
        12,31,366,9,31,1,32,1,32,1,32,3,32,371,8,32,1,33,3,33,374,8,33,1,
        33,1,33,3,33,378,8,33,1,33,1,33,1,33,1,33,1,34,1,34,1,35,1,35,1,
        35,5,35,389,8,35,10,35,12,35,392,9,35,1,36,1,36,3,36,396,8,36,1,
        36,3,36,399,8,36,1,37,4,37,402,8,37,11,37,12,37,403,1,37,3,37,407,
        8,37,1,38,1,38,3,38,411,8,38,1,38,1,38,3,38,415,8,38,1,38,1,38,3,
        38,419,8,38,3,38,421,8,38,1,39,1,39,1,39,1,39,1,40,1,40,1,40,1,40,
        5,40,431,8,40,10,40,12,40,434,9,40,1,41,1,41,1,41,1,41,1,41,1,41,
        3,41,442,8,41,1,42,1,42,3,42,446,8,42,1,43,1,43,3,43,450,8,43,1,
        44,1,44,1,44,5,44,455,8,44,10,44,12,44,458,9,44,1,45,3,45,461,8,
        45,1,45,4,45,464,8,45,11,45,12,45,465,1,45,3,45,469,8,45,1,46,1,
        46,1,46,3,46,474,8,46,1,46,1,46,1,46,3,46,479,8,46,1,46,1,46,1,46,
        1,46,3,46,485,8,46,3,46,487,8,46,3,46,489,8,46,1,47,1,47,1,47,1,
        47,5,47,495,8,47,10,47,12,47,498,9,47,1,47,1,47,1,48,1,48,1,48,1,
        48,1,48,3,48,507,8,48,1,49,1,49,1,49,1,49,3,49,513,8,49,1,50,1,50,
        3,50,517,8,50,1,51,1,51,1,52,1,52,3,52,523,8,52,1,52,1,52,3,52,527,
        8,52,1,52,1,52,3,52,531,8,52,3,52,533,8,52,1,53,1,53,1,53,1,53,1,
        53,1,53,3,53,541,8,53,3,53,543,8,53,1,54,1,54,1,54,1,54,1,54,3,54,
        550,8,54,3,54,552,8,54,1,55,1,55,1,55,1,55,3,55,558,8,55,1,56,1,
        56,1,56,1,56,5,56,564,8,56,10,56,12,56,567,9,56,1,56,1,56,1,57,1,
        57,3,57,573,8,57,1,57,1,57,3,57,577,8,57,1,57,1,57,3,57,581,8,57,
        1,58,1,58,3,58,585,8,58,1,58,5,58,588,8,58,10,58,12,58,591,9,58,
        1,58,3,58,594,8,58,1,58,1,58,1,58,1,59,1,59,3,59,601,8,59,1,59,3,
        59,604,8,59,1,60,1,60,1,60,1,60,1,61,1,61,3,61,612,8,61,1,61,1,61,
        3,61,616,8,61,3,61,618,8,61,1,62,1,62,1,62,1,62,5,62,624,8,62,10,
        62,12,62,627,9,62,1,62,1,62,1,63,1,63,1,63,1,63,1,63,3,63,636,8,
        63,3,63,638,8,63,1,64,1,64,1,64,0,0,65,0,2,4,6,8,10,12,14,16,18,
        20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,
        64,66,68,70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,
        106,108,110,112,114,116,118,120,122,124,126,128,0,3,2,0,16,16,20,
        22,2,0,40,40,43,43,1,0,1,2,679,0,130,1,0,0,0,2,146,1,0,0,0,4,155,
        1,0,0,0,6,162,1,0,0,0,8,164,1,0,0,0,10,175,1,0,0,0,12,190,1,0,0,
        0,14,192,1,0,0,0,16,208,1,0,0,0,18,210,1,0,0,0,20,216,1,0,0,0,22,
        222,1,0,0,0,24,233,1,0,0,0,26,245,1,0,0,0,28,247,1,0,0,0,30,256,
        1,0,0,0,32,265,1,0,0,0,34,277,1,0,0,0,36,282,1,0,0,0,38,285,1,0,
        0,0,40,314,1,0,0,0,42,320,1,0,0,0,44,324,1,0,0,0,46,329,1,0,0,0,
        48,331,1,0,0,0,50,334,1,0,0,0,52,343,1,0,0,0,54,346,1,0,0,0,56,351,
        1,0,0,0,58,355,1,0,0,0,60,357,1,0,0,0,62,359,1,0,0,0,64,367,1,0,
        0,0,66,373,1,0,0,0,68,383,1,0,0,0,70,385,1,0,0,0,72,398,1,0,0,0,
        74,406,1,0,0,0,76,420,1,0,0,0,78,422,1,0,0,0,80,426,1,0,0,0,82,441,
        1,0,0,0,84,445,1,0,0,0,86,449,1,0,0,0,88,451,1,0,0,0,90,468,1,0,
        0,0,92,488,1,0,0,0,94,490,1,0,0,0,96,506,1,0,0,0,98,508,1,0,0,0,
        100,514,1,0,0,0,102,518,1,0,0,0,104,532,1,0,0,0,106,542,1,0,0,0,
        108,551,1,0,0,0,110,557,1,0,0,0,112,559,1,0,0,0,114,580,1,0,0,0,
        116,582,1,0,0,0,118,598,1,0,0,0,120,605,1,0,0,0,122,617,1,0,0,0,
        124,619,1,0,0,0,126,637,1,0,0,0,128,639,1,0,0,0,130,134,3,2,1,0,
        131,133,3,6,3,0,132,131,1,0,0,0,133,136,1,0,0,0,134,132,1,0,0,0,
        134,135,1,0,0,0,135,137,1,0,0,0,136,134,1,0,0,0,137,141,3,34,17,
        0,138,140,3,32,16,0,139,138,1,0,0,0,140,143,1,0,0,0,141,139,1,0,
        0,0,141,142,1,0,0,0,142,144,1,0,0,0,143,141,1,0,0,0,144,145,5,0,
        0,1,145,1,1,0,0,0,146,147,3,4,2,0,147,148,3,128,64,0,148,149,5,32,
        0,0,149,3,1,0,0,0,150,151,5,17,0,0,151,156,5,19,0,0,152,153,5,18,
        0,0,153,156,5,19,0,0,154,156,5,19,0,0,155,150,1,0,0,0,155,152,1,
        0,0,0,155,154,1,0,0,0,156,5,1,0,0,0,157,163,3,8,4,0,158,163,3,14,
        7,0,159,163,3,18,9,0,160,163,3,20,10,0,161,163,3,24,12,0,162,157,
        1,0,0,0,162,158,1,0,0,0,162,159,1,0,0,0,162,160,1,0,0,0,162,161,
        1,0,0,0,163,7,1,0,0,0,164,170,5,12,0,0,165,166,3,10,5,0,166,167,
        5,32,0,0,167,169,1,0,0,0,168,165,1,0,0,0,169,172,1,0,0,0,170,168,
        1,0,0,0,170,171,1,0,0,0,171,173,1,0,0,0,172,170,1,0,0,0,173,174,
        5,36,0,0,174,9,1,0,0,0,175,176,3,128,64,0,176,177,5,40,0,0,177,178,
        3,12,6,0,178,11,1,0,0,0,179,184,3,128,64,0,180,181,5,48,0,0,181,
        183,3,128,64,0,182,180,1,0,0,0,183,186,1,0,0,0,184,182,1,0,0,0,184,
        185,1,0,0,0,185,191,1,0,0,0,186,184,1,0,0,0,187,191,5,8,0,0,188,
        191,3,28,14,0,189,191,5,7,0,0,190,179,1,0,0,0,190,187,1,0,0,0,190,
        188,1,0,0,0,190,189,1,0,0,0,191,13,1,0,0,0,192,193,5,15,0,0,193,
        198,3,16,8,0,194,195,5,31,0,0,195,197,3,16,8,0,196,194,1,0,0,0,197,
        200,1,0,0,0,198,196,1,0,0,0,198,199,1,0,0,0,199,201,1,0,0,0,200,
        198,1,0,0,0,201,202,5,32,0,0,202,15,1,0,0,0,203,204,3,128,64,0,204,
        205,5,40,0,0,205,206,3,128,64,0,206,209,1,0,0,0,207,209,3,128,64,
        0,208,203,1,0,0,0,208,207,1,0,0,0,209,17,1,0,0,0,210,212,5,13,0,
        0,211,213,3,22,11,0,212,211,1,0,0,0,212,213,1,0,0,0,213,214,1,0,
        0,0,214,215,5,36,0,0,215,19,1,0,0,0,216,218,5,14,0,0,217,219,3,22,
        11,0,218,217,1,0,0,0,218,219,1,0,0,0,219,220,1,0,0,0,220,221,5,36,
        0,0,221,21,1,0,0,0,222,227,3,128,64,0,223,224,5,31,0,0,224,226,3,
        128,64,0,225,223,1,0,0,0,226,229,1,0,0,0,227,225,1,0,0,0,227,228,
        1,0,0,0,228,231,1,0,0,0,229,227,1,0,0,0,230,232,5,31,0,0,231,230,
        1,0,0,0,231,232,1,0,0,0,232,23,1,0,0,0,233,237,5,49,0,0,234,235,
        3,26,13,0,235,236,5,30,0,0,236,238,1,0,0,0,237,234,1,0,0,0,237,238,
        1,0,0,0,238,239,1,0,0,0,239,240,3,128,64,0,240,241,3,28,14,0,241,
        25,1,0,0,0,242,246,3,128,64,0,243,246,5,17,0,0,244,246,5,18,0,0,
        245,242,1,0,0,0,245,243,1,0,0,0,245,244,1,0,0,0,246,27,1,0,0,0,247,
        251,5,11,0,0,248,250,5,60,0,0,249,248,1,0,0,0,250,253,1,0,0,0,251,
        249,1,0,0,0,251,252,1,0,0,0,252,254,1,0,0,0,253,251,1,0,0,0,254,
        255,5,58,0,0,255,29,1,0,0,0,256,260,5,10,0,0,257,259,5,57,0,0,258,
        257,1,0,0,0,259,262,1,0,0,0,260,258,1,0,0,0,260,261,1,0,0,0,261,
        263,1,0,0,0,262,260,1,0,0,0,263,264,5,55,0,0,264,31,1,0,0,0,265,
        266,5,28,0,0,266,267,3,128,64,0,267,271,5,32,0,0,268,270,3,66,33,
        0,269,268,1,0,0,0,270,273,1,0,0,0,271,269,1,0,0,0,271,272,1,0,0,
        0,272,33,1,0,0,0,273,271,1,0,0,0,274,276,3,36,18,0,275,274,1,0,0,
        0,276,279,1,0,0,0,277,275,1,0,0,0,277,278,1,0,0,0,278,35,1,0,0,0,
        279,277,1,0,0,0,280,283,3,38,19,0,281,283,3,66,33,0,282,280,1,0,
        0,0,282,281,1,0,0,0,283,37,1,0,0,0,284,286,3,56,28,0,285,284,1,0,
        0,0,285,286,1,0,0,0,286,287,1,0,0,0,287,289,5,2,0,0,288,290,3,30,
        15,0,289,288,1,0,0,0,289,290,1,0,0,0,290,292,1,0,0,0,291,293,3,48,
        24,0,292,291,1,0,0,0,292,293,1,0,0,0,293,295,1,0,0,0,294,296,3,50,
        25,0,295,294,1,0,0,0,295,296,1,0,0,0,296,298,1,0,0,0,297,299,3,52,
        26,0,298,297,1,0,0,0,298,299,1,0,0,0,299,303,1,0,0,0,300,302,3,46,
        23,0,301,300,1,0,0,0,302,305,1,0,0,0,303,301,1,0,0,0,303,304,1,0,
        0,0,304,306,1,0,0,0,305,303,1,0,0,0,306,307,5,29,0,0,307,308,3,60,
        30,0,308,309,5,32,0,0,309,310,3,40,20,0,310,39,1,0,0,0,311,313,3,
        42,21,0,312,311,1,0,0,0,313,316,1,0,0,0,314,312,1,0,0,0,314,315,
        1,0,0,0,315,318,1,0,0,0,316,314,1,0,0,0,317,319,3,44,22,0,318,317,
        1,0,0,0,318,319,1,0,0,0,319,41,1,0,0,0,320,321,5,26,0,0,321,322,
        3,30,15,0,322,323,3,28,14,0,323,43,1,0,0,0,324,325,5,27,0,0,325,
        326,3,28,14,0,326,45,1,0,0,0,327,330,3,8,4,0,328,330,3,54,27,0,329,
        327,1,0,0,0,329,328,1,0,0,0,330,47,1,0,0,0,331,332,5,23,0,0,332,
        333,3,30,15,0,333,49,1,0,0,0,334,335,5,25,0,0,335,340,3,128,64,0,
        336,337,5,31,0,0,337,339,3,128,64,0,338,336,1,0,0,0,339,342,1,0,
        0,0,340,338,1,0,0,0,340,341,1,0,0,0,341,51,1,0,0,0,342,340,1,0,0,
        0,343,344,5,24,0,0,344,345,3,30,15,0,345,53,1,0,0,0,346,347,5,49,
        0,0,347,348,3,128,64,0,348,349,3,28,14,0,349,55,1,0,0,0,350,352,
        3,58,29,0,351,350,1,0,0,0,352,353,1,0,0,0,353,351,1,0,0,0,353,354,
        1,0,0,0,354,57,1,0,0,0,355,356,7,0,0,0,356,59,1,0,0,0,357,358,3,
        62,31,0,358,61,1,0,0,0,359,364,3,64,32,0,360,361,5,45,0,0,361,363,
        3,64,32,0,362,360,1,0,0,0,363,366,1,0,0,0,364,362,1,0,0,0,364,365,
        1,0,0,0,365,63,1,0,0,0,366,364,1,0,0,0,367,370,3,90,45,0,368,369,
        5,50,0,0,369,371,3,128,64,0,370,368,1,0,0,0,370,371,1,0,0,0,371,
        65,1,0,0,0,372,374,5,16,0,0,373,372,1,0,0,0,373,374,1,0,0,0,374,
        375,1,0,0,0,375,377,5,1,0,0,376,378,3,8,4,0,377,376,1,0,0,0,377,
        378,1,0,0,0,378,379,1,0,0,0,379,380,5,29,0,0,380,381,3,68,34,0,381,
        382,5,32,0,0,382,67,1,0,0,0,383,384,3,70,35,0,384,69,1,0,0,0,385,
        390,3,72,36,0,386,387,5,45,0,0,387,389,3,72,36,0,388,386,1,0,0,0,
        389,392,1,0,0,0,390,388,1,0,0,0,390,391,1,0,0,0,391,71,1,0,0,0,392,
        390,1,0,0,0,393,395,3,74,37,0,394,396,3,80,40,0,395,394,1,0,0,0,
        395,396,1,0,0,0,396,399,1,0,0,0,397,399,1,0,0,0,398,393,1,0,0,0,
        398,397,1,0,0,0,399,73,1,0,0,0,400,402,3,76,38,0,401,400,1,0,0,0,
        402,403,1,0,0,0,403,401,1,0,0,0,403,404,1,0,0,0,404,407,1,0,0,0,
        405,407,1,0,0,0,406,401,1,0,0,0,406,405,1,0,0,0,407,75,1,0,0,0,408,
        410,3,106,53,0,409,411,3,104,52,0,410,409,1,0,0,0,410,411,1,0,0,
        0,411,421,1,0,0,0,412,414,3,78,39,0,413,415,3,104,52,0,414,413,1,
        0,0,0,414,415,1,0,0,0,415,421,1,0,0,0,416,418,3,28,14,0,417,419,
        5,41,0,0,418,417,1,0,0,0,418,419,1,0,0,0,419,421,1,0,0,0,420,408,
        1,0,0,0,420,412,1,0,0,0,420,416,1,0,0,0,421,77,1,0,0,0,422,423,5,
        33,0,0,423,424,3,70,35,0,424,425,5,34,0,0,425,79,1,0,0,0,426,427,
        5,37,0,0,427,432,3,82,41,0,428,429,5,31,0,0,429,431,3,82,41,0,430,
        428,1,0,0,0,431,434,1,0,0,0,432,430,1,0,0,0,432,433,1,0,0,0,433,
        81,1,0,0,0,434,432,1,0,0,0,435,436,3,84,42,0,436,437,5,33,0,0,437,
        438,3,86,43,0,438,439,5,34,0,0,439,442,1,0,0,0,440,442,3,84,42,0,
        441,435,1,0,0,0,441,440,1,0,0,0,442,83,1,0,0,0,443,446,3,128,64,
        0,444,446,5,28,0,0,445,443,1,0,0,0,445,444,1,0,0,0,446,85,1,0,0,
        0,447,450,3,128,64,0,448,450,5,7,0,0,449,447,1,0,0,0,449,448,1,0,
        0,0,450,87,1,0,0,0,451,456,3,90,45,0,452,453,5,45,0,0,453,455,3,
        90,45,0,454,452,1,0,0,0,455,458,1,0,0,0,456,454,1,0,0,0,456,457,
        1,0,0,0,457,89,1,0,0,0,458,456,1,0,0,0,459,461,3,124,62,0,460,459,
        1,0,0,0,460,461,1,0,0,0,461,463,1,0,0,0,462,464,3,92,46,0,463,462,
        1,0,0,0,464,465,1,0,0,0,465,463,1,0,0,0,465,466,1,0,0,0,466,469,
        1,0,0,0,467,469,1,0,0,0,468,460,1,0,0,0,468,467,1,0,0,0,469,91,1,
        0,0,0,470,473,3,98,49,0,471,474,3,104,52,0,472,474,1,0,0,0,473,471,
        1,0,0,0,473,472,1,0,0,0,474,489,1,0,0,0,475,478,3,108,54,0,476,479,
        3,104,52,0,477,479,1,0,0,0,478,476,1,0,0,0,478,477,1,0,0,0,479,489,
        1,0,0,0,480,489,3,100,50,0,481,486,3,28,14,0,482,484,5,41,0,0,483,
        485,3,94,47,0,484,483,1,0,0,0,484,485,1,0,0,0,485,487,1,0,0,0,486,
        482,1,0,0,0,486,487,1,0,0,0,487,489,1,0,0,0,488,470,1,0,0,0,488,
        475,1,0,0,0,488,480,1,0,0,0,488,481,1,0,0,0,489,93,1,0,0,0,490,491,
        5,38,0,0,491,496,3,96,48,0,492,493,5,31,0,0,493,495,3,96,48,0,494,
        492,1,0,0,0,495,498,1,0,0,0,496,494,1,0,0,0,496,497,1,0,0,0,497,
        499,1,0,0,0,498,496,1,0,0,0,499,500,5,39,0,0,500,95,1,0,0,0,501,
        507,3,126,63,0,502,503,3,128,64,0,503,504,5,40,0,0,504,505,3,28,
        14,0,505,507,1,0,0,0,506,501,1,0,0,0,506,502,1,0,0,0,507,97,1,0,
        0,0,508,509,3,128,64,0,509,512,7,1,0,0,510,513,3,108,54,0,511,513,
        3,116,58,0,512,510,1,0,0,0,512,511,1,0,0,0,513,99,1,0,0,0,514,516,
        3,116,58,0,515,517,3,102,51,0,516,515,1,0,0,0,516,517,1,0,0,0,517,
        101,1,0,0,0,518,519,3,104,52,0,519,103,1,0,0,0,520,522,5,41,0,0,
        521,523,5,41,0,0,522,521,1,0,0,0,522,523,1,0,0,0,523,533,1,0,0,0,
        524,526,5,42,0,0,525,527,5,41,0,0,526,525,1,0,0,0,526,527,1,0,0,
        0,527,533,1,0,0,0,528,530,5,44,0,0,529,531,5,41,0,0,530,529,1,0,
        0,0,530,531,1,0,0,0,531,533,1,0,0,0,532,520,1,0,0,0,532,524,1,0,
        0,0,532,528,1,0,0,0,533,105,1,0,0,0,534,543,3,120,60,0,535,543,3,
        122,61,0,536,543,3,110,55,0,537,543,5,3,0,0,538,540,5,48,0,0,539,
        541,3,124,62,0,540,539,1,0,0,0,540,541,1,0,0,0,541,543,1,0,0,0,542,
        534,1,0,0,0,542,535,1,0,0,0,542,536,1,0,0,0,542,537,1,0,0,0,542,
        538,1,0,0,0,543,107,1,0,0,0,544,552,3,122,61,0,545,552,3,118,59,
        0,546,552,3,110,55,0,547,549,5,48,0,0,548,550,3,124,62,0,549,548,
        1,0,0,0,549,550,1,0,0,0,550,552,1,0,0,0,551,544,1,0,0,0,551,545,
        1,0,0,0,551,546,1,0,0,0,551,547,1,0,0,0,552,109,1,0,0,0,553,554,
        5,51,0,0,554,558,3,114,57,0,555,556,5,51,0,0,556,558,3,112,56,0,
        557,553,1,0,0,0,557,555,1,0,0,0,558,111,1,0,0,0,559,560,5,33,0,0,
        560,565,3,114,57,0,561,562,5,45,0,0,562,564,3,114,57,0,563,561,1,
        0,0,0,564,567,1,0,0,0,565,563,1,0,0,0,565,566,1,0,0,0,566,568,1,
        0,0,0,567,565,1,0,0,0,568,569,5,34,0,0,569,113,1,0,0,0,570,572,5,
        1,0,0,571,573,3,124,62,0,572,571,1,0,0,0,572,573,1,0,0,0,573,581,
        1,0,0,0,574,576,5,8,0,0,575,577,3,124,62,0,576,575,1,0,0,0,576,577,
        1,0,0,0,577,581,1,0,0,0,578,581,3,120,60,0,579,581,5,3,0,0,580,570,
        1,0,0,0,580,574,1,0,0,0,580,578,1,0,0,0,580,579,1,0,0,0,581,115,
        1,0,0,0,582,593,5,33,0,0,583,585,3,8,4,0,584,583,1,0,0,0,584,585,
        1,0,0,0,585,589,1,0,0,0,586,588,3,54,27,0,587,586,1,0,0,0,588,591,
        1,0,0,0,589,587,1,0,0,0,589,590,1,0,0,0,590,592,1,0,0,0,591,589,
        1,0,0,0,592,594,5,29,0,0,593,584,1,0,0,0,593,594,1,0,0,0,594,595,
        1,0,0,0,595,596,3,88,44,0,596,597,5,34,0,0,597,117,1,0,0,0,598,600,
        5,2,0,0,599,601,3,30,15,0,600,599,1,0,0,0,600,601,1,0,0,0,601,603,
        1,0,0,0,602,604,3,124,62,0,603,602,1,0,0,0,603,604,1,0,0,0,604,119,
        1,0,0,0,605,606,5,8,0,0,606,607,5,47,0,0,607,608,5,8,0,0,608,121,
        1,0,0,0,609,611,5,1,0,0,610,612,3,124,62,0,611,610,1,0,0,0,611,612,
        1,0,0,0,612,618,1,0,0,0,613,615,5,8,0,0,614,616,3,124,62,0,615,614,
        1,0,0,0,615,616,1,0,0,0,616,618,1,0,0,0,617,609,1,0,0,0,617,613,
        1,0,0,0,618,123,1,0,0,0,619,620,5,38,0,0,620,625,3,126,63,0,621,
        622,5,31,0,0,622,624,3,126,63,0,623,621,1,0,0,0,624,627,1,0,0,0,
        625,623,1,0,0,0,625,626,1,0,0,0,626,628,1,0,0,0,627,625,1,0,0,0,
        628,629,5,39,0,0,629,125,1,0,0,0,630,638,3,128,64,0,631,632,3,128,
        64,0,632,635,5,40,0,0,633,636,3,128,64,0,634,636,5,8,0,0,635,633,
        1,0,0,0,635,634,1,0,0,0,636,638,1,0,0,0,637,630,1,0,0,0,637,631,
        1,0,0,0,638,127,1,0,0,0,639,640,7,2,0,0,640,129,1,0,0,0,85,134,141,
        155,162,170,184,190,198,208,212,218,227,231,237,245,251,260,271,
        277,282,285,289,292,295,298,303,314,318,329,340,353,364,370,373,
        377,390,395,398,403,406,410,414,418,420,432,441,445,449,456,460,
        465,468,473,478,484,486,488,496,506,512,516,522,526,530,532,540,
        542,549,551,557,565,572,576,580,584,589,593,600,603,611,615,617,
        625,635,637
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!ANTLRv4Parser.__ATN) {
            ANTLRv4Parser.__ATN = new antlr.ATNDeserializer().deserialize(ANTLRv4Parser._serializedATN);
        }

        return ANTLRv4Parser.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(ANTLRv4Parser.literalNames, ANTLRv4Parser.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return ANTLRv4Parser.vocabulary;
    }

    private static readonly decisionsToDFA = ANTLRv4Parser._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}

export class GrammarSpecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public grammarDecl(): GrammarDeclContext {
        return this.getRuleContext(0, GrammarDeclContext)!;
    }
    public rules(): RulesContext {
        return this.getRuleContext(0, RulesContext)!;
    }
    public EOF(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.EOF, 0)!;
    }
    public prequelConstruct(): PrequelConstructContext[];
    public prequelConstruct(i: number): PrequelConstructContext | null;
    public prequelConstruct(i?: number): PrequelConstructContext[] | PrequelConstructContext | null {
        if (i === undefined) {
            return this.getRuleContexts(PrequelConstructContext);
        }

        return this.getRuleContext(i, PrequelConstructContext);
    }
    public modeSpec(): ModeSpecContext[];
    public modeSpec(i: number): ModeSpecContext | null;
    public modeSpec(i?: number): ModeSpecContext[] | ModeSpecContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ModeSpecContext);
        }

        return this.getRuleContext(i, ModeSpecContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_grammarSpec;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterGrammarSpec) {
             listener.enterGrammarSpec(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitGrammarSpec) {
             listener.exitGrammarSpec(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitGrammarSpec) {
            return visitor.visitGrammarSpec(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class GrammarDeclContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public grammarType(): GrammarTypeContext {
        return this.getRuleContext(0, GrammarTypeContext)!;
    }
    public identifier(): IdentifierContext {
        return this.getRuleContext(0, IdentifierContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.SEMI, 0)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_grammarDecl;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterGrammarDecl) {
             listener.enterGrammarDecl(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitGrammarDecl) {
             listener.exitGrammarDecl(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitGrammarDecl) {
            return visitor.visitGrammarDecl(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class GrammarTypeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LEXER(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.LEXER, 0);
    }
    public GRAMMAR(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.GRAMMAR, 0)!;
    }
    public PARSER(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.PARSER, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_grammarType;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterGrammarType) {
             listener.enterGrammarType(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitGrammarType) {
             listener.exitGrammarType(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitGrammarType) {
            return visitor.visitGrammarType(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PrequelConstructContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public optionsSpec(): OptionsSpecContext | null {
        return this.getRuleContext(0, OptionsSpecContext);
    }
    public delegateGrammars(): DelegateGrammarsContext | null {
        return this.getRuleContext(0, DelegateGrammarsContext);
    }
    public tokensSpec(): TokensSpecContext | null {
        return this.getRuleContext(0, TokensSpecContext);
    }
    public channelsSpec(): ChannelsSpecContext | null {
        return this.getRuleContext(0, ChannelsSpecContext);
    }
    public action_(): Action_Context | null {
        return this.getRuleContext(0, Action_Context);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_prequelConstruct;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterPrequelConstruct) {
             listener.enterPrequelConstruct(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitPrequelConstruct) {
             listener.exitPrequelConstruct(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitPrequelConstruct) {
            return visitor.visitPrequelConstruct(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class OptionsSpecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public OPTIONS(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.OPTIONS, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.RBRACE, 0)!;
    }
    public option(): OptionContext[];
    public option(i: number): OptionContext | null;
    public option(i?: number): OptionContext[] | OptionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(OptionContext);
        }

        return this.getRuleContext(i, OptionContext);
    }
    public SEMI(): antlr.TerminalNode[];
    public SEMI(i: number): antlr.TerminalNode | null;
    public SEMI(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.SEMI);
    	} else {
    		return this.getToken(ANTLRv4Parser.SEMI, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_optionsSpec;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterOptionsSpec) {
             listener.enterOptionsSpec(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitOptionsSpec) {
             listener.exitOptionsSpec(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitOptionsSpec) {
            return visitor.visitOptionsSpec(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class OptionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public identifier(): IdentifierContext {
        return this.getRuleContext(0, IdentifierContext)!;
    }
    public ASSIGN(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.ASSIGN, 0)!;
    }
    public optionValue(): OptionValueContext {
        return this.getRuleContext(0, OptionValueContext)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_option;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterOption) {
             listener.enterOption(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitOption) {
             listener.exitOption(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitOption) {
            return visitor.visitOption(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class OptionValueContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public identifier(): IdentifierContext[];
    public identifier(i: number): IdentifierContext | null;
    public identifier(i?: number): IdentifierContext[] | IdentifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdentifierContext);
        }

        return this.getRuleContext(i, IdentifierContext);
    }
    public DOT(): antlr.TerminalNode[];
    public DOT(i: number): antlr.TerminalNode | null;
    public DOT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.DOT);
    	} else {
    		return this.getToken(ANTLRv4Parser.DOT, i);
    	}
    }
    public STRING_LITERAL(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.STRING_LITERAL, 0);
    }
    public actionBlock(): ActionBlockContext | null {
        return this.getRuleContext(0, ActionBlockContext);
    }
    public INT(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.INT, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_optionValue;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterOptionValue) {
             listener.enterOptionValue(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitOptionValue) {
             listener.exitOptionValue(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitOptionValue) {
            return visitor.visitOptionValue(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DelegateGrammarsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public IMPORT(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.IMPORT, 0)!;
    }
    public delegateGrammar(): DelegateGrammarContext[];
    public delegateGrammar(i: number): DelegateGrammarContext | null;
    public delegateGrammar(i?: number): DelegateGrammarContext[] | DelegateGrammarContext | null {
        if (i === undefined) {
            return this.getRuleContexts(DelegateGrammarContext);
        }

        return this.getRuleContext(i, DelegateGrammarContext);
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.SEMI, 0)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.COMMA);
    	} else {
    		return this.getToken(ANTLRv4Parser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_delegateGrammars;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterDelegateGrammars) {
             listener.enterDelegateGrammars(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitDelegateGrammars) {
             listener.exitDelegateGrammars(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitDelegateGrammars) {
            return visitor.visitDelegateGrammars(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class DelegateGrammarContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public identifier(): IdentifierContext[];
    public identifier(i: number): IdentifierContext | null;
    public identifier(i?: number): IdentifierContext[] | IdentifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdentifierContext);
        }

        return this.getRuleContext(i, IdentifierContext);
    }
    public ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.ASSIGN, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_delegateGrammar;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterDelegateGrammar) {
             listener.enterDelegateGrammar(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitDelegateGrammar) {
             listener.exitDelegateGrammar(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitDelegateGrammar) {
            return visitor.visitDelegateGrammar(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TokensSpecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TOKENS(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.TOKENS, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.RBRACE, 0)!;
    }
    public idList(): IdListContext | null {
        return this.getRuleContext(0, IdListContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_tokensSpec;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterTokensSpec) {
             listener.enterTokensSpec(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitTokensSpec) {
             listener.exitTokensSpec(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitTokensSpec) {
            return visitor.visitTokensSpec(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ChannelsSpecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CHANNELS(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.CHANNELS, 0)!;
    }
    public RBRACE(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.RBRACE, 0)!;
    }
    public idList(): IdListContext | null {
        return this.getRuleContext(0, IdListContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_channelsSpec;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterChannelsSpec) {
             listener.enterChannelsSpec(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitChannelsSpec) {
             listener.exitChannelsSpec(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitChannelsSpec) {
            return visitor.visitChannelsSpec(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IdListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public identifier(): IdentifierContext[];
    public identifier(i: number): IdentifierContext | null;
    public identifier(i?: number): IdentifierContext[] | IdentifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdentifierContext);
        }

        return this.getRuleContext(i, IdentifierContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.COMMA);
    	} else {
    		return this.getToken(ANTLRv4Parser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_idList;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterIdList) {
             listener.enterIdList(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitIdList) {
             listener.exitIdList(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitIdList) {
            return visitor.visitIdList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class Action_Context extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public AT(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.AT, 0)!;
    }
    public identifier(): IdentifierContext {
        return this.getRuleContext(0, IdentifierContext)!;
    }
    public actionBlock(): ActionBlockContext {
        return this.getRuleContext(0, ActionBlockContext)!;
    }
    public actionScopeName(): ActionScopeNameContext | null {
        return this.getRuleContext(0, ActionScopeNameContext);
    }
    public COLONCOLON(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.COLONCOLON, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_action_;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterAction_) {
             listener.enterAction_(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitAction_) {
             listener.exitAction_(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitAction_) {
            return visitor.visitAction_(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ActionScopeNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public identifier(): IdentifierContext | null {
        return this.getRuleContext(0, IdentifierContext);
    }
    public LEXER(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.LEXER, 0);
    }
    public PARSER(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.PARSER, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_actionScopeName;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterActionScopeName) {
             listener.enterActionScopeName(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitActionScopeName) {
             listener.exitActionScopeName(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitActionScopeName) {
            return visitor.visitActionScopeName(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ActionBlockContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public BEGIN_ACTION(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.BEGIN_ACTION, 0)!;
    }
    public END_ACTION(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.END_ACTION, 0)!;
    }
    public ACTION_CONTENT(): antlr.TerminalNode[];
    public ACTION_CONTENT(i: number): antlr.TerminalNode | null;
    public ACTION_CONTENT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.ACTION_CONTENT);
    	} else {
    		return this.getToken(ANTLRv4Parser.ACTION_CONTENT, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_actionBlock;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterActionBlock) {
             listener.enterActionBlock(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitActionBlock) {
             listener.exitActionBlock(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitActionBlock) {
            return visitor.visitActionBlock(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ArgActionBlockContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public BEGIN_ARGUMENT(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.BEGIN_ARGUMENT, 0)!;
    }
    public END_ARGUMENT(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.END_ARGUMENT, 0)!;
    }
    public ARGUMENT_CONTENT(): antlr.TerminalNode[];
    public ARGUMENT_CONTENT(i: number): antlr.TerminalNode | null;
    public ARGUMENT_CONTENT(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.ARGUMENT_CONTENT);
    	} else {
    		return this.getToken(ANTLRv4Parser.ARGUMENT_CONTENT, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_argActionBlock;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterArgActionBlock) {
             listener.enterArgActionBlock(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitArgActionBlock) {
             listener.exitArgActionBlock(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitArgActionBlock) {
            return visitor.visitArgActionBlock(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ModeSpecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public MODE(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.MODE, 0)!;
    }
    public identifier(): IdentifierContext {
        return this.getRuleContext(0, IdentifierContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.SEMI, 0)!;
    }
    public lexerRuleSpec(): LexerRuleSpecContext[];
    public lexerRuleSpec(i: number): LexerRuleSpecContext | null;
    public lexerRuleSpec(i?: number): LexerRuleSpecContext[] | LexerRuleSpecContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LexerRuleSpecContext);
        }

        return this.getRuleContext(i, LexerRuleSpecContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_modeSpec;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterModeSpec) {
             listener.enterModeSpec(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitModeSpec) {
             listener.exitModeSpec(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitModeSpec) {
            return visitor.visitModeSpec(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RulesContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ruleSpec(): RuleSpecContext[];
    public ruleSpec(i: number): RuleSpecContext | null;
    public ruleSpec(i?: number): RuleSpecContext[] | RuleSpecContext | null {
        if (i === undefined) {
            return this.getRuleContexts(RuleSpecContext);
        }

        return this.getRuleContext(i, RuleSpecContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_rules;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterRules) {
             listener.enterRules(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitRules) {
             listener.exitRules(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitRules) {
            return visitor.visitRules(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RuleSpecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public parserRuleSpec(): ParserRuleSpecContext | null {
        return this.getRuleContext(0, ParserRuleSpecContext);
    }
    public lexerRuleSpec(): LexerRuleSpecContext | null {
        return this.getRuleContext(0, LexerRuleSpecContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_ruleSpec;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterRuleSpec) {
             listener.enterRuleSpec(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitRuleSpec) {
             listener.exitRuleSpec(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitRuleSpec) {
            return visitor.visitRuleSpec(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ParserRuleSpecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RULE_REF(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.RULE_REF, 0)!;
    }
    public COLON(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.COLON, 0)!;
    }
    public ruleBlock(): RuleBlockContext {
        return this.getRuleContext(0, RuleBlockContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.SEMI, 0)!;
    }
    public exceptionGroup(): ExceptionGroupContext {
        return this.getRuleContext(0, ExceptionGroupContext)!;
    }
    public ruleModifiers(): RuleModifiersContext | null {
        return this.getRuleContext(0, RuleModifiersContext);
    }
    public argActionBlock(): ArgActionBlockContext | null {
        return this.getRuleContext(0, ArgActionBlockContext);
    }
    public ruleReturns(): RuleReturnsContext | null {
        return this.getRuleContext(0, RuleReturnsContext);
    }
    public throwsSpec(): ThrowsSpecContext | null {
        return this.getRuleContext(0, ThrowsSpecContext);
    }
    public localsSpec(): LocalsSpecContext | null {
        return this.getRuleContext(0, LocalsSpecContext);
    }
    public rulePrequel(): RulePrequelContext[];
    public rulePrequel(i: number): RulePrequelContext | null;
    public rulePrequel(i?: number): RulePrequelContext[] | RulePrequelContext | null {
        if (i === undefined) {
            return this.getRuleContexts(RulePrequelContext);
        }

        return this.getRuleContext(i, RulePrequelContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_parserRuleSpec;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterParserRuleSpec) {
             listener.enterParserRuleSpec(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitParserRuleSpec) {
             listener.exitParserRuleSpec(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitParserRuleSpec) {
            return visitor.visitParserRuleSpec(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ExceptionGroupContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public exceptionHandler(): ExceptionHandlerContext[];
    public exceptionHandler(i: number): ExceptionHandlerContext | null;
    public exceptionHandler(i?: number): ExceptionHandlerContext[] | ExceptionHandlerContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ExceptionHandlerContext);
        }

        return this.getRuleContext(i, ExceptionHandlerContext);
    }
    public finallyClause(): FinallyClauseContext | null {
        return this.getRuleContext(0, FinallyClauseContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_exceptionGroup;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterExceptionGroup) {
             listener.enterExceptionGroup(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitExceptionGroup) {
             listener.exitExceptionGroup(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitExceptionGroup) {
            return visitor.visitExceptionGroup(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ExceptionHandlerContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public CATCH(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.CATCH, 0)!;
    }
    public argActionBlock(): ArgActionBlockContext {
        return this.getRuleContext(0, ArgActionBlockContext)!;
    }
    public actionBlock(): ActionBlockContext {
        return this.getRuleContext(0, ActionBlockContext)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_exceptionHandler;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterExceptionHandler) {
             listener.enterExceptionHandler(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitExceptionHandler) {
             listener.exitExceptionHandler(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitExceptionHandler) {
            return visitor.visitExceptionHandler(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class FinallyClauseContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public FINALLY(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.FINALLY, 0)!;
    }
    public actionBlock(): ActionBlockContext {
        return this.getRuleContext(0, ActionBlockContext)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_finallyClause;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterFinallyClause) {
             listener.enterFinallyClause(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitFinallyClause) {
             listener.exitFinallyClause(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitFinallyClause) {
            return visitor.visitFinallyClause(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RulePrequelContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public optionsSpec(): OptionsSpecContext | null {
        return this.getRuleContext(0, OptionsSpecContext);
    }
    public ruleAction(): RuleActionContext | null {
        return this.getRuleContext(0, RuleActionContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_rulePrequel;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterRulePrequel) {
             listener.enterRulePrequel(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitRulePrequel) {
             listener.exitRulePrequel(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitRulePrequel) {
            return visitor.visitRulePrequel(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RuleReturnsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RETURNS(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.RETURNS, 0)!;
    }
    public argActionBlock(): ArgActionBlockContext {
        return this.getRuleContext(0, ArgActionBlockContext)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_ruleReturns;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterRuleReturns) {
             listener.enterRuleReturns(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitRuleReturns) {
             listener.exitRuleReturns(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitRuleReturns) {
            return visitor.visitRuleReturns(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ThrowsSpecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public THROWS(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.THROWS, 0)!;
    }
    public identifier(): IdentifierContext[];
    public identifier(i: number): IdentifierContext | null;
    public identifier(i?: number): IdentifierContext[] | IdentifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdentifierContext);
        }

        return this.getRuleContext(i, IdentifierContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.COMMA);
    	} else {
    		return this.getToken(ANTLRv4Parser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_throwsSpec;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterThrowsSpec) {
             listener.enterThrowsSpec(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitThrowsSpec) {
             listener.exitThrowsSpec(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitThrowsSpec) {
            return visitor.visitThrowsSpec(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LocalsSpecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LOCALS(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.LOCALS, 0)!;
    }
    public argActionBlock(): ArgActionBlockContext {
        return this.getRuleContext(0, ArgActionBlockContext)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_localsSpec;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLocalsSpec) {
             listener.enterLocalsSpec(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLocalsSpec) {
             listener.exitLocalsSpec(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLocalsSpec) {
            return visitor.visitLocalsSpec(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RuleActionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public AT(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.AT, 0)!;
    }
    public identifier(): IdentifierContext {
        return this.getRuleContext(0, IdentifierContext)!;
    }
    public actionBlock(): ActionBlockContext {
        return this.getRuleContext(0, ActionBlockContext)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_ruleAction;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterRuleAction) {
             listener.enterRuleAction(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitRuleAction) {
             listener.exitRuleAction(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitRuleAction) {
            return visitor.visitRuleAction(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RuleModifiersContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ruleModifier(): RuleModifierContext[];
    public ruleModifier(i: number): RuleModifierContext | null;
    public ruleModifier(i?: number): RuleModifierContext[] | RuleModifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(RuleModifierContext);
        }

        return this.getRuleContext(i, RuleModifierContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_ruleModifiers;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterRuleModifiers) {
             listener.enterRuleModifiers(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitRuleModifiers) {
             listener.exitRuleModifiers(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitRuleModifiers) {
            return visitor.visitRuleModifiers(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RuleModifierContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public PUBLIC(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.PUBLIC, 0);
    }
    public PRIVATE(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.PRIVATE, 0);
    }
    public PROTECTED(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.PROTECTED, 0);
    }
    public FRAGMENT(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.FRAGMENT, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_ruleModifier;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterRuleModifier) {
             listener.enterRuleModifier(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitRuleModifier) {
             listener.exitRuleModifier(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitRuleModifier) {
            return visitor.visitRuleModifier(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RuleBlockContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ruleAltList(): RuleAltListContext {
        return this.getRuleContext(0, RuleAltListContext)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_ruleBlock;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterRuleBlock) {
             listener.enterRuleBlock(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitRuleBlock) {
             listener.exitRuleBlock(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitRuleBlock) {
            return visitor.visitRuleBlock(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RuleAltListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public labeledAlt(): LabeledAltContext[];
    public labeledAlt(i: number): LabeledAltContext | null;
    public labeledAlt(i?: number): LabeledAltContext[] | LabeledAltContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LabeledAltContext);
        }

        return this.getRuleContext(i, LabeledAltContext);
    }
    public OR(): antlr.TerminalNode[];
    public OR(i: number): antlr.TerminalNode | null;
    public OR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.OR);
    	} else {
    		return this.getToken(ANTLRv4Parser.OR, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_ruleAltList;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterRuleAltList) {
             listener.enterRuleAltList(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitRuleAltList) {
             listener.exitRuleAltList(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitRuleAltList) {
            return visitor.visitRuleAltList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LabeledAltContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public alternative(): AlternativeContext {
        return this.getRuleContext(0, AlternativeContext)!;
    }
    public POUND(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.POUND, 0);
    }
    public identifier(): IdentifierContext | null {
        return this.getRuleContext(0, IdentifierContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_labeledAlt;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLabeledAlt) {
             listener.enterLabeledAlt(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLabeledAlt) {
             listener.exitLabeledAlt(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLabeledAlt) {
            return visitor.visitLabeledAlt(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerRuleSpecContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TOKEN_REF(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.TOKEN_REF, 0)!;
    }
    public COLON(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.COLON, 0)!;
    }
    public lexerRuleBlock(): LexerRuleBlockContext {
        return this.getRuleContext(0, LexerRuleBlockContext)!;
    }
    public SEMI(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.SEMI, 0)!;
    }
    public FRAGMENT(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.FRAGMENT, 0);
    }
    public optionsSpec(): OptionsSpecContext | null {
        return this.getRuleContext(0, OptionsSpecContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerRuleSpec;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerRuleSpec) {
             listener.enterLexerRuleSpec(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerRuleSpec) {
             listener.exitLexerRuleSpec(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerRuleSpec) {
            return visitor.visitLexerRuleSpec(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerRuleBlockContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public lexerAltList(): LexerAltListContext {
        return this.getRuleContext(0, LexerAltListContext)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerRuleBlock;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerRuleBlock) {
             listener.enterLexerRuleBlock(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerRuleBlock) {
             listener.exitLexerRuleBlock(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerRuleBlock) {
            return visitor.visitLexerRuleBlock(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerAltListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public lexerAlt(): LexerAltContext[];
    public lexerAlt(i: number): LexerAltContext | null;
    public lexerAlt(i?: number): LexerAltContext[] | LexerAltContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LexerAltContext);
        }

        return this.getRuleContext(i, LexerAltContext);
    }
    public OR(): antlr.TerminalNode[];
    public OR(i: number): antlr.TerminalNode | null;
    public OR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.OR);
    	} else {
    		return this.getToken(ANTLRv4Parser.OR, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerAltList;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerAltList) {
             listener.enterLexerAltList(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerAltList) {
             listener.exitLexerAltList(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerAltList) {
            return visitor.visitLexerAltList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerAltContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public lexerElements(): LexerElementsContext | null {
        return this.getRuleContext(0, LexerElementsContext);
    }
    public lexerCommands(): LexerCommandsContext | null {
        return this.getRuleContext(0, LexerCommandsContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerAlt;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerAlt) {
             listener.enterLexerAlt(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerAlt) {
             listener.exitLexerAlt(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerAlt) {
            return visitor.visitLexerAlt(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerElementsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public lexerElement(): LexerElementContext[];
    public lexerElement(i: number): LexerElementContext | null;
    public lexerElement(i?: number): LexerElementContext[] | LexerElementContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LexerElementContext);
        }

        return this.getRuleContext(i, LexerElementContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerElements;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerElements) {
             listener.enterLexerElements(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerElements) {
             listener.exitLexerElements(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerElements) {
            return visitor.visitLexerElements(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerElementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public lexerAtom(): LexerAtomContext | null {
        return this.getRuleContext(0, LexerAtomContext);
    }
    public ebnfSuffix(): EbnfSuffixContext | null {
        return this.getRuleContext(0, EbnfSuffixContext);
    }
    public lexerBlock(): LexerBlockContext | null {
        return this.getRuleContext(0, LexerBlockContext);
    }
    public actionBlock(): ActionBlockContext | null {
        return this.getRuleContext(0, ActionBlockContext);
    }
    public QUESTION(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.QUESTION, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerElement;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerElement) {
             listener.enterLexerElement(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerElement) {
             listener.exitLexerElement(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerElement) {
            return visitor.visitLexerElement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerBlockContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.LPAREN, 0)!;
    }
    public lexerAltList(): LexerAltListContext {
        return this.getRuleContext(0, LexerAltListContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.RPAREN, 0)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerBlock;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerBlock) {
             listener.enterLexerBlock(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerBlock) {
             listener.exitLexerBlock(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerBlock) {
            return visitor.visitLexerBlock(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerCommandsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RARROW(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.RARROW, 0)!;
    }
    public lexerCommand(): LexerCommandContext[];
    public lexerCommand(i: number): LexerCommandContext | null;
    public lexerCommand(i?: number): LexerCommandContext[] | LexerCommandContext | null {
        if (i === undefined) {
            return this.getRuleContexts(LexerCommandContext);
        }

        return this.getRuleContext(i, LexerCommandContext);
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.COMMA);
    	} else {
    		return this.getToken(ANTLRv4Parser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerCommands;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerCommands) {
             listener.enterLexerCommands(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerCommands) {
             listener.exitLexerCommands(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerCommands) {
            return visitor.visitLexerCommands(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerCommandContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public lexerCommandName(): LexerCommandNameContext {
        return this.getRuleContext(0, LexerCommandNameContext)!;
    }
    public LPAREN(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.LPAREN, 0);
    }
    public lexerCommandExpr(): LexerCommandExprContext | null {
        return this.getRuleContext(0, LexerCommandExprContext);
    }
    public RPAREN(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.RPAREN, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerCommand;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerCommand) {
             listener.enterLexerCommand(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerCommand) {
             listener.exitLexerCommand(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerCommand) {
            return visitor.visitLexerCommand(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerCommandNameContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public identifier(): IdentifierContext | null {
        return this.getRuleContext(0, IdentifierContext);
    }
    public MODE(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.MODE, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerCommandName;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerCommandName) {
             listener.enterLexerCommandName(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerCommandName) {
             listener.exitLexerCommandName(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerCommandName) {
            return visitor.visitLexerCommandName(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerCommandExprContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public identifier(): IdentifierContext | null {
        return this.getRuleContext(0, IdentifierContext);
    }
    public INT(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.INT, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerCommandExpr;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerCommandExpr) {
             listener.enterLexerCommandExpr(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerCommandExpr) {
             listener.exitLexerCommandExpr(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerCommandExpr) {
            return visitor.visitLexerCommandExpr(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AltListContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public alternative(): AlternativeContext[];
    public alternative(i: number): AlternativeContext | null;
    public alternative(i?: number): AlternativeContext[] | AlternativeContext | null {
        if (i === undefined) {
            return this.getRuleContexts(AlternativeContext);
        }

        return this.getRuleContext(i, AlternativeContext);
    }
    public OR(): antlr.TerminalNode[];
    public OR(i: number): antlr.TerminalNode | null;
    public OR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.OR);
    	} else {
    		return this.getToken(ANTLRv4Parser.OR, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_altList;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterAltList) {
             listener.enterAltList(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitAltList) {
             listener.exitAltList(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitAltList) {
            return visitor.visitAltList(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AlternativeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public elementOptions(): ElementOptionsContext | null {
        return this.getRuleContext(0, ElementOptionsContext);
    }
    public element(): ElementContext[];
    public element(i: number): ElementContext | null;
    public element(i?: number): ElementContext[] | ElementContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ElementContext);
        }

        return this.getRuleContext(i, ElementContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_alternative;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterAlternative) {
             listener.enterAlternative(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitAlternative) {
             listener.exitAlternative(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitAlternative) {
            return visitor.visitAlternative(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ElementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public labeledElement(): LabeledElementContext | null {
        return this.getRuleContext(0, LabeledElementContext);
    }
    public ebnfSuffix(): EbnfSuffixContext | null {
        return this.getRuleContext(0, EbnfSuffixContext);
    }
    public atom(): AtomContext | null {
        return this.getRuleContext(0, AtomContext);
    }
    public ebnf(): EbnfContext | null {
        return this.getRuleContext(0, EbnfContext);
    }
    public actionBlock(): ActionBlockContext | null {
        return this.getRuleContext(0, ActionBlockContext);
    }
    public QUESTION(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.QUESTION, 0);
    }
    public predicateOptions(): PredicateOptionsContext | null {
        return this.getRuleContext(0, PredicateOptionsContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_element;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterElement) {
             listener.enterElement(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitElement) {
             listener.exitElement(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitElement) {
            return visitor.visitElement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PredicateOptionsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LT(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.LT, 0)!;
    }
    public predicateOption(): PredicateOptionContext[];
    public predicateOption(i: number): PredicateOptionContext | null;
    public predicateOption(i?: number): PredicateOptionContext[] | PredicateOptionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(PredicateOptionContext);
        }

        return this.getRuleContext(i, PredicateOptionContext);
    }
    public GT(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.GT, 0)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.COMMA);
    	} else {
    		return this.getToken(ANTLRv4Parser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_predicateOptions;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterPredicateOptions) {
             listener.enterPredicateOptions(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitPredicateOptions) {
             listener.exitPredicateOptions(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitPredicateOptions) {
            return visitor.visitPredicateOptions(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class PredicateOptionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public elementOption(): ElementOptionContext | null {
        return this.getRuleContext(0, ElementOptionContext);
    }
    public identifier(): IdentifierContext | null {
        return this.getRuleContext(0, IdentifierContext);
    }
    public ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.ASSIGN, 0);
    }
    public actionBlock(): ActionBlockContext | null {
        return this.getRuleContext(0, ActionBlockContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_predicateOption;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterPredicateOption) {
             listener.enterPredicateOption(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitPredicateOption) {
             listener.exitPredicateOption(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitPredicateOption) {
            return visitor.visitPredicateOption(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LabeledElementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public identifier(): IdentifierContext {
        return this.getRuleContext(0, IdentifierContext)!;
    }
    public ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.ASSIGN, 0);
    }
    public PLUS_ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.PLUS_ASSIGN, 0);
    }
    public atom(): AtomContext | null {
        return this.getRuleContext(0, AtomContext);
    }
    public block(): BlockContext | null {
        return this.getRuleContext(0, BlockContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_labeledElement;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLabeledElement) {
             listener.enterLabeledElement(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLabeledElement) {
             listener.exitLabeledElement(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLabeledElement) {
            return visitor.visitLabeledElement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class EbnfContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public block(): BlockContext {
        return this.getRuleContext(0, BlockContext)!;
    }
    public blockSuffix(): BlockSuffixContext | null {
        return this.getRuleContext(0, BlockSuffixContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_ebnf;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterEbnf) {
             listener.enterEbnf(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitEbnf) {
             listener.exitEbnf(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitEbnf) {
            return visitor.visitEbnf(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class BlockSuffixContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public ebnfSuffix(): EbnfSuffixContext {
        return this.getRuleContext(0, EbnfSuffixContext)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_blockSuffix;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterBlockSuffix) {
             listener.enterBlockSuffix(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitBlockSuffix) {
             listener.exitBlockSuffix(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitBlockSuffix) {
            return visitor.visitBlockSuffix(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class EbnfSuffixContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public QUESTION(): antlr.TerminalNode[];
    public QUESTION(i: number): antlr.TerminalNode | null;
    public QUESTION(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.QUESTION);
    	} else {
    		return this.getToken(ANTLRv4Parser.QUESTION, i);
    	}
    }
    public STAR(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.STAR, 0);
    }
    public PLUS(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.PLUS, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_ebnfSuffix;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterEbnfSuffix) {
             listener.enterEbnfSuffix(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitEbnfSuffix) {
             listener.exitEbnfSuffix(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitEbnfSuffix) {
            return visitor.visitEbnfSuffix(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class LexerAtomContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public characterRange(): CharacterRangeContext | null {
        return this.getRuleContext(0, CharacterRangeContext);
    }
    public terminalDef(): TerminalDefContext | null {
        return this.getRuleContext(0, TerminalDefContext);
    }
    public notSet(): NotSetContext | null {
        return this.getRuleContext(0, NotSetContext);
    }
    public LEXER_CHAR_SET(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.LEXER_CHAR_SET, 0);
    }
    public DOT(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.DOT, 0);
    }
    public elementOptions(): ElementOptionsContext | null {
        return this.getRuleContext(0, ElementOptionsContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_lexerAtom;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterLexerAtom) {
             listener.enterLexerAtom(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitLexerAtom) {
             listener.exitLexerAtom(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitLexerAtom) {
            return visitor.visitLexerAtom(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class AtomContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public terminalDef(): TerminalDefContext | null {
        return this.getRuleContext(0, TerminalDefContext);
    }
    public ruleref(): RulerefContext | null {
        return this.getRuleContext(0, RulerefContext);
    }
    public notSet(): NotSetContext | null {
        return this.getRuleContext(0, NotSetContext);
    }
    public DOT(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.DOT, 0);
    }
    public elementOptions(): ElementOptionsContext | null {
        return this.getRuleContext(0, ElementOptionsContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_atom;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterAtom) {
             listener.enterAtom(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitAtom) {
             listener.exitAtom(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitAtom) {
            return visitor.visitAtom(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class NotSetContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public NOT(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.NOT, 0)!;
    }
    public setElement(): SetElementContext | null {
        return this.getRuleContext(0, SetElementContext);
    }
    public blockSet(): BlockSetContext | null {
        return this.getRuleContext(0, BlockSetContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_notSet;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterNotSet) {
             listener.enterNotSet(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitNotSet) {
             listener.exitNotSet(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitNotSet) {
            return visitor.visitNotSet(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class BlockSetContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.LPAREN, 0)!;
    }
    public setElement(): SetElementContext[];
    public setElement(i: number): SetElementContext | null;
    public setElement(i?: number): SetElementContext[] | SetElementContext | null {
        if (i === undefined) {
            return this.getRuleContexts(SetElementContext);
        }

        return this.getRuleContext(i, SetElementContext);
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.RPAREN, 0)!;
    }
    public OR(): antlr.TerminalNode[];
    public OR(i: number): antlr.TerminalNode | null;
    public OR(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.OR);
    	} else {
    		return this.getToken(ANTLRv4Parser.OR, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_blockSet;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterBlockSet) {
             listener.enterBlockSet(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitBlockSet) {
             listener.exitBlockSet(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitBlockSet) {
            return visitor.visitBlockSet(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class SetElementContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TOKEN_REF(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.TOKEN_REF, 0);
    }
    public elementOptions(): ElementOptionsContext | null {
        return this.getRuleContext(0, ElementOptionsContext);
    }
    public STRING_LITERAL(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.STRING_LITERAL, 0);
    }
    public characterRange(): CharacterRangeContext | null {
        return this.getRuleContext(0, CharacterRangeContext);
    }
    public LEXER_CHAR_SET(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.LEXER_CHAR_SET, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_setElement;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterSetElement) {
             listener.enterSetElement(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitSetElement) {
             listener.exitSetElement(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitSetElement) {
            return visitor.visitSetElement(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class BlockContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LPAREN(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.LPAREN, 0)!;
    }
    public altList(): AltListContext {
        return this.getRuleContext(0, AltListContext)!;
    }
    public RPAREN(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.RPAREN, 0)!;
    }
    public COLON(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.COLON, 0);
    }
    public optionsSpec(): OptionsSpecContext | null {
        return this.getRuleContext(0, OptionsSpecContext);
    }
    public ruleAction(): RuleActionContext[];
    public ruleAction(i: number): RuleActionContext | null;
    public ruleAction(i?: number): RuleActionContext[] | RuleActionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(RuleActionContext);
        }

        return this.getRuleContext(i, RuleActionContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_block;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterBlock) {
             listener.enterBlock(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitBlock) {
             listener.exitBlock(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitBlock) {
            return visitor.visitBlock(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class RulerefContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RULE_REF(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.RULE_REF, 0)!;
    }
    public argActionBlock(): ArgActionBlockContext | null {
        return this.getRuleContext(0, ArgActionBlockContext);
    }
    public elementOptions(): ElementOptionsContext | null {
        return this.getRuleContext(0, ElementOptionsContext);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_ruleref;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterRuleref) {
             listener.enterRuleref(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitRuleref) {
             listener.exitRuleref(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitRuleref) {
            return visitor.visitRuleref(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class CharacterRangeContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public STRING_LITERAL(): antlr.TerminalNode[];
    public STRING_LITERAL(i: number): antlr.TerminalNode | null;
    public STRING_LITERAL(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.STRING_LITERAL);
    	} else {
    		return this.getToken(ANTLRv4Parser.STRING_LITERAL, i);
    	}
    }
    public RANGE(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.RANGE, 0)!;
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_characterRange;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterCharacterRange) {
             listener.enterCharacterRange(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitCharacterRange) {
             listener.exitCharacterRange(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitCharacterRange) {
            return visitor.visitCharacterRange(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class TerminalDefContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public TOKEN_REF(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.TOKEN_REF, 0);
    }
    public elementOptions(): ElementOptionsContext | null {
        return this.getRuleContext(0, ElementOptionsContext);
    }
    public STRING_LITERAL(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.STRING_LITERAL, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_terminalDef;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterTerminalDef) {
             listener.enterTerminalDef(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitTerminalDef) {
             listener.exitTerminalDef(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitTerminalDef) {
            return visitor.visitTerminalDef(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ElementOptionsContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public LT(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.LT, 0)!;
    }
    public elementOption(): ElementOptionContext[];
    public elementOption(i: number): ElementOptionContext | null;
    public elementOption(i?: number): ElementOptionContext[] | ElementOptionContext | null {
        if (i === undefined) {
            return this.getRuleContexts(ElementOptionContext);
        }

        return this.getRuleContext(i, ElementOptionContext);
    }
    public GT(): antlr.TerminalNode {
        return this.getToken(ANTLRv4Parser.GT, 0)!;
    }
    public COMMA(): antlr.TerminalNode[];
    public COMMA(i: number): antlr.TerminalNode | null;
    public COMMA(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    	if (i === undefined) {
    		return this.getTokens(ANTLRv4Parser.COMMA);
    	} else {
    		return this.getToken(ANTLRv4Parser.COMMA, i);
    	}
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_elementOptions;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterElementOptions) {
             listener.enterElementOptions(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitElementOptions) {
             listener.exitElementOptions(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitElementOptions) {
            return visitor.visitElementOptions(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class ElementOptionContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public identifier(): IdentifierContext[];
    public identifier(i: number): IdentifierContext | null;
    public identifier(i?: number): IdentifierContext[] | IdentifierContext | null {
        if (i === undefined) {
            return this.getRuleContexts(IdentifierContext);
        }

        return this.getRuleContext(i, IdentifierContext);
    }
    public ASSIGN(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.ASSIGN, 0);
    }
    public STRING_LITERAL(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.STRING_LITERAL, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_elementOption;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterElementOption) {
             listener.enterElementOption(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitElementOption) {
             listener.exitElementOption(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitElementOption) {
            return visitor.visitElementOption(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}


export class IdentifierContext extends antlr.ParserRuleContext {
    public constructor(parent: antlr.ParserRuleContext | null, invokingState: number) {
        super(parent, invokingState);
    }
    public RULE_REF(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.RULE_REF, 0);
    }
    public TOKEN_REF(): antlr.TerminalNode | null {
        return this.getToken(ANTLRv4Parser.TOKEN_REF, 0);
    }
    public override get ruleIndex(): number {
        return ANTLRv4Parser.RULE_identifier;
    }
    public override enterRule(listener: ANTLRv4ParserListener): void {
        if(listener.enterIdentifier) {
             listener.enterIdentifier(this);
        }
    }
    public override exitRule(listener: ANTLRv4ParserListener): void {
        if(listener.exitIdentifier) {
             listener.exitIdentifier(this);
        }
    }
    public override accept<Result>(visitor: ANTLRv4ParserVisitor<Result>): Result | null {
        if (visitor.visitIdentifier) {
            return visitor.visitIdentifier(this);
        } else {
            return visitor.visitChildren(this);
        }
    }
}
