import {SCALE} from "./adt/graph.js";
import { RADIUS } from "./adt/graph.js";
import { LINE_WIDTH } from "./adt/graph.js";
import { Graph } from "./adt/graph.js";
import { Queue } from "./adt/queue.js";
import { Stack } from "./adt/stack.js";
import { Graphics } from "./core/graphics.js";
import { ContextMenu } from "./core/contextMenu.js";
import { XferDialog } from "./core/xferDialog.js";
import { ConsoleDialog } from "./core/consoleDialog.js";
import { UserCode } from "./userCode.js";

// html elements
export let hTdCanvas = document.getElementById("hTdCanvas");
export let hCanvas = document.getElementById("hMainCanvas");

export let hTdBtn = document.getElementById("hTdBtn");
export let hBtnConsole = document.getElementById("hBtnConsole");
export let hNodeState = document.getElementById("hNodeState");

// global objects
export let ctxMenuCanvas = new ContextMenu("hCtxMenuCanvas");
export let ctxMenuNode = new ContextMenu("hCtxMenuNode");
export let graphics = new Graphics(hCanvas);
export let xferDialog = new XferDialog(graphics);
export let userCode = new UserCode();
export let console = new ConsoleDialog(userCode);

// global adt objects
export let graph = new Graph(graphics);
export let queue = new Queue(graphics);
export let stack = new Stack(graphics);

// exported functions
export function repaint() {
  graphics.clear();
  graph.repaint();
  queue.repaint();
  stack.repaint();
}

const AUTO_LABELS = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function nextLabel(crtLabel, deltaIndex) {
  let labels = AUTO_LABELS.split("").slice();
  graph.traverse(node => { labels = labels.filter(l => (l != node.label)); });
  if (crtLabel != undefined) {
    // returning an label, requesting the next one;
    labels.push(crtLabel);
  }
  labels.sort((a, b) => alphaFirstCompare(a, b));
  let nextIndex = (crtLabel != undefined) ? (labels.length + labels.indexOf(crtLabel) + deltaIndex) % labels.length : 0;
  return (labels.length > 0) ? labels[nextIndex] : '?';
}

function alphaFirstCompare(a, b) {
  let aIsNum = /^\d$/.test(a);
  let bIsNum = /^\d$/.test(b);
  if (aIsNum ^ bIsNum) {
    return bIsNum ? -1 : 1;
  } else {
    return a.localeCompare(b);
  }
}

function isWindowsOS() {
  return (navigator.userAgentData && navigator.userAgentData.platform == 'Windows')
      || (navigator.platform == 'Win32');
}

// main entry point
console.clear();
repaint();

// state variables to control UI actions
let hoverNode = null;
let clickedNode = null;
let ctrlClicked = false;
let keyPressed = false;
let dragging = false;

// #region - window/dialog event handlers
// browser resize event handler
const resizeObserver = new ResizeObserver(entries => {
  var canvasW = window.innerWidth - 44;
  hTdCanvas.style.width=`${canvasW})`;
  graphics.resize(canvasW, window.innerHeight - 44);
  repaint();
});
resizeObserver.observe(document.documentElement);

hBtnConsole.addEventListener('click', (event) => {
  console.show(graph);
});

xferDialog.addCloseListener((event) => {
  if (event != null && event == 'in') {
    queue.clear();
    repaint();
  }
});
// #endregion - window/dialog event handlers

// #region - key event handlers

document.addEventListener('keydown', (event) => {
  ctrlClicked = event.ctrlKey || event.metaKey;
  
  if (!keyPressed && hoverNode != null) {
    switch(event.key.toUpperCase()) {
      case 'E': // enqueue
        queue.enqueue(hoverNode);
        repaint();
        break;
      case 'D': // dequeue
        if (hoverNode == queue.peek()) {
          queue.dequeue();
          repaint();
        }
        break;
      case 'P': // push
        stack.push(hoverNode);
        repaint();
        break;
      case 'O': // pop
        if (hoverNode == stack.peek(hoverNode)) {
          stack.pop();
          repaint();
        }
        break;
    }
  }

  keyPressed = true;
});

document.addEventListener('keyup', (event) => {
  ctrlClicked = event.ctrlKey || event.metaKey;

  keyPressed = false;
});
// #endregion - key event handlers

// #region - mouse event handlers
// mouse down event handler
// retain the target node (if any) at the beginning of a click or drag action
hCanvas.addEventListener('mousedown', (event) => {
  let x = event.clientX - hCanvas.offsetLeft;
  let y = event.clientY - hCanvas.offsetTop;
  clickedNode = graph.getNode(x, y);
});

// mouse move event handler
// draw the guide line from the target node (if any) to the mouse position
hCanvas.addEventListener('mousemove', (event) => {
  let x = event.clientX - hCanvas.offsetLeft;
  let y = event.clientY - hCanvas.offsetTop;
  hoverNode = graph.getNode(x, y);
  dragging = (event.button == 0) && (clickedNode != null);

  if (!dragging) {
    // if not dragging and ..
    if (hoverNode != null) {
        // .. if hovering over a node, just show the state of that node
        hNodeState.textContent = hoverNode.toString(true);
    } else {
        let hoverEdge = graph.getEdge(x, y);
        // .. otherwise..
        if (hoverEdge != null) {
            // .. if hovering over an edge, show the distance covered by that edge
            hNodeState.textContent = `${hoverEdge.node1.label}\u21D4${hoverEdge.node2.label} : ${hoverEdge.node1.distance(hoverEdge.node2).toFixed(1)}`;
        } else {
            // .. if not hovering over anything, just clear the status area.
            hNodeState.textContent = "";
        }
    }
    
  } else if (clickedNode != null) {
    // in the middle of {drag} that started over a node (clickedNode)
    if (ctrlClicked) {
      // {ctrl-drag} => draw an edge lead line since we may be creating/removing an edge.
      repaint();
      if (hoverNode != null) {
        // {ctrl-drag} => draw an edge lead line
        graphics.drawLine(
            clickedNode.x, clickedNode.y,
            hoverNode.x, hoverNode.y,
            RADIUS[SCALE], RADIUS[SCALE],
            LINE_WIDTH[SCALE],
            'black');
      } else {
        // not hovering over a node => draw a gray tracking line
        graphics.drawLine(
            clickedNode.x, clickedNode.y,
            x, y,
            RADIUS[SCALE], 0,
            LINE_WIDTH[SCALE],
            '#CCCCCC');
      }
    } else {
      // simple {drag} => just move the node following the mouse
      clickedNode.x = x;
      clickedNode.y = y;
      repaint();
    }
  }
});

// mouse up event handler
hCanvas.addEventListener('mouseup', (event) => {
  let x = event.clientX - hCanvas.offsetLeft;
  let y = event.clientY - hCanvas.offsetTop;
  let droppedNode = graph.getNode(x, y);

  // if this is not related to a "left-button-click", nothing to do
  if (!event.button == 0) {
    return;
  }

  // check if this is the end of a {drag} or a {click} event
  if (dragging) {
    // if {control-drag}, meaning control pressed, started on a node and ended on a different node)...
    if (ctrlClicked && clickedNode != null && droppedNode != null && clickedNode != droppedNode) {
      // => reset edge from clickedNode to droppedNode
      if (!clickedNode.hasEdge(droppedNode)) {
        graph.addEdge(clickedNode, droppedNode);
      } else {
        graph.removeEdge(clickedNode, droppedNode);
      }
    } else if (clickedNode != null) {
      // otherwise, if drag was just moving a node, need to resort all edges across all nodes
      // such that nodes with smaller x coordinate are ahead in neighbors lists (to model trees deterministically)
      graph.traverse((node) => { node.resortEdges(); });
    }
    dragging = false;
  } else if (ctrlClicked) {
    // {control-click} => either add a new node, or remove an existent one
    if (droppedNode != null) {
      // {control-click} over existent node => remove node
      queue.removeNode(droppedNode);
      stack.removeNode(droppedNode);
      graph.removeNode(droppedNode);
    } else {
      // {click} over an empty areay => add node
      graph.addNode(nextLabel(), x, y);
    }
  }
  repaint();
  clickedNode = null;
});

// wheel action event
// when targeting a node resets, wheel-up resets the node's state color
// to default light gray, wheel-down rotates through different state colors
hCanvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  let x = event.clientX - hCanvas.offsetLeft;
  let y = event.clientY - hCanvas.offsetTop;
  let targetNode = graph.getNode(x, y);
  if (targetNode != null) {
    if (event.ctrlKey) {
      let newLabel = nextLabel(targetNode.label, Math.sign(event.deltaY));
      let prevLabel = graph.reLabel(targetNode, newLabel);
    } else {
      targetNode.toggleColor(event.deltaY);
    }
  } else {
    let targetEdge = graph.getEdge(x, y);
    if (targetEdge) {
      targetEdge.toggleColor(event.deltaY);
    }
  }
  repaint();
},
{ passive: false });
// #endregion - mouse event handlers

// #region - context menu handlers
// When right-click on a node, open the context menu options 
hCanvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  let x = event.clientX - hCanvas.offsetLeft;
  let y = event.clientY - hCanvas.offsetTop;
  clickedNode = graph.getNode(x, y);
  if (clickedNode != null) {
    // customize and show hCtxMenuNode
    ctxMenuNode.setInput('hCtxMenuNode_Label', clickedNode.label);
    ctxMenuNode.setInput('hCtxMenuNode_State', clickedNode.state);
    ctxMenuNode.setVisible(new Map([
      ['hCtxMenuNode_Dequeue', clickedNode === queue.peek()],
      ['hCtxMenuNode_Pop', clickedNode === stack.peek()],
    ]));
    ctxMenuNode.show(event.pageX - 10, event.pageY - 10, () => { clickedNode = null; });
  } else {
    // customize and show hCtxMenuCanvas
    ctxMenuCanvas.setInput('hCtxMenuCanvas_ResetS', 0);
    ctxMenuCanvas.setVisible(new Map([
      ['hCtxMenuCanvas_ResetS', graph.size() > 0],
      ['hCtxMenuCanvas_ResetNh', graph.hasNodeHighlights()],
      ['hCtxMenuCanvas_ResetEh', graph.hasEdgeHighlights()],
      ['hCtxMenuCanvas_ResetQ', queue.size() > 0],
      ['hCtxMenuCanvas_ResetT', stack.size() > 0],
      ['hCtxMenuCanvas_ResetG', graph.size() > 0],
    ]));
    ctxMenuCanvas.show(event.pageX - 10, event.pageY - 10);
  }
});

// #region - Canvas context menu handlers
ctxMenuCanvas.addContextMenuListener('hCtxMenuCanvas_ResetS', (_, value) => {
  graph.traverse((node) => { node.state = value; });
});

ctxMenuCanvas.addContextMenuListener('hCtxMenuCanvas_ResetNh', () => {
  graph.traverse((node) => { node.colorIndex = 0; });
  repaint();
});

ctxMenuCanvas.addContextMenuListener('hCtxMenuCanvas_ResetEh', () => {
  graph.edges.forEach((edge) => { edge.toggleColor(-1); });
  repaint();
});

ctxMenuCanvas.addContextMenuListener('hCtxMenuCanvas_ResetQ', () => {
  queue.clear();
  repaint();
});

ctxMenuCanvas.addContextMenuListener('hCtxMenuCanvas_ResetT', () => {
  stack.clear();
  repaint();
});

ctxMenuCanvas.addContextMenuListener('hCtxMenuCanvas_ResetG', () => {
  graph.clear();
  queue.clear();
  stack.clear();
  repaint();
});

ctxMenuCanvas.addContextMenuListener('hCtxMenuCanvas_XFer', () => {
  xferDialog.show(graph);
})

ctxMenuCanvas.addContextMenuListener('hCtxMenuCanvas_Help', () => {
  window.open('help.html', '_blank').focus();
})
// #endregion - Canvas context menu handlers

// #region - Node context menu handlers
ctxMenuNode.addContextMenuListener('hCtxMenuNode_Label', (_, value) => {
  let prevLabel = graph.reLabel(clickedNode, value);
  stack.measureWidth();
  repaint();
});

ctxMenuNode.addContextMenuListener('hCtxMenuNode_State', (_, value) => {
  clickedNode.state = value;
  hNodeState.innerHTML = clickedNode.toString(true);
});

ctxMenuNode.addContextMenuListener('hCtxMenuNode_Enqueue', () => {
  queue.enqueue(clickedNode);
  repaint();
});

ctxMenuNode.addContextMenuListener('hCtxMenuNode_Dequeue', () => {
  queue.dequeue();
  repaint();
});

ctxMenuNode.addContextMenuListener('hCtxMenuNode_Push', () => {
  stack.push(clickedNode);
  repaint();
});

ctxMenuNode.addContextMenuListener('hCtxMenuNode_Pop', () => {
  stack.pop();
  repaint();
});
// #endregion - Node context menu handlers
// #endregion - context menu handlers
