---
name: enhance-web-seo
description: >
  Audit and fix SEO for a web app. Use when "improve SEO", "SEO audit", "add
  meta tags", "add structured data", "sitemap", "canonical URLs", "Open
  Graph", "Google indexing", "rich results", or "why is my site not ranking".
license: MIT
---

# enhance-web-seo — SEO Audit & Implementation

**Degree of freedom: MIXED.** Title/snippet judgment `[HIGH freedom]`; live probes, robots/sitemap, and re-measure `[LOW freedom — run exactly]`.

**Google does not rank pages it cannot read, understand, or trust.** This skill
finds every gap between your app and how search engines see it, then fixes them
in order of impact.

Before browser work, read `protocol-browser-anti-stall` and apply it.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **enhance-web-seo** (this) | SEO audit and fixes: meta, structured data, sitemap, canonical, indexing |
| `workflow-launch-ready` | Launch-preparation sweep for a new app or major release |
| `workflow-gtm` | Taking a shipped repo to market: measure, message, get found, launch |

## How to reason

1. **Detect** — metadata API, robots, sitemap, generator
2. **Measure** — live title, OG, JSON-LD, headings, LCP/CLS
3. **Fix** — impact order: title → OG → robots/sitemap → JSON-LD → CWV
4. **Re-measure** — same probes on each changed route

## Worked example

> **Detect:** Next.js App Router; root `metadata` only; no `sitemap.ts`; `/robots.txt` 404.
> **Measure:** product pages inherit the home title; no canonical; no JSON-LD; LCP 3.1s.
> **Fix:** `generateMetadata` per product; `app/sitemap.ts` + robots; Product JSON-LD; image dimensions.
> **Re-measure:** unique titles; OG image resolves; sitemap lists products; LCP < 2.5s.

## Self-critique before reporting

- **Live, not source-only** — titles/OG/JSON-LD read from the rendered head
- **Unique per page** — no inherited home title on inner routes
- **Indexable** — robots/sitemap exist; no accidental `Disallow: /` or noindex
- **Right owner** — JS/LCP budget → `audit-bundle-size`; AEO citations → `plan-aeo-readiness`

---

## Phase 0: Detect the stack  [HIGH freedom]

```
package.json        → Next.js Metadata API, remix-utils/seo, @vueuse/head, etc.
src/app/layout.tsx  → existing metadata export (Next.js App Router)
src/app/head.tsx    → legacy Head component
public/robots.txt   → existing robots config
public/sitemap.xml  → existing sitemap
```

Also check if a sitemap generator is configured (`next-sitemap`, `astro-sitemap`,
SvelteKit's `@sveltejs/adapter-static` sitemap, etc.).

---

## Phase 1: Live page audit (Playwright)  [LOW freedom — run exactly]

For every public-facing route, run the following:

### 1a. Navigate and capture head

```javascript
// eval after goto
const seo = await page.evaluate(() => ({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.content,
  canonical: document.querySelector('link[rel="canonical"]')?.href,
  og_title: document.querySelector('meta[property="og:title"]')?.content,
  og_description: document.querySelector('meta[property="og:description"]')?.content,
  og_image: document.querySelector('meta[property="og:image"]')?.content,
  og_url: document.querySelector('meta[property="og:url"]')?.content,
  twitter_card: document.querySelector('meta[name="twitter:card"]')?.content,
  robots: document.querySelector('meta[name="robots"]')?.content,
  jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map(s => s.textContent),
}));
```

### 1b. Heading hierarchy

```javascript
const headings = await page.evaluate(() =>
  [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .map(h => ({ tag: h.tagName, text: h.textContent.trim().slice(0, 60) }))
);
```

Rules: exactly one `<h1>` per page; `<h2>` never skips to `<h4>` without `<h3>`.

### 1c. Image alt text

```javascript
const images = await page.evaluate(() =>
  [...document.querySelectorAll('img')]
    .filter(img => !img.alt || img.alt.trim() === '')
    .map(img => img.src.slice(-60))
);
```

### 1d. Core Web Vitals

CWV (LCP, INP, CLS) is a ranking input. Measure field p75 via
CrUX/PSI. Do **not** fix CWV here — hand off:
- LCP / INP / CLS root cause → `audit-performance` §Loading Priority & Speculation
- JS weight → `audit-bundle-size`
- Instant navigations → `enhance-web-instant-nav`
Record before/after p75 in this skill's re-measure step.

---

## Phase 2: Technical SEO checks  [HIGH freedom]

### 2a. robots.txt

`goto` to `/robots.txt`. Check:
- File exists and returns 200 (not 404)
- No `Disallow: /` unless intentional (private app)
- Sitemap URL referenced: `Sitemap: https://yourdomain.com/sitemap.xml`
- No important pages accidentally blocked

### 2b. Sitemap

Navigate to `/sitemap.xml` or `/sitemap-index.xml`. Check:
- Exists and is valid XML
- Contains all important public routes (not just `/`)
- `<lastmod>` dates are current, not hardcoded to a past date
- No 404 or noindex pages included

### 2c. Structured data (JSON-LD)

Validate each JSON-LD block found in Phase 1a:
- `@context: "https://schema.org"` present
- `@type` matches the page content (Article, Product, Organization, WebSite, BreadcrumbList, FAQPage, etc.)
- Required fields for the type are present (check `references/structured-data-types.md`)
- No syntax errors in the JSON

### 2d. Canonical URLs

- Every page has a `<link rel="canonical">` pointing to its definitive URL
- No page canonicalises to a 404 or redirect
- Pagination: page 2+ should have canonical pointing to itself (not page 1)
- Duplicate content (www vs non-www, http vs https): one canonical, one redirect

---

## Phase 3: Research current best practices  [HIGH freedom]

Follow `/research`: Context7 for the framework's metadata, sitemap, and robots API; Firecrawl for current Google guidance on CWV, structured data, and rich results, dated to now. Anchor to the framework version actually installed.

---

## Phase 4: Fix — ordered by impact  [HIGH freedom]

### Priority 1 — Page title and meta description (every page)

Every public page needs a unique, descriptive title (50–60 chars) and
meta description (150–160 chars).

**Next.js App Router:**
```typescript
// app/page.tsx
export const metadata: Metadata = {
  title: 'Specific Page Title — Brand Name',
  description: 'One or two sentences that describe this page for someone scanning search results.',
};
```

**Next.js dynamic routes:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const item = await fetchItem(params.id);
  return {
    title: `${item.name} — Brand Name`,
    description: item.summary,
    openGraph: { title: item.name, description: item.summary, images: [item.coverImage] },
  };
}
```

### Priority 2 — Open Graph and Twitter Card

Required for social sharing previews. Every page needs at minimum:
```typescript
openGraph: {
  title: 'Page Title',
  description: 'Page description',
  url: 'https://yourdomain.com/page',
  siteName: 'Brand Name',
  images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  type: 'website', // or 'article' for blog posts
},
twitter: {
  card: 'summary_large_image',
  title: 'Page Title',
  description: 'Page description',
  images: ['/og-image.png'],
},
```

### Priority 3 — robots.txt and sitemap

**robots.txt** (static file at `public/robots.txt`):
```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

**Sitemap** — use the framework's built-in generator where available:
- Next.js App Router: `app/sitemap.ts` returning `MetadataRoute.Sitemap`
- SvelteKit: `+server.ts` returning XML response
- Remix: `sitemap[.]xml.ts` resource route

### Priority 4 — Structured data (JSON-LD)

Add to the relevant page layout:
```typescript
// For a website home page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Brand Name',
  url: 'https://yourdomain.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://yourdomain.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};
// Inject via: <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
```

### Priority 5 — Core Web Vitals fixes

See `audit-bundle-size` for JS bundle → LCP fixes.
For CLS: ensure images have explicit `width`/`height`, fonts use `font-display: swap`,
ads/embeds have reserved space.

---

## Phase 5: Verify with Playwright  [LOW freedom — do not skip]

After fixes, re-run Phase 1 checks on each modified page. Confirm:
- `document.title` and meta description match the intent
- OG tags present and well-formed
- JSON-LD valid (no JSON.parse errors)
- LCP improved or within threshold
- No new console errors introduced

---

## SEO audit checklist

```
Per page:
- [ ] Unique descriptive title (50–60 chars)
- [ ] Meta description (150–160 chars), not cut off
- [ ] Exactly one <h1>
- [ ] Heading hierarchy correct (no skipped levels)
- [ ] All images have alt text
- [ ] Canonical URL present and correct
- [ ] OG title, description, image
- [ ] Twitter card meta
- [ ] JSON-LD structured data where relevant

Site-wide:
- [ ] robots.txt exists and correct
- [ ] Sitemap exists and up to date
- [ ] No important pages noindexed accidentally
- [ ] HTTPS enforced, no mixed content
- [ ] LCP < 2.5 s
- [ ] CLS < 0.1
```
