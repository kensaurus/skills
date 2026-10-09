---
name: test-mutation
description: >
  Run mutation testing (StrykerJS, mutmut) to measure whether tests assert
  behavior, not just execute lines. Use when "add mutation testing", "are our
  tests real", "can our test suite be gamed", or after an agent bulk-generated
  tests.
license: MIT
---

# test-mutation — Coverage proves the test ran; mutants prove it would notice

**Degree of freedom: MIXED** — scope and triage `[HIGH freedom]`; first run
and CI floor `[LOW freedom — measure, then ratchet]`. Never start with the
whole repo.

Install and run the gate coverage cannot close. **Coverage proves the test
*ran* the code; mutation testing proves the test would *notice* if the
code were wrong.** The tool makes hundreds of small deliberate bugs
(mutants) — flip `>` to `>=`, delete a statement, replace a return — and
reruns the tests. Survivors mark code the tests execute but verify
nothing.

This is the specific counter to agent-generated suites: an agent can
trivially produce 90% coverage with no meaningful assertions, and every
coverage ratchet will wave them through. Mutants do not care about
coverage theater.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **test-mutation** (this) | Install / run / triage mutation testing; score ratchet |
| `plan-test-coverage` | What *should* be tested — plan only, no harness |
| `test-unit` | Write the tests |
| `audit-gate-logic` / `housekeep-gates` | Ratchet policy this score plugs into |
| `enhance-agent-guardrails` | Wording of the agent-rule hook |

## How to reason (every survivor)

1. **Observe** — mutant (operator/line) and which tests still passed
2. **Interpret** — missing assertion, untested branch, dead code, or equivalent?
3. **Classify** — the four triage classes in Phase 2
4. **Severity** — blast radius: entitlements/auth/money outrank formatters

## Worked example

> **Observe:** Stryker flipped `>` to `>=` in `entitlements.ts` expiry check;
> suite green; mutation score 62% on a 94% coverage file.
> **Interpret:** tests execute the line but never assert the boundary.
> **Classify:** missing assertion.
> **Severity:** high — paid access could extend a day.
> **Fix:** assert expired-at-exact-boundary is denied; then re-run incremental.

---

## Phase 0 — Detect stack and scope deliberately  [HIGH freedom]

Identify the runner and pick the tool: **StrykerJS** (Jest / Vitest /
Mocha, TS-aware), **mutmut** / cosmic-ray (Python), or the ecosystem
built-in. Then scope — this step decides whether mutation testing
*survives* in the repo:

**Never start with the whole repo.** Each mutant is a test run. A 6-hour
first run gets the tool deleted. Scope the first pass to where a silent
bug costs most: money movement, auth, entitlements, data mutation, core
business logic. Explicitly exclude: generated code, config, type-only
files, UI glue better covered by `test-visual-regression`, and third-party
wrappers.

Record the suite's baseline runtime. Mutation runtime ≈ (mutants ×
affected-test runtime). Turn on per-test coverage analysis from day one
so only tests covering the mutated line rerun.

---

## Phase 1 — Configure for signal, not noise  [HIGH freedom]

- **Mutate patterns:** scoped critical paths only, via `mutate:` globs.
- **Incremental mode on** (Stryker `--incremental`): later runs only
  re-test mutants in changed code — this is what makes per-PR runs
  feasible.
- **Thresholds:** `high` / `low` for reporting, and `break` (CI-failing
  floor) at or slightly below the *measured* first score. Never invent an
  aspirational floor; measure, then ratchet. Same
  auto-tighten-with-reviewed-resets policy as `housekeep-gates`.
- **Timeouts:** mutants that loop are killed by timeout — keep the factor
  sane or runs balloon.
- **Reporters:** HTML for humans (each survivor in context), JSON for the
  ratchet.

---

## Phase 2 — First run and triage the survivors  [LOW freedom — classify every survivor]

Run, then classify every surviving mutant — this triage **is** the
deliverable:

1. **Missing assertion** — the test executes the line but asserts nothing
   about its effect. Fix: strengthen the test. Each of these is a hole a
   bug could walk through today.
2. **Untested branch** — no test reaches the mutated logic despite
   file-level coverage. Fix: add the case (hand to `plan-test-coverage`).
3. **Dead / vestigial code** — the mutant survives because the code has
   no observable effect. Fix: delete the code, not add a test
   (`workflow-housekeep`).
4. **Equivalent mutant** — the mutation does not change behavior (e.g.
   `<` vs `<=` on a boundary that cannot occur). No test can kill it;
   mark ignored with a comment. Expect a small percentage; a large one
   means the mutator is mutating the wrong things.

Prioritize by blast radius: a survivor in `entitlements.ts` outranks
fifty in a formatting helper.

---

## Phase 3 — Wire into CI (sustainably)  [HIGH freedom; floor from measured score = LOW]

- **Per-PR:** incremental mutation on changed files only, as a job wired
  into the aggregator gate (`housekeep-gates`).
- **Scheduled full run** (nightly / weekly) over the mutated scope;
  publishes the score, updates the ratchet floor upward per policy, and
  files the new-survivor list.
- **Score ratchet:** `break` rises as the score does (flake tolerance);
  lowering it is a separate reviewed PR, never bundled.
- **Agent-rule hook:** bulk-generated tests must pass a mutation run over
  the touched files before "done" counts. `enhance-agent-guardrails`
  installs the wording.

---

## Definition of Done

- [ ] Tool chosen for the stack; per-test coverage analysis enabled
- [ ] Scope limited to critical paths with exclusions recorded; whole-repo explicitly deferred
- [ ] Incremental mode on; timeouts and reporters configured
- [ ] First run complete; baseline mutation score recorded
- [ ] Every survivor triaged into missing-assertion / untested-branch / dead-code / equivalent, with fixes filed by class
- [ ] `break` threshold set from the measured score and wired to auto-tighten; resets require a separate reviewed PR
- [ ] Per-PR incremental job in the aggregator gate; scheduled full run publishing the score
- [ ] Agent-rule hook added: generated tests validated by mutation before done
- [ ] Total added CI time measured and reported

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Scope was narrow** — whole-repo first run is a failure mode, not a flex
2. **Every survivor classified** — no "look at the HTML later"
3. **Floor measured** — set the `break` floor from the first measured score, not an aspiration
4. **Right owner** — write the missing test → `test-unit`; delete dead code → `plan-dead-code` → `housekeep-dead-code`
5. **Strengthen tests only on approval**

## Output format

1. **Scope & config** — mutated paths | exclusions | tool + modes
2. **Score report** — baseline mutation score | per-module breakdown | coverage-vs-mutation gap (high coverage + low mutation score = assertion theater)
3. **Survivor triage** — mutant | file:line | class | fix filed
4. **CI wiring** — PR job, scheduled run, ratchet policy

Implement the harness and triage. Strengthen tests only on approval —
each fix is a reviewable change.
