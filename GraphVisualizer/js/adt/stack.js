import { Item } from "./item.js"

export class Stack {
    // Private class members
    #graphics;  // the graphics engine
    #head;      // the head Item in the Stack double linked list (or null if Stack is empty)
    #size;      // the number of Items in the Stack
    #maxTextH;  // maximum text height of each of the Node labels in the Stack
    #maxTextW;  // maximum text width of each of the Node labels in the Stack
    
    constructor(graphics) {
        this.#graphics = graphics;
        this.#head = null;
        this.#size = 0;
        this.#maxTextH = 0;
        this.#maxTextW = 0;
    }

    repaint() {
        if (this.#graphics != null && this.#size > 0) {
            let crtX = 10;
            let crtY = this.#graphics.height - 10;
            let [_, h] = this.#graphics.drawHMargin(crtX, crtY, this.#maxTextW + 8, 'black');
            let crtItem = this.#head.prev;
            while(crtItem != this.#head) {
                [_, h] = this.#graphics.drawText(crtX + 4, crtY, crtItem.node.label);
                crtY -= h;
                [_, h] = this.#graphics.drawHMargin(crtX, crtY, this.#maxTextW + 8, 'gray');
                crtItem = crtItem.prev;
            }
            [_, h] = this.#graphics.drawText(crtX + 4, crtY, this.#head.node.label);
            crtY -= h;
            [_, h] = this.#graphics.drawHMargin(crtX, crtY, this.#maxTextW + 8, 'lightgray');
        }
    }

    push(node) {
        let item = new Item(this.#graphics, node);

        if (this.#head == null) {
            item.next = item;
            item.prev = item;
            this.#head = item;
        } else {
            item.next = this.#head;
            item.prev = this.#head.prev;
            item.next.prev = item;
            item.prev.next = item;
            this.#head = item;
        }
        this.measureWidth(item.node.label);
        this.#size++;
    }

    measureWidth(text) {
        if (this.#graphics == null) {
            return;
        }
        if (text) {
            let[w, h] = this.#graphics.measureText(text);
            this.#maxTextW = Math.max(this.#maxTextW, w);
            this.#maxTextH = Math.max(this.#maxTextH, h);
        } else {
            this.#maxTextW = 0;
            this.#maxTextH = 0;
            let crtItem = this.#head;
            for(let i = 0; i < this.#size; i++) {
                let[w, h] = this.#graphics.measureText(crtItem.node.label);
                this.#maxTextW = Math.max(this.#maxTextW, w);
                this.#maxTextH = Math.max(this.#maxTextH, h);
                crtItem = crtItem.next;
            }
        }
    }

    pop() {
        if (this.#head == null) {
            return null;
        }
        let item = this.#head;
        item.prev.next = item.next;
        item.next.prev = item.prev;
        this.#size--;
        this.#head = (this.#size == 0) ? null : item.next;
        this.measureWidth();
        return item.node;
    }

    removeNode(node) {
        if (this.#head == null) {
            return;
        }
        let item = this.#head.next;
        while(item != this.#head) {
            if (item.node == node) {
                item.next.prev = item.prev;
                item.prev.next = item.next;
                this.#size--;
            }
            item = item.next;
        }
        if (this.#head.node == node) {
            if (this.#size == 1) {
                this.#head = null;
            } else {
                this.#head.prev.next = this.#head.next;
                this.#head.next.prev = this.#head.prev;
                this.#head = this.#head.next;
            }
            this.#size--;
        }
        this.measureWidth();
    }

    peek() {
        return (this.#head != null) ? this.#head.node : null;
    }

    size() {
        return this.#size;
    }

    clear() {
        this.#head = null;
        this.#size = 0;
        this.#maxTextW = 0;
        this.#maxTextH = 0;
    }
}
