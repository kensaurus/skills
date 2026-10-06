# Output template — `plan-dead-code.md`

Copy this shape. The numbers below are illustrative; every count in a real
report comes from an executed command, and the only estimated column is
"After Phase 1".

## Contents

- Why the table has a Children column
- Severity and effort
- Baseline table (4a)

**One row per chain head.** A dead file explains its own exports and the
packages only it imported — those are *children*, listed in the last column,
never as separate rows. Twenty-seven findings that collapse to three heads is
a three-row table, and reporting it as twenty-seven inflates the work.

````markdown
# Dead-Code Audit — <repo>

_Audit-only. Nothing is deleted, fixed, or installed until each phase is approved._

## Stack fingerprint
- Bundler: Vite 6 · React 19 · TS paths: yes (`@/*`)
- shadcn: `src/components/ui` (34 files)
- Supabase: types at `src/types/supabase.ts` · Edge Functions: `supabase/functions` (5)
- Dynamic surfaces: `src/router.tsx:18` template-string lazy import
- Existing: no knip config · ESLint `no-unused-vars: warn` · tsconfig `noUnusedLocals: false`
- Behavior locked by tests? partial — `src/lib/**` covered, `src/routes/**` not

## Proposed `knip.json`
```json
<adapted from references/knip-config.md>
```
Configuration hints resolved: 3 (vite plugin entry, vitest plugin, tailwind postcss)
First-run findings: 312 → after configuration: 41. **271 were never dead code.**

## Baseline
| Issue type | `--production` | default | After Phase 1 (est.) |
|---|---|---|---|
| Unused files | 9 | 15 | 0 |
| Unused dependencies | 4 | 4 | 0 |
| Unused devDependencies | 0 | 3 | 3 |
| Unlisted dependencies | 1 | 1 | 0 (add) |
| Unresolved imports | 0 | 0 | 0 |
| Unused exports | 22 | 61 | ~6 |
| Unused exported types | 6 | 22 | ~4 |
| Unused enum members | 0 | 4 | 4 |
| Duplicate exports | 0 | 2 | 2 |
| **Total (`--max-issues` seed)** | **12** | **41** | — |

Production mode is the number that should reach 0 first: those are findings in
shipped code.

## Findings (chain heads only)
| # | Type | Path / symbol | Verdict | Sev | Effort | Children |
|---|---|---|---|---|---|---|
| D1 | file | `src/lib/formatDate.ts` | kill | Med | S | dep `date-fns`, exports ×3 |
| D2 | file | `src/components/ui/{accordion,carousel,…}.tsx` ×7 | kill — unused shadcn, re-addable | Low | S | exports ×14, dep `embla-carousel-react` |
| D3 | file | `src/components/DashboardV2.tsx` | kill — router imports `Dashboard.tsx` | Med | S | exports ×2 |
| D4 | export | `src/lib/utils.ts` — 23 of 31 exports unused | kill barrel; inline 8 to callers | Med | **M** | — |
| D5 | dep | `axios` (fetch used everywhere) | kill | **High** — advisory GHSA-… | S | — |
| D6 | unlisted | `clsx` imported, never declared | add at the resolved version | Med | S | — |
| K1 | file | `src/routes/Admin.tsx` | keep-config → `entry: ["src/routes/*.tsx!"]` | — | S | — |
| K2 | export | `src/lib/api.ts#client` | keep-tagged → `@public` (used by `scripts/`) | — | S | — |
| K3 | export | `src/hooks/useAuth.ts#__testReset` | keep-tagged → `@internal` (production mode only) | — | S | — |
| N1 | file | `public/img/legacy/**` (12 files) | needs-owner — reached by template string? | — | S | — |

Verdicts: `kill` · `keep-tagged` · `keep-config` · `needs-owner`. **A keep row
always names its remedy** — a keep with no remedy is an `ignore` in disguise,
and the next agent will delete it.

## Residue metrics
| Metric | Count |
|---|---|
| `console.log/debug/info` outside tests | 41 |
| `debugger` | 2 |
| `.only` / `.skip` / `.todo` | 1 / 6 / 0 |
| commented-out code blocks | 18 |
| `@ts-ignore` + `@ts-expect-error` / `eslint-disable` | 9 / 14 |
| `: any` / `as any` | 37 |
| empty `catch {}` | 5 |
| unused locals (`tsc --noEmit`) | not run — `noUnusedLocals` is off |
| orphan `public/` assets | 12 (3.4 MB) |
| env referenced-not-declared / declared-not-referenced | 2 / 5 |
| duplication (`jscpd`) | 6.2% · 7 clones ≥50 tokens |
| `*V2` / `*New` / `*Old` / `* copy` files | 4 |
| **bundle leak (`service_role` in `dist`)** | **0 — clean** |

## Root causes
Not a list of items — the thing to fix:
1. `src/lib/utils.ts` is a dumping ground (D4). One split removes 23 findings.
2. shadcn was installed wholesale (D2). 7 of 34 components are unwired.
3. `noUnusedLocals` has never been on, so nothing inside files was ever checked.

## Phased burndown
- **Phase 1 — Config + files** → commit `knip.json`; delete D1–D3. Re-run; expect deps to *rise* before they fall.
- **Phase 2 — Exports + types** → `--fix-type exports,types`; split D4; linter cascade; repeat until stable.
- **Phase 3 — Dependencies** → remove D5 + chain survivors; add D6; clean install; build.
- **Phase 4 — Residue** → console, `debugger`, `.only`, commented blocks, orphan versions, assets, `.env.example` sync.
- **Phase 5 — Suppressions** → 9 `@ts-ignore` → fix or `@ts-expect-error` + reason.
- **Phase 6 — Ratchet** → `knip` script + CI job at `--max-issues 3`, into the `housekeep-gates` aggregator.
- **Phase 7 — Supabase arm** → 2 never-queried tables, 1 uninvoked Edge Function, 3 unused indexes, types-drift guard. Drops are migrations, after approval.

Risk per phase, and what must keep working: Phase 1 must not break the
template-string router (K1); Phase 3 must not remove a dep reached only from
`tailwind.config.ts`; Phase 7 touches no production data.

## Ratchet target
`--max-issues` seed: 41 default / 12 production → after Phase 3: ≤10 / 0 → target 0 / 0.
Duplication 6.2% → ≤4%. Suppressions 23 → ≤15. All shrink-only.

## Execution handoff
Approve a phase to run it via `housekeep-dead-code`. `.skip` rows and TODO
counts → `housekeep-backlog`. Duplication → `workflow-refactor`. Schema drops →
`plan-data-integrity` then `db-migrator`.
````

## Why the table has a Children column

Without it, agents report chains as independent findings and the plan looks
five times larger than the work. The re-run after Phase 1 is where children
disappear — and where a *few new* findings appear, because deleting a file can
orphan the dependency only it imported. Both directions are expected; say so
in the plan so the apply pass does not treat the delta as a surprise.

## Severity and effort

**Severity** — High: an unused dependency with an open advisory, an orphan file
holding credentials or PII fixtures, duplicated business logic that has already
diverged. Medium: unused files and exports. Low: unused types, enum members,
class members.

**Effort** — S: delete a file, drop an `export` keyword. M: a barrel, a
dumping-ground split, a duplicate merge. L: anything needing a framework config
change or a database migration.

Severity orders the phases; effort decides whether an item belongs here or in
`workflow-refactor`.

## Baseline table (4a)

The ratchet's starting line. Numbers only ever go down.

| Metric | Command | Today |
|---|---|---|
| Knip issues (production) | `knip --production` | |
| Knip issues (default) | `knip` | |
| Unused files / exports / types / deps | `knip --files` etc. | |
| Unused locals | `tsc --noEmit` | |
| Duplication % | `jscpd` | |
| `console.*` / `debugger` | `rg -o … \| wc -l` | |
| `.only` / `.skip` / `.todo` / `x`-prefixed | `rg -o … \| wc -l` | |
| Suppressions / `any` | `rg -o … \| wc -l` | |
| Orphan assets | asset scan | |
| Env drift (missing / unused) | env diff | |
| Unused indexes / orphan tables / functions | `supabase inspect` | |
