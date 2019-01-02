# Parser Generation

## General

When enabled the extension creates parser and lexer files on each save of your grammar. This can either be used for internal operations only or to generate these files for your own use. Many features in the extension depend on generated interpreter data ((e.g. to generate railroad diagrams or debug grammars, as well as ATN graphs). Also error reporting delivers more details, when at least internal parser generation is enabled. So, it's strongly recommended to keep the generation on. Interpreter data is produced by ANTLR4 4.7.1 or later, which is thus the minimum required version of ANTLR.

There are a number of settings, which control the generation process. See [the related settings](extension-settings.md#parser-generation) for more details.

## The Generation Process

In order to generate parser files with ANTLR4 Java must be installed on the system and be executable without an explicit path (i.e. the Java binary must be in the system's search path). This works on all platforms where Visual Studio code runs (macOS, Windows, Linux). The vscode-antlr4 extension comes with 2 ANTLR4 jars (thus it's not required to install ANTLR4 manually). One is a custom build of the official ANTLR4 jar (to include the latest features + fixes), while the other is a special version built by Sam Harwell (a co-author of the official ANTLR4 package) and Burt Harris. This special build got a few optimizations and generates Typescript parsers + lexers. The necessary Typescript runtime is available as Node.js package (install it via `npm install antlr4ts`).

The entire process runs in the background after a grammar has been saved and can take a few seconds for larger grammars. While the generation is in progress a dot animation is shown in the status bar of vscode.

## Generated Data and Information

Generating parser files with ANTLR4 not only produces interpreter data, but also can output detailed error messages. These are picked up by the extension and replace the internally found problems. The internal error detection is mostly useful while changing a grammar, to avoid the lengthy process of generation. But with the native error reporting from ANTLR4 you will also see more complex problems like indirect left recursion etc.