import { useEffect, useState, useRef } from "react";
import Node from "./Node";

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

const Canvas = (props) => {
  const {
    gridSize,
    grid,
    setGrid,
    theme,
    startNode,
    setStartNode,
    endNode,
    setEndNode,
  } = props;
  const canvasRef = useRef(null); // Reference to the canvas element
  const [isDraggingStartNode, setIsDraggingStartNode] = useState(false);
  const [isDraggingEndNode, setIsDraggingEndNode] = useState(false);

  // Initialize the grid
  useEffect(() => {
    const grid = [];
    for (let row = 0; row < gridSize; row++) {
      const currentRow = [];
      for (let col = 0; col < gridSize; col++) {
        currentRow.push(new Node(row, col));
      }
      grid.push(currentRow);
    }
    // Add the start and end nodes
    grid[startNode.row][startNode.col].type = "start";
    grid[endNode.row][endNode.col].type = "end";

    setGrid(grid);
  }, [gridSize]);

  // Draw the grid and obstacles
  useEffect(() => {
    // Get the canvas context
    const canvas = canvasRef.current;
    const context = canvasRef.current.getContext("2d");
    const cellSize = context.canvas.width / gridSize;

    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Set the grid color
    context.strokeStyle = colorMap[theme].grid;

    // Draw grid from the grid state
    grid.forEach((row) => {
      row.forEach((node) => {
        const x = node.col * cellSize;
        const y = node.row * cellSize;
        context.strokeRect(x, y, cellSize, cellSize);
        if (node.type === "obstacle") {
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

    // Draw obstacles
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      // Remove event listeners on cleanup
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [grid, theme]); // Re-render canvas upon changes

  const handleMouseDown = (e) => {
    const cellSize = canvasRef.current.width / gridSize;
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
        newGrid[row][col] = { ...node, type: props.isErasing ? "empty" : "obstacle" };
        return newGrid;
      });
    }
  };

  const handleMouseMove = (e) => {
    const cellSize = canvasRef.current.width / gridSize;
    const row = Math.floor(e.offsetY / cellSize);
    const col = Math.floor(e.offsetX / cellSize);
    const node = grid[row][col];
    if (isDraggingStartNode || isDraggingEndNode) {
      // Handle node dragging logic here
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        if (isDraggingStartNode) {
          // Prevent the start node from being dragged onto the end node
          if (row === endNode.row && col === endNode.col) {
            return newGrid;
          }
          newGrid[startNode.row][startNode.col] = {
            ...startNode,
            type: "empty",
          };
          newGrid[row][col] = { ...node, type: "start" };
          setStartNode(new Node(row, col, "start"));
        } else if (isDraggingEndNode) {
          // Prevent the end node from being dragged onto the start node
          if (row === startNode.row && col === startNode.col) {
            return newGrid;
          }
          newGrid[endNode.row][endNode.col] = { ...endNode, type: "empty" };
          newGrid[row][col] = { ...node, type: "end" };
          setEndNode(new Node(row, col, "end"));
        }
        return newGrid;
      });
    } else if (e.buttons === 1) {
      handleMouseDown(e);
    }
  };

  const handleMouseUp = () => {
    // Handle the end of node dragging here
    if (isDraggingStartNode) {
      setIsDraggingStartNode(false);
      // Additional logic for handling the end of start node dragging
    } else if (isDraggingEndNode) {
      setIsDraggingEndNode(false);
      // Additional logic for handling the end of end node dragging
    }
  };

  return <canvas ref={canvasRef} width={props.width} height={props.height} />;
};

export default Canvas;
