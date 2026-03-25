/**
 * Bitmap font definition (5x7 characters with shadow)
 * 0 = background, 1 = main pixel, 0.5 = shadow
 */
export type BitmapChar = number[][];
/**
 * Get bitmap for a character with shadow
 */
export declare function getCharBitmap(char: string): number[][] | null;
/**
 * Get character width (including shadow)
 */
export declare function getCharWidth(char: string): number;
export declare const BITMAP_CHAR_HEIGHT = 7;
//# sourceMappingURL=bitmapFont.d.ts.map