"use strict";
/**
 * Test script for Git Marquee
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
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const fetch_1 = require("./fetch");
const parser_1 = require("./parser");
const renderText_1 = require("./renderText");
const led_1 = require("./led");
const svg_1 = require("./svg");
async function test() {
    try {
        const githubUserName = 'matsumo-and'; // Replace with your GitHub username
        const text = 'Hi there!';
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
            cellSize: 10,
            cellGap: 2,
            scrollSpeed: 8, // columns per second
            initialDelay: 3, // 3 seconds before graph disappears
            showContributions: true
        });
        // Also generate a static contribution graph for comparison
        const staticSvg = (0, svg_1.generateContributionSVG)(contributionLevels, {
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
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}
test();
//# sourceMappingURL=test.js.map