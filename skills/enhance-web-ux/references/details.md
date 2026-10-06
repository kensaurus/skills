# enhance-web-ux — details

Steps 5b–9 of the skill (primitive-first patch decision, enhancement plan, implement, verify, write-up) plus the heuristic cheat sheet, sanity checks, scope limits, and research anchors.

## Contents

- 5b — Primitive-First Patch Decision
- Step 6 — Enhancement plan (the deliverable)
- Step 7 — Implement (smallest possible diffs)
- Step 8 — Verify (three viewports, before/after; 8b silent-bug gates)
- Step 9 — Write-up
- Heuristic Mapping Cheat Sheet
- Quick Sanity Checks Before You Stop (hidden-failure-mode audit, repo health)
- When NOT to Use This Skill
- Companion Files
- Research Anchors

### 5b — Primitive-First Patch Decision

Before writing the diff, decide: **does this bug live at the leaf I'm
looking at, or at a wrapper / token / helper higher up?** Use this
decision tree:

```
Is the bug visible on more than one page / route / row?
├── Yes → Walk UP the component tree from the broken leaf.
│        Find the first wrapper / helper / token that hosts the bug.
│        Search for other consumers of that wrapper.
│        If consumers ≥ 3 → fix at the wrapper (with a backward-compatible
│                          prop / opt-in behaviour / new default).
│        If consumers ≤ 2 → fix at each call site, but file a TODO to
│                          extract the wrapper when a 3rd consumer appears.
└── No  → Fix at the consumer. But still ask: "what shape of bug would
         appear if a 2nd consumer reused this pattern?" Document it.
```

Concrete cues that the wrapper is broken (not the leaf):

- Same primitive used N times, only some sites display the bug → **the
  bug is in a *combination* of wrapper default + consumer assumption**.
  Fix by making the consumer assumption explicit (new prop) and changing
  the default to match the common case.
- The leaf has `w-full` / `min-w-0` / `flex-1` already and is *still*
  collapsing → the wrapper is content-sizing the leaf. Patch the wrapper.
- The leaf has correct semantic tokens but renders monochromatically →
  the *token scale* is too faint for the product tier. Bump the token,
  not the leaf.
- A `min-h` / `aspect-ratio` floor reserves space for content the leaf
  doesn't have → the wrapper's *layout contract* assumes rich content.
  Patch the wrapper to make the floor conditional.

Anti-pattern (do not do this): adding `!w-full` / `!min-h-0` / inline
overrides to one specific site to force-fix the page you're looking at.
The bug lives on every other consumer page — you've just hidden it
locally.

**Document the why in a code comment on the wrapper change.** Future
enhancers must understand *why* the prop / default exists, or they will
revert it. Comment template:

```ts
// `block` makes the Tooltip wrapper a full-width flex column so a child
// `w-full` button actually fills its grid cell. Without this, the wrapper
// defaults to `inline-flex` and every stat tile shrinks to content width,
// leaving huge gaps in the 3-up grid (visible bug on /account → This Week
// before this fix). Repro: 3 StatExplainer tiles in `grid-cols-3 gap-2`
// — measure rect widths, expect uniform thirds.
```

---

## Step 6 — ENHANCEMENT PLAN (the deliverable)

A single, reviewable table. Order by impact / risk:

```
| Pri | File | Change | Heuristic | Risk |
|-----|------|--------|-----------|------|
| 1 | helpers/get-folder-category.tsx (NEW) | category → {icon, label, tone} | #2,#6 | low |
| 2 | helpers/get-folder-aggregates.tsx (NEW) | files[] + folderId → { count, ai, ¥, bytes } | #1,#8 | low |
| 3 | components/tree-node.tsx | use category icon + chips, drop empty cells | #1,#6,#8 | med |
| 4 | components/folder-management.tsx | drop hint row, retitle columns | #6,#8 | low |
| 5 | pages/<route>.tsx | toolbar nowrap + progressive labels | #4,#8 | low |
| 6 | components/ui/badge.tsx | (optional) add `whitespace-nowrap` to base | #4 | med |
```

For each row also note: edge cases, what to test, what NOT to touch.

---

## Step 7 — IMPLEMENT (smallest possible diffs)

Rules during implementation:

1. **Helper-first**. Land helpers (pure functions, no JSX) before touching the component
   that uses them. They're easier to lint, test, and review.
2. **One concern per edit**. If a single diff changes layout AND data AND tokens, split it.
3. **Data contract before decoration**. If the enhancement depends on status,
   progress, ownership, counts, validation, permissions, or timestamps, wire it
   to the existing backend/schema/API or add the smallest durable field/helper
   needed. Do not create mock arrays or fake visual state to make the screen
   look richer.
4. **Comment the WHY only**. Code that says "added `whitespace-nowrap`" is noise; a comment
   that says "Japanese 2-character labels in a 64px column wrap to 2 lines without nowrap"
   is gold. Future you (or another agent) won't undo it.
5. **Use semantic tokens**. `bg-signal-warn/10 text-signal-warn` not `bg-orange-100 text-orange-700`.
   Honour any "do NOT pair bg-X with text-X" warnings on the primitives you use.
6. **No new colours, no new sizes, no new radii.** If you reach for one, you missed step 1d.
7. **Empty / zero-state de-emphasis.** Apply `opacity-70` or a `muted` variant to rows with
   zero children / zero amount / zero activity. Don't hide them — the user still needs them
   in the count, but they shouldn't fight for attention.
8. **Density gradient via Tailwind breakpoints.** Show full labels at `lg:`, abbreviate at
   `md:`, icon-only at default. Never let a label wrap.
9. **Stack tight columns vertically.** A 64-78px status column with TWO chips (AI + status)
   stacks vertically (`flex-col gap-0.5`) — never horizontally.
10. **Match colour saturation to product tier.** Tier A/B (vibrant /
    consumer / learning / lifestyle) needs `/15–/25` tints with `/30–/40`
    rings to read as semantic categories at a squint. Tier C/D
    (productive / data-dense) keeps `/5–/10` for restraint. Tier mismatch
    = monochromatic / washed-out feel even when every token is correct.
    See *Domain Colour Tier* in `enhance-web-ui` SKILL.md.
11. **Make conditional slots collapse when empty.** Any optional region
    (`media`, `aside`, `cover`, `eyebrow`, `secondaryCTA`) must drop its
    wrapper or its `min-h` floor when its content is sparse. Reserve
    space only at densities where the slot will be filled. Inline
    sparse data into the action row instead of letting it float in a
    half-empty card.
12. **Delete duplicate datums; replace with complementary data.** When
    the same number/word/status appears twice in one fold, keep the
    most actionable placement and replace the others with a sibling
    datum (streak, "vs last week", reviews-due, etc.). Each delete is
    a hierarchy upgrade for what stays.
13. **Override third-party inline styles explicitly.** Headless data-grid
    libraries (TanStack Table, AG-Grid, MUI DataGrid, Chakra DataTable,
    react-table) emit inline `style={{ width: header.getSize() + 'px' }}`
    on every `<th>` / `<td>` from a JS API. Inline styles beat scoped
    CSS unless you use one of: (a) `!important` on the property, (b)
    `table-layout: fixed` on the parent table so intrinsic widths are
    ignored, or (c) drive widths through CSS variables that your rule
    overwrites. Apply at **every viewport**, not just the one you tested.
    Verify via DevTools `Computed → width`: your rule must not appear
    crossed-out at 1440 / 1024 / 800. Same gotcha applies to MUI Tabs,
    Mantine SegmentedControl, Chart.js / D3 default sizing, etc. — any
    library that injects layout from JS.
14. **Calm chrome before touching content.** If the brief includes chrome
    (header / breadcrumb / tab / dock / sidebar / toolbar) the first move
    is **subtraction**: strip backgrounds → borders → tints → fills, in
    that order, until chrome reads as a tonal recess that frames content.
    For active states, prefer micro-indicators (underline, M3 32×16 pill
    on icon, count-badge tint, font-weight bump) over full-cell fills —
    see "Heavy Active State" pattern + Hidden Failure Modes H1, H3 in
    `enhance-web-ui`. On root / index routes, actively suppress the
    breadcrumb / context row — the dock active indicator + page H1
    already answer "where am I?", and the breadcrumb on root is pure
    tautology (Failure Mode H2 / S13).
15. **Audit the brand-color budget per zone.** Before adding a brand-tinted
    surface (border / fill / ring / text in the brand color) anywhere in
    chrome, count existing brand-tinted surfaces in that visual zone. If
    ≥ 1 already exists for non-CTA reasons (a brand-bordered home icon,
    a brand-tinted breadcrumb chip, a brand-tinted tab background),
    **demote it** to neutral typography first. The brand color is
    finite — spend it on the action the user came to take, status chips
    that *carry* meaning, and the active micro-indicator only.
16. **Set aria-current parity with the visual active state.** Whenever
    you paint an active tab / nav link / breadcrumb crumb / dock cell,
    also set `aria-current="page"` (or `aria-selected="true"` for tabs).
    Visual + AT treatment must agree; keyboard and screen-reader users
    depend on it. Grep for active-state classNames; for each, confirm
    the same JSX node carries the matching ARIA attribute.

After every meaningful edit:

```
Lint the modified files (ReadLints in Cursor; the repo's lint script in Claude Code) — fix anything you introduced.
```

---

## Step 8 — VERIFY (the same three viewports, before/after)

```
Re-screenshot at 1440 × 900, 1024 × 700, 800 × 700.
Click into the same representative items as step 2b.
Check: no wrap, no overflow, no collision, no jarring state change, console clean.
```

If any pain from step 3 still shows visually, do not declare done. Iterate.

### 8b — Re-run the silent-bug gates

Screenshots prove the surface; the gates from Step 2.5 prove the
underlying contract. After each enhancement, re-run:

| Gate | What to re-check | Pass criterion |
|------|------------------|----------------|
| Uniformity | rect widths of every repeated tile group you fixed | `widthSpan ≤ 1px` per group |
| Conditional slot | sparse / zero-state render of every slot you touched | no `min-h` reservation > 1.5× actual content height |
| Dup-datum | each fold of the page | every datum (number, word, status) appears exactly once |
| Category squint | desktop screenshot at 10–15px Gaussian blur | tier-A/B: distinct colour blobs per category. tier-C/D: near-uniform achromatic with saturated alerts only |
| Wrapper-fix consumers | every other consumer of any wrapper you patched | same wrapper, different page, no regression |

A passed silent-bug gate is *worth more than a clean screenshot*: it
prevents the bug class from re-appearing on adjacent pages your future
enhancers never thought to check.

---

## Step 9 — WRITE-UP

Use the template in `examples.md`. Each user-facing pain gets:

- a one-line **before** description
- the **NN/g heuristic** it violated
- the **primitive / token** used in the fix
- the **after** behaviour
- a small screenshot or code reference

Keep the message structured so the user can scan it in 30 seconds.

---

## Heuristic Mapping Cheat Sheet (quick reference)

| Symptom on screen | Likely NN/g heuristic |
|-------------------|------------------------|
| Async result invisible (AI ran, link made, file processed) | #1 Visibility of System Status |
| Domain term feels engineering-y (`fileStatus=unlinked`) | #2 Match Real World |
| No way to undo / cancel / back out | #3 User Control & Freedom |
| Two pages style the same thing differently | #4 Consistency & Standards |
| Destructive action with no confirm; mis-keyable forms | #5 Error Prevention |
| All items look identical, must read names to find one | #6 Recognition over Recall |
| No keyboard shortcut, no bulk action, no saved filters | #7 Flexibility & Efficiency |
| Empty columns, repeating hints, decorative chrome | #8 Aesthetic & Minimalist |
| Error messages with codes, no suggested next step | #9 Help Users Recover |
| Onboarding with no in-context help, opaque controls | #10 Help & Documentation |
| Active tab/dock/nav painted heavier than siblings (full-cell wash) | #4 Consistency + NN/g *Navigation: You Are Here* (too loud) |
| Same word ("Home") echoed in breadcrumb + dock + H1 on root route | #8 Aesthetic & Minimalist (chrome tautology) |
| Brand color on chrome chips dilutes the actual primary CTA | NN/g *Visual Hierarchy* (every brand-tinted thing claims primacy) |
| Card-on-card chip (`bg-card border` on a `bg-muted` row) | #4 Consistency, #8 Minimalist (one elevation per row) |
| Hover-only row action with no touch fallback | #6 Recognition over Recall, #7 Flexibility (silent on touch) |
| Library inline `width` beats your CSS at one viewport but not another | #4 Consistency (rule loses specificity war) |
| Column with 44px content reserves 150px while sibling truncates | #8 Aesthetic & Minimalist (allocation mismatch) |

### Silent-bug → heuristic shortcuts

| Silent-bug class (Step 3b) | Likely NN/g heuristic | Why |
|----------------------------|------------------------|-----|
| Wrapper-collapsed tiles | #4 Consistency, #8 Minimalist | hit area unstable across rows; whitespace doesn't communicate grouping |
| Dead conditional slot | #8 Aesthetic & Minimalist | reserved space competes with focal content but holds no signal |
| Information duplication per fold | #8 Aesthetic & Minimalist | every duplicate steals attention from primary copy |
| Monochromatic surface (tier mismatch) | #1 Visibility, #6 Recognition | category signal hidden in the design-token scale |
| Left-anchored stack (no horizontal balance) | #4 Consistency | uniform layout hides true content hierarchy |
| Generic icon stack | #2 Match real world, #6 Recognition | mental categories collapse; user must read every name |

For depth on each heuristic and the supporting Laws of UX, read `HEURISTICS.md`.
For specific anti-patterns and their replacements, read `PATTERNS.md`.
For complete before/after enhancement examples, read `examples.md`.

---

## Quick Sanity Checks Before You Stop

- [ ] Product tier identified (A/B/C/D) and applied consistently
- [ ] Every change cites a heuristic in the write-up
- [ ] No new colour / spacing / radius value invented
- [ ] No new top-level primitive invented
- [ ] No mock/dead/rogue UI state introduced
- [ ] Feedback indicators are backed by real schema/API/domain state
- [ ] **DOM uniformity gate passed**: rect widths within 1px on every
      repeated tile group fixed
- [ ] **Conditional-slot zero-state gate passed**: no slot reserves >1.5×
      its actual content height on mobile
- [ ] **Dup-datum gate passed**: no datum (number, word, status) appears
      more than once per fold
- [ ] **Category-squint gate passed**: tier-A/B → distinct colour blobs;
      tier-C/D → near-uniform achromatic
- [ ] All labels stay on one line at 800 / 1024 / 1440
- [ ] Empty / zero-state rows are visually de-emphasised
- [ ] No always-on instruction row that repeats affordance text
- [ ] Async results (AI, link, error) are visible inline as chips, not behind a click
- [ ] **Repeating bug → patched at the wrapper / token / helper, not the
      consumer** (with intent comment on why)

### Hidden-failure-mode audit (the difficult-to-spot ones)
- [ ] **S11 Library specificity**: every responsive table/grid CSS rule was
      verified at all 3 viewports via DevTools `Computed → width`; the
      rule is *not* crossed-out by inline `style.width` from the
      data-grid library at any viewport.
- [ ] **S12 Active-state mass**: bounding box of active tab / dock cell /
      nav item ≈ bounding box of inactive sibling (within ~15 % painted
      area). No active sibling reads as "weirdly big" at the squint test.
- [ ] **S13 Chrome tautology**: on root / index routes, the page name does
      not appear in ≥ 2 chrome zones. Suppress the breadcrumb / context
      row when redundant with the page H1 + dock active indicator.
- [ ] **S14 Card-on-card**: no chip with `bg-card border` sits on a row
      whose own background is already a tonal recess. One elevation per row.
- [ ] **S15 Hover-only affordance**: every hover-revealed action has a
      tap-only fallback below the pointer breakpoint
      (`focus-within:opacity-100` or always-visible at `<sm`).
- [ ] **S16 Brand-color budget**: ≤ 1 brand-tinted surface per visual zone
      excluding the active micro-indicator and meaningful status chips.
- [ ] **S17 Hit area vs visual chrome**: 44 px touch targets achieved via
      invisible negative-margin extension, not by inflating the visual
      chrome (no `w-11 h-11 bg-card border` icon buttons).
- [ ] **S18 Responsive visibility**: column-meta `hideBelowMd` flags and
      className breakpoints are not inverted (no column appearing at `sm`
      and disappearing at `md+`).
- [ ] **aria-current parity**: every visually-active nav / tab / dock /
      breadcrumb item carries the matching `aria-current` /
      `aria-selected` attribute.
- [ ] **S19 wrapper-collapsed tiles** (Step 2.5a / 3b S1): rendered
      widths of every repeated tile group are within 1 px of each other.
      No `inline-flex` / `inline-block` ancestor between grid cell and
      tile is silently shrinking the children.
- [ ] **S20 dead conditional slot** (Step 2.5b / 3b S2): every optional
      region tested with sparse / zero-state content; no slot reserves
      `min-h` > 1.5× actual content height on mobile.
- [ ] **S21 information duplication per fold** (Step 2.5c / 3b S3): each
      datum (number, word, status, date) appears exactly once per
      viewport fold; duplicates deleted or replaced with complementary
      data.
- [ ] **S22 monochromatic surface / domain-tier mismatch** (Step 2.5d /
      3b S4): category-squint at 10–15 px blur shows distinct colour
      blobs (tier A/B) or near-uniform achromatic with status-only
      colour (tier C/D).
- [ ] **S23 left-anchored stacked cards** (Step 3b S5): every stacked
      card has at least one right-anchored piece of metadata tied to
      data — no decorative right-side icons.

### Repo health
- [ ] Lint passes on every modified file
- [ ] Three-viewport screenshots show no wrap / overflow / collision
- [ ] Write-up table maps each pain → heuristic → primitive → file → after

---

## When NOT to Use This Skill

- The user wants a **report only** (no code changes) → use `audit-ux` or
  `audit-uiux-design-system`
- The user wants to **build a brand new feature** from scratch → use `design-frontend`
- The change is a single-line **bug fix** with no UX dimension → just fix it
- The user wants a **README / marketing page** prettied up → use `enhance-readme`

---

## Companion Files

- [`HEURISTICS.md`](HEURISTICS.md) — NN/g 10 + Laws of UX, condensed
- [`PATTERNS.md`](PATTERNS.md) — anti-pattern → replacement library
- [`examples.md`](examples.md) — complete before / after enhancement walkthroughs
- [`enhance-web-ui` SKILL.md](../../enhance-web-ui/SKILL.md) — companion
  artistic/composition skill. The §"Hidden Failure Modes" section there
  enumerates H1–H12 with detection probes and fix shapes that this skill's
  S11–S18 reference. Read both together when feedback is vague-but-visceral
  ("clunky", "atrocious", "wasted space", "incoherent height").

---

## Research Anchors (for the new failure-mode rules)

- **Linear — A calmer interface for a product in motion (2025)**: the
  canonical reference for the *Calm Chrome* rule. Names the principle
  "structure should be felt, not seen"; chrome recedes, content
  takes precedence. <https://linear.app/now/behind-the-latest-design-refresh>
- **Material 3 — NavigationBar spec**: active indicator is a 64×32
  `cornerFull` pill in `SecondaryContainer` color wrapping the **icon**,
  not the cell. Reference for the *Heavy Active State* fix shape (S12).
  <https://m3.material.io/components/navigation-bar/overview>
- **NN/g — Navigation: You Are Here**: prominence (color, weight, offset)
  must be present, but not so loud it competes with content. Reference
  for active-state tuning. <https://www.nngroup.com/articles/navigation-you-are-here/>
- **NN/g — Visual Hierarchy in UX**: contrast/scale/grouping create rank;
  the squint test reveals real (vs intended) hierarchy. Reference for the
  brand-color-budget audit (S16).
  <https://www.nngroup.com/articles/visual-hierarchy-ux-definition/>
- **TanStack Table — Column Sizing Guide** + **Issue #5870**:
  `header.getSize()` emits inline `style={{ width }}` per cell that beats
  unscoped CSS unless `!important` or `table-layout: fixed`. Same gotcha
  applies to AG-Grid, MUI DataGrid, Chakra DataTable, and most headless
  data-grid libraries. Canonical reference for S11.
  <https://tanstack.com/table/v8/docs/guide/column-sizing>
- **Adam Argyle (Chrome DevRel) — 3 Unintuitive CSS Layout Solutions**:
  the `min-width: 0` / `min-height: 0` / `flex-shrink: 0` /
  `repeat(N, minmax(0, 1fr))` recipe for grid/flex children that won't
  shrink or fill evenly. Canonical reference for S19 (wrapper-collapsed
  tiles).  <https://nerdy.dev/3-unintuitive-layout-solutions>
- **Playwright — Locator boundingBox / evaluateAll**: programmatic API
  for measuring rendered widths across repeated elements (the DOM
  uniformity gate in §2.5a). Same pattern works in DevTools console
  with `getBoundingClientRect()`.
  <https://playwright.dev/docs/locators>
- **YOOtheme Pro — Collapsing Layouts**: explicit "collapsing cascade"
  contract for editorial layouts — element collapses if empty → column
  collapses if all elements collapsed → row collapses → section
  collapses. Reference for S20 (dead conditional slot).
  <https://yootheme.com/support/yootheme-pro/wordpress/collapsing-layouts>
- **NN/g — Defer Secondary Content for Mobile**: first screen ruthlessly
  focused on the minimum information needed; duplication is a
  wall-of-text by another name. Reference for S21 (information
  duplication per fold).
  <https://www.nngroup.com/articles/defer-secondary-content-for-mobile>
- **NN/g — Content Dispersion (design-mobile-first on desktop)**: stretching
  design-mobile-first patterns wastes space on wide viewports; the inverse
  failure is dense conditional slots wasting space on narrow viewports.
  Reference for S20.
  <https://www.nngroup.com/articles/content-dispersion/>
- **Duolingo — Core Tabs Redesign + Gamification as Design Language**:
  reference for tier-A vibrant semantic palettes (green=correct,
  red=hearts, orange=streak, yellow=XP, purple=premium). Each colour
  carries a system meaning; muted palettes undermine the playful tone.
  Reference for S22 (monochromatic surface).
  <https://blog.duolingo.com/core-tabs-redesign/>
- **Stripe / Vitality / ColorArchive — SaaS Dashboard Color**: reference
  for tier-D restraint — 60-30-10 rule, semantic colour reserved for
  status, achromatic chrome. The other end of the same axis as
  Duolingo. Use to diagnose whether you're applying tier-D tints to a
  tier-A product (the "monochromatic" failure).
  <https://vitalitydesignsystem.com/foundations/colour/>
- **Figma — 2026 Web Design Trends**: vibrant maximalist palettes
  returning, especially for lifestyle / youth / learning brands.
  Validates the *Domain Colour Tier* framing in `enhance-web-ui`.
  <https://www.figma.com/resource-library/web-design-trends/>
