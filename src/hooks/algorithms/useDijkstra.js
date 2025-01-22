import { NODE_TYPES } from '../../Node';

export function useDijkstra() {
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

  const dijkstra = (grid, startNode, endNode) => {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(grid).filter(node => 
      node.type !== NODE_TYPES.OBSTACLE
    );
    
    while (unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes);
      const closestNode = unvisitedNodes.shift();
      
      if (closestNode.distance === Infinity) return visitedNodesInOrder;
      
      closestNode.isVisited = true;
      visitedNodesInOrder.push(closestNode);
      
      if (closestNode === endNode) return visitedNodesInOrder;
      
      const unvisitedNeighbors = getUnvisitedNeighbors(closestNode, grid);
      for (const neighbor of unvisitedNeighbors) {
        neighbor.distance = closestNode.distance + 1;
        neighbor.previousNode = closestNode;
      }
    }
    return visitedNodesInOrder;
  };

  const sortNodesByDistance = (unvisitedNodes) => {
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
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

  return { dijkstra };
}
