---
name: workflow-release-prep
description: >
  Take the local working tree to a merge-ready PR against main: review, split
  if needed, commit, push, open the PR, drive CI green; never merge. Use when
  "prepare this for a PR" or "get my working tree merge-ready". Existing PR →
  workflow-pr.
license: MIT
metadata:
  chain: "audit-code-review workflow-git-commit workflow-pr"
effort: high
---

# workflow-release-prep — Local working tree → merge-ready PR

**Degree of freedom: MIXED.**

- Review & readiness (Phases 1–2): **HIGH freedom** — judge whether the
  change is coherent and safe.
- Git operations (Phases 0, 3–5): **LOW freedom** — commit / push / PR
  mechanics run exactly, in order. A wrong branch or a force-push is
  real damage.

Apply-now, end to end. Take everything in the **local working tree** —
uncommitted + staged + untracked + unpushed commits, reviewed together as
one release unit — and drive it to a merge-ready PR against main.
**Do not merge.** This orchestrates existing skills rather than
re-implementing them: hand deep passes to the specialists, own the
sequence and the go/no-go.

Scope is the **local working tree only** — not open PRs, not
merged-unreleased work. One developer's pending change, prepared properly.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **workflow-release-prep** (this) | Whole dirty tree → merge-ready PR; sequence + verdict |
| `workflow-pr` | Lifecycle of an **already-committed** / existing PR, including merge |
| `workflow-launch-ready` | Product launch sweep (SEO / PWA / i18n), not git prep |
| `workflow-quality-gate` | Pre-release *quality* sweep; does not commit or open a PR |
| `workflow-git-commit` | Conventional commit messages only |
| `audit-code-review` | Quality / security / maintainability of a named diff |
| `split-to-prs` (Cursor extra) | Slice one pile into reviewable PRs — wait for approval |
| `babysit` (Cursor extra) | Keep an **open** PR green (comments / conflicts / CI) |
| `housekeep-backlog` | What's *not* done across the repo |
| `docs-adr` | Decisions made along the way |

Pre-release trio: `housekeep-backlog` (what's parked) → this skill
(what's done, onto a PR) → `docs-adr` (decisions).

## How to reason

1. **Observe** — unstaged + staged + untracked + unpushed as one unit
2. **Interpret** — one reviewable concern, or several tangled together?
3. **Classify** — GO / SPLIT / BLOCKED
4. **Severity** — a secret or broken test blocks; formatting churn does not

## Worked example

> **Observe:** feature + leftover `console.log` + an unrelated lockfile bump.
> **Interpret:** two concerns; debug residue is a completeness fail.
> **Classify:** SPLIT the lockfile; remove the log; then GO.
> **Gate:** do not open a PR around the leftover debug print.

---

## Phase 0 — Snapshot the working tree  [LOW freedom — run exactly]

Establish what's pending before touching anything:

- `git status` and `git branch --show-current` — confirm you are **not**
  on `main` / `master`. If you are, stop and create a feature branch
  first. Committing release prep straight to main is the failure this
  guards.
- `git diff` (unstaged) + `git diff --staged` — the complete change set,
  reviewed as one.
- `git log origin/main..HEAD --oneline` (fall back to `origin/master` if
  that is the default) — already-committed, unpushed work on this branch
  is part of the release unit.
- `git status --porcelain` — untracked files are easy to forget to add.

State the full pending scope: modified, staged, unstaged, untracked, and
unpushed-committed. That aggregate is what gets reviewed.

---

## Phase 1 — Review the whole change together  [HIGH freedom]

Read **`audit-code-review`** and run it on the **aggregate** diff. Do not
duplicate its quality / security / maintainability logic.

Then add the release lens a single-diff review misses:

- **Coherence** — one logical unit, or several unrelated ones tangled
  together? If several → Phase 2 splits them.
- **Completeness** — half-finished work about to ship? Cross-check the
  markers `housekeep-backlog` / `plan-stub-checker` hunt: new
  `TODO` / `FIXME`, `console.log` / debug prints, commented-out code,
  `.skip`ed tests, stubbed handlers. Release prep is when these must not
  slip through.
- **Accidental inclusions** — secrets or keys (→ `plan-secrets-audit` if
  suspected; **never commit them**), `.env` files, large binaries,
  editor / OS cruft, debug config, unrelated formatting churn.
- **Migration / flag safety** — if the diff touches schema or flags, is
  it backward-compatible for the deploy window? Unsure →
  `plan-data-integrity` / `workflow-feature-flag`.

---

## Phase 2 — Reason about readiness, then decide split  [HIGH freedom]

Run this chain before proceeding:

1. **Observe** — what does the aggregate contain, across how many concerns?
2. **Interpret** — one reviewable PR, or unrelated changes a reviewer
   cannot evaluate together?
3. **Decide** — single PR, or split? If it spans multiple unrelated
   concerns or is large enough to be unreviewable, hand to
   **`split-to-prs`** and prepare each separately. A 2000-line PR mixing
   a feature, a refactor, and a dependency bump is three PRs.
4. **Gate** — is anything blocking release (secret, broken test,
   half-finished feature)? If yes, surface it and **stop before
   committing** — do not prepare a PR around a known problem.

## Self-critique before committing  [LOW freedom — do not skip]

Challenge the change against this rubric. If any item fails, fix or
surface it before Phase 3:

- **Complete** — nothing half-implemented, no debug residue, no
  stubbed-and-forgotten path.
- **Clean** — no secrets, no accidental files, no unrelated churn
  padding the diff.
- **Coherent** — one logical unit per PR (or split decided).
- **Tested** — the change is covered, or the coverage gap is named
  (→ `plan-test-coverage`). Existing tests are not broken.
- **Safe** — migrations backward-compatible; flags default off; no
  breaking API change to a live consumer without a note.

---

## Phase 3 — Commit  [LOW freedom — run exactly]

Stage deliberately (`git add` the intended files — not blanket
`git add .` if untracked cruft exists). Hand message-writing to
**`workflow-git-commit`** for conventional-commit format. One commit per
logical change; a split PR set gets its own commits per PR. Never bundle
unrelated changes in one commit.

---

## Phase 4 — Push & open the PR  [LOW freedom — run exactly]

- Push the feature branch (`git push -u origin <branch>`). Never
  force-push a shared branch.
- Open the PR against main via **`workflow-pr`**, with a complete
  description: what changed and why, how it was tested, any migration /
  flag / rollout notes, and links to the relevant `docs-adr` or `BL-`
  backlog items if this closes them. A reviewer should not have to
  reverse-engineer intent.
- Confirm the repo's aggregator / required checks fire on the PR
  (`housekeep-gates` / `workflow-quality-gate` if those exist here).
  This skill does not run those sweeps; it makes sure they are wired
  to fire.

---

## Phase 5 — Drive to merge-ready  [LOW freedom — hand off]

Hand to **`babysit`** to keep the PR merge-ready: address bot / review
feedback, resolve straightforward conflicts, fix red CI, loop until
green and reviewed. **Stop at merge-ready — do not merge.** The human
(or a separate release step) makes the merge call. This job ends at
"green, reviewed, and waiting for the button."

---

## Definition of Done

- [ ] Working tree snapshotted; confirmed on a feature branch, not main
- [ ] Full pending scope (unstaged + staged + untracked + unpushed)
      reviewed as one unit via `audit-code-review`
- [ ] Release-lens checks done: coherence, completeness, no debug / stub
      residue, no accidental inclusions, migration / flag safety
- [ ] Self-critique rubric passed (complete / clean / coherent / tested /
      safe); blockers surfaced, not papered over
- [ ] Split decision made; multi-concern work routed to `split-to-prs`
- [ ] Committed via `workflow-git-commit` (conventional, one logical
      unit per commit)
- [ ] Pushed to a feature branch (no force-push); PR opened via
      `workflow-pr` with a complete description
- [ ] Aggregator / required checks confirmed firing on the PR
- [ ] Driven to merge-ready via `babysit`; **not** merged

## Output format

1. **Pending scope** — files by state; what's included
2. **Review summary** — `audit-code-review` findings + release-lens
   findings, severity-ordered
3. **Readiness verdict** — GO / SPLIT / BLOCKED, with the self-critique
   rubric result
4. **Actions taken** — commits made, branch pushed, PR link
5. **Merge-ready status** — CI state, outstanding review items, what
   remains before the human merges

Stop at merge-ready. Handoffs: `audit-code-review`, `split-to-prs`,
`workflow-git-commit`, `workflow-pr`, `babysit`, `plan-secrets-audit`
(if secrets suspected).
