---
name: audit-uiux-design-system
description: >
  Audit visual-system coherence: tokens, component variants, color, type,
  spacing, dark mode. Use for "design drift", inconsistent UI, or duplicate
  primitives. Per-page usability → audit-ux. Plan-only unification →
  plan-uiux-unification.
license: MIT
effort: high
---

# UI Design System Audit Skill

**Degree of freedom: MIXED** — Steps 0–3, 5–6 `[HIGH freedom]`; Step 4
playwright captures `[LOW freedom — run exactly]`. Read
`protocol-browser-anti-stall` before any browser step. Breakpoints-only →
`audit-responsive`.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-uiux-design-system** (this) | Visual-system coherence: tokens, variants, color, type, spacing, dark mode |
| `audit-ux` | Per-page UX audit with NN/g heuristics, microcopy, Google HEART |
| `plan-uiux-unification` | Plan-only UI/UX and design-system audit emitting a unification burndown |

## How to reason

1. **Observe** — quote the token file, raw hex, or screenshot
2. **Interpret** — is this the system token, a one-off, or an AI-tell?
3. **Classify** — token leak / duplicate component / missing state / template / correct
4. **Severity** — raw color on a core primitive = P0; missing hover = P1; radius nit = P2

## Worked example

> **Observe:** `Button.tsx` uses `bg-[#3B82F6]`; `--primary` exists in `globals.css`.
> **Interpret:** the primitive bypasses the token SSOT; dark mode cannot switch it.
> **Classify:** token leak on a core primitive.
> **Severity:** P0 — every button is a hardcoded hex.
> **Finding:** `Button.tsx` | color token | P0 | replace with `bg-primary`.

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Tokens first** — do not invent a second scale
2. **Evidenced** — screenshot under `.playwright-mcp/` or quoted class
3. **Severity justified** — P0 = core primitive off-token or unusable contrast
4. **Right owner** — linearized desktop → `audit-responsive`; WCAG keyboard → `audit-accessibility`
5. **Hand-crafted** — no recommendation that increases template sameness

## Anti-template

Recommendations must name what to avoid, not ask for taste. Research
award-winning sites in the domain; vary rhythm (not identical `py-16`);
give each control a distinct hover/focus/active/disabled; define
personality tokens (radius, type voice). Defaults to call out — extend
this list from whatever the first draft reached for: identical section
padding, generic or purple gradients, three equal cards / 3-col
icon-title-desc as the default, cream or off-white page backgrounds,
italic accent words in headlines, "01/02/03" numbered section labels,
monospace labels, pill-shaped buttons everywhere, Inter/Roboto as the
only type voice, lorem empty states, uniform radius, unadapted stock art.

---

## Step 0: Auto-Detect Design System

### 0a. Detect CSS Framework

| Signal | Technology |
|--------|-----------|
| `tailwindcss` v3 + `tailwind.config.*` | Tailwind CSS v3 |
| `tailwindcss` v4 + `@theme` in CSS | Tailwind CSS v4 |
| `*.module.css` files | CSS Modules |
| `styled-components` or `@emotion/styled` | CSS-in-JS |
| `@chakra-ui/react` | Chakra UI |
| `@mui/material` | Material UI |
| `@mantine/core` | Mantine |

### 0b. Detect Component Library

```
Glob: **/components/ui/*.tsx → shadcn/ui
Glob: **/components/ui/*.vue → Vue component lib
Glob: **/components/ui/*.svelte → Svelte component lib
Grep: "from '@radix-ui" glob "*.{ts,tsx}" output_mode "count"
Grep: "from 'lucide-react" glob "*.{ts,tsx}" output_mode "count"
Grep: "from '@heroicons" glob "*.{ts,tsx}" output_mode "count"
Grep: "from 'react-icons" glob "*.{ts,tsx}" output_mode "count"
```

### 0c. Find Design Tokens

```
Glob: **/tailwind.config.*
Glob: **/app/globals.css
Glob: **/styles/tokens.*
Glob: **/theme.*
Grep: "--primary|--secondary|--accent|--muted" glob "*.css"
```

Read token source to extract: colors, spacing, typography, radii, shadows.

### 0d. Discover Forbidden Patterns

```
Grep: "NEVER|FORBIDDEN|DO NOT" glob "**/*README*" -i
```

### 0e. Record Discovery

```
DESIGN SYSTEM DISCOVERY:
- CSS framework: [Tailwind v3/v4 / CSS Modules / Styled Components / etc.]
- Component library: [shadcn/ui / Radix / MUI / Chakra / custom]
- Icon library: [Lucide / Heroicons / react-icons / mixed]
- Token source: [file path]
- Colors defined: [count]
- Typography scale: [list]
- Spacing base: [4px / 8px / etc.]
- Border radius: [list]
- Shadow levels: [list]
- Dark mode: [YES — class/media / NO]
- Forbidden patterns: [list from README]
```

---

## Step 1: Research Design System Best Practices

### 1a. Context7 — Component Library Docs

```json
context7:resolve-library-id
{
 "libraryName": "<DETECTED_COMPONENT_LIBRARY>",
 "query": "component variants accessibility patterns"
}
```

Then fetch docs with the resolved ID. Also fetch CSS framework docs.

### 1b. Firecrawl — Design System Standards

```json
firecrawl:firecrawl_search
{
 "query": "<COMPONENT_LIBRARY> design system audit token compliance best practices [current year]",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Additional queries:

| Topic | Query |
|-------|-------|
| Token compliance | `design token audit <CSS_FRAMEWORK> consistency` |
| Component patterns | `<FRAMEWORK> component modularity composition patterns` |
| Dark mode | `<CSS_FRAMEWORK> dark mode implementation best practices` |

### 1c. Firecrawl — Award-Winning Reference Sites

```json
firecrawl:firecrawl_search
{
 "query": "<PRODUCT_TYPE> website design award Awwwards Muzli [current year]",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

```json
firecrawl:firecrawl_search
{
 "query": "<PRODUCT_TYPE> SaaS UI design inspiration unique not generic [current year]",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Scrape 2–3 standout sites for grid breaks, signature motion, type voice, and accent logic.

---

## Step 2: Token Compliance Audit

### 2a. Color Tokens

| Rule | Standard | How to Check |
|------|----------|-------------|
| Semantic naming | `primary`, `secondary`, `destructive`, `muted`, `accent` | No raw hex/rgb in components |
| CSS variables | `hsl(var(--primary))` or `oklch()` | All colors reference variables |
| Foreground pairs | Every bg color has `*-foreground` | Text contrast maintained |
| Dark mode | All tokens have dark variant | `.dark` class or `@media` |
| Status colors | `success`, `warning`, `error`, `info` defined | Consistent across alerts, badges, toasts |

**Find violations:**

```
Grep: "(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\([^v])" glob "*.tsx"
Grep: "\[(#|rgb|hsl)" glob "*.tsx"
```

### 2b. Typography Tokens

| Rule | Standard |
|------|----------|
| Font families | Max 2-3 families in theme |
| Size scale | Consistent (`text-sm`, `text-base`, `text-lg`) |
| Weight scale | Limited set (`font-normal`, `font-medium`, `font-semibold`, `font-bold`) |
| Heading hierarchy | `h1` > `h2` > `h3` in visual weight AND DOM order |
| No arbitrary sizes | No `text-[14px]` when `text-sm` exists |

```
Grep: "text-\[" glob "*.tsx"
Grep: "font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)" glob "*.tsx" output_mode "count"
```

### 2c. Spacing Tokens

| Rule | Standard |
|------|----------|
| Base unit | 4px grid (Tailwind default) |
| Consistent gaps | Same spacing for same contexts |
| No arbitrary values | No `p-[13px]` when `p-3` exists |

```
Grep: "(p|m|gap|space)-\[" glob "*.tsx"
```

### 2d. Borders, Radii, Shadows

```
Grep: "rounded-\[" glob "*.tsx"
Grep: "shadow-" glob "*.tsx" output_mode "count"
```

---

## Step 3: Component Modularity Audit

### 3a. Component Health

| Rule | Standard |
|------|----------|
| Single responsibility | One component = one purpose |
| Composable | Small pieces compose into larger ones |
| Reusable | Same UI = same component everywhere |
| Consistent props | `variant`, `size`, `disabled`, `className` across all |
| Variants pattern | `cva()` or similar for style variants |

### 3b. Find Duplicate Components

```
Grep: "<button " glob "*.tsx" — raw buttons outside ui/ (should use Button)
Grep: "<input " glob "*.tsx" — raw inputs (should use Input)
Grep: "<select " glob "*.tsx" — raw selects
Grep: "<a " glob "*.tsx" — raw anchors (should use Link)
```

Exclude `components/ui/*` — those are legitimate primitives.

### 3c. Check Component Consistency

```
Grep: "function (Button|Input|Modal|Dialog|Card)" glob "*.tsx" output_mode "files_with_matches"
```

### 3d. Mixed Icon Libraries

```
Grep: "from .lucide-react" glob "*.tsx" output_mode "count"
Grep: "from .@heroicons" glob "*.tsx" output_mode "count"
Grep: "from .react-icons" glob "*.tsx" output_mode "count"
```

---

## Step 4: Live Visual Verification (playwright-cli)

### 4a. Navigate and Capture

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=ds-audit open --headed "http://localhost:<PORT>/<ROUTE>"
sleep 2
$PW -s=ds-audit snapshot                                              # verify content rendered
$PW -s=ds-audit screenshot --filename ".playwright-mcp/ds-<route>.png"  # visual evidence
$PW -s=ds-audit console                                               # check for errors
```

### 4b. Per-Page Checks

| Check | How |
|-------|-----|
| Token compliance | Screenshot — inconsistent colors, spacing |
| Component reuse | Snapshot — shared primitives used? |
| Console errors | `console` — hydration, missing CSS vars |
| Layout shift | Snapshot before/after interaction |
| Dark mode | Toggle dark mode, re-screenshot, compare |

### 4c. Responsive Check

Test at three viewports:

- **Desktop** (1440px)
- **Tablet** (768px)
- **Mobile** (375px)

### 4d. Visual Accessibility

| Check | How |
|-------|-----|
| Color contrast | 4.5:1 text, 3:1 large text/UI — compute from the token pair values (one-line script or the DevTools accessibility pane); the screenshot confirms which pair is in use, it does not measure the ratio |
| Focus rings | Tab through elements, verify visible focus indicator |
| Semantic HTML | `Grep: "<nav>|<main>|<section>|<article>|<aside>" glob "*.tsx"` |
| Alt text | `Grep: "<(img|Image)" glob "*.tsx"` then check for `alt=` |

---

## Step 5: Microinteractions and User Feedback

### 5a. Microinteraction Coverage Audit

Check each interactive:

| Element | Expected Feedback | AI-Tell if Missing |
|---------|------------------|--------------------|
| Buttons | Hover: color shift + subtle shadow change. Active: scale(0.98) press. Loading: spinner replaces label or inline indicator | Flat, no state change — feels dead |
| Links | Hover: underline animation or color transition, not instant swap | Instant color jump with no transition |
| Cards (clickable) | Hover: lift (translateY + shadow increase). Not just color change | Color change only, or no hover at all |
| Inputs | Focus: ring animation or border color transition. Not just outline swap | Browser default outline, no custom focus |
| Toggles/switches | State transition animated, not instant. Haptic feel via easing | Instant snap between states |
| Dropdowns/menus | Open/close with slide or fade, not instant appear/disappear | Instant pop, no transition |
| Toasts/notifications | Enter with slide + fade, exit with fade. Auto-dismiss with progress | Instant appear/disappear |
| Modals/dialogs | Backdrop fade + content scale/slide. Exit reverses. Not instant | Instant appear, jarring |
| Tabs | Active indicator slides to new tab, not instant jump | Instant color swap |
| Tooltips | Slight delay (200-300ms), fade in. Don't flicker on mouse movement | Instant, flickers, no delay |

**Find in code:**

```
Grep: "transition-all|transition-colors|transition-opacity|transition-transform" glob "*.tsx" output_mode "count"
Grep: "hover:|group-hover:|focus-visible:" glob "*.tsx" output_mode "count"
Grep: "animate-|animation-|@keyframes|framer-motion|motion\." glob "*.tsx" output_mode "count"
Grep: "scale-|translate-|rotate-" glob "*.tsx" output_mode "count"
```

### 5b. Interaction State Completeness

Verify ALL states exist per interactive:

```
States checklist per component:
□ Default (resting)
□ Hover (mouse over)
□ Focus-visible (keyboard navigation)
□ Active/pressed (during click)
□ Disabled (grayed, not clickable, cursor-not-allowed)
□ Loading (async action in progress)
□ Error (validation failed, destructive context)
□ Success (completed action)
```

**Find missing states:**

```
Grep: "focus-visible:|focus:" glob "*.tsx" output_mode "count"
Grep: "active:|pressed" glob "*.tsx" output_mode "count"
Grep: "disabled:|cursor-not-allowed|opacity-50" glob "*.tsx" output_mode "count"
```

### 5c. Visual Rhythm and Personality Audit

Intentional variety vs uniform repetition:

| Pattern | Curated Feel | Template Feel |
|---------|-------------|---------------|
| Section spacing | Varies by content type (hero: generous, form: tight, CTA: spacious) | Same `py-16` on every section |
| Typography contrast | Large jumps between heading and body (e.g., 48px → 16px). Mix weights | Incremental scale, same weight everywhere |
| Color accent usage | Accent used sparingly for emphasis, not on every element | Primary color on every button, link, icon |
| Layout variation | Different layouts per section (text-left/image-right, full-width, sidebar) | Same 3-column card grid repeated |
| Border radius | Intentional variation (pills for tags, rounded for cards, sharp for data tables) | Same `rounded-lg` on everything |
| Shadow depth | Multiple shadow levels for elevation hierarchy | Same shadow on everything, or no shadows |
| Whitespace | Asymmetric margins create visual flow and reading rhythm | Perfectly symmetric, mechanical spacing |

---

## Step 6: Animation and Dark Mode

### Animations

| Rule | Standard |
|------|----------|
| Duration scale | `150ms` (micro), `200ms` (hover), `300ms` (enter), `500ms` (complex) — NOT all the same |
| Easing | `ease-out` for enter, `ease-in` for exit, `ease-in-out` for state changes — NOT all `ease-in-out` |
| Reduced motion | `motion-safe:` prefix or `prefers-reduced-motion` |
| No layout shift | Transitions don't cause CLS |
| Stagger effect | List items, card grids animate in with stagger delay, not all at once |

```
Grep: "duration-[0-9]+" glob "*.tsx" output_mode "count"
Grep: "transition-" glob "*.tsx" output_mode "count"
Grep: "prefers-reduced-motion|motion-safe|motion-reduce" glob "*.tsx"
Grep: "stagger|delay-\[|animation-delay" glob "*.tsx" output_mode "count"
```

### Dark Mode

| Rule | Standard |
|------|----------|
| All tokens switch | CSS variables change in dark mode |
| No hardcoded colors | No `bg-white`, `text-black` — use semantic tokens |
| Borders visible | In both modes |
| Contrast | WCAG in BOTH light and dark |
| Not an afterthought | Dark mode should feel designed, not inverted. Shadows become glows, borders become subtle |

```
Grep: "(bg-white|bg-black|text-white|text-black)" glob "*.tsx" output_mode "count"
```

---

## Output Template

```markdown
## UI Design System Audit Report

**Date:** [date]
**Framework:** [detected]
**CSS:** [Tailwind v3/v4 / CSS Modules / etc.]
**Component library:** [shadcn / Radix / MUI / custom]
**Pages Audited:** [count]
**Issues Found:** [count]

---

### Design Token Compliance

| Token Category | Defined | Violations | Status |
|----------------|---------|------------|--------|
| Colors | [count] | [count] raw hex/rgb | [pass/warn/fail] |
| Typography | [count] | [count] arbitrary sizes | [pass/warn/fail] |
| Spacing | [count] | [count] arbitrary values | [pass/warn/fail] |
| Radii | [count] | [count] arbitrary radii | [pass/warn/fail] |
| Shadows | [count] | [count] inconsistent | [pass/warn/fail] |

---

### Component Health

| Component | Used In | Variants | Issues |
|-----------|---------|----------|--------|
| Button | [N] files | [N] | [notes] |
| Input | [N] files | [N] | [notes] |
| Card | [N] files | [N] | [notes] |

---

### Duplicate / Redundant Components

| Pattern | Locations | Recommendation |
|---------|-----------|----------------|
| Raw `<button>` | [files] | Use `<Button>` from `components/ui` |
| Custom modal | [file] | Use `<Dialog>` from `components/ui` |

---

### Visual Accessibility

| Criteria | Status | Issues |
|----------|--------|--------|
| Color contrast | [pass/warn/fail] | [details] |
| Focus indicators | [pass/warn/fail] | [details] |
| Alt text | [pass/warn/fail] | [details] |
| Semantic HTML | [pass/warn/fail] | [details] |
```

---

## Further reading

- [Microinteraction Coverage and more](references/details.md)
