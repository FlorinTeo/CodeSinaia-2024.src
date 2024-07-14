export class Item {
    // Private class members
    #graphics;  // the graphics engine

    // Public class members
    node;       // the node payload in this item.
    prev;       // the previous item in this double linked list.
    next;       // the next item in this double linked list.

    constructor(graphics, node) {
        this.#graphics = graphics;
        this.node = node;
        this.prev = null;
        this.next = null;
    }
}