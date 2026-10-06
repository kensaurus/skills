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
| `grill` `build` `audit` `ship` | `<view>-dark.png` | 1200×700 |
| `og` | `assets/og.png` (copied to `site/`) | 1200×630 |
| `logo` `logo-light` `logo-dark` | `assets/logo*.png`, `assets/logo.svg` | 1024×1024 |
| `favicon` | `assets/favicon.png` (copied to `site/`) | 64×64 |

The system: a hand-built pixel kensaurus (one character per pixel in `showcase.html`), Bricolage Grotesque for display text, Press Start 2P for labels, JetBrains Mono for code, lime / yellow / coral on ink or paper, 3px borders, hard offset shadows. No gradients, no glass, no pill buttons.

Counts in the hero and OG image come from `package.json`'s description, so run `npm run fix:skills` before rendering. Text inside the images is sized for the npm column, which shows the hero at about half size. Do not commit `.playwright-mcp/` scratch.
