# Delight & Interactive UX Patterns

Purposeful play — every interaction enhances understanding or provides feedback.
Fun should support the task, not distract from it.

## Contents

- Success celebrations
- Bouncy / jelly buttons
- Magnetic button
- Satisfying toggle
- Gamification: progress with milestones
- Easter egg: Konami code
- Principles


---

## Success celebrations

```tsx
'use client'
import confetti from 'canvas-confetti'

export function useSuccessCelebration() {
  const celebrate = (intensity: 'small' | 'medium' | 'large' = 'medium') => {
    const config = {
      small:  { particleCount: 30,  spread: 50 },
      medium: { particleCount: 100, spread: 70 },
      large:  { particleCount: 200, spread: 100, startVelocity: 45 },
    }
    confetti({ ...config[intensity], origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'] })
  }
  return { celebrate }
}
```

---

## Bouncy / jelly buttons

```tsx
import { motion } from 'framer-motion'

export function BouncyButton({ children, onClick }: ButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
    >
      {children}
    </motion.button>
  )
}

export function JellyButton({ children }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: [1, 0.9, 1.1, 0.95, 1.02, 1], transition: { duration: 0.4 } }}
      className="px-6 py-3 bg-primary rounded-lg"
    >
      {children}
    </motion.button>
  )
}
```

---

## Magnetic button

```tsx
'use client'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'

export function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width  / 2) * 0.3)
    y.set((e.clientY - rect.top  - rect.height / 2) * 0.3)
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg"
    >
      {children}
    </motion.button>
  )
}
```

---

## Satisfying toggle

```tsx
'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function SatisfyingToggle({ onToggle }: { onToggle: (on: boolean) => void }) {
  const [isOn, setIsOn] = useState(false)
  const toggle = () => {
    setIsOn(v => !v)
    onToggle(!isOn)
    if ('vibrate' in navigator) navigator.vibrate(10)
  }
  return (
    <motion.button
      onClick={toggle}
      className={`w-14 h-8 rounded-full p-1 ${isOn ? 'bg-primary' : 'bg-muted'}`}
      animate={{ backgroundColor: isOn ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-md"
        animate={{ x: isOn ? 22 : 0, scale: [1, 1.1, 1] }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      />
    </motion.button>
  )
}
```

---

## Gamification: progress with milestones

```tsx
export function PlayfulProgress({ value }: { value: number }) {
  const milestones = [25, 50, 75, 100]
  return (
    <div className="relative">
      <div className="h-4 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        />
      </div>
      {value === 100 && (
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute -top-6 right-0 text-sm">
          🎉 Complete!
        </motion.span>
      )}
    </div>
  )
}
```

---

## Easter egg: Konami code

```tsx
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA']

export function useKonamiCode(callback: () => void) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.code === KONAMI[index]) {
        if (index === KONAMI.length - 1) { callback(); setIndex(0) }
        else setIndex(i => i + 1)
      } else {
        setIndex(0)
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [index, callback])
}
```

---

## Principles

1. **Purposeful play** — every interaction enhances understanding or provides feedback.
2. **Progressive discovery** — basic interactions work immediately; fun reveals over time.
3. **Respect user intent** — never block progress; provide skip/dismiss; respect `prefers-reduced-motion`.
4. **Performance first** — delight should not cause jank or lag.
