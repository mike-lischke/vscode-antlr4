/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2017 Mike Lischke
 *
 * See LICENSE file for more info.
 */

'use strict';

let currentScale = 1;

function zoom(factor) {
	let container = document.getElementById("container");
	currentScale *= factor;
	container.style.transform = "scale(" + currentScale + ", " + currentScale + ")";
}

function resetZoom() {
	let container = document.getElementById("container");
	currentScale = 1;
	container.style.transform = "scale(" + currentScale + ", " + currentScale + ")";
}

function save() {
	// Doesn't save actually, but sends a command to our vscode extension.
	// Only very view HTML messages are handled in the vscode weblclient (and forwarded to registered listeners).
	// We choose "did-click-link" (like the markdown preview extension does).

	// The resulting HTML code contains both the RRD source scripts and the generated SVGs. If we would export both
	// all diagrams would be rendered twice, because the RRD js module would again be called.
	// Hence we remove all the source scripts before getting the HTML code.
	[].forEach.call(document.querySelectorAll('.rrdSource'), function (e) {
		e.parentNode.removeChild(e);
	});
	let html = document.getElementsByTagName("html")[0];
	const args = [html.outerHTML];
	window.parent.postMessage({
		command: "did-click-link",
		data: `command:_rrdPreview.saveDiagram?${encodeURIComponent(JSON.stringify(args))}`
	}, "file://");

}

(function () {
	// Used to send messages from the extension to this previewHTML webview.
	window.addEventListener('message', function (event) {
		switch (event.data) {
		}
	});

}());
