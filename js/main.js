import { RADIUS } from "./adt/node.js"
import { Graph } from "./adt/graph.js"
import { Queue } from "./adt/queue.js"
import { Stack } from "./adt/stack.js"
import { Graphics } from "./graphics.js"
import { ContextMenu } from "./contextMenu.js"
import { XferDialog } from "./xferDialog.js"
import { HIGHLIGHT_COLOR } from "./adt/highlight.js"

// html elements
export let hDiv = document.getElementById("hMainDiv");
export let hCanvas = document.getElementById("hMainCanvas");
export let hNodeState = document.getElementById("hNodeState");

// global objects
export let ctxMenuCanvas = new ContextMenu("hCtxMenuCanvas");
export let ctxMenuNode = new ContextMenu("hCtxMenuNode");
export let graphics = new Graphics(hCanvas);
export let xferDialog = new XferDialog(graphics);
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

// main entry point
repaint();

// #region - window/dialog event handlers
// state variables to control UI actions
let clickedNode = null;
let ctrlClicked = false;
let shiftClicked = false;
let dragging = false;

// browser resize event handler
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    switch (entry.target.id) {
      case hDiv.id:
        graphics.resize(entry.contentRect.width, entry.contentRect.height);
        repaint();
        return;
    }
  }
});
resizeObserver.observe(hDiv);

xferDialog.addCloseListener((event) => {
  if (event != null && event == 'in') {
    queue.clear();
    repaint();
  }
});
// #endregion - window/dialog event handlers

// #region - key event handlers
document.addEventListener('keydown', (event) => {
  if (navigator.userAgentData.platform == 'Windows') {
    ctrlClicked = event.ctrlKey;  
  } else {
    ctrlClicked = event.metaKey;
  }
  shiftClicked = event.shiftKey;
});

document.addEventListener('keyup', (event) => {
  if (navigator.userAgentData.platform == 'Windows') {
    ctrlClicked = event.ctrlKey;  
  } else {
    ctrlClicked = event.metaKey;
  }
  shiftClicked = event.shiftKey;
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
  let hoverNode = graph.getNode(x, y);
  dragging = (event.button == 0) && (clickedNode != null);

  if (!dragging) {
    // if not dragging, just show the state of the node the mouse may be hovering over
    hNodeState.innerHTML = (hoverNode != null) ? hoverNode.toString(true) : '';
  } else if (clickedNode != null) {
    // in the middle of {drag} that started over a node (clickedNode)
    if (ctrlClicked || shiftClicked) {
      // {ctrl-drag} or {shift-drag} => draw an edge lead line since we may be creating/removing an edge.
      repaint();
      if (hoverNode != null) {
        if (shiftClicked) {
          // {shift-drag} => draw a highlight lead line and an edge lead line as applicable
          graphics.drawLine(clickedNode.x, clickedNode.y, hoverNode.x, hoverNode.y, RADIUS, RADIUS, 6, HIGHLIGHT_COLOR);
          if (clickedNode.hasEdge(hoverNode) || hoverNode.hasEdge(clickedNode)) {
            graphics.drawLine(clickedNode.x, clickedNode.y, hoverNode.x, hoverNode.y, RADIUS, RADIUS, 1, 'black');    
          }
        }
        if (ctrlClicked) {
          // {ctrl-drag} => draw an edge lead line
          graphics.drawLine(clickedNode.x, clickedNode.y, hoverNode.x, hoverNode.y, RADIUS, RADIUS, 1, 'black');
        }
      } else {
        // not hovering over a node => draw a gray tracking line
        graphics.drawLine(clickedNode.x, clickedNode.y, x, y, RADIUS, 0, 1, '#CCCCCC');
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
    // dragging makes sense only if one node (clickedNode) is ctrl-dragged over another (droppedNode)
    // otherwise, clickedNode move was taken care of by the mousemove handler.
    if (clickedNode != null && droppedNode != null) {
      if (ctrlClicked) {
        // {control-drag} over an existent node => reset edge from clickedNode to droppedNode
        graph.resetEdge(clickedNode, droppedNode);
      }
      if (shiftClicked) {
        // {shift-drag} over an existent node => reset highlight from clickedNode to droppedNode
        graph.resetHighlight(clickedNode, droppedNode);
      }
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
      targetNode.toggleFill(event.deltaY);
    }
    repaint();
  }
}, { passive: false });
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
      ['hCtxMenuCanvas_ResetC', graph.size() > 0 && !graph.matchAll((node) => { return node.fillIndex == 0; })],
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

ctxMenuCanvas.addContextMenuListener('hCtxMenuCanvas_ResetC', () => {
  graph.traverse((node) => { node.fillIndex = 0; });
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
