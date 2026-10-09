---
name: housekeep-backlog
description: >
  Inventory parked work — unfinished plans, deferred phases, TODO/FIXME,
  skipped tests, open findings — into a living BACKLOG.md that diffs
  new/done/stale. Use when "what's left behind", "inventory TODOs", or
  "consolidate the backlog".
license: MIT
---

# housekeep-backlog — Living register of parked work

**Degree of freedom: MIXED.** Discovery scan `[LOW freedom — run exactly]`.
Classification, dedup, priority `[HIGH freedom]`.

Apply-now for the **register only**. You do not implement backlog items
here. Every `plan-*` skill *creates* parked work; this is the collector.
**The failure mode is not making the inventory — it goes stale within a
month and nobody can tell if debt is shrinking.** So this is `docs-adr`
for parked work: regenerate, diff against the last run, keep stable IDs.

Prefer `docs/BACKLOG.md`. Use a root `BACKLOG.md` only if the host already
has one.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **housekeep-backlog** (this) | Discover + dedup + write/diff the register |
| `complete-everything` | Execute **one** approved plan to closure |
| `burndown-full` | Drive **one** mechanical change to 100% |
| `docs-adr` | Decision memory, not parked-work inventory |
| `plan-stub-checker` | Stub/dead-UI plan (feeds this register) |
| `workflow-feature-flag` | Flag debt execution |
| `workflow-housekeep` | README / dead files / deps — not the backlog |
| `workflow-release-prep` | What's *done* in the dirty tree → merge-ready PR |
| `enhance-agent-guardrails` | Installs the same-PR / "read BACKLOG.md" wording |

## How to reason (every candidate)

1. **Locate** — file:line or doc path; form (TODO / parked phase / skip /
   open finding / flag)
2. **Interpret** — what actual work is it? A bare `// TODO: fix` is itself
   a finding — tag `needs-triage`, do not drop it
3. **Classify** — tech-debt / unfinished-feature / deferred-plan-phase /
   test-gap / known-bug / decision-needed
4. **Status** — still-relevant / verify-done / stale-or-obsolete

Skipping Interpret produces a register of context-free TODOs nobody can
act on.

## Worked example

> **Locate:** `docs/plans/auth-refactor.md` — phases 1–2 checked, 3–4
> unchecked; last commit 4 months ago.
> **Interpret:** phase 3 is refresh-token rotation; phase 4 is audit
> follow-ups parked mid-plan.
> **Classify:** deferred-plan-phase (two items).
> **Status:** ph3 still-relevant; ph4 — `audit-auth-flows` has since run,
> so verify-done before carrying it.
> **Rows:**
> `BL-014 | deferred-phase | auth-refactor ph3: refresh rotation | relevant | high | docs/plans/auth-refactor.md`
> `BL-015 | deferred-phase | auth-refactor ph4: audit follow-ups | verify-done | med | docs/plans/auth-refactor.md`

---

## Phase 1 — Discover every source  [LOW freedom — run all]

Use workspace Grep/`rg` (not unbounded `find`). Load any
existing `BACKLOG.md` first — this run is a regeneration + diff.

The scans are independent and their raw output is long: run them in one read-only Explore subagent per source class, launched in one message, and bring back only candidate rows (file:line, form, one-line context). Keep Interpret/Classify in the main thread — they need the repo context.

- **Code markers** — `TODO|FIXME|HACK|XXX|WIP|@todo|@deprecated` with
  surrounding context; `git blame` when the age matters
- **Plan/burndown docs** — `docs/`, `plans/`, `plan-*.md`,
  `.cursor/*-state.md`: unchecked `- [ ]`, "Phase N", "out of scope",
  MATCH/DONE leftovers
- **Closure deferrals** — `complete-everything` / `burndown-full` /
  `completion-judge` recorded as deferred, blocked, or out-of-scope
- **Disabled tests** — `.skip` / `.todo` / `xit` / `xdescribe` /
  `@Ignore` / `pytest.mark.skip`
- **Open audit findings** — leftover `audit-*` / `plan-*` reports not
  yet burned down
- **Commented-out blocks** and flags gating unfinished features →
  `workflow-feature-flag` for flag debt
- **Tracker linkage** — which items have tickets vs code-only
  (untracked = highest risk of being lost)

## Phase 2 — Deduplicate  [HIGH freedom]

One real piece of work = one register row, even when a TODO, a plan
phase, and a deferral all describe it. Keep every source reference on
that row.

## Phase 3 — Classify, status, prioritize  [HIGH freedom]

- Status: relevant / verify-done (check before carrying) / stale
  (propose removal — do not auto-delete)
- Priority: impact × effort as a signal, not a fake score. Security,
  data-loss, and auth items are **high** regardless of effort
- Owner/context enough that a future session can act. No context →
  `needs-triage`, not a guess

## Phase 4 — Write the register  [LOW freedom on format]

- **Header** — last-regenerated date, counts by class and status, delta
  vs last run (new / closed / newly-stale)
- **Index** — `id | class | title | status | priority | source(s) | ticket?`
- **Stable IDs** — `BL-NNN`, never reused. Closed items move to
  **Recently closed** (history is how you see debt shrinking)
- **Agent hook** — point agent rules at the register: read it before a
  sprint/plan; new parked work adds a `BL-` row in the **same PR**.
  `enhance-agent-guardrails` installs that wording

## Phase 5 — Keep it alive

Re-run diffs: gone markers → closed; new markers → new `BL-`; unchanged
rows keep ID and history. A scheduled pass fits `workflow-housekeep`.
High-priority items hand off to `complete-everything` / `burndown-full`.
Flag debt → `workflow-feature-flag`. Decisions-needed → `docs-adr`.

## Self-critique before writing  [LOW freedom — do not skip]

1. **Sources complete** — every Phase-1 class was searched
2. **Deduped** — one work item, one `BL-`, all sources listed
3. **Actionable or tagged** — context-free rows are `needs-triage`, not dropped
4. **Inventory only** — no implementation of backlog items this pass
5. **Diff honest** — first run says so; later runs report new / closed / newly-stale
6. **IDs stable** — no reuse; closed rows stay in Recently closed

## Definition of Done

- [ ] All Phase-1 sources scanned; existing register loaded and diffed
- [ ] Every item Locate→Interpret→Classify→Status
- [ ] Duplicates merged; security/data/auth flagged high
- [ ] `BACKLOG.md` written with stable IDs, counts, delta, Recently closed
- [ ] Same-PR / agent-rule hook recorded
- [ ] Stale items proposed, not auto-deleted
- [ ] High-priority handoffs named; items not implemented here

## Output format

1. **Summary** — totals by class and status; delta vs last run
2. **BACKLOG.md** — index + Recently closed
3. **Newly discovered** — the left-behind catch
4. **Verify-done / stale** — await confirmation
5. **Handoffs** — high → `complete-everything` / `burndown-full`; flags →
   `workflow-feature-flag`; decisions → `docs-adr`
