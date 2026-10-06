# enhance-web-ux — forensics

The extended rules and the full procedure for Steps 1, 2, and 2.5: recon recipes, the three-viewport capture loop, and the four DOM-forensics gates.

## Contents

- Extended rules
- Step 1 — Recon (1a–1e)
- Step 2 — Live (2a–2c)
- Step 2.5 — DOM forensics (2.5a–2.5d)

## Extended rules

> **Screenshots are necessary but not sufficient.** Many of the worst pains
> are *silent* — wrapper-collapsed tiles, dead conditional slots, the same
> datum repeated 3× in one fold, monochromatic surfaces on a tier-A
> consumer product. None of these are reported by users and most of them
> survive a cursory screenshot review. **Add the DOM Forensics pass
> (Step 2.5) and the Silent-Pain Catalogue (Step 3b) on every enhancement.**

> **Patch the primitive, not the consumer.** When a layout, colour, or
> wrap bug repeats across multiple call sites, the wrapper / helper /
> token is broken — fix it once at the definition. A `Tooltip` defaulting
> to `inline-flex`, an `EditorialHero` with an unconditional 160px media
> floor, a `Badge` without `whitespace-nowrap` — every band-aid you apply
> at the consumer leaves the bug live for the next page.

> **Audit the library-vs-CSS specificity war.** Headless data-grid
> libraries (TanStack Table, AG-Grid, MUI DataGrid, Chakra DataTable,
> react-table) emit inline `style={{ width: header.getSize() + 'px' }}`
> on every cell. Inline styles beat your CSS unless you use `!important`,
> `table-layout: fixed`, or drive widths through CSS variables that the
> rule then overwrites. A "wasted space + truncated content" report on a
> table page is almost always this gotcha — the fix is **not** another
> wrapper, it's auditing the column-meta CSS rules at every viewport with
> DevTools `Computed → width` open. Same audit applies to Chart.js / D3
> defaults, Mantine SegmentedControl, MUI Tabs (`MuiTab-root` width), etc.

> **Chrome is wayfinding, not content.** Header rows, breadcrumb chains,
> tab strips, dock cells, sidebars, toolbars all *support* the content —
> they should *recede*. If chrome competes for visual weight with the
> page body (full-cell brand-color washes, bordered card-on-card chips,
> heavy Home-as-button chrome, redundant breadcrumbs on root routes), the
> user reports "atrocious" / "clunky" / "heavy". Calm protocol: strip
> backgrounds → borders → tints → fills, in that order, until the chrome
> reads as a tonal recess that frames the content. For active-state
> signaling, prefer micro-indicators (underline, M3 32×16 pill on icon,
> count-badge tint, font-weight bump) over full-cell fills — see Hidden
> Failure Modes H1, H2, H3 in `enhance-web-ui`.

> **One brand-color element per visual zone.** A page should have ONE
> brand/accent-tinted element per zone (header, breadcrumb, tab row, dock,
> body). If breadcrumb chips, tab badges, AND the actual primary CTA all
> wear the brand color, the actual CTA loses scent. Demote the chrome
> ones to neutral typography; reserve brand color for the action the user
> is here to take + status chips that *carry* meaning + the active
> micro-indicator.

## Step 1 — Recon (1a–1e)

### 1a. Read the route entry

```
Glob: **/pages/**/<route>*.tsx OR **/app/<route>/page.tsx
Read: the route file in full (not snippets)
```

Extract:

- **Workflow position**: where does this page sit in the user journey? (entry, processing,
 outcome, hub)
- **Primary task**: what is the ONE thing a user comes here to do?
- **Data domain**: what entities are displayed? (files / invoices / messages / tax forms / …)
- **Adjacent screens**: what page do users come from / go to next?

### 1b. Map the component tree

```
Grep: imports inside the route file
Read: each top-level child component
```

Build a small ASCII tree of components and what each owns:

```
<RoutePage>
├── <PageHeader> — title + breadcrumbs + summary KPIs
├── <Toolbar> — filters + actions
├── <FolderTree> — hierarchical list (the meat)
│ └── <TreeNode> — single row renderer
└── <DetailPanel> — selection-driven inspector
```

### 1c. Inventory the data shape

For every entity rendered, list ALL fields available — including the ones the page does NOT
currently show. Many enhancement opportunities are "we already have this data, we just don't
display it" (AI metadata, link status, aggregates, last-modified, owner, …).

```
Read: src/types/<entity>.ts
Read: src/features/<feature>/types.ts
Read: API loaders/actions/routes that fetch or mutate the entity
Read: schema/migrations/models when UI state depends on persisted status
```

Also identify whether each visual cue is backed by real product state. Badges,
progress, alerts, disabled states, empty states, and "recent" indicators should
map to data contracts or domain helpers, not hardcoded component guesses.

### 1d. Inventory primitives + tokens

```
Glob: src/components/ui/*.tsx — Badge, Button, Card, Tooltip, …
Read: tailwind.config.* OR globals.css — semantic colour tokens (signal-*, ai, brand, muted)
Glob: src/features/<feature>/helpers/* — domain helpers already available
```

Write the list down. You will refer to it in step 5 — every fix must use one of these.

### 1e. Look for usage docs / forbidden patterns

```
Grep: "NEVER|FORBIDDEN|DO NOT|avoid" in **/*.md AND component file headers
Grep: "@deprecated" in src
```

A common find: a primitive that documents "do NOT use bg-X with text-X" — respect it.

## Step 2 — Live (2a–2c)

### 2a. Three-viewport screenshot pass

Use playwright-cli. Always `resize` **before** navigating to the route you are judging, so
the page lays out at the target width from first paint:

| Viewport | What it exposes |
|---|---|
| 1440 × 900 | desktop, full data density |
| 1024 × 700 | tablet / split-screen — first place buttons & badges break |
| 800 × 700 | narrow — first place column truncation & wrap appear |

```bash
PW="npx --yes @playwright/cli@latest"; S="-s=ux-<route>"
$PW $S open --headed "<app-url>"
for wh in "1440 900" "1024 700" "800 700"; do
  $PW $S resize $wh
  $PW $S goto "<route>"                     # navigate AFTER resize
  sleep 2 && $PW $S snapshot
  $PW $S screenshot --filename ".playwright-mcp/ux-<route>-${wh// /x}.png"
  $PW $S console
done
```

### 2b. Click into representative items

A list page hides most of its bugs in the **expanded / selected / empty** states.
Programmatically click into:

- An empty container / folder / thread
- A populated container with diverse children
- A row with the maximum number of badges / metadata
- A search-with-no-results state

### 2c. Record what you see, not what you expect

For each screenshot capture, write 2-3 lines:

```
1440 — toolbar fits, but `通知書ZIP` button label competes with primary CTA
1024 — `アップロード` button is OK, `通知書ZIP` collapses to icon (no label)
 800 — folder badges (経費 / 通知書) wrap to 2 lines under the name; status
 chip wraps 未処→理 onto a new line because column is 64px
```

## Step 2.5 — DOM forensics (2.5a–2.5d)

Screenshots show *what looks weird*. DOM forensics shows *why*. Run this
pass before declaring the page understood, especially when a user
reports "looks weird", "feels off", "stacked", or "monochromatic" — those
are usually symptoms of one of the four silent bugs below.

### 2.5a — Repeated-element uniformity gate

For every group that *should* render with uniform widths/heights — grid
tiles, segmented-control segments, table columns, sidebar nav rows, form
fields, stat cards — measure them. Run this in playwright-cli / console
/ Playwright `evaluate`:

```js
// Generic, framework-free — works on any web stack
const tiles = [...document.querySelectorAll('<your-tile-selector>')]
 .map(el => {
 const r = el.getBoundingClientRect();
 return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x) };
 });
const widths = tiles.map(t => t.w);
const widthSpan = Math.max(...widths) - Math.min(...widths);
console.table(tiles);
console.log({ widthSpan, uniform: widthSpan <= 1 });
// widthSpan > 1 on tiles that share `grid-cols-N` parent === wrapper-collapse bug
```

If `widthSpan > 1`, walk *up* the DOM tree from one of the leaf tiles
and `getComputedStyle()` each ancestor until you find one with `display:
inline-flex` / `inline-block`, or a flex parent without `min-width: 0`,
or a `grid-template-columns` that uses bare `1fr` with intrinsic-content
children. That ancestor is the bug — see Step 5b for the fix.

### 2.5b — Conditional-slot zero-state probe

For every slot/region defined as optional in the component (`media`,
`aside`, `cover`, `eyebrow`, `secondaryCTA`, `illustration`,
`footerSlot`, `extra`, `actions[1]`), inspect its **sparse** state. Open
the page as a brand-new user / empty account / fresh route and screenshot
at 800px. Look for slots that are *reserving floor space they don't fill*.

Symptoms (any one of these → confirmed dead slot):

- A region card that is >120px tall but contains <40 chars of content.
- A two-column grid where one column has just an icon and a number
 taking <20% of its track height.
- A `min-h-[Npx]` / `aspect-ratio` floor whose visible content occupies
 <40% of it.

Generic rule: if the slot was sized for *illustrations* / *charts* /
*device mockups*, it must be tested with *no illustration*. Many heroes
look great in marketing screenshots and become dead conditional slots
on a real first-run page.

### 2.5c — Information-duplication scan per fold

For every viewport-height fold of the rendered page, list every datum
(numbers, status words, dates, percentages, counts) and how many times
it appears:

```
Fold 1 of /home @ 390×844:
- "0/10 words today" ×3 (eyebrow metric, action pill, footer strip)
- "0%" ×2 (action pill, Today metric tile)
- streak count "1d" ×2 (eyebrow metric, Streak tile)
```

Anything that appears ≥2 times in a single fold is a duplicate. The
duplication is the diagnosis: pick the *most actionable* placement, keep
that one, replace the others with complementary data (or delete and
absorb the space into the chosen instance).

Cite NN/g #8 (Aesthetic & Minimalist) when documenting these.

### 2.5d — Category-squint colour pass

After the layout passes, take the desktop screenshot and apply a 10–15px
Gaussian blur (any image tool). For tier-A / tier-B products (consumer,
gamified, learning, lifestyle — see *Domain Colour Tier* in
`enhance-web-ui`), check that:

- A 3-up or 4-up of category tiles renders as 3–4 *distinct* colour
 blobs after blur. If they all blur to the same neutral, the tile
 tints are too faint for the product domain → bump from `/5–/10` to
 `/15–/25` per the tier-A scale.
- The primary CTA blurs to its own colour blob distinct from
 surrounding chrome. If it disappears into the surface tint, contrast
 is too low for a saturated-colour product.

For tier-D products (data dashboards, finance, admin) the *opposite*
result is correct — tiles *should* blur to near-uniform achromatic
neutrals with colour reserved for status pills. Tier mismatch is a
diagnosis, not just an aesthetic preference.
