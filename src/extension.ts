/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

import * as path from "path";
import * as fs from "fs-extra";
import * as Net from 'net';

import {
    workspace, languages, DiagnosticSeverity, ExtensionContext, Range, TextDocument, Diagnostic, TextDocumentChangeEvent,
    commands, window, TextEditorSelectionChangeEvent, TextEditorEdit, TextEditor, OutputChannel, Selection,
    debug, DebugConfigurationProvider, WorkspaceFolder, DebugConfiguration, CancellationToken, ProviderResult,
    TextEditorRevealType
} from 'vscode';

import { AntlrHoverProvider } from './frontend/HoverProvider';
import { AntlrDefinitionProvider } from './frontend/DefinitionProvider';
import { AntlrSymbolProvider } from './frontend/SymbolProvider';
import { AntlrCodeLensProvider } from './frontend/CodeLensProvider';
import { AntlrCompletionItemProvider } from './frontend/CompletionItemProvider';
import { AntlrRailroadDiagramProvider } from './frontend/RailroadDiagramProvider';
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

const ANTLR = { language: 'antlr', scheme: 'file' };

let diagnosticCollection = languages.createDiagnosticCollection('antlr');
let DiagnosticTypeMap: Map<DiagnosticType, DiagnosticSeverity> = new Map();

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

export function activate(context: ExtensionContext) {

    DiagnosticTypeMap.set(DiagnosticType.Hint, DiagnosticSeverity.Hint);
    DiagnosticTypeMap.set(DiagnosticType.Info, DiagnosticSeverity.Information);
    DiagnosticTypeMap.set(DiagnosticType.Warning, DiagnosticSeverity.Warning);
    DiagnosticTypeMap.set(DiagnosticType.Error, DiagnosticSeverity.Error);

    backend = new AntlrFacade(workspace.getConfiguration("antlr4.generation")["importDir"] || "");
    progress = new ProgressIndicator();
    outputChannel = window.createOutputChannel("ANTLR Exceptions");

    // Load interpreter + cache data for each open document, if there's any.
    for (let document of workspace.textDocuments) {
        if (document.languageId === "antlr") {
            let antlrPath = path.join(path.dirname(document.fileName), ".antlr");
            backend.generate(document.fileName, { outputDir: antlrPath, loadOnly: true });
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
    context.subscriptions.push(languages.registerDocumentRangeFormattingEditProvider(ANTLR, new AntlrFormattingProvider(backend)));
    context.subscriptions.push(languages.registerRenameProvider(ANTLR, new AntlrRenameProvider(backend)));
    context.subscriptions.push(languages.registerReferenceProvider(ANTLR, new AntlrReferenceProvider(backend)));

    let diagramProvider = new AntlrRailroadDiagramProvider(backend, context);

    // The single RRD diagram command.
    context.subscriptions.push(commands.registerTextEditorCommand('antlr.rrd.singleRule', (editor: TextEditor, edit: TextEditorEdit) => {
        diagramProvider.showWebview(editor, {
            title: "RRD: " + path.basename(editor.document.fileName),
            fullList: false
        });
    }));

    // The full RRD diagram command.
    context.subscriptions.push(commands.registerTextEditorCommand('antlr.rrd.allRules', (editor: TextEditor, edit: TextEditorEdit) => {
        diagramProvider.showWebview(editor, {
            title: "RRD: " + path.basename(editor.document.fileName),
            fullList: true
        });
    }));

    // The ATN graph command.
    let atnGraphProvider = new AntlrATNGraphProvider(backend, context);
    context.subscriptions.push(commands.registerTextEditorCommand("antlr.atn.singleRule", (editor: TextEditor, edit: TextEditorEdit) => {
        atnGraphProvider.showWebview(editor, {
            title: "ATN: " + path.basename(editor.document.fileName)
        });
    }));

    // The call graph command.
    let callGraphProvider = new AntlrCallGraphProvider(backend, context);
    context.subscriptions.push(commands.registerTextEditorCommand('antlr.call-graph', (editor: TextEditor, edit: TextEditorEdit) => {
        callGraphProvider.showWebview(editor, {
            title: "Call Graph: " + path.basename(editor.document.fileName)
        });
    }));

    // Sentence generation.
    context.subscriptions.push(commands.registerTextEditorCommand("antlr.tools.generateSentences", (editor: TextEditor, edit: TextEditorEdit) => {
        let ruleMappings: RuleMappings = new Map([
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
            ["identifier", "`id`"],
            ["schemaRef", "sakila"],
            ["tableRef", "sakila.actor"],
            ["columnRef", "sakila.actor.actor_id"],
        ]);

        let fileName = editor.document.uri.fsPath;
        let caret = editor.selection.active;
        let [ruleName, _] = backend.ruleFromPosition(fileName, caret.character, caret.line + 1);

        if (!ruleName) {
            console.log("ANTLR4 sentence generation: no rule selected");
        }

        let basePath = path.dirname(fileName);
        let actionFile = workspace.getConfiguration("antlr4.sentenceGeneration")["actionFile"];
        if (actionFile) {
            if (!path.isAbsolute(actionFile)) {
                actionFile = path.join(basePath, actionFile);
            }
        }

        if (fs.existsSync(actionFile)) {
            delete require.cache[require.resolve(actionFile)];
        }

        for (let i = 0; i < 20; ++i) {
            let sentence = backend.generateSentence(fileName, {
                startRule: ruleName!,
                maxParserIterations: 3,
                maxLexerIterations: 10,
                maxRecursions: 4,
                convergenceFactor: 0.5,
            }, ruleMappings, actionFile);
            console.log(sentence);
        }
    }));

    // Debugging support.
    context.subscriptions.push(debug.registerDebugConfigurationProvider('antlr-debug', new AntlrDebugConfigurationProvider()));

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
    let editor = window.activeTextEditor;
    if (editor && editor.document.languageId == "antlr" && editor.document.uri.scheme === "file") {
        updateTreeProviders(editor.document);
    }

    // Helper commands.
    context.subscriptions.push(commands.registerCommand("antlr.openGrammar", (grammar: string) => {
        workspace.openTextDocument(grammar).then((document) => {
            window.showTextDocument(document, 0, false);
        });
    }));

    context.subscriptions.push(commands.registerCommand("antlr.selectGrammarRange", (range: LexicalRange) => {
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(
                range.start.row - 1, range.start.column,
                range.end.row - 1, range.end.column + 1
            );
            window.activeTextEditor.revealRange(
                new Range(range.start.row - 1, range.start.column, range.end.row - 1, range.end.column + 1),
                TextEditorRevealType.InCenterIfOutsideViewport
            );
        }
    }));

    //----- Events -----

    workspace.onDidOpenTextDocument((doc: TextDocument) => {
        if (doc.languageId == "antlr" && doc.uri.scheme === "file") {
            backend.loadGrammar(doc.fileName);
            regenerateBackgroundData(doc);
        }
    });

    workspace.onDidCloseTextDocument((document: TextDocument) => {
        if (document.languageId === "antlr" && document.uri.scheme === "file") {
            backend.releaseGrammar(document.fileName);
            diagnosticCollection.set(document.uri, []);
        }
    })

    let changeTimers: Map<string, any> = new Map(); // Keyed by file name.

    workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
        if (event.contentChanges.length > 0
            && event.document.languageId === "antlr"
            && event.document.uri.scheme === "file") {

            let fileName = event.document.fileName;
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
    })

    workspace.onDidSaveTextDocument((document: TextDocument) => {
        if (document.languageId === "antlr" && document.uri.scheme === "file") {
            regenerateBackgroundData(document);
        }
    });

    window.onDidChangeTextEditorSelection((event: TextEditorSelectionChangeEvent) => {
        if (event.textEditor.document.languageId === "antlr" && event.textEditor.document.uri.scheme === "file") {
            diagramProvider.update(event.textEditor);
            atnGraphProvider.update(event.textEditor, false);
            actionsProvider.update(event.textEditor);
        }
    });

    window.onDidChangeActiveTextEditor((editor: TextEditor) => {
        updateTreeProviders(editor.document);
    });

    function processDiagnostic(document: TextDocument) {
        var diagnostics = [];
        let entries = backend.getDiagnostics(document.fileName);
        for (let entry of entries) {
            let startRow = entry.range.start.row == 0 ? 0 : entry.range.start.row - 1;
            let endRow = entry.range.end.row == 0 ? 0 : entry.range.end.row - 1;
            let range = new Range(startRow, entry.range.start.column, endRow, entry.range.end.column);
            var diagnostic = new Diagnostic(range, entry.message, DiagnosticTypeMap.get(entry.type));
            diagnostics.push(diagnostic);
        }
        diagnosticCollection.set(document.uri, diagnostics);
    }

    /**
     * For certain services we have to (re)generate files from grammars in the background:
     * - syntactic + semantic grammar analysis by the ANTLR tool
     * - generate interpreter data (for debugging + ATN views)
     */
    function regenerateBackgroundData(document: TextDocument) {
        if (workspace.getConfiguration("antlr4.generation")["mode"] === "none") {
            return;
        }

        let externalMode = workspace.getConfiguration("antlr4.generation")["mode"] === "external";

        progress.startAnimation();
        let basePath = path.dirname(document.fileName);
        let antlrPath = path.join(basePath, ".antlr");

        // In internal mode we generate files with the default target language into our .antlr folder.
        // In external mode the files are generated into the given output folder (or the folder where the
        // main grammar is). In this case we have to move the interpreter data to our .antlr folder.
        let outputDir = antlrPath;
        if (externalMode) {
            outputDir = workspace.getConfiguration("antlr4.generation")["outputDir"];
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
            window.showErrorMessage("Cannot create output folder: " + error);
            return;
        }

        let options: GenerationOptions = {
            baseDir: basePath,
            libDir: workspace.getConfiguration("antlr4.generation")["importDir"],
            outputDir: outputDir,
            listeners: false,
            visitors: false,
            alternativeJar: workspace.getConfiguration("antlr4.generation")["alternativeJar"],
            additionalParameters: workspace.getConfiguration("antlr4.generation")["additionalParameters"]
        };

        if (externalMode) {
            options.language = workspace.getConfiguration("antlr4.generation")["language"];
            options.package = workspace.getConfiguration("antlr4.generation")["package"];
            options.listeners = workspace.getConfiguration("antlr4.generation")["listeners"];
            options.visitors = workspace.getConfiguration("antlr4.generation")["visitors"];
        }

        let result = backend.generate(document.fileName, options);
        result.then((affectedFiles: string[]) => {
            for (let file of affectedFiles) {
                let fullPath = path.resolve(basePath, file);
                workspace.textDocuments.forEach(document => {
                    if (document.fileName === fullPath) {
                        processDiagnostic(document);
                    }
                });
            }

            // Finally move interpreter files to our internal folder and reload that.
            if (externalMode && antlrPath != outputDir) {
                try {
                    let files = fs.readdirSync(outputDir);
                    for (let file of files) {
                        if (file.endsWith(".interp")) {
                            let sourceFile = path.join(outputDir, file);
                            fs.moveSync(sourceFile, path.join(antlrPath, file), { overwrite: true });
                        }
                    }
                } catch (error) {
                    window.showErrorMessage("Error while transfering interpreter data: " + error);
                }
            }

            backend.generate(document.fileName, { outputDir: antlrPath, loadOnly: true }).then(() => {
                atnGraphProvider.update(window.activeTextEditor!, true);
                updateTreeProviders(document);

                progress.stopAnimation();
            });

        }).catch(error => {
            progress.stopAnimation();
            outputChannel.appendLine(error);
            outputChannel.show(true);
        });
    }

    function updateTreeProviders(document: TextDocument) {
        lexerSymbolsProvider.refresh(document);
        parserSymbolsProvider.refresh(document);
        importsProvider.refresh(document);
        channelsProvider.refresh(document);
        modesProvider.refresh(document);
        actionsProvider.refresh(document);
    }
} // activate() function

export function deactivate() {
}

/**
 * Validates launch configuration for grammar debugging.
 */
class AntlrDebugConfigurationProvider implements DebugConfigurationProvider {
    constructor() { }

    resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration,
        token?: CancellationToken): ProviderResult<DebugConfiguration> {

        if (workspace.getConfiguration("antlr4.generation")["mode"] === "none") {
            return window.showErrorMessage("Interpreter data generation is disabled in the preferences (see " +
                "'antlr4.generation'). Set this at least to 'internal' to enable debugging.").then(_ => {
                    return undefined;
                });
        }

        if (!this.server) {
            this.server = Net.createServer(socket => {
                socket.on('end', () => {
                    //console.error('>> ANTLR debugging client connection closed\n');
                });

                const session = new AntlrDebugSession(folder, backend, [
                    parseTreeProvider
                ]);
                session.setRunAsServer(true);
                session.start(<NodeJS.ReadableStream>socket, socket);
            }).listen(0);
        }

        let info = this.server.address() as Net.AddressInfo;
        if (info) {
            config.debugServer = info.port;
        } else {
            config.debugServer = 0;
        }

        return config;
    }

    dispose() {
        if (this.server) {
            this.server.close();
        }
    }

    private server?: Net.Server;
    private port?: number;
}
