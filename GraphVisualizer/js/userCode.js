import { CoreCode } from "./core/coreCode.js";
import { console } from "./main.js";
import { graph } from "./main.js";

export class UserCode extends CoreCode {

    async isList(graph) {
        let pass = true;
        // reset the state in the graph nodes
        graph.nodes.forEach((n) => { n.state = 0; n.toggleColor(-1); })

        // compute the count of incoming edges into each node
        //console.out("2. Compute in-degrees.");
        graph.nodes.forEach((n) => {
            n.neighbors.forEach((neighbor) => { neighbor.state++; });
        });

        // determine the head of the list
        let head = graph.nodes.filter(n => n.state == 0)[0];
        pass = (head != null);

        // scan all nodes starting from the head
        while (pass) {
            // check if the current node is valid
            pass = (head.colorIndex == 0) && (head.neighbors.length <= 1);
            // mark the current node
            head.toggleColor(1);
            await this.step();
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

    async isBinaryTree(graph) {
        let pass = true;
        // reset the state in the graph nodes
        graph.nodes.forEach((n) => { n.state = 0; n.toggleColor(-1); })

        // compute the count of incoming edges into each node
        graph.nodes.forEach((n) => {
            n.neighbors.forEach((neighbor) => { neighbor.state++; });
        });

        // determine the root of the tree
        let root = graph.nodes.filter(n => n.state == 0)[0];

        // verify the root exists, it is a binary tree, and there were no nodes left unchecked.
        pass = (root != null) 
            && await this.isBinaryTreeHelper(root)
            && graph.nodes.filter(n => n.colorIndex != 0).length == graph.nodes.length;

        // return the result
        return pass;
    }

    async isBinaryTreeHelper(node) {
        // verify the node have been visited already
        if (node.colorIndex != 0) {
            return false;
        }
        // mark the node as visited
        node.toggleColor(1);
        await this.step();

        // assume test is passing and update this assumption based
        // on the number of descendant nodes.
        let pass = true;
        switch(node.neighbors.length) {
            case 0:
                // no descendents => test is passing
                break;
            case 2:
                // two descendents => verify the second one and let 
                // the execution fall through into the next case
                pass = await this.isBinaryTreeHelper(node.neighbors[1]);
            case 1:
                // one descendent => if not already failed on the second, verify it
                pass = pass && await this.isBinaryTreeHelper(node.neighbors[0]);
                break;
            default:
                // more than two descendents => not a binary tree
                pass = false;
                break;
        }

        // return the result
        return pass;
    }

    /**
     * Entry point for user-defined code.
     */
    async run() {
        console.out("Starting user-defined code!");

        // linked list check
        console.out("Linked-list check..");
        let pass = await this.isList(graph);
        console.out(pass ? "Graph IS a linked list!" : "Graph is NOT a linked list!");

        // tree check
        console.out("Binary tree check..");
        pass = await this.isBinaryTree(graph);
        console.out(pass ? "Graph IS a binary tree!" : "Graph is NOT a binary tree!");

        console.out("User-defined code ended!");
    }
}
