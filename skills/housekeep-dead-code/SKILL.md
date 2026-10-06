---
name: housekeep-dead-code
description: >
  Remove dead code by category — one commit each, typecheck and tests between,
  bisect on red — then add a Knip ratchet. Use when "delete the dead code" or
  "wire up Knip". Audit first → plan-dead-code. README/deps →
  workflow-housekeep.
license: MIT
---

# housekeep-dead-code — Delete by category, then ratchet

**Degree of freedom: MIXED.** Category order, the `--fix-type` sequence,
one-commit-per-category, and verification between commits `[LOW freedom —
run exactly]`; whether a specific flagged item is truly dead
`[HIGH freedom]`.

Apply-now. `plan-dead-code` produced the reviewed keep/kill list and the
baseline; this makes the repo match it and installs the gate that keeps it
matched. **Net dead code strictly ≤ before, and no behavior change.**

This is the execution arm of `plan-dead-code`, the same way
`housekeep-gates` executes `audit-gate-logic` and `housekeep-design`
executes `plan-uiux-unification`.

Deletion is the *approved execution* of a plan. The `plan-*` preservation
contract ("no removal without an approved proposal") is satisfied by that
approval — not bypassed by this skill.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **housekeep-dead-code** (this) | Delete per approved list, cascade, install the ratchet |
| `plan-dead-code` | Prove it is dead first — config, baseline, keep/kill list |
| `housekeep-gates` | The aggregator this skill's CI job plugs into |
| `housekeep-backlog` | Parked-work register — not deletion |
| `workflow-housekeep` | README sync, build artifacts, dependency **bumps** |
| `workflow-refactor` | Restructuring code that stays (duplication fixes land here) |
| `burndown-full` | One mechanical change to 100% when a prior pass stalled |
| `db-migrator` | Authoring any `DROP` migration |
| `plan-data-integrity` | Whether a destructive migration is safe at all |
| `workflow-green-repo` | Repo already red before this pass started |

## How to reason (every commit)

1. **Scope** — one category, one commit, from the approved list only
2. **Verify** — typecheck + affected tests + build after each category
3. **Attribute** — red after a batch means *this* batch; bisect the batch
4. **Cascade** — deletion exposes new deadness; re-run, don't assume

Never carry two categories in one commit. The whole value of the sequence
is that a failure names its own cause.

## Worked example

> **Scope:** approved list has 9 unused files (7 unused shadcn components).
> `knip --fix-type files --allow-remove-files` → 9 deleted.
> **Verify:** `tsc --noEmit` clean, 214 tests pass, build ok → commit
> `chore(dead-code): remove 9 unreferenced modules`.
> **Cascade:** re-run Knip — unused exports fell 22 → 6 and unused deps
> 4 → 6 (two deps were only used by deleted files). The plan's numbers were
> already stale in the right direction.
> **Next:** `--fix-type exports,types` → typecheck flags 11 now-unused
> locals → `remove-unused-vars` → re-run Knip → clean.
> **Then:** `--fix-type dependencies` → 6 removed → `npm ci` + build.
> **Red:** build breaks. `date-fns` was referenced only inside a Tailwind
> config string. Restore that one dep, tag the finding `keep-config`, add
> the config file as an `entry`. **Do not** restore the other five.
> **Ratchet:** baseline was 41/12; now 3/0. CI pinned at `--max-issues 3`.

---

## Phase 0 — Preconditions  [LOW freedom — all four, or stop]

1. **An approved `plan-dead-code.md` exists** with a keep/kill list. No
   plan → run `plan-dead-code` first. Never delete from a raw tool dump.
2. **Working tree is clean** and the repo is green *before* you start. A
   pre-existing red build makes every later failure unattributable — that
   is `workflow-green-repo`'s job first.
3. **Verification commands are known and executed once** to establish the
   baseline: typecheck, lint, test, build. Discover them from
   `package.json`/CI, don't invent them.
4. **Behavior is locked, or the risk is stated.** If the code being deleted
   has no test coverage, deletion has no safety net. Say so out loud;
   consider `plan-test-coverage` first for anything load-bearing.

Config is already settled by the plan. If `knip.json` is still producing
hints, you are in the plan phase — go back. Knip's FAQ, verbatim:
"Auto-fixing in this state can lead to deleting code that your application
relies on."

---

## Phase 1 — Delete by category  [LOW freedom — this order, one commit each]

`--fix` never runs bare. Always `--fix-type`, one class at a time. Fix
types are `files`, `exports`, `types`, `dependencies`, `catalog`.
`--fix-type` implies `--fix`, so it needs no companion flag.

> **`--allow-remove-files` alone is also a bare fix.** With no
> `--fix-type`, Knip enables *every* fix type plus file removal. Never
> pass it by itself.

After **every** category: typecheck → affected tests → build → commit.

### C1 · Unused files — the pre-approved list only

Knip deletes what it reports *now*, not what the plan listed, and it has no
dry-run. So read the set first, diff it, then fix:

```
npx knip --files --reporter json > knip-files.json   # what would be deleted
# diff that set against the plan's approved list BEFORE fixing
npx knip --fix-type files --allow-remove-files
git status --short                                   # confirm the deletion set
```

`--allow-remove-files` is opt-in precisely to prevent accidental deletion;
it is safe here *only because a human already reviewed this exact list in
the plan*. If Knip removed a file the plan did not list, `git restore` it
immediately and fix the config that caused it. Do not commit it, and do not
treat it as a new finding.

Files go first because their removal cascades: it collapses phantom
export and dependency findings instead of leaving you to churn files you
are about to delete anyway.

### C2 · Unused exports and types

```
npx knip --fix-type exports,types
```

This removes the `export` keyword (and unused enum/namespace members), not
the implementation. What is left behind is now a module-private symbol —
which is exactly what C3 collects.

### C3 · Cascade — unused locals  [do not skip]

Knip does not remove unused variables inside files; that is a linter's
job, and the official guidance is to run one and then re-run Knip.

`remove-unused-vars` reads linter JSON **on stdin** — run it bare and it
hangs waiting for input. Pipe it, and never combine it with a linter's own
`--fix`, or the reported positions stop matching:

```
npx eslint --rule 'no-unused-vars: error' --quiet -f json | npx remove-unused-vars
npx knip                   # rinse and repeat
```

It is version 0.0.x and self-describes as "highly experimental". Your
linter's own unused-symbol autofix is the conservative substitute; either
way, review the diff rather than trusting it.

Repeat C2–C3 until the count stops moving. Each round of unexporting
creates a new round of unused locals, whose removal can orphan more
exports.

### C4 · Unused dependencies

```
npx knip --fix-type dependencies
```

Then a **clean** install (`npm ci` / `pnpm install --frozen-lockfile`) and
a full build. Dependencies referenced only from config strings, CLI
invocations, or peer requirements are the classic false positive here — a
broken build after C4 usually means one dep to restore plus one `entry`
pattern to add, not a rollback of the category.

### C5 · Debug residue  [mechanical]

Delete, never comment out. Commenting out *is* the dead code.

- `console.*` / `debugger` outside intentional logging paths — if the repo
  has a real logger, this is also a `backend-observability` handoff
- `.only` / `.skip` / `.todo` / `xit` / `xdescribe` / `fdescribe` — remove
  the **modifier, never the test.** `.only` is the highest-priority item in
  this whole skill, because it silently disables every other test in its
  file. Removing it can turn the suite red: that is a **bug it was
  hiding**, not a regression you caused. Fix or file it; never re-add
  `.only`. A `.skip`/`.todo` is usually parked work — un-skip and fix it,
  or leave it and register it in `housekeep-backlog`. **Deleting a test to
  lower this count is forbidden.**
- Commented-out code blocks — git has the history
- `utils`/`helpers` dumping grounds — split by concern

### C6 · Duplication → hand off to `workflow-refactor`

```
npx jscpd src --min-tokens 50 --reporters json
```

Near-identical components get parameterized into one; repeated try/catch
becomes a wrapper. **That is behavior-preserving restructuring, not
deletion — so it belongs to `workflow-refactor`.** Measure it here, ratchet
the percentage here, and hand the fixes over. If you do land them in this
pass, they are separate commits that never mix with C1–C4.

### C7 · Orphan assets

Delete only names with zero references in source, CSS, and HTML. Anything
reachable through a template string or hashed name stays until an owner
confirms — a name-based scan cannot see `` `/img/${slug}.png` ``.

### C8 · Suppression debt — shrink, don't sweep

Remove suppressions whose underlying error is gone (a stale
`@ts-expect-error` is itself dead code and the compiler will say so). For
the rest, **fix the cause**. Never blanket-delete `@ts-ignore` lines to
move a number; never widen a type to `any` to remove a suppression.

### C9 · Dead schema  [HUMAN GATE — do not proceed unasked]

Full playbook: [`references/supabase-hygiene.md`](references/supabase-hygiene.md).

**Ask the human to name the target database and wait for their reply.** Do
not infer it from `.env`, a linked project ref, or anything said earlier in
the session. Then: retire in code → verify zero usage across a valid stats
window → author a reversible migration.

Three traps that make a "dead" object alive, all covered in the reference:

- **In-database callers.** An RPC used only by an RLS policy, a trigger, or
  a `pg_cron` job has zero client references and is load-bearing. Check
  `pg_policies`, `pg_trigger`, and `pg_proc.prosrc` before believing a grep.
- **External callers.** An Edge Function targeted by a Stripe or GitHub
  webhook is never in your `functions.invoke()` grep.
- **Young statistics.** `pg_stat_*` counts from `stats_reset`; a staging
  database with no traffic makes everything look unused.

Tables drop in **two steps** — rename to `_deprecated_<name>` first (errors
surface immediately, data intact, rollback is another rename), drop a release
later. Regenerate types in the same commit. Migrations go to `db-migrator`;
safety judgment stays with `plan-data-integrity`.

**Never author or run a `DROP` against production in this skill.** Index
drops are reversible; column and table drops destroy data.

---

## Phase 2 — Install the ratchet  [LOW freedom — the point of the whole pass]

Cleanup without a gate regrows within weeks. This is the deliverable that
makes the pass durable. Full config — scripts, tsconfig, ESLint flat config,
lint-staged, the job, aggregator wiring, and the Supabase types-drift guard —
is in [`references/ratchet-ci.md`](references/ratchet-ci.md).

**2a. Script it** so humans, hooks, and CI run one definition — the same
flags, or "passes locally" stops predicting CI:

```json
{
  "scripts": {
    "knip": "knip --production --max-issues 0",
    "knip:all": "knip --max-issues 3 --treat-config-hints-as-errors"
  }
}
```

**2b. CI job pinned to today's count.** `--max-issues` defaults to `0`;
set it to the post-cleanup number and **only ever lower it**. Run both
modes — Knip's CI guide suggests considering a default run alongside a
production run.

Put `--treat-config-hints-as-errors` on the **default-mode** run only:
production mode disables configuration hints entirely
(`isDisableConfigHints = --no-config-hints || isProduction`), so the flag
can never fire there. Exit codes: `0` clean, `1` issues found, `2` Knip
itself failed — treat `2` as a broken gate, never as a pass, or a crashed
run reads as green.

**2c. Wire it into the single aggregator**, don't add a fourth parallel
required check. The job joins the existing `needs:` list per
`housekeep-gates`. Ratchet policy also follows that skill: one baseline per
metric, and lowering the number is a separate reviewed PR from a code
change.

**2d. Ratchet the other counts too** — duplication %, suppression count,
`console.*` count. A number with no gate is a number that grows back.

**2e. Local hooks** — `lint-staged` runs ESLint per file; Knip is repo-wide
and belongs in **pre-push**, not pre-commit. Either way the hook calls the
same npm script CI calls, so "passes locally" predicts CI.

---

## Phase 3 — Prove the ratchet bites  [LOW freedom — run both probes]

A gate nobody tested is a gate nobody has.

- **Fresh-clone probe** — deletions can pass locally on a warm
  `node_modules` and fail on a clean install:
  ```
  git clone . /tmp/dc-probe && cd /tmp/dc-probe && npm ci \
    && npm run typecheck && npm test && npm run build && npm run knip
  ```
- **Deliberate-violation probe** — on a scratch branch, add
  `export const zz = 1` to any file and push. The `dead-code` job **and** the
  aggregator must go red. If the aggregator stays green, it is counting a
  skipped job as success — that is `housekeep-gates` Phase 1. Delete the
  branch after.

---

## Anti-patterns  [LOW freedom — refuse these]

- **`knip --fix` bare, or before config settles.** Always `--fix-type`.
  `--allow-remove-files` with no `--fix-type` counts as bare.
- **Lowering a number without lowering dead code.** All of these move the
  metric and remove no code: `ignore`, `ignoreFiles`, `ignoreIssues`,
  `ignoreDependencies`, `--exclude`, a narrowed `--include`, `--workspace`
  scoping, `--no-exit-code`, switching off `noUnusedLocals` or a lint rule,
  and — the quietest one — a `rules` entry downgraded to `warn`. Knip's
  `--max-issues` total counts only issue types whose rule is `error`, so
  `rules: { files: "warn" }` reports every dead file and still exits `0`.
  Use `entry`, `paths`, `--production`, or a `@public`/`@internal` tag to
  fix a *false positive*; use deletion to fix a true one.
- **Ignoring instead of deleting.** An unused shadcn component gets
  deleted — `npx shadcn add` restores it in seconds. Ignoring it keeps
  dead code *and* adds an exemption to maintain.
- **Commenting out.** Git is the archive.
- **Big-bang commit.** One category per commit or a bisect is impossible.
- **Skipping the gate to finish.** Red after a batch means bisect the
  batch. Never `--no-verify`, never delete the failing test.
- **Deleting the test instead of the dead code**, or weakening an assertion
  so a deletion passes.
- **Counting instead of curing.** Forty unused exports from one barrel is
  one finding: the barrel.
- **Deleting untested load-bearing code** because typecheck was green.
  Typecheck cannot see a string-referenced route.

## Self-critique before claiming done  [LOW freedom — do not skip]

1. **Approved list only** — nothing deleted that the plan did not list, or
   the extra was justified in writing
2. **One category per commit** — history is bisectable
3. **Verified between** — typecheck, tests, build ran *after each* category
   with fresh output; the final gate ran after the final edit
4. **Cascade completed** — C2/C3 looped until stable, not run once
5. **No suppression laundering** — no `@ts-ignore`, `any`, skipped or
   deleted test, or weakened assertion used to get green
6. **Nothing hidden** — the count fell because code left the repo. No
   `ignore*` entry, `--exclude`, narrowed `--include`, `--workspace` scope,
   `--no-exit-code`, `rules: warn` downgrade, or disabled compiler/lint
   flag was used to move a number
7. **Ratchet live** — script + CI job + aggregator wiring exist, the
   baseline is the post-cleanup number, and both probes ran (fresh clone
   green, deliberate violation red)
8. **Schema gated** — no `DROP` without a confirmed target and a reviewed
   reversible migration
9. **Restores recorded** — every false positive is written back into
   `knip.json`/tags so the next run does not re-report it
10. **Net enforcement ≥ before** — dead code down, gate coverage up

## Definition of Done

- [ ] Approved plan loaded; tree clean; repo green at baseline
- [ ] C1–C4 applied via `--fix-type`, one commit each, verified between
- [ ] C2/C3 cascade repeated until counts stabilized
- [ ] Residue, assets, suppressions handled or explicitly deferred
- [ ] Duplication measured and ratcheted; fixes handed to `workflow-refactor`
      (or landed as separate refactor commits, never mixed with deletions)
- [ ] Schema arm gated, or completed with a reversible reviewed migration
- [ ] False positives written back as config/tags, not `ignore`
- [ ] `knip` script + CI job with `--max-issues` at the new count
- [ ] Job wired into the one aggregator gate; other counts ratcheted
- [ ] Fresh-clone probe green; deliberate-violation probe red
- [ ] Full verification ladder re-run after the last edit
- [ ] Before/after numbers reported against the plan's baseline

## Output format

1. **Per-category log** — category | plan rows applied | items removed | new chain items surfaced | gate result | commit SHA
2. **Baseline vs now** — every metric from the plan's 4a table, before → after
3. **False positives** — item | why it was live | config/tag written back
4. **Ratchet** — scripts, CI job, aggregator wiring, pinned numbers
5. **Probe evidence** — fresh clone | deliberate violation | bundle leak
6. **Deferred** — what was left and why (owner, risk, or missing coverage)
6. **Handoffs** — duplication → `workflow-refactor`; migrations →
   `db-migrator`; leftover parked items → `housekeep-backlog`; gate
   consolidation → `housekeep-gates`

Applied category-by-category. Pause for approval when a category's blast
radius is large. Schema deletion always gets explicit confirmation.
