/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import { Node, NODE_TYPES } from "./Node";

const colorMap = {
  light: {
    obstacle: "#222",
    grid: "#e0e0e0",
    start: "#12467B",
    end: "#A51818",
    considered: "#c5dedf",
    path: "#4e7bb6",
  },
  dark: {
    obstacle: "#888",
    grid: "#333",
    start: "#2255AB",
    end: "#A51818",
    considered: "#c5dedf",
    path: "#4e7bb6",
  },
};

export default function Canvas({ gridSize, isErasing, sideLength, grid, setGrid, theme, setStartNode, setEndNode }) {
  const cellSize = sideLength / gridSize;
  const canvasRef = useRef(null);
  const [isDraggingStartNode, setIsDraggingStartNode] = useState(false);
  const [isDraggingEndNode, setIsDraggingEndNode] = useState(false);

  // Remove grid initialization useEffect - now handled by useGrid

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const drawGrid = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = colorMap[theme].grid;

      grid.forEach((row) => {
        row.forEach((node) => {
          const x = node.col * cellSize;
          const y = node.row * cellSize;

          context.strokeRect(x, y, cellSize, cellSize);

          if (node.type !== "empty") {
            context.fillStyle = colorMap[theme][node.type];
            context.fillRect(x, y, cellSize, cellSize);
          }
        });
      });
    };

    drawGrid();

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      // Remove event listeners on cleanup
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [grid, cellSize, theme]);

  function handleMouseDown(e) {
    if (grid.length === 0 || isDraggingEndNode || isDraggingStartNode) return;

    const row = Math.floor(e.offsetY / cellSize);
    const col = Math.floor(e.offsetX / cellSize);
    const node = grid[row][col];

    if (node.type === "start") {
      setIsDraggingStartNode(true);
      setStartNode(new Node(row, col, "start"));
    } else if (node.type === "end") {
      setIsDraggingEndNode(true);
      setEndNode(new Node(row, col, "end"));
    } else {
      // Handle drawing obstacles logic here
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[row][col] = { ...node, type: isErasing ? "empty" : NODE_TYPES.OBSTACLE };
        return newGrid;
      });
    }
  }

  function handleMouseMove(e) {
    if (grid.length === 0) return;

    const row = Math.floor(e.offsetY / cellSize);
    const col = Math.floor(e.offsetX / cellSize);
    const node = grid[row][col];

    if (isDraggingStartNode && [NODE_TYPES.EMPTY, NODE_TYPES.CONSIDERED, NODE_TYPES.PATH].includes(node.type)) {
      setStartNode(new Node(row, col, "start"));
    } else if (isDraggingEndNode && [NODE_TYPES.EMPTY, NODE_TYPES.CONSIDERED, NODE_TYPES.PATH].includes(node.type)) {
      setEndNode(new Node(row, col, "end"));
    } else if (e.buttons === 1) {
      handleMouseDown(e);
    }
  }

  function handleMouseUp() {
    setIsDraggingStartNode(false);
    setIsDraggingEndNode(false);
  }

  return <canvas ref={canvasRef} width={sideLength} height={sideLength} />;
}
