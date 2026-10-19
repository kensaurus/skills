---
name: workflow-pr
description: >
  Manage an existing PR lifecycle — review, bot feedback, conflicts,
  merge. Use when opening a PR from an already-committed branch,
  addressing review, or merging. Uncommitted working tree to
  merge-ready → workflow-release-prep.
license: MIT
---

# PR Workflow Skill

**Degree of freedom: MIXED.** Feedback judgment `[HIGH freedom]`; validations,
poll loop, and merge-only-if-asked `[LOW freedom — run exactly]`.

Full checklist for an already-committed branch or an open PR.

Uncommitted / staged / untracked working tree that still needs review,
commit, and a merge-ready PR is **`workflow-release-prep`**. This skill
does not own that sequence.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **workflow-pr** (this) | Existing PR lifecycle: review, bot feedback, conflicts, merge if asked |
| `workflow-release-prep` | Uncommitted working tree to a merge-ready PR; never merges |
| `workflow-build-feature` | Feature end to end: spec, TDD, tests, Playwright, then PR |
| `workflow-fix-and-ship` | One bug-fix lifecycle: triage, debug, test, fix, then PR |
| `workflow-mobile-native-uiux` | Full native UI/UX run on Capacitor, Expo, or RN to a PR |

## How to reason

1. **Validate** — repo commands green; no secrets in the branch
2. **Open** — template + complete description
3. **Drive** — poll checks; address every thread
4. **Gate** — mergeable_state clean AND threads 0; merge only if asked

## Worked example

> **Validate:** `pnpm typecheck && pnpm test` green; no `.env` in the diff.
> **Open:** PR uses the repo template; title `fix(checkout): handle deleted SKU`.
> **Drive:** CI red on lint → fix, push, re-poll; reply + resolve the bot thread.
> **Gate:** `mergeable_state=clean`, 0 threads; user did not ask to merge → report merge-ready and stop.

## Self-critique before reporting

- **Already committed** — dirty tree was routed to `workflow-release-prep`
- **Both gates** — never treat `mergeable: true` as approval
- **Merge gated** — no merge unless the user explicitly asked
- **Right owner** — uncommitted pile → `workflow-release-prep`; keep-green loop after open → `babysit`

## Invocation boundary

- **Standalone:** open or manage the PR. Merge only when the user explicitly
  asked to merge.
- **Called by `workflow-release-prep`:** open the PR and return its URL.
  `babysit` owns the green loop; the caller stops before merge.

## Phase 1: Before Creating PR  [LOW freedom — run exactly]

### 1. Run Validations

**JavaScript/TypeScript:**
```bash
pnpm typecheck && pnpm build && pnpm test
# or: npm run typecheck && npm run build && npm test
```

**Python:**
```bash
mypy . && python -m pytest && ruff check .
```

**With Makefile:**
```bash
make typecheck && make build && make test
```

### 2. Security Scan

Before committing, verify:
- [ ] No hardcoded paths (`/Users/username/...`)
- [ ] No secrets, API keys, or tokens
- [ ] No machine-specific values
- [ ] Environment variables for sensitive data

### 3. Create PR

1. Search for `pull_request_template.md` in repo
2. Use template structure for PR description
3. Create PR with clear title and description

---

## Phase 2: Monitor PR  [LOW freedom — run exactly]

### 4. Poll Status

Check every 60-90 seconds until checks complete:

**Understanding Check Status:**
- `mergeable: true` → Only means no git conflicts
- `mergeable_state: "clean"` → ALL checks passed, safe to merge

**Mergeable State Values:**
| State | Meaning | Action |
|-------|---------|--------|
| `"clean"` | ✅ All passed | Safe to merge |
| `"unstable"` | ⚠️ Pending/failing | Wait, poll again |
| `"blocked"` | ❌ Protection rules | Check requirements |
| `"behind"` | ⚠️ Needs update | Update branch |

### 5. Address Bot Feedback

When reviews complete:

1. **Read every comment** - Track unresolved threads
2. **For each issue:**
 - Analyze feedback
 - Implement fix
 - Commit and push
 - Reply confirming fix
 - **Mark thread resolved**

3. Address every comment — an unresolved thread fails Gate 2

### 6. Wait for Re-validation

After pushing fixes:
1. Poll status again
2. All checks must show `SUCCESS`
3. Re-fetch comments for NEW feedback
4. Repeat until clean

---

## Phase 3: Merge Criteria  [LOW freedom — run exactly]

### 7. Final Checklist

**Two gates must pass:**

| Gate | Check |
|------|-------|
| Gate 1 | `mergeable_state == "clean"` |
| Gate 2 | `unresolved_thread_count == 0` |

**Both must be TRUE to merge.**

### 8. Execute Merge

Only after both gates pass **and the user explicitly asked to merge**:
```bash
gh pr merge --merge
```

Otherwise report that the PR is merge-ready and stop.

### 9. Verify Success

Confirm merge was successful and report status.

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Checks fail 3x | Pause, ask for guidance |
| Unclear feedback | Ask clarifying questions |
| Merge blocked | Check protection rules, report |
| Checks stuck | Run local validation, ask permission |

---

## Common Mistakes

### ❌ Merging when `mergeable_state` is "unstable"
**Fix:** Always check `mergeable_state`, poll again if unstable

### ❌ Treating `mergeable: true` as approval
**Fix:** `mergeable` ≠ `mergeable_state`. Check the latter.

### ❌ Not re-checking comments after push
**Fix:** After every push, re-fetch comments for new threads

### ❌ Not marking threads resolved
**Fix:** After addressing each comment, mark thread resolved

---

## Quick Reference

```bash
# Check PR status
gh pr status

# View checks
gh pr checks <number>

# View comments
gh pr view <number> --comments

# Merge (only when both gates pass)
gh pr merge <number> --merge
```
