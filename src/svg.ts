/**
 * Generates SVG with contribution graph and scrolling LED text
 */
import { CellValue } from './compose';

export interface SVGOptions {
  cellSize?: number;
  cellGap?: number;
  scrollSpeed?: number; // columns per second
  initialDelay?: number; // seconds before graph disappears
  blackDuration?: number; // seconds of black screen
  showContributions?: boolean; // show contribution graph initially
}

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
export function generateContributionSVG(
  contributionGrid: number[][],
  options: SVGOptions = {}
): string {
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
      const color = CONTRIBUTION_COLORS[Math.min(value, 4) as keyof typeof CONTRIBUTION_COLORS];
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
export function generateMarqueeSVG(
  contributionGrid: number[][],
  ledText: number[][],
  options: SVGOptions = {}
): string {
  const cellSize = options.cellSize || 10;
  const cellGap = options.cellGap || 2;
  const scrollSpeed = options.scrollSpeed || 2; // columns per second
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

  const textStartTime = showContributions ? initialDelay + blackDuration : 0;
  const ledEndTime = textStartTime + ledDuration;
  const cycleDuration = ledEndTime + 1; // Add 1 second pause before loop

  let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

  // Background
  svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="#0d1117"/>`;

  // Contribution graph layer (only if showContributions is true)
  if (showContributions) {
    svg += `<g id="contributionLayer">`;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const value = contributionGrid[y][x];
        // Render all cells, but value=0 uses dark background color
        const color = CONTRIBUTION_COLORS[Math.min(value, 4) as keyof typeof CONTRIBUTION_COLORS];
        const posX = x * cellWidth;
        const posY = y * cellWidth;

        svg += `<rect x="${posX}" y="${posY}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="2">`;
        // Animation: show -> hide -> show (loop)
        svg += `<animate attributeName="opacity" `;
        svg += `values="1;1;0;0;1" `;
        svg += `keyTimes="0;${initialDelay/cycleDuration};${initialDelay/cycleDuration};${ledEndTime/cycleDuration};1" `;
        svg += `dur="${cycleDuration}s" `;
        svg += `repeatCount="indefinite"/>`;
        svg += `</rect>`;
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
      // Animation: hide -> show -> hide (loop)
      svg += `<animate attributeName="opacity" `;
      svg += `values="0;0;1;1;0" `;
      svg += `keyTimes="0;${textStartTime/cycleDuration};${textStartTime/cycleDuration};${ledEndTime/cycleDuration};1" `;
      svg += `dur="${cycleDuration}s" `;
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
        const xPositions: number[] = [];
        const keyTimes: number[] = [];

        for (let col = 0; col <= totalColumns; col++) {
          const xPos = startX + (x * cellWidth) - (col * cellWidth);
          xPositions.push(xPos);
          keyTimes.push(col / totalColumns);
        }

        svg += `<rect y="${posY}" width="${cellSize}" height="${cellSize}" fill="${ledColor}" rx="2">`;

        // Discrete x-position animation (one cycle per loop)
        const animationBegin = `${textStartTime}s`;
        const animationDur = `${ledDuration}s`;

        svg += `<animate id="ledAnim_${y}_${x}" attributeName="x" `;
        svg += `values="${xPositions.join(';')}" `;
        svg += `keyTimes="${keyTimes.join(';')}" `;
        svg += `dur="${animationDur}" `;
        svg += `begin="${animationBegin};ledAnim_${y}_${x}.end+${cycleDuration - ledEndTime}s" `;
        svg += `calcMode="discrete"/>`;

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
export function generateStaticSVG(
  composedGrid: CellValue[][],
  options: SVGOptions = {}
): string {
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
      let color: string;

      if (value === 'led') {
        color = LED_COLOR;
      } else {
        // Render all cells, value=0 uses dark background color
        color = CONTRIBUTION_COLORS[Math.min(value, 4) as keyof typeof CONTRIBUTION_COLORS];
      }

      const posX = x * (cellSize + cellGap);
      const posY = y * (cellSize + cellGap);

      svg += `<rect x="${posX}" y="${posY}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="2"/>`;
    }
  }

  svg += '</svg>';
  return svg;
}
