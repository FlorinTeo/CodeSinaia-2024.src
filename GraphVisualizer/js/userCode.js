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
        // for(let i = 0; i < graph.nodes.length; i++) {
        //     let node = graph.nodes[i];
        //     await this.step();
        //     node.toggleColor(1); 
        // }
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


    async isSinglyLinkedList() {
        console.outln("Testing singly linked list");
        for(const node of graph.nodes) {
            for(const n of node.neighbors) {
                //n.state = n.state+1;
                n.state++;
            }
        }

        let heads = graph.nodes.filter(n => n.state == 0); // filter all nodes with in-degree 0
        if (heads.length != 1) {
            return false;
        }


        return true;
    }

    /**
     * Entry point for user-defined code.
     */
    async run() {
        console.outln("---- Starting user-defined code! ----");

        // console.out("Toggling nodes color ... ");
        // await this.toggleNodes();
        // console.outln("DONE");
        // await this.step();

        // console.out("Toggling edges color ... ");
        // await this.toggleEdges();
        // console.outln("DONE");
        // await this.step();
        let success = await this.isSinglyLinkedList();
        if (success) {
            console.outln("Yes, singly linked list!");
        } else {
            console.outln("No, not a singly linked list!");
        }

        console.outln("---- User-defined code ended! ----");
    }
}
