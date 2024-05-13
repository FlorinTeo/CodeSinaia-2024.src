import { Item } from "./item.js"

export class Queue {
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
            let crtX = this.#graphics.width - 10;
            let crtY = 10;
            crtX -= this.#graphics.drawVMargin(crtX, crtY, 20, 'black') + 4;
            let crtItem = this.#head.prev;
            while(crtItem != this.#head) {
                let [dx, _] = this.#graphics.drawHText(crtX, crtY, crtItem.node.label);
                crtX -= dx;
                crtX -= this.#graphics.drawVMargin(crtX, crtY, 20, 'gray') + 4;
                crtItem = crtItem.prev;
            }
            let [dx, _] = this.#graphics.drawHText(crtX, crtY, this.#head.node.label);
            crtX -= dx;
            crtX -= this.#graphics.drawVMargin(crtX, crtY, 20, 'black') + 4;
        }
    }

    enqueue(node) {
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
        }
        this.#size++;
    }

    dequeue() {
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
