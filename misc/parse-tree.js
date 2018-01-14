/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

function render() {
    var i = 0;
    const duration = 250;
    const rectW = 160;
    const rectH = 25;

    var tree = d3.tree()
        .nodeSize([200, 60])
        .separation(function (a, b) {
            return 1;
        });

    var cluster = d3.cluster()
        .nodeSize([180, 60])
        .separation(function (a, b) {
            return 1;
        });

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
            .scale(initialScale, initialScale)
            .translate(initialTranslateX, initialTranslateY))
        .on("dblclick.zoom", null);

    var root = d3.hierarchy(data, (d) => d.children);
    root.x0 = 0;
    root.y0 = 400;

    update(root);

    function update(parent) {
        cluster(root);
        var nodes = root.descendants();

        var node = topGroup.selectAll(".tree-node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        var nodeEnter = node.enter().append("g")
            .attr("class", function (d) {
                if (!d.parent) {
                    return "tree-node tree-root";
                }
                return (d.children || d._children) ? "tree-node" : "tree-node tree-leaf";
            })
            .attr("transform", function (d) {
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

        nodeEnter.append("text")
            .attr("x", rectW / 2)
            .attr("y", rectH / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.data.name;
            });

        var t = d3.transition().duration(duration);

        // Transition nodes to their new position.
        node.transition(t) // Existing nodes.
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .style("opacity", 1);

        nodeEnter.transition(t) // New nodes.
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .style("opacity", 1);

        node.exit().transition(t) // Nodes to be removed.
            .attr("transform", function (d) {
                return "translate(" + parent.x + "," + parent.y + ")";
            })
            .style("opacity", 0)
            .remove();

        var link = topGroup.selectAll(".tree-link")
            .data(nodes.slice(1), function (d) {
                return d.id;
            });

        // On expand (links).
        var linkEnter = link.enter().insert("path", "g")
            .attr("class", "tree-link")
            .attr("d", function (d) {
                return "M" + (parent.x0 + rectW / 2) + "," + parent.y0 +
                    "C" + (parent.x0 + rectW / 2) + "," + parent.y0 +
                    " " + (parent.x0 + rectW / 2) + "," + (parent.y0 + rectH / 2) +
                    " " + (parent.x0 + rectW / 2) + "," + (parent.y0 + rectH / 2);
            })
            .style("stroke-opacity", 0);

        // Transition links to their new position.
        link.transition(t)
            .attr("d", diagonal)
            .style("stroke-opacity", 1);

        linkEnter.transition(t)
            .attr("d", diagonal)
            .style("stroke-opacity", 1);

        // Transition exiting links to the parent's new position.
        link.exit().transition(t)
            .attr("d", function (d) {
                return "M" + (parent.x + rectW / 2) + "," + parent.y +
                    "C" + (parent.x + rectW / 2) + "," + parent.y +
                    " " + (parent.x + rectW / 2) + "," + (parent.y + rectH / 2) +
                    " " + (parent.x + rectW / 2) + "," + (parent.y + rectH / 2);
            })
            .style("stroke-opacity", 0)
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
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
        return "M" + (d.x + rectW / 2) + "," + d.y +
            "C" + (d.x + rectW / 2) + "," + d.parent.y +
            " " + (d.parent.x + rectW / 2) + "," + (d.parent.y + rectH / 2) +
            " " + (d.parent.x + rectW / 2) + "," + (d.parent.y + rectH / 2);
    }

}
