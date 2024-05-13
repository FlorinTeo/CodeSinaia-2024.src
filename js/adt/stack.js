import { Item } from "./item.js"

export class Stack {
    /*
    Class members:
        graphics  - the graphics engine
        head    - the head item in the Queue double linked list (or null if queue is empty)
        size    - the number of items in the queue
    */
    #graphics;
    #head;
    #size;
    
    constructor(graphics) {
        this.#graphics = graphics;
        this.#head = null;
        this.#size = 0;
    }

    repaint() {
        if (this.#size > 0) {
            let crtX = this.#graphics.width - 20;
            let crtY = this.#graphics.height - 30;
            //crtY -= this.#graphics.drawVMargin(crtX, 10, 20, 'black') + 4;
            let crtItem = this.#head.prev;
            while(crtItem != this.#head) {
                let [_, dy] = this.#graphics.drawHText(crtX, crtY, crtItem.node.label);
                crtY -= dy;
                crtItem = crtItem.prev;
            }
            let [_, dy] = this.#graphics.drawHText(crtX, crtY, this.#head.node.label);
            crtY -= dy
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
        this.#size++;
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
    }
}
