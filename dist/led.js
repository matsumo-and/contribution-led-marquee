"use strict";
/**
 * Converts image data to LED number array (with shadow support)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageDataToLED = imageDataToLED;
exports.getLEDViewport = getLEDViewport;
/**
 * Converts RGBA image data to number 2D array (LED matrix with shadow)
 * @param imageData - RGBA image data
 * @param width - Image width
 * @param height - Image height
 * @param options - Conversion options
 * @returns 2D number array where 0 = off, 0.5 = shadow, 1 = main LED
 */
function imageDataToLED(imageData, width, height, _options = {}) {
    const led = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            // Calculate brightness (0-255)
            const brightness = (r + g + b) / 3;
            // Map brightness to LED value
            // 0-64: off (0)
            // 65-191: shadow (0.5)
            // 192-255: main (1)
            let ledValue = 0;
            if (brightness >= 192) {
                ledValue = 1; // Main pixel
            }
            else if (brightness >= 65) {
                ledValue = 0.5; // Shadow
            }
            else {
                ledValue = 0; // Off
            }
            row.push(ledValue);
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
function getLEDViewport(led, offsetX, viewWidth, viewHeight) {
    const viewport = [];
    const ledHeight = led.length;
    const ledWidth = led[0]?.length || 0;
    for (let y = 0; y < viewHeight; y++) {
        const row = [];
        for (let x = 0; x < viewWidth; x++) {
            const sourceX = (offsetX + x) % ledWidth;
            const sourceY = y;
            if (sourceY < ledHeight && sourceX >= 0 && sourceX < ledWidth) {
                row.push(led[sourceY][sourceX]);
            }
            else {
                row.push(0);
            }
        }
        viewport.push(row);
    }
    return viewport;
}
//# sourceMappingURL=led.js.map