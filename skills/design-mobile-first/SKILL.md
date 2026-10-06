---
name: design-mobile-first
description: >
  Design a new touch-first UI: targets, safe areas, gestures, then enhance up.
  Use when building for phones, touch, swipe, PWA, or tablet. Responsive audit →
  audit-responsive.
license: MIT
---

# Mobile-First Design Skill

**Degree of freedom: MIXED.** Pattern choice `[HIGH freedom]`; breakpoint,
viewport, and existing-hook inventory `[LOW freedom — run exactly]`.

Build interfaces that work on mobile first, then enhance for larger screens.

**Not this skill:** a desktop that is a linearized phone (no max-width, stacked
at 1440, stretched buttons). That is `audit-responsive`.

## How to reason

1. **Survey** — breakpoints, viewport, existing mobile hooks
2. **Base** — mobile styles first (44px, safe-area)
3. **Enhance** — `sm:`/`md:`/`lg:` add up; they do not replace the base
4. **Device-check** — real phone, not only a resized desktop window

## Worked example

> **Survey:** Tailwind `sm/md/lg` exist; checkout CTA is `h-8`; no `safe-area-inset-bottom`.
> **Base:** `min-h-[44px]`, `pb-[env(safe-area-inset-bottom)]`, stacked fields, 16px inputs.
> **Enhance:** two-column names at `sm:`; table replaces cards at `md:`.
> **Device-check:** thumb reaches the CTA; iOS does not zoom on focus.

## Self-critique before reporting

- **Base is mobile** — primary layout is not `lg:`-only
- **44px + safe-area** — tap targets and notches were measured
- **Real device** — not emulator-or-resize only
- **Right owner** — linearized 1440 desktop → `audit-responsive`; hybrid native chrome → `enhance-capacitor-ui`

## Check existing first  [LOW freedom — run exactly]

**Before ANY mobile optimization, verify:**

1. **Check existing breakpoints:**
```bash
cat tailwind.config.* | grep -A10 "screens\|breakpoints"
rg "sm:|md:|lg:|xl:" --type tsx | head -20
```

2. **Check for existing mobile patterns:**
```bash
rg "useMediaQuery|useBreakpoint|isMobile" --type ts --type tsx
ls -la src/hooks/use*Mobile* src/hooks/use*Responsive* 2>/dev/null
```

3. **Check viewport meta:**
```bash
rg "viewport" src/app/layout.tsx index.html
```

**Why:** Maintain consistent responsive patterns across the app.

## Mobile-First Principles  [HIGH freedom]

### 1. Design for Mobile First
Base styles are mobile; media queries and `sm:`/`md:`/`lg:` prefixes only add (`p-4 sm:p-6 md:p-8`, `text-sm sm:text-base lg:text-lg`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
```css
.card {
 padding: 1rem;
 font-size: 0.875rem;
}
@media (min-width: 640px) {
 .card {
 padding: 1.5rem;
 font-size: 1rem;
 }
}
```

### 2. Touch Targets (44px minimum)
List items too: `py-3 px-4 min-h-[44px] active:bg-muted`. Icon buttons extend the hit area with negative margin.
```tsx
<button className="min-h-[44px] min-w-[44px] px-4 py-3">
 Tap me
</button>

<button
 className="p-3 -m-3" // Negative margin extends touch area
 aria-label="Menu"
>
 <MenuIcon className="h-5 w-5" />
</button>
```

### 3. Thumb-Friendly Zones
Primary actions in a fixed bottom nav; `.safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }` for notched devices.
```tsx
<nav className="fixed bottom-0 left-0 right-0 border-t bg-background safe-area-pb">
 <div className="flex justify-around py-2">
 <NavItem icon={HomeIcon} label="Home" />
 <NavItem icon={SearchIcon} label="Search" />
 <NavItem icon={PlusIcon} label="Create" />
 <NavItem icon={BellIcon} label="Alerts" />
 <NavItem icon={UserIcon} label="Profile" />
 </div>
</nav>
```

## Responsive Patterns

### Native shell first (Expo / Capacitor, 2026)

When the UI ships inside a native shell, the platform already owns the chrome.
Do not rebuild it in JS or HTML:

- **Tab bar:** Expo Router `NativeTabs` (`expo-router/native-tabs`, SDK 58+;
  `unstable-native-tabs` on SDK 54–57) or Ionic `ion-tab-bar`. 3–5 destinations,
  filled symbols, one-word labels. iOS 26 draws Liquid Glass and minimizes on scroll.
- **Edge-to-edge:** Android 16 enforces it. Expo: `react-native-safe-area-context`
  insets at the screen root. Capacitor 8.3.2+: `viewport-fit=cover` plus
  `padding: var(--safe-area-inset-top, env(safe-area-inset-top, 0px))`; the legacy
  `StatusBar.setBackgroundColor` is a no-op on Android 16.
- **Secondary flows:** a sheet with snap points (Gorhom v5 / `ion-modal` breakpoints),
  not a new page.
- **Feedback:** press scale 0.96–0.98 on the UI thread; haptics only on confirm,
  selection, and snap, never on plain taps.

For an app that already exists and feels like a web page, run
`enhance-mobile-native-feel`; the drawer below is the web / PWA pattern.

### Mobile Navigation (web / PWA)

A slide-in drawer with backdrop, spring transition, and a close control. Full component in
[references/web-nav-drawer.md](references/web-nav-drawer.md). Keep it `lg:hidden`; on native shells the system tab bar replaces it.

### Responsive Tables
Card layout in a `md:hidden` stack on mobile; a `hidden md:table` traditional table on desktop, both mapping the same data.
Full component: [references/components.md](references/components.md) §Responsive Tables.

### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```
Auto-fit variant (`grid-cols-[repeat(auto-fit,minmax(280px,1fr))]`): [references/components.md](references/components.md) §Responsive Grid.

## Touch Gestures  [HIGH freedom]

- **Swipe to delete** — `drag="x"` with `dragConstraints={{ left: -100, right: 0 }}`; background interpolates to red via `useTransform`; delete when `offset.x < -100`
- **Pull to refresh** — `drag="y"`, `dragElastic={0.5}`; indicator opacity/scale follow `y` over 0–60px; refresh when `y > 60`

Full components: [references/components.md](references/components.md) §Swipe to Delete, §Pull to Refresh.

## Mobile-Specific Components  [HIGH freedom]

- **Bottom sheet** — backdrop + `y: '100%' → 0` panel, `rounded-t-xl max-h-[90vh]`, drag handle via `useDragControls`; close on `velocity.y > 500` or `offset.y > 200`; `pb-safe` content
- **Forms** — stack fields, `sm:grid-cols-2` up; inputs `h-12` with `fontSize: '16px'` to prevent iOS focus-zoom; `w-full sm:w-auto h-12` submit

Full components: [references/components.md](references/components.md) §Bottom Sheet, §Mobile-Optimized Forms.

## PWA Features  [HIGH freedom]

- **Viewport** — `width: 'device-width', initialScale: 1, viewportFit: 'cover'`; no `maximumScale` / `userScalable: false` (the 16px inputs already stop iOS focus-zoom, and disabling pinch-zoom fails WCAG 1.4.4); `appleWebApp` capable + title
- **Install prompt** — capture `beforeinstallprompt`, `preventDefault`, show a card with Install / Not now; call `prompt()` and read `userChoice`

Code: [references/pwa.md](references/pwa.md).

## Validation  [LOW freedom — do not skip]

Touch ≥44px · thumb-zone CTAs · gestures with feedback · 60fps · no focus-zoom · safe-area (edge-to-edge on Android 16) · offline-graceful · real device (not emulator-only).

## Related

- `enhance-mobile-native-feel` — an existing Expo/RN or Capacitor app that feels like a website
- `audit-responsive` — unstack desktop; layout/IA at 375 / 768 / 1440
- `enhance-capacitor-ui` — hybrid web + native form-factor axes
- `design-frontend` — new visual surfaces
- `audit-performance` — mobile perf budgets
