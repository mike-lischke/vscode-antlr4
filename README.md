[![](https://vsmarketplacebadge.apphb.com/version-short/mike-lischke.vscode-antlr4.svg)](https://marketplace.visualstudio.com/items?itemName=mike-lischke.vscode-antlr4)
[![](https://vsmarketplacebadge.apphb.com/installs-short/mike-lischke.vscode-antlr4.svg)](https://marketplace.visualstudio.com/items?itemName=mike-lischke.vscode-antlr4)
[![](https://vsmarketplacebadge.apphb.com/rating-short/mike-lischke.vscode-antlr4.svg)](https://marketplace.visualstudio.com/items?itemName=mike-lischke.vscode-antlr4)
[![](https://travis-ci.org/mike-lischke/vscode-antlr4.svg?branch=master)](https://travis-ci.org/mike-lischke/vscode-antlr4)


<p style="float:right;">
  <img src="https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/misc/antlr-logo.png" alt="logo" width="64">
</p>


# vscode-antlr4
**The** extension for ANTLR4 support in Visual Studio code.

## What's New

This release adds a live visual parse tree and fixes a number of bugs. See also the [Release Notes](#release-notes) for further details.

## Features

![Syntax Coloring](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/feature-overview.png)

### Syntax Coloring

* Syntax coloring for ANTLR grammars (.g and .g4 files)
>![Syntax Coloring](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/antlr4-5.png)

* Comes with an own beautiful color theme, which not only includes all the [recommended groups](http://manual.macromates.com/en/language_grammars), but also some special rules for grammar elements that you won't find in other themes (e.g. alt labels and options). They are, unmodestly, named `Complete Dark` and `Complete Light`.

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

### More Informations
There are a number of documentation files for specific topics:

* [Extension Settings](doc/extension-settings.md)
* [Parser generation](doc/parser-generation.md)
* [Grammar Debugging](doc/grammar-debugging.md)
* [Graphical Visualizations](doc/graphical-visualizations.md)
* [Grammar Formatting](doc/formatting.md)


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

### 2.1.0
- Fixed Bug #41: Plugin Internal Error on EOF
- Fixed Bug #48: Not possible to use ${} macros in launch.json
- Merged PR #59: Fix CodeLens positions being off by one while editing and reference count being wrong
- Fixed re-use of graphical tabs (web views), to avoid multiple tabs of the same type for a single grammar. Also, parse tree tabs now include the grammar's name in the title, just like it is done for all other tabs.
- Added live visual parse trees and improved their handling + usability. No more jumping and zooming to default values on each debugger run.
- Fixed a number of TS warnings.
- Added two parse tree related settings (allowing to specify the inital layout + orientation).
- Improved handling of certain ANTLR4 errors.
- Re-enabled the accidentially disabled code completion feature.

### 2.0.4
- Fixed Bug #36: "$antlr-format off" removes remaining lines in file
- Fixed Bug #37: Debugging gets stuck with visualParseTree set to true

### 2.0.3
- Updated tests to compile with the latest backend changes.
- Fixed a bug when setting up a debugger, after switching grammars. Only the first used grammar did work.

### 2.0.2
- Fixed Bug #28: ATN graph cannot be drawn even after code generation.
- Fixed another bug in interpreter data file names construction.

### 2.0.1
- Bug fix for wrong interpreter data paths.
- Implicit lexer tokens are now properly handled.
- Fixed a bug in the formatter.

### 2.0.0
- The extension and its backend module (formerly known as antlr4-graps) have now been combined. This went along with a reorganization of the code.
- A rename provider has been added to allow renaming symbols across files.

### 1.3.0
- Added grammar debugger.
- Added graphical and textual parse tree display.

### 1.2.5
- Added dependency graph.
- Added call graph.

### 1.1.5
- Added ATN graphs.
- Added SVG export for ATN graphs + railroad diagrams.
- Now showing a progress indicator for background tasks (parser generation).

### 1.0.4
- Added code lens support.
- Added code completion support.
- Finished the light theme.

### 1.0.0

* Rework of the code - now using Typescript.
* Adjustments for reworked antlr4-graps nodejs module.
* Native code compilation is a matter of the past, so problems on e.g. Windows are gone now.
* No longer considered a preview.

### 0.4.0

* Updated the symbol handling for the latest change in the antlr4-graps module. We now also show different icons depending on the type of the symbol.
* Updated prebuilt antlr4-graps binaries for all platforms.
* Quick navigation has been extended to imports/tokenvocabs and lexer modes.
* The symbols list now contains some markup to show where a section with a specific lexer mode starts.
* Fixed also a little mis-highlighting in the language syntax file.
* Added a license file.

### 0.3.4

Marked the extension as preview and added prebuild binaries.

### 0.2.0

* full setup of the project
* added most of the required settings etc.
* included dark theme is complete

For further details see the [Git commit history](https://github.com/mike-lischke/vscode-antlr4/commits/master).

## Other Notes
The dependencies view icons have been taken from the vscode tree view example.
