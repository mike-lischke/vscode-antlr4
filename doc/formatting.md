# Parser Generation

The extension is able to format grammar source code, considering a [large set of options](extension-settings.md#grammar-formatting). The [clang-format](http://clang.llvm.org/docs/ClangFormatStyleOptions.html) tool acted as a model for option naming and some settings that have been taken over. Beside the usual things like block formatting, empty lines and comment formatting, there's a powerful alignment implementation. It allows to align certain grammar elements (trailing comments, lexer commands, alt labels, predicates and others) between consecutive lines that contain this grammar element (when grouped alignment is on) or for the entire file. There can even be multiple alignments on a line:

>![](https://raw.githubusercontent.com/mike-lischke/vscode-antlr4/master/images/antlr4-9.png)

The formatting feature can be controlled dynamically by special comments in the grammar source, which allow to switch a setting on the fly. You can even completely switch off formatting for a file or a part of it. Below are some examples for such a formatting comment. You can use boolean values (on, off, true, false), numbers and identifiers (for word options). They are not case-sensitive.

```
// $antlr-format on
// $antlr-format false
// $antlr-format columnLimit 150
// $antlr-format allowShortBlocksOnASingleLine true, indentWidth 8
```

Don't put anything else in a comment with formatting settings. All comment types are allowed, but single line comments are read line by line and hence require each line to start with the `$antlr-format` introducer.

In order to set all settings to their default values use: `// $antlr-format reset`. This can also be used in conjunction with other options.


