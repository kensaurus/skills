# Brand hero kit: a README hero, OG image, and logo built as code

For a project with no screen to screenshot (a CLI, a skills pack, a library), the
hero is an illustration you render from HTML. Build it as code so it is
deterministic, re-renderable when counts change, and free of the generic look
that image generators produce.

Worked example: `kensaurus/skills` renders its hero, four tour cards, OG image,
logo, and favicon from one file, `docs/screenshots/src/showcase.html`, with
`scripts/render-brand-assets.mjs`. Copy that pattern.

## The system (pick once, apply everywhere)

| Layer | Choice | Why |
|---|---|---|
| Mascot or mark | Hand-built pixel art: one character per pixel in a string array, rendered as SVG `<rect>`s with `shape-rendering: crispEdges` | Deterministic, scalable, on-brand, impossible to mistake for stock AI art |
| Display type | One characterful variable face (Bricolage Grotesque, Instrument Serif, Fraunces). Never Inter, Roboto, Arial, system-ui, Space Grotesk | The named defaults read as template |
| Labels | A pixel face (Press Start 2P, Silkscreen) at 14 to 16px, uppercase, sparingly | Ties the type to the mascot |
| Code | JetBrains Mono or IBM Plex Mono | Readable at half size |
| Color | Ink + paper + three saturated accents (lime, yellow, coral). No purple-on-white, no gradients, no cream background | Bold and legible on both GitHub themes and the white npm page |
| Surfaces | 3px solid borders, hard offset shadows (10px 10px 0), square corners | Depth without glass or blur |
| Layout | Top bar (wordmark + one fact label), headline with one highlighted word, mascot right, a three-tile flow at the bottom | Reads as a diagram, not a screenshot |

## Rendering limits that shape the design

- **npm shows the README at about 760px wide.** A 1600px hero renders at half
  size. Body text inside the image must be 24px or larger at 1600px; labels 14px
  or larger. The tour grid shows cards at about 400px, so cards carry fewer,
  bigger words (44px titles, 30px lines).
- **npm strips `<picture>` and `<source>` and keeps the `<img>` fallback.** GitHub
  honors `prefers-color-scheme`. Design the fallback image (usually the dark one)
  to look intentional on a white page: give it its own background and a border.
- **Relative image paths work on GitHub and npm** when the files ship in the
  repo; the OG image must be an absolute `raw.githubusercontent.com` URL.
- **GitHub's social preview is uploaded in repo settings**, not read from the
  repo. Render `og.png` at 1200×630 and upload it once.
- **Alt text is read aloud and indexed.** State the subject, the steps, and the
  result in plain language (`../../docs-writer/references/plain-language-ste.md`).

## Build steps

1. Write `showcase.html` with the CSS tokens above, a `?view=` switch, and a
   `?theme=` switch. Size `html, body` per view (hero 1600×900, card 1200×700,
   og 1200×630, logo 1024, favicon 64).
2. Draw the mascot as a string array. Start from a 24×22 grid. Use four or five
   colors. Add one shade color along the underside for depth. Make a head-only
   map for the logo.
3. Render with `scripts/render-views.mjs` (this skill) or a project script:
   wait for `document.fonts.ready`, clip to the view size, `deviceScaleFactor: 1`.
4. Review every PNG at the size it will display. Fix text that is too small
   before anything else.
5. Pull counts from `package.json` so the images never go stale, and document
   the render command in `docs/screenshots/README.md`.
6. Commit the PNGs. Keep `.playwright-mcp/` out of git.

## Anti-slop check before commit

- No gradient, blur, or glass anywhere.
- No Inter, no purple, no cream, no pill buttons, no "01 / 02 / 03" labels.
- Every line of text is a fact about the product or an action the reader takes.
- The mascot is drawn, not generated. If an image generator was used, say so in
  the commit and keep the prompt in the repo.
- The dark and light variants were both viewed, and the fallback was viewed on
  a white page.

## `scripts/render-views.mjs`

```bash
node <skill-dir>/scripts/render-views.mjs path/to/showcase.html out/hero-dark.png 1600 900 "view=hero&theme=dark"
```

The script launches Chromium, loads the file URL with the query string, waits
for fonts, and writes the PNG. Pass a different query per view. It needs the
`playwright` package and a Chromium build (`npx playwright install chromium`).
