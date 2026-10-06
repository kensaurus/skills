# Indexes, schema design and Supabase specifics

Full index DDL, Prisma index syntax, normalization, data types, soft deletes, RLS policy performance, and Edge Function offload referenced from `SKILL.md`.

## Contents

- Index types (SQL)
- Prisma index syntax
- Normalization vs denormalization
- Efficient data types
- Soft deletes
- RLS performance
- Edge Functions for complex logic

## Index types (SQL)

```sql
-- Single column index
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Composite index (order matters!)
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- Unique index
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Partial index (index subset of rows)
CREATE INDEX idx_posts_published ON posts(created_at)
WHERE published = true;

-- GIN index for JSONB/array
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- Full-text search
CREATE INDEX idx_posts_search ON posts
USING GIN(to_tsvector('english', title || ' ' || content));
```

## Prisma index syntax

```prisma
model Post {
 id String @id @default(cuid())
 userId String
 title String
 status Status
 createdAt DateTime @default(now())

 user User @relation(fields: [userId], references: [id])

 // Single column index
 @@index([userId])

 // Composite index
 @@index([userId, createdAt(sort: Desc)])

 // Unique constraint (creates unique index)
 @@unique([userId, title])
}
```

## Normalization vs denormalization

**Normalize when:**
- Data changes frequently
- Data integrity is critical
- Storage is a concern

**Denormalize when:**
- Read performance is critical
- Data rarely changes
- Complex joins are slow

```sql
-- Normalized (separate table)
CREATE TABLE post_stats (
 post_id UUID PRIMARY KEY REFERENCES posts(id),
 view_count INT DEFAULT 0,
 like_count INT DEFAULT 0
);

-- Denormalized (same table)
ALTER TABLE posts
ADD COLUMN view_count INT DEFAULT 0,
ADD COLUMN like_count INT DEFAULT 0;
```

## Efficient data types

```sql
-- Use appropriate types
id UUID DEFAULT gen_random_uuid() -- vs TEXT for IDs
status VARCHAR(20) -- vs unlimited TEXT
price DECIMAL(10,2) -- vs FLOAT for money
created_at TIMESTAMPTZ -- vs TIMESTAMP (include timezone)

-- Use enums for fixed values
CREATE TYPE status AS ENUM ('draft', 'published', 'archived');
```

## Soft deletes

```prisma
model Post {
 id String @id
 deletedAt DateTime?

 @@index([deletedAt]) // Index for filtering
}

// Query pattern
const posts = await db.post.findMany({
 where: { deletedAt: null },
})
```

## RLS performance

```sql
-- Bad: Function call in RLS (slow)
CREATE POLICY "slow_policy" ON posts
FOR SELECT USING (
 user_id IN (SELECT user_id FROM team_members WHERE team_id = get_user_team())
);

-- Good: Direct comparison (fast)
CREATE POLICY "fast_policy" ON posts
FOR SELECT USING (user_id = auth.uid());

-- Good: Join-based (when needed)
CREATE POLICY "team_policy" ON posts
FOR SELECT USING (
 EXISTS (
 SELECT 1 FROM team_members
 WHERE team_members.team_id = posts.team_id
 AND team_members.user_id = auth.uid()
 )
);
```

## Edge Functions for complex logic

```typescript
// Move complex aggregations to Edge Functions
// instead of multiple round trips

// supabase/functions/dashboard-stats/index.ts
Deno.serve(async (req) => {
 const stats = await supabase.rpc('get_dashboard_stats', {
 user_id: userId
 })
 return new Response(JSON.stringify(stats))
})
```
