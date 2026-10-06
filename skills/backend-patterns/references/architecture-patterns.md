# Architecture patterns — implementation reference

Implementation guidance for the distributed-systems patterns `audit-backend-architecture` flags as
Missing/Partial. Examples lean on TypeScript/Node + Postgres; the patterns are stack-agnostic — adapt
the client libraries and broker. **Implement the pattern that fits your topology tier — don't add a
service mesh to a monolith or CQRS where reads and writes don't diverge.**

## Contents

- API gateway — centralize cross-cutting concerns
- BFF — Backend-for-Frontend
- Bulkhead — isolate resource pools
- Circuit breaker (architectural placement)
- Outbox + relay/CDC — kill the dual-write problem
- Saga — distributed transactions without 2PC
- Hexagonal / ports-and-adapters — testable, framework-agnostic
- Anti-corruption layer (ACL)
- Strangler-fig migration
- Communication style — sync request/response vs async event-driven
- Cache-aside (lazy loading)
- Database-per-service / data ownership
- When NOT to reach for these


---

## API gateway — centralize cross-cutting concerns

The goal is *one* place for auth, rate-limit, CORS, logging, and caching — not copy-paste per route.

**Serverless / monolith (T1):** a single middleware chain.
```ts
// middleware.ts (Next.js) — or one Express/Hono middleware stack
export async function middleware(req: NextRequest) {
  // 1. CORS (one policy, not per-route '*')
  // 2. Auth: verify JWT/session once, attach identity
  // 3. Rate limit per client (see Rate Limiting section)
  // 4. Structured request log with a correlation id
  const requestId = crypto.randomUUID();
  const res = NextResponse.next({ request: { headers: withRequestId(req.headers, requestId) } });
  res.headers.set("x-request-id", requestId);
  return res;
}
```

**Containers / microservices (T2+):** a dedicated gateway (Kong, APISIX, Traefik, Envoy, or a managed
API gateway). The gateway owns policy; **it does not reshape payloads** — that is the BFF's job.

Checklist: auth, rate-limit, CORS, request/response transform, structured logging with correlation
id, metrics, and cache headers are all configured **once** and inherited by every route.

---

## BFF — Backend-for-Frontend

A per-client layer that shapes/aggregates data for one surface. Sits **behind** the gateway; holds
only client-specific logic (never auth/throttling — that's the gateway).

```ts
// bff/mobile/home.ts — compact payload for a small screen / limited bandwidth
export async function mobileHome(userId: string) {
  const [user, orders, promos] = await Promise.all([   // fan-out, then reshape
    userService.get(userId),
    orderService.recent(userId, { limit: 3 }),          // mobile needs 3, web needs 20
    promoService.forUser(userId),
  ]);
  return {                                              // return exactly what mobile renders
    name: user.displayName,
    recentOrders: orders.map((o) => ({ id: o.id, total: o.total, status: o.status })),
    promo: promos[0]?.headline ?? null,
  };
}
```
- One BFF per client type (web / mobile / partner). Batch to avoid N+1.
- **At 5+ domain teams contributing to one graph**, prefer **GraphQL federation** (Apollo Router /
  Cosmo) over N hand-rolled BFFs.
- Skip a BFF when all clients need the same shape, or only one client exists.

---

## Bulkhead — isolate resource pools

One slow dependency must not exhaust the pool every other dependency shares.

```ts
import pLimit from "p-limit";

// A separate concurrency budget PER downstream dependency.
const limits = {
  payments: pLimit(5),    // slow 3rd-party: cap concurrent calls
  search:   pLimit(20),
  email:    pLimit(10),
};
export const callPayments = <T>(fn: () => Promise<T>) => limits.payments(fn);
```
- Give each downstream its **own** HTTP client / connection pool, not one global client.
- Combine with a circuit breaker (below) and per-call timeouts (see `audit-resilience`).
- Infra tier: separate thread pools / node pools; at scale this becomes cell-based isolation.

---

## Circuit breaker (architectural placement)

Wrap every synchronous external dependency. (Per-call tuning: `audit-resilience`.)
```ts
import CircuitBreaker from "opossum";
const breaker = new CircuitBreaker(callProvider, {
  timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 10_000,
});
breaker.fallback(() => cachedOrDegradedResponse());   // fail fast, don't hang
export const chargeCard = (args) => breaker.fire(args);
```

---

## Outbox + relay/CDC — kill the dual-write problem

Never `save(x)` then `broker.publish(evt)` as two separate ops — a crash between them leaves state
without its event. Write both in **one transaction**; publish from the outbox afterward.

```ts
// 1. Write business state + event in the SAME transaction
await db.transaction(async (tx) => {
  await tx.order.update({ where: { id }, data: { status: "CONFIRMED" } });
  await tx.outbox.create({ data: {
    aggregate: "order", type: "OrderConfirmed", payload: { id }, createdAt: new Date(),
  }});
});
```
```ts
// 2a. Relay: poll the outbox and publish (simple, ~20–50ms added latency)
setInterval(async () => {
  const rows = await db.outbox.findMany({ where: { sentAt: null }, take: 100, orderBy: { createdAt: "asc" }});
  for (const row of rows) {
    await broker.publish(row.type, row.payload);
    await db.outbox.update({ where: { id: row.id }, data: { sentAt: new Date() } });
  }
}, 200);
```
```sql
-- 2b. Higher throughput: Debezium CDC reads the WAL — no polling load on the DB.
-- outbox table + logical replication → Kafka Connect (Debezium) → topic
```
- Make consumers **idempotent** (dedupe on a message id, 24–72h window) — delivery is at-least-once.
- This is the reliable substrate for saga step events.

---

## Saga — distributed transactions without 2PC

A sequence of local transactions, each emitting an event that triggers the next; **compensating**
transactions undo prior steps on failure.

**Choreography** (<5 linear steps, services already publish events):
```
OrderService  --OrderCreated-->  PaymentService  --PaymentCaptured-->  ShippingService
     ^-- compensate: CancelOrder <-- PaymentFailed / ShippingFailed
```
**Orchestration** (branching, per-step timeout/retry, synchronous result) — use Temporal / Step
Functions / Camel:
```ts
// Temporal-style workflow: forward steps + compensation, one readable definition
export async function bookTrip(input) {
  const flight = await reserveFlight(input);          // compensatable
  try {
    const hotel = await reserveHotel(input);          // compensatable
    try {
      await capturePayment(input);                    // ── PIVOT: irreversible ──
      await sendConfirmation(input);                  // retriable (retry, never compensate)
      await addLoyaltyPoints(input);                  // retriable
    } catch (e) { /* past pivot: RETRY to completion, do NOT refund */ throw e; }
  } catch (e) { await cancelHotel(input); await cancelFlight(input); throw e; }
}
```
- **Saga pivot rule:** compensatable steps *before* the pivot (e.g. payment capture); retriable steps
  *after*. Once past the pivot, run to completion with retries — don't compensate.
- Compensation is business logic — design it as carefully as the happy path.
- Observe saga age, compensation rate, retry counts, DLQ; alert on stranded/stuck sagas.
- Pair with **Outbox** so each step's event reliably publishes.

---

## Hexagonal / ports-and-adapters — testable, framework-agnostic

Domain logic depends on **ports** (interfaces), never on the framework/DB/HTTP directly. Adapters
implement the ports at the edges.

```ts
// domain/ports.ts — the domain owns the interface, not the vendor
export interface OrderRepository { save(o: Order): Promise<void>; byId(id: string): Promise<Order | null>; }

// domain/usecase.ts — pure business logic, ZERO framework imports
export function confirmOrder(repo: OrderRepository, clock: Clock) {
  return async (id: string) => {
    const order = await repo.byId(id);
    if (!order) throw new OrderNotFound(id);
    order.confirm(clock.now());          // business rule lives in the domain
    await repo.save(order);
  };
}

// infrastructure/prisma-order-repo.ts — adapter; the ONLY place Prisma is imported
export class PrismaOrderRepository implements OrderRepository { /* ... */ }
```
- Test use-cases with an in-memory adapter — no DB needed.
- Swap Prisma→Drizzle, Express→Hono, REST→gRPC by writing a new adapter; the domain is untouched.
- Red flag to fix: `import prisma`/`supabase`/`fetch` inside `domain/` or `application/` layers.

---

## Anti-corruption layer (ACL)

Translate external/legacy shapes into your domain at one boundary, so vendor quirks never leak in.
```ts
// infrastructure/stripe-acl.ts — map Stripe's shape to OUR domain type here, once
export function toPayment(stripeCharge: Stripe.Charge): Payment {
  return { id: stripeCharge.id, amount: stripeCharge.amount / 100, currency: stripeCharge.currency };
}
```

---

## Strangler-fig migration

Replace a legacy system incrementally behind a façade — route slices to the new implementation, verify,
repeat — instead of a big-bang rewrite. Gate cutover with `workflow-feature-flag`; keep old+new behind
one router until every slice is migrated, then decommission.

---

## Communication style — sync request/response vs async event-driven

Choose **per interaction**, not per system. Decision tree:

```
Is the caller waiting for the answer?
  ├── Yes → SYNC
  │        ├── internal, high-throughput → gRPC
  │        ├── external / simple / cacheable → REST
  │        └── client picks fields / many sources → GraphQL
  └── No  → ASYNC
           ├── one consumer, do-this-work → message queue (SQS/RabbitMQ/BullMQ)
           ├── many reactors, this-happened → event stream (Kafka/NATS/EventBridge)
           └── multi-service transaction → saga (+ outbox)
```

```ts
// Hybrid in one endpoint: sync at the edge, async for side effects (bridged by the outbox).
export async function placeOrder(req) {
  const order = await db.transaction(async (tx) => {
    const o = await tx.order.create({ data: req });        // sync: caller needs the orderId now
    await tx.outbox.create({ data: { type: "OrderPlaced", payload: { id: o.id } } });
    return o;
  });
  return { orderId: order.id };                            // respond immediately
  // email, inventory, analytics react to OrderPlaced asynchronously — caller doesn't wait
}
```
- Always give async flows a **dead-letter queue**; give sync calls a **timeout + circuit breaker**.
- Symptom to fix: one handler making 5 blocking downstream calls — parallelize (`Promise.all`) or move
  non-critical hops to events.

## Cache-aside (lazy loading)

```ts
async function getProduct(id: string): Promise<Product> {
  const key = `product:${id}`;
  const hit = await redis.get<Product>(key);
  if (hit) return hit;                                     // ~10ms
  const product = await db.product.findUnique({ where: { id } }); // ~100ms on miss
  if (product) await redis.set(key, product, { ex: 300 }); // TTL is mandatory
  return product;
}
// Invalidate on write — the hard part. Delete (or rewrite) the key when the row changes:
async function updateProduct(id: string, data: Partial<Product>) {
  const p = await db.product.update({ where: { id }, data });
  await redis.del(`product:${id}`);                        // or set the fresh value
  return p;
}
```
- **TTL + explicit invalidation** on every cached entity — never cache-forever.
- Guard hot keys against **stampede/thundering-herd** (single-flight lock or jittered TTL).
- Never cache private/user-scoped data under a shared key; write to cache **after** the DB commit.
- Good fit: product details, profiles, config, read-heavy reference data. Bad fit: strongly-consistent
  balances, anything that must never be stale.

## Database-per-service / data ownership

The rule that makes independent deploy/scale real: **one owner per table**; others use its API/events.

```ts
// ❌ distributed monolith — billing reaches into orders' tables
const orders = await billingDb.$queryRaw`SELECT * FROM orders WHERE ...`;

// ✅ ownership respected — ask the owner (sync) or react to its events (async)
const orders = await orderServiceClient.listOrders(userId);   // sync API
// or subscribe to OrderPlaced / OrderPaid events and keep a local read model
```
- **Modular monolith (T1):** enforce ownership *logically* — separate schemas, interface-only access
  between modules (ArchUnit / Spring Modulith / Packwerk / lint boundaries). Physical single DB is fine.
- **Split a service only when** a module has a genuine independent deploy/scale/regulatory need — and
  fix data ownership **before** splitting, or you get a distributed monolith (shared DB + coupled
  deploys = worst of both worlds).
- Cross-service reporting/joins move to a read model fed by events, not cross-service SQL joins.

---

## When NOT to reach for these

- **CQRS / event sourcing:** only where read and write loads genuinely diverge. Otherwise it's
  accidental complexity — a plain repository is better.
- **Service mesh / cell-based:** T3 (Kubernetes / real scale) concerns. On a monolith or a couple of
  serverless functions they add operational cost with no payoff. For net-new clusters that *do* need a
  mesh, prefer **ambient/sidecarless** (Istio ambient) over per-pod sidecars.
- **BFF:** skip when one client, or all clients share a shape.
