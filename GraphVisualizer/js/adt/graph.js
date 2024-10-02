import { Node } from "./node.js";
import { VarNode } from "./node.js";
import { Edge } from "./edge.js";
import { Direction } from "./edge.js";

export let SCALE = 0;
export const LINE_WIDTH = [1, 0.6, 0.5];
export const RADIUS = [16, 12, 8];
export const FONT = ["bold 14px Consolas", "12px Consolas", null]
export const ARROW_WIDTH = [5, 3, 2];
export const ARROW_LENGTH = [8, 5, 3];
export const HIGHLIGHT_THICKNESS = [6, 5, 4];
export const HIGHLIGHT_SENSITIVITY = [10, 8, 6];
export const HIGHLIGHT_PALLETE = ['#EBEBEB', '#FFFD55', '#6EFBFF', '#FFCACA', '#93FF2D', '#ECA4FF'];

export const ColorIndex = {
    Gray: 0,
    Yellow: 1,
    Blue: 2,
    Red: 3,
    Green: 4,
    Magenta: 5
};

function adjustScale(nNodes) {
    if (nNodes <= 15) {
        SCALE = 0;
    } else if (nNodes <= 35) {
        SCALE = 1;
    } else {
        SCALE = 2;
    }
}

/**
 * Models the entire Graph
 */
export class Graph {
    // Private class members
    #graphics;  // the graphics engine

    // Public class members
    nodes; // array of Node objects
    edges; // array of Edge objects
    varNodes; // array of VarNode objects

    #checkAndAdjustVersions(label) {
        let clashingNodes = this.nodes.filter(n => n.label == label);
        let maxVersion = clashingNodes.reduce((accumulator, n) => Math.max(accumulator, n.version), 0);
        if (clashingNodes.length > 1) {
            clashingNodes.filter(n => n.version == 0).forEach((n) => { n.version = ++maxVersion; });
        } else if (clashingNodes.length == 1) {
            clashingNodes[0].version = 0;
        }
        return maxVersion;
    }

    constructor(graphics) {
        this.#graphics = graphics;
        this.clear();
    }

    clear() {
        this.nodes = [];
        this.edges = [];
        this.varNodes = [];
        adjustScale(0);
    }

    size() {
        return this.nodes.length;
    }

    repaint() {
        // repaint all edge highlights, if any
        for (const edge of this.edges) {
            edge.repaint();
        }
        // repaint graph
        this.traverse((node) => {
            node.repaint();
        });
        // repaint variables (varNodes), if any
        for (const varNode of this.varNodes) {
            varNode.repaint();
        }
    }

    traverse(lambda) {
        // reset all the node markers
        for (const node of this.nodes) {
            node.marker = 0;
        }
        // repeteadly ...
        let done = false;
        while (!done) {
            done = true;
            // look for an un-marked node
            for (const node of this.nodes) {
                // and if found, traverse the node and do it all over again
                if (node.marker == 0) {
                    node.traverse(lambda);
                    done = false;
                    break;
                }
            }
        }
    }

    reLabel(node, newLabel) {
        let prevLabel = node.label;
        node.label = newLabel;
        if (!(node instanceof VarNode)) {
            this.#checkAndAdjustVersions(prevLabel);
            this.#checkAndAdjustVersions(newLabel);
        }
        return prevLabel;
    }

    getNode(x, y) {
        let node = this.nodes.find(n => n.isTarget(x, y));
        if (node != undefined) {
            return node;
        }
        node = this.varNodes.find(v => v.isTarget(x, y));
        return (node != undefined) ? node : null;
    }

    // #region - add/remove Node
    addNode(label, x, y) {
        let node = new Node(this.#graphics, label, x, y);
        if (node) {
            this.nodes.push(node);
            this.#checkAndAdjustVersions(node.label);
            adjustScale(this.nodes.length);
        }
        return node;
    }

    removeNode(node) {
        for (const otherNode of this.nodes) {
            if (otherNode.hasEdge(node)) {
                otherNode.removeEdge(node);
            }
        }
        this.nodes = this.nodes.filter(n => !(n === node));
        this.edges = this.edges.filter(e => !e.contains(node));
        this.varNodes = this.varNodes.filter(v => !v.hasEdge(node));
        adjustScale(this.nodes.length);
        this.#checkAndAdjustVersions(node.label);
        return node;
    }
    // #endregion - add/remove Node

    // #region - add/remove VarNode
    addVarNode(label, x, y) {
        let vNode = new VarNode(this.#graphics, label, x, y);
        this.moveNode(vNode, x, y);
        this.varNodes.push(vNode);
        return vNode;
    }

    moveNode(node, x, y) {
        if (node instanceof VarNode) {
            let refNode = null;
            this.nodes.forEach(n => {
                refNode = (refNode == null) || (node.distance(refNode) > node.distance(n)) ? n : refNode;
            });
            // set refNode as reference to this VarNode if it is within grasp
            if (refNode != null && node.distance(refNode) <= 4 * RADIUS[SCALE]) {
                node.setRef(refNode);
            } else {
                node.setRef(null);
            }
        } else {
            let dx = x - node.x;
            let dy = y - node.y;
            this.varNodes.forEach(vN => {
                if (vN.hasEdge(node)) {
                    vN.x += dx;
                    vN.y += dy;
                }
            });
        }
        node.x = x;
        node.y = y;
    }

    removeVarNode(vNode) {
        this.varNodes = this.varNodes.filter(v => !(v == vNode));
        return vNode;
    }
    // #endregion - add/remove VarNode

    // #region - Edge methods
    hasNodeHighlights() {
        let hNodes = this.nodes.filter(n => n.colorIndex != 0);
        return hNodes.length > 0;
    }

    getEdge(x, y) {
        let edge = undefined;
        if (x instanceof Node) {
            let fromNode = x;
            let toNode = y;
            edge = this.edges.filter(e => e.matchesNodes(fromNode, toNode))[0];
        } else {
            let minD = Infinity;
            let minEdge = undefined;
            for (const edge of this.edges) {
                let d = edge.getDistance(x, y);
                if (d && d < minD) {
                    minD = d;
                    minEdge = edge;
                }
            }
            edge = minEdge;
        }
        
        return edge;
    }

    hasEdge(fromNode, toNode, bidirectional) {
        return bidirectional
            ? fromNode.hasEdge(toNode) && toNode.hasEdge(fromNode)
            : fromNode.hasEdge(toNode);
    }

    addEdge(fromNode, toNode, bidirectional) {
        if (!fromNode.hasEdge(toNode)) {
            fromNode.addEdge(toNode);
            let edge = this.edges.filter(e => e.matchesNodes(fromNode, toNode))[0];
            if (edge == null) {
                this.edges.push(new Edge(this.#graphics, fromNode, toNode));
            } else {
                edge.addDirection(fromNode, toNode);
            }
        }
        if (bidirectional && !toNode.hasEdge(fromNode)) {
            toNode.addEdge(fromNode);
            let edge = this.edges.filter(e => e.matchesNodes(toNode, fromNode))[0];
            if (edge == null) {
                this.edges.push(new Edge(this.#graphics, toNode, fromNode));
            } else {
                edge.addDirection(toNode, fromNode);
            }
        }
    }

    removeEdge(fromNode, toNode, bidirectional) {
        if (fromNode.hasEdge(toNode)) {
            fromNode.removeEdge(toNode);
            let edge = this.edges.filter(e => e.matchesNodes(fromNode, toNode))[0];
            edge.removeDirection(fromNode, toNode);
            if (edge.direction == Direction.None) {
                this.edges = this.edges.filter(e => !e.matchesNodes(fromNode, toNode));
            }
        }
        if (bidirectional && toNode.hasEdge(fromNode)) {
            toNode.removeEdge(fromNode);
            let edge = this.edges.filter(e => e.matchesNodes(toNode, fromNode))[0];
            edge.removeDirection(toNode, fromNode);
            if (edge.direction == Direction.None) {
                this.edges = this.edges.filter(e => !e.matchesNodes(toNode, fromNode));
            }
        }
    }

    hasEdgeHighlights() {
        return (this.edges.filter(e => !e.matchesIndex(0)).length) > 0;
    }
    // #endregion - Edge methods

    toString(brief = false) {
        let output = '';
        let maxLabel = this.nodes.reduce(
            (maxLabel, n) => Math.max(maxLabel, (n.version == 0 ? `${n.label}`.length : `${n.label}#${n.version}`.length), 0),
            0);
        for (const node of this.nodes) {
            output += node.toString(brief, maxLabel + 1);
            output += '\n';
        }
        return output;
    }

    fromString(strGraph) {
        let newGraph = new Map();
        let newEdges = new Map();
        for (const line of strGraph.split('\n')) {
            if (line.trim().length === 0) {
                continue;
            }
            const { success, label, version, x, y, toVersionedLabels } = Node.fromString(line);
            if (!success) {
                alert("Input is not a graph!");
                return false;
            }
            let fromVersionedLabel = version ? `${label}#${version}` : `${label}`;
            newGraph.set(fromVersionedLabel, new Node(this.#graphics, label, x, y, version));
            newEdges.set(fromVersionedLabel, toVersionedLabels);
        }

        for (const [fromVersionedLabel, toVersionedLabels] of newEdges) {
            for (const toVersionedLabel of toVersionedLabels) {
                if (!newGraph.has(toVersionedLabel)) {
                    alert(`Invalid target in edge ${fromVersionedLabel} > ${toVersionedLabel}`);
                    return false;
                }
                this.addEdge(newGraph.get(fromVersionedLabel), newGraph.get(toVersionedLabel));
            }
        }
        this.nodes = Array.from(newGraph.values());
        adjustScale(this.nodes.length);
        return true;   
    }
}