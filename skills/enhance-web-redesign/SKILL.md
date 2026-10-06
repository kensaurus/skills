---
name: enhance-web-redesign
description: >
  Upgrade an existing site/app to premium quality. Use when "redesign
  this app" or "upgrade UI to premium". One-page polish → enhance-web-ui.
  Plan-only slop audit → plan-antislop. New UI from scratch →
  design-frontend.
license: MIT
---

> Surface router: `/uiux`. You are here: `enhance-web-redesign`. Native iOS/Android (SwiftUI / Compose, no web layer) is out of scope — use Apple HIG / Material directly.

# Redesign Skill

**Degree of freedom: MIXED.** Taste and audit judgment `[HIGH freedom]`; keep-the-stack, no-break-functionality `[LOW freedom — run exactly]`.

## How to reason

1. **Scan** — framework, styling, current patterns
2. **Triage** — AI-tells first (3+ = slop; kill those)
3. **Fix** — existing stack, Fix Priority order; no rewrite
4. **Preserve** — flows still work; deps exist before import

## Worked example

> **Scan:** Vite + Tailwind v4; Inter everywhere; three equal feature cards; no hover.
> **Triage:** Inter, purple hero gradient, three cards, "Welcome to…" — four tells.
> **Fix:** Geist; one accent; asymmetric feature row; hover/active; keep routes.
> **Preserve:** `npm run build` green; no new framework.

## Self-critique before reporting

- **Same stack** — no framework or styling-library migration
- **Tells killed** — Phase 0 fingerprints actually gone, not restyled in place
- **States exist** — hover/focus/loading/empty/error present
- **Right owner** — one-page polish → `enhance-web-ui`; plan-only slop → `plan-antislop`; greenfield → `design-frontend`

## How This Works

When applied to an existing project, follow this sequence:

1. **Scan** — Read the codebase. Identify the framework, styling method (Tailwind, vanilla CSS, styled-components, etc.), and current design patterns.
2. **Diagnose** — Run through the audit below. List every generic pattern, weak point, and missing state you find.
3. **Fix** — Apply targeted upgrades working with the existing stack. Do not rewrite from scratch. Improve what's there.

## Phase 0: 60-Second AI-Tell Triage  [HIGH freedom]

Before the full audit, scan for the highest-signal "AI-generated look" fingerprints. If you spot 3+, the page reads as slop and these are the fastest wins. (Distilled from anti-slop research — see [anti-slop-ui](https://github.com/awaken7050dev/anti-slop-ui) and [taste-skill](https://github.com/Leonxlnx/taste-skill).)

- [ ] **Inter / Roboto** as the only typeface
- [ ] **Purple→blue gradient** on hero, buttons, or icons
- [ ] **Three equal feature cards** in a row
- [ ] **Pill-shaped everything** (uniform `rounded-full` badges + buttons)
- [ ] **"Welcome to [Product]" / "improve your…"** hero copy
- [ ] **Em dashes** sprinkled through every sentence of body copy
- [ ] **Lucide/Feather icons** with a rocket = "launch", shield = "security"
- [ ] **Centered-everything** symmetrical layout with no asymmetry or overlap
- [ ] **Generic `shadow-lg`** pure-black shadows on white cards
- [ ] **No hover / active / focus states** on interactive elements
- [ ] **Cream / off-white page background** as the default canvas
- [ ] **Italic accent word** in every headline
- [ ] **"01 / 02 / 03" numbered or monospace eyebrow labels** above every section

Kill these first, then run the full audit.

## Design Audit  [HIGH freedom]

Run through every category and list each generic pattern, weak point, and missing state you find; every catalogue item names the problem and its fix:
Typography · Color and Surfaces · Layout · Interactivity and States · Content · Component Patterns · Iconography · Code Quality · Strategic Omissions (what AI typically forgets).
Full audit catalogue: [references/design-audit.md](references/design-audit.md) §Design Audit.

## Upgrade Techniques  [HIGH freedom]

When upgrading, pull from the high-impact typography, layout, motion, and surface techniques to replace generic patterns (variable-font animation, outlined-to-fill text, broken grid, parallax card stacks, staggered entry, spring physics, true glassmorphism, spotlight borders, grain overlays, tinted shadows).
Full list: [references/design-audit.md](references/design-audit.md) §Upgrade Techniques.

## Fix Priority  [HIGH freedom]

Apply changes in this order for maximum visual impact with minimum risk:

1. **Font swap** — biggest instant improvement, lowest risk
2. **Color palette cleanup** — remove clashing or oversaturated colors
3. **Hover and active states** — makes the interface feel alive
4. **Layout and spacing** — proper grid, max-width, consistent padding
5. **Replace generic components** — swap cliche patterns for modern alternatives
6. **Add loading, empty, and error states** — makes it feel finished
7. **Polish typography scale and spacing** — the premium final touch

## Rules  [LOW freedom — run exactly]

- Work with the existing tech stack. Do not migrate frameworks or styling libraries.
- Do not break existing functionality: keep routes, handlers, and states; run the repo's build and checks before reporting.
- Before importing any new library, check the project's dependency file first.
- If the project uses Tailwind, check the version (v3 vs v4) before modifying config.
- If the project has no framework, use vanilla CSS.
- Keep changes reviewable and focused. Small, targeted improvements over big rewrites.

## Further reading

- [Design audit catalogue and upgrade techniques](references/design-audit.md)
