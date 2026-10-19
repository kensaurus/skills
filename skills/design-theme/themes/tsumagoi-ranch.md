# Tsumagoi Ranch Theme

## Contents

- [Design Philosophy](#design-philosophy)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Neo-Brutal Shadow System](#neo-brutal-shadow-system)
- [Border Configuration](#border-configuration)
- [Motion Tokens](#motion-tokens)
- [Cute-alism Accent Colors](#cute-alism-accent-colors)
- [Retro Pixel Palette (8-bit)](#retro-pixel-palette-8-bit)
- [Mobile Responsive Guidelines](#mobile-responsive-guidelines)
- [Glassmorphism Presets](#glassmorphism-presets)
- [Application Guide](#application-guide)

Neo-Brutalist "Cute-alism" theme inspired by Japanese ranch and campground aesthetics.

## Design Philosophy
- Bold 3px borders with hard-edge offset shadows (no blur)
- High contrast dark borders on light backgrounds
- Playful yet professional - "Neo-Brutalism meets cute"
- Nature-inspired color palette with mountain, forest, and campfire tones

## Color Palette

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#0c85f4` | Mountain blue - primary actions, links |
| **Secondary** | `#10b981` | Pine green - success, online status |
| **Accent** | `#ff6b35` | Campfire orange - energetic CTAs |
| **Accent Alt** | `#FF6D38` | Navigate orange - primary CTA buttons |
| **Premium** | `#8584FF` | Navigate purple - creative accents |
| **Warning** | `#f59e0b` | Warm amber - alerts, temperature |
| **Danger** | `#ef4444` | Error red |
| **Background Page** | `#faf7f2` | Warm cream |
| **Background Card** | `#ffffff` | Pure white |
| **Border Default** | `#d4c4a8` | Sand/wood tone |
| **Border Strong** | `#b8a080` | Darker sand |
| **Text Primary** | `#1a1a1a` | Near black |
| **Text Secondary** | `#4a4a4a` | Dark gray |
| **Text Muted** | `#6b6b6b` | Medium gray |
| **Shadow Color** | `#b8a080` | Wood tone shadow |

### Dark Mode (Night Sky)

| Token | Hex | Usage |
|-------|-----|-------|
| **Background Page** | `#0c1424` | Night sky deep |
| **Background Card** | `#162b47` | Night blue |
| **Border Default** | `#3d699a` | Night blue border |
| **Text Primary** | `#ffffff` | Pure white |
| **Text Secondary** | `#f1f5f9` | Bright off-white |
| **Text Muted** | `#cbd5e1` | Light gray |
| **Shadow Color** | `#1e4a72` | Night shadow |

## Typography

| Element | Font | Fallback | Weight |
|---------|------|----------|--------|
| **Headings** | M PLUS Rounded 1c | system-ui, sans-serif | 700-900 |
| **Body EN** | Inter | system-ui, sans-serif | 400-600 |
| **Body JP** | Noto Sans JP | sans-serif | 400-600 |
| **Data/Numbers** | JetBrains Mono | monospace | 700-900 |
| **Pixel/Retro** | VT323 | monospace | 400 |

## Neo-Brutal Shadow System

```css
--shadow-sm: 2px 2px 0 0 var(--shadow-color);   /* Badges, Tooltips */
--shadow-md: 3px 3px 0 0 var(--shadow-color);   /* Buttons, Popovers */
--shadow-lg: 4px 4px 0 0 var(--shadow-color);   /* Cards */
--shadow-xl: 5px 5px 0 0 var(--shadow-color);   /* Hover emphasis */
```

## Border Configuration

| Element | Width | Radius |
|---------|-------|--------|
| Badges (static) | 1px | rounded-full |
| Chips (interactive) | 2px | rounded-full |
| Buttons | 3px | rounded-lg (8px) |
| Cards | 3px | rounded-xl (16px) |
| Inputs | 2px | rounded-lg (8px) |

## Motion Tokens

```css
--motion-duration-fast: 100ms;
--motion-duration-normal: 150ms;
--motion-duration-slow: 300ms;
--motion-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--motion-ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

## Cute-alism Accent Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Campfire | `#ff6b35` | Warm, energetic, action |
| Twilight | `#a855f7` | Magical, dreamy, premium |
| Sakura | `#ec4899` | Soft, friendly, approachable |
| Moss | `#84cc16` | Earthy, grounded, organic |

## Retro Pixel Palette (8-bit)

| Color | Hex | Usage |
|-------|-----|-------|
| Cyan | `#00FFFF` | CRT cyan |
| Magenta | `#FF00FF` | Neon magenta |
| Lime | `#00FF66` | Pixel green |
| Yellow | `#FFFF00` | Bright yellow |
| Red | `#FF3366` | VHS red |
| Blue | `#3366FF` | Deep blue |

## Mobile Responsive Guidelines

### Touch Targets
- Minimum 44px (WCAG requirement)
- Comfortable: 48px
- Large CTAs: 56px

### Spacing Scale (Mobile-First)
```css
--mobile-space-1: 4px;
--mobile-space-2: 8px;
--mobile-space-3: 12px;
--mobile-space-4: 16px;
```

### Breakpoints
| Name | Width | Variant |
|------|-------|---------|
| xs | < 640px | mobile |
| sm | 640px | tablet |
| md | 768px | tablet |
| lg | 1024px | desktop |
| xl | 1280px | desktop |

### Mobile Patterns
- Use `HorizontalScroll` for overflow content
- Bottom sheet modals instead of center modals
- Thumb-zone optimization (primary actions in bottom 40%)
- Safe area padding for notched devices

## Glassmorphism Presets

```css
.glass-light { background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(2px); }
.glass-medium { background: rgba(255, 255, 255, 0.55); backdrop-filter: blur(4px); }
.glass-heavy { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(8px); }
```

## Application Guide

When applying this theme:
1. Use CSS variables from design-tokens.css
2. Apply neo-brutal shadows with border-color-matched shadow-color
3. Use bounce easing for interactive elements
4. Apply stagger animations for card grids
5. Ensure all interactive elements have 44px minimum touch targets
6. Use glassmorphism for overlays on 3D backgrounds
