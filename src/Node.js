/**
 * Node class that represents a node in the grid
 * @param {number} row - The row of the node
 * @param {number} col - The column of the node
 * @param {string} type - The type of the node
 */
export default class Node {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.type = "empty";
  }
}