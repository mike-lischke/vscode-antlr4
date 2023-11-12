   		/* 
   		   *
 An initial comment
*/
/** * */
       grammar
   
        raw;

/*
* Permission is hereby granted,    free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
*           THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/ 

/*
 Permission is hereby granted,    free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
*The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*           THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
     // Permission is hereby granted,    free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  //
//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
//           THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// A separate comment.

//-------------------------------------------------------------------------------------------------



// $antlr-format minEmptyLines 0
      options
       { /*Inline comment that stays before the non-comment content.*/superClass=
       Base1   ;superClass=Base2;
       /* Another such comment. The previous code moved to an own line. */ superClass = Base3; // trailing comment
       
       /* Comment stays as it is. Min-empty-line-setting only has an effect on top level elements. */
       superClass
       = /* Multiple lines of a single command with embedded comments is combined to a single line. */
       Base4
 /* inline comment */
       ;
       // Single line comment, non-trailing. Stays as is without separator line.
/*Standalone comment (indentation needs correction)*/}

channels { CommentsChannel, DirectiveChannel } // Trailing comment.

tokens {// Trailing comment, which only gets a space in front.
	DUMMY, Blah, 
	
	// Empty-lines-to-keep defaults to 1, so the previous empty line is kept as is.
			AnotherToken, YetAnotherOneWithLongName // And another trailing comment.
}


// $antlr-format minEmptyLines 1
     options 

       { /*Other comment.*/superClass=
       Base1   ;superClass=Base2;
       /* comment */ superClass = Base3; // trailing comment
       /* another comment */
       superClass
       = /* inline comment */
       Base4
 /* inline comment */
       ;
       // Single line comment, non-trailing
                                                     /*final comment*/}
channels { CommentsChannel, DirectiveChannel }
// Tokens comment.
tokens {// Trailing comment 1.
	DUMMY, Blah, 
	
	// Description of these tokens.
			AnotherToken, YetAnotherOneWithLongName // This is important.
} // Trailing comment 2.

	import Blah;
          // These are all supported parser sections:

// Parser file header. Appears at the top in all parser related files. Use e.g. for copyrights.
@ parser
::
header {/* parser/listener/visitor header section */}

// Appears before any #include in h + cpp files.
@parser::preinclude {/* parser precinclude section */}

// Appears in the private part of the parser in the h file.
// The function bodies could also appear in the definitions section, but I want to maximize
// Java compatibility, so we can also create a Java parser from this grammar.
// Still, some tweaking is necessary after the Java file generation (e.g. bool -> boolean).
@parser::members {
/* public parser declarations/members section */
bool myAction() { return true; }
bool doesItBlend() { return true; }
void cleanUp() {}
void doInit() {}
void doAfter() {}
}

// Appears in the public part of the parser in the h file.
@parser::declarations {/* private parser declarations section */}

// Appears in line with the other class member definitions in the cpp file.
@parser::definitions {/* parser definitions section */}

//------------------------------------------------------------------------------------------------------------------
// $antlr-format maxEmptyLinesToKeep: 8, minEmptyLines 0
@parser::listenerpreinclude {/* listener preinclude section */}@parser::listenerpostinclude {/* listener postinclude section */}
@parser::listenerdeclarations {/* listener public declarations/members section */}
@parser::listenermembers {/* listener private declarations/members section */}
@parser::listenerdefinitions {/* listener definitions section */}










@parser::baselistenerpreinclude   {/* base listener preinclude section */}
@parser::baselistenerpostinclude  {/* base listener postinclude section */}
@parser::baselistenerdeclarations {/* base listener public declarations/members section */}
@parser::baselistenermembers      {/* base listener private declarations/members section */}
@parser::baselistenerdefinitions  {/* base listener definitions section */}










@parser::visitorpreinclude {/* visitor preinclude section */}
@parser::visitorpostinclude {/* visitor postinclude section */}
@parser::visitordeclarations {/* visitor public declarations/members section */}
@parser::visitormembers {/* visitor private declarations/members section */}
@parser::visitordefinitions {/* visitor definitions section */}










@parser::basevisitorpreinclude {/* base visitor preinclude section */}
@parser::basevisitorpostinclude {/* base visitor postinclude section */}
@parser::basevisitordeclarations {/* base visitor public declarations/members section */}
@parser::basevisitormembers {/* base visitor private declarations/members section */}
@parser::basevisitordefinitions {/* base visitor definitions section */}

//------------------------------------------------------------------------------------------------------------------
// $antlr-format maxEmptyLinesToKeep: 5, minEmptyLines 1
@parser::listenerpreinclude {/* listener preinclude section */}@parser::listenerpostinclude {/* listener postinclude section */}
@parser::listenerdeclarations {/* listener public declarations/members section */}
@parser::listenermembers {/* listener private declarations/members section */}
@parser::listenerdefinitions {/* listener definitions section */}










@parser::baselistenerpreinclude   {/* base listener preinclude section */}
@parser::baselistenerpostinclude  {/* base listener postinclude section */}
@parser::baselistenerdeclarations {/* base listener public declarations/members section */}
@parser::baselistenermembers      {/* base listener private declarations/members section */}
@parser::baselistenerdefinitions  {/* base listener definitions section */}










@parser::visitorpreinclude {/* visitor preinclude section */}
@parser::visitorpostinclude {/* visitor postinclude section */}
@parser::visitordeclarations {/* visitor public declarations/members section */}
@parser::visitormembers {/* visitor private declarations/members section */}
@parser::visitordefinitions {/* visitor definitions section */}










@parser::basevisitorpreinclude {/* base visitor preinclude section */}
@parser::basevisitorpostinclude {/* base visitor postinclude section */}
@parser::basevisitordeclarations {/* base visitor public declarations/members section */}
@parser::basevisitormembers {/* base visitor private declarations/members section */}
@parser::basevisitordefinitions {/* base visitor definitions section */}

//------------------------------------------------------------------------------------------------------------------
// $antlr-format maxEmptyLinesToKeep: 3, minEmptyLines 3
@parser::listenerpreinclude {/* listener preinclude section */}@parser::listenerpostinclude {/* listener postinclude section */}
@parser::listenerdeclarations {/* listener public declarations/members section */}
@parser::listenermembers {/* listener private declarations/members section */}
@parser::listenerdefinitions {/* listener definitions section */}










@parser::baselistenerpreinclude   {/* base listener preinclude section */}
@parser::baselistenerpostinclude  {/* base listener postinclude section */}
@parser::baselistenerdeclarations {/* base listener public declarations/members section */}
@parser::baselistenermembers      {/* base listener private declarations/members section */}
@parser::baselistenerdefinitions  {/* base listener definitions section */}










@parser::visitorpreinclude {/* visitor preinclude section */}
@parser::visitorpostinclude {/* visitor postinclude section */}
@parser::visitordeclarations {/* visitor public declarations/members section */}
@parser::visitormembers {/* visitor private declarations/members section */}
@parser::visitordefinitions {/* visitor definitions section */}










@parser::basevisitorpreinclude {/* base visitor preinclude section */}
@parser::basevisitorpostinclude {/* base visitor postinclude section */}
@parser::basevisitordeclarations {/* base visitor public declarations/members section */}
@parser::basevisitormembers {/* base visitor private declarations/members section */}
@parser::basevisitordefinitions {/* base visitor definitions section */}

//------------------------------------------------------------------------------------------------------------------
// $antlr-format maxEmptyLinesToKeep: 1, minEmptyLines 5
@parser::listenerpreinclude {/* listener preinclude section */}@parser::listenerpostinclude {/* listener postinclude section */}
@parser::listenerdeclarations {/* listener public declarations/members section */}
@parser::listenermembers {/* listener private declarations/members section */}
@parser::listenerdefinitions {/* listener definitions section */}










@parser::baselistenerpreinclude   {/* base listener preinclude section */}
@parser::baselistenerpostinclude  {/* base listener postinclude section */}
@parser::baselistenerdeclarations {/* base listener public declarations/members section */}
@parser::baselistenermembers      {/* base listener private declarations/members section */}
@parser::baselistenerdefinitions  {/* base listener definitions section */}










@parser::visitorpreinclude {/* visitor preinclude section */}
@parser::visitorpostinclude {/* visitor postinclude section */}
@parser::visitordeclarations {/* visitor public declarations/members section */}
@parser::visitormembers {/* visitor private declarations/members section */}
@parser::visitordefinitions {/* visitor definitions section */}










@parser::basevisitorpreinclude {/* base visitor preinclude section */}
@parser::basevisitorpostinclude {/* base visitor postinclude section */}
@parser::basevisitordeclarations {/* base visitor public declarations/members section */}
@parser::basevisitormembers {/* base visitor private declarations/members section */}
@parser::basevisitordefinitions {/* base visitor definitions section */}

//------------------------------------------------------------------------------------------------------------------
// $antlr-format maxEmptyLinesToKeep: 0, minEmptyLines 100
@parser::listenerpreinclude {/* listener preinclude section */}@parser::listenerpostinclude {/* listener postinclude section */}
@parser::listenerdeclarations {/* listener public declarations/members section */}
@parser::listenermembers {/* listener private declarations/members section */}
@parser::listenerdefinitions {/* listener definitions section */}










@parser::baselistenerpreinclude   {/* base listener preinclude section */}
@parser::baselistenerpostinclude  {/* base listener postinclude section */}
@parser::baselistenerdeclarations {/* base listener public declarations/members section */}
@parser::baselistenermembers      {/* base listener private declarations/members section */}
@parser::baselistenerdefinitions  {/* base listener definitions section */}










@parser::visitorpreinclude {/* visitor preinclude section */}
@parser::visitorpostinclude {/* visitor postinclude section */}
@parser::visitordeclarations {/* visitor public declarations/members section */}
@parser::visitormembers {/* visitor private declarations/members section */}
@parser::visitordefinitions {/* visitor definitions section */}










@parser::basevisitorpreinclude {/* base visitor preinclude section */}
@parser::basevisitorpostinclude {/* base visitor postinclude section */}
@parser::basevisitordeclarations {/* base visitor public declarations/members section */}
@parser::basevisitormembers {/* base visitor private declarations/members section */}
@parser::basevisitordefinitions {/* base visitor definitions section */}

// $antlr-format reset
rule1: rule2 (COMMA rule2)*; rule2: TOKEN1;
and_ @init{ doInit(); } @after { doAfter(); } : And ;

conquer: // Comment comment
	// a description
	divide+
	| {doesItBlend()}? and_ { myAction(); } // trailing description
	// another description
	| ID (LessThan* divide)?? { $ID.text; }
;

// $antlr-format ruleInternalsOnSingleLine false
unused[double input = 111] returns [double calculated] locals [int _a, double _b, int _c] @init{ doInit(); } @after { doAfter(); } :
	stat
;



catch [...] {
  // Replaces the standard exception handling.
}       finally {
  cleanUp();
}

// $antlr-format ruleInternalsOnSingleLine: on
unused[double input = 111] returns [double calculated] locals [int _a, double _b, int _c] @init{ doInit(); } @after { doAfter(); } :
	stat
;



catch [...] {
  // Replaces the standard exception handling.
}       finally {
  cleanUp();
}


unused2:



	(unused[1] .)+ (Colon | Semicolon | Plus)? ~Semicolon
;

stat: expr Equal expr Semicolon
    | expr Semicolon
;

expr: expr Star expr
    | expr Plus expr  		  | OpenPar expr ClosePar
    | <assoc= right> expr QuestionMark expr Colon expr
    | <assoc =right> expr Equal expr
    | identifier = id
    | flowControl
    | INT
    | String
;

flowControl:
	(Return expr | 'return') # Return
	| Continue 				 # Continue
;

id: ID;
array : OpenCurly el += INT (Comma el += INT)* CloseCurly;
idarray : OpenCurly element += id (Comma element += id)* CloseCurly;
any: t 
	= .;

// $antlr-format alignColons: none, alignFirstTokens on, alignLexerCommands true
Colon: ':';
Semicolon: ';' ;
Plus: '+';
Minus: '-';
Star: '*';
OpenPar: '(';
ClosePar: ')';
OpenCurly: '{';
CloseCurly: '}';
QuestionMark: '?';
Comma: ',' -> skip;
Dollar: '$';
LongLongLongToken: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' -> mode(Blah);
Ampersand: '&' -> type(DUMMY), mode(Blah);

String: '"' .*? '"';
// $antlr-format alignColons: hanging, singleLineOverrulesHangingColon: false
Foo: {canTestFoo()}? 'foo' {isItFoo()}? { myFooLexerAction(); };
// $antlr-format alignColons: hanging, singleLineOverrulesHangingColon: true
Foo: {canTestFoo()}? 'foo' {isItFoo()}? { myFooLexerAction(); };
Bar: 'bar' {isItBar()}? { myBarLexerAction(); };
Any: Foo Dot Bar? DotDot Baz Bar;

Comment : '#' ~[\r\n]* '\r'? '\n';// -> channel(CommentsChannel);
WS: [\r\n]  + -> channel(99);  // A custom, but the default channel.
WS2: [ \t]
+ -> channel(HIDDEN);

// Operators
EQUAL_OPERATOR:             '=';  // Also assign.
ASSIGN_OPERATOR:            ':=';
NULL_SAFE_EQUAL_OPERATOR:   '<=>';
GREATER_OR_EQUAL_OPERATOR:  '>=';
GREATER_THAN_OPERATOR:      '>';
LESS_OR_EQUAL_OPERATOR:     '<=';
LESS_THAN_OPERATOR:         '<';
NOT_EQUAL_OPERATOR:         '!=';
NOT_EQUAL2_OPERATOR:        '<>' -> type(NOT_EQUAL_OPERATOR);

PLUS_OPERATOR:              '+';
MINUS_OPERATOR:             '-';
MULT_OPERATOR:              '*';
DIV_OPERATOR:               '/';

MOD_OPERATOR:               '%';

LOGICAL_NOT_OPERATOR:       '!';
BITWISE_NOT_OPERATOR:       '~';

SHIFT_LEFT_OPERATOR:        '<<';
SHIFT_RIGHT_OPERATOR:       '>>';

LOGICAL_AND_OPERATOR:       '&&';
BITWISE_AND_OPERATOR:       '&';

BITWISE_XOR_OPERATOR:       '^';

LOGICAL_OR_OPERATOR:        '||'    { setType(isSqlModeActive(PipesAsConcat) ? CONCAT_PIPES_SYMBOL : LOGICAL_OR_OPERATOR); };
BITWISE_OR_OPERATOR:        '|';

DOT_SYMBOL:                 '.';
COMMA_SYMBOL:               ',';
SEMICOLON_SYMBOL:           ';';
COLON_SYMBOL:               ':';
OPEN_PAR_SYMBOL:            '(';
CLOSE_PAR_SYMBOL:           ')';
OPEN_CURLY_SYMBOL:          '{';
CLOSE_CURLY_SYMBOL:         '}';
UNDERLINE_SYMBOL:           '_';

JSON_SEPARATOR_SYMBOL:          '->'  {serverVersion >= 50708}?; // MYSQL
JSON_UNQUOTED_SEPARATOR_SYMBOL: '->>' {serverVersion >= 50713}?; // MYSQL

// The MySQL server parser uses custom code in its lexer to allow base alphanum chars (and ._$) as variable name.
// For this it handles user variables in 2 different ways and we have to model this to match that behavior.
AT_SIGN_SYMBOL:             '@';
AT_TEXT_SUFFIX:             '@' SIMPLE_IDENTIFIER;

AT_AT_SIGN_SYMBOL:          '@@';

NULL2_SYMBOL:               '\\N';
PARAM_MARKER:               '?';

fragment A: [aA];
fragment B: [bB];
fragment C: [cC];
fragment D: [dD];
fragment E: [eE];
fragment F: [fF];
fragment G: [gG];
fragment H: [hH];
fragment I: [iI];
fragment J: [jJ];
fragment K: [kK];
fragment L: [lL];
fragment M: [mM];
fragment N: [nN];
fragment O: [oO];
fragment P: [pP];
fragment Q: [qQ];
fragment R: [rR];
fragment S: [sS];
fragment T: [tT];
fragment U: [uU];
fragment V: [vV];
fragment W: [wW];
fragment X: [xX];
fragment Y: [yY];
fragment Z: [zZ];

fragment DIGIT:    [0-9];
fragment DIGITS:   DIGIT+;
fragment HEXDIGIT: [0-9a-fA-F];

// Only lower case 'x' and 'b' count for hex + bin numbers. Otherwise it's an identifier.
HEX_NUMBER:     ('0x' HEXDIGIT+) | ('x\'' HEXDIGIT+ '\'');
BIN_NUMBER:     ('0b' [01]+) | ('b\'' [01]+ '\'');

NUMBER: DIGITS { setType(determineNumericType(getText())); };

// $antlr-format reset, groupedAlignments on, reflowComments off

/*
   Tokens from MySQL 8.0
*/
// $antlr-format groupedAlignments off, alignFirstTokens on, alignTrailers on, columnLimit: 150
PERSIST_SYMBOL:                         P E R S I S T                                               {serverVersion >= 80000}?;
ROLE_SYMBOL:                            R O L E                                                     {serverVersion >= 80000}?; // SQL-1999-R
ADMIN_SYMBOL:                           A D M I N                                                   {serverVersion >= 80000}?; // SQL-1999-R
INVISIBLE_SYMBOL:                       I N V I S I B L E                                           {serverVersion >= 80000}?;
VISIBLE_SYMBOL:                         V I S I B L E                                               {serverVersion >= 80000}?;
EXCEPT_SYMBOL:                          E X C E P T                                                 {serverVersion >= 80000}?; // SQL-1999-R
COMPONENT_SYMBOL:                       C O M P O N E N T                                           {serverVersion >= 80000}?; // MYSQL
RECURSIVE_SYMBOL:                       R E C U R S I V E                                           {serverVersion >= 80001}?; // SQL-1999-R
//GRAMMAR_SELECTOR_EXPR:;               // synthetic token: starts single expr.
//GRAMMAR_SELECTOR_GCOL:;               // synthetic token: starts generated col.
//GRAMMAR_SELECTOR_PART:;               // synthetic token: starts partition expr.
//GRAMMAR_SELECTOR_CTE:;               // synthetic token: starts CTE expr.
JSON_OBJECTAGG_SYMBOL:                  J S O N '_' O B J E C T A G G                              {serverVersion >= 80000}?; // SQL-2015-R
JSON_ARRAYAGG_SYMBOL:                   J S O N '_' A R R A Y A G G                                {serverVersion >= 80000}?; // SQL-2015-R
OF_SYMBOL:                              O F                                                        {serverVersion >= 80001}?; // SQL-1999-R
SKIP_SYMBOL:                            S K I P                                                    {serverVersion >= 80001}?; // MYSQL
LOCKED_SYMBOL:                          L O C K E D                                                {serverVersion >= 80001}?; // MYSQL
NOWAIT_SYMBOL:                          N O W A I T                                                {serverVersion >= 80001}?; // MYSQL
GROUPING_SYMBOL:                        G R O U P I N G                                            {serverVersion >= 80001}?; // SQL-2011-R

// Additional tokens which are mapped to existing tokens.
INT1_SYMBOL:                            I N T '1'                                                   -> type(TINYINT_SYMBOL); // Synonym
INT2_SYMBOL:                            I N T '2'                                                   -> type(SMALLINT_SYMBOL); // Synonym
INT3_SYMBOL:                            I N T '3'                                                   -> type(MEDIUMINT_SYMBOL); // Synonym
INT4_SYMBOL:                            I N T '4'                                                   -> type(INT_SYMBOL); // Synonym
INT8_SYMBOL:                            I N T '8'                                                   -> type(BIGINT_SYMBOL); // Synonym

SQL_TSI_FRAC_SECOND_SYMBOL:             S Q L '_' T S I '_' F R A C '_' S E C O N D                 {serverVersion < 50503}? -> type(FRAC_SECOND_SYMBOL); // Synonym
SQL_TSI_SECOND_SYMBOL:                  S Q L '_' T S I '_' S E C O N D                             -> type(SECOND_SYMBOL); // Synonym
SQL_TSI_MINUTE_SYMBOL:                  S Q L '_' T S I '_' M I N U T E                             -> type(MINUTE_SYMBOL); // Synonym
SQL_TSI_HOUR_SYMBOL:                    S Q L '_' T S I '_' H O U R                                 -> type(HOUR_SYMBOL); // Synonym
SQL_TSI_DAY_SYMBOL:                     S Q L '_' T S I '_' D A Y                                   -> type(DAY_SYMBOL); // Synonym
SQL_TSI_WEEK_SYMBOL:                    S Q L '_' T S I '_' W E E K                                 -> type(WEEK_SYMBOL); // Synonym
SQL_TSI_MONTH_SYMBOL:                   S Q L '_' T S I '_' M O N T H                               -> type(MONTH_SYMBOL); // Synonym
SQL_TSI_QUARTER_SYMBOL:                 S Q L '_' T S I '_' Q U A R T E R                           -> type(QUARTER_SYMBOL); // Synonym
SQL_TSI_YEAR_SYMBOL:                    S Q L '_' T S I '_' Y E A R                                 -> type(YEAR_SYMBOL); // Synonym
// $antlr-format groupedAlignments on

// White space handling
WHITESPACE: [ \t\f\r\n] -> channel(HIDDEN);  // Ignore whitespaces.

// Input not covered elsewhere (unless quoted).
INVALID_INPUT:
    [\u0001-\u0008]   // Control codes.
    | '\u000B'        // Line tabulation.
    | '\u000C'        // Form feed.
    | [\u000E-\u001F] // More control codes.
    | '['
    | ']'
;

// $antlr-format columnLimit: 120
UNDERSCORE_CHARSET: UNDERLINE_SYMBOL IDENTIFIER { setType(checkCharset(getText())); };

// Identifiers might start with a digit, even tho it is discouraged, and may not consist entirely of digits only.
// All keywords above are automatically excluded.
IDENTIFIER:
  DIGITS+ [eE] (LETTER_WHEN_UNQUOTED_NO_DIGIT LETTER_WHEN_UNQUOTED*)? // Have to exclude float pattern, as this rule matches more.
  | DIGITS+ LETTER_WITHOUT_FLOAT_PART LETTER_WHEN_UNQUOTED*
  | LETTER_WHEN_UNQUOTED_NO_DIGIT LETTER_WHEN_UNQUOTED* // INT_NUMBER matches first if there are only digits.
;

// $antlr-format alignTrailers off, alignActions off
// Ok, here's another twist: back quoted identifiers don't support the first form (it is interpreted as two identifiers).
BACK_TICK_QUOTED_ID:
  BACK_TICK (
    {!isSqlModeActive(NoBackslashEscapes)}? (ESCAPE_SEQUENCE | ~[\\`])
    | {isSqlModeActive(NoBackslashEscapes)}? ~[`]
  )*?
  BACK_TICK
;

DOUBLE_QUOTED_TEXT: (
  DOUBLE_QUOTE (
    DOUBLE_QUOTE DOUBLE_QUOTE
    | {!isSqlModeActive(NoBackslashEscapes)}? (ESCAPE_SEQUENCE | ~[\\"])
    | {isSqlModeActive(NoBackslashEscapes)}? ~["]
  )*?
  DOUBLE_QUOTE
);

// $antlr-format breakBeforeParens: true
SINGLE_QUOTED_TEXT: (
  SINGLE_QUOTE (
    SINGLE_QUOTE SINGLE_QUOTE
    | {!isSqlModeActive(NoBackslashEscapes)}? (ESCAPE_SEQUENCE | ~[\\'])
    | {isSqlModeActive(NoBackslashEscapes)}? ~[']
  )*?
  SINGLE_QUOTE
);

fragment ESCAPE_SEQUENCE: '\\' .; // Valid chars: 0'"bnrtZ\%_;

// $antlr-format breakBeforeParens: false
VERSION_COMMENT_START: ('/*!' DIGITS) (
  {checkVersion(getText())}? // Will set inVersionComment if the number matches.
  | .*? '*/'
) -> channel(HIDDEN);

// $antlr-format alignTrailers off
MYSQL_COMMENT_START: '/*!' { inVersionComment = true; } -> channel(HIDDEN);
VERSION_COMMENT_END: '*/' {inVersionComment}? { inVersionComment = false; } -> channel(HIDDEN);
BLOCK_COMMENT: ( '/**/' | '/*' ~[!] .*? '*/') -> channel(HIDDEN);

POUND_COMMENT: '#' ~([\n\r])*  -> channel(HIDDEN);
DASHDASH_COMMENT: DOUBLE_DASH ([ \t] (~[\n\r])* | LINEBREAK | EOF) -> channel(HIDDEN);

fragment DOUBLE_DASH: '--';
fragment LINEBREAK:   [\n\r];

fragment SIMPLE_IDENTIFIER: (DIGIT | [a-zA-Z_$] | DOT_SYMBOL)+;

fragment ML_COMMENT_HEAD: '/*';
fragment ML_COMMENT_END:  '*/';

// As defined in http://dev.mysql.com/doc/refman/5.6/en/identifiers.html.
fragment LETTER_WHEN_UNQUOTED:
    DIGIT
    | LETTER_WHEN_UNQUOTED_NO_DIGIT
;

fragment LETTER_WHEN_UNQUOTED_NO_DIGIT:
    [a-zA-Z_$\u0080-\uffff]
;

// Any letter but without e/E and digits (which are used to match a decimal number).
fragment LETTER_WITHOUT_FLOAT_PART:
    [a-df-zA-DF-Z_$\u0080-\uffff]
;

// $antlr-format minEmptyLines: 1
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 200, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: off

handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 120, continuationIndentWidth:9, indentWidth:7, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 50, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 50, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 50, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 50, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 50, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 50, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 50, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 50, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: true, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: off

handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 10, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 10, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 10, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 10, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine true, breakBeforeParens: false, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 10, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 10, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: true, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 10, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: on
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;
// $antlr-format columnLimit: 10, continuationIndentWidth:4, indentWidth:4, tabWidth 4, allowShortBlocksOnASingleLine: false, allowShortRulesOnASingleLine false, breakBeforeParens: false, useTab: off
handlerDeclaration:
    DECLARE_SYMBOL (CONTINUE_SYMBOL | (SHORT | BLOCK) | UNDO_SYMBOL) HANDLER_SYMBOL
        FOR_SYMBOL handlerCondition
;

// Testing block + comment formatting at various column limits. As a side task also spaces around assignments is checked here.
// $antlr-format: columnLimit: 100, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: off, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: off, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: on, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: on, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: off, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: off, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: on, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: on, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  

// $antlr-format: columnLimit: 100, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: off, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: off, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: on, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: on, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: off, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: off, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: on, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 100, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: on, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  

// $antlr-format: columnLimit: 90, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: off, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 80, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: off, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 70, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: on, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 60, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: on, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 50, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: off, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 40, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: off, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 30, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: on, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


/** Lorem ipsum dolor sit amet, consectetur adipisici elit,
 sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
 laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
   esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. */
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 20, breakBeforeBraces: off, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: on, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


/**
 * Lorem ipsum dolor sit amet, consectetur adipisici elit,
 * sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
 * laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
 * esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
 */
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  

// $antlr-format: columnLimit: 90, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: off, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 80, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: off, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 70, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: on, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 60, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: off, reflowComments: on, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 50, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: off, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 40, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: off, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 30, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: on, spaceBeforeAssignmentOperators: off
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
// $antlr-format: columnLimit: 20, breakBeforeBraces: on, keepEmptyLinesAtTheStartOfBlocks: on, reflowComments: on, spaceBeforeAssignmentOperators: on
ordinaryRule: TOKEN_ONE (aBlock | with | a | few | alts) (


// Lorem ipsum dolor sit amet, consectetur adipisici elit,
// sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
// laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit 
  // esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  anAltWithAnAction {doSomethingUseful()}
  | anotherAlt WITH_TOKEN /* and comment */ xyz=ANOTHER_TOKEN
  )
  ;
  
  
// Various more or less complex real world rules taken from the MySQL grammar. Reset all settings to defaults.
// $antlr-format reset, columnLimit 120
alterListItem:
    ADD_SYMBOL COLUMN_SYMBOL?
        (
            fieldIdentifier fieldDefinition checkOrReferences? place?
            | OPEN_PAR_SYMBOL tableElementList CLOSE_PAR_SYMBOL
        )
    | ADD_SYMBOL tableConstraintDef
    | CHANGE_SYMBOL COLUMN_SYMBOL? columnInternalRef fieldIdentifier fieldDefinition place?
    | MODIFY_SYMBOL COLUMN_SYMBOL? columnInternalRef fieldDefinition place?
    | DROP_SYMBOL
        (
            (INDEX_SYMBOL | KEY_SYMBOL) indexRef
            | COLUMN_SYMBOL? columnInternalRef restrict?
            | PRIMARY_SYMBOL KEY_SYMBOL
            | FOREIGN_SYMBOL KEY_SYMBOL
                (
                    // This part is no longer optional starting with 5.7.
                    {serverVersion >= 50700}? columnRef
                    | {serverVersion < 50700}? columnRef?
                )
        )
    | DISABLE_SYMBOL KEYS_SYMBOL
    | ENABLE_SYMBOL KEYS_SYMBOL
    | ALTER_SYMBOL COLUMN_SYMBOL? columnInternalRef SET_SYMBOL DEFAULT_SYMBOL signedLiteral
    | {serverVersion >= 80000}? ALTER_SYMBOL INDEX_SYMBOL indexRef visibility
    | ALTER_SYMBOL COLUMN_SYMBOL? columnInternalRef DROP_SYMBOL DEFAULT_SYMBOL
    | RENAME_SYMBOL (TO_SYMBOL | AS_SYMBOL)? tableName
    | {serverVersion >= 50700}? RENAME_SYMBOL (INDEX_SYMBOL | KEY_SYMBOL) indexRef TO_SYMBOL indexName
    | CONVERT_SYMBOL TO_SYMBOL charset charsetNameOrDefault (COLLATE_SYMBOL collationNameOrDefault)?
    | createTableOption+ // Space separated, no commas allowed.
    | FORCE_SYMBOL
    | alterOrderClause
    | {serverVersion >= 50708 && serverVersion < 80000}? UPGRADE_SYMBOL PARTITIONING_SYMBOL
;

place:
    AFTER_SYMBOL identifier
    | FIRST_SYMBOL
;

restrict:
    RESTRICT_SYMBOL | CASCADE_SYMBOL
;

alterOrderClause:
    ORDER_SYMBOL BY_SYMBOL identifier direction (COMMA_SYMBOL identifier direction)*
;

alterAlgorithmOption:
    ALGORITHM_SYMBOL EQUAL_OPERATOR? ( DEFAULT_SYMBOL | identifier )
;

alterLockOption:
    LOCK_SYMBOL EQUAL_OPERATOR? (DEFAULT_SYMBOL | identifier)
;

indexLockAndAlgorithm:
    {serverVersion >= 50600}?
        (
            alterAlgorithmOption alterLockOption?
            | alterLockOption alterAlgorithmOption?
        )
;

validation:
    {serverVersion >= 50706}? (WITH_SYMBOL | WITHOUT_SYMBOL) VALIDATION_SYMBOL
;

removePartitioning:
    {serverVersion >= 50100}? REMOVE_SYMBOL PARTITIONING_SYMBOL
;

allOrPartitionNameList:
    ALL_SYMBOL
    | identifierList
;

reorgPartitionRule:
    REORGANIZE_SYMBOL PARTITION_SYMBOL noWriteToBinLog? (identifierList INTO_SYMBOL partitionDefinitions)?

;

alterTablespace:
    TABLESPACE_SYMBOL tablespaceRef
    (
        (ADD_SYMBOL | DROP_SYMBOL) DATAFILE_SYMBOL textLiteral (alterTablespaceOption (COMMA_SYMBOL? alterTablespaceOption)*)?
        // The alternatives listed below are not documented but appear in the server grammar file.
        | CHANGE_SYMBOL DATAFILE_SYMBOL textLiteral (changeTablespaceOption (COMMA_SYMBOL? changeTablespaceOption)*)?
        | (READ_ONLY_SYMBOL | READ_WRITE_SYMBOL)
        | NOT_SYMBOL ACCESSIBLE_SYMBOL
    )
;

alterTablespaceOption:
    INITIAL_SIZE_SYMBOL EQUAL_OPERATOR? sizeNumber
    | AUTOEXTEND_SIZE_SYMBOL EQUAL_OPERATOR? sizeNumber
    | MAX_SIZE_SYMBOL EQUAL_OPERATOR? sizeNumber
    | STORAGE_SYMBOL? ENGINE_SYMBOL EQUAL_OPERATOR? engineRef
    | (WAIT_SYMBOL | NO_WAIT_SYMBOL)
;

changeTablespaceOption:
    INITIAL_SIZE_SYMBOL EQUAL_OPERATOR? sizeNumber
    | AUTOEXTEND_SIZE_SYMBOL EQUAL_OPERATOR? sizeNumber
    | MAX_SIZE_SYMBOL EQUAL_OPERATOR? sizeNumber
;

alterView:
    viewAlgorithm? definerClause? viewSuid? VIEW_SYMBOL viewRef viewTail
;

// This is not the full view_tail from sql_yacc.yy as we have either a view name or a view reference,
// depending on whether we come from createView or alterView. Everything until this difference is duplicated in those rules.
viewTail:
    columnInternalRefList? AS_SYMBOL viewSelect
;

viewSelect:
    queryExpressionOrParens viewCheckOption?
;

viewCheckOption:
    WITH_SYMBOL (CASCADED_SYMBOL | LOCAL_SYMBOL)? CHECK_SYMBOL OPTION_SYMBOL
;

//--------------------------------------------------------------------------------------------------

createStatement:
    createDatabase
    | createTable
    | createFunction
    | createProcedure
    | createUdf
    | createLogfileGroup
    | createView
    | createTrigger
    | createIndex
    | createServer
    | createTablespace
    | {serverVersion >= 50100}? createEvent
    | {serverVersion >= 80000}? createRole
;

createDatabase:
    CREATE_SYMBOL DATABASE_SYMBOL ifNotExists? schemaName createDatabaseOption*
;

createDatabaseOption:
    defaultCharset
    | defaultCollation
;

createTable:
    CREATE_SYMBOL TEMPORARY_SYMBOL? TABLE_SYMBOL ifNotExists? tableName
    (
        (OPEN_PAR_SYMBOL tableElementList CLOSE_PAR_SYMBOL)? createTableOptions? partitionClause? duplicateAsQueryExpression?
        | LIKE_SYMBOL tableRef
        | OPEN_PAR_SYMBOL LIKE_SYMBOL tableRef CLOSE_PAR_SYMBOL
    )
;

routineOption:
    option = COMMENT_SYMBOL textLiteral
    | option = LANGUAGE_SYMBOL SQL_SYMBOL
    | option = NO_SYMBOL SQL_SYMBOL
    | option = CONTAINS_SYMBOL SQL_SYMBOL
    | option = READS_SYMBOL SQL_SYMBOL DATA_SYMBOL
    | option = MODIFIES_SYMBOL SQL_SYMBOL DATA_SYMBOL
    | option = SQL_SYMBOL SECURITY_SYMBOL security = (DEFINER_SYMBOL | INVOKER_SYMBOL)
;

createIndex:
    CREATE_SYMBOL onlineOption?
    (
        UNIQUE_SYMBOL? type = INDEX_SYMBOL indexNameAndType createIndexTarget indexOption*
        | type = FULLTEXT_SYMBOL INDEX_SYMBOL indexName createIndexTarget fulltextIndexOption*
        | type = SPATIAL_SYMBOL INDEX_SYMBOL indexName createIndexTarget spatialIndexOption*
    )
    indexLockAndAlgorithm?
;

deleteStatement:
    ({serverVersion >= 80001}? withClause)? DELETE_SYMBOL deleteStatementOption*
        (
            FROM_SYMBOL
                (
                     tableAliasRefList USING_SYMBOL tableReferenceList whereClause? // Multi table variant 1.
                    | tableRef partitionDelete? whereClause? orderClause? simpleLimitClause? // Single table delete.
                )
            |  tableAliasRefList FROM_SYMBOL tableReferenceList whereClause? // Multi table variant 2.
        )
;

handlerReadOrScan:
    (FIRST_SYMBOL | NEXT_SYMBOL) // Scan function.
    | identifier
        (
            (FIRST_SYMBOL | NEXT_SYMBOL | PREV_SYMBOL | LAST_SYMBOL)
            | (EQUAL_OPERATOR | LESS_THAN_OPERATOR | GREATER_THAN_OPERATOR | LESS_OR_EQUAL_OPERATOR | GREATER_OR_EQUAL_OPERATOR)
                OPEN_PAR_SYMBOL values CLOSE_PAR_SYMBOL
        )
;

loadStatement:
    LOAD_SYMBOL dataOrXml (LOW_PRIORITY_SYMBOL | CONCURRENT_SYMBOL)? LOCAL_SYMBOL? INFILE_SYMBOL textLiteral
        (REPLACE_SYMBOL | IGNORE_SYMBOL)? INTO_SYMBOL TABLE_SYMBOL tableRef
        usePartition? charsetClause?
        xmlRowsIdentifiedBy?
        fieldsClause? linesClause?
        loadDataFileTail
;

grant:
    GRANT_SYMBOL
    (
        {serverVersion >= 80000}? roleOrPrivilegesList TO_SYMBOL userList  (WITH_SYMBOL ADMIN_SYMBOL OPTION_SYMBOL)?
        |
            (
                roleOrPrivilegesList
                | ALL_SYMBOL PRIVILEGES_SYMBOL?
            )
            ON_SYMBOL aclType? grantIdentifier TO_SYMBOL grantList requireClause? (WITH_SYMBOL grantOption+)?
        | {serverVersion >= 50500}? PROXY_SYMBOL ON_SYMBOL user TO_SYMBOL grantList
            (WITH_SYMBOL GRANT_SYMBOL OPTION_SYMBOL)?
    )
;

renameUser:
    RENAME_SYMBOL USER_SYMBOL user TO_SYMBOL user (COMMA_SYMBOL user TO_SYMBOL user)*
;

revoke:
    REVOKE_SYMBOL
    (
        {serverVersion >= 80000}? roleOrPrivilegesList FROM_SYMBOL userList
        | roleOrPrivilegesList onTypeTo FROM_SYMBOL userList
        | ALL_SYMBOL PRIVILEGES_SYMBOL?
            (
                {serverVersion >= 80001}? ON_SYMBOL aclType? grantIdentifier
                | COMMA_SYMBOL GRANT_SYMBOL OPTION_SYMBOL FROM_SYMBOL userList
            )
        | {serverVersion >= 50500}? PROXY_SYMBOL ON_SYMBOL user FROM_SYMBOL userList
    )
;

showStatement:
    SHOW_SYMBOL
    (
        {serverVersion < 50700}? value = AUTHORS_SYMBOL
        | value = DATABASES_SYMBOL likeOrWhere?
        | FULL_SYMBOL? value = TABLES_SYMBOL inDb? likeOrWhere?
        | FULL_SYMBOL? value = TRIGGERS_SYMBOL inDb? likeOrWhere?
        | value = EVENTS_SYMBOL inDb? likeOrWhere?
        | value = TABLE_SYMBOL STATUS_SYMBOL inDb? likeOrWhere?
        | value = OPEN_SYMBOL TABLES_SYMBOL inDb? likeOrWhere?
        | {(serverVersion >= 50105) && (serverVersion < 50500)}? value = PLUGIN_SYMBOL
        | {serverVersion >= 50500}? value = PLUGINS_SYMBOL
        | value = ENGINE_SYMBOL (engineRef | ALL_SYMBOL) (STATUS_SYMBOL | MUTEX_SYMBOL | LOGS_SYMBOL)
        | showFieldsType? value = COLUMNS_SYMBOL (FROM_SYMBOL | IN_SYMBOL) tableRef inDb? likeOrWhere?
        | (BINARY_SYMBOL | MASTER_SYMBOL) value = LOGS_SYMBOL
        | value = SLAVE_SYMBOL
            (
                HOSTS_SYMBOL
                | STATUS_SYMBOL nonBlocking channel?
            )
        | value = (BINLOG_SYMBOL | RELAYLOG_SYMBOL) EVENTS_SYMBOL (IN_SYMBOL textString)? (FROM_SYMBOL ulonglong_number)? limitClause? channel?
        | ({serverVersion >= 80001}? EXTENDED_SYMBOL)? value = (INDEX_SYMBOL | INDEXES_SYMBOL | KEYS_SYMBOL) fromOrIn tableRef inDb? whereClause?
        | STORAGE_SYMBOL? value = ENGINES_SYMBOL
        | COUNT_SYMBOL OPEN_PAR_SYMBOL MULT_OPERATOR CLOSE_PAR_SYMBOL value = (WARNINGS_SYMBOL | ERRORS_SYMBOL)
        | value = WARNINGS_SYMBOL limitClause?
        | value = ERRORS_SYMBOL limitClause?
        | value = PROFILES_SYMBOL
        | value = PROFILE_SYMBOL (profileType (COMMA_SYMBOL profileType)*)? (FOR_SYMBOL QUERY_SYMBOL INT_NUMBER)? limitClause?
        | optionType? value = (STATUS_SYMBOL | VARIABLES_SYMBOL) likeOrWhere?
        | FULL_SYMBOL? value = PROCESSLIST_SYMBOL
        | charset likeOrWhere?
        | value = COLLATION_SYMBOL likeOrWhere?
        | {serverVersion < 50700}? value = CONTRIBUTORS_SYMBOL
        | value = PRIVILEGES_SYMBOL
        | value = GRANTS_SYMBOL (FOR_SYMBOL user)?
        | {serverVersion >= 50500}? value = GRANTS_SYMBOL FOR_SYMBOL user USING_SYMBOL userList
        | value = MASTER_SYMBOL STATUS_SYMBOL
        | value = CREATE_SYMBOL
            (
                object = DATABASE_SYMBOL ifNotExists? schemaRef
                | object = EVENT_SYMBOL eventRef
                | object = FUNCTION_SYMBOL functionRef
                | object = PROCEDURE_SYMBOL procedureRef
                | object = TABLE_SYMBOL tableRef
                | object = TRIGGER_SYMBOL triggerRef
                | object = VIEW_SYMBOL viewRef
                | {serverVersion >= 50704}? object = USER_SYMBOL user
            )
        | value = PROCEDURE_SYMBOL STATUS_SYMBOL likeOrWhere?
        | value = FUNCTION_SYMBOL STATUS_SYMBOL likeOrWhere?
        | value = PROCEDURE_SYMBOL CODE_SYMBOL procedureRef
        | value = FUNCTION_SYMBOL CODE_SYMBOL functionRef
        | {serverVersion < 50500}? value = INNODB_SYMBOL STATUS_SYMBOL // Deprecated in 5.5.
    )
;

runtimeFunctionCall:
    // Function names that are keywords.
    name = CHAR_SYMBOL OPEN_PAR_SYMBOL exprList (USING_SYMBOL charsetName)? CLOSE_PAR_SYMBOL
    | name = CURRENT_USER_SYMBOL parentheses?
    | name = DATE_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = DAY_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = HOUR_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = INSERT_SYMBOL OPEN_PAR_SYMBOL expr COMMA_SYMBOL expr COMMA_SYMBOL expr COMMA_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = INTERVAL_SYMBOL OPEN_PAR_SYMBOL expr (COMMA_SYMBOL expr)+ CLOSE_PAR_SYMBOL
    | name = LEFT_SYMBOL OPEN_PAR_SYMBOL expr COMMA_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = MINUTE_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = MONTH_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = RIGHT_SYMBOL OPEN_PAR_SYMBOL expr COMMA_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = SECOND_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = TIME_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = TIMESTAMP_SYMBOL OPEN_PAR_SYMBOL expr (COMMA_SYMBOL expr)? CLOSE_PAR_SYMBOL
    | trimFunction
    | name = USER_SYMBOL parentheses
    | name = VALUES_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = YEAR_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL

    // Function names that are not keywords.
    | name = (ADDDATE_SYMBOL | SUBDATE_SYMBOL) OPEN_PAR_SYMBOL expr COMMA_SYMBOL (expr | INTERVAL_SYMBOL expr interval) CLOSE_PAR_SYMBOL
    | name = CURDATE_SYMBOL parentheses?
    | name = CURTIME_SYMBOL timeFunctionParameters?
    | name = (DATE_ADD_SYMBOL | DATE_SUB_SYMBOL) OPEN_PAR_SYMBOL expr COMMA_SYMBOL INTERVAL_SYMBOL expr interval CLOSE_PAR_SYMBOL
    | name = EXTRACT_SYMBOL OPEN_PAR_SYMBOL interval FROM_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = GET_FORMAT_SYMBOL OPEN_PAR_SYMBOL dateTimeTtype  COMMA_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = NOW_SYMBOL timeFunctionParameters?
    | name = POSITION_SYMBOL OPEN_PAR_SYMBOL bitExpr IN_SYMBOL expr CLOSE_PAR_SYMBOL
    | substringFunction
    | name = SYSDATE_SYMBOL timeFunctionParameters?
    | name = (TIMESTAMP_ADD_SYMBOL | TIMESTAMP_DIFF_SYMBOL) OPEN_PAR_SYMBOL intervalTimeStamp COMMA_SYMBOL expr COMMA_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = UTC_DATE_SYMBOL parentheses?
    | name = UTC_TIME_SYMBOL timeFunctionParameters?
    | name = UTC_TIMESTAMP_SYMBOL timeFunctionParameters?

    // Function calls with other conflicts.
    | name = ASCII_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = CHARSET_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = COALESCE_SYMBOL exprListWithParentheses
    | name = COLLATION_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = DATABASE_SYMBOL parentheses
    | name = IF_SYMBOL OPEN_PAR_SYMBOL expr COMMA_SYMBOL expr COMMA_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = FORMAT_SYMBOL OPEN_PAR_SYMBOL expr COMMA_SYMBOL expr (COMMA_SYMBOL expr)? CLOSE_PAR_SYMBOL
    | name = MICROSECOND_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = MOD_SYMBOL OPEN_PAR_SYMBOL expr COMMA_SYMBOL expr CLOSE_PAR_SYMBOL
    | {serverVersion < 50607}? name = OLD_PASSWORD_SYMBOL OPEN_PAR_SYMBOL textLiteral CLOSE_PAR_SYMBOL
    | name = PASSWORD_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = QUARTER_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = REPEAT_SYMBOL OPEN_PAR_SYMBOL expr COMMA_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = REPLACE_SYMBOL OPEN_PAR_SYMBOL expr COMMA_SYMBOL expr COMMA_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = REVERSE_SYMBOL OPEN_PAR_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = ROW_COUNT_SYMBOL parentheses
    | name = TRUNCATE_SYMBOL OPEN_PAR_SYMBOL expr COMMA_SYMBOL expr CLOSE_PAR_SYMBOL
    | name = WEEK_SYMBOL OPEN_PAR_SYMBOL expr (COMMA_SYMBOL expr)? CLOSE_PAR_SYMBOL
    | {serverVersion >= 50600}? name = WEIGHT_STRING_SYMBOL OPEN_PAR_SYMBOL expr
        (
            (AS_SYMBOL CHAR_SYMBOL wsNumCodepoints)? ({serverVersion < 80001}? weightStringLevels)?
            | AS_SYMBOL BINARY_SYMBOL wsNumCodepoints
            | COMMA_SYMBOL ulong_number COMMA_SYMBOL ulong_number COMMA_SYMBOL ulong_number
        )
        CLOSE_PAR_SYMBOL
    | geometryFunction
;

dataType:
    type = (INT_SYMBOL | TINYINT_SYMBOL | SMALLINT_SYMBOL | MEDIUMINT_SYMBOL) fieldLength? fieldOptions?

    | (type = REAL_SYMBOL | type = DOUBLE_SYMBOL PRECISION_SYMBOL?) precision? fieldOptions?
    | type = (FLOAT_SYMBOL | DECIMAL_SYMBOL | NUMERIC_SYMBOL | FIXED_SYMBOL) floatOptions? fieldOptions?

    | type = BIT_SYMBOL fieldLength?
    | type = (BOOL_SYMBOL | BOOLEAN_SYMBOL)

    | type = CHAR_SYMBOL fieldLength? charsetWithOptBinary?
    | nchar fieldLength? BINARY_SYMBOL?
    | type = BINARY_SYMBOL fieldLength?
    | (type = CHAR_SYMBOL VARYING_SYMBOL | type = VARCHAR_SYMBOL) fieldLength charsetWithOptBinary?
    | (
        type = NATIONAL_SYMBOL VARCHAR_SYMBOL
        | type = NVARCHAR_SYMBOL
        | type = NCHAR_SYMBOL VARCHAR_SYMBOL
        | type = NATIONAL_SYMBOL CHAR_SYMBOL VARYING_SYMBOL
        | type = NCHAR_SYMBOL VARYING_SYMBOL
    ) fieldLength BINARY_SYMBOL?

    | type = VARBINARY_SYMBOL fieldLength

    | type = YEAR_SYMBOL fieldLength? fieldOptions?
    | type = DATE_SYMBOL
    | type = TIME_SYMBOL typeDatetimePrecision?
    | type = TIMESTAMP_SYMBOL typeDatetimePrecision?
    | type = DATETIME_SYMBOL typeDatetimePrecision?

    | type = TINYBLOB_SYMBOL
    | type = BLOB_SYMBOL fieldLength?
    | type = (MEDIUMBLOB_SYMBOL | LONGBLOB_SYMBOL)
    | type = LONG_SYMBOL VARBINARY_SYMBOL
    | type = LONG_SYMBOL (CHAR_SYMBOL VARYING_SYMBOL | VARCHAR_SYMBOL)? charsetWithOptBinary?

    | type = TINYTEXT_SYMBOL charsetWithOptBinary?
    | type = TEXT_SYMBOL fieldLength? charsetWithOptBinary?
    | type = MEDIUMTEXT_SYMBOL charsetWithOptBinary?
    | type = LONGTEXT_SYMBOL charsetWithOptBinary?

    | type = ENUM_SYMBOL stringList charsetWithOptBinary?
    | type = SET_SYMBOL stringList charsetWithOptBinary?
    | type = SERIAL_SYMBOL
    | {serverVersion >= 50707}? type = JSON_SYMBOL
    | type = (
        GEOMETRY_SYMBOL
        | GEOMETRYCOLLECTION_SYMBOL
        | POINT_SYMBOL
        | MULTIPOINT_SYMBOL
        | LINESTRING_SYMBOL
        | MULTILINESTRING_SYMBOL
        | POLYGON_SYMBOL
        | MULTIPOLYGON_SYMBOL
    )
;

// $antlr-format alignTrailingComments: true
roleOrLabelKeyword:
    (
        ACTION_SYMBOL
        | ADDDATE_SYMBOL
        | AFTER_SYMBOL
        | AGAINST_SYMBOL
        | AGGREGATE_SYMBOL
        | ALGORITHM_SYMBOL
        | ANALYSE_SYMBOL // Conditionally set in the lexer.
        | ANY_SYMBOL
        | AT_SYMBOL
        | AUTHORS_SYMBOL // Conditionally set in the lexer.
        | AUTO_INCREMENT_SYMBOL
        | AUTOEXTEND_SIZE_SYMBOL
        | AVG_ROW_LENGTH_SYMBOL
        | AVG_SYMBOL
        | BINLOG_SYMBOL
        | BIT_SYMBOL
        | BLOCK_SYMBOL
        | BOOL_SYMBOL
        | BOOLEAN_SYMBOL
        | BTREE_SYMBOL
        | CASCADED_SYMBOL
        | CATALOG_NAME_SYMBOL
        | CHAIN_SYMBOL
        | CHANGED_SYMBOL
        | CHANNEL_SYMBOL // Conditionally set in the lexer.
        | CIPHER_SYMBOL
        | CLIENT_SYMBOL
        | CLASS_ORIGIN_SYMBOL
        | COALESCE_SYMBOL
        | CODE_SYMBOL
        | COLLATION_SYMBOL
        | COLUMN_NAME_SYMBOL
        | COLUMN_FORMAT_SYMBOL
        | COLUMNS_SYMBOL
        | COMMITTED_SYMBOL
        | COMPACT_SYMBOL
        | COMPLETION_SYMBOL
        | COMPONENT_SYMBOL
        | COMPRESSED_SYMBOL // Conditionally set in the lexer.
        | COMPRESSION_SYMBOL // Conditionally set in the lexer.
        | ENCRYPTION_SYMBOL // Conditionally set in the lexer.
        | CONCURRENT_SYMBOL
        | CONNECTION_SYMBOL
        | CONSISTENT_SYMBOL
        | CONSTRAINT_CATALOG_SYMBOL
        | CONSTRAINT_SCHEMA_SYMBOL
        | CONSTRAINT_NAME_SYMBOL
        | CONTEXT_SYMBOL
        | CONTRIBUTORS_SYMBOL // Conditionally set in the lexer.
        | CPU_SYMBOL
        /*
          Although a reserved keyword in SQL:2003 (and :2008),
          not reserved in MySQL per WL#2111 specification.
        */
        | CURRENT_SYMBOL
        | CURSOR_NAME_SYMBOL
        | DATA_SYMBOL
        | DATAFILE_SYMBOL
        | DATETIME_SYMBOL
        | DATE_SYMBOL
        | DAY_SYMBOL
        | DEFAULT_AUTH_SYMBOL
        | DEFINER_SYMBOL
        | DELAY_KEY_WRITE_SYMBOL
        | DES_KEY_FILE_SYMBOL
        | DIAGNOSTICS_SYMBOL
        | DIRECTORY_SYMBOL
        | DISABLE_SYMBOL
        | DISCARD_SYMBOL
        | DISK_SYMBOL
        | DUMPFILE_SYMBOL
        | DUPLICATE_SYMBOL
        | DYNAMIC_SYMBOL
        | ENDS_SYMBOL
        | ENUM_SYMBOL
        | ENGINE_SYMBOL
        | ENGINES_SYMBOL
        | ERROR_SYMBOL
        | ERRORS_SYMBOL
        | ESCAPE_SYMBOL
        | EVENTS_SYMBOL
        | EVERY_SYMBOL
        | EXPANSION_SYMBOL
        | EXPORT_SYMBOL
        | EXTENDED_SYMBOL
        | EXTENT_SIZE_SYMBOL
        | FAULTS_SYMBOL
        | FAST_SYMBOL
        | FOUND_SYMBOL
        | ENABLE_SYMBOL
        | FULL_SYMBOL
// $antlr-format groupedAlignments: off

        | FILE_BLOCK_SIZE_SYMBOL // Conditionally set in the lexer.
        | FILTER_SYMBOL
        | FIRST_SYMBOL
        | FIXED_SYMBOL
        | GENERAL_SYMBOL
        | GEOMETRY_SYMBOL
        | GEOMETRYCOLLECTION_SYMBOL
        | GET_FORMAT_SYMBOL
        | GRANTS_SYMBOL
        | GLOBAL_SYMBOL
        | HASH_SYMBOL
        | HOSTS_SYMBOL
        | HOUR_SYMBOL
        | IDENTIFIED_SYMBOL
        | IGNORE_SERVER_IDS_SYMBOL
        | INVOKER_SYMBOL
        | INDEXES_SYMBOL
        | INITIAL_SIZE_SYMBOL
        | INSTANCE_SYMBOL // Conditionally deprecated in the lexer.
        | INNODB_SYMBOL // Conditionally deprecated in the lexer.
        | IO_SYMBOL
        | IPC_SYMBOL
        | ISOLATION_SYMBOL
        | ISSUER_SYMBOL
        | INSERT_METHOD_SYMBOL
        | JSON_SYMBOL // Conditionally set in the lexer.
        | KEY_BLOCK_SIZE_SYMBOL
        | LAST_SYMBOL
        | LEAVES_SYMBOL
        | LESS_SYMBOL
        | LEVEL_SYMBOL
        | LINESTRING_SYMBOL
        | LIST_SYMBOL
        | LOCAL_SYMBOL
        | LOCKED_SYMBOL // Conditionally set in the lexer.
        | LOCKS_SYMBOL
        | LOGFILE_SYMBOL
        | LOGS_SYMBOL
        | MAX_ROWS_SYMBOL
        | MASTER_SYMBOL
        | MASTER_HEARTBEAT_PERIOD_SYMBOL
        | MASTER_HOST_SYMBOL
        | MASTER_PORT_SYMBOL
        | MASTER_LOG_FILE_SYMBOL
        | MASTER_LOG_POS_SYMBOL
        | MASTER_USER_SYMBOL
        | MASTER_PASSWORD_SYMBOL
        | MASTER_SERVER_ID_SYMBOL
        | MASTER_CONNECT_RETRY_SYMBOL
        | MASTER_RETRY_COUNT_SYMBOL
        | MASTER_DELAY_SYMBOL
        | MASTER_SSL_SYMBOL
        | MASTER_SSL_CA_SYMBOL
        | MASTER_SSL_CAPATH_SYMBOL
        | MASTER_TLS_VERSION_SYMBOL // Conditionally deprecated in the lexer.
        | MASTER_SSL_CERT_SYMBOL
        | MASTER_SSL_CIPHER_SYMBOL
        | MASTER_SSL_CRL_SYMBOL
        | MASTER_SSL_CRLPATH_SYMBOL
        | MASTER_SSL_KEY_SYMBOL
        | MASTER_AUTO_POSITION_SYMBOL
        | MAX_CONNECTIONS_PER_HOUR_SYMBOL
        | MAX_QUERIES_PER_HOUR_SYMBOL
        | MAX_STATEMENT_TIME_SYMBOL // Conditionally deprecated in the lexer.
        | MAX_SIZE_SYMBOL
        | MAX_UPDATES_PER_HOUR_SYMBOL
        | MAX_USER_CONNECTIONS_SYMBOL
        | MEDIUM_SYMBOL
        | MEMORY_SYMBOL
        | MERGE_SYMBOL
        | MESSAGE_TEXT_SYMBOL
        | MICROSECOND_SYMBOL
        | MIGRATE_SYMBOL
        | MINUTE_SYMBOL
        | MIN_ROWS_SYMBOL
        | MODIFY_SYMBOL
        | MODE_SYMBOL
        | MONTH_SYMBOL
        | MULTILINESTRING_SYMBOL
        | MULTIPOINT_SYMBOL
        | MULTIPOLYGON_SYMBOL
        | MUTEX_SYMBOL
        | MYSQL_ERRNO_SYMBOL
        | NAME_SYMBOL
        | NAMES_SYMBOL
        | NATIONAL_SYMBOL
        | NCHAR_SYMBOL
        | NDBCLUSTER_SYMBOL
        | NEVER_SYMBOL
        | NEXT_SYMBOL
        | NEW_SYMBOL
        | NO_WAIT_SYMBOL
        | NODEGROUP_SYMBOL
        | NOWAIT_SYMBOL // Conditionally deprecated in the lexer.
        | NUMBER_SYMBOL
        | NVARCHAR_SYMBOL
        | OFFSET_SYMBOL
        | OLD_PASSWORD_SYMBOL // Conditionally deprecated in the lexer.
        | ONE_SHOT_SYMBOL // Conditionally deprecated in the lexer.
        | ONE_SYMBOL
        | PACK_KEYS_SYMBOL
        | PAGE_SYMBOL
        | PARTIAL_SYMBOL
        | PARTITIONING_SYMBOL
        | PARTITIONS_SYMBOL
        | PASSWORD_SYMBOL
        | PHASE_SYMBOL
        | PLUGIN_DIR_SYMBOL
        | PLUGIN_SYMBOL
        | PLUGINS_SYMBOL
        | POINT_SYMBOL
        | POLYGON_SYMBOL
        | PRESERVE_SYMBOL
        | PREV_SYMBOL
        | PRIVILEGES_SYMBOL
        | PROCESSLIST_SYMBOL
        | PROFILE_SYMBOL
        | PROFILES_SYMBOL
        | QUARTER_SYMBOL
        | QUERY_SYMBOL
        | QUICK_SYMBOL
        | READ_ONLY_SYMBOL
        | REBUILD_SYMBOL
        | RECOVER_SYMBOL
        | REDO_BUFFER_SIZE_SYMBOL
        | REDOFILE_SYMBOL
        | REDUNDANT_SYMBOL
        | RELAY_SYMBOL
        | RELAYLOG_SYMBOL
        | RELAY_LOG_FILE_SYMBOL
        | RELAY_LOG_POS_SYMBOL
        | RELAY_THREAD_SYMBOL
        | REORGANIZE_SYMBOL
        | REPEATABLE_SYMBOL
        | REPLICATE_DO_DB_SYMBOL
        | REPLICATE_IGNORE_DB_SYMBOL
        | REPLICATE_DO_TABLE_SYMBOL
        | REPLICATE_IGNORE_TABLE_SYMBOL
        | REPLICATE_WILD_DO_TABLE_SYMBOL
        | REPLICATE_WILD_IGNORE_TABLE_SYMBOL
        | REPLICATE_REWRITE_DB_SYMBOL
        | USER_RESOURCES_SYMBOL // Placed like in the server grammar where it is named just RESOURCES.
        | RESUME_SYMBOL
        | RETURNED_SQLSTATE_SYMBOL
        | RETURNS_SYMBOL
        | REVERSE_SYMBOL
        | ROLLUP_SYMBOL
        | ROTATE_SYMBOL // Conditionally deprecated in the lexer.
        | ROUTINE_SYMBOL
        | ROWS_SYMBOL
        | ROW_COUNT_SYMBOL
        | ROW_FORMAT_SYMBOL
        | ROW_SYMBOL
        | RTREE_SYMBOL
        | SCHEDULE_SYMBOL
        | SCHEMA_NAME_SYMBOL
        | SECOND_SYMBOL
        | SERIAL_SYMBOL
        | SERIALIZABLE_SYMBOL
        | SESSION_SYMBOL
        | SHARE_SYMBOL
        | SIMPLE_SYMBOL
        | SKIP_SYMBOL // Conditionally deprecated in the lexer.
        | SLOW_SYMBOL
        | SNAPSHOT_SYMBOL
        | SOUNDS_SYMBOL
        | SOURCE_SYMBOL
        | SQL_AFTER_GTIDS_SYMBOL
        | SQL_AFTER_MTS_GAPS_SYMBOL
        | SQL_BEFORE_GTIDS_SYMBOL
        | SQL_CACHE_SYMBOL
        | SQL_BUFFER_RESULT_SYMBOL
        | SQL_NO_CACHE_SYMBOL
        | SQL_THREAD_SYMBOL
        | STACKED_SYMBOL
        | STARTS_SYMBOL
        | STATS_AUTO_RECALC_SYMBOL
        | STATS_PERSISTENT_SYMBOL
        | STATS_SAMPLE_PAGES_SYMBOL
        | STATUS_SYMBOL
        | STORAGE_SYMBOL
        | STRING_SYMBOL
        | SUBCLASS_ORIGIN_SYMBOL
        | SUBDATE_SYMBOL
        | SUBJECT_SYMBOL
        | SUBPARTITION_SYMBOL
        | SUBPARTITIONS_SYMBOL
        | SUPER_SYMBOL
        | SUSPEND_SYMBOL
        | SWAPS_SYMBOL
        | SWITCHES_SYMBOL
        | TABLE_NAME_SYMBOL
        | TABLES_SYMBOL
        | TABLE_CHECKSUM_SYMBOL
        | TABLESPACE_SYMBOL
        | TEMPORARY_SYMBOL
        | TEMPTABLE_SYMBOL
        | TEXT_SYMBOL
        | THAN_SYMBOL
        | TRANSACTION_SYMBOL
        | TRIGGERS_SYMBOL
        | TIMESTAMP_SYMBOL
        | TIMESTAMP_ADD_SYMBOL
        | TIMESTAMP_DIFF_SYMBOL
        | TIME_SYMBOL
        | TYPES_SYMBOL
        | TYPE_SYMBOL
        | UDF_RETURNS_SYMBOL
        | UNCOMMITTED_SYMBOL
        | UNDEFINED_SYMBOL
        | UNDO_BUFFER_SIZE_SYMBOL
        | UNDOFILE_SYMBOL
        | UNKNOWN_SYMBOL
        | UNTIL_SYMBOL
        | USER_SYMBOL
        | USE_FRM_SYMBOL
        | VARIABLES_SYMBOL
        | VIEW_SYMBOL
        | VALUE_SYMBOL
        | WARNINGS_SYMBOL
        | WAIT_SYMBOL
        | WEEK_SYMBOL
        | WORK_SYMBOL
        | WEIGHT_STRING_SYMBOL
        | X509_SYMBOL
        | XID_SYMBOL
        | XML_SYMBOL
        | YEAR_SYMBOL
    )
    // Rules that entered or left this rule in specific versions.
    | {serverVersion < 80001}? (IMPORT_SYMBOL | FUNCTION_SYMBOL)
    | {serverVersion < 50709}? SHUTDOWN_SYMBOL
    | {serverVersion < 80000}? CUBE_SYMBOL
    | {serverVersion >= 80000}? (EXCHANGE_SYMBOL | EXPIRE_SYMBOL | ONLY_SYMBOL | SUPER_SYMBOL | VALIDATION_SYMBOL | WITHOUT_SYMBOL)
;

@header {/*
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301  USA
 */
}



@postinclude {
#include "MySQLBaseRecognizer.h"
}
