---
name: workflow-spec-tdd
description: >
  A spec → plan → TDD loop before writing a line. Use when "spec first",
  "TDD", "do it properly", or LLM output keeps being wrong. Feature through PR
  → workflow-build-feature. One bug → workflow-fix-and-ship.
license: MIT
---

# Spec → Plan → TDD Workflow

**Degree of freedom: MIXED.** Approach choice and spec content `[HIGH freedom]`;
phase order, RED-before-GREEN, and Phase 5 checklist `[LOW freedom — run exactly]`.

> The antidote to vibe-coding. LLMs fail not because they can't write code, but because they skip the thinking: they guess requirements, write code before tests, and declare victory without verification. This skill forces the discipline. Stack-agnostic — works for web, React Native, and Capacitor.
>
> Adapted from [obra/superpowers](https://github.com/obra/superpowers) (MIT) and the Karpathy LLM-coding guardrails.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **workflow-spec-tdd** (this) | Spec, plan, TDD loop before writing a line |
| `workflow-build-feature` | Feature end to end through unit tests, Playwright, PR |
| `workflow-fix-and-ship` | One bug-fix lifecycle from triage to PR |

## How to reason

1. **Restate** — one-sentence ask + surface
2. **Contract** — behavior, edges, out-of-scope, verifiable Done when
3. **RED** — failing test at an agreed seam, watched fail
4. **Verify** — Phase 5 checklist; no unverified "should work"

## Worked example

> **Restate:** add coupon codes on checkout (web), not a new promotions engine.
> **Contract:** one optional code; invalid → inline error; valid → discounted total; out of scope: stacking, expiry admin UI.
> **RED:** test `applyCoupon('SAVE10')` on a $40 cart expects $36 — fails because helper is missing.
> **Verify:** GREEN is the helper only; Playwright later lives in `workflow-build-feature`, not here.

## Self-critique before reporting

- **RED was watched** — the test failed before implementation
- **Seam agreed** — tests hit the named public boundary, not internals
- **YAGNI** — no extra flags or layers beyond the spec
- **Right owner** — full feature through PR → `workflow-build-feature`; one production bug → `workflow-fix-and-ship`

## When this fires

Use for: a new feature, a multi-file refactor, a recurring bug, anything ambiguous, or any task where "looks done" has burned you before.

Skip for: one-line edits, pure formatting, a single obvious fix. Don't ceremony-tax trivial work.

## The loop (do not skip phases)  [LOW freedom — run exactly]

```
0. Read the room → understand repo + exact ask
1. Brainstorm → surface assumptions, explore alternatives
2. Spec → write the contract: behavior, inputs, outputs, edge cases
3. Plan → ordered, file-mapped steps with a verification per step
4. TDD → RED (failing test) → GREEN (minimal code) → REFACTOR, per step
5. Self-review → spec coverage + quality gate before "done"
```

### Phase 0 — Read the room (always first)  [HIGH freedom]
- Read the dependency manifest for exact versions; read the files you'll touch in full.
- Restate the ask in one sentence and name the surface (web / RN / Capacitor). If the surface has a domain skill (`mobile-capacitor-platform`, `mobile-rn-performance`, `enhance-*`), note it.
- If the request is genuinely ambiguous, ask **exactly one** clarifying question. Otherwise state your reading and proceed.

### Phase 1 — Brainstorm (before any code)  [HIGH freedom]
- List the **hidden assumptions** the naive implementation would make. Each is a future bug.
- Consider more than one approach before committing; pick one and say why. Prefer the existing repo pattern over a new abstraction.
- Apply **YAGNI**: build only what the spec needs. No speculative config, flags, or layers.

### Phase 2 — Spec (the contract)  [HIGH freedom]
Write a short spec before coding. Template:

```markdown
## Spec: [feature]
- Behavior: [what it does, observable]
- Inputs: [shape, types, sources]
- Outputs / side effects: [returns, DB writes, navigation, events]
- Edge cases: [empty, error, offline, large, concurrent, unauthorized]
- Out of scope: [what this explicitly does NOT do]
- Done when: [the concrete, checkable success criteria]
```

"Done when" must be **verifiable**, not "it works". Weak criteria produce weak code.

### Phase 3 — Plan (file-mapped, ordered)  [HIGH freedom]
```markdown
## Plan
1. [file] — [change] — verify: [test/command]
2. [file] — [change] — verify: [test/command]
...
- New deps (if any): [pkg@version — why]
- Migrations / schema / RLS / edge fns touched: [list — deploy in same turn per full-stack-ship-discipline]
- Risk: [low/med/high per step]
```
When steps depend on each other, order them so each leaves the tree green and note the intermediate state and side effects a later step relies on.

### Phase 4 — TDD (RED → GREEN → REFACTOR)  [LOW freedom — run exactly]
For each plan step:
1. **RED** — write the failing test first. Run it. **Watch it fail** (proves the test tests something).
2. **GREEN** — write the *minimal* code to pass. No extra. Run it. Watch it pass.
3. **REFACTOR** — clean up with tests green. Commit the step.

Rules:
- The first implementation task is always "write the failing test."
- Never write code with no test path unless the repo has zero test setup — then add the smallest harness first, or explicitly flag that you're skipping TDD and why.
- One concern per test. Test behavior, not implementation details.
- **Test only at pre-agreed seams.** A seam is the public boundary you test at — the interface where behavior is observable without reaching inside. Name the seams in the plan (Phase 3) and confirm them with the user; prefer existing seams, at the highest level possible. Agreed seams put test effort on critical paths instead of every internal.
- **Vertical slices, not horizontal.** One test → one implementation → repeat, each test a tracer bullet informed by the last cycle. Writing all tests up front verifies imagined behavior and locks in test structure before the implementation teaches you anything.
- **No tautological tests.** Expected values come from an independent source of truth (a known-good literal, a worked example, the spec) — never recomputed the same way the code computes them, or the test passes by construction.
- **The refactor-breaks-test tell.** If a test breaks when you refactor but behavior hasn't changed, it was implementation-coupled — fix the test's seam, don't patch the assertion.
- Surface-specific runners: web → vitest/jest/playwright; RN → jest + RNTL, `mobile-emulator-test` for device; Capacitor → vitest + `mobile-capacitor-platform` E2E.
- A pre-existing bug you hit while implementing goes into the spec's "Out of scope" list as a follow-up, not into this loop. Scratch scripts used to explore stay out of the repo; edit files surgically rather than rewriting them.

### Phase 5 — Self-review (gate before "done")  [LOW freedom — do not skip]
Run this checklist. If any box fails, you are not done:

```
- [ ] Every "Done when" criterion is met and verified (not assumed)
- [ ] Every spec edge case is handled or explicitly deferred in the spec
- [ ] Tests fail without the change and pass with it (RED was real)
- [ ] No placeholder / TODO / dead code / stubbed return left behind
- [ ] No unrequested scope crept in (YAGNI held)
- [ ] Backend deps deployed + verified on the remote, not just on disk
- [ ] Error path actually exercises the new code (logs/network confirm, not a stale 404)
- [ ] Narrowest verification command for the surface was run and is green
```

## Anti-patterns this kills
- "Here's the implementation" with no test and no spec → **vibe code**.
- Plausible code that compiles but mishandles empty/error/offline → **missing edge cases**.
- "It should work now" with nothing run → **unverified claim**.
- Drive-by refactors of unrelated code → **scope creep**.
- A migration file written but never deployed → see `full-stack-ship-discipline`.

## References

- [TDD patterns & test examples by type](references/tdd-patterns.md)
- [Spec template & writing principles](references/spec-template.md)

## Composes with
- `workflow-coding-discipline` — behavioral guardrails (this skill operationalizes them).
- `full-stack-ship-discipline` — Phase 5 backend-deploy gate.
- `mobile-capacitor-platform` / `mobile-rn-performance` / `enhance-*` — surface domain knowledge for the plan.
- `test-playwright` / `mobile-emulator-test` / `test-unit` — the verification runners for Phase 4–5.
