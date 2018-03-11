/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { Lexer } from 'antlr4ts';
import { CharStream } from 'antlr4ts';
import { Token } from 'antlr4ts';
import { Interval } from 'antlr4ts/misc';

import { ANTLRv4Lexer } from './ANTLRv4Lexer';

export abstract class LexerAdaptor extends Lexer {
    private currentRuleType : number = Token.INVALID_TYPE;

    public emit(): Token {
        if (this._type == ANTLRv4Lexer.ID) {
            let firstChar : string = this._input.getText(new Interval(this._tokenStartCharIndex, this._tokenStartCharIndex));
            if (firstChar.charAt(0) == firstChar.charAt(0).toUpperCase()) {
                this._type = ANTLRv4Lexer.TOKEN_REF;
            } else {
                this._type = ANTLRv4Lexer.RULE_REF;
            }

            if (this.currentRuleType == Token.INVALID_TYPE) { // if outside of rule def
                this.currentRuleType = this._type; // set to inside lexer or parser rule
            }
        } else if (this._type == ANTLRv4Lexer.SEMI) { // exit rule def
            this.currentRuleType = Token.INVALID_TYPE;
        }
        return super.emit();
    }

    protected handleBeginArgument() {
        if (this.currentRuleType == ANTLRv4Lexer.TOKEN_REF) {
            this.pushMode(ANTLRv4Lexer.LexerCharSet);
            this.more();
        } else {
            this.pushMode(ANTLRv4Lexer.Argument);
        }
    }

    protected handleEndArgument() {
        this.popMode();
        if (this._modeStack.size > 0) {
            this.type = ANTLRv4Lexer.ARGUMENT_CONTENT;
        }
    }

    protected handleEndAction() {
        this.popMode();
        if (this._modeStack.size > 0) {
            this.type = ANTLRv4Lexer.ACTION_CONTENT;
        }
    }
}
