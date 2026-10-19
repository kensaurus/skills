---
name: audit-db-schema
description: >
  Audit a database schema for consistency, constraints, naming, indexes, and
  migrations. Use when reviewing schema design. Destructive-op gates →
  plan-data-integrity. RLS → plan-rls-audit. Restore/RPO → plan-backup-dr.
license: MIT
effort: high
---

# Database Schema Audit Skill

**Degree of freedom: MIXED** — Steps 0, 1, 3 `[HIGH freedom]`; Steps 2 and 4
MCP/SQL probes `[LOW freedom — run exactly]` (run the query; do not invent a schema).

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-db-schema** (this) | Schema consistency, constraints, naming, indexes, and migrations |
| `backend-db-performance` | Optimize slow queries, indexes, and N+1s |
| `plan-data-integrity` | Plan-only audit of destructive-operation and migration safety |
| `plan-rls-audit` | Plan-only Supabase/Postgres RLS and access-control audit |
| `plan-backup-dr` | Plan-only audit of whether the project can recover from data loss |

## How to reason

1. **Observe** — quote the column, constraint, advisor row, or query result
2. **Interpret** — what fails at write-time, read-time, or migrate-time?
3. **Classify** — naming / type / constraint / index / RLS / migration / correct
4. **Severity** — missing FK/RLS on public data = P0; type/index drift = P1; naming = P2

## Worked example

> **Observe:** `orders.user_id` is nullable `text`, no FK, no index; `rowsecurity = false`.
> **Interpret:** orphan rows can insert; the client can SELECT every order; lookups seq-scan.
> **Classify:** constraint + index + RLS (not a naming nit).
> **Severity:** P0 — public table, no RLS, no FK.
> **Finding:** `orders` | RLS+FK | P0 | enable RLS + `user_id uuid references users(id)` + index.

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Evidenced** — query result or advisor URL, not "Postgres usually…"
2. **Reproducible** — same SQL twice; do not cite a stale `list_tables`
3. **Severity justified** — P0 = data loss, leak, or unconstrained money type
4. **Right owner** — who-can-read-what → `plan-rls-audit`; DELETE/TRUNCATE → `plan-data-integrity`; RPO → `plan-backup-dr`
5. **No migrations applied** — findings only

---

## Step 0: Auto-Detect Database Environment

### 0a. Detect Database and ORM

| Signal | Technology |
|--------|-----------|
| `@supabase/supabase-js` in `package.json` | Supabase (Postgres) |
| `prisma` in devDependencies, `prisma/schema.prisma` | Prisma ORM |
| `drizzle-orm` in dependencies, `drizzle/` directory | Drizzle ORM |
| `sequelize` in dependencies | Sequelize ORM |
| `sqlalchemy` in requirements | SQLAlchemy (Python) |
| `supabase/migrations/*.sql` directory | Supabase migrations |
| `prisma/migrations/` directory | Prisma migrations |
| `drizzle/migrations/` or `drizzle/*.sql` | Drizzle migrations |

### 0b. Find Supabase Project ID

Take `PROJECT_ID` from the host of `SUPABASE_URL` in `.env` / `.env.local`
(`https://<ref>.supabase.co`; the `project_id` in `supabase/config.toml` is a
local name, not the ref), and confirm it with
`supabase:get_project_url`. Call `supabase:list_projects` only when the MCP
server exposes it (started without a project ref). A project-scoped server,
which is how the pack configures it, does not, and its tools take no
`project_id`; on an unscoped server, add `"project_id": "<PROJECT_ID>"` to
each call below.

### 0c. Detect Schema Source Files

```
Glob: **/supabase/migrations/*.sql → Supabase SQL migrations
Glob: **/prisma/schema.prisma → Prisma schema
Glob: **/drizzle/schema.ts → Drizzle schema
Glob: **/src/db/schema.ts → Drizzle alt location
Glob: **/knexfile.* → Knex migrations
Glob: **/alembic/versions/*.py → SQLAlchemy migrations
```

### 0d. Record Discovery

```
DATABASE ENVIRONMENT:
- Database: [Supabase Postgres / raw Postgres / MySQL / SQLite]
- ORM: [Prisma / Drizzle / Sequelize / none]
- Project ID: [Supabase project ID or N/A]
- Migration tool: [Supabase CLI / Prisma Migrate / Drizzle Kit / Knex]
- Schema files: [list paths]
- Migration count: [N]
```

---

## Step 1: Research Schema Best Practices

### 1a. Context7 — ORM Documentation

If using Prisma:

```json
context7:resolve-library-id
{
 "libraryName": "prisma",
 "query": "schema best practices indexes relations"
}
```

```json
context7:query-docs
{
 "libraryId": "<RESOLVED_ID>",
 "query": "schema best practices naming conventions indexes onDelete"
}
```

If using Drizzle, resolve `drizzle-orm` instead.

### 1b. Firecrawl — Current Database Patterns

```json
firecrawl:firecrawl_search
{
 "query": "PostgreSQL schema design best practices [current year]",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Additional searches based on detected stack:

| Stack | Search Query |
|-------|-------------|
| Supabase | `Supabase RLS policies best practices performance [current year]` |
| Prisma | `Prisma schema design relations indexes best practices [current year]` |
| Drizzle | `Drizzle ORM schema patterns migrations [current year]` |
| General | `PostgreSQL indexing strategy production optimization` |

Scrape the most authoritative result:

```json
firecrawl:firecrawl_scrape
{
 "url": "<BEST_RESULT_URL>",
 "formats": ["markdown"],
 "onlyMainContent": true
}
```

### 1c. Supabase Docs Search

If Supabase:

```json
supabase:search_docs
{
 "graphql_query": "{ searchDocs(query: \"RLS policy performance best practices\", limit: 3) { nodes { title href content } } }"
}
```

---

## Step 2: Gather Full Schema

### 2a. List All Tables (Supabase MCP)

```json
supabase:list_tables
{
 "schemas": ["public"],
 "verbose": true
}
```

### 2b. Run Detailed Audit Queries

```json
supabase:execute_sql
{
 "query": "SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position"
}
```

```json
supabase:execute_sql
{
 "query": "SELECT tc.table_name, tc.constraint_name, tc.constraint_type, kcu.column_name, ccu.table_name AS foreign_table FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name WHERE tc.table_schema = 'public'"
}
```

### 2c. Gather Indexes

```json
supabase:execute_sql
{
 "query": "SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename"
}
```

### 2d. Gather RLS Status and Policies

```json
supabase:execute_sql
{
 "query": "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
}
```

```json
supabase:execute_sql
{
 "query": "SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename"
}
```

### 2e. Run Supabase Advisors

```json
supabase:get_advisors
{
 "type": "security"
}
```

```json
supabase:get_advisors
{
 "type": "performance"
}
```

Include remediation URLs from advisor results in the final report as clickable links.

---

## Step 3: Audit Categories

### 3.1 Naming Conventions

| Rule | Standard | Check |
|------|----------|-------|
| Tables | `snake_case`, plural (`users`, `posts`) | No camelCase, no singular |
| Columns | `snake_case` (`created_at`, `user_id`) | No camelCase |
| Primary keys | `id` | Not `user_id` on own table |
| Foreign keys | `{referenced_table_singular}_id` (`user_id`) | Consistent pattern |
| Indexes | `idx_{table}_{column(s)}` | Descriptive names |
| Constraints | `{table}_{column}_{type}` (`users_email_unique`) | Descriptive names |
| Enums | `snake_case` type, `UPPER_CASE` values | Consistent casing |
| Boolean columns | `is_` or `has_` prefix (`is_active`, `has_access`) | Clear intent |

**Audit query:**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
 AND (table_name ~ '[A-Z]' OR table_name !~ 's$');

SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema = 'public' AND column_name ~ '[A-Z]';
```

### 3.2 Data Types

| Rule | Standard |
|------|----------|
| Primary keys | `uuid` with `gen_random_uuid()` or `cuid` |
| Timestamps | `timestamptz` (NOT `timestamp`) |
| Money | `numeric(12,2)` or `bigint` (cents) — not `float`/`real` (binary rounding loses cents) |
| Email | `text` with CHECK constraint or `citext` |
| Status/enum | Postgres `enum` type or `text` with CHECK |
| JSON | `jsonb` (NOT `json`) |
| Short strings | `text` preferred over `varchar(n)` in Postgres |
| Booleans | `boolean` with NOT NULL DEFAULT |
| IP addresses | `inet` type |
| Arrays | Native `text[]`, `integer[]` where appropriate |

**Audit queries:**

```sql
SELECT table_name, column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND data_type = 'timestamp without time zone';

SELECT table_name, column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public'
 AND data_type IN ('real', 'double precision')
 AND (column_name LIKE '%price%' OR column_name LIKE '%amount%'
 OR column_name LIKE '%cost%' OR column_name LIKE '%balance%');

SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema = 'public' AND data_type = 'json';
```

### 3.3 Required Columns and Timestamps

Every table MUST have:

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | `uuid` | `gen_random_uuid()` | Primary key |
| `created_at` | `timestamptz` | `now()` | NOT NULL |
| `updated_at` | `timestamptz` | `now()` | NOT NULL, auto-trigger |

**Audit queries:**

```sql
SELECT t.table_name,
 EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_at') AS has_created_at,
 EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_at') AS has_updated_at
FROM information_schema.tables t
WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE';

SELECT event_object_table, trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'public' AND action_statement LIKE '%updated_at%';
```

### 3.4 Constraints and Validation

| Constraint | When Required |
|------------|--------------|
| `NOT NULL` | Every column unless explicitly optional |
| `UNIQUE` | Emails, slugs, external IDs, usernames |
| `CHECK` | Enums, ranges, formats, positive numbers |
| `DEFAULT` | Booleans, timestamps, status fields |
| `FOREIGN KEY` | Every relationship column |
| `ON DELETE` | CASCADE for owned data, SET NULL for optional refs, RESTRICT for critical |

**Audit queries:**

```sql
SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema = 'public' AND column_name LIKE '%_id'
 AND is_nullable = 'YES' AND column_name != 'id';

SELECT c.table_name, c.column_name FROM information_schema.columns c
WHERE c.table_schema = 'public' AND c.column_name LIKE '%_id' AND c.column_name != 'id'
 AND NOT EXISTS (
 SELECT 1 FROM information_schema.key_column_usage kcu
 JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
 WHERE tc.constraint_type = 'FOREIGN KEY'
 AND kcu.table_name = c.table_name AND kcu.column_name = c.column_name
 );

SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema = 'public' AND data_type = 'boolean' AND column_default IS NULL;
```

### 3.5 Indexes

| Rule | Standard |
|------|----------|
| Foreign keys | Index on EVERY FK column |
| Frequent queries | Index on WHERE/ORDER BY columns |
| Unique lookups | Unique index on email, slug, external_id |
| Composite | Order: equality first, then range, then sort |
| RLS columns | Index columns used in RLS policies |
| `created_at` | DESC index for chronological queries |
| Partial indexes | WHERE clause for subset queries |

**Audit query:**

```sql
SELECT c.table_name, c.column_name FROM information_schema.columns c
WHERE c.table_schema = 'public' AND c.column_name LIKE '%_id' AND c.column_name != 'id'
 AND NOT EXISTS (
 SELECT 1 FROM pg_indexes i
 WHERE i.schemaname = 'public' AND i.tablename = c.table_name
 AND i.indexdef LIKE '%' || c.column_name || '%'
 );

SELECT t.table_name, COUNT(i.indexname) as idx_count
FROM information_schema.tables t
LEFT JOIN pg_indexes i ON i.tablename = t.table_name AND i.schemaname = 'public'
WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name HAVING COUNT(i.indexname) <= 1;
```

### 3.6 Row Level Security (Supabase)

| Rule | Standard |
|------|----------|
| RLS enabled | every public table has RLS on — without it the anon key reads every row |
| SELECT policy | Exists for every table |
| INSERT policy | WITH CHECK on user ownership |
| UPDATE policy | USING + WITH CHECK on ownership |
| DELETE policy | USING on ownership |
| Service role | Bypasses RLS (never expose to client) |
| Performance | `(select auth.uid())` subquery pattern |
| Indexes | On columns used in policies |

**Audit queries:**

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false;

SELECT t.tablename FROM pg_tables t
WHERE t.schemaname = 'public' AND t.rowsecurity = true
 AND NOT EXISTS (
 SELECT 1 FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = 'public'
 );

SELECT tablename, policyname, qual FROM pg_policies
WHERE schemaname = 'public'
 AND qual::text LIKE '%auth.uid()%'
 AND qual::text NOT LIKE '%(select auth.uid())%';
```

### 3.7 Relationships and Normalization

| Rule | Standard |
|------|----------|
| 3NF minimum | No transitive dependencies |
| Junction tables | For many-to-many (`user_roles`, not JSON arrays) |
| No data duplication | Normalize repeated data into lookup tables |
| Cascade rules | Defined on every FK relationship |
| Self-referencing | Use with `parent_id` pattern when needed |
| Polymorphic | Avoid — use junction tables or STI instead |

### 3.8 Migrations

| Rule | Standard |
|------|----------|
| Sequential numbering | Timestamps or `0001_`, `0002_` prefixes |
| Descriptive names | `0003_add_user_roles.sql` not `0003_update.sql` |
| Idempotent | `IF NOT EXISTS`, `IF EXISTS` guards |
| No data loss | Down migrations or rollback plan |
| Atomic | One logical change per migration |
| No breaking changes | Additive first, then backfill, then cleanup |

### 3.9 Security

| Rule | Standard |
|------|----------|
| No plaintext secrets | Passwords hashed, tokens encrypted |
| PII protection | Sensitive columns identified and protected |
| Audit trail | `created_by`, `updated_by` on sensitive tables |
| Grants | Minimal privileges per role |
| Extensions | Only necessary extensions enabled |
| Search path | Explicit schema references |

**Audit query:**

```sql
SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema = 'public'
 AND (column_name LIKE '%password%' OR column_name LIKE '%secret%'
 OR column_name LIKE '%token%' OR column_name LIKE '%ssn%'
 OR column_name LIKE '%credit_card%');

SELECT grantee, table_name, privilege_type FROM information_schema.table_privileges
WHERE table_schema = 'public' ORDER BY grantee, table_name;
```

---

## Step 4: Full Schema Health Check (Single Query)

```json
supabase:execute_sql
{
 "query": "WITH table_info AS (SELECT t.table_name, EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'id') AS has_id, EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_at') AS has_created_at, EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_at') AS has_updated_at, (SELECT rowsecurity FROM pg_tables pt WHERE pt.tablename = t.table_name AND pt.schemaname = 'public') AS rls_enabled, (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.table_name AND p.schemaname = 'public') AS policy_count, (SELECT COUNT(*) FROM pg_indexes i WHERE i.tablename = t.table_name AND i.schemaname = 'public') AS index_count FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE') SELECT table_name, CASE WHEN has_id THEN 'Y' ELSE 'N' END AS id, CASE WHEN has_created_at THEN 'Y' ELSE 'N' END AS created_at, CASE WHEN has_updated_at THEN 'Y' ELSE 'N' END AS updated_at, CASE WHEN rls_enabled THEN 'Y' ELSE 'N' END AS rls, policy_count AS policies, index_count AS indexes FROM table_info ORDER BY table_name"
}
```

---

## Further reading

- [Step 5: Prisma Schema Audit and more](references/details.md)
