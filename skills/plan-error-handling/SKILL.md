---
name: plan-error-handling
description: >
  Plan-only audit of silent failures and observability gaps (Sentry,
  Langfuse). Use when "errors aren't showing in Sentry", "things fail
  silently", or "empty catch blocks". Apply patterns → backend-error-handling.
license: MIT
effort: high
---

# Error-Handling & Observability Audit + Fix Plan

**Degree of freedom: HIGH** — map silent paths, score, plan. Stay
**plan-only**. No code or SDK edits until each phase is approved.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **plan-error-handling** (this) | Silent-failure + Sentry/Langfuse plan |
| `debug-sentry-monitor` | Live Sentry triage |
| `audit-langfuse-llm` | LLM eval / trace quality |

## How to reason (every plan item)

1. **Propose** — report, init, redact, or wrap a silent path
2. **Risk** — what fails in prod with no signal (or PII leaving the env)
3. **Keep-working** — surfaces that already capture and sanitize
4. **Phase** — swallows → coverage → redaction → LLM traces (do not execute)

## Worked example

> **Propose:** report + rethrow the empty catch on `api/pay.ts` charge; init Sentry on the edge surface.
> **Risk:** payment failures produce no event — you only hear from the user.
> **Keep-working:** web client already captures unhandled exceptions.
> **Phase:** Phase 1 — stop silent failures.

**Role:** Senior reliability engineer + observability specialist.

**Task:** Map every silent-failure path across Sentry and Langfuse planes, score by
blast radius × invisibility, phase remediations, emit `plan-error-handling.md`.
**Audit & plan only — no code or SDK edits until each phase is approved.**

**Find what fails in silence. Make it observable. Change nothing until approved.**

AI coding agents optimize for *making the error message go away*, not for making
failure visible. **Error-handling gaps are nearly twice as common in AI-generated
pull requests** as in human ones — empty `catch` blocks, missing guards, unhandled
promise rejections, and handlers that leak stack traces into capture systems. The
dangerous part isn't the crash you see; it's the failure you *don't*.

This skill is the **audit-and-plan** half. Execution goes to `backend-observability` /
`audit-langfuse-llm` after you approve each phase.

---

## When this fires

Trigger phrases: *"errors don't reach Sentry"*, *"it fails silently"*, *"empty
catch blocks"*, *"add error handling"*, *"why can't I debug prod"*, *"check my
Langfuse traces"*, *"my LLM costs are a mystery"*, *"pre-launch observability"*.

Do **not** fire for: a specific firing incident (`debug-error`,
`debug-sentry-monitor`), or security gaps (`plan-rls-audit`,
`plan-security-audit`). This is the *coverage* audit, not incident response.

---

## Why a dedicated skill

`plan-stub-checker` finds *fake* functionality (dead buttons). This finds *real*
functionality that *fails invisibly*. Different failure mode: *"if this breaks in
production tonight, would you ever know?"*

---

## Plane 1 · Application errors (Sentry)  [HIGH freedom]

Walk every error path:

- **Swallowing catches** — `catch (e) {}`, `catch { return null }`,
  `catch (e) { console.log(e) }` with no rethrow and no Sentry capture.
- **Unreported catches** — handlers that *log* but never call
  `Sentry.captureException`. Local console ≠ production visibility.
- **Missing guards** — absent null checks, array-bounds validation, optional
  chaining gaps that throw at runtime on the unhappy path.
- **Async holes** — unhandled promise rejections, `await` without try/catch on
  fallible calls, floating promises, missing `.catch()` on fire-and-forget.
- **PII / secret leakage into events** — raw request bodies, tokens, emails,
  stack traces with internal paths captured into Sentry. Recommend
  `beforeSend` scrubbing.
- **Coverage holes** — is Sentry initialized on every surface (web, edge
  functions, RN/Capacitor, server actions)? Source maps uploaded?
- **User-facing vs internal split** — sanitized user message vs raw stack in UI?

## Plane 2 · LLM observability (Langfuse)  [HIGH freedom]

For any AI/LLM feature:

- **Untraced calls** — model/tool/retrieval calls with no `@observe` /
  Langfuse generation wrapping them.
- **Missing cost & token capture** — generations logged without usage/model
  params.
- **No eval scores** — faithfulness/relevance aren't on by default; you wire
  your own judges. Flag features shipping with zero quality signal.
- **Prompts not version-linked** — prompts inline in code instead of managed/
  versioned and linked to traces.
- **Sessions/users not propagated** — multi-turn flows without session/user
  attributes.
- **PII in traces** — confirm SDK-layer redaction before traces leave the env.
- **Sampling blind spots** — if sampling <100%, note which edge cases may be
  missed.

> If the user self-hosts Langfuse, add a note to re-check hosting and licensing terms against current upstream ownership before launch — a note, not a code finding.

## Cross-plane

- **Error ↔ trace correlation** — can a Sentry error tie back to its Langfuse
  trace (shared request/trace id)?
- **Structured logging** — JSON + correlation ids vs `console.log` soup?

---

## Procedure  [HIGH freedom]

1. **Inventory surfaces.** Which planes exist (Sentry? Langfuse? both?). Skip absent
   planes. State assumptions.
2. **Sweep.** Collect findings with `path:line`. For each: *"If this fails in prod,
   what's the signal?"* — None / Console-only / Sentry / Langfuse.
3. **Score.** Severity = blast radius × invisibility.
4. **Phase** into shippable groups mapped to execution skills.
5. **Emit `plan-error-handling.md`, then end the turn** with a standalone recap in chat: the two or three highest-impact findings and the first phase to approve. The file is the deliverable — write it before the recap. **Do not edit code.**

---

## Guardrails  [LOW freedom — run exactly]

- **Plan only.** No wrapping, no try/catch insertion, no SDK config edits.
- **Don't add noise.** Flag genuinely-silent real failures; don't recommend
  Sentry-spamming every validation miss.
- **Swallowing ≠ handling.** Intentional graceful degradation is fine *if*
  reported; blind swallowing is not.
- **Redaction is not optional.** PII/secret reaching Sentry or Langfuse = High
  minimum.
- **Observability ≠ prevention.** Pair with `plan-test-coverage`.
- **Minimal quoting** of source.

## Self-critique before the burndown  [LOW freedom — do not skip]

1. **evidenced-not-assumed** — every row has `path:line` and today's signal
2. **plan-only** — no try/catch, wrap, or SDK edit this pass
3. **phase justified** — silent swallows before LLM evals; PII leak is High minimum
4. **right-owner** — live incident → `debug-sentry-monitor`; LLM quality → `audit-langfuse-llm`
5. **no-false-safety** — `console.log` ≠ Sentry; do not spam validation misses

---

## Report template — `plan-error-handling.md`

```markdown
# Error-Handling & Observability Audit — <repo>

_Audit-only. Nothing changes until each phase is approved._

## Scope
- Planes: [ ] Sentry  [ ] Langfuse  | Surfaces: web / edge / RN / server actions
- Assumptions / not inspected: …

## Verdict
| Plane | Silent failures | PII leaks | Coverage holes |
|-------|-----------------|-----------|----------------|
| Sentry   | n | n | n |
| Langfuse | n | n | n |

## Findings — application errors (Sentry)
| # | path:line | Pattern | Signal today | Sev | Direction |
|---|-----------|---------|--------------|-----|-----------|
| E1 | api/pay.ts:88 | empty catch on charge | none | Crit | report + rethrow, surface to user |

## Findings — LLM observability (Langfuse)
| # | path:line | Gap | Sev | Direction |
|---|-----------|-----|-----|-----------|
| L1 | lib/ai.ts:40 | model call untraced | High | wrap with observe, capture usage |

## Phased burndown
- **Phase 1 — Stop silent failures** → `backend-observability` — E-tier swallows
- **Phase 2 — Close coverage holes** → `backend-observability` — init gaps, maps
- **Phase 3 — Redact PII** → `backend-observability` — beforeSend / SDK redaction
- **Phase 4 — LLM tracing & evals** → `audit-langfuse-llm` — L-tier items

## Execution handoff
Approve a phase to run it. Re-run after to confirm failures are now observable.
```

---

## Chains with

- **Security spine** — observability layer (`plan-error-handling`); complements
  `plan-test-coverage` (tests prevent; observability reveals).
- **Execution:** `backend-observability`, `audit-langfuse-llm`,
  `debug-sentry-monitor`.
- **Verify:** trigger a controlled failure post-fix; confirm Sentry/Langfuse capture.

> Plan at high effort. Execute after approval at the default effort under `approved-plan-execution.mdc` (no reward hacking, no feature deletion). The plan says *what* is invisible; the rule constrains *how* it's wired.
