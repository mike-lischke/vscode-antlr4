'use strict';
var vscode = require('vscode');
var graps = require("antlr4-graps");

var AntlrHoverProvider = (function () {
    function AntlrHoverProvider(context) {
    }
    AntlrHoverProvider.prototype.provideHover = function (document, position, token) {
        var args = {
            //file: this.client.asAbsolutePath(document.uri),
            line: position.line + 1,
            offset: position.character + 1
        };

        return new Promise(function (resolve, reject) {
            resolve(new vscode.Hover({ language: "antlr", value: "query: a | b = c;" }));
        });
    };
    return AntlrHoverProvider;
})();
exports.AntlrHoverProvider = AntlrHoverProvider;
