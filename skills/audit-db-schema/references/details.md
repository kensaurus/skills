
## Contents

- Step 5: Prisma Schema Audit
- Output Template
- Database Schema Audit Report

## Step 5: Prisma Schema Audit

When auditing `schema.prisma`, check:

| Rule | Pattern |
|------|---------|
| `@id @default(cuid())` or `@default(uuid())` | On every model |
| `@updatedAt` | On `updatedAt` field |
| `@default(now())` | On `createdAt` field |
| `@@index([field])` | On FK and query fields |
| `@unique` | On email, slug, external IDs |
| `@relation(onDelete: Cascade)` | Explicit delete behavior |
| `enum` | For fixed value sets |
| `@map` / `@@map` | snake_case DB names if needed |

Use `Grep` to find violations:

```
Grep: "@relation" in prisma/schema.prisma — check all have onDelete
Grep: "@@index" in prisma/schema.prisma — count indexed fields
Grep: "String" fields without @unique that should be unique (email, slug)
```

---

## Output Template

````markdown
## Database Schema Audit Report

**Date:** [date]
**Database:** [Supabase Postgres / etc.]
**ORM:** [Prisma / Drizzle / none]
**Schema:** public
**Tables Audited:** [count]
**Issues Found:** [count]

---

### Supabase Advisor Findings

#### Security Advisors
[List each advisory with description and remediation URL]

#### Performance Advisors
[List each advisory with description and remediation URL]

---

### Audit Summary

| Category | Status | Issues |
|----------|--------|--------|
| Naming Conventions | [pass/warn/fail] | [count] |
| Data Types | [pass/warn/fail] | [count] |
| Timestamps | [pass/warn/fail] | [count] |
| Constraints | [pass/warn/fail] | [count] |
| Indexes | [pass/warn/fail] | [count] |
| RLS Policies | [pass/warn/fail] | [count] |
| Relationships | [pass/warn/fail] | [count] |
| Migrations | [pass/warn/fail] | [count] |
| Security | [pass/warn/fail] | [count] |

---

### Research Findings Applied

- [Pattern from Firecrawl/Context7]: [how it applies to this schema]
- [Best practice]: [gap identified in current schema]

---

### Critical Issues (Must Fix)

#### 1. [Table] — [Issue]
- **Problem:** [description]
- **Risk:** [data loss / security / performance]
- **Fix:**
```sql
-- migration SQL
```

---

### Warnings (Should Fix)

#### 1. [Description]
- **Table:** [table]
- **Impact:** [description]
- **Recommendation:** [fix]

---

### Table-by-Table Summary

| Table | PK | Timestamps | RLS | Indexes | FK Constraints | Status |
|-------|----|------------|-----|---------|----------------|--------|
| users | uuid | both | enabled | 3 | 0 | pass |
| posts | uuid | created only | disabled | 1 | 1 missing | fail |

---

### Next Steps

1. [ ] Fix critical issues: [list]
2. [ ] Enable RLS on: [tables]
3. [ ] Add missing indexes: [list]
4. [ ] Add updated_at triggers: [tables]
5. [ ] Re-run `get_advisors` after fixes to verify
````
