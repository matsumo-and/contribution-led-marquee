/**
 * Maps contribution data to tile types for the RPG map
 */

import { ContributionGrid, ContributionCell } from './parser';

export enum TileType {
  EMPTY = 'empty',                // Level 0 - no contributions
  GRASS = 'grass',                // Level 1-9 - has contributions
  GRASS_WITH_FLOWERS = 'flowers', // Level 10+ - many contributions
  TREASURE = 'treasure'           // Not used yet
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
  if (contributions === 0) return TileType.EMPTY;
  if (contributions >= 3) return TileType.GRASS_WITH_FLOWERS;
  return TileType.GRASS;
}