/**
 * Main entry point for the Git Marquee GitHub Action
 */

import * as core from '@actions/core';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fetchContributions } from './fetch';
import { parseContributions, getContributionLevels } from './parser';
import { renderText } from './renderText';
import { imageDataToLED } from './led';
import { alignLED } from './compose';
import { generateMarqueeSVG } from './svg';

async function run(): Promise<void> {
  try {
    // Get inputs
    const githubUserName = core.getInput('github_user_name', { required: true });
    const text = core.getInput('text', { required: true });
    const outputPath = core.getInput('output_path') || 'dist/marquee.svg';

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
      scrollSpeed: 30, // pixels per second
      initialDelay: 3  // 3 seconds before text starts
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
    console.error('Error:', errorMessage);
    core.setFailed(errorMessage);
  }
}

// Run the action
if (require.main === module) {
  run();
}

export { run };
