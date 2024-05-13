/**
 * Models a node in the Graph
 */
export const RADIUS = 16;
export const ARROW_WIDTH = 5;
export const ARROW_LENGTH = 8;

const FILL_PALLETE = ['#EBEBEB', '#FFFD55', '#6EFBFF', '#FFCACA', '#93FF2D', '#ECA4FF'];

export class Node {

    /*
    Class members:
        graphics    - the graphics engine
        x, y        - coordinates of the center of this node
        label       - text to be printed inside the node
        state       - public state holder for this node
        neigbhors   - list of neighboring nodes
        fillIndex   - index of the last custom filling color used
        marker      - internal state holder for this node 
    */
    #graphics;

    constructor(graphics, label, x, y) {
        this.#graphics = graphics;
        this.x = x;
        this.y = y;
        this.label = label;
        this.state = 0;
        this.neighbors = [];
        this.fillIndex = 0;
        this.marker = 0;
    }

    toString() {
        return `<b>${this.label}</b>: ${this.state}`;
    }

    toggleFill(deltaIndex) {
        deltaIndex = Math.sign(deltaIndex);
        this.fillIndex = (deltaIndex < 0) ? 0 : Math.max(1,(this.fillIndex + deltaIndex) % FILL_PALLETE.length);
    }

    repaint() {
        for(const neighbor of this.neighbors) {
            if (neighbor.marker == 0 || !neighbor.hasEdge(this)) {
                this.#graphics.drawLine(this.x, this.y, neighbor.x, neighbor.y, RADIUS, RADIUS, 'black');
            }
            this.#graphics.drawArrow(this.x, this.y, neighbor.x, neighbor.y, RADIUS, ARROW_LENGTH, ARROW_WIDTH, 'black');
        }
        this.#graphics.drawNode(this.label,this.x, this.y, RADIUS, FILL_PALLETE[this.fillIndex]);
    }

    traverse(lambda) {
        this.marker = 1;
        lambda(this);
        for(const node of this.neighbors) {
            if (node.marker == 0) {
                node.traverse(lambda);
            }
        }
    }

    isTarget(x, y) {
        let d = Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
        return d <= RADIUS;
    }

    hasEdge(node) {
        return this.neighbors.some(n => (n === node));
    }

    addEdge(node) {
        this.neighbors.push(node);
    }

    removeEdge(node) {
        this.neighbors = this.neighbors.filter(n => !(n === node));
    }

    toString(brief = false) {
        let output = `${this.label} : `;
        if (brief) {
            output += `State___ ${this.state}`;
        } else {
            output += `${this.x},${this.y}\t>`;
            for(const neighbor of this.neighbors) {
                output += ` ${neighbor.label}`;
            }
        }
        return output;
    }

    static fromString(strNode) {
        let strParts = strNode.split(/\s+/);
        let success = (strParts.length > 3);
        if (success) {
            success = (strParts[1] == ':') && (strParts[3] == '>');
        }
        if (success) {
            var strCoords = strParts[2].split(',');
            success = (strCoords.length == 2) && !isNaN(strCoords[0]) && !isNaN(strCoords[1]);
        }
        if (success) {
            return {
                success: true,
                label: strParts[0],
                x: Number(strCoords[0]),
                y: Number(strCoords[1]),
                toLabels: (strParts.length) > 4 ? strParts.slice(4) : [],
            };
        }
        return {success: false};
    }
}