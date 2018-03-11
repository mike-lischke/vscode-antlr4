lexer grammar TLexer2;

options {
	tokenVocab = nonexisting;
}

// Appears in the public part of the lexer in the h file.
@lexer::members {/* public lexer declarations section */
bool canTestFoo() { return true; }
bool isItFoo() { return true; }
bool isItBar() { return true; }

void myFooLexerAction() { /* do something*/ };
void myBarLexerAction() { /* do something*/ };
}

// Appears in the private part of the lexer in the h file.
@lexer::declarations {/* private lexer declarations/members section */}

// Appears in line with the other class member definitions in the cpp file.
@lexer::definitions {/* lexer definitions section */}

channels { CommentsChannel, DirectiveChannel }

tokens {
	DUMMY
}

Return: 'return';
Continue: 'continue';

INT: Digit+;
Digit: [0-9];

ID: LETTER (LETTER | '0'..'9')*;
fragment LETTER: [a-zA-Z\u0080-\uFFFF];

LessThan: '<';
GreaterThan:  '>';
Equal: '=';
And: 'and';

Colon: ':';
Semicolon: ';';
Plus: '+';
Minus: '-';
Star: '*';
OpenPar: '(';
ClosePar: ')';
OpenCurly: '{' -> pushMode(Mode1);
CloseCurly: '}' -> popMode;
QuestionMark: '?';
Comma: ',' -> skip;
Dollar: '$' -> more, mode(Mode1);
Ampersand: '&' -> type(DUMMY);

String: '"' .*? '"';
Foo: {canTestFoo()}? 'foo' {isItFoo()}? { myFooLexerAction(); };
Bar: 'bar' {isItBar()}? { myBarLexerAction(); };
Any: Foo Dot Bar? DotDot Baz Bar;

Comment : '#' ~[\r\n]* '\r'? '\n' -> channel(CommentsChannel);
WS: [\r\n]+ -> channel(99);
WS2: [ \t]+ -> channel(HIDDEN);

fragment Baz: 'Baz';

mode Mode1;
Dot: '.';

mode Mode2;
DotDot: '..';
