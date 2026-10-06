---
name: enhance-onboarding
description: >
  Activation pass: define the activation event, cut steps to first value, add
  templates, sample data, a short checklist, and signup → activated events.
  Use when "improve onboarding", "users sign up and leave", or "activation
  rate".
license: MIT
---

# enhance-onboarding — First session to first value

**Degree of freedom: MIXED.** Choosing the activation event and which
patterns fit `[HIGH freedom]`; the event names, the new-user walkthrough, and
the before/after step count `[LOW freedom — run exactly]`.

Apply-now. The product already works; two-thirds of the people who sign up
never see it work (median B2B activation 37%, Userpilot n=62). This skill
shortens the path from landing to the first real outcome and proves it with
events, not a tour.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **enhance-onboarding** (this) | Landing → signup → first value → habit, as one journey |
| `enhance-web-ux` | Any single route's flows and density |
| `audit-ui-states` | Empty / loading / error states audit (findings) |
| `enhance-web-forms` | Form structure, validation, a11y |
| `audit-analytics` | Whether events exist and fire after consent |
| `enhance-web-conversion` | Pricing, upgrade prompts — after activation |
| `design-email` | Day-1/3/7 re-engagement mail this skill may request |
| `plan-gtm` | Decides *what* activation means for the business; this skill builds it |

Do **not** fire for "add a product tour" as stated — tours are a last resort here.

## How to reason

1. **Define** — the activation event is the first outcome the user came for, not signup or tour-end
2. **Measure** — current steps and drop-off from landing to that event (instrument first if blind)
3. **Cut** — every field, screen, or decision before the event that can wait
4. **Guide** — what remains gets a template, sample data, a ≤5-item checklist, or one contextual hint
5. **Verify** — a fresh user reaches the event in fewer steps; events fire; nothing else regressed

## Worked example

> **Define:** a kakeibo app — `activated` = first transaction categorized, not
> account created.
> **Measure:** landing → 6-field signup → email verify → empty dashboard →
> "Add account" → "Add transaction" = 9 steps, verification email lost on mobile.
> **Cut:** OAuth + magic link; name/currency inferred from locale; verify later.
> **Guide:** empty dashboard becomes "Start with sample month" + "Add your first
> expense"; 3-item checklist ends at the activation event.
> **Verify:** 9 → 4 steps; `activated` fires on first categorized row; Playwright
> new-user path green; existing password login untouched.

## Self-critique before reporting

- **Event is value** — `activated` fires on an outcome, never on `signup_completed` or tour end
- **Steps counted** — before/after step counts are in the report from a real walkthrough
- **Nothing removed** — every auth provider, setting, and route still exists; fields were deferred, not deleted
- **Consent-gated** — no event fires before the consent state the app already uses
- **Right owner** — pricing/upgrade → `enhance-web-conversion`; single-route polish → `enhance-web-ux`

---

## Procedure

### 1. Define activation  [HIGH freedom]

Reforge order: **Setup** (must-have info) → **Aha** (core value once) →
**Habit** (core action at its natural frequency). `activated` is the aha. Pick
it by asking: *what did they come to do, and when have they done it once?* One
event, written as `activated` plus the domain event that triggers it (e.g.
`transaction_categorized`). Add `setup_completed` and `habit_reached` (e.g. 3
sessions in 7 days) so setup drop-off and retention are measurable too. When
analytics already exist, prefer the event combination that best predicts
3-month retention; a valid activation event shows ≥ 2× retention for the users
who hit it. Payment is never the activation event.

### 2. Measure the current path  [LOW freedom — run exactly]

1. Fresh browser profile (or emulator) — walk landing → activation as a stranger.
2. Record each step: URL, fields, decisions, waits (email, verification, payment).
3. Pull funnel numbers if analytics exist; otherwise write **unmeasured** and
   add instrumentation in step 4 before any redesign is judged.

Benchmarks for judging (sources in `plan-gtm/references/benchmarks-2026.md`):
median B2B activation 37%, good = p60 / great = p80 for the product type;
time-to-value over 24 h → activation collapses below 25%; top quartile first
value under 5 minutes; day-7 return ≥ 7% of a new cohort is top quartile.
Checklist completion averages ~19% (engaged users finish ~5 items) — a
checklist supports the path, it does not replace cutting it.

### 3. Cut and guide  [HIGH freedom — choose; each pattern below is optional]

| Do | Avoid |
|---|---|
| Try before signup when the value shows in one session (7% of self-serve products now lead ungated; value-before-signup lifts referred conversion 2–5×) | Signup wall in front of a demo |
| OAuth / magic link; password as fallback; one optional "how did you hear about us" field | 6+ field forms, phone, company size |
| Infer locale, currency, timezone; ask firmographics after first value | Profile wizard before the product |
| Empty state = one primary action + "start from a template / sample data" | Blank screen with a "+" icon |
| ≤5-item checklist, open by default, first item pre-completed, completion detected by real events, last item **is** the activation event | 12-item tour of every menu |
| Guidance embedded in the UI (+20% engagement vs modals); tours only user-triggered and ≤4 steps (67% completion vs 31% timer-triggered; 7+ steps 16%) | Autoplay tours, modal stacks, welcome videos |
| Personalize with at most one JTBD question — and use the answer (65% collect it, 18% use it) | Role/industry quiz before value |
| Day-1/3/7 email nudges tied to unfinished checklist items (→ `design-email`) | Generic "welcome aboard" mail; sales outreach minutes after signup |
| Keep card-required trials only if `plan-gtm` chose that model | Payment before value by accident |

Deferred fields move to settings or a later prompt; nothing is deleted.

### 4. Instrument  [LOW freedom — names]

Use the app's existing analytics SDK and consent gate. Canonical events:

```
signup_started · signup_completed { method, source }
onboarding_step_completed { step }
setup_completed
activated { via: <domain_event> }
habit_reached { sessions, window_days }
```

Server-side where possible; same analytics project as the marketing site so
`page_viewed { utm, referrer }` joins to signup. Reconcile naming with
`audit-analytics` when a taxonomy already exists. No PII in properties. Fire
nothing before consent.

### 5. Verify  [LOW freedom — run exactly]

- New-user Playwright path from landing to `activated` — passes, step count ≤ target
- Existing login providers, settings, and routes — unchanged (regression pass)
- Events visible in the analytics debug view or test sink
- Report: steps before/after, TTV estimate, events added, files touched

## Guardrails

- **No dark patterns** — no fake progress, forced card, hidden skip, or pre-checked upsell.
- **Defer, never delete** — collected data the business needs moves later in the journey.
- **Do not invent numbers** — funnel cells stay "unmeasured" until events exist.
- **One journey** — landing to first value; the rest of the app is another skill's.

## Chains with

- **`plan-gtm`** → defines the business meaning of activation; this skill ships it.
- **`audit-ui-states`** → empty/loading/error findings feed step 3.
- **`enhance-web-forms`** → the signup form itself.
- **`enhance-web-conversion`** → upgrade prompts after activation.
- **`test-playwright`** → lock the new-user path.
