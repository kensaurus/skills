# Motion (framer-motion) patterns and micro-interaction catalogue

Full React patterns for SKILL.md §Framer Motion Patterns and the options list from §Micro-interaction reference.

## Contents

- Basic Animations
- Staggered Lists
- Scroll-Triggered Animations
- Page Transitions (Next.js)
- Micro-interaction catalogue

## Basic Animations
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

## Staggered Lists
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

## Scroll-Triggered Animations
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

## Page Transitions (Next.js)
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

## Micro-interaction catalogue

Options, not a checklist. Pick the single item the purpose needs.

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
