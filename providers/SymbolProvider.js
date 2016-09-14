'use strict';

let vscode = require('vscode');
let path = require("path");

var AntlrSymbolProvider = (function () {
    var backend;

    function AntlrSymbolProvider(support) {
        backend = support;
    }

    AntlrSymbolProvider.prototype.provideDocumentSymbols = function (document, token) {
        var symbols = backend.listSymbols(document.fileName);

        return new Promise(function (resolve, reject) {
            let basePath = path.dirname(document.fileName);
            var symbolsList = [];
            for (let symbol of symbols) {
                let range = new vscode.Range(symbol.start.line - 1, symbol.start.character, symbol.stop.line - 1, symbol.stop.character + 1);
                let location = new vscode.Location(vscode.Uri.file(basePath + "/" + symbol.source), range);
                let info = new vscode.SymbolInformation(symbol.name, vscode.SymbolKind.Function, "", location);
                symbolsList.push(info);
            }
            resolve(symbolsList);
        });
    };
    return AntlrSymbolProvider;
})();
exports.default = AntlrSymbolProvider;
