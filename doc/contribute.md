# How to Contribute

This document describes the necessary steps to build the extension and run the unit and integration tests as well as how to debug both.

## Getting Started

Clone the repository to your local disk:

```bash
git clone --branch master https://github.com/mike-lischke/vscode-antlr4.git
```

Switch to the generated project folder and run the node package installation:

```bash
cd vscode-antlr4
vscode-antlr4> npm i
...
added 552 packages, and audited 553 packages in 4s

```

With this in place you can already run the tests:

```bash
npm run test
```

Not: the sentence generation tests are based on random input, so they sometimes fail. Don't worry about that. Repeat the tests and likely they will succeed the next time.

Now it's time to start hacking of the extension. Launch VS Code and open the project folder. If you have VS Code setup to allow using the terminal, then you can open the project using:

```bash
vscode-antlr4> code .
```

## Building and Running

The package.json file contains a number of scripts (you just used one of them, for testing). There are few others, which allow generating the parser + lexer files for the ANTLR4 language or to run eslint or to package and publish the extension.

The generated files are part of the repository, so it is not necessary that your regenerate them again to build the extension, but just in case you want to refresh the files use the `antlr4ts` NPM script. It uses the same ANTLR4 jar like the extension, for generating parser files.

To build the extension you can either run the `vscode:prepublish` script or start a debug session, which will run tsc in watch mode as first step. For that change to the debug view and select `Launch Extension` from the configuration dropdown. Then start the debug session by clicking the green triangle or use your configured hot key. After a few seconds you should see a new VS Code window, titled `[Extension Development Host]`.

Now open a grammar file and you will see the extension icon in the activity bar. Click on that to switch to the ANTLR4 view. Now you are ready for debugging the extension. Close the extension host window to end the debug session.

## Debugging Tests

There's another launch configuration to debug the current tests. This requires to have a spec file open in the editor when invoking this command. For example: open the test/backend/base.spec.ts file, switch to the debug view and select the `Run selected Jest test` configuration. Then start the debug session. If you have set a break point in the base spec then the execution should stop at that.
