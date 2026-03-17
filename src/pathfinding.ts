/**
 * A* pathfinding algorithm for dog movement
 */

import { GameMap, TileType } from './map';

export interface Point {
  x: number;
  y: number;
}

interface Node {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic (estimated cost to goal)
  f: number; // Total cost (g + h)
  parent?: Node;
}

export function findPath(
  map: GameMap,
  start: Point,
  goal: Point
): Point[] {
  // Check if start and goal are valid
  if (!isValidPoint(start, map) || !isValidPoint(goal, map)) {
    return [];
  }

  const openList: Node[] = [];
  const closedList = new Set<string>();

  // Add start node
  openList.push({
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, goal),
    f: heuristic(start, goal)
  });

  while (openList.length > 0) {
    // Find node with lowest f cost
    let currentIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }

    const current = openList.splice(currentIndex, 1)[0];
    closedList.add(`${current.x},${current.y}`);

    // Check if we reached the goal
    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(current);
    }

    // Check neighbors
    const neighbors = getNeighbors(current, map);

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;

      if (closedList.has(key)) {
        continue;
      }

      const g = current.g + 1;
      const h = heuristic(neighbor, goal);
      const f = g + h;

      // Check if neighbor is already in open list
      const existingIndex = openList.findIndex(n => n.x === neighbor.x && n.y === neighbor.y);

      if (existingIndex === -1) {
        openList.push({
          x: neighbor.x,
          y: neighbor.y,
          g,
          h,
          f,
          parent: current
        });
      } else if (g < openList[existingIndex].g) {
        // Update existing node if new path is better
        openList[existingIndex].g = g;
        openList[existingIndex].f = f;
        openList[existingIndex].parent = current;
      }
    }
  }

  // No path found
  return [];
}

function isValidPoint(point: Point, map: GameMap): boolean {
  return point.x >= 0 && point.x < map.width && point.y >= 0 && point.y < map.height;
}

function heuristic(a: Point, b: Point): number {
  // Manhattan distance
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(node: Node, map: GameMap): Point[] {
  const neighbors: Point[] = [];
  const directions = [
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 },  // Right
    { x: 0, y: 1 },  // Down
    { x: -1, y: 0 }  // Left
  ];

  for (const dir of directions) {
    const x = node.x + dir.x;
    const y = node.y + dir.y;

    if (isValidPoint({ x, y }, map) && isWalkable(map.tiles[y][x].type)) {
      neighbors.push({ x, y });
    }
  }

  return neighbors;
}

function isWalkable(tileType: TileType): boolean {
  // All tiles are walkable in our game
  return true;
}

function reconstructPath(node: Node): Point[] {
  const path: Point[] = [];
  let current: Node | undefined = node;

  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }

  return path;
}

export function findNearestTreasure(map: GameMap, start: Point): Point | null {
  if (map.treasures.length === 0) {
    return null;
  }

  let nearestTreasure = map.treasures[0];
  let minDistance = heuristic(start, nearestTreasure);

  for (const treasure of map.treasures) {
    const distance = heuristic(start, treasure);
    if (distance < minDistance) {
      minDistance = distance;
      nearestTreasure = treasure;
    }
  }

  return nearestTreasure;
}