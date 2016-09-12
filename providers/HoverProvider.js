'use strict';
var vscode = require('vscode');

var AntlrHoverProvider = (function () {
    var backend;
    function AntlrHoverProvider(support) {
        backend = support;
    }

    AntlrHoverProvider.prototype.provideHover = function (document, position, token) {
        var info = backend.infoForSymbol(document.fileName, document.getText(), position);

        return new Promise(function (resolve, reject) {
            if (info == "")
              resolve();
            else
            resolve(new vscode.Hover({ language: "antlr", value: info }));
        });
    };
    return AntlrHoverProvider;
})();
exports.default = AntlrHoverProvider;
