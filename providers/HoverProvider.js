'use strict';

var vscode = require('vscode');
var path = require("path");

var AntlrHoverProvider = (function () {
    var backend;

    function AntlrHoverProvider(support) {
        backend = support;
    }

    AntlrHoverProvider.prototype.provideHover = function (document, position, token) {
        var info = backend.infoForSymbol(document.fileName, position);

        return new Promise(function (resolve, reject) {
            if (info.kind == "")
              resolve();
            else {
                resolve(new vscode.Hover([
                    "**" + info.kind + "**\n`defined in: " + info.source + "`",
                    { language: "antlr", value: info.text }
                ]));
            }
        });
    };
    return AntlrHoverProvider;
})();
exports.default = AntlrHoverProvider;
