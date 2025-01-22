import { CROSS_PRODUCT_WEIGHT } from '../../constants/config';
import { NODE_TYPES } from '../../Node';

export function useDijkstra() {
  const getPathAlignmentScore = (node, startNode, endNode) => {
    const pathVector = {
      x: endNode.col - startNode.col,
      y: endNode.row - startNode.row
    };
    const nodeVector = {
      x: node.col - startNode.col,
      y: node.row - startNode.row
    };

    const crossProduct = Math.abs(pathVector.x * nodeVector.y - pathVector.y * nodeVector.x);
    const pathLength = Math.sqrt(pathVector.x * pathVector.x + pathVector.y * pathVector.y);
    const deviation = pathLength ? crossProduct / pathLength : 0;

    return deviation * CROSS_PRODUCT_WEIGHT;
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
        const alignmentPenalty = getPathAlignmentScore(neighbor, startNode, endNode);
        const newDistance = closestNode.distance + 1 + alignmentPenalty;
        if (newDistance < neighbor.distance) {
          neighbor.distance = newDistance;
          neighbor.previousNode = closestNode;
        }
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
