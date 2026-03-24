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
  padding?: number;
}

export interface RenderedText {
  imageData: Uint8ClampedArray;
  width: number;
  height: number;
}

/**
 * Renders text to pixel data using DotGothic16 font
 * @param text - Text to render
 * @param options - Rendering options
 * @returns Image data with dimensions
 */
export function renderText(text: string, options: TextRenderOptions = {}): RenderedText {
  const fontSize = options.fontSize || 16;
  const padding = options.padding || 2;

  // Create canvas with estimated size
  // DotGothic16 is monospace-like, so we can estimate width
  const estimatedWidth = text.length * fontSize + padding * 2;
  const height = fontSize + padding * 2;

  const canvas = createCanvas(estimatedWidth, height);
  const ctx = canvas.getContext('2d');

  // Configure canvas for pixel-perfect rendering
  ctx.imageSmoothingEnabled = false;
  ctx.textBaseline = 'top';
  ctx.font = `${fontSize}px DotGothic16`;

  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, estimatedWidth, height);

  // Render text in white
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, padding, padding);

  // Get actual text width and trim canvas
  const metrics = ctx.measureText(text);
  const actualWidth = Math.ceil(metrics.width) + padding * 2;

  // Create final canvas with exact size
  const finalCanvas = createCanvas(actualWidth, height);
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.imageSmoothingEnabled = false;

  // Copy rendered text
  finalCtx.drawImage(canvas, 0, 0);

  // Get image data
  const imageData = finalCtx.getImageData(0, 0, actualWidth, height);

  return {
    imageData: imageData.data,
    width: actualWidth,
    height: height
  };
}
