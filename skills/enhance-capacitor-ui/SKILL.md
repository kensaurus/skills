---
name: enhance-capacitor-ui
description: >
  Separate desktop and mobile UI in hybrid apps shipped as PWA + iOS + Android
  (Capacitor, Tauri, Expo Web, Ionic). Use when a UI sweep "improved one surface
  and broke the other".
license: MIT
paths:
  - "**/ios/**"
  - "**/android/**"
  - "**/app.json"
  - "**/app.config.*"
  - "**/capacitor.config.*"
  - "**/*.gradle"
  - "**/Podfile"
---

> Surface router: `/uiux`. You are here: `enhance-capacitor-ui`. Native iOS/Android (SwiftUI / Compose, no web layer) is out of scope — use Apple HIG / Material directly.

# Enhance Web ↔ Mobile UI

**Degree of freedom: MIXED.** Axis/tier judgment `[HIGH freedom]`; probes, SSR first-paint, and six-cell verify `[LOW freedom — run exactly]`.

Separate the mobile and desktop design contracts of a hybrid app so that a
UIUX sweep on one surface cannot silently degrade the other. This is not a
"add a `useIsMobile` hook" skill. It establishes three orthogonal axes,
one source of truth, mode tokens, container-query primitives, and a
chrome allow-list — so per-form-factor / per-platform polish is a
predictable, reviewable change instead of a regression.

> **Vague-but-visceral cross-surface feedback ("looks great on web,
> atrocious on iPhone", "the iPad version is just a stretched phone",
> "Android dock feels wrong", "everything wraps on tablet") almost always
> points to **axis conflation** — one boolean (`isMobile`) is being asked
> to answer three different questions. Start at the architecture, not at
> the broken page.**

> If browser/native automation is used, first follow the
> `protocol-browser-anti-stall` skill when present.

## How to reason

1. **Inventory** — which surfaces ship; how the code answers "is mobile?"
2. **Separate** — form factor vs platform vs pointer (never one boolean)
3. **Allow-list** — viewport queries only in chrome; containers elsewhere
4. **Verify** — six-cell matrix + SSR first-paint + live `data-*` on `<html>`

## Worked example

> **Inventory:** Capacitor PWA + iOS + Android; 18 `useIsMobile` sites; cards use `lg:grid-cols-2`.
> **Separate:** sheet vs popover is compact OR coarse pointer, not `viewport < 768`.
> **Allow-list:** `app-shell` / docks keep `md:`; Card becomes `@container` + `@4xl:`.
> **Verify:** card in a 320px side panel on a 1920 monitor stays compact; no FOUC of both navs.

## Self-critique before reporting

- **Three axes** — no leftover `useIsMobile` answering platform or hover
- **SSR** — chrome visibility is CSS-gated; no JS-only first paint
- **Six cells** — compact/medium/expanded × web/iOS/Android viewed
- **Right owner** — one-surface polish → `enhance-web-ui`; native SwiftUI/Compose is out of scope

---

## Rules

> **Three orthogonal axes — never conflate them.**
> 1. **Form factor** (compact / medium / expanded) = how much screen space
> do I have? — drives layout density, chrome strategy, navigation
> pattern (bottom dock vs side rail vs persistent sidebar).
> 2. **Platform** (web / ios / android) = which OS visual language am I
> inside? — drives motion curves, tap-highlight, overlay radii,
> safe-area math, haptic affordances.
> 3. **Pointer capability** (fine / coarse, hover / no-hover) = can the
> user hover and click precisely? — drives hover-reveal affordances,
> drag-handle sizes, hit-target floors.
> A single `useIsMobile` boolean answering all three is the root cause
> of most cross-surface regressions. Encode the three axes separately.

> **One source of truth.** Detect the three axes once, in a single
> `useViewportContext()` (or equivalent) hook, and write them to
> `<html data-form-factor data-platform data-can-hover>` so CSS, server
> components, and SSR-rendered HTML all read the same answer. Banning
> ad-hoc `useMatchMedia` / `pathname.startsWith("/desktop")` /
> `Capacitor.isNativePlatform()` branches scattered across components.

> **Token modes, not per-component conditionals.** Platform differences
> that are *visual* (overlay radius, press-scale, tap-highlight color)
> live in `:root[data-platform="ios"]` blocks as CSS variable overrides,
> not in `if (platform === "ios")` JSX branches. Components consume the
> token; the platform layer paints it. (Ionic Modes, Konsta UI pattern.)

> **Page chrome = viewport queries; component micro-layout = container
> queries.** App-level chrome (bottom dock vs side rail vs sidebar)
> reacts to the *viewport* — only the app shell knows the global form
> factor. Cards, tiles, grids, hero blocks inside the content column
> react to their *container* — they may be in the main column, a side
> panel, a split-pane, a modal. Use `md:` / `lg:` only in the chrome
> allow-list (typically: app-shell, bottom-nav, side-nav, side-rail).
> Use `@md:` / `@lg:` (container queries) everywhere else. Tailwind 4
> ships container queries built-in; Tailwind 3 needs the plugin.

> **Per-form-factor squint test.** "Looks good at 1440" is one cell of
> a six-cell grid (3 form factors × 3 platforms minimum, plus pointer
> on/off). Before declaring an enhancement done, view it at compact
> (≤640px), medium (768–1023px), and expanded (≥1024px), on web + iOS
> WebView + Android WebView (or the closest available native shell).
> Any cell that looks "templated" or "broken" was not actually
> enhanced — it was avoided.

> **Tier across surfaces, not across the app.** A learning / consumer
> / lifestyle app should be **tier-A vibrant** on the *compact* form
> factor (color carries gamification meaning — Duolingo) and may
> legitimately become **tier-C calm** on the *expanded* form factor
> (more chrome, more data density, less novelty). The mistake is
> applying one saturation tier across all surfaces. Pick a tier per
> form factor; document it. (See `enhance-web-ui` § Domain Colour
> Tier.)

> **Never ship mock, dead, or rogue platform branches.** Platform-mode
> tokens must be wired to the *real* `Capacitor.getPlatform()` result
> (or your stack's equivalent). Don't fork visual logic on a static
> `process.env.MODE === "ios"` literal — the same bundle ships to all
> three surfaces and the platform is only known at runtime.

> **Guardrail the chrome allow-list.** Once `md:` / `lg:` are restricted
> to the chrome allow-list, an ESLint `no-restricted-syntax` rule + a
> Cursor / AGENTS rule (`responsive-design-axes.mdc`) keeps them there.
> A future enhancer (human or AI) will reach for `lg:grid-cols-2` in a
> primitive within a week unless the rule warns them.

> **Edge-to-edge is the platform default (2026).** Android 16 enforces it
> and Capacitor 8.3.2+ handles insets in core: set `viewport-fit=cover`,
> pad chrome with `var(--safe-area-inset-*, env(safe-area-inset-*, 0px))`,
> style bars with `SystemBars` (`@capacitor/core`). The legacy
> `StatusBar.setBackgroundColor()` / `overlaysWebView: false` are no-ops
> on Android 16; color the bar area with an element instead.
> `tailwindcss-safe-area` reads `env()` only, so hand-roll the `var()`
> fallback on critical chrome while Android WebView < 140 is in the fleet.
> Capacitor 7 keeps the `@capawesome/capacitor-android-edge-to-edge-support`
> plugin only as an opt-out.

> **Patch the axis primitive, not the consumer.** Same rule as
> `enhance-web-ui` *Primitive-First Patch Rule*, scoped to axes: if
> twelve cards each carry their own `lg:flex-row` branch, the bug is
> that the card primitive isn't a `@container`. Patch the primitive
> once, delete the twelve consumer branches.

---

## Workflow Checklist

Copy and track:

```
WEB↔MOBILE SEPARATION /<repo or surface>
- [ ] 0. SURFACE INVENTORY: shipping targets (PWA / iOS / Android / Mac
 Catalyst / Tauri), Capacitor or shell version, breakpoint system,
 Tailwind 3 vs 4 (container queries built-in?)
- [ ] 1. AXES AUDIT: how does the codebase currently answer "is mobile?",
 "is iOS?", "can hover?" — count the call sites, list the helpers
- [ ] 2. CHROME vs CONTENT MAP: which files own page-level chrome (allow
 `md:`/`lg:`), which files are content/primitives (must use `@md:`)
- [ ] 3. PROBE: grep bare `md:`/`lg:` outside the allow-list, count
 `useIsMobile` / `isNative` / `pathname.startsWith` branches,
 inspect SSR first-paint at /compact and /expanded
- [ ] 4. GAP MAP: current state vs three-layer architecture (context →
 tokens → primitives) — what's missing, what's duplicated
- [ ] 5. PLAN: six-step rollout (context hook → mode tokens → form-factor
 gates → container-query primitives → heuristic guide → guardrail)
- [ ] 6. IMPLEMENT: smallest diff per step; SSR-safe defaults at every
 boundary
- [ ] 7. VERIFY: six-cell matrix (3 form factors × 3 platforms), plus
 SSR/first-paint check, plus reduced-motion, plus dark/light if
 supported
- [ ] 8. WRITE-UP: surface → before pain → axis violated → primitive →
 after behaviour
```

---

## Step 0 — Surface Inventory  [HIGH freedom]

Before any change, write down what the app actually ships to. This prevents
designing for surfaces that don't exist (and forgetting ones that do).

| Surface | Detection | Notes |
|---------|-----------|-------|
| PWA / browser | default | Includes desktop browser AND iOS/Android Safari/Chrome |
| iOS native (WebView) | `Capacitor.getPlatform() === "ios"` | Capacitor / Ionic shells |
| Android native (WebView) | `Capacitor.getPlatform() === "android"` | Capacitor / Ionic shells |
| Mac Catalyst | iPad-class iOS surface running on macOS | Form factor matters more than platform |
| iPad / large iOS | iOS + ≥768px | Often misses iPad-specific layout if you only test iPhone |
| Foldable / split-screen | window resize event mid-session | Form factor changes at runtime, must subscribe |

Extract from the project:

- `package.json` → Capacitor / Tauri / Ionic / Expo / RN-Web version.
- `capacitor.config.*` → `webDir`, deployment targets, custom URL scheme.
- `tailwind.config.*` or `globals.css` `@theme` → existing breakpoints,
 whether container queries are configured.
- Any `useIsMobile` / `useBreakpoint` / `usePlatform` hook → catalogue.

---

## Step 1 — Axes Audit (find the conflation)  [HIGH freedom]

Run these probes; expect to find 5–30 hits per probe in any non-trivial
hybrid app. Each hit is a candidate for axis-separation.

```bash
# How does the codebase currently answer "is mobile?" — count the call sites
rg -n 'useIsMobile|isMobile|isDesktop|breakpoint\.lg|matchMedia.*768|window\.innerWidth' \
 --glob '!**/node_modules/**' --glob '!**/dist/**' | wc -l

# How does it answer "is iOS?"
rg -n 'Capacitor\.getPlatform|isNativePlatform|navigator\.platform|isIOS|isAndroid' \
 --glob '!**/node_modules/**'

# How does it answer "can the user hover?"
rg -n 'matchMedia.*hover|useCanHover|"hover:|@media \(hover' \
 --glob '!**/node_modules/**'

# Bare viewport prefixes outside the chrome allow-list (proxy for
# axis-conflation in primitives)
rg -n '\b(md|lg|xl|2xl):' \
 --glob 'design-system/**' \
 --glob 'components/**/!(@(app-shell|bottom-nav|side-nav|side-rail))*' \
 | wc -l
```

Build the conflation table:

| Hit (file:line) | Question being asked | Axis it should map to | Current proxy | Fix shape |
|-----------------|----------------------|-----------------------|---------------|-----------|
| `Card.tsx:42` `lg:flex-row` | "is the card slot wide?" | container size | viewport `lg:` | `@md:flex-row` after Card becomes `@container` |
| `Toast.tsx:18` `useIsMobile()` | "should I show a sheet or a side toast?" | form factor | viewport `md:` | `data-form-factor="compact"` token + Tailwind `ff-compact:` variant |
| `Button.tsx:30` `if (Capacitor.getPlatform() === "ios")` rounded-2xl | "what's the OS visual language?" | platform | runtime branch | `--btn-radius` token under `:root[data-platform="ios"]` |
| `IconBtn.tsx:15` `hover:bg-muted` | "show hover paint" | pointer capability | bare `hover:` | `can-hover:hover:bg-muted` (axis-aware variant) |

If the table has > 10 rows, the project needs the full architecture; if
< 5, you may be able to land just steps 1–3 (context hook + mode tokens +
gate the chrome).

---

## Step 2 — Chrome vs Content Map (the allow-list)  [HIGH freedom]

The single most important architectural decision in this skill: **which
files are allowed to read the viewport, and which must read their
container.** Write the list down before touching anything.

Default allow-list (files that may use bare `md:` / `lg:` / `xl:`):

```
components/app-shell.tsx # the only file that knows global form factor
components/bottom-nav.tsx # mobile dock; `md:hidden` is correct here
components/side-rail.tsx # tablet rail; `hidden md:flex` is correct
components/desktop-side-nav.tsx # desktop sidebar; `hidden lg:flex`
app/layout.tsx # SSR root, sets data-form-factor first-paint fallback
```

Default content list (files that must use `@md:` / `@lg:` container
queries OR axis-token variants):

```
design-system/primitives/** # Card, Button, Input, OptionCard, etc.
features/**/components/** # feature-level UI
app/**/page.tsx # route content (page chrome lives in layout)
```

Any time someone adds a 5th file to the chrome allow-list, that's a code
review smell: usually it should have been a content file with a
container query, not a chrome file with a viewport query.

---

## Step 3 — Probe live (SSR first-paint + runtime axes)  [LOW freedom — run exactly]

### 3a. SSR / hydration first-paint check

Hybrid web apps render twice: first on the server (no `window`, no
`Capacitor.getPlatform()`), then on the client. If the form factor /
platform decision is made in *render*, you ship a flash of wrong
chrome on every navigation.

| Probe | Where to look | Failure shape |
|-------|---------------|---------------|
| First-paint at /compact | View page source (Next.js `?_rsc` or curl) | If both `<BottomNav>` AND `<DesktopSideNav>` render, then JS hides one — you have FOUC |
| First-paint at /expanded | Same | If neither renders, then JS reveals one — you have a 200ms gap of no nav |
| Capacitor first-paint | iOS/Android WebView devtools | If `data-platform=""` for the first 50ms, your platform-specific tokens haven't applied yet |

Fix shape: render *both* chrome variants on the server (dual-mount), gate
visibility purely with CSS via a viewport `@media` query. The CSS query
runs synchronously at first paint, no JS needed. The form-factor `data-`
attribute is then written by JS *after* hydration, used only for axis-
specific tweaks not chrome visibility.

### 3b. Runtime axes probe (in the browser console, in each shell)

```js
// Generic, framework-free; works in DevTools console / playwright-cli / native WebView
const html = document.documentElement;
console.table({
 formFactor: html.dataset.formFactor || '(not set)',
 platform: html.dataset.platform || '(not set)',
 canHover: html.dataset.canHover || '(not set)',
 viewport: `${innerWidth}x${innerHeight}`,
 ua: navigator.userAgent.slice(0, 80),
});
// Then resize the window and re-run — does formFactor flip live?
// On iOS Safari: rotate device — does formFactor flip?
// On Capacitor iOS: send to background and resume — does any value get stale?
```

Any `(not set)` cell at first paint is a bug — your context hook is
running too late.

### 3c. Container-query gate

For any primitive you are about to convert from `lg:` to `@lg:`, measure
the rendered widths *before* the change and *after*. If the change is
correct, the primitive should:

- Render the wider layout when its parent slot is wide (container > N px).
- Render the narrower layout when its parent slot is narrow.
- Be **independent** of the global viewport — drop it inside a 320 px
 side panel on a 1920 px monitor and it should look like the compact
 variant.

```js
// In the browser console / Playwright evaluate
const cards = [...document.querySelectorAll('[data-card]')];
console.table(cards.map(c => ({
 rect: Math.round(c.getBoundingClientRect().width),
 layout: getComputedStyle(c).gridTemplateColumns || getComputedStyle(c).flexDirection,
})));
// Expect: layout flips at the container threshold, not the viewport
```

---

## Hidden Failure Modes (the cross-surface ones)

Parallel to `enhance-web-ui` H1–H16 but specific to multi-surface
contracts. Each entry has a **detection probe** and a **fix shape**.
Generic across stacks.

### M1. Axis conflation in a single boolean

**Symptom:** "Mobile sheet renders on iPad landscape", "desktop side
panel renders on touch laptop", "iOS-style overlay shows on Android".

**Detection:** `rg -n 'useIsMobile|isMobile' --type ts | wc -l` returns
> 5. Read each call site and ask: "is this asking about screen size,
about platform, about pointer capability, or about the *combination*?"

**Fix shape:** Replace the single boolean with three answers from
`useViewportContext()` (or equivalent). Update each call site
explicitly:

```ts
// before
if (isMobile) return <Sheet>{children}</Sheet>;
return <Popover>{children}</Popover>;

// after — three axes addressed independently
const { formFactor, canHover } = useViewportContext();
if (formFactor === "compact") return <Sheet>{children}</Sheet>;
if (!canHover) return <Sheet>{children}</Sheet>;
return <Popover>{children}</Popover>;
```

Most "mobile" branches are actually "compact form factor OR coarse
pointer", which is *not* the same as `viewport < 768`.

### M2. Tier-A heuristics applied to expanded form factor (or vice versa)

**Symptom:** "Phone looks like a B2B dashboard", "desktop looks like a
toy". Result of running a single UIUX sweep that picked one saturation
tier and applied it across all form factors.

**Detection:** Take the desktop screenshot, take the phone screenshot,
side by side. If both surfaces use the same `/8` background tint and
the same primary CTA chrome, you've ignored form factor. Tier-A on
phone (`/15–/25` tints, solid CTAs, semantic hue per category) and
tier-C on desktop (`/6–/12` tints, one accent, achromatic chrome) is
*correct* for a learning / consumer / lifestyle app — not a bug.

**Fix shape:** Document the per-form-factor tier in your `HEURISTICS.md`.
Pick the tier per `data-form-factor` selector at the token layer:

```css
:root[data-form-factor="compact"] {
 --surface-tier-mix: 0.20; /* tier-A vibrant */
 --cta-bg: var(--color-cta); /* solid */
}
:root[data-form-factor="expanded"] {
 --surface-tier-mix: 0.08; /* tier-C restrained */
 --cta-bg: transparent; /* outline */
 --cta-border: var(--color-cta);
}
```

Then primitives consume `--surface-tier-mix` and `--cta-bg` once;
the form factor decides which tier paints.

### M3. No `data-platform` on `<html>` (token forks living in components)

**Symptom:** Buttons forked per platform inside JSX
(`if (platform === "ios") rounded-2xl else rounded-md`). Five
components do this; the sixth forgets and the bug ships to one shell.

**Detection:** `rg -n 'getPlatform\(\)|isNativePlatform' --type tsx`
returns > 3 hits in component code (not in the context hook itself).

**Fix shape:** Detect platform once, write `<html data-platform>`,
declare per-platform token overrides in CSS:

```css
:root[data-platform="ios"] {
 --radius-overlay: 1.25rem;
 --press-scale: 0.96;
 --tap-highlight: transparent;
 -webkit-tap-highlight-color: transparent;
}
:root[data-platform="android"] {
 --radius-overlay: 1.75rem; /* M3 corner-extra-large */
 --press-scale: 1; /* Android uses ripple, not scale */
 --tap-highlight: rgba(0, 0, 0, 0.08);
 -webkit-tap-highlight-color: rgba(0, 0, 0, 0.08);
}
```

Components reference `var(--radius-overlay)` once; the platform layer
picks which value paints. Delete the JSX forks.

### M4. Bare `md:` for component micro-layout

**Symptom:** A card that flips to two columns at viewport-`lg:` looks
broken when dropped into a 400 px side panel on a 1920 px monitor —
the card is narrow but the viewport says "go two-column", so the
content overflows.

**Detection:** Grep for `md:grid-cols-2` / `lg:flex-row` /
`xl:items-center` inside `design-system/primitives/**` or
`features/**/components/**`. Anything outside the chrome allow-list
is a candidate.

**Fix shape:** Make the primitive a `@container` and convert
`md:` → `@md:`, `lg:` → `@lg:`. Pick the container-query breakpoint
that matches the *effective slot width*, not the viewport:

```tsx
// before — viewport-coupled, breaks in side panels
<Card className="grid lg:grid-cols-[1fr_2fr]">…</Card>

// after — slot-coupled, works anywhere
<Card className="@container grid @4xl:grid-cols-[1fr_2fr]">…</Card>
// ^^^^^^^^^^^ ^^^^^^
// container root container threshold
```

Picking the threshold: if the previous viewport `lg:` (1024 px) worked
because the main column was ~896 px wide at that viewport, the new
container threshold is `@4xl:` (~896 px). Container queries don't
inherit Tailwind's viewport scale; they have their own (`@xs` 320, `@sm`
384, `@md` 448, `@lg` 512, `@xl` 576, `@2xl` 672, `@3xl` 768,
`@4xl` 896, `@5xl` 1024, `@6xl` 1152, `@7xl` 1280). Choose the one that
matches the slot's typical width, not the viewport's.

## Further reading

- [M5. `(hover: hover)` media queries copy-pasted across components and more](references/details.md)
- `enhance-mobile-native-feel` — once the surfaces are separated, make the compact native surface feel native (chrome, sheets, haptics, motion)
