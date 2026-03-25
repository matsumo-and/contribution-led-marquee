/**
 * Converts image data to LED number array (with shadow support)
 */
export interface LEDOptions {
    threshold?: number;
}
/**
 * Converts RGBA image data to number 2D array (LED matrix with shadow)
 * @param imageData - RGBA image data
 * @param width - Image width
 * @param height - Image height
 * @param options - Conversion options
 * @returns 2D number array where 0 = off, 0.5 = shadow, 1 = main LED
 */
export declare function imageDataToLED(imageData: Uint8ClampedArray, width: number, height: number, _options?: LEDOptions): number[][];
/**
 * Gets a viewport (window) of the LED matrix for scrolling
 * @param led - Full LED matrix
 * @param offsetX - Horizontal offset
 * @param viewWidth - Viewport width
 * @param viewHeight - Viewport height
 * @returns Cropped LED matrix
 */
export declare function getLEDViewport(led: number[][], offsetX: number, viewWidth: number, viewHeight: number): number[][];
//# sourceMappingURL=led.d.ts.map