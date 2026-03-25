"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderText = renderText;
/**
 * Renders text using bitmap font
 */
const bitmapFont_1 = require("./bitmapFont");
/**
 * Renders text to pixel data using bitmap font
 * Height is fixed to 7 pixels
 * Values: 0 = background, 1 = main pixel, 0.5 = shadow
 * @param text - Text to render
 * @param options - Rendering options
 * @returns Image data with dimensions
 */
function renderText(text, options = {}) {
    const letterSpacing = options.letterSpacing !== undefined ? options.letterSpacing : 1;
    const height = bitmapFont_1.BITMAP_CHAR_HEIGHT;
    // Get bitmaps for all characters
    const charBitmaps = [];
    let totalWidth = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const bitmap = (0, bitmapFont_1.getCharBitmap)(char);
        if (bitmap) {
            charBitmaps.push(bitmap);
            const charWidth = (0, bitmapFont_1.getCharWidth)(char);
            totalWidth += charWidth;
            // Add letter spacing except for last character
            if (i < text.length - 1) {
                totalWidth += letterSpacing;
            }
        }
        else {
            // Unknown character - use space
            const spaceBitmap = (0, bitmapFont_1.getCharBitmap)(' ');
            if (spaceBitmap) {
                charBitmaps.push(spaceBitmap);
                totalWidth += (0, bitmapFont_1.getCharWidth)(' ');
                if (i < text.length - 1) {
                    totalWidth += letterSpacing;
                }
            }
        }
    }
    // Create image data
    // RGBA format: 4 bytes per pixel
    const imageData = new Uint8ClampedArray(totalWidth * height * 4);
    // Fill with black (0, 0, 0, 255)
    for (let i = 0; i < imageData.length; i += 4) {
        imageData[i] = 0; // R
        imageData[i + 1] = 0; // G
        imageData[i + 2] = 0; // B
        imageData[i + 3] = 255; // A
    }
    // Render each character
    let xOffset = 0;
    for (let charIdx = 0; charIdx < charBitmaps.length; charIdx++) {
        const bitmap = charBitmaps[charIdx];
        const charWidth = bitmap[0].length;
        // Draw character bitmap
        for (let y = 0; y < height && y < bitmap.length; y++) {
            for (let x = 0; x < charWidth && x < bitmap[y].length; x++) {
                const value = bitmap[y][x];
                if (value > 0) {
                    const pixelX = xOffset + x;
                    const pixelIndex = (y * totalWidth + pixelX) * 4;
                    // Map value to grayscale
                    // 1.0 = white (255), 0.5 = gray (128), 0 = black (0)
                    const brightness = Math.floor(value * 255);
                    imageData[pixelIndex] = brightness; // R
                    imageData[pixelIndex + 1] = brightness; // G
                    imageData[pixelIndex + 2] = brightness; // B
                    imageData[pixelIndex + 3] = 255; // A
                }
            }
        }
        xOffset += charWidth;
        // Add letter spacing
        if (charIdx < charBitmaps.length - 1) {
            xOffset += letterSpacing;
        }
    }
    return {
        imageData: imageData,
        width: totalWidth,
        height: height
    };
}
//# sourceMappingURL=renderText.js.map