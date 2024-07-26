// import { CoreCode } from "./core/coreCode.js";
// import { console } from "./main.js";
// import { graph } from "./main.js";

// export class UserCode extends CoreCode {

//     /**
//      * Toggles the colors of each node, if any
//      */
//     async toggleNodes() {
//         for(const node of graph.nodes) {
//             await this.step();
//             node.toggleColor(1);
//         }
//     }

//     /**
//      * Toggles the colors of each edge, if any
//      */
//     async toggleEdges() {
//         for(let i=0; i < graph.edges.length; i++) {
//             await this.step();
//             graph.edges[i].toggleColor(1);
//         }
//     }
    
//     async isSinglyLinkedList(){
//         console.outln("--- Checking if it is a singly linked list ---");
//         for(const node of graph.nodes) {
            
//             for(const n of node.neighbors){
//                 //if(node.neighbors != [])
//                     n.state += 1;
//             }
//         }
//         let heads = graph.nodes.filter(n => n.state == 0) //filter all nodes with indegree = 0
//         if(heads.length!==1){
//             return false;
//         }
//         let tails = graph.nodes.filter(n => n.neighbors == []) //filter all nodes with outdegree = 0
//         if(tails.length > 1){
//             return false;
//         }     
//         let double_linked = graph.nodes.filter(n => n.state>=2)
//         if(double_linked.length > 0){
//             return false;
//         } 
//         return true;
        
//     }

//     /**
//      * Entry point for user-defined code.
//      */
//     async run() {
//         console.outln("---- Starting user-defined code! ----");
//         /*

//         console.out("Toggling nodes color ... ");
//         await this.toggleNodes();
//         console.outln("DONE");
//         await this.step();

//         console.out("Toggling edges color ... ");
//         await this.toggleEdges();
//         console.outln("DONE");
//         await this.step();

//         console.outln("---- User-defined code ended! ----");*/
//         let success =  await this.isSinglyLinkedList();
//         if(success){
//             console.outln("yes it is a singly linked list")
//         }else{
//             console.outln("no it is not a singly linked list")
//         }
//         for(const node of graph.nodes) {
            
//             for(const n of node.neighbors){
//                 //if(node.neighbors != [])
//                     n.state =0;
//             }
//         }
//     }
// }
// // verde - #93FF2D
// // mov ceva - #ECA4FF

// // import { CoreCode } from "./core/coreCode.js";
// // import { console } from "./main.js";
// // import { graph } from "./main.js";

// // export class UserCode extends CoreCode {

// //     /**
// //      * Toggles the colors of each node, if any
// //      */
// //     async toggleNodes() {
// //         for (const node of graph.nodes) {
// //             await this.step();
// //             node.toggleColor(1);
// //         }
// //     }

// //     /**
// //      * Toggles the colors of each edge, if any
// //      */
// //     async toggleEdges() {
// //         for (let i = 0; i < graph.edges.length; i++) {
// //             await this.step();
// //             graph.edges[i].toggleColor(1);
// //         }
// //     }
// //     async isSinglyLinkedList(){
// //         for(const node of graph.nodes)
// //         {
// //             for(const n of node.neighbors)
// //             {
// //                 n.state++;
// //             }
// //         }
// //         let heads = graph.nodes.filter(n => n.state==0); //filter all nodes with in-degree 0
// //         // let tail = 
// //         if(heads.length!=1) return false; 
// //         return true;
// //     }
// //     /**
// //      * Entry point for user-defined code.
// //      */
// //     async run() {
// //         console.outln("---- Starting user-defined code! ----");

// //         if (await this.isSinglyLinkedList()) {
// //             console.outln("The graph is a singly linked list.");
// //         } else {
// //             console.outln("The graph is NOT a singly linked list.");
// //         }

// //         // Uncomment to toggle nodes and edges
// //         // console.out("Toggling nodes color ... ");
// //         // await this.toggleNodes();
// //         // console.outln("DONE");
// //         // await this.step();

// //         // console.out("Toggling edges color ... ");
// //         // await this.toggleEdges();
// //         // console.outln("DONE");
// //         // await this.step();
// //         // console.outln("---- User-defined code ended! ----");
// //     }
// // }
