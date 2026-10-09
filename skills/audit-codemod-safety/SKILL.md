---
name: audit-codemod-safety
description: >
  Read-only check that a codemod or bulk transform preserved behavior —
  compiling is not proof. Use when "did this codemod break anything", "audit
  this bulk refactor", or before merging a mass find-replace. SQL →
  plan-data-integrity.
license: MIT
effort: high
---

# audit-codemod-safety — A clean compile and lint does not mean it behaves the same

**Degree of freedom: MIXED** — Phases 0–2 `[HIGH freedom]`; Phase 3
high-risk hand-trace `[LOW freedom — run exactly]`. Do not re-run the
transform.

Read-only. A codemod's danger is scale plus plausibility: it touches hundreds
of files and each diff looks trivially correct, so review fatigue waves it
through. A mechanical transform proves **syntax, not semantics**.

Present findings. Do not re-run the transform or edit the diffs. Hand fixes
to a follow-up session.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-codemod-safety** (this) | Source-transform correctness at scale — behavior, completeness, consistency |
| `audit-code-review` | General PR / diff quality on a named change set |
| `plan-data-integrity` | Data / SQL / destructive migrations — not JS/TS source mods |
| `audit-code-quality` | Repo-wide anti-patterns, not one mechanical pass |
| `burndown-full` | Drive a leftover MATCH pattern to zero — this *audits* whether the pass was safe |
| `audit-gate-logic` | If size defeated review and syntax defeated linters, that is also a gate-logic finding |

## How to reason

1. **Observe** — quote the rule, the before/after AST or text, and a concrete diff hunk
2. **Interpret** — does the swap change runtime meaning, or only spelling?
3. **Classify** — silent behavior change / incomplete migration / consistent-as-is / needs-a-probe
4. **Severity** — silent runtime change on a hot path = critical

## Worked example

> **Observe:** codemod rewrote `value || fallback` → `value ?? fallback` in
> `pricing.ts`. Tests still pass.
> **Interpret:** `0` and `''` now keep the left side; price `0` no longer
> falls back. Syntax-clean; semantics changed.
> **Classify:** silent behavior change (truthiness vs nullish).
> **Severity:** critical if money path; else major.
> **Finding:** `pricing.ts:41` | `||`→`??` | critical | `0` no longer defaults

---

## Phase 0 — Characterize the transform  [HIGH freedom]

Establish what was done and how:

- Tool: jscodeshift / ts-morph / ast-grep / comby / regex `sed` / AI bulk edit
- Rule in plain terms ("replace X API with Y", "rename Z", "new import path")
- Blast radius (files touched, LOC)
- AST-based (structure-aware) vs text/regex (no scope awareness — higher risk)

Get the diff **and** the codemod script if it exists. Auditing the *rule*
often finds the gap faster than reading 300 diffs.

---

## Phase 1 — Behavior-preservation  [HIGH freedom]

**Semantic-equivalence traps** — syntactic swap, different runtime meaning:

- Operator / precedence shifts (replacement needed parens and did not get them)
- Truthiness vs nullish (`||` → `??` or reverse changes `0` / `''` / `false`)
- Async/await vs `.then` that drop error propagation or change ordering
- Reference vs value, mutate-in-place vs copy, shallow vs deep
- Import swaps with different defaults, side effects, or tree-shaking
- Type-only changes that alter *runtime* (`enum` → `const`, `interface` →
  `type` where declaration merging mattered)

**Comment / string / dynamic false hits** (regex sweeps especially) — pattern
matched inside strings, comments, template literals, or dynamic property
access. Text mods cannot tell code from a string that looks like code.

**Formatting-masked logic** — a reformat (Prettier bump, quote style) bundled
into the same commit as the codemod, so a real behavior change hides inside
thousands of whitespace diffs. Flag if logic and formatting were not
separated.

---

## Phase 2 — Coverage and consistency  [HIGH freedom]

**Missed cases** — matched the common shape, not the variants: alias,
re-export, dynamic import, HOC-wrapped, JSX vs call expression, tests,
`.vue` / `.svelte` / `.mdx` the parser never reached. Grep the *old*
pattern's semantic footprint — not just the exact string. Survivors mean a
half-done migration (two conventions live at once), which is worse than none.

**Inconsistent application** — same construct transformed one way here,
another way there (passes drifted, or the AI drifted). Cross-check
`audit-code-quality`.

**Generated / vendored / ignored** — touched generated code that will be
overwritten, or skipped files the runtime still loads because the ignore
list the codemod respected is not the runtime's.

**Orphans** — old helpers / imports / types the transform was supposed to
remove but left dangling; or new ones it referenced but never created.

---

## Phase 3 — Verify, don't trust  [LOW freedom — hand-trace high-risk files]

- **Test behavior, not compilation.** Did tests exercise the transformed
  paths, or do they pass because coverage there is thin? Cross-check
  `plan-test-coverage`. A codemod over untested code is unverified — say so.
- **Pair with visual / behavioral diffing** where UI is involved
  (`test-visual-regression`). Mechanical JSX / style mods are prime
  silent-break territory.
- **Gate interaction.** Did this large mechanical change slip a real bug
  past CI because its size defeated review and its syntax defeated the
  linters? If so, that is also a finding for `audit-gate-logic`.
- **Spot-probe.** Trace the highest-risk transformed files (auth, money,
  data mutation) by hand end-to-end. Scale review effort by blast radius,
  not evenly.

---

## Definition of Done

- [ ] Transform characterized: tool, rule, blast radius, AST vs text
- [ ] Codemod script / rule reviewed where available
- [ ] Semantic-equivalence traps checked (precedence, truthiness, async, refs, import semantics, type-affecting-runtime)
- [ ] Regex / text mods checked for matches inside strings / comments / dynamic access
- [ ] Formatting confirmed separated from logic (or the coupling flagged)
- [ ] Old-pattern footprint grepped for survivors → migration completeness assessed
- [ ] Inconsistent application across the repo surfaced
- [ ] Generated / vendored / ignored file handling verified
- [ ] Orphaned / dangling symbols found
- [ ] Transformed paths confirmed actually tested; high-risk files hand-traced
- [ ] Gate-bypass interaction noted for `audit-gate-logic` if the mod hid a bug past CI
- [ ] Read-only — findings presented, code not edited

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Evidenced** — quoted hunk or surviving old-pattern grep, not "looks fine"
2. **Semantics not syntax** — compiles/lints is not a pass
3. **Severity justified** — critical = silent runtime change
4. **Right owner** — CI waved it through → also `audit-gate-logic`
5. **No re-run** — findings only; do not re-apply the transform

## Output format

1. **Transform summary** — tool | rule | files touched | AST or text | tests covering the paths?
2. **Behavior-change findings** — file:line | trap type | severity (critical = silent runtime change) | why the diff looks fine but isn't
3. **Coverage / consistency findings** — surviving old-pattern instances | inconsistent conversions | orphans
4. **Verification log** — high-risk files traced | result; test-coverage verdict on transformed paths
5. **Fix plan** — silent behavior changes first, then migration completeness, then consistency; handoffs to `test-visual-regression`, `plan-test-coverage`, `audit-gate-logic`, a fix session. Present and stop.
