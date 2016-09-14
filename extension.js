'use strict';

let vscode = require('vscode');

let graps = require("/Volumes/Extern/Work/projects/antlr4-graps");
let backend = new graps.AntlrLanguageSupport();

let hoverProvider = require('./providers/HoverProvider');
let definitionProvider = require('./providers/DefinitionProvider');
let symbolProvider = require('./providers/SymbolProvider');

let ANTLR = { language: 'antlr', scheme: 'file' };

let diagnosticCollection = vscode.languages.createDiagnosticCollection('antlr');

function activate(context) {
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
    let errors = backend.getErrors(document.fileName);
    for (let error of errors) {
        let range = new vscode.Range(error.position.line - 1, error.position.character,
            error.position.line - 1, error.position.character + error.length);
        diagnostics.push(new vscode.Diagnostic(range, error.message, vscode.DiagnosticSeverity.Error));
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
