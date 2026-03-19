/**
 * Main entry point for the Dog RPG GitHub Action
 */

import * as core from '@actions/core';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fetchContributions } from './fetch';
import { parseContributions } from './parser';
import { createGameMap, GameMap, TileType } from './map';
import { findPath, findNearestTreasure } from './pathfinding';
import { renderSVG } from './render';

async function run(): Promise<void> {
  try {
    // Get inputs
    const githubUserName = core.getInput('github_user_name', { required: true });
    const outputPath = core.getInput('output_path') || 'dist/dog-rpg.svg';
    const animate = core.getBooleanInput('animate') || true;

    console.log(`Fetching contribution data for ${githubUserName}...`);

    // Fetch contribution data
    const html = await fetchContributions(githubUserName);

    console.log('Parsing contribution data...');

    // Parse the HTML
    const contributionGrid = parseContributions(html);

    console.log(`Grid size: ${contributionGrid.width}x${contributionGrid.height}`);

    // Create game map
    const gameMap = createGameMap(contributionGrid);

    console.log(`Found ${gameMap.treasures.length} treasure tiles`);

    // Determine dog's path
    let dogPath: { x: number; y: number }[] = [];

    // Start position (leftmost column, middle row)
    const startX = 0;
    const startY = Math.floor(gameMap.height / 2);
    const start = { x: startX, y: startY };

    if (gameMap.treasures.length > 0) {
      // Find nearest treasure
      const nearestTreasure = findNearestTreasure(gameMap, start);

      if (nearestTreasure) {
        console.log(`Finding path from (${start.x}, ${start.y}) to treasure at (${nearestTreasure.x}, ${nearestTreasure.y})`);
        dogPath = findPath(gameMap, start, nearestTreasure);
      }
    }

    // If no path to treasure or no treasures, create a simple path across the map
    if (dogPath.length === 0) {
      console.log('No treasures found or path blocked, creating default path');
      dogPath = createDefaultPath(gameMap);
    }

    console.log(`Path length: ${dogPath.length}`);

    // Render SVG
    const svg = renderSVG(gameMap, {
      path: dogPath,
      currentPosition: dogPath.length - 1,
      animate
    });

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Write SVG file
    await fs.writeFile(outputPath, svg, 'utf8');

    console.log(`SVG generated successfully at ${outputPath}`);

    // Set output
    core.setOutput('svg_path', outputPath);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    core.setFailed(errorMessage);
  }
}

export function createDefaultPath(gameMap: GameMap): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];

  // Zigzag pattern to cover all tiles
  for (let y = 0; y < gameMap.height; y++) {
    const leftToRight = y % 2 === 0;
    const startX = leftToRight ? 0 : gameMap.width - 1;
    const endX = leftToRight ? gameMap.width : -1;
    const step = leftToRight ? 1 : -1;

    for (let x = startX; x !== endX; x += step) {
      const tile = gameMap.tiles[y][x];
      const targetPoint = { x, y };

      if (tile.hasRock) {
        // Rock - skip it, A* will route around when needed
        continue;
      }

      // Walkable tile
      if (path.length === 0) {
        // First tile
        path.push(targetPoint);
      } else {
        const lastPoint = path[path.length - 1];

        // Check if adjacent (only up/down/left/right, no diagonal)
        const dx = Math.abs(lastPoint.x - x);
        const dy = Math.abs(lastPoint.y - y);

        if (dx + dy === 1) {
          // Adjacent, just add it
          path.push(targetPoint);
        } else {
          // Not adjacent, use A* to find path around obstacles
          const connectingPath = findPath(gameMap, lastPoint, targetPoint);
          if (connectingPath.length > 1) {
            // Add connecting path (excluding first point as it's already in path)
            path.push(...connectingPath.slice(1));
          } else {
            // No path found, just add the point anyway
            path.push(targetPoint);
          }
        }
      }
    }
  }

  return path;
}

// Run the action
if (require.main === module) {
  run();
}

export { run };