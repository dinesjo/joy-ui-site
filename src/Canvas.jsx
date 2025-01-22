/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import { Node, NODE_TYPES } from "./Node";

const colors = {
  obstacle: "#222",
  grid: "#e0e0e0",
  start: "#12467B",
  end: "#A51818",
  considered: "#c5dedf",
  path: "#4e7bb6",
};

export default function Canvas({ gridSize, isErasing, sideLength, grid, setGrid, setStartNode, setEndNode }) {
  const cellSize = sideLength / gridSize;
  const canvasRef = useRef(null);
  const [isDraggingStartNode, setIsDraggingStartNode] = useState(false);
  const [isDraggingEndNode, setIsDraggingEndNode] = useState(false);
  const [isMousePressed, setIsMousePressed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Get device pixel ratio
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size accounting for device pixel ratio
    canvas.width = sideLength * dpr;
    canvas.height = sideLength * dpr;

    // Scale canvas back down with CSS
    canvas.style.width = `${sideLength}px`;
    canvas.style.height = `${sideLength}px`;

    // Scale context to match device pixel ratio
    context.scale(dpr, dpr);

    const drawGrid = () => {
      context.clearRect(0, 0, sideLength, sideLength);
      context.strokeStyle = colors.grid;

      // Use crisp lines
      context.lineWidth = 1;
      context.imageSmoothingEnabled = false;

      grid.forEach((row) => {
        row.forEach((node) => {
          const x = Math.floor(node.col * cellSize);
          const y = Math.floor(node.row * cellSize);

          if (node.type !== "empty") {
            context.fillStyle = colors[node.type];
            context.fillRect(x, y, cellSize, cellSize);
          }
          context.strokeRect(x, y, cellSize, cellSize);
        });
      });
    };

    drawGrid();

    const handleGlobalMouseUp = (e) => {
      if (isDraggingStartNode || isDraggingEndNode) {
        // Ensure one final node update at mouse release position
        const rect = canvas.getBoundingClientRect();
        const row = Math.floor((e.clientY - rect.top) / cellSize);
        const col = Math.floor((e.clientX - rect.left) / cellSize);

        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          const node = grid[row][col];
          if (isDraggingStartNode && [NODE_TYPES.EMPTY, NODE_TYPES.CONSIDERED, NODE_TYPES.PATH].includes(node.type)) {
            setStartNode(new Node(row, col, "start"));
          } else if (
            isDraggingEndNode &&
            [NODE_TYPES.EMPTY, NODE_TYPES.CONSIDERED, NODE_TYPES.PATH].includes(node.type)
          ) {
            setEndNode(new Node(row, col, "end"));
          }
        }
      }

      // Clear all drag states
      setIsDraggingStartNode(false);
      setIsDraggingEndNode(false);
      setIsMousePressed(false);
    };

    const handleMouseLeave = () => {
      // Clear drag states when mouse leaves canvas
      if (!isDraggingStartNode && !isDraggingEndNode) {
        setIsMousePressed(false);
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      // Remove event listeners on cleanup
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [grid, cellSize, isDraggingStartNode, isDraggingEndNode, gridSize, sideLength]);

  function handleMouseDown(e) {
    if (grid.length === 0) return;

    setIsMousePressed(true);
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
      drawNode(row, col);
    }
  }

  function drawNode(row, col) {
    const node = grid[row][col];
    if (node && !isDraggingStartNode && !isDraggingEndNode) {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[row][col] = { ...node, type: isErasing ? "empty" : NODE_TYPES.OBSTACLE };
        return newGrid;
      });
    }
  }

  function handleMouseMove(e) {
    if (!isMousePressed || grid.length === 0) return;

    const rect = e.target.getBoundingClientRect();
    const row = Math.floor((e.clientY - rect.top) / cellSize);
    const col = Math.floor((e.clientX - rect.left) / cellSize);

    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return;

    const node = grid[row][col];

    if (isDraggingStartNode && [NODE_TYPES.EMPTY, NODE_TYPES.CONSIDERED, NODE_TYPES.PATH].includes(node.type)) {
      setStartNode(new Node(row, col, "start"));
    } else if (isDraggingEndNode && [NODE_TYPES.EMPTY, NODE_TYPES.CONSIDERED, NODE_TYPES.PATH].includes(node.type)) {
      setEndNode(new Node(row, col, "end"));
    } else if (!isDraggingStartNode && !isDraggingEndNode) {
      drawNode(row, col);
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        imageRendering: "pixelated", // Ensure sharp edges in modern browsers
      }}
    />
  );
}
