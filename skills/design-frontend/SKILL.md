---
name: design-frontend
description: >
  Create a new production-grade UI from scratch, not a polish pass. Use when
  "build this UI", "design this page", or "new dashboard layout". Polish →
  enhance-web-ui. Landing → enhance-web-landing. Redesign →
  enhance-web-redesign.
license: MIT
---

# Frontend Design Skill

**Degree of freedom: MIXED.** Visual composition `[HIGH freedom]`; design-system
discovery `[LOW freedom — run exactly]`.

> Discover design systems, respect existing patterns, create beautiful interfaces.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **design-frontend** (this) | New production-grade UI from scratch, not a polish pass |
| `enhance-web-redesign` | Upgrading an existing site or app to premium quality |
| `enhance-web-ui` | Polishing one existing page: hierarchy, spacing, type, visual personality |
| `enhance-web-landing` | Landing pages, portfolios, and marketing sites with a point of view |

## How to reason

1. **Discover** — tokens, `components/ui`, forbidden patterns
2. **Reuse** — extend existing components; do not fork a second Button
3. **Compose** — new surface on those tokens
4. **Check** — type mins, 44px targets, reduced-motion, none of the named defaults in the Anti-Generic list

## Worked example

> **Discover:** `components/ui/button.tsx` + `globals.css` tokens; `text-xs` min; `rounded-sm`.
> **Reuse:** settings rows use existing `Button` / `Input`; no new primitive.
> **Compose:** new `/settings` page — token spacing, `text-sm` body, 44px save.
> **Check:** Anti-Generic list clear (no Inter, purple-on-white, or pill buttons); `prefers-reduced-motion` on any spinner.

## Self-critique before reporting

- **Discovery stated** — token file, radius, and forbidden list were spoken before JSX
- **Reuse first** — no duplicate primitive next to `components/ui`
- **Mins held** — readable type ≥ `text-xs`; tap targets ≥44px
- **Right owner** — polish existing → `enhance-web-ui`; landing → `enhance-web-landing`; redesign existing → `enhance-web-redesign`

---

## Phase 1: Design System Discovery  [LOW freedom — run exactly]

**Before writing ANY frontend code:**

### 1.1 Find Design System Files
```
Glob: **/*design-system*.{md,ts,css}
Glob: **/tokens*.{ts,json}
Glob: **/components/ui/**
Glob: **/_*README*
```

### 1.2 Extract & Document Tokens
| Category | Find | Examples |
|----------|------|----------|
| Typography | Sizes, weights | `text-xs`, `font-medium` |
| Spacing | Padding, gaps | `p-4`, `gap-2` |
| Colors | Palette, semantic | `bg-emerald-50` |
| Borders | Radius, styles | `rounded-sm` |
| Animations | Durations | `duration-200` |

### 1.3 Find Forbidden Patterns
```bash
grep -r "NEVER\|FORBIDDEN\|❌" docs/ README*
```

### 1.4 Verification Statement (REQUIRED)
```
"Design System Discovery:
├─ Found: [design system path]
├─ Typography min: [e.g., text-xs]
├─ Radius standard: [e.g., rounded-sm]
├─ Forbidden: [list patterns]
└─ Reusing: [existing components]"
```

---

## Phase 2: Implementation Standards  [HIGH freedom]

### Typography Minimums
| Context | Minimum | Usage |
|---------|---------|-------|
| Body | `text-sm` (14px) | Primary content |
| Captions | `text-xs` (12px) | Labels, hints |
| Compact | `text-[10px]` | Dense dashboards only |

**Never use** `text-[8px]` or `text-[9px]` for readable content.

### Accessibility Requirements
| Check | Requirement |
|-------|-------------|
| Touch targets | ≥44×44px |
| Contrast | 4.5:1 text, 3:1 UI |
| Keyboard | `tabIndex`, focus styles |
| Motion | `prefers-reduced-motion` |

### Quick Reference
```
Typography: text-xs=12px, text-sm=14px, text-base=16px
Spacing: 1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px
```

---

## Phase 3: Quality Checklist  [LOW freedom — do not skip]

```
[ ] Uses design system tokens (no hardcoded values)
[ ] Extends existing components (no duplicates)
[ ] Typography ≥ text-xs for readable content
[ ] Touch targets ≥ 44px
[ ] Focus states visible
[ ] prefers-reduced-motion respected
```

### Common Fixes
| Issue | Fix |
|-------|-----|
| Tiny text | `text-[9px]` → `text-xs` |
| Bold weights | `font-bold` → `font-medium` |
| Large radius | `rounded-lg` → `rounded-sm` |
| Spin animation | `animate-spin` → `animate-pulse` |

---

## Anti-Generic Checklist

Undirected drafts land on the same few defaults; the check is concrete only when they are named:
- [ ] Inter / Roboto / Arial as the display or body face
- [ ] Purple (violet/indigo) gradient on white
- [ ] Cream / off-white page background
- [ ] Italic accent words inside headlines
- [ ] "01 / 02 / 03" numbered section labels
- [ ] Monospace eyebrow labels on a non-code product
- [ ] Pill-shaped (fully rounded) buttons as the house button
- [ ] Three equal cards in a row as the default section layout

Extend this list with whatever the first draft used instead.

---

> **Remember:** The codebase's design system is the source of truth. Search before creating. Reuse before reinventing.
