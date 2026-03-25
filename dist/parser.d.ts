/**
 * Parses GitHub contribution HTML to extract contribution data
 */
export interface ContributionCell {
    date: string;
    count: number;
    x: number;
    y: number;
}
export interface ContributionGrid {
    cells: ContributionCell[][];
    width: number;
    height: number;
}
export declare function parseContributions(html: string): ContributionGrid;
/**
 * Returns a simple 2D array of contribution counts (0-4)
 * Suitable for LED overlay composition
 */
export declare function getContributionLevels(grid: ContributionGrid): number[][];
//# sourceMappingURL=parser.d.ts.map