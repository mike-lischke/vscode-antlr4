grammar t2;
x: A | B | C;

a: b; // Indirect left recursion.
b: c;
c: a;

D: 'D';
A: 'A';
B: 'B';
C: 'C';
