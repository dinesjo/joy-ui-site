import { useState, useEffect } from "react";
import { Node } from "../Node";

export function useGrid(gridSize) {
  // Initialize nodes first
  const [startNode, setStartNode] = useState(
    JSON.parse(localStorage.getItem("startNode")) || new Node(2, 2, "start")
  );
  const [endNode, setEndNode] = useState(
    JSON.parse(localStorage.getItem("endNode")) || new Node(7, 10, "end")
  );

  // Create initial grid generation function
  const createInitialGrid = (size, start, end, preserveObstacles = false, oldGrid = null) => {
    const newGrid = Array(size).fill().map((_, row) =>
      Array(size).fill().map((_, col) => {
        if (preserveObstacles && oldGrid && row < oldGrid.length && col < oldGrid[0].length) {
          const oldNode = oldGrid[row][col];
          return new Node(row, col, oldNode.type === 'obstacle' ? 'obstacle' : 'empty');
        }
        return new Node(row, col);
      })
    );

    // Set start/end nodes last to ensure they override any other types
    if (start.row < size && start.col < size) {
      newGrid[start.row][start.col] = new Node(start.row, start.col, "start");
    }
    if (end.row < size && end.col < size) {
      newGrid[end.row][end.col] = new Node(end.row, end.col, "end");
    }

    return newGrid;
  };

  // Initialize grid state using createInitialGrid directly without useEffect
  const [grid, setGrid] = useState(() =>
    createInitialGrid(gridSize, startNode, endNode)
  );

  function isValidPosition(node) {
    if (!node || !grid || grid.length === 0) return false;
    return (
      node.row >= 0 &&
      node.row < gridSize &&
      node.col >= 0 &&
      node.col < gridSize
    );
  }

  function updateNodesInGrid() {
    if (!grid || grid.length === 0) return;

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      // Reset existing start/end nodes
      newGrid.forEach((row) => {
        row.forEach((node) => {
          if (node.type === "start" || node.type === "end") {
            node.type = "empty";
          }
        });
      });

      try {
        // Set new start/end nodes with validation
        if (isValidPosition(startNode)) {
          newGrid[startNode.row][startNode.col].type = "start";
        }
        if (isValidPosition(endNode)) {
          newGrid[endNode.row][endNode.col].type = "end";
        }
      } catch (error) {
        console.error("Grid update error:", error);
        console.log("Grid state:", { grid: newGrid, startNode, endNode });
      }

      return newGrid;
    });
  }

  function saveNodesToStorage() {
    localStorage.setItem("startNode", JSON.stringify(startNode));
    localStorage.setItem("endNode", JSON.stringify(endNode));
  }

  function toggleNode(row, col, nodeType) {
    if (!isValidPosition({ row, col })) return;

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      const node = newGrid[row][col];
      node.type = node.type === nodeType ? "empty" : nodeType;
      return newGrid;
    });
  }

  function clearGrid() {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid.forEach((row) => {
        row.forEach((node) => {
          if (node.type !== "start" && node.type !== "end") {
            node.type = "empty";
          }
        });
      });
      return newGrid;
    });
  }

  function validateNodePosition(node, size) {
    if (node.row >= size || node.col >= size) {
      return new Node(
        Math.min(node.row, size - 1),
        Math.min(node.col, size - 1),
        node.type
      );
    }
    return node;
  }

  function resizeGrid(newSize) {
    const validatedStart = validateNodePosition(startNode, newSize);
    const validatedEnd = validateNodePosition(endNode, newSize);

    // Create new grid and preserve it in a variable first
    const newGrid = createInitialGrid(newSize, validatedStart, validatedEnd, true, grid);

    setStartNode(validatedStart);
    setEndNode(validatedEnd);
    setGrid(newGrid);
  }

  // Remove the grid initialization useEffect and keep only the node update effect
  useEffect(() => {
    if (grid && grid.length > 0) {
      updateNodesInGrid();
      saveNodesToStorage();
    }
  }, [startNode, endNode]);

  return {
    grid,
    setGrid,
    startNode,
    setStartNode,
    endNode,
    setEndNode,
    toggleNode,
    clearGrid,
    resizeGrid  // Export new resize function
  };
}