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
```css
/* Base styles = mobile */
.card {
 padding: 1rem;
 font-size: 0.875rem;
}

/* Then enhance for larger screens */
@media (min-width: 640px) {
 .card {
 padding: 1.5rem;
 font-size: 1rem;
 }
}

/* Tailwind design-mobile-first */
<div className="p-4 sm:p-6 md:p-8">
<div className="text-sm sm:text-base lg:text-lg">
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

### 2. Touch Targets (44px minimum)
```tsx
// Touch-friendly button
<button className="min-h-[44px] min-w-[44px] px-4 py-3">
 Tap me
</button>

// Touch-friendly list items
<li className="py-3 px-4 min-h-[44px] active:bg-muted">
 List item
</li>

// Icon buttons with proper touch area
<button
 className="p-3 -m-3" // Negative margin extends touch area
 aria-label="Menu"
>
 <MenuIcon className="h-5 w-5" />
</button>
```

### 3. Thumb-Friendly Zones
```tsx
// Bottom navigation for primary actions
<nav className="fixed bottom-0 left-0 right-0 border-t bg-background safe-area-pb">
 <div className="flex justify-around py-2">
 <NavItem icon={HomeIcon} label="Home" />
 <NavItem icon={SearchIcon} label="Search" />
 <NavItem icon={PlusIcon} label="Create" />
 <NavItem icon={BellIcon} label="Alerts" />
 <NavItem icon={UserIcon} label="Profile" />
 </div>
</nav>

// Safe area padding for notched devices
.safe-area-pb {
 padding-bottom: env(safe-area-inset-bottom);
}
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
```tsx
// Card-based layout on mobile, table on desktop
export function ResponsiveTable({ data }: { data: Item[] }) {
 return (
 <>
 {/* Mobile: Card layout */}
 <div className="space-y-4 md:hidden">
 {data.map((item) => (
 <div key={item.id} className="rounded-lg border p-4">
 <div className="flex justify-between">
 <span className="font-medium">{item.name}</span>
 <span className="text-muted-foreground">{item.date}</span>
 </div>
 <div className="mt-2 text-sm text-muted-foreground">
 {item.description}
 </div>
 <div className="mt-3 flex justify-between items-center">
 <span className="font-semibold">{item.amount}</span>
 <Badge>{item.status}</Badge>
 </div>
 </div>
 ))}
 </div>

 {/* Desktop: Traditional table */}
 <table className="hidden md:table w-full">
 <thead>
 <tr className="border-b">
 <th className="text-left py-3">Name</th>
 <th className="text-left py-3">Date</th>
 <th className="text-left py-3">Amount</th>
 <th className="text-left py-3">Status</th>
 </tr>
 </thead>
 <tbody>
 {data.map((item) => (
 <tr key={item.id} className="border-b">
 <td className="py-3">{item.name}</td>
 <td className="py-3">{item.date}</td>
 <td className="py-3">{item.amount}</td>
 <td className="py-3"><Badge>{item.status}</Badge></td>
 </tr>
 ))}
 </tbody>
 </table>
 </>
 )
}
```

### Responsive Grid
```tsx
// Fluid grid that adapts to screen size
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
 {items.map((item) => (
 <Card key={item.id}>{item.content}</Card>
 ))}
</div>

// Auto-fit grid (items wrap naturally)
<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
 {items.map((item) => (
 <Card key={item.id}>{item.content}</Card>
 ))}
</div>
```

## Touch Gestures

### Swipe to Delete
```tsx
'use client'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

export function SwipeableItem({ onDelete, children }: SwipeableItemProps) {
 const x = useMotionValue(0)
 const background = useTransform(
 x,
 [-100, 0],
 ['rgb(239 68 68)', 'rgb(255 255 255)']
 )

 const handleDragEnd = (_: any, info: PanInfo) => {
 if (info.offset.x < -100) {
 onDelete()
 }
 }

 return (
 <motion.div style={{ background }} className="relative overflow-hidden rounded-lg">
 <motion.div
 drag="x"
 dragConstraints={{ left: -100, right: 0 }}
 onDragEnd={handleDragEnd}
 style={{ x }}
 className="bg-background p-4"
 >
 {children}
 </motion.div>
 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white">
 <TrashIcon className="h-5 w-5" />
 </div>
 </motion.div>
 )
}
```

### Pull to Refresh
```tsx
'use client'
import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
 const [isRefreshing, setIsRefreshing] = useState(false)
 const y = useMotionValue(0)
 const opacity = useTransform(y, [0, 60], [0, 1])
 const scale = useTransform(y, [0, 60], [0.5, 1])

 const handleDragEnd = async () => {
 if (y.get() > 60) {
 setIsRefreshing(true)
 await onRefresh()
 setIsRefreshing(false)
 }
 }

 return (
 <div className="overflow-hidden">
 <motion.div
 style={{ opacity, scale }}
 className="flex justify-center py-4"
 >
 <RefreshIcon className={cn('h-6 w-6', isRefreshing && 'animate-spin')} />
 </motion.div>
 <motion.div
 drag="y"
 dragConstraints={{ top: 0, bottom: 0 }}
 dragElastic={0.5}
 onDragEnd={handleDragEnd}
 style={{ y }}
 >
 {children}
 </motion.div>
 </div>
 )
}
```

## Mobile-Specific Components

### Bottom Sheet
```tsx
'use client'
import { motion, useDragControls, PanInfo } from 'framer-motion'

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
 const controls = useDragControls()

 const handleDragEnd = (_: any, info: PanInfo) => {
 if (info.velocity.y > 500 || info.offset.y > 200) {
 onClose()
 }
 }

 if (!isOpen) return null

 return (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black/50 z-40"
 onClick={onClose}
 />
 <motion.div
 initial={{ y: '100%' }}
 animate={{ y: 0 }}
 exit={{ y: '100%' }}
 drag="y"
 dragControls={controls}
 dragConstraints={{ top: 0 }}
 dragElastic={0.2}
 onDragEnd={handleDragEnd}
 className="fixed bottom-0 left-0 right-0 bg-background rounded-t-xl z-50 max-h-[90vh] overflow-hidden"
 >
 {/* Drag handle */}
 <div
 className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
 onPointerDown={(e) => controls.start(e)}
 >
 <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
 </div>
 <div className="px-4 pb-safe overflow-y-auto max-h-[calc(90vh-40px)]">
 {children}
 </div>
 </motion.div>
 </>
 )
}
```

### Mobile-Optimized Forms
```tsx
// Stack form fields vertically on mobile
<form className="space-y-4">
 <div className="grid gap-4 sm:grid-cols-2">
 <div className="space-y-2">
 <Label htmlFor="firstName">First Name</Label>
 <Input
 id="firstName"
 // Larger touch targets
 className="h-12 text-base"
 // Prevent iOS zoom on focus
 style={{ fontSize: '16px' }}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="lastName">Last Name</Label>
 <Input
 id="lastName"
 className="h-12 text-base"
 style={{ fontSize: '16px' }}
 />
 </div>
 </div>

 {/* Full-width button on mobile */}
 <Button className="w-full sm:w-auto h-12">
 Submit
 </Button>
</form>
```

## PWA Features

### Viewport & Meta Tags
```tsx
// app/layout.tsx
export const metadata = {
 viewport: {
 width: 'device-width',
 initialScale: 1,
 // No maximumScale / userScalable: false — the 16px inputs above already stop iOS focus-zoom,
 // and disabling pinch-zoom fails WCAG 1.4.4
 viewportFit: 'cover', // For notched devices
 },
 appleWebApp: {
 capable: true,
 statusBarStyle: 'default',
 title: 'My App',
 },
}
```

### Install Prompt
```tsx
'use client'
import { useEffect, useState } from 'react'

export function InstallPrompt() {
 const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

 useEffect(() => {
 const handler = (e: Event) => {
 e.preventDefault()
 setDeferredPrompt(e)
 }

 window.addEventListener('beforeinstallprompt', handler)
 return () => window.removeEventListener('beforeinstallprompt', handler)
 }, [])

 if (!deferredPrompt) return null

 const handleInstall = async () => {
 deferredPrompt.prompt()
 const { outcome } = await deferredPrompt.userChoice
 if (outcome === 'accepted') {
 setDeferredPrompt(null)
 }
 }

 return (
 <div className="fixed bottom-20 left-4 right-4 p-4 bg-card border rounded-lg shadow-lg">
 <p className="font-medium">Install our app</p>
 <p className="text-sm text-muted-foreground">Get quick access from your home screen</p>
 <div className="mt-3 flex gap-2">
 <Button onClick={handleInstall}>Install</Button>
 <Button variant="ghost" onClick={() => setDeferredPrompt(null)}>
 Not now
 </Button>
 </div>
 </div>
 )
}
```

## Validation  [LOW freedom — do not skip]

Touch ≥44px · thumb-zone CTAs · gestures with feedback · 60fps · no focus-zoom · safe-area (edge-to-edge on Android 16) · offline-graceful · real device (not emulator-only).

## Related

- `enhance-mobile-native-feel` — an existing Expo/RN or Capacitor app that feels like a website
- `audit-responsive` — unstack desktop; layout/IA at 375 / 768 / 1440
- `enhance-capacitor-ui` — hybrid web + native form-factor axes
- `design-frontend` — new visual surfaces
- `audit-performance` — mobile perf budgets
