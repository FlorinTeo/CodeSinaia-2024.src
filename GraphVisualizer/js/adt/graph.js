import { Node } from "./node.js";
import { Highlight } from "./highlight.js";
import { Direction } from "./highlight.js";

export const HIGHLIGHT_PALLETE = ['#EBEBEB', '#FFFD55', '#6EFBFF', '#FFCACA', '#93FF2D', '#ECA4FF'];

/**
 * Models the entire Graph
 */
export class Graph {
    // Private class members
    #graphics;  // the graphics engine

    // Public class members
    nodes; // array of Node objects
    edges; // array of Edge objects

    constructor(graphics) {
        this.#graphics = graphics;
        this.clear();
    }

    clear() {
        this.nodes = [];
        this.edges = [];
    }

    size() {
        return this.nodes.length;
    }

    repaint() {
        for(const edge of this.edges) {
            edge.repaint();
        }
        this.traverse((node)=>{
            node.repaint();
        });
    }

    traverse(lambda) {
        // reset all the node markers
        for(const node of this.nodes) {
            node.marker = 0;
        }
        // repeteadly ...
        let done = false;
        while (!done) {
            done = true;
            // look for an un-marked node
            for(const node of this.nodes) {
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
        return prevLabel;
    }

    getNode(x, y) {
        let node = this.nodes.find(n => n.isTarget(x, y));
        return (node != undefined) ? node : null;
    }

    addNode(label, x, y) {
        let node = new Node(this.#graphics, label, x, y);
        if (node )
        this.nodes.push(node);
    }

    removeNode(node) {
        for(const otherNode of this.nodes) {
            if (otherNode.hasEdge(node)) {
                otherNode.removeEdge(node);
            }
        }
        this.nodes = this.nodes.filter(n => !(n === node));
        this.edges = this.edges.filter(e => !e.contains(node));
    }

    hasNodeHighlights() {
        let hNodes = this.nodes.filter(n => n.colorIndex != 0);
        return hNodes.length > 0;
    }

    getEdge(x, y) {
        let minD = Infinity;
        let minEdge = undefined;
        for(const edge of this.edges) {
            let d = edge.getDistance(x, y);
            if (d && d < minD) {
                minD = d;
                minEdge = edge;
            }
        }
        return minEdge;
    }

    resetEdge(fromNode, toNode) {
        let edge = this.edges.filter(e => e.matchesNodes(fromNode, toNode))[0];
        if (fromNode.hasEdge(toNode)) {
            fromNode.removeEdge(toNode);
            edge.removeDirection(fromNode, toNode);
            if (edge.direction == Direction.None) {
                this.edges = this.edges.filter(e => !e.matchesNodes(fromNode, toNode));
            }
        } else {
            fromNode.addEdge(toNode);
            if (edge == null) {
                this.edges.push(new Highlight(this.#graphics, fromNode, toNode));
            } else {
                edge.addDirection(fromNode, toNode);
            }
        }
    }

    hasEdgeHighlights() {
        return (this.edges.filter(e => !e.matchesIndex(0)).length) > 0;
    }

    toString(brief = false) {
        let output = '';
        for(const node of this.nodes) {
            output += node.toString(brief);
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
            const {success, label, x, y, toLabels} = Node.fromString(line);
            if (!success) {
                alert("Input is not a serialized graph!");
                return false;
            }
            newGraph.set(label, new Node(this.#graphics, label, x, y));
            newEdges.set(label, toLabels);
        }

        for(const [fromLabel, toLabels] of newEdges) {
            for(const toLabel of toLabels) {
                if (!newGraph.has(toLabel)) {
                    alert(`Invalid target in edge ${fromLabel} > ${toLabel}`);
                    return false;
                }
                this.resetEdge(newGraph.get(fromLabel), newGraph.get(toLabel));
            }
        }

        this.nodes = Array.from(newGraph.values());
        return true;
    }
}
