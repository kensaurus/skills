---
name: design-generative-art
description: >
  Create algorithmic visuals with p5.js, Canvas, or SVG using seeded
  randomness and interactive controls. Use when "generative art", "procedural
  visuals", "flow fields", "particle system", or "art from code". Charts →
  data-visualization.
license: Apache-2.0
---

# Algorithmic Art Skill

**Degree of freedom: MIXED.** Algorithm and palette `[HIGH freedom]`; existing
pipeline inventory and seed reproducibility `[LOW freedom — run exactly]`.

Create generative, procedural, and mathematical art using code. Transform algorithms into visual experiences.

## How to reason

1. **Inventory** — existing p5 / canvas / noise utilities
2. **Seed** — deterministic RNG; same seed = same pixels
3. **Parameterize** — density, palette, scale, complexity
4. **Validate** — resolution-independent; reduced-motion on loops

## Worked example

> **Inventory:** no p5; one `getContext('2d')` chart canvas — do not hijack it.
> **Seed:** `mulberry32(42)` drives a new `src/components/art/` flow field.
> **Parameterize:** `density`, `palette` (ocean), `scale`; slider re-renders from the same seed.
> **Validate:** seed 42 twice matches; `prefers-reduced-motion` stops the RAF loop.

## Self-critique before reporting

- **No pipeline clash** — did not overwrite an existing canvas/WebGL path
- **Reproducible** — same seed paints identical output
- **Controls matter** — each param changes the picture, not just a label
- **Right owner** — data charts → `data-visualization`; UI illustration → `design-frontend`; WebGL/3D → `enhance-web-web3d`

## Check existing first  [LOW freedom — run exactly]

**Before creating ANY generative art, verify:**

1. **Check for existing creative coding setup:**
```bash
cat package.json | grep -i "p5\|three\|canvas\|pixi\|paper"
ls -la src/components/art/ src/components/generative/ 2>/dev/null
```

2. **Check for existing canvas/WebGL usage:**
```bash
rg "Canvas|useFrame|getContext.*2d|WebGL" --type tsx -l
```

3. **Check for existing noise/random utilities:**
```bash
rg "simplex\|perlin\|noise\|seedrandom" --type ts
```

**Why:** Don't conflict with existing rendering pipelines or duplicate utility code.

## Core Principles  [HIGH freedom]

### 1. Seeded Randomness
Every piece should be reproducible with a seed:
```typescript
function mulberry32(seed: number) {
 return function() {
 let t = seed += 0x6D2B79F5
 t = Math.imul(t ^ t >>> 15, t | 1)
 t ^= t + Math.imul(t ^ t >>> 7, t | 61)
 return ((t ^ t >>> 14) >>> 0) / 4294967296
 }
}

// Usage
const rng = mulberry32(42) // Same seed = same output
const value = rng() // 0-1 deterministic random
```

### 2. Parameterized Generation
Make art controllable via parameters:
```typescript
interface ArtParams {
 seed: number
 density: number // 0-1
 palette: string[]
 scale: number
 speed: number
 complexity: number // 0-1
}
```

### 3. Resolution Independence
Design for any canvas size:
```typescript
// Normalize coordinates to 0-1 range
const nx = x / width
const ny = y / height
// Then scale to canvas
const px = nx * canvas.width
const py = ny * canvas.height
```

## Techniques  [HIGH freedom]

- **Flow fields** — a grid of angles; particles follow it with low alpha for trails
- **Recursive subdivision** — split a rect 30–70% until depth or a random stop, fill leaves
- **Circle packing** — grow candidates until collision or bounds, keep those with r > 2
- **L-systems** — rewrite an axiom by rules, then draw with a turtle stack

```typescript
function generateLSystem(system: LSystem): string {
 let current = system.axiom
 for (let i = 0; i < system.iterations; i++) {
 current = current.split('').map(c => system.rules[c] || c).join('')
 }
 return current
}
```

Full implementations of all four: [references/algorithms.md](references/algorithms.md).

## React Component Pattern  [HIGH freedom]

- `'use client'` canvas wrapper; `seed`, `width`, `height`, `palette`, `className` props
- Render in `useCallback` keyed on seed/size/palette; `useEffect` calls it
- Controls: a Regenerate button (`Date.now()` seed) and a labelled numeric seed input
- Canvas styled `maxWidth: '100%', height: 'auto'` for responsive display

Full component: [references/component-palettes-export.md](references/component-palettes-export.md) §React Component Pattern.

## Color Palettes  [HIGH freedom]

Curated 5-color sets in warm / cool / monochrome / vibrant / Japanese-inspired groups (`sunset`, `ocean`, `ink`, `neon`, `wabi`, …).
Table: [references/component-palettes-export.md](references/component-palettes-export.md) §Color Palettes.

## Animation Loop  [HIGH freedom]

- `requestAnimationFrame` loop; `t = frame * params.speed * 0.01`
- Semi-transparent black overlay (`rgba(0,0,0,0.02)`) for trails
- Return a cleanup that calls `cancelAnimationFrame`

Full loop: [references/algorithms.md](references/algorithms.md) §Animation Loop.

## Export & Sharing  [HIGH freedom]

- PNG: `canvas.toDataURL('image/png')` into a download link named `${filename}-${Date.now()}.png`
- SVG: `XMLSerializer` → `Blob` (`image/svg+xml`) → `URL.createObjectURL`

Helpers: [references/component-palettes-export.md](references/component-palettes-export.md) §Export & Sharing.

## Related Skills

- `enhance-web-web3d` — WebGL, Three.js, shaders for 3D generative art
- `design-motion` — Animation patterns for interactive pieces
- `design-canvas` — Print-quality visual design philosophy
- `data-visualization` — Data-driven generative compositions

## Validation  [LOW freedom — do not skip]

After creating algorithmic art:

1. **Reproducibility** → Same seed produces identical output
2. **Performance** → 60fps for animated pieces
3. **Resolution** → Looks good at target export size
4. **Palette** → Colors work together harmoniously
5. **Parameters** → Controls produce meaningful visual changes
6. **Export** → PNG/SVG export works correctly
7. **Accessibility** → Animated art respects `prefers-reduced-motion`
