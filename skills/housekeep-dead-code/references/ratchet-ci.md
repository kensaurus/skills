# Ratchet install — scripts, lint, CI, aggregator

The point: the next agent session cannot leave the repo with more dead code
than it found. One number, shrink-only, enforced in CI. Cleanup without this
regrows within weeks.

## Contents

- 1. `package.json` scripts
- 2. Guard the ratchet, not just the number
- 3. tsconfig
- 4. ESLint (flat config)
- 5. lint-staged, and why Knip is not in pre-commit
- 6. GitHub Actions job
- 7. Aggregator wiring (`housekeep-gates` contract)
- 8. Types-drift guard (Supabase repos)
- 9. Ratchet the other counts
- 10. Agent rule (hand to `enhance-agent-guardrails`)


## 1. `package.json` scripts

CI calls the scripts, never raw flags, so local and CI cannot drift.

```json
{
  "scripts": {
    "knip": "knip --production --max-issues 0",
    "knip:all": "knip --max-issues 3 --treat-config-hints-as-errors",
    "typecheck": "tsc --noEmit"
  }
}
```

Pin `knip` exactly as a devDependency (`npm view knip version` at install
time); never `^` and never `latest` in a gate.

**`--treat-config-hints-as-errors` goes on the default-mode script only.**
Knip computes `isDisableConfigHints = --no-config-hints || isProduction`, so
under `--production` hints are never collected and the flag is inert. Putting
it there looks like drift protection and provides none.

If the production count is not yet 0, use `--max-issues <N>` there too and
write the rule down in `CONTRIBUTING.md`:

> `knip` and `knip:all` carry `--max-issues` ceilings. A PR may lower a
> ceiling, never raise it. Raising one is a separate PR titled
> `chore(dead-code): raise ceiling` with the reason in the body.

Per-type ceilings are possible with `--reporter json` plus a compare script,
but one number is easier to review and harder to game. Start with one number.

## 2. Guard the ratchet, not just the number

`--max-issues` totals only issue types whose rule is `error`. Everything below
moves the metric without removing code:

| Bypass | Why it works |
|---|---|
| `rules: { files: "warn" }` | **The quietest one.** Warns are excluded from the total, so every dead file is reported and the job still exits `0` |
| `--no-exit-code` | Green unconditionally |
| `--exclude <type>` / narrowed `--include` | Whole issue classes vanish from the run |
| `--workspace <one>` | Scopes a monorepo run to the clean package |
| `ignore`, `ignoreFiles`, `ignoreIssues`, `ignoreDependencies` | Hides findings rather than resolving them |
| `noUnusedLocals: false`, disabling the lint rule | Zeroes the in-file surface |

Review changes to `knip.json`, the scripts, and the job's flags with the same
care as the count. A scope or rule change is a baseline change and belongs in
its own reviewed PR.

## 3. tsconfig

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": true
  }
}
```

`verbatimModuleSyntax` keeps type-only imports type-only, which helps both
Knip's graph and tree-shaking.

Turning these on in an AI-written repo produces a burst of errors. That burst
*is* the unused-locals cascade, so enable them **during** the export/cascade
category, not after — otherwise the typecheck gate between commits is red for
reasons unrelated to the batch.

## 4. ESLint (flat config)

```js
// eslint.config.js
import unusedImports from "eslint-plugin-unused-imports";

export default [
  // ...existing config
  {
    plugins: { "unused-imports": unusedImports },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
    },
  },
];
```

`no-unused-imports` autofixes; core `no-unused-vars` does not. The `^_`
patterns keep deliberate placeholders legal.

Biome or oxlint instead: `noUnusedImports` / `noUnusedVariables` are
equivalent and faster. Keep **one** linter — `audit-gate-logic` flags two as
duplicate enforcement.

## 5. lint-staged, and why Knip is not in pre-commit

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"]
  }
}
```

Knip is repo-wide and too slow for pre-commit. If a local gate is wanted, use
pre-push, calling the same script CI calls:

```bash
# .husky/pre-push
npm run knip
```

## 6. GitHub Actions job

```yaml
# add to the existing ci.yml rather than a new workflow if one exists
  dead-code:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@<pinned-sha>
      - uses: actions/setup-node@<pinned-sha>
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci --ignore-scripts
      - run: npm run knip        # production, ceiling 0
      - run: npm run knip:all    # default mode + config-hint drift
```

Pin action SHAs per `plan-dependency-provenance`. Add `merge_group` to the
workflow triggers if a merge queue is in use, and keep check names identical
across `pull_request` and `merge_group`, or queued PRs wait on checks that
never start.

Exit codes: `0` clean · `1` issues found · `2` Knip failed to run. A job that
only distinguishes `0` from `1` reports a **crashed** run as green.

`--cache` is deliberately absent: Knip caches into
`node_modules/.cache/knip`, which `npm ci` wipes, and `cache: npm` only
restores `~/.npm`. Add an explicit `actions/cache` step if you want it.

## 7. Aggregator wiring (`housekeep-gates` contract)

Add one job to the existing aggregator's `needs:` — do not create a second
required check.

```yaml
  gate:
    needs: [typecheck, lint, test, build, dead-code]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - run: echo '${{ toJSON(needs) }}' | jq -e 'to_entries | all(.value.result == "success")'
```

`if: always()` plus the explicit result check is what makes a **skipped**
`dead-code` job fail the gate instead of silently passing it. If the repo has
no aggregator, mark `dead-code` required and leave a note for
`housekeep-gates`.

## 8. Types-drift guard (Supabase repos)

A generated types file that no longer matches the schema is how sessions end
up querying columns that do not exist.

```yaml
  supabase-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<pinned-sha>
      - uses: supabase/setup-cli@<pinned-sha>
      - run: supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" > /tmp/supabase.ts
        env:
          SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      - run: diff -u /tmp/supabase.ts src/types/supabase.ts
```

Add it to the aggregator's `needs:` as well.

## 9. Ratchet the other counts

A metric with no gate grows back. Once the Knip job is green, add the residue
numbers from the plan's baseline: duplication percentage, suppression count,
`console.*` count. Same shrink-only rule, same review discipline.

## 10. Agent rule (hand to `enhance-agent-guardrails`)

One line for `.cursor/rules/*.mdc` or `AGENTS.md`:

> Before claiming a task done: `npm run typecheck && npm run knip`. New unused
> exports, files, or dependencies are not done.
