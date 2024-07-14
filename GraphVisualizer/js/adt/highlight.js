import { RADIUS } from './node.js';
import { HIGHLIGHT_PALLETE } from './graph.js';

export const HIGHLIGHT_THICKNESS = 6;
const HIGHLIGHT_SENSITIVITY = 10;

export const Direction = {
    None: 0,
    Fwd: 1,
    Bkw: 2,
    Bidi: 3
};

/**
 * Models the highlight line between two nodes
 */
export class Highlight {

    // Private class members
    #graphics;   // the graphics engine

    // Public class members
    node1;           // first Node
    node2;           // second Node
    direction;       // the Direction of the edge
    hightlightIndex; // highlight color index

    constructor(graphics, fromNode, toNode) {
        this.#graphics = graphics;
        this.node1 = fromNode;
        this.node2 = toNode;
        this.hightlightIndex = 0;
        this.direction = Direction.Fwd;
    }

    repaint() {
        if (this.hightlightIndex != 0) {
            this.#graphics.drawLine(
                this.node1.x, this.node1.y,
                this.node2.x, this.node2.y,
                RADIUS, RADIUS,
                HIGHLIGHT_THICKNESS, HIGHLIGHT_PALLETE[this.hightlightIndex]);
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

    toggleHighlight(deltaIndex) {
        deltaIndex = Math.sign(deltaIndex);
        this.hightlightIndex = (deltaIndex < 0) ? 0 : Math.max(1,(this.hightlightIndex + deltaIndex) % HIGHLIGHT_PALLETE.length);
    }

    matchesNodes(fromNode, toNode) {
        return (this.node1 === fromNode && this.node2 === toNode)
            || (this.node1 === toNode && this.node2 === fromNode);
    }

    matchesIndex(highlightIndex) {
        return this.hightlightIndex == highlightIndex;
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
        if (x >= Math.min(x1,x2) - HIGHLIGHT_SENSITIVITY && x <= Math.max(x1,x2) + HIGHLIGHT_SENSITIVITY
           && y >= Math.min(y1,y2) - HIGHLIGHT_SENSITIVITY && y <= Math.max(y1, y2) + HIGHLIGHT_SENSITIVITY) {
            let a = y2 - y1;
            let b = x1 - x2;
            let c = y1 * x2 - y2 * x1;
            d = Math.abs((a * x + b * y + c) / Math.sqrt(a * a + b * b));
            if (d > HIGHLIGHT_SENSITIVITY) {
                d = undefined;
            }
        }
        return d;
    }
}