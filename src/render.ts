/**
 * Renders the game map as an SVG with tiles, dog, and paw prints
 */

import { GameMap, TileType } from './map';
import { Point } from './pathfinding';
import * as fs from 'fs';
import * as path from 'path';

const CELL_SIZE = 12;
const CAT_SIZE = CELL_SIZE * 2; // Cat sprite size (2x cell size for better visibility)
const ANIMATION_DURATION = 60; // seconds

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

    // Extract content inside g element with grass sprite
    const spriteMatch = svgContent.match(/<g[^>]*id="grassSprite"[^>]*>([\s\S]*?)<\/g>/);
    if (spriteMatch && spriteMatch[1]) {
      return `<symbol id="grassSprite" viewBox="0 0 24 24">${spriteMatch[1]}</symbol>`;
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

    // Extract content inside g element with grass with flowers sprite
    const spriteMatch = svgContent.match(/<g[^>]*id="grassWithFlowersSprite"[^>]*>([\s\S]*?)<\/g>/);
    if (spriteMatch && spriteMatch[1]) {
      return `<symbol id="grassWithFlowersSprite" viewBox="0 0 24 24">${spriteMatch[1]}</symbol>`;
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

function loadRockSprite(): string {
  try {
    const spritePath = path.join(__dirname, '../assets/rock-sprite.svg');
    const svgContent = fs.readFileSync(spritePath, 'utf8');

    // Extract content inside g element with rock sprite
    const spriteMatch = svgContent.match(/<g[^>]*id="rockSprite"[^>]*>([\s\S]*?)<\/g>/);
    if (spriteMatch && spriteMatch[1]) {
      return `<symbol id="rockSprite" viewBox="0 0 24 24">${spriteMatch[1]}</symbol>`;
    }
  } catch (error) {
    console.warn('Failed to load rock sprite, using fallback');
  }

  // Fallback rock sprite
  return `<symbol id="rockSprite" viewBox="0 0 24 24">
    <rect x="8" y="14" width="8" height="6" fill="#5A5A5A"/>
    <rect x="9" y="12" width="6" height="4" fill="#707070"/>
    <rect x="10" y="10" width="4" height="3" fill="#8A8A8A"/>
  </symbol>`;
}

function loadCatSprites(): string {
  const directions = ['right', 'left', 'up', 'down'];
  const frames = [1, 2];
  let sprites = '';

  for (const dir of directions) {
    for (const frame of frames) {
      try {
        const spritePath = path.join(__dirname, `../assets/cat-${dir}-${frame}.svg`);
        const svgContent = fs.readFileSync(spritePath, 'utf8');

        // Extract content between <svg> tags
        const svgMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
        if (svgMatch && svgMatch[1]) {
          const symbolId = `cat-${dir}-${frame}`;
          sprites += `<symbol id="${symbolId}" viewBox="0 0 24 24">${svgMatch[1]}</symbol>\n`;
        }
      } catch (error) {
        console.warn(`Failed to load cat-${dir}-${frame} sprite, using fallback`);

        // Try to fall back to old cat-{dir}.svg for frame 1
        if (frame === 1) {
          try {
            const oldPath = path.join(__dirname, `../assets/cat-${dir}.svg`);
            const oldContent = fs.readFileSync(oldPath, 'utf8');
            const match = oldContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
            if (match && match[1]) {
              sprites += `<symbol id="cat-${dir}-${frame}" viewBox="0 0 24 24">${match[1]}</symbol>\n`;
              continue;
            }
          } catch {}
        }

        // Ultimate fallback: minimal cat sprite
        sprites += `<symbol id="cat-${dir}-${frame}" viewBox="0 0 24 24">
          <rect x="10" y="12" width="4" height="6" fill="#1A1A1A"/>
          <rect x="11" y="18" width="1" height="2" fill="#1A1A1A"/>
          <rect x="12" y="18" width="1" height="2" fill="#1A1A1A"/>
        </symbol>\n`;
      }
    }
  }

  return sprites;
}

function getSpriteDefs(): string {
  const defaultTileTexture = loadDefaultTileTexture();
  const grassSprite = loadGrassSprite();
  const grassWithFlowersSprite = loadGrassWithFlowersSprite();
  const rockSprite = loadRockSprite();
  const catSprites = loadCatSprites();

  return `
    ${defaultTileTexture}
    ${grassSprite}
    ${grassWithFlowersSprite}
    ${rockSprite}
    ${catSprites}

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

      tiles += renderTile(tile.type, tileX, tileY, x, y);
    }
  }

  return tiles;
}

function renderTile(type: TileType, x: number, y: number, gridX: number, gridY: number): string {
  switch (type) {
    case TileType.EMPTY:
      // Empty tile - default texture with random rocks
      // Use deterministic random based on position
      const seed = gridX * 1000 + gridY;
      const random = Math.abs(Math.sin(seed) * 10000) % 100;

      // 10% chance to show a rock
      if (random < 5) {
        return `
          <rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="url(#defaultTileTexture)"/>
          <use href="#rockSprite" x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}"/>
        `;
      }
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

  // Only show paw print at the last position (current position of the cat)
  const lastPoint = path[path.length - 1];
  const x = lastPoint.x * CELL_SIZE;
  const y = lastPoint.y * CELL_SIZE;

  return `<use href="#paw" x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}"/>`;
}

function getDirection(from: Point, to: Point): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}

function renderDog(path: Point[], animate: boolean): string {
  // Offset to position the cat on the cell
  const offsetX = (CAT_SIZE - CELL_SIZE) / 2;
  const offsetY = (CAT_SIZE - CELL_SIZE) / 2 + 3; // Shift up so feet stay within cell

  if (path.length === 0) {
    // Default position at (0, 0)
    return `<use href="#cat-down-1" x="${-offsetX}" y="${-offsetY}" width="${CAT_SIZE}" height="${CAT_SIZE}"/>`;
  }

  if (!animate || path.length === 1) {
    // Static cat at the last position (always use frame 1)
    const lastPoint = path[path.length - 1];
    const x = lastPoint.x * CELL_SIZE - offsetX;
    const y = lastPoint.y * CELL_SIZE - offsetY;

    // Determine direction from second to last point
    let direction = 'down';
    if (path.length > 1) {
      direction = getDirection(path[path.length - 2], lastPoint);
    }

    return `<use href="#cat-${direction}-1" x="${x}" y="${y}" width="${CAT_SIZE}" height="${CAT_SIZE}"/>`;
  }

  // Single cat moving along the entire path with frame animation
  const firstPoint = path[0];

  // Build path string for animateMotion (centered on cells)
  let pathString = `M ${firstPoint.x * CELL_SIZE - offsetX} ${firstPoint.y * CELL_SIZE - offsetY}`;
  for (let i = 1; i < path.length; i++) {
    pathString += ` L ${path[i].x * CELL_SIZE - offsetX} ${path[i].y * CELL_SIZE - offsetY}`;
  }

  // Determine initial direction
  let initialDirection = 'down';
  if (path.length > 1) {
    initialDirection = getDirection(path[0], path[1]);
  }

  // Build combined direction + frame animation
  // Use segment-based approach: change direction at the START of each segment
  const frameInterval = 0.5; // seconds per frame

  const animValues: string[] = [];
  const animKeyTimes: string[] = [];

  // Process each segment
  for (let segmentIndex = 0; segmentIndex < path.length - 1; segmentIndex++) {
    const segmentStartTime = (segmentIndex / (path.length - 1)) * ANIMATION_DURATION;
    const segmentEndTime = ((segmentIndex + 1) / (path.length - 1)) * ANIMATION_DURATION;
    const segmentDuration = segmentEndTime - segmentStartTime;

    // Direction for this segment (from current point to next point)
    const direction = getDirection(path[segmentIndex], path[segmentIndex + 1]);

    // Calculate number of frames in this segment
    const framesInSegment = Math.max(1, Math.ceil(segmentDuration / frameInterval));

    // Add frames for this segment
    for (let frameIdx = 0; frameIdx < framesInSegment; frameIdx++) {
      const frame = (frameIdx % 2) + 1; // Alternate 1, 2
      const frameTime = segmentStartTime + (frameIdx * frameInterval);

      // Don't exceed segment end time
      if (frameTime >= segmentEndTime && segmentIndex < path.length - 2) {
        break;
      }

      const normalizedTime = Math.min(frameTime / ANIMATION_DURATION, 1.0);

      animValues.push(`#cat-${direction}-${frame}`);
      animKeyTimes.push(normalizedTime.toFixed(6));
    }
  }

  // Ensure we end at time 1.0
  if (parseFloat(animKeyTimes[animKeyTimes.length - 1]) < 1.0) {
    const lastSegmentIndex = path.length - 2;
    const lastDirection = getDirection(path[lastSegmentIndex], path[lastSegmentIndex + 1]);
    const lastFrame = (animValues.length % 2) + 1;
    animValues.push(`#cat-${lastDirection}-${lastFrame}`);
    animKeyTimes.push('1.0');
  }

  return `
    <use href="#cat-${initialDirection}-1" x="0" y="0" width="${CAT_SIZE}" height="${CAT_SIZE}">
      <animateMotion
        path="${pathString}"
        dur="${ANIMATION_DURATION}s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="href"
        values="${animValues.join(';')}"
        keyTimes="${animKeyTimes.join(';')}"
        dur="${ANIMATION_DURATION}s"
        repeatCount="indefinite"
        calcMode="discrete"
      />
    </use>
  `;
}