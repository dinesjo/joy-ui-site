import { NODE_TYPES } from '../../Node';

export function useAStar() {
  const getManhattanDistance = (nodeA, nodeB) => {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  };

  const getPathAlignmentScore = (node, startNode, endNode) => {
    // Calculate vectors
    const pathVector = {
      x: endNode.col - startNode.col,
      y: endNode.row - startNode.row
    };
    const nodeVector = {
      x: node.col - startNode.col,
      y: node.row - startNode.row
    };

    // Calculate cross product to get deviation from path
    const crossProduct = Math.abs(pathVector.x * nodeVector.y - pathVector.y * nodeVector.x);
    const pathLength = Math.sqrt(pathVector.x * pathVector.x + pathVector.y * pathVector.y);

    // Normalize by path length to get perpendicular distance to path
    const deviation = pathLength ? crossProduct / pathLength : 0;

    // Return a score that increases with deviation
    return deviation * 0.5; // Adjust weight as needed
  };

  const getTotalHeuristic = (node, startNode, endNode) => {
    const distance = getManhattanDistance(node, endNode);
    const pathAlignment = getPathAlignmentScore(node, startNode, endNode);
    return distance + pathAlignment;
  };

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

  const astar = (grid, startNode, endNode) => {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    startNode.totalDistance = getTotalHeuristic(startNode, startNode, endNode);
    const unvisitedNodes = getAllNodes(grid).filter(node =>
      node.type !== NODE_TYPES.OBSTACLE
    );

    while (unvisitedNodes.length) {
      sortByTotalDistance(unvisitedNodes);
      const closestNode = unvisitedNodes.shift();

      if (closestNode.distance === Infinity) return visitedNodesInOrder;

      closestNode.isVisited = true;
      visitedNodesInOrder.push(closestNode);

      if (closestNode === endNode) return visitedNodesInOrder;

      const unvisitedNeighbors = getUnvisitedNeighbors(closestNode, grid);
      for (const neighbor of unvisitedNeighbors) {
        const tentativeDistance = closestNode.distance + getManhattanDistance(closestNode, neighbor);
        if (tentativeDistance < neighbor.distance) {
          neighbor.distance = tentativeDistance;
          neighbor.totalDistance = tentativeDistance + getTotalHeuristic(neighbor, startNode, endNode);
          neighbor.previousNode = closestNode;
        }
      }
    }
    return visitedNodesInOrder;
  };

  const sortByTotalDistance = (unvisitedNodes) => {
    unvisitedNodes.sort((a, b) =>
      (a.totalDistance || Infinity) - (b.totalDistance || Infinity)
    );
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

  return { astar };
}
