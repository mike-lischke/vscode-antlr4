# vscode-antlr4

This extension for Visual Studio code adds support for ANTLR4 grammars.

## Features

![Some of the features](vscode-demo.gif)

This extension adds support for ANTLR4 grammar files, which includes these features:

* Syntax coloring for ANTLR grammars (.g and .g4 files).
* An own color theme, which not only includes all the [recommended groups](http://manual.macromates.com/en/language_grammars), but also some special rules for grammar elements that you don't find in other themes.
* Syntax and some semantic error checking (symbol matching)
* Quick navigation via ctrl/cmd+click.
* The symbol list for quick navigation (via shift+ctrl/cmd+O).
* Hovers (tooltips) with symbol information.
* Railroad diagrams for all types of rules (parser, lexer, fragment lexer).
* Rule reference counts via code lens.

## Extension Settings

* "antlr4.referencesCodeLens.enabled", boolean, if true enables code lens feature
* "antlr4.railroaddiagram.customcss", string, path to a custom css file for railroad diagrams

## Known Issues

None

## Release Notes

For details see [Git commit history](https://github.com/mike-lischke/vscode-antlr4/commits/master).
