# Mobile component templates

Full components for SKILL.md §Responsive Patterns, §Touch Gestures, and §Mobile-Specific Components. Motion (framer-motion) + Tailwind; web / PWA surfaces (native shells use system sheets and tabs).

## Contents

- Responsive Tables
- Responsive Grid
- Swipe to Delete
- Pull to Refresh
- Bottom Sheet
- Mobile-Optimized Forms

## Responsive Tables
```tsx
// Card-based layout on mobile, table on desktop
export function ResponsiveTable({ data }: { data: Item[] }) {
 return (
 <>
 {/* Mobile: Card layout */}
 <div className="space-y-4 md:hidden">
 {data.map((item) => (
 <div key={item.id} className="rounded-lg border p-4">
 <div className="flex justify-between">
 <span className="font-medium">{item.name}</span>
 <span className="text-muted-foreground">{item.date}</span>
 </div>
 <div className="mt-2 text-sm text-muted-foreground">
 {item.description}
 </div>
 <div className="mt-3 flex justify-between items-center">
 <span className="font-semibold">{item.amount}</span>
 <Badge>{item.status}</Badge>
 </div>
 </div>
 ))}
 </div>

 {/* Desktop: Traditional table */}
 <table className="hidden md:table w-full">
 <thead>
 <tr className="border-b">
 <th className="text-left py-3">Name</th>
 <th className="text-left py-3">Date</th>
 <th className="text-left py-3">Amount</th>
 <th className="text-left py-3">Status</th>
 </tr>
 </thead>
 <tbody>
 {data.map((item) => (
 <tr key={item.id} className="border-b">
 <td className="py-3">{item.name}</td>
 <td className="py-3">{item.date}</td>
 <td className="py-3">{item.amount}</td>
 <td className="py-3"><Badge>{item.status}</Badge></td>
 </tr>
 ))}
 </tbody>
 </table>
 </>
 )
}
```

## Responsive Grid
```tsx
// Fluid grid that adapts to screen size
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
 {items.map((item) => (
 <Card key={item.id}>{item.content}</Card>
 ))}
</div>

// Auto-fit grid (items wrap naturally)
<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
 {items.map((item) => (
 <Card key={item.id}>{item.content}</Card>
 ))}
</div>
```

## Swipe to Delete
```tsx
'use client'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

export function SwipeableItem({ onDelete, children }: SwipeableItemProps) {
 const x = useMotionValue(0)
 const background = useTransform(
 x,
 [-100, 0],
 ['rgb(239 68 68)', 'rgb(255 255 255)']
 )

 const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
 if (info.offset.x < -100) {
 onDelete()
 }
 }

 return (
 <motion.div style={{ background }} className="relative overflow-hidden rounded-lg">
 <motion.div
 drag="x"
 dragConstraints={{ left: -100, right: 0 }}
 onDragEnd={handleDragEnd}
 style={{ x }}
 className="bg-background p-4"
 >
 {children}
 </motion.div>
 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white">
 <TrashIcon className="h-5 w-5" />
 </div>
 </motion.div>
 )
}
```

## Pull to Refresh
```tsx
'use client'
import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
 const [isRefreshing, setIsRefreshing] = useState(false)
 const y = useMotionValue(0)
 const opacity = useTransform(y, [0, 60], [0, 1])
 const scale = useTransform(y, [0, 60], [0.5, 1])

 const handleDragEnd = async () => {
 if (y.get() > 60) {
 setIsRefreshing(true)
 await onRefresh()
 setIsRefreshing(false)
 }
 }

 return (
 <div className="overflow-hidden">
 <motion.div
 style={{ opacity, scale }}
 className="flex justify-center py-4"
 >
 <RefreshIcon className={cn('h-6 w-6', isRefreshing && 'animate-spin')} />
 </motion.div>
 <motion.div
 drag="y"
 dragConstraints={{ top: 0, bottom: 0 }}
 dragElastic={0.5}
 onDragEnd={handleDragEnd}
 style={{ y }}
 >
 {children}
 </motion.div>
 </div>
 )
}
```

## Bottom Sheet
```tsx
'use client'
import { motion, useDragControls, PanInfo } from 'framer-motion'

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
 const controls = useDragControls()

 const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
 if (info.velocity.y > 500 || info.offset.y > 200) {
 onClose()
 }
 }

 if (!isOpen) return null

 return (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black/50 z-40"
 onClick={onClose}
 />
 <motion.div
 initial={{ y: '100%' }}
 animate={{ y: 0 }}
 exit={{ y: '100%' }}
 drag="y"
 dragControls={controls}
 dragConstraints={{ top: 0 }}
 dragElastic={0.2}
 onDragEnd={handleDragEnd}
 role="dialog"
 aria-modal="true"
 className="fixed bottom-0 left-0 right-0 bg-background rounded-t-xl z-50 max-h-[90dvh] overflow-hidden"
 >
 {/* Drag handle, plus a close button: dragging must not be the only way out (WCAG 2.5.7) */}
 <div className="relative flex justify-center py-3">
 <div
 className="w-12 h-1.5 bg-muted-foreground/30 rounded-full cursor-grab active:cursor-grabbing"
 onPointerDown={(e) => controls.start(e)}
 />
 <button
 type="button"
 onClick={onClose}
 aria-label="Close"
 className="absolute right-2 top-1 min-h-[44px] min-w-[44px]"
 >
 ✕
 </button>
 </div>
 <div className="px-4 pb-safe overflow-y-auto max-h-[calc(90dvh-56px)]">
 {children}
 </div>
 </motion.div>
 </>
 )
}
```

## Mobile-Optimized Forms
```tsx
// Stack form fields vertically on mobile
<form className="space-y-4">
 <div className="grid gap-4 sm:grid-cols-2">
 <div className="space-y-2">
 <Label htmlFor="firstName">First Name</Label>
 <Input
 id="firstName"
 // Larger touch targets
 className="h-12 text-base"
 // Prevent iOS zoom on focus
 style={{ fontSize: '16px' }}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="lastName">Last Name</Label>
 <Input
 id="lastName"
 className="h-12 text-base"
 style={{ fontSize: '16px' }}
 />
 </div>
 </div>

 {/* Full-width button on mobile */}
 <Button className="w-full sm:w-auto h-12">
 Submit
 </Button>
</form>
```
