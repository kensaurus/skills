---
name: enhance-web-instant-nav
description: >
  Instant in-site navigation: Speculation Rules, View Transitions, bfcache,
  103 Early Hints. Use when "instant navigation", "prerender", "early hints",
  "back button reloads", or "second page is slow". First-load CWV →
  audit-performance.
license: MIT
---

> Surface router: `/uiux`. You are here: `enhance-web-instant-nav`.

# enhance-web-instant-nav — Instant Navigations

**Degree of freedom: MIXED.** Which pages to speculate `[HIGH freedom]`;
the exclusion list, `Sec-Purpose` handling, and re-measure `[LOW freedom — run exactly]`.

> Applies to MPAs and Next.js App Router (server-rendered routes). Pure SPA
> routing → use the framework's prefetch API; Speculation Rules are per-document.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **enhance-web-instant-nav** (this) | In-site navigation: Speculation Rules, View Transitions, bfcache, Early Hints |
| `audit-performance` | First-load runtime performance: Core Web Vitals, load priority |

## How to reason

1. **Observe** — quote 2nd-page LCP p75, bfcache test result, and the top 5 next-click paths
2. **Rank** — probability × page cost. Prefetch broadly; prerender only ≥ ~50% likely next pages
3. **Guard** — list every URL with GET side effects or per-user state; exclude or downgrade to prefetch
4. **Ship** — rules + server guard + analytics guard in the same PR
5. **Re-measure** — if 2nd-page LCP didn't drop, the rule isn't firing (DevTools → Application → Speculative loads)

## Worked example

> **Observe:** blog; first-page LCP 1.9 s, next-article LCP 2.8 s; back button reloads (`unload` in analytics).
> **Rank:** "next article" 61% of sessions → prerender moderate; category links → prefetch moderate.
> **Guard:** `/logout`, `/account/*`, `?utm_*` excluded; server returns early on `Sec-Purpose`.
> **Ship:** rules block + `pagehide` swap + `document.prerendering` guard in the GA loader.
> **Re-measure:** next-article LCP 0.3 s (activation), bfcache green, no analytics double-count.

## Safety contract  [LOW freedom — run exactly]

- Never prerender: logout, cart/checkout, payment, auth, anything whose GET mutates state
- Server: if `Sec-Purpose` contains `prefetch`, skip counters/side effects; return normal HTML
- Client: analytics, ads, consent, A/B run only after `document.prerendering === false` or on `prerenderingchange`
- Never add `unload` listeners; never set `Cache-Control: no-store` on HTML unless legally required
- Cross-origin / cross-site prerender is not attempted

## Phase 1 — Measure  [LOW freedom — run exactly]

- `web-vitals/attribution` `onLCP` on the *second* page in a session; record p75
- DevTools → Application → Back/forward cache → Test; record blocking reasons
- `curl -sv <url> 2>&1 | grep "< HTTP"` — is a `103` emitted today?
- Top next-click paths from analytics (or infer from IA)

```bash
# Field: CrUX / PSI p75 for origin + top URLs
npx @lhci/cli autorun --config=lighthouserc.json
curl -sv https://example.com/ 2>&1 | grep -E "< HTTP/.* 103"
```

## Phase 2 — Speculation Rules  [HIGH freedom on selection]

Baseline (adjust `where` to the site's IA):

```html
<script type="speculationrules">
{
  "prefetch": [{
    "where": { "and": [
      { "href_matches": "/*" },
      { "not": { "href_matches": ["/logout", "/account/*", "/cart*", "/checkout*", "/api/*"] } },
      { "not": { "selector_matches": "[rel~=nofollow], .no-prefetch" } }
    ]},
    "eagerness": "moderate"
  }],
  "prerender": [{
    "where": { "href_matches": "/posts/*" },
    "eagerness": "moderate"
  }]
}
</script>
```

- Eagerness: `conservative` (pointer/touch down) → `moderate` (desktop: hover 200 ms or pointerdown; mobile: viewport heuristics) → `eager` (Chrome 143+: desktop hover 10 ms, mobile viewport heuristics) → `immediate` (as soon as the rules load). Left unset, list (`urls`) rules default to `immediate` and document (`where`) rules to `conservative`, so set `moderate` explicitly. `immediate` on document rules is allowed but speculates on every matching link; use it with care.
- Query strings: `"expects_no_vary_search": "params=(\"utm_source\" \"utm_medium\")"` or exclude `?` URLs
- Next.js App Router: keep `<Link>` prefetch for RSC payloads; add the block in `app/layout.tsx` via a raw `<script>`. On Next.js 16.3+ evaluate **Instant Navigations** first (opt-in: `cacheComponents: true` + `partialPrefetching: true` in `next.config`); if it covers the case, skip prerender rules and keep only prefetch.
- Chromium-first progressive enhancement. Check caniuse at implementation time — never block on Firefox/Safari.

Syntax depth: `references/speculation-rules.md`.

## Phase 3 — bfcache  [LOW freedom — run exactly]

- Replace `unload` → `pagehide`; `beforeunload` only while unsaved input exists
- Close WebSockets / BroadcastChannel in `pagehide`; reopen on `pageshow` if `event.persisted`
- Drop `Cache-Control: no-store` from HTML (keep it on APIs)
- Re-run the DevTools test until green

Blocker list: `references/bfcache-blockers.md`.

## Phase 4 — View Transitions (cross-document)  [HIGH freedom]

```css
@view-transition { navigation: auto; }
@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } }
.hero-img { view-transition-name: hero; }
```

- Pair with prerender: activation + transition = app-like feel
- Progressive: nothing breaks without it
- Keep `view-transition-name` unique per document or the transition aborts
- `prefers-reduced-motion` is required (pairs with `audit-accessibility`)

## Phase 5 — 103 Early Hints  [LOW freedom — run exactly]

- HTML responses only: `Link: </hero.avif>; rel=preload; as=image; fetchpriority=high`, `Link: <https://cdn.example>; rel=preconnect`
- Node/Next custom server: `res.writeEarlyHints({ link: [...] })`; else CDN config
- Do not hint > ~5 resources; do not hint per-user content
- Per-platform: `references/early-hints.md`

## Self-critique before reporting

- **Exclusions listed** — every GET-with-side-effects URL is in the PR
- **Server checks `Sec-Purpose`** — grep it
- **No double analytics** — prerender → activation tested
- **Prerender scarce** — only pages with ≥ ~50% next-click probability
- **Re-measured** — 2nd-page LCP p75 dropped, or the rule isn't firing
- **Right owner** — first-load LCP/INP/CLS → `audit-performance`; JS weight → `audit-bundle-size`

## Required output

1. Before/after: 2nd-page LCP p75, bfcache status, 103 present, transition on/off
2. Rules block + exclusion list
3. Server guard + client analytics guard diffs
4. One-line rollback: delete the `<script type="speculationrules">` block

## Related

- `audit-performance` — first-load CWV / loading priority
- `audit-bundle-size` — JS weight; don't double-prefetch
- `audit-accessibility` — reduced-motion for View Transitions
- `enhance-pwa` — service worker vs speculation / bfcache
