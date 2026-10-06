---
name: plan-gtm
description: >
  Plan-only GTM audit: monetization, positioning, activation funnel, SEO/AEO,
  distribution, and a founder interview. Use when "GTM", "go-to-market", "get
  more users", "grow traffic", or "should this be freemium". Execute →
  workflow-gtm.
license: MIT
effort: high
---

# plan-gtm — Go-to-market audit + interview + plan

**Degree of freedom: MIXED.** Repo inventory greps and the interview rules
`[LOW freedom — run exactly]`; positioning, model fit, and channel choice
`[HIGH freedom]`. Stay **plan-only**: no copy, pricing, route, or license edits
until the founder approves a phase.

**Role:** Growth lead who reads code. The repo already tells you how the
product is sold; the founder tells you who it is for and what "growth" means
this quarter. Neither alone is a strategy.

**Task:** Inventory the repo, interview the founder, diagnose the gap between
how the product is marketed and how it should be, emit `plan-gtm.md` with a
phased burndown mapped to execution skills. **Change nothing until approved.**

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **plan-gtm** (this) | Strategy: who, why-us, how-paid, which channels, what to measure |
| `workflow-gtm` | Executes the approved phases in order |
| `plan-pricing` | Value metric, tiers, price points — after this skill picks the model |
| `enhance-web-conversion` | Hero, pricing page, upgrade prompts (apply) |
| `enhance-onboarding` | First-session activation (apply) |
| `enhance-lifecycle-email` / `enhance-growth-loops` | Nudges and loops (apply) |
| `docs-launch-kit` / `docs-comparison-pages` | Launch posts; "X vs Y" pages (apply) |
| `audit-registry-listing` | README / npm / GitHub surface for repo-as-product |
| `iterate-gtm-weekly` | The weekly loop after Phase 4 |
| `enhance-web-seo` / `plan-aeo-readiness` | Classic search / AI-engine citation |
| `audit-analytics` | Whether the funnel is instrumented at all |
| `plan-aso` | App Store / Play listing (mobile) |
| `design-prd` | What to build next — not how to sell what exists |
| `workflow-grilling` | Generic interview; this skill uses its rules on GTM questions |

Do **not** fire for "write the landing page" (→ `enhance-web-landing`) or
"why is my SEO bad" alone (→ `enhance-web-seo`).

## How to reason (every finding)

1. **Observe** — quote the file, route, or copy that shows how the product is sold today
2. **Interpret** — what a first-time visitor and a first-time user actually experience
3. **Classify** — positioning / model / activation / discoverability / distribution / measurement
4. **Decide** — keep, tune, or switch; one execution skill; one metric that proves it

## Worked example

> **Observe:** `LICENSE` is MIT; `README` hero says "145 skills"; `/pricing`
> route absent; `posthog.init` in `layout.tsx`; no `activated` event; 3.6k npm
> downloads, 9 GitHub stars.
> **Interpret:** free forever with no ask; visitors count features, not
> outcomes; installs happen, nobody comes back or bookmarks.
> **Classify:** positioning (feature-count hero) + measurement (no activation
> event) + distribution (install ≠ retained).
> **Decide:** tune — lead the hero with the completion-gate outcome
> (`enhance-web-conversion`); define `activated` = first skill run in a real
> repo (`enhance-onboarding` + `audit-analytics`); monetization stays free
> until activation is measured. Metric: activated installs / week.

## Self-critique before the burndown  [LOW freedom — do not skip]

1. **evidenced-not-assumed** — every inventory row cites file:line, a route, or a
   number the founder supplied; "unmeasured" is written where no number exists
2. **decisions-are-theirs** — monetization model, license, ICP, and budget came
   from the interview log in the founder's words, not from your recommendation
3. **one-metric** — the plan names one north-star and one activation event
4. **two-channels-max** — no plan lists five channels; each carries its caveat
5. **plan-only** — no copy, pricing, route, robots, or license edits
6. **honest-growth** — no fake scarcity, upvote rings, fabricated testimonials,
   or analytics before consent anywhere in the plan
7. **right-owner** — each phase hands to exactly one execution skill

---

## Step A — Repo inventory  [LOW freedom — run exactly]

Grep before you ask. Record evidence per row.

| Area | Signals to grep / open | What it tells you |
|---|---|---|
| **Monetization** | `stripe`, `paddle`, `lemonsqueezy`, `polar`, `revenuecat`, `react-native-purchases`; `/pricing` route; `plan\|tier\|isPro\|premium\|entitlement\|paywall\|subscription`; `FUNDING.yml`, sponsor links; `ee/` or `enterprise/`; `docker-compose` + self-host docs | free / freemium / trial (opt-in vs card) / usage / open-core / hosted / donation |
| **License** | `LICENSE` header: MIT/Apache vs AGPL vs BSL/FSL/Elastic | permissive = adoption play; AGPL + commercial = open-core; source-available = cloud-defence, not OSI |
| **Positioning** | README H1 + first paragraph; landing `<h1>`; `<title>`, meta description, OG title | outcome vs feature-count; who it names; category it claims |
| **ICP signals** | docs audience, i18n locales, currencies, example data, screenshots | who the product already assumes |
| **Activation path** | `/signup`, `/login`, auth providers (OAuth / magic link / password); `onboarding`, `welcome`, `getting-started`, `checklist`, `sample`, `template`, `empty` states; steps between landing and first value | time-to-value in steps; signup wall before any value? |
| **Analytics** | `posthog`, `@amplitude`, `mixpanel`, `gtag`, `plausible`, `umami`, `@vercel/analytics`; `track(`, `capture(`; consent banner | is Visit→Signup→Activated→Paid measurable; consent-gated? |
| **SEO / AEO** | `robots.txt`, `sitemap*`, `llms.txt`, per-page title/description, JSON-LD, canonical, `/blog`, `/docs`, comparison pages | can search and answer engines find and cite it (baseline only — deep audit is `enhance-web-seo` / `plan-aeo-readiness`) |
| **Distribution assets** | README badges/hero image, `CHANGELOG.md`, `publishConfig` / PyPI, GitHub topics + stars, Product Hunt / HN / awesome-list links, newsletter, Discord/Slack, social handles | where it is already listed; what a share looks like |
| **Trust** | testimonials, logos, security/privacy/terms pages, status page, real screenshots | why a stranger would believe the claim |
| **Numbers** | npm/PyPI downloads, stars, store installs, analytics dashboards | fill in; otherwise write **unmeasured** |

Output an **Inventory table** — `Area | Current state | Evidence | Gap?`.

## Step B — Founder interview  [LOW freedom — rules; HIGH freedom — depth]

Rules from `workflow-grilling`: **one question per turn**, **recommend an
answer with each**, **facts from the repo are never asked**, **log decisions
in the founder's words**. Walk the ladder in order; skip rungs the inventory
already answered.

1. **90-day goal metric** — recommend: activated users per week (pre-revenue)
   or MRR (post-revenue). Not stars, not upvotes.
2. **Who exactly** — role + situation + what they use today instead. Recommend
   the ICP the inventory implies.
3. **Current numbers and channels** — visits, signups, activation, paid,
   where the last spike came from. Ask for the dashboard or CSV.
4. **Monetization intent** — stay free / freemium / trial / usage / open-core
   / hosted. Recommend from the model-fit table below; the choice is theirs.
5. **Budget** — hours per week and money per month for growth work.
6. **Geography and language** — which market first (e.g. JP vs EN).
7. **Alternatives** — the three things a buyer compares against.
8. **Constraints** — brand, legal, store policy, team, "never do X".

Stop when the plan can be written. Close with the **decision log**. If the
signup form has no "how did you hear about us" field, propose one in Phase 1
— it is the cheapest channel attribution that exists.

## Step C — Diagnose  [HIGH freedom]

### Positioning (Dunford order — do not start at category)
competitive alternatives → unique attributes → value those attributes enable →
best-fit customers who care most → market category that makes it obvious.
Write one sentence: *For [ICP] who [situation], [product] is the [category]
that [value], unlike [alternative].* The hero, README first line, and meta
description must all be able to carry it.

### Monetization model fit

Free-to-paid, 2026 (ChartMogul × Kyle Poyar × ProductLed, ~200 self-serve products):

| Model | Good | Great | Fits when | Repo signals |
|---|---|---|---|---|
| Freemium | 3–5% | 8–12% | volume + network/viral loop; low marginal cost | free tier limits in code, `isPro` gates |
| Freemium, ungated (no account to try) | 7–9% | 8–12% | adoption is the goal; value visible in one session | demo mode, sample data, no auth on core route |
| Free trial, no card | 4–6% | 10–15% | B2B, value needs setup time | `trialEndsAt`, 14-day default |
| Free trial, card required | 25–35% | 50–60% | intent over volume; ACV justifies friction | Stripe Checkout before app |
| Reverse trial | 4–6% | 8–12% | not statistically better than the two above | premium-then-downgrade logic |
| Usage-based / hybrid (credits) | — | — | cost per action (AI, infra); expansion via usage; now 41% of B2B SaaS | metering tables, `credits`, Stripe metered prices |
| Open-core + hosted cloud | 0.5–2% self-host → paid; cloud carries 48–73% of revenue at public OSS vendors | — | painful to operate; enterprise SSO/RBAC/audit | AGPL + `ee/`, `docker-compose`, cloud signup |
| Donation / sponsorship | — | — | libraries and CLIs with no hosted surface; rarely sustains alone | `FUNDING.yml`, no billing code |
| Paid-only | — | — | niche pro tool, strong word of mouth | paywall before any value, no free plan |

Median across all models is 8%; a fifth of products convert under 2.5%.
"Freemium vs trial" is the wrong question: **adoption → open the product
before signup; conversion → require a card.** Activation inside the free
window explains most of the variance — fix activation before changing price.
Underpricing attracts the curious, not the committed. Never recommend a
license change as a growth tactic; relicensing cost Elastic and Redis
contributors and gained no revenue. Full rows and URLs:
`references/benchmarks-2026.md`.

### Activation and north-star
Reforge order: **Setup** (must-have info) → **Aha** (core value once) →
**Habit** (core action at its natural frequency). `activated` is the aha
event — not signup, not tour end, never payment (that kills it as a leading
indicator). A valid activation event shows ≥ 2× retention for users who hit
it; if analytics exist, pick the event combination that best predicts
3-month retention. Benchmarks: median B2B activation 37% (good = p60, great
= p80 for the product type); below 20% is a broken first session;
time-to-value over 24 h collapses activation under 25%; day-7 return ≥ 7% of
a new cohort is top quartile. Only about a third of PLG companies track
activation at all — an "unmeasured" cell here is finding #1.
Map the funnel **Visit → Signup → Activated → Habit → Paid → Refer** with a
number or **unmeasured** in each cell; group by organization for B2B.

### Channels — pick ≤ 2 primary + 1 loop

| Channel | Best for | Caveat |
|---|---|---|
| Show HN | dev tools, OSS, infra | front page = 5–30k visits, 50–400 signups; >10 points only ~11% of posts; runnable thing, no signup wall, sober human-written post, answer every comment for 2 h |
| Product Hunt | consumer, design-led SaaS | featured rate ~10%; 1–2% visit→signup for B2B; credibility artifact, not acquisition; relaunch per major version |
| Reddit / niche communities | narrow ICP, B2B | value-first threads; link-only posts die |
| Content + comparison pages | anything searched | "X vs Y" / "alternatives to" pages took 78% of clicks from 28% of pages in one test; honest, current, unique per page — scaled AI pages are a Google spam-policy hit |
| AEO / answer engines | anything explained | earned third-party mentions earn ~6.5× more citations than owned pages; llms.txt has zero Search effect but coding assistants read it on docs sites → `plan-aeo-readiness` |
| Registries & directories | npm/PyPI packages, skills, plugins, extensions | discovery happens in the registry; README first 10 lines are the hero |
| Community (Discord/GitHub Discussions) | OSS, dev tools | retention and word-of-mouth, slow to start |
| Loops | all | "powered by" badge (0.5–3% conversion, near-100% exposure), templates users share, referral credit (SaaS referral rate ~4.75%); value before signup lifts referred conversion 2–5× |

Launch is a **cadence**, not an event: every meaningful release gets a post.
Name one **distribution hypothesis** in the plan — the failure mode is having
none, not picking the wrong one.

### Onboarding, pricing page, trust
Note gaps only; the fixes belong to `enhance-onboarding` and
`enhance-web-conversion`. Copy that reads generated → `plan-antislop`.

### Name the failure mode
Every finding maps to one: building before validating (43% of shutdowns are
PMF), generic hero, underpricing, no distribution hypothesis, activation
untracked or defined as payment, AI-generated content at scale, launching
once, reverse trial / AI credits as a fix. The list with sources is in
`references/benchmarks-2026.md`.

## Step D — Emit `plan-gtm.md`, end the turn  [LOW freedom — run exactly]

```markdown
# GTM Plan — <product>

_Plan-only. Nothing changes until each phase is approved._

## Decision log (founder's words)
- Goal metric (90 d): …
- ICP: …
- Monetization: …
- Budget: … h/week, … /month
- Market/language: …

## Inventory verdict
| Area | Status | Worst gap | Evidence |
|------|--------|-----------|----------|

## Positioning statement
For … who …, <product> is the … that …, unlike ….

## Monetization verdict
keep / tune / switch — why, with the benchmark row it is judged against.

## Activation & north-star
- `activated` = …   · north-star = …
| Visit | Signup | Activated | Habit | Paid | Refer |
|-------|--------|-----------|-------|------|-------|
| n | n | unmeasured | … | … | … |

## Channel plan (≤2 + loop)
| Channel | Why this ICP | Caveat | First action |

## Findings
| # | Area | Gap | Evidence | Sev | Direction |

## Phased burndown
- **Phase 1 — Measure & message** → `audit-analytics`, `enhance-web-conversion` (hero), `enhance-readme`; repo-as-product adds `audit-registry-listing`
- **Phase 2 — Activate** → `enhance-onboarding`, `audit-ui-states`, `enhance-web-forms`, `enhance-lifecycle-email` (activation nudges)
- **Phase 3 — Be found** → `enhance-web-seo`, `plan-aeo-readiness`, `docs-comparison-pages`
- **Phase 4 — Launch & loop** → `docs-launch-kit`, `enhance-growth-loops`, `iterate-gtm-weekly`
- **Phase 5 — Monetize** → `plan-pricing` (approve first), `enhance-web-conversion` (pricing, upgrade prompts), `enhance-lifecycle-email` (trial expiry), `audit-payment-system`

## 30 / 60 / 90
| Day | Metric | Target | Owner skill |

## Weekly GTM review (after Phase 4)
Funnel by source · activation cohort · top drop-off step · one experiment
shipped · one launch or post.

## Execution handoff
Approve a phase → `workflow-gtm` runs it and re-reads the funnel table.
```

End the turn with a standalone recap in chat: the decision log in one line, the two or three highest-impact findings, and Phase 1's first action. The file is the deliverable — write it before the recap.

## Guardrails

- **Plan only.** Inventory + interview + document.
- **Unmeasured is a value.** Never invent a conversion rate or traffic number.
- **No promised outcomes.** Rank, virality, and "10x signups" are not deliverables.
- **No dark patterns.** No fake scarcity, hidden cancel, confirm-shaming, upvote
  solicitation, fabricated reviews, or analytics before consent.
- **Business decisions stay with the founder.** Model, price, license, ICP.

## Chains with

- **`workflow-gtm`** — executes the approved phases.
- **Growth gate** — pairs with `plan-aeo-readiness`, `plan-aso` in `docs/PLAN-LOOPS.md`.
- **`audit-analytics`** — run first when the funnel table is all "unmeasured".
- **`iterate-gtm-weekly`** — the weekly loop after Phase 4 (`iterate-post-launch` keeps production bugs).

> Plan at high effort. Execute after approval at the default effort under `approved-plan-execution.mdc` (no reward hacking, no feature deletion).
