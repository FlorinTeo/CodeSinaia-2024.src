import { ColorIndex } from "./adt/graph.js";
import { CoreCode } from "./core/coreCode.js";
import { console, queue } from "./main.js";
import { graph } from "./main.js";
export class UserCode extends CoreCode {

    /**
     * Implements a simplified Dijkstra-like algorithm to find the shortest path
     * between a start and end node without calculating distances.
     */
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
        for (let i = 0; i < path.length; i++) {
            let node = path[i];
            // let nextNode = path[i + 1];
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
        // Color the last node
        // if (path.length > 0) {
        //     path[path.length - 1].toggleColor(1);
        //     await this.step();
        // }
    }

    async spanningTree(){
        let coloredNodes = graph.nodes.filter(n => n.colorIndex !=0 );
        
        if(coloredNodes.length != 1){
            console.outln("No root!")
            return
        }
        let root = coloredNodes[0];
        root.toggleColor(1);
        queue.clear();
        queue.enqueue(root);
        while(queue.size() != 0){
            let node = queue.dequeue();
            node.colorIndex=ColorIndex.Red;
            for(const n of node.neighbors){
                if(n.colorIndex == ColorIndex.Gray){
                    n.colorIndex = ColorIndex.Green;
                    let edge = graph.getEdge(node, n);
                    edge.colorIndex = ColorIndex.Yellow;
                    queue.enqueue(n);
                }
            }
            node.colorIndex=ColorIndex.Yellow;
        }    
        let noncoloredEdges = graph.edges.filter(e => e.colorIndex == ColorIndex.Gray)
        for(const e of noncoloredEdges){
            graph.removeEdge(e.node1, e.node2);
            graph.removeEdge(e.node2, e.node1);
        }
    }
    /**
     * Entry point for user-defined code.
     */
    async spanningTree(){
        let coloredNodes = graph.nodes.filter(n => n.colorIndex !=0 );
        
        if(coloredNodes.length != 1){
            console.outln("No root!")
            return
        }
        let root = coloredNodes[0];
        root.toggleColor(1);
        queue.clear();
        queue.enqueue(root);
        while(queue.size() != 0){
            let node = queue.dequeue();
            node.colorIndex=ColorIndex.Red;
            for(const n of node.neighbors){
                if(n.colorIndex == ColorIndex.Gray){
                    n.colorIndex = ColorIndex.Green;
                    let edge = graph.getEdge(node, n);
                    edge.colorIndex = ColorIndex.Yellow;
                    queue.enqueue(n);
                }
            }
            node.colorIndex=ColorIndex.Yellow;
        }    
        let noncoloredEdges = graph.edges.filter(e => e.colorIndex == ColorIndex.Gray)
        for(const e of noncoloredEdges){
            graph.removeEdge(e.node1, e.node2);
            graph.removeEdge(e.node2, e.node1);
        }
    }
    async run() {
        console.outln("---- Starting user-defined code! ----");
        await this.colorShortestPath();
        // await this.spanningTree();
        console.outln("---- User-defined code ended! ----");
    }
}