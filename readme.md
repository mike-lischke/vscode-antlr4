[![Build & Test](https://github.com/mike-lischke/vscode-antlr4/actions/workflows/nodejs.yml/badge.svg?branch=master)](https://github.com/mike-lischke/vscode-antlr4/actions/workflows/nodejs.yml) [![](https://img.shields.io/visual-studio-marketplace/d/mike-lischke.vscode-antlr4?color=green&label=Downloads&logo=Microsoft&logoColor=lightgray)](https://marketplace.visualstudio.com/items?itemName=mike-lischke.vscode-antlr4) [![](https://img.shields.io/visual-studio-marketplace/stars/mike-lischke.vscode-antlr4?color=green&label=Rating&logo=Microsoft&logoColor=lightgray)](https://marketplace.visualstudio.com/items?itemName=mike-lischke.vscode-antlr4)

# <img src="https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/misc/antlr-logo.png" alt="logo" width="48"> VS Code Extension for ANTLR4 Grammars

**The** extension for ANTLR4 support in Visual Studio Code.

## What's New

Externalized the formatter into an own Node.js package for broader use.

## How To Contribute

If you want to create your own version of this extension or plan to contribute to its development then follow the steps outlined in the [contribute.md](./doc/contribute.md) document.

## Features

![Feature Overview](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/feature-overview.png)

### Syntax Coloring

* Syntax coloring for ANTLR grammars (.g and .g4 files)
>![Syntax Coloring](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/antlr4-5.png)

* Comes with an own beautiful color theme, which not only includes all the [recommended groups](http://manual.macromates.com/en/language_grammars), but also some special rules for grammar elements that you won't find in other themes (e.g. alt labels and options). They are, immodestly, named `Complete Dark` and `Complete Light`.

### Code Completion + Symbol Information

* Code suggestions for all rule + token names, channels, modes etc. (including built-in ones).
* Symbol type + location are shown on mouse hover. Navigate to any symbol with Ctrl/Cmd + Click. This works even for nested grammars (token vocabulary + imports).
>![](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/antlr4-1.png)

* Symbol list for quick navigation (via Shift + Ctrl/Cmd + O).
>![](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/antlr4-6.png)

### Grammar Validations

* In the background syntax checking takes place, while typing. Also some semantic checks are done, e.g. for duplicate or unknown symbols.
>![](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/antlr4-2.png)

* When parser generation is enabled (at least for internal use) ANTLR4 itself is used to check for errors and warnings. These are then reported instead of the internally found problems and give you so the full validation power of ANTLR4.
>![](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/antlr4-8.png)

### More Information
There are a number of documentation files for specific topics:

* [Extension Settings](doc/extension-settings.md)
* [Parser generation](doc/parser-generation.md)
* [Grammar Debugging](doc/grammar-debugging.md)
* [Graphical Visualizations](doc/graphical-visualizations.md)
* [Grammar Formatting](doc/formatting.md)
* [Sentence Generation](doc/sentence-generation.md)

### Miscellaneous

* There is an option to switch on rule reference counts via Code Lens. This feature is switchable independent of the vscode Code Lens setting.
>![](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/antlr4-7.png)

* For each grammar its dependencies are shown in a sidebar view (i.e. token vocabulary and imports).
>![](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/antlr4-10.png)

## Known Issues

See the [Git issue tracker](https://github.com/mike-lischke/vscode-antlr4/issues).

## What's planned next?

Bug fixing and what feels appealing to hack on.

## Release Notes

See [release-notes](./release-notes.md).

## Other Notes
The dependencies view icons have been taken from the vscode tree view example.
