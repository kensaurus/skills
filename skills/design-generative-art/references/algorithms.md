# Generative art algorithms

Full implementations of the techniques listed in SKILL.md §Techniques and §Animation Loop. Every function takes the seeded `rng` from `mulberry32` so the same seed paints the same pixels.

## Contents

- Flow Fields
- Recursive Subdivision
- Circle Packing
- L-Systems (Fractal Trees/Plants)
- Animation Loop

## Flow Fields
```typescript
function createFlowField(cols: number, rows: number, seed: number) {
 const rng = mulberry32(seed)
 const field: number[][] = []

 for (let y = 0; y < rows; y++) {
 field[y] = []
 for (let x = 0; x < cols; x++) {
 // Perlin-like noise using layered sine waves
 const angle = Math.sin(x * 0.1) * Math.cos(y * 0.1) * Math.PI * 2
 + rng() * 0.5
 field[y][x] = angle
 }
 }
 return field
}

function drawFlowField(ctx: CanvasRenderingContext2D, field: number[][], params: ArtParams) {
 const cellW = ctx.canvas.width / field[0].length
 const cellH = ctx.canvas.height / field.length

 // Spawn particles and follow flow
 for (let i = 0; i < params.density * 1000; i++) {
 let x = rng() * ctx.canvas.width
 let y = rng() * ctx.canvas.height

 ctx.beginPath()
 ctx.moveTo(x, y)
 ctx.strokeStyle = params.palette[Math.floor(rng() * params.palette.length)]
 ctx.globalAlpha = 0.3

 for (let step = 0; step < 100; step++) {
 const col = Math.floor(x / cellW)
 const row = Math.floor(y / cellH)

 if (col < 0 || col >= field[0].length || row < 0 || row >= field.length) break

 const angle = field[row][col]
 x += Math.cos(angle) * params.scale
 y += Math.sin(angle) * params.scale
 ctx.lineTo(x, y)
 }

 ctx.stroke()
 }
}
```

## Recursive Subdivision
```typescript
function subdivide(
 ctx: CanvasRenderingContext2D,
 x: number, y: number, w: number, h: number,
 depth: number, maxDepth: number, rng: () => number,
 palette: string[]
) {
 if (depth >= maxDepth || rng() < 0.15) {
 // Draw leaf
 ctx.fillStyle = palette[Math.floor(rng() * palette.length)]
 ctx.globalAlpha = 0.6 + rng() * 0.4
 ctx.fillRect(x + 1, y + 1, w - 2, h - 2)
 return
 }

 // Random split direction and position
 const horizontal = rng() > 0.5
 const split = 0.3 + rng() * 0.4 // 30-70% split

 if (horizontal) {
 const splitY = y + h * split
 subdivide(ctx, x, y, w, splitY - y, depth + 1, maxDepth, rng, palette)
 subdivide(ctx, x, splitY, w, y + h - splitY, depth + 1, maxDepth, rng, palette)
 } else {
 const splitX = x + w * split
 subdivide(ctx, x, y, splitX - x, h, depth + 1, maxDepth, rng, palette)
 subdivide(ctx, splitX, y, x + w - splitX, h, depth + 1, maxDepth, rng, palette)
 }
}
```

## Circle Packing
```typescript
interface Circle {
 x: number; y: number; r: number; color: string
}

function circlePacking(
 width: number, height: number,
 maxCircles: number, maxRadius: number,
 rng: () => number, palette: string[]
): Circle[] {
 const circles: Circle[] = []
 let attempts = 0
 const maxAttempts = maxCircles * 50

 while (circles.length < maxCircles && attempts < maxAttempts) {
 attempts++
 const candidate = {
 x: rng() * width,
 y: rng() * height,
 r: 2,
 color: palette[Math.floor(rng() * palette.length)]
 }

 // Grow until collision
 let valid = true
 while (valid && candidate.r < maxRadius) {
 candidate.r += 1
 for (const other of circles) {
 const dist = Math.hypot(candidate.x - other.x, candidate.y - other.y)
 if (dist < candidate.r + other.r + 2) {
 candidate.r -= 1
 valid = false
 break
 }
 }
 // Check bounds
 if (candidate.x - candidate.r < 0 || candidate.x + candidate.r > width ||
 candidate.y - candidate.r < 0 || candidate.y + candidate.r > height) {
 candidate.r -= 1
 valid = false
 }
 }

 if (candidate.r > 2) circles.push(candidate)
 }
 return circles
}
```

## L-Systems (Fractal Trees/Plants)
```typescript
interface LSystem {
 axiom: string
 rules: Record<string, string>
 angle: number
 length: number
 iterations: number
}

const fractalTree: LSystem = {
 axiom: 'F',
 rules: { 'F': 'FF+[+F-F-F]-[-F+F+F]' },
 angle: 25,
 length: 4,
 iterations: 4,
}

function generateLSystem(system: LSystem): string {
 let current = system.axiom
 for (let i = 0; i < system.iterations; i++) {
 current = current.split('').map(c => system.rules[c] || c).join('')
 }
 return current
}

function drawLSystem(ctx: CanvasRenderingContext2D, system: LSystem, startX: number, startY: number) {
 const instructions = generateLSystem(system)
 const stack: { x: number; y: number; angle: number }[] = []
 let x = startX, y = startY, angle = -90 // Start pointing up

 ctx.beginPath()
 ctx.moveTo(x, y)

 for (const char of instructions) {
 switch (char) {
 case 'F':
 const nx = x + Math.cos(angle * Math.PI / 180) * system.length
 const ny = y + Math.sin(angle * Math.PI / 180) * system.length
 ctx.lineTo(nx, ny)
 x = nx; y = ny
 break
 case '+': angle += system.angle; break
 case '-': angle -= system.angle; break
 case '[': stack.push({ x, y, angle }); break
 case ']':
 const state = stack.pop()!
 x = state.x; y = state.y; angle = state.angle
 ctx.moveTo(x, y)
 break
 }
 }
 ctx.stroke()
}
```

## Animation Loop

```typescript
function animatedArt(canvas: HTMLCanvasElement, params: ArtParams) {
 const ctx = canvas.getContext('2d')!
 let frame = 0
 let animationId: number

 function loop() {
 frame++
 const t = frame * params.speed * 0.01

 // Semi-transparent overlay for trails
 ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
 ctx.fillRect(0, 0, canvas.width, canvas.height)

 // Animated elements
 for (let i = 0; i < 50; i++) {
 const x = canvas.width / 2 + Math.cos(t + i * 0.5) * 200
 const y = canvas.height / 2 + Math.sin(t * 0.7 + i * 0.3) * 200
 const r = 2 + Math.sin(t + i) * 1

 ctx.beginPath()
 ctx.arc(x, y, r, 0, Math.PI * 2)
 ctx.fillStyle = params.palette[i % params.palette.length]
 ctx.globalAlpha = 0.8
 ctx.fill()
 }

 animationId = requestAnimationFrame(loop)
 }

 loop()
 return () => cancelAnimationFrame(animationId)
}
```
