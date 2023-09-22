/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { IParseTreeNode } from "./types.js";

export interface IRendererData {
    parseTreeData: IParseTreeNode;
    useCluster: boolean;
    horizontal: boolean;
    initialScale: number;
    initialTranslateX: number;
    initialTranslateY: number;
}

interface IParseTreeRenderNode extends IParseTreeNode {
    x0?: number;
    y0?: number;

    childrenBackup?: ParseTreeLayoutNode[];
}

// Type aliases for better handling/reading.
type ParseTreeLayoutNode = d3.HierarchyPointNode<IParseTreeRenderNode>;
type ParseTreeSelection = d3.Selection<SVGElement, ParseTreeLayoutNode, SVGElement, IParseTreeRenderNode>;

// The parse tree renderer is used in webviews as a single instance class.
export class ParseTreeRenderer {
    private readonly duration = 200;
    private readonly width = 1000;
    private readonly height = 1000;

    private nodeSizeFactor = 1;
    private nodeWidth = 60;
    private nodeHeight = 190;

    private rectW = 180;
    private rectH = 23;

    private root?: ParseTreeLayoutNode;

    private svg: d3.Selection<SVGElement, IParseTreeRenderNode, HTMLElement, unknown>;
    private topGroup: d3.Selection<SVGElement, IParseTreeRenderNode, HTMLElement, unknown>;

    private zoom: d3.ZoomBehavior<SVGElement, IParseTreeRenderNode>;
    private cluster: d3.ClusterLayout<IParseTreeRenderNode>;
    private tree: d3.TreeLayout<IParseTreeRenderNode>;

    private nodeSelection: ParseTreeSelection;
    private linkSelection: ParseTreeSelection;

    private data?: IRendererData;

    public constructor() {
        // The calling webpage must define an <svg /> node in the document.
        this.svg = d3.select<SVGElement, IParseTreeRenderNode>("svg")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("version", "1.1")
            .attr("viewBox", `0 0 ${this.width} ${this.height}`);

        this.topGroup = this.svg.append<SVGElement>("g");

        this.zoom = d3.zoom<SVGElement, IParseTreeRenderNode>()
            .scaleExtent([0.01, 3])
            .on("zoom", (event: d3.D3ZoomEvent<SVGElement, IParseTreeRenderNode>) => {
                this.topGroup.attr("transform", event.transform.toString());
            });

        this.tree = d3.tree<IParseTreeRenderNode>()
            .nodeSize([this.nodeWidth, this.nodeHeight])
            .separation((a, b) => {
                return a.parent === b.parent ? 1 : 1.4;
            });

        this.cluster = d3.cluster<IParseTreeRenderNode>()
            .nodeSize([this.nodeWidth, this.nodeHeight])
            .separation((a, b) => {
                return a.parent === b.parent ? 1 : 1.4;
            });
    }

    /**
     * @returns the currently active top level transformation.
     */
    public get transform(): string {
        return this.topGroup.attr("transform");
    }

    /**
     * Load new tree data, but keep the current draw offset.
     *
     * @param data The tree data to load.
     */
    public loadNewTree(data: Partial<IRendererData> & { parseTreeData: IParseTreeNode; }): void {
        this.data = {
            horizontal: true,
            useCluster: false,
            initialTranslateX: 200,
            initialTranslateY: 400,
            initialScale: 0.75,
            ...this.data,
            ...data,
        };

        this.svg.call(this.zoom)
            // eslint-disable-next-line @typescript-eslint/unbound-method
            .call(this.zoom.transform, d3.zoomIdentity
                .translate(this.data.initialTranslateX - this.rectW / 2, this.data.initialTranslateY)
                .scale(this.data.initialScale),
            )
            .on("dblclick.zoom", null);

        this.nodeWidth = this.data.horizontal ? 60 : 190;
        this.nodeHeight = this.data.horizontal ? 190 : 60;

        const x0 = this.root?.data.x0 ?? this.width / 2;
        const y0 = this.root?.data.y0 ?? this.height / 2;

        // d3.hierarchy returns a node without layout coordinates, so technically it's not a point node (yet).
        // However, once the layout process went through it becomes one.
        this.root = d3.hierarchy<IParseTreeRenderNode>(this.data.parseTreeData, (node) => {
            return node.children;
        }) as ParseTreeLayoutNode;

        if (this.data.useCluster) {
            this.cluster(this.root);
        } else {
            this.tree(this.root);
        }

        this.root.data.x0 = x0;
        this.root.data.y0 = y0;

        this.updateLayouts();
        this.update(this.root);
    }

    /**
     * Performs a relative size change of the layout node size.
     *
     * @param factor The factor for the relative change.
     */
    public changeNodeSize(factor: number): void {
        if (this.data) {
            this.nodeSizeFactor *= factor;

            if (this.data.horizontal) {
                this.tree.nodeSize([this.nodeWidth, this.nodeHeight * this.nodeSizeFactor]);
                this.cluster.nodeSize([this.nodeWidth, this.nodeHeight * this.nodeSizeFactor]);
                this.rectW = 0.9 * this.nodeHeight * this.nodeSizeFactor;
            } else {
                this.tree.nodeSize([this.nodeWidth * this.nodeSizeFactor, this.nodeHeight]);
                this.cluster.nodeSize([this.nodeWidth * this.nodeSizeFactor, this.nodeHeight]);
                this.rectW = 0.9 * this.nodeWidth * this.nodeSizeFactor;
            }

            this.applyLayoutChanges(0.5);
        }
    }

    public toggleOrientation(checkbox: HTMLInputElement): void {
        if (this.data) {
            this.data.horizontal = !checkbox.checked;
            this.nodeWidth = this.data.horizontal ? 60 : 190;
            this.nodeHeight = this.data.horizontal ? 190 : 60;

            if (this.data.horizontal) {
                this.tree.nodeSize([this.nodeWidth, this.nodeHeight * this.nodeSizeFactor]);
                this.cluster.nodeSize([this.nodeWidth, this.nodeHeight * this.nodeSizeFactor]);
            } else {
                this.tree.nodeSize([this.nodeWidth * this.nodeSizeFactor, this.nodeHeight]);
                this.cluster.nodeSize([this.nodeWidth * this.nodeSizeFactor, this.nodeHeight]);
            }

            this.applyLayoutChanges(1);
        }
    }

    public toggleTreeType(checkbox: HTMLInputElement): void {
        if (this.data) {
            this.data.useCluster = checkbox.checked;
            this.applyLayoutChanges(0.5);
        }
    }

    public initSwitches(): void {
        const switch1 = document.getElementById("switch1") as HTMLInputElement;
        if (switch1) {
            switch1.checked = this.data?.useCluster ?? false;
        }

        const switch2 = document.getElementById("switch2") as HTMLInputElement;
        if (switch2) {
            switch2.checked = !this.data?.horizontal ?? true;
        }
    }

    private update(parent: ParseTreeLayoutNode): void {
        if (!this.data || !this.root) {
            return;
        }

        const size = this.cluster.nodeSize() ?? [0, 0]; // [width, height]

        this.rectW = (this.data.horizontal ? size[1] : size[0]) * 0.9;

        const layoutNodes = this.root.descendants();
        this.nodeSelection = this.topGroup.selectAll<SVGElement, ParseTreeLayoutNode>(".tree-node")
            .data(layoutNodes, (node) => {
                return node.data.id;
            });

        const nodeEnter = this.nodeSelection.enter().append<SVGElement>("g")
            .attr("class", (d) => {
                if (!d.parent) {
                    return "tree-node tree-root";
                }

                let result = "tree-node";
                switch (d.data.type) {
                    case "terminal": {
                        result += " tree-leaf";
                        break;
                    }

                    case "error": {
                        result += " tree-error";
                        break;
                    }

                    default:
                }

                return result;
            })
            .attr("transform", () => {
                if (this.data?.horizontal) {
                    return `translate(${parent.data.y0 ?? 0}, ${parent.data.x0 ?? 0})`;
                }

                return `translate(${parent.data.x0 ?? 0}, ${parent.data.y0 ?? 0})`;
            })
            .style("opacity", 0)
            .on("click", this.click);

        nodeEnter.append("rect")
            .attr("width", this.rectW)
            .attr("height", this.rectH)
            .attr("rx", (d) => {
                return (d.data.type === "rule") ? 0 : 10;
            })
            .attr("ry", (d) => {
                return (d.data.type === "rule") ? 0 : 10;
            });

        this.createText(nodeEnter);
        this.updateExistingNodes(1);

        // Transition nodes also to their new position.
        this.nodeSelection
            .transition()
            .duration(this.duration)
            .attr("transform", (node) => {
                if (this.data?.horizontal) {
                    return `translate(${node.y}, ${node.x})`;
                }

                return `translate(${node.x}, ${node.y})`;
            })
            .style("opacity", 1);

        nodeEnter.attr("transform", (node) => {
            if (this.data?.horizontal) {
                return `translate(${node.y ?? 0}, ${node.x ?? 0})`;
            }

            return `translate(${node.x ?? 0}, ${node.y ?? 0})`;
        });

        // By using a slower transition to fade in the new elements we give the tree more time to make room for them.
        nodeEnter.transition()
            .duration(this.duration * 2)
            .style("opacity", 1);

        // Nodes to be removed.
        this.nodeSelection.exit().transition()
            .duration(this.duration)
            .style("opacity", 0)
            .remove();

        this.linkSelection = this.topGroup.selectAll<SVGElement, ParseTreeLayoutNode>(".tree-link")
            .data(layoutNodes.slice(1), (node) => {
                return node.data.id;
            });

        // On expand (links).
        const linkEnter = this.linkSelection.enter().insert("path", "g")
            .attr("class", "tree-link")
            .attr("d", this.computeLinks)
            .style("stroke-opacity", 0);

        // Transition existing links to their new position.
        this.linkSelection
            .transition()
            .duration(this.duration)
            .attr("d", this.computeLinks).style("stroke-opacity", 1);

        // Fade in new links.
        linkEnter
            .transition()
            .duration(this.duration * 2)
            .style("stroke-opacity", 1);

        // Fade out and remove old links.
        this.linkSelection.exit()
            .transition()
            .duration(this.duration)
            .style("stroke-opacity", 0)
            .remove();

        this.nodeSelection = this.topGroup.selectAll(".tree-node");
        this.linkSelection = this.topGroup.selectAll(".tree-link");

        // Stash the old positions for transition.
        layoutNodes.forEach((node) => {
            node.data.x0 = node.x;
            node.data.y0 = node.y;
        });
    }

    /**
     * Updates the cluster and tree layouts with the current node sizes.
     */
    private updateLayouts(): void {
        if (this.data) {
            if (this.data.horizontal) {
                this.rectW = this.nodeHeight * this.nodeSizeFactor;
                this.tree.nodeSize([this.nodeWidth, this.rectW]);
                this.cluster.nodeSize([this.nodeWidth, this.rectW]);
            } else {
                this.rectW = this.nodeWidth * this.nodeSizeFactor;
                this.tree.nodeSize([this.rectW, this.nodeHeight]);
                this.cluster.nodeSize([this.rectW, this.nodeHeight]);
            }
        }
    }

    /**
     * Re-render the hierarchy after changing layout related settings.
     *
     * @param durationFactor A timing factor which determines how quick animations should run.
     */
    private applyLayoutChanges(durationFactor: number): void {
        if (!this.data || !this.root) {
            return;
        }

        if (this.data.useCluster) {
            this.cluster(this.root);
        } else {
            this.tree(this.root);
        }
        this.updateExistingNodes(durationFactor);

        this.nodeSelection
            .transition()
            .duration(this.duration * durationFactor)
            .attr("transform", (node) => {
                if (this.data?.horizontal ?? true) {
                    return `translate(${node.y ?? 0}, ${node.x ?? 0})`;
                }

                return `translate(${node.x ?? 0}, ${node.y ?? 0})`;
            });

        this.linkSelection
            .transition()
            .duration(this.duration * durationFactor)
            .attr("d", this.computeLinks);
    }

    /**
     * Updates all existing nodes and their sub-elements.
     *
     * @param durationFactor A timing factor which determines how quick animations should run.
     */
    private updateExistingNodes(durationFactor: number): void {
        this.nodeSelection
            .transition()
            .duration(this.duration * durationFactor)
            .attr("class", (d) => {
                if (!d.parent) {
                    return "tree-node tree-root";
                }

                let result = "tree-node";
                switch (d.data.type) {
                    case "terminal": {
                        result += " tree-leaf";
                        break;
                    }
                    case "error": {
                        result += " tree-error";
                        break;
                    }

                    default:
                }

                return result;
            });

        const rectW = this.rectW;
        this.nodeSelection.select<SVGElement>("rect")
            .transition()
            .duration(this.duration * durationFactor)
            .attr("width", rectW);

        this.nodeSelection.select<SVGTextElement>(".node-text")
            .transition()
            .duration(this.duration * durationFactor)
            .attr("x", function () {
                return (rectW - this.getComputedTextLength()) / 2;
            });

        const isHorizontal = this.data?.horizontal ?? true;
        this.nodeSelection.select<SVGTextElement>(".token-value")
            .transition()
            .duration(this.duration * durationFactor)
            .attr("dx", function () {
                return isHorizontal ? rectW + 20 : (rectW - this.getComputedTextLength()) / 2;
            })
            .attr("dy", () => {
                return isHorizontal ? "0.25em" : "2.5em";
            })
            .text((d) => {
                if (d.data.type === "rule") {
                    return "";
                }

                if (d.data.type === "error") {
                    if (!d.data.symbol || d.data.symbol.tokenIndex === -1) {
                        return "<missing>";
                    }

                    return `<unexpected: ${d.data.symbol.text}>`;
                }

                return d.data.symbol?.text ?? "";
            });

        this.nodeSelection.select(".token-range")
            .transition()
            .duration(this.duration * durationFactor)
            .text((d) => {
                if (d.data.type !== "rule") {
                    if (!d.data.symbol || d.data.symbol.tokenIndex === -1) {
                        return "no index";
                    }

                    return `\u2A33 ${d.data.symbol.tokenIndex}`;
                }

                if (!d.data.range || d.data.range.length === 0) {
                    return "\u2A33 --";
                }

                if (d.data.range.length === 1) {
                    return `\u2A33 ${d.data.range.startIndex}`;
                }

                return `\u2A33 ${d.data.range.startIndex}-${d.data.range.stopIndex}`;
            });
    }

    /**
     * Hide or show child nodes on a click.
     *
     * @param _event The click event data.
     * @param node The hierarchy node on which the user clicked.
     */
    private click = (_event: MouseEvent, node: ParseTreeLayoutNode): void => {
        if (node.children) {
            node.data.childrenBackup = node.children;
            node.children = undefined;
        } else {
            node.children = node.data.childrenBackup;
            node.data.childrenBackup = undefined;
        }

        if (this.data && this.root) {
            if (this.data.useCluster) {
                this.cluster(this.root);
            } else {
                this.tree(this.root);
            }

            this.update(node);
        }
    };

    private createText(nodeEnter: ParseTreeSelection): void {
        // The node's text.
        let nodeText = nodeEnter.append("text")
            .attr("class", "node-text")
            .attr("y", this.rectH / 2)
            .attr("dy", ".35em")
            .text((node) => {
                return node.data.name;
            });

        // The bounding box is valid not before the node addition happened actually.
        nodeText.attr("x", (node, index, list) => {
            return (this.rectW - list[index].getComputedTextLength()) / 2;
        });

        // The node's token index/range info.
        nodeEnter.append("text")
            .attr("class", "token-range")
            .attr("x", 0)
            .attr("y", this.rectH / 2)
            .attr("dx", 0)
            .attr("dy", "-1.8em")
            .text((node) => {
                if (node.data.type !== "rule") {
                    if (node.data.symbol?.tokenIndex === -1) {
                        return "no index";
                    }

                    return `\u2A33 ${node.data.symbol?.tokenIndex ?? -1}`;
                }

                if (!node.data.range || node.data.range.length === 0) {
                    return "\u2A33 --";
                }

                if (node.data.range.length === 1) {
                    return `\u2A33 ${node.data.range.startIndex}`;
                }

                return `\u2A33 ${node.data.range.startIndex} - ${node.data.range.stopIndex}`;
            });

        // The node's content if this it is a terminal.
        nodeText = nodeEnter.append("text")
            .attr("class", "token-value")
            .attr("x", 0)
            .attr("y", this.rectH / 2)
            .attr("dy", this.data?.horizontal ?? true ? "0.25em" : "2.5em")
            .text((node) => {
                if (node.data.type === "rule") {
                    return "";
                }

                if (node.data.type === "error") {
                    if (!node.data.symbol || node.data.symbol.tokenIndex === -1) {
                        return "<missing>";
                    }

                    return `<unexpected: ${node.data.symbol.text}>`;
                }

                return node.data.symbol?.text ?? "";
            });

        nodeText.attr("dx", (node, index, list) => {
            return this.data?.horizontal ?? true
                ? this.rectW + 20
                : (this.rectW - list[index].getComputedTextLength()) / 2;
        });
    }

    private computeLinks = (node: ParseTreeLayoutNode) => {
        const parentX = node.parent?.x ?? 0;
        const parentY = node.parent?.y ?? 0;
        const nodeX = node.x;
        const nodeY = node.y;

        if (this.data?.horizontal ?? true) {
            const y = parentY + this.rectW / 2;

            return `M${nodeY},${(nodeX + this.rectH / 2)}C${y},${(nodeX + this.rectH / 2)} ` +
                `${(parentY + this.rectW / 2)},${(parentX + this.rectH / 2)} ${(parentY + this.rectW / 2)},` +
                `${(parentX + this.rectH / 2)}`;
        }

        return `M${(nodeX + this.rectW / 2)},${nodeY}C${(nodeX + this.rectW / 2)},${parentY} ` +
            `${(parentX + this.rectW / 2)},${(parentY + this.rectH / 2)} ${(parentX + this.rectW / 2)},` +
            `${(parentY + this.rectH / 2)}`;
    };
}
