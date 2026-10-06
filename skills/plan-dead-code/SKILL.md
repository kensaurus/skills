---
name: plan-dead-code
description: >
  Plan-only dead-code audit: Knip baseline for unused files, exports, and
  deps, plus duplication, debug residue, suppressions, orphan assets, env
  drift. Deletes nothing. Use when "find dead code", "is this code used", or
  "unused exports".
license: MIT
effort: high
---

# plan-dead-code — Prove it is dead before anyone deletes it

**Degree of freedom: MIXED.** Tool config authoring and the baseline
command set `[LOW freedom — run exactly]`; judging *reachable vs
proven-dead*, and what must keep working, `[HIGH freedom]`.

**Plan-only. This pass deletes nothing** — not a file, not an export, not
a dependency, not a row. It produces `plan-dead-code.md`: a reviewed
keep/kill list plus a ratchet baseline.

The failure mode this skill exists to prevent: an agent runs `knip` on a
vibe-coded repo, gets 300 findings, and starts deleting. **On a first run,
most findings are misconfiguration, not dead code.** Knip's own docs are
explicit — running `--fix` "before your configuration is fully settled is
dangerous", and `ignore` patterns are "a last resort" because "hiding a
result is not the same as resolving it."

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **plan-dead-code** (this) | *Nothing reaches this* — unreachable files/exports/deps/assets/schema (plan only) |
| `housekeep-dead-code` | Execute this plan — delete by category, install the ratchet |
| `plan-stub-checker` | *This reaches nothing* — dead buttons, unwired handlers |
| `plan-antislop` | *Looks machine-authored* — a taste judgment, not reachability |
| `plan-dependency-provenance` | Package **existence**, integrity, licensing, slopsquatting |
| `audit-code-quality` | Repo-wide smells and consistency drift |
| `workflow-refactor` | Restructuring live code that stays |
| `enhance-arch-boundaries` | Circular deps and layer direction (dependency-cruiser) |
| `audit-db-schema` | Schema design, constraints, naming |
| `housekeep-backlog` | The TODO/skipped-test register |
| `workflow-housekeep` | README, build artifacts, dependency bumps |

Boundary with `plan-dependency-provenance`: it owns *manifest facts* (does
this package exist, is it licensed). This owns the *graph fact* (nothing
imports it). A package that is real, licensed, and unimported is this
skill's finding.

## How to reason (every candidate)

1. **Observe** — which tool reported it, at what path, in which mode.
   Unsure? `npx knip --trace-export <name>` / `--trace-file <path>` shows
   exactly where Knip looked
2. **Interpret** — is it unreferenced, or referenced in a way the tool
   cannot see? (dynamic import, string route, generated types, Deno)
3. **Classify** — `kill` / `keep-config` / `keep-tagged` / `chain` /
   `needs-owner`, per
   [`references/preservation-contract.md`](references/preservation-contract.md)
4. **Severity × effort** — an unused dependency with an open advisory
   outranks an unused type; a barrel explaining forty findings is one
   M-effort fix, not forty S-effort ones

Skipping **Interpret** is what turns a cleanup into an outage. A tool
finding is evidence, not a verdict.

**Report chain heads, not chain members.** One dead file explains its own
exports *and* the packages only it imported. Those are children of that
row, not rows of their own — otherwise a three-item plan reads as
twenty-seven and the phasing is wrong.

## Worked example

> **Observe:** first `npx knip` on a Vite + React + Supabase app: 312
> findings — 47 unused files, 180 unused exports, 61 unused types, 24 deps.
> **Interpret:** `src/routes/**` is loaded via `import.meta.glob`, so no
> file imports it; `src/types/supabase.ts` is generated; every `ui/*.tsx`
> re-exports through a barrel; `supabase/functions/**` is Deno, never in
> the Vite graph.
> **Classify:** config-gap, not dead code. Add `entry` for the route glob,
> `ignoreExportsUsedInFile` for interfaces/types, a separate workspace for
> `supabase/functions`, and tag the design-system barrel `@public`.
> **Re-run:** 41 findings — 9 unused files, 22 exports, 6 types, 4 deps.
> **Baseline:** 41 default / 12 `--production`. That 12 is the highest-
> confidence set: dead in shipped code.
> **Plan:** kill the 9 files (7 are unused shadcn components — re-addable
> with `npx shadcn add`), 4 deps; `@public` the barrel; 2 exports
> `needs-owner` (look like a half-built public API).

---

## Phase 0 — Detect the stack before running anything  [LOW freedom — run exactly]

Config quality decides whether every later number means anything. Read,
don't guess:

- **Bundler / framework** — `vite.config.*`, `next.config.*`, `astro.config.*`,
  `remix.config.*`, `expo`/`metro.config.*`, `nest-cli.json`
- **Workspaces** — `pnpm-workspace.yaml`, `package.json#workspaces`, `nx.json`,
  `turbo.json`. A monorepo configured as one root project reports the whole
  repo as dead.
- **Non-Node graphs** — `supabase/functions/**` (Deno), Cloudflare Workers,
  `*.sql`, native shells. These are never in the app's module graph and must
  be separate workspaces or they report 100% unused.
- **Generated code** — `types/supabase.ts`, `*.gen.ts`, GraphQL codegen,
  Prisma client, route trees
- **Dynamic reference** — `rg "import\.meta\.glob|require\.context|await import\(|lazy\(" `
- **Existing config** — `knip.json`, `knip.jsonc`, `package.json#knip`,
  `.jscpd.json`, `tsconfig` `noUnusedLocals`/`noUnusedParameters`
- **Test/coverage state** — is behavior locked by tests yet? Record it.
  Deleting before coverage exists means deletion has no safety net.

Record: package manager, framework, workspace layout, non-Node arms,
generated paths, dynamic-import mechanisms, whether tests pass today.

> **Sequencing note.** In the plan loop, `plan-test-coverage` (step 3)
> locks behavior in tests. Running this audit is safe any time; **executing
> it before behavior is locked is the risky order.** Say so in the plan.

---

## Phase 1 — Author the config, then trust the output  [LOW freedom — config before findings]

Install as a devDependency (never a global): `npm i -D knip`. Requires the
project's own TypeScript.

**1a. First run, read hints only.**

```
npx knip
```

Configuration hints print at the top. **Resolve those before reading a
single finding.** Hints are Knip telling you your config is wrong.

**1b. Fix hints in `knip.json` — not with `ignore`.**

Symptom → correct fix → not-this table (entry patterns, `ignoreExportsUsedInFile`, `paths`, `ignoreDependencies`, `--production`, the one legitimate `ignore`): [references/knip-config.md](references/knip-config.md) §Hint symptom → correct fix.

Knip already respects `.gitignore` — do not re-list `node_modules`,
`dist`, `build`. Do not duplicate entry points that auto-detected plugins
already add.

**1c. Repeat 1a–1b until hints are clean.** This loop is the skill. Config
recipes for Vite+React+Supabase, Next.js App Router, and monorepos are in
[`references/knip-config.md`](references/knip-config.md).

**Gate before Phase 2.** Hints clean, *and* unresolved imports plus unlisted
dependencies both explained. If either is still in the dozens, the config is
not done — the resolver is failing, not the code. Triaging findings from a
misconfigured run is how false positives become deletions.

---

## Phase 2 — Baseline the module graph  [LOW freedom — run exactly]

Run **both** modes; Knip's CI guide suggests considering a default run
alongside a production run.

```
npx knip --production   # shipped code only: no tests, config, stories, devDeps
npx knip                # everything
```

Read findings in Knip's documented order, because it cascades — "getting
the list of unused files right trickles down into the other issue types":

1. **Unused files** — one dead file manufactures phantom unused exports
   *and* phantom unused deps downstream
2. **Unresolved imports** — usually a `paths` gap, not dead code
3. **Unused exports / types**
4. **Unused dependencies**

Scope with `--files`, `--exports`, `--dependencies` to read one class at a
time, and `--max-show-issues <n>` to keep a first pass readable.
`--production` excludes test files, config files, stories and
devDependencies; `--strict` additionally isolates workspaces to direct
dependencies. `--reporter json` is what the baseline numbers come from —
never a hand count.

Delegate a baseline or residue pass to a subagent only when it is sizeable, independent of the others, and its raw output (Knip JSON, grep dumps) has no place in the plan; brief it with the exact commands and the columns to return. It deletes nothing, like this pass. A handful of greps stays in the main context. Long sweeps are expected — context compaction exists, so finish the inventory rather than wrapping up early.

**Build the keep-working list.** For every finding, ask what would break.
Named suspects, each needing a positive reason to keep:

- Glob/dynamic-imported routes and pages
- String-referenced handlers, feature-flag targets, job names
- Generated types (regenerate, don't hand-edit)
- Deliberate public API → tag `@public` (Knip then stops reporting it)
- Test-only exports that production mode flags → tag `@internal`
- Duplicate default+named export pairs → tag `@alias`

Tags beat config here: they live next to the code and Knip reports a **tag
hint** when a tag becomes unnecessary, so the exemption cannot rot.

---

## Phase 3 — The seven surfaces Knip cannot see  [MIXED — greps run exactly]

Knip owns the module graph. These are the classes a vibe-coded repo
accumulates that it will never report. Count each; fix nothing. Exact
commands, false positives, and the fix column are in
[`references/residue-greps.md`](references/residue-greps.md).

> **Run the bundle-leak check even if you skip the rest of this phase:**
> `npm run build && rg -l "service_role|SUPABASE_SERVICE_ROLE" dist`. A hit
> is a live credential in shipped output — stop the pass and go to
> `plan-secrets-audit`.

- **3a Unused variables and imports inside files** — Knip does not do this; baseline with `tsc --noEmit` under `noUnusedLocals` + `noUnusedParameters`, or the linter's unused rule, and record whether the flags are even on
- **3b Copy-paste duplication** — `npx jscpd src --min-tokens 50 --reporters json`; record duplication % and top clone pairs; a refactor finding, not a deletion finding → `workflow-refactor`
- **3c Debug residue** — `console.*` / `debugger`, `.only` / `.skip` / `.todo` / `x`-prefixed tests (flag `.only` **high**), commented-out blocks, `utils`/`helpers` dumping grounds
- **3d Suppression debt** — `@ts-ignore` / `@ts-expect-error` / `eslint-disable` / `biome-ignore` and `any`, counted with `rg -o … | wc -l`; a stale `@ts-expect-error` is itself dead code
- **3e Orphan assets** — every filename under `public/`, `assets/`, `static/` cross-referenced against source, CSS, and HTML; a folder referenced only by template string is `needs-owner`, not dead
- **3f Env var drift, both directions** — referenced-but-undeclared vs declared-but-unreferenced, diffed against `.env.example`; names only, **never print values**
- **3g Dead database schema** [read-only this pass] — `supabase db lint`, `supabase inspect db unused-indexes`, `supabase inspect db seq-scans`, cross-referenced with `.from(` / `.rpc(` / `functions.invoke(` usage; low scans on a young or read-light database are not evidence; **no `DROP` is authored in this pass**
Full commands, caveats, and routing for 3a–3g: [references/residue-greps.md](references/residue-greps.md) §The seven surfaces.

---

## Phase 4 — Write `plan-dead-code.md`  [LOW freedom on format]

**4a. Baseline table** — the ratchet's starting line. Numbers only ever go down.
Metric | command | today rows (Knip both modes, unused locals, duplication %, debug residue, suppressions, orphan assets, env drift, schema): [references/output-templates.md](references/output-templates.md) §Baseline table (4a).

**4b. Keep/kill list** — one row per **chain head**:
`path:line | class | evidence | verdict | sev | effort | children | what must keep working`

Verdicts: `kill` · `keep-tagged` (`@public`/`@internal`/`@alias`) ·
`keep-config` (config gap, fix the config) · `chain` (child of another row) ·
`needs-owner` (a human must decide). Never guess `kill` to shrink the list,
and never leave a keep row without naming its remedy — a keep with no remedy
is an `ignore` in disguise, and the next session will delete it.

A filled example table, with the severity and effort rubric, is in
[`references/output-templates.md`](references/output-templates.md).

**4c. Phased burndown** — ordered so each phase's verification is
meaningful, cheapest-to-review first, and the pre-approved file list going
first so later phases do not churn files that are about to be deleted.

**4d. Ratchet proposal** — the `knip` script, the CI job with
`--max-issues` set to today's count, and which aggregator gate it joins.

**4e. Cause-not-count callouts.** If 40 exports come from one barrel
`index.ts`, the finding is *the barrel*, not 40 exports. Name the root
cause so execution fixes one thing instead of forty.

---

## Self-critique before delivering  [LOW freedom — do not skip]

1. **Config settled** — hints resolved; no `ignore` used where `entry`,
   `paths`, `--production`, or a tag was the real fix
2. **Both modes run** — `--production` and default, reported separately
3. **Interpreted, not transcribed** — every `kill` names its evidence;
   dynamic/generated/Deno paths were actively checked
4. **Nothing deleted** — no file, export, dep, asset, or row changed
5. **Non-graph surfaces counted** — all seven of Phase 3, or explicitly
   `not run` with a reason
6. **No secret values** — env findings are names only
7. **Baseline is real** — every number came from an executed command, not
   an estimate
8. **Right owner** — duplication → `workflow-refactor`; unwired UI →
   `plan-stub-checker`; slop taste → `plan-antislop`; package existence →
   `plan-dependency-provenance`; circular deps → `enhance-arch-boundaries`;
   destructive SQL → `plan-data-integrity`
9. **Safety net stated** — whether tests currently lock the behavior being
   deleted

## Definition of Done

- [ ] Stack, workspaces, non-Node arms, generated and dynamic paths recorded
- [ ] `knip.json` authored; configuration hints clean
- [ ] Both `--production` and default baselines captured
- [ ] Findings read files → unresolved → exports → deps
- [ ] Keep-working list built; tags proposed instead of config where they fit
- [ ] Seven non-graph surfaces counted or marked `not run` with a reason
- [ ] `plan-dead-code.md` written: baseline, keep/kill list, phases, ratchet
- [ ] Root causes named (barrels, dumping grounds) — not just item counts
- [ ] Zero deletions this pass; execution handed to `housekeep-dead-code`

## Output format

Full template: [`references/output-templates.md`](references/output-templates.md).

1. **Config diff** — what `knip.json` changed and which hint each resolved
2. **Before/after finding counts** — first run vs configured run (the honest
   measure of how much was never dead)
3. **Baseline table** — 4a, fully populated
4. **Keep/kill list** — 4b, chain heads only, grouped by class
5. **Root causes** — 4e, the barrels and dumping grounds behind the counts
6. **Phased burndown** — 4c with risk and "what must keep working" per phase
7. **Ratchet proposal** — 4d
8. **Handoffs** — per the self-critique owner list

Plan only. End the turn with a standalone recap in chat: the two or three highest-impact chain heads and the first phase to approve; the plan file is the deliverable, write it first. Deletion begins in `housekeep-dead-code`, after approval. The
non-negotiables for this pass are in
[`references/preservation-contract.md`](references/preservation-contract.md).
