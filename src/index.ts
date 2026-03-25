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
import { generateMarqueeSVG } from './svg';

async function run(): Promise<void> {
  try {
    // Get inputs
    const githubUserName = core.getInput('github_user_name', { required: true });
    const text = core.getInput('text', { required: true });
    const outputPath = core.getInput('output_path') || 'dist/marquee.svg';

    // Get show_contributions as string and convert to boolean (default: true)
    const showContributionsInput = core.getInput('show_contributions');
    const showContributions = showContributionsInput === '' || showContributionsInput.toLowerCase() !== 'false';

    // Validate text input
    if (text.trim().length === 0) {
      throw new Error('Text input cannot be empty or only whitespace');
    }

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
      showContributions: showContributions
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
