import { useState } from 'react';
import { NODE_TYPES } from '../Node';
import { useAStar } from './algorithms/useAStar';
import { useDijkstra } from './algorithms/useDijkstra';

export function usePathfinder(grid, startNode, endNode, setGrid, showSnackbar) {
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const { astar } = useAStar();
  const { dijkstra } = useDijkstra();

  const clearVisualization = (grid) => {
    return grid.map(row =>
      row.map(node => ({
        ...node,
        distance: Infinity,
        totalDistance: Infinity,
        isVisited: false,
        previousNode: null,
        type: [NODE_TYPES.START, NODE_TYPES.END, NODE_TYPES.OBSTACLE].includes(node.type)
          ? node.type
          : NODE_TYPES.EMPTY
      }))
    );
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

  const animateVisitedNodes = async (visitedNodesInOrder, shortestPath) => {
    setIsVisualizing(true);

    // If no nodes to animate, reset immediately
    if (!visitedNodesInOrder.length) {
      setIsVisualizing(false);
      return;
    }

    const timeout = 200 / grid.length ^ (1.5);

    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length - 1) {
        setTimeout(() => {
          if (shortestPath.length) {
            animateShortestPath(shortestPath);
          } else {
            setIsVisualizing(false); // Reset if no path to animate
          }
        }, timeout * i);
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
      }, timeout * i);
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

  const visualizeAlgorithm = () => {
    if (isVisualizing) return;

    setGrid(prev => {
      const clearedGrid = clearVisualization(prev);
      const currentStartNode = clearedGrid[startNode.row][startNode.col];
      const currentEndNode = clearedGrid[endNode.row][endNode.col];

      currentStartNode.distance = 0;

      const visitedNodesInOrder = algorithm === 'dijkstra'
        ? dijkstra(clearedGrid, currentStartNode, currentEndNode)
        : astar(clearedGrid, currentStartNode, currentEndNode);

      const shortestPath = getNodesInShortestPath(currentEndNode);

      if (!currentEndNode.previousNode) {
        animateVisitedNodes(visitedNodesInOrder, []);
        showSnackbar('No path found! Try removing some obstacles.', 'warning');
      } else {
        animateVisitedNodes(visitedNodesInOrder, shortestPath);
        // showSnackbar('Path found!', 'success');
      }

      return clearedGrid;
    });
  };

  return {
    visualizeAlgorithm,
    isVisualizing,
    setAlgorithm,
    algorithm
  };
}
