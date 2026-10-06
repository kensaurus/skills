---
name: enhance-web-ui
description: >
  Polish an existing page's hierarchy, spacing, type, and visual personality.
  Use when "make this page polished/premium", "less crowded", or "better
  visual hierarchy". Readability → enhance-readability. Flow/IA →
  enhance-web-ux.
license: MIT
---

> Surface router: `/uiux`. You are here: `enhance-web-ui`. Native iOS/Android (SwiftUI / Compose, no web layer) is out of scope — use Apple HIG / Material directly.

# Enhance Page UI

**Degree of freedom: MIXED.** Composition and tier judgment `[HIGH freedom]`; live read, DOM rects, three-viewport verify `[LOW freedom — run exactly]`.

Turn an existing screen into a composed interface: calmer hierarchy, smarter
content placement, expressive but purposeful motion, and artful transitions that
support comprehension. This is not a "add more chips/cards/shadows" skill. It
rearranges, subtracts, and stages information before adding decoration.

> **Vague-but-visceral user feedback ("clunky", "atrocious", "wasted space",
> "incoherent height") almost always points to a `Hidden Failure Mode` from §X
> below — start there, not at the surface decoration the user named.**

> If browser automation is used, first follow the
> `protocol-browser-anti-stall` skill when present.

## How to reason

1. **Recon** — primitives, tokens, real data contracts
2. **Rank** — primary / secondary / metadata / actions / ambient
3. **Compose** — subtract → group → pin → stage before decorating
4. **Verify** — 1440/1024/800 + two squints + rect uniformity

## Worked example

> **Recon:** learning app (tier A); stat tiles share a Tooltip wrapper; "0/10 today" appears three times.
> **Rank:** primary is the next lesson CTA; the count is metadata, not a third headline.
> **Compose:** patch Tooltip to `block w-full`; drop two duplicate counts; no extra chips.
> **Verify:** tile widths match; category squint shows distinct hues; CTA still one brand-color target.

## Self-critique before reporting

- **Compose first** — decoration was not the first edit
- **Real data** — no mocked status/count; primitive patched if the bug repeats
- **Three viewports** — no wrapped CTAs; dead slots collapse when empty
- **Right owner** — flow/IA → `enhance-web-ux`; breakpoints-only → `audit-responsive`

---

## Rules

> **Compose before decorating.** Fix hierarchy, grouping, alignment, and rhythm
> before adding gradients, motion, blur, masks, or shadows.

> **Replace clutter with structure.** Do not stack more badges, labels, cards,
> dividers, or helper text onto a crowded surface. Move secondary information
> to a quieter region, a footer band, a hover/focus reveal, a drawer, or a
> progressive disclosure layer.

> **Make hierarchy visible at a squint.** A user should know the focal element,
> supporting content, metadata, and actions before reading every word.

> **Motion must explain.** Animate only feedback, state change, spatial
> relationship, affordance, or attention. No looping sparkle unless it carries
> status or brand tone and respects reduced motion.

> **Use the local design system.** Reuse existing primitives, tokens, radius,
> spacing, typography, animation helpers, and dark/light surfaces. Extend a local
> primitive before inventing a one-off.

> **Never ship mock, dead, or rogue UI.** Enhancements must be wired to the
> product's real data contracts, backend/API state, database schema, or existing
> domain helpers. If the UI needs better visual feedback, first look for the real
> status, timestamp, count, owner, error, progress, permission, or lifecycle data
> that should drive it. If that data does not exist but is necessary for a solid
> user experience, propose or implement the smallest backend/schema/API extension
> instead of faking the state in the component.

> **Respect density by viewport.** Desktop can hold layered metadata. Tablet
> needs tighter grouping. Narrow screens need progressive disclosure and no
> wrapping CTAs.

> **Extended rules** — tune saturation to product domain; audit conditional slots for dead-state; scan for information duplication within one viewport; patch the primitive, not the site; calm chrome before you decorate content; one brand-color element per visual zone; active ≠ heavier layout: [references/live-read.md](references/live-read.md) §Extended rules.

> **Named defaults to avoid when restyling.** Without direction the model
> reaches for the same few styles: Inter / Roboto, pill-shaped buttons on
> every control, monospace or "01 / 02 / 03" section labels, a cream /
> off-white canvas, purple gradients, three equal cards, an italic accent
> word in headlines. Use the repo's own type, radius, and palette tokens
> instead; if a first pass lands on one of these, name it in the write-up
> and replace it.

---

## Workflow Checklist

Copy and track:

```
UI ENHANCE /<route-or-component>
- [ ] 0. DOMAIN: product class -> colour-tier + density-tier (see Domain Colour Tier)
- [ ] 1. RECON: route, component tree, data fields, tokens, primitives, wrappers
- [ ] 2. CONTENT RANK: primary, secondary, metadata, actions, ambient
- [ ] 3. LIVE READ: 1440 / 1024 / 800 screenshots + DOM rect measurements
- [ ] 4. PAIN MAP: crowding, dead space, weak hierarchy, dup info, wrapper collapse,
 conditional-slot zero-state, monochromatic surfaces, hard cuts, bland motion
- [ ] 5. COMPOSITION PLAN: move, group, pin, crop, reveal, fade, animate
- [ ] 6. IMPLEMENT: primitive-level fixes first, smallest site-level diffs after
- [ ] 7. VERIFY: three viewports + DOM uniformity + squint-for-colour-distinction
 + reduced motion + dark/light if supported
- [ ] 8. WRITE-UP: before pain -> design principle -> after behavior
```

---

## Step 1 - Recon: Learn the Existing Visual System  [HIGH freedom]

Read the route/component in full. Then inspect:

- Layout primitives: `Card`, `Section`, `Drawer`, `Tabs`, `Badge`, `Button`,
 `Tooltip`, grid/list helpers.
- Styling system: Tailwind config, CSS variables, design tokens, theme context,
 animation utilities, existing radii/shadows.
- Data shape: all fields available, especially metadata currently shoved into
 titles or hidden in modals.
- Data source: API endpoints, loaders/actions, database schema, cache keys,
 backend status enums, validation errors, permissions, and lifecycle events that
 can make the UI's feedback real instead of decorative.
- Existing comments: search for "DO NOT", "avoid", "deprecated", "design",
 "layout", "spacing", "motion", "overflow".

Output a tiny component map:

```
<Page>
|-- Header - title, context, primary action
|-- Body/Grid/List - main content
|-- Detail/Drawer - progressive disclosure
`-- Footer/Chrome - metadata, controls, scroll status
```

Also list every **wrapper / layout primitive** in the chain from grid cell
down to the rendered child: `Tooltip`, `Trigger`, `Popover`, `Slot`,
`AnimatedDiv`, `Tippy`, `motion.div`, etc. Note the default `display`,
`width`, and `flex-shrink` of each. This is where wrapper-collapse bugs
hide and where the *primitive-first patch* in step 6 is decided.

---

## Step 1.5 - Domain Colour & Density Tier  [HIGH freedom]

Before touching any colour, name the product class. The same `/8` tint
that reads "premium and restrained" on a finance dashboard reads
"monochromatic and dead" on a learning app. Pick a tier, then apply it
consistently — never blend tiers in one product.

| Tier | Examples | Surface bg tint | Accent fill | Categorical hue use | Source |
|------|----------|-----------------|-------------|---------------------|--------|
| **A — Vibrant / Gamified** | Duolingo, Drops, Habitica, Strava, kids/learning, fitness, casual gaming | `/15–/25` gradient + ring `/30–/40` | solid token (`bg-success`, `bg-cta`), white-on-solid text | every meaningful category gets a distinct hue (success/error/streak/xp/info/premium) — colour *is* the gamification | Duolingo design system; Figma 2026 trend report |
| **B — Expressive Consumer** | Spotify, Notion playful surfaces, Robinhood onboarding, content/lifestyle apps | `/10–/18` gradient + ring `/20–/28` | semi-solid (`bg-cta/85`) | 3–5 semantic hues, decorative palette restrained | Spotify, Notion |
| **C — Productive / Pro Tools** | Linear, GitHub, Vercel, Figma chrome, design tools | `/6–/12` tint + ring `/15` | one accent + 4 semantic states | accent reserved for primary action; semantic states only for status | Linear, Radix |
| **D — Restrained / Data-Dense** | Stripe dashboard, AWS console, observability/finance/admin/healthcare | mostly neutral surfaces; `/4–/8` only on status pills | one accent for CTA; semantic states 4-slot (success/warn/error/info) | colour reserved for *data signal*; chrome stays achromatic — NN/g 60-30-10 | Stripe, ColorArchive SaaS dashboards |

**How to detect tier (do this before designing):**

1. Read the product's marketing copy, README, or onboarding — words like
 *play, streak, level, fun, journey, daily, habit, master* → tier A or B;
 *workspace, dashboard, report, audit, query, pipeline* → tier C or D.
2. Look at the existing primary CTA: solid saturated colour with chunky
 shadow → A; solid muted → B/C; outline or ghost dominates → D.
3. Look at semantic state tokens (`success`, `warning`, `error`,
 `info`, plus app-specific `xp`, `streak`, `premium`, `ai`, `tone-1..6`).
 More than 5 semantic hues with brand meaning → tier A. Just the basic 4
 → tier C/D.

**Tier mismatch is the top hidden cause of "monochromatic" feedback on
consumer apps.** A tier-A product with tier-D `/8` tints will look
washed-out and AI-generated even though every token is technically
"correct".

---

## Step 2 - Content Rank Before Layout  [HIGH freedom]

Classify every visible element:

| Rank | Meaning | Default Treatment |
|------|---------|-------------------|
| Primary | What the page is about | largest scale, strongest contrast, best space |
| Secondary | Helps interpret primary | near primary, smaller, grouped |
| Metadata | Dates, counts, stats, status | pinned footer/rail/table column, not title stack |
| Actions | What user can do | close to target, stable hit area, no wrap |
| Ambient | Brand, mood, decorative signal | background, mask, low contrast, removable |

Rules:

- If everything is primary, nothing is primary.
- If metadata crowds the headline, move it to a bottom band, side rail, table
 column, tooltip, or detail drawer.
- If an action wraps, abbreviate progressively or icon+tooltip it.
- If a grid has dead space, adjust span, dense placement, aspect ratio, or
 content anchoring before adding more content.

---

## Step 3 - Live Read  [LOW freedom — run exactly]

Inspect the page at:

```
1440 x 900 desktop composition
1024 x 700 tablet / split-screen stress
800 x 700 narrow desktop / large mobile stress
```

For each viewport, note:

- First focal point.
- What feels crowded.
- What feels empty or unbalanced.
- Which labels wrap or truncate.
- Whether scroll edges are hard cuts or softly communicated.
- Whether hover/focus states explain interactivity.
- Console/runtime errors.

Use the squint test: mentally blur the screenshot. The page should still reveal
its main regions through scale, contrast, grouping, and whitespace.

Then run the four sub-passes:
- **3a Two squint passes** — hierarchy ("where is my eye pulled first?") and category ("can I tell related items apart by colour/shape alone?"); tier A/B tiles must blur to distinct hues, tier D to near-uniform.
- **3b DOM uniformity gate** — query rects of repeated elements; a width span > 1px under a shared `grid-cols-N` parent is wrapper collapse. Fix at the wrapper.
- **3c Conditional-slot zero-state pass** — render each optional slot with its smallest realistic content; a kept `min-h` / `aspect-ratio` floor is a dead slot.
- **3d Information-duplication scan** — list every datum that appears more than once per fold; keep one canonical home.
Rect script, wrapper-collapse causes, and the fold-scan example: [references/live-read.md](references/live-read.md) §Step 3.

---

## Step 4 - Composition Moves  [HIGH freedom]

Prefer these moves, in order:

1. **Subtract**: remove repeated hints, duplicate labels, low-value icons, noisy
 chrome, and "just in case" metadata.
2. **Group**: use proximity and common region to make related pieces read as one
 unit. Increase spacing between groups; decrease spacing inside groups.
3. **Pin**: move stats, code metadata, timestamps, or progress to a card footer,
 side rail, bottom band, sticky summary, or column.
4. **Stage**: reveal secondary content through hover, focus, tabs, accordions,
 drawers, details panels, or "show more" only when it helps.
5. **Rebalance**: change card spans, grid density, aspect ratio, order, or
 alignment so important items get room and empty space feels intentional.
6. **Soften**: replace hard clipping with fades, masks, scroll shadows, curtains,
 sticky gradients, or viewport-aware edge treatments.
7. **Animate**: add microinteractions only after the static composition works.

---

## Hidden Failure Modes (the difficult-to-spot ones)

These are the "user said it but you missed it on first pass" patterns. When
feedback is vague-but-visceral ("clunky", "atrocious", "wasted space",
"incoherent height", "feels AI-generated"), walk this list before you touch
decoration. Each entry has a **detection probe** (what to look for) and a
**fix shape** (the smallest move that resolves it). Generic across stacks.

Walk H1–H16 with their detection probes and fix shapes: H1 active-state mass mismatch, H2 chrome tautology on root routes, H3 card-on-card chrome, H4 brand-color competition, H5 library-injected inline width, H6 wasted/squeezed column pair, H7 hover-only affordance, H8 hit-area baked into chrome, H9 stale data-priority, H10 missing `aria-current`, H11 motion that fights motion, H12 slot reserving space for absent content, H13 wrapper-collapsed tiles, H14 duplication per fold, H15 monochromatic surface, H16 left-anchored stack.
Full catalogue, Pattern Library, Primitive-First Patch Rule, motion and implementation rules, plan template, and sanity checks: [references/details.md](references/details.md).

## Further reading

- [Extended rules and Step 3 sub-passes (squints, DOM uniformity, zero-state, duplication)](references/live-read.md)
- [Hidden Failure Modes H1–H16, Pattern Library, Primitive-First Patch Rule, templates, sanity checks](references/details.md)
