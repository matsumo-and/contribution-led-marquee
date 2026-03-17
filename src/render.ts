/**
 * Renders the game map as an SVG with tiles, dog, and paw prints
 */

import { GameMap, TileType } from './map';
import { Point } from './pathfinding';

const CELL_SIZE = 12;
const ANIMATION_DURATION = 10; // seconds

export interface RenderOptions {
  path: Point[];
  currentPosition: number; // Index in path array
  animate: boolean;
}

export function renderSVG(map: GameMap, options: RenderOptions): string {
  const width = map.width * CELL_SIZE;
  const height = map.height * CELL_SIZE;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${getSpriteDefs()}
  </defs>

  <!-- Background tiles -->
  ${renderTiles(map)}

  <!-- Paw prints -->
  ${renderPawPrints(options.path, options.currentPosition)}

  <!-- Dog -->
  ${renderDog(options.path, options.animate)}
</svg>`;

  return svg;
}

function getSpriteDefs(): string {
  return `
    <!-- Dog sprite -->
    <symbol id="dog" viewBox="0 0 24 24">
      <!-- Body -->
      <rect x="6" y="10" width="12" height="8" fill="#8B4513"/>
      <!-- Head -->
      <rect x="3" y="8" width="8" height="8" fill="#8B4513"/>
      <!-- Ears -->
      <rect x="3" y="6" width="3" height="3" fill="#654321"/>
      <rect x="8" y="6" width="3" height="3" fill="#654321"/>
      <!-- Tail -->
      <rect x="16" y="8" width="4" height="3" fill="#654321"/>
      <!-- Legs -->
      <rect x="6" y="16" width="2" height="4" fill="#654321"/>
      <rect x="10" y="16" width="2" height="4" fill="#654321"/>
      <rect x="14" y="16" width="2" height="4" fill="#654321"/>
      <rect x="16" y="16" width="2" height="4" fill="#654321"/>
      <!-- Eyes -->
      <rect x="4" y="10" width="1" height="1" fill="#000"/>
      <rect x="6" y="10" width="1" height="1" fill="#000"/>
      <!-- Nose -->
      <rect x="5" y="12" width="1" height="1" fill="#000"/>
    </symbol>

    <!-- Paw print -->
    <symbol id="paw" viewBox="0 0 12 12">
      <rect x="5" y="6" width="2" height="3" fill="#654321" opacity="0.5"/>
      <rect x="3" y="3" width="2" height="2" fill="#654321" opacity="0.5"/>
      <rect x="7" y="3" width="2" height="2" fill="#654321" opacity="0.5"/>
      <rect x="2" y="5" width="2" height="2" fill="#654321" opacity="0.5"/>
      <rect x="8" y="5" width="2" height="2" fill="#654321" opacity="0.5"/>
    </symbol>
  `;
}

function renderTiles(map: GameMap): string {
  let tiles = '';

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = map.tiles[y][x];
      const tileX = x * CELL_SIZE;
      const tileY = y * CELL_SIZE;

      tiles += renderTile(tile.type, tileX, tileY);
    }
  }

  return tiles;
}

function renderTile(type: TileType, x: number, y: number): string {
  switch (type) {
    case TileType.GRASS:
      return `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="#90EE90"/>`;

    case TileType.FLOWER:
      return `
        <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="#90EE90"/>
        <rect x="${x + 4}" y="${y + 4}" width="4" height="4" fill="#FFB6C1"/>
        <rect x="${x + 5}" y="${y + 3}" width="2" height="2" fill="#FF69B4"/>
        <rect x="${x + 5}" y="${y + 7}" width="2" height="2" fill="#FF69B4"/>
        <rect x="${x + 3}" y="${y + 5}" width="2" height="2" fill="#FF69B4"/>
        <rect x="${x + 7}" y="${y + 5}" width="2" height="2" fill="#FF69B4"/>
      `;

    case TileType.ROCK:
      return `
        <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="#90EE90"/>
        <rect x="${x + 2}" y="${y + 3}" width="8" height="6" fill="#808080"/>
        <rect x="${x + 3}" y="${y + 4}" width="2" height="2" fill="#696969"/>
        <rect x="${x + 6}" y="${y + 5}" width="2" height="2" fill="#696969"/>
      `;

    case TileType.TREE:
      return `
        <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="#90EE90"/>
        <rect x="${x + 5}" y="${y + 6}" width="2" height="5" fill="#8B4513"/>
        <rect x="${x + 2}" y="${y + 2}" width="8" height="6" fill="#228B22"/>
        <rect x="${x + 3}" y="${y + 1}" width="6" height="2" fill="#228B22"/>
        <rect x="${x + 4}" y="${y}" width="4" height="1" fill="#228B22"/>
      `;

    case TileType.TREASURE:
      return `
        <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="#90EE90"/>
        <rect x="${x + 2}" y="${y + 2}" width="8" height="8" fill="#FFD700"/>
        <rect x="${x + 3}" y="${y + 3}" width="6" height="6" fill="#FFA500"/>
        <rect x="${x + 5}" y="${y + 5}" width="2" height="2" fill="#B8860B"/>
      `;
  }
}

function renderPawPrints(path: Point[], currentPosition: number): string {
  if (path.length === 0) return '';

  let pawPrints = '';
  const endIndex = currentPosition >= 0 ? Math.min(currentPosition, path.length - 1) : path.length - 1;

  for (let i = 0; i < endIndex; i++) {
    const point = path[i];
    const x = point.x * CELL_SIZE;
    const y = point.y * CELL_SIZE;

    pawPrints += `<use href="#paw" x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}"/>`;
  }

  return pawPrints;
}

function renderDog(path: Point[], animate: boolean): string {
  if (path.length === 0) {
    // Default position at (0, 0)
    return `<use href="#dog" x="0" y="0" width="${CELL_SIZE}" height="${CELL_SIZE}"/>`;
  }

  if (!animate) {
    // Static dog at the last position
    const lastPoint = path[path.length - 1];
    const x = lastPoint.x * CELL_SIZE;
    const y = lastPoint.y * CELL_SIZE;
    return `<use href="#dog" x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}"/>`;
  }

  // Animated dog
  let pathData = 'M';
  let keyTimes: number[] = [];

  for (let i = 0; i < path.length; i++) {
    const point = path[i];
    const x = point.x * CELL_SIZE + CELL_SIZE / 2;
    const y = point.y * CELL_SIZE + CELL_SIZE / 2;

    if (i === 0) {
      pathData += `${x},${y}`;
    } else {
      pathData += ` L${x},${y}`;
    }

    keyTimes.push(i / (path.length - 1));
  }

  return `
    <g>
      <use href="#dog" width="${CELL_SIZE}" height="${CELL_SIZE}">
        <animateMotion
          dur="${ANIMATION_DURATION}s"
          repeatCount="indefinite"
          path="${pathData}"
          rotate="0"
          keyTimes="${keyTimes.join(';')}"
          keyPoints="${keyTimes.join(';')}"
        />
      </use>
    </g>
  `;
}