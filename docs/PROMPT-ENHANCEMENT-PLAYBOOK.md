# Prompt-Enhancement Playbook for kenji Skills

**Purpose.** Upgrade how a skill in this pack instructs the agent — not what
it does — against 2026 prompt-engineering practice. This is a prompt-craft
pass, distinct from `audit-skill-conflicts` (routing/coherence) and
`validate:skills` (spec compliance).

**Who runs it.** A dev, or an agent running `enhance-skill-prompts`, working
one skill at a time. Reference implementation:

- Annotated teaching copy:
  [`skills/enhance-skill-prompts/references/exemplar-audit-auth-flows.md`](../skills/enhance-skill-prompts/references/exemplar-audit-auth-flows.md)
- Live shipped skill (no teaching comments):
  [`skills/audit-auth-flows/SKILL.md`](../skills/audit-auth-flows/SKILL.md)

**Core principle (from Anthropic's skill-authoring guidance).** Match the
*degree of freedom* to the task's fragility. Interpretive tasks (audits,
planning) want high-freedom text that lets the agent reason; fragile tasks
(exact probe sequences, destructive ops, baseline capture) want low-freedom
exact steps. The biggest quality loss in a uniform-register pack is applying
one voice everywhere. Everything below serves this principle.

**House limits.** Description ≤320 chars (same folding as
`scripts/validate-skills.mjs`), body <500 lines, `name` matches the directory.
Never write `audit-responsive-layout` — the live name is `audit-responsive`.

---

## Part 1 — The technique set (what "good" looks like in 2026)

Eight techniques, each with the evidence, where it applies, and the trap to
avoid. Apply only where it fits — Phase 0 of each enhancement decides which.
T7 and T8 date from the Opus 5.5 pass (2026-09): effort is the only thinking
control, and instructions are followed literally.

### T1 — Declare & match degrees of freedom  *(Anthropic official — highest leverage)*

Every skill states its register under the H1, and mixed skills annotate
phases: `[HIGH freedom]` for judgment, `[LOW freedom — run exactly]` for
fragile steps.

- **Applies to:** all skills. Audits are mostly HIGH; housekeep / deploy /
  migration have LOW-freedom sequences inside them.
- **Trap:** over-constraining an interpretive audit (kills judgment) or
  under-constraining a fragile sequence (agent improvises a break). Both fail.

### T2 — Classification contract at judgment points  *(what counts, not how to think)*

A named-stage record every conclusion must carry — e.g.
**Observe → Interpret → Classify → Severity** for audits: the evidence, what
it means, which bucket, and a justified severity. Placed once near the top,
referenced by each phase. It defines what a finding must contain; the model's
own thinking (always on, depth set by `effort:`) does the reasoning.

- **Applies to:** any skill with real judgment (triage, severity, root-cause,
  winner-selection). That's every `audit-*` and most `plan-*`.
- **Plan-family contract:** **Propose → Risk → Keep-working → Phase**
  (what to change, what it risks, what must stay working, which burndown
  phase). Plan skills stay plan-only.
- **Trap:** any line that steers thinking itself — "think step by step",
  "reason carefully", "double-check" — bloats context and does nothing on
  Opus 5.5; effort is the only thinking control (T7).

### T3 — One worked example, labeled illustrative  *(few-shot + chain on a real case)*

A single concrete example that demonstrates the classification chain AND
the output shape on a realistic case, introduced as *one illustration*.
Usually the highest-value single edit to an audit skill.

- **Applies to:** every skill producing structured findings / output.
- **Trap:** an unlabeled single example becomes the gold output — the model
  copies its shape, severity, and phrasing onto cases that differ. Label it,
  and add a second only where it varies the judgment. More than two burns
  context for diminishing return.

### T4 — Evidence rubric before output  *(what a finding must prove)*

An explicit acceptance bar each finding clears before it is reported:
evidenced-not-assumed (quoted line or probe), reproducible, severity
justified, right owner, no false safety. The model re-checks its own work
unprompted, so this is not a "double-check" pass — each line names the
evidence it is checked against (a tool result, a rendered rect, a header, a
CI run).

- **Applies to:** all `audit-*` and `test-*`. Plan skills run T4 before
  presenting the burndown. This is also where principle-based
  ("constitutional-style") checking belongs — a concrete rubric, *not* a
  buzzword. Constitutional AI is a training method; as a prompt it degrades
  to exactly this rubric-driven check.
- **Trap:** a line that only says "verify your work" or "double-check". If a
  rubric item names no evidence, cut it.

### T5 — Terminology consistency  *(Anthropic official)*

One term per concept throughout a skill. Unify synonym drift
(gate/check/guard; finding/issue/problem; user/caller/client).

- **Applies to:** all skills. Cheap, mechanical, real.
- **Trap:** none — but do it last, after structural edits, so you normalize
  the final text.

### T6 — Conciseness pass  *(the context window is a shared public good)*

Cut restatements of what the model does by default and instructions written
for an older model; keep author-only context and the reason beside each
rule. The unit of cruft is a dated instruction, never a byte count. Net
tokens usually *drop* even after adding T2+T3, because most skills
over-explain.

- **Trap:** justifying a cut by length alone, or trading a fragile step's
  exactness for brevity. Low-freedom steps stay verbatim.

### T7 — Declare effort  *(Opus 5.5: effort is the only thinking control)*

Declare `effort:` in frontmatter by family: audit / plan / judge / security /
architecture / debug → `high` (`xhigh` only for the hardest planning, with a
measured reason); mechanical, read-only, formatting, handoff, inventory →
`low`; ordinary implementation → omit (Opus 5.5 defaults to `medium`, which
matches Opus 5 at high in about half the tokens). A read-only inventory
skill may add `context: fork` + `agent: Explore` to keep the main context
clean. Claude Code reads the key; Cursor ignores it; `validate-skills`
checks the value.

- **Applies to:** all skills, commands, and agents shipped to Claude Code.
- **Trap:** `high` everywhere by habit (double the tokens for work the
  default already does well), or steering depth with prose ("think harder",
  "don't overthink") — on Opus 5.5 that prose does nothing.

### T8 — Volume, shape, and communication  *(literal instruction following)*

Each rule once, at normal volume, with its reason — no MUST / NEVER /
CRITICAL markers, no "be thorough", no update suppressors ("no preamble",
"don't narrate", "hold findings"). State the success condition instead of a
prohibition list. Numbered steps only for fragile sequences (destructive
ops, auth, migrations, baseline capture); judgment phases get outcomes,
constraints, and how to verify. The always-on verification rule already
asks for an intent line, load-bearing notes and a standalone recap, so a
skill adds only what is specific to it: unattended skills say when the turn
may end.

- **Applies to:** all skills; the frontend exception is that design
  direction works best as *named* default patterns to avoid (cream
  background, italic accent word in headlines, "01 / 02 / 03" section
  labels, monospace labels, pill buttons, Inter / Roboto, purple gradients,
  three equal cards) — "avoid a generic AI look" swaps one default for
  another.
- **Trap:** restating the always-on contract in every skill (thirty copies
  to reconcile), or "fixing" emphasis by swapping in a stronger word.

### Explicitly NOT adopted (and why)

- **Tree-of-Thoughts / self-consistency** (sample many paths, vote): real
  gains but multiplies cost per run — wrong for expensive multi-turn coding
  loops. Reserve for the hardest planning skills only, if ever.
- **DSPy / automated prompt optimization**: optimizes programmatic prompt
  pipelines, not human-readable SKILL.md. Wrong artifact.
- **"Constitutional AI" as a named technique**: folded into T4 as a rubric.
  Naming it would overclaim.
- **Prefilling**: an API-call technique, not applicable to skill documents.

---

## Part 2 — The per-skill enhancement procedure

Run this on one skill at a time (this is what `enhance-skill-prompts`
automates).

**Step 0 — Classify.** Family & register (audit/plan = interpretive;
housekeep/deploy/migration = fragile). List the judgment points (→ T2/T3)
and the fragile steps (→ T1 LOW). Note whether it already has an example.
*Output the classification before editing.*

**Step 1 — Apply techniques where they fit.** In this order: T7 (declare
effort, delete prose thinking-steers) → T1 (declare freedom) → T2 (add the
classification contract, once) → T3 (insert one worked example, labeled
illustrative) → T4 (add the evidence rubric) → T5 (unify terms) → T8
(volume, shape, communication) → T6 (trim). Skip any technique that doesn't
fit and record why.

**Step 2 — Verify invariants (the edit is invalid if any breaks):**

- Same name, description triggers, scope → routing unchanged.
- Same behavior & stance → read-only stays read-only; apply-now stays
  apply-now; plan-only stays plan-only; phase order and DoD coverage
  unchanged in substance.
- House limits → description ≤320 chars, body <500 lines, name matches dir.
- Frontmatter untouched except a genuine within-budget description
  improvement or a T7 `effort:` declaration. `name` and description triggers
  never change.

**Step 3 — Report the diff, don't silently rewrite.** Classification, which
techniques applied/skipped, before/after of each section, invariant check.
Apply on approval.

---

## Part 3 — The reference implementation

Read the annotated exemplar before enhancing anything else. Key additions
to study:

- The **"Degree of freedom: MIXED — declared per phase"** header (T1) and
  the per-phase `[HIGH]` / `[LOW]` tags.
- The `effort: high` frontmatter key and its teaching comment (T7).
- The **"How to reason in this audit"** Observe → Interpret → Classify →
  Severity classification contract (T2), placed once: the shape every
  finding is recorded in, not a thinking instruction.
- The **worked example** block showing that chain on a real matcher-hole
  finding (T3).
- The **"Self-critique before reporting"** evidence rubric (T4).
- The `getSession` grep promoted to an explicit **[LOW freedom — run
  exactly]** step, plus labeled P5 probes (T1 on the fragile bits).

The live `audit-auth-flows` file keeps the pack's official facts (neighbor
table including `test-exploratory`, `getSession` / `getUser` / `getClaims`,
CVE-2025-29927 patched versions + GHSA, 10s refresh reuse interval, "do
not write exploit PoCs", present-then-stop). Strip `<!-- TECHNIQUE -->`
comments before shipping a live SKILL.md — they are teaching annotations.

---

## Part 4 — Rollout (listed skills only)

Parts 4 and 5 record the original T1–T6 rollout (2026-06). The Opus 5.5
pass (1.37.0, 2026-09) added T7 and T8 and rewrote T2, T4, and T6 across
the pack; new work follows Parts 1–3.

Enhance in waves. After each wave, run `npm run validate:skills` and
spot-check behavior on one skill per wave against a real repo.

**Wave 1 — audit family (biggest win from T2+T3+T4).**
`audit-auth-flows` (exemplar + live rewrite), `audit-llm-security`,
`audit-gate-logic`, `audit-codemod-safety`, `audit-analytics`,
`audit-ui-states`, `audit-monetization-iap`, `audit-env-parity`,
`audit-infra-cost`, `audit-responsive`, `audit-skill-conflicts`.

**Wave 2 — plan family (T2+T4; they already burndown-structure well).**
`plan-privacy-compliance`, `plan-backup-dr`, `plan-aso`. Stay plan-only.
T2 scaffold: Propose → Risk → Keep-working → Phase. T4 before presenting
the burndown.

**Wave 3 — test family (T1 LOW-freedom probes + T4 triage rubric).**
`test-exploratory` (already has triage — formalize it as T4; add T1 MIXED;
keep playwright-cli / three sessions), `test-mutation`, `test-load`,
`test-visual-regression`.

**Wave 4 — apply-now / enhance family (T1 is the priority — tag fragile
sequences LOW).**
`housekeep-gates`, `enhance-arch-boundaries`,
`enhance-email-deliverability`, `docs-adr`.

**Wave 5 — propagate to the factory.** Update `meta-skill-creator` so *new*
skills are born with T1–T6, and add a prompt-enhancement bullet to
`docs/CONTRIBUTING.md`. This is what makes the enhancement permanent
instead of a one-time cleanup.

**Wave 6 — validate the listed set.** Run `validate:skills` (and the repo
test script) on the enhanced pack. Confirm no description drifted over
budget, no body over 500 lines, `enhance-skill-prompts` description folds
to ≤320 with the same logic as `scripts/validate-skills.mjs`. Routing
coherence of the new skill is wired in CATALOG / TRIGGER-CHEATSHEET /
skill-workflows.

**Wave 7 — remaining first-party families** (complete-everything closure).
Every other first-party `audit-*`, `plan-*`, and `test-*` (not
`thirdparty-*`). Same invariants. `validate-skills.mjs` fails the pack if
any of these three families lacks Degree of freedom + Worked example +
Self-critique.

**Wave 8 — remaining first-party families after Wave 7.**
`housekeep-*` → `docs-*` → `deploy-*` → `debug-*` → `meta-*` →
`protocol-*` → `iterate-*` → `backend-*` → `design-*` → `enhance-*` →
`workflow-*`, plus connected `mobile-*` / `data-*` / `mushi-*`. Skip
`thirdparty-*`. Extend the validator require-list only after each family
is upgraded. Same invariants.

---

## Part 5 — Acceptance (this pass)

First-party `audit-*` / `plan-*` / `test-*` families, plus the factory
(`meta-skill-creator`, `enhance-skill-prompts`) and validate. Not
`thirdparty-*`, not Tree-of-Thoughts / DSPy / named Constitutional AI.

- [ ] Every first-party `audit-*` / `plan-*` / `test-*` skill declares its
      degree of freedom; fragile sub-steps tagged LOW
- [ ] Every judgment-bearing skill in those families has one reasoning
      scaffold (not generic, not repeated per phase)
- [ ] Every findings-producing skill in those families has exactly one
      few-shot+CoT worked example
- [ ] Every first-party `audit-*` / `test-*` skill has a specific
      self-critique rubric before its output; `plan-*` skills critique
      before the burndown
- [ ] Terminology unified within each enhanced skill (one term per concept)
- [ ] Conciseness pass done; net tokens not increased without cause
- [ ] All invariants held: names, descriptions, scope, behavior, stance
      unchanged; house limits pass
- [ ] `meta-skill-creator` and `docs/CONTRIBUTING.md` updated so new skills
      inherit T1–T6
- [ ] `enhance-skill-prompts` shipped; `npm run validate:skills` (via
      `npm test`) passes

---

## Appendix — Quick reference card

| # | Technique | Applies to | One-line rule | Trap |
|---|-----------|-----------|---------------|------|
| T1 | Degrees of freedom | all | Declare register; tag fragile steps LOW, interpretive HIGH | Over/under-constraining |
| T2 | Classification contract | judgment skills | One named-stage record of what a finding contains, referenced not repeated | Any line that steers thinking ("think step by step") |
| T3 | Worked example | output skills | Exactly one, labeled illustrative, chain + output shape | Unlabeled example becomes the gold output |
| T4 | Evidence rubric | audit/test (+ plan before burndown) | Each line names the evidence it is checked against | Generic "double-check" |
| T5 | Terminology consistency | all | One term per concept | (none; do it last) |
| T6 | Conciseness | all | Cut restatements of trained defaults; keep author-only context and reasons | Justifying a cut by length; trimming a fragile step's exactness |
| T7 | Effort declaration | all (Claude Code) | `effort: high` for judgment, `low` for mechanical, omit for implementation; delete prose thinking-steers | `high` by habit |
| T8 | Volume, shape, communication | all | Rule once, normal volume, with reason; outcomes not choreography; no update suppressors | Copying the always-on contract into every skill |
