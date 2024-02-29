/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import { Node, NODE_TYPES } from "./Node";

const colorMap = {
  light: {
    obstacle: "#222",
    grid: "#e0e0e0",
    start: "#12467B",
    end: "#A51818",
  },
  dark: {
    obstacle: "#888",
    grid: "#333",
    start: "#2255AB",
    end: "#A51818",
  },
};

export default function Canvas(props) {
  const { gridSize, grid, setGrid, theme, startNode, setStartNode, endNode, setEndNode } = props;
  const cellSize = props.sideLength / gridSize;
  const canvasRef = useRef(null); // Reference to the canvas element
  const [isDraggingStartNode, setIsDraggingStartNode] = useState(false);
  const [isDraggingEndNode, setIsDraggingEndNode] = useState(false);

  // Draw the grid and obstacles
  useEffect(() => {
    // Get the canvas context
    const canvas = canvasRef.current;
    const context = canvasRef.current.getContext("2d");

    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, props.sideLength);

    // Set the grid color
    context.strokeStyle = colorMap[theme].grid;

    // Draw grid from the grid state
    grid.forEach((row) => {
      row.forEach((node) => {
        const x = node.col * cellSize;
        const y = node.row * cellSize;
        context.strokeRect(x, y, cellSize, cellSize);
        if (node.type === NODE_TYPES.OBSTACLE) {
          // Draw the obstacle
          context.fillStyle = colorMap[theme].obstacle;
          context.fillRect(x, y, cellSize, cellSize);
        }
        if (node.type === "start") {
          // Draw the start node
          context.fillStyle = colorMap[theme].start;
          context.fillRect(x, y, cellSize, cellSize);
        }
        if (node.type === "end") {
          // Draw the end node
          context.fillStyle = colorMap[theme].end;
          context.fillRect(x, y, cellSize, cellSize);
        }
      });
    });

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      // Remove event listeners on cleanup
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [cellSize, grid, theme]); // Re-render canvas upon changes

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
        newGrid[row][col] = { ...node, type: props.isErasing ? "empty" : NODE_TYPES.OBSTACLE };
        return newGrid;
      });
    }
  }

  function handleMouseMove(e) {
    if (grid.length === 0) return;

    const row = Math.floor(e.offsetY / cellSize);
    const col = Math.floor(e.offsetX / cellSize);
    const node = grid[row][col];

    if (isDraggingStartNode && node.type === "empty") {
      setStartNode(new Node(row, col, "start"));
    } else if (isDraggingEndNode && node.type === "empty") {
      setEndNode(new Node(row, col, "end"));
    } else if (e.buttons === 1) {
      handleMouseDown(e);
    }
  }

  function handleMouseUp() {
    setIsDraggingStartNode(false);
    setIsDraggingEndNode(false);
  }

  return <canvas ref={canvasRef} width={props.sideLength} height={props.sideLength} />;
}
