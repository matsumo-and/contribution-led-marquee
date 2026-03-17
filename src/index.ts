/**
 * Main entry point for the Dog RPG GitHub Action
 */

import * as core from '@actions/core';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fetchContributions } from './fetch';
import { parseContributions } from './parser';
import { createGameMap } from './map';
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

function createDefaultPath(map: { width: number; height: number }): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  const y = Math.floor(map.height / 2);

  // Walk from left to right
  for (let x = 0; x < map.width; x++) {
    path.push({ x, y });
  }

  return path;
}

// Run the action
if (require.main === module) {
  run();
}

export { run };