---
name: audit-ux-journeys
description: >
  Cross-page UX audit of user stories, task completion, and IA. Use when "audit
  user flows", "IA audit", "can users find X", "navigation audit", or "funnel
  drop-off". Per-page heuristics → audit-ux.
license: MIT
effort: high
---

# audit-ux-journeys — User-Story, Task-Completion & IA Audit

**Degree of freedom: MIXED** — Story derivation, IA, and evidence tags
`[HIGH freedom]`; Phase 2 headed walkthrough `[LOW freedom — run exactly]`.

A site can pass every per-page heuristic and still fail: pages clean, yet nobody
can *find* the feature, checkout takes nine steps with two dead ends, and nav
follows the database schema. `audit-ux` judges **pages**; this skill judges
**paths and structure**.

A UX audit is **not personal taste**. Derive stories from
the product, walk the journeys, audit IA against mental models, and ground
findings in behavioral evidence when it exists. Pre-launch: qualitative
walkthroughs, *labeled as assumptions*.

**Before ANY browser interaction, read `protocol-browser-anti-stall` and apply
its rules to every step.**

> **Report-first.** Prioritized audit, then delegate: per-page heuristics/
> microcopy → **`audit-ux`** · single-screen → **`enhance-web-ux`** · forms →
> **`enhance-web-forms`** · WCAG → **`audit-accessibility`** · speed →
> **`audit-performance`** · feature parity → **`audit-realworld`**. Owns the
> *cross-page journey and IA* layer.

---

## Core principle — stories over pages, data over taste

- **The unit of audit is a story, not a screen.** Every finding attaches to a
  user story and a step in its path.
- **Derive stories from the product, not imagination.** Routes, nav, CTAs,
  README, marketing copy, existing PRDs.
- **Evidence or hypothesis — say which.** Tag `[data]`, `[observed]`, or
  `[judgment]`. Presenting `[judgment]` as `[data]` is the cardinal sin.
- **Findable beats beautiful.** Depth, labels, and grouping vs the *user's*
  mental model, not the module layout.
- **Prioritize by impact × effort.** Slow checkout beats a slow About page.

## How to reason — Observe → Interpret → Classify → Severity

1. **Observe** — quote the story, the step, the route/nav evidence, and the walkthrough or funnel number
2. **Interpret** — can the persona complete the claimed task, and is the next click obvious?
3. **Classify** — COMPLETED / COMPLETED-WITH-FRICTION / BLOCKED; evidence tag `[data]` / `[observed]` / `[judgment]`
4. **Severity** — Blocker = cannot complete; then impact × effort. A "confusing" page with 95% pass-through is not Critical

## Worked example

> **Observe:** Story "As a returning customer I want to reorder — done when
> confirmation shows." Desktop: 7 clicks; cart cleared on refresh at step 3.
> Mobile 390: hamburger does not open; pricing unreachable. No analytics SDK.
> **Interpret:** mobile cannot start the story; desktop completes with data-loss
> friction. Nothing to upgrade the evidence tag.
> **Classify:** BLOCKED (mobile nav) + COMPLETED-WITH-FRICTION (desktop cart).
> Evidence: `[observed]`.
> **Severity:** Blocker for mobile findability; High for cart-loss.
> **Finding:** Checkout loses cart on refresh | Blocker | observed | buy §3 |
> High × Med | debug-error → enhance-web-ux

---

## Phase 0 — Derive the stories and scope the trigger  [HIGH freedom]

### 0a. Extract user stories from the real product

```bash
# Route inventory (framework-appropriate)
fd -H 'page\.(tsx|jsx|vue|svelte)' app/ src/app/ 2>/dev/null; fd -H . src/routes pages 2>/dev/null -t f
# Navigation + entry points
rg -n -i "<nav|navbar|sidebar|menu|Link.*href|routerLink|to=\"/" -g '*.{tsx,jsx,vue,svelte}' -l
# What the product promises (CTAs, marketing verbs)
rg -n -i "get started|sign up|buy|checkout|create|upload|invite|export|book|order|subscribe" -g '*.{tsx,jsx,vue,svelte,md}'
# Existing story sources — reuse, don't re-invent
fd -H -i 'prd|user-stor|journey|persona' docs/ .cursor/ 2>/dev/null
```

Write 5–10 stories max, each with a **completion signal**:
`As [persona], I want [goal] — done when [observable outcome]`. If `design-prd`
output or `plan-test-coverage` story inventory exists, start from it.

### 0b. Scope by audit trigger (sets depth and method)

| Trigger | Method emphasis |
|---|---|
| **KPIs dropping** | Targeted: the affected funnel only; cross-validate with data; check recent changes |
| **Complaints rising** | Thematic: cluster complaints → walk those stories first; treat complaints as hypotheses |
| **Redesign planned** | Comprehensive: all stories + full IA; findings shape the redesign |
| **Pre-launch / no data** | Qualitative walkthroughs of critical flows (signup, onboarding, checkout); **label all findings `[judgment]`** |
| **"Just optimize"** | Holistic roadmap: start at highest-impact stories, surface UX debt |

---

## Phase 1 — Information architecture & navigation audit (structural)  [HIGH freedom]

Build the route tree, then audit structure against findability. Detailed commands
and pass/fail signals in [references/checklist.md](references/checklist.md).

| # | Check | Red flag |
|---|---|---|
| IA1 | **Click depth per story target** — core-story destinations reachable in ≤3 clicks from landing | Money pages buried 4+ clicks deep |
| IA2 | **Orphan pages** — every route reachable from some nav/link path | Routes with zero inbound links (exist only by URL) |
| IA3 | **Dead ends** — every page offers a forward action | Pages with no CTA/next step (journey stalls) |
| IA4 | **Label consistency** — nav label ≈ page title ≈ H1; same concept = same word everywhere | "Billing" in nav → "Payments" title → "Invoices" H1 |
| IA5 | **Grouping vs mental model** — nav organized by user tasks/goals | Organized by DB schema or team org chart |
| IA6 | **First-click logic** — for each story, the correct first click from the landing page is the *obvious* one | Correct path requires insider knowledge |
| IA7 | **Wayfinding** — breadcrumbs in hierarchies ≥3 deep; current location highlighted | User can't answer "where am I?" |
| IA8 | **Search & filtering** — present and functional for large content/data sets | 200 items, no search; filter resets on nav |
| IA9 | **URL sanity** — URLs human-readable, hierarchical, shareable | Opaque ids everywhere; state lost on refresh |
| IA10 | **Mobile destinations** (native apps) — 3–5 tab destinations, one-word labels, bar visible in every section | 6+ tabs, a "More" tab, or a hamburger drawer as the only nav |
| IA11 | **One question per screen** (mobile) — home shows ≤5 cards and one primary action; the rest is progressive disclosure | Long page, three CTAs above the fold, everything on the home screen |
| IA12 | **Sheet vs page** (mobile) — filters, pickers, confirmations open as sheets and keep context | Full-page detour for a two-field task; back-stack grows per filter |

Verdicts: `Pass / Fail / N-A` with `file:line` or route evidence. IA6 requires the browser (Phase 2). IA10–IA12 apply to native mobile apps (Expo / RN / Capacitor); mark `N-A` on web.

## Phase 2 — Story-by-story task walkthroughs (headed browser)  [LOW freedom — run exactly]

Walk **every** story from Phase 0, entry → completion signal, desktop **and**
mobile viewport (390px — most real friction is mobile). Per story record:

```
STORY: [As … I want … — done when …]     Trigger tag: [data|observed|judgment]
Entry: [landing/deep-link]   Steps to goal: N clicks / M inputs
Friction log: [each hesitation, mislabel, backtrack, surprise — with screenshot]
Error recovery: [wrong input / back button / refresh mid-flow — data survives? path recoverable?]
Success moment: [is completion confirmed clearly? what happens next?]
Result: COMPLETED / COMPLETED-WITH-FRICTION / BLOCKED (blocker = finding, severity Blocker)
```

Rules: screenshots to `.playwright-mcp/` per `protocol-browser-anti-stall` §9 (Artifacts); forms
judged only for flow-level friction (field-level → `enhance-web-forms`);
per-page heuristic violations noticed along the way are *handed to* `audit-ux`,
not re-audited here.

## Phase 3 — Evidence layer (validate or label)  [HIGH freedom]

```bash
# What analytics exist?
rg -n -i "gtag|googletagmanager|G-[A-Z0-9]{6,}|posthog|clarity\.ms|hotjar|amplitude|mixpanel|plausible|umami|fathom" -g '*.{ts,tsx,js,jsx,html,vue,svelte}' -l
```

- **Data available** (GA4/PostHog/Clarity/Amplitude/Mixpanel, or Sentry for error
  hotspots): pull funnel completion and drop-off per story path, top exit pages,
  rage-click/dead-click signals. Upgrade or *refute* walkthrough findings — a
  "confusing" page with a 95% pass-through rate is not a Critical finding.
- **No data** (typical pre-launch): every finding stays `[observed]` or
  `[judgment]`. Say so in the report, and recommend minimal instrumentation
  (page + funnel events on core stories) so the *next* audit has evidence.

## Phase 4 — Prioritized report  [HIGH freedom]

```markdown
## UX Journey & IA Audit — [product] — [date]
**Trigger:** [scenario] · **Stories audited:** N · **Evidence:** [analytics available? which]
**Working well:** [1–3 genuine strengths — always present]

### Task-completion matrix
| Story | Result | Steps | Frictions | Blockers | Evidence |
|---|---|---|---|---|---|
| Reorder as returning customer | COMPLETED-WITH-FRICTION | 7 (target ≤4) | 3 | – | [observed] |
| Find pricing from landing | BLOCKED (mobile) | – | – | menu unreachable | [observed] |

### IA verdicts (IA1–IA9)
| Check | Verdict | Evidence |
|---|---|---|

### Findings (each: severity · evidence tag · story · impact×effort quadrant)
| # | Finding | Severity | Evidence | Story/step | Impact | Effort | Fix via |
|---|---|---|---|---|---|---|---|
| 1 | Checkout loses cart on refresh at step 3 | Blocker | observed | buy §5 | High | Med | debug-error → enhance-web-ux |

### Quick wins (high impact · low effort — do first)
### Roadmap (high impact · high effort)
### Deprioritized (low impact — listed, not scheduled)
### Validate next (all [judgment] findings + the instrumentation to settle them)
```

Language discipline: neutral, behavior-grounded observations ("3 of 5
walkthrough runs backtracked at X"), never accusatory. One observation per
finding, in the length the evidence needs.

**Forbidden:** presenting `[judgment]` as data; re-auditing per-page
heuristics/microcopy that `audit-ux` owns; inventing personas unmoored from the
product; recommending a full redesign when incremental fixes close the findings;
a findings dump with no impact×effort prioritization; only-negatives reports
(name what works); auditing without walking the stories (a route-tree grep
alone is not a journey audit).

---

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Walked, not grepped** — every story has an entry → completion (or BLOCKED) record
2. **Evidence tagged** — `[judgment]` is never presented as `[data]`
3. **Artifacts** — screenshots under `.playwright-mcp/`
4. **Right owner** — per-page heuristics → `audit-ux`; forms → `enhance-web-forms`; breakpoint layout → `audit-responsive`
5. **Nothing implemented** — report-first; delegate fixes

## Related

- `audit-responsive` — page-level layout/IA at 375 / 768 / 1440 (this skill is cross-page stories)
- `audit-ux` — per-page NN/g heuristics, Laws of UX, microcopy, emotional design (the page lens to this skill's path lens)
- `enhance-web-ux` / `enhance-web-forms` — fix the screens and forms this audit flags
- `enhance-mobile-native-feel` — fix IA10–IA12 and the rest of a web-shaped mobile app in one pass
- `audit-uiux-design-system` — visual token/component compliance
- `audit-accessibility` / `audit-performance` — WCAG and speed lenses (delegated)
- `audit-realworld` — full-stack feature parity vs the RealWorld reference
- `plan-test-coverage` — same story inventory, test-coverage lens; share Phase 0 output
- `design-prd` — where stories come from on greenfield; this skill audits them post-build
- `test-playwright` — turn walkthroughs into regression coverage after fixes
- `complete-everything` — close the audited gaps to done with verification
