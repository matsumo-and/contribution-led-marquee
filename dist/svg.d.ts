/**
 * Generates SVG with contribution graph and scrolling LED text
 */
import { CellValue } from './compose';
export interface SVGOptions {
    cellSize?: number;
    cellGap?: number;
    scrollSpeed?: number;
    initialDelay?: number;
    blackDuration?: number;
    showContributions?: boolean;
}
/**
 * Generates GitHub contribution graph SVG
 */
export declare function generateContributionSVG(contributionGrid: number[][], options?: SVGOptions): string;
/**
 * Generates SVG with scrolling LED text overlay
 * Text scrolls one column at a time (discrete animation)
 * After one cycle, returns to contribution graph and loops
 */
export declare function generateMarqueeSVG(contributionGrid: number[][], ledText: number[][], options?: SVGOptions): string;
/**
 * Generates static composed SVG (no animation)
 */
export declare function generateStaticSVG(composedGrid: CellValue[][], options?: SVGOptions): string;
//# sourceMappingURL=svg.d.ts.map