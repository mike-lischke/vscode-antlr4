/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

const duration = 200;
var rectW = 180;
const rectH = 23;
var nodeSizeFactor = 1;

var zoom = d3.zoom()
    .scaleExtent([0.01, 3])
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

var root = d3.hierarchy(parseTreeData, d => d.children);
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

//---------------------------------------------------------------------------------------------------------------------

function initSwitches() {
    document.getElementById("switch1").checked = useCluster;
    document.getElementById("switch2").checked = !horizontal;
}

//---------------------------------------------------------------------------------------------------------------------

function update(parent) {
    var [nodeW, nodeH] = cluster.nodeSize();
    rectW = (horizontal ? nodeH : nodeW) * 0.9;

    useCluster ? cluster(root) : tree(root);

    var layoutNodes = root.descendants();
    nodeSelection = topGroup.selectAll(".tree-node")
        .data(layoutNodes, function (d) {
            return d.data.id;
        });

    var nodeEnter = nodeSelection.enter().append("g")
        .attr("class", function (d) {
            if (!d.parent) {
                return "tree-node tree-root";
            }
            var result = "tree-node";
            switch (d.data.type) {
                case 1: { // A terminal node.
                        result += " tree-leaf";
                        break;
                    }
                case 2: { // An error node.
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

    var rects = nodeEnter.append("rect")
        .attr("width", rectW)
        .attr("height", rectH)
        .attr("rx", function (d) {
            return (d.data.type == 0) ? 0 : 10;
        })
        .attr("ry", function (d) {
            return (d.data.type == 0) ? 0 : 10;
        });

    createText(nodeEnter);

    // This would resize the rect to tightly wrap the text, but unfortunately the tree/cluster layout relies on a fixed node size.
    //rects.attr("width", d => this.parentNode.childNodes[1].getComputedTextLength() + 20);

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

    nodeEnter
        .attr("transform", function (d) {
            if (horizontal) {
                return "translate(" + d.y + "," + d.x + ")";
            }
            return "translate(" + d.x + "," + d.y + ")";
        });

    // By using a slower transition to fade in the new elements we give the tree more time to make room for them.
    var t2 = d3.transition().duration(duration * 2);
    nodeEnter.transition(t2) // New nodes.
        .style("opacity", 1);

    nodeSelection.exit().transition(t) // Nodes to be removed.
        .style("opacity", 0)
        .remove();

    linkSelection = topGroup.selectAll(".tree-link")
        .data(layoutNodes.slice(1), function (d) {
            return d.data.id;
        });

    // On expand (links).
    var linkEnter = linkSelection.enter().insert("path", "g")
        .attr("class", "tree-link")
        .attr("d", diagonal)
        .style("stroke-opacity", 0);

    // Transition existing links to their new position.
    linkSelection.transition(t)
        .attr("d", diagonal)
        .style("stroke-opacity", 1);

    // Fade in new links.
    linkEnter.transition(t2)
        .style("stroke-opacity", 1);

    // Fade out and remove old links.
    linkSelection.exit().transition(t)
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

//---------------------------------------------------------------------------------------------------------------------

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

//---------------------------------------------------------------------------------------------------------------------

function zoomed() {
    topGroup.attr("transform", d3.event.transform);
}

//---------------------------------------------------------------------------------------------------------------------

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

//---------------------------------------------------------------------------------------------------------------------

function createText(nodeEnter) {
    // The node's text.
    var nodeText = nodeEnter.append("text")
        .attr("class", "node-text")
        .attr("y", rectH / 2)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.data.name;
        });
    nodeText // The bounding box is valid not before the node addition happened actually.
        .attr("x", function (d) { return (rectW - this.getComputedTextLength()) / 2; });

    // The node's token index/range info.
    nodeEnter.append("text")
        .attr("class", "token-range")
        .attr("x", 0)
        .attr("y", rectH / 2)
        .attr("dx", 0)
        .attr("dy", "-1.8em")
        .text(function (d) {
            if (d.data.type != 0) {
                if (d.data.symbol.tokenIndex == -1) {
                    return "no index";
                }
                return "\u2A33 " + d.data.symbol.tokenIndex;
            }

            if (d.data.range.length == 0) {
                return "\u2A33 --";
            }
            if (d.data.range.length == 1) {
                return "\u2A33 " + d.data.range.startIndex;
            }
            return "\u2A33 " + d.data.range.startIndex + "-" + d.data.range.stopIndex;
        });

    // The node's content if this it is a terminal.
    nodeText = nodeEnter.append("text")
        .attr("class", "token-value")
        .attr("x", 0)
        .attr("y", rectH / 2)
        .attr("dy", horizontal ? "0.25em" : "2.5em")
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
    nodeText
        .attr("dx", function (d) {
            return horizontal ? rectW + 20 : (rectW - this.getComputedTextLength()) / 2;
        });
}

//---------------------------------------------------------------------------------------------------------------------

/**
 * Updates all existing nodes and their subelements.
 */
function updateExistingNodes(t) {
    nodeSelection.transition(t)
        .attr("class", function (d) {
            if (!d.parent) {
                return "tree-node tree-root";
            }
            var result = "tree-node";
            switch (d.data.type) {
                case 1: { // A terminal node.
                        result += " tree-leaf";
                        break;
                    }
                case 2: { // An error node.
                        result += " tree-error";
                        break;
                    }
            }
            return result;
        })

    nodeSelection.select("rect").transition(t)
        .attr("width", rectW);

    nodeSelection.select(".node-text").transition(t)
        .attr("x", function (d) { return (rectW - this.getComputedTextLength()) / 2; });

    nodeSelection.select(".token-value").transition(t)
        .attr("dx", function (d) { return horizontal ? rectW + 20: (rectW - this.getComputedTextLength()) / 2; })
        .attr("dy", d => horizontal ? "0.25em" : "2.5em")
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

    nodeSelection.select(".token-range").transition(t)
        .text(function (d) {
            if (d.data.type != 0) {
                if (d.data.symbol.tokenIndex == -1) {
                    return "no index";
                }
                return "\u2A33 " + d.data.symbol.tokenIndex;
            }

            if (d.data.range.length == 0) {
                return "\u2A33 --";
            }
            if (d.data.range.length == 1) {
                return "\u2A33 " + d.data.range.startIndex;
            }
            return "\u2A33 " + d.data.range.startIndex + "-" + d.data.range.stopIndex;
        });

}

//---------------------------------------------------------------------------------------------------------------------

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

//---------------------------------------------------------------------------------------------------------------------

function toggleTreeType(checkbox) {
    useCluster = checkbox.checked;
    applyChanges(0.5);
}

//---------------------------------------------------------------------------------------------------------------------

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
    applyChanges(1);
}

//---------------------------------------------------------------------------------------------------------------------

function changeNodeSize(factor) {
    nodeSizeFactor *= factor;

    if (horizontal) {
        tree.nodeSize([nodeWidth, nodeHeight * nodeSizeFactor]);
        cluster.nodeSize([nodeWidth, nodeHeight * nodeSizeFactor]);
        rectW = 0.9 * nodeHeight * nodeSizeFactor;
    } else {
        tree.nodeSize([nodeWidth * nodeSizeFactor, nodeHeight]);
        cluster.nodeSize([nodeWidth * nodeSizeFactor, nodeHeight]);
        rectW = 0.9 * nodeWidth * nodeSizeFactor;
    }

    applyChanges(0.5);
}

//---------------------------------------------------------------------------------------------------------------------
