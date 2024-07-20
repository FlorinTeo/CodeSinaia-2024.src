import { CoreCode } from "./core/coreCode.js";
import { console } from "./main.js";
import { graph } from "./main.js";
import { queue } from "./main.js";
import { Direction } from "./adt/edge.js";
import { ColorIndex } from "./adt/graph.js";

export class UserCode extends CoreCode {

    //#region -- Spanning tree
    // Calculates the spanning tree starting from the given node
    async spanningTree(startNode) {
        // reset algorithm state
        graph.nodes.forEach((n) => { n.state = 0; });
        queue.clear();
       
        // prime queue with the starting node
        startNode.state = 1;
        queue.enqueue(startNode);

        // loop until the working queue is drained out
        while(queue.size() != 0) {
            let node = queue.dequeue();
            node.toggleColor(1);
            await this.step();
            // loop through each of the node's successors which had not been queued yet
            for(const n of node.neighbors.filter(n => n.state == 0)) {
                // color the edge to that node
                let edge = graph.edges.filter(e => e.matchesNodes(node, n))[0];
                edge.toggleColor(1);
                // mark the neighbor (state and color) and enqueue it
                n.state = 1;
                n.toggleColor(1);
                queue.enqueue(n);
                await this.step();
            }
            if (node != startNode) {
                node.colorIndex = 1;
            }
        }

        return true;
    }

    // Removes all edges which are not part of the spanning tree
    async spanningTreeExtract() {
        let unmarkedEdges = graph.edges.filter(e => e.colorIndex == 0);
        for (const unmarkedEdge of unmarkedEdges) {
            if ((unmarkedEdge.direction & Direction.Fwd) != 0) {
                graph.removeEdge(unmarkedEdge.node1, unmarkedEdge.node2);
            }
            if ((unmarkedEdge.direction & Direction.Bkw) != 0) {
                graph.removeEdge(unmarkedEdge.node2, unmarkedEdge.node1);
            }
            await this.step();
        }
    }

    // SpanningTree entry point.
    async runSpanningTree() {
        console.outln("Determine the graph spanning tree!");
        // determine the starting node
        let markedNodes = graph.nodes.filter(n => n.colorIndex != 0);
        if (markedNodes.length != 1) {
            console.outln("Unique starting node cannot be determined!");
            return;
        }
        await this.spanningTree(markedNodes[0]);
        console.outln("Extracting spanning tree edges.");
        await this.spanningTreeExtract();
    }
    //#endregion - Spanning Tree

    //#region -- FirstPath
    // Calculates the first path from startNode to endNode in the graph
    async firstPath(startNode, endNode) {
        // reset algorithm state
        graph.nodes.forEach((n) => { n.state = null; });
        queue.clear();
       
        // prime queue with the starting node
        startNode.state = startNode;
        queue.enqueue(startNode);

        // loop until the working queue is drained out
        while(queue.size() != 0) {
            let node = queue.dequeue();
            if (node != startNode && node != endNode) {
                node.colorIndex = ColorIndex.Magenta;
            }
            for(const n of node.neighbors.filter(n => n.state == null)) {
                let edge = graph.edges.filter(e => e.matchesNodes(node, n))[0];
                edge.colorIndex = ColorIndex.Yellow;
                n.state = node;
                if (n == endNode) {
                    break;
                }
                n.colorIndex = ColorIndex.Red;
                queue.enqueue(n);
                await this.step();
            }
            if (node != startNode && node != endNode) {
                node.colorIndex = ColorIndex.Yellow;
            }
        }
    }

    // Highlights the first path from startNode to endNode
    async firstPathExtract(startNode, endNode) {
        let endColor = endNode.colorIndex;
        while(endNode != startNode) {
            endNode.colorIndex = endColor;
            graph.edges.filter(e => e.matchesNodes(endNode, endNode.state))[0].colorIndex = endColor;
            await this.step();
            endNode = endNode.state;
        }
    }

    /**
     * FirstPath entry point.
     */
    async runFirstPath() {
        console.outln("Find first path between two nodes!");
        // determine the starting node
        let markedNodes = graph.nodes.filter(n => n.colorIndex != 0).sort((n1, n2) => Math.sign(n1.colorIndex - n2.colorIndex));
        if (markedNodes.length != 2) {
            console.outln("Unique start and end nodes cannot be determined!");
            return;
        }
        console.outln(`Finding path from ${markedNodes[0].label} to ${markedNodes[1].label}`);
        await this.firstPath(markedNodes[0], markedNodes[1]);
        console.outln(`Highlighting the path`);
        await this.firstPathExtract(markedNodes[0], markedNodes[1]);

    }
    //#endregion -- FirstPath

    /**
     * Entry point for user-defined code.
     */
    async run() {
        console.outln("---- Starting user-defined code! ----");
        //await this.runSpanningTree();
        await this.runFirstPath();
        console.outln("---- User-defined code ended! ----");

    }
}
