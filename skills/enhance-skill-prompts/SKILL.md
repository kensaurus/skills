---
name: enhance-skill-prompts
description: >
  Upgrade how an existing SKILL.md instructs, not what it does: freedom, a
  classification contract, one worked example, an evidence rubric, effort. Use
  when "enhance this skill's prompts", "upgrade skill authoring", or "apply
  the prompt playbook".
license: MIT
effort: high
---

# enhance-skill-prompts — Upgrade HOW a skill instructs, never WHAT it does

**Degree of freedom: LOW-to-MEDIUM.** This is a fragile transformation. A
well-meant rewrite can change behavior. Follow the phases in order. Preserve
intent, scope, and family semantics exactly. If a change would alter
behavior, scope, or read-only / plan-only / apply-now stance, stop and flag
it instead.

Grounded in [docs/PROMPT-ENHANCEMENT-PLAYBOOK.md](../../docs/PROMPT-ENHANCEMENT-PLAYBOOK.md)
and the annotated exemplar
[references/exemplar-audit-auth-flows.md](references/exemplar-audit-auth-flows.md).
Live reference after the exemplar was applied:
`skills/audit-auth-flows/SKILL.md`. New skill from scratch →
`meta-skill-creator`.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **enhance-skill-prompts** (this) | Upgrade how an existing SKILL.md instructs, never what it does |
| `meta-skill-creator` | Create or update a pack SKILL.md: frontmatter, house limits, T1–T8 |

## Phase 0 — Classify the skill  [HIGH freedom]

Read the target SKILL.md and determine:

- **Family & register:** audit/plan (interpretive → mostly HIGH) vs
  housekeep/deploy/migration (fragile sequences → LOW where a step must be
  exact).
- **Judgment points:** triage, severity, root cause, winner-selection → T2/T3.
- **Fragile steps:** probes, baseline capture, destructive ops → T1 LOW.
- **Existing example:** is the `## Worked example` a real few-shot (chain plus output shape on a concrete case) or a placeholder?
- **Effort tier (T7):** which family the skill belongs to, and therefore which `effort:` it declares.

State the classification before editing. It decides which techniques apply.

## Phase 1 — Apply T1–T8 (only where they fit)  [HIGH freedom]

Apply in this order. Skip any technique that does not fit and record why.

**T1 — Declare degrees of freedom.** Short register line under the H1.
Where mixed, tag fragile phases `[LOW freedom — run exactly]` and
interpretive ones `[HIGH freedom]`. Do not over-constrain interpretive
audits or under-constrain fragile sequences.

**T2 — One named-stage judgment frame.** The stages a conclusion must
pass through (audits: Observe → Interpret → Classify → Severity; plans:
Propose → Risk → Keep-working → Phase). Place it ONCE near the top and
reference it. It defines what a finding must contain, not how to think:
reasoning depth comes from `effort:` (T7), and generic "think step by
step" or "double-check" prose is dead weight on Opus 5.5.

**T3 — Exactly one worked example.** The chain AND the output shape on a
realistic case, labeled illustrative. Put it right after the T2 frame.

**T4 — Self-critique rubric before output.** Explicit, answerable checks
(evidenced-not-assumed, reproducible, severity-justified, right-owner,
no-false-safety). Plan skills: run this before presenting the burndown.
Opus 5.5 self-verifies unprompted, so each rubric line must name the
evidence it is checked against (a tool result, a rendered rect, a header,
a CI run); a line that is a generic re-check ("verify your work",
"double-check") is cut. Principle-based ("constitutional-style") checking
belongs here as a rubric, not a label.

**T5 — Terminology consistency.** One term per concept. Unify
gate/check/guard, finding/issue/problem, user/caller/client to the skill's
dominant term.

**T6 — Conciseness.** Cut restated context the agent already has. Never
trim a fragile step's exactness. Net tokens should usually drop even after
T2+T3.

**T7 — Effort routing.** Declare `effort:` in frontmatter by family:
audit / plan / judge / security / architecture → `high` (`xhigh` only for
the hardest planning, with a measured reason); mechanical, read-only,
formatting, handoff, inventory → `low`; ordinary implementation → omit
(Opus 5.5 defaults to `medium`, which matches Opus 5 at high). A read-only
inventory skill may add `context: fork` + `agent: Explore` to keep the main
context clean. Cursor ignores the key; `validate:skills` checks its value.
Effort is the only thinking control on Opus 5.5 — never steer depth with
prose ("think harder", "don't overthink", "double-check").

**T8 — Volume, shape, and communication.** Each rule once, at normal
volume, with its reason — drop MUST / NEVER / CRITICAL markers, "be
thorough", and update suppressors ("no preamble", "don't narrate"): Opus
5.5 follows instructions literally, so emphasis over-triggers and
suppressors leave the user blind between tool calls. State the success
condition instead of a prohibition list. Exception: frontend design
direction works best as *named* default patterns to avoid (cream
background, italic accent word in headlines, "01 / 02 / 03" section
labels, monospace labels, pill buttons, Inter / Roboto, purple gradients,
three equal cards) — "avoid a generic AI look" swaps one default for
another. Numbered steps only for fragile sequences (destructive ops, auth,
migrations, baseline capture); judgment phases get outcomes, constraints,
and how to verify. The always-on verification rule already asks for an
intent line, load-bearing notes and a standalone recap; do not repeat it
per skill and never suppress it ("no preamble", "hold findings"). Skills
that run unattended add one line saying when the turn may end.

## How to reason

1. **Observe** — existing H1 register, phases, examples, body length
2. **Interpret** — which of T1–T8 are missing vs already present as headings or keys
3. **Classify** — apply / skip-with-reason / stop (would change behavior)
4. **Severity** — a trigger or stance change is an invalid edit

## Worked example

> **Observe:** `meta-skill-creator` has T1 and a technique table; no `## Worked example`.
> **Interpret:** the table mention is not T3; the agent still has no few-shot.
> **Classify:** add one `## Worked example` + `## Self-critique` after the table; do not rewrite Anatomy or frontmatter.
> **Invariant:** description triggers unchanged; still "create a pack SKILL.md".

## Self-critique before reporting

- **Headings exist** — T3 is `## Worked example`, T4 is `## Self-critique…`, not a table cell
- **Behavior same** — no phase-order, stance, or trigger change
- **One example** — not a second tutorial
- **Right owner** — new skill from scratch → `meta-skill-creator`

## Phase 2 — Preserve invariants  [LOW freedom — run exactly]

The edit is invalid if any of these break:

- Same **name, description triggers, and scope** — routing must not change.
- Same **behavior and stance** — read-only stays read-only; apply-now stays
  apply-now; plan-only stays plan-only; phase order and Definition-of-Done
  coverage unchanged in substance.
- **House limits** — description ≤320 chars (same folding as
  `scripts/validate-skills.mjs`), body <500 lines, name matches dir.
- **Frontmatter:** `name` and `description` untouched unless a within-budget
  description change is explicitly requested. Adding or adjusting `effort:`
  (T7) is allowed and is not a routing change.
- Cross-references use live skill names; the responsive skill is `audit-responsive`.
- Strip `<!-- TECHNIQUE -->` comments from live SKILL.md (they belong only
  in the exemplar).

If any invariant would break, revert that change and note it.

## Phase 3 — Report the diff  [LOW freedom — do not skip]

Do not silently rewrite. Present, per skill:

1. **Classification** — family | register | judgment points | fragile steps | has-example?
2. **Technique table** — technique | applied? | where | why-skipped-if-not
3. **Section diffs** — before/after for each change
4. **Invariant check** — each invariant | holds?

Apply on approval. For a batch, finish one skill as reference, get
sign-off, then proceed.

## Definition of Done

- [ ] Skill classified before editing
- [ ] T1–T8 applied or skipped with a reason
- [ ] Invariants verified; frontmatter triggers unchanged
- [ ] Diff reported; applied only on approval

## Related

- `meta-skill-creator` — new SKILL.md from scratch
- `audit-skill-conflicts` — routing / coherence after a batch
- `validate:skills` — per-file spec after edits
