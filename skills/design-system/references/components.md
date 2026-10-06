# Component templates

Full component files for the patterns in SKILL.md §Component Variants with CVA, §Compound Components Pattern, §Accessible Components with Radix, §Component Documentation Pattern, and §File Structure.

## Contents

- cn() helper
- Button with CVA
- Compound Card
- Accessible Dialog with Radix
- Component Documentation Pattern
- File Structure

## cn() helper

```tsx
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs))
}
```

## Button with CVA

```tsx
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
 // Base styles
 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
 {
 variants: {
 variant: {
 default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
 destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
 outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
 secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
 ghost: 'hover:bg-accent hover:text-accent-foreground',
 link: 'text-primary underline-offset-4 hover:underline',
 },
 size: {
 default: 'h-9 px-4 py-2',
 sm: 'h-8 rounded-md px-3 text-xs',
 lg: 'h-10 rounded-md px-8',
 icon: 'h-9 w-9',
 },
 },
 defaultVariants: {
 variant: 'default',
 size: 'default',
 },
 }
)

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
 VariantProps<typeof buttonVariants> {
 asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'button'
 return (
 <Comp
 className={cn(buttonVariants({ variant, size, className }))}
 ref={ref}
 {...props}
 />
 )
 }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

## Compound Card

```tsx
// components/ui/card.tsx
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn(
 'rounded-xl border bg-card text-card-foreground shadow',
 className
 )}
 {...props}
 />
 )
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn('flex flex-col space-y-1.5 p-6', className)}
 {...props}
 />
 )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
 ({ className, ...props }, ref) => (
 <h3
 ref={ref}
 className={cn('font-semibold leading-none tracking-tight', className)}
 {...props}
 />
 )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
 ({ className, ...props }, ref) => (
 <p
 ref={ref}
 className={cn('text-sm text-muted-foreground', className)}
 {...props}
 />
 )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, ...props }, ref) => (
 <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
 )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn('flex items-center p-6 pt-0', className)}
 {...props}
 />
 )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
```

## Accessible Dialog with Radix

```tsx
// components/ui/dialog.tsx
'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = forwardRef<
 React.ElementRef<typeof DialogPrimitive.Overlay>,
 React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
 <DialogPrimitive.Overlay
 ref={ref}
 className={cn(
 'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
 className
 )}
 {...props}
 />
))

const DialogContent = forwardRef<
 React.ElementRef<typeof DialogPrimitive.Content>,
 React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
 <DialogPortal>
 <DialogOverlay />
 <DialogPrimitive.Content
 ref={ref}
 className={cn(
 'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
 className
 )}
 {...props}
 >
 {children}
 <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
 <X className="h-4 w-4" />
 <span className="sr-only">Close</span>
 </DialogPrimitive.Close>
 </DialogPrimitive.Content>
 </DialogPortal>
))

export { Dialog, DialogTrigger, DialogContent, DialogClose }
```

## Component Documentation Pattern

```tsx
// components/ui/button.stories.tsx (or docs)
/**
 * Button Component
 *
 * A versatile button component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button variant="default" size="md">Click me</Button>
 * <Button variant="outline" size="sm">Small</Button>
 * <Button variant="destructive" disabled>Disabled</Button>
 * ```
 *
 * ## Variants
 * - `default` - Primary action button
 * - `secondary` - Secondary actions
 * - `destructive` - Dangerous actions (delete, remove)
 * - `outline` - Less prominent actions
 * - `ghost` - Minimal visual weight
 * - `link` - Styled as a link
 *
 * ## Sizes
 * - `sm` - 32px height
 * - `default` - 36px height
 * - `lg` - 40px height
 * - `icon` - 36x36px square for icon-only buttons
 *
 * ## Accessibility
 * - Uses native `<button>` element
 * - Supports `disabled` attribute
 * - Focus ring visible on keyboard navigation
 * - Works with `asChild` prop for custom elements
 */
```

## File Structure

```
src/
├── components/
│ └── ui/
│ ├── button.tsx
│ ├── card.tsx
│ ├── dialog.tsx
│ ├── input.tsx
│ ├── label.tsx
│ ├── select.tsx
│ ├── textarea.tsx
│ ├── toast.tsx
│ └── index.ts # Barrel export
├── lib/
│ └── utils.ts # cn() helper
├── styles/
│ └── globals.css # CSS tokens
└── tailwind.config.ts # Theme config
```
