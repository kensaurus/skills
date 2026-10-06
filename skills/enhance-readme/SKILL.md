---
name: enhance-readme
description: >
  Enhance an existing README: theme-aware hero, feature tour, screenshots or
  GIF, accurate badges, synced content. Use when "enhance README", "make
  README prettier", "add screenshots", or "showcase the app". Prose only →
  docs-writer.
license: MIT
---

> Surface router: `/uiux`. You are here: `enhance-readme`. Native iOS/Android (SwiftUI / Compose, no web layer) is out of scope — use Apple HIG / Material directly.

# Enhance README

**Degree of freedom: MIXED.** Caption and tour selection `[HIGH freedom]`; capture, generator, gitignore, Camo-safe names `[LOW freedom — run exactly]`.

Add a theme-aware hero image and a tour grid to a project's README so the repo advertises itself visually instead of being a wall of text.

## How to reason

1. **Detect** — live URL vs local, theme toggle, login
2. **Capture** — dark and light at 1600×1000; promote to `docs/screenshots/`
3. **Weave** — name + tagline + `<picture>` hero + tour under badges
4. **Sync** — badges match `package.json`; first screen answers what/why/who

## Worked example

> **Detect:** live Vercel URL; `.dark` class; README is badges + install only.
> **Capture:** dashboard + three feature pages, both themes; files < 5 MB.
> **Weave:** theme-aware hero; 4-cell tour with concrete captions; skip GIF.
> **Sync:** React/Vite badges match lockfile; `.playwright-mcp/` gitignored.

## Self-critique before reporting

- **Both themes** — GitHub dark and light both readable
- **Camo-safe** — overwritten images were renamed, not just replaced
- **Artifact hygiene** — keepers in `docs/screenshots/`; scratch never committed
- **Right owner** — content-only docs → `docs-writer`; drift plan → `plan-docs-sync`

## The words matter as much as the pixels

Write captions, alt text, and the package description in plain language: one idea per sentence, active voice, at most 25 words, no figures of speech. The rules and a prose-lint recipe are in `../docs-writer/references/plain-language-ste.md`.

A README that has no screenshot to take (a CLI, a skills pack, a library) still gets a hero: build it as code. The kit in [references/brand-hero-kit.md](references/brand-hero-kit.md) covers the pixel mascot, the tile grid, type and color rules, npm and GitHub rendering limits, and `scripts/render-views.mjs`, which renders any HTML view to PNG.

A gorgeous hero on top of a jargon wall still loses the reader. This skill owns the **visual** layer; for the **copy**, follow `docs-writer`'s core principle — *write for the reader's mental model first* (answer **what / why / who / how** in plain language before reference detail). Don't ship a beautiful README whose first paragraph a newcomer can't parse.

The finished top of the README should read, in this order:

1. **Name + one plain-English tagline** — what it does, no jargon
2. **Visual hero** (`<picture>`, theme-aware) — the screenshot or GIF
3. **Why it exists / who it's for** — one line each, so a wrong-fit visitor leaves early
4. **Shortest path to a first win** — install → one command → result
5. Reference depth (features, config, API) below the fold

If the project is novel or leans on 3+ domain terms, add `docs-writer`'s plain-language **building-blocks glossary** just under the hero — it's the decoder ring for everything below.

## Rules

> **Use the live production URL when one exists.** It shows real data, no dev banners, and matches what visitors will see if they click through.

> **Always capture both dark AND light mode** for any image that goes in the hero. GitHub renders the README in both themes; broken contrast on one of them looks worse than no image at all.

> **Save to `docs/screenshots/` at the repo root.** Never commit `.playwright-mcp/` artifacts (yml snapshots, console logs) — add it to `.gitignore`.

> **Hard limit: 10 MB per image, 25 MB per file in markdown.** Soft target: under 5 MB per image. PNGs at 1600x1000 viewport land around 200–500 KB each.

> **Use `<picture>` with `prefers-color-scheme` media queries** for theme-aware swap — github.com renders the `<source>` that matches the viewer's theme.

---

## Workflow Checklist

Copy and track:

```
- [ ] Step 1: Detect demo URL, login flow, theme toggle mechanism
- [ ] Step 2: Capture screenshots (playwright-cli, 1600x1000 viewport)
- [ ] Step 3: Generate hero + tour markdown (run scripts/generate-readme-blocks.mjs)
- [ ] Step 4: Refine captions and weave into README
- [ ] Step 5: Update tech badges + Tech Stack table to current versions
- [ ] Step 6: Add .playwright-mcp/ to .gitignore and commit (push only when asked)
- [ ] Step 7 (optional): Record guided-tour GIF (run scripts/record-readme-tour.mjs)
```

---

## Step 1: Detect Demo URL and Theme Mechanism  [HIGH freedom]

Read the existing README for a "Demo" or "Live demo" link. Fall back to `package.json` `homepage` field, then `vercel.json` / `.github/workflows/deploy.yml` for hosting hints.

If no live URL exists, start the local dev server (`npm run dev` / `npm start` / equivalent) and use that. Note the port and base path.

Look for theme switching:

- Check `tailwind.config.*` and CSS files for `.dark` class usage → toggle with `document.documentElement.classList.toggle('dark')`
- Check for `[data-theme="dark"]` → toggle with `document.documentElement.dataset.theme = 'light'`
- Check `localStorage` keys: `theme`, `color-mode`, `prefers-color-scheme`

Confirm credentials if the app has auth. Most demos use `admin/demo`, `test/test`, or there's a hint on the login page.

---

## Step 2: Capture Screenshots  [LOW freedom — run exactly]

Use playwright-cli. **Always read the `protocol-browser-anti-stall` skill first** if the user has it — never block the browser for more than 3 seconds at a time.

Open at hero quality (`open --headed`, `resize 1600 1000`), log in, capture each page in dark mode, toggle light mode by direct DOM manipulation (`classList` / `data-theme` / `localStorage` key as detected in Step 1), then promote the keepers from `.playwright-mcp/` to `docs/screenshots/`. Aim for **1 hero page + 3 tour pages = 4 cells**.
Name files kebab-case with a `-dark` / `-light` suffix; the generator picks the hero by keyword (`hero`, `dashboard`, `home`, `landing`, `overview`, `main`) or `--hero=<basename>`.
Commands 2a–2e and the naming example: [references/capture.md](references/capture.md) §Step 2.

---

## Step 3: Generate Hero + Tour Markdown  [LOW freedom — run exactly]

Run from the repo root:

```bash
node <skill-dir>/scripts/generate-readme-blocks.mjs --demo-url=https://your-live-demo.example.com/
```

`<skill-dir>` is the folder this SKILL.md was installed to (`~/.cursor/skills/enhance-readme` in Cursor, `~/.claude/skills/enhance-readme` or the plugin's skills folder in Claude Code).

Optional flags:

- `--dir=docs/screenshots` (default)
- `--hero=dashboard` (force a specific basename as hero, no `-dark` suffix)

The script:

1. Lists all PNG/JPEG/WebP/GIF in `docs/screenshots/`
2. Pairs each `*-dark` with its `*-light` sibling
3. Picks the hero by keyword priority
4. Validates file sizes (hard fail at 10 MB, warns at 5 MB)
5. Prints two ready-to-paste blocks: HERO + TOUR
6. Reports orphans, half-pairs, and a size summary

If any file exceeds 10 MB the script exits non-zero — compress with `oxipng -o4 docs/screenshots/*.png` (lossless) or re-capture at lower quality.

---

## Step 4: Weave Blocks Into README  [HIGH freedom]

Paste the HERO block **directly under the badges**, replacing any existing tagline, and add one line each for *why it exists* and *who it's for* under the hero. Paste the TOUR block **right after the hero**, before the existing Demo / Features / Getting Started sections.
Replace each generated `TODO short caption` with a one-line technical description naming a specific library or pattern visible in the screenshot — natural, slightly playful, no marketing fluff.
Placement markdown, good vs bad caption patterns, the GitHub rendering reference, and the inline backup templates (hero, tour GIF, 2x2 tour grid): [references/weave-templates.md](references/weave-templates.md).

---

## Step 5: Update Tech Badges + Tech Stack  [LOW freedom — match package.json]

While editing the README, sync the badges and Tech Stack table to actual `package.json` versions. Common drift:

- badges still showing the major the project started on (React, TypeScript, Vite, the Node prerequisite) — read the current majors from `package.json` and the lockfile, never from memory

Use shields.io URLs:

```markdown
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
```

---

## Step 6: Gitignore + Commit  [LOW freedom — run exactly]

Add to `.gitignore` (create if missing):

```
# playwright-cli browser session artifacts
.playwright-mcp/
.playwright-cli/
```

Commit with a conventional-commits message:

```
docs(readme): hero showcase + tour grid with theme-aware screenshots

- Add `<picture>` hero auto-swapping between dark/light, linked to live demo
- Add N-cell Tour grid with one-line captions
- Save M screenshots to docs/screenshots/ (~X MB total)
- Update tech badges to current versions
- Ignore .playwright-mcp/ session artifacts
```

The README change does not require a redeploy of the app (it's repo-only). Nothing to verify beyond the GitHub render.

---

## Step 7 (Optional): Record an Animated Guided-Tour GIF  [HIGH freedom]

A short autoplaying GIF placed above the static screenshots gives a clearer feel for the app than any single frame. GitHub renders inline GIFs up to 10 MB on every README, no `<video>` workarounds needed.

The companion script handles everything: launches a headless Chromium, dismisses onboarding overlays, optionally logs in, runs an editorial 4-stop scroll tour, and converts the recording to a palette-dithered GIF.

Run `node <skill-dir>/scripts/record-readme-tour.mjs --url=… --out=docs/screenshots/tour.gif`; combine `--user`/`--pass`, `--routes` (relative paths), and `--storage` for authenticated multi-page tours; if the 10 MB hard cap fails, lower `--width` first, then `--fps`.
Embed the GIF **directly under the static hero `<picture>` block** (tagline → animated tour → static hero → tour grid) and commit it in its own commit.
Flags, size budget table, embed order, and the GIF commit message (7a–7d): [references/capture.md](references/capture.md) §Step 7.

---

## Common Gotchas

SPA deep links on CloudFront, empty first-render charts, hidden theme toggles, filename collisions, forward slashes in image paths, `file://` previews, persisted sessions, and GitHub Camo caching by URL hash (rename an overwritten image, never just replace it): [references/capture.md](references/capture.md) §Common gotchas.

---

## When to Stop

The skill is done when:

- The README's first screen answers **what / why / who** in plain language — not just a pretty picture (see `docs-writer`)
- A theme-aware hero renders at the top of the README on github.com in both dark and light viewer themes
- The Tour grid has at least 2 cells (ideally 4) with concrete captions
- All screenshots are committed under `docs/screenshots/`, total < 10 MB
- `.playwright-mcp/` is in `.gitignore`
- Tech badges + Tech Stack table reflect actual `package.json` versions
- One conventional-commits commit ships the README, screenshots, and badge sync; the optional GIF goes in its own commit (7d)
- **Optional**: an animated `tour.gif` lives at `docs/screenshots/tour.gif`, autoplays under the static hero, and weighs less than 8 MB

## Further reading

- [Capture commands, GIF recorder, common gotchas](references/capture.md)
- [Weave placement, GitHub rendering reference, backup templates](references/weave-templates.md)
- [Brand hero kit for repos with nothing to screenshot](references/brand-hero-kit.md)
