'use strict';

let vscode = require('vscode');
let path = require("path");

var AntlrDefinitionProvider = (function () {
    var backend;

    function AntlrDefinitionProvider(support) {
        backend = support;
    }

    AntlrDefinitionProvider.prototype.provideDefinition = function (document, position, token) {
        var info = backend.infoForSymbol(document.fileName, { line: position.line + 1, character: position.character });

        return new Promise(function (resolve, reject) {
            if (info.text == "")
              resolve();
            else {
                let basePath = path.dirname(document.fileName);
                // VS code shows the text for the range given here on holding ctrl/cmd, which is rather
                // useless given that we show this info already in the hover provider. So, in order
                // to limit the amount of text we only pass on the smallest range which is possible.
                // Yet we need the correct start position to not break the goto-definition feature.
                let range = new vscode.Range(info.start.line - 1, info.start.character,
                    info.start.line - 1, info.start.character + 1);
                resolve(new vscode.Location(vscode.Uri.file(basePath + "/" + info.source), range));
            }
        });
    };
    return AntlrDefinitionProvider;
})();
exports.default = AntlrDefinitionProvider;
