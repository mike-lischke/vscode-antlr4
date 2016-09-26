'use strict';

const vscode = require('vscode');
const path = require("path");
const symbol = require("../src/Symbol");

var AntlrHoverProvider = (function () {
    var backend;

    function AntlrHoverProvider(support) {
        backend = support;
    }

    AntlrHoverProvider.prototype.provideHover = function (document, position, token) {
        var info = backend.infoForSymbol(document.fileName, { line: position.line + 1, character: position.character });

        return new Promise(function (resolve, reject) {
            if (info.source == "")
              resolve();
            else {
                const description = symbol.symbolDescriptionFromEnum(backend, info.kind);
                resolve(new vscode.Hover([
                    "**" + description + "**\n`defined in: " + info.source + "`",
                    { language: "antlr", value: info.text }
                ]));
            }
        });
    };
    return AntlrHoverProvider;
})();
exports.default = AntlrHoverProvider;
