#!/bin/bash
set -o errexit

# Download the ANLTR jar and place it in the same folder as this script (or adjust the LOCATION var accordingly).

LOCATION=antlr4-4.5.4-SNAPSHOT.jar
java -jar $LOCATION -Dlanguage=Cpp -listener -visitor -o ../parser -package graps ANTLRv4Lexer.g4 ANTLRv4Parser.g4
