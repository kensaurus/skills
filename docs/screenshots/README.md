# README brand images

Hero, tour cards, OG image, logo, and favicon used by the root [README](../../README.md), `site/`, and the npm page.

There is **no hosted app** and no image-generation API. Every image renders from one HTML source, [`src/showcase.html`](src/showcase.html), with Playwright:

```bash
node scripts/render-brand-assets.mjs          # all views
node scripts/render-brand-assets.mjs hero og  # a subset
```

| View | Output | Size |
|---|---|---|
| `hero` (dark, light) | `hero-dark.png`, `hero-light.png` | 1600×900 |
| `ladder` (dark, light) | `ladder-dark.png`, `ladder-light.png` | 1600×760 |
| `architecture` (dark, light) | `architecture-dark.png`, `architecture-light.png` | 1600×760 |
| `pieces` (dark, light) | `pieces-dark.png`, `pieces-light.png` | 1600×420 |
| `icon&name=<glyph>` | `icons/<glyph>.png` (12 section icons) | 96×96 |
| `grill` `build` `audit` `ship` | `<view>-dark.png` | 1200×700 |
| `og` | `assets/og.png` (copied to `site/`) | 1200×630 |
| `logo` `logo-light` `logo-dark` | `assets/logo*.png`, `assets/logo.svg` | 1024×1024 |
| `favicon` | `assets/favicon.png` (copied to `site/`) | 64×64 |

The system: a hand-built pixel kensaurus (one character per pixel in `showcase.html`), Bricolage Grotesque for display text, Press Start 2P for labels, JetBrains Mono for code, lime / yellow / coral on ink or paper, 3px borders, hard offset shadows. No gradients, no glass, no pill buttons.

Counts in the hero and OG image come from `package.json`'s description, so run `npm run fix:skills` before rendering. Text inside the images is sized for the npm column, which shows the hero at about half size. Do not commit `.playwright-mcp/` scratch.

## Captures and the gate diagram

`node scripts/render-walkthrough.mjs` (`npm run brand:walkthrough`) writes these with no browser and no dependency:

| File | What it shows |
|---|---|
| `capture-gate.svg` | The completion gate blocking a stop, then allowing it |
| `capture-kenji.svg` | `/kenji` with no job |
| `capture-profiles.svg` | `--list-profiles` |
| `gate-diagram-en.svg`, `gate-diagram-ja.svg` | The three parts of the gate |

The captures replay real command output. The run date for each is in the script, next to the scene. Lines are wrapped to fit and temp paths are shortened; the one added line is the `agent` line in the gate capture. When the output of a command changes, run the command again and copy the new lines into the scene.

**GIF and PNG copies** exist for sites that do not take SVG (Zenn, note, X). They need a browser and ffmpeg, so they are a maintainer step:

1. `node scripts/render-walkthrough.mjs --frames <dir>` writes one static SVG per step and a `frames.txt` per scene.
2. Screenshot each frame SVG to a PNG of the same name at its own width and height (any headless browser).
3. In each scene folder: `ffmpeg -f concat -safe 0 -i frames.txt -vf "split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=none" -loop 0 capture-<name>.gif`.
4. Copy the GIFs and the two diagram PNGs to `docs/screenshots/` and `site/`.
