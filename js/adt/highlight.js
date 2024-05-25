import { RADIUS } from './node.js';
import { HIGHLIGHT_PALLETE } from './graph.js';

export const HIGHLIGHT_THICKNESS = 6;
const HIGHLIGHT_SENSITIVITY = 12;

/**
 * Models the highlight line between two nodes
 */
export class Highlight {
    #graphics
    #fromNode
    #toNode
    #highlightIndex

    constructor(graphics, fromNode, toNode) {
        this.#graphics = graphics;
        this.#fromNode = fromNode;
        this.#toNode = toNode;
        this.#highlightIndex = 0;
    }

    repaint() {
        if (this.#highlightIndex != 0) {
            this.#graphics.drawLine(
                this.#fromNode.x, this.#fromNode.y,
                this.#toNode.x, this.#toNode.y,
                RADIUS, RADIUS,
                HIGHLIGHT_THICKNESS, HIGHLIGHT_PALLETE[this.#highlightIndex]);
        }
    }

    toggleHighlight(deltaIndex) {
        deltaIndex = Math.sign(deltaIndex);
        this.#highlightIndex = (deltaIndex < 0) ? 0 : Math.max(1,(this.#highlightIndex + deltaIndex) % HIGHLIGHT_PALLETE.length);
    }

    matches(fromNode, toNode) {
        return (this.#fromNode === fromNode && this.#toNode === toNode)
            || (this.#fromNode === toNode && this.#toNode == fromNode);
    }

    contains(node) {
        return (this.#fromNode === node || this.#toNode === node);
    }

    getDistance(x, y) {
        let x1 = this.#fromNode.x;
        let y1 = this.#fromNode.y;
        let x2 = this.#toNode.x;
        let y2 = this.#toNode.y;
        let d = undefined;
        if (x >= Math.min(x1,x2) && x <= Math.max(x1,x2)
           && y >= Math.min(y1,y2) && y <= Math.max(y1, y2)) {
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