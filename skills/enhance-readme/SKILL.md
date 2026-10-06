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

### 2a. Open the browser at hero quality

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=readme open --headed "<demo-url>"
$PW -s=readme resize 1600 1000
```

### 2b. Log in, then capture each page in dark mode

```bash
sleep 2
$PW -s=readme snapshot                       # find login refs
$PW -s=readme fill <username-ref> "<user>"
$PW -s=readme fill <password-ref> "<pass>"
$PW -s=readme click <login-button-ref>
sleep 2
$PW -s=readme goto "<demo-url>/<page>"
$PW -s=readme screenshot --filename ".playwright-mcp/<page>-dark.png"
```

Repeat for each feature page you want in the tour (analytics, settings, list views, etc.). Aim for **1 hero page + 3 tour pages = 4 cells**.

### 2c. Toggle to light mode via direct DOM manipulation (faster than UI hunting)

```bash
$PW -s=readme eval '() => { document.documentElement.classList.remove("dark"); document.documentElement.classList.add("light"); localStorage.setItem("theme", "light"); return "ok"; }'
sleep 2
$PW -s=readme screenshot --filename ".playwright-mcp/<page>-light.png"
```

Adjust the JS if the app uses `data-theme` or a different localStorage key (detected in Step 1).

### 2d. Move screenshots to `docs/screenshots/`

Screenshots land in `.playwright-mcp/` (gitignored scratch). Promote the keepers:

```bash
mkdir -p docs/screenshots
mv .playwright-mcp/*-dark.png .playwright-mcp/*-light.png docs/screenshots/
```

### 2e. Naming convention

Use kebab-case with a `-dark` / `-light` suffix:

```
docs/screenshots/
 dashboard-dark.png # hero (auto-detected by name)
 dashboard-light.png
 analytics-dark.png
 analytics-light.png # optional: only needed if used in hero
 projects-dark.png
 ai-palette-dark.png # tour-only cells need just the dark variant
```

The generator script picks the hero by looking for these keywords (in order): `hero`, `dashboard`, `home`, `landing`, `overview`, `main`. Override with `--hero=<basename>` if needed.

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

### 4a. Hero placement

Paste the HERO block **directly under the badges**, replacing any existing tagline:

```markdown
<div align="center">

# ProjectName

![badges...]

**A one-line tagline that nails what this is — in plain English, no jargon.**
A second-line elaboration with the most distinctive features (3–5 keywords).

[HERO BLOCK FROM SCRIPT GOES HERE]

<!-- Under the hero, add one line each (see docs-writer): -->
<!-- **Why it exists** — the problem it solves. **Who it's for** — audience + stack. -->

</div>

---
```

### 4b. Tour placement

Paste the TOUR block **right after the hero**, before the existing Demo / Features / Getting Started sections:

```markdown
[TOUR BLOCK FROM SCRIPT GOES HERE]

---

## Demo
...
```

### 4c. Refine the captions

The script generates `<b>Page Name</b> · TODO short caption`. Replace each TODO with a one-line technical description that mentions a specific library or pattern visible in the screenshot. Keep the tone natural and slightly playful — no marketing fluff.

Good caption pattern:

```
<b>Analytics</b> · Recharts v3 with an 8-color OKLCH palette, split-scale YoY
(revenue vs counts), donut hover with center value
```

Bad caption pattern:

```
<b>Analytics</b> · insights to drive your business forward!
```

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

### 7a. Run the recorder

```bash
node <skill-dir>/scripts/record-readme-tour.mjs \
 --url=https://your-live-demo.example.com/ \
 --out=docs/screenshots/tour.gif
```

Optional flags:

- `--width=1280` (default) — final GIF width in pixels
- `--height=800` (default) — recording viewport height
- `--duration=9000` (default) — milliseconds of usable tour after dismiss/login is trimmed
- `--fps=15` (default) — frame rate; lower = smaller file
- `--user=admin --pass=demo` — fills any visible email/text + password input and submits
- `--routes=.,reports,fixes,judge` — walk through a sequence of pages instead of scrolling one. Comma-separated paths, resolved against `--url`. The script clicks an in-page link if one matches the target path (smooth SPA transition, no white flash) and falls back to `page.goto()` only when no link exists. Time is split equally across stops.
- `--storage='{"app:tour-completed":"true","app:mode":"advanced"}'` — JSON object of localStorage entries seeded BEFORE first paint via Playwright's `addInitScript`. Use to skip first-run tours, force a specific theme/density/admin-mode, or hide "what's new" popovers — anything the app gates on a localStorage key. Way more reliable than trying to click-dismiss a coach-mark mid-recording.
- `--keep-webm` — also writes `tour.webm` next to `tour.gif` (useful if you also want a `<video>`-quality copy to attach to a PR)

> **Authenticated, multi-page tours**: combine `--user`/`--pass` with `--routes` and `--storage` for a "logged in, walking through the app" tour. Pre-seed `localStorage` with whatever flags the app uses to skip onboarding (`tour-completed`, `welcomed`, etc.) so the GIF doesn't open with a coach-mark covering everything. Use **relative paths** in `--routes` (`reports` not `/reports`) when the app has a base path (e.g. GitHub Pages projects served at `/repo-name/`) — absolute paths bypass the base and 404.

### 7b. Recommended size budget

| Output target | Width | FPS | Typical size for 9s | Use when |
|---------------|-------|-----|---------------------|----------|
| README inline (default) | 800 | 15 | 4–7 MB | Most projects — fits under GitHub's 10 MB inline cap with headroom |
| Hero showcase | 1280 | 15 | 7–10 MB | Visually rich apps where detail matters more than file size |
| Mobile / docs site embed | 600 | 12 | 2–4 MB | When the GIF will be embedded in a docs site that loads it on every page |

A 9 s 1280×800 raw `.webm` is ~150 KB; the same as an unoptimised GIF would be ~30 MB. The two-pass `palettegen` + `paletteuse=dither=bayer:bayer_scale=5` recipe in the script is what makes the GIF land in the single-digit MB range without obvious banding. If the script fails the 10 MB hard cap, lower `--width` first (it has the strongest effect), then `--fps`.

### 7c. Embed the GIF in the README

Paste the GIF block **directly under the static hero `<picture>` block** so the page reads:

1. Tagline
2. Animated tour (the new GIF)
3. Static dark/light hero (still good for instant load on slow connections)
4. Tour grid

See the "Tour GIF" template in the Output Templates section below.

### 7d. Commit the GIF separately

GIFs are large binary blobs — commit them in their own commit so reviewers don't have to load 5 MB to look at a one-line code change later:

```
docs(readme): animated guided-tour GIF (~5 MB, 9s @ 800px)

- Add docs/screenshots/tour.gif: 4-stop scroll tour of the live demo
- Embed under the static hero so first-paint stays fast on slow connections
- Recorded via ~/.cursor/skills/enhance-readme/scripts/record-readme-tour.mjs
```

---

## GitHub README Rendering Reference

What works inside markdown on github.com:

| Element | Status | Notes |
|---------|--------|-------|
| `<picture>` + `<source media="(prefers-color-scheme: dark)">` | Yes | Auto-swaps with viewer's GitHub theme |
| `<table>`, `<tr>`, `<td width="50%" align="center">` | Yes | Use for grid layouts |
| `<sub>`, `<sup>`, `<details>`, `<summary>` | Yes | For captions and collapsibles |
| `<a href>` wrapping `<img>` | Yes | Click image → open URL |
| `<div align="center">` | Yes | The only reliable centering method |
| `<style>`, `style=""` attributes | **No** | Stripped by GitHub's sanitizer |
| `class=""` for custom CSS | **No** | Stripped |
| GIF up to 10 MB | Yes | Autoplays on loop, no pause control. Best for guided tours. |
| `<img src="docs/screenshots/tour.gif">` | Yes | Same as `<img>` for any image — relative path resolves fine |
| `<video src="...">` from a relative repo path | **No** | GitHub's sanitizer strips `<video>` from rendered markdown |
| MP4/WebM uploaded to issues/PRs | Yes (linked) | The upload returns a `user-images.githubusercontent.com` URL that DOES render — paste that URL inside `<video>` or `<img>`. Workaround for >10 MB tours. |
| Relative image paths (`docs/screenshots/...`) | Yes | Resolved against the README's location |

GitHub content width is ~870 px for desktop. Images at `width="100%"` look good from ~1024 px source up to 1600 px.

---

## Common Gotchas

1. **SPA deep links 404 on CloudFront** — if `/dashboard` returns 404 on direct navigation, go to root first, then click the in-app navigation. CloudFront serves the SPA's `index.html` only for the configured paths.

2. **First navigation may show empty charts** — Recharts and similar libs render after data fetches resolve. Wait 2–3 seconds after navigation, then take the screenshot. Re-shoot if the snapshot shows a chart placeholder instead of bars/lines.

3. **Theme toggle button is hidden in a settings panel** — skip the UI hunt. `eval` with `document.documentElement.classList.toggle('dark')` is one tool call versus four.

4. **Screenshot filename collisions** — Playwright overwrites silently. After each capture, immediately move the file to `docs/screenshots/` with the final name.

5. **Forward slashes in markdown image paths** — even on Windows, `<img src="docs/screenshots/foo.png">` not `docs\screenshots\foo.png`. The generator script handles this.

6. **Local file:// previews can't load adjacent images** due to cross-origin restrictions. To preview the hero locally, run `vite preview` / `npx serve` and visit via `http://localhost:...`.

7. **First-time login may persist a session** — if Playwright shows the dashboard already on `goto` to the login page, the session was preserved from a prior run. Use it; no need to re-log-in.

8. **GitHub Camo caches images by URL hash, not by content** — `camo.githubusercontent.com` (the proxy that serves every README image) keys its cache off the source URL. **Overwriting an existing file with new bytes will NOT update the rendered image on github.com** — Camo will keep serving the cached pre-overwrite version for hours, sometimes days. If you re-record `tour.gif` and the github.com README still shows the old one, **rename the file** (e.g. `tour.gif` → `tour-v2.gif` or something self-documenting like `tour-pdca-loop.gif`) and update the `<img src>` — the new URL hashes fresh and Camo refetches immediately. This applies to ALL images in the README, not just GIFs. The raw.githubusercontent.com endpoint is NOT cached this way, so always verify file contents there before assuming the file is wrong.

---

## Output Templates (Inline Backups)

If the script is unavailable, here are the raw templates.

### Hero block

```markdown
<div align="center">

# ProjectName

![badges...]

**Tagline.**
Subtitle line.

<a href="LIVE_URL" title="Open the live demo">
 <picture>
 <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/HERO-dark.png">
 <source media="(prefers-color-scheme: light)" srcset="docs/screenshots/HERO-light.png">
 <img alt="Project hero — what it shows" src="docs/screenshots/HERO-dark.png" width="100%">
 </picture>
</a>

<sub>↑ click to open the live demo · the image swaps with your system theme</sub>

</div>
```

### Tour GIF (animated, autoplays inline on github.com)

```markdown
<div align="center">

<a href="LIVE_URL" title="Open the live demo">
 <img alt="Animated guided tour of the app" src="docs/screenshots/tour.gif" width="100%">
</a>

<sub>↑ a 9-second guided tour · click to open the live demo</sub>

</div>
```

### Tour grid (2x2)

```markdown
## Tour

A quick look at the rooms inside. Click any panel to land on it in the live demo.

<table>
 <tr>
 <td width="50%" align="center">
 <a href="LIVE_URL/page-1">
 <img alt="Page 1 alt" src="docs/screenshots/page-1-dark.png" width="100%">
 </a>
 <br>
 <sub><b>Page 1</b> · concrete technical detail with library name</sub>
 </td>
 <td width="50%" align="center">
 <a href="LIVE_URL/page-2">
 <img alt="Page 2 alt" src="docs/screenshots/page-2-dark.png" width="100%">
 </a>
 <br>
 <sub><b>Page 2</b> · concrete technical detail with library name</sub>
 </td>
 </tr>
 <tr>
 <td width="50%" align="center">
 <a href="LIVE_URL/page-3">
 <img alt="Page 3 alt" src="docs/screenshots/page-3-dark.png" width="100%">
 </a>
 <br>
 <sub><b>Page 3</b> · concrete technical detail with library name</sub>
 </td>
 <td width="50%" align="center">
 <a href="LIVE_URL">
 <img alt="Light mode showcase" src="docs/screenshots/HERO-light.png" width="100%">
 </a>
 <br>
 <sub><b>Light mode</b> · how the app looks in daytime</sub>
 </td>
 </tr>
</table>
```

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
