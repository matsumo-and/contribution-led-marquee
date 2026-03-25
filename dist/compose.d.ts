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
export declare function composeGridWithLED(contributionGrid: number[][], ledOverlay: boolean[][]): CellValue[][];
/**
 * Pads or centers LED overlay to match contribution grid dimensions
 * @param led - LED boolean array
 * @param targetWidth - Target width (contribution grid width)
 * @param targetHeight - Target height (contribution grid height)
 * @param verticalAlign - Vertical alignment: 'top' | 'center' | 'bottom'
 * @returns Padded LED array
 */
export declare function alignLED(led: boolean[][], targetWidth: number, targetHeight: number, verticalAlign?: 'top' | 'center' | 'bottom'): boolean[][];
//# sourceMappingURL=compose.d.ts.map