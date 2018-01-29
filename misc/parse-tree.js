/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

var nextNodeId = 0; // For automatic node ID generation.
const duration = 200;
var rectW = 180;
const rectH = 25;
var nodeSizeFactor = 1;

var zoom = d3.zoom()
    .scaleExtent([0.1, 3])
    .on("zoom", zoomed);

var svg = d3.select("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("version", "1.1")
    .attr("viewBox", "0 0 " + width + " " + height);

var topGroup = svg.append("g");

svg.call(zoom)
    .call(zoom.transform, d3.zoomIdentity
        .translate(initialTranslateX - rectW / 2, initialTranslateY)
        .scale(initialScale, initialScale)
    )
    .on("dblclick.zoom", null);

var root = d3.hierarchy(data, (d) => d.children);
root.x0 = width / 2;
root.y0 = height / 2;

var nodeSelection;
var linkSelection;

var nodeWidth = horizontal ? 60 : 190;
var nodeHeight = horizontal ? 190 : 60;

var tree = d3.tree()
    .nodeSize([nodeWidth, nodeHeight])
    .separation(function (a, b) {
        return a.parent == b.parent ? 1 : 1.4;
    });

var cluster = d3.cluster()
    .nodeSize([nodeWidth, nodeHeight])
    .separation(function (a, b) {
        return a.parent == b.parent ? 1 : 1.4;
    });

function update(parent) {
    var [nodeW, nodeH] = cluster.nodeSize();
    rectW = (horizontal ? nodeH : nodeW) * 0.9;

    useCluster ? cluster(root) : tree(root);

    var layoutNodes = root.descendants();
    nodeSelection = topGroup.selectAll(".tree-node")
        .data(layoutNodes, function (d) {
            return d.id || (d.id = ++nextNodeId);
        });

    var nodeEnter = nodeSelection.enter().append("g")
        .attr("class", function (d) {
            if (!d.parent) {
                return "tree-node tree-root";
            }
            var result = "tree-node";
            switch (d.data.type) {
                case 1:
                    { // A terminal node.
                        result += " tree-leaf";
                        break;
                    }
                case 2:
                    { // An error node.
                        result += " tree-error";
                        break;
                    }
            }
            return result;
        })
        .attr("transform", function (d) {
            if (horizontal) {
                return "translate(" + parent.y0 + "," + parent.x0 + ")";
            }
            return "translate(" + parent.x0 + "," + parent.y0 + ")";
        })
        .style("opacity", 0)
        .on("click", click);

    nodeEnter.append("rect")
        .attr("width", rectW)
        .attr("height", rectH)
        .attr("rx", function (d) {
            return (d.children || d._children) ? 0 : 10;
        })
        .attr("ry", function (d) {
            return (d.children || d._children) ? 0 : 10;
        });

    createText(nodeEnter);

    var t = d3.transition().duration(duration);

    updateExistingNodes(t);

    // Transition nodes to their new position.
    nodeSelection.transition(t) // Existing nodes.
        .attr("transform", function (d) {
            if (horizontal) {
                return "translate(" + d.y + "," + d.x + ")";
            }
            return "translate(" + d.x + "," + d.y + ")";
        })
        .style("opacity", 1);

    nodeEnter.transition(t) // New nodes.
        .attr("transform", function (d) {
            if (horizontal) {
                return "translate(" + d.y + "," + d.x + ")";
            }
            return "translate(" + d.x + "," + d.y + ")";
        })
        .style("opacity", 1);

    nodeSelection.exit().transition(t) // Nodes to be removed.
        .attr("transform", function (d) {
            if (horizontal) {
                return "translate(" + parent.y + "," + parent.x + ")";
            }
            return "translate(" + parent.x + "," + parent.y + ")";
        })
        .style("opacity", 0)
        .remove();

    linkSelection = topGroup.selectAll(".tree-link")
        .data(layoutNodes.slice(1), function (d) {
            return d.id;
        });

    // On expand (links).
    var linkEnter = linkSelection.enter().insert("path", "g")
        .attr("class", "tree-link")
        .attr("d", function (d) {
            if (horizontal) {
                return "M" + (parent.y0 + rectW / 2) + "," + parent.x0 +
                    "C" + (parent.y0 + rectW / 2) + "," + parent.x0 +
                    " " + (parent.y0 + rectW / 2) + "," + (parent.x0 + rectH / 2) +
                    " " + (parent.y0 + rectW / 2) + "," + (parent.x0 + rectH / 2);
            }
            return "M" + (parent.x0 + rectW / 2) + "," + parent.y0 +
                "C" + (parent.x0 + rectW / 2) + "," + parent.y0 +
                " " + (parent.x0 + rectW / 2) + "," + (parent.y0 + rectH / 2) +
                " " + (parent.x0 + rectW / 2) + "," + (parent.y0 + rectH / 2);
        })
        .style("stroke-opacity", 0);

    // Transition links to their new position.
    linkSelection.transition(t)
        .attr("d", diagonal)
        .style("stroke-opacity", 1);

    linkEnter.transition(t)
        .attr("d", diagonal)
        .style("stroke-opacity", 1);

    // Transition exiting links to the parent's new position.
    linkSelection.exit().transition(t)
        .attr("d", function (d) {
            if (horizontal) {
                return "M" + (parent.y + rectW / 2) + "," + parent.x +
                    "C" + (parent.y + rectW / 2) + "," + parent.x +
                    " " + (parent.y + rectW / 2) + "," + (parent.x + rectH / 2) +
                    " " + (parent.y + rectW / 2) + "," + (parent.x + rectH / 2);
            }
            return "M" + (parent.x + rectW / 2) + "," + parent.y +
                "C" + (parent.x + rectW / 2) + "," + parent.y +
                " " + (parent.x + rectW / 2) + "," + (parent.y + rectH / 2) +
                " " + (parent.x + rectW / 2) + "," + (parent.y + rectH / 2);
        })
        .style("stroke-opacity", 0)
        .remove();

    nodeSelection = topGroup.selectAll(".tree-node");
    linkSelection = topGroup.selectAll(".tree-link");

    // Stash the old positions for transition.
    layoutNodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children on click.
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

function zoomed() {
    topGroup.attr("transform", d3.event.transform);
}

function diagonal(d) {
    if (horizontal) {
        return "M" + d.y + "," + (d.x + rectH / 2) +
            "C" + (d.parent.y + rectW / 2) + "," + (d.x + rectH / 2) +
            " " + (d.parent.y + rectW / 2) + "," + (d.parent.x + rectH / 2) +
            " " + (d.parent.y + rectW / 2) + "," + (d.parent.x + rectH / 2);
    }

    return "M" + (d.x + rectW / 2) + "," + d.y +
        "C" + (d.x + rectW / 2) + "," + d.parent.y +
        " " + (d.parent.x + rectW / 2) + "," + (d.parent.y + rectH / 2) +
        " " + (d.parent.x + rectW / 2) + "," + (d.parent.y + rectH / 2);
}

function createText(nodeEnter) {
    // The node's text.
    nodeEnter.append("text")
        .attr("class", "node-text")
        .attr("x", rectW / 2)
        .attr("y", rectH / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d.data.name;
        });

    // The node's token index/rang info.
    nodeEnter.append("text")
        .attr("class", "token-range")
        .attr("x", d => horizontal ? 0 : rectW)
        .attr("y", rectH / 2)
        .attr("dx", d => horizontal ? 0 : "-1em")
        .attr("dy", "-1.8em")
        .attr("text-anchor", d => horizontal ? "begin" : "end")
        .text(function (d) {
            if (d.data.type != 0) {
                if (d.data.symbol.tokenIndex == -1) {
                    return "no index";
                }
                return "\u2A33 " + d.data.symbol.tokenIndex;
            }
            if (d.data.start.tokenIndex == d.data.stop.tokenIndex) {
                return "\u2A33 " + d.data.start.tokenIndex;
            }
            return "\u2A33 " + d.data.start.tokenIndex + "-" + d.data.stop.tokenIndex;
        });

    // The node's content if this it is a terminal.
    nodeEnter.append("text")
        .attr("class", "token-value")
        .attr("x", rectW / 2)
        .attr("dx", d => horizontal ? rectW / 2 + 20 : 0)
        .attr("y", rectH / 2)
        .attr("dy", d => horizontal ? "0.25em" : "2.5em")
        .attr("text-anchor", d => horizontal ? "begin" : "middle")
        .text(function (d) {
            if (d.data.type == 0) {
                return "";
            }

            if (d.data.type == 2) { // Error node.
                if (d.data.symbol.tokenIndex == -1) {
                    return "<missing>";
                }
                return "<unexpected: " + d.data.symbol.text + ">";
            }

            return d.data.symbol.text;
        });

}

function updateExistingNodes(t) {
    // Update existing nodes (and their text elements) if there was a size change.
    nodeSelection.selectAll("rect").transition(t)
        .attr("width", rectW);
    nodeSelection.selectAll(".node-text").transition(t)
        .attr("x", rectW / 2);
    nodeSelection.selectAll(".token-range").transition(t)
        .attr("x", d => horizontal ? 0 : rectW)
        .attr("text-anchor", d => horizontal ? "begin" : "end");
    nodeSelection.selectAll(".token-value").transition(t)
        .attr("dx", d => horizontal ? rectW / 2 + 20 : 0)
        .attr("dy", d => horizontal ? "0.25em" : "2.5em")
        .attr("text-anchor", d => horizontal ? "begin" : "middle");
}

function applyChanges(durationFactor) {
    (useCluster ? cluster : tree)(root);
    var t = d3.transition().duration(duration * durationFactor);
    updateExistingNodes(t);
    nodeSelection.transition(t).attr("transform", function (d) {
        if (horizontal) {
            return "translate(" + d.y + "," + d.x + ")";
        }
        return "translate(" + d.x + "," + d.y + ")";
    });
    linkSelection.transition(t).attr("d", diagonal);
}

function toggleTreeType(checkbox) {
    useCluster = checkbox.checked;
    applyChanges(1);
}

function toggleOrientation(checkbox) {
    horizontal = !checkbox.checked;
    nodeWidth = horizontal ? 60 : 190;
    nodeHeight = horizontal ? 190 : 60;

    if (horizontal) {
        tree.nodeSize([nodeWidth, nodeHeight * nodeSizeFactor]);
        cluster.nodeSize([nodeWidth, nodeHeight * nodeSizeFactor]);
    } else {
        tree.nodeSize([nodeWidth * nodeSizeFactor, nodeHeight]);
        cluster.nodeSize([nodeWidth * nodeSizeFactor, nodeHeight]);
    }
    applyChanges(2);
}

function changeNodeSize(factor) {
    nodeSizeFactor *= factor;

    if (horizontal) {
        tree.nodeSize([nodeWidth, nodeHeight * nodeSizeFactor]);
        cluster.nodeSize([nodeWidth, nodeHeight * nodeSizeFactor]);
    } else {
        tree.nodeSize([nodeWidth * nodeSizeFactor, nodeHeight]);
        cluster.nodeSize([nodeWidth * nodeSizeFactor, nodeHeight]);
    }
    applyChanges(1);
}
