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

    isInBounds(x, y) {
        let count = 0;
        for (let i = 1; i <= this.#points.length; i++) {
            // make sure the segment endpoints do not match exactly the target point under any circumstances
            // otherwise they may be counted twice and the "in bounds" result may be incorrect.
            let fromPt = {x: (this.#points[i-1].x + .5), y: (this.#points[i-1].y + 0.5)};
            let toPt = {x: (this.#points[i % this.#points.length].x + 0.5), y: (this.#points[i % this.#points.length].y + 0.5)};
            if (Math.sign(y - fromPt.y) * Math.sign(toPt.y - y) == -1) {
                // segments with both their y-coord on one side or the other do not intersect
                continue;
            }
            let crossX = (fromPt.x == toPt.x)
                ? fromPt.x
                : fromPt.x + (y - fromPt.y) / (toPt.y - fromPt.y) * (toPt.x - fromPt.x);
            if (crossX <= x) {
                // segments with intersection x-coord to the left do not count
                continue;
            }
            count++;
        }
        return (count % 2 == 1);
    }

    repaint() {
        for (let i = 1; i < this.#points.length; i++) {
            this.#graphics.drawSelection(
                this.#points[i].x, this.#points[i].y,
                this.#points[i-1].x, this.#points[i-1].y,
                0.5,
                'blue');
        }
    }

    toString() {
        let output = "";
        for (let i = 1; i <= this.#points.length; i++) {
            let fromPt = this.#points[i-1];
            let toPt = this.#points[i % this.#points.length];
            output += `\n${fromPt.x},${fromPt.y} -> ${toPt.x},${toPt.y}`;
        }
        return output;
    }
}
