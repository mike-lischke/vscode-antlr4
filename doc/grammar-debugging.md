# Debugging ANTLR4 grammars

## Introduction
Debugging a grammar requires a few preparations. You can debug either a currently loaded grammar (which must be the active tab while starting the debug process) or use any grammar on disk. In either case you must have created interpreter data at least once, by saving the grammar in Visual Studio Code. See also [Parser Generation](parser-generation.md) for more details about generating a lexer/parser from your grammar.

The extension supports debugging of grammar files (parser rules only). At least internal code generation must be enabled to allow debugging (which is the default and requires a usable Java installation). This implementation depends on the interpreter data export introduced in ANTLR4 4.7.1 (which is hence the lowest supported ANTLR4 version).

## Feature Overview
### Operations
* The following debug operations are supported:
	* **Run w/o debugging** - just run the parser interpreter (no profiling yet, though it's planned)
	* **Run with debugging** - run the interpreter and stop on breakpoints
	* **Step into parser rules** - available while stopped at a breakpoint
	* **Step over lexer tokens and parser rules** - ditto
	* **Step out of the current parser rule** - ditto

### Textual Parse Tree
Once a parse run finished a textual parse tree can be printed to the `DEBUG CONSOLE` panel in vscode (see the Setup section for how to enable it). This is a simple text-only representation much like a simple tree dump (but formatted).

### Live Graphical Parse Tree
When enabled in the launch task setup, a graphical parse tree is shown in an own editor tab, which updates on each debugging step:

![](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/live-parse-tree.gif)

This graphical parse tree is interactive. You can collapse/expand parser rule nodes to hide/show tree parts. Both, a horizontal and a vertical graph layout is supported and you can switch between the standard (compact) tree layout or the cluster layout, where all terminals are aligned at the bottom or on the right hand side (depending on the layout).

As with all graphs in this extension, you can export it to an SVG file, along with custom or built-in CSS code to style the parse tree. There are 2 user settings that determine the initial orientation and the layout of the tree. You can read details in [Extension Settings](extension-settings.md#debugging).

### Actions and Semantic Predicates
Grammars sometimes contain code in the target language of the generated lexer/parser. That can be support code in named actions (e.g. `import` or `#include` statements), other code within rules to support the parsing process or semantic predicates, to guide the parser. However, because this extension uses the interpreters for debugging it is not possible to run any of this code directly (even if the predicates are written in JS, let alone other languages). And since named and unnamed actions are usually to support the generated parser (and mostly not relevant for debugging), they are ignored by the extension debugger. However, for predicates there's an approach to simulate what the generated lexer/parser would do.

This is possible by using a Javascript file, which contains code to evaluate semantic predicates (see the [Setup section](#setup) for how to enable it). That means however, the predicates must be written in valid JS code. Since predicates are usually short and use simple expressions (like `{version < 1000}` or `{doesItBlend()}` it should be easy to use what's originally written for another language (JS, C++, TS, Java etc. which all share a very similar expression syntax) without changes in the grammar. If an expression doesn't work in JS, you will have to change it however, temporarily.

On each start of the debugger the extension loads the specified file freshly (no caching takes place to support changes in that file between debugger runs) using a Node.js `require()` call. It then looks for an exported class named `PredicateEvaluator`, which can be used for evaluation. This class has a very simple structure and usually uses the JS `eval()` function to parse and run the predicate code. Here's a typcial example:

```Javascript
export class PredicateEvaluator {
    constructor () {
        // Initialize variables here.
        this.version = 123;
    }

    evaluateLexerPredicate(lexer, ruleIndex, actionIndex, predicate) {
        return eval(predicate);
    }
    
    evaluateParserPredicate(parser, ruleIndex, actionIndex, predicate) {
        return eval(predicate);
    }

    // Add here any function you need for evaluation.
    doesItBlend() { return true; }
}
```

Only 2 functions here are mandatory in this class, namely `evaluateLexerPredicate` and `evaluateParserPredicate`. Everything else is up to you and depends on what is required in the grammar. A class is convenient and self contained, but in JS it requires to qualify each access to members with a `this.` prefix, which might require to change expressions in the grammar. In order to avoid that there's an alternative way to specify the evaluation functions.

If the `PredicateEvaluator` class cannot be found in the module's exports the extension looks for 2 exported standalone functions with the same names as the mandatory functions in that class. Here's an example implementation:

```Javascript
"use strict"

var serverVersion = 123;
function doesItBlend() { return true; }

export function evaluateLexerPredicate (lexer, ruleIndex, actionIndex, predicate) {
    return eval(predicate);
}

export function evaluateParserPredicate (parser, ruleIndex, actionIndex, predicate) {
    return eval(predicate);
}
```

These functions use then members from the module itself and hence need no `this.` prefix. This ensures maximum compatibility with expression in other programming languages. If both the class and the standalone functions are given, the class takes precedence. The passed in parameters are:

* lexer/parser: the currently executing lexer or parser interpreter instance
* ruleIndex: the index of the lexer or parser rule
* actionIndex: the index of the predicate (for indexes see the `"Actions & Semantic Predicates"` tree in the ANTLR4 view)
* predicate: the text of the predicate to evaluate (without the curly braces)

With that action JS file in place you can then use semantic predicates as shown in this animation:

![](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/predicate-debugging.gif)

## Setup
What do you need to debug a grammar?

* The grammar obviously, either as combined grammar (with parser and lexer rules in a single file) or separate grammars. Note: grammars which require a special setup (e.g. a different base class than the standard `Lexer` and `Parser` classes) could be a problem. It depends on what code is used from such base classes. Maybe you can emulate that also via the mentioned action JS file.
* Code generation must be enabled in the vscode-antlr4 settings or no interpreter data is generated. In the user preferences set ['antl4.generation']['mode'] to either 'internal' or 'external' (default is 'internal').
* The interpreter data must be generated and current. Simply save your grammar in vscode to accomplish that.
* A test input file. It doesn't matter what it is, but it must be readable by the lexer interpreter to generate tokens from. This file can be located anywhere. You can specify a relative or absolute path in the launch configuration.
* Optionally an action file for semantic predicates.
* A launch config in vscode to configure your debug sessions.

A typical launch config looks like this:

```json
{
    "version": "2.0.0",
    "configurations": [
        {
            "name": "Debug ANTLR4 grammar",
            "type": "antlr-debug",
            "request": "launch",
            "input": "input.txt",
            "grammar": "grammars/Example.g4",
            "actionFile": "grammars/exampleActions.js",
            "startRule": "start",
            "printParseTree": true,
            "visualParseTree": true
        }
    ]
}
```

The values for `type` and `request` are fixed and mandatory. Everything else can be changed to your liking. The config contains paths for the test input file and the grammar to debug. If no grammar is given then the content of the currently active editor (which must contain am ANTLR4 grammar) is used instead. The input file obviously must be specified or there's nothing to parse. The optional `actionFile` parameter refers to a file that must be structured as described in the [Actions and Semantic Predicates](#actions-and-semantic-predicates) section.

To tell the interperter where to start parsing we need a start rule. You can omit that, in which case the interpreter starts with the first parser rule in the grammar. However, specifying it allows to parse only a sublange (say, only expressions) or other subrules, instead of the entire possible language. A great possibility to focus only on those parts of your grammar that need fixing.

The 2 boolean parameters determine visualizations. The entry `printParseTree` causes the debugger to print a textual parse tree to the `DEBUG CONSOLE` window, after a debug session has finished. The `visualParseTree` parameter however lets it generate a graphical parse tree that will grow on each debug stop as you step through your grammar.

## Debugging
#### Breakpoints

Breakpoints can be set for rule enter and rule exit. Currently no intermediate lines are supported. Breakpoints set within a rule are moved automatically to the rule name line and act as rule enter breakpoints.

#### Debug Informations
During debugging a number of standard and extra views give you grammar details:

* Variables - a few global values like the used test input and its size, the current error count and the lexed input tokens.
* Call stack - the parser rule invocation stack.
* Breakpoints - rule enter + exit breakpoints.
* Lexer Tokens - a list of all defined lexer tokens, along with their assigned index.
* Parser Rules - a list of all defined parser rules, along with their assigned index.
* Lexer Modes - a list of all defined lexer modes (including the default mode).
* Token Channels - a list of used token channels (including predefined ones).

#### Limitations
The debugger uses the lexer and parser interpreters found in the ANTLR4 runtime. These interpreters use the same prediction engine as the standard classes, but cannot execute any target runtime code. Hence it is not possible to execute actions or semantic predicates. If your parser depends on that, you will have to modify your grammar(s) to avoid the need for such code. There are however considerations about using an answer file or similar to fake the output of predicates.

The interpreters are implemented in Typescript and transpiled to Javascript, hence you shouldn't expect high performance parsing from the debugger. However, it should be good enough for normal error search.

Even though ANTLR4 supports (direct) left recursive rules, their internal representation is totally different (they are converted to non-left-recursive rules). This makes it fairly difficult to match the currently executing ATN state to a concrete source position. Expect therefor non-optimal step marker visualization in such rules.

Parser rule context variables, parameters and return values cannot be inspected, as they don't exist in the interpreter generated parse tree.

###Debugging

This is a settings object named **antlr4.debug** with the following members:

* **visualParseTreeHorizontal**: boolean (default: true) Determines if parse trees by default use the horizontal layout (when true) or the vertical orientation (when false).
* **visualParseTreeClustered**: boolean (default: false) When set to true parse trees will align their terminal nodes on a single row or column (depending on the orientation).

## Troubleshooting
