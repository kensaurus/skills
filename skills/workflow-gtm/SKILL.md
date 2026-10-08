---
name: workflow-gtm
description: >
  Take a shipped repo to market: plan-gtm audit and interview, approval, then
  measure, message, activate, get found, launch, and a weekly loop. Use when
  "go to market", "grow users", or "increase traffic and visibility". Strategy
  only → plan-gtm.
license: MIT
metadata:
  chain: "plan-gtm audit-analytics enhance-web-conversion audit-registry-listing enhance-readme enhance-onboarding enhance-lifecycle-email enhance-web-seo docs-comparison-pages plan-aeo-readiness docs-launch-kit enhance-growth-loops iterate-gtm-weekly"
---

# workflow-gtm — From shipped to found, used, and paid

**Degree of freedom: MIXED.** Skip/condition judgment per step
`[HIGH freedom]`; step order, the approval gate after Step 1, and the
scorecard `[LOW freedom — run exactly]`.

The go-to-market sequence for a product that already works. Plan first, get
the founder's approval, then run the apply skills in the order that compounds:
measure → message → activate → be found → launch → loop.

Technical launch readiness (SEO meta, PWA, bundle, quality gate) is
**`workflow-launch-ready`**, not this. Run it before Step 5 when the app has
never shipped.

## How to reason

1. **Scope** — shipped product, real users possible today; not a PRD
2. **Gate** — `plan-gtm.md` approved phase by phase; nothing applied before
3. **Sweep** — which steps apply this quarter; honest skips named
4. **Scorecard** — funnel table before and after; weekly loop scheduled

## Worked example

> **Scope:** Next.js + Supabase kakeibo app, live, ~200 signups/month, no paid tier yet.
> **Gate:** `plan-gtm.md` approved Phases 1–3; Phase 5 (monetize) parked until activation ≥ 30%.
> **Sweep:** analytics → hero → onboarding → SEO/AEO → launch kit for v2.1; skip pricing.
> **Scorecard:** activation unmeasured → 22% → 34% after onboarding; weekly loop on Mondays via `iterate-gtm-weekly`.

## Self-critique before reporting

- **Plan approved** — no Step 2+ skill ran before the founder approved its phase
- **Measured first** — the funnel table had real cells (or `audit-analytics` added events) before copy or UX changed
- **Skips named** — every skipped step has a one-line reason in the scorecard
- **No promised outcomes** — the scorecard reports numbers, not "should grow"
- **Right owner** — PRD → `design-prd`; technical launch sweep → `workflow-launch-ready`

---

## Sequence  [LOW freedom — run exactly]

```
1. PLAN      → plan-gtm                 (inventory, interview, plan-gtm.md)  ── STOP for approval
2. MEASURE   → audit-analytics          (Visit→Signup→Activated→Paid events, consent-gated)
3. MESSAGE   → enhance-web-conversion   (hero, CTA, proof; pricing only if Phase 5 approved)
             → enhance-readme           (README as landing page, when the repo is the product;
                                         audit-registry-listing first for the findings)
4. ACTIVATE  → enhance-onboarding       (activation event, cut steps, templates, checklist)
             → enhance-lifecycle-email  (activation nudges keyed to the same events)
5. BE FOUND  → enhance-web-seo          (meta, sitemap, schema)
             → docs-comparison-pages    ("X vs Y" / alternatives pages, ≤5, dated facts)
             → plan-aeo-readiness       (AI-engine citation plan; approve, then enhance-web-seo)
6. LAUNCH    → docs-launch-kit          (per-channel kit for this release)
             → enhance-growth-loops     (badge / share / referral, one K per loop)
7. LOOP      → iterate-gtm-weekly       (weekly: funnel by source, one experiment, one post)
```

Steps 3–6 run only for phases the founder approved. Mobile store products add
`plan-aso` beside Step 5. Phase 5 (monetize) runs `plan-pricing` → approval →
`enhance-web-conversion` (pricing) + `enhance-lifecycle-email` (trial expiry).

---

## Step 1: Plan (read plan-gtm)  [LOW freedom — hand off, then stop]

> Read the `plan-gtm` skill and follow it.

Ends the turn with `plan-gtm.md`. Wait for phase approval.

## Step 2: Measure (read audit-analytics)  [HIGH freedom]

> Read the `audit-analytics` skill and follow it.

Goal: every funnel cell measurable, consent-gated, one taxonomy. Include the
`activated` event `plan-gtm` defined.

## Step 3: Message (read enhance-web-conversion, enhance-readme)  [HIGH freedom]

> Read the `enhance-web-conversion` skill and follow it. For repo-as-product,
> run `audit-registry-listing` for findings, then `enhance-readme`.

Hero carries the positioning statement; one CTA; real proof.

## Step 4: Activate (read enhance-onboarding, enhance-lifecycle-email)  [HIGH freedom]

> Read the `enhance-onboarding` skill and follow it. Then read
> `enhance-lifecycle-email` for the activation nudges keyed to the same events.

Report steps before/after and the `activated` event firing.

## Step 5: Be found (read enhance-web-seo, docs-comparison-pages, plan-aeo-readiness)  [HIGH freedom]

> Read `enhance-web-seo` and follow it. Read `docs-comparison-pages` for the
> ≤5 bottom-funnel pages. Then read `plan-aeo-readiness`; its plan is approved
> before its fixes run.

## Step 6: Launch (read docs-launch-kit, enhance-growth-loops)  [LOW freedom — hand off]

> Read the `docs-launch-kit` skill and follow it. If the plan named a loop,
> read `enhance-growth-loops`.

One kit per release; UTMs on every link; one K per loop.

## Step 7: Loop (read iterate-gtm-weekly)  [LOW freedom — hand off]

> Read the `iterate-gtm-weekly` skill and follow it.

Weekly review, five lines: funnel by source · activation cohort · top
drop-off step · one experiment shipped · one launch or post. Production
defects stay on `iterate-post-launch`.

---

## Scorecard output  [LOW freedom — run exactly]

```markdown
## GTM Scorecard — <product> — <date>

### Decision log (from plan-gtm.md)
Goal metric · ICP · Model · Budget

### Funnel
| Stage | Before | After | Source |
|-------|--------|-------|--------|
| Visit | | | |
| Signup | | | |
| Activated | | | |
| Habit | | | |
| Paid | | | |
| Refer | | | |

### Steps
| Step | Status | Skill | Notes / skip reason |
|------|--------|-------|---------------------|
| 1 Plan | approved phases: … | `plan-gtm` | |
| 2 Measure | ✅ / ⚠️ / skipped | `audit-analytics` | |
| 3 Message | | `enhance-web-conversion` | |
| 4 Activate | | `enhance-onboarding` | |
| 5 Be found | | `enhance-web-seo`, `plan-aeo-readiness` | |
| 6 Launch | | `docs-launch-kit` | |
| 7 Loop | scheduled <day> | `iterate-gtm-weekly` | |

### Next week's one fix
```
