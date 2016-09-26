'use strict';

let vscode = require('vscode');
let path = require("path");
let symbolHelper = require("../src/Symbol");

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

                var description = symbolHelper.symbolDescriptionFromEnum(backend, symbol.kind);
                const kind = symbolHelper.translateSymbolKind(backend, symbol.kind);
                let totalTextLength = symbol.name.length + description.length + 1;
                if (symbol.kind == backend.SymbolKind.LexerMode && totalTextLength < 80) {
                    // Add a marker to show parts which belong to a particular lexer mode.
                    // Not 100% perfect (i.e. right aligned, as symbol and description use different fonts), but good enough.
                    var markerWidth = 80 - totalTextLength;
                    description += " " + "-".repeat(markerWidth);
                }
                let info = new vscode.SymbolInformation(symbol.name, kind, description, location);
                symbolsList.push(info);
            }
            resolve(symbolsList);
        });
    };
    return AntlrSymbolProvider;
})();
exports.default = AntlrSymbolProvider;
