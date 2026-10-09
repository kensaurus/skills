---
name: audit-backend-architecture
description: >
  Read-only backend-architecture audit and pattern advisor, gated by stack.
  Use when "audit backend architecture", "which pattern should I use", "am I
  over-engineering", or "sync vs event-driven". Enforced boundaries →
  enhance-arch-boundaries.
license: MIT
effort: high
---

# audit-backend-architecture — Distributed-Systems Pattern Maturity Audit

**Degree of freedom: MIXED** — Fit, presence, and adopt/defer `[HIGH freedom]`;
Phase 0 topology probes `[LOW freedom — run exactly]`. Never mark a
pattern Missing if its tier is N/A.

Read-only. Assess and recommend; do not change code. Per-call timeouts,
retry+jitter, idempotency keys, cancellation → **`audit-resilience`**. This
skill checks whether the *patterns* exist and whether they *fit*.

Two lenses:

1. **Conformance** (Phase 2) — Implemented / Partial / Missing / N/A with `file:line`.
2. **Fit / decision** (Phase 3) — Adopt now / Adopt when [trigger] / Defer
   (premature). *"Don't build this yet"* is a first-class finding.

---

## Core principle — start simple, earn every pattern

Each pattern solves a *specific* problem and carries a *specific* cost. The current
consensus is **modular-monolith-first**: >90% of systems are well served by a
well-structured monolith; **premature decomposition is the #1 failure mode**. A
pattern is "Missing" only if the **measurable trigger** is present — otherwise
adopting it is over-engineering, flagged as loudly as a real gap.

- **Fit beats presence.** "No service mesh / no CQRS" is a finding *only* when a trigger is present.
- **Decide per interaction, not per system.** Sync vs event-driven is chosen per
  boundary-crossing call (see references/patterns.md → Communication style).
- **Distributed monolith is worse than a monolith.** Shared DB + coupled deploys
  pays the distributed tax with none of the independence.
- **Reversible steps.** Prefer modular monolith, façade, outbox over premature
  service split or event-sourcing everywhere.

## How to reason — Observe → Interpret → Classify → Severity

1. **Observe** — topology signals + the `file:line` (or "searched, none found")
2. **Interpret** — is there a present pain, a named future trigger, or no trigger?
3. **Classify** — Implemented / Partial / Missing / N/A, then Adopt now / Adopt when / Defer
4. **Severity** — dual-write, cascade-outage, silent inconsistency = Critical; Missing with no trigger = over-engineering, not a gap

## Worked example

> **Observe:** T1 Next.js + Supabase. `orders/service.ts` writes the row then
> publishes to a queue in a second step. Product page hits the DB on every
> request. No k8s, mesh, or multi-service fleet.
> **Interpret:** a crash between write and publish loses the fulfillment event
> (dual-write). Hot reads have no cache. Mesh and CQRS have no trigger.
> **Classify:** Outbox = Adopt now; cache-aside = Adopt now; mesh / CQRS = Defer (T1 N/A).
> **Severity:** Critical for dual-write; High for the uncached hot path.
> **Finding:** Outbox (#6) | orders/service.ts | Critical | Adopt now — close
> dual-write. Mesh | N/A (T1) | Defer — no 10+ service fleet.

---

## Phase 0 — Detect topology (gates every later finding)  [LOW freedom — run exactly]

Architecture advice is only correct in context. Flagging "no service mesh" on a
Next.js + Supabase app is noise; missing it on a 40-service Kubernetes fleet is
critical. **Classify the repo first**, then apply only the patterns that fit.
Never report a pattern as "Missing" if its topology tier is `N/A`.

```bash
# Deploy target / runtime
rg -n --hidden -g '!node_modules' -l "vercel\.json|netlify\.toml|next\.config|supabase/config" # serverless/PaaS
fd -H -t f 'Dockerfile|docker-compose\.ya?ml|Containerfile'                                     # containers
fd -H -t d 'k8s|kustomize|charts|helm' ; rg -n "apiVersion:\s*(apps|networking)" -g '*.{yaml,yml}' -l # kubernetes
# Service count / boundaries
fd -H -t f 'package.json|go.mod|pyproject.toml|pom.xml|Cargo.toml' | rg -v node_modules         # count deployable units
# Messaging / eventing
rg -n "kafka|rabbitmq|amqp|nats|sqs|sns|pubsub|kinesis|redpanda|temporal|inngest|trigger\.dev" -l
# Inter-service transport
rg -n "grpc|@grpc|protobuf|\.proto|graphql|apollo|federation|trpc" -l
# Mesh / gateway infra
rg -n "istio|linkerd|consul|envoy|kong|apisix|traefik|nginx-ingress|api-?gateway|ztunnel|waypoint" -l
```

Record a **topology profile** and pick the tier:

| Tier | Signals | Patterns in scope |
|---|---|---|
| **T1 — Serverless / modular monolith** | single deployable, Next/Supabase/edge fns, no broker | Gateway concerns (as middleware), BFF-lite, circuit breaker, idempotency/outbox-lite, hexagonal, strangler, tracing/SLO, contract tests |
| **T2 — Containers, few services** | Dockerfiles, 2–10 services, maybe a broker | + real gateway, BFF-per-client, bulkhead, outbox+relay, saga, backpressure, ACL, mTLS |
| **T3 — Kubernetes / microservices / event-driven** | k8s manifests, broker, gRPC/federation, 10+ services | + sidecar/service mesh (ambient), CQRS/event-sourcing, cell-based, full saga orchestration, CDC |

If there are **no** backend services (static site / pure frontend), stop and report reduced
applicability — hand any API-client concerns to `audit-fe-api`.

---

## Phase 1 — Research current patterns  [HIGH freedom]

Follow `/research`: confirm current-year conventions and the *installed* libraries for the detected
stack (gateway/proxy, breaker/bulkhead libs, outbox/CDC tooling, saga/workflow engines, mesh mode).
Anchor recommendations to versions actually in the manifest — never propose a library the repo can't
run.

---

## Phase 2 — Architecture maturity matrix  [HIGH freedom]

For **each in-scope pattern**, mark `Implemented / Partial / Missing / N/A` with `file:line`, a
one-line "why it matters", and the fix-delegate. **Detailed detection commands, "good vs. red-flag"
signals, and fix targets for every pattern are in [references/patterns.md](references/patterns.md)** —
load it and work through the applicable rows.

| # | Pattern | Tier | This audit checks (structural) | Fix via |
|---|---|---|---|---|
| 1 | **API gateway** | T1+ | Auth, rate-limit, CORS, transform, logging, monitoring, caching enforced in **one** edge layer, not per-route copy-paste | `backend-patterns`, `audit-security` |
| 2 | **BFF / API composition** | T1+ | Per-client shaping vs. one general API; over/under-fetch; who owns aggregation; federation at 5+ teams | `backend-patterns`, `design-api` |
| 3 | **Circuit breaker** | T1+ | A breaker exists around downstream calls (presence/architecture only) | `audit-resilience` → `backend-patterns` |
| 4 | **Bulkhead** | T2+ | Per-dependency resource pools; one slow dep can't exhaust shared pool | `backend-patterns` |
| 5 | **Backpressure / load shedding** | T2+ | Queue-based load leveling, bounded queues, shed/429 under overload | `backend-patterns` |
| 6 | **Outbox + relay/CDC** | T1+ | Dual-write closed: state + event commit atomically; relay (poll/Debezium) publishes | `backend-patterns` |
| 7 | **Saga** | T2+ | Multi-service workflows use local txns + **compensation**; saga-pivot ordering; orchestration vs choreography | `backend-patterns` |
| 8 | **CQRS + event sourcing** | T3 (selective) | Applied only where read/write loads diverge; immutable event log + materialized views | `backend-patterns`, `audit-db-schema` |
| 9 | **Hexagonal / ports-and-adapters** | T1+ | Domain logic isolated from framework/IO behind ports; adapters swappable; testable without infra | `workflow-refactor`, `backend-patterns` |
| 10 | **Anti-corruption layer** | T2+ | 3rd-party/legacy models translated at the boundary, not leaked into the domain | `backend-patterns` |
| 11 | **Strangler-fig migration** | any (if legacy) | Incremental replacement behind a façade vs. big-bang rewrite | `workflow-refactor` |
| 12 | **Sidecar / service mesh** | T3 | mTLS, retries, L7 policy via mesh; prefer **ambient/sidecarless** for net-new; not hand-rolled per service | `backend-patterns`, `audit-security` |
| 13 | **Cell-based architecture** | T3 (scale) | Blast-radius isolation, shared-nothing cells, cell-scoped routing/identity | `backend-patterns` |
| 14 | **Zero-trust / mTLS / service identity** | T2+ | Service-to-service auth, no implicit trust inside the network | `audit-security` |
| 15 | **Distributed tracing + SLOs** | T1+ | OpenTelemetry trace/correlation IDs across hops; RED/USE metrics; SLOs/error budgets | `backend-observability` |
| 16 | **Contract testing** | T2+ | Consumer-driven contracts (Pact/OpenAPI) between clients↔BFF and service↔service | `test-unit`, `audit-fe-api` |

### Communication & data-flow choices (decide per interaction, not per system)

These are *selection* decisions, not "missing features" — the answer depends on each interaction and
the stage. Detection + trade-offs in references/patterns.md.

| # | Pattern | Tier | This audit checks | Fix via |
|---|---|---|---|---|
| 17 | **Communication style** (sync request/response vs async event-driven) | T1+ | Each cross-boundary call fits the interaction: sync for "need the answer now / strong consistency / query"; async for "multiple reactors / independent scaling / background". Symptom to flag: one request making 5 blocking downstream calls | `backend-patterns` |
| 18 | **Cache-aside** | T1+ | Hot read-heavy paths (product/profile/config) check cache→DB-on-miss with a TTL/invalidation story; no stale-forever or thundering-herd | `backend-patterns`, `backend-db-performance` |
| 19 | **Database-per-service / data ownership** | T2+ (owned schemas at T1) | Each service/module owns its data; no cross-service table reads. **Anti-pattern:** shared DB + coupled deploys = distributed monolith | `backend-patterns`, `audit-db-schema` |

Rules:
- **Evidence or it didn't happen** — every verdict cites `file:line` or "searched, none found".
- **N/A is a first-class verdict** — record *why* (topology tier), don't silently drop a row.
- **Don't double-count** `audit-resilience`'s per-call concerns; link to it instead.

---

## Phase 3 — Decide: fit, not just presence  [HIGH freedom]

A pattern being "Missing" is only actionable if the codebase has the **trigger** that justifies it.
For every candidate pattern, classify it into one of three buckets from the detected symptoms:

- **Adopt now** — a real, present pain maps to this pattern (evidence: `file:line` + the symptom).
- **Adopt when [trigger]** — not yet, but name the concrete signal that should flip it on.
- **Defer (premature)** — no trigger present; adopting now is over-engineering. Say so plainly.

### Maturity ladder (climb only when the rung's trigger fires)

| Stage | Shape | Add these when the trigger appears |
|---|---|---|
| **0. Modular monolith** | one deploy, clean module boundaries, owned schemas | this is the correct default for most systems |
| **1. Fast & reliable monolith** | + **cache-aside** (read latency/DB load), **outbox** (dual-write), sync request/response with timeouts + a breaker | reads are hot / an event must not be lost |
| **2. Decoupled** | + **async event-driven** for side effects, **BFF** per client, **CQRS** on the *one* read/write-divergent area | a request fans out to many blocking calls; reads & writes scale differently |
| **3. Distributed** | + **database-per-service**, **saga** for multi-step transactions, **backpressure** | a module needs independent deploy/scale; a workflow spans services |
| **4. Fleet** | + **service mesh** (ambient), **cell-based**, full orchestration | 10+ services, ~50+ engineers, blast-radius/residency needs |

### Symptom → pattern (the decision table)

| Observed symptom | Likely pattern | Not this (yet) |
|---|---|---|
| Repeated 100ms DB hits on hot read paths | **cache-aside** | CQRS, read replicas |
| DB write + broker publish as two steps | **outbox (+CDC)** | 2PC, event sourcing |
| One request makes 5 blocking downstream calls | **async event-driven** for non-critical hops | full EDA rewrite |
| Reads and writes scale/optimize very differently | **CQRS** on that slice | event sourcing everywhere |
| Multi-step transaction across services can half-complete | **saga + compensation** | distributed 2PC |
| Modernizing a legacy system with risk | **strangler-fig** behind a façade | big-bang rewrite |
| Two teams blocked on one deploy cadence | **database-per-service** split | service-per-noun |
| Services share tables and deploy together | **fix the distributed monolith** (own schemas first) | more services |

**Over-engineering guardrails (flag these as findings too):**
- CQRS / event sourcing where reads and writes don't actually diverge → remove complexity.
- Microservices / mesh / cell-based below the size + differential-scaling threshold → stay modular monolith.
- Wholesale event-driven for simple two-party interactions → a single durable queue (or a sync call) is enough.
- A split that produces a distributed monolith (shared DB, coupled deploys) → worse than the monolith.

---

## Phase 4 — Prioritized report + decision (read-only)  [HIGH freedom]

```markdown
## Backend Architecture Audit — [repo] — [date]
**Topology:** [tier + evidence: N services · broker? · k8s? · transport]
**Stage on the ladder:** [0–4]  ·  **In scope:** [patterns]  ·  **N/A (out of tier):** [list + why]

### Adopt now (present pain → pattern, with evidence)
| Pattern | Symptom (file:line) | Payoff | Fix via |
|---|---|---|---|
| Cache-aside | product page: 100ms DB read per request, no cache (api/products.ts:40) | ~10ms cached reads, DB load ↓ | backend-patterns |

### Adopt when (named trigger, not yet)
| Pattern | Trigger to watch for |
|---|---|
| Database-per-service | orders + billing need independent deploy cadence / separate teams |

### Defer — would be over-engineering now
| Pattern | Why premature |
|---|---|
| CQRS / event sourcing | reads and writes don't diverge; a repository is simpler |
| Service mesh / cell-based | single modular deploy; no 10+-service fleet |

### Critical (data loss / cascading outage / silent inconsistency)
| Gap | Pattern | file:line | Why it bites in prod | Fix via |
|---|---|---|---|---|
| Payment writes DB then publishes to Kafka separately | Outbox (#6) | orders/service.ts:88 | Dual-write: crash between = paid order, no fulfillment event | backend-patterns |
| No breaker/bulkhead around payment provider | #3/#4 | ... | One slow provider exhausts the pool → whole API 503s | audit-resilience/backend-patterns |

### High / Medium (maturity matrix)
| Pattern | Implemented | Partial | Missing | N/A | Fix via |
|---|---|---|---|---|---|
| API gateway | ... | ... | ... | | backend-patterns |
| BFF / composition | ... | ... | ... | | design-api |
| Hexagonal | ... | ... | ... | | workflow-refactor |

### Lift-to-production roadmap (ordered)
1. Close dual-write with Outbox (+ idempotent consumers) → backend-patterns
2. Breaker + bulkhead on every external dependency → audit-resilience → backend-patterns
3. Centralize gateway concerns (auth/rate-limit/CORS/logging) → backend-patterns / audit-security
4. Distributed tracing + SLOs before scaling → backend-observability
5. [T3] Adopt ambient mesh for mTLS/L7 instead of hand-rolled retries → backend-patterns
```

**Forbidden:** declaring "production-grade" from passing tests alone; flagging T3-only patterns
(mesh, cell-based, CQRS) against a T1 monolith; re-auditing per-call timeouts/retries that
`audit-resilience` owns; recommending a saga without compensation logic; recommending CQRS/event
sourcing where read and write loads don't actually diverge; **recommending any pattern without naming
its trigger** (fit before presence — a "Missing" with no trigger is over-engineering, not a gap);
recommending a service split that yields a **distributed monolith** (shared DB + coupled deploys).

---

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Evidenced** — `file:line` or "searched, none found", not "they probably need a mesh"
2. **Tier respected** — T3-only rows are N/A on T1, with why
3. **Trigger named** — every Adopt now / Adopt when / Defer cites a symptom or its absence
4. **Right owner** — per-call timeout/retry → `audit-resilience`; mechanical layer rules → `enhance-arch-boundaries`
5. **Nothing changed** until approved

## Related

- `audit-resilience` — per-call runtime resilience (timeouts, retry+backoff+jitter, idempotency keys, cancellation, PII); this audit defers those to it
- `backend-patterns` — implement the architecture: gateway, BFF, outbox, saga, bulkhead, hexagonal (see its `references/architecture-patterns.md`)
- `design-api` — API contract, versioning, error shapes, pagination
- `audit-security` — auth, CORS, rate-limit-as-abuse-control, mTLS/zero-trust, injection
- `backend-observability` — tracing, correlation IDs, RED/USE metrics, SLOs, PII redaction
- `audit-db-schema` — the data-model side of CQRS / event sourcing / outbox tables / db-per-service
- `backend-db-performance` — cache-aside, query optimization, read replicas for hot paths
- `workflow-refactor` — hexagonal restructure and strangler-fig migration; modular-monolith boundaries
- `complete-everything` — close the audited gaps to done with verification
