# Git Marquee ⚡

A GitHub Action that generates a scrolling LED marquee visualization overlaid on your GitHub Contribution Graph.

## Features

- 📊 Fetches your real GitHub contribution data
- 🎬 Animated scrolling text like an LED marquee
- ✨ Smooth transition: shows contribution graph first, then scrolling text
- 🎨 Uses DotGothic16 pixel font for authentic LED look
- 🔄 Seamless infinite scrolling animation

## How it works

1. **Initial Display (3 seconds)**: Shows your GitHub contribution graph
2. **Transition**: Graph fades to background
3. **Marquee Mode**: Text scrolls right-to-left continuously over the contribution graph

## Usage

### Option 1: Use in This Repository (Recommended)

This repository includes a workflow that generates the marquee automatically.

1. **Edit the workflow** (`.github/workflows/marquee.yml`) to customize your text
2. **Enable GitHub Actions** in repository settings
3. **Trigger manually** or wait for scheduled run

The workflow will:
- Fetch your contribution data
- Generate the marquee SVG
- Commit the result to your repository

### Option 2: Use as a Reusable Action

To use this action in another repository, create `.github/workflows/marquee.yml`:

```yaml
name: Generate Git Marquee

on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight
  workflow_dispatch: # Manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate Marquee
        uses: your-username/git-marquee@v1
        with:
          github_user_name: ${{ github.repository_owner }}
          text: 'HELLO WORLD'
          output_path: 'dist/marquee.svg'

      - name: Commit and push
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add dist/marquee.svg
          git commit -m "Update marquee" || exit 0
          git push
```

### Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run test (generates SVG locally)
npm run test

# Check output
open dist/marquee.svg
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `github_user_name` | Yes | - | GitHub username to fetch contributions for |
| `text` | Yes | - | Text to display in the LED marquee |
| `output_path` | No | `dist/marquee.svg` | Path where the SVG file will be saved |

## Outputs

| Output | Description |
|--------|-------------|
| `svg_path` | Path to the generated SVG file |

## Example

Embed in your README:

```markdown
![Git Marquee](./dist/marquee.svg)
```

## Customization

You can customize the appearance by modifying `src/svg.ts`:

- `cellSize`: Size of each contribution square (default: 10)
- `cellGap`: Gap between squares (default: 2)
- `scrollSpeed`: Pixels per second (default: 30)
- `initialDelay`: Seconds before text appears (default: 3)

## Font

Uses [DotGothic16](https://fonts.google.com/specimen/DotGothic16) from Google Fonts - a pixel-perfect monospace font ideal for LED displays.

## Architecture

```
src/
├── fetch.ts       # Fetches GitHub contribution data
├── parser.ts      # Parses contribution HTML to grid
├── renderText.ts  # Renders text to pixels using canvas
├── led.ts         # Converts pixels to LED boolean array
├── compose.ts     # Composes contribution grid with LED overlay
├── svg.ts         # Generates animated SVG
└── index.ts       # Main entry point
```

## How It Works

### 1. Fetch Contribution Data
Retrieves your GitHub contribution graph from `https://github.com/users/{username}/contributions`

### 2. Text Rendering
Uses node-canvas with DotGothic16 font to render text as pixel data

### 3. LED Conversion
Converts pixel data to boolean array (on/off for each LED)

### 4. Composition
Overlays LED text on contribution graph with proper alignment

### 5. SVG Generation
Creates animated SVG with:
- Static contribution graph layer (fades out after 3s)
- Scrolling LED text layer (fades in and scrolls)
- Seamless looping animation

## License

MIT

## Credits

Built with:
- [node-canvas](https://github.com/Automattic/node-canvas) for text rendering
- [DotGothic16](https://fonts.google.com/specimen/DotGothic16) font
- GitHub Contribution Graph API
