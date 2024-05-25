import { Node } from "./node.js";
import { Highlight } from "./highlight.js";

export const HIGHLIGHT_PALLETE = ['#EBEBEB', '#FFFD55', '#6EFBFF', '#FFCACA', '#93FF2D', '#ECA4FF'];

/**
 * Models the entire Graph
 */
export class Graph {
    /*
    Class members:
        graphics   - the graphics engine
        nodes      - array of Node objects
        highlights - array of [fromNode, toNode, color] highlighting entries
    */
    #nodes;
    #highlights;
    #graphics;

    constructor(graphics) {
        this.#graphics = graphics;
        this.clear();
    }

    repaint() {
        for(const highlight of this.#highlights) {
            highlight.repaint();
        }
        this.traverse((node)=>{
            node.repaint();
        });
    }

    traverse(lambda) {
        // reset all the node markers
        for(const node of this.#nodes) {
            node.marker = 0;
        }
        // repeteadly ...
        let done = false;
        while (!done) {
            done = true;
            // look for an un-marked node
            for(const node of this.#nodes) {
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
        let node = this.#nodes.find(n => n.isTarget(x, y));
        return (node != undefined) ? node : null;
    }

    getHighlight(x, y) {
        let minD = Infinity;
        let minHighlight = undefined;
        for(const highlight of this.#highlights) {
            let d = highlight.getDistance(x, y);
            if (d < minD) {
                minD = d;
                minHighlight = highlight;
            }
        }
        return minHighlight;
    }

    addNode(label, x, y) {
        let node = new Node(this.#graphics, label, x, y);
        if (node )
        this.#nodes.push(node);
    }

    removeNode(node) {
        for(const otherNode of this.#nodes) {
            if (otherNode.hasEdge(node)) {
                otherNode.removeEdge(node);
            }
        }
        this.#nodes = this.#nodes.filter(n => !(n === node));
        this.#highlights = this.#highlights.filter(h => !h.contains(node));
    }

    resetEdge(fromNode, toNode) {
        if (fromNode.hasEdge(toNode)) {
            fromNode.removeEdge(toNode);
            this.#highlights = this.#highlights.filter(h => !h.matches(fromNode, toNode));
        } else {
            fromNode.addEdge(toNode);
        }
    }

    resetHighlight(fromNode, toNode) {
        if (this.#highlights.some(h => h.matches(fromNode, toNode))) {
            this.#highlights = this.#highlights.filter(h => !h.matches(fromNode, toNode));
        } else if (fromNode.hasEdge(toNode) || toNode.hasEdge(fromNode)) {
            this.#highlights.push(new Highlight(this.#graphics, fromNode, toNode));
        }
    }

    matchAll(fMatch) {
        for(const node of this.#nodes) {
            if (!fMatch(node)) {
                return false;
            }
        }
        return true;
    }

    size() {
        return this.#nodes.length;
    }

    clear() {
        this.#nodes = [];
        this.clearHighlights();
    }

    clearHighlights() {
        this.#highlights = [];
    }

    countHighlights() {
        return this.#highlights.length;
    }

    toString(brief = false) {
        let output = '';
        for(const node of this.#nodes) {
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

        this.#nodes = Array.from(newGraph.values());
        return true;
    }
}
