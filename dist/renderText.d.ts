export interface TextRenderOptions {
    letterSpacing?: number;
}
export interface RenderedText {
    imageData: Uint8ClampedArray;
    width: number;
    height: number;
}
/**
 * Renders text to pixel data using bitmap font
 * Height is fixed to 7 pixels
 * Values: 0 = background, 1 = main pixel, 0.5 = shadow
 * @param text - Text to render
 * @param options - Rendering options
 * @returns Image data with dimensions
 */
export declare function renderText(text: string, options?: TextRenderOptions): RenderedText;
//# sourceMappingURL=renderText.d.ts.map