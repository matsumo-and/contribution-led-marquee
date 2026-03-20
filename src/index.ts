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

  // Start from top-left
  const start = { x: 0, y: 0 };
  const goal = { x: gameMap.width - 1, y: gameMap.height - 1 };

  // Skip if start or goal has a rock
  if (gameMap.tiles[start.y][start.x].hasRock) {
    // Find first walkable tile
    for (let y = 0; y < gameMap.height; y++) {
      for (let x = 0; x < gameMap.width; x++) {
        if (!gameMap.tiles[y][x].hasRock) {
          start.x = x;
          start.y = y;
          break;
        }
      }
      if (!gameMap.tiles[start.y][start.x].hasRock) break;
    }
  }

  let current = { ...start };
  path.push(current);

  // Track visited tiles
  const visited = new Set<string>();
  visited.add(`${current.x},${current.y}`);

  // Deterministic random seed
  let seed = 12345;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const maxSteps = gameMap.width * gameMap.height * 3; // Prevent infinite loop
  let steps = 0;

  // Random walk with bias towards goal
  while ((current.x !== goal.x || current.y !== goal.y) && steps < maxSteps) {
    steps++;

    // Get possible moves
    const directions = [
      { x: 0, y: -1, name: 'up' },    // Up
      { x: 1, y: 0, name: 'right' },  // Right
      { x: 0, y: 1, name: 'down' },   // Down
      { x: -1, y: 0, name: 'left' }   // Left
    ];

    // Calculate weights based on distance to goal
    const weights = directions.map(dir => {
      const nextX = current.x + dir.x;
      const nextY = current.y + dir.y;

      // Out of bounds
      if (nextX < 0 || nextX >= gameMap.width || nextY < 0 || nextY >= gameMap.height) {
        return 0;
      }

      // Has rock
      if (gameMap.tiles[nextY][nextX].hasRock) {
        return 0;
      }

      // Already visited - avoid unless necessary
      const isVisited = visited.has(`${nextX},${nextY}`);

      // Calculate distance to goal (Manhattan)
      const distToGoal = Math.abs(goal.x - nextX) + Math.abs(goal.y - nextY);
      const currentDistToGoal = Math.abs(goal.x - current.x) + Math.abs(goal.y - current.y);

      let weight = 0;

      // Prefer moves that get closer to goal
      if (distToGoal < currentDistToGoal) {
        weight = 1.25; // High weight for moves towards goal
      } else if (distToGoal === currentDistToGoal) {
        weight = 1; // Medium weight for moves that maintain distance
      } else {
        weight = 0.75; // Low weight for moves away from goal
      }

      // Penalize visited tiles heavily
      if (isVisited) {
        weight *= 0.1; // 90% penalty for already visited
      }

      return weight;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0 as number);

    // No valid moves - try to use A* to find path to goal
    if (totalWeight === 0) {
      const pathToGoal = findPath(gameMap, current, goal);
      if (pathToGoal.length > 1) {
        // Add to path and mark as visited
        for (let i = 1; i < pathToGoal.length; i++) {
          const p = pathToGoal[i];
          path.push(p);
          visited.add(`${p.x},${p.y}`);
        }
        break;
      } else {
        // Stuck
        break;
      }
    }

    // Pick random direction based on weights
    let r = random() * totalWeight;
    let selectedDir = directions[0];

    for (let i = 0; i < directions.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        selectedDir = directions[i];
        break;
      }
    }

    current = {
      x: current.x + selectedDir.x,
      y: current.y + selectedDir.y
    };

    path.push({ ...current });
    visited.add(`${current.x},${current.y}`);
  }

  // If we didn't reach the goal, try using A* for final segment
  if (current.x !== goal.x || current.y !== goal.y) {
    const finalPath = findPath(gameMap, current, goal);
    if (finalPath.length > 1) {
      path.push(...finalPath.slice(1));
    }
  }

  return path;
}

// Run the action
if (require.main === module) {
  run();
}

export { run };