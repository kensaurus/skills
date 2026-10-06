# enhance-readme — capture

The playwright-cli screenshot procedure (Step 2), the guided-tour GIF recorder (Step 7), and the capture and rendering gotchas.

## Contents

- Step 2 — Capture screenshots (2a–2e)
- Step 7 — Record an animated guided-tour GIF (7a–7d)
- Common gotchas

## Step 2 — Capture screenshots (2a–2e)

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

## Step 7 — Record an animated guided-tour GIF (7a–7d)

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

## Common gotchas

1. **SPA deep links 404 on CloudFront** — if `/dashboard` returns 404 on direct navigation, go to root first, then click the in-app navigation. CloudFront serves the SPA's `index.html` only for the configured paths.

2. **First navigation may show empty charts** — Recharts and similar libs render after data fetches resolve. Wait 2–3 seconds after navigation, then take the screenshot. Re-shoot if the snapshot shows a chart placeholder instead of bars/lines.

3. **Theme toggle button is hidden in a settings panel** — skip the UI hunt. `eval` with `document.documentElement.classList.toggle('dark')` is one tool call versus four.

4. **Screenshot filename collisions** — Playwright overwrites silently. After each capture, immediately move the file to `docs/screenshots/` with the final name.

5. **Forward slashes in markdown image paths** — even on Windows, `<img src="docs/screenshots/foo.png">` not `docs\screenshots\foo.png`. The generator script handles this.

6. **Local file:// previews can't load adjacent images** due to cross-origin restrictions. To preview the hero locally, run `vite preview` / `npx serve` and visit via `http://localhost:...`.

7. **First-time login may persist a session** — if Playwright shows the dashboard already on `goto` to the login page, the session was preserved from a prior run. Use it; no need to re-log-in.

8. **GitHub Camo caches images by URL hash, not by content** — `camo.githubusercontent.com` (the proxy that serves every README image) keys its cache off the source URL. **Overwriting an existing file with new bytes will NOT update the rendered image on github.com** — Camo will keep serving the cached pre-overwrite version for hours, sometimes days. If you re-record `tour.gif` and the github.com README still shows the old one, **rename the file** (e.g. `tour.gif` → `tour-v2.gif` or something self-documenting like `tour-pdca-loop.gif`) and update the `<img src>` — the new URL hashes fresh and Camo refetches immediately. This applies to ALL images in the README, not just GIFs. The raw.githubusercontent.com endpoint is NOT cached this way, so always verify file contents there before assuming the file is wrong.
