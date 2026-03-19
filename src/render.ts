/**
 * Renders the game map as an SVG with tiles, dog, and paw prints
 */

import { GameMap, TileType } from './map';
import { Point } from './pathfinding';
import * as fs from 'fs';
import * as path from 'path';

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

function loadDefaultTileTexture(): string {
  try {
    const texturePath = path.join(__dirname, '../assets/default-tile-texture.svg');
    const svgContent = fs.readFileSync(texturePath, 'utf8');

    // Extract the pattern definition from the SVG
    const patternMatch = svgContent.match(/<pattern[^>]*>[\s\S]*?<\/pattern>/);
    if (patternMatch) {
      return patternMatch[0];
    }
  } catch (error) {
    console.warn('Failed to load tile texture, using fallback');
  }

  // Fallback pattern
  return `<pattern id="defaultTileTexture" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <rect width="20" height="20" fill="#9DC88D"/>
  </pattern>`;
}

function loadGrassSprite(): string {
  try {
    const spritePath = path.join(__dirname, '../assets/grass-sprite.svg');
    const svgContent = fs.readFileSync(spritePath, 'utf8');

    // Extract the g element with grass sprite
    const spriteMatch = svgContent.match(/<g[^>]*id="grassSprite"[^>]*>[\s\S]*?<\/g>/);
    if (spriteMatch) {
      return `<symbol id="grassSprite" viewBox="0 0 24 24">${spriteMatch[0]}</symbol>`;
    }
  } catch (error) {
    console.warn('Failed to load grass sprite, using fallback');
  }

  // Fallback grass sprite
  return `<symbol id="grassSprite" viewBox="0 0 24 24">
    <rect width="24" height="24" fill="#9DC88D"/>
    <rect x="6" y="8" width="2" height="10" fill="#7CB46C" opacity="0.9"/>
    <rect x="12" y="8" width="2" height="10" fill="#68A858" opacity="0.9"/>
    <rect x="18" y="10" width="2" height="8" fill="#7CB46C" opacity="0.8"/>
  </symbol>`;
}

function loadGrassWithFlowersSprite(): string {
  try {
    const spritePath = path.join(__dirname, '../assets/grass-with-flowers-sprite.svg');
    const svgContent = fs.readFileSync(spritePath, 'utf8');

    // Extract the g element with grass with flowers sprite
    const spriteMatch = svgContent.match(/<g[^>]*id="grassWithFlowersSprite"[^>]*>[\s\S]*?<\/g>/);
    if (spriteMatch) {
      return `<symbol id="grassWithFlowersSprite" viewBox="0 0 24 24">${spriteMatch[0]}</symbol>`;
    }
  } catch (error) {
    console.warn('Failed to load grass with flowers sprite, using fallback');
  }

  // Fallback grass with flowers sprite
  return `<symbol id="grassWithFlowersSprite" viewBox="0 0 24 24">
    <rect width="24" height="24" fill="#9DC88D"/>
    <rect x="6" y="8" width="2" height="10" fill="#7CB46C" opacity="0.9"/>
    <rect x="12" y="8" width="2" height="10" fill="#68A858" opacity="0.9"/>
    <rect x="10" y="6" width="2" height="2" fill="#FF88CC"/>
  </symbol>`;
}

function getSpriteDefs(): string {
  const defaultTileTexture = loadDefaultTileTexture();
  const grassSprite = loadGrassSprite();
  const grassWithFlowersSprite = loadGrassWithFlowersSprite();

  return `
    ${defaultTileTexture}
    ${grassSprite}
    ${grassWithFlowersSprite}

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
    case TileType.EMPTY:
      // Empty tile - default texture
      return `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="url(#defaultTileTexture)"/>`;

    case TileType.GRASS:
      // Grass sprite on default texture background
      return `
        <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="url(#defaultTileTexture)"/>
        <use href="#grassSprite" x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}"/>
      `;

    case TileType.GRASS_WITH_FLOWERS:
      // Grass with flowers sprite on default texture background
      return `
        <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="url(#defaultTileTexture)"/>
        <use href="#grassWithFlowersSprite" x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}"/>
      `;

    case TileType.TREASURE:
      return `
        <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="#9DC88D"/>
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