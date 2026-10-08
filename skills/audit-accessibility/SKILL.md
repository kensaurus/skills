---
name: audit-accessibility
description: >
  WCAG 2.2 AA audit via playwright-cli: axe-core, keyboard, contrast, target
  size, focus, ARIA. Use when "audit accessibility", "check a11y", "WCAG
  audit", "check keyboard nav", or "test screen reader".
license: MIT
effort: high
---

# Accessibility Audit

**Degree of freedom: MIXED** — Phases 0–1, 5 `[HIGH freedom]`; Phases 2–3
playwright/axe/Tab sequences `[LOW freedom — run exactly]`. Read
`protocol-browser-anti-stall` before any browser step.

## How to reason

1. **Observe** — quote axe rule+selector, heading list, or Tab snapshot
2. **Interpret** — can a keyboard or AT user complete the task?
3. **Classify** — WCAG fail / axe-false-positive / manual-only / correct-as-is
4. **Severity** — Level A = P0; Level AA = P1; best-practice = P2

## Worked example

> **Observe:** axe `label` on `/signup`; `<input name="email">` has no `id`/`aria-label`.
> **Interpret:** AT users cannot tell what to type (1.3.1 / 4.1.2).
> **Classify:** WCAG fail (not an axe false positive).
> **Severity:** P0 — Level A, blocks signup.
> **Finding:** `/signup` | 1.3.1+4.1.2 | P0 | unlabeled email | `<label for>`.

## Self-critique before reporting  [LOW freedom — do not skip]

1. **WCAG SC + numbers** — not "contrast is bad"; quote ratio or selector
2. **Keyboard, not axe-only** — 2.1.1 fails even if axe is clean
3. **Every reachable page** — obscure routes still count
4. **Severity justified** — Level A = P0
5. **Axe is ~30–40%** — heading/focus/link-text/reading-order always manual
6. **2.2 additions probed** — 2.4.11, 2.5.7, 2.5.8, 3.3.8 each have a probe result, not "axe clean"

---

## Phase 0: Auto-Detect Pages and Components

### 0a. Discover Route Structure

```
Glob("**/app/**/page.{tsx,jsx,ts,js}")
Glob("**/pages/**/*.{tsx,jsx,ts,js}")
Glob("**/src/routes/**/*.{tsx,jsx,svelte,vue}")
```

### 0b. Find the App URL

```
Grep(pattern: "NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_BASE_URL|VITE_APP_URL|APP_URL|localhost", glob: ".env*")
```

If no production URL, default to `http://localhost:3000` (or detected dev server port).

### 0c. Detect CSS Framework and Component Library

```
Grep(pattern: "tailwindcss|@chakra-ui|@mui|@radix-ui|shadcn|bootstrap|bulma", glob: "package.json")
```

### 0d. Detect Existing a11y Tooling

```
Grep(pattern: "axe-core|@axe-core|eslint-plugin-jsx-a11y|pa11y|lighthouse|@testing-library", glob: "package.json")
Grep(pattern: "aria-|role=|tabIndex|sr-only|visually-hidden", glob: "*.{tsx,jsx,vue,svelte}", output_mode: "count")
```

Record: `APP_URL`, `PAGES`, `CSS_FRAMEWORK`, `COMPONENT_LIB`, `EXISTING_A11Y_TOOLS`, `ARIA_USAGE_COUNT`.

---

## Phase 1: Research Current WCAG Guidelines

### 1a. Firecrawl Research

```json
firecrawl:firecrawl_search
{
 "query": "WCAG 2.2 success criteria checklist web accessibility [current year]",
 "limit": 5
}
```

```json
firecrawl:firecrawl_search
{
 "query": "axe-core automated accessibility testing best practices common false positives",
 "limit": 5
}
```

```json
firecrawl:firecrawl_search
{
 "query": "<CSS_FRAMEWORK> <COMPONENT_LIB> accessibility best practices common issues",
 "limit": 5
}
```

Scrape 2–3 authoritative results:

```json
firecrawl:firecrawl_scrape
{
 "url": "<BEST_RESULT_URL>",
 "formats": ["markdown"],
 "onlyMainContent": true
}
```

### 1b. Framework-Specific a11y Docs (Context7)

```json
context7:resolve-library-id
{
 "libraryName": "<COMPONENT_LIB e.g. radix-ui or chakra-ui>"
}
```

```json
context7:query-docs
{
 "libraryId": "<RESOLVED_ID>",
 "query": "accessibility ARIA keyboard navigation focus management"
}
```

---

## Phase 2: Automated Scanning (axe-core via Playwright)

### 2a. Navigate to Each Page

For each page discovered in Phase 0a:

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=a11y open --headed "<APP_URL><ROUTE>"    # first page; use `goto` for subsequent ones
```

Apply the `protocol-browser-anti-stall` protocol: wait 2s, snapshot, verify page loaded.

### 2b. Inject and Run axe-core

Use `run-code` to inject axe-core from CDN and run a full scan. The URL pins
a version so results are reproducible; if the CDN returns 404, look up the
current axe-core 4.x on cdnjs and substitute it — do not skip the scan:

```bash
$PW -s=a11y run-code 'async (page) => { await page.addScriptTag({ url: "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js" }); return await page.evaluate(async () => { const r = await axe.run(); return { violations: r.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, help: v.help, helpUrl: v.helpUrl, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map(n => n.target[0]) })), passes: r.passes.length, incomplete: r.incomplete.length, inapplicable: r.inapplicable.length }; }); }'
```

For each violation returned, record:
- **Rule ID** (e.g., `color-contrast`, `image-alt`, `label`)
- **Impact** (critical, serious, moderate, minor)
- **WCAG criteria** mapped from the rule
- **Affected elements** (CSS selectors)
- **Count** of affected nodes

### 2c. Check Specific WCAG Categories Manually

**Heading Hierarchy (WCAG 1.3.1):**

```bash
$PW -s=a11y eval '() => Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map(h => ({ tag: h.tagName, text: h.textContent.trim().substring(0, 50) }))'
```

Verify: only one `h1`, headings don't skip levels (h1 -> h3 without h2).

**Image Alt Text (WCAG 1.1.1):**

```bash
$PW -s=a11y eval '() => Array.from(document.querySelectorAll("img")).map(img => ({ src: img.src.split("/").pop(), alt: img.alt, hasAlt: img.hasAttribute("alt"), decorative: img.getAttribute("role") === "presentation" || img.alt === "" }))'
```

Verify: all informative images have descriptive alt text, decorative images have `alt=""` or `role="presentation"`.

**Link Text (WCAG 2.4.4):**

```bash
$PW -s=a11y eval '() => Array.from(document.querySelectorAll("a")).filter(a => ["click here", "here", "read more", "learn more", "", "link"].includes((a.textContent || "").trim().toLowerCase())).map(a => ({ href: a.href, text: (a.textContent || "").trim(), ariaLabel: a.getAttribute("aria-label") }))'
```

Flag generic link text ("click here", "read more", empty links without aria-label).

**Form Labels (WCAG 1.3.1, 4.1.2):**

```bash
$PW -s=a11y eval '() => Array.from(document.querySelectorAll("input,select,textarea")).map(el => ({ type: el.type, name: el.name, id: el.id, hasLabel: !!el.id && !!document.querySelector(`label[for="${el.id}"]`), ariaLabel: el.getAttribute("aria-label"), ariaLabelledBy: el.getAttribute("aria-labelledby"), placeholder: el.placeholder }))'
```

Verify: every form control has an associated `<label>`, `aria-label`, or `aria-labelledby`.

**Language Attribute (WCAG 3.1.1):**

```bash
$PW -s=a11y eval '() => ({ htmlLang: document.documentElement.lang, htmlDir: document.documentElement.dir })'
```

Verify: `<html>` has a valid `lang` attribute.

**WCAG 2.2 additions (all Level AA; axe does not settle them):** run each at a
phone viewport (`$PW -s=a11y resize 390 844`) and at desktop width.

Target Size (2.5.8) — list controls under 24×24 CSS px:

```bash
$PW -s=a11y eval '() => [...document.querySelectorAll("a[href],button,input,select,textarea,[role=button],[role=link],[tabindex]")].filter(el => el.tabIndex >= 0 && el.type !== "hidden").map(el => { const r = el.getBoundingClientRect(); return { el: el.tagName.toLowerCase() + (el.id ? "#" + el.id : ""), label: (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height), inline: getComputedStyle(el).display === "inline" }; }).filter(t => t.w > 0 && (t.w < 24 || t.h < 24))'
```

Each hit fails unless an exception holds: a 24px-diameter circle centered on it touches
no other target (spacing), an equivalent control elsewhere on the page meets the size,
it sits inline in a sentence, or the browser draws it unstyled.

Focus Not Obscured (2.4.11) — after each Tab press in Phase 3a, with sticky headers,
footers, cookie banners, and chat launchers visible:

```bash
$PW -s=a11y eval '() => { const el = document.activeElement; const r = el.getBoundingClientRect(); const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 2, r.top + 2], [r.right - 2, r.bottom - 2]]; const covered = pts.filter(([x, y]) => { const hit = document.elementFromPoint(x, y); return hit && hit !== el && !el.contains(hit); }).length; return { el: el.tagName + (el.id ? "#" + el.id : ""), covered: covered + "/3" }; }'
```

`3/3` is a fail (the focused control is entirely hidden; F110). Fix with
`scroll-padding-top` / `scroll-padding-bottom` equal to the sticky bar's height (C43).

Dragging Movements (2.5.7) — `rg -n "draggable|onDrag|useDrag|dnd-kit|Sortable|swipe" src`;
every drag or swipe action needs a single-tap alternative (buttons, menu, arrows).

Accessible Authentication (3.3.8) — on each sign-in and sign-up page:

```bash
$PW -s=a11y eval '() => [...document.querySelectorAll("input[type=password],input[autocomplete=one-time-code]")].map(i => ({ name: i.name, autocomplete: i.getAttribute("autocomplete"), pasteBlocked: i.hasAttribute("onpaste") }))'
```

Pass: `autocomplete` is `current-password` / `new-password` / `one-time-code`, paste is
not blocked (also `rg -n "onPaste.*preventDefault" src`), and any CAPTCHA has a
non-puzzle alternative.

Native shells (Capacitor, Expo, RN): the font-scale, reduced-motion, and back probes run
on a device in `mobile-emulator-test`; record them here as their own rows.

### 2d. Take Evidence Screenshots

For each page, capture a screenshot as visual evidence:

```bash
$PW -s=a11y screenshot --filename ".playwright-mcp/a11y-<route>.png"
```

---

## Phase 3: Keyboard Navigation Testing

### 3a. Tab Order Test

For each page, test that all interactive elements are reachable via Tab key:

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=a11y open --headed "<APP_URL><ROUTE>"    # first page; use `goto` for subsequent ones
```

Press Tab repeatedly and snapshot after each press to track focus movement:

```bash
$PW -s=a11y press Tab
$PW -s=a11y snapshot
```

After each Tab, check:
- [ ] Focus is visible (there is a focus indicator on the active element)
- [ ] Focus order is logical (follows visual reading order)
- [ ] No focus trap (Tab eventually cycles back to the beginning or reaches the end)
- [ ] Skip links exist (if there is a large navigation area)

Keep pressing Tab until focus has visited every interactive element on the page or cycled back to the first one; stop early only when a focus trap is found, and record it.

### 3b. Interactive Element Testing

For each interactive component (dropdowns, modals, tabs, accordions):

**Enter/Space activation (WCAG 2.1.1):**
- Tab to the element
- Press Enter or Space
- Verify the action fires (snapshot to confirm state change)

**Escape to close (WCAG 2.1.1 for modals/dialogs):**

```bash
$PW -s=a11y press Escape
```

Verify: modals/dropdowns close, focus returns to the trigger element.

**Arrow key navigation (for tab panels, menus, listboxes):**

```bash
$PW -s=a11y press ArrowDown
```

### 3c. Focus Management After State Changes

Test that focus is managed correctly after dynamic updates:
- After opening a modal: focus should move into the modal
- After closing a modal: focus should return to the trigger
- After deleting an item from a list: focus should move to the next item or a logical location
- After form submission: focus should move to a success/error message

---

## Phase 4: Cross-Check with Sentry

### 4a. Search for Assistive Technology Errors

```json
sentry:search_issues
{
 "organizationSlug": "<ORG_SLUG>",
 "projectSlugOrId": "<PROJECT_SLUG>",
 "query": "is:unresolved aria OR screenreader OR voiceover OR talkback OR nvda OR jaws OR focus OR tabindex OR keyboard"
}
```

### 4b. Check for JavaScript Errors on Keyboard Interaction

```json
sentry:search_issues
{
 "organizationSlug": "<ORG_SLUG>",
 "projectSlugOrId": "<PROJECT_SLUG>",
 "query": "is:unresolved keydown OR keyup OR keypress OR focusin OR focusout"
}
```

### 4c. Browser/Device Breakdown

If errors cluster on AT-favored browsers, pull the browser distribution for the issue. `get_issue_tag_values` is a catalog tool, not a direct one, so call it through `execute_sentry_tool`. If the call is rejected, run `search_sentry_tools` with `"issue tag values"` to get the current name and schema.

```json
sentry:execute_sentry_tool
{
 "name": "get_issue_tag_values",
 "arguments": {
  "organizationSlug": "<ORG_SLUG>",
  "issueId": "<ISSUE_ID>",
  "tagKey": "browser"
 }
}
```

---

## Phase 5: Static Code Analysis

### 5a. Missing ARIA Attributes

```
Grep(pattern: "onClick(?!.*role=)(?!.*tabIndex)", glob: "*.{tsx,jsx}")
```

Flag `div` or `span` elements with click handlers but no `role` or `tabIndex` — these are invisible to keyboard and screen reader users.

### 5b. Inaccessible Custom Components

```
SemanticSearch(query: "Where are custom interactive components defined (dropdowns, modals, tabs, accordions) that don't use a component library?", target_directories: [])
```

Check each custom interactive for:
- Proper ARIA roles (`role="dialog"`, `role="tabpanel"`, etc.)
- Keyboard event handlers (`onKeyDown`)
- Focus management (`useRef` + `.focus()`)
- ARIA states (`aria-expanded`, `aria-selected`, `aria-hidden`)

### 5c. Color Contrast in CSS/Tailwind

```
Grep(pattern: "text-gray-[345]|text-slate-[345]|text-zinc-[345]|text-neutral-[345]|color:\\s*#[789abc]", glob: "*.{tsx,jsx,css,scss}")
```

Light gray text on white background is the most common contrast failure. Flag files using light gray text colors for manual contrast checking.

---

## Phase 6: Report

```
═══════════════════════════════════════════════════════
 WCAG 2.2 ACCESSIBILITY AUDIT REPORT
 Project: <PROJECT_NAME>
 Date: <DATE>
 Standard: WCAG 2.2 Level AA
 Pages Tested: <COUNT>
═══════════════════════════════════════════════════════

## 1. EXECUTIVE SUMMARY

| Metric | Result |
|---------------------------|-----------------|
| Pages tested | X |
| Total violations | N |
| Critical violations | N |
| Serious violations | N |
| Level A criteria failed / checked | N / M |
| Level AA criteria failed / checked | N / M |
| axe-core rules passed | N |
| Keyboard navigable pages | X/Y |

## 2. AXE-CORE SCAN RESULTS (per page)

| Page | Critical | Serious | Moderate | Minor | Pass | Worst level failed (A / AA / none) |
|------|----------|---------|----------|-------|------|------|
| / | ... | ... | ... | ... | ... | A / AA / none |
| /about | ... | ... | ... | ... | ... | A / AA / none |

## 3. VIOLATIONS BY WCAG CRITERION

| WCAG SC | Name | Level | Pages Affected | Elements | Impact | Status |
|---------|------|-------|----------------|----------|--------|--------|
| 1.1.1 | Non-text Content | A | ... | ... | ... | PASS/FAIL |
| 1.3.1 | Info and Relationships | A | ... | ... | ... | PASS/FAIL |
| 1.4.3 | Contrast (Minimum) | AA | ... | ... | ... | PASS/FAIL |
| 2.1.1 | Keyboard | A | ... | ... | ... | PASS/FAIL |
| 2.4.3 | Focus Order | A | ... | ... | ... | PASS/FAIL |
| 2.4.4 | Link Purpose | A | ... | ... | ... | PASS/FAIL |
| 2.4.7 | Focus Visible | AA | ... | ... | ... | PASS/FAIL |
| 2.4.11 | Focus Not Obscured (Minimum) | AA | ... | ... | ... | PASS/FAIL |
| 2.5.7 | Dragging Movements | AA | ... | ... | ... | PASS/FAIL |
| 2.5.8 | Target Size (Minimum) | AA | ... | ... | ... | PASS/FAIL |
| 3.1.1 | Language of Page | A | ... | ... | ... | PASS/FAIL |
| 3.3.8 | Accessible Authentication (Minimum) | AA | ... | ... | ... | PASS/FAIL |
| 4.1.2 | Name, Role, Value | A | ... | ... | ... | PASS/FAIL |

## 4. KEYBOARD NAVIGATION

| Page | Tab Order Logical | Focus Visible | No Focus Trap | Skip Link | Worst level failed |
|------|-------------------|---------------|---------------|-----------|-------|
| / | ... | ... | ... | ... | A / AA / none |

## 5. INTERACTIVE COMPONENTS

| Component | Location | ARIA Roles | Keyboard Operable | Focus Managed | Worst level failed |
|-----------|----------|------------|-------------------|---------------|-------|
| Modal | ... | ... | ... | ... | A / AA / none |
| Dropdown | ... | ... | ... | ... | A / AA / none |

## 6. SENTRY ASSISTIVE TECHNOLOGY ERRORS

| Issue | Error Type | Events | Browser/AT | Fix Needed |
|-------|------------|--------|------------|------------|
| ... | ... | ... | ... | ... |

## 7. STATIC CODE FINDINGS

| Pattern | Files | Count | Risk |
|---------|-------|-------|------|
| onClick without role/tabIndex | ... | N | High |
| Custom interactive without ARIA | ... | N | High |
| Low-contrast text classes | ... | N | Medium |

## 8. CRITICAL FINDINGS (Action Required)

P0 — Level A violations (legal risk):
1. [finding with WCAG SC, element, page, evidence]

P1 — Level AA violations (compliance gap):
1. [finding with WCAG SC, element, page, evidence]

P2 — Best practice improvements:
1. [finding with rationale]

## 9. RECOMMENDATIONS

| # | WCAG SC | Current | Recommended | Effort | Files to Change |
|---|---------|---------|-------------|--------|-----------------|
| 1 | ... | ... | ... | S/M/L | ... |

═══════════════════════════════════════════════════════
```
