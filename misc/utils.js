/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict";

function showMessage(message) {
	const args = { message: message };
	window.parent.postMessage({
		command: "did-click-link",
		data: `command:_antlr.showMessage?${encodeURIComponent(JSON.stringify(args))}`
	}, "file://");
}

function exportToSVG(type, name) {
	// Doesn't save actually, but sends a command to our vscode extension.
	// Only very few HTML messages are handled in the vscode webclient (and forwarded to registered listeners).
	// We choose "did-click-link" (like the markdown preview extension does).
	const svg = document.querySelectorAll('svg')[0];
	const args = {
        name: name,
        type: type,
        svg: svg.outerHTML
    };

	window.parent.postMessage({
		command: "did-click-link",
		data: `command:_antlr.saveSVG?${encodeURIComponent(JSON.stringify(args))}`
	}, "file://");
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
		const args = { name: name, type: type, html: html.outerHTML };

		window.parent.postMessage({
			command: "did-click-link",
			data: `command:_antlr.saveHTML?${encodeURIComponent(JSON.stringify(args))}`
		}, "file://");
	} catch (error) {
		showMessage("JS Error: " + e);
	}
}

(function () {

	// Used to send messages from the extension to this webview.
	window.addEventListener('message', function (event) {
		switch (event.data.action) {
			case "saveATNState":
				const args = {
                    nodes: nodes,
                    file: event.data.file,
                    rule: event.data.rule,
                    transform: topGroup.attr("transform")
                };
				window.parent.postMessage({
					command: "did-click-link",
					data: `command:_antlr.saveATNState?${encodeURIComponent(JSON.stringify(args))}`
				}, "file://");
				break;
		}
	});
}());
