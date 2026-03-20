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

  // Create a simple test grid manually (7x4 grid)
  const testGrid = {
    width: 7,
    height: 4,
    cells: [
      [
        { date: '2024-01-01', count: 0, x: 0, y: 0 },
        { date: '2024-01-08', count: 1, x: 1, y: 0 },
        { date: '2024-01-15', count: 2, x: 2, y: 0 },
        { date: '2024-01-22', count: 0, x: 3, y: 0 },
        { date: '2024-01-29', count: 3, x: 4, y: 0 },
        { date: '2024-02-05', count: 4, x: 5, y: 0 },
        { date: '2024-02-12', count: 1, x: 6, y: 0 }
      ],
      [
        { date: '2024-01-02', count: 2, x: 0, y: 1 },
        { date: '2024-01-09', count: 0, x: 1, y: 1 },
        { date: '2024-01-16', count: 1, x: 2, y: 1 },
        { date: '2024-01-23', count: 5, x: 3, y: 1 },
        { date: '2024-01-30', count: 0, x: 4, y: 1 },
        { date: '2024-02-06', count: 2, x: 5, y: 1 },
        { date: '2024-02-13', count: 0, x: 6, y: 1 }
      ],
      [
        { date: '2024-01-03', count: 0, x: 0, y: 2 },
        { date: '2024-01-10', count: 3, x: 1, y: 2 },
        { date: '2024-01-17', count: 0, x: 2, y: 2 },
        { date: '2024-01-24', count: 1, x: 3, y: 2 },
        { date: '2024-01-31', count: 0, x: 4, y: 2 },
        { date: '2024-02-07', count: 4, x: 5, y: 2 },
        { date: '2024-02-14', count: 2, x: 6, y: 2 }
      ],
      [
        { date: '2024-01-04', count: 1, x: 0, y: 3 },
        { date: '2024-01-11', count: 0, x: 1, y: 3 },
        { date: '2024-01-18', count: 2, x: 2, y: 3 },
        { date: '2024-01-25', count: 0, x: 3, y: 3 },
        { date: '2024-02-01', count: 1, x: 4, y: 3 },
        { date: '2024-02-08', count: 0, x: 5, y: 3 },
        { date: '2024-02-15', count: 5, x: 6, y: 3 }
      ]
    ]
  };

  console.log(`Grid size: ${testGrid.width}x${testGrid.height}`);

  // Create game map
  const gameMap = createGameMap(testGrid);
  console.log(`Found ${gameMap.treasures.length} treasure tiles`);

  // Determine dog's path - use default random walk path
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