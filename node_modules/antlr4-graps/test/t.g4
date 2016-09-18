grammar t;
x: A | B | C;
y: ZZ;

A: 'A';
B: 'B';
C: 'C' -> channel(BLAH);
