---
name: plan-llm-cost-guardrails
description: >
  Plan-only audit of an LLM app's runaway-cost and quota-abuse exposure. Use
  when "cap my AI costs", "my LLM bill could blow up", "rate limit my AI",
  "token budget", "runaway agent loop", or hardening LLM features before
  launch.
license: MIT
effort: high
---

# LLM Cost-Guardrail Audit + Remediation Plan

**Degree of freedom: HIGH** — inventory call sites, score unbounded
paths, plan. Stay **plan-only**. No limits or routing changes until approved.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **plan-llm-cost-guardrails** (this) | Token / quota / runaway-loop plan |
| `audit-langfuse-llm` | Quality and cost traces |
| `audit-infra-cost` | Hosting / egress bill |
| `audit-llm-security` | Unbounded consumption as an attack |

## How to reason (every plan item)

1. **Propose** — token cap, kill switch, breaker, or fallback
2. **Risk** — worst-case spend × who can reach the path
3. **Keep-working** — call sites that already bound tokens and account usage
4. **Phase** — caps → breakers → fallback → visibility (do not execute)

## Worked example

> **Propose:** per-user daily token cap + hard daily-spend kill switch on `lib/ai.ts`.
> **Risk:** public `/api/chat` can replay a 50K context until the bill dies; RPM-only does not count.
> **Keep-working:** summarizer path already sets `max_tokens`.
> **Phase:** Phase 1 — caps & kill switch.

**Role:** Senior platform engineer (LLM spend + abuse resistance).

**Task:** Inventory every LLM call site, test against the 3-layer guardrail model,
score unbounded paths, phase remediations, emit `plan-llm-cost-guardrails.md`.
**Audit & plan only — no limits or routing changes until approved.**

**Find every path to a runaway bill. Cap it. Change nothing until approved.**

Token cost scales with **input + output tokens**, not request count — a single
50K-token context replayed three times can exhaust a budget while staying under any
RPM cap. Vibe-coded AI features ship with no spend cap, no per-user quota, no
output-token cap, no circuit breaker — compounded by prompt-injection cost amplification
and forged-webhook quota fraud (the empty-signing-secret bypass class).

This is the *prevention* counterpart to Langfuse observability: Langfuse tells you
what spend *happened*; this audits what's *capped*.

---

## When this fires

Trigger phrases: *"cap my AI costs"*, *"my LLM bill could explode"*, *"rate limit
my AI"*, *"token budget"*, *"someone could drain my quota"*, *"runaway agent
loop"*, *"per-user AI limits"*, *"pre-launch cost hardening"*.

Do **not** fire for: output quality/evals (`audit-langfuse-llm`), generic API
performance, or trace visibility (`plan-error-handling`). This owns *bounded spend*.

---

## The audit — 3-layer guardrail model  [HIGH freedom]

### Layer 1 · Limits (token-aware, not request-count)
- **Token-bucket / quota per (user, model)** — any per-identity limit?
- **Token-based, not just RPM** — prompt-TPM and output-TPM ceilings.
- **Output-token / context caps** — `max_tokens` (Anthropic),
  `max_completion_tokens` or `max_output_tokens` (OpenAI); bound worst-case
  cost; truncate RAG context.
- **Short + long windows** — per-minute burst *and* per-day/month budget.
- **Tiered limits** — free vs paid wired to Stripe entitlement.

### Layer 2 · Circuit breakers
- **Cost-velocity breaker** — spend/min threshold.
- **Loop / repeat detection** — retry-storms, growing-context loops.
- **Daily-spend kill switch** — hard cap backstop.
- **Error-rate breaker** — mostly-failing caller identity.

### Layer 3 · Fallback chain
- **Primary → cheaper model → cache → graceful 503.**
- **Semantic cache** before paid calls.
- **Model routing by complexity** — flag patterns that send every call to the most
  expensive model tier.

### Cross-cutting
- **Streaming usage accounting** — read usage from the stream or spend is
  invisible: OpenAI Chat Completions sends it only with
  `stream_options.include_usage`; Anthropic sends it in `message_start` and
  cumulative `message_delta` events.
- **Retry discipline** — token-aware backoff.
- **Abuse vectors** — unauthenticated AI endpoints; hand boundary fixes to
  `plan-input-validation`.
- **Langfuse cost alerts** — 50/75/90% thresholds; per-user attribution.

---

## Procedure  [HIGH freedom]

1. **Inventory LLM call sites** and public AI endpoints.
2. **Test each against Layers 1–3.**
3. **Score** = worst-case spend × reachability.
4. **Phase** — Layer 1 caps and daily kill switch first.
5. **Emit `plan-llm-cost-guardrails.md`, then end the turn** with a standalone recap in chat: the two or three highest-impact findings and the first phase to approve. The file is the deliverable — write it before the recap.

---

## Guardrails  [LOW freedom — run exactly]

- **Plan only.** No limits, gateway config, or routing changes.
- **Spend cap is non-negotiable for launch** — flag absence as at least High.
- **Token-aware or it doesn't count** — don't credit RPM-only limits.
- **Bounded blast radius**, not zero runaways.
- **Cross-hand abuse** to `plan-input-validation`.

## Self-critique before the burndown  [LOW freedom — do not skip]

1. **evidenced-not-assumed** — each unbounded path names a call site, not "we should cap AI"
2. **plan-only** — no limits, gateway, or routing edits this pass
3. **phase justified** — Layer 1 caps + daily kill switch before fallback polish
4. **right-owner** — quality/evals → `audit-langfuse-llm`; unauth AI input → `plan-input-validation`
5. **no-false-safety** — RPM-only is not a token cap; missing spend cap is at least High

---

## Report template — `plan-llm-cost-guardrails.md`

```markdown
# LLM Cost-Guardrail Audit — <repo>

_Audit-only. No limits or routing change until each phase is approved._

## Scope
- LLM call sites: n  | Public AI endpoints: n  | Langfuse present: ☐

## Verdict
| Layer | Present? | Worst gap |
|-------|----------|-----------|
| 1 Limits (token-aware) | partial | unbounded max_tokens |
| 2 Circuit breakers     | ❌ | no daily kill switch |
| 3 Fallback chain       | ❌ | limit = hard error |

## Findings
| # | Call site | Unbounded path | Worst-case | Missing layer | Sev | Direction |
|---|-----------|----------------|------------|---------------|-----|-----------|

## Phased burndown
- **Phase 1 — Caps & kill switch** → `backend-patterns`
- **Phase 2 — Circuit breakers** → `backend-patterns`
- **Phase 3 — Fallback chain** → `backend-patterns`
- **Phase 4 — Visibility** → `audit-langfuse-llm` / `backend-observability`
- **Cross-hand** → `plan-input-validation`

## Execution handoff
Simulate a runaway in test env after Phase 1; confirm cap holds before bill moves.
```

---

## Chains with

- **Observability & spend loop** — pairs with `plan-error-handling` (visibility) and
  `audit-langfuse-llm` (quality); this owns *bounded spend*.
- **`audit-llm-security`** — LLM10 unbounded consumption is the attack-shaped twin.
- **`audit-infra-cost`** — hosting/egress, not tokens.
- **Execution:** `backend-patterns`, `audit-langfuse-llm`, `backend-observability`.
- **Verify:** sandbox load/abuse test — caps, breakers, fallback trip before spend escapes.

> Plan at high effort. Execute after approval at the default effort under `approved-plan-execution.mdc` (no reward hacking, no feature deletion).
