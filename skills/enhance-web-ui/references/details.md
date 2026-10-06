# enhance-web-ui — details

Hidden Failure Modes H1–H16 with detection probes and fix shapes, the Pattern Library, the Primitive-First Patch Rule, visual psychology and motion rules, the plan template, sanity checks, scope limits, and research anchors.

## Contents

- Hidden Failure Modes H1–H4 (active-state mass, chrome tautology, card-on-card, brand-color competition)
- Hidden Failure Modes H5–H16
- Pattern Library
- Primitive-First Patch Rule
- Visual Psychology Map
- Motion Rules
- Implementation Rules
- Enhancement Plan Template
- Quick Sanity Checks (hidden-failure-mode audit, repo health)
- When Not To Use
- Research Anchors

### H1. Active-state mass mismatch

**Symptom:** "Tab/button/dock cell looks weirdly big and clunky", "highlight
area is huge", "heights are incoherent".

**Detection:** Take a screenshot. Compare bounding boxes of active vs inactive
siblings (DevTools → element rect, or just eyeball). If layout dimensions
match but the active one *feels* 1.5× heavier, the active state is using a
full-cell background fill. Grep your active state for `bg-*` on the
container element. If found AND the inactive sibling has `bg-transparent`,
that's the bug.

**Fix shape:** Move the active signal to a **micro-indicator** wrapped *inside*
the cell, not painted *over* it:
- Tab → underline + text-color + count-badge swap (Stripe / Vercel pattern).
- Bottom dock → 32×16 `rounded-full` pill wrapping the **icon only**, not
 the whole button (Material 3 `SecondaryContainer` pattern).
- Sidebar item → leading 2px brand rail + bg-muted hover only.
- Button → solid fill is fine for primary CTAs (they SHOULD be heavy);
 forbidden for navigation siblings (they should NOT compete).

### H2. Chrome tautology on root / index routes

**Symptom:** "Breadcrumb is atrocious", "header is too much", "why is 'Home'
shown 3 times".

**Detection:** On the root route (`/`, `/dashboard`, `/home`), count how many
chrome zones display the page name or home affordance: company-as-home link,
breadcrumb chip, page title H1, dock active-item label, tab name. If ≥ 2
zones say the same word for the *current* page, you have tautology.

**Fix shape:** On root routes, **suppress** redundant chrome — pass
`showContextRow={false}` (or your equivalent) to the page-layout wrapper, or
gate the breadcrumb on `pathname !== "/"`. The dock indicator + page H1 +
greeting copy already answer "where am I?". The breadcrumb's job is "how do
I go back?" — at the root, there is no back, so the row is dead weight.

### H3. Card-on-card chrome

**Symptom:** Active page chip "feels heavy", "looks like a button stuck on
another button", a chip on a tonally-recessed row reads as one elevation too
many.

**Detection:** Inspect the row's background (e.g. `bg-muted`, `bg-chrome-subtle`,
or any tonal recess). Then inspect the chip inside that row (e.g. `bg-card
border`). Two distinct elevations within ~6 px of each other = card-on-card.

**Fix shape:** The chip must adopt the row's elevation, not introduce its own.
Either drop the chip's `bg-*` + `border` and let typography (`font-semibold`
+ `text-foreground`) carry the active signal, OR drop the row's tonal recess
and let the chip be the only painted surface. Pick one elevation per row.

### H4. Brand-color competition

**Symptom:** "Page feels noisy even though it's clean", "I can't tell which
button is the primary action", "everything looks important".

**Detection:** Take a desktop screenshot. Count surfaces tinted in the brand
color (border, fill, ring, text) within one visual zone. Subtract: the
single intended primary CTA + status chips that *carry* meaning. Anything
left over (a brand-tinted breadcrumb chip, a brand-tinted tab background, a
brand-tinted home icon border) is competition.

**Fix shape:** Demote the chrome surfaces to neutral (`text-muted-foreground`,
`bg-transparent`, `border-border/40`). Reserve the brand color for: the
single primary CTA per fold, real status indicators (success / progress /
new), and the active-item *micro-indicator* (not the cell background).

### H5. Library-injected inline width beats your CSS rule

**Symptom:** "Column is squeezed and truncating important info while the
adjacent column has wasted space", "my responsive CSS isn't applying".

**Detection:** When using TanStack Table, AG-Grid, MUI DataGrid, Chakra
DataTable, react-table, or any headless data-grid, check whether the library
emits inline `style={{ width: ... }}` from `header.getSize()` /
`column.size`. Then check whether your overriding CSS rule uses `!important`
AND is unscoped (or scoped to the right viewport). Open DevTools → inspect
the `<th>` / `<td>` → look at "Computed → width" → if the value comes from
`element.style` and your rule shows as crossed-out, you've lost the
specificity war.

**Fix shape:** Three options, in order of preference:
1. Add `width: auto !important; max-width: none !important;` to your
   `[data-priority="primary"]` (or equivalent) rule, scoped to **all
   viewports** (no `@media` wrapper unless you mean it).
2. Set `table-layout: fixed` on the parent table so the browser ignores
   per-cell intrinsic widths.
3. Drive the library via CSS variables (`style={{ "--col-width":
   header.getSize() + "px" }}`) and have your priority rule overwrite the
   variable, not the inline width.

### H6. Wasted-column / squeezed-column pair

**Symptom:** Same as H5 from the *user* perspective ("wasted space + truncation"),
but the cause may be your own column-def defaults, not a third-party
library.

**Detection:** For each table column, compute `reserved-width / max-content-width`.
If a column reserves ≥ 2.5× its widest content while a sibling column
truncates, the allocation is wrong. Easy probe: the user's "件数" (count)
column is 150 px wide for 2-digit numbers; the "書類" (name) column is
150 px wide for 30-char Japanese strings. Ratio: 7.5× vs 0.4×.

**Fix shape:** Add a `priority` axis to your column meta (`primary` | `meta`
| `action`) and a CSS cascade that says:
- `[data-priority="primary"]` → `width: auto !important` (gets the slack)
- `[data-priority="meta"]` → `width: 1% !important; white-space: nowrap`
  (shrinks to content)
- `[data-priority="action"]` → fixed pixel width matching the icon button
  (e.g. `40px`). Apply at every viewport, not just mobile.

### H7. Hover-only affordance on a touch device

**Symptom:** "I can't reach this button on my phone", silent because the user
didn't even know the button existed.

**Detection:** Grep for `group-hover:opacity-100`, `opacity-0 hover:opacity-100`,
`md:opacity-0`, or any pattern that hides an action behind hover. Check the
parent: does it have a touch fallback (`focus-within:opacity-100`,
`sm:opacity-0` only above the touch breakpoint, or always-visible on
`<sm`)?

**Fix shape:** Hover-reveal is acceptable only at `≥sm` (pointer breakpoint).
Below that, the action must be always-visible OR exposed via long-press /
swipe / a tap-to-open row menu. Pattern: `sm:opacity-0
sm:group-hover:opacity-100 focus-within:opacity-100`.

### H8. Hit-area baked into visual chrome

**Symptom:** "This icon button feels chunky / button-shaped" even though the
icon itself is fine.

**Detection:** Look for icon buttons that are `w-11 h-11` (44 px) with a
`bg-card border` chrome. The visual chrome is sized for the *touch target*,
not for the *icon's optical weight*. Result: a 14-px icon sits in a 44-px
bordered card, looking marooned.

**Fix shape:** Separate hit area from visual chrome:
- Visual: 24–28 px square, no border, hover-paint only.
- Hit area: extend invisibly via `min-h-11 min-w-11 -my-1.5 -mx-1.5` (or
  the equivalent negative-margin trick for your stack). The thumb still
  gets 44 px; the eye gets a calm icon.

### H9. Stale data-priority / hidden-on-mobile that no longer matches the column

**Symptom:** A column shows on desktop, disappears at tablet, then *reappears*
on mobile (or vice versa); user reports "missing column" or "duplicate info
on mobile".

**Detection:** Search for `hideOnMobile`, `hideBelowMd`, `mobile:hidden`,
`hidden md:table-cell`, etc., and confirm the breakpoints match the rest of
the responsive system. A column tagged `hideBelowMd: true` but rendered via
`sm:hidden` will appear on `sm` and disappear on `md+`, which is exactly
inverted.

**Fix shape:** Centralize the breakpoint axis in the column meta
(`hideBelowSm` | `hideBelowMd` | `hideBelowLg`) and have the renderer derive
the className from it, not vice versa. Audit by listing every column and
its visibility per viewport in a table; fix the inverted ones.

### H10. Active state has no `aria-current`

**Symptom:** Visual active state is correct but screen-reader users (and
keyboard-tab users) can't tell which item is current.

**Detection:** Grep for the active-state className pattern (e.g.
`text-brand`, `bg-brand-soft`, `data-state="active"`) and check the same
JSX node for `aria-current`. Missing on tabs / nav links / breadcrumb final
crumb / dock items = bug.

**Fix shape:** Add `aria-current="page"` to nav links / dock items / breadcrumb
final crumb, `aria-selected="true"` (and `role="tab"`) to tabs. The visual
treatment + ARIA must always agree.

### H11. Motion that fights motion

**Symptom:** Tab switch feels janky; sliding underline stutters; Framer
Motion enter animation overlaps a CSS transition.

**Detection:** Inspect the active-state element. If you have BOTH a
framer-motion `layoutId` shared element AND a CSS `transition: all 200ms`
on the same property, they fight. Same for `whileHover` + CSS `:hover`
transition on the same property.

**Fix shape:** One animation system per property. Prefer framer-motion
`layoutId` for layout-shared transitions; prefer CSS `transition-colors`
for color-only state changes. Never both. Always honor
`prefers-reduced-motion`.

### H12. Conditional slot reserves space for absent content

**Symptom:** "Card looks empty / has a giant gap", "this section feels
unbalanced".

**Detection:** Find any wrapper with `min-height` on a slot whose child is
optional (`media`, `aside`, `eyebrow`, `cover`, `secondaryCTA`,
`illustration`). Render the page in zero-state and check whether the
reserved space collapses. If the wrapper still occupies its `min-h`, the
slot is reserving space for content that may never arrive.

**Fix shape:** Either drop the wrapper when the child is null (`{child &&
<Wrapper>{child}</Wrapper>}`) or collapse the floor at narrow viewports
(`min-h-0 sm:min-h-40`). Never pay vertical real estate for absent content.

### H13. Wrapper-collapsed tiles (Tooltip / Slot inline-flex)

**Symptom:** "This week pills are weird", "tiles look small with huge
gaps between them", "the 3-up grid isn't filling the row". Visually:
3 (or 4) repeated tiles render at content-width, anchored
left/middle/right of their grid cells, with large gaps that the grid
template should not produce.

**Detection:** Programmatic, not visual — screenshots can hide this:

```js
// In the browser console / Playwright evaluate / playwright-cli
const tiles = [...document.querySelectorAll('<your-tile-selector>')]
  .map(el => Math.round(el.getBoundingClientRect().width));
const span = Math.max(...tiles) - Math.min(...tiles);
console.table({ tiles, span });
// span > 1px on tiles in `grid-cols-N gap-N` === wrapper-collapse bug
```

Then walk *up* the DOM from a leaf tile and `getComputedStyle(el).display`
each ancestor. The first one returning `inline-flex` / `inline-block` /
`inline` is the culprit. Common causes (any stack):

- A `Tooltip` / `Popover` / `Trigger` / `Slot` primitive defaults the
  wrapper to `display: inline-flex` (Radix, Headless UI, custom).
- A grid template uses bare `1fr` (which is `minmax(auto, 1fr)`) and a
  child has intrinsic content wider than the cell.
- A flex parent without `min-width: 0` lets a child's intrinsic content
  size dictate the track width.
- An animation library (Framer Motion `m.div`, Reanimated, GSAP) injects
  inline `display: inline-block` for transform performance.
- A `<Slot>` / `asChild` / `cloneElement` pattern where the inner
  component drops `className` (so `w-full` is silently lost).

**Fix shape:** Patch the *wrapper*, not the leaf:

- Add a prop to the wrapper that lets the consumer opt into stretch
  behaviour (`block`, `stretch`, `fillContainer`) and use it at the call
  site. If most consumers want stretch, change the default and document
  why in a code comment.
- Or: replace `grid-cols-N` with
  `grid-cols-[repeat(N,minmax(0,1fr))]` so a single oversized child
  can't blow out the track.
- Or: add `min-width: 0` to the grid item and `width: 100%` (or
  `flex: 1 1 0`) to the inner element.

Verify with the same DOM probe — `widthSpan` must drop to `≤ 1px` after
the fix. See *Primitive-First Patch Rule* below for the propagation
playbook (one wrapper fix, N consumers fixed).

### H14. Information duplication per viewport fold

**Symptom:** "Wasted space", "feels padded", "this is the third time
I've seen 0/10 today on the same screen". Each instance is innocent on
its own; together they flatten hierarchy and signal that no rank was
applied.

**Detection:** For each viewport-height fold of the rendered page,
list every datum (number, percentage, status word, date, count) and how
many times it appears. Anything appearing ≥ 2× is a duplicate.

```
Fold 1 of /home @ 390×844:
- "0/10 words today"   ×3 (eyebrow metric, action pill, footer strip)
- "0%"                  ×2 (action pill, Today metric tile)
- streak count "1d"     ×2 (eyebrow metric, Streak tile)
```

**Fix shape:** Pick the *most actionable* placement for each datum
(usually next to the primary CTA, or as the largest type in the focal
region) and delete every other instance. Replace the now-empty slots
with *complementary* data — if you kept the daily goal, replace
duplicates with streak count, reviews-due, or "vs last week"
trend. Each delete is a hierarchy upgrade for what stays.

Cite NN/g #8 (Aesthetic & Minimalist) in the write-up.

### H15. Monochromatic surface (domain-colour-tier mismatch)

**Symptom:** "Looks really weird and monochromatic", "feels
AI-generated", "color could be bolder". On a tier-A/B product (consumer,
gamified, learning, lifestyle — see *Domain Colour Tier* in §1.5), the
3-up of category tiles all read the same neutral hue when blurred, even
though every tile has a `tone` prop set.

**Detection:** Run the *category squint* (Step 3a):

1. Take a desktop screenshot.
2. Apply a 10–15px Gaussian blur (any image tool).
3. Look at the repeated tile group: should you see 3–4 distinct colour
   blobs (tier A/B) or near-uniform achromatic with one alert pop (tier
   C/D)?
4. Mismatch → token tints are the wrong tier for this product.

Generic cause: a `Card` / `Tile` / `MetricBox` primitive uses tints in
the `/5–/10` range (tier-D defaults). Faint enough to be "tasteful" on
a finance dashboard, far too faint for a learning app where colour *is*
the gamification signal (Duolingo: green=correct, red=hearts,
orange=streak…).

**Fix shape:** Identify the product tier (§1.5) and bump the token
scale to match:

- Tile background: `/5–/10` → `/15–/25` gradient.
- Tile ring: missing or `/10` → `ring-1 ring-<tone>/30` (separates
  adjacent tiles even when blurred).
- Value text: neutral → `text-<tone>` (the number dominates the squint
  test; colour the number, not just the icon).
- Icon background: `/10` → `bg-<tone>/25 ring-<tone>/40` so icons read
  as semantic chips, not neutral glyphs.
- Reserve neutral surface for *zero-state* / disabled tiles only.

Patch at the primitive (token scale or shared tile component) so the
fix propagates — see *Primitive-First Patch Rule*.

### H16. Left-anchored stacked cards (no horizontal balance)

**Symptom:** "Everything stacked on top of each without any designer
thought, aligned to left", "feels templated", "no rhythm". Every card
is full-width, every label sits at the left edge, every metadata pill
sits below the title — no horizontal counter-weight.

**Detection:** Take a desktop or tablet screenshot. Mentally draw a
vertical line down the middle of each stacked card. If every card's
visual centre of gravity sits left of that line, you have a
left-anchored stack. Common cause: every primitive (`Card`, `Row`,
`ListItem`) renders its action / metadata under the title in a vertical
flow, never to the right.

**Fix shape:** Re-introduce horizontal weight (one move per card is
enough; doing all four creates noise):

- **Pin metadata right.** Move timestamp, count, status pill,
  chevron, or category badge to the right edge via Gestalt common
  region (`flex justify-between`).
- **Promote one card to split layout.** Image-left + text-right (or
  reverse) at the densities that allow it.
- **Vary card height by importance.** Hero card 1.4×, secondary 1.0×,
  metadata 0.6× — uniform height is what makes the stack feel
  templated.
- **Replace one full-width card with a 2-up grid** of equal-importance
  siblings — the grid breaks the single-column rhythm without removing
  content.

Avoid: adding decorative right-side icons that aren't tied to data —
that's just visual noise. Right-anchored elements must carry meaning.

---

## Pattern Library

### Crowded Card

Before: title, subtitle, description, status, stats, tags, actions all top-stacked.

After:

- Top: eyebrow + title + one useful line.
- Middle: media or breathing room.
- Bottom: stats/metadata in a separated footer band.
- Action: stable corner, footer, or detail drawer CTA.

### Dead Grid Space

Try:

- `grid-auto-flow: dense` / masonry-like placement if supported by the stack.
- Resize spans by content importance, not by project age or arbitrary order.
- Use wide cards for rich horizontal screenshots; portrait/device galleries for
  mobile apps.
- Anchor content to top and metadata to bottom so empty space becomes rhythm.

### Hard Scroll Cut

Try:

- `mask-image: linear-gradient(...)` with `-webkit-mask-image`.
- Top/bottom "curtain" gradients matching the surface.
- Scroll shadows or slim progress rails.
- Extra padding so content is not permanently hidden under the fade.

### Flat Interaction

Try:

- 100-300ms ease-out feedback on direct actions.
- Slight lift/translate, underline draw, icon morph, or preview reveal.
- Motion that starts from the element the user acted on.
- Reduced-motion fallback that preserves state change without movement.

### Overexplained Page

Try:

- Keep only the highest-scent labels visible.
- Move explanation into tooltips, detail drawers, or empty-state education.
- Use progressive disclosure for advanced filters and rarely used controls.

### Heavy Active State (tabs, dock cells, sidebar items, breadcrumb)

Symptom: full-cell `bg-active` / `bg-brand-soft` background fill on the
active item makes it look 1.5× heavier than its inactive siblings, even
when layout dimensions are identical. User reports "highlight is weirdly
big", "heights are incoherent", "clunky".

Fix shape (pick by element type — same shape every time, generic across
stacks):

- **Tab row** → drop the cell background. Active = `text-<accent>` +
  `font-semibold` + a 2 px accent underline at `bottom-0`. The count badge
  tints to accent. Inactive padding === active padding.
- **Bottom dock cell** (Material 3 NavigationBar pattern) → drop the cell
  background. Active = a `h-6 px-3 rounded-full bg-<accent>-soft` pill
  wrapping ONLY the icon, plus `text-<accent> font-semibold` on the label.
  Cell chrome stays neutral so the dock reads as a single calm strip.
- **Sidebar item** → drop the full-row background. Active = a leading 2 px
  accent rail (`before:absolute before:left-0 before:w-0.5 before:bg-<accent>`)
  + `text-foreground font-medium`. Hover paints `bg-muted/40` (calm wash,
  visually distinct from active).
- **Breadcrumb current crumb** → drop the bordered card chrome entirely.
  Active = `text-foreground font-semibold` plain inline span +
  `aria-current="page"`. The row's tonal recess is the only background.

Rule of thumb: if the active treatment increases the bounding box's
*painted area* by more than ~15 %, the user will read it as "clunky".
Material 3, Stripe Apps, Linear, and Vercel all obey this — when in doubt,
copy them.

### Wayfinding-on-Root Tautology

Symptom: on the root route (`/`, `/dashboard`, `/home`), the page name
appears 3+ times — breadcrumb chip says "Home", the dock has Home active,
the page H1 / greeting says "Home" — and the user calls it "atrocious" or
"redundant".

Fix shape:

- On the root path, suppress the entire breadcrumb / context row (e.g.
  `showContextRow={false}` or gate at the layout: `pathname !== "/" &&
  <BreadcrumbRow />`). The dock active indicator + the page's H1/greeting
  already answer "where am I?".
- Breadcrumbs answer "how do I go up?" — at the root, there is no up, so
  the row is dead weight.
- On nested pages, the breadcrumb earns its row again.

Generic rule: count how many chrome zones display the page name on the
current route. If ≥ 2 say the same word for the *current* page (excluding
the H1, which is the only authoritative one), the others are tautology.

> **Note on the failures formerly listed here.** "Wrapper-Collapsed
> Tiles", "Dead Conditional Slot", "Monochromatic Surface",
> "Information Duplication", and "Left-Anchored Stacked Cards" are now
> documented in *Hidden Failure Modes* (H12–H16) above — that section
> includes both detection probes (DOM measurement, blur tests, dup-datum
> scans, tier-mismatch checks) AND fix shapes. The Pattern Library is
> reserved for compositional patterns; failure modes with a "how to
> detect" component live in §Hidden Failure Modes.

---

## Primitive-First Patch Rule

When a UI bug repeats across pages, tiles, rows, or routes, **patch the
primitive that hosts the bug, not every consumer**. This is the
single highest-leverage move available to an enhancer.

Workflow:

1. Find the bug live (e.g. tile widths uneven).
2. Walk *up* the component tree from the broken leaf. Stop at the first
   wrapper with a `display`, `width`, `flex-shrink`, `aspect-ratio`,
   `min-h`, or `slot` constraint that is forcing the bug.
3. Search for other call sites of that wrapper:

   ```
   grep -r "<Tooltip" src/ | wc -l        # how many sites are affected?
   grep -r "<EditorialHero" src/ | wc -l
   grep -r "asChild={" src/ui/<wrapper>/  # slot-pattern check
   ```
4. If 3+ sites use the same wrapper, the fix lives in the wrapper:
   - Add a prop that lets the consumer opt into the correct behaviour
     (`block`, `stretch`, `fillContainer`, `compact`) — never break
     existing call sites.
   - Pick a default that matches what most consumers actually want.
   - Document the intent in a code comment — a future enhancer must
     understand *why* the prop exists, not just *what* it does.
5. Verify with the *DOM uniformity gate* on at least two consumer
   pages — same wrapper, different contexts.

Anti-pattern (do not do this): adding `w-full !w-[calc(100%-var(--gap))]`
to one specific tile to force-fix the visible page. The bug remains
everywhere else; you've just hidden it on the page you happened to look
at.

---

## Visual Psychology Map

Use these as design justifications:

- **NN/g visual hierarchy**: use contrast, scale, and grouping to guide the eye.
- **NN/g heuristic #8**: maximize signal, minimize noise; clarity beats flourish.
- **Progressive disclosure**: defer secondary or advanced detail until needed.
- **Fitts's Law**: make important targets large, close, and stable.
- **Hick's Law**: reduce visible choices or stage them.
- **Proximity/Common Region**: group related elements with spacing or containers.
- **Aesthetic-usability effect**: polish can increase perceived trust, but only
  when the UI remains clear.
- **Change blindness**: subtle motion can confirm state changes users might miss.

---

## Motion Rules

- Direct feedback: 100-180ms.
- Small state change: 180-260ms.
- Drawer/modal/large spatial transition: 220-360ms.
- Prefer ease-out for entering/settling.
- Never animate layout so much that text being read moves unexpectedly.
- Avoid infinite motion except quiet status/progress.
- Always respect `prefers-reduced-motion` or the repo's motion abstraction.

Motion must answer at least one question:

- Did my action work?
- What changed?
- Where did this thing come from or go?
- What can I interact with?
- How far through this surface/process am I?

---

## Implementation Rules

1. Change layout and information placement before color/motion.
2. Keep edits local to the page and existing primitives.
3. Use existing design tokens. Do not invent new colors/radii/shadows unless the
   repo has no system.
4. Wire UI state to real backend/domain state. Do not add hardcoded counts,
   fake statuses, placeholder progress, decorative badges, or mock cards unless
   the user explicitly asks for a prototype.
5. When visual feedback needs data the frontend lacks, inspect the schema/API
   boundary and add the smallest durable field or derived helper needed.
6. Add comments only for non-obvious design intent.
7. Prefer CSS/Tailwind composition over bespoke JS. Use JS only for stateful
   scroll progress, measurement, or interaction state.
8. Avoid accessibility regressions: focus rings, keyboard access, color contrast,
   readable text, and reduced motion must survive.
9. If adding masks/fades, ensure content remains reachable and not permanently
   obscured at scroll boundaries.

---

## Enhancement Plan Template

```
## UI Enhancement Plan

Current state:
- [What the page visually does now]

Content rank:
- Primary:
- Secondary:
- Metadata:
- Actions:
- Ambient:

Planned changes:
| Pain | Principle | Move | File |
|------|-----------|------|------|
| Text is crowded at top | hierarchy, proximity | pin metadata to bottom band | ... |
| Footer cuts content | continuity | add scroll fade + padding | ... |
| Grid has dead space | balance | resize spans + dense placement | ... |

Verification:
- 1440:
- 1024:
- 800:
- Reduced motion:
- Dark/light:
```

---

## Quick Sanity Checks

- [ ] Domain colour tier identified (A/B/C/D) and applied consistently.
- [ ] Primary content is obvious at a *hierarchy squint* (first eye target).
- [ ] Tier A/B: categories distinguishable at a *category squint* (colour alone).
- [ ] Repeated tiles measured: rendered widths within 1px of each other.
- [ ] No wrapper between a grid cell and its child is `inline-flex` /
      `inline-block` / content-width-only when it should fill.
- [ ] Every conditional slot (`media`, `aside`, `cover`) tested with sparse
      / zero-state content; no dead `min-h` floors on mobile.
- [ ] No datum (number, word, date, status) repeats inside one viewport
      fold; duplicates either deleted or replaced with complementary data.
- [ ] At least one piece of right-anchored metadata per stacked card to
      avoid left-alignment monotony.
- [ ] Metadata does not compete with headings.
- [ ] At most 2-3 type scales dominate the page.
- [ ] Related elements are grouped by proximity or common region.
- [ ] Empty space feels intentional, not accidental.
- [ ] Secondary details are progressively disclosed.
- [ ] Scroll/overflow edges are communicated, not chopped.
- [ ] Microinteractions have a purpose and respect reduced motion.
- [ ] No CTA wraps or changes hit-area shape across viewports.
- [ ] Repeating bug → patched at the primitive, not the consumer site.

### Hidden-failure-mode audit (run before declaring done)
- [ ] **H1 active-state mass**: active tab/dock/nav item's bounding box ≈
      inactive sibling's (within ~15 % painted area). Squint test passes —
      no sibling looks "weirdly big".
- [ ] **H2 chrome tautology**: on the current route, the page name appears
      in ≤ 1 chrome zone (the H1 is canonical; everything else is suppressed
      if it would echo the same word — especially on root / index pages).
- [ ] **H3 card-on-card**: no chip with `bg-card border` sits on a row that
      already has a tonal recess. One elevation per row.
- [ ] **H4 brand-color budget**: ≤ 1 brand-tinted surface per visual zone
      (the primary CTA), excluding status chips that *carry* meaning and
      the active micro-indicator.
- [ ] **H5 library inline width** (TanStack Table, AG-Grid, MUI DataGrid,
      Chakra, react-table) is explicitly overridden when your responsive CSS
      rule needs to win — confirm via DevTools `Computed → width` that your
      rule is not crossed-out at every viewport.
- [ ] **H6 column allocation**: no column reserves ≥ 2.5× its widest content
      while a sibling truncates.
- [ ] **H7 hover-reveal touch fallback**: every hover-revealed action has a
      tap-only fallback below the pointer breakpoint.
- [ ] **H8 hit area vs visual chrome**: 44 px touch targets achieved via
      invisible negative-margin extension, not by inflating the visual
      chrome (no `w-11 h-11 bg-card border` icon buttons).
- [ ] **H9 responsive visibility breakpoints** match across the column-meta
      flag (`hideBelowMd`) and the className (`md:table-cell`) — no
      inverted ranges.
- [ ] **H10 active state has aria-current** (`aria-current="page"` for nav,
      `aria-selected="true"` for tabs); ARIA and visual treatment agree.
- [ ] **H11 motion systems don't fight** on the same property
      (framer `layoutId` xor CSS `transition`).
- [ ] **H12 conditional slots** collapse to zero when their child is null.
- [ ] **H13 wrapper-collapsed tiles**: every repeated tile group's
      `widthSpan ≤ 1px` (run the DOM probe in §3b). No ancestor between
      grid cell and tile is `inline-flex` / `inline-block` /
      content-width-only when it should fill.
- [ ] **H14 information duplication per fold**: no datum (number, word,
      status) appears more than once inside any single viewport fold.
      Duplicates either deleted or replaced with complementary data.
- [ ] **H15 monochromatic surface**: tier-A/B products show distinct
      colour blobs per category at the 10–15 px blur test; tier-C/D
      products show near-uniform achromatic surfaces with colour
      reserved for status alerts only.
- [ ] **H16 left-anchored stack**: every stacked card has at least one
      piece of right-anchored metadata (timestamp, count, chevron,
      status pill, badge) tied to data — no decorative right-side icons.

### Repo health
- [ ] Lints/build/tests pass for touched files.

---

## When Not To Use

- Pure workflow correctness, data modeling, or task usability: use
  `enhance-web-ux` first.
- Pure design-token compliance audit: use `audit-uiux-design-system`.
- Report-only heuristic audit: use `audit-ux`.
- Brand-new product/page from scratch: use `design-frontend`.

---

## Research Anchors

- **NN/g — Visual Hierarchy**: contrast, scale, grouping, and whitespace
  guide focus; squint with 5–10px blur to verify intended hierarchy.
  <https://www.nngroup.com/articles/visual-hierarchy-ux-definition/>
- **NN/g — Defer Secondary Content for Mobile**: first screen ruthlessly
  focused on the minimum information needed to communicate the top point;
  duplication = wall-of-text by another name.
  <https://www.nngroup.com/articles/defer-secondary-content-for-mobile>
- **NN/g — Content Dispersion (Mobile-First on Desktop)**: stretching
  design-mobile-first patterns to wide viewports fragments related content;
  same logic applies in reverse to dense conditional slots on mobile.
  <https://www.nngroup.com/articles/content-dispersion/>
- **NN/g — 5 Principles of Visual Design**: scale, hierarchy, balance,
  contrast, Gestalt — and why "no more than 3 different sizes".
  <https://www.nngroup.com/articles/principles-visual-design/>
- **MDN — `min-content` / `auto` sizing**: grid/flex children have
  intrinsic `min-width: auto`; explicitly set `min-width: 0` to release
  it. The canonical fix for "tiles won't shrink/fill evenly".
- **Adam Argyle (Chrome DevRel) — Unintuitive CSS Layout Solutions**:
  `min-height: 0`, `min-width: 0`, `flex-shrink: 0`, and
  `repeat(auto-fill, minmax(min(10rem, 100%), 1fr))` — short, generic.
  <https://nerdy.dev/3-unintuitive-layout-solutions>
- **Duolingo — Core Tabs Redesign + Gamification as Design Language**:
  reference for tier-A vibrant semantic palettes (green=correct,
  red=hearts, orange=streak…). Each colour carries a system meaning;
  muted palettes undermine the tone.
  <https://blog.duolingo.com/core-tabs-redesign/>
- **Stripe / Vitality / ColorArchive on SaaS dashboards**: reference for
  tier-D restraint — 60-30-10 rule, semantic colour reserved for status,
  achromatic chrome.
  <https://vitalitydesignsystem.com/foundations/colour/>
- **Figma — 2026 Web Design Trends**: vibrant maximalist returning,
  especially for lifestyle / youth / learning brands; supports the
  domain-tier framing.
  <https://www.figma.com/resource-library/web-design-trends/>
- **Linear — A calmer interface for a product in motion (2025)**: "structure
  should be felt, not seen" — chrome recedes so content takes precedence;
  borders softened, sidebars dimmed, icon backgrounds removed. Canonical
  reference for the *Calm Chrome* critical rule and Hidden Failure Mode H2.
  <https://linear.app/now/behind-the-latest-design-refresh>
- **Linear — How we redesigned the Linear UI part II**: tonal recess on the
  inverted-L app chrome; harmonized header bars; LCH-based theme generation
  to enforce consistent elevations. Reference for chrome calm-down work.
  <https://linear.app/now/how-we-redesigned-the-linear-ui>
- **Material 3 — NavigationBar spec**: active indicator is a 64×32
  `cornerFull` pill in `SecondaryContainer` color wrapping the icon — never
  a full-cell fill (`ActiveIndicatorWidth = 64dp`,
  `ActiveIndicatorHeight = 32dp`, `ActiveIndicatorShape = CornerFull`).
  Canonical reference for Hidden Failure Mode H1 and the *Heavy Active
  State* fix shape on bottom navigation.
  <https://m3.material.io/components/navigation-bar/overview>
- **NN/g — Navigation: You Are Here**: prominence (color, weight, offset)
  is how users locate themselves; many active-state designs are too
  subtle (missed) or too loud (clunky). Reference for active-state tuning.
  <https://www.nngroup.com/articles/navigation-you-are-here/>
- **NN/g — Button States**: enabled / disabled / hover / focus / pressed
  must each be visually distinct *without* changing layout dimensions.
  Reference for the active-mass-mismatch fix.
  <https://www.nngroup.com/articles/button-states-communicate-interaction/>
- **TanStack Table — Column Sizing Guide** + **Issue #5870**: `header.getSize()`
  emits inline `style={{ width }}` per cell that beats unscoped CSS unless
  `!important` or `table-layout: fixed`. Same gotcha applies to AG-Grid,
  MUI DataGrid, Chakra DataTable, and most headless data-grid libraries.
  Canonical reference for Hidden Failure Mode H5 and H6.
  <https://tanstack.com/table/v8/docs/guide/column-sizing>
- **MDN CSS masking**: gradient `mask-image` for soft edge fades.
