grammar sentences;

// Note: currently the Typscript lexer has no support for the extended Unicode syntax and hence
//       fails for many Unicode characters. The outcommented rules below can be enabled once
//       the ANTLR 4.7 support for Unicode has been incorporated.

//unicodeIdentifier: UnicodeIdentifier;
cyrillicIdentifier: CyrillicIdentifier;
plusLoop: DIGITS? (COMMA DIGITS)+ (COMMA DIGITS)*;
alts: alt1 | alt2 | alt3 |;

alt1: COMMA;
alt2: DOT;
alt3: COLON;

//UnicodeIdentifier: [\p{ID_Start}] [\p{ID_Continue}]*;
SimpleIdentifier: SimpleChar (SimpleChar | DIGIT)+;
CyrillicIdentifier: CyrillicChar+;

SimpleChar: [A-z] | [\p{InLatin_Extended-B}] | [\p{block=Greek_and_Coptic}];
CyrillicChar: [\p{Script=Cyrillic}];

// Numbers
DIGITS: DIGIT+;
DIGIT: [0-9];

HEXDIGIT: [\p{ASCII_Hex_Digit}];
HexNumber: HEXDIGIT+;
//UnicodeNumber: [\p{Nd}]+;

COMMA: ',';
DOT: '.';
COLON: ':';
WS: [ \r\n\t]+ -> channel (HIDDEN);
