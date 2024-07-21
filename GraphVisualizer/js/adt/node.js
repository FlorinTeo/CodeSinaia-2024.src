import { HIGHLIGHT_PALLETE } from "./graph.js";
import { SCALE } from "./graph.js";
import { LINE_WIDTH } from "./graph.js";
import { RADIUS } from "./graph.js";
import { FONT } from "./graph.js";
import { ARROW_WIDTH } from "./graph.js";
import { ARROW_LENGTH } from "./graph.js";

/**
 * Models a node in the Graph
 */
export class Node {
    // Private class members
    #graphics;  // the graphics engine

    // Public class members
    x;          // x coordinate of the center of this node
    y;          // y coordinate of the center of this node
    label;      // text to be printed inside the node
    version;    // 0 if label is unique in the graph, 1, 2, ... if labels clash
    state;      // public state holder for this node
    neigbhors;  // array of Node object, the neighbors of this node
    colorIndex; // color index of this node in the HIGHLIGHT_PALLETE array
    marker;     // internal state holder for this node 

    constructor(graphics, label, x, y, version) {
        this.#graphics = graphics;
        this.x = x;
        this.y = y;
        this.label = label;
        this.version = version ? version : 0;
        this.state = 0;
        this.neighbors = [];
        this.neighbors = [];
        this.colorIndex = 0;
        this.marker = 0;
    }

    toString() {
        return `<b>${this.label}</b>: ${this.state}`;
    }

    toggleColor(deltaIndex) {
        deltaIndex = Math.sign(deltaIndex);
        this.colorIndex = (deltaIndex < 0) ? 0 : Math.max(1,(this.colorIndex + deltaIndex) % HIGHLIGHT_PALLETE.length);
    }

    repaint() {
        for(const neighbor of this.neighbors) {
            if (neighbor.marker == 0 || !neighbor.hasEdge(this)) {
                this.#graphics.drawLine(
                    this.x, this.y,
                    neighbor.x, neighbor.y,
                    RADIUS[SCALE],
                    RADIUS[SCALE],
                    LINE_WIDTH[SCALE],
                    'black');
            }
            this.#graphics.drawArrow(
                this.x, this.y,
                neighbor.x, neighbor.y,
                RADIUS[SCALE],
                ARROW_LENGTH[SCALE],
                ARROW_WIDTH[SCALE],
                LINE_WIDTH[SCALE],
                'black');
        }
        this.#graphics.drawNode(
            this.label,
            this.x, this.y,
            RADIUS[SCALE],
            LINE_WIDTH[SCALE],
            FONT[SCALE],
            HIGHLIGHT_PALLETE[this.colorIndex]);
    }

    traverse(lambda) {
        this.marker = 1;
        lambda(this);
        for(const node of this.neighbors) {
            if (node.marker == 0) {
                node.traverse(lambda);
            }
        }
    }

    isTarget(x, y) {
        let d = Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
        return d <= RADIUS[SCALE];
    }

    hasEdge(node) {
        return this.neighbors.some(n => (n === node));
    }

    addEdge(node) {
        this.neighbors.push(node);
        this.resortEdges();
    }

    removeEdge(node) {
        this.neighbors = this.neighbors.filter(n => !(n === node));
        this.resortEdges();
    }

    resortEdges() {
        this.neighbors.sort((n1, n2) => n1.x < n2.x ? -1 : n1.x > n2.x ? 1 : 0);
    }

    toString(brief = false, spacing = 0) {
        let output = `${this.label}`;
        
        // add version, if a non default one is set
        if (this.version != 0) {
            output += `#${this.version}`;
        }
        
        // add spacing as needed
        if (output.length < spacing) {
            output += " ".repeat(spacing - output.length);
        }
        output += ": ";

        // add either the State or the position and neighbors, as needed
        if (brief) {
            if (this.state instanceof Node) {
                output += `State__> ${this.state.label}`;
            } else {
                output += `State___ ${this.state}`;
            }
            if (this.cost != null) {
                output += ` | Cost___ ${this.cost}`;
            }
        } else {
            output += `${this.x},${this.y}\t>`;
            for(const neighbor of this.neighbors) {
                output += ` ${neighbor.label}`;
                if (neighbor.version != 0) {
                    output += `#${neighbor.version}`;
                }
            }
        }
        return output;
    }

    static fromString(strNode) {
        let strParts = strNode.split(/\s+/);
        let success = (strParts.length > 3);
        if (success) {
            success = (strParts[1] == ':') && (strParts[3] == '>');
        }
        if (success) {
            var strCoords = strParts[2].split(',');
            success = (strCoords.length == 2) && !isNaN(strCoords[0]) && !isNaN(strCoords[1]);
        }
        if (success) {
            let [label, version] = strParts[0].split("#");
            return {
                success: true,
                label: label,
                version: version,
                x: Number(strCoords[0]),
                y: Number(strCoords[1]),
                toVersionedLabels: (strParts.length) > 4 ? strParts.slice(4) : [],
            };
        }
        return {success: false};
    }
}