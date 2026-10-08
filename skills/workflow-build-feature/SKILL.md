---
name: workflow-build-feature
description: >
  Build a feature end to end: spec and TDD, implement, unit tests, Playwright
  check, PR. Use when "build a feature" or "implement this end-to-end".
  Spec/TDD loop only → workflow-spec-tdd. One bug → workflow-fix-and-ship.
license: MIT
metadata:
  chain: "workflow-spec-tdd test-unit test-playwright workflow-pr"
---

# workflow-build-feature — End-to-End Feature Build

**Degree of freedom: MIXED.** How to implement Phase 2 `[HIGH freedom]`;
phase order and "no implementation before RED" `[LOW freedom — run exactly]`.

One command that runs the full feature loop. Don't skip phases — each gate
catches a class of defects the next phase can't.

## How to reason

1. **Contract** — what observable behavior is in / out of scope?
2. **Sequence** — which phase is next, and what would skipping it hide?
3. **Prove** — RED was real; GREEN and smoke cover the contract
4. **Handoff** — PR evidence is complete; no silent "looks done"

## Worked example

> **Contract:** "add a forgot-password link" — email reset, not a magic-link login rewrite.
> **Sequence:** spec + RED on the request-reset handler before any UI.
> **Prove:** RED failed on missing route; GREEN + Playwright submits the form and sees the check-email state.
> **Handoff:** PR links the spec, the RED/GREEN commands, and the smoke screenshot.

## Self-critique before reporting

- **Phases intact** — none of spec / RED / unit / smoke / PR were skipped
- **RED was real** — the failing test existed before implementation
- **Full-stack** — if data was touched, the migration was applied and verified
- **Right owner** — one named bug → `workflow-fix-and-ship`; spec loop only → `workflow-spec-tdd`

---

## Phase sequence  [LOW freedom — run exactly]

```
1. SPEC        → workflow-spec-tdd (contract, plan, RED test)
2. BUILD       → implement against the spec (GREEN)
3. UNIT TEST   → test-unit (edge cases, mocks, coverage)
4. SMOKE       → test-playwright (drive the live app as a real user, fix pain points)
5. PR          → workflow-pr (create PR with test evidence)
```
The turn ends at the Done criteria or at a real gate — a decision only the user can make, a missing credential, a failing service. A phase summary is a progress note, not a stopping point.

---

## Phase 1: Spec (read workflow-spec-tdd)  [LOW freedom — run exactly]

> Read the `workflow-spec-tdd` skill and follow it.

Key outputs:
- Written spec (what it does, what it doesn't do, acceptance criteria)
- File-mapped implementation plan (which files to create/edit)
- A RED failing test that encodes the acceptance criteria

When the ask is loosely specified, read the relevant routes, schema, tests, and sibling features broadly before writing the spec, so it is grounded in what the repo does rather than the first plausible reading.

**Do not write implementation code until the spec and RED test exist.**

---

## Phase 2: Build  [HIGH freedom]

Implement against the spec. Rules:
- One logical change per commit
- Match the file patterns already in the repo — no new abstractions unless the spec calls for them
- Full-stack: if the feature reads/writes data, verify the DB migration is applied before the frontend ships (see full-stack-ship-discipline rule)
- Scope stays where the spec put it. A pre-existing bug you find on the way is a follow-up in the PR description, not part of this change. Scratch scripts and one-off checks stay out of the repo. Edit files surgically — change the lines the feature needs, do not rewrite the file around them.

---

## Phase 3: Unit tests (read test-unit)  [LOW freedom — hand off]

> Read the `test-unit` skill and follow it.

Focus on:
- The new code's happy path, error paths, and edge cases
- Any shared utility functions introduced

---

## Phase 4: Smoke test (read test-playwright)  [LOW freedom — hand off]

> Read the `test-playwright` skill and follow it.

Drive the live app through the new feature as a real user. Fix pain points inline (full-stack: UI + API + DB). Capture screenshots as evidence.

Before any browser action, apply `protocol-browser-anti-stall` rules.

---

## Phase 5: PR (read workflow-pr)  [LOW freedom — hand off]

> Read the `workflow-pr` skill and follow it.

Include in the PR description:
- Link to the spec / acceptance criteria
- Screenshots or screen recording from Phase 4
- Migration notes if schema changed

---

## Done criteria  [LOW freedom — do not skip]

- [ ] Spec written and agreed
- [ ] RED test exists and was failing before implementation
- [ ] Implementation makes test GREEN
- [ ] Unit tests cover happy path + at least one error path
- [ ] Smoke test drove the live app and found no blockers
- [ ] DB migration applied and verified (if applicable)
- [ ] PR open with description and evidence
