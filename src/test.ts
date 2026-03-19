/**
 * Test script to generate a sample SVG locally
 */

import { parseContributions } from './parser';
import { createGameMap } from './map';
import { findPath, findNearestTreasure } from './pathfinding';
import { renderSVG } from './render';
import { createDefaultPath } from './index';
import * as fs from 'fs/promises';

// Sample contribution HTML (simulated data)
const sampleHTML = `
<svg>
  <g>
    <rect x="0" y="0" data-date="2024-01-01" data-count="0"/>
    <rect x="15" y="0" data-date="2024-01-02" data-count="1"/>
    <rect x="30" y="0" data-date="2024-01-03" data-count="2"/>
    <rect x="45" y="0" data-date="2024-01-04" data-count="0"/>
    <rect x="60" y="0" data-date="2024-01-05" data-count="3"/>
    <rect x="75" y="0" data-date="2024-01-06" data-count="4"/>
    <rect x="90" y="0" data-date="2024-01-07" data-count="1"/>

    <rect x="0" y="15" data-date="2024-01-08" data-count="2"/>
    <rect x="15" y="15" data-date="2024-01-09" data-count="0"/>
    <rect x="30" y="15" data-date="2024-01-10" data-count="1"/>
    <rect x="45" y="15" data-date="2024-01-11" data-count="5"/>
    <rect x="60" y="15" data-date="2024-01-12" data-count="0"/>
    <rect x="75" y="15" data-date="2024-01-13" data-count="2"/>
    <rect x="90" y="15" data-date="2024-01-14" data-count="0"/>

    <rect x="0" y="30" data-date="2024-01-15" data-count="0"/>
    <rect x="15" y="30" data-date="2024-01-16" data-count="3"/>
    <rect x="30" y="30" data-date="2024-01-17" data-count="0"/>
    <rect x="45" y="30" data-date="2024-01-18" data-count="1"/>
    <rect x="60" y="30" data-date="2024-01-19" data-count="0"/>
    <rect x="75" y="30" data-date="2024-01-20" data-count="4"/>
    <rect x="90" y="30" data-date="2024-01-21" data-count="2"/>

    <rect x="0" y="45" data-date="2024-01-22" data-count="1"/>
    <rect x="15" y="45" data-date="2024-01-23" data-count="0"/>
    <rect x="30" y="45" data-date="2024-01-24" data-count="2"/>
    <rect x="45" y="45" data-date="2024-01-25" data-count="0"/>
    <rect x="60" y="45" data-date="2024-01-26" data-count="1"/>
    <rect x="75" y="45" data-date="2024-01-27" data-count="0"/>
    <rect x="90" y="45" data-date="2024-01-28" data-count="5"/>
  </g>
</svg>
`;

async function generateTestSVG() {
  console.log('Generating test SVG...');

  // Parse the sample HTML
  const contributionGrid = parseContributions(sampleHTML);
  console.log(`Grid size: ${contributionGrid.width}x${contributionGrid.height}`);

  // Create game map
  const gameMap = createGameMap(contributionGrid);
  console.log(`Found ${gameMap.treasures.length} treasure tiles`);

  // Determine dog's path - use default zigzag path
  const dogPath = createDefaultPath(gameMap);

  console.log(`Path length: ${dogPath.length}`);
  console.log(`Path points: ${dogPath.map(p => `(${p.x},${p.y})`).join(' -> ')}`);

  // Render SVG with animation
  const svg = renderSVG(gameMap, {
    path: dogPath,
    currentPosition: dogPath.length - 1,
    animate: true
  });

  // Ensure dist directory exists
  await fs.mkdir('dist', { recursive: true });

  // Write SVG file
  await fs.writeFile('dist/dog-rpg-test.svg', svg, 'utf8');
  console.log('Test SVG generated at dist/dog-rpg-test.svg');

  // Also generate a static version
  const svgStatic = renderSVG(gameMap, {
    path: dogPath,
    currentPosition: dogPath.length - 1,
    animate: false
  });

  await fs.writeFile('dist/dog-rpg-test-static.svg', svgStatic, 'utf8');
  console.log('Static SVG generated at dist/dog-rpg-test-static.svg');
}

// Run the test
if (require.main === module) {
  generateTestSVG().catch(console.error);
}