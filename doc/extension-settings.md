# Extension Settings
The vscode-antlr4 extension can be configured in many ways to support your preferred working style. Below is a grouped list of all currently supported settings.

## General

* **antlr4.referencesCodeLens.enabled**, boolean (default: false), if true enables the reference count display via Code Lens
* **antlr4.customcss**, array of string (no default), list of absolute CSS file names for diagrams/graphs
* **antlr4.rrd.saveDir**, string (no default), default export target folder for railroad (syntax) diagrams
* **antlr4.call-graph.saveDir**, string (no default), default export target folder for call graphs
* **antlr4.atn.saveDir**, string (no default), default export target folder for atn graph
* **antlr4.atn.maxLabelCount**, number (default: 3), max number of labels displayed on a transition in an ATN graph

## Parser Generation

This is a settings object named **antlr4.generation** with the following members:

* **mode**, string enum (default: "internal"), determines what code generation pattern should be followed:
    * **none**: don't generate any code, not even for internal use (note: this value will disable grammar debugging)
    * **internal**: allow code generation for internal use (e.g. for full error detection and interpreter data)
    * **external**: generate code also for external use, depending on the other generation options
* **outputDir**, string (default: undefined), determines the output folder where to place generated code (considered only if **mode** is set to `external`)
* **importDir**, string (default: undefined), location to import grammars from (relative to the grammar that is being saved, or an absolute path), used also for internal code generation
* **package**, string (default: undefined), package/namespace for generated code (used only in external mode)
* **language**, string (default: "Java"), specifies the target language for the generated code, overriding what is specified in the grammar (used only in external mode)
* **listeners**, boolean (default: true), also create listeners on code generation (used only in external mode)
* **visitors**, boolean (default: false), also create visitors on code generation (used only in external mode)
* **alternativeJar**, string (default: undefined), specifies the ANTLR4 jar to use for generation, instead of the ones shipping with this extension.
* **additionalParameters**, string (default: undefined), specifies additional parameters to be passed on to the ANTLR4 jar (built-in or custom) during parser generation.

## Grammar Formatting

This is a settings object named **antlr4.format** with the following members:

* **alignTrailingComments**: boolean (default: false), if true, aligns trailing comments
* **allowShortBlocksOnASingleLine**: boolean (default: true), allows contracting short blocks to a single line
* **breakBeforeBraces**: boolean (default: false), when true start predicates and actions on a new line
* **columnLimit**: number (default: 100), the character count after which automatic line breaking takes place
* **continuationIndentWidth**: number (default: 4), indentation for line continuation (only used if useTab is false)
* **indentWidth**: number (default: 4), character count for indentation (if useTab is false)
* **keepEmptyLinesAtTheStartOfBlocks**: boolean (default: false), if true, empty lines at the start of blocks are kept
* **maxEmptyLinesToKeep**: number (default: 1), the maximum number of consecutive empty lines to keep
* **reflowComments**: boolean (default: true), reformat comments to fit the column limit
* **spaceBeforeAssignmentOperators**: boolean (default: true), enables spaces around operators
* **tabWidth**: number (default: 4), multiples of this value determine tab stops in a document
* **useTab**: boolean (default: true), use tabs for indentation (otherwise spaces)
* **alignColons**: string enum (default: "none"), align colons among rules (scope depends on groupedAlignments)
    * **none**: place the colon directly after the rule name
    * **trailing**: align colons in the alignment group, directly after rule names
    * **hanging**: align the colon on the next line (with the pipe chars)
* **singleLineOverrulesHangingColon**: boolean (default: true), single line mode overrides hanging colon setting (applies also to alignSemicolons)
* **allowShortRulesOnASingleLine**: boolean (default: true), allows contracting short rules on a single line (short: < 2/3 of columnLimit)
* **alignSemicolons**: string enum (default: "none"), determines the alignment of semicolons in rules
    * **none**: no alignment, just put it at the end of the rule directly after the last token
    * **ownLine**: put it on an own line (not indented), unless **allowShortRulesOnASingleLine** kicks in
    * **hanging**: put it on an own line with indentation (aligning it so to the alt pipe chars)
* **breakBeforeParens**: boolean (default: false), for blocks: if true puts opening parentheses on an own line
* **ruleInternalsOnSingleLine**: boolean (default: false), place rule internals (return value, local variables, @init, @after) all on a single line
* **minEmptyLines**: number (default: 0), determines the number of empty lines that must exist (between rules or other full statements)
* **groupedAlignments**: boolean (default: true), when true only consecutive lines are considered for alignments
* **alignFirstTokens**: boolean (default: false), align the first token after the colon among rules
* **alignLexerCommands**: boolean (default: false), align lexer commands (starting with ->) among rules
* **alignActions**: boolean (default: false), align action blocks + predicates among rules and alternatives
* **alignLabels**: boolean (default: true), align alt labels (only when a rule is not on a single line)
* **alignTrailers**: boolean (default: false), combine all alignments (align whatever comes first: colons, comments etc.)

## Debugging

This is a settings object named **antlr4.debug** with the following members:

* **visualParseTreeHorizontal**: boolean (default: true) Determines if parse trees by default use the horizontal layout (when true) or the vertical orientation (when false).
* **visualParseTreeClustered**: boolean (default: false) When set to true parse trees will align their terminal nodes on a single row or column (depending on the orientation).
