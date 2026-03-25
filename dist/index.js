"use strict";
/**
 * Main entry point for the Git Marquee GitHub Action
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const fetch_1 = require("./fetch");
const parser_1 = require("./parser");
const renderText_1 = require("./renderText");
const led_1 = require("./led");
const svg_1 = require("./svg");
async function run() {
    try {
        // Get inputs
        const githubUserName = core.getInput('github_user_name', { required: true });
        const text = core.getInput('text', { required: true });
        const outputPath = core.getInput('output_path') || 'dist/marquee.svg';
        // Get show_contributions as string and convert to boolean (default: true)
        const showContributionsInput = core.getInput('show_contributions');
        const showContributions = showContributionsInput === '' || showContributionsInput.toLowerCase() !== 'false';
        // Get numeric parameters
        const cellSize = parseInt(core.getInput('cell_size') || '10', 10);
        const cellGap = parseInt(core.getInput('cell_gap') || '2', 10);
        const scrollSpeed = parseFloat(core.getInput('scroll_speed') || '4');
        const initialDelay = parseFloat(core.getInput('initial_delay') || '3');
        // Validate text input
        if (text.trim().length === 0) {
            throw new Error('Text input cannot be empty or only whitespace');
        }
        console.log(`Fetching contribution data for ${githubUserName}...`);
        // Fetch contribution data
        const html = await (0, fetch_1.fetchContributions)(githubUserName);
        console.log('Parsing contribution data...');
        // Parse the HTML
        const contributionGrid = (0, parser_1.parseContributions)(html);
        const contributionLevels = (0, parser_1.getContributionLevels)(contributionGrid);
        console.log(`Grid size: ${contributionGrid.width}x${contributionGrid.height}`);
        console.log(`Rendering text: "${text}"`);
        // Render text to pixels using bitmap font (1px letter spacing)
        const rendered = (0, renderText_1.renderText)(text, { letterSpacing: 1 });
        console.log(`Text dimensions: ${rendered.width}x${rendered.height}`);
        // Convert to LED boolean array
        const ledMatrix = (0, led_1.imageDataToLED)(rendered.imageData, rendered.width, rendered.height);
        console.log('Generating SVG with scrolling text...');
        // Generate SVG with scrolling animation
        const svg = (0, svg_1.generateMarqueeSVG)(contributionLevels, ledMatrix, {
            cellSize,
            cellGap,
            scrollSpeed,
            initialDelay,
            showContributions
        });
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        await fs.mkdir(outputDir, { recursive: true });
        // Write SVG file
        await fs.writeFile(outputPath, svg, 'utf8');
        console.log(`SVG generated successfully at ${outputPath}`);
        // Set output
        core.setOutput('svg_path', outputPath);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error:', errorMessage);
        core.setFailed(errorMessage);
    }
}
// Run the action
if (require.main === module) {
    run();
}
//# sourceMappingURL=index.js.map