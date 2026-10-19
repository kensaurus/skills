---
name: workflow-refactor
description: >
  Scoped, behavior-preserving refactor: map dependencies, change structure,
  run affected tests. Use when "refactor this", "reduce duplication", or
  "improve readability". Dead code → plan-dead-code. Repo-wide smells →
  audit-code-quality.
license: MIT
---

# Refactor Code Skill

**Degree of freedom: MIXED.** Structure target `[HIGH freedom]`;
behavior-preserving checks and affected tests `[LOW freedom — run exactly]`.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **workflow-refactor** (this) | Scoped, behavior-preserving structure change with affected tests run |
| `audit-code-quality` | Repo-wide anti-patterns and consistency drift, detected and fixed |
| `plan-dead-code` | Plan-only dead-code audit with Knip; deletes nothing |

## How to reason

1. **Observe** — current structure, callers, tests
2. **Interpret** — duplication vs needed variation
3. **Classify** — extract / inline / rename / stop (behavior would change)
4. **Severity** — a public API change is not this skill

Everything here **preserves behavior**. Removing code is a different
contract: `plan-dead-code` proves it unreachable and `housekeep-dead-code`
deletes it against an approved list. Duplication findings arrive here from
those skills; deletions do not leave from here.

## Worked example

> **Observe:** three copy-pasted date formatters; tests only cover one.
> **Interpret:** same behavior, three implementations.
> **Classify:** extract `formatDate`; add the missing two call-site tests first (red), then extract (green).
> **Verify:** same output; no new features.

## Self-critique before reporting

- **Behavior same** — existing tests still pass; no silent product change
- **Scoped** — not a repo-wide drive-by
- **Tests first** — missing coverage added before the move when needed
- **Right owner** — repo-wide anti-pattern → `audit-code-quality`; mechanical rename → `burndown-full`

Improve code quality without changing external behavior. Research-aware.

## Pre-refactoring checks  [LOW freedom — run exactly]

**Before refactoring any code:**

### 1. Read Relevant Documentation
```
README.md (project overview)
src/[domain]/@_[domain]-README.md (domain architecture)
CONTRIBUTING.md (code standards)
```

### 2. Understand Existing Patterns

Use `Grep` and `SemanticSearch` to find:
- How similar code is structured elsewhere in the codebase
- What patterns are already established
- Every file that imports or depends on the code being refactored

### 3. Map the Blast Radius

Before changing any function, class, or component:
```bash
rg "functionName" --type ts # find all callers
rg "import.*from.*module" --type ts # find all importers
```

List every file that will be affected by the change.

### 4. Research Modern Patterns (for non-trivial refactors)

If the refactoring introduces a new pattern, verify it's current best practice:

```json
firecrawl:firecrawl_search
{
 "query": "<framework> <pattern> best practice <current year>",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Scrape the most authoritative result:

```json
firecrawl:firecrawl_scrape
{
 "url": "<best-result-url>",
 "formats": ["markdown"],
 "onlyMainContent": true
}
```

This prevents refactoring FROM one outdated pattern TO another outdated pattern.

### 5. Verification Statement

Before refactoring, state:
```
"Pre-refactoring check:
- README/docs read: [list]
- Dependent files identified: [list files that import this code]
- Blast radius: [N files affected]
- Tests exist: [YES/NO — if NO, write tests first]
- Pattern verified: [YES via research / YES matches codebase / SKIP — trivial refactor]"
```

---

## Refactoring Principles  [HIGH freedom]

1. **Behavior stays the same** — tests pass before and after
2. **Small steps** — one change at a time, verify after each
3. **Test frequently** — run tests after each change
4. **Commit often** — easy to revert if something breaks
5. **Research first** — don't replace old patterns with other old patterns
6. **Scope holds** — a smell outside the named target is a note in the report, not part of this refactor; a bug you find is a follow-up. Tests added here cover the seam being moved or match what the repo already keeps; scratch checks stay out of the repo. Move code in place rather than rewriting whole files.

---

## Code Smells and Fixes  [HIGH freedom]

| Smell | Symptom | Solution |
|-------|---------|----------|
| **Long Function** | >20 lines, does multiple things | Extract functions |
| **Duplicate Code** | Same logic in 2+ places | Extract shared function/hook |
| **Magic Numbers** | Unexplained literals | Named constants or config |
| **Deep Nesting** | 3+ levels of if/loops | Early returns, extract functions |
| **Long Parameter List** | >3 parameters | Object parameter with interface |
| **Feature Envy** | Function uses another module's data heavily | Move function to that module |
| **God Object** | One class/component does everything | Split by responsibility |
| **Primitive Obsession** | Using strings/numbers where a type would be safer | Create domain types |
| **Shotgun Surgery** | One change requires editing many files | Consolidate related logic |
| **Dead Code** | Unreachable or unused code | Not this skill — proving it dead is `plan-dead-code`, deleting it is `housekeep-dead-code`. Note it and move on |

---

## Common Refactorings  [HIGH freedom]

### Extract Function

**Before:**
```typescript
function processOrder(order: Order) {
 if (!order.items.length) throw new Error('Empty order');
 if (!order.customer) throw new Error('No customer');
 if (order.total < 0) throw new Error('Invalid total');

 const subtotal = order.items.reduce((sum, i) => sum + i.price, 0);
 const tax = subtotal * 0.1;
 const total = subtotal + tax;

 db.orders.insert({ ...order, total });
}
```

**After:**
```typescript
function processOrder(order: Order) {
 validateOrder(order);
 const total = calculateTotal(order);
 saveOrder({ ...order, total });
}
```

### Flatten Nested Conditionals

**Before:**
```typescript
function getDiscount(user: User, order: Order) {
 if (user) {
 if (user.isPremium) {
 if (order.total > 100) {
 return 0.2;
 } else {
 return 0.1;
 }
 }
 }
 return 0;
}
```

**After:**
```typescript
function getDiscount(user: User | null, order: Order) {
 if (!user) return 0;
 if (user.isPremium && order.total > 100) return 0.2;
 if (user.isPremium) return 0.1;
 return 0;
}
```

### Replace Magic Numbers

```typescript
// Before
if (password.length < 8) { ... }
if (retries > 3) { ... }
const tax = amount * 0.1;

// After
const MIN_PASSWORD_LENGTH = 8;
const MAX_RETRIES = 3;
const TAX_RATE = 0.1;
```

### Use Object Parameters

```typescript
// Before — positional args are error-prone
function createUser(name: string, email: string, age: number, role: string) { ... }

// After — named, self-documenting, extensible
interface CreateUserParams {
 name: string;
 email: string;
 age: number;
 role: string;
}
function createUser(params: CreateUserParams) { ... }
```

---

## Refactoring Process  [LOW freedom — run exactly]

```
1. Verify tests pass → 2. Make one small change → 3. Verify tests pass → 4. Commit → 5. Repeat
```

### Commit Message Format
```
refactor(scope): description of structural change

- What was changed and why
- No behavior change
```

---

## Refactoring Checklist  [LOW freedom — do not skip]

### Before Starting
- [ ] Tests pass (if no tests, write them first)
- [ ] Understand current behavior
- [ ] All dependent files identified
- [ ] Pattern researched (if introducing new pattern)
- [ ] Specific smell identified

### During Refactoring
- [ ] One change at a time
- [ ] Tests run after each change
- [ ] Working states committed

### After Refactoring
- [ ] All tests still pass
- [ ] Code is more readable
- [ ] No behavior changes
- [ ] Performance not degraded
- [ ] All dependent files updated
- [ ] Types still correct (no new `any` or casts)

---

## When NOT to Refactor  [LOW freedom — do not skip]

- No test coverage (write tests first)
- Don't understand the code yet (read and learn first)
- Code is being deleted soon
- The refactoring has no clear benefit
- Under deadline pressure (ship first, refactor in a follow-up)
