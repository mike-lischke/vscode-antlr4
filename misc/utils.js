/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict";

const vscode = acquireVsCodeApi();

function showMessage(message) {
	vscode.postMessage({ command: "alert", text: message });
}

function exportToSVG(type, name) {
	// Saving the SVG is delegated to the extension to allow asking the user for a target file.
	const svg = document.querySelectorAll('svg')[0];
	const args = {
        command: "saveSVG",
        name: name,
        type: type,
        svg: svg.outerHTML
    };

    vscode.postMessage(args);
}

function exportToHTML(type, name) {
	// When exporting the HTML content we have to remove our scripts (e.g. to avoid running image
	// generation again which happend already in vscode) and other internal elements.
	// Additionally we have to make all style sheet references relative.
	// That requires a deep copy of the entire DOM to avoid messing with the webview display.
	try {
		var workDocument = document.cloneNode(true);
		[].forEach.call(workDocument.querySelectorAll('script'), function (e) {
			e.parentNode.removeChild(e);
		});
		[].forEach.call(workDocument.querySelectorAll('.header'), function (e) {
			e.parentNode.removeChild(e);
		});
		[].forEach.call(workDocument.querySelectorAll('link'), function (e) {
			e.href = e.href.replace(/^.*[\\\/]/, '');
		});

		const html = workDocument.querySelectorAll('html')[0];
		const args = { command: "saveHTML", name: name, type: type, html: html.outerHTML };

		vscode.postMessage(args);
	} catch (error) {
		showMessage("JS Error: " + e);
	}
}

(function () {

	// Used to send messages from the extension to this webview.
	window.addEventListener('message', function (event) {
		switch (event.data.command) {
			case "cacheATNLayout": {
				const args = {
                    command: "saveATNState",
                    nodes: nodes,
                    file: event.data.file,
                    rule: event.data.rule,
                    transform: topGroup.attr("transform")
                };

                vscode.postMessage(args);
                break;
            }

            case "updateParseTreeData": {
                var x0 = root.x0;
                var y0 = root.y0;

                parseTreeData = event.data.treeData;
                root = d3.hierarchy(parseTreeData, d => d.children);
                root.x0 = x0;
                root.y0 = y0;

                update(root);
                break;
            }
		}
	});
}());
