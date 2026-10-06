# Query investigation and optimization

Full query-logging, N+1, pagination, batching, count, and EXPLAIN ANALYZE code referenced from `SKILL.md`.

## Contents

- Identify slow queries (Prisma logging, pg_stat_statements)
- N+1 query fix (Prisma and Supabase)
- Select only needed fields
- Pagination (offset and cursor)
- Batch operations
- Count optimization
- EXPLAIN ANALYZE

## Identify slow queries

**Prisma - Enable query logging:**
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient({
 log: [
 { emit: 'event', level: 'query' },
 ],
})

db.$on('query', (e) => {
 if (e.duration > 100) { // Log queries > 100ms
 console.log(`Slow query (${e.duration}ms):`, e.query)
 }
})
```

**Supabase - Query analysis:**
```sql
-- Enable query stats
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT
 query,
 calls,
 total_time / calls as avg_time_ms,
 rows / calls as avg_rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 20;
```

## N+1 query fix

**Problem: Fetching related data in loop**
```typescript
// Bad - N+1 queries
const posts = await db.post.findMany()
for (const post of posts) {
 const author = await db.user.findUnique({ where: { id: post.authorId } })
 // 1 query for posts + N queries for authors
}
```

**Solution: Eager loading**
```typescript
// Good - 2 queries total
const posts = await db.post.findMany({
 include: {
 author: true,
 },
})

// Or with select for specific fields
const posts = await db.post.findMany({
 include: {
 author: {
 select: { id: true, name: true, avatar: true }
 },
 },
})
```

**Supabase equivalent:**
```typescript
// Single query with join
const { data: posts } = await supabase
 .from('posts')
 .select(`
 *,
 author:users(id, name, avatar)
 `)
```

## Select only needed fields

```typescript
// Bad - fetches all columns
const users = await db.user.findMany()

// Good - fetches only needed
const users = await db.user.findMany({
 select: {
 id: true,
 name: true,
 email: true,
 },
})
```

## Pagination

**Offset pagination (simple, but slow at high offsets):**
```typescript
const posts = await db.post.findMany({
 skip: (page - 1) * limit,
 take: limit,
 orderBy: { createdAt: 'desc' },
})
```

**Cursor pagination (better for large datasets):**
```typescript
const posts = await db.post.findMany({
 take: limit,
 skip: cursor ? 1 : 0, // Skip cursor itself
 cursor: cursor ? { id: cursor } : undefined,
 orderBy: { createdAt: 'desc' },
})

// Return next cursor
const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null
```

## Batch operations

```typescript
// Bad - individual inserts
for (const item of items) {
 await db.item.create({ data: item })
}

// Good - batch insert
await db.item.createMany({
 data: items,
 skipDuplicates: true,
})

// Good - transaction for related data
await db.$transaction([
 db.order.create({ data: order }),
 db.orderItem.createMany({ data: orderItems }),
 db.inventory.updateMany({ where: {...}, data: {...} }),
])
```

## Count optimization

```typescript
// Get count without fetching data
const count = await db.post.count({
 where: { published: true },
})

// Combined with pagination
const [posts, count] = await db.$transaction([
 db.post.findMany({ where, take: limit, skip: offset }),
 db.post.count({ where }),
])
```

## EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE user_id = 'abc123'
ORDER BY created_at DESC
LIMIT 20;

-- Look for:
-- - Seq Scan (bad on large tables)
-- - Index Scan (good)
-- - Nested Loop (check if N+1)
-- - High actual time
```
