# audit-responsive — anti-pattern signals & wireframe templates

Loaded from `audit-responsive` Phase 1 and Phase 3. Do not invent a second
scale — if the repo already defines tokens, substitute those numbers below.

## Contents

- Anti-pattern signals
- Wireframes


---

## Anti-pattern signals

Search the scoped UI. Cite `file:line`. Severity: **blocker** (1440 is a
stretched phone, or primary task unusable) · **major** (hierarchy/IA broken at
one breakpoint) · **minor** (inconsistent scale, mixed icons).

### 1. No max-width container

```bash
rg -n "w-full|w-screen|max-w-none|width:\s*100%" -g '*.{tsx,jsx,vue,svelte,css}'
rg -n "max-w-(sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|prose)|max-w-\[" -g '*.{tsx,jsx,vue,svelte}'
```

**Fail:** a page root or reading column has no `max-width` / `max-w-*` and
stretches with the viewport past ~1280px. **Pass:** layout shell caps
~1140–1280px (or the repo token); body copy caps ~65–75ch.

### 2. Single-column everything

```bash
rg -n "flex-col|grid-cols-1|space-y-|stack" -g '*.{tsx,jsx,vue,svelte}'
rg -n "md:grid-cols|lg:grid-cols|md:flex-row|lg:flex-row|sm:grid-cols" -g '*.{tsx,jsx,vue,svelte}'
```

**Fail:** at ≥1024px the page is still one column when it contains groups that
invite comparison or context (form + summary, list + detail, 3+ stat cards,
media + text). **Pass:** those groups sit side-by-side at desktop; they stack
only below the tablet breakpoint.

### 3. Stretched interactive elements

```bash
rg -n "w-full.*(Button|button|input|Input)|className=.*w-full" -g '*.{tsx,jsx,vue,svelte}'
```

**Fail:** primary buttons, text inputs, or cards are `w-full` with no
`sm:`/`md:` constraint, so they span the desktop column. **Pass:** mobile may
be full-bleed; desktop controls size to content or a defined field width
(often `max-w-sm` / `max-w-md` for inputs).

### 4. No visual hierarchy

Look at the 1440 screenshot for 5 seconds. If you cannot name the page purpose
and the next action, this fails.

```bash
rg -n "text-(xs|sm|base|lg|xl|2xl|3xl)|font-(normal|medium|semibold|bold)" -g '*.{tsx,jsx,vue,svelte}' | head -40
```

**Fail:** heading / body / label / caption rendered at near-identical size and
weight; everything left-aligned because that was the default, not a decision.
**Pass:** a readable primary → secondary → metadata scale; alignment is chosen
(start / center / end / grid) per group.

### 5. No spacing system

```bash
rg -n "\\b(p|m|gap|space-[xy])-\\[" -g '*.{tsx,jsx,vue,svelte,css}'
rg -n "padding:\\s*[0-9]+px|margin:\\s*[0-9]+px" -g '*.{tsx,jsx,vue,svelte,css}'
```

**Fail:** one-off values (13px, 22px, 37px, `p-[13px]`) next to equivalent
elements that use a different gap. **Pass:** all spacing from the repo scale
(or the Phase 2 proposed 4/8 scale).

### 6. No grouping / information architecture

Walk the page's DOM sections and the 1440 screenshot. Name each visual group.
If you cannot, or if unrelated fields share a card while related ones sit
pages apart, this fails.

**Fail:** long flat lists where a table, 2–3 column grid, or master-detail
fits; no fieldsets/sections; status + title + timestamp not clustered.
**Pass:** named groups; related data shares a region; layout matches the
Phase 3 wireframe.

### 7. Missing or mixed iconography

```bash
rg -n "from 'lucide-react'|from '@heroicons'|from 'react-icons'|from '@phosphor-icons'|material-symbols" -g '*.{tsx,jsx,vue,svelte}'
```

**Fail:** two or more icon libraries; or nav/status/actions are text-only
where a consistent set would aid scanning. **Pass:** one library, one size
grammar (16 inline / 20 controls / 24 nav, or the repo's).

### 8. Breakpoint gaps

```bash
rg -n "sm:|md:|lg:|xl:|2xl:|@media|@container" -g '*.{tsx,jsx,vue,svelte,css}' | head -40
```

**Fail:** only a mobile base, or only a desktop layout, with no tablet
treatment; 768px screenshot looks abandoned (overflow, crushed columns, or
still a phone stack). **Pass:** 375, 768, and 1440 each have an intentional
layout — not leftover.

### 9. Typography defaults

```bash
rg -n "font-sans|font-serif|font-mono|--font-|fontFamily|line-height|leading-" -g '*.{tsx,jsx,vue,svelte,css}' | head -30
```

**Fail:** no type scale (browser defaults), body measure >~80ch, paragraph
`line-height` < 1.5. **Pass:** sizes from the sheet; reading column ≤75ch;
body leading ≥ 1.5.

### 10. Table / data misuse

```bash
rg -n "<table|role=\"table\"|overflow-x-auto|md:hidden|hidden md:table" -g '*.{tsx,jsx,vue,svelte}'
```

**Fail:** tabular data rendered only as stacked cards at 1440; or a wide
`<table>` with no mobile strategy (horizontal scroll, column priority, or
card collapse). **Pass:** desktop uses a table or dense grid; 375 has an
explicit strategy.

---

## Wireframes

For each flagged screen, copy this block and fill it with **real** groups from
the page (names from Phase 3). Do not invent content.

```
PAGE: <route> — primary: <why this page exists>

375
┌─────────────────────┐
│ [nav / title]       │
│ ┌─────────────────┐ │
│ │ PRIMARY         │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ SECONDARY       │ │
│ └─────────────────┘ │
│ [metadata]          │
└─────────────────────┘

768
┌──────────────┬──────────────┐
│ PRIMARY      │ SECONDARY    │
│              │ metadata     │
└──────────────┴──────────────┘

1440
┌──────┬────────────────┬──────────┐
│ nav  │ PRIMARY        │ SECONDARY│
│      │                │ metadata │
└──────┴────────────────┴──────────┘
```

Reflow examples (pick what the content actually needs):

- Sidebar → top tabs at 375
- 3-up stat cards → 1-col stack at 375, 2-col at 768, 3-col at 1440
- Master-detail → list, then push view at 375; split pane at 1440
- Form + summary → stacked at 375; 2/3 + 1/3 at 1440
