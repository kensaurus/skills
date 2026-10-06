# CSS, SVG & Canvas 2D Effect Patterns

Lightweight alternatives to WebGL — use these when Three.js / R3F is overkill.

## Contents

- Glassmorphism
- Animated gradient background
- Noise / grain texture
- SVG morphing (Framer Motion)
- Canvas 2D particle system
- Mouse-following cursor glow
- Performance notes


---

## Glassmorphism

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
/* Isolate to avoid cross-element bleed */
.glass-container { isolation: isolate; }
```

---

## Animated gradient background

```css
.animated-gradient {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}
@keyframes gradient {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

---

## Noise / grain texture

```css
.grain::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.05;
  pointer-events: none;
}
```

---

## SVG morphing (Framer Motion)

```tsx
import { motion } from 'framer-motion'

const paths = {
  circle: "M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10",
  square: "M10,10 L90,10 L90,90 L10,90 Z",
  star:   "M50,10 L61,40 L95,40 L68,60 L79,90 L50,72 L21,90 L32,60 L5,40 L39,40 Z",
}

function MorphingSVG({ shape }: { shape: keyof typeof paths }) {
  return (
    <svg viewBox="0 0 100 100">
      <motion.path
        d={paths[shape]}
        animate={{ d: paths[shape] }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        fill="currentColor"
      />
    </svg>
  )
}
```

---

## Canvas 2D particle system

```tsx
'use client'
import { useEffect, useRef } from 'react'

interface Particle { x: number; y: number; vx: number; vy: number; size: number; alpha: number }

export function ParticleBackground({ count = 100 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    let animId:  number

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size:  Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x = (p.x + p.vx + canvas.width)  % canvas.width
        p.y = (p.y + p.vy + canvas.height) % canvas.height
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`
        ctx.fill()
      })
      // Connection lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 100) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(255,255,255,${0.2 * (1 - d / 100)})`
            ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [count])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 -z-10"
      style={{ width: '100%', height: '100%' }} />
  )
}
```

---

## Mouse-following cursor glow

```tsx
'use client'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect } from 'react'

export function CursorFollower() {
  const x = useSpring(useMotionValue(0), { stiffness: 500, damping: 28 })
  const y = useSpring(useMotionValue(0), { stiffness: 500, damping: 28 })

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])

  return (
    <motion.div
      className="fixed w-8 h-8 bg-primary/30 rounded-full pointer-events-none
                 -translate-x-1/2 -translate-y-1/2 z-50 mix-blend-difference"
      style={{ x, y }}
    />
  )
}
```

---

## Performance notes

- `backdrop-filter` is GPU-expensive — use on ≤3 elements.
- Canvas particle counts: full desktop 100, mobile ≤25.
- Always `cancelAnimationFrame` on cleanup.
- `will-change: transform` only during animation, remove after.
- Respect `prefers-reduced-motion` — skip or minimise all effects.
