---
name: design-motion
description: >
  Build one new animation (micro-interaction, page transition, scroll, hover)
  with Motion, CSS, or GSAP. Use when adding one animation to a new surface. A
  pass across an existing app → enhance-motion.
license: MIT
---

# Motion Design Skill

**Degree of freedom: MIXED.** Purpose and timing `[HIGH freedom]`; existing
motion inventory and reduced-motion `[LOW freedom — run exactly]`.

Create purposeful, performant animations that enhance UX without overwhelming users.

## How to reason

1. **Inventory** — existing motion library and `prefers-reduced-motion`
2. **Purpose** — feedback, orientation, focus, or (rare) delight
3. **Implement** — `transform`/`opacity` only; match the app's timing
4. **Motion-safe** — reduced-motion becomes an instant state change

## Worked example

> **Inventory:** Framer Motion already on the modal; no reduced-motion branch.
> **Purpose:** orientation — show the dialog arriving, not decoration.
> **Implement:** opacity + scale 0.95→1, 200ms ease-out; no `height` animation.
> **Motion-safe:** `prefers-reduced-motion` skips enter/exit; focus still moves.

## Self-critique before reporting

- **Purpose named** — not motion for its own sake
- **GPU-only** — no width/height/top/left animation
- **Reduced-motion proven** — a reduce setting was actually tested
- **Right owner** — app-wide coherent motion pass → `enhance-motion`

## Check existing first  [LOW freedom — run exactly]

**Before adding ANY animation, verify:**

1. **Check for existing animation utilities:**
```bash
cat package.json | grep -i "framer-motion\|gsap\|animat"
rg "motion\.|animate\(|useSpring" --type tsx -l | head -10
```

2. **Check for existing CSS animations:**
```bash
rg "@keyframes|animation:" --type css
cat tailwind.config.* | grep -A20 "animation\|keyframes"
```

3. **Check for animation preferences:**
```bash
rg "prefers-reduced-motion" --type tsx --type css
```

**Why:** Maintain consistent animation language. Respect user motion preferences.

## Animation Principles  [HIGH freedom]

### 1. Purpose-Driven Motion
Every animation should serve a purpose:
- **Feedback** - Confirm user actions (button press, form submit)
- **Orientation** - Show where elements come from/go to
- **Focus** - Direct attention to important elements
- **Delight** - Add personality (use sparingly)

### 2. Performance Rules
- Use `transform` and `opacity` only (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left` (trigger layout)
- Use `will-change` sparingly and remove after animation
- Target 60fps - keep animations under 100ms for interactions

### 3. Springs, not bezier soup (2026)
- One spring vocabulary per app: **spatial** springs (position, size, radius) may
  overshoot; **effects** springs (color, opacity) never do. Three speeds: fast for
  small controls, default for sheets and panels, slow for full-screen changes
  (Material 3 motion-physics system; Motion `type: "spring"` on the web).
- React Native / Expo: this is Reanimated territory (`withSpring` on the UI thread,
  Reanimated 4 CSS-style transitions). The native recipe lives in
  `enhance-mobile-native-feel` → `references/stack-recipes.md`; this skill stays web.

## Framer Motion Patterns (React)

### Basic Animations
```tsx
import { motion } from 'framer-motion'

// Entrance animation
<motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3, ease: "easeOut" }}
>
 Content
</motion.div>

// Exit animation
<motion.div
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ duration: 0.2 }}
>
 Content
</motion.div>
```

### Hover & Tap Interactions
```tsx
<motion.button
 whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
 whileTap={{ scale: 0.98 }}
 transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
 Click me
</motion.button>
```

### Staggered Lists
```tsx
const container = {
 hidden: { opacity: 0 },
 show: {
 opacity: 1,
 transition: { staggerChildren: 0.05 }
 }
}

const item = {
 hidden: { opacity: 0, x: -20 },
 show: { opacity: 1, x: 0 }
}

<motion.ul variants={container} initial="hidden" animate="show">
 {items.map(i => (
 <motion.li key={i.id} variants={item}>{i.name}</motion.li>
 ))}
</motion.ul>
```

### Scroll-Triggered Animations
```tsx
import { motion, useScroll, useTransform } from 'framer-motion'

function ParallaxSection() {
 const { scrollYProgress } = useScroll()
 const y = useTransform(scrollYProgress, [0, 1], [0, -100])
 const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0])

 return (
 <motion.div style={{ y, opacity }}>
 Parallax content
 </motion.div>
 )
}
```

### Page Transitions (Next.js)
```tsx
// app/template.tsx
'use client'
import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3 }}
 >
 {children}
 </motion.div>
 )
}
```

### Layout Animations
```tsx
// Shared layout animations
<motion.div layout layoutId="card">
 {isExpanded ? <ExpandedCard /> : <CollapsedCard />}
</motion.div>

// Smooth height changes
<motion.div
 layout
 transition={{ layout: { duration: 0.3 } }}
>
 {showMore && <AdditionalContent />}
</motion.div>
```

## CSS-Only Animations

### Tailwind Animations
```tsx
// Fade in
<div className="animate-in fade-in duration-300">

// Slide up
<div className="animate-in slide-in-from-bottom-4 duration-500">

// Combined
<div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">

// Custom in tailwind.config.ts
animation: {
 'float': 'float 3s ease-in-out infinite',
 'pulse-slow': 'pulse 3s ease-in-out infinite',
 'shimmer': 'shimmer 2s linear infinite',
}
keyframes: {
 float: {
 '0%, 100%': { transform: 'translateY(0)' },
 '50%': { transform: 'translateY(-10px)' },
 },
 shimmer: {
 '0%': { backgroundPosition: '-200% 0' },
 '100%': { backgroundPosition: '200% 0' },
 },
}
```

### Loading Skeleton
```tsx
<div className="animate-pulse space-y-4">
 <div className="h-4 bg-muted rounded w-3/4" />
 <div className="h-4 bg-muted rounded w-1/2" />
</div>

// Shimmer effect
<div className="relative overflow-hidden bg-muted rounded">
 <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
</div>
```

## GSAP for Complex Animations

```tsx
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

function HeroSection() {
 const containerRef = useRef(null)

 useGSAP(() => {
 const tl = gsap.timeline({
 scrollTrigger: {
 trigger: containerRef.current,
 start: "top center",
 end: "bottom center",
 scrub: 1,
 }
 })

 tl.from(".hero-title", { opacity: 0, y: 100, duration: 1 })
 .from(".hero-subtitle", { opacity: 0, y: 50 }, "-=0.5")
 .from(".hero-cta", { opacity: 0, scale: 0.8 }, "-=0.3")
 }, { scope: containerRef })

 return <div ref={containerRef}>...</div>
}
```

## Micro-interaction reference

Options, not a checklist. This skill adds one animation, so pick the single item the purpose needs; unrequested hover, zoom, or reveal effects are scope creep.

### Buttons
- Hover: subtle scale (1.02) + shadow
- Active/tap: scale down (0.98)
- Loading: spinner + disabled state
- Success: checkmark animation
- Focus: visible ring animation

### Forms
- Input focus: border color transition
- Label float animation on focus
- Error shake animation
- Success checkmark
- Submit button loading state

### Navigation
- Active indicator slides
- Dropdown fade + slide
- Mobile menu slide from edge
- Breadcrumb transitions

### Cards
- Hover lift effect
- Image zoom on hover
- Content reveal on hover
- Selection state pulse

### Modals
- Backdrop fade in
- Content scale + fade
- Exit animation before unmount

## Accessibility  [LOW freedom — run exactly]

```tsx
// Always respect reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Framer Motion
<motion.div
 initial={prefersReducedMotion ? false : { opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
>

// CSS
@media (prefers-reduced-motion: reduce) {
 *, *::before, *::after {
 animation-duration: 0.01ms !important;
 transition-duration: 0.01ms !important;
 }
}

// Tailwind
<div className="motion-safe:animate-bounce motion-reduce:animate-none">
```

## Delight & gamification patterns

For playful interactions (bouncy buttons, magnetic elements, confetti, Konami code, satisfying toggles, progress milestones), see [references/delight-interactions.md](references/delight-interactions.md).

## Validation  [LOW freedom — do not skip]

After implementing animations:

1. **Performance** → 60fps in Chrome DevTools Performance tab
2. **Reduced motion** → Test with `prefers-reduced-motion: reduce`
3. **Mobile** → Test on actual device (not just emulator); native apps also check the OS reduce-motion switch, not only the CSS media query
4. **Purpose** → Each animation serves a clear UX purpose
5. **Consistency** → Timing/easing matches rest of app
