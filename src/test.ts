/**
 * Test script for Git Marquee
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fetchContributions } from './fetch';
import { parseContributions, getContributionLevels } from './parser';
import { renderText } from './renderText';
import { imageDataToLED } from './led';
import { alignLED } from './compose';
import { generateMarqueeSVG, generateContributionSVG } from './svg';

async function test() {
  try {
    const githubUserName = 'torvalds'; // Replace with your GitHub username
    const text = 'HELLO WORLD';

    console.log(`Fetching contribution data for ${githubUserName}...`);

    // Fetch contribution data
    const html = await fetchContributions(githubUserName);

    console.log('Parsing contribution data...');

    // Parse the HTML
    const contributionGrid = parseContributions(html);
    const contributionLevels = getContributionLevels(contributionGrid);

    console.log(`Grid size: ${contributionGrid.width}x${contributionGrid.height}`);
    console.log(`Rendering text: "${text}"`);

    // Render text to pixels
    const rendered = renderText(text, { fontSize: 16 });

    console.log(`Text dimensions: ${rendered.width}x${rendered.height}`);

    // Convert to LED boolean array
    const ledMatrix = imageDataToLED(rendered.imageData, rendered.width, rendered.height);

    // Align LED to contribution grid (center vertically)
    const alignedLED = alignLED(ledMatrix, rendered.width, contributionGrid.height, 'center');

    console.log('Generating SVG with scrolling text...');

    // Generate SVG with scrolling animation
    const svg = generateMarqueeSVG(contributionLevels, alignedLED, {
      cellSize: 10,
      cellGap: 2,
      scrollSpeed: 30,
      initialDelay: 3
    });

    // Also generate a static contribution graph for comparison
    const staticSvg = generateContributionSVG(contributionLevels, {
      cellSize: 10,
      cellGap: 2
    });

    // Ensure output directory exists
    const outputDir = path.join(__dirname, '../dist');
    await fs.mkdir(outputDir, { recursive: true });

    // Write SVG files
    const marqueePath = path.join(outputDir, 'marquee.svg');
    const staticPath = path.join(outputDir, 'contribution-graph.svg');

    await fs.writeFile(marqueePath, svg, 'utf8');
    await fs.writeFile(staticPath, staticSvg, 'utf8');

    console.log(`\n✅ Test completed successfully!`);
    console.log(`📊 Static contribution graph: ${staticPath}`);
    console.log(`🎬 Marquee SVG: ${marqueePath}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
