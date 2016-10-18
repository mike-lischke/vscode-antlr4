'use strict';

let vscode = require('vscode');

let graps = require("antlr4-graps");
let backend = new graps.AntlrLanguageSupport();

let hoverProvider = require('./providers/HoverProvider');
let definitionProvider = require('./providers/DefinitionProvider');
let symbolProvider = require('./providers/SymbolProvider');

let ANTLR = { language: 'antlr', scheme: 'file' };

let diagnosticCollection = vscode.languages.createDiagnosticCollection('antlr');

var DiagnosticTypeMap = new Map();

function activate(context) {
    DiagnosticTypeMap[backend.DiagnosticType.Hint] = vscode.DiagnosticSeverity.Hint;
    DiagnosticTypeMap[backend.DiagnosticType.Info] = vscode.DiagnosticSeverity.Information;
    DiagnosticTypeMap[backend.DiagnosticType.Warning] = vscode.DiagnosticSeverity.Warning;
    DiagnosticTypeMap[backend.DiagnosticType.Error] = vscode.DiagnosticSeverity.Error;

    context.subscriptions.push(vscode.languages.registerHoverProvider(ANTLR, new hoverProvider.default(backend)));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(ANTLR, new definitionProvider.default(backend)));
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(ANTLR, new symbolProvider.default(backend)));
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;

function processDiagnostic(document) {
    var diagnostics = [];
    let entries = backend.getDiagnostics(document.fileName);
    for (let entry of entries) {
        let range = new vscode.Range(entry.position.line - 1, entry.position.character,
            entry.position.line - 1, entry.position.character + entry.length);

        var diagnostic = new vscode.Diagnostic(range, entry.message, DiagnosticTypeMap[entry.type]);
        //diagnostic.source = "ANTLR semantic check";
        diagnostics.push(diagnostic);
    }
    diagnosticCollection.set(document.uri, diagnostics);
}

vscode.workspace.onDidOpenTextDocument(function (doc) {
    if (doc && doc.languageId === "antlr") {
        backend.loadGrammar(doc.fileName);
        processDiagnostic(doc);
    }
});

vscode.workspace.onDidCloseTextDocument(function (doc) {
    if (doc && doc.languageId === "antlr") {
        backend.releaseGrammar(doc.fileName);
    }
});

var changeTimeout;

vscode.workspace.onDidChangeTextDocument(function (event) {
    if (changeTimeout != null)
        clearTimeout(changeTimeout);
    changeTimeout = setInterval(function () {
        clearTimeout(changeTimeout);
        changeTimeout = null;
        backend.reparse(event.document.fileName, event.document.getText());
        processDiagnostic(event.document);
    }, 500);
});
