---
name: audit-resilience
description: >
  Read-only production-resilience audit: timeouts, bounded retries, circuit
  breakers, idempotency, rate limits, graceful degradation, PII in logs. Use
  when "resilience audit" or "will this survive real traffic?".
license: MIT
effort: high
---

# audit-resilience — The "80% Problem" Non-Functional Audit

**Degree of freedom: MIXED** — Phases 1 and 4 `[HIGH freedom]`; Phase 0/2
surface greps `[LOW freedom — run exactly]`.

Agents nail the happy path (CRUD, passing tests) and silently skip what decides whether code
survives real traffic: a webhook with no idempotency key double-charges; a fetch with no
timeout hangs the request; a retry storm with no backoff takes down the dependency; PII lands
in plaintext logs. This audit finds those gaps before production does.

> **Read-only.** This skill inventories resilience gaps and hands each to the right fix skill.
> It does not change code.

## How to reason

1. **Observe** — quote the call/mutation and whether timeout, retry+jitter, or idempotency key exists
2. **Interpret** — hang, retry storm, double-write, or silent catch?
3. **Classify** — Implemented / Partial / Missing (per matrix row)
4. **Severity** — payment/webhook without idempotency, or no timeout on a live path = Critical

## Worked example

> **Observe:** `POST /api/webhooks/stripe` inserts a payment with no
> `Idempotency-Key` / dedupe (`app/api/webhooks/stripe/route.ts:44`);
> `fetch` to Stripe has no `signal` / timeout.
> **Interpret:** Stripe retry double-charges; a hung fetch exhausts the pool.
> **Classify:** idempotency Missing; timeout Missing.
> **Severity:** Critical.
> **Finding:** webhook | no idempotency + no timeout | Critical | `backend-patterns`

## Phase 0 — Detect the surfaces  [LOW freedom — run exactly]

```bash
# Outbound calls + clients
rg -n "fetch\(|axios|got\(|httpx|requests\.|HttpClient|ky\(" -g "*.{ts,tsx,js,py,go}" -l
# Mutations / writes / external effects
rg -n "prisma\.|\.insert\(|\.update\(|\.delete\(|supabase\.|INSERT|UPDATE|DELETE" -g "*.{ts,py,sql}" -l
# Webhooks / payments / queues
rg -n "webhook|stripe|paypal|queue|kafka|sqs|bull|cron|schedule" -g "*.{ts,tsx,js,py}" -l
# Logging (for PII / audit-log review)
rg -n "console\.(log|error)|logger\.|logging\.|print\(" -g "*.{ts,tsx,js,py}" -c
```

Record: HTTP clients, external services, mutation/webhook/payment paths, queue/cron jobs,
and the logging approach. If there are no external calls or mutations (pure static site /
library), note reduced applicability.

---

## Phase 1 — Research current patterns  [HIGH freedom]

Follow `/research`: current-year resilience patterns for the detected stack (retry/backoff
libraries, circuit-breaker options, idempotency-key conventions, the platform's rate-limit
primitives). Anchor to installed versions.

---

## Phase 2 — Resilience matrix (per external call / mutation / endpoint)  [HIGH freedom; greps LOW]

For each surface, mark **Implemented / Partial / Missing** with `file:line`:

| Concern | What to check | Why it matters |
|---|---|---|
| **Timeout** | Every outbound call has an explicit timeout | No timeout = hung requests exhaust the pool |
| **Retry + backoff** | Transient failures retried with exponential backoff **+ jitter**, capped | Naive retries cause retry storms |
| **Circuit breaker** | Repeated downstream failure trips a breaker / stops hammering | Prevents cascading failure |
| **Idempotency** | Writes/webhooks/payments use an idempotency key or dedupe | Prevents double-charge / double-write on retry |
| **Rate limiting** | Public/expensive endpoints are rate-limited per client | Prevents abuse and cost blowups |
| **Cancellation** | Long/aborted requests are cancellable (`AbortSignal`/context) | Frees resources on navigation/timeout |
| **Graceful degradation** | Fallback/empty/cached path when a dependency is down | App stays usable, not white-screen |
| **Error propagation** | Failures surface as structured errors, not swallowed | Silent catch hides outages |

```bash
rg -n "timeout|AbortController|AbortSignal|signal:" -g "*.{ts,tsx,js}" -c   # timeouts/cancellation
rg -n "retry|backoff|p-retry|exponential|jitter" -g "*.{ts,tsx,js,py}" -c    # retry policy
rg -n "idempotenc|dedupe|Idempotency-Key" -g "*.{ts,tsx,js,py}" -c           # idempotency
rg -n "rate.?limit|rateLimit|throttle|Ratelimit" -g "*.{ts,tsx,js,py}" -c    # rate limiting
rg -n "catch\s*\([^)]*\)\s*\{\s*\}" -g "*.{ts,tsx,js}"                        # empty catch (swallowed errors)
```

---

## Phase 3 — Observability & sensitive-data handling  [HIGH freedom; PII grep LOW]

| Concern | What to check |
|---|---|
| **Audit logging** | Sensitive/mutating actions (auth, payment, role change, delete) are logged with actor + timestamp |
| **PII in logs** | No emails/tokens/card data/passwords logged in plaintext; redaction in place |
| **Structured errors** | Errors carry codes/context (not bare strings); correlation/trace id present |
| **Health/timeouts surfaced** | Failures are observable (Sentry/logs), not only user-visible |

```bash
rg -n "password|token|secret|email|ssn|card|cvv" -g "*.{ts,tsx,js,py}" | rg -n "log|console|print"
```

---

## Phase 4 — Prioritized report (read-only)  [HIGH freedom]

```markdown
## Resilience Audit — [repo] — [date]
**Surfaces:** [N outbound calls · M mutations · K webhooks/payments · queues/cron]

### Critical (data loss / double-charge / outage risk)
| Gap | Surface | file:line | Fix via |
|---|---|---|---|
| No idempotency key on payment webhook | /api/webhooks/stripe | ... | backend-patterns |

### High / Medium
| Concern | Implemented | Partial | Missing | Fix via |
|---|---|---|---|---|
| Timeouts | [n] | [n] | [n] | backend-error-handling |
| Retry+backoff | ... | ... | ... | backend-patterns |
| PII in logs | ... | ... | ... | backend-observability |

### Recommended order
1. [Critical idempotency/timeout gaps] → backend-patterns / backend-error-handling
2. [Rate limiting + LLM cost] → plan-llm-cost-guardrails
3. [Observability + PII redaction] → backend-observability
```

**Forbidden:** claiming production-readiness from passing tests alone; treating an empty
`catch` as handled; skipping the payment/webhook idempotency check.

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Evidenced** — `file:line` on the call, not "probably has a timeout"
2. **Reproducible** — the Phase 0/2 grep still hits that surface
3. **Severity justified** — Critical = double-charge / data-loss / pool-exhaust
4. **Right owner** — implement via `backend-patterns` / `backend-error-handling`; LLM quota → `plan-llm-cost-guardrails`
5. **No-false-safety** — passing tests ≠ production-ready; empty `catch` ≠ handled

## Related

- `backend-error-handling` — implement timeouts, retries, structured errors, fallbacks
- `backend-patterns` — circuit breakers, idempotency, queue/retry architecture
- `backend-observability` — audit logging, PII redaction, tracing, alerting
- `plan-llm-cost-guardrails` — rate limiting + quota abuse for LLM/expensive endpoints
- `plan-input-validation` — the trust-boundary validation side of hardening
- `plan-data-integrity` — destructive-op and data-loss protections
- `test-load` — prove timeouts/retries under concurrent traffic
- `audit-ui-states` — front-end empty/error/offline rendering
- `complete-everything` — close the audited gaps to done with verification
