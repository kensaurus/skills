---
name: enhance-web-ux
description: >
  NN/g-grounded fix of one existing page's flows. Use when "fix UX of /xxx" or
  "improve information density". Repo-wide slop plan → plan-antislop.
  Composition/type → enhance-web-ui. Reading level → enhance-readability.
  Heuristics only → audit-ux.
license: MIT
---

> Surface router: `/uiux`. You are here: `enhance-web-ux`. Native iOS/Android (SwiftUI / Compose, no web layer) is out of scope — use Apple HIG / Material directly.

# Enhance Page UX

**Degree of freedom: MIXED.** Heuristic mapping `[HIGH freedom]`; three-viewport capture, DOM forensics `[LOW freedom — run exactly]`.

A generative companion to the audit skills. **Audits diagnose; this skill enhances.** It
takes a single route or screen and produces a concrete, design-system-compliant set of
code changes that make the page feel hand-crafted — not template-generated.

> **Before any browser interaction, follow the rules in the
> `protocol-browser-anti-stall` skill.**

## How to reason

1. **Recon** — journey, primary task, unused data, primitives
2. **Forensics** — 1440/1024/800 + rects + silent-pain catalogue
3. **Map** — each pain → NN/g + existing primitive (no inventions)
4. **Verify** — before/after + uniformity recheck + category squint

## Worked example

> **Recon:** `/folders` is the hub; `aiAnalyzedAt` exists but is unused; Badge + tokens exist.
> **Forensics:** 1024 wraps a toolbar label; all folder icons identical; hint row repeats (S6).
> **Map:** #6 Recognition → category icon + chip; #8 → delete hint row; #1 → AI badge from real timestamp.
> **Verify:** wrap gone at 1024; icons discriminate without reading; no new primitive.

## Self-critique before reporting

- **Cited** — every change names an NN/g heuristic, not "looks bad"
- **Silent pains** — inventory has more than user-reported rows
- **Primitive-first** — repeating bugs patched at the helper, not one consumer
- **Right owner** — composition/type → `enhance-web-ui`; repo-wide slop plan → `plan-antislop`; heuristics-only → `audit-ux`

---

## Rules

> **Replace, don't stack.** When you find an empty column, redundant header, or a duplicated
> hint row, REPLACE it with semantic data. Never pile new chips on top of a layout that
> already wastes space.

> **No band-aid fixes.** If a problem (label wraps, generic icon, missing AI indicator)
> shows up on multiple rows / pages / components, fix it at the helper / token level — not
> by patching one site at a time.

> **Inventory primitives before inventing.** The design system already has Badge, Button,
> Card, Tooltip, semantic colour tokens, animation utilities, etc. Use them. If none fits,
> extend the existing primitive — don't sidestep with a one-off `<div className="…">`.

> **Never ship mock, dead, or rogue UX.** Enhancements must be connected to the
> real product system: existing primitives, design tokens, domain helpers, API
> contracts, backend state, database schema, validation rules, permissions, and
> lifecycle events. Do not fake progress, status, counts, ownership, errors, or
> empty states in the component unless the user explicitly asks for a prototype.

> **Make feedback data-backed.** If users need clearer feedback to know what is
> happening, first find the real data that should drive it (status enum,
> timestamp, count, queue state, error code, audit trail, sync state, etc.). If
> the data does not exist but is necessary for solid UX, propose or implement
> the smallest schema/backend/API enhancement rather than layering decorative UI
> over missing product state.

> **Every change must cite a heuristic.** "Looks bad" is not a justification. "Violates NN/g
> #6 Recognition not Recall — all folder icons identical, forces reading names" is.

> **Verify at three viewports.** Desktop (1440), tablet (1024), narrow (800). Catch
> wrap / overflow / collision before claiming done.

> **Named AI-tells:** identical-padding sections, generic 3-column icon-title-description grids,
> uniform border-radius on everything (pill-shaped every control), every status the same colour,
> primary colour painted on every clickable element, lorem-ipsum empty states, stock illustrations,
> Inter / Roboto as the only face, monospace or "01 / 02 / 03" section labels, a cream / off-white
> canvas, an italic accent word in every headline. If the page has them, they are part of the work.

> **Extended rules** — screenshots are necessary but not sufficient; patch the primitive, not the consumer; audit the library-vs-CSS specificity war; chrome is wayfinding, not content; one brand-color element per visual zone: [references/forensics.md](references/forensics.md) §Extended rules.

---

## Workflow Checklist

Copy this to track progress across the enhancement:

```
ENHANCE /<route>
- [ ] 0. PRODUCT TIER: domain class → colour-tier (A vibrant / B expressive /
 C productive / D restrained) — see enhance-web-ui §1.5
- [ ] 1. RECON: route, components, data shape, primitives, tokens, wrappers
- [ ] 2. LIVE: playwright-cli at 1440 / 1024 / 800, screenshots, console
- [ ] 2.5 DOM FORENSICS: rect widths/heights for repeated tiles, conditional
 slot zero-state, dup-datum scan per fold (see Step 2.5)
- [ ] 3. PAIN INVENTORY: user-reported + silent issues + DOM forensics, with
 viewport (see Silent-Pain Catalogue in Step 3b)
- [ ] 4. HEURISTIC MAP: each pain → NN/g # + Law of UX (HEURISTICS.md)
- [ ] 5. PRIMITIVE MATCH: each fix → existing component / token / helper;
 prefer wrapper-level patch when bug repeats (see Step 5b)
- [ ] 6. ENHANCEMENT PLAN: table of pain → heuristic → primitive → file → diff
- [ ] 7. IMPLEMENT: smallest possible diffs, primitive fixes first, intent
 comments only
- [ ] 8. VERIFY: re-screenshot at 3 viewports + DOM uniformity recheck +
 category-squint pass + lint, compare before/after
- [ ] 9. WRITE-UP: pain → heuristic → fix, with screenshots
```

---

## Step 1 — RECON: Understand the Page Before Touching It  [HIGH freedom]

Read the route file in full and each top-level child component. Record the workflow position, primary task, data domain, and adjacent screens; draw a small ASCII component tree.
Inventory the data shape for every entity, including fields the page does NOT show, and check that every visual cue (badge, progress, alert, disabled, empty, "recent") is backed by real product state.
Inventory primitives and tokens (`src/components/ui/*`, Tailwind config or `globals.css`, feature helpers) — every fix in Step 5 must use one of these — and grep for `NEVER|FORBIDDEN|DO NOT|avoid` and `@deprecated`.
Glob/Grep/Read recipes and the component-tree example (1a–1e): [references/forensics.md](references/forensics.md) §Step 1.

---

## Step 2 — LIVE: Observe the Real Page, Not the Code  [LOW freedom — run exactly]

Use playwright-cli; always `resize` **before** navigating. Capture 1440 × 900, 1024 × 700, and 800 × 700 with `snapshot`, `screenshot`, and `console` at each.
Click into representative states: an empty container, a populated one with diverse children, the row with the most badges, and search-with-no-results.
Record 2-3 lines per capture of what you see, not what you expect.
Viewport table, playwright-cli loop, and the recording example (2a–2c): [references/forensics.md](references/forensics.md) §Step 2.

---

## Step 2.5 — DOM FORENSICS (catch the silent bugs)  [LOW freedom — run exactly]

Screenshots show *what looks weird*; DOM forensics shows *why*. Run all four gates before declaring the page understood, especially on "looks weird", "feels off", "stacked", or "monochromatic" feedback:
- **2.5a Repeated-element uniformity gate** — measure rects of tiles, segments, columns, nav rows; `widthSpan > 1` under a shared `grid-cols-N` parent is a wrapper-collapse bug.
- **2.5b Conditional-slot zero-state probe** — render every optional slot sparse at 800px; a floor its content fills < 40% of is a dead slot.
- **2.5c Information-duplication scan per fold** — any datum appearing ≥ 2 times in one fold is a duplicate (NN/g #8).
- **2.5d Category-squint colour pass** — 10–15px blur; tier-A/B tiles must blur to distinct hues, tier-D to near-uniform neutrals.
Rect script, symptoms, and tier rules: [references/forensics.md](references/forensics.md) §Step 2.5.

---

## Step 3 — PAIN INVENTORY  [HIGH freedom]

Maintain a single table (`# | Source | Pain | Viewport | Notes`) with user-reported pains AND the silent ones you discovered. **Do not skip silent pains** — the user reports the loudest issue but rarely the worst one.
After the user-reported rows, walk the Silent-Pain Catalogue S1–S18 and add every match as its own row. A good plan catches **2–4 silent pains per user-reported pain**; an inventory with only user-reported rows means Step 2.5 was skipped.
Example inventory and the full S1–S18 catalogue (class, where to look, NN/g, symptom): [references/pain-catalogue.md](references/pain-catalogue.md) §Step 3.

---

## Step 4 — HEURISTIC MAP (every fix needs a WHY)  [HIGH freedom]

For each pain, name the violated heuristic (`# | Pain | NN/g # | Law of UX | Why it violates`). Use `HEURISTICS.md` for the canonical list. A pain that cannot be tied to a heuristic is probably a personal taste call — defer it.
Worked mapping table: [references/pain-catalogue.md](references/pain-catalogue.md) §Step 4.

---

## Step 5 — PRIMITIVE MATCH (no inventions)  [HIGH freedom]

For each fix, match an existing primitive (`# | Fix idea | Primitive / token | Where it lives`). If none fits, extend the closest one — never reach for a raw `<div>` styled inline. If a fix would add a new primitive, first ask whether it can be a variant of an existing one — it almost always can.
Worked match table: [references/pain-catalogue.md](references/pain-catalogue.md) §Step 5. Primitive-first patch decision (5b), Steps 6–9, cheat sheets, and sanity checks: [references/details.md](references/details.md).

## Further reading

- [Extended rules, recon, live capture, DOM forensics (Steps 1–2.5)](references/forensics.md)
- [Pain inventory, Silent-Pain Catalogue, heuristic map, primitive match (Steps 3–5)](references/pain-catalogue.md)
- [5b primitive-first patch decision, Steps 6–9, cheat sheets, sanity checks](references/details.md)
