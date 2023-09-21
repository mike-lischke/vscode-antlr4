grammar sentences;

// unicodeIdentifier: UnicodeIdentifier;
plusLoop: DIGITS (COMMA DIGITS)+;
starLoop: DIGITS DIGITS*;
alts:     alt1 | alt2 | alt3 |;
blocks:   block (COMMA block)*;
block:    OPEN_BRACE ( SimpleIdentifier SimpleIdentifier? | UnicodeIdentifier DIGITS) CLOSE_BRACE;

alt1: RED;
alt2: GREEN;
alt3: BLUE;

recursion: recursion DOT alts | recursion COLON alts | DIGITS recursion | SimpleIdentifier;

// Numbers
DIGITS: [0-9]+;

UnicodeNumber: [\p{Nd}]+;

RED:   'red';
GREEN: 'green';
BLUE:  'blue';

OPEN_BRACE:  '{';
CLOSE_BRACE: '}';
COMMA:       ',';
DOT:         '.';
COLON:       ':';

fragment SimpleChar: [A-Za-z] | [\p{InLatin_Extended-B}] | [\p{block=Greek_and_Coptic}];

SimpleIdentifier:  SimpleChar (SimpleChar | DIGITS)+;
UnicodeIdentifier: [\p{ID_Start}] [\p{ID_Continue}]*;

WS: [ \r\n\t]+ -> channel (HIDDEN);
