var diameter = 1000;
var radius = diameter / 2;
var innerRadius = radius * 0.90;

var initialScale = 0.5;

var svg = d3.select("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("version", "1.1")
    .attr("viewBox", "0 0 " + diameter + " " + diameter);

var topGroup = svg.append("g");

var zoom = d3.zoom()
    .scaleExtent([0.3, 2])
    .on("zoom", zoomed);

function zoomed() {
    topGroup.attr("transform", d3.event.transform);
}

svg
    .call(zoom)
    .call(zoom.transform, d3.zoomIdentity
        .scale(initialScale, initialScale)
        .translate(radius, diameter * (1 - initialScale))
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


function onMouseOver(d) {
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
