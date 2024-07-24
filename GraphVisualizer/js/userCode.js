import { CoreCode } from "./core/coreCode.js";
import { console } from "./main.js";
import { graph, queue, stack } from "./main.js";
import { Direction } from "./adt/edge.js";
import { ColorIndex } from "./adt/graph.js";

function distance(n1, n2) {
    return Math.sqrt(Math.pow(n2.x - n1.x, 2) + Math.pow(n2.y - n1.y, 2))
}

export class UserCode extends CoreCode {
    
    //#region -- Tue work
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

    async isSinglyLinkedList() {
        console.outln("Testing singly linked list");
        for (const node of graph.nodes) {
            for (const n of node.neighbors) {
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
    //#endregion - Tue work

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
            if (node != startNode) {
                node.colorIndex = ColorIndex.Magenta;
            }
            await this.step();
            // loop through each of the node's successors which had not been queued yet
            for(const n of node.neighbors.filter(n => n.state == 0)) {
                // color the edge to that node
                let edge = graph.edges.filter(e => e.matchesNodes(node, n))[0];
                edge.colorIndex = ColorIndex.Yellow;
                // mark the neighbor (state and color) and enqueue it
                n.state = 1;
                n.colorIndex = ColorIndex.Red;
                queue.enqueue(n);
                await this.step();
            }
            if (node != startNode) {
                node.colorIndex = ColorIndex.Yellow;
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

    // Highlights the path from startNode to endNode
    async pathExtract(startNode, endNode) {
        let endColor = endNode.colorIndex;
        while(endNode != startNode) {
            endNode.colorIndex = endColor;
            graph.edges.filter(e => e.matchesNodes(endNode, endNode.state))[0].colorIndex = endColor;
            await this.step();
            endNode = endNode.state;
        }
    }
    
    //#region -- BFS
    // Calculates the first path from startNode to endNode in the graph via Breadth-First Search
    async bfs(startNode, endNode) {
        // reset algorithm state
        graph.nodes.forEach((n) => { n.state = null; });
        queue.clear();
       
        // prime queue with the starting node
        startNode.state = startNode;
        startNode.cost = 0;
        queue.enqueue(startNode);

        // loop until the working queue is drained out
        let iterations = 0;
        while(queue.size() != 0) {
            let node = queue.dequeue();
            iterations++;
            if (node != startNode && node != endNode) {
                node.colorIndex = ColorIndex.Magenta;
            }
            for(const n of node.neighbors.filter(n => n.state == null)) {
                let edge = graph.edges.filter(e => e.matchesNodes(node, n))[0];
                edge.colorIndex = ColorIndex.Yellow;
                n.state = node;
                n.cost = node.cost + distance(node, n);
                if (n == endNode) {
                    return {success: true, iterations};
                }
                n.colorIndex = ColorIndex.Red;
                queue.enqueue(n);
                await this.step();
            }
            if (node != startNode && node != endNode) {
                node.colorIndex = ColorIndex.Yellow;
            }
        }

        return {success: false, iterations};
    }

    // BFS entry point.
    async runBFS() {
        console.outln("Find first path between two nodes via BFS!");
        // determine the starting node
        let markedNodes = graph.nodes.filter(n => n.colorIndex != 0).sort((n1, n2) => Math.sign(n1.colorIndex - n2.colorIndex));
        if (markedNodes.length != 2) {
            console.outln("Unique start and end nodes cannot be determined!");
            return;
        }
        console.outln(`Finding path from ${markedNodes[0].label} to ${markedNodes[1].label}`);
        let {success, iterations} = await this.bfs(markedNodes[0], markedNodes[1]);
        if (!success) {
            console.outln(`Could not find the shortest path!`);
            return;
        }
        console.outln(`BFS algorithm: Distance=${markedNodes[1].cost}, Steps=${iterations}.`);
        await this.pathExtract(markedNodes[0], markedNodes[1]);
    }
    //#endregion -- FirstPath

    //#region -- Dijkstra
    // Dijkstra algorithm to find the shortest (distance) path from startNode to endNode.
    async dijkstra(startNode, endNode) {
        // reset algorithm state
        graph.nodes.forEach((n) => { n.state = null; n.cost = Number.MAX_VALUE; });
        queue.clear();
       
        // prime queue with the starting node
        startNode.state = startNode;
        startNode.cost = 0;
        queue.enqueue(startNode);

        // loop until the working queue is drained out
        let iterations = 0;
        while(queue.size() != 0) {
            let node = queue.dequeue();
            iterations++;
            // mark the working node
            if (node != startNode && node != endNode) {
                node.colorIndex = ColorIndex.Magenta;
            }
            for(const n of node.neighbors) {
                let edge = graph.edges.filter(e => e.matchesNodes(node, n))[0];
                edge.colorIndex = ColorIndex.Yellow;
                let cost = node.cost + distance(node, n);
                // check if the new cost is better than what we already have for the node
                if (n.cost > cost) {
                    if (n != endNode) {
                        n.colorIndex = ColorIndex.Red;
                    }
                    n.state = node;
                    n.cost = cost;
                    queue.enqueue(n);
                    await this.step();
                }
            }
            if (node != startNode && node != endNode) {
                node.colorIndex = ColorIndex.Yellow;
            }
        }

        return {success: (endNode.state != null), iterations};
    }

    // Dijkstra entry point.
    async runDijkstra() {
        console.outln("Find path between two nodes by Dijkstra algorithm!");
        // determine the starting node
        let markedNodes = graph.nodes.filter(n => n.colorIndex != 0).sort((n1, n2) => Math.sign(n1.colorIndex - n2.colorIndex));
        if (markedNodes.length != 2) {
            console.outln("Unique start and end nodes cannot be determined!");
            return;
        }
        console.outln(`Finding path from ${markedNodes[0].label} to ${markedNodes[1].label}`);
        let {success, iterations} = await this.dijkstra(markedNodes[0], markedNodes[1]);
        if (!success) {
            console.outln(`Could not find the shortest path!`);
            return;
        }
        console.outln(`Dijkstra algorithm: Distance=${markedNodes[1].cost}, Steps=${iterations}.`);
        await this.pathExtract(markedNodes[0], markedNodes[1]);
    }
    //#endregion -- Dijkstra

    //#region -- AStar
    // AStar algorithm to guess the shortest (distance) path from startNode to endNode.
    async aStar(startNode, endNode) {
        // reset algorithm state
        graph.nodes.forEach((n) => { n.state = null; n.cost = Number.MAX_VALUE; });
        queue.clear();
       
        // prime queue with the starting node
        startNode.state = startNode;
        startNode.cost = distance(startNode, endNode);
        queue.enqueue(startNode);

        // loop until the working queue is drained out
        let iterations = 0;
        while(queue.size() != 0) {
            let node = queue.dequeue();
            iterations++;
            // mark the working node
            if (node != startNode && node != endNode) {
                node.colorIndex = ColorIndex.Magenta;
            }
            for(const n of node.neighbors.filter(n => n.state == null)) {
                let edge = graph.edges.filter(e => e.matchesNodes(node, n))[0];
                edge.colorIndex = ColorIndex.Yellow;
                n.state = node;
                n.cost = (node.cost - distance(node, endNode)) + distance(node, n) + distance(n, endNode);
                if (n == endNode) {
                    return {success: true, iterations: iterations};
                }
                n.colorIndex = ColorIndex.Red;
                queue.enqueue(n, (n) => { return n.cost; });
                await this.step();
            }
            if (node != startNode && node != endNode) {
                node.colorIndex = ColorIndex.Yellow;
            }
        }
        
        return {success: false, iterations: iterations};
    }

    // aStar entry point.
    async runAStar() {
        console.outln("Find path between two nodes by A* algorithm!");
        // determine the starting node
        let markedNodes = graph.nodes.filter(n => n.colorIndex != 0).sort((n1, n2) => Math.sign(n1.colorIndex - n2.colorIndex));
        if (markedNodes.length != 2) {
            console.outln("Unique start and end nodes cannot be determined!");
            return;
        }
        console.outln(`Finding path from ${markedNodes[0].label} to ${markedNodes[1].label}`);
        let {success, iterations} = await this.aStar(markedNodes[0], markedNodes[1]);
        if (!success) {
            console.outln(`Could not find the shortest path!`);
            return;
        }
        console.outln(`A* algorithm: Distance=${markedNodes[1].cost}, Steps=${iterations}.`);
        await this.pathExtract(markedNodes[0], markedNodes[1]);
    }
    //#endregion -- AStar

    /**
     * Entry point for user-defined code.
     */
    async run() {
        console.outln("---- Starting user-defined code! ----");
        //await this.runSpanningTree();

        console.outln(">>>> Please reset state for BFS run...\n");
        await this.step();
        await this.runBFS();

        console.outln(">>>> Please reset state for Dijkstra's run...\n");
        await this.step();
        await this.runDijkstra();

        console.outln(">>>> Please reset state for A* run...\n");
        await this.step();
        await this.runAStar();
        console.outln("---- User-defined code ended! ----");
    }
}
