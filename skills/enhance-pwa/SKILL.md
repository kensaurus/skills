---
name: enhance-pwa
description: >
  Add or upgrade PWA features: manifest, service worker, offline mode, install
  prompt, push, background sync. Use when "make it a PWA", "offline support",
  or "install prompt". Native → mobile-capacitor-platform.
license: MIT
---

# enhance-pwa — Make It Installable and Offline-Ready

**Degree of freedom: MIXED.** Strategy and prompt timing `[HIGH freedom]`; caching rules, Capacitor bypass, and the installability check `[LOW freedom — run exactly]`.

**A PWA closes the gap between "website" and "app".** Users can install it to
their home screen, it loads instantly from cache, and it keeps working when the
network drops. This skill adds those capabilities to any existing web app without
breaking what already works.

## How to reason

1. **Audit** — manifest, SW, framework plugin already present
2. **Choose** — caching strategy per asset type; Workbox over raw SW
3. **Ship** — installable manifest + offline fallback + autoUpdate
4. **Prove** — DevTools shows no installability errors; offline revisit works; Capacitor bridge not intercepted

## Worked example

> **Audit:** Next.js app; no manifest link; no SW; also ships Capacitor.
> **Choose:** Serwist (Workbox fork) via `@serwist/turbopack`; NetworkFirst APIs; CacheFirst images; skip `capacitor://`.
> **Ship:** `manifest.webmanifest` + 192/512 icons + `/offline.html`; install prompt after first success.
> **Prove:** offline revisit of `/` works; DevTools Manifest pane shows no installability errors; native bridge still functions.

## Self-critique before reporting

- **No stale deploys** — `autoUpdate`, not silent stale cache
- **No secrets in cache** — auth tokens and sensitive APIs are NetworkOnly
- **Offline path** — fallback page or cached shell, not a browser error
- **Right owner** — native Capacitor shell → `mobile-capacitor-platform`; confirm bridge via `mobile-emulator-test`

---

## Phase 0: Audit what already exists  [HIGH freedom]

```
public/manifest.json or public/manifest.webmanifest  → existing manifest
public/sw.js or src/sw.ts                             → existing service worker
vite.config.*   → vite-plugin-pwa already configured?
next.config.*   → next-pwa or @serwist/* already configured?
package.json    → workbox-*, serwist, @serwist/*, vite-plugin-pwa, next-pwa, @vite-pwa/nuxt
```

Also check the basics in the page (Lighthouse 12+ has no PWA category):
```javascript
// eval after goto
const pwaReady = {
  manifest: !!document.querySelector('link[rel="manifest"]'),
  sw: 'serviceWorker' in navigator,
  https: location.protocol === 'https:' || location.hostname === 'localhost',
};
```

---

## Phase 1: Research framework-specific PWA tooling  [HIGH freedom]

Follow `/research`: Context7 for the PWA plugin that matches the framework (`vite-plugin-pwa`, `@serwist/turbopack` or `@serwist/next`, `@vite-pwa/nuxt`), Firecrawl for current service-worker and offline guidance. Search the plugin name as written and anchor to the framework version actually installed — recognizing a package is not knowing its current API.

---

## Phase 2: Web App Manifest  [HIGH freedom]

The manifest is what makes the app installable. Create or improve
`public/manifest.webmanifest`:

```json
{
  "name": "Full App Name",
  "short_name": "Short Name",
  "description": "One sentence about what the app does",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable any" }
  ],
  "screenshots": [
    { "src": "/screenshots/home.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide" },
    { "src": "/screenshots/home-mobile.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" }
  ]
}
```

Reference the manifest in `<head>`:
```html
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#6366f1" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

**Icon requirements:**
- 192×192 and 512×512 minimum; add 180×180 for Apple Touch Icon
- PNG with transparent background OR maskable (safe zone = inner 80%)
- Generate from a single source SVG using `sharp` or `pwa-asset-generator`

---

## Phase 3: Service Worker — caching strategy  [HIGH freedom]

Use **Workbox** (via the framework plugin) rather than writing raw service
worker code. Choose the right caching strategy per asset type:

| Asset type | Strategy | Why |
|------------|----------|-----|
| App shell (HTML/JS/CSS) | CacheFirst + revision hash | Fast loads, updated on deploy |
| API data (list/detail) | NetworkFirst with 5s timeout | Fresh data, offline fallback |
| Images | CacheFirst, 30-day expiry | Rarely changes |
| Fonts | CacheFirst, 1-year expiry | Never changes |
| Analytics/telemetry | NetworkOnly | No value in caching |

### Vite (vite-plugin-pwa)

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\/api\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: { maxAgeSeconds: 60 * 60 * 24 },
          networkTimeoutSeconds: 5,
        },
      },
    ],
  },
  manifest: { /* inline or separate file */ },
})
```

### Next.js (Serwist, or an existing next-pwa)

Next.js has no built-in service worker. It ships the `app/manifest.ts` file
convention, and 16.3 added an experimental `experimental.useOffline` flag that
detects connectivity and retries requests but does not cache pages. For
Workbox-style caching the Next.js PWA guide points to Serwist, a Workbox fork:
`@serwist/turbopack` for Turbopack builds (the `next build` default since
Next.js 16) or `@serwist/next` for webpack builds. Take the setup for the
installed Next.js version from the Serwist docs.

`@ducanh2912/next-pwa` is webpack-only (last release 10.2.9, September 2024)
and its README recommends migrating to `@serwist/next`. Keep it only where a
repo already uses it, and on Next.js 16+ build with `next build --webpack`:

```javascript
// next.config.mjs
import withPWA from '@ducanh2912/next-pwa';
export default withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
})({ /* rest of next config */ });
```

### Capacitor compatibility

If the app also ships as a Capacitor native app, the service worker must not
intercept Capacitor's bridge requests. Add to the service worker:

```javascript
// Do not cache Capacitor bridge calls
if (event.request.url.includes('capacitor://') ||
    event.request.url.includes('ionic://')) {
  return; // let it pass through
}
```

---

## Phase 4: Offline page and graceful degradation  [HIGH freedom]

When the network is unavailable and a cached response does not exist, show a
helpful offline page rather than a browser error:

```html
<!-- public/offline.html -->
<h1>You are offline</h1>
<p>Check your connection and try again. Pages you have visited recently will still load.</p>
<button onclick="location.reload()">Try again</button>
```

Register it as the fallback. Workbox's `navigateFallback` answers every
non-precached navigation with one HTML file, online or not, so it is the SPA
shell (vite-plugin-pwa defaults it to `index.html`), not an offline page. For
server-rendered pages, precache `offline.html` and attach it to the
navigation route:
```javascript
// workbox (generateSW) options; clear the SPA fallback so this route runs
navigateFallback: null,
runtimeCaching: [{
  urlPattern: ({ request }) => request.mode === 'navigate',
  handler: 'NetworkFirst', // NetworkOnly if pages carry per-user data
  options: { cacheName: 'pages', precacheFallback: { fallbackURL: '/offline.html' } },
}],
// hand-written service worker: offlineFallback() from workbox-recipes
```

With Serwist (Next.js), precache the page through `additionalPrecacheEntries`
and list it in the `Serwist` constructor's `fallbacks.entries` with a
`request.destination === 'document'` matcher.

---

## Phase 5: Install prompt (optional but high-value)  [HIGH freedom]

Do not use the browser's default install prompt — it appears at the wrong time.
Instead, intercept `beforeinstallprompt` and show it when the user has
demonstrated value (e.g. after completing a core action):

```typescript
// hooks/useInstallPrompt.ts
let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
});

export function triggerInstallPrompt() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
}
```

Show a custom banner with clear benefits ("Install for offline access and faster loads"),
not just "Add to Home Screen". `beforeinstallprompt` fires only in Chromium browsers;
Safari (including iOS) and Firefox never fire it, so on iOS show Share → Add to
Home Screen instructions instead.

---

## Phase 6: Push notifications (if backend supports it)  [HIGH freedom]

Only implement push if the app has a genuine reason to send notifications
(not just to ask for permission on first load — users will deny that).

```typescript
async function subscribeToPush(userId: string) {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_KEY!),
  });
  // Save subscription to backend
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({ userId, subscription }),
  });
}
```

For the backend, use `web-push` (Node.js) or your platform's push service.

---

## Phase 7: Verify installability and offline  [LOW freedom — do not skip]

Lighthouse removed its PWA category in v12.0 (April 2024), so there is no PWA
score to target. Check in Chrome DevTools → Application instead: the
**Manifest** pane's Installability section must list no errors, and in
**Service workers** tick **Offline** and reload `start_url`.

Key checks:
- [ ] Manifest present and installable
- [ ] Service worker registered
- [ ] Works offline (offline page or cached response)
- [ ] HTTPS (localhost counts)
- [ ] `viewport` meta tag present
- [ ] Icons correct size and format
- [ ] `start_url` loads while offline

---

## Guardrails

- **Service worker caching can break deployments** if old caches persist.
  Use `registerType: 'autoUpdate'` (the new service worker takes control at once; open tabs reload only when the app registers through `virtual:pwa-register`, e.g. `registerSW({ immediate: true })`) or `'prompt'` (the user is asked to reload) — never a silent background update that keeps serving stale precached code.
- **Never cache auth tokens or sensitive API responses** in the service worker.
- **Test offline mode manually** via DevTools → Network → Offline before shipping.
- **Capacitor apps**: confirm the Capacitor bridge still works after adding the
  service worker by running `mobile-emulator-test`.
