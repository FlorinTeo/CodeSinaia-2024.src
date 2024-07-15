import { CoreCode } from "./core/coreCode.js";
import { console } from "./main.js";
import { graph } from "./main.js";

export class UserCode extends CoreCode {

    /**
     * Toggles the colors of each node, if any
     */
    async toggleNodes() {
        for(const node of graph.nodes) {
            await this.step();
            node.toggleColor(1);
        }
    }

    /**
     * Toggles the colors of each edge, if any
     */
    async toggleEdges() {
        for(let i=0; i < graph.edges.length; i++) {
            await this.step();
            graph.edges[i].toggleColor(1);
        }
    }

    async isList(graph) {
        let pass = true;
        // reset the state in the graph nodes
        console.out("1. Reset the states in the graph.");
        graph.nodes.forEach((n) => { n.state = 0; n.toggleColor(-1); })
        await this.step();

        // compute the count of incoming edges into each node
        console.out("2. Compute in-degrees.");
        graph.nodes.forEach((n) => {
            n.neighbors.forEach((neighbor) => { neighbor.state++; });
        });
        await this.step();

        // determine the head of the list
        console.out("3. Find the head of the list");
        let head = graph.nodes.filter(n => n.state == 0)[0];
        pass = (head != null);

        // scan all nodes starting from the head
        while (pass) {
            await this.step();
            // check if the current node is valid
            pass = (head.colorIndex == 0) && (head.neighbors.length <= 1);
            // mark the current node
            head.toggleColor(1);
            // if all good but there are no successors, break
            if (pass && head.neighbors.length == 0) {
                // verify all nodes have been visited
                pass = graph.nodes.filter(n => n.colorIndex != 0).length == graph.nodes.length;
                break;
            }
            // move to the next node
            head = head.neighbors[0];
        }

        // return the final result
        return pass;
    }

    /**
     * Entry point for user-defined code.
     */
    async run() {
        console.out("Starting user-defined code!");
        let pass = await this.isList(graph);
        console.out(pass ? "Graph IS a linked list" : "Graph is NOT a linked list!");
        console.out("User-defined code ended!");
    }
}
