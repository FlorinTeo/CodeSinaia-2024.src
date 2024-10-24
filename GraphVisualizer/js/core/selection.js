export class Selection {
    #SPACING = 10;

    // sequence of points forming a selection polygonal shape
    #points;
    #graphics;

    #isSpaced(x, y) {
        if (this.#points.length == 0) {
            return true;
        }
        let lastPoint = this.#points[this.#points.length - 1];
        let dist = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));
        return dist >= this.#SPACING;
    }

    constructor(graphics) {
        this.#graphics = graphics;
        this.reset();
    }

    reset() {
        this.#points = [];
    }

    addPoint(x, y) {
        if (this.#isSpaced(x, y)) {
            this.#points.push({x: x, y: y});
        }
    }

    repaint() {
        for (let i = 1; i < this.#points.length; i++) {
            this.#graphics.drawSelection(
                this.#points[i].x, this.#points[i].y,
                this.#points[i-1].x, this.#points[i-1].y,
                0.4,
                'gray');
        }
    }
}
