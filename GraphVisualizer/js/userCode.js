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

    /**
     * Entry point for user-defined code.
     */
    async run() {
        console.outln("Starting to toggle node colors!");
        await this.toggleNodes();
        console.outln("Done!");

        await this.step();
        console.outln("Starting to toggle edge colors!");
        
        await this.toggleEdges();
        console.outln("Done and finish!");
        console.outln();
    }
}
