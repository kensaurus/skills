---
name: workflow-git-commit
description: >
  Create one conventional commit from an already-scoped change: stage the
  named files or hunks, write the message, commit, never push. Use when
  "commit these files" or "write a commit message". Whole tree to a PR →
  workflow-release-prep.
license: MIT
effort: low
---

# Git Commit Message Generator

**Degree of freedom: MIXED.** Type/scope/subject wording `[HIGH freedom]`;
stage-only-named-paths and never-push `[LOW freedom — run exactly]`.

Create one clear, meaningful conventional commit. This skill owns
deliberate staging + commit wording, not release preparation, pushing, or
PR creation. The change must already be logically scoped.

Copy this checklist and tick items as you go:

```
- [ ] Step 1: Analyze changes; stop if the scope is not already named
- [ ] Step 2: Stage only the named paths or hunks; no git add . or -A
- [ ] Step 3: Identify type and scope from the actual diff
- [ ] Step 4: Write the subject line: imperative, 50 chars max, no period
- [ ] Step 5: Write the body if needed; split multiple changes
- [ ] Step 6: Commit; never push or open a PR from this skill
```

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **workflow-git-commit** (this) | One conventional commit from an already-scoped change; never push |
| `workflow-release-prep` | Local working tree to a merge-ready PR against main; never merge |

## How to reason

1. **Scope** — named files/hunks already decided; else stop
2. **Type** — feat/fix/docs/… from the actual diff
3. **Subject** — imperative, ≤50 chars, why in the body if needed
4. **Bound** — commit only; never push or open a PR

## Worked example

> **Scope:** caller named `src/lib/cart.ts` and `src/lib/cart.test.ts` only.
> **Type:** `fix` — deleted SKU no longer 500s.
> **Subject:** `fix(cart): treat missing SKU as an invalid line`
> **Bound:** staged those two paths, committed, did not `git push`.

## Self-critique before reporting

- **No widen** — did not `git add .` / `-A`
- **One concern** — mixed feat+fix was split or refused
- **Conventional** — type + imperative subject, no trailing period
- **Right owner** — whole dirty tree → `workflow-release-prep`; push/PR → `workflow-pr`

## Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Build, tooling, deps |
| `ci` | CI/CD changes |

### Scope (Optional)

Component or area affected:
```
feat(auth): add OAuth2 support
fix(api): handle rate limit errors
docs(readme): update installation steps
```

---

## Process  [LOW freedom — run exactly]

### 1. Analyze Changes  [LOW freedom — run exactly]

```bash
# Read-only: inspect the already-scoped change
git diff --staged

# View changed files
git status --short
```

If the intended scope is not already clear, stop and ask the caller to name
the files or hunks. Stage only those paths/hunks. Never widen scope with
`git add .` or `git add -A`, and never push from this skill.

### 2. Identify Type and Scope  [HIGH freedom]

- What kind of change? (feat/fix/refactor/etc.)
- What component is affected?

### 3. Write Subject Line  [HIGH freedom]

**Rules:**
- Max 50 characters
- Imperative mood ("add" not "added")
- No period at end
- Lowercase after type

**Good:**
```
feat(cart): add quantity selector to items
fix(auth): prevent session timeout during checkout
refactor(utils): extract date formatting logic
```

**Bad:**
```
Fixed the bug. # Vague, past tense
feat(cart): Added new feature # Past tense, vague
Update stuff # No type, vague
```

### 4. Write Body (If Needed)  [HIGH freedom]

When to include:
- Complex changes
- Non-obvious reasoning
- Breaking changes

Format:
```
feat(payments): add Stripe webhook handler

Implement webhook endpoint to process payment events.
Handles succeeded, failed, and refunded events.

Closes #123
```

---

## Examples

### Simple Feature
```
feat(dashboard): add dark mode toggle
```

### Bug Fix with Context
```
fix(api): handle null response from external service

The third-party API occasionally returns null instead of
an empty array. Add null check to prevent TypeError.

Fixes #456
```

### Refactoring
```
refactor(hooks): extract useDebounce from search component

Move debounce logic to reusable hook for consistency
across search inputs throughout the app.
```

### Breaking Change
```
feat(api)!: change response format for user endpoint

BREAKING CHANGE: The /api/users endpoint now returns
{ data: [...], meta: {...} } instead of a plain array.

Migration: Update clients to access users via response.data
```

### Multiple Changes — Split Them
If you need to describe multiple things, consider splitting into separate commits:
```
# Instead of:
"fix(auth): fix login and add logout button and update styles"

# Do:
git commit -m "fix(auth): handle expired token error"
git commit -m "feat(auth): add logout button to header"
git commit -m "style(auth): update login form spacing"
```

---

## Quick Reference

```bash
git add -- <named-path> [...]
git commit -m "$(cat <<'EOF'
feat(scope): concise imperative subject

Explain why the change is needed when the subject is not enough.

Refs: #123
EOF
)"
```
