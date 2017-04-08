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

(function () {
	window.addEventListener('message', function (event) {
		switch (event.data) {
			case "getContent":
				let html = document.getElementsByTagName("html")[0];
				const args = [ html.outerHTML ];
				window.parent.postMessage({
					command: "did-click-link",
					data: `command:_rrdPreview.getScript?${encodeURIComponent(JSON.stringify(args))}`
				}, "file://");
		}
	});

}());
