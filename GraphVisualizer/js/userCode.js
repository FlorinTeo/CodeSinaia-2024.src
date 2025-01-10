import { CoreCode } from "./core/coreCode.js";
import { console, queue } from "./main.js";
import { graph } from "./main.js";
import { stack } from "./main.js";
import { ColorIndex } from "./adt/graph.js";

export class UserCode extends CoreCode {

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

    async loadGraph(graphData) {
        const response = await fetch(`https://florinteo.github.io/CodeSinaia-2024.src/GraphVisualizer/data/${graphData}`);
        const graphString = await response.text();
        graph.fromString(graphString);
        queue.clear();
        stack.clear();
    }

    async isBinaryTree() {
        let result = true;
        graph.nodes.forEach(n => { n.marker = 0; });
        if (!this.#startNode.isTree(2)) {
            console.outln("Error: Not a binary tree!");
            return false;
        }
        return true;
    }

    #delay() {
        return this.tracing ? Infinity : 100;
    }
    //#endregion graph setup helpers

    //#region tree algorithms
    async toPrefixStr() {
        // pick up inputs in the algo
        if (!await this.setup("root") || !await this.isBinaryTree()) {
            return false;
        }
       
        let root = this.#startNode;
        graph.traverse(n => {n.state = 0;});
        stack.clear();
        queue.clear();
        stack.push(root);
        while (stack.size() > 0) {
            let node = stack.pop();
            if (node.neighbors.length > 0) {
                if (node.colorIndex == ColorIndex.Gray) {
                    node.colorIndex = ColorIndex.Yellow;
                    await this.step(this.#delay());
                    stack.push(node);
                    if (node.left) {
                        stack.push(node.left);
                    }
                    if (node.right) {
                        stack.push(node.right);
                    }
                } else {
                    node.colorIndex = ColorIndex.Green;
                    node.state = `${node.label} `
                               + `${node.left ? node.left.state + " " : ""}`
                               + `${node.right ? node.right.state + " " : ""}`;
                    node.state = node.state.trim();
                }
            } else {
                node.colorIndex = ColorIndex.Green;
                node.state = node.label;
            }
            await this.step(this.#delay());
        }
        console.outln(root.state);
        return true;
    }

    async toInfixStr() {
        // pick up inputs in the algo
        if (!await this.setup("root") || !await this.isBinaryTree(this.#startNode)) {
            return;
        }
        
        let root = this.#startNode;
        graph.traverse(n => {n.state = 0;});
        stack.clear();
        queue.clear();
        stack.push(root);
        while (stack.size() > 0) {
            let node = stack.pop();
            if (node.left || node.right) {
                if (node.colorIndex == ColorIndex.Gray) {
                    node.colorIndex = ColorIndex.Yellow;
                    await this.step(this.#delay());
                    stack.push(node);
                    if (node.left) {
                        stack.push(node.left);
                    }
                    if (node.right) {
                        stack.push(node.right);
                    }
                } else {
                    node.colorIndex = ColorIndex.Green;
                    node.state = `(${node.left ? node.left.state + " " : ""}`
                               + `${node.label}`
                               + `${node.right ? " " + node.right.state : ""})`;
                    node.state = node.state.trim();
                }
            } else {
                node.colorIndex = ColorIndex.Green;
                node.state = node.label;
            }
            await this.step(this.#delay());
        }
        console.outln(root.state);
        return true;
    }

    async toPostfixStr() {
        // pick up inputs in the algo
        if (!await this.setup("root") || !await this.isBinaryTree(this.#startNode)) {
            return;
        }
        
        let root = this.#startNode;
        graph.traverse(n => {n.state = 0;});
        stack.clear();
        queue.clear();
        stack.push(root);
        while (stack.size() > 0) {
            let node = stack.pop();
            if (node.neighbors.length > 0) {
                if (node.colorIndex == ColorIndex.Gray) {
                    node.colorIndex = ColorIndex.Yellow;
                    await this.step(this.#delay());
                    stack.push(node);
                    if (node.left) {
                        stack.push(node.left);
                    }
                    if (node.right) {
                        stack.push(node.right);
                    }
                } else {
                    node.colorIndex = ColorIndex.Green;
                    node.state = `${node.left ? node.left.state + " ": ""}`
                               + `${node.right ? node.right.state + " ": ""}`
                               + `${node.label} `;
                    node.state = node.state.trim();
                }
            } else {
                node.colorIndex = ColorIndex.Green;
                node.state = node.label;
            }
            await this.step(this.#delay());
        }
        console.outln(root.state);
        return true;
    }

    async avlBalanceCheck() {
        if (!await this.setup("root") || !await this.isBinaryTree()) {
            return false;
        }
        let result = false;
        let root = this.#startNode;
        graph.traverse(n => {n.state = 0;});
        stack.clear();
        queue.clear();
        stack.push(root);
        while (stack.size() > 0) {
            let node = stack.pop();
            if (node.colorIndex == ColorIndex.Gray) {
                node.colorIndex = ColorIndex.Yellow;
                await this.step(this.#delay());
                stack.push(node);
                if (node.left) {
                    stack.push(node.left);
                }
                if (node.right) {
                    stack.push(node.right);
                }
            } else {
                let heightLeft = node.left ? node.left.state : 0;
                let heightRight = node.right ? node.right.state : 0;
                node.state = Math.max(heightLeft, heightRight) + 1;
                if ((node.left && node.left.colorIndex != ColorIndex.Gray) || (node.right && node.right.colorIndex != ColorIndex.Gray)) {
                    node.colorIndex = ColorIndex.Blue;
                } else if (Math.abs(heightLeft - heightRight) > 1) {
                    node.colorIndex = ColorIndex.Green;
                    result = true;
                } else {
                    node.colorIndex = ColorIndex.Gray;
                }
            }
            //await this.step(this.#delay()/10);
        }
        return result;
    }
    //#endregion tree algorithms

    //#region graph algorithms
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
                    await this.step(this.#delay());
                }
            }
            if (node === root) {
                node.toggleColor(1);
            } else {
                node.colorIndex=ColorIndex.Green;
            }
        }
        // remove edges to make the spanning tree more visible
        let noncoloredEdges = graph.edges.filter(e => e.colorIndex == ColorIndex.Gray)
        for(const e of noncoloredEdges){
            graph.removeEdge(e.node1, e.node2);
            graph.removeEdge(e.node2, e.node1);
            await this.step(this.#delay());
        }
    }

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
            await this.step(this.#delay());
            crtNode = crtNode.state;
        }
        crtNode.colorIndex = ColorIndex.Green;

        console.outln(`    route distance = ${distance.toFixed(1)}`);
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
            await this.step(this.#delay());
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
                await this.step(this.#delay());
            }
            node.colorIndex = ColorIndex.Yellow;
            await this.step(this.#delay());
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
            await this.step(this.#delay());
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
                    await this.step(this.#delay());
                }
            }
            node.colorIndex = ColorIndex.Yellow;
            await this.step(this.#delay());
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
            await this.step(this.#delay());
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
                await this.step(this.#delay());
            }
            node.colorIndex = ColorIndex.Yellow;
            await this.step(this.#delay());
        }
        await this.extractPath(startNode, endNode);
        console.outln(`    iterations = ${iterations}`);
    }
    //#endregion graph algorithms

    /**
     * Entry point for user-defined code.
     */
    async run() {
        console.outln("---- Starting user-defined code! ----");
        let selection = console.getSelection();
        switch(selection.toLowerCase()) {
            case 'loadtree':
                await this.loadGraph("exprTree.txt");
                break;
            case 'loadavltree':
                await this.loadGraph("avlTree.txt");
                break;
            case 'toprefixstr':
                console.outln("Prefix form of expression:");
                await this.toPrefixStr();
                break;
            case 'toinfixstr':
                console.outln("Infix form of expression:");
                await this.toInfixStr();
                break;
            case 'topostfixstr':
                console.outln("Postfix form of expression:");
                await this.toPostfixStr();
                break;
            case 'avlbalancecheck':
                if (await this.avlBalanceCheck()) {
                    console.outln("AVL tree needs rebalancing!");
                } else {
                    console.outln("AVL Tree is balanced!");
                }
                break;
            case 'loadgraph':
                await this.loadGraph("graph.txt");
                break;
            case 'spanningtree':
                console.outln("Run Spanning Tree algo.");
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
                console.outln("  loadTree / loadAVLTree : loads a sample binary tree.");
                console.outln("    toPrefixStr     : serializes the tree in prefix order.");
                console.outln("    toInfixStr      : serializes the tree in infix order.")
                console.outln("    toPostfixStr    : serializes the tree in postfix order.");
                console.outln("    avlBalanceCheck : highlights nodes to rebalance in AVL tree.");
                console.outln("  --------------");
                console.outln("  loadGraph  : loads a sample graph.");
                console.outln("    spanningTree : runs the Spanning tree algo.");
                console.outln("    bfs          : runs Breath-First-Search algo.");
                console.outln("    dijkstra     : runs Dijkstra algo.");
                console.outln("    astar        : runs the A* algo.");
                console.outln("::Select word and click <Run> to execute command::");
        }

        console.outln("---- User-defined code ended! ----");
    }
}