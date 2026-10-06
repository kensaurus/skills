# UX journeys & IA audit — detailed methods

Per-phase detection commands, pass/fail signals, and method notes for `audit-ux-journeys`.
Sources: 2026 practitioner consensus (data-over-taste, trigger-scoped audits, IA findability,
task-completion walkthroughs, impact×effort prioritization).

## Contents

- Phase 0 — Story derivation
- Phase 1 — IA checks in detail
- Phase 2 — Walkthrough method
- Phase 3 — Evidence layer method
- Phase 4 — Prioritization method
- Delegation map (don't double-count)


---

## Phase 0 — Story derivation

### Route inventory by framework
```bash
# Next.js App Router
fd -H 'page\.(tsx|jsx)' app/ src/app/ | sed 's|/page\..*||' | sort
# Next.js Pages Router / Nuxt / SvelteKit / Remix
fd -H . pages/ src/pages/ src/routes/ -t f -e tsx -e jsx -e vue -e svelte 2>/dev/null
# SPA route config
rg -n "path:\s*['\"]|createBrowserRouter|<Route" -g '*.{ts,tsx,js,jsx}'
```

### Story quality bar
- Max 5–10 stories; each core to the product's promise (from landing CTAs, README, pricing page).
- Each has an **observable completion signal** (order confirmation rendered, file downloadable,
  invite email in outbox) — "user is happy" is not a signal.
- Reuse existing inventories first: `design-prd` outputs, `plan-test-coverage` story matrix,
  `.cursor/` plan files. Same stories, different lens — divergence between inventories is itself
  a finding.
- Persona detail only where it changes the audit: auth state (guest vs returning), device
  (mobile-first products), and skill level are the usual splits that matter.

### Trigger scoping notes
- **KPIs dropping:** get the specific KPI and date range; check `git log` around the inflection
  for shipped changes; audit only the affected funnel first.
- **Complaints:** cluster support tickets/reviews into themes; each theme becomes a hypothesis
  walked in Phase 2. Complaints are hypotheses, not verdicts.
- **Pre-launch:** no behavioral data exists — run walkthroughs of the 3 riskiest flows (signup,
  onboarding, money path) and label every finding `[judgment]`. State this limitation in the
  report header.

---

## Phase 1 — IA checks in detail

### IA1 — Click depth
Method: from the route tree + nav links, compute shortest click path from `/` to each story's
destination. Browser-verify the top 3 stories (menus can hide links that exist in code).
- **Pass:** core-story targets ≤3 clicks; money paths ≤2.
- **Red flag:** revenue/conversion pages 4+ deep; critical action only reachable via settings.

### IA2 — Orphan pages
```bash
# All internal link targets
rg -oN "href=[\"']/([^\"'#?]*)" -g '*.{tsx,jsx,vue,svelte,html}' -r '/$1' | sort -u > /tmp/linked.txt
# Compare against route inventory — routes never linked are orphans
```
- **Pass:** every route reachable via nav/link chain (or intentionally unlisted: legal, deep-links
  from email — record as exceptions).
- **Red flag:** feature pages with zero inbound links — the feature effectively doesn't exist.

### IA3 — Dead ends
Method: for each route, check for forward affordances (primary CTA, related links, next-step).
```bash
rg -L -n "success|thank|complete|done" -g '*{page,Success,Confirmation}*' # then inspect for next-step CTA
```
- **Red flag:** success/confirmation pages with no "what's next"; empty states with no action
  (also hand to `audit-ux` H9); 404 without a route home.

### IA4 — Label consistency
```bash
# Nav labels vs page titles vs H1s — extract and diff
rg -n "<(title|h1)|title:|headline" -g '*.{tsx,jsx,vue,svelte}' | rg -i "[A-Z]"
```
- **Pass:** nav label, page `<title>`, and H1 agree (± minor casing); one concept = one word
  product-wide (pick "Billing" *or* "Payments", never both).
- **Red flag:** synonyms across surfaces; internal jargon in labels (module names leaking to nav).

### IA5 — Grouping vs mental model
Method (expert judgment — tag accordingly): list nav groups; ask "would a first-time user look
here for X?" for each story target. Card-sort logic without the card sort: group by user *task*
(Buy, Manage, Learn) not by implementation (Entities, Admin, Misc).
- **Red flag:** a "Miscellaneous"/"Other" group; groups mirroring the DB schema or team structure;
  one group with 12 items next to three groups with 1.

### IA6 — First-click logic (browser)
Method: land on `/` cold, per story ask "what would a user click first?" — then check that click
actually leads down the story's shortest path. First-click correctness is the strongest single
predictor of task success in tree-testing literature.
- **Red flag:** correct first click is in a hamburger/footer while a prominent decoy leads away.

### IA7 — Wayfinding
- Breadcrumbs on hierarchies ≥3 deep; current nav item highlighted (`aria-current="page"` or
  active state); page titles update per route (`document.title`).
```bash
rg -n -i "breadcrumb|aria-current" -g '*.{tsx,jsx,vue,svelte}' -l
```

### IA8 — Search & filtering
- Present for large sets (>~50 items); persists across pagination; filter state in URL (shareable,
  survives refresh).
- **Red flag:** filters reset on back-navigation; search with no empty-state guidance.

### IA9 — URL sanity
- Human-readable slugs for content; hierarchy mirrors IA; state that users would share/bookmark
  lives in the URL.
- **Red flag:** wizard step or selected tab lost on refresh; UUID-only URLs for shareable content.

---

### IA10–IA12 — Mobile IA (native apps only)

```bash
# Tab destinations and how the bar is drawn
rg -n "NativeTabs|createBottomTabNavigator|<Tabs|ion-tab-button|position: ?'absolute'.*bottom: ?0" -g "*.{tsx,ts,html}"
# Long pages and sheets
rg -n "<ScrollView|<FlatList|<FlashList|BottomSheet|ion-modal|presentation: ?'formSheet'" -g "*.{tsx,ts,html}" -c
```

- **IA10** — count destinations; 3–5 passes, a "More" tab or 6+ fails. Bar visible on every
  section screenshot (modals excepted). Source: HIG Tab bars.
- **IA11** — on the home screenshot count cards above the fold and primary CTAs; ≤5 cards and
  one CTA passes. Secondary content behind a sheet, segmented control, or second screen.
  Source: NN/g progressive disclosure.
- **IA12** — walk one filter and one confirm flow; a sheet that keeps the list visible passes,
  a full-page push for ≤2 fields fails.
- Fix owner for all three: `enhance-mobile-native-feel`.

## Phase 2 — Walkthrough method

- **Anti-stall first:** apply `protocol-browser-anti-stall` on every step; screenshots go to
  `.playwright-mcp/` named `story-<n>-step-<m>-<viewport>.png`.
- **Two viewports minimum:** 1280px and 390px. Most real-world friction (tap targets, undismissable
  modals, forms) is mobile-only.
- **Count honestly:** steps = clicks + field inputs + scrolls-to-find. Compare against a sane
  target for the story class (checkout ≤5 steps, signup ≤3, find-info ≤3 clicks).
- **Friction taxonomy** (log each occurrence): hesitation (nothing obviously clickable), mislabel
  (clicked the wrong thing because the label lied), backtrack (had to go back), surprise (result
  didn't match expectation), stall (waiting with no feedback — also `audit-ux` H1).
- **Error-recovery probes per story:** enter one invalid input (is the message specific + inline?);
  press browser Back mid-flow (data preserved?); refresh mid-flow (state survives?); for money
  paths, attempt double-submit (also `audit-resilience`/`audit-payment-system` territory — link,
  don't duplicate).
- **BLOCKED protocol:** a story that cannot be completed is a **Blocker** severity finding with a
  screenshot and the exact step — the single most important output of the audit.

---

## Phase 3 — Evidence layer method

### Analytics detection & use
| Found | Use for |
|---|---|
| GA4 / gtag | funnel + drop-off per story path, top exits, device split |
| PostHog / Amplitude / Mixpanel | funnels, retention, rage-click autocapture (PostHog) |
| MS Clarity / Hotjar | heatmaps, dead/rage clicks, session replays for friction validation |
| Plausible / Umami / Fathom | page-level entries/exits only (no funnels) — partial evidence |
| Sentry | error hotspots along the story path (a JS error mid-checkout is a UX finding) |

Rules:
- Cross at least two signals before upgrading a finding to `[data]` (e.g. funnel drop + replay).
- A walkthrough finding *contradicted* by data gets downgraded, not hidden — record both.
- No access to dashboards? Ask the user once for exports/screenshots; otherwise stay `[observed]`.

### No-data recommendation template
Minimal instrumentation as a roadmap item: page views + one funnel per core story (entry,
mid-step, completion signal) + error tracking on the money path. Delegate implementation to
`backend-observability` / the analytics tool's docs. This makes the *next* audit evidence-based.

---

## Phase 4 — Prioritization method

- **Impact:** does the finding sit on a revenue/activation story (High), a secondary story
  (Medium), or a rarely-walked path (Low)? Data trumps guesswork when available.
- **Effort:** copy/label/link fixes = Low; layout/flow restructure = Medium; IA regroup or route
  redesign = High.
- **Quadrants:** High-impact/Low-effort → *Quick wins* (ship this week). High/High → *Roadmap*.
  Low impact → *Deprioritized* regardless of ease (fixing easy-but-irrelevant things is audit
  theater).
- **Blockers bypass the grid** — a story that cannot be completed is first in line, always.
- **Report hygiene:** number findings; one observation + one recommendation each; ≤1 paragraph;
  annotated screenshot for the top findings; always include the "working well" section (readers
  accept criticism better, and it protects strengths from being "fixed" away).

---

## Delegation map (don't double-count)
| Concern | Owner |
|---|---|
| Per-page heuristics, microcopy, emotional design | `audit-ux` |
| Single-screen layout/UX fixes | `enhance-web-ux` |
| Field-level form design & validation UX | `enhance-web-forms` |
| WCAG / assistive tech | `audit-accessibility` |
| Load speed / CWV (a UX factor, separate lens) | `audit-performance` |
| Visual tokens / components / dark mode | `audit-uiux-design-system` |
| Feature parity vs reference apps | `audit-realworld` |
| Story inventory for tests | `plan-test-coverage` |
| Double-submit / idempotency on money paths | `audit-resilience`, `audit-payment-system` |
