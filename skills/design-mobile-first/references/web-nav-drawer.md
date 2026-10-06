# Mobile navigation drawer (web / PWA)

Slide-in drawer for a web or PWA surface, Motion (framer-motion) + Tailwind. Native shells use the system tab bar instead; see `enhance-mobile-native-feel`.

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function MobileNav() {
 const [isOpen, setIsOpen] = useState(false)

 return (
 <>
 <button
 className="lg:hidden p-2"
 onClick={() => setIsOpen(true)}
 aria-label="Open menu"
 >
 <MenuIcon className="h-6 w-6" />
 </button>

 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black/50 z-40 lg:hidden"
 onClick={() => setIsOpen(false)}
 />

 {/* Drawer */}
 <motion.div
 initial={{ x: '-100%' }}
 animate={{ x: 0 }}
 exit={{ x: '-100%' }}
 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
 className="fixed inset-y-0 left-0 w-[280px] bg-background z-50 lg:hidden"
 >
 <div className="p-4">
 <button
 className="absolute top-4 right-4 p-2"
 onClick={() => setIsOpen(false)}
 >
 <XIcon className="h-6 w-6" />
 </button>
 <nav className="mt-8 space-y-2">
 {navItems.map((item) => (
 <a
 key={item.href}
 href={item.href}
 className="block py-3 px-4 rounded-lg hover:bg-muted"
 >
 {item.label}
 </a>
 ))}
 </nav>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </>
 )
}
```
