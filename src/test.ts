/**
 * Test script for Git Marquee
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fetchContributions } from './fetch';
import { parseContributions, getContributionLevels } from './parser';
import { renderText } from './renderText';
import { imageDataToLED } from './led';
import { generateMarqueeSVG, generateContributionSVG } from './svg';

async function test() {
  try {
    const githubUserName = 'matsumo-and'; // Replace with your GitHub username
    const text = 'HELLO World!';

    console.log(`Fetching contribution data for ${githubUserName}...`);

    // Fetch contribution data
    const html = await fetchContributions(githubUserName);

    console.log('Parsing contribution data...');

    // Parse the HTML
    const contributionGrid = parseContributions(html);
    const contributionLevels = getContributionLevels(contributionGrid);

    console.log(`Grid size: ${contributionGrid.width}x${contributionGrid.height}`);
    console.log(`Rendering text: "${text}"`);

    // Render text to pixels using bitmap font (1px letter spacing)
    const rendered = renderText(text, { letterSpacing: 1 });

    console.log(`Text dimensions: ${rendered.width}x${rendered.height}`);

    // Convert to LED boolean array
    const ledMatrix = imageDataToLED(rendered.imageData, rendered.width, rendered.height);

    console.log('Generating SVG with scrolling text...');

    // Generate SVG with scrolling animation
    const svg = generateMarqueeSVG(contributionLevels, ledMatrix, {
      cellSize: 10,
      cellGap: 2,
      scrollSpeed: 4, // columns per second
      initialDelay: 3, // 3 seconds before graph disappears
      showContributions: true
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
