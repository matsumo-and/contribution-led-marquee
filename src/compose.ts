/**
 * Composes contribution grid with LED overlay
 */

export type CellValue = number | 'led';

/**
 * Composes contribution grid with LED overlay
 * LED pixels override contribution grid where LED is true
 *
 * @param contributionGrid - 2D array of contribution counts (0-4)
 * @param ledOverlay - 2D boolean array (true = LED on)
 * @returns Composed grid where 'led' marks LED pixels
 */
export function composeGridWithLED(
  contributionGrid: number[][],
  ledOverlay: boolean[][]
): CellValue[][] {
  const height = contributionGrid.length;
  const width = contributionGrid[0]?.length || 0;

  const composed: CellValue[][] = [];

  for (let y = 0; y < height; y++) {
    const row: CellValue[] = [];
    for (let x = 0; x < width; x++) {
      const hasLED = ledOverlay[y]?.[x] || false;
      const contributionValue = contributionGrid[y]?.[x] || 0;

      // LED overrides contribution
      if (hasLED) {
        row.push('led');
      } else {
        row.push(contributionValue);
      }
    }
    composed.push(row);
  }

  return composed;
}

/**
 * Pads or centers LED overlay to match contribution grid dimensions
 * @param led - LED boolean array
 * @param targetWidth - Target width (contribution grid width)
 * @param targetHeight - Target height (contribution grid height)
 * @param verticalAlign - Vertical alignment: 'top' | 'center' | 'bottom'
 * @returns Padded LED array
 */
export function alignLED(
  led: boolean[][],
  targetWidth: number,
  targetHeight: number,
  verticalAlign: 'top' | 'center' | 'bottom' = 'center'
): boolean[][] {
  const ledHeight = led.length;
  const ledWidth = led[0]?.length || 0;

  const aligned: boolean[][] = [];

  // Calculate vertical offset
  let yOffset = 0;
  if (verticalAlign === 'center') {
    yOffset = Math.floor((targetHeight - ledHeight) / 2);
  } else if (verticalAlign === 'bottom') {
    yOffset = targetHeight - ledHeight;
  }

  for (let y = 0; y < targetHeight; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < targetWidth; x++) {
      const sourceY = y - yOffset;
      const sourceX = x;

      if (
        sourceY >= 0 &&
        sourceY < ledHeight &&
        sourceX >= 0 &&
        sourceX < ledWidth
      ) {
        row.push(led[sourceY][sourceX]);
      } else {
        row.push(false);
      }
    }
    aligned.push(row);
  }

  return aligned;
}
