---
name: backend-patterns
description: >
  Apply backend patterns — queues, caching, rate limits, serverless/edge.
  Use when "queue jobs", "caching layer", "rate limiting", "server
  actions", or "edge function". Which architecture to pick →
  audit-backend-architecture.
license: MIT
---

# Backend Patterns Skill

**Degree of freedom: MIXED.** Which pattern to apply `[HIGH freedom]`;
existing-architecture probes and the validation list `[LOW freedom — run exactly]`.

## How to reason

1. **Observe** — existing server/api/actions, ORM, queues, cache
2. **Interpret** — missing pattern vs duplicate vs wrong layer
3. **Classify** — reuse / add-queue / add-cache / add-rate-limit / edge-fn
4. **Severity** — unauthenticated mutation outranks a missing cache

## Worked example

> **Observe:** `createOrder` sends email inline; no Inngest/queue; checkout p95 4s.
> **Interpret:** confirmation is post-response work, not request-path.
> **Classify:** `after()` or an `order/created` job; keep the write transactional.
> **Verify:** order row commits; email/inventory run after response; retries do not double-charge.

## Self-critique before reporting

- **Existing first** — searched server/api/actions before adding a second pattern
- **Auth + validate** — every mutation checks session and Zod
- **Idempotent** — retries on the new path do not double-apply
- **Right owner** — which architecture to pick → `audit-backend-architecture`

Design scalable, maintainable backend architectures using modern patterns and best practices.

> Code examples lean on **Next.js App Router + Supabase/Prisma**. The patterns are
> stack-agnostic — adapt ORMs, client libraries, and deploy targets to your detected
> ecosystem.

## Check existing first  [LOW freedom — run exactly]

**Before implementing ANY backend pattern, verify:**

1. **Check existing architecture:**
```bash
ls -la src/server/ src/api/ app/api/ supabase/functions/ 2>/dev/null
cat package.json | grep -i "prisma\|drizzle\|supabase\|trpc"
```

2. **Check existing patterns:**
```bash
rg "createTRPCRouter|publicProcedure" --type ts -l
rg "'use server'" --type ts -l
ls -la supabase/migrations/*.sql 2>/dev/null | tail -5
```

3. **Check database setup:**
```bash
cat prisma/schema.prisma 2>/dev/null | head -50
cat supabase/config.toml 2>/dev/null
```

**Why:** Backend changes have wide impact. Understand existing architecture first.

## Server Actions (Next.js 16+)  [HIGH freedom]

Next.js 16: Turbopack default; `'use cache'` + `cacheComponents`; `reactCompiler: true`; `middleware.ts` → `proxy.ts` (grep both). Instant navigations → `enhance-web-instant-nav`.

- Order inside every action: auth check → Zod `safeParse` → execute → map known errors (Prisma `P2002`) → generic failure message.
- Return `ActionResult<T>`: `{ success: true, data }` or `{ success: false, error, fieldErrors? }`; never throw to the client.
- `revalidatePath` after a successful write.
- Post-response work (confirmation email, inventory, notifications) goes in `after()` from `next/server`, keeping the write transactional.

```tsx
'use server'
import { after } from 'next/server'

export async function createOrder(formData: FormData) {
  const order = await db.order.create({ data: { /* ... */ } })
  after(async () => {                      // runs after the response is sent
    await sendOrderConfirmation(order.id)
    await updateInventory(order.items)
  })
  revalidatePath('/orders')
  return { success: true, data: order }
}
```

Full `createUser` action and the `after()` example: [references/request-patterns.md](references/request-patterns.md) §Server Actions.

## tRPC Setup  [HIGH freedom]

- `publicProcedure` for reads anyone may do; `protectedProcedure` for anything that uses `ctx.session`.
- Every procedure has a Zod `.input()`; mutations stamp `createdById` from the session, not the input.
- List endpoints paginate by cursor: fetch `limit + 1`, pop the extra row as `nextCursor`.

Full `usersRouter` (getById, create, cursor-paginated list): [references/request-patterns.md](references/request-patterns.md) §tRPC router definition.

## Supabase Edge Functions  [HIGH freedom]

- `Deno.serve`; answer `OPTIONS` with the CORS headers first.
- Verify the webhook signature against the raw body before parsing JSON; `401` on mismatch.
- Admin client from `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS; use it only inside the function.
- Catch everything; log server-side, return a generic `500` JSON body with CORS headers.

Full `process-webhook` function: [references/request-patterns.md](references/request-patterns.md) §Supabase Edge Function.

## Database Patterns  [HIGH freedom]

- **Optimistic locking** — `version INT` column; `UPDATE ... WHERE id = $1 AND version = $2` and treat 0 rows as a concurrent update.
- **Soft deletes** — nullable `deletedAt` with an index; every read filters `deletedAt: null`; delete sets the timestamp.
- **Audit logging** — `audit_logs(table_name, record_id, action, old_data, new_data, user_id)` filled by a `SECURITY DEFINER` trigger using `TG_OP`, `row_to_json`, `auth.uid()`.

```sql
UPDATE orders SET status = 'shipped', version = version + 1
WHERE id = $1 AND version = $2;   -- 0 rows → concurrent update, retry or surface conflict
```

Soft-delete Prisma model and the full audit trigger: [references/data-and-jobs.md](references/data-and-jobs.md) §Soft deletes, §Audit logging.

## Caching Patterns  [HIGH freedom]

- Next.js: `fetch(url, { next: { revalidate, tags } })`; `revalidateTag` on demand; `unstable_cache` around DB queries with tags.
- Redis (Upstash): one `getCachedData(key, fetcher, ttl)` helper, cache-aside; key by entity and id (`user:${id}`).
- Pick TTL by staleness tolerance, and always tag so a write can bust the cache.

```tsx
const getCachedUser = unstable_cache(
  async (id: string) => db.user.findUnique({ where: { id } }),
  ['user'],
  { revalidate: 3600, tags: ['users'] }
)
```

Next.js cache calls and the Redis helper: [references/data-and-jobs.md](references/data-and-jobs.md) §Next.js cache, §Redis caching.

## Background Jobs  [HIGH freedom]

- Default: **Inngest**. `inngest.createFunction({ id }, { event }, async ({ event, step }) => ...)`; each side effect in its own `step.run` so retries resume, not restart.
- Trigger with `inngest.send({ name: 'order/created', data })` from the Server Action after the write commits.
- Early exit (out of stock) is a `step.run` + `return { status: 'cancelled' }`, not a throw.

```tsx
export const processOrder = inngest.createFunction(
  { id: 'process-order' }, { event: 'order/created' },
  async ({ event, step }) => {
    const payment = await step.run('charge-payment', () => chargeCustomer(event.data.paymentMethod))
    await step.run('send-confirmation', () => sendOrderConfirmation(event.data.orderId))
    return { status: 'completed', paymentId: payment.id }
  }
)
```

Full Inngest function and the Trigger.dev scheduled-task alternative: [references/data-and-jobs.md](references/data-and-jobs.md) §Background jobs, §Alternatives.

## Rate Limiting  [HIGH freedom]

- `@upstash/ratelimit` with `Ratelimit.slidingWindow(10, '10 s')` over `Redis.fromEnv()`.
- Key by user id (or IP for anonymous); on `!success` return `Too many requests` with `retryAfter` seconds from `reset`.

Full `rateLimitedAction`: [references/request-patterns.md](references/request-patterns.md) §Rate limiting.

## Architecture patterns (distributed systems)  [HIGH freedom]

Gateway, BFF, bulkhead, circuit breaker, outbox+CDC, saga, hexagonal, ACL, and strangler-fig →
[references/architecture-patterns.md](references/architecture-patterns.md). Pick the pattern for the
topology (no mesh on a monolith; no CQRS unless reads/writes diverge). Timeouts/retries/idempotency
→ `audit-resilience`; structural gap report → `audit-backend-architecture`.

## Validation  [LOW freedom — do not skip]

After implementing backend patterns:

1. **Error handling** → All errors caught, logged, safe response returned
2. **Auth checks** → Every mutation verifies authentication
3. **Input validation** → Zod schema on all inputs
4. **Rate limiting** → Sensitive endpoints protected
5. **Idempotency** → Critical operations handle retries
6. **Logging** → Structured logs without sensitive data
7. **Testing** → Unit tests for business logic, integration for APIs
