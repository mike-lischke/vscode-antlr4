/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ICallGraphEntry, IVSCode } from "./types.js";
import { SymbolKind } from "../types.js";

interface ICallGraphRenderNode extends ICallGraphEntry {
    class: string;
    key: string;

    parent: ICallGraphRenderNode;
    children: ICallGraphRenderNode[];

    // Fields used in mouse events to mark if this node is either the source or the target node in
    // the currently selected link.
    isSource: boolean;
    isTarget: boolean;
    hop?: number;
}

// Type aliases for better handling/reading.
type CallGraphLayoutNode = d3.HierarchyPointNode<ICallGraphRenderNode>;
type CallGraphNodeSelection = d3.Selection<SVGElement, CallGraphLayoutNode, SVGElement, ICallGraphRenderNode>;
type CallGraphLinkSelection = d3.Selection<SVGElement, ICallGraphLayoutNodeLink, SVGElement, ICallGraphRenderNode>;

interface ICallGraphLayoutNodeLink {
    source: CallGraphLayoutNode;
    target: CallGraphLayoutNode;
}

interface IState {
    traverse: boolean;
    hideTokens: boolean;
    delay: number;
}

export class CallGraphRenderer {
    private readonly initialDiameter = 1000;

    private diameter = this.initialDiameter;
    private initialScale = 0.75;

    private svg: d3.Selection<SVGElement, ICallGraphRenderNode, HTMLElement, unknown>;
    private topGroup: d3.Selection<SVGElement, ICallGraphRenderNode, HTMLElement, unknown>;
    private cluster: d3.ClusterLayout<ICallGraphRenderNode>;

    private nodeSelection: CallGraphNodeSelection;
    private linkSelection: CallGraphLinkSelection;

    private state: IState;
    private timer: NodeJS.Timeout;
    private visited: CallGraphLayoutNode[] = [];

    public constructor(private vscode: IVSCode, private data: ICallGraphEntry[]) {

        this.state = this.vscode.getState() ?? {
            traverse: false,
            hideTokens: false,
            delay: 100,
        };

        const delayInput = document.getElementById("traverseDelayInput") as HTMLInputElement;
        delayInput.value = this.state.delay.toString();

        const radius = this.diameter / 2;

        this.svg = d3.select<SVGElement, ICallGraphRenderNode>("svg")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("version", "1.1")
            .attr("viewBox", `0 0 ${this.diameter} ${this.diameter}`);

        this.topGroup = this.svg.append("g");

        const zoom = d3.zoom()
            .scaleExtent([0.1 * this.initialScale, 10 * this.initialScale])
            .on("zoom", (event: d3.D3ZoomEvent<SVGElement, ICallGraphRenderNode>) => {
                this.topGroup.attr("transform", event.transform.toString());
            });

        this.svg
            .call(zoom)
            // eslint-disable-next-line @typescript-eslint/unbound-method
            .call(zoom.transform, d3.zoomIdentity
                .translate(radius, radius)
                .scale(this.initialScale),
            )
            .on("dblclick.zoom", null);

        this.cluster = d3.cluster<ICallGraphRenderNode>().size([360, radius * 0.9]);
    }

    public render(): void {
        const radius = this.diameter / 2;

        this.cluster.size([360, radius * 0.9]);

        const line = d3.lineRadial<CallGraphLayoutNode>()
            .radius((node) => {
                return node.y;
            })
            .angle((node) => {
                return node.x / 180 * Math.PI;
            })
            .curve(d3.curveBundle.beta(0.75));

        this.linkSelection = this.topGroup.append("g").selectAll<SVGElement, ICallGraphLayoutNodeLink>(".link");
        this.nodeSelection = this.topGroup.append("g").selectAll<SVGElement, CallGraphLayoutNode>(".node");

        // d3.hierarchy returns a node without layout coordinates, so technically it's not a point node (yet).
        // However, once the cluster layout process went through it becomes one.
        const root = d3.hierarchy(this.packageHierarchy(this.data), (d) => {
            return d.children;
        }) as CallGraphLayoutNode;
        const nodes = root.descendants();

        const linkPairs = this.packageReferences(nodes);

        this.cluster(root);

        this.linkSelection = this.linkSelection
            .data(linkPairs)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", (link) => {
                return line(link.source.path(link.target));
            });

        this.nodeSelection = this.nodeSelection
            .data(nodes.filter((n) => {
                return !n.children;
            }))
            .enter().append("text")
            .attr("class", (d) => {
                return "node " + d.data.class;
            })
            .attr("dy", "0.31em")
            .attr("transform", (d) => {
                return `rotate(${(d.x - 90)})translate(${(d.y + 10)},0)` +
                    (d.x < 180 ? "" : "rotate(180)");
            })
            .style("text-anchor", (d) => {
                return d.x < 180 ? "start" : "end";
            })
            .text((d) => {
                return d.data.key;
            })
            .on("mouseover", this.onMouseOver)
            .on("mouseout", this.onMouseOut);
    }

    public changeDiameter(factor: number): void {
        this.topGroup.selectChildren().remove();

        this.diameter *= factor;
        this.diameter = this.diameter < 100 ? 100 : (this.diameter > 10000 ? 10000 : this.diameter);

        this.render();
    }

    public toggleTraverse(): void {
        this.state.traverse = !this.state.traverse;
        this.vscode.setState(this.state);
    }

    public updateTraverseDelay(value: string): void {
        console.log(value);
        const delay = parseInt(value, 10);
        this.state.delay = isNaN(delay) ? 300 : delay;
        this.vscode.setState(this.state);
    }

    public toggleHideTokens(): void {
        this.state.hideTokens = !this.state.hideTokens;
        this.vscode.setState(this.state);
        this.linkSelection.remove();
        this.nodeSelection.remove();
        this.render();
    }

    private linkTarget = (hop: number, nodes: CallGraphLayoutNode[]): void => {
        this.visited.push(...nodes);
        const kids: CallGraphLayoutNode[] = [];
        this.linkSelection
            .classed("link-source", (link) => {
                const n = this.visited.find((n) => { return (n === link.source); });
                if (n !== undefined) {
                    if (this.visited.find((n) => { return (n === link.target); }) === undefined) {
                        kids.push(link.target);
                        link.target.data.isTarget = true;
                        link.target.data.hop = hop;
                    }

                    return true;
                } else {
                    return false;
                }
            })
            .classed("link-dimmed", (link) => {
                return this.visited.find((n) => {
                    return (n === link.source || n === link.target);
                }) === undefined;
            });

        this.nodeSelection
            .classed("node-target", (n) => {
                return n.data.isTarget;
            })
            .text((d) => {
                if (d.data.hop) {
                    return `[${d.data.hop}] ${d.data.key}`;
                }

                return `${d.data.key}`;
            });

        if (this.state.traverse) {
            if (kids.length > 0) {
                this.timer = setTimeout(() => {
                    this.linkTarget(hop + 1, kids);
                }, this.state.delay);
            }
        }
    };

    private onMouseOver = (_event: MouseEvent, node: CallGraphLayoutNode) => {
        this.visited = [];
        // Reset all marker flags.
        this.nodeSelection.each((n) => {
            n.data.isSource = false;
            n.data.isTarget = false;
        });

        // Set link element CSS classes based on the type of node.
        // Set also the isSource/isTarget flags for node CSS classes.
        this.linkSelection
            .classed("link-target", (link) => {
                if (link.target === node) {
                    return link.source.data.isSource = true;
                } else {
                    return false;
                }
            });
        this.linkTarget(0, [node]);

        this.nodeSelection
            .classed("node-target", (n) => {
                return n.data.isTarget;
            })
            .classed("node-source", (n) => {
                return n.data.isSource;
            });
    };

    private onMouseOut = (_event: MouseEvent, _node: CallGraphLayoutNode) => {
        clearTimeout(this.timer);
        this.linkSelection.classed("link-dimmed", false);
        this.linkSelection
            .classed("link-target", false)
            .classed("link-source", false);

        this.nodeSelection
            .text((d) => {
                d.data.hop = undefined;

                return `${d.data.key}`;
            })
            .classed("node-target", false)
            .classed("node-source", false);
    };

    /**
     * Converts the list of call graph entries into a hierarchy.
     *
     * @param entries The list of data entries from the referenced grammars.
     *
     * @returns The root node of the hierarchy.
     */
    private packageHierarchy(entries: ICallGraphEntry[]): ICallGraphRenderNode {
        const map: { [key: string]: ICallGraphRenderNode; } = {};
        const modules: string[] = [];

        const find = (name: string, rule?: ICallGraphEntry) => {
            let node = map[name];
            if (!node) {
                node = rule as ICallGraphRenderNode || {
                    name,
                    children: [],
                };
                map[name] = node;

                if (name.length > 0) {
                    const i = name.lastIndexOf(".");
                    node.parent = find(name.substring(0, i));
                    node.parent.children.push(node);

                    // Pick one out of 10 color classes for this node.
                    let index = modules.indexOf(node.parent.name);
                    if (index < 0) {
                        modules.push(node.parent.name);
                        index = modules.length - 1;
                    }

                    node.class = `module-${index % 10}`;
                    node.key = name.substring(i + 1);
                }
            }

            return node;
        };

        entries.forEach((rule) => {
            if (this.state.hideTokens) {
                switch (rule.kind) {
                    // case SymbolKind.BuiltInLexerToken:
                    case SymbolKind.VirtualLexerToken:
                    case SymbolKind.FragmentLexerToken:
                    case SymbolKind.LexerRule:
                        return;
                    default:
                        break;
                }
            }
            find(rule.name, rule);
        });

        return map[""];
    }

    private packageReferences(nodes: CallGraphLayoutNode[]): ICallGraphLayoutNodeLink[] {
        const map: { [key: string]: CallGraphLayoutNode; } = {};
        const references: ICallGraphLayoutNodeLink[] = [];

        // Compute a map from name to node.
        nodes.forEach((node) => {
            map[node.data.name] = node;
        });

        // For each import, construct a link from the source to target node.
        nodes.forEach((node) => {
            const addReferences = (ref: string[]): void => {
                if (ref) {
                    ref.forEach((name) => {
                        if (map[name]) {
                            references.push({
                                source: map[node.data.name],
                                target: map[name],
                            });
                        }
                    });
                }
            };
            addReferences(node.data.rules);
            addReferences(node.data.tokens);
        });

        return references;
    }

}
