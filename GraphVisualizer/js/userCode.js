import { CoreCode } from "./core/coreCode.js";
import { console } from "./main.js";
import { graph } from "./main.js";
import { queue } from "./main.js";
import { Direction } from "./adt/edge.js";

export class UserCode extends CoreCode {

    //#region -- Spanning tree
    /**
     * Calculates the spanning tree starting from the given node
     */
    async spanningTree(startNode) {
        // reset algorithm state
        graph.nodes.forEach((n) => { n.state = 0; n.toggleColor(-1); });
        queue.clear();
       
        // prime queue with the starting node
        startNode.toggleColor(1);
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

    /**
     * Removes all edges which are not part of the spanning tree
     */
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

    /**
     * SpanningTree entry point.
     */
    async runSpanningTree() {
        console.outln("Determine the graph spanning tree!");
        // determine the starting node
        let startNode = graph.nodes.filter(n => n.colorIndex != 0)[0];
        if (startNode == null) {
            console.outln("Starting node can not be found!");
            return;
        }
        await this.spanningTree(startNode);
        console.outln("Extracting spanning tree edges.");
        await this.spanningTreeExtract();
    }
    //#endregion - Spanning Tree

    /**
     * Entry point for user-defined code.
     */
    async run() {
        console.outln("---- Starting user-defined code! ----");
        await this.runSpanningTree();
        console.outln("---- User-defined code ended! ----");

    }
}
