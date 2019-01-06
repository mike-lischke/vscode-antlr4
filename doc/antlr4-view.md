# The ANTLR4 View

The extension adds an own icon to the action bar of vscode. This icon opens the ANTLR4 view which comprises a number of information views. Each view shows a different detail of the currently active grammar tab.

![](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/antlr4-view.png)

* Lexer Tokens - the names of all tokens defined in the current grammar. Referenced grammars are not included, which means for split grammars you only get the token list for the lexer grammar. Selecting a token name navigates to this symbol.

Note: the order of the tokens is usually defined by their definition order in the grammar. However, in the case of token vocabularies it is possible to define the token index (and hence the order) explicitly, either for all tokens or only a part of them (in which case undefined tokens get indexes assigned automatically). This in turn means the order in the token list does not necessarily correspond to the definition order in the grammar.

* Parser Rules - the names of all parser rules, which only contains values if the current grammar is a combined or parser grammar. Selecting a rule jumps to it in the editor.
* Grammar Dependencies - show referenced grammars included by an `import` statement or the token vocabulary (referenced by the `tokenVocab` grammar option). Selecting a dependency entry opens that file. However, for the token vocabulary this works only if that references an external lexer grammar (in opposition to just a tokens file).
* Token Channels - a list of built-in and defined channels (only filled for combined or lexer grammars).
* Lexer Modes - a list of built-in and defined lexer modes (only filled for combined or lexer grammars).
* Actions & Semantic Predicates - a list of all actions and semantic predicates defined in the grammar. Entries usually show the action text, but for multiline actions only a placeholder is shown. Selecting an entry jumps to the definition in code.

All these lists are updated whenever a grammar is saved (which may take a few seconds, since the grammar must first be handled by ANTLR4).