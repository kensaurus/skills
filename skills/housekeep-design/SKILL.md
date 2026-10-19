---
name: housekeep-design
description: >
  Consolidate a drifted design system into one token and component source of
  truth. Use after an approved plan-uiux-unification, or when "clean up the
  design system now", "migrate to one button", or "resolve token conflicts".
license: MIT
---

# housekeep-design — Consolidate a Drifted Design System to One SSOT

**Degree of freedom: MIXED.** Canonical-form judgment `[HIGH freedom]`;
inventory searches, migration batches, and the zero-hit re-search
`[LOW freedom — run exactly]`.

Multiple sessions and multiple devs leave a design system full of competing truths: three
button variants that look the same, `--brand`, `--primary`, and `#3B82F6` all meaning the
same blue, `text-[13px]` next to `text-sm`, Lucide and Heroicons side by side. This skill
picks one canonical form for each conflict, migrates everything to it, and locks the door
behind you.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **housekeep-design** (this) | Consolidate a drifted design system into one token and component SSOT |
| `plan-uiux-unification` | Plan-only UI/UX audit that emits a unification burndown; no code |
| `design-system` | Build a new design system: tokens, variants, theming |

## How to reason

1. **Observe** — which tokens, components, or icon libraries compete?
2. **Interpret** — is this duplication or an intentional variant?
3. **Classify** — merge-to-canonical / keep-as-variant / ask (visible brand change)
4. **Severity** — a second Button that ships in prod outranks a unused hex alias

## Worked example

> **Observe:** `--brand`, `--primary`, and `#3B82F6` are the same blue; two Button
> files; Lucide + Heroicons.
> **Interpret:** color and Button are duplicates; icon mix is library drift.
> **Classify:** merge colors to `--color-primary`; keep `components/ui/button.tsx`;
> standardize Lucide.
> **Verify:** `rg` for `--brand` and `#3B82F6` → 0 hits; screenshots stay equivalent.

## Self-critique before reporting

- **Zero-hit** — every deprecated form was re-searched from scratch, not from memory
- **Equivalent** — screenshots or an explicit authorized upgrade; no silent restyle
- **One SSOT** — no leftover parallel token file or second Button
- **Right owner** — plan-only burndown still open → `plan-uiux-unification`, not this

> **One source of truth per decision.** When two patterns compete, take the **best of
> both** (more accessible, tokenized, more reused, better named) as canonical and migrate
> the rest to it — never leave both. Consolidation is mechanical and verifiable, not
> vibes: a fresh search for the deprecated form must return zero.

**This skill changes code.** It edits tokens, components, and usages. It is destructive to
*duplication*, never to *behavior*: the rendered result must stay visually equivalent
(verified) unless a conflict resolution intentionally upgrades it.

**Before any browser interaction, read `protocol-browser-anti-stall` and apply it.**

---

## Phase 0 — Detect and scope  [HIGH freedom]

### 0a. Consume an existing plan

If a `plan-uiux-unification` plan exists (in `.cursor/plans/` or provided), read it fully —
this skill is its executor. Otherwise run the detect loop below.

### 0b. Detect the design system

Reuse the `audit-uiux-design-system` Step 0 detection: CSS framework (Tailwind v3/v4, CSS
Modules, CSS-in-JS), component library (shadcn/Radix/MUI/Chakra/custom), icon library, and
the token source file(s). Record it.

---

## Phase 1 — Establish the SSOT structure (3-layer tokens)  [HIGH freedom]

Define (or normalize onto) a three-layer token taxonomy — the standard shape for
drift-proof systems:

| Layer | Role | Example |
|---|---|---|
| **Primitive / global** | Raw values, no meaning | `--blue-500: oklch(...)`, `--space-2: 0.5rem` |
| **Semantic** | Intent, references primitives | `--color-primary: var(--blue-500)`, `--radius-card` |
| **Component** | Component-scoped, references semantic | `--button-bg: var(--color-primary)` |

Components reference **semantic** tokens, never primitives or raw values. Record the
canonical token file as the SSOT and note where duplicate/parallel token sets live.

---

## Phase 2 — Detect every conflict (the drift inventory)  [LOW freedom — run the searches exactly]

Search the whole repo (use Shell/`rg`, not the plan's file list) and build a durable
checklist at `.cursor/housekeep-design-state.md`. Hunt each conflict class:

```bash
# Raw values that should be tokens
rg -n "#[0-9a-fA-F]{3,8}|rgb\(|hsl\([^v]" -g "*.{tsx,jsx,css,vue}"
rg -n "(text|p|m|gap|rounded|w|h)-\[" -g "*.{tsx,jsx}"      # arbitrary values
# Duplicate / near-duplicate tokens (same value, different name)
rg -n "^\s*--" -g "*.css"                                    # then group by value
# Competing component implementations
rg -n "function (Button|Card|Modal|Dialog|Input|Badge|Tabs)\b" -g "*.{tsx,jsx}" -l
rg -n "<button |<input |<select |<a " -g "*.{tsx,jsx}"       # raw elements outside ui/
# Mixed icon libraries
rg -n "from '(lucide-react|@heroicons|react-icons|@phosphor)" -g "*.{tsx,jsx}" -c
```

Conflict classes to record:
- **Token duplication** — same value under multiple names; near-duplicate values (e.g.
  `#3B82F6` and `#3C82F7`) that should collapse to one.
- **Naming drift** — visual names (`--blue`) vs semantic (`--primary`); inconsistent scales.
- **Component duplication** — multiple implementations of the same UI (2 Buttons, 3 Cards).
- **Raw / arbitrary usage** — hardcoded colors, `text-[13px]`, off-scale spacing/radius.
- **Mixed icon libraries** — pick one, migrate the rest.
- **Dark-mode gaps** — tokens without dark variants; hardcoded `bg-white`/`text-black`.

State totals out loud: "Found N conflicts across M files."

---

## Phase 3 — Reconcile: pick the canonical (best-of-both)  [HIGH freedom]

For each conflict, choose the canonical form using explicit criteria, and log the decision
in a **SSOT decision log** so future contributors know *why*:

Canonical wins if it is (in priority order): **more accessible** → **properly tokenized /
semantic** → **more widely used already** (least migration churn) → **better named** →
**more complete** (has all states/variants). When two are equal, keep the one closer to the
component library's idiom (e.g. shadcn `cva` variants).

```md
## SSOT decisions (in .cursor/housekeep-design-state.md)
- Blue: `--color-primary` ← merge `--brand`, `#3B82F6`, `--blue-accent`  (reason: semantic, most used)
- Button: keep `components/ui/button.tsx` (cva variants) ← remove `components/Button2.tsx`, inline buttons
- Icons: standardize on `lucide-react` ← migrate 12 `@heroicons` usages
- Radius: `--radius-card` (8px) ← collapse `rounded-[6px]`, `rounded-lg` in card contexts
```

STOP and ask the human only when a resolution changes visible behavior/brand in a way the
plan didn't authorize. Pure de-duplication proceeds.

---

## Phase 4 — Migrate all usages (mechanical, per-batch)  [LOW freedom — run exactly]

Work the checklist in batches of 5–10 files. Batches are independent: when the sweep is large, launch one subagent per batch in one message, each briefed once with its file list and the canonical forms and returning only the files it changed; keep the Phase 6 zero-hit re-search in the main thread. Prefer codemods for coverage you can verify:

- **Token usages:** replace deprecated names/raw values with the canonical token
  (`rg` → scripted replace, or `eslint --fix` with a custom rule).
- **Component usages:** replace duplicate/raw components with the canonical import;
  migrate props to the canonical API.
- **Icons:** swap import + component name to the chosen library.

Flip each item `[ ]`→`[x]` in the state file **immediately** per batch (survives context
truncation). For large mechanical sweeps, hand the coverage loop to **`burndown-full`**
with MATCH=deprecated form, DONE=canonical form — its from-scratch-search gate proves
completeness. Append any newly discovered occurrences and burn them down too.

---

## Phase 5 — Install guardrails so drift can't recur  [LOW freedom — run exactly]

Consolidation without guardrails regresses in a week. Add:

- **Lint-as-policy:** rules that block off-system styles — no raw hex/`rgb`/`hsl` in
  components, no arbitrary Tailwind values (`no-restricted-syntax` / a Tailwind lint
  plugin), single icon library. Wire into the repo's lint step.
- **Documented escape hatches:** one sanctioned way to add a new token (edit the SSOT
  file) and to opt out (a commented, reviewed exception) — so the rules don't just get
  disabled wholesale.
- Note (do not force) that a visual-regression check (Chromatic/Storybook) in CI is the
  durable long-term guard; recommend it if Storybook exists.

For a deeper guardrail install (hooks + CI gates), hand off to `enhance-agent-guardrails`.

---

## Phase 6 — Verify and report  [LOW freedom — do not skip]

- **Fresh search:** `rg` for every deprecated form → **zero** hits (except logged
  exceptions). Any hit → back to Phase 4.
- **Visual equivalence:** playwright-cli before/after screenshots of key pages in light + dark;
  confirm no unintended visual change. Save to `.playwright-mcp/`.
- **Build/typecheck/lint:** run the repo's commands; the new lint rules must pass.

```markdown
## Design Housekeep — report
**SSOT:** [token file] · 3-layer taxonomy established
**Conflicts resolved:** tokens [N→M] · components [N→M] · icons [→1 lib] · arbitrary values [N→0]
**Decision log:** [N] canonical choices recorded (.cursor/housekeep-design-state.md)
**Migration:** [M] files updated · deprecated-form search → 0 hits
**Guardrails:** lint-as-policy added (raw color/arbitrary/icon rules) · escape hatch documented
**Verification:** build ✓ · lint ✓ · visual before/after equivalent (screenshots [paths])
```

Leave `.cursor/housekeep-design-state.md` as an audit trail unless asked to delete it.

---

## Related

- `plan-uiux-unification` — produces the plan this skill executes (audit → approve → here)
- `audit-uiux-design-system` — the read-only audit that surfaces the drift
- `enhance-agent-guardrails` — deeper guardrail install (hooks, CI gates)
- `burndown-full` — mechanical repo-wide coverage for the usage migration
- `enhance-motion` — consolidate motion incoherence as part of the same pass
- `workflow-housekeep` — the file/dependency counterpart (dead files, README, deps)
- `design-system` — authoring conventions for the canonical components
