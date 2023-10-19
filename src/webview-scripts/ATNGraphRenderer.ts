/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Uri } from "vscode";

import {
    IATNGraphData, IATNNode, IATNGraphLayoutNode, IATNLink, IATNGraphLayoutLink, IATNGraphRendererData, IVSCode,
    IATNGraphUpdateMessageData, IATNStateSaveMessage, ATNStateType,
} from "./types.js";

const stateType = [
    {  // Pretend that this state type is a rule. It's normally the INVALID state type.
        short: "RULE",
        long: "Rule call\nThis is not a real ATN state but a placeholder to indicate a sub rule being 'called' by " +
            "the rule transition.",
    },
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
    {
        short: "PLBACK",
        long: "Plus loop back\nThe loop back state from the inner block to the plus block start state.",
    },
    { short: "LEND", long: "Loop end\nMarks the end of a * or + loop." },
];

interface ILine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

type ATNNodeSelection = d3.Selection<SVGElement, IATNGraphLayoutNode, SVGElement, IATNGraphData>;
type ATNLinkSelection = d3.Selection<SVGLineElement, IATNLink, SVGElement, IATNGraphData>;
type ATNTextSelection = d3.Selection<SVGTextElement, IATNNode, SVGGElement, IATNGraphData>;
type ATNLinkTextSelection = d3.Selection<SVGTextElement, IATNGraphLayoutLink, SVGGElement, IATNGraphData>;

type ATNGraphDragEvent = d3.D3DragEvent<SVGElement, IATNGraphData, IATNGraphLayoutNode>;

export class ATNGraphRenderer {

    private static readonly gridSize = 20;

    private svg: d3.Selection<SVGElement, IATNGraphData, HTMLElement, unknown>;
    private topGroup: d3.Selection<SVGElement, IATNGraphData, HTMLElement, unknown>;

    private zoom: d3.ZoomBehavior<SVGElement, IATNGraphData>;
    private figures: ATNNodeSelection;
    private lines: ATNLinkSelection;
    private textSelection: ATNTextSelection;
    private descriptions: ATNTextSelection;
    private linkLabels: ATNLinkTextSelection;
    private simulation: d3.Simulation<IATNGraphLayoutNode, undefined>;

    private uri: Uri;
    private ruleName: string;
    private currentNodes?: IATNGraphLayoutNode[];
    private maxLabelCount: number;

    public constructor(private vscode: IVSCode) {
        this.svg = d3.select<SVGElement, IATNGraphData>("svg")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("version", "1.1")
            .attr("width", "100%")
            .attr("height", "100%");

        this.zoom = d3.zoom<SVGElement, IATNGraphData>()
            .scaleExtent([0.15, 3])
            .on("zoom", (e: d3.D3ZoomEvent<SVGElement, IATNGraphData>) => {
                this.topGroup.attr("transform", e.transform.toString());
            });

        // Register a listener for data changes.
        window.addEventListener("message", (event: MessageEvent<IATNGraphUpdateMessageData>) => {
            if (event.data.command === "updateATNTreeData") {
                const ruleName = event.data.graphData.ruleName;
                document.querySelector(".ruleLabel")!.textContent = ruleName ?? "<no rule selected>";

                const ruleIndex = event.data.ruleIndex;
                const badge = document.querySelector(".badge") as HTMLDivElement;
                if (ruleIndex !== undefined) {
                    badge.textContent = ruleIndex.toString();
                    badge.style.opacity = "1";
                } else {
                    badge.style.opacity = "0";
                }

                this.render(event.data.graphData);
            }
        });
    }

    /**
     * This getter is used to return the current transformation details for caching.
     *
     * @returns The current ZoomTransform, with the values x, y, and k (for translation and scaling).
     */
    public get currentTransformation(): object {
        return d3.zoomTransform(this.topGroup.node()!);
    }

    public render(data: IATNGraphRendererData): void {
        // Save the transformations of the existing graph (if there's one).
        if (this.currentNodes) {
            const args: IATNStateSaveMessage = {
                command: "saveATNState",
                nodes: this.currentNodes,
                uri: this.uri,
                rule: this.ruleName,
                transform: d3.zoomTransform(this.topGroup.node()!),
            };

            this.vscode.postMessage(args);
        }

        this.currentNodes = undefined;

        if (!data.ruleName) {
            if (this.topGroup) {
                this.topGroup.remove();
            }

            this.svg.style("display", "none");

            return;
        }

        if (!data.graphData) {
            const label = document.createElement("label");
            label.classList.add("noData");
            label.innerText = "No ATN data found (code generation must run at least once in internal or external mode)";

            if (this.topGroup) {
                this.topGroup.remove();
            }

            document.body.appendChild(label);
            this.svg.style("display", "none");

            return;
        }

        // If we have data, remove any previous message we printed.
        let labels = document.body.getElementsByClassName("noData");
        while (labels.length > 0) {
            labels.item(0)?.remove();
        }

        labels = document.body.getElementsByClassName("noSelection");
        while (labels.length > 0) {
            labels.item(0)?.remove();
        }

        this.svg.style("display", "block");

        this.uri = data.uri;
        this.ruleName = data.ruleName;

        this.maxLabelCount = data.maxLabelCount;
        this.currentNodes = data.graphData.nodes as IATNGraphLayoutNode[];
        const links = data.graphData.links;

        this.topGroup = this.svg.select(".topGroup");
        this.topGroup.remove();
        this.topGroup = this.svg.append("g").classed("topGroup", true);

        const xTranslate = data.initialTranslation.x ?? (this.svg.node()?.clientWidth ?? 0) / 2;
        const yTranslate = data.initialTranslation.y ?? (this.svg.node()?.clientHeight ?? 0) / 2;
        this.svg.call(this.zoom)
            // eslint-disable-next-line @typescript-eslint/unbound-method
            .call(this.zoom.transform, d3.zoomIdentity
                .scale(data.initialScale ?? 0.5)
                .translate(xTranslate, yTranslate))
            .on("dblclick.zoom", null);

        // Drawing primitives.
        const linesHost = this.topGroup.append("g").classed("linesHost", true);

        this.lines = linesHost.selectAll<SVGElement, d3.SimulationLinkDatum<IATNGraphLayoutNode>>("line")
            .data(links)
            .enter().append("line")
            .attr("class", "transition")
            .attr("marker-end", (link) => {
                if (this.currentNodes![link.target].type === ATNStateType.INVALID_TYPE) {
                    return "url(#transitionEndRect)";
                }

                return "url(#transitionEndCircle)";
            });

        const statesHost = this.topGroup.append("g").classed("statesHost", true);

        const stateElements = statesHost.selectAll().data(this.currentNodes);
        stateElements.enter().append<SVGElement>((node) => {
            let s;
            let element;

            let cssClass = "state " + stateType[node.type].short;
            const recursive = node.name === data.ruleName;
            if (recursive) {
                cssClass += " recursive";
            }

            if (node.type === ATNStateType.INVALID_TYPE) {
                element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                s = d3.select<SVGElement, IATNGraphLayoutNode>(element)
                    .attr("width", 50) // Size and offset are updated below, depending on label size.
                    .attr("height", 50)
                    .attr("y", -25)
                    .attr("rx", 5)
                    .attr("ry", recursive ? 20 : 5)
                    .attr("class", cssClass)
                    .on("dblclick", this.doubleClicked)
                    .call(d3.drag()
                        .on("start", this.dragStarted)
                        .on("drag", this.dragged),
                    );
            } else {
                element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                s = d3.select<SVGElement, IATNGraphLayoutNode>(element)
                    .attr("r", 30)
                    .attr("class", cssClass)
                    .on("dblclick", this.doubleClicked)
                    .call(d3.drag()
                        .on("start", this.dragStarted)
                        .on("drag", this.dragged),
                    );
            }

            s.append("title").text(stateType[node.type].long);

            return element;
        });

        this.figures = statesHost.selectAll<SVGElement, IATNGraphLayoutNode>(".state").data(this.currentNodes);

        const textHost = this.topGroup.append("g").classed("textHost", true);
        this.textSelection = textHost.selectAll("text")
            .data(this.currentNodes)
            .enter().append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "stateLabel")
            .text((d) => {
                return d.name;
            });

        // Go through all rect elements and resize/offset them according to their label sizes.
        const textNodes = this.textSelection.nodes();
        const rectNodes = this.figures.nodes();

        const border = 20;
        for (let i = 0; i < textNodes.length; ++i) {
            if (this.currentNodes[i].type === ATNStateType.INVALID_TYPE) {
                const element = textNodes[i];
                let width = Math.ceil(element.getComputedTextLength());
                if (width < 70) {
                    width = 70;
                }
                width += border;
                const rect = rectNodes[i];
                rect.setAttribute("width", `${width}px`);
                rect.setAttribute("x", `${-width / 2}px`);

                this.currentNodes[i].width = width;
            }
        }

        const descriptionHost = this.topGroup.append("g").classed("descriptionHost", true);

        this.descriptions = descriptionHost.selectAll<SVGTextElement, IATNGraphLayoutNode>("description")
            .data(this.currentNodes)
            .enter().append("text")
            .attr("x", 0)
            .attr("y", 13)
            .attr("class", "stateTypeLabel")
            .text((node) => {
                return stateType[node.type].short;
            });

        const labelsHost = this.topGroup.append("g").classed("labelsHost", true);

        this.linkLabels = labelsHost.selectAll("labels")
            .data(links)
            .enter().append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "linkLabel")
            .call(this.appendLinkText);

        this.simulation = d3.forceSimulation(this.currentNodes)
            .force("charge", d3.forceManyBody().strength(-400))
            .force("collide", d3.forceCollide(100).strength(0.5).iterations(3))
            .force("link", d3.forceLink(links)
                .distance(200)
                .strength(2))
            .on("tick", this.animationTick)
            .on("end", this.animationEnd);

        // The simulation automatically starts, but we want to have it first do some iterations before
        // showing the initial layout. Makes for a much better initial display.
        this.simulation.stop();

        // Do a number of iterations without visual update, which is usually very fast (much faster than animating
        // each step).
        this.simulation.tick(100);

        // Now do the initial visual update.
        this.animationTick();
    }

    public resetTransformation = (x: number | undefined, y: number | undefined, scale: number | undefined): void => {
        const xTranslate = x ?? (this.svg.node()?.clientWidth ?? 0) / 2;
        const yTranslate = y ?? (this.svg.node()?.clientHeight ?? 0) / 2;
        this.svg.call(this.zoom)
            // eslint-disable-next-line @typescript-eslint/unbound-method
            .call(this.zoom.transform, d3.zoomIdentity
                .scale(scale ?? 0.5)
                .translate(xTranslate, yTranslate));

        this.resetNodePositions();
    };

    private resetNodePositions(): void {
        // Mark start and end nodes as vertically fixed if not already done by the caller.
        // Because of the (initial) zoom translation the origin of the SVG is in the center.
        for (const node of this.currentNodes!) {
            node.fx = null;
            node.fy = null;
            if (node.type === ATNStateType.RULE_START) {
                if (node.x === undefined) {
                    // Note: this is not the fixed x position, but the initial x position.
                    node.x = -1000;
                }

                if (!node.fy) {
                    node.fy = 0;
                }
            } else if (node.type === ATNStateType.RULE_STOP) {
                // Don't set an initial x position for the end node.
                // For unknown reasons this makes it appear left to the start node.
                if (!node.fy) {
                    node.fy = 0;
                }
            }
        }
    }

    /**
     * Splits link label text into multiple tspan entries and adds them to the link elements.
     *
     * @param links The link elements to process.
     */
    private appendLinkText = (links: ATNLinkTextSelection): void => {
        links.each((link, index, list) => {
            let lineNumber = 0;
            const element = d3.select(list[index]);
            for (const label of link.labels) {
                ++lineNumber;
                const span = element.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.5em")
                    .text(label.content);

                if (label.class) {
                    span.classed(label.class, true);
                }

                if (lineNumber === this.maxLabelCount) {
                    const remainingCount = link.labels.length - this.maxLabelCount;
                    if (remainingCount > 0) {
                        element.append("tspan")
                            .attr("x", 0)
                            .attr("dy", "1.5em")
                            .text(`${link.labels.length - this.maxLabelCount} more ...`);
                    }

                    break;
                }
            }
        });
    };

    private animationTick = (): void => {
        this.figures.attr("transform", this.transform);
        this.textSelection.attr("transform", this.transform);
        this.descriptions.attr("transform", this.transform);

        this.transformLines();
        this.transformLinkLabels();
    };

    private animationEnd = (): void => {
        this.figures.attr("transform", this.snapTransform);
        this.textSelection.attr("transform", this.snapTransform);
        this.descriptions.attr("transform", this.snapTransform);

        this.transformLines();
        this.transformLinkLabels();
    };

    private transform = (node: IATNGraphLayoutNode) => {
        return `translate(${node.x ?? 0},${node.y ?? 0})`;
    };

    private snapTransform = (node: IATNGraphLayoutNode) => {
        return `translate(${this.snapToGrid(node.x ?? 0)},${this.snapToGrid(node.y ?? 0)})`;
    };

    /**
     * For links that end at a rule node we have to compute the end position such that we
     * end up on the border of the node rectangle (otherwise the end marker would be hidden).
     * For other nodes we can use a static marker offset (as defined in the svg defs section).
     *
     * @param horizontal Indicates if the computation is done for x values or y values.
     * @param element The link for which to compute the end coordinate.
     *
     * @returns The computed coordinate(either for x or y).
     */
    private endCoordinate(horizontal: boolean, element: IATNLink): number {
        if (this.isATNLayoutNode(element.source) && this.isATNLayoutNode(element.target)) {
            if (element.target.type === ATNStateType.INVALID_TYPE) {
                const sourceX = element.source.x ?? 0;
                const sourceY = element.source.y ?? 0;

                const targetX = element.target.x ?? 0;
                const targetY = element.target.y ?? 0;
                const targetWidth = element.target.width ?? 0;

                const line1 = {
                    x1: sourceX,
                    y1: sourceY,
                    x2: targetX,
                    y2: targetY,
                };

                let line2 = {
                    x1: targetX - targetWidth / 2,
                    y1: targetY - 25,
                    x2: targetX + targetWidth / 2,
                    y2: targetY - 25,
                };

                let intersection = this.lineIntersection(line1, line2);
                if (intersection) {
                    return horizontal ? intersection.x : intersection.y;
                }

                line2 = {
                    x1: targetX - targetWidth / 2,
                    y1: targetY + 25,
                    x2: targetX + targetWidth / 2,
                    y2: targetY + 25,
                };

                intersection = this.lineIntersection(line1, line2);
                if (intersection) {
                    return horizontal ? intersection.x : intersection.y;
                }

                line2 = {
                    x1: targetX - targetWidth / 2,
                    y1: targetY - 25,
                    x2: targetX - targetWidth / 2,
                    y2: targetY + 25,
                };

                intersection = this.lineIntersection(line1, line2);
                if (intersection) {
                    return horizontal ? intersection.x : intersection.y;
                }

                line2 = {
                    x1: targetX + targetWidth / 2,
                    y1: targetY - 25,
                    x2: targetX + targetWidth / 2,
                    y2: targetY + 25,
                };

                intersection = this.lineIntersection(line1, line2);
                if (intersection) {
                    return horizontal ? intersection.x : intersection.y;
                }
            }

            // For circle nodes or when the center of the source node is within the bounds of the target node rect.
            return (horizontal ? element.target.x : element.target.y) ?? 0;
        }

        return 0;
    }

    /**
     * Computes the point where two lines intersect each other.
     *
     * @param line1 The first line.
     * @param line2 The second line.
     *
     * @returns an object with the computed coordinates or undefined, if the lines are parallel.
     */
    private lineIntersection(line1: ILine, line2: ILine): { x: number; y: number; } | undefined {
        const s1X = line1.x2 - line1.x1;
        const s1Y = line1.y2 - line1.y1;
        const s2X = line2.x2 - line2.x1;
        const s2Y = line2.y2 - line2.y1;

        const s = (-s1Y * (line1.x1 - line2.x1) + s1X * (line1.y1 - line2.y1)) / (-s2X * s1Y + s1X * s2Y);
        const t = (s2X * (line1.y1 - line2.y1) - s2Y * (line1.x1 - line2.x1)) / (-s2X * s1Y + s1X * s2Y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return {
                x: line1.x1 + (t * s1X),
                y: line1.y1 + (t * s1Y),
            };
        }

        return undefined;
    }

    private transformLinkLabels(): void {
        this.linkLabels
            .attr("transform", (link) => {
                // We have to compute the slope of the label and its position.
                // For the first we need the center coordinates of the figures, while positioning depends on the size
                // of the figures.
                const targetY = this.isSimulationNodeDatum(link.target) ? link.target.y ?? 0 : 0;
                const sourceY = this.isSimulationNodeDatum(link.source) ? link.source.y ?? 0 : 0;

                // For rule figures we computed a width value before, which we can use here to adjust the
                // horizontal coordinates to account for different rule name lengths.
                let sourceX = 0;
                if (this.isSimulationNodeDatum(link.source)) {
                    sourceX = link.source.x ?? 0;
                }

                let targetX = 0;
                if (this.isSimulationNodeDatum(link.target)) {
                    targetX = link.target.x ?? 0;
                }

                const slope = Math.atan2((targetY - sourceY), (targetX - sourceX)) * 180 / Math.PI;

                // Now that have the slope, update the available horizontal range.
                if (this.isSimulationNodeDatum(link.source)) {
                    if (link.source.width) {
                        sourceX += link.source.width / 2;
                    } else {
                        sourceX += 25; // The circle radius + border.
                    }
                }

                if (this.isSimulationNodeDatum(link.target)) {
                    if (link.target.width) {
                        targetX -= link.target.width / 2;
                    } else {
                        targetX -= 25; // The circle radius + border.
                    }
                }

                let xOffset = 0;
                let yOffset = 0;
                let effectiveSlope = 0;

                switch (true) {
                    case (slope > -45 && slope < 45): {
                        effectiveSlope = slope;
                        break;
                    }

                    case (slope < -135 || slope > 135): {
                        effectiveSlope = slope + 180;
                        xOffset = 10;
                        break;
                    }

                    case (slope >= 45 || slope <= -45): {
                        xOffset = 10;
                        yOffset = -10;
                        break;
                    }

                    default:
                }

                return `translate(${(targetX + sourceX) / 2}, ${(targetY + sourceY) / 2}) rotate(${effectiveSlope}) ` +
                    `translate(${xOffset}, ${yOffset})`;
            });
    }

    private transformLines(): void {
        this.lines
            .attr("x1", (link) => {
                if (this.isATNLayoutNode(link.source)) {
                    return link.source.x ?? 0;
                }

                return 0;
            })
            .attr("y1", (link) => {
                if (this.isATNLayoutNode(link.source)) {
                    return link.source.y ?? 0;
                }

                return 0;
            })
            .attr("x2", (link) => {
                if (this.isATNLayoutNode(link.target)) {
                    link.target.endX = this.endCoordinate(true, link);

                    return link.target.endX;
                }

                return 0;
            })
            .attr("y2", (link) => {
                if (this.isATNLayoutNode(link.target)) {
                    link.target.endY = this.endCoordinate(false, link);

                    return link.target.endY;
                }

                return 0;
            });
    }

    private dragStarted = (e: ATNGraphDragEvent) => {
        if (!e.active) {
            this.simulation.alphaTarget(0.3).restart();
        }

        e.subject.fx = e.x;
        e.subject.fy = e.y;
    };

    private dragged = (e: ATNGraphDragEvent) => {
        e.subject.fx = this.snapToGrid(e.x);
        e.subject.fy = this.snapToGrid(e.y);
    };

    private doubleClicked = (_event: MouseEvent, data: unknown) => {
        const node = data as IATNGraphLayoutNode;
        node.fx = undefined;
        node.fy = undefined;
    };

    private snapToGrid(value: number): number {
        return Math.round(value / ATNGraphRenderer.gridSize) * ATNGraphRenderer.gridSize;
    }

    private isATNLayoutNode(node: string | number | IATNGraphLayoutNode): node is IATNGraphLayoutNode {
        return (typeof node !== "string") && (typeof node !== "number");
    }

    private isSimulationNodeDatum(node: string | number | d3.SimulationNodeDatum): node is d3.SimulationNodeDatum {
        return (typeof node !== "string") && (typeof node !== "number");
    }
}
