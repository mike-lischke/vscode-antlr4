/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

const initialDiameter = 1000;

var diameter = initialDiameter;
var initialScale = 0.5;

function render() {
	var radius = diameter / 2;
	var innerRadius = radius * 0.90;

	var svg = d3.select("svg")
	    .attr("xmlns", "http://www.w3.org/2000/svg")
	    .attr("version", "1.1")
	    .attr("viewBox", "0 0 " + diameter + " " + diameter);

	var topGroup = svg.append("g");

	var zoom = d3.zoom()
	    .scaleExtent([0.1 * initialScale, 10 * initialScale])
	    .on("zoom", zoomed);

	function zoomed() {
	    topGroup.attr("transform", d3.event.transform);
	}

	svg
	    .call(zoom)
	    .call(zoom.transform, d3.zoomIdentity
	        .scale(initialScale, initialScale)
	        .translate(radius, radius)
	    )
	    .on("dblclick.zoom", null);

	var cluster = d3.cluster()
        .size([360, innerRadius]);

	const line = d3.radialLine()
	    .radius(function (d) {
	        return d.y;
	    })
	    .angle(function (d) {
	        return d.x / 180 * Math.PI;
	    })
	    .curve(d3.curveBundle.beta(0.75));

	var link = topGroup.append("g").selectAll(".link");
	var node = topGroup.append("g").selectAll(".node");

	var root = d3.hierarchy(packageHierarchy(data), (d) => d.children);
	var nodes = root.descendants();

	var links = packageReferences(nodes);

	cluster(root);

	link = link
	    .data(links)
	    .enter().append('path')
	    .attr('class', 'link')
	    .attr('d', d => line(d.source.path(d.target)));

	node = node
	    .data(nodes.filter(function (n) {
	        return !n.children;
	    }))
	    .enter().append("text")
	    .attr("class", function (d) {
	        return "node " + d.data.class;
	    })
	    .attr("dy", "0.31em")
	    .attr("transform", function (d) {
	        return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 10) + ",0)" + (d.x < 180 ? "" :
	            "rotate(180)");
	    })
	    .style("text-anchor", function (d) {
	        return d.x < 180 ? "start" : "end";
	    })
	    .text(function (d) {
	        return d.data.key;
	    })
	    .on("mouseover", onMouseOver)
	    .on("mouseout", onMouseOut);

	var fadeTimer = null;

    function onMouseOver(d) {
		clearTimeout(fadeTimer);

        node
			.each(function (n) {
        		n.target = n.source = false;
			});

		link
			.classed("link-target", function (l) {
        		if (l.target === d) return l.source.source = true;
			})
			.classed("link-source", function (l) {
        		if (l.source === d) return l.target.target = true;
			})
    		.classed("link-dimmed", function (l) {
        		return (l.source !== d) && (l.target !== d);
			});

		node
			.classed("node-target", function (n) {
        		return n.target;
			})
    		.classed("node-source", function (n) {
        		return n.source;
			});
	}

	function onMouseOut(d) {
		if (fadeTimer) {
			clearTimeout(fadeTimer);
		}

    	fadeTimer = setTimeout(() => {
        	fadeTimer = null;
    		link.classed("link-dimmed", false);
		}, 200);

    	link
			.classed("link-target", false)
        	.classed("link-source", false);

    	node
       		.classed("node-target", false)
        	.classed("node-source", false);
    }

	function packageHierarchy(rules) {
	    var map = {};
	    var modules = [];

	    function find(name, data) {
	        var node = map[name];
	        var i;
	        if (!node) {
	            node = map[name] = data || {
	                name: name,
	                children: []
	            };
	            if (name.length > 0) {
	                node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
	                node.parent.children.push(node);

	                // Pick one out of 10 color classes for this node.
	                var index = modules.indexOf(node.parent.name);
	                if (index < 0) {
	                    modules.push(node.parent.name);
	                    index = modules.length - 1;
	                }
	                index = index % 10;
	                node.class = "module-" + index;
	                node.key = name.substring(i + 1);
	            }
	        }
	        return node;
	    }

	    rules.forEach(function (d) {
	        find(d.name, d);
	    });

	    return map[""];
	}

	function packageReferences(nodes) {
	    var map = {};
	    var references = [];

	    // Compute a map from name to node.
	    nodes.forEach(function (d) {
	        map[d.data.name] = d;
	    });

	    // For each import, construct a link from the source to target node.
	    nodes.forEach(function (d) {
	        if (d.data.references) {
	            d.data.references.forEach(function (i) {
	                references.push({
	                    source: map[d.data.name],
	                    target: map[i]
	                });
	            });
	        }
	    });

	    return references;
	}
}

function changeDiameter(factor) {
	const svg = document.querySelectorAll('svg')[0];
	while (svg.firstChild) {
	    svg.removeChild(svg.firstChild);
	}
	diameter *= factor;
	diameter = diameter < 100 ? 100 : (diameter > 10000 ? 10000 : diameter);
	initialScale = diameter / initialDiameter / 2;

	render();
}
