# Component, palettes, and export

The React canvas wrapper, curated palettes, and PNG/SVG export helpers referenced from SKILL.md §React Component Pattern, §Color Palettes, and §Export & Sharing.

## Contents

- React Component Pattern
- Color Palettes
- Export & Sharing

## React Component Pattern

```tsx
'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface GenerativeArtProps {
 seed?: number
 width?: number
 height?: number
 palette?: string[]
 className?: string
}

export function GenerativeArt({
 seed = Date.now(),
 width = 800,
 height = 600,
 palette = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
 className,
}: GenerativeArtProps) {
 const canvasRef = useRef<HTMLCanvasElement>(null)
 const [currentSeed, setCurrentSeed] = useState(seed)

 const render = useCallback(() => {
 const canvas = canvasRef.current
 if (!canvas) return
 const ctx = canvas.getContext('2d')!
 const rng = mulberry32(currentSeed)

 // Clear
 ctx.fillStyle = '#1a1a2e'
 ctx.fillRect(0, 0, width, height)

 // Your generative algorithm here
 drawFlowField(ctx, createFlowField(40, 30, currentSeed), {
 seed: currentSeed,
 density: 0.8,
 palette,
 scale: 2,
 speed: 1,
 complexity: 0.7,
 })
 }, [currentSeed, width, height, palette])

 useEffect(() => { render() }, [render])

 return (
 <div className={className}>
 <canvas
 ref={canvasRef}
 width={width}
 height={height}
 className="rounded-lg"
 style={{ maxWidth: '100%', height: 'auto' }}
 />
 <div className="flex gap-2 mt-4">
 <button
 onClick={() => setCurrentSeed(Date.now())}
 className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
 >
 Regenerate
 </button>
 <input
 type="number"
 value={currentSeed}
 onChange={(e) => setCurrentSeed(Number(e.target.value))}
 className="px-3 py-2 border rounded-lg w-32"
 aria-label="Seed value"
 />
 </div>
 </div>
 )
}
```

## Color Palettes

```typescript
// Curated palettes for generative art
const PALETTES = {
 // Warm
 sunset: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'],
 autumn: ['#d35400', '#e67e22', '#f39c12', '#2c3e50', '#ecf0f1'],

 // Cool
 ocean: ['#0c2461', '#1e3799', '#4a69bd', '#6a89cc', '#82ccdd'],
 forest: ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d'],

 // Monochrome
 ink: ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666'],
 paper: ['#f5f0e8', '#ede4d4', '#e5d9c0', '#ddc9a3', '#d4ba87'],

 // Vibrant
 neon: ['#ff00ff', '#00ffff', '#ff0066', '#66ff00', '#ffff00'],
 candy: ['#ff6f91', '#ff9671', '#ffc75f', '#f9f871', '#d4fc79'],

 // Japanese-inspired
 wabi: ['#2c1810', '#5c3a2e', '#b5651d', '#daa06d', '#f5deb3'],
 sakura: ['#ffb7c5', '#ff69b4', '#c71585', '#8b008b', '#4a0028'],
}
```

## Export & Sharing

```typescript
// Export canvas as PNG
function exportPNG(canvas: HTMLCanvasElement, filename: string) {
 const link = document.createElement('a')
 link.download = `${filename}-${Date.now()}.png`
 link.href = canvas.toDataURL('image/png')
 link.click()
}

// Export as SVG (for vector output)
function exportSVG(svgElement: SVGSVGElement, filename: string) {
 const serializer = new XMLSerializer()
 const svgString = serializer.serializeToString(svgElement)
 const blob = new Blob([svgString], { type: 'image/svg+xml' })
 const link = document.createElement('a')
 link.download = `${filename}-${Date.now()}.svg`
 link.href = URL.createObjectURL(blob)
 link.click()
}
```
