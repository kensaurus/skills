---
name: design-system
description: >
  Build a new design system (tokens, variants, theming). Use when
  "create a design system" or "component library from scratch". Drifted
  existing system → housekeep-design. Plan-only unification →
  plan-uiux-unification.
license: MIT
---

# Design System Skill

**Degree of freedom: MIXED.** Token taxonomy and variants `[HIGH freedom]`;
existing `ui/` / token inventory `[LOW freedom — run exactly]`.

Build scalable, maintainable design systems with consistent tokens, variants, and documentation.

## How to reason

1. **Inventory** — `components/ui`, tokens, `cva`, shadcn/Radix
2. **Tokenize** — semantic tokens, not raw hex in components
3. **Variant** — `cva` covers real states (default/destructive/disabled)
4. **Document** — JSDoc, keyboard/focus, dark mode

## Worked example

> **Inventory:** shadcn `Button` exists; colors are raw `#3B82F6` in three pages; no `--primary`.
> **Tokenize:** `--primary` / `--primary-foreground` in `globals.css`; Tailwind maps `hsl(var(--primary))`.
> **Variant:** extend existing `buttonVariants` — do not add `components/Button2.tsx`.
> **Document:** JSDoc lists variants/sizes; focus ring + dark `.dark` overrides.

## Self-critique before reporting

- **Did not fork** — existing primitives were extended, not recreated
- **Semantic tokens** — components reference tokens, not primitives or hex
- **A11y + dark** — focus, disabled, and dark variants exist
- **Right owner** — drifted existing system → `housekeep-design`; plan-only unification → `plan-uiux-unification`

## Check existing first  [LOW freedom — run exactly]

**Before creating ANY design system components, verify:**

1. **Check for existing design system:**
```bash
ls -la src/components/ui/
cat package.json | grep -i "shadcn\|radix\|headless"
cat components.json 2>/dev/null # shadcn config
```

2. **Check for existing tokens:**
```bash
cat tailwind.config.* | head -100
cat src/styles/globals.css | head -50
rg "var\(--" --type css | head -20
```

3. **Check for existing patterns:**
```bash
rg "cva\(|variants:" --type ts --type tsx | head -10
rg "cn\(|clsx\(|twMerge" --type tsx | head -5
```

**Why:** Don't recreate existing primitives. Extend and enhance what exists.

## Design Tokens  [HIGH freedom]

Face and ground are choices, not defaults: Inter/Roboto/Arial, a cream/off-white page, and a purple-gradient primary are the fallbacks to name and avoid. Add `--font-sans` / `--font-display` tokens for the faces you pick.

### CSS Custom Properties
- Semantic HSL triplets on `:root` (`--background`, `--foreground`, `--primary`, `--muted`, `--destructive`, `--border`, `--ring`, …); `.dark` overrides the same names
- Spacing (`--spacing-xs…xl`), radius (`--radius` ± 4px), shadows (`--shadow-sm…lg`), durations and easings as tokens too
```css
:root {
 --background: 0 0% 100%;
 --foreground: 222.2 84% 4.9%;
 --primary: 221.2 83.2% 53.3%;
 --primary-foreground: 210 40% 98%;
 --radius: 0.5rem;
}
.dark {
 --background: 222.2 84% 4.9%;
 --foreground: 210 40% 98%;
}
```
Full token set: [references/tokens.md](references/tokens.md) §CSS Custom Properties.

### Tailwind Config Integration
- `darkMode: 'class'`; every color is `hsl(var(--token))` with a `DEFAULT` / `foreground` pair
- `borderRadius`, `boxShadow`, `transitionDuration` read the CSS variables, never literals

Full config: [references/tokens.md](references/tokens.md) §Tailwind Config Integration.

## Component Variants with CVA  [HIGH freedom]

- `cva()` base string carries focus-visible ring and `disabled:` styles; `variants.variant` (default/destructive/outline/secondary/ghost/link) and `variants.size` (default/sm/lg/icon) with `defaultVariants`
- Props extend the native element attributes plus `VariantProps<typeof buttonVariants>`; `forwardRef` and `asChild` via `Slot`
- Export both the component and its `*Variants` so consumers can reuse the classes

```tsx
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs))
}
```

Full `button.tsx`: [references/components.md](references/components.md) §Button with CVA.

## Compound Components Pattern  [HIGH freedom]

- One file exports `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- Each is a `forwardRef` wrapper over the native element with `cn(defaults, className)` and a `displayName`
- Tokens only: `bg-card text-card-foreground`, `text-muted-foreground`

Full `card.tsx`: [references/components.md](references/components.md) §Compound Card.

## Accessible Components with Radix  [HIGH freedom]

- Re-export `Root`, `Trigger`, `Portal`, `Close` from `@radix-ui/react-dialog`; style `Overlay` and `Content` with `forwardRef`
- `data-[state=open]` / `data-[state=closed]` drive enter/exit animation classes
- A visible close button inside `Content` with an `sr-only` label

Full `dialog.tsx`: [references/components.md](references/components.md) §Accessible Dialog with Radix.

## Component Documentation Pattern  [HIGH freedom]

JSDoc block per component: one-line purpose, `@example` usage, then `## Variants`, `## Sizes` (with pixel heights), and `## Accessibility` (native element, `disabled`, focus ring, `asChild`).
Template: [references/components.md](references/components.md) §Component Documentation Pattern.

## File Structure

`src/components/ui/*.tsx` with an `index.ts` barrel, `src/lib/utils.ts` for `cn()`, `src/styles/globals.css` for tokens, `tailwind.config.ts` for the theme.
Tree: [references/components.md](references/components.md) §File Structure.

## Validation  [LOW freedom — do not skip]

After creating design system components:

1. **Consistency** → All components use same tokens
2. **Variants** → Cover all needed use cases
3. **Accessibility** → Keyboard nav, ARIA, focus states
4. **Dark mode** → All components work in dark mode
5. **Responsive** → Mobile-friendly by default
6. **Documentation** → JSDoc comments, usage examples
7. **Type safety** → Full TypeScript support with VariantProps
