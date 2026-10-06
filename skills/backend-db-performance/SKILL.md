---
name: backend-db-performance
description: >
  Optimize slow queries, indexes, and N+1s. Use when "slow query",
  "database performance", "add an index", or "N+1". Schema consistency
  → audit-db-schema. RLS access control → plan-rls-audit.
license: MIT
---

# Database Optimization Skill

**Degree of freedom: MIXED.** Which query/index/N+1 to fix `[HIGH freedom]`;
existing-index probes and EXPLAIN ANALYZE `[LOW freedom — run exactly]`.

## How to reason

1. **Observe** — EXPLAIN ANALYZE / `pg_stat_statements` / existing `pg_indexes`
2. **Interpret** — seq scan vs N+1 vs over-fetch vs missing pagination
3. **Classify** — add-index / eager-load / narrow-select / paginate / leave-alone
4. **Severity** — write-path timeout outranks a 200ms list page

## Worked example

> **Observe:** `/feed` p95 2.4s; Prisma logs 81 queries; `pg_indexes` has no `idx_posts_user_created`.
> **Interpret:** `findMany` posts then per-row `user.findUnique` — N+1; `ORDER BY created_at` is a seq scan.
> **Classify:** eager-load `include: { author }` + composite index `(user_id, created_at DESC)`.
> **Verify:** EXPLAIN ANALYZE → Index Scan; query count 2; p95 < 200ms. Did not add a duplicate index.

## Self-critique before reporting

- **Existing first** — listed `pg_indexes` / migrations before `CREATE INDEX`
- **EXPLAIN** — the claimed winner has ANALYZE output, not intuition
- **No duplicate index** — the proposed name was queried and absent
- **Right owner** — schema consistency → `audit-db-schema`; RLS access → `plan-rls-audit`

Systematic approach to identifying and fixing database performance issues.

## When to Use

- Slow page loads (database bottleneck)
- Query timeout errors
- N+1 queries
- Schema design review
- Index optimization
- Migration planning

## Check existing first  [LOW freedom — run exactly]

**Before ANY optimization, verify current state:**

1. **Check existing indexes:**
```sql
SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'your_table';
```

2. **Check existing migrations:**
```bash
ls -la supabase/migrations/ | grep -i "index\|optim\|perf"
```

3. **Check if index already exists:**
```sql
SELECT 1 FROM pg_indexes WHERE indexname = 'your_proposed_index';
```

4. **Check Supabase advisors for current issues:**
- Use `get_advisors` MCP tool for performance/security
- Don't re-fix already addressed issues

**Why:** Duplicate indexes waste storage and slow writes. Always verify before adding.

## Performance Investigation  [HIGH freedom]

### 1. Identify Slow Queries

- Prisma: `new PrismaClient({ log: [{ emit: 'event', level: 'query' }] })` and `db.$on('query', ...)`; log anything over 100 ms with its duration.
- Postgres/Supabase: `CREATE EXTENSION IF NOT EXISTS pg_stat_statements`, then order by `total_time DESC`, reading `total_time / calls` and `rows / calls`.

Logging snippet and the `pg_stat_statements` query: [references/queries.md](references/queries.md) §Identify slow queries.

### 2. Common Performance Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| N+1 Queries | Many small queries | Use `include` / eager load |
| Missing Index | Slow WHERE/JOIN | Add index on filtered columns |
| Full Table Scan | Slow on large tables | Add index, limit results |
| Over-fetching | Slow response | Select only needed fields |
| No Pagination | Memory issues | Add cursor/offset pagination |

## N+1 Query Fix  [HIGH freedom]

- **Problem:** `findMany` then a per-row `findUnique` in a loop — 1 + N queries.
- **Fix:** eager-load the relation; narrow it with a nested `select` so you do not over-fetch the join.
- Supabase: one `.select('*, author:users(id, name, avatar)')` call does the join.

```typescript
// Good - 2 queries total
const posts = await db.post.findMany({
  include: { author: { select: { id: true, name: true, avatar: true } } },
})
```

Bad/good Prisma and the Supabase equivalent: [references/queries.md](references/queries.md) §N+1 query fix.

## Index Optimization  [HIGH freedom]

### When to Add Indexes

**Add index when column is used in:**
- `WHERE` clauses (filtering)
- `JOIN` conditions
- `ORDER BY` clauses
- Unique constraints

**Don't add index when:**
- Table is small (< 1000 rows)
- Column has low cardinality (few unique values)
- Column is rarely queried
- Table has heavy writes

### Index Types

- Single-column for one filter; composite when `WHERE a = ? ORDER BY b` (column order matters: equality first, then sort).
- Unique index for constraints; partial index (`WHERE published = true`) for a hot subset; GIN for JSONB, arrays and `to_tsvector` search.
- Prisma: `@@index([userId, createdAt(sort: Desc)])`, `@@unique([...])` mirror the SQL.

```sql
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);  -- composite, order matters
CREATE INDEX idx_posts_published ON posts(created_at) WHERE published = true;  -- partial
```

All six index forms and the Prisma model: [references/schema-and-indexes.md](references/schema-and-indexes.md) §Index types, §Prisma index syntax.

## Query Optimization Patterns  [HIGH freedom]

- **Select only needed fields** — `select: { id, name, email }` instead of the whole row.
- **Pagination** — offset (`skip`/`take`) is fine for small pages; cursor (`cursor: { id }`, `skip: 1`) for large or infinite lists; return `nextCursor` from the last row.
- **Batch** — `createMany({ skipDuplicates })` instead of a create loop; `$transaction([...])` for related writes.
- **Count** — `db.post.count({ where })`; pair it with the page query inside one `$transaction`.

```typescript
const posts = await db.post.findMany({
  take: limit,
  skip: cursor ? 1 : 0,                        // skip the cursor row itself
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' },
})
const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null
```

Select, both pagination styles, batching and count: [references/queries.md](references/queries.md) §Select only needed fields through §Count optimization.

## Schema Design Best Practices  [HIGH freedom]

### Normalization vs Denormalization

**Normalize when:**
- Data changes frequently
- Data integrity is critical
- Storage is a concern

**Denormalize when:**
- Read performance is critical
- Data rarely changes
- Complex joins are slow

- Normalized: a `post_stats(post_id PK → posts, view_count, like_count)` table; denormalized: counters as columns on `posts`.
- **Data types** — `UUID` ids, `VARCHAR(n)` for bounded strings, `DECIMAL(10,2)` for money, `TIMESTAMPTZ` always, `ENUM` for fixed sets.
- **Soft deletes** — nullable `deletedAt` with `@@index([deletedAt])`; every read filters `deletedAt: null`.

SQL for both shapes, the data-type list and the soft-delete model: [references/schema-and-indexes.md](references/schema-and-indexes.md) §Normalization, §Efficient data types, §Soft deletes.

## Supabase-Specific Optimizations  [HIGH freedom]

- **RLS** — a function call or sub-select per row (`get_user_team()`) is slow; prefer `user_id = auth.uid()`, or an `EXISTS` join against the membership table when the rule needs it.
- **Edge Functions** — move multi-query aggregations into one `supabase.rpc('get_dashboard_stats')` call behind `Deno.serve` instead of several client round trips.

```sql
CREATE POLICY "fast_policy" ON posts FOR SELECT USING (user_id = auth.uid());
```

Slow/fast/join policies and the Edge Function: [references/schema-and-indexes.md](references/schema-and-indexes.md) §RLS performance, §Edge Functions.

## Query Analysis  [LOW freedom — run exactly]

### EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE SELECT * FROM posts WHERE user_id = 'abc123' ORDER BY created_at DESC LIMIT 20;
```

Look for: `Seq Scan` (bad on large tables), `Index Scan` (good), `Nested Loop` (check for N+1), high actual time. Annotated version: [references/queries.md](references/queries.md) §EXPLAIN ANALYZE.

### Key Metrics

| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| Query time | < 100ms | Add index, optimize |
| Rows scanned | < 10x returned | Add index |
| Memory usage | < 256MB | Add LIMIT, pagination |
| Connection count | < pool size | Use connection pooling |

## Optimization Checklist  [LOW freedom — do not skip]

- [ ] Queries logged and monitored
- [ ] Indexes on filtered/joined columns
- [ ] No N+1 queries (eager loading)
- [ ] Pagination on all list endpoints
- [ ] Select only needed fields
- [ ] Batch operations where possible
- [ ] Connection pooling configured
- [ ] RLS policies optimized
- [ ] EXPLAIN ANALYZE on slow queries
- [ ] Appropriate data types used
