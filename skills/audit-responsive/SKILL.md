---
name: audit-responsive
description: >
  Audit and fix layouts at every breakpoint; desktop is not a wide phone. Use
  when "responsive audit", desktop looks stretched, there is no max-width, or
  1440 looks like a phone. Touch-first build → design-mobile-first.
license: MIT
effort: high
---

# audit-responsive — Layout & breakpoint IA

**Degree of freedom: MIXED** — Phases 0–3 `[HIGH freedom]`; viewport
screenshot loop `[LOW freedom — run exactly]`; Phase 4 implement only after
the report (wait if scope is large).

> **Audit-and-fix exception.** Report first; then implement. Not present-then-stop.

**Desktop is not a wide phone.** Responsive means groups reflow, controls size to
function, and reading columns cap. A 1440px screenshot that looks like a stretched
phone fails this skill.

**Before ANY browser interaction, read `protocol-browser-anti-stall`.**

> **Report-first.** Findings + token sheet + ASCII wireframes first. If the scope
> is large, wait for approval before Phase 4. Then implement in reviewable chunks.
> Optional path scope: `$ARGUMENTS` or a path the user named
> (e.g. `src/pages/dashboard`).

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-responsive** (this) | Layout reflow + page-level IA at 375 / 768 / 1440 |
| `design-mobile-first` | Touch, safe areas, gestures — mobile-up, not "unstack desktop" |
| `audit-ux-journeys` | Cross-page stories, nav findability |
| `audit-ux` | Per-page heuristics and microcopy |
| `audit-uiux-design-system` | Tokens, components, visual drift |
| `plan-uiux-unification` | Full DS unification plan — no code |
| `enhance-web-ui` / `enhance-web-ux` | Polish after the layout contract exists |

## How to reason

1. **Observe** — quote the container/grid and the 375 / 768 / 1440 screenshots
2. **Interpret** — did groups reflow, or is 1440 a stretched phone?
3. **Classify** — anti-pattern # (1–10) / present-and-correct
4. **Severity** — stretched-phone 1440 = blocker for that page

## Worked example

> **Observe:** Dashboard at 1440: single column, full-width buttons, no
> `max-w-*`. Screenshot matches the 375 stack scaled up.
> **Interpret:** desktop is a wide phone — groups that compare (stats, list+detail)
> never sit side-by-side.
> **Classify:** anti-patterns 1, 2, 3 — blocker.
> **Finding:** `app/dashboard/page.tsx` | #1+#2+#3 | blocker | add page
> max-width; 12-col stats + list+detail at ≥1024

---

## Phase 0 — Detect the stack (do not assume)  [HIGH freedom]

Inspect the scoped UI and record:

- **Framework:** React / Next / Vue / Nuxt / Svelte / Angular / HTML / server templates
- **Styling:** Tailwind / CSS Modules / styled-components / SCSS / vanilla / UI library
- **Tokens already in repo:** breakpoints, spacing, type, colors, container widths, icon set
- **Underused system:** a design system or component library installed but ignored

All fixes use the repo's conventions. Never add a styling system unless none exists —
then propose the lightest fit and ask before adding a dependency.

```bash
# Framework + styling signals
rg -l '"next"|"react"|"vue"|"svelte"|"@angular"' package.json
rg -l 'tailwindcss|styled-components|@emotion|@mui/material|@chakra-ui|@radix-ui' package.json
# Tokens / containers / breakpoints
rg -n "screens|breakpoints|max-w-|container|@theme|--spacing" -g '*.{css,ts,js,mjs}' -g '!node_modules' | head -40
# Icon set already in use
rg -n "from 'lucide-react'|from '@heroicons'|from 'react-icons'|phosphor" -g '*.{tsx,jsx,vue,svelte}' | head -20
```

---

## Phase 1 — Audit the 10 anti-patterns  [HIGH freedom; screenshot loop = LOW]

Scan scoped pages, views, screens, and major layout components. Full signals and
pass/fail cues: [references/checklist.md](references/checklist.md).

| # | Anti-pattern | Fail when |
|---|---|---|
| 1 | **No max-width container** | Content or text edge-to-edge at desktop. Cap layouts ~1140–1280px; reading ~640–720px / 65–75ch |
| 2 | **Single-column everything** | Vertical stack at ≥1024px when groups belong side-by-side (form+summary, list+detail, comparable stats, media+text) |
| 3 | **Stretched interactive elements** | Full-width buttons, inputs, or cards at desktop. Full-width is a mobile pattern |
| 4 | **No visual hierarchy** | Headings, body, labels, captions near-identical size/weight; everything left-aligned by default, not by decision |
| 5 | **No spacing system** | Arbitrary 13/22/37px gaps instead of the repo's 4/8 scale |
| 6 | **No grouping / IA** | Related data unclustered; unrelated data merged; flat lists where table/grid/master-detail fits |
| 7 | **Missing or mixed icons** | Text-only nav/status/actions, or mixed icon libraries/styles |
| 8 | **Breakpoint gaps** | Styles for one width only; abandoned at 768 (tablet) or 1440 (desktop) |
| 9 | **Typography defaults** | Browser font stack/size, no type scale, line length >~80ch, cramped body line-height |
| 10 | **Table/data misuse** | Tabular data as stacked cards on desktop, or wide tables with no mobile strategy |

Each finding: `file:line` · anti-pattern # · one-line description · severity
(`blocker` / `major` / `minor`).

Live evidence — resize **before** `goto` (viewport persists across navigation):

```bash
PW="npx --yes @playwright/cli@latest"; S="-s=responsive-audit"
$PW $S open --headed "<app-url>"
for wh in "375 812" "768 1024" "1440 900"; do
  $PW $S resize $wh
  $PW $S goto "<app-url>/<route>"
  $PW $S snapshot                # blank → sleep 2 → snapshot again
  $PW $S screenshot --filename ".playwright-mcp/responsive-<route>-${wh// /x}.png"
done
```

If the 1440 screenshot is a stretched phone, that is a **blocker** for the page.

Shipped as a native app (Capacitor, Expo, RN)? Add `844 390` (phone landscape) and
`1024 768` (tablet / unfolded foldable) to the loop. For apps targeting Android 16,
displays ≥ 600dp ignore orientation and resizability locks, so a portrait-locked phone
layout appears stretched there. Confirm on the tablet AVD with `mobile-emulator-test`.

---

## Phase 2 — Extract or propose the token sheet  [HIGH freedom]

Before fixing, produce a sheet. If the repo already has tokens, **use them
verbatim** and flag violations — do not invent a second scale.

| Token | Default if the repo has none (mark as *proposed*) |
|---|---|
| Breakpoints | mobile <640 · tablet 640–1023 · desktop ≥1024 |
| Containers | page max-width · content max-width · reading max-width |
| Grid | 12-column mental model; how each group maps at each breakpoint |
| Spacing | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 |
| Type | 12 / 14 / 16 / 20 / 24 / 32 + weight + use (caption / label / body / h3 / h2 / h1) |
| Icons | one library; 16 inline · 20 controls · 24 nav |

---

## Phase 3 — Information architecture before pixels  [HIGH freedom]

For each flagged page/screen:

1. List content blocks. Classify each: **primary** (why the page exists),
   **secondary** (supporting), **metadata** (timestamps, IDs, status).
2. Group related blocks; name each group.
3. Sketch ASCII wireframes at **375 / 768 / 1440** showing how groups reflow
   (sidebar → tabs; 3-up stats → 1-col; master-detail → list → push).
   Templates: [references/checklist.md](references/checklist.md#wireframes).
4. Only then write code. The wireframe is the contract; CSS implements it.

Use **real content** from the codebase — never invented examples.

---

## Phase 4 — Implement  [LOW freedom — after the report; repo tokens only]

- Native responsive primitives: CSS grid/flex + media or container queries;
  Tailwind prefixes; framework grid components.
- Prefer **container queries** when a component is reused across contexts and
  the stack supports them.
- Mobile-first CSS: base = mobile, enhance upward.
- Preserve semantics and a11y: heading levels match visual hierarchy, visible
  focus, touch targets ≥44px on mobile, `prefers-reduced-motion` respected.
- Diff scope: layout / hierarchy / spacing / type only. Do not restyle brand
  colors or rewrite copy unless copy blocks hierarchy.

Chunk by severity into reviewable PRs. After each chunk, re-run the 375 / 768 /
1440 screenshot loop on touched routes.

Hand off leftover polish (motion, microcopy, token drift) — do not absorb it.

---

## Definition of Done — verify at 375 / 768 / 1440

- [ ] 1440: no content or control spans the full viewport; page has a max-width container
- [ ] Related information is grouped; groups sit side-by-side where comparison or context helps
- [ ] **5-second glance:** primary content, page purpose, and next action are obvious without reading
- [ ] Spacing values come from the scale; font sizes come from the type scale
- [ ] Icons from one set, used to aid scanning (status, nav, actions)
- [ ] Body line length ≤ ~75ch; paragraph line-height ≥ 1.5
- [ ] No horizontal overflow at 375; touch targets ≥44px; tables have a defined mobile strategy
- [ ] Layout **meaningfully differs** between 375 and 1440 — a stretched-phone 1440 fails

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Three viewports** — no "done" from code inspection alone
2. **Repo tokens first** — do not invent a second scale
3. **Wireframe before CSS** — Phase 3 is the contract
4. **Right owner** — touch/gestures → `design-mobile-first`; empty states → `audit-ui-states`

---

## Output format

1. **Findings table** — `file:line` | anti-pattern | severity | one-line fix
2. **Token sheet** — extracted or proposed (mark which)
3. **Per-screen wireframes** — 375 / 768 / 1440, ASCII
4. **Fix plan** — severity order, PR-sized chunks
5. Then implement chunk by chunk (or wait if the user is reviewing 1–4)

**Forbidden:** inventing a new design system when one exists; stacking a
desktop skin on a single-column DOM; claiming done from code inspection
without the three viewport screenshots; routing a linearized-desktop complaint
to `design-mobile-first`.

---

## Related

- `design-mobile-first` — touch / safe-area / gesture; the mobile-up counterpart
- `plan-uiux-unification` — whole-repo DS + IA plan when the system itself is the problem
- `audit-uiux-design-system` — token/component compliance after layout is fixed
- `audit-ux` / `audit-ux-journeys` — heuristics and cross-page IA (not breakpoint layout)
- `enhance-web-ui` / `enhance-web-ux` — polish once the wireframe is implemented
- `housekeep-design` — competing token/component SSOTs
- `audit-accessibility` — WCAG after reflow (focus order, target size)
- `audit-ui-states` — empty/error/offline matrix (not breakpoint layout)
- `test-visual-regression` — lock the 375 / 768 / 1440 baselines
- `test-playwright` — regression coverage for the new layouts
