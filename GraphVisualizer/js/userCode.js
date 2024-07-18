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
        console.outln("---- Starting user-defined code! ----");

        console.out("Toggling nodes color ... ");
        await this.toggleNodes();
        console.outln("DONE");
        await this.step();

        console.out("Toggling edges color ... ");
        await this.toggleEdges();
        console.outln("DONE");
        await this.step();

        console.outln("---- User-defined code ended! ----");
    }
}
