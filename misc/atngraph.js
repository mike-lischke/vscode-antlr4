/*
 * This file is released under the MIT license.
 * Copyright (c) 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

var stateType = [
  { short: "INVALID", long: "Invalid state" },
  { short: "BASIC", long: "Basic state" },
  { short: "START", long: "Rule start\nThe entry node of a rule." },
  { short: "BSTART", long: "Block start state\nThe start of a regular (...) block." },
  { short: "PBSTART", long: "Plus block start state\nStart of the actual block in a (A|b|...)+ loop." },
  { short: "SBSTART", long: "Star block start\nStart of the actual block in a (A|b|...)* loop." },
  { short: "TSTART", long: "Token start\nThe entry state of a rule." },
  { short: "STOP", long: "Rule stop\nThe exit state of a rule." },
  { short: "BEND", long: "Block end\nTerminal node of a simple (A|b|...) block." },
  { short: "SLBACK", long: "Star loop back\nThe loop back state from the inner block to the star loop entry state." },
  { short: "SLENTRY", long: "Star loop entry\nEntry + exit state for (A|B|...)* loops." },
  { short: "PLBACK", long: "Plus loop back\nThe loop back state from the inner block to the plus block start state." },
  { short: "LEND", long: "Loop end\nMarks the end of a * or + loop." },

  { short: "RULE", long: "Rule call\nRepresents a transition to a subrule." }, // Fake state
];

// Mark start and end nodes as fixed if not already done by the caller.
for (let node of nodes) {
  if (node.type === 2) {
    if (!node.fx) node.fx = 40;
    if (!node.fy) node.fy = height / 4;
  } else if (node.type === 7) {
    if (!node.fx) node.fx = width - 40;
    if (!node.fy) node.fy = height / 4;
  }
}

var zoom = d3.zoom()
  .scaleExtent([0.15, 3])
  .on("zoom", zoomed)

var svg = d3.select("svg")
  .attr("xmlns", "http://www.w3.org/2000/svg")
  .attr("version", "1.1")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 " +  width + " " + height);

let topGroup = svg.append("g");

// The initialXX values + svg size are set by the extension webview provider (see ATNGraphProvider.ts).
svg
  .call(zoom)
  .call(zoom.transform, d3.zoomIdentity
      .scale(initialScale, initialScale)
      .translate(initialTranslateX, initialTranslateY))
  .on("dblclick.zoom", null);

function zoomed() {
  topGroup.attr("transform", d3.event.transform);
}

var force = d3.forceSimulation(nodes)
  .force("charge", d3.forceManyBody())
  //.force("center", d3.forceCenter(width / 2, height / 3))
  .force("collide", d3.forceCollide(100).strength(0.5).iterations(5));
;

// Drawing primitives.
var lines = topGroup.append("g").selectAll("line")
  .data(links)
  .enter().append("line")
    .attr("class", "transition")
    .attr("marker-end", function(d) {
      if (nodes[d.target].type === 13)
        return "url(#transitionEndRect)";
      return "url(#transitionEndCircle)";
    });

var figures = topGroup.append("g");
for (figure of nodes) {
  var element;

  let cssClass = "state " + stateType[figure.type].short;
  let recursive = figure.name === objectName;
  if (recursive)
    cssClass += " recursive";

if (figure.type === 13) {
    element = figures.append("rect")
      .attr("width", 50) // Size and offset are updated below, depending on label size.
      .attr("height", 50)
      .attr("y", -25)
      .attr("rx", 5)
      .attr("ry", recursive ? 20 : 5)
      .attr("class", cssClass)
      .on("dblclick", dblclick)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
      );
  } else {
    element = figures.append("circle")
      .attr("r", 30)
      .attr("class", cssClass)
      .on("dblclick", dblclick)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
      );
  }

  // Add a tooltip to each element.
  element.append("title").text(stateType[figure.type].long);
}

figures = figures.selectAll(".state").data(nodes);

var text = topGroup.append("g").selectAll("text")
  .data(nodes)
  .enter().append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("class", "stateLabel")
    .text(function(d) { return d.name; });

// Go through all rect elements and resize/offset them according to their label sizes.
let textNodes = text.nodes();
let border = 20;
for (var i = 0; i < textNodes.length; ++i) {
  if (nodes[i].type === 13) {
    let element = textNodes[i];
    let width = Math.ceil(element.getComputedTextLength());
    if (width < 70)
      width = 70;
    width += border;
    let rect = figures.nodes()[i];
    rect.setAttribute("width", width + "px");
    rect.setAttribute("x", -width / 2 + "px");

    nodes[i]["width"] = width;
  }
}

var description = topGroup.append("g").selectAll("description")
    .data(nodes)
  .enter().append("text")
    .attr("x", 0)
    .attr("y", 13)
    .attr("class", "stateTypeLabel")
    .text(function(d) { return stateType[d.type].short; });

var linkLabels = topGroup.append("g").selectAll("labels")
    .data(links)
  .enter().append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("class", "linkLabel")
    .call(appendLinkText);

force
  .force("link", d3.forceLink(links).distance(150).strength(1))
  .on("tick", tick);

function tick() {
  figures.attr("transform", transform);
  text.attr("transform", transform);
  description.attr("transform", transform);

  lines
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { d.target.endX = endCoordinate(true, d); return d.target.endX; })
    .attr("y2", function(d) { d.target.endY = endCoordinate(false, d); return d.target.endY; });

  transformLinkLabels();
}

function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

/**
 * For links that end at a rule node we have to compute the end position such that we
 * end up on the border of the node rectangle (otherwise the end marker would be hidden).
 * For other nodes we can use a static marker offset (as defined in the svg defs section).
 */
function endCoordinate(horz, element) {
  if (element.target.type === 13) {
    let line1 = { x1: element.source.x, y1: element.source.y, x2: element.target.x, y2: element.target.y };
    let line2 = { x1: element.target.x - element.target.width / 2, y1: element.target.y - 25, x2: element.target.x + element.target.width / 2, y2: element.target.y - 25 };
    let intersection = lineIntersection(line1, line2);
    if (intersection) {
      return horz ? intersection.x : intersection.y;
    }
    line2 = { x1: element.target.x - element.target.width / 2, y1: element.target.y + 25, x2: element.target.x + element.target.width / 2, y2: element.target.y + 25 };
    intersection = lineIntersection(line1, line2);
    if (intersection) {
      return horz ? intersection.x : intersection.y;
    }
    line2 = { x1: element.target.x - element.target.width / 2, y1: element.target.y - 25, x2: element.target.x - element.target.width / 2, y2: element.target.y + 25 };
    intersection = lineIntersection(line1, line2);
    if (intersection) {
      return horz ? intersection.x : intersection.y;
    }
    line2 = { x1: element.target.x + element.target.width / 2, y1: element.target.y - 25, x2: element.target.x + element.target.width / 2, y2: element.target.y + 25 };
    intersection = lineIntersection(line1, line2);
    if (intersection)
      return horz ? intersection.x : intersection.y;
  }

  // Fore circle nodes or when the center of the source node is within the bounds of the target node rect.
  return horz ? element.target.x : element.target.y;
}

function lineIntersection(line1, line2) {
    let s1X = line1.x2 - line1.x1;
    let s1Y = line1.y2 - line1.y1;
    let s2X = line2.x2 - line2.x1;
    let s2Y = line2.y2 - line2.y1;

    let s = (-s1Y * (line1.x1 - line2.x1) + s1X * (line1.y1 - line2.y1)) / (-s2X * s1Y + s1X * s2Y);
    let t = ( s2X * (line1.y1 - line2.y1) - s2Y * (line1.x1 - line2.x1)) / (-s2X * s1Y + s1X * s2Y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        return { x: line1.x1 + (t * s1X), y: line1.y1 + (t * s1Y) };
    }

    return;
}

function appendLinkText(text) {
  // Split link label text into multiple tspan entries.
  text.each(function(d) {

    var element = d3.select(this);
    let lineNumber = 0;
    for (let label of d.labels) {
      element.append('tspan')
        .attr('x', 0)
        .attr('y', "1.1em")
        .attr('dy', lineNumber++ + "em")
        .text(label);

      if (lineNumber == maxLabelCount) {
        var remainingCount = d.labels.length - maxLabelCount;
         if (remainingCount > 0) {
          element.append('tspan')
            .attr('x', 0)
            .attr('y', "1.1em")
            .attr('dy', lineNumber++ + "em")
            .text((d.labels.length - maxLabelCount) + " more ...");
        }
        break;
      }
    }
  });
}

function transformLinkLabels() {
  linkLabels
    .attr("transform", function(d) {
      let slope = Math.atan2((d.target.y - d.source.y), (d.target.x - d.source.x)) * 180 / Math.PI;
      let xOffset = 0;
      let yOffset = 0;
      let effectiveSlope = 0;

      switch (true) {
        case (slope > -75 && slope < 75):
          effectiveSlope = slope;
          break;
        case (slope < -105 || slope > 105):
          effectiveSlope = slope + 180;
          xOffset = 10;
          break;
        case (slope >= 75 || slope <= -75):
          xOffset = 10;
          yOffset = -10;
          break;
      }

      return "translate(" + ((d.target.x + d.source.x) / 2) + ","
        + ((d.target.y + d.source.y) / 2) + ") rotate(" + effectiveSlope + ") "
        + "translate(" + xOffset + ", " + yOffset + ")";
    });
}

function dragstarted(d) {
  if (!d3.event.active) {
    force.alphaTarget(0.3).restart();
  }
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  var grid = 20;

  d.fx = Math.round(d3.event.x / grid) * grid;
  d.fy = Math.round(d3.event.y / grid) * grid;
}

function dblclick(d) {
  d.fx = null;
  d.fy = null;
}

function resetTransformation() {
	var scale = 0.5 * Math.exp(-nodes.length / 50) + 0.1;
    svg
        .call(zoom.transform, d3.zoomIdentity
        .scale(scale, scale)
        .translate(width * (1 - initialScale), height * (1 - initialScale)));

    for (let node of nodes) {
        if (node.type === 2) {
            node.fx = 40;
            node.fy = height / 4;
        } else if (node.type === 7) {
            node.fx = width - 40;
            node.fy = height / 4;
        } else {
        	node.fx = null;
        	node.fy = null;
        }
    }
}
