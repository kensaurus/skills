---
name: plan-pricing
description: >
  Plan-only pricing audit: value metric, tiers, price points, free-tier
  boundary, annual and enterprise anchors, and a willingness-to-pay study. Use
  when "pricing strategy", "what should I charge", or "are we underpriced".
license: MIT
effort: high
---

# plan-pricing — What to charge for, then how much

**Degree of freedom: MIXED.** Repo inventory and the research-method order
`[LOW freedom — run exactly]`; value-metric choice, tier design, and price
corridor `[HIGH freedom]`. Stay **plan-only**: no price, plan enum, Stripe
product, or copy edits until approved.

**Role:** Pricing lead who reads billing code. The repo shows what is metered
and gated today; the founder owns the number.

**Task:** Inventory the current model, pick the value metric, design ≤3
tiers, propose a price corridor with the research that would confirm it, emit
`plan-pricing.md`. **Change nothing until approved.**

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **plan-pricing** (this) | Value metric, packaging, price points, research plan |
| `plan-gtm` | Chose freemium / trial / open-core; hands the model here |
| `enhance-web-conversion` | The pricing *page* — copy, anchor, toggle, prompts |
| `audit-payment-system` | Whether checkout, webhooks, proration actually work |
| `audit-monetization-iap` | Mobile store prices and entitlements |
| `plan-llm-cost-guardrails` | Caps and breakers when the metric is tokens |

Do **not** fire for "fix the pricing page" → `enhance-web-conversion`.

## How to reason (every proposal)

1. **Metric** — which unit rises when the customer gets more value, and can they estimate it before signing?
2. **Package** — which capabilities belong together for which segment; does one meter span all tiers?
3. **Point** — where does the price sit against alternatives, cost, and the corridor the research gives?
4. **Prove** — which method (Van Westendorp → Gabor-Granger → MaxDiff → conjoint) confirms it, and what would change the answer?

## Worked example

> **Metric:** a bug-report SDK meters `reports/month`; buyers think in
> "apps monitored" and can estimate that before signing. Propose: primary metric
> = apps, secondary overage = reports beyond an allowance.
> **Package:** Free 1 app / 50 reports · Pro 3 apps · Team 10 apps + SSO;
> Enterprise "from ¥…" with audit log. Three tiers, same CTA verb.
> **Point:** Pro at ¥2,900/mo sits under the cheapest alternative's ¥4,800;
> current ¥980 is inside the "too cheap" band two customers named in interviews.
> **Prove:** Van Westendorp on the 40 free-tier accounts for a corridor, then
> Gabor-Granger on Pro; keep the metric fixed for two years, revisit rates.

## Self-critique before the burndown  [LOW freedom — do not skip]

1. **one-metric-sentence** — "Our customer receives more value when ___ increases" is written and the metric is that blank
2. **estimable** — a buyer can predict their bill before signing; usage meters show the unit, allowance, and a live estimate
3. **anchor-present** — the enterprise or top tier shows a number or "from"; nothing is pure "Contact sales"
4. **corridor-not-guess** — every price point cites a method run or planned, or a named alternative's price; otherwise **unmeasured**
5. **plan-only** — no plan enum, Stripe product, price, or copy changed
6. **right-owner** — page copy → `enhance-web-conversion`; billing correctness → `audit-payment-system`

---

## Step 1 — Inventory  [LOW freedom — run exactly]

| Area | Grep / open | Records |
|---|---|---|
| Plans & gates | `plan`, `tier`, `isPro`, `entitlement`, feature flags keyed on plan; Stripe/Paddle/Lemon product IDs | current tiers, what each gates |
| Metering | `usage`, `credits`, `quota`, `limit`, counters, metered prices, `usage_metered` events | what is counted today, what is billed |
| Price points | pricing route, Stripe dashboard export, `prices` table | monthly / annual / currency per tier |
| Trial & free | `trial_ends_at`, downgrade jobs, free-plan limits | model in force |
| Cost | per-action cost (LLM tokens, storage, compute) | floor for any usage price |
| Customers | plan distribution, upgrade/downgrade events, churn reasons, "too expensive" in support | willingness-to-pay evidence already owned |
| Alternatives | the three the founder named in `plan-gtm`; their public prices and metrics, looked up now — recognizing a product is not knowing its current price | anchor context |

## Step 2 — Value metric  [HIGH freedom]

List candidate units (seats, projects, apps, transactions, rows, runs, revenue
managed, outcomes). Score each 1–5 on: **value connection**, **fairness /
familiarity**, **predictability** (buyer can forecast it), **scalability**
(grows with the account), **billability** (you can meter it). Keep one primary
metric; add a usage component only where a material variable cost is not
covered by the primary. Simulate the metric on real historical accounts —
prices that look absurd for a specific account reveal a missing segment or a
weak proxy.

| Metric | Works when | Watch for |
|---|---|---|
| Seats | value and cost grow with active people | seat friction throttles adoption |
| Usage / transactions | each unit is meaningful work | usage without a matching result; bill shock (41% of buyers cite unpredictable cost as the top objection) |
| Data volume | processing or storage is the value | business buyers cannot forecast bytes |
| Scope (apps, sites, locations) | deployment breadth drives value | flat within a unit |
| Outcomes | attribution is objective and agreed | disputes; measurement debt |

Hybrid (base + usage) is now 41% of B2B SaaS; AI-native products price on
outcomes 4× more often. A model name is shorthand for a metric choice — pick
the metric first, then the cadence.

## Step 3 — Packaging  [HIGH freedom]

≤3 self-serve tiers good-better-best from the outside in (what the segment
is trying to accomplish), recommended middle, higher tier on the right as the
anchor, enterprise shows "from". Free-tier boundary sits just before the
activation event's natural repeat — enough to reach value, not enough to
live there. Annual = 15–25% off, stated as months free. Credits: unit,
included amount, live estimate, and a hard cap the user sets.

## Step 4 — Price corridor and research  [LOW freedom — order]

1. **Van Westendorp** (four questions: too cheap / bargain / expensive / too
   expensive) on current users → acceptable range. Directional only.
2. **Gabor-Granger** on the recommended tier → revenue-maximizing point.
3. **MaxDiff** when too many features compete for tier placement.
4. **Conjoint** last, when redesigning bundles.
Plus win/loss notes and one in-market test after approval. Underpricing "to
reduce friction" attracts the curious, not the committed (one indie raise
£9 → £19 moved month-3 retention 42% → 67%). Sources in
`plan-gtm/references/benchmarks-2026.md`.

## Step 5 — Emit `plan-pricing.md`, end the turn  [LOW freedom — run exactly]

```markdown
# Pricing Plan — <product>

_Plan-only. Nothing changes until approved._

## Current model (evidence)
| Tier | Price | Gates | Metered | Source |

## Value metric
"Our customer receives more value when ___ increases."
| Candidate | Value | Fair | Predictable | Scales | Billable | Verdict |

## Proposed packaging
| Tier | For whom | Includes | Limit | Monthly | Annual (months free) |
Enterprise: from … · Free boundary: …

## Price corridor
| Tier | Floor (cost) | Alternatives | VW range | Proposed | Confidence |

## Research plan
| Method | Sample | Question | Decides |

## Risks & keep-working
- migration of existing customers (grandfather / notice period)
- metering accuracy before any usage price ships (`audit-payment-system`)

## Phased burndown
- **Phase 1 — Research** → interviews + Van Westendorp survey (`docs-coauthor` for the script)
- **Phase 2 — Page** → `enhance-web-conversion`
- **Phase 3 — Billing** → `audit-payment-system`, Stripe products, proration, grandfathering
- **Phase 4 — Measure** → `audit-analytics` (`pricing_viewed`, `plan_selected`, `checkout_*`), 60-day review
```

End the turn with a standalone recap in chat: the proposed metric in one sentence, the price corridor, and the first research step to approve. The file is the deliverable — write it before the recap.

## Guardrails

- **Plan only.** No prices, plan enums, Stripe objects, or copy.
- **The number is the founder's.** Recommend a corridor and a method; log their decision.
- **No bait.** Price shown before checkout; cancel and downgrade paths stay.
- **Grandfather or notify.** Existing customers are a named row in the plan.

## Chains with

- **`plan-gtm`** → model decision in; pricing plan out.
- **`enhance-web-conversion`** → the page after approval.
- **`audit-payment-system`** → before any metered price ships.
- **`plan-llm-cost-guardrails`** → when the metric is tokens or compute.
