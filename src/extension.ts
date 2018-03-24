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
    commands, Uri, window, TextEditorSelectionChangeEvent, TextEditorEdit, TextEditor, StatusBarAlignment, OutputChannel,
    debug, DebugConfigurationProvider, WorkspaceFolder, DebugConfiguration, CancellationToken, ProviderResult
} from 'vscode';

import { getTextProviderUri } from "./frontend/TextContentProvider";

import { HoverProvider } from './frontend/HoverProvider';
import { DefinitionProvider } from './frontend//DefinitionProvider';
import { SymbolProvider } from './frontend/SymbolProvider';
import { AntlrCodeLensProvider } from './frontend/CodeLensProvider';
import { AntlrCompletionItemProvider } from './frontend/CompletionItemProvider';
import { AntlrRailroadDiagramProvider } from './frontend/RailroadDiagramProvider';
import { AntlrATNGraphProvider, ATNStateEntry } from "./frontend/ATNGraphProvider";
import { AntlrFormattingProvider } from "./frontend/FormattingProvider";
import { ImportsProvider } from "./frontend/ImportsProvider";
import { AntlrCallGraphProvider } from "./frontend/CallGraphProvider";
import { LexerSymbolsProvider } from "./frontend/LexerSymbolsProvider";
import { ParserSymbolsProvider } from "./frontend/ParserSymbolsProvider";
import { ChannelsProvider } from "./frontend/ChannelsProvider";
import { ModesProvider } from "./frontend/ModesProvider";
import { AntlrParseTreeProvider } from "./frontend/ParseTreeProvider";
import { RenameProvider } from "./frontend/RenameProvider";

import { ProgressIndicator } from "./frontend/ProgressIndicator";
import { Utils } from "./frontend/Utils";
import { AntlrDebugSession } from "./frontend/AntlrDebugAdapter";
import { DiagnosticType, AntlrFacade, GenerationOptions } from "./backend/facade";

const ANTLR = { language: 'antlr', scheme: 'file' };

let diagnosticCollection = languages.createDiagnosticCollection('antlr');
let DiagnosticTypeMap: Map<DiagnosticType, DiagnosticSeverity> = new Map();

// All ATN state entries per file, per rule.
let atnStates: Map<string, Map<string, ATNStateEntry>> = new Map();

let backend: AntlrFacade;
let progress: ProgressIndicator;
let outputChannel: OutputChannel;

let importsProvider: ImportsProvider;
let lexerSymbolsProvider: LexerSymbolsProvider;
let parserSymbolsProvider: ParserSymbolsProvider;
let channelsProvider: ChannelsProvider;
let modesProvider: ModesProvider;
let parseTreeProvider: AntlrParseTreeProvider;

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

            let hash = Utils.hashFromPath(document.fileName);
            let atnCacheFile = path.join(antlrPath, "cache", hash + ".atn");
            if (fs.existsSync(atnCacheFile)) {
                let data = fs.readFileSync(atnCacheFile, { encoding: "utf-8" });
                let fileEntry = new Map(JSON.parse(data));
                atnStates.set(hash, <Map<string, ATNStateEntry>>fileEntry);
            }
        }
    }

    context.subscriptions.push(languages.registerHoverProvider(ANTLR, new HoverProvider(backend)));
    context.subscriptions.push(languages.registerDefinitionProvider(ANTLR, new DefinitionProvider(backend)));
    context.subscriptions.push(languages.registerDocumentSymbolProvider(ANTLR, new SymbolProvider(backend)));
    context.subscriptions.push(languages.registerCodeLensProvider(ANTLR, new AntlrCodeLensProvider(backend)));
    context.subscriptions.push(languages.registerCompletionItemProvider(ANTLR, new AntlrCompletionItemProvider(backend),
        " ", ":", "@", "<", "{", "["));
    context.subscriptions.push(languages.registerDocumentRangeFormattingEditProvider(ANTLR, new AntlrFormattingProvider(backend)));
    context.subscriptions.push(languages.registerRenameProvider(ANTLR, new RenameProvider(backend)));

    let diagramProvider = new AntlrRailroadDiagramProvider(backend, context);
    context.subscriptions.push(workspace.registerTextDocumentContentProvider("antlr.rrd", diagramProvider));

    // The single RRD diagram command.
    context.subscriptions.push(commands.registerTextEditorCommand('antlr.rrd.singleRule', (editor: TextEditor, edit: TextEditorEdit) => {
        return commands.executeCommand('vscode.previewHtml', getTextProviderUri(editor.document.uri, "rrd", "single"), 2,
            "ANTLR RRD: " + path.basename(editor.document.fileName)).then((success: boolean) => {
            }, (reason) => {
                window.showErrorMessage(reason);
            });
    }));

    // The full RRD diagram command.
    context.subscriptions.push(commands.registerTextEditorCommand('antlr.rrd.allRules', (editor: TextEditor, edit: TextEditorEdit) => {
        return commands.executeCommand('vscode.previewHtml', getTextProviderUri(editor.document.uri, "rrd", "full"), 2,
            "ANTLR RRD: " + path.basename(editor.document.fileName)).then((success: boolean) => {
            }, (reason) => {
                window.showErrorMessage(reason);
            });
    }));

    // The ATN graph command.
    let atnGraphProvider = new AntlrATNGraphProvider(backend, context);
    context.subscriptions.push(workspace.registerTextDocumentContentProvider("antlr.atn", atnGraphProvider));

    context.subscriptions.push(commands.registerTextEditorCommand("antlr.atn.singleRule", (editor: TextEditor, edit: TextEditorEdit) => {
        return commands.executeCommand('vscode.previewHtml', getTextProviderUri(editor.document.uri, "atn", "single"), 2,
            "ANTLR ATN Graph: " + path.basename(editor.document.fileName)).then((success: boolean) => {
            }, (reason) => {
                window.showErrorMessage(reason);
            });
    }));

    // The call graph command.
    let callGraphProvider = new AntlrCallGraphProvider(backend, context);
    context.subscriptions.push(workspace.registerTextDocumentContentProvider("antlr.call-graph", callGraphProvider));
    context.subscriptions.push(commands.registerTextEditorCommand('antlr.call-graph', (editor: TextEditor, edit: TextEditorEdit) => {
        return commands.executeCommand('vscode.previewHtml', getTextProviderUri(editor.document.uri, "call-graph", ""), 2,
            "Call Graph: " + path.basename(editor.document.fileName)).then((success: boolean) => {
            }, (reason) => {
                window.showErrorMessage(reason);
            });
    }));

    // Sentence generation.
    // This is currently not enabled in the UI. This generation can too easily go endless if the grammar is highly recursive.
    // Need to get an idea how to make this really usable.
    context.subscriptions.push(commands.registerTextEditorCommand("antlr.tools.generateSentences", (editor: TextEditor, edit: TextEditorEdit) => {
        return workspace.openTextDocument(editor.document.uri).then(doc => window.showTextDocument(doc, editor.viewColumn! + 1));
    }));

    // Debugging support.
    context.subscriptions.push(commands.registerCommand("antlr.getTestInputName", config => {
        return window.showInputBox({
            placeHolder: "Please enter the name of a text file containing parse test input",
            value: "input.txt"
        });
    }));

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

    parseTreeProvider = new AntlrParseTreeProvider(backend, context);
    context.subscriptions.push(workspace.registerTextDocumentContentProvider("antlr.parse-tree", parseTreeProvider));

    // Helper commands.
    context.subscriptions.push(commands.registerCommand("antlr.openGrammar", (grammar: string) => {
        workspace.openTextDocument(grammar).then((document) => {
            window.showTextDocument(document, 0, false);
        });
    }));

    // Used for debugging in JS files (console.log doesn't have any effect).
    context.subscriptions.push(commands.registerCommand("_antlr.showMessage", (args: { message: string }) => {
        window.showInformationMessage(args.message, { modal: true });
    }));

    // The export to SVG command.
    context.subscriptions.push(commands.registerCommand("_antlr.saveSVG", (args: { name: string, type: string, svg: string }) => {
        let css: string[] = [];
        css.push(Utils.getMiscPath("light.css", context, false));
        let customStyles = workspace.getConfiguration("antlr4")['customcss'];
        if (customStyles && Array.isArray(customStyles)) {
            for (let style of customStyles) {
                css.push(style);
            }
        }

        let svg = '<?xml version="1.0" standalone="no"?>\n'
        for (let stylesheet of css) {
            svg += `<?xml-stylesheet href="${path.basename(stylesheet)}" type="text/css"?>\n`;
        }

        svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
            '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' + args.svg;

        try {
            Utils.exportDataWithConfirmation(path.join(workspace.getConfiguration("antlr4." + args.type)["saveDir"] || "",
                args.name + "." + args.type), { "SVG": ["svg"] }, svg, css);
        } catch (error) {
            window.showErrorMessage("Couldn't write SVG file: " + error);
        }
    }));

    // The export to html command.
    context.subscriptions.push(commands.registerCommand("_antlr.saveHTML", (args: { name: string, type: string, html: string }) => {
        let css: string[] = [];
        css.push(Utils.getMiscPath("light.css", context, false));
        css.push(Utils.getMiscPath("dark.css", context, false));
        let customStyles = workspace.getConfiguration("antlr4")['customcss'];
        if (customStyles && Array.isArray(customStyles)) {
            for (let style of customStyles) {
                css.push(style);
            }
        }
        try {
            Utils.exportDataWithConfirmation(path.join(workspace.getConfiguration("antlr4." + args.type)["saveDir"] || "",
                args.name + "." + args.type), { "HTML": ["html"] }, args.html, css);
        } catch (error) {
            window.showErrorMessage("Couldn't write HTML file: " + error);
        }
    }));

    // The "save ATN state" notification.
    context.subscriptions.push(commands.registerCommand('_antlr.saveATNState',
        (args: { nodes: any, file: string, rule: string, transform: string }) => {

            let hash = Utils.hashFromPath(args.file);
            let basePath = path.dirname(args.file);
            let atnCachePath = path.join(basePath, ".antlr/cache");

            let fileEntry = atnStates.get(hash);
            if (!fileEntry) {
                fileEntry = new Map();
            }

            let scale = 1;
            let translateX = 0;
            let translateY = 0;
            let temp = args.transform.split(/[(), ]/);
            for (let i = 0; i < temp.length; ++i) {
                if (temp[i] === "translate") {
                    translateX = Number(temp[++i]);
                    translateY = Number(temp[++i]);
                } else if (temp[i] === "scale") {
                    scale = Number(temp[++i]);
                }
            }

            // Convert the given translation back to what it was before applying the scaling, as that is what we need
            // to specify when we restore the translation.
            let ruleEntry: ATNStateEntry = { scale: scale, translation: { x: translateX / scale, y: translateY / scale }, states: [] };
            for (let node of args.nodes) {
                ruleEntry.states.push({ id: node.id, fx: node.fx, fy: node.fy });
            }
            fileEntry.set(args.rule, ruleEntry);
            atnStates.set(hash, fileEntry);

            fs.ensureDirSync(atnCachePath);
            try {
                fs.writeFileSync(path.join(atnCachePath, hash + ".atn"), JSON.stringify(Array.from(fileEntry)), { encoding: "utf-8" });
            } catch (error) {
                window.showErrorMessage("Couldn't write ATN state data for: " + args.file + "(" + hash + ")");
            }
        }
    ));

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
                diagramProvider.update(getTextProviderUri(event.document.uri, "rrd", "single"));
                importsProvider.refresh();
                callGraphProvider.update(getTextProviderUri(event.document.uri, "call-graph", ""));
                processDiagnostic(event.document);
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
            diagramProvider.update(getTextProviderUri(event.textEditor.document.uri, "rrd", "single"));

            let hash = Utils.hashFromPath(event.textEditor.document.uri.fsPath);
            atnGraphProvider.update(getTextProviderUri(event.textEditor.document.uri, "atn", "single"), false, atnStates.get(hash));
        }
    });

    window.onDidChangeActiveTextEditor((editor: TextEditor) => {
        importsProvider.refresh();
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
            visitors: false
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
                            let targetFile = path.join(antlrPath, file);
                            fs.copySync(path.join(outputDir, file), targetFile, { overwrite: true });
                            fs.removeSync(targetFile);
                        }
                    }
                } catch (error) {
                    window.showErrorMessage("Error while transfering interpreter data: " + error);
                }
            }

            backend.generate(document.fileName, { outputDir: antlrPath, loadOnly: true }).then(() => {

                let hash = Utils.hashFromPath(document.uri.fsPath);
                atnGraphProvider.update(getTextProviderUri(document.uri, "atn", "single"), true, atnStates.get(hash));

                progress.stopAnimation();
            });

        }).catch(error => {
            progress.stopAnimation();
            outputChannel.appendLine(error);
            outputChannel.show(true);
        });
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

        // launch.json missing or empty?
        if (!config.type || !config.request || !config.name) {
            return window.showErrorMessage("Create a launch configuration for debugging of ANTLR grammars first.").then(_ => {
                return undefined;
            });
        }

        if (!config.input) {
            return window.showErrorMessage("No test input file specified").then(_ => {
                return undefined;
            });
        } else {
            if (!path.isAbsolute(config.input) && folder) {
                config.input = path.join(folder.uri.fsPath, config.input);
            }
            if (!fs.existsSync(config.input)) {
                return window.showErrorMessage("Cannot read test input file: " + config.input).then(_ => {
                    return undefined;
                });
            }
        }

        if (!config.grammar) {
            const editor = window.activeTextEditor;
            if (editor && editor.document.languageId === 'antlr') {
                let diagnostics = diagnosticCollection.get(editor!.document.uri);
                if (diagnostics && diagnostics.length > 0) {
                    return window.showErrorMessage("Cannot lauch grammar debugging. There are errors in the code.").then(_ => {
                        return undefined;
                    });
                }

                config.grammar = editor.document.fileName;
            } else {
                window.showInformationMessage("Then ANTLR debugger can only be started for ANTLR4 grammars.");
            }
        } else {
            if (!path.isAbsolute(config.grammar) && folder) {
                config.grammar = path.join(folder.uri.fsPath, config.grammar);
            }
            if (!fs.existsSync(config.grammar)) {
                return window.showErrorMessage("Cannot read grammar file: " + config.grammar).then(_ => {
                    return undefined;
                });
            }
        }

        if (!config.grammar) {
            return undefined;
        }

        if (!this.server) {
            this.server = Net.createServer(socket => {
                socket.on('end', () => {
                    //console.error('>> ANTLR debugging client connection closed\n');
                });

                const session = new AntlrDebugSession(folder!, backend, config.grammar, [
                    lexerSymbolsProvider,
                    parserSymbolsProvider,
                    channelsProvider,
                    modesProvider,
                    parseTreeProvider
                ]);
                session.setRunAsServer(true);
                session.start(<NodeJS.ReadableStream>socket, socket);
            }).listen(0);
        }

        config.debugServer = this.server.address().port;

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
