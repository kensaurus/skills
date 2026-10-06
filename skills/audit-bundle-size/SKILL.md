---
name: audit-bundle-size
description: >
  Analyse and shrink a web app's JavaScript bundle. Use when "reduce bundle
  size", "code splitting", "slow initial load", or "why is the bundle so big".
  Runtime → audit-performance.
license: MIT
effort: high
---

# audit-bundle-size — Find and Eliminate Bundle Bloat

**Degree of freedom: MIXED** — Offender triage and swap choice `[HIGH freedom]`;
Phase 1 production build + analyser `[LOW freedom — run exactly]`.

> **Audit-and-fix exception.** Measure the payload, then shrink it. Runtime
> slowness → `audit-performance`.
>
> Fix only what the measurement named, in the files it named; a repo-wide
> dependency sweep the report did not list is a different session. Edit
> surgically — the offending import, `dynamic()` boundary, or chunk config —
> rather than rewriting whole files. Pre-existing bugs met on the way go in
> the report as follow-ups. Add or change tests only where the repo already
> keeps them for that surface; scratch checks and generated analyser reports
> (`client.html`, `bundle-report.html`) stay out of the commit. An
> `ANALYZE=true`-guarded analyser config stays only if the repo already keeps one.

**Every kilobyte of JavaScript the browser must download, parse, and compile
before showing anything costs real users real time.** A large initial bundle is
the #1 avoidable cause of slow LCP and poor Core Web Vitals. Find exactly what
is bloating it and fix each item.

## How to reason — Observe → Interpret → Classify → Severity

1. **Observe** — quote First Load JS / chunk gzip and the treemap contributor (`file` + package)
2. **Interpret** — is this unused code on the critical path, a duplicate, or a missing split?
3. **Classify** — giant-vendor / full-library import / missing-lazy / unused-dep / dev-in-prod / duplicate
4. **Severity** — by gzip on the initial route: >250 KB First Load JS = review; do not delete a feature to save KB

## Worked example

> **Observe:** Next.js First Load JS 420 KB gzip. Treemap: default `lodash`
> import in `lib/utils.ts`; `moment` with all locales in the shared layout.
> **Interpret:** two libraries pull unused code onto every route.
> **Classify:** full-library import + oversized date lib.
> **Severity:** High — over the 250 KB review threshold.
> **Finding:** named `lodash/debounce` + replace `moment` with `dayjs`; remesure
> First Load JS before claiming a save.

---

## Phase 0: Detect bundler and existing setup  [HIGH freedom]

```
package.json scripts.build   → build command and framework
vite.config.*                → Vite + rollupOptions
next.config.*                → Next.js (webpack / Turbopack)
webpack.config.*             → standalone Webpack
astro.config.*               → Astro (islands, Vite underneath)
```

Identify:
- **Bundler**: Vite / Webpack / Rollup / esbuild / Turbopack / Next.js built-in
- **Analyser available**: `rollup-plugin-visualizer`, `webpack-bundle-analyzer`,
  `@next/bundle-analyzer`, `source-map-explorer`
- **Framework**: Next.js (App / Pages), SvelteKit, Astro, Remix, Nuxt, Vite SPA

---

## Phase 1: Run a production build with analysis  [LOW freedom — run exactly]

### Vite / Rollup

If `rollup-plugin-visualizer` is not installed:
```bash
npm install --save-dev rollup-plugin-visualizer
```

Add temporarily to `vite.config.ts`:
```typescript
import { visualizer } from 'rollup-plugin-visualizer';
// in plugins array:
visualizer({ open: false, filename: 'dist/bundle-report.html', gzipSize: true })
```

Then build:
```bash
npm run build 2>&1 | tail -40
```

Read `dist/bundle-report.html` for the treemap, or parse `dist/stats.json` if
the plugin is configured to output JSON.

### Next.js

```bash
ANALYZE=true npm run build 2>&1 | tail -60
```

This requires `@next/bundle-analyzer` in `next.config.*`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({ /* your config */ });
```

Read the generated `client.html` report. Key number: **First Load JS** per route.
Next.js prints this in the build output — capture it for before/after comparison.

### If no analyser is installed

Use `source-map-explorer` on the build output:
```bash
npx source-map-explorer 'dist/**/*.js' --html dist/bundle-report.html
```

Or for a quick size summary:
```bash
find dist -name '*.js' | xargs ls -lh | sort -k5 -hr | head -20
find dist -name '*.css' | xargs ls -lh | sort -k5 -hr | head -5
```

---

## Phase 2: Parse the results — find the problems  [HIGH freedom]

For each chunk or entry point, record:

| Chunk | Raw size | Gzip size | Largest contributors |
|-------|----------|-----------|---------------------|
| main / page.js | ... | ... | [dep@version, ...] |
| vendor | ... | ... | [dep@version, ...] |

### Red flags to look for

| Problem | Signal | Impact |
|---------|--------|--------|
| One giant vendor chunk | Single `vendor.js` > 200 KB gzip | High — blocks first paint |
| Duplicate dependency | Same library listed twice (e.g. `lodash` + `lodash-es`) | Medium |
| Full library import | `import _ from 'lodash'` (imports everything) | High |
| Missing lazy routes | All routes in one bundle | High |
| Unused package | Large dep that appears in bundle but only 1–2 exports used | High |
| Dev-only dep in prod bundle | `faker`, `debug`, `chalk` in client code | Medium |
| Moment.js | 67 KB gzip with all locales | Medium — replace with date-fns or dayjs |
| Material UI / Ant Design full import | Full icon library loaded | High |
| `react-icons` full package | 50+ MB raw, huge when not tree-shaken | High |

**Also check:**
- [ ] React Compiler on (delete manual memo it makes redundant — smaller bundle, fewer bugs)
- [ ] Barrel imports routed through `experimental.optimizePackageImports` / direct paths (icon libs, lodash, date libs)
- [ ] Route prefetch is deliberate — Next.js 16 prefetch is conservative by default; `<Link prefetch>` only on likely-next routes, and don't double-prefetch what Speculation Rules already cover

Below-fold widgets → `dynamic()` with a Suspense skeleton; navigation prefetch/prerender → `enhance-web-instant-nav`.

---

## Phase 3: Research current alternatives  [HIGH freedom]

For the largest offenders, check current alternatives:
```json
firecrawl:firecrawl_search
{
  "query": "replace <package-name> smaller alternative bundle size [current year]",
  "limit": 3,
  "sources": [{ "type": "web" }]
}
```

Common swaps (research to confirm current state):
- `moment` → `date-fns` or `dayjs` (much smaller, tree-shakeable)
- `lodash` → native JS or `lodash-es` with named imports
- Full icon set → per-icon imports or SVG sprites
- `axios` → native `fetch` (if browser targets allow)
- Large chart libs → check if a lighter alternative exists for the charts used

---

## Self-critique before applying  [LOW freedom — do not skip]

1. **Measured** — First Load JS / gzip from a production build, not "looks big"
2. **Behavior preserved** — dynamic import has a loading state; do not delete a feature to save KB
3. **Right owner** — runtime slowness without payload evidence → `audit-performance`
4. **Analyzer honest** — if the analyser was skipped, say what you used
5. **Remeasure after each fix class** — no save claimed from inspection alone

---

## Phase 4: Fix — ordered by size saved  [HIGH freedom]

### Fix 1: Named imports (tree shaking)

```typescript
// Before — pulls in the whole library
import _ from 'lodash';
import { BellIcon } from '@heroicons/react/24/solid'; // only needs Bell

// After — only the export you need
import debounce from 'lodash/debounce';
import { BellIcon } from '@heroicons/react/24/solid'; // already correct for heroicons v2
```

For icon libraries that do not tree-shake well, use per-icon deep imports or
an SVG sprite sheet.

### Fix 2: Dynamic imports for routes (code splitting)

**Next.js App Router** — code-splits by route automatically. If you have heavy
components inside a page, split them:
```typescript
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('../components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // if it uses browser-only APIs
});
```

**Vite / React Router:**
```typescript
const LazyPage = React.lazy(() => import('./pages/LazyPage'));
// Wrap in <Suspense fallback={<PageSkeleton />}>
```

**SvelteKit** — routes are code-split by default. For heavy components:
```svelte
{#await import('./HeavyComponent.svelte') then { default: Component }}
  <Component />
{/await}
```

### Fix 3: Replace or remove over-sized dependencies

Follow the research from Phase 3. For any replacement:
1. Read the new library's docs via Context7 or Firecrawl before touching code.
2. Make the swap in one file, run `npm run build`, compare sizes before merging everywhere.

### Fix 4: Bundle splitting configuration

**Vite** — split large deps into their own cacheable chunks:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'router': ['react-router-dom'],
        'charts': ['recharts'], // or whatever charting lib
      },
    },
  },
},
```

**Next.js** — configure `splitChunks` in `next.config.*` only if the default
chunking is creating sub-optimal splits. Prefer `dynamic()` over manual config.

### Fix 5: Remove dev-only packages from the client bundle

Any package that should only run server-side or in tests must not be imported
from client-side code. Move to `devDependencies` and verify it disappears from
the bundle after rebuild.

---

## Phase 5: Measure the improvement  [LOW freedom — run exactly]

After fixes, rebuild and re-run Phase 1:

```
Before: First Load JS = X KB gzip
After:  First Load JS = Y KB gzip
Saved:  Z KB (N%)
```

For each route (Next.js build output shows this), confirm the numbers improved.
Run a quick Playwright check to confirm the app still works:

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=bundle-check open --headed "<app-url>"    # then `goto` each key route
$PW -s=bundle-check snapshot                      # no blank screen or error
$PW -s=bundle-check console                       # no new errors
```

---

## Quick-reference: size targets

| Asset | Target | Review if |
|-------|--------|-----------|
| Initial JS (gzip) | < 100 KB | > 250 KB |
| Route chunk (gzip) | < 50 KB | > 150 KB |
| CSS total (gzip) | < 20 KB | > 50 KB |
| Largest single image | < 200 KB | > 500 KB |
| Total page weight | < 500 KB | > 1.5 MB |
