/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

import * as path from "path";
import * as fs from "fs-extra";

import {
    workspace, languages, DiagnosticSeverity, ExtensionContext, Range, TextDocument, Diagnostic, TextDocumentChangeEvent,
    commands, Uri, window, TextEditorSelectionChangeEvent, TextEditorEdit, TextEditor, StatusBarAlignment, OutputChannel
} from 'vscode';

import { AntlrLanguageSupport, DiagnosticType, GenerationOptions } from "antlr4-graps";

import { HoverProvider } from './HoverProvider';
import { DefinitionProvider } from './DefinitionProvider';
import { SymbolProvider } from './SymbolProvider';
import { AntlrCodeLensProvider } from './CodeLensProvider';
import { AntlrCompletionItemProvider } from './CompletionItemProvider';
import { AntlrRailroadDiagramProvider } from './RailroadDiagramProvider';
import { AntlrATNGraphProvider, ATNStateEntry } from "./ATNGraphProvider";

import { Utils } from "./Utils";
import { getTextProviderUri } from "./TextContentProvider";
import { ProgressIndicator } from "./ProgressIndicator";

let ANTLR = { language: 'antlr', scheme: 'file' };

let diagnosticCollection = languages.createDiagnosticCollection('antlr');
let DiagnosticTypeMap: Map<DiagnosticType, DiagnosticSeverity> = new Map();

// All ATN state entries per file, per rule.
let atnStates: Map<string, Map<string, ATNStateEntry>> = new Map();

let backend: AntlrLanguageSupport;
let progress: ProgressIndicator;
let outputChannel: OutputChannel;

export function activate(context: ExtensionContext) {

    DiagnosticTypeMap.set(DiagnosticType.Hint, DiagnosticSeverity.Hint);
    DiagnosticTypeMap.set(DiagnosticType.Info, DiagnosticSeverity.Information);
    DiagnosticTypeMap.set(DiagnosticType.Warning, DiagnosticSeverity.Warning);
    DiagnosticTypeMap.set(DiagnosticType.Error, DiagnosticSeverity.Error);

    backend = new AntlrLanguageSupport(workspace.getConfiguration("antlr4.generation")["importDir"]);
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
    //context.subscriptions.push(languages.registerCompletionItemProvider(ANTLR, new AntlrCompletionItemProvider(backend), " "));

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

    // Used for debugging in JS files (console.log doesn't have any effect).
    context.subscriptions.push(commands.registerCommand("_antlr.showMessage", (args: { message: string }) => {
        window.showInformationMessage(args.message, { modal: true });
    }));

    // The export to svg command.
    context.subscriptions.push(commands.registerCommand("_antlr.saveSVG", (args: { name: string, type: string, svg: string }) => {
        let css: string[] = [];
        css.push(Utils.getMiscPath(args.type + ".css", context, false));
        let customStyles = workspace.getConfiguration("antlr4." + args.type)['customcss'];
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

        Utils.exportDataWithConfirmation(path.join(workspace.getConfiguration("antlr4." + args.type)["saveDir"], args.name + "." + args.type + ".svg"),
            ".svg", "Enter the name to an svg file.", svg, css);
    }));

    // The export to html command.
    context.subscriptions.push(commands.registerCommand("_antlr.saveHTML", (args: { name: string, type: string, html: string }) => {
        let css: string[] = [];
        css.push(Utils.getMiscPath(args.type + ".css", context, false));
        css.push(Utils.getMiscPath(args.type + "-dark.css", context, false));
        let customStyles = workspace.getConfiguration("antlr4." + args.type)['customcss'];
        if (customStyles && Array.isArray(customStyles)) {
            for (let style of customStyles) {
                css.push(style);
            }
        }
        Utils.exportDataWithConfirmation(path.join(workspace.getConfiguration("antlr4." + args.type)["saveDir"],
            args.name + "." + args.type + ".html"), ".html", "Enter the name to an svg file.", args.html, css);
    }));

    // The save ATN state notification.
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

    workspace.onDidOpenTextDocument((doc: TextDocument) => {
        if (doc.languageId == "antlr" && doc.uri.scheme === "file") {
            backend.loadGrammar(doc.fileName);
            regenerateBackgroundData(doc);
        }
    })

    workspace.onDidCloseTextDocument((document: TextDocument) => {
        if (document.languageId === "antlr" && document.uri.scheme === "file") {
            backend.releaseGrammar(document.fileName);
        }
    })

    let changeTimer: any;
    workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
        if (!window.activeTextEditor) {
            return;
        }

        if (event.document.languageId === "antlr" && event.document === window.activeTextEditor.document) {
            if (changeTimer) {
                clearTimeout(changeTimer);
            }
            changeTimer = setTimeout(() => {
                changeTimer = null;
                backend.reparse(event.document.fileName, event.document.getText());
                diagramProvider.update(getTextProviderUri(event.document.uri, "rrd", "single"));
                processDiagnostic(event.document);
            }, 300);
        }
    })

    workspace.onDidSaveTextDocument((document: TextDocument) => {
        if (document.languageId === "antlr" && document.uri.scheme === "file") {
            regenerateBackgroundData(document);
        }
    });

    window.onDidChangeTextEditorSelection((event: TextEditorSelectionChangeEvent) => {
        if (event.textEditor === window.activeTextEditor) {
            diagramProvider.update(getTextProviderUri(event.textEditor.document.uri, "rrd", "single"));

            let hash = Utils.hashFromPath(event.textEditor.document.uri.fsPath);
            atnGraphProvider.update(getTextProviderUri(event.textEditor.document.uri, "atn", "single"), false, atnStates.get(hash));
        }
    });

    workspace.onDidChangeConfiguration(() => {
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

            // Finally move interpreter files to our interal folder and reload that.
            if (externalMode) {
                try {
                    let files = fs.readdirSync(outputDir);
                    for (let file of files) {
                        if (file.endsWith(".interp")) {
                            let targetFile = path.join(antlrPath, file);
                            fs.copySync(path.join(outputDir, file), targetFile, { clobber: true });
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
            outputChannel.show();
        });
    }
} // activate() function

export function deactivate() {
}
