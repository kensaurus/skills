# CSS-only animations and GSAP

Tailwind animation utilities and config from SKILL.md §CSS-Only Animations, and the GSAP ScrollTrigger timeline from §GSAP for Complex Animations.

## Tailwind Animations
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
