---
name: workflow-green-repo
description: >
  Drive a repository to a green baseline — typecheck, lint, tests, and build
  passing from a clean checkout — when fixing is authorized. Use when "make
  the repo green", "get CI passing", or "fix all the failing tests".
license: MIT
---

# workflow-green-repo — Whole-Repository Greening

**Degree of freedom: MIXED.** Root-cause of each failure `[HIGH freedom]`;
gate discovery, worklist, and no skip/silence `[LOW freedom — run exactly]`.

Bring the repository to a verified-green baseline: every configured health
gate passes from a clean state. This is broad, authorized cleanup — the one
place where fixing unrelated pre-existing failures is the goal, not scope
creep.

> **Green is defined by a fresh from-scratch run of every gate, not by the
> failures you happened to see.** Enumerate first, externalize the worklist,
> fix root causes in batches, and re-run until zero.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **workflow-green-repo** (this) | Whole repo to green: typecheck, lint, tests, build from clean checkout |
| `workflow-environment-ready` | Proving tools, installs, services, and verify commands work first |

## How to reason

1. **Authorize** — whole-repo green was explicitly asked
2. **Enumerate** — real commands + baseline failures, not assumed
3. **Fix-root** — no skip, narrow, or ignore
4. **Prove** — fresh from-scratch run of every gate

## Worked example

> **Authorize:** user said "get CI passing on this repo."
> **Enumerate:** `pnpm typecheck` 14 errors in `lib/billing`; `pnpm test` 3 failures on date TZ.
> **Fix-root:** restore the `Invoice` discriminant the last refactor dropped; fix TZ in the test clock, do not `.skip` the suite.
> **Prove:** typecheck/lint/test/build re-run from scratch → clean; state file has zero open failures.

## Self-critique before reporting

- **Authorized** — this was not a silent rewrite of unrelated debt
- **No fake-green** — no `.skip`, `@ts-ignore`, or weakened assertion
- **Fresh prove** — green is a new full run, not the last batch
- **Right owner** — one plan's leftovers → `complete-everything`; one pattern → `burndown-full`; ratchet gaming → `audit-gate-logic`

## When NOT to use this  [LOW freedom — do not skip]

- The user asked to finish one plan or feature → use `complete-everything`.
- The change is one searchable pattern across files → use `burndown-full`.
- No explicit authorization to touch pre-existing debt → confirm scope first;
  do not silently rewrite unrelated code.

## Phase 0 — Confirm authorization and discover gates  [LOW freedom — run exactly]

1. Confirm the user wants the **whole repo** green, including debt that predates
   their work. If the surface is narrower, route to `complete-everything`.
2. Discover the real gate commands — never assume them. Read `package.json`
   scripts, `Makefile`, `justfile`, CI workflows (`.github/workflows/*`),
   `AGENTS.md`, `CLAUDE.md`, and README. Identify the exact commands for:
   typecheck, lint/format, unit/integration tests, e2e (if any), build.
3. Note the required scope for each gate (whole repo vs. per-package in a
   monorepo) and any environment prerequisites (services, env vars, fixtures).
4. Capture the **baseline**: run each gate once and record the failing output.
   This is the worklist source, and it separates real regressions from flakes.

## Phase 1 — Enumerate the full failure worklist  [LOW freedom — run exactly]

Write `.cursor/green-repo-state.md` as the durable source of truth:

```md
# Green Repo: <repo/package scope>
Gates: typecheck=`...` lint=`...` test=`...` e2e=`...|none` build=`...`
Baseline captured: <date>

## Failures
- [ ] typecheck: <file:line> — <error summary>
- [ ] lint: <rule> — <file(s)>
- [ ] test: <suite/case> — <assertion / error>
- [ ] build: <step> — <error>

## Flaky / environment-dependent (quarantine, do not fake-fix)
- [ ] <case> — <why it is nondeterministic>

## Discovered while fixing (append, then fix)
- (none yet)

## Intentional exceptions (justify each — needs human sign-off)
- (none yet)

## Evidence
- <gate>: <command> → <result>
```

State the totals: "N failing gates across M areas. Driving all to green."
Mirror the worklist into the native task list for UI visibility; the state
file wins after context compaction.

## Phase 2 — Fix root causes in batches  [HIGH freedom]

Work the list in small batches (one gate area or 5–10 related failures):

1. Read the failing code and its intent before editing. Understand why it
   fails — do not pattern-match a silence.
2. Fix the **root cause**. Forbidden: deleting/`.skip`/`.only`-ing a test,
   narrowing an assertion so it cannot fail, `@ts-ignore` / `eslint-disable` /
   `any` to hide a real type error, broad `try/catch` that swallows, or
   blanket snapshot updates that mask regressions.
3. A snapshot or golden file may be updated only when the output change is
   correct and intended — state why.
4. Tick the item in the state file immediately per batch.
5. Append any newly surfaced failure to **Discovered while fixing** and close
   it in this run.
6. If a failure is genuinely flaky or needs a real environment you lack, move
   it to the quarantine/exception section with a precise reason — never fake a
   pass. Real environment blockers are the only stop condition.
7. Edit surgically: change what causes the failure, not the surrounding file. Tests you add exist only to pin the fix or to match what the repo already keeps; scratch scripts used to reproduce stay out of the repo.

Do not pause between batches to ask "continue?", and do not wrap up because the context is getting long — compaction will happen on a run this size and the state file carries the worklist across it. Keep going until the worklist is empty; re-read the state file instead of trusting memory.

## Phase 3 — Prove green from scratch  [LOW freedom — run exactly]

Do not report green until every configured gate passes in a fresh run:

1. Typecheck (whole configured scope) → clean.
2. Lint/format → clean.
3. Unit/integration tests → all pass; quarantined items explicitly listed.
4. E2E (if configured) → pass.
5. Build → succeeds.
6. State file: zero unchecked failures outside justified exceptions.
7. If the repo has CI, note whether the same gates run there and whether any
   are environment-specific (so local green predicts CI green).

Any new failure or regression → add to the worklist and loop back to Phase 2.
For approved-plan or wide-change contexts, invoke `completion-judge` before the
final claim.

## Phase 4 — Report  [LOW freedom — do not skip]

```md
## Green Repo — report
Scope: <repo/packages>
### Result: GREEN | GREEN WITH QUARANTINE | BLOCKED
### Gates
- typecheck: `<cmd>` → clean
- lint: `<cmd>` → clean
- tests: `<cmd>` → <n> passed
- build: `<cmd>` → ok
### Fixed
- <count> failures across <areas>
### Quarantined / exceptions (each justified)
- <case> — <reason, tracking recommendation>
### Environment blockers (real human/infra gates only)
- none | <blocker + one precise ask>
```

Leave `.cursor/green-repo-state.md` in place as the audit trail unless asked to
remove it. Suggest committing mechanical fixes separately from behavioral ones
if that aids review.

## Related

- `complete-everything` — close one plan's connected scope (not the whole repo)
- `burndown-full` — one searchable pattern to 100% coverage
- `audit-gate-logic` — whether the green baseline / ratchet can be gamed
- `verification-before-completion` — evidence levels this skill proves
- `completion-judge` — independent verdict before a green claim
- `debug-error` — root-cause a single stubborn failure
