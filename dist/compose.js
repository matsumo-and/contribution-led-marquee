"use strict";
/**
 * Composes contribution grid with LED overlay
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeGridWithLED = composeGridWithLED;
exports.alignLED = alignLED;
/**
 * Composes contribution grid with LED overlay
 * LED pixels override contribution grid where LED is true
 *
 * @param contributionGrid - 2D array of contribution counts (0-4)
 * @param ledOverlay - 2D boolean array (true = LED on)
 * @returns Composed grid where 'led' marks LED pixels
 */
function composeGridWithLED(contributionGrid, ledOverlay) {
    const height = contributionGrid.length;
    const width = contributionGrid[0]?.length || 0;
    const composed = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const hasLED = ledOverlay[y]?.[x] || false;
            const contributionValue = contributionGrid[y]?.[x] || 0;
            // LED overrides contribution
            if (hasLED) {
                row.push('led');
            }
            else {
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
function alignLED(led, targetWidth, targetHeight, verticalAlign = 'center') {
    const ledHeight = led.length;
    const ledWidth = led[0]?.length || 0;
    const aligned = [];
    // Calculate vertical offset
    let yOffset = 0;
    if (verticalAlign === 'center') {
        yOffset = Math.floor((targetHeight - ledHeight) / 2);
    }
    else if (verticalAlign === 'bottom') {
        yOffset = targetHeight - ledHeight;
    }
    for (let y = 0; y < targetHeight; y++) {
        const row = [];
        for (let x = 0; x < targetWidth; x++) {
            const sourceY = y - yOffset;
            const sourceX = x;
            if (sourceY >= 0 &&
                sourceY < ledHeight &&
                sourceX >= 0 &&
                sourceX < ledWidth) {
                row.push(led[sourceY][sourceX]);
            }
            else {
                row.push(false);
            }
        }
        aligned.push(row);
    }
    return aligned;
}
//# sourceMappingURL=compose.js.map