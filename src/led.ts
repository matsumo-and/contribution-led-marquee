/**
 * Converts image data to LED boolean array
 */

export interface LEDOptions {
  threshold?: number;
}

/**
 * Converts RGBA image data to boolean 2D array (LED matrix)
 * @param imageData - RGBA image data from canvas
 * @param width - Image width
 * @param height - Image height
 * @param options - Conversion options
 * @returns 2D boolean array where true = LED on, false = LED off
 */
export function imageDataToLED(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  options: LEDOptions = {}
): boolean[][] {
  const threshold = options.threshold || 128;
  const led: boolean[][] = [];

  for (let y = 0; y < height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];

      // Calculate brightness
      const brightness = r + g + b;

      // Determine if LED should be on
      row.push(brightness >= threshold);
    }
    led.push(row);
  }

  return led;
}

/**
 * Gets a viewport (window) of the LED matrix for scrolling
 * @param led - Full LED matrix
 * @param offsetX - Horizontal offset
 * @param viewWidth - Viewport width
 * @param viewHeight - Viewport height
 * @returns Cropped LED matrix
 */
export function getLEDViewport(
  led: boolean[][],
  offsetX: number,
  viewWidth: number,
  viewHeight: number
): boolean[][] {
  const viewport: boolean[][] = [];
  const ledHeight = led.length;
  const ledWidth = led[0]?.length || 0;

  for (let y = 0; y < viewHeight; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < viewWidth; x++) {
      const sourceX = (offsetX + x) % ledWidth;
      const sourceY = y;

      if (sourceY < ledHeight && sourceX >= 0 && sourceX < ledWidth) {
        row.push(led[sourceY][sourceX]);
      } else {
        row.push(false);
      }
    }
    viewport.push(row);
  }

  return viewport;
}
