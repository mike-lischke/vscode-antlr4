'use strict';

var vscode = require('vscode');

var graps = require("/Volumes/Extern/Work/projects/antlr4-graps");
var backend = new graps.AntlrLanguageSupport();

var hoverProvider = require('./providers/HoverProvider');

var ANTLR = { language: 'antlr', scheme: 'file' };

function activate(context) {
    context.subscriptions.push(vscode.languages.registerHoverProvider(ANTLR, new hoverProvider.default(backend)));
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;

vscode.workspace.onDidOpenTextDocument(function (doc) {
    if (doc && doc.languageId === "antlr") {
        backend.loadGrammar(doc.fileName);
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
    }, 500);
});
