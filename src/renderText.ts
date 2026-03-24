/**
 * Renders text to pixels using canvas and DotGothic16 font
 */
import { createCanvas, registerFont } from 'canvas';
import * as path from 'path';

// Register DotGothic16 font
const fontPath = path.join(__dirname, '../assets/DotGothic16-Regular.ttf');
registerFont(fontPath, { family: 'DotGothic16' });

export interface TextRenderOptions {
  fontSize?: number;
  letterSpacing?: number; // Spacing between characters in pixels
}

export interface RenderedText {
  imageData: Uint8ClampedArray;
  width: number;
  height: number;
}

/**
 * Renders text to pixel data using DotGothic16 font
 * Height is fixed to 7 pixels to match contribution graph
 * @param text - Text to render
 * @param options - Rendering options
 * @returns Image data with dimensions
 */
export function renderText(text: string, options: TextRenderOptions = {}): RenderedText {
  const fontSize = options.fontSize || 7; // Use 7px font for exact 7px height
  const letterSpacing = options.letterSpacing !== undefined ? options.letterSpacing : 1; // 1 pixel spacing by default
  const height = 7; // Fixed height to match contribution graph

  // Render each character individually
  const charCanvases: { canvas: any; width: number }[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Create canvas for this character
    const tempCanvas = createCanvas(fontSize * 3, fontSize * 2);
    const tempCtx = tempCanvas.getContext('2d');

    // Configure canvas for pixel-perfect rendering
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.textBaseline = 'middle';
    tempCtx.font = `${fontSize}px DotGothic16`;

    // Clear canvas
    tempCtx.fillStyle = '#000000';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Render character in white
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillText(char, 0, fontSize);

    // Get character width
    const metrics = tempCtx.measureText(char);
    const charWidth = Math.ceil(metrics.width);

    // Store character data
    charCanvases.push({
      canvas: tempCanvas,
      width: charWidth
    });
  }

  // Calculate total width
  const totalCharWidth = charCanvases.reduce((sum, c) => sum + c.width, 0);
  const totalSpacing = (text.length - 1) * letterSpacing;
  const finalWidth = totalCharWidth + totalSpacing;

  // Create final canvas
  const finalCanvas = createCanvas(finalWidth, height);
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.imageSmoothingEnabled = false;

  // Clear to black
  finalCtx.fillStyle = '#000000';
  finalCtx.fillRect(0, 0, finalWidth, height);

  // Copy each character with spacing
  let destX = 0;
  for (let i = 0; i < charCanvases.length; i++) {
    const charData = charCanvases[i];

    // Extract character pixels (crop to 7 pixels height)
    const tempCtx = charData.canvas.getContext('2d');
    const charImageData = tempCtx.getImageData(0, Math.floor(fontSize / 2), charData.width, height);

    // Put to final canvas
    finalCtx.putImageData(charImageData, destX, 0);

    // Move to next position (character width + spacing)
    destX += charData.width;

    // Add spacing after each character except the last one
    if (i < charCanvases.length - 1) {
      destX += letterSpacing;
    }
  }

  // Get final image data
  const finalImageData = finalCtx.getImageData(0, 0, finalWidth, height);

  return {
    imageData: finalImageData.data,
    width: finalWidth,
    height: height
  };
}
