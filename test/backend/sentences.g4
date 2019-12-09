grammar sentences;

unicodeIdentifier: UnicodeIdentifier;
cyrillicIdentifier: CyrillicIdentifier;
plusLoop: DIGIT (COMMA DIGITS)+;
starLoop: DIGIT DIGITS*;
alts: alt1 | alt2 | alt3 |;
blocks: block (COMMA block)*;
block:
    OPEN_BRACE (
        SimpleIdentifier SimpleIdentifier?
        | CyrillicIdentifier DIGIT DIGITS
    )
    CLOSE_BRACE
;

alt1: RED;
alt2: GREEN;
alt3: BLUE;

recursion:
	recursion DOT alts
	| recursion COLON alts
	| DIGITS recursion
	| SimpleIdentifier
;

// Numbers
DIGIT: [0-9];
DIGITS: DIGIT+;

HEXDIGIT: [\p{ASCII_Hex_Digit}];
HexNumber: HEXDIGIT+;
UnicodeNumber: [\p{Nd}]+;

RED: 'red';
GREEN: 'green';
BLUE: 'blue';

OPEN_BRACE: '{';
CLOSE_BRACE: '}';
COMMA: ',';
DOT: '.';
COLON: ':';

SimpleChar: [A-z] | [\p{InLatin_Extended-B}] | [\p{block=Greek_and_Coptic}];
CyrillicChar: [\p{Script=Cyrillic}];

SimpleIdentifier: SimpleChar (SimpleChar | DIGIT)+;
CyrillicIdentifier: CyrillicChar+;
UnicodeIdentifier: [\p{ID_Start}] [\p{ID_Continue}]*;

WS: [ \r\n\t]+ -> channel (HIDDEN);
