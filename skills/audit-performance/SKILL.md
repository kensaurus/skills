---
name: audit-performance
description: >
  Audit and fix runtime performance (Core Web Vitals, load priority). Use when
  "slow page", "LCP/INP/CLS", "fetchpriority", "long tasks", or "bfcache". JS
  payload → audit-bundle-size. Instant nav → enhance-web-instant-nav. Load
  limits → test-load.
license: MIT
effort: high
---

# Performance Audit Skill

**Degree of freedom: MIXED** — what to optimize `[HIGH freedom]`;
measure-first Sentry/vitals and `EXPLAIN` `[LOW freedom — run exactly]`.

> **Audit-and-fix exception.** Measure, then optimize. JS payload → `audit-bundle-size`. Instant navigations → `enhance-web-instant-nav`. Breaking point → `test-load`. Timeouts/retries → `audit-resilience`.
> When fixing: change only the measured bottleneck and re-measure it; log other slow paths you notice as follow-ups, not fixes. Edit the existing file in place rather than rewriting it. Add a perf test only where the repo already keeps them or the task asks; scratch measurements stay out of the repo.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-performance** (this) | Audit and fix runtime performance: Core Web Vitals, load priority |
| `audit-bundle-size` | Analyse and shrink the JavaScript bundle: code splitting, initial load |
| `enhance-web-instant-nav` | Instant in-site navigation: Speculation Rules, View Transitions, bfcache, Early Hints |
| `plan-perf-audit` | Plan-only performance audit across web, mobile, backend, data; fixes nothing |
| `test-load` | k6 or Artillery load profile: throughput, latency percentiles, breaking point |
| `audit-agent-speed` | Measure and fix a slow coding-agent setup: hooks, status line, bloat |
| `workflow-quality-gate` | Pre-release gate across red-team, security, bundle, performance, unit tests |

## How to reason

1. **Observe** — quote LCP/INP/CLS, p95, or `EXPLAIN` / N+1 loop (`file:line`)
2. **Interpret** — is the user waiting on bytes, a query, or main-thread work?
3. **Classify** — vital-miss / N+1 / missing-index / bundle / image / re-render
4. **Severity** — poor LCP/INP or p95 >> target on a live path = Critical

## Worked example

> **Observe:** Sentry p95 `/users` = 2.3s; handler `findAll` then per-user
> `Order.findByUserId` (`app/api/users/route.ts:31`).
> **Interpret:** N+1; TTFB/LCP suffer on that page.
> **Classify:** N+1.
> **Severity:** Critical (p95 far over 200ms).
> **Finding:** `/users` | N+1 | eager-load orders | then re-measure

## Step 0: Gather Performance Data  [LOW freedom — run exactly]

Before optimizing, measure. Collect data from multiple sources.

### Production Data (Sentry)

If Sentry performance monitoring is enabled, fetch real production metrics:

```json
sentry:search_events
{
 "organizationSlug": "<ORG_SLUG>",
 "projectSlug": "<PROJECT_SLUG>",
 "regionUrl": "<REGION_URL>",
 "query": "slowest transactions by p95 duration in last 7 days",
 "limit": 20
}
```

```json
sentry:search_events
{
 "organizationSlug": "<ORG_SLUG>",
 "projectSlug": "<PROJECT_SLUG>",
 "regionUrl": "<REGION_URL>",
 "query": "web vitals LCP INP CLS performance scores in last 7 days",
 "limit": 20
}
```

Check for performance-related issues:

```json
sentry:search_issues
{
 "organizationSlug": "<ORG_SLUG>",
 "projectSlugOrId": "<PROJECT_SLUG>",
 "regionUrl": "<REGION_URL>",
 "query": "performance issues slow queries N+1 in last 30 days",
 "limit": 20
}
```

### Research Current Benchmarks

Fetch current performance targets:

```json
firecrawl:firecrawl_search
{
 "query": "web vitals thresholds good score <current year>",
 "limit": 3,
 "sources": [{ "type": "web" }]
}
```

### Field Data (source of truth)  [LOW freedom — run exactly]

Lab (Lighthouse) is for diagnosis; **field** decides pass/fail.

1. CrUX / PageSpeed Insights field tab for the origin and top 5 URLs by
   traffic — record p75 LCP / INP / CLS (mobile first).
2. `web-vitals/attribution` in the app (not the base build): it names the
   LCP element, the INP interaction target, and the CLS-shifting node.
3. Lighthouse CI with a `budget.json` (see `references/loading-priority-2026.md`
   §Budgets). Fail the PR on regression, not on absolute score.

Record all three in the report's "Production Metrics" block before touching code.

### Verification protocol  [LOW freedom — run exactly]

```bash
# Field (source of truth): CrUX / PSI field tab → p75 LCP, INP, CLS
# Lab, repeatable, budgeted:
npx @lhci/cli autorun --config=lighthouserc.json
# Early Hints present?
curl -sv https://example.com/ 2>&1 | grep -E "< HTTP/.* 103"
# Speculation: DevTools → Application → Speculative loads
# bfcache:     DevTools → Application → Back/forward cache → Test
# LCP element: web-vitals/attribution → onLCP(({attribution}) => attribution.element)
```

---

## Performance Targets

### Core Web Vitals

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| **LCP** (Largest Contentful Paint) | <2.5s | 2.5-4s | >4s |
| **INP** (Interaction to Next Paint) | <200ms | 200-500ms | >500ms |
| **CLS** (Cumulative Layout Shift) | <0.1 | 0.1-0.25 | >0.25 |

### Other Key Metrics

- **TTFB**: <800ms field p75 (Google threshold); aim <200ms at the edge
- **FCP**: <1.8s
- **Long tasks**: none >50ms on the critical interaction path (INP driver)
- **LCP resource load delay**: <100ms (gap between TTFB and the LCP image request starting — usually "image not discoverable / not preloaded")
- **bfcache**: eligible on every content page (DevTools → Application → Back/forward cache)

---

## Frontend Performance Audit  [HIGH freedom]

### Bundle Size Analysis

```bash
npm run build -- --analyze # framework-specific
npx source-map-explorer 'dist/**/*.js'
```

**Checklist:**
- [ ] Total bundle <200KB gzipped
- [ ] No single chunk >100KB gzipped
- [ ] Tree shaking working (no unused exports in bundle)
- [ ] Heavy libraries lazy-loaded (charts, editors, maps)
- [ ] No moment.js (use date-fns or dayjs)
- [ ] No lodash full import (use lodash-es or specific imports)

### Code Splitting

- [ ] Route-based splitting (each page loads its own chunk)
- [ ] Component-level splitting for heavy components (`lazy()` / `dynamic()`)
- [ ] Below-fold content deferred

### Image Optimization

- [ ] WebP/AVIF format used (not PNG/JPEG for photos)
- [ ] Images sized appropriately (not serving 4K to mobile)
- [ ] `loading="lazy"` on below-fold images
- [ ] Responsive `srcSet` for different screen sizes
- [ ] Image CDN used (Cloudinary, imgix, Vercel Image Optimization)

### Loading Priority & Speculation  [HIGH freedom on which to apply, LOW freedom on the LCP rules]

Deep syntax: `references/loading-priority-2026.md`. Instant-nav implementation → `enhance-web-instant-nav`.

**LCP element (find it first with `web-vitals/attribution` or DevTools → Performance → LCP)**
- [ ] LCP image is **not** `loading="lazy"` — lazy on the LCP image is an automatic Critical finding
- [ ] LCP image has `fetchpriority="high"` (Next.js: `<Image priority />`, which also injects the preload)
- [ ] LCP image is discoverable from HTML — not a CSS `background-image`, not injected by client JS, not behind a hydration boundary
- [ ] `<link rel="preload" as="image" imagesrcset imagesizes>` when the LCP image is responsive and not already preloaded by the framework
- [ ] Non-critical images: `loading="lazy" decoding="async"`; `<picture>` AVIF → WebP → JPEG fallback

**Fonts**
- [ ] `font-display: swap` (or `optional` for non-brand text); fallback metrics set (`size-adjust`, `ascent-override`) so swap causes no CLS — `next/font` does this automatically, verify it's actually used
- [ ] Preload only the above-fold weight(s); subset to used unicode ranges; self-host

**Early Hints (103)**
- [ ] Origin/CDN sends `103 Early Hints` with `preconnect` for the image/font CDN and `preload` for the LCP image + critical CSS. Verify: `curl -sv https://site/ 2>&1 | grep -i "< HTTP/.* 103"`
- [ ] Node: `res.writeEarlyHints({ link: [...] })`; otherwise configure at the CDN

**Speculation Rules (next-navigation speed)**
- [ ] `<script type="speculationrules">` present with `prefetch` document rules at `moderate` eagerness for in-site links
- [ ] `prerender` only for high-probability next pages (pagination, "next article", product detail); eagerness `moderate`/`conservative`
- [ ] Excluded from speculation: logout, cart/checkout, auth, anything with side effects on GET, URLs with `?` unless `expects_no_vary_search` is set
- [ ] Server ignores side-effects when `Sec-Purpose: prefetch;prerender` is present; analytics/ads guarded by `document.prerendering` + `prerenderingchange`
- [ ] Full implementation → `enhance-web-instant-nav`

**bfcache**
- [ ] No `unload` listeners (use `pagehide`); no `Cache-Control: no-store` on HTML; no open WebSocket / IndexedDB transaction at `pagehide`
- [ ] Verified green in DevTools → Application → Back/forward cache → "Test back/forward cache"

**Render strategy (Next.js 16 / React 19)**
- [ ] Server Components by default; `'use client'` only at interactive leaves
- [ ] Slow data wrapped in `<Suspense>` so the shell streams; static shell + dynamic holes (`cacheComponents` / `'use cache'`) instead of blocking the whole route
- [ ] React Compiler enabled (`reactCompiler: true`) **before** any manual `memo`/`useMemo`/`useCallback` — manual memo only where Profiler proves the Compiler missed it

**INP (responsiveness)**
- [ ] No task >50ms on tap/click/keypress paths; break work with `scheduler.yield()` (fallback `setTimeout(0)`) or `startTransition`
- [ ] No synchronous layout reads (`offsetHeight`, `getBoundingClientRect`) inside input handlers
- [ ] `content-visibility: auto` + `contain-intrinsic-size` on long off-screen sections
- [ ] Third-party scripts: `async`/`defer`, Next `<Script strategy="lazyOnload">` (or `"worker"` via Partytown where safe), consent-gated, facades for embeds (lite-youtube, static map image → iframe on click)

**CLS**
- [ ] Every `<img>`, `<video>`, `<iframe>`, ad slot has `width`/`height` or `aspect-ratio`
- [ ] Late-arriving UI (banners, toasts, cookie bars) reserves space or overlays — never pushes content

### React Performance (if applicable)

- [ ] React Compiler on; manual memo only with Profiler evidence (see Loading Priority & Speculation)
- [ ] No unnecessary re-renders (React DevTools Profiler)
- [ ] Long lists virtualized (react-window, @tanstack/react-virtual)
- [ ] No inline object/array creation in JSX props
- [ ] Context providers scoped narrowly (not wrapping entire app for local state)

### CSS Performance

- [ ] No layout thrashing (reads before writes)
- [ ] Animations use `transform`/`opacity` (GPU-accelerated)
- [ ] No `@import` chains (bundled instead)
- [ ] Critical CSS inlined for above-fold content
- [ ] Fonts subset and preloaded (`<link rel="preload">`)

---

## Backend Performance Audit  [HIGH freedom]

### Database Queries

**N+1 Detection:**
```typescript
// BAD: N+1
const users = await User.findAll();
for (const user of users) {
 const orders = await Order.findByUserId(user.id);
}

// GOOD: eager loading
const users = await User.findAll({ include: [Order] });
```

**Checklist:**
- [ ] N+1 queries eliminated (eager loading, joins, batch loading)
- [ ] Indexes on frequently queried columns (WHERE, JOIN, ORDER BY)
- [ ] SELECT only needed columns (no `SELECT *`)
- [ ] Pagination on all list endpoints
- [ ] Connection pooling configured
- [ ] Slow query logging enabled

**Index verification:**  [LOW freedom — run exactly]
```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = '123';
```

### API Response Optimization

- [ ] Response compression enabled (gzip/brotli)
- [ ] Appropriate cache headers (`Cache-Control`, `ETag`)
- [ ] No over-fetching (return only what the client needs)
- [ ] Pagination for list endpoints
- [ ] Response time <200ms for p95

### Caching Strategy

| Layer | Tool | TTL | Use For |
|-------|------|-----|---------|
| Browser | Cache-Control headers | Varies | Static assets, API responses |
| CDN | Vercel/CloudFront/Cloudflare | 1h-1d | Static pages, images |
| API | Redis/Memcached | 5m-1h | Expensive queries, computed data |
| ORM | Query cache | 1m-5m | Repeated identical queries |

### Network Optimization

- [ ] CDN for static assets
- [ ] HTTP/2 or HTTP/3 enabled
- [ ] Preconnect to critical origins (`<link rel="preconnect">`)
- [ ] DNS prefetch for third-party domains
- [ ] API calls batched where possible (GraphQL, DataLoader)

---

## Research-Driven Optimization  [HIGH freedom]

For specific performance bottlenecks, research current solutions:

```json
firecrawl:firecrawl_search
{
 "query": "<framework> <specific bottleneck> performance optimization <current year>",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Then deep-read the best result:

```json
firecrawl:firecrawl_scrape
{
 "url": "<best-result-url>",
 "formats": ["markdown"],
 "onlyMainContent": true
}
```

Check official framework docs via Context7:

```json
context7:resolve-library-id
{
 "libraryName": "<framework>",
 "query": "performance optimization"
}
```

---

## Quick Wins (Highest Impact, Lowest Effort)

| Issue | Solution | Impact |
|-------|----------|--------|
| LCP image lazy / not prioritized | `fetchpriority="high"` + preload; remove `loading="lazy"` from LCP | High (−300 to −800 ms LCP) |
| Fast first page, slow second | Speculation Rules `prefetch` (moderate) | High (next-nav TTFB ≈ 0) |
| Manual memo everywhere | Enable React Compiler | High (INP; delete redundant memo) |
| Large bundle | Code split routes, lazy load heavy libs | High |
| Slow images | WebP + lazy load + responsive | High |
| No caching | Add Cache-Control headers | High |
| N+1 queries | Eager load / batch | High |
| Missing indexes | Add database indexes | High |
| Unoptimized fonts | Subset + preload + font-display:swap | Medium |
| No compression | Enable gzip/brotli | Medium |
| Expensive re-renders | React Compiler first; manual memo only with Profiler evidence | Medium |
| Layout shifts | Set explicit width/height on images/embeds | Medium |

---

## Self-critique before applying fixes  [LOW freedom — do not skip]

1. **Evidenced** — a measured vital, p95, or `EXPLAIN`, not "this looks slow"
2. **Reproducible** — same path still exceeds the target table
3. **Severity justified** — Critical = poor vital or live-path p95
4. **Right owner** — JS payload → `audit-bundle-size`; breaking point → `test-load`; timeouts → `audit-resilience`
5. **No-false-safety** — no `memo`/`useMemo` without a measured re-render; measure again after the fix
6. **LCP named** — prove which element is LCP before recommending image fixes (no attribution data = guess, not audit)

## Output: Performance Audit Report

```markdown
## Performance Audit: [Project Name]

### Production Metrics (from Sentry)
- LCP: [value] — [good/needs work/poor]
- INP: [value] — [good/needs work/poor]
- CLS: [value] — [good/needs work/poor]
- Slowest transactions: [list with p95 times]

### Critical Issues (fix immediately)
| # | Area | Issue | Impact | Fix |
|---|------|-------|--------|-----|
| 1 | DB | N+1 on /users endpoint | p95 = 2.3s | Eager load orders relation |

### Optimizations (prioritized)
| # | Area | Issue | Impact | Effort | Fix |
|---|------|-------|--------|--------|-----|
| 1 | FE | Bundle 450KB gzipped | High | Low | Code split routes |

### Already Optimized
- [list of performance areas that are well-implemented]

### Monitoring Recommendations
- [what to add to track performance over time]

### Research Sources
- [URL] — [what optimization pattern it provided]
```
