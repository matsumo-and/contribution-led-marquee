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
  // Extract all td elements with contribution data using regex
  const tdRegex = /<td[^>]*data-date[^>]*>/g;
  const tds = html.match(tdRegex) || [];

  const cells: ContributionCell[] = [];

  for (const td of tds) {
    // Extract data-date attribute
    const dateMatch = td.match(/data-date="([^"]+)"/);
    // Extract data-level attribute (GitHub uses 0-4 levels)
    const levelMatch = td.match(/data-level="(\d+)"/);
    // Extract data-ix attribute for week number (column)
    const ixMatch = td.match(/data-ix="(\d+)"/);
    // Extract id to get the row number (day of week)
    const idMatch = td.match(/id="contribution-day-component-(\d+)-\d+"/);

    if (dateMatch && levelMatch && ixMatch && idMatch) {
      const x = parseInt(ixMatch[1]);  // Week number (column)
      const y = parseInt(idMatch[1]);  // Day of week (row: 0=Sun, 1=Mon, ...)

      cells.push({
        date: dateMatch[1],
        count: parseInt(levelMatch[1]), // Use level as count approximation
        x: x,
        y: y
      });
    }
  }

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