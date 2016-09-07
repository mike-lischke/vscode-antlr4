'use strict';

var vscode = require('vscode');
var hoverProvider = require('./providers/HoverProvider');

var ANTLR = { language: 'antlr', scheme: 'file' };

function activate(context) {
    context.subscriptions.push(vscode.languages.registerHoverProvider(ANTLR, new hoverProvider.AntlrHoverProvider(context)));
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;

vscode.workspace.onDidOpenTextDocument(function (doc) {
    if (doc && doc.languageId === "antlr") {
        console.log("Activated ANTLR grammar");
    }
});

vscode.window.onDidChangeActiveTextEditor(function () {
        console.log("Switched editor");
});
