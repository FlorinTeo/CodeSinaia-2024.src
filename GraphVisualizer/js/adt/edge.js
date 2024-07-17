
import { SCALE } from "./graph.js"
import { RADIUS } from "./graph.js";
import { HIGHLIGHT_PALLETE } from "./graph.js";
import { HIGHLIGHT_THICKNESS } from "./graph.js";
import { HIGHLIGHT_SENSITIVITY } from "./graph.js";

export const Direction = {
    None: 0,
    Fwd: 1,
    Bkw: 2,
    Bidi: 3
};

/**
 * Models an edge between two Nodes
 */
export class Edge {

    // Private class members
    #graphics;   // the graphics engine

    // Public class members
    node1;      // first Node
    node2;      // second Node
    direction;  // the Direction of the edge
    colorIndex; // color index in the HIGHLIGHT_PALLETE array

    constructor(graphics, fromNode, toNode) {
        this.#graphics = graphics;
        this.node1 = fromNode;
        this.node2 = toNode;
        this.colorIndex = 0;
        this.direction = Direction.Fwd;
    }

    repaint() {
        if (this.colorIndex != 0) {
            this.#graphics.drawLine(
                this.node1.x, this.node1.y,
                this.node2.x, this.node2.y,
                RADIUS[SCALE], RADIUS[SCALE],
                HIGHLIGHT_THICKNESS[SCALE], HIGHLIGHT_PALLETE[this.colorIndex]);
        }
    }

    addDirection(fromNode, toNode) {
        if (this.node1 === fromNode && this.node2 === toNode) {
            this.direction |= Direction.Fwd;
        } else if (this.node1 === toNode && this.node2 === fromNode) {
            this.direction |= Direction.Bkw;
        }
    }

    removeDirection(fromNode, toNode) {
        if (this.node1 === fromNode && this.node2 === toNode) {
            this.direction &= ~Direction.Fwd;
        } else if (this.node1 === toNode && this.node2 === fromNode) {
            this.direction &= ~Direction.Bkw;
        }
    }

    toggleColor(deltaIndex) {
        deltaIndex = Math.sign(deltaIndex);
        this.colorIndex = (deltaIndex < 0) ? 0 : Math.max(1,(this.colorIndex + deltaIndex) % HIGHLIGHT_PALLETE.length);
    }

    matchesNodes(fromNode, toNode) {
        return (this.node1 === fromNode && this.node2 === toNode)
            || (this.node1 === toNode && this.node2 === fromNode);
    }

    matchesIndex(colorIndex) {
        return this.colorIndex == colorIndex;
    }

    contains(node) {
        return (this.node1 === node || this.node2 === node);
    }

    getDistance(x, y) {
        let x1 = this.node1.x;
        let y1 = this.node1.y;
        let x2 = this.node2.x;
        let y2 = this.node2.y;
        let d = undefined;
        if (x >= Math.min(x1,x2) - HIGHLIGHT_SENSITIVITY[SCALE] 
           && x <= Math.max(x1,x2) + HIGHLIGHT_SENSITIVITY[SCALE]
           && y >= Math.min(y1,y2) - HIGHLIGHT_SENSITIVITY[SCALE]
           && y <= Math.max(y1, y2) + HIGHLIGHT_SENSITIVITY[SCALE]) {
            let a = y2 - y1;
            let b = x1 - x2;
            let c = y1 * x2 - y2 * x1;
            d = Math.abs((a * x + b * y + c) / Math.sqrt(a * a + b * b));
            if (d > HIGHLIGHT_SENSITIVITY[SCALE]) {
                d = undefined;
            }
        }
        return d;
    }
}