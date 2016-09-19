# vscode-antlr4

This extension for Visual Studio code adds support for ANTLR4 grammars.

## Features

![](vscode-demo.gif)

This extension adds syntax coloring for ANTLR grammars (.g and .g4 files). Best results are achieved by using one of the provided color themes, but any other color theme will do mostly. With this extension you also get error checking (syntax + symbol checking), go-to-definition and the symbol list for quick navigation. Additionally, hovers (tooltips) are provided to easily show the definition of a symbol ([virtual] lexer tokens, parser rules, modes and channels).

## Extension Settings

Nothing for now.

## Known Issues

* The native module used for parsing (antlr4-graps) doesn't work as 32bit on Windows (as required by VS Code, which is still a 32bit app there). Hence this extension does not work on Windows currently. The prebuilt Linux binary also seems to have some trouble on certain installations/distros. Need to investigate that yet. But on OSX everything works nicely.

* The complete-light color theme is not fully done yet.

## Release Notes

### 0.0.1

Initial vscode-antlr4 project.

### 0.2.0

* full setup of the project
* added most of the required settings etc.
* included dark theme is complete

### 0.3.0

Additions and updates for publishing the extension.

### 0.3.4

Marked the extension as preview and added prebuild binaries.

### 0.3.7

Added a demo animation.
