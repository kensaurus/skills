# enhance-web-ui — live read

The extended rules and the Step 3 sub-passes: two squint passes, the DOM uniformity gate, the conditional-slot zero-state pass, and the information-duplication scan.

## Contents

- Extended rules
- Step 3 — 3a two squint passes
- Step 3 — 3b DOM uniformity gate
- Step 3 — 3c conditional-slot zero-state pass
- Step 3 — 3d information-duplication scan

## Extended rules

> **Tune saturation to product domain.** A consumer learning, kids, fitness,
> or gamified app needs a *vibrant, semantic* palette where each colour
> carries meaning (Duolingo: green=correct, red=hearts, orange=streak). A
> B2B/SaaS/finance dashboard needs *restrained* colour reserved for status
> only (NN/g 60–30–10, Stripe-style). Faint `/5–/10` tints on a playful
> consumer surface read as monochromatic and dead. Pick a saturation tier
> for the product first, then apply it consistently — see *Domain Colour
> Tier* below.

> **Audit conditional slots for dead-state.** Any optional region — `media`,
> `aside`, `eyebrow`, `footerSlot`, `cover`, `illustration`, `secondaryCTA`
> — must be tested with sparse / zero-state content. A slot that reserves
> `min-h: 160px` for a rich illustration becomes a giant empty card when
> the only content is "0%". Make the slot *conditional on content* (drop
> the wrapper when empty) or *collapse the floor* (`min-h-0` on mobile),
> never reserve space for absent content.

> **Scan for information duplication within one viewport.** The same number,
> word, date, or status appearing twice in the same fold means one of them
> is wasted ink. Eyebrow shows "0/10 today" + inline pill shows "0/10
> today" + footer bar shows "0/10 today" → keep the most actionable copy
> and delete the rest. Duplicates fragment attention (NN/g #8) and signal
> that the content rank in step 2 was skipped.

> **Patch the primitive, not the site.** If a layout/colour/wrap bug
> repeats, fix it where the wrapper, helper, or token lives — not at the
> consumer. A single `Tooltip` defaulting to `inline-flex` will silently
> shrink every `w-full` child across the app; one prop fix beats N
> per-page band-aids. See *Primitive-First Patch Rule* below.

> **Calm chrome before you decorate content.** Wayfinding chrome (header,
> breadcrumb, tabs, dock, toolbar) should *recede*, not announce itself —
> Linear's 2025 refresh names this "structure should be felt, not seen". If
> chrome competes with content for visual weight, it has too much paint:
> strip backgrounds → borders → tints → fills, in that order, until the
> chrome reads as a tonal recess that frames the content. The squint test
> applies to chrome too: at 10 px blur, the page content should dominate;
> the chrome should look like a quiet frame, not a stack of buttons.

> **One brand-color element per visual zone.** A page should have ONE
> brand/accent-tinted element per zone (header strip, breadcrumb row, tab
> row, dock, page body). If breadcrumb chips, tab badges, AND the actual
> primary CTA all use the brand color, the actual CTA loses scent — every
> brand-tinted thing claims primacy and the user's eye can't pick a target.
> Audit the brand budget per zone: count brand-tinted surfaces in the
> screenshot; if > 1 per zone (excluding the count badge / underline / status
> chip that *carries* meaning), demote the chrome ones to neutral
> typography. The brand color is a finite resource — spend it on the action
> the user is here to take.

> **Active ≠ heavier layout — active = different cue.** When an element
> moves to active state, its **layout dimensions must not change** (no
> taller, no wider, no extra padding). The active *signal* should come from
> a micro-cue: text-color shift + font-weight bump (`font-medium` →
> `font-semibold`), an underline, an icon-wrapping pill (Material 3
> NavigationBar pattern: 32×16 `bg-secondaryContainer` rounded-full pill
> wrapping the icon, NOT the whole cell), or a count-badge tint swap. Full
> background washes on active tabs/buttons/cells inflate *perceived weight*
> 50%+ even when the bounding box is identical; the user reads the active
> sibling as "weirdly big and clunky". Linear, Stripe Apps, Vercel, M3 all
> obey this — copy them.

## Step 3 — sub-passes (3a–3d)

### 3a - Two squint passes, not one

Run the squint test twice — both passes are necessary, and the second is
the one most enhancers skip:

| Pass | Question | Failure looks like |
|------|----------|--------------------|
| **Hierarchy squint** | "Where is my eye pulled first?" | Several elements equally loud → primary not chosen |
| **Category squint** | "Can I tell related items apart by colour/shape alone, without reading?" | All tiles same neutral grey → user must read every label = NN/g #6 violation |

For a Tier A/B product (see *Domain Colour Tier*), a 2-up or 3-up of
metric tiles that all read the same hue when blurred is a bug — colour is
your category signal. For a Tier D product, the same blur should show
*near-uniform* tiles with colour reserved only for the alert row.

### 3b - DOM uniformity gate (catches silent wrapper collapse)

Screenshots are necessary but not sufficient. When a page has *repeated
elements that should be the same width / height* — grid tiles, segmented
control segments, table columns, sidebar nav rows, form fields — measure
them. Many "weird-looking" layouts come from a wrapper higher in the tree
silently collapsing children to content width.

For each repeated group, query rendered rects and assert uniformity:

```js
// playwright-cli / Playwright / DevTools console — generic, framework-free
const rects = [...document.querySelectorAll('<your-tile-selector>')]
 .map(el => el.getBoundingClientRect());
const widths = rects.map(r => Math.round(r.width));
const heights = rects.map(r => Math.round(r.height));
const span = Math.max(...widths) - Math.min(...widths);
console.table({ widths, heights, widthSpan: span });
// span > 1px on tiles that share a `grid-cols-N` parent === wrapper-collapse bug
```

Common wrapper-collapse causes (generic, language/framework agnostic):

- Tooltip / Popover / Trigger primitive defaults to `display: inline-flex`
 or `inline-block` → child `width: 100%` collapses to content width.
- Grid template uses `1fr` (which is `minmax(auto, 1fr)`) and a child has
 intrinsic content wider than expected → cell expands beyond `1fr`. Fix:
 `repeat(N, minmax(0, 1fr))`.
- Flex child without `min-width: 0` or `flex: 1 1 0` → content size
 dictates layout instead of the flex track.
- Animation libraries (Framer Motion `m.div`, Reanimated, GSAP wrappers)
 that inject inline `display: inline-block` for transform performance.
- Slot patterns (`<Slot>`, `asChild`, `cloneElement`) where the consumer
 drops `w-full` because the inner component doesn't forward `className`.

Fix at the wrapper, not the leaf: see *Primitive-First Patch Rule*.

### 3c - Conditional-slot zero-state pass

For every conditional region (`media`, `aside`, `cover`, `eyebrow`,
`secondaryCTA`, `illustration`, `footerSlot`), inspect its **sparse
state** — render the page with the slot's smallest realistic content
(empty, "0%", a single icon, one short word). If the slot still reserves
its `min-h` / `aspect-ratio` / `min-w` floor, you have a dead-conditional
slot. Move to *Composition Move 4 (Stage)* and either:

1. Drop the wrapper when the slot is empty (`{slot && <Region>{slot}</Region>}`).
2. Collapse the floor on narrow viewports (`min-h-0 lg:min-h-[160px]`).
3. Inline the data into the body (chip / pill next to the action).

### 3d - Information-duplication scan

Within every fold (one viewport-height slice top-to-bottom), search for
the same number, word, date, or status appearing more than once. List
duplicates explicitly:

```
Fold 1 of /home @ 390×844:
- "0/10 words today" ×3 (eyebrow metric, action pill, footer strip)
- "0%" ×2 (action pill, Today metric tile)
- streak count ×2 (eyebrow metric, Streak tile)
```

The duplication itself is the diagnosis — pick *one* canonical home for
each datum (usually the most actionable one) and delete the others. Each
delete is a hierarchy upgrade for whatever stays.
