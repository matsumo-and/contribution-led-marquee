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

export function parseContributions(html: string): ContributionGrid {
  // Extract all rect elements using regex
  const rectRegex = /<rect[^>]*>/g;
  const rects = html.match(rectRegex) || [];

  const cells: ContributionCell[] = [];

  for (const rect of rects) {
    // Extract data-count attribute
    const countMatch = rect.match(/data-count="(\d+)"/);
    // Extract data-date attribute
    const dateMatch = rect.match(/data-date="([^"]+)"/);
    // Extract x and y attributes
    const xMatch = rect.match(/x="(-?\d+)"/);
    const yMatch = rect.match(/y="(-?\d+)"/);

    if (countMatch && dateMatch && xMatch && yMatch) {
      cells.push({
        date: dateMatch[1],
        count: parseInt(countMatch[1]),
        x: parseInt(xMatch[1]),
        y: parseInt(yMatch[1])
      });
    }
  }

  // Sort cells and determine grid dimensions
  const sortedCells = cells.sort((a, b) => {
    if (a.x === b.x) return a.y - b.y;
    return a.x - b.x;
  });

  // Calculate grid dimensions
  const uniqueX = [...new Set(cells.map(c => c.x))].sort((a, b) => a - b);
  const uniqueY = [...new Set(cells.map(c => c.y))].sort((a, b) => a - b);

  const width = uniqueX.length;
  const height = uniqueY.length;

  // Create 2D grid array
  const grid: ContributionCell[][] = Array(height).fill(null).map(() => Array(width).fill(null));

  // Map x,y coordinates to grid indices
  const xIndexMap = new Map(uniqueX.map((x, i) => [x, i]));
  const yIndexMap = new Map(uniqueY.map((y, i) => [y, i]));

  // Fill grid
  for (const cell of cells) {
    const xIdx = xIndexMap.get(cell.x);
    const yIdx = yIndexMap.get(cell.y);
    if (xIdx !== undefined && yIdx !== undefined) {
      grid[yIdx][xIdx] = cell;
    }
  }

  return { cells: grid, width, height };
}