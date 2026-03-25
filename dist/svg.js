"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContributionSVG = generateContributionSVG;
exports.generateMarqueeSVG = generateMarqueeSVG;
exports.generateStaticSVG = generateStaticSVG;
const CONTRIBUTION_COLORS = {
    0: '#161b22',
    1: '#0e4429',
    2: '#006d32',
    3: '#26a641',
    4: '#39d353'
};
const LED_COLOR = '#26a641';
const LED_SHADOW_COLOR = '#0e4429';
/**
 * Generates GitHub contribution graph SVG
 */
function generateContributionSVG(contributionGrid, options = {}) {
    const cellSize = options.cellSize || 10;
    const cellGap = options.cellGap || 2;
    const height = contributionGrid.length;
    const width = contributionGrid[0]?.length || 0;
    const svgWidth = width * (cellSize + cellGap) - cellGap;
    const svgHeight = height * (cellSize + cellGap) - cellGap;
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="#0d1117"/>`;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = contributionGrid[y][x];
            // Render all cells, but value=0 uses dark background color
            const color = CONTRIBUTION_COLORS[Math.min(value, 4)];
            const posX = x * (cellSize + cellGap);
            const posY = y * (cellSize + cellGap);
            svg += `<rect x="${posX}" y="${posY}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="2"/>`;
        }
    }
    svg += '</svg>';
    return svg;
}
/**
 * Generates SVG with scrolling LED text overlay
 * Text scrolls one column at a time (discrete animation)
 * After one cycle, returns to contribution graph and loops
 */
function generateMarqueeSVG(contributionGrid, ledText, options = {}) {
    const cellSize = options.cellSize || 10;
    const cellGap = options.cellGap || 2;
    const scrollSpeed = options.scrollSpeed || 4; // columns per second
    const initialDelay = options.initialDelay || 3; // 3 seconds
    const blackDuration = options.blackDuration || 0.5; // 0.5 seconds
    const showContributions = options.showContributions !== undefined ? options.showContributions : true;
    const height = contributionGrid.length;
    const width = contributionGrid[0]?.length || 0;
    const ledWidth = ledText[0]?.length || 0;
    const svgWidth = width * (cellSize + cellGap) - cellGap;
    const svgHeight = height * (cellSize + cellGap) - cellGap;
    const cellWidth = cellSize + cellGap;
    // Calculate animation parameters
    const columnDuration = 1 / scrollSpeed; // seconds per column
    // Need to scroll: viewport width + LED text width + 1 extra column to fully clear
    const totalColumns = width + ledWidth + 1;
    const ledDuration = totalColumns * columnDuration;
    // Wave animation parameters for contribution graph
    const waveAnimationDuration = showContributions ? 1.5 : 0; // 1.5 seconds for wave effect
    const columnDelay = waveAnimationDuration / width; // Delay per column
    // Graph disappears instantly, grid/LED appears at the same time (no black screen)
    const textStartTime = showContributions ? initialDelay : 0;
    const ledEndTime = textStartTime + ledDuration;
    const cycleDuration = ledEndTime + 1; // Add 1 second pause before loop
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    // Background
    svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="#0d1117"/>`;
    // Base grid layer (always visible during contribution graph phase)
    if (showContributions) {
        svg += `<g id="baseGridLayer">`;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const posX = x * cellWidth;
                const posY = y * cellWidth;
                // All cells use the dark color (contribution 0 color)
                svg += `<rect x="${posX}" y="${posY}" width="${cellSize}" height="${cellSize}" fill="${CONTRIBUTION_COLORS[0]}" rx="2">`;
                // Animation: show -> hide -> show (loop)
                svg += `<animate attributeName="opacity" `;
                svg += `values="1;1;0;0;1" `;
                svg += `keyTimes="0;${initialDelay / cycleDuration};${initialDelay / cycleDuration};${ledEndTime / cycleDuration};1" `;
                svg += `dur="${cycleDuration}s" `;
                svg += `calcMode="discrete" `;
                svg += `repeatCount="indefinite"/>`;
                svg += `</rect>`;
            }
        }
        svg += `</g>`;
        // Contribution color layer (wave effect on top of base grid)
        svg += `<g id="contributionLayer">`;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const value = contributionGrid[y][x];
                // Only render cells with contributions (value > 0)
                if (value > 0) {
                    const color = CONTRIBUTION_COLORS[Math.min(value, 4)];
                    const posX = x * cellWidth;
                    const posY = y * cellWidth;
                    const columnAppearTime = x * columnDelay;
                    svg += `<rect x="${posX}" y="${posY}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="2">`;
                    // Wave effect animation that loops
                    svg += `<animate attributeName="opacity" `;
                    svg += `values="0;1;1;0;0" `;
                    svg += `keyTimes="0;${columnAppearTime / cycleDuration};${initialDelay / cycleDuration};${initialDelay / cycleDuration};1" `;
                    svg += `dur="${cycleDuration}s" `;
                    svg += `calcMode="discrete" `;
                    svg += `repeatCount="indefinite"/>`;
                    svg += `</rect>`;
                }
            }
        }
        svg += `</g>`;
    }
    // Grid layer (dark background cells for LED mode)
    svg += `<g id="gridLayer">`;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const posX = x * cellWidth;
            const posY = y * cellWidth;
            // All cells use the dark color (contribution 0 color)
            svg += `<rect x="${posX}" y="${posY}" width="${cellSize}" height="${cellSize}" fill="${CONTRIBUTION_COLORS[0]}" rx="2">`;
            // Animation: hide -> show -> hide (instant transitions, no fade)
            svg += `<animate attributeName="opacity" `;
            svg += `values="0;0;1;1;0" `;
            svg += `keyTimes="0;${textStartTime / cycleDuration};${textStartTime / cycleDuration};${ledEndTime / cycleDuration};1" `;
            svg += `dur="${cycleDuration}s" `;
            svg += `calcMode="discrete" `;
            svg += `repeatCount="indefinite"/>`;
            svg += `</rect>`;
        }
    }
    svg += `</g>`;
    // LED text layer (scrolling column by column)
    svg += `<g id="ledLayer">`;
    // Create LED cells with discrete column-by-column animation
    for (let y = 0; y < Math.min(height, ledText.length); y++) {
        for (let x = 0; x < ledWidth; x++) {
            const ledValue = ledText[y][x];
            if (ledValue > 0) {
                const posY = y * cellWidth;
                // Choose color based on LED value (1 = main, 0.5 = shadow)
                const ledColor = ledValue >= 1 ? LED_COLOR : LED_SHADOW_COLOR;
                // Start position: one column outside the right edge of viewport
                const startX = svgWidth + cellWidth;
                // Generate discrete x positions (one for each column step)
                const xPositions = [startX + (x * cellWidth)]; // Initial position (before animation)
                const keyTimes = [0];
                // Add scroll positions from textStartTime to ledEndTime
                keyTimes.push(textStartTime / cycleDuration);
                xPositions.push(startX + (x * cellWidth)); // Still at start position at textStartTime
                for (let col = 0; col <= totalColumns; col++) {
                    const xPos = startX + (x * cellWidth) - (col * cellWidth);
                    const time = textStartTime + (col * columnDuration);
                    const keyTime = time / cycleDuration;
                    if (keyTime <= 1) {
                        xPositions.push(xPos);
                        keyTimes.push(keyTime);
                    }
                }
                // Add final position at end of cycle
                if (keyTimes[keyTimes.length - 1] < 1) {
                    keyTimes.push(1);
                    xPositions.push(xPositions[xPositions.length - 1]);
                }
                svg += `<rect y="${posY}" width="${cellSize}" height="${cellSize}" fill="${ledColor}" rx="2">`;
                // X-position animation (discrete scrolling)
                svg += `<animate attributeName="x" `;
                svg += `values="${xPositions.join(';')}" `;
                svg += `keyTimes="${keyTimes.join(';')}" `;
                svg += `dur="${cycleDuration}s" `;
                svg += `begin="0s" `;
                svg += `calcMode="discrete" `;
                svg += `repeatCount="indefinite"/>`;
                // Opacity animation (hide before textStartTime and after ledEndTime)
                svg += `<animate attributeName="opacity" `;
                svg += `values="0;0;1;1;0" `;
                svg += `keyTimes="0;${textStartTime / cycleDuration};${textStartTime / cycleDuration};${ledEndTime / cycleDuration};1" `;
                svg += `dur="${cycleDuration}s" `;
                svg += `calcMode="discrete" `;
                svg += `repeatCount="indefinite"/>`;
                svg += `</rect>`;
            }
        }
    }
    svg += `</g>`;
    svg += '</svg>';
    return svg;
}
/**
 * Generates static composed SVG (no animation)
 */
function generateStaticSVG(composedGrid, options = {}) {
    const cellSize = options.cellSize || 10;
    const cellGap = options.cellGap || 2;
    const height = composedGrid.length;
    const width = composedGrid[0]?.length || 0;
    const svgWidth = width * (cellSize + cellGap) - cellGap;
    const svgHeight = height * (cellSize + cellGap) - cellGap;
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="#0d1117"/>`;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = composedGrid[y][x];
            let color;
            if (value === 'led') {
                color = LED_COLOR;
            }
            else {
                // Render all cells, value=0 uses dark background color
                color = CONTRIBUTION_COLORS[Math.min(value, 4)];
            }
            const posX = x * (cellSize + cellGap);
            const posY = y * (cellSize + cellGap);
            svg += `<rect x="${posX}" y="${posY}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="2"/>`;
        }
    }
    svg += '</svg>';
    return svg;
}
//# sourceMappingURL=svg.js.map