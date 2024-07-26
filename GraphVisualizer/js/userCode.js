import { CoreCode } from "./core/coreCode.js";
import { console } from "./main.js";
import { graph } from "./main.js";
import { queue } from "./main.js";
import { stack } from "./main.js";

export class UserCode extends CoreCode {

    async isList(graph) {
        let pass = true;
        // reset the state in the graph nodes
        graph.nodes.forEach((n) => { n.state = 0; n.toggleColor(-1); })

        // compute the count of incoming edges into each node
        //console.outln("2. Compute in-degrees.");
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
        // for(let i = 0; i < graph.nodes.length; i++) {
        //     let node = graph.nodes[i];
        //     await this.step();
        //     node.toggleColor(1); 
        // }
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
        switch (node.neighbors.length) {
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

    async bfsTraverse() {
        let root = graph.nodes.filter(n => n.colorIndex != 0)[0];
        if (root == null) {
            console.outln("Root node could not be found!");
            return;
        }
        queue.clear();
        queue.enqueue(root);
        await this.step();
        while (queue.size() != 0) {
            let node = queue.dequeue();
            node.toggleColor(1);
            console.out(node.label);
            await this.step();
            for (const n of node.neighbors) {
                queue.enqueue(n);
            }
            if (node.neighbors.length > 0) {
                await this.step();
            }
        }
        console.outln();
    }

    async dfsTraverse() {
        let root = graph.nodes.filter(n => n.colorIndex != 0)[0];
        if (root == null) {
            console.outln("Root node could not be found!");
            return;
        }
        stack.clear();
        stack.push(root);
        await this.step();
        while (stack.size() != 0) {
            let node = stack.pop();
            node.toggleColor(1);
            console.out(node.label);
            await this.step();
            for (let i = node.neighbors.length - 1; i >= 0; i--) {
                stack.push(node.neighbors[i]);
            }
            if (node.neighbors.length > 0) {
                await this.step();
            }
        }
        console.outln();
    }

    async postfixExpression() {
        let root = graph.nodes.filter(n => n.colorIndex != 0)[0];
        if (root == null) {
            console.outln("Root node could not be found!");
            return;
        }
        stack.clear();
        queue.clear();
        root.toggleColor(-1);
        await this.step();
        stack.push(root);
        while (stack.size() > 0) {
            let node = stack.pop();
            if (node.colorIndex != 0) {
                queue.enqueue(node);
            } else {
                node.toggleColor(1);
                for (const n of node.neighbors) {
                    stack.push(n);
                }
                stack.push(node);
            }
            await this.step();
        }
        while (queue.size() > 0) {
            stack.push(queue.dequeue())
        }
        while (stack.size() > 0) {
            console.out(stack.pop().label);
        }
        console.outln();
    }

    async prefixExpression() {
        let root = graph.nodes.filter(n => n.colorIndex != 0)[0];
        if (root == null) {
            console.outln("Root node could not be found!");
            return;
        }
        stack.clear();
        queue.clear();
        root.toggleColor(-1);
        await this.step();
        stack.push(root);
        while (stack.size() > 0) {
            let node = stack.pop();
            node.toggleColor(1);
            for (let i = node.neighbors.length - 1; i >= 0; i--) {
                stack.push(node.neighbors[i]);
            }
            queue.enqueue(node);
            await this.step();
        }
        while (queue.size() > 0) {
            console.out(queue.dequeue().label);
        }
        console.outln();
    }
    
    /**
     * Entry point for user-defined code.
     */
    async run() {
        console.outln("---- Starting user-defined code! ----");

        // // linked list check
        // console.outln("Linked-list check..");
        // let pass = await this.isList(graph);
        // console.outln(pass ? "Graph IS a linked list!" : "Graph is NOT a linked list!");

        // // tree check
        // console.outln("Binary tree check..");
        // pass = await this.isBinaryTree(graph);
        // console.outln(pass ? "Graph IS a binary tree!" : "Graph is NOT a binary tree!");

        // console.outln("Breath-first tree traversal:");
        // await this.bfsTraverse();

        // console.outln("\nDepth-first tree traversal:");
        // await this.dfsTraverse();

        // console.outln("Postfix Expression!")
        // await this.postfixExpression();

        // console.outln("Prefix Expression!")
        // await this.prefixExpression();

        console.outln("---- User-defined code ended! ----");
    }
}
