# Cat RPG GitHub Action

Generate a pixel RPG visualization of your GitHub contributions with a cat character walking across the map!

## Features

- Converts GitHub contribution graph into an RPG-style tile map
- Animated cat character that walks toward treasure tiles
- Different tile types based on contribution count:
  - 0 contributions → Grass
  - 1 contribution → Flower
  - 2 contributions → Rock
  - 3 contributions → Tree
  - 4+ contributions → Treasure
- A* pathfinding for intelligent cat movement
- Paw prints showing the cat's trail
- Pure SVG output (no external images)

## Usage

### In a GitHub Workflow

Create `.github/workflows/cat-rpg.yml`:

```yaml
name: Generate Cat RPG Visualization

on:
  schedule:
    # Run daily at 00:00 UTC
    - cron: '0 0 * * *'
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate Cat RPG SVG
        uses: yourusername/cat-rpg-action@v1
        with:
          github_user_name: ${{ github.repository_owner }}
          output_path: 'cat-rpg.svg'

      - name: Commit SVG
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add cat-rpg.svg
          git commit -m "Update Cat RPG visualization" || echo "No changes"
          git push
```

### In Your Profile README

Add to your profile README.md:

```markdown
## My GitHub Journey 🐱

![Cat RPG](./cat-rpg.svg)
```

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
npm run package
```

### Test Locally

```bash
# Set required environment variables
export INPUT_GITHUB_USER_NAME="your-username"

# Run the action
npm run dev
```

## Project Structure

```
cat-rpg-action/
├── src/
│   ├── fetch.ts       # Fetches GitHub contribution data
│   ├── parser.ts      # Parses HTML to extract contribution grid
│   ├── map.ts         # Converts contributions to tile types
│   ├── pathfinding.ts # A* algorithm for cat movement
│   ├── render.ts      # SVG generation with sprites
│   └── index.ts       # Main entry point
├── dist/              # Compiled JavaScript
├── action.yml         # GitHub Action metadata
├── package.json       # Node dependencies
└── tsconfig.json      # TypeScript config
```

## Customization

### Tile Mapping

Edit `src/map.ts` to change how contributions map to tiles:

```typescript
function getTileType(contributions: number): TileType {
  if (contributions === 0) return TileType.GRASS;
  if (contributions === 1) return TileType.FLOWER;
  if (contributions === 2) return TileType.ROCK;
  if (contributions === 3) return TileType.TREE;
  return TileType.TREASURE;
}
```

### Cat Sprite

Modify the cat sprite in `src/render.ts` by editing the SVG rectangles in the `getSpriteDefs()` function.

### Animation Speed

Change `ANIMATION_DURATION` in `src/render.ts` to adjust the cat's walking speed.

## Roadmap

- [ ] Multiple cats for collaborative projects
- [ ] Different themes (desert, snow, space)
- [ ] Random wandering mode
- [ ] Collectible items along the path
- [ ] Day/night cycle based on contribution times

## License

MIT