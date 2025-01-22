import { NODE_TYPES } from "../Node";

// utils/canvasDrawing.js
export function drawGrid(context, grid, cellSize, colorMap, theme) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.strokeStyle = colorMap[theme].grid;
  
  grid.forEach((row) => {
    row.forEach((node) => {
      drawNode(context, node, cellSize, colorMap[theme]);
    });
  });
}

export function drawNode(context, node, cellSize, colors) {
  const x = node.col * cellSize;
  const y = node.row * cellSize;
  
  context.strokeRect(x, y, cellSize, cellSize);
  
  if (node.type === NODE_TYPES.OBSTACLE) {
    context.fillStyle = colors.obstacle;
    context.fillRect(x, y, cellSize, cellSize);
  }
  // etc...
}