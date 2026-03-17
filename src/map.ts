/**
 * Maps contribution data to tile types for the RPG map
 */

import { ContributionGrid, ContributionCell } from './parser';

export enum TileType {
  GRASS = 'grass',
  FLOWER = 'flower',
  ROCK = 'rock',
  TREE = 'tree',
  TREASURE = 'treasure'
}

export interface Tile {
  type: TileType;
  x: number;
  y: number;
  contributions: number;
}

export interface GameMap {
  tiles: Tile[][];
  width: number;
  height: number;
  treasures: { x: number; y: number }[];
}

export function createGameMap(grid: ContributionGrid): GameMap {
  const tiles: Tile[][] = [];
  const treasures: { x: number; y: number }[] = [];

  for (let y = 0; y < grid.height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < grid.width; x++) {
      const cell = grid.cells[y][x];
      const contributions = cell ? cell.count : 0;
      const type = getTileType(contributions);

      const tile: Tile = {
        type,
        x,
        y,
        contributions
      };

      row.push(tile);

      if (type === TileType.TREASURE) {
        treasures.push({ x, y });
      }
    }
    tiles.push(row);
  }

  return {
    tiles,
    width: grid.width,
    height: grid.height,
    treasures
  };
}

function getTileType(contributions: number): TileType {
  if (contributions === 0) return TileType.GRASS;
  if (contributions === 1) return TileType.FLOWER;
  if (contributions === 2) return TileType.ROCK;
  if (contributions === 3) return TileType.TREE;
  return TileType.TREASURE;
}