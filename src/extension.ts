/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */


import * as path from "path";
import * as fs from "fs-extra";
import * as Net from "net";

import {
    workspace, languages, DiagnosticSeverity, ExtensionContext, Range, TextDocument, Diagnostic,
    TextDocumentChangeEvent, commands, window, TextEditorSelectionChangeEvent, TextEditorEdit, TextEditor,
    OutputChannel, Selection, debug, DebugConfigurationProvider, WorkspaceFolder, DebugConfiguration, CancellationToken,
    ProviderResult, TextEditorRevealType,
} from "vscode";

import { AntlrHoverProvider } from "./frontend/HoverProvider";
import { AntlrDefinitionProvider } from "./frontend/DefinitionProvider";
import { AntlrSymbolProvider } from "./frontend/SymbolProvider";
import { AntlrCodeLensProvider } from "./frontend/CodeLensProvider";
import { AntlrCompletionItemProvider } from "./frontend/CompletionItemProvider";
import { AntlrRailroadDiagramProvider } from "./frontend/RailroadDiagramProvider";
import { AntlrATNGraphProvider } from "./frontend/ATNGraphProvider";
import { AntlrFormattingProvider } from "./frontend/FormattingProvider";
import { AntlrCallGraphProvider } from "./frontend/CallGraphProvider";

import { ImportsProvider } from "./frontend/ImportsProvider";
import { LexerSymbolsProvider } from "./frontend/LexerSymbolsProvider";
import { ParserSymbolsProvider } from "./frontend/ParserSymbolsProvider";
import { ChannelsProvider } from "./frontend/ChannelsProvider";
import { ModesProvider } from "./frontend/ModesProvider";
import { ActionsProvider } from "./frontend/ActionsProvider";

import { AntlrParseTreeProvider } from "./frontend/ParseTreeProvider";
import { AntlrRenameProvider } from "./frontend/RenameProvider";

import { ProgressIndicator } from "./frontend/ProgressIndicator";
import { AntlrDebugSession } from "./frontend/AntlrDebugAdapter";

import { DiagnosticType, AntlrFacade, GenerationOptions, LexicalRange, RuleMappings } from "./backend/facade";
import { AntlrReferenceProvider } from "./frontend/ReferenceProvider";
import { Utils } from "./frontend/Utils";
import { GrammarType } from "./backend/SourceContext";

const ANTLR = { language: "antlr", scheme: "file" };

const diagnosticCollection = languages.createDiagnosticCollection("antlr");
const DiagnosticTypeMap = new Map<DiagnosticType, DiagnosticSeverity>();

let backend: AntlrFacade;
let progress: ProgressIndicator;
let outputChannel: OutputChannel;

let importsProvider: ImportsProvider;
let lexerSymbolsProvider: LexerSymbolsProvider;
let parserSymbolsProvider: ParserSymbolsProvider;
let channelsProvider: ChannelsProvider;
let modesProvider: ModesProvider;
let actionsProvider: ActionsProvider;

let parseTreeProvider: AntlrParseTreeProvider;
let codeLensProvider: AntlrCodeLensProvider;

/**
 * Entry function for the extension. Called when the extension is activated.
 *
 * @param context The extension context from vscode.
 */
export const activate = (context: ExtensionContext): void => {
    /**
     * Checks if the given document is actually a grammar file.
     *
     * @param document The document to check.
     *
     * @returns True if this is indeed a grammar file.
     */
    const isGrammarFile = (document: TextDocument): boolean =>
        document.languageId === "antlr" && document.uri.scheme === "file";

    /**
     * Updates all used tree providers for the given document.
     *
     * @param document The source for the updates.
     */
    const updateTreeProviders = (document: TextDocument): void => {
        lexerSymbolsProvider.refresh(document);
        parserSymbolsProvider.refresh(document);
        importsProvider.refresh(document);
        channelsProvider.refresh(document);
        modesProvider.refresh(document);
        actionsProvider.refresh(document);
    };

    DiagnosticTypeMap.set(DiagnosticType.Hint, DiagnosticSeverity.Hint);
    DiagnosticTypeMap.set(DiagnosticType.Info, DiagnosticSeverity.Information);
    DiagnosticTypeMap.set(DiagnosticType.Warning, DiagnosticSeverity.Warning);
    DiagnosticTypeMap.set(DiagnosticType.Error, DiagnosticSeverity.Error);

    backend = new AntlrFacade(workspace.getConfiguration("antlr4.generation").importDir || "");
    progress = new ProgressIndicator();
    outputChannel = window.createOutputChannel("ANTLR Exceptions");

    // Load interpreter + cache data for each open document, if there's any.
    for (const document of workspace.textDocuments) {
        if (isGrammarFile(document)) {
            const antlrPath = path.join(path.dirname(document.fileName), ".antlr");
            void backend.generate(document.fileName, { outputDir: antlrPath, loadOnly: true });
            AntlrATNGraphProvider.addStatesForGrammar(antlrPath, document.fileName);
        }
    }

    context.subscriptions.push(languages.registerHoverProvider(ANTLR, new AntlrHoverProvider(backend)));
    context.subscriptions.push(languages.registerDefinitionProvider(ANTLR, new AntlrDefinitionProvider(backend)));
    context.subscriptions.push(languages.registerDocumentSymbolProvider(ANTLR, new AntlrSymbolProvider(backend)));
    codeLensProvider = new AntlrCodeLensProvider(backend);
    context.subscriptions.push(languages.registerCodeLensProvider(ANTLR, codeLensProvider));
    context.subscriptions.push(languages.registerCompletionItemProvider(ANTLR, new AntlrCompletionItemProvider(backend),
        " ", ":", "@", "<", "{", "["));
    context.subscriptions.push(languages.registerDocumentRangeFormattingEditProvider(ANTLR,
        new AntlrFormattingProvider(backend)));
    context.subscriptions.push(languages.registerRenameProvider(ANTLR, new AntlrRenameProvider(backend)));
    context.subscriptions.push(languages.registerReferenceProvider(ANTLR, new AntlrReferenceProvider(backend)));

    const diagramProvider = new AntlrRailroadDiagramProvider(backend, context);

    // The single RRD diagram command.
    context.subscriptions.push(commands.registerTextEditorCommand("antlr.rrd.singleRule",
        (textEditor: TextEditor, edit: TextEditorEdit) => {
            diagramProvider.showWebview(textEditor, {
                title: "RRD: " + path.basename(textEditor.document.fileName),
                fullList: false,
            });
        }),
    );

    // The full RRD diagram command.
    context.subscriptions.push(commands.registerTextEditorCommand("antlr.rrd.allRules",
        (textEditor: TextEditor, edit: TextEditorEdit) => {
            diagramProvider.showWebview(textEditor, {
                title: "RRD: " + path.basename(textEditor.document.fileName),
                fullList: true,
            });
        }),
    );

    // The ATN graph command.
    const atnGraphProvider = new AntlrATNGraphProvider(backend, context);
    context.subscriptions.push(commands.registerTextEditorCommand("antlr.atn.singleRule",
        (textEditor: TextEditor, edit: TextEditorEdit) => {
            atnGraphProvider.showWebview(textEditor, {
                title: "ATN: " + path.basename(textEditor.document.fileName),
            });
        }),
    );

    // The call graph command.
    const callGraphProvider = new AntlrCallGraphProvider(backend, context);
    context.subscriptions.push(commands.registerTextEditorCommand("antlr.call-graph",
        (textEditor: TextEditor, edit: TextEditorEdit) => {
            callGraphProvider.showWebview(textEditor, {
                title: "Call Graph: " + path.basename(textEditor.document.fileName),
            });
        }),
    );

    // Sentence generation.
    const genOutputChannel = window.createOutputChannel("Sentence Generation");
    context.subscriptions.push(commands.registerTextEditorCommand("antlr.tools.generateSentences",
        (textEditor: TextEditor, edit: TextEditorEdit) => {
            const ruleMappings: RuleMappings = new Map([
                ["A", "A"],
                ["B", "B"],
                ["C", "C"],
                ["D", "D"],
                ["E", "E"],
                ["F", "F"],
                ["G", "G"],
                ["H", "H"],
                ["I", "I"],
                ["J", "J"],
                ["K", "K"],
                ["L", "L"],
                ["M", "M"],
                ["N", "N"],
                ["O", "O"],
                ["P", "P"],
                ["Q", "Q"],
                ["R", "R"],
                ["S", "S"],
                ["T", "T"],
                ["U", "U"],
                ["V", "V"],
                ["W", "W"],
                ["X", "X"],
                ["Y", "Y"],
                ["Z", "Z"],
                ["NOT2_SYMBOL", "NOT"],
                ["CONCAT_PIPES_SYMBOL", "||"],
                ["INT_NUMBER", "-1111111111"],
                ["LONG_NUMBER", "1111111111"],
                ["ULONGLONG_NUMBER", "18446744073709551614"],
                ["DOUBLE_QUOTED_TEXT", "\"text\""],
                ["SINGLE_QUOTED_TEXT", "'text'"],
                ["BACK_TICK_QUOTED_ID", "`id`"],
                ["UNDERSCORE_CHARSET", "_utf8"],
                ["identifier", "`id`"],
                ["schemaRef", "sakila"],
                ["tableRef", "sakila.actor"],
                ["columnRef", "sakila.actor.actor_id"],
            ]);

            const fileName = textEditor.document.uri.fsPath;
            const caret = textEditor.selection.active;
            const [ruleName] = backend.ruleFromPosition(fileName, caret.character, caret.line + 1);

            if (!ruleName) {
                // TODO: convert that to an error dialog or diagnostic entry.
                console.log("ANTLR4 sentence generation: no rule selected");
            }

            const basePath = path.dirname(fileName);
            let actionFile = workspace.getConfiguration("antlr4.sentenceGeneration").actionFile as string;
            if (actionFile) {
                if (!path.isAbsolute(actionFile)) {
                    actionFile = path.join(basePath, actionFile);
                }
            }

            for (let i = 0; i < 20; ++i) {
                const sentence = backend.generateSentence(fileName, {
                    startRule: ruleName!,
                    maxParserIterations: 3,
                    maxLexerIterations: 10,
                    maxRecursions: 1,
                    convergenceFactor: 0.15,
                }, ruleMappings, actionFile);
                genOutputChannel.appendLine(sentence);
            }
        }),
    );

    // Debugging support.
    context.subscriptions.push(debug.registerDebugConfigurationProvider("antlr-debug",
        new AntlrDebugConfigurationProvider()));

    importsProvider = new ImportsProvider(backend);
    context.subscriptions.push(window.registerTreeDataProvider("antlr4.imports", importsProvider));

    lexerSymbolsProvider = new LexerSymbolsProvider(backend);
    context.subscriptions.push(window.registerTreeDataProvider("antlr4.lexerSymbols", lexerSymbolsProvider));

    parserSymbolsProvider = new ParserSymbolsProvider(backend);
    context.subscriptions.push(window.registerTreeDataProvider("antlr4.parserSymbols", parserSymbolsProvider));

    channelsProvider = new ChannelsProvider(backend);
    context.subscriptions.push(window.registerTreeDataProvider("antlr4.channels", channelsProvider));

    modesProvider = new ModesProvider(backend);
    context.subscriptions.push(window.registerTreeDataProvider("antlr4.modes", modesProvider));

    actionsProvider = new ActionsProvider(backend);
    actionsProvider.actionTree = window.createTreeView("antlr4.actions", { treeDataProvider: actionsProvider });

    parseTreeProvider = new AntlrParseTreeProvider(backend, context);

    // Initialize certain providers.
    const editor = window.activeTextEditor;
    if (editor && isGrammarFile(editor.document)) {
        updateTreeProviders(editor.document);
    }

    // Helper commands.
    context.subscriptions.push(commands.registerCommand("antlr.openGrammar", (grammar: string) => {
        void workspace.openTextDocument(grammar).then((document) => window.showTextDocument(document, 0, false));
    }));

    context.subscriptions.push(commands.registerCommand("antlr.selectGrammarRange", (range: LexicalRange) => {
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(
                range.start.row - 1, range.start.column,
                range.end.row - 1, range.end.column + 1,
            );
            window.activeTextEditor.revealRange(
                new Range(range.start.row - 1, range.start.column, range.end.row - 1, range.end.column + 1),
                TextEditorRevealType.InCenterIfOutsideViewport,
            );
        }
    }));

    //----- Events -----

    workspace.onDidOpenTextDocument((document: TextDocument) => {
        if (isGrammarFile(document)) {
            backend.loadGrammar(document.fileName);
            regenerateBackgroundData(document);
        }
    });

    workspace.onDidCloseTextDocument((document: TextDocument) => {
        if (isGrammarFile(document)) {
            backend.releaseGrammar(document.fileName);
            diagnosticCollection.set(document.uri, []);
        }
    });

    const changeTimers = new Map<string, any>(); // Keyed by file name.

    workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
        if (event.contentChanges.length > 0 && isGrammarFile(event.document)) {

            const fileName = event.document.fileName;
            backend.setText(fileName, event.document.getText());
            if (changeTimers.has(fileName)) {
                clearTimeout(changeTimers.get(fileName));
            }
            changeTimers.set(fileName, setTimeout(() => {
                changeTimers.delete(fileName);
                backend.reparse(fileName);

                diagramProvider.update(window.activeTextEditor!);
                callGraphProvider.update(window.activeTextEditor!);
                processDiagnostic(event.document);
                codeLensProvider.refresh();
            }, 300));
        }
    });

    workspace.onDidSaveTextDocument((document: TextDocument) => {
        if (isGrammarFile(document)) {
            regenerateBackgroundData(document);
        }
    });

    window.onDidChangeTextEditorSelection((event: TextEditorSelectionChangeEvent) => {
        if (isGrammarFile(event.textEditor.document)) {
            diagramProvider.update(event.textEditor);
            atnGraphProvider.update(event.textEditor, false);
            actionsProvider.update(event.textEditor);
        }
    });

    window.onDidChangeActiveTextEditor((textEditor: TextEditor) => {
        if (isGrammarFile(textEditor.document)) {
            const info = backend.getContextDetails(textEditor.document.fileName); 1;
            void Utils.switchVsCodeContext("antlr4.isLexer", info.type === GrammarType.Lexer);
            void Utils.switchVsCodeContext("antlr4.isParser", info.type === GrammarType.Parser);
            void Utils.switchVsCodeContext("antlr4.isCombined", info.type === GrammarType.Combined);

            void Utils.switchVsCodeContext("antlr4.hasImports", info.imports.length > 0);
        } else {
            void Utils.switchVsCodeContext("antlr4.isLexer", false);
            void Utils.switchVsCodeContext("antlr4.isParser", false);
            void Utils.switchVsCodeContext("antlr4.isCombined", false);
            void Utils.switchVsCodeContext("antlr4.hasImports", false);
        }
        updateTreeProviders(textEditor.document);
    });

    /**
     * Convert diagnostic information for the given file to show in vscode.
     *
     * @param document The document for which this should happen.
     */
    const processDiagnostic = (document: TextDocument) => {
        const diagnostics = [];
        const entries = backend.getDiagnostics(document.fileName);
        for (const entry of entries) {
            const startRow = entry.range.start.row === 0 ? 0 : entry.range.start.row - 1;
            const endRow = entry.range.end.row === 0 ? 0 : entry.range.end.row - 1;
            const range = new Range(startRow, entry.range.start.column, endRow, entry.range.end.column);
            const diagnostic = new Diagnostic(range, entry.message, DiagnosticTypeMap.get(entry.type));
            diagnostics.push(diagnostic);
        }
        diagnosticCollection.set(document.uri, diagnostics);
    };

    /**
     * For certain services we have to (re)generate files from grammars in the background:
     * - syntactic + semantic grammar analysis by the ANTLR tool
     * - generate interpreter data (for debugging + ATN views)
     *
     * @param document For which to generate the data.
     */
    const regenerateBackgroundData = (document: TextDocument): void => {
        if (workspace.getConfiguration("antlr4.generation").mode === "none") {
            return;
        }

        const externalMode = workspace.getConfiguration("antlr4.generation").mode === "external";

        progress.startAnimation();
        const basePath = path.dirname(document.fileName);
        const antlrPath = path.join(basePath, ".antlr");

        // In internal mode we generate files with the default target language into our .antlr folder.
        // In external mode the files are generated into the given output folder (or the folder where the
        // main grammar is). In this case we have to move the interpreter data to our .antlr folder.
        let outputDir = antlrPath;
        if (externalMode) {
            outputDir = workspace.getConfiguration("antlr4.generation").outputDir as string;
            if (!outputDir) {
                outputDir = basePath;
            } else {
                if (!path.isAbsolute(outputDir)) {
                    outputDir = path.join(basePath, outputDir);
                }
            }
        }

        try {
            fs.ensureDirSync(outputDir);
        } catch (error) {
            progress.stopAnimation();
            void window.showErrorMessage("Cannot create output folder: " + (error as string));

            return;
        }

        const options: GenerationOptions = {
            baseDir: basePath,
            libDir: workspace.getConfiguration("antlr4.generation").importDir as string,
            outputDir,
            listeners: false,
            visitors: false,
            alternativeJar: workspace.getConfiguration("antlr4.generation").alternativeJar as string,
            additionalParameters: workspace.getConfiguration("antlr4.generation").additionalParameters as string,
        };

        if (externalMode) {
            options.language = workspace.getConfiguration("antlr4.generation").language as string;
            options.package = workspace.getConfiguration("antlr4.generation").package as string;
            options.listeners = workspace.getConfiguration("antlr4.generation").listeners as boolean;
            options.visitors = workspace.getConfiguration("antlr4.generation").visitors as boolean;
        }

        const result = backend.generate(document.fileName, options);
        result.then((affectedFiles: string[]) => {
            for (const file of affectedFiles) {
                const fullPath = path.resolve(basePath, file);
                workspace.textDocuments.forEach((textDocument) => {
                    if (textDocument.fileName === fullPath) {
                        processDiagnostic(textDocument);
                    }
                });
            }

            // Finally move interpreter files to our internal folder and reload that.
            if (externalMode && antlrPath !== outputDir) {
                try {
                    const files = fs.readdirSync(outputDir);
                    for (const file of files) {
                        if (file.endsWith(".interp")) {
                            const sourceFile = path.join(outputDir, file);
                            fs.moveSync(sourceFile, path.join(antlrPath, file), { overwrite: true });
                        }
                    }
                } catch (reason) {
                    progress.stopAnimation();
                    outputChannel.appendLine(reason);
                    outputChannel.show(true);
                }
            }

            backend.generate(document.fileName, { outputDir: antlrPath, loadOnly: true }).then(() => {
                atnGraphProvider.update(window.activeTextEditor!, true);
                updateTreeProviders(document);

                progress.stopAnimation();
            }).catch((reason) => {
                progress.stopAnimation();
                outputChannel.appendLine(reason);
                outputChannel.show(true);
            });

        }).catch((reason) => {
            progress.stopAnimation();
            outputChannel.appendLine(reason);
            outputChannel.show(true);
        });
    };
}; // activate() function

/**
 * Validates launch configuration for grammar debugging.
 */
class AntlrDebugConfigurationProvider implements DebugConfigurationProvider {
    private server?: Net.Server;

    public resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration,
        token?: CancellationToken): ProviderResult<DebugConfiguration> {

        if (workspace.getConfiguration("antlr4.generation").mode === "none") {
            return window.showErrorMessage("Interpreter data generation is disabled in the preferences (see " +
                "'antlr4.generation'). Set this at least to 'internal' to enable debugging.").then((_) => undefined);
        }

        if (!this.server) {
            this.server = Net.createServer((socket) => {
                socket.on("end", () => {
                    //console.error('>> ANTLR debugging client connection closed\n');
                });

                const session = new AntlrDebugSession(folder, backend, [
                    parseTreeProvider,
                ]);
                session.setRunAsServer(true);
                session.start(<NodeJS.ReadableStream>socket, socket);
            }).listen(0);
        }

        const info = this.server.address() as Net.AddressInfo;
        if (info) {
            config.debugServer = info.port;
        } else {
            config.debugServer = 0;
        }

        return config;
    }

    public dispose() {
        if (this.server) {
            this.server.close();
        }
    }
}
