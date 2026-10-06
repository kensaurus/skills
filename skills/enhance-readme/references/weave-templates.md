# enhance-readme — weave and templates

Where the hero and tour blocks go in the README (Step 4), what github.com renders, and the inline backup templates when the generator script is unavailable.

## Contents

- Step 4 — Weave blocks into README (4a–4c)
- GitHub README rendering reference
- Output templates (inline backups): hero block, tour GIF, tour grid (2x2)

## Step 4 — Weave blocks into README (4a–4c)

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

## GitHub README rendering reference

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

## Output templates (inline backups)

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
