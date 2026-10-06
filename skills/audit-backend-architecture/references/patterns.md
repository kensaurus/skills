# Backend architecture patterns — detection reference

Per-pattern detection for `audit-backend-architecture`. For each in-scope pattern (per the Phase 0
topology tier) mark **Implemented / Partial / Missing / N/A** with `file:line`. Detection commands use
ripgrep (`rg`); adapt globs to the stack. Cross-skill fix targets are named in backticks (not links).

## Contents

- 1. API Gateway  · Applies: T1+
- 2. BFF / API composition / GraphQL federation  · Applies: T1+
- 3. Circuit breaker  · Applies: T1+  · (defers to `audit-resilience`)
- 4. Bulkhead  · Applies: T2+
- 5. Backpressure / load shedding / queue-based load leveling  · Applies: T2+
- 6. Outbox + relay/CDC  · Applies: T1+
- 7. Saga  · Applies: T2+
- 8. CQRS + event sourcing  · Applies: T3 (selective)
- 9. Hexagonal / ports-and-adapters  · Applies: T1+
- 10. Anti-corruption layer (ACL)  · Applies: T2+
- 11. Strangler-fig migration  · Applies: any (only if a legacy system is being replaced)
- 12. Sidecar / service mesh  · Applies: T3
- 13. Cell-based architecture  · Applies: T3 (scale / residency)
- 14. Zero-trust / mTLS / service identity  · Applies: T2+
- 15. Distributed tracing + SLOs  · Applies: T1+
- 16. Contract testing  · Applies: T2+
- 17. Communication style — sync request/response vs async event-driven  · Applies: T1+
- 18. Cache-aside (lazy loading)  · Applies: T1+
- 19. Database-per-service / data ownership  · Applies: T2+ (owned schemas already matter at T1)
- Decision framework — fit before presence (used in Phase 3)


Legend — **Applies:** lowest topology tier where the pattern is in scope (T1 serverless/monolith ·
T2 containers/few-services · T3 k8s/microservices/event-driven).

---

## 1. API Gateway  · Applies: T1+

**Purpose.** One edge layer owns cross-cutting concerns for all clients: authentication, rate
limiting, CORS, request/response transformation, structured logging, monitoring, and caching. The
failure mode is these being copy-pasted per route/function and drifting.

**Detect**
```bash
rg -n "cors\(|Access-Control-Allow" -g '*.{ts,js,py,go}'          # CORS: central vs per-handler
rg -n "verifyJwt|requireAuth|getSession|auth\(\)|withAuth" -g '*.{ts,js}' -c   # auth check spread
rg -n "ratelimit|rateLimit|Ratelimit|throttle" -g '*.{ts,js,py}' -c
rg -n "kong|apisix|traefik|envoy|nginx|api-?gateway|middleware" -l
```
**Good.** Auth/rate-limit/CORS/logging applied once in shared middleware or a gateway (Kong/APISIX/
Traefik/Envoy, Next middleware, an edge layer); consistent error shape; cache headers/TTL centralized.
**Red flags.** `Access-Control-Allow-Origin: *` per handler; auth re-implemented in each route; no
single place to add a rate limit; logging ad hoc per function.
**Fix via** `backend-patterns` (middleware/gateway), `audit-security` (authz/CORS correctness).

---

## 2. BFF / API composition / GraphQL federation  · Applies: T1+

**Purpose.** A client-specific layer shapes payloads per surface (web/mobile/partner) so clients
don't over/under-fetch. Owned by the client team; sits **behind** the gateway (gateway = policy, BFF =
shaping). At 5+ domain teams, GraphQL federation replaces N hand-rolled BFFs.
**Detect**
```bash
fd -H 'bff|for-frontend|edge-api' ; rg -n "aggregat|composition|orchestrat" -g '*.{ts,js}' -l
rg -n "graphql|apollo|@apollo/gateway|federation|subgraph|trpc" -l
```
**Good.** Distinct shaping for distinct clients OR a single shared API that genuinely serves all
clients equally; aggregation isolated from domain logic; N+1 handled (batch/DataLoader).
**Red flags.** Mobile forced to consume a heavy web payload; auth/throttling re-done inside each BFF
(that's gateway work); a "general-purpose API" bent painfully to every client; distributed joins in
the client.
**Fix via** `backend-patterns` (composition), `design-api` (contract/versioning).

---

## 3. Circuit breaker  · Applies: T1+  · (defers to `audit-resilience`)

**Purpose.** Repeated downstream failure trips a breaker so callers fail fast instead of piling up
threads waiting on a dead dependency (cascading failure). **This audit only confirms a breaker exists
architecturally around each external dependency** — per-call tuning belongs to `audit-resilience`.
**Detect**
```bash
rg -n "circuit.?breaker|CircuitBreaker|opossum|cockatiel|resilience4j|polly|hystrix|gobreaker" -g '*.{ts,js,py,go,java,cs}' -c
```
**Good.** Every synchronous outbound dependency wrapped; breaker has a fallback; half-open recovery.
**Red flags.** Bare `fetch`/`axios` to a third party with no breaker and no timeout; retries without a
breaker (retry storm).
**Fix via** `audit-resilience` (full runtime review) → `backend-patterns`.

---

## 4. Bulkhead  · Applies: T2+

**Purpose.** Isolate resource pools (threads, connections, concurrency) per dependency so one slow
service can't exhaust system-wide capacity. The ship's-hull metaphor: one flooded compartment doesn't
sink the vessel.
**Detect**
```bash
rg -n "semaphore|bulkhead|maxConcurren|pool.?size|poolSize|Sema(phore)?\(|limit.?concurrency|p-limit" -g '*.{ts,js,py,go,java}' -c
rg -n "max_connections|connectionLimit|pool" -g '*.{ts,js,py,go,ini,toml,yaml}' -c   # DB/HTTP pools
```
**Good.** Separate connection/thread pools or concurrency limits per downstream; a saturated
dependency degrades only its own calls.
**Red flags.** One global HTTP client / DB pool shared by fast and slow dependencies; unbounded
concurrency to any single dependency.
**Fix via** `backend-patterns`.

---

## 5. Backpressure / load shedding / queue-based load leveling  · Applies: T2+

**Purpose.** Under overload, absorb bursts through a bounded queue and **shed** excess (429/503 fast)
instead of accepting unbounded work and collapsing.
**Detect**
```bash
rg -n "queue|bull|bee-queue|sqs|rabbitmq|kafka|backpressure|highWaterMark|drop|shed|429|Retry-After" -g '*.{ts,js,py,go}' -c
```
**Good.** Bounded queues; producer slows or requests rejected with `Retry-After` when full; async
load leveling between spiky producers and steady consumers.
**Red flags.** Unbounded in-memory queues/arrays growing under load; accepting all traffic then OOM;
no 429 path.
**Fix via** `backend-patterns`.

---

## 6. Outbox + relay/CDC  · Applies: T1+

**Purpose.** Solve the **dual-write problem**: writing business state to the DB *and* publishing an
event to a broker as two separate operations means one can succeed and the other fail. The outbox
writes the event to an outbox table **in the same transaction** as the state change; a relay
(polling, or Debezium CDC off the WAL) publishes it afterward.
**Detect**
```bash
rg -n "outbox|transactional.?outbox|debezium|cdc|wal|logical.?replication" -g '*.{ts,js,py,go,sql}' -l
# Red-flag heuristic: DB write and broker publish adjacent, not in one txn
rg -n "publish|producer\.send|sqs.*send|kafka.*produce|emit\(" -g '*.{ts,js,py,go}' -C3
```
**Good.** State + event in one ACID transaction; relay publishes and marks sent; consumers idempotent
(dedup window 24–72h) for at-least-once delivery.
**Red flags.** `await db.save(x); await broker.publish(evt)` with no shared transaction; "we'll retry
the publish" with no durable record; fire-and-forget events after a commit.
**Fix via** `backend-patterns` (outbox + relay), `audit-db-schema` (outbox table/index).

---

## 7. Saga  · Applies: T2+

**Purpose.** Multi-service business transactions without 2PC: a sequence of local transactions, each
triggering the next, with **compensating transactions** to undo prior steps on failure. Choreography
(events, <5 linear steps) vs orchestration (Temporal/Step Functions/Camel — branching, per-step
timeout/retry, synchronous result). Respect the **saga pivot**: compensatable steps before the
irreversible pivot (e.g. payment capture); retriable steps after — once past the pivot, run to
completion, don't compensate.
**Detect**
```bash
rg -n "saga|compensat|orchestrat|temporal|stepfunction|state.?machine|workflow" -g '*.{ts,js,py,go,java}' -l
```
**Good.** Each step commits locally + emits; compensation coded as deliberately as the happy path;
stuck-saga timeout detection; observability (saga age, compensation rate, DLQ).
**Red flags.** Multi-service writes with no rollback story; assuming distributed atomicity; a "saga"
with no compensation; compensating an irreversible step.
**Fix via** `backend-patterns` (+ pair with Outbox #6 so step events actually publish).

---

## 8. CQRS + event sourcing  · Applies: T3 (selective)

**Purpose.** Separate the write model (commands → events) from read models (materialized views).
Event sourcing stores state as an immutable event log (replayable, auditable). **Apply only where
read and write loads genuinely diverge** — it is not a default.
**Detect**
```bash
rg -n "cqrs|command.?handler|query.?handler|event.?store|eventsourc|projection|materializ|aggregate" -g '*.{ts,js,py,go,java,cs}' -l
```
**Good.** CQRS scoped to high-divergence areas; read models rebuilt from events; clear command/query
split.
**Red flags.** CQRS/event-sourcing applied everywhere "because microservices" (accidental
complexity); projections with no rebuild path; event log mutated in place.
**Fix via** `backend-patterns`, `audit-db-schema`.

---

## 9. Hexagonal / ports-and-adapters  · Applies: T1+

**Purpose.** Domain/business logic depends on **ports** (interfaces), never directly on framework, DB,
or HTTP. Adapters implement ports at the edges. Result: logic is testable without infrastructure and
the framework/vendor is swappable.
**Detect**
```bash
rg -n "port|adapter|domain/|application/|infrastructure/|hexagonal|ports.?and.?adapters" -l
# Leak heuristic: framework/ORM imports inside domain/business layers
rg -n "import .*(express|next|prisma|supabase|axios|fetch)" -g 'src/{domain,core,application}/**' 
```
**Good.** Domain layer imports no framework/IO; repositories/gateways behind interfaces; unit tests
run with in-memory adapters, no DB.
**Red flags.** Prisma/Supabase/HTTP clients imported straight into business logic; controllers with
domain rules inline; can't test a use-case without spinning up the DB.
**Fix via** `workflow-refactor` (restructure), `backend-patterns`.

---

## 10. Anti-corruption layer (ACL)  · Applies: T2+

**Purpose.** Translate a third-party or legacy model into your domain's language at the boundary, so
their schema/quirks don't leak into and corrupt your model (DDD).
**Detect**
```bash
rg -n "anti.?corruption|acl|translat|mapper|adapter|dto|normaliz" -g '*.{ts,js,py,go}' -l
```
**Good.** External payloads mapped to internal types at one boundary; domain never references vendor
field names/shapes.
**Red flags.** Stripe/Salesforce/legacy JSON shapes passed raw through the domain; vendor enums used
as domain enums.
**Fix via** `backend-patterns`.

---

## 11. Strangler-fig migration  · Applies: any (only if a legacy system is being replaced)

**Purpose.** Incrementally replace a legacy system behind a façade/router — route slice by slice to
the new implementation — instead of a risky big-bang rewrite.
**Detect**
```bash
rg -n "legacy|strangler|proxy|facade|feature.?flag|routing|v1|v2|deprecat" -g '*.{ts,js,py,go,yaml}' -l
```
**Good.** A façade routes traffic; new/old coexist; slices migrated + verified incrementally;
decommission plan.
**Red flags.** A months-long rewrite branch with no incremental cutover; old and new diverging with
no router.
**Fix via** `workflow-refactor` (+ `workflow-feature-flag` for gated cutover).

---

## 12. Sidecar / service mesh  · Applies: T3

**Purpose.** Offload mTLS, retries, timeouts, L7 routing/traffic-splitting, and telemetry to a mesh
instead of hand-rolling them in every service. Prefer **ambient / sidecarless** (e.g. Istio
ambient: node-level ztunnel for mTLS + optional per-namespace waypoint proxies for L7) over per-pod
sidecars for net-new clusters.
**Detect**
```bash
rg -n "istio|linkerd|consul-connect|envoy|ztunnel|waypoint|sidecar|VirtualService|DestinationRule|PeerAuthentication" -g '*.{yaml,yml}' -l
```
**Good.** mTLS + identity-based authz from the mesh; retries/circuit-breaking/traffic-splitting via
mesh policy; consistent observability; ambient mode for new clusters.
**Red flags.** Every service hand-rolling mTLS/retries/telemetry; classic per-pod sidecars adopted
for a net-new cluster without reason; no service identity.
**Fix via** `backend-patterns`, `audit-security` (mTLS/zero-trust).

---

## 13. Cell-based architecture  · Applies: T3 (scale / residency)

**Purpose.** Partition the system into shared-nothing **cells** (own compute + data + config) mapped
to regions/tenant tiers, so a failure or noisy neighbor is contained to one cell's blast radius.
Regional/tenant routing directs users to their cell.
**Detect**
```bash
rg -n "cell|shard|tenant|region|partition|blast.?radius|shuffle.?shard" -g '*.{ts,js,py,go,yaml,tf}' -l
```
**Good.** Cells share nothing at runtime; same artifact deployed to all cells; cell-scoped
identity/routing; centralized observability with cell labels.
**Red flags.** One global cluster/DB as a single failure domain at scale; cross-cell runtime coupling;
no per-cell routing.
**Fix via** `backend-patterns` (usually an infra/platform initiative — flag, don't force).

---

## 14. Zero-trust / mTLS / service identity  · Applies: T2+

**Purpose.** No implicit trust inside the network: services authenticate each other (mTLS + workload
identity), not "it's on the VPC so it's fine".
**Detect**
```bash
rg -n "mtls|mutual.?tls|spiffe|spire|PeerAuthentication|serviceaccount|workload.?identity|client.?cert" -l
```
**Good.** Service-to-service calls authenticated; secrets scoped per workload; internal endpoints not
implicitly trusted.
**Red flags.** Internal APIs with no auth ("private network"); shared god-tokens between services;
plaintext internal traffic.
**Fix via** `audit-security` (+ mesh #12 for enforcement).

---

## 15. Distributed tracing + SLOs  · Applies: T1+

**Purpose.** A request is traceable across hops (OpenTelemetry trace/correlation IDs); RED
(Rate/Errors/Duration) and USE (Utilization/Saturation/Errors) metrics exist; SLOs and error budgets
define "healthy".
**Detect**
```bash
rg -n "opentelemetry|@opentelemetry|otel|traceparent|trace.?id|correlation.?id|x-request-id|span|SLO|error.?budget" -g '*.{ts,js,py,go}' -l
```
**Good.** Trace/correlation ID propagated end-to-end; spans around external calls; dashboards +
alerts; SLOs defined before scaling.
**Red flags.** Logs with no correlation ID; can't follow a request across services; alerting on
symptoms only; no SLO.
**Fix via** `backend-observability`.

---

## 16. Contract testing  · Applies: T2+

**Purpose.** Consumer-driven contracts (Pact) or schema contracts (OpenAPI/GraphQL) verify that
clients↔BFF and service↔service agree, so an upstream change can't silently break a downstream.
**Detect**
```bash
rg -n "pact|contract.?test|openapi|swagger|schemathesis|dredd|json.?schema|consumer.?driven" -l
```
**Good.** Contracts versioned + verified in CI; provider verification gates deploys; breaking changes
caught before release.
**Red flags.** Integration relies on manual testing; "it worked in staging"; no schema/contract
between producer and consumer.
**Fix via** `test-unit` (write/verify), `audit-fe-api` (FE↔BE contract drift).

---

## 17. Communication style — sync request/response vs async event-driven  · Applies: T1+

**Purpose.** Choose the model **per interaction that crosses a boundary**, not for the whole system.
Sync (REST/gRPC) trades loose coupling for immediate certainty; async (queue/pub-sub) trades certainty
for decoupling and independent scaling. Mature systems are hybrid: sync at the edge, async for side
effects, bridged by the outbox (#6).
**Decide** — signals that point each way:

| Signal | Leans |
|---|---|
| Caller needs an immediate success/failure answer | **sync** request/response |
| Strong consistency is a hard business requirement | **sync** |
| The interaction is a simple, well-known two-party contract; it's a query | **sync** (REST for edge/cacheable, gRPC for internal high-throughput) |
| Multiple unrelated services must react to the same fact | **async** event-driven (pub/sub) |
| Producer and consumer scale / fail independently; work is background | **async** (queue for one consumer, event stream for many) |
| New consumers should be addable without changing the producer | **async** |

**Detect**
```bash
rg -n "fetch\(|axios|got\(|httpx|HttpClient|grpc|\.rpc\(" -g '*.{ts,js,py,go}' -c        # sync calls
rg -n "publish|emit\(|producer\.send|queue|kafka|rabbitmq|sqs|sns|nats|pubsub|EventBridge" -c  # async
# Anti-pattern heuristic: many blocking downstream calls inside one handler
rg -n "await .*(fetch|axios|rpc|client\.)" -g '*.{ts,js}' -C1
```
**Good.** Each cross-boundary call matches the interaction; a durable queue/DLQ for async; sync calls
have timeouts + a breaker (see `audit-resilience`).
**Red flags.** One request making 5+ blocking downstream calls (should be async/parallel); wholesale
EDA for a simple two-party call (needless complexity); async with no dead-letter queue (silent loss);
"everything sync" (cascading failure) or "everything async" (eventual consistency + debugging pain
everywhere).
**Fix via** `backend-patterns` (see references/architecture-patterns.md → sync-vs-async).

---

## 18. Cache-aside (lazy loading)  · Applies: T1+

**Purpose.** For hot, read-heavy, tolerably-stale data (product details, user profile, config), check
the cache first; on a miss, read the DB and populate the cache. Turns ~100ms DB reads into ~10ms cache
reads and sheds DB load. The correctness lives in **invalidation**, not the read.
**Detect**
```bash
rg -n "redis|memcached|upstash|unstable_cache|revalidate|cache\.(get|set)|lru|node-cache" -g '*.{ts,js,py,go}' -l
# Red-flag heuristic: hot read straight to the DB with no cache
rg -n "findUnique|findFirst|SELECT .* WHERE id" -g '*.{ts,js,py,sql}' -C2
```
**Good.** Read-through on hot paths with an explicit TTL; a clear invalidation path on write
(delete/update the key, or tag-based revalidate); protection against stampede/thundering-herd on
popular keys (single-flight / jittered TTL).
**Red flags.** Every read hitting the DB on a hot path; caches with no TTL and no invalidation (stale
forever); caching user-specific/private data under a shared key; cache write *before* the DB commit.
**Fix via** `backend-patterns`, `backend-db-performance`.

---

## 19. Database-per-service / data ownership  · Applies: T2+ (owned schemas already matter at T1)

**Purpose.** Each service (or, in a modular monolith, each module) **owns its data**; others reach it
only through its API/events, never by reading its tables. This is what makes independent deployment
and scaling real. At T1 the same discipline applies logically (separate schemas / clear ownership)
even on one physical database.
**Detect**
```bash
rg -n "JOIN .*\." -g '*.{sql,ts,js,py}' -l                 # cross-domain joins (ownership leak?)
rg -n "schema|search_path|DATABASE_URL|datasource" -g '*.{ts,js,py,prisma,toml,env}' -l
```
**Good.** One writer per table/aggregate; cross-service data via API/events (or an outbox); modular
monolith with separated schemas and interface-only access between modules.
**Red flags — the distributed monolith:** multiple services reading/writing the same tables; services
that *must* deploy together; shared ORM models across service boundaries. This is **worse** than a
monolith — the distributed tax with none of the independence. Fix ownership *before* splitting further.
**Fix via** `backend-patterns`, `audit-db-schema`.

---

## Decision framework — fit before presence (used in Phase 3)

A pattern is only "Missing" (actionable) when the codebase shows the **trigger** that justifies its
cost. Otherwise adopting it is over-engineering — flag *that* instead.

**Maturity ladder** (climb a rung only when its trigger fires):

| Stage | Default shape | Trigger to add the next patterns |
|---|---|---|
| 0 | Modular monolith, owned schemas, sync + timeouts | *(correct default for >90% of systems)* |
| 1 | + cache-aside, + outbox | hot read paths hit the DB repeatedly; an event must not be lost on crash |
| 2 | + async event-driven side effects, + BFF, + CQRS (one slice) | a request fans out to many blocking calls; reads & writes scale/optimize differently |
| 3 | + database-per-service, + saga, + backpressure | a module needs independent deploy/scale; a workflow spans services and can half-complete |
| 4 | + service mesh (ambient), + cell-based, + orchestration | 10+ services, ~50+ engineers, blast-radius / data-residency needs |

**Anti-over-engineering (each is a finding):** CQRS/event-sourcing without read/write divergence;
microservices/mesh/cell-based below the size + differential-scaling threshold; wholesale EDA for
two-party interactions; any split that yields a distributed monolith. When in doubt, **stay on the
lower rung** — reversible, cheaper, and almost always sufficient.
