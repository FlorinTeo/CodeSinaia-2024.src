import { RADIUS } from './node.js';

export const HIGHLIGHT_THICKNESS = 6;
export const HIGHLIGHT_COLOR = '#FFFD55';

/**
 * Models the highlight line between two nodes
 */
export class Highlight {
    #graphics
    #fromNode
    #toNode
    #color

    constructor(graphics, fromNode, toNode) {
        this.#graphics = graphics;
        this.#fromNode = fromNode;
        this.#toNode = toNode;
        this.#color = HIGHLIGHT_COLOR;
    }

    repaint() {
        this.#graphics.drawLine(
            this.#fromNode.x, this.#fromNode.y,
            this.#toNode.x, this.#toNode.y,
            RADIUS, RADIUS,
            HIGHLIGHT_THICKNESS, this.#color);
    }

    matches(fromNode, toNode) {
        return (this.#fromNode === fromNode && this.#toNode === toNode)
            || (this.#fromNode === toNode && this.#toNode == fromNode);
    }

    contains(node) {
        return (this.#fromNode === node || this.#toNode === node);
    }
}