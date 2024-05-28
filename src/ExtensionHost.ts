/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as path from "path";
import * as fs from "fs-extra";

import {
    window, DiagnosticSeverity, ExtensionContext, workspace, languages, commands, debug, Diagnostic, TextDocument,
    TextDocumentChangeEvent, TextEditor, TextEditorEdit, TextEditorRevealType, TextEditorSelectionChangeEvent,
    Selection, Range, ViewColumn, ConfigurationChangeEvent,
} from "vscode";

import { AntlrFacade } from "./backend/facade.js";
import { DiagnosticType, IGenerationOptions, ILexicalRange, ISentenceGenerationOptions } from "./types.js";
import { FrontendUtils } from "./frontend/FrontendUtils.js";
import { ProgressIndicator } from "./frontend/ProgressIndicator.js";
import { AntlrDebugConfigurationProvider } from "./AntlrDebugConfigurationProvider.js";
import { ActionsProvider } from "./frontend/ActionsProvider.js";

import { ATNGraphProvider } from "./frontend/webviews/ATNGraphProvider.js";
import { CallGraphProvider } from "./frontend/webviews/CallGraphProvider.js";
import { RailroadDiagramProvider } from "./frontend/webviews/RailroadDiagramProvider.js";
import { ParseTreeProvider } from "./frontend/webviews/ParseTreeProvider.js";

import { ChannelsProvider } from "./frontend/ChannelsProvider.js";
import { AntlrCodeLensProvider } from "./frontend/CodeLensProvider.js";
import { AntlrCompletionItemProvider } from "./frontend/CompletionItemProvider.js";
import { AntlrDefinitionProvider } from "./frontend/DefinitionProvider.js";
import { AntlrFormattingProvider } from "./frontend/FormattingProvider.js";
import { AntlrHoverProvider } from "./frontend/HoverProvider.js";
import { ImportsProvider } from "./frontend/ImportsProvider.js";
import { LexerSymbolsProvider } from "./frontend/LexerSymbolsProvider.js";
import { ModesProvider } from "./frontend/ModesProvider.js";
import { ParserSymbolsProvider } from "./frontend/ParserSymbolsProvider.js";
import { AntlrReferenceProvider } from "./frontend/ReferenceProvider.js";
import { AntlrRenameProvider } from "./frontend/RenameProvider.js";
import { AntlrSymbolProvider } from "./frontend/SymbolProvider.js";

import { Log, LogLevel } from "./frontend/Log.js";

const outputChannel = window.createOutputChannel("ANTLR4 Output");

/** This is the main extension class. */
export class ExtensionHost {
    private static readonly diagnosticMap = new Map<DiagnosticType, DiagnosticSeverity>([
        [DiagnosticType.Hint, DiagnosticSeverity.Hint],
        [DiagnosticType.Info, DiagnosticSeverity.Information],
        [DiagnosticType.Warning, DiagnosticSeverity.Warning],
        [DiagnosticType.Error, DiagnosticSeverity.Error],
    ]);

    private static readonly antlrSelector = { language: "antlr", scheme: "file" };
    private static readonly diagnosticTypeMap = new Map<DiagnosticType, DiagnosticSeverity>();

    private readonly importDir: string | undefined;
    private readonly backend: AntlrFacade;
    private readonly progress = new ProgressIndicator();

    private readonly diagnosticCollection = languages.createDiagnosticCollection("antlr");

    private importsProvider: ImportsProvider;
    private lexerSymbolsProvider: LexerSymbolsProvider;
    private parserSymbolsProvider: ParserSymbolsProvider;
    private channelsProvider: ChannelsProvider;
    private modesProvider: ModesProvider;
    private actionsProvider: ActionsProvider;

    private parseTreeProvider: ParseTreeProvider;
    private codeLensProvider: AntlrCodeLensProvider;
    private diagramProvider: RailroadDiagramProvider;
    private atnGraphProvider: ATNGraphProvider;
    private callGraphProvider: CallGraphProvider;

    private changeTimers = new Map<string, ReturnType<typeof setTimeout>>(); // Keyed by file name.

    public constructor(context: ExtensionContext) {
        Log.setChannel(outputChannel);

        this.importDir = workspace.getConfiguration("antlr4.generation").get<string>("importDir");
        this.backend = new AntlrFacade(this.importDir ?? "", context.extensionPath);

        this.importsProvider = new ImportsProvider(this.backend);
        context.subscriptions.push(window.registerTreeDataProvider("antlr4.imports", this.importsProvider));

        this.lexerSymbolsProvider = new LexerSymbolsProvider(this.backend);
        context.subscriptions.push(window.registerTreeDataProvider("antlr4.lexerSymbols", this.lexerSymbolsProvider));

        this.parserSymbolsProvider = new ParserSymbolsProvider(this.backend);
        context.subscriptions.push(window.registerTreeDataProvider("antlr4.parserSymbols", this.parserSymbolsProvider));

        this.channelsProvider = new ChannelsProvider(this.backend);
        context.subscriptions.push(window.registerTreeDataProvider("antlr4.channels", this.channelsProvider));

        this.modesProvider = new ModesProvider(this.backend);
        context.subscriptions.push(window.registerTreeDataProvider("antlr4.modes", this.modesProvider));

        this.actionsProvider = new ActionsProvider(this.backend);
        this.actionsProvider.actionTree = window.createTreeView("antlr4.actions",
            { treeDataProvider: this.actionsProvider });

        this.parseTreeProvider = new ParseTreeProvider(this.backend, context);

        this.diagramProvider = new RailroadDiagramProvider(this.backend, context);
        this.atnGraphProvider = new ATNGraphProvider(this.backend, context);
        this.callGraphProvider = new CallGraphProvider(this.backend, context);

        // Initialize certain providers.
        const editor = window.activeTextEditor;
        if (editor && FrontendUtils.isGrammarFile(editor.document)) {
            FrontendUtils.updateVsCodeContext(this.backend, editor.document);
            this.updateTreeProviders(editor.document);
        }

        this.registerEventHandlers(context);
        this.addProvidersAndCommands(context);

        // Load interpreter + cache data for each open document, if there's any.
        const doNotGenerate = workspace.getConfiguration("antlr4.generation").mode === "none";

        for (const document of workspace.textDocuments) {
            if (FrontendUtils.isGrammarFile(document)) {
                const antlrPath = path.join(path.dirname(document.fileName), ".antlr");
                try {
                    void this.backend.generate(document.fileName,
                        { outputDir: antlrPath, loadOnly: true, generateIfNeeded: !doNotGenerate });
                    ATNGraphProvider.addStatesForGrammar(antlrPath, document.fileName);

                    this.processDiagnostic(document);
                } catch (error) {
                    Log.error([error]);
                }
            }
        }
    }

    private addProvidersAndCommands(context: ExtensionContext): void {
        context.subscriptions.push(languages.registerHoverProvider(ExtensionHost.antlrSelector,
            new AntlrHoverProvider(this.backend)));
        context.subscriptions.push(languages.registerDefinitionProvider(ExtensionHost.antlrSelector,
            new AntlrDefinitionProvider(this.backend)));
        context.subscriptions.push(languages.registerDocumentSymbolProvider(ExtensionHost.antlrSelector,
            new AntlrSymbolProvider(this.backend)));
        this.codeLensProvider = new AntlrCodeLensProvider(this.backend);
        context.subscriptions.push(languages.registerCodeLensProvider(ExtensionHost.antlrSelector,
            this.codeLensProvider));
        context.subscriptions.push(languages.registerCompletionItemProvider(ExtensionHost.antlrSelector,
            new AntlrCompletionItemProvider(this.backend), " ", ":", "@", "<", "{", "["));
        context.subscriptions.push(languages.registerDocumentRangeFormattingEditProvider(ExtensionHost.antlrSelector,
            new AntlrFormattingProvider(this.backend)));
        context.subscriptions.push(languages.registerRenameProvider(ExtensionHost.antlrSelector,
            new AntlrRenameProvider(this.backend)));
        context.subscriptions.push(languages.registerReferenceProvider(ExtensionHost.antlrSelector,
            new AntlrReferenceProvider(this.backend)));

        // The single RRD diagram command.
        context.subscriptions.push(commands.registerTextEditorCommand("antlr.rrd.singleRule",
            (textEditor: TextEditor, _edit: TextEditorEdit) => {
                this.diagramProvider.showWebview(textEditor.document.uri, {
                    title: "RRD: " + path.basename(textEditor.document.fileName),
                    fullList: false,
                });
            }),
        );

        // The full RRD diagram command.
        context.subscriptions.push(commands.registerTextEditorCommand("antlr.rrd.allRules",
            (textEditor: TextEditor, _edit: TextEditorEdit) => {
                this.diagramProvider.showWebview(textEditor.document.uri, {
                    title: "RRD: " + path.basename(textEditor.document.fileName),
                    fullList: true,
                });
            }),
        );

        // The ATN graph command.
        context.subscriptions.push(commands.registerTextEditorCommand("antlr.atn.singleRule",
            (textEditor: TextEditor, _edit: TextEditorEdit) => {
                this.atnGraphProvider.showWebview(textEditor.document.uri, {
                    title: "ATN: " + path.basename(textEditor.document.fileName),
                });
            }),
        );

        // The call graph command.
        context.subscriptions.push(commands.registerTextEditorCommand("antlr.call-graph",
            (textEditor: TextEditor, _edit: TextEditorEdit) => {
                this.callGraphProvider.showWebview(textEditor.document.uri, {
                    title: "Call Graph: " + path.basename(textEditor.document.fileName),
                });
            }),
        );

        // Sentence generation.
        const sentenceOutputChannel = window.createOutputChannel("ANTLR4 Sentence Generation");
        context.subscriptions.push(commands.registerTextEditorCommand("antlr.tools.generateSentences",
            (textEditor: TextEditor, _edit: TextEditorEdit) => {
                const grammarFileName = textEditor.document.uri.fsPath;
                const configFileName = grammarFileName.replace(path.extname(grammarFileName), ".json");

                // Try to load generation configuration from a side json file.
                let config: ISentenceGenerationOptions = {};
                if (fs.existsSync(configFileName)) {
                    const content = fs.readFileSync(configFileName, "utf-8");
                    try {
                        config = JSON.parse(content) as ISentenceGenerationOptions;
                    } catch (reason) {
                        Log.error(["Cannot parse sentence generation config file:", reason]);

                        return;
                    }
                }

                if (typeof config.actionFile === "string" && config.actionFile.length > 0) {
                    if (!path.isAbsolute(config.actionFile)) {
                        config.actionFile = path.join(path.dirname(grammarFileName), config.actionFile);
                    }
                }

                const caret = textEditor.selection.active;
                const [ruleName] = this.backend.ruleFromPosition(grammarFileName, caret.character, caret.line + 1);

                if (!ruleName) {
                    Log.error(["ANTLR4 sentence generation: no rule selected"]);

                    return;
                }

                if (config.clear) {
                    sentenceOutputChannel.clear();
                }

                this.backend.generateSentence(grammarFileName, ruleName, config, (sentence: string, index: number) => {
                    sentenceOutputChannel.appendLine(`${index}) ${sentence}`);
                    sentenceOutputChannel.show(true);
                });
            }),
        );

        // Debugging support.
        context.subscriptions.push(debug.registerDebugConfigurationProvider("antlr-debug",
            new AntlrDebugConfigurationProvider(this.backend, this.parseTreeProvider)));

        // Helper commands.
        context.subscriptions.push(commands.registerCommand("antlr.openGrammar", (grammar: string) => {
            void workspace.openTextDocument(grammar).then((document) => {
                return window.showTextDocument(document, ViewColumn.Active, false);
            });
        }));

        context.subscriptions.push(commands.registerCommand("antlr.selectGrammarRange", (range: ILexicalRange) => {
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
    }

    private registerEventHandlers(context: ExtensionContext): void {
        context.subscriptions.push(workspace.onDidOpenTextDocument((document: TextDocument) => {
            if (FrontendUtils.isGrammarFile(document)) {
                this.backend.loadGrammar(document.fileName);
                this.regenerateBackgroundData(document);
            }
        }));

        context.subscriptions.push(workspace.onDidCloseTextDocument((document: TextDocument) => {
            if (FrontendUtils.isGrammarFile(document)) {
                this.backend.releaseGrammar(document.fileName);
                this.diagnosticCollection.set(document.uri, []);
            }
        }));

        context.subscriptions.push(workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
            if (event.contentChanges.length > 0 && FrontendUtils.isGrammarFile(event.document)) {

                const fileName = event.document.fileName;
                this.backend.setText(fileName, event.document.getText());

                const timer = this.changeTimers.get(fileName);
                if (timer) {
                    clearTimeout(timer);
                }

                this.changeTimers.set(fileName, setTimeout(() => {
                    this.changeTimers.delete(fileName);
                    this.backend.reparse(fileName);

                    this.diagramProvider.update(window.activeTextEditor!);
                    this.callGraphProvider.update(window.activeTextEditor!);
                    this.processDiagnostic(event.document);
                    this.codeLensProvider.refresh();
                }, 300));
            }
        }));

        context.subscriptions.push(workspace.onDidSaveTextDocument((document: TextDocument) => {
            if (FrontendUtils.isGrammarFile(document)) {
                const timer = this.changeTimers.get(document.fileName);
                if (timer) {
                    clearTimeout(timer);
                }

                this.regenerateBackgroundData(document);
            }
        }));

        context.subscriptions.push(window.onDidChangeTextEditorSelection((event: TextEditorSelectionChangeEvent) => {
            if (FrontendUtils.isGrammarFile(event.textEditor.document)) {
                this.diagramProvider.update(event.textEditor);
                this.atnGraphProvider.update(event.textEditor, false);
                this.actionsProvider.update(event.textEditor);
            }
        }));

        context.subscriptions.push(window.onDidChangeActiveTextEditor((textEditor: TextEditor | undefined) => {
            if (textEditor) {
                FrontendUtils.updateVsCodeContext(this.backend, textEditor.document);
                this.updateTreeProviders(textEditor.document);
            }
        }));

        context.subscriptions.push(workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
            if (event.affectsConfiguration("antlr4")) {
                const level = workspace.getConfiguration("antlr4").get<LogLevel>("log") ?? "none";
                Log.updateLogLevel(level);
            }
        }));
    }

    /**
     * Convert diagnostic information for the given file to show in vscode.
     *
     * @param document The document for which this should happen.
     */
    private processDiagnostic = (document: TextDocument) => {
        const diagnostics = [];
        const entries = this.backend.getDiagnostics(document.fileName);
        for (const entry of entries) {
            const startRow = entry.range.start.row === 0 ? 0 : entry.range.start.row - 1;
            const endRow = entry.range.end.row === 0 ? 0 : entry.range.end.row - 1;
            const range = new Range(startRow, entry.range.start.column, endRow, entry.range.end.column);
            const diagnostic = new Diagnostic(range, entry.message, ExtensionHost.diagnosticTypeMap.get(entry.type));
            diagnostics.push(diagnostic);
        }
        this.diagnosticCollection.set(document.uri, diagnostics);
    };

    /**
     * For certain services we have to (re)generate files from grammars in the background:
     * - syntactic + semantic grammar analysis by the ANTLR tool
     * - generate interpreter data (for debugging + web views)
     *
     * @param document For which to generate the data.
     */
    private regenerateBackgroundData(document: TextDocument): void {
        if (workspace.getConfiguration("antlr4.generation").mode === "none") {
            return;
        }

        const externalMode = workspace.getConfiguration("antlr4.generation").mode === "external";

        this.progress.startAnimation();
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
            this.progress.stopAnimation();
            void window.showErrorMessage("Cannot create output folder: " + (error as string));

            return;
        }

        const options: IGenerationOptions = {
            baseDir: basePath,
            libDir: this.importDir,
            outputDir,
            listeners: false,
            visitors: false,
            javaHomeOverride: workspace.getConfiguration("antlr4.generation").get<string>("javaHomeOverride"),
            alternativeJar: workspace.getConfiguration("antlr4.generation").get<string>("alternativeJar"),
            additionalParameters: workspace.getConfiguration("antlr4.generation")
                .get<string | string[]>("additionalParameters"),
            language: workspace.getConfiguration("antlr4.generation").get<string>("language"),
            package: workspace.getConfiguration("antlr4.generation").get<string>("package"),
        };

        if (externalMode) {
            options.listeners = workspace.getConfiguration("antlr4.generation").get<boolean>("listeners");
            options.visitors = workspace.getConfiguration("antlr4.generation").get<boolean>("visitors");
        }

        const result = this.backend.generate(document.fileName, options);
        result.then((affectedFiles: string[]) => {
            for (const file of affectedFiles) {
                const fullPath = path.resolve(basePath, file);
                workspace.textDocuments.forEach((textDocument) => {
                    if (textDocument.fileName === fullPath) {
                        this.processDiagnostic(textDocument);
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
                    this.progress.stopAnimation();
                    Log.error([reason]);
                }
            }

            this.backend.generate(document.fileName, { outputDir: antlrPath, loadOnly: true }).then(() => {
                if (window.activeTextEditor?.document.fileName === document.fileName) {
                    this.atnGraphProvider.update(window.activeTextEditor, true);
                }
                this.updateTreeProviders(document);

                this.progress.stopAnimation();
            }).catch((reason) => {
                this.progress.stopAnimation();
                Log.error([reason]);
            });

        }).catch((reason) => {
            this.progress.stopAnimation();
            Log.error([reason]);
        });
    }

    /**
     * Updates all used tree providers for the given document.
     *
     * @param document The source for the updates.
     */
    private updateTreeProviders(document: TextDocument | undefined): void {
        this.lexerSymbolsProvider.refresh(document);
        this.parserSymbolsProvider.refresh(document);
        this.importsProvider.refresh(document);
        this.channelsProvider.refresh(document);
        this.modesProvider.refresh(document);
        this.actionsProvider.refresh(document);
    }
}
