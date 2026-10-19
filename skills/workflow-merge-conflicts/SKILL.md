---
name: workflow-merge-conflicts
description: >
  Resolve an in-progress merge or rebase conflict by tracing each side back to
  its intent. Use when "resolve the conflicts", "fix this merge", "the rebase
  is stuck", or a pull has left conflict markers in the tree.
license: MIT
---

# Resolving Merge Conflicts

**Degree of freedom: MIXED.** Which intent wins `[HIGH freedom]`; inspect,
never `--abort` unasked, and run real checks `[LOW freedom — run exactly]`.

> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).

Copy this checklist and tick items as you go:

```
- [ ] Step 1: See the current state: operation and conflicting files
- [ ] Step 2: Find the primary sources for each conflict; read the intent
- [ ] Step 3: Resolve each hunk; keep both intents; never --abort unasked
- [ ] Step 4: Run the project's automated checks: typecheck, tests, lint
- [ ] Step 5: Finish the operation; tree clean and checks green
```

## How to reason

1. **Identify** — operation (merge/rebase/cherry-pick) and conflicted files
2. **Intent** — why each side changed, from commits/PRs — not the markers
3. **Preserve** — both intents if possible; else the merge's stated goal
4. **Verify** — typecheck + tests + lint; then finish the operation

## Worked example

> **Identify:** rebase of `fix/cart-sku` onto `main`; conflict in `src/lib/cart.ts`.
> **Intent:** this branch treats missing SKU as invalid; main extracted `quoteCart` to a new file.
> **Preserve:** keep the extraction and the missing-SKU branch — move the guard into `quoteCart`.
> **Verify:** `pnpm typecheck && pnpm test` green; `git rebase --continue`; tree clean.

## Self-critique before reporting

- **Intent, not text** — no "ours/theirs" from appearance alone
- **No invented behavior** — resolution does not add a third design
- **Checks run** — semantic conflicts caught after a clean text merge
- **Right owner** — message after resolve → `workflow-git-commit`; open PR lifecycle → `workflow-pr`

1. **See the current state.** `[LOW freedom — run exactly]` `git status` for the operation in progress
   (merge/rebase/cherry-pick) and the conflicting files; `git log --oneline
   --left-right HEAD...MERGE_HEAD` (or the rebase equivalent) for what each side
   contains.

2. **Find the primary sources for each conflict.** `[HIGH freedom]` Understand why each
   change was made and what the original intent was: read the commit messages,
   check the PRs, check the original issues or tickets. Never resolve a hunk on
   textual appearance alone.

3. **Resolve each hunk.** `[HIGH freedom]` Preserve both intents where possible. Where they are
   incompatible, pick the one matching the merge's stated goal and note the
   trade-off. Do **not** invent new behavior. Always resolve; never `--abort`
   without the user's explicit instruction.

4. **Run the project's automated checks** `[LOW freedom — run exactly]` — typecheck, then tests, then
   format/lint, using the repo's real scripts. Fix anything the merge broke;
   conflicts that merge cleanly at the text level can still conflict
   semantically.

5. **Finish the operation.** `[LOW freedom — run exactly]` Stage everything and commit (or `git rebase
   --continue` until all commits are replayed). Confirm the tree is clean and
   checks are green before reporting done.

**Related:** `workflow-git-commit`, `workflow-pr`, `verification-before-completion`.
