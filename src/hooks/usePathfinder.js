import { useState } from 'react';
import { NODE_TYPES } from '../Node';

export function usePathfinder(grid, startNode, endNode, setGrid) {
  const [isVisualizing, setIsVisualizing] = useState(false);

  const getUnvisitedNeighbors = (node, grid) => {
    const neighbors = [];
    const { row, col } = node;

    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

    return neighbors.filter(neighbor =>
      !neighbor.isVisited &&
      neighbor.type !== NODE_TYPES.OBSTACLE
    );
  };

  const animateVisitedNodes = async (visitedNodesInOrder, shortestPath) => {
    setIsVisualizing(true);

    // Animate visited nodes
    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length - 1) {
        setTimeout(() => {
          animateShortestPath(shortestPath);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        setGrid(prev => {
          const newGrid = [...prev];
          if (newGrid[node.row][node.col].type === NODE_TYPES.EMPTY) {
            newGrid[node.row][node.col] = {
              ...node,
              type: NODE_TYPES.CONSIDERED
            };
          }
          return newGrid;
        });
      }, 10 * i);
    }
  };

  const animateShortestPath = (nodesInShortestPath) => {
    for (let i = 0; i < nodesInShortestPath.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPath[i];
        setGrid(prev => {
          const newGrid = [...prev];
          if (![NODE_TYPES.START, NODE_TYPES.END].includes(newGrid[node.row][node.col].type)) {
            newGrid[node.row][node.col] = {
              ...node,
              type: NODE_TYPES.PATH
            };
          }
          return newGrid;
        });
        if (i === nodesInShortestPath.length - 1) setIsVisualizing(false);
      }, 50 * i);
    }
  };

  const visualizeDijkstra = () => {
    if (isVisualizing) return;

    const startGridNode = grid[startNode.row][startNode.col];
    const endGridNode = grid[endNode.row][endNode.col];

    // Reset all nodes
    setGrid(prev => {
      const newGrid = prev.map(row =>
        row.map(node => ({
          ...node,
          distance: Infinity,
          isVisited: false,
          previousNode: null,
          type: [NODE_TYPES.START, NODE_TYPES.END, NODE_TYPES.OBSTACLE].includes(node.type)
            ? node.type
            : NODE_TYPES.EMPTY
        }))
      );
      newGrid[startGridNode.row][startGridNode.col].distance = 0;
      return newGrid;
    });

    const visitedNodesInOrder = dijkstra(grid, startGridNode, endGridNode);
    const shortestPath = getNodesInShortestPath(endGridNode);
    animateVisitedNodes(visitedNodesInOrder, shortestPath);
  };

  const dijkstra = (grid, startNode, finishNode) => {
    const visitedNodesInOrder = [];
    const unvisitedNodes = getAllNodes(grid).filter(node =>
      node.type !== NODE_TYPES.OBSTACLE
    );

    // Reset nodes
    unvisitedNodes.forEach(node => {
      node.distance = Infinity;
      node.isVisited = false;
    });
    startNode.distance = 0;

    while (unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes);
      const closestNode = unvisitedNodes.shift();

      // If we're trapped, return
      if (closestNode.distance === Infinity) return visitedNodesInOrder;

      closestNode.isVisited = true;
      visitedNodesInOrder.push(closestNode);

      if (closestNode === finishNode) return visitedNodesInOrder;

      updateUnvisitedNeighbors(closestNode, grid);
    }
    return visitedNodesInOrder;
  };

  const sortNodesByDistance = (unvisitedNodes) => {
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
  };

  const updateUnvisitedNeighbors = (node, grid) => {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
      neighbor.distance = node.distance + 1;
      neighbor.previousNode = node;
    }
  };

  const getAllNodes = (grid) => {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  };

  const getNodesInShortestPath = (finishNode) => {
    const nodesInShortestPath = [];
    let currentNode = finishNode;
    while (currentNode !== null) {
      nodesInShortestPath.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return nodesInShortestPath;
  };

  return {
    visualizeDijkstra,
    isVisualizing
  };
}
