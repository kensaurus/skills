# PWA viewport and install prompt

Next.js viewport metadata and the `beforeinstallprompt` component referenced from SKILL.md §PWA Features.

## Viewport & Meta Tags
```tsx
// app/layout.tsx
export const metadata = {
 viewport: {
 width: 'device-width',
 initialScale: 1,
 // No maximumScale / userScalable: false — the 16px inputs above already stop iOS focus-zoom,
 // and disabling pinch-zoom fails WCAG 1.4.4
 viewportFit: 'cover', // For notched devices
 },
 appleWebApp: {
 capable: true,
 statusBarStyle: 'default',
 title: 'My App',
 },
}
```

## Install Prompt
```tsx
'use client'
import { useEffect, useState } from 'react'

export function InstallPrompt() {
 const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

 useEffect(() => {
 const handler = (e: Event) => {
 e.preventDefault()
 setDeferredPrompt(e)
 }

 window.addEventListener('beforeinstallprompt', handler)
 return () => window.removeEventListener('beforeinstallprompt', handler)
 }, [])

 if (!deferredPrompt) return null

 const handleInstall = async () => {
 deferredPrompt.prompt()
 const { outcome } = await deferredPrompt.userChoice
 if (outcome === 'accepted') {
 setDeferredPrompt(null)
 }
 }

 return (
 <div className="fixed bottom-20 left-4 right-4 p-4 bg-card border rounded-lg shadow-lg">
 <p className="font-medium">Install our app</p>
 <p className="text-sm text-muted-foreground">Get quick access from your home screen</p>
 <div className="mt-3 flex gap-2">
 <Button onClick={handleInstall}>Install</Button>
 <Button variant="ghost" onClick={() => setDeferredPrompt(null)}>
 Not now
 </Button>
 </div>
 </div>
 )
}
```
