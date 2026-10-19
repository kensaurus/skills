---
name: audit-code-review
description: >
  Review a PR or diff for correctness, security, and maintainability. Use for
  a pull request, a named change set, or "review my changes". Repo-wide
  anti-patterns → audit-code-quality. Bulk transforms → audit-codemod-safety.
license: MIT
effort: high
---

# Code Review Skill

**Degree of freedom: MIXED** — Phases 1–2 judgment `[HIGH freedom]`;
mandatory pre-review git/docs `[LOW freedom — run exactly]`.

Review this PR or named diff. Repo-wide anti-patterns → `audit-code-quality`.
Bulk transform semantics → `audit-codemod-safety`.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-code-review** (this) | Review one PR or named diff: correctness, security, maintainability |
| `audit-code-quality` | Repo-wide anti-patterns and consistency drift: naming, organisation, smells |
| `audit-codemod-safety` | Read-only check that a codemod or bulk transform preserved behavior |
| `workflow-release-prep` | Working tree to a merge-ready PR; drive CI green, never merge |

## How to reason

1. **Observe** — quote the hunk and the surrounding file (not the line alone)
2. **Interpret** — what breaks, leaks, or duplicates if this merges?
3. **Classify** — blocking / suggestion / nit / praise
4. **Severity** — security, data-loss, or break-existing = blocking

## Worked example

> **Observe:** new `GET /api/invoices/:id` returns `Invoice.findById(id)`
> with no `userId` predicate (`app/api/invoices/[id]/route.ts` in this diff).
> **Interpret:** any authenticated caller reads another user's invoice.
> **Classify:** blocking (IDOR).
> **Severity:** Critical — must fix before merge.
> **Finding:** `[id]/route.ts` | add ownership check | blocking

## Pre-review checks  [LOW freedom — run exactly]

**Before reviewing code:**

### 1. Read Relevant Documentation
```
README.md (project conventions)
src/[domain]/@_[domain]-README.md (domain-specific patterns)
CONTRIBUTING.md (code standards)
```

### 2. Understand the Full Change

If reviewing a PR or commit:
```bash
git log --oneline -10 # recent context
git diff <base>..HEAD --stat # files changed
git diff <base>..HEAD # full diff
```

If reviewing a specific file, read the FULL file for context — not just the changed lines.

### 3. Check for Duplicate Implementations

Use `Grep` and `SemanticSearch` to verify:
- Does this code duplicate existing functionality?
- Is there an existing component/service that should have been extended?
- Does this follow established patterns in the codebase?

### 4. Check Production Impact (Sentry)

If the change touches error-prone code, check if related Sentry issues exist:

```json
sentry:search_issues
{
 "organizationSlug": "<ORG_SLUG>",
 "query": "issues related to <component or function being changed>",
 "projectSlugOrId": "<PROJECT_SLUG>",
 "regionUrl": "<REGION_URL>",
 "limit": 10
}
```

This reveals: does the code being changed have known production issues? Does this change fix or risk introducing them?

### 5. Research Current Best Practices (for non-trivial patterns)

If the code uses a pattern you want to verify:

```json
firecrawl:firecrawl_search
{
 "query": "<framework> <pattern> best practice <current year>",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

---

## Review Process  [HIGH freedom]

### Phase 1: High-Level Assessment

Before line-by-line review:
- What is the purpose of this change?
- Does the approach make sense architecturally?
- Are there simpler alternatives?
- Does this introduce new dependencies? Are they justified?

### Phase 2: Detailed Review Checklist

#### Correctness
- [ ] Logic is correct for all expected inputs
- [ ] The change does what the PR / task says — a missing requirement, half-implemented path, or silently narrowed scope is a blocking finding
- [ ] Edge cases handled (null, empty, overflow, concurrent access)
- [ ] No obvious bugs (off-by-one, wrong operator, missing await)
- [ ] Error handling is full and appropriate
- [ ] Async code handles race conditions and cleanup (AbortController, etc.)

#### Security
- [ ] No SQL injection vectors (raw queries with user input)
- [ ] No XSS vulnerabilities (dangerouslySetInnerHTML, innerHTML)
- [ ] No hardcoded secrets or credentials
- [ ] Input validation present on all user-facing endpoints
- [ ] Auth/authz properly checked (not just at UI level)
- [ ] No sensitive data in logs or error messages

#### Performance
- [ ] No N+1 queries (batching, eager loading)
- [ ] No unnecessary loops or repeated computations
- [ ] Appropriate data structures (Map vs Object, Set vs Array)
- [ ] No memory leaks (event listeners cleaned up, subscriptions unsubscribed)
- [ ] React: no unnecessary re-renders (memo, useMemo, useCallback where appropriate)
- [ ] Database: queries use indexes, avoid full table scans

#### Readability
- [ ] Clear, descriptive names (functions, variables, types)
- [ ] Functions appropriately sized (single responsibility)
- [ ] Comments explain "why" not "what" (non-obvious constraints only)
- [ ] Consistent with project's existing style

#### Maintainability
- [ ] DRY — no duplicated logic that should be shared
- [ ] Single responsibility — each function/component does one thing
- [ ] No magic numbers or strings (use constants or union types)
- [ ] Types are specific (no `any`, no overly broad unions)
- [ ] Dependencies are appropriate and minimal

#### Testing
- [ ] Tests cover the change (happy path + edge cases)
- [ ] Tests are independent and deterministic
- [ ] No flaky tests introduced (timeouts, race conditions)
- [ ] Test names describe the expected behavior

#### Duplicate Prevention
- [ ] No duplicate components (checked `src/components/`)
- [ ] No duplicate services or hooks
- [ ] Extends rather than duplicates existing patterns
- [ ] Shared logic extracted to utility/hook when used 2+ times

---

## Feedback Format

Use severity levels:

```markdown
### Critical (must fix before merge)
**[File:Line]** — [Description]
Why: [Impact if not fixed]
Fix: [Specific suggestion]

### Suggestion (recommended improvement)
**[File:Line]** — [Description]
Why: [Benefit of the change]
Alternative: [How to improve]

### Nitpick (optional, non-blocking)
**[File:Line]** — [Description]

### Praise (good patterns to reinforce)
**[File:Line]** — [What's done well and why]
```

---

## Blocking vs Non-Blocking

### Blocking (must fix)
- Security vulnerabilities
- Data corruption risks
- Breaking existing functionality
- Missing critical error handling
- Performance regressions (measurable)
- Type safety violations (`any`, unchecked casts)

### Non-Blocking (suggestions)
- Better naming or organization
- Missing tests for edge cases
- Documentation gaps
- Minor performance improvements
- Style preferences not covered by linter

---

## Common Patterns to Flag

### TypeScript/JavaScript
```typescript
// BLOCK: any types
const data: any = response;

// BLOCK: unhandled promises
fetchData(); // missing await or .catch()

// BLOCK: implicit type coercion in conditions
if (value) // when value could be 0 or ""

// SUGGEST: magic strings
if (status === 'active') // use a constant or union type
```

### React
```tsx
// BLOCK: missing key in lists
{items.map(item => <Item {...item} />)}

// BLOCK: stale closure in useEffect
useEffect(() => {
 setInterval(() => console.log(count), 1000); // captures stale count
}, []);

// SUGGEST: inline object creation in props
<Component style={{ margin: 10 }} /> // new object each render
```

### Database
```sql
-- BLOCK: SQL injection vector
WHERE name = '${userInput}'

-- SUGGEST: missing index
SELECT * FROM orders WHERE user_id = ? -- is user_id indexed?

-- SUGGEST: SELECT *
SELECT * FROM users -- select only needed columns
```

---

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Evidenced** — `File:Line` from the diff, not "this could be better"
2. **Reproducible** — read the full file, not only the hunk
3. **Severity justified** — blocking = security / data-loss / break / missing critical handling
4. **Right owner** — repo-wide smells → `audit-code-quality`; bulk transform → `audit-codemod-safety`
5. **No-false-safety** — linter-covered style is not blocking

## Review Response Template

```markdown
## Code Review: [PR Title / File]

### Summary
[1-2 sentence overall assessment — is this ready to merge?]

### Critical (blocking)
[List any must-fix findings]

### Suggestions (recommended)
[List recommended improvements]

### Praise
[Highlight good practices — reinforces positive patterns]

### Questions
[Clarifying questions about intent or design decisions]

### Research Notes
[If patterns were verified via Firecrawl/Context7, note what was confirmed]
```

---

## What counts as a finding

Blocking findings are correctness bugs, security holes, data-loss paths, and
gaps between what the change claims and what it does; suggestions and nits
follow the Feedback Format above. Each finding names the line, the
consequence, and a fix. Style that the linter or the codebase's own
conventions already cover is not a finding at any tier. Read the surrounding
code before judging a hunk, and where intent is unclear, ask in the Questions
section rather than assume.
