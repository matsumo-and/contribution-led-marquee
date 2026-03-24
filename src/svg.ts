/**
 * Generates SVG with contribution graph and scrolling LED text
 */
import { CellValue } from './compose';

export interface SVGOptions {
  cellSize?: number;
  cellGap?: number;
  scrollSpeed?: number; // pixels per second
  initialDelay?: number; // seconds before text starts scrolling
}

const CONTRIBUTION_COLORS = {
  0: '#161b22',
  1: '#0e4429',
  2: '#006d32',
  3: '#26a641',
  4: '#39d353'
};

const LED_COLOR = '#ffffff';

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
 * Text appears after initialDelay and scrolls continuously
 */
export function generateMarqueeSVG(
  contributionGrid: number[][],
  ledText: boolean[][],
  options: SVGOptions = {}
): string {
  const cellSize = options.cellSize || 10;
  const cellGap = options.cellGap || 2;
  const scrollSpeed = options.scrollSpeed || 20; // pixels per second
  const initialDelay = options.initialDelay || 3; // 3 seconds

  const height = contributionGrid.length;
  const width = contributionGrid[0]?.length || 0;
  const ledWidth = ledText[0]?.length || 0;

  const svgWidth = width * (cellSize + cellGap) - cellGap;
  const svgHeight = height * (cellSize + cellGap) - cellGap;

  // Double the LED text for seamless looping
  const doubledLedWidth = ledWidth * 2;
  const scrollDistance = ledWidth * (cellSize + cellGap);
  const duration = scrollDistance / scrollSpeed;

  let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs>`;
  svg += `<clipPath id="viewportClip">`;
  svg += `<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}"/>`;
  svg += `</clipPath>`;
  svg += `</defs>`;

  // Background
  svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="#0d1117"/>`;

  // Contribution graph layer (always visible)
  svg += `<g id="contributionLayer">`;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = contributionGrid[y][x];
      const color = CONTRIBUTION_COLORS[Math.min(value, 4) as keyof typeof CONTRIBUTION_COLORS];
      const posX = x * (cellSize + cellGap);
      const posY = y * (cellSize + cellGap);

      svg += `<rect x="${posX}" y="${posY}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="2">`;
      // Fade out when text appears
      svg += `<animate attributeName="opacity" from="1" to="0.3" dur="1s" begin="${initialDelay}s" fill="freeze"/>`;
      svg += `</rect>`;
    }
  }
  svg += `</g>`;

  // LED text layer (scrolling)
  svg += `<g id="ledLayer" clip-path="url(#viewportClip)" opacity="0">`;
  // Fade in animation
  svg += `<animate attributeName="opacity" from="0" to="1" dur="1s" begin="${initialDelay}s" fill="freeze"/>`;

  // Create doubled text for seamless loop
  for (let copyIndex = 0; copyIndex < 2; copyIndex++) {
    const offsetX = copyIndex * ledWidth * (cellSize + cellGap);

    for (let y = 0; y < Math.min(height, ledText.length); y++) {
      for (let x = 0; x < ledWidth; x++) {
        if (ledText[y][x]) {
          const posX = x * (cellSize + cellGap) + offsetX;
          const posY = y * (cellSize + cellGap);

          svg += `<rect x="${posX}" y="${posY}" width="${cellSize}" height="${cellSize}" fill="${LED_COLOR}" rx="2"/>`;
        }
      }
    }
  }

  // Scrolling animation
  svg += `<animateTransform attributeName="transform" type="translate" from="0,0" to="-${scrollDistance},0" dur="${duration}s" begin="${initialDelay + 1}s" repeatCount="indefinite"/>`;
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
