/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

import {
    workspace, languages, DiagnosticSeverity, ExtensionContext, Range, TextDocument, Diagnostic, TextDocumentChangeEvent,
    commands, Uri, window, TextEditorSelectionChangeEvent, TextEditorEdit, TextEditor
} from 'vscode';

import { AntlrLanguageSupport, DiagnosticType } from "antlr4-graps";
let backend = new AntlrLanguageSupport();

import { HoverProvider } from '../src/HoverProvider';
import { DefinitionProvider } from '../src/DefinitionProvider';
import { SymbolProvider } from '../src/SymbolProvider';
import { AntlrCodeLensProvider } from '../src/CodeLensProvider';
import { AntlrCompletionItemProvider } from '../src/CompletionItemProvider';
import { AntlrRailroadDiagramProvider, getRrdUri } from '../src/RailroadDiagramProvider';

import * as path from "path";
import * as fs from "fs";

let ANTLR = { language: 'antlr', scheme: 'file' };
let diagnosticCollection = languages.createDiagnosticCollection('antlr');

let DiagnosticTypeMap: Map<DiagnosticType, DiagnosticSeverity> = new Map();

export function activate(context: ExtensionContext) {

    DiagnosticTypeMap.set(DiagnosticType.Hint, DiagnosticSeverity.Hint);
    DiagnosticTypeMap.set(DiagnosticType.Info, DiagnosticSeverity.Information);
    DiagnosticTypeMap.set(DiagnosticType.Warning, DiagnosticSeverity.Warning);
    DiagnosticTypeMap.set(DiagnosticType.Error, DiagnosticSeverity.Error);

    context.subscriptions.push(languages.registerHoverProvider(ANTLR, new HoverProvider(backend)));
    context.subscriptions.push(languages.registerDefinitionProvider(ANTLR, new DefinitionProvider(backend)));
    context.subscriptions.push(languages.registerDocumentSymbolProvider(ANTLR, new SymbolProvider(backend)));
    context.subscriptions.push(languages.registerCodeLensProvider(ANTLR, new AntlrCodeLensProvider(backend)));
    //context.subscriptions.push(languages.registerCompletionItemProvider(ANTLR, new AntlrCompletionItemProvider(backend), " "));

    let diagramProvider = new AntlrRailroadDiagramProvider(backend, context);
    context.subscriptions.push(workspace.registerTextDocumentContentProvider("antlr.rrd", diagramProvider));

    context.subscriptions.push(commands.registerTextEditorCommand('antlr.rrd.singleRule', (editor: TextEditor, edit: TextEditorEdit) => {
        return commands.executeCommand('vscode.previewHtml', getRrdUri(editor.document.uri), 2,
            "ANTLR RRD: " + path.basename(editor.document.fileName)).then((success: boolean) => {
            }, (reason) => {
                window.showErrorMessage(reason);
            });
    }));

    context.subscriptions.push(commands.registerTextEditorCommand('antlr.rrd.allRules', (editor: TextEditor, edit: TextEditorEdit) => {
        commands.executeCommand('_workbench.htmlPreview.postMessage', getRrdUri(editor.document.uri), "getContent");
    }));

    context.subscriptions.push(commands.registerCommand('_rrdPreview.getScript', (text: string) => {
        //const sourceUri = Uri.parse(decodeURIComponent(uri));
        var stream = fs.createWriteStream("/tmp/test.html");
        stream.once('open', function (fd) {
            stream.write(text);
            stream.end();
        });
    }));

    workspace.onDidOpenTextDocument((doc: TextDocument) => {
        if (doc.languageId == "antlr") {
            backend.loadGrammar(doc.fileName);
            processDiagnostic(doc);
        }
    })

    workspace.onDidCloseTextDocument((doc: TextDocument) => {
        if (doc.languageId === "antlr") {
            backend.releaseGrammar(doc.fileName);
        }
    })

    let waiting = false;
    workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
        if (event.document.languageId === "antlr") {
            if (event.document === window.activeTextEditor.document) {
                diagramProvider.update(getRrdUri(event.document.uri));
            }
            if (!waiting) {
                waiting = true;
                setTimeout(() => {
                    waiting = false;
                    backend.reparse(event.document.fileName, event.document.getText());
                    processDiagnostic(event.document);
                }, 300);
            }
        }
    })

    window.onDidChangeTextEditorSelection((event: TextEditorSelectionChangeEvent) => {
        if (event.textEditor === window.activeTextEditor) {
            diagramProvider.update(getRrdUri(event.textEditor.document.uri));
        }
    })

    workspace.onDidChangeConfiguration(() => {
    })
}

export function deactivate() {
}

function processDiagnostic(document: TextDocument) {
    var diagnostics = [];
    let entries = backend.getDiagnostics(document.fileName);
    for (let entry of entries) {
        let range = new Range(entry.row - 1, entry.column, entry.row - 1, entry.column + entry.length);
        var diagnostic = new Diagnostic(range, entry.message, DiagnosticTypeMap.get(entry.type));
        //diagnostic.source = "ANTLR semantic check";
        diagnostics.push(diagnostic);
    }
    diagnosticCollection.set(document.uri, diagnostics);
}
