import { Node } from "./node.js"

/**
 * Models the entire Graph
 */
export class Graph {
    /*
    Class members:
        graphics  - the graphics engine
        nodes     - Map of <label, Node> entries
    */
    #nodes;
    #graphics;

    constructor(graphics) {
        this.#graphics = graphics;
        this.clear();
    }

    repaint() {
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
    }

    resetEdge(fromNode, toNode) {
        if (fromNode.hasEdge(toNode)) {
            fromNode.removeEdge(toNode);
        } else {
            fromNode.addEdge(toNode);
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
