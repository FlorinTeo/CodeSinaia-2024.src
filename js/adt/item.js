export class Item {
    /*
    Class members:
        graphics - the graphics engine
        node     - the node payload in this item.
        prev     - the previous item in this double linked list.
        next     - the next item in this double linked list.
    */
    #graphics;

    constructor(graphics, node) {
        this.#graphics = graphics;
        this.node = node;
        this.prev = null;
        this.next = null;
    }

    repaint(fromX, fromY, height) {
        return this.#graphics.drawHText(fromX, fromY, height, this.node.label);
    }
}