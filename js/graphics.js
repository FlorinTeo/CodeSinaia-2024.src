export class Graphics {
    /*
    Class members:
        hCanvas - the canvas html element painted by this graphics engine
        width   - the canvas width
        height  - the canvas height
    */

    constructor(hCanvas) {
        this.width = hCanvas.width;
        this.height = hCanvas.height;
        this.hCanvas = hCanvas;
    }

    // resizes the drawing canvas
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.hCanvas.width = width;
        this.hCanvas.height = height;
        this.clear();
    }

    // draws a line between the given coordinates, in given color
    drawLine(fromX, fromY, toX, toY, marginFrom, marginTo, color) {
        let dX = toX - fromX;
        let dY = toY - fromY;
        let length = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
        if (length == 0) {
            return;
        }
        fromX += dX * marginFrom/length;
        fromY += dY * marginFrom/length;
        toX -= dX * marginTo/length;
        toY -= dY * marginTo/length;

        let context = this.hCanvas.getContext("2d");
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.moveTo(fromX, fromY);
        context.lineTo(toX, toY);
        context.stroke();
    }

    // draws a node as a labeled circle
    drawNode(label, x, y, radius, fillColor) {
        let context = this.hCanvas.getContext("2d");
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = fillColor;
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.stroke();
        context.font = "bold 12px Arial";
        context.textAlign = "center";
        context.fillStyle = 'black';
        context.fillText(label, x, y + 4);
    }

    drawArrow(fromX, fromY, toX, toY, marginTo, arrowLength, arrowWidth, color) {
        let dX = toX - fromX;
        let dY = toY - fromY;
        let length = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
        let pointX = toX - dX * marginTo / length;
        let pointY = toY - dY * marginTo / length;
        length -= marginTo;
        dX = pointX - fromX;
        dY = pointY - fromY;
        let baseX = pointX - dX * arrowLength / length;
        let baseY = pointY - dY * arrowLength / length;
        let xA = baseX + arrowWidth * dY / length;
        let yA = baseY - arrowWidth * dX / length;
        let xB = baseX - arrowWidth * dY / length;
        let yB = baseY + arrowWidth * dX / length;
        let context = this.hCanvas.getContext("2d");
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.moveTo(xA, yA);
        context.lineTo(pointX, pointY);
        context.lineTo(xB, yB);
        context.stroke();
    }

    /**
     * Draws a vertical square bracket with the top-right corner at
     * the given x,y, with given height, painted in given color.
     * @param {*} fromX top-right X coordinate of the margin area
     * @param {*} fromY top-right y coordinate of the margin area
     * @param {*} height height of the margin
     * @param {*} color color to use for drawing the margin
     * @returns width of the margin area
     */
    drawVMargin(fromX, fromY, height, color) {
        let context = this.hCanvas.getContext("2d");
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.moveTo(fromX, fromY);
        context.lineTo(fromX-4, fromY);
        context.lineTo(fromX-4, fromY + height);
        context.lineTo(fromX, fromY + height);
        context.stroke();
        return 4;
    }

    /**
     * Writes the given text in an area of the canvas identified by
     * its top-right x, y corner, and vertically allign to the given
     * hight down from the top-right corner.
     * @param {*} fromX top-right x coordinate of the text area.
     * @param {*} fromY top-right y coordinate of the text area.
     * @param {*} height vertical text alignment down from the top-right corner.
     * @param {*} color color of the text
     * @param {*} text the text to be drawn
     * @returns the width and height of text that was drawn
     */
    drawHText(fromX, fromY, text) {
        let context = this.hCanvas.getContext("2d");
        context.beginPath();
        context.font = '12px Arial';
        context.textAlign = 'left';
        context.fillStyle = 'black';
        let textMetrics = context.measureText(text);
        fromX -= textMetrics.width;
        fromY += textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
        context.fillText(text, fromX, fromY);
        context.stroke();
        return [textMetrics.width, textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent];
    }

    // clears the drawing canvas
    clear() {
        let context = this.hCanvas.getContext("2d");
        context.fillStyle = 'white';
        context.fillRect(0, 0, this.hCanvas.width, this.hCanvas.height);
    }
}