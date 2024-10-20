import { CoreCode } from "./core/coreCode.js";
import { console, queue } from "./main.js";
import { graph } from "./main.js";
import { stack } from "./main.js";
import { ColorIndex } from "./adt/graph.js";

export class UserCode extends CoreCode {

    #startColor;
    #startNode;
    #endNode;

    //#region graph setup helpers
    async setup(startStr, endStr) {
        let varNode = graph.varNodes.filter(vN => vN.label.toLowerCase() === startStr)[0];
        if (!varNode) {
            console.outln(`No '${startStr}' node detected.`);
            return false;
        }
        this.#startNode = varNode.neighbors[0];
        if (endStr) {
            varNode = graph.varNodes.filter(vN => vN.label.toLowerCase() === endStr)[0];
            if (!varNode) {
                console.outln(`No '${endStr}' node detected.`);
                return false;
            }
            this.#endNode = varNode.neighbors[0];
        }
        graph.traverse(node =>{ node.colorIndex = 0; });
        graph.edges.forEach(edge => { edge.colorIndex = 0; });
        return true;
    }
    //#endregion graph setup helpers

    //#region Tue-Wed work
    async findShortestPath(startNode, endNode) {
        let previousNodes = new Map();
        let unvisitedNodes = new Set(graph.nodes);
        
        // Initialize previous nodes
        for (const node of graph.nodes) {
            previousNodes.set(node, null);
        }
        
        let currentNode = startNode;
        unvisitedNodes.delete(currentNode);

        while (currentNode !== endNode && unvisitedNodes.size > 0) {
            for (const neighbor of currentNode.neighbors) {
                if (unvisitedNodes.has(neighbor)) {
                    // Update previous node without distance calculation
                    if (previousNodes.get(neighbor) === null) {
                        previousNodes.set(neighbor, currentNode);
                    }
                }
            }
            
            // Find the next node to visit
            currentNode = null;
            for (const node of unvisitedNodes) {
                if (currentNode === null || (previousNodes.get(node) !== null && previousNodes.get(currentNode) === null)) {
                    currentNode = node;
                }
            }
            
            if (currentNode === null) {
                break;
            }
            
            unvisitedNodes.delete(currentNode);
        }
        
        // Trace the shortest path back from the end node
        let path = [];
        currentNode = endNode;
        
        while (currentNode !== null) {
            path.push(currentNode);
            currentNode = previousNodes.get(currentNode);
        }
        
        path.reverse();
        return path;
    }
    
    /**
     * Colors the shortest path between the nodes colored #93FF2D and #ECA4FF.
     */
    async colorShortestPath() {
        let ends = graph.nodes.filter(n => n.colorIndex !== 0);
        if (ends.length < 2) {
            console.outln("Start or end node not found.");
            return;
        }
        
        let startNode = ends[0];
        let endNode = ends[1];
        console.outln(`Start Node: ${startNode}, End Node: ${endNode}`);
        
        // Find the shortest path using the simplified algorithm
        let path = await this.findShortestPath(startNode, endNode);
        console.outln(`Path: ${path.map(node => node.toString()).join(" -> ")}`);
        
        // Color the nodes and edges in the path
        for (let i = 0; i < path.length - 1; i++) {
            let node = path[i];
            let nextNode = path[i + 1];
            node.toggleColor(1); // Color the node
            
            // Find and color the edge between node and nextNode
            let edge = node.neighbors.find(neighbor => neighbor === nextNode);
            if (edge) {
                edge.toggleColor(1); // Color the edge
            }
            // await this.step();
        }
        
        // Color the last node
        if (path.length > 0) {
            path[path.length - 1].toggleColor(1);
        }
        console.outln(path.length-1);
    }

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
    //#endregion Tue-Wed work

    async extractPath(startNode, endNode) {
        if (endNode.state == null) {
            console.outln("No path exists!");
            return;
        }

        let crtNode = endNode;
        let distance = 0;
        while(crtNode != startNode) {
            let edge = graph.getEdge(crtNode, crtNode.state);
            edge.colorIndex = ColorIndex.Green;
            distance += edge.node1.distance(edge.node2);
            crtNode.colorIndex = ColorIndex.Green;
            await this.step(100);
            crtNode = crtNode.state;
        }
        crtNode.colorIndex = ColorIndex.Green;

        console.outln(`    route distance = ${distance.toFixed(1)}`);
    }

    async loadGraph() {
        const response = await fetch("https://florinteo.github.io/CodeSinaia-2024.src/GraphVisualizer/data/graph.txt");
        const graphString = await response.text();
        graph.fromString(graphString);
        queue.clear();
        stack.clear();
    }

    async runSpanningTree() {
        // pick up inputs in the algo
        if (!await this.setup("root")) {
            return;
        }

        let root = this.#startNode;
        queue.clear();
        queue.enqueue(root);
        while(queue.size() != 0){
            let node = queue.dequeue();
            node.colorIndex=ColorIndex.Red;
            for(const n of node.neighbors){
                if(n.colorIndex == ColorIndex.Gray){
                    n.colorIndex = ColorIndex.Green;
                    let edge = graph.getEdge(node, n);
                    edge.colorIndex = ColorIndex.Green;
                    queue.enqueue(n);
                    await this.step(100);
                }
            }
            if (node === root) {
                node.toggleColor(1);
            } else {
                node.colorIndex=ColorIndex.Green;
            }
        }
        // // remove edges to make the spanning tree more visible
        // let noncoloredEdges = graph.edges.filter(e => e.colorIndex == ColorIndex.Gray)
        // for(const e of noncoloredEdges){
        //     graph.removeEdge(e.node1, e.node2);
        //     graph.removeEdge(e.node2, e.node1);
        // }
    }

    async runBFS() {
        // pick up inputs in the algo
        if (!await this.setup("start", "end")) {
            return;
        }
        let startNode = this.#startNode;
        let endNode = this.#endNode;

        // clear initial state
        graph.nodes.forEach(n => { n.state = null; });
        queue.clear();
        queue.enqueue(startNode);
        startNode.state = startNode;

        // loop until the queue is empty
        let iterations = 0;
        while(queue.size() !== 0) {
            iterations++;
            let node = queue.dequeue();
            node.colorIndex = ColorIndex.Magenta;
            await this.step(200);
            for(const n of node.neighbors) {
                if (n.state != null) {
                    continue;
                }
                n.state = node;
                queue.enqueue(n);
                graph.getEdge(node, n).colorIndex = ColorIndex.Yellow;                
                if (n === endNode) {
                    console.outln("    EndNode is found!");
                    queue.clear();
                    break;
                }
                n.colorIndex = ColorIndex.Red;
                await this.step(100);
            }
            node.colorIndex = ColorIndex.Yellow;
            await this.step(100);
        }
        await this.extractPath(startNode, endNode);
        console.outln(`    iterations = ${iterations}`);
    }

    async runDijkstra() {
        // pick up inputs in the algo
        if (!await this.setup("start", "end")) {
            return;
        }
        let startNode = this.#startNode;
        let endNode = this.#endNode;

        // clear initial state
        graph.nodes.forEach(n => { n.state = null; n.cost = Infinity; });
        queue.clear();
        queue.enqueue(startNode);
        startNode.state = startNode;
        startNode.cost = 0;

        // loop until the queue is empty
        let iterations = 0;
        while(queue.size() !== 0) {
            iterations++;
            let node = queue.dequeue();
            node.colorIndex = ColorIndex.Magenta;
            await this.step(200);
            for(const n of node.neighbors) {
                let newCost = node.cost + node.distance(n);
                // if (n.cost < newCost) {
                //     continue;
                // }
                if (n.cost > newCost) {
                    n.state = node;
                    n.cost = newCost;
                    queue.enqueue(n);
                    graph.getEdge(node, n).colorIndex = ColorIndex.Yellow;
                    if (n != endNode) {               
                        n.colorIndex = ColorIndex.Red;
                    }
                    await this.step(100);
                }
            }
            node.colorIndex = ColorIndex.Yellow;
            await this.step(100);
        }
        await this.extractPath(startNode, endNode);
        console.outln(`    iterations = ${iterations}`);
    }

    async runAStar() {
        // pick up inputs in the algo
        if (!await this.setup("start", "end")) {
            return;
        }
        let startNode = this.#startNode;
        let endNode = this.#endNode;

        // clear initial state
        graph.nodes.forEach(n => { n.state = null; });
        queue.clear();
        queue.enqueue(startNode);
        startNode.state = startNode;
        startNode.cost = startNode.distance(endNode);

        // loop until the queue is empty
        let iterations = 0;
        while(queue.size() !== 0) {
            iterations++;
            let node = queue.dequeue();
            node.colorIndex = ColorIndex.Magenta;
            await this.step(200);
            for(const n of node.neighbors) {
                if (n.state != null) {
                    continue;
                }
                n.state = node;
                n.cost = (node.cost - node.distance(endNode)) + node.distance(n) + n.distance(endNode);
                queue.enqueue(n, (n) => { return n.cost; });
                graph.getEdge(node, n).colorIndex = ColorIndex.Yellow;                
                if (n === endNode) {
                    console.outln("    EndNode is found!");
                    queue.clear();
                    break;
                }
                n.colorIndex = ColorIndex.Red;
                await this.step(100);
            }
            node.colorIndex = ColorIndex.Yellow;
            await this.step(100);
        }
        await this.extractPath(startNode, endNode);
        console.outln(`    iterations = ${iterations}`);
    }

    /**
     * Entry point for user-defined code.
     */
    async run() {
        console.outln("---- Starting user-defined code! ----");
        //await this.colorShortestPath();
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

        let selection = console.getSelection();
        switch(selection.toLowerCase()) {
            case 'loadgraph':
                await this.loadGraph();
                break;
            case 'spanningtree':
                await this.runSpanningTree();
                break;
            case 'bfs':
                console.outln("Run Path Finding algo via BFS:");
                await this.runBFS();
                break;
            case 'dijkstra':
                console.outln("Run Path Finding algo via Dijkstra:");
                await this.runDijkstra();
                break;
            case 'astar':
            case 'a*':
                console.outln("Run Path finding algo via A*:");
                await this.runAStar();
                break;
            default:
                console.outln("Available commands:");
                console.outln("  loadGraph    : loads a sample graph.")
                console.outln("  spanningTree : runs the Spanning tree algo.");
                console.outln("  bfs          : runs Breath-First-Search algo.");
                console.outln("  dijkstra     : runs Dijkstra algo.");
                console.outln("  astar        : runs the A* algo.");
                console.outln("::Select word and click <Run> to execute command::");
        }

        console.outln("---- User-defined code ended! ----");
    }
}