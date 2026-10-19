---
name: audit-cicd
description: >
  Audit GitHub Actions CI/CD for cost, speed, and safety. Use when the Actions
  bill or minutes are high, runners cost too much, CI is slow, cache storage
  grows, or "CI/CD / workflow audit". Bypass or ratchet gaming →
  audit-gate-logic.
license: MIT
effort: high
---

# CI/CD Audit Skill

**Degree of freedom: MIXED** — Steps 1–3 judgment `[HIGH freedom]`; Step 0
`gh` inventory and Step 4 deletes `[LOW freedom — run exactly]`.

Systematic audit of GitHub Actions workflows to cut the Actions bill (minutes +
storage) and speed up CI **without losing test coverage or deploy safety**.
Uses the `gh` CLI for live billing, run history, and storage data.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-cicd** (this) | GitHub Actions CI/CD audit for cost, speed, and safety |
| `audit-gate-logic` | Read-only CI gate logic: silent bypass, ratchet gaming, duplicate gates |
| `housekeep-gates` | Consolidate accreted CI gates, ratchets, hooks into one aggregator check |
| `audit-infra-cost` | Read-only hosting, database, storage, egress, and serverless spend audit |

## How to reason

1. **Observe** — quote the trigger, `runs-on`, `concurrency`, or `gh` minute/storage number
2. **Interpret** — billed twice, doomed minutes, or a 10× runner on every push?
3. **Classify** — double-bill / no-concurrency / expensive-runner / doomed-job / storage / correct
4. **Severity** — by `$` × safety; never score a cut that drops coverage

## Worked example

> **Observe:** `build-mobile.yml` `runs-on: macos-15` on `push:` to every
> branch; no `if:` gate; private repo.
> **Interpret:** every push bills ~10× Ubuntu for an iOS job nobody requested.
> **Classify:** expensive-runner on ordinary push.
> **Severity:** Very high (~10×).
> **Finding:** `build-mobile.yml` | macos on push | dispatch/tag-only | ~10×

## Step 0: Inventory the account and pipelines  [LOW freedom — run exactly]

Measure before optimizing. Only **private** repos consume the paid minute
allowance; public repos get free minutes — don't spend effort there.

```bash
# Which repos actually cost money (private, active, recent pushes)?
gh repo list <owner> --limit 200 --json name,visibility,isArchived,pushedAt \
  --jq 'sort_by(.pushedAt)|reverse|.[]|select(.visibility=="PRIVATE" and .isArchived==false)|"\(.name)\t\(.pushedAt[0:10])"'

# Per repo: active workflows, run volume (last 14d), and runner types
gh api "repos/<owner>/<repo>/actions/workflows" --jq '.workflows[]|select(.state=="active")|.name'
gh run list --repo <owner>/<repo> --created ">=YYYY-MM-DD" --limit 200 --json databaseId --jq 'length'

# Storage (the other half of the bill)
gh api "repos/<owner>/<repo>/actions/artifacts" --paginate --jq '[.artifacts[]|select(.expired==false)|.size_in_bytes]|add'
gh api "repos/<owner>/<repo>/actions/cache/usage" --jq '.active_caches_size_in_bytes'
```

Rank repos by `runs × runner-multiplier`. A `macos-*` job counts ~10x a
`ubuntu` job; `*-large`/bigger runners cost more than standard.

## Step 1: Anti-pattern scan (per workflow)  [HIGH freedom]

For each `.github/workflows/*.yml`, check for the recurring cost drivers:

- [ ] **Double-billing triggers** — the *same jobs* run on both `push: [main]`
      and `pull_request` for main (every merge bills twice). PR gates
      verification; a separate `deploy.yml` handles main. If both are needed,
      guard per-job with `if: github.event_name == '...'`.
- [ ] **Missing `concurrency`** — no `cancel-in-progress`, so rapid pushes/PR
      syncs stack full runs instead of superseding.
- [ ] **Expensive runners on ordinary pushes** — `macos-*` / `*-large` firing
      on every push instead of `workflow_dispatch` or version tags only.
- [ ] **No path filters** — docs/config-only changes run the full heavy suite
      (add `paths:` / `paths-ignore:`).
- [ ] **Doomed jobs** — a costly job (visual/e2e/Lighthouse) runs in parallel
      with a cheap gate and keeps burning minutes after the gate fails
      (gate it with `needs: [...]`).
- [ ] **Long/default artifact retention** — `upload-artifact` without
      `retention-days` keeps outputs 90 days; heavy reports uploaded on
      success (`if: always()`) instead of `if: failure()`.
- [ ] **Self-uploading SARIF pile-ups** — e.g. gitleaks-action uploads a tiny
      SARIF artifact every run for 90 days.
- [ ] **Over-frequent crons** — daily `schedule:` where weekly suffices.
- [ ] **Redundant rebuilds** — two jobs each run the same build instead of
      building once and sharing via artifact (only when their build env is
      identical — see Safety).

## Step 2: Cost levers (highest impact first)  [HIGH freedom]

| Lever | Fix | Impact |
|-------|-----|--------|
| macOS/large on push | Gate to `workflow_dispatch` / tags | Very high (~10x) |
| Doomed heavy jobs | `needs: [cheap-gate]` so they skip on failure | High |
| Double-billing triggers | Drop the redundant trigger (keep the gate) | High |
| No concurrency | Add `cancel-in-progress` | Medium |
| No path filters | `paths:` / `paths-ignore:` | Medium |
| Daily crons | Move to weekly | Medium |
| Artifact retention | `retention-days: 1–7` + `if: failure()` | Storage |
| Repeated installs | Cache deps / Playwright browsers / build cache | Medium |

## Step 3: Fix patterns  [HIGH freedom]

```yaml
# Concurrency — every workflow. CI/verification cancels superseded runs:
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# Deploy/release: never cancel a live deploy. For combined verify-on-PR +
# deploy-on-push workflows, cancel PR churn only:
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

```yaml
# Expensive runner: dispatch/tag-only, not every push
build-ios:
  runs-on: macos-15
  if: ${{ inputs.platform == 'ios' || startsWith(github.ref, 'refs/tags/') }}
  timeout-minutes: 60   # cap runaway 10x spend

# Lean artifacts
- uses: actions/upload-artifact@v4
  if: failure()
  with: { name: report, path: report/, retention-days: 3 }

# Stop the gitleaks SARIF pile-up
env: { GITLEAKS_ENABLE_UPLOAD_ARTIFACT: "false" }
```

## Step 4: Storage cleanup (destructive — confirm first)  [LOW freedom — confirm first]

Artifacts and caches are ephemeral CI outputs; deleting them is safe but
irreversible. Confirm with the user, then:

```bash
# Delete non-expired artifacts in a repo
gh api "repos/<owner>/<repo>/actions/artifacts" --paginate \
  --jq '.artifacts[]|select(.expired==false)|.id' \
| xargs -I{} gh api -X DELETE "repos/<owner>/<repo>/actions/artifacts/{}"

# Delete caches
gh api "repos/<owner>/<repo>/actions/caches" --paginate --jq '.actions_caches[].id' \
| xargs -I{} gh api -X DELETE "repos/<owner>/<repo>/actions/caches/{}"
```

## Safety rules (do NOT trade coverage or deploys for cost)

- **Never delete, skip, or weaken a test** to save minutes. Make advisory
  scans (`npm audit`, CVE scans) `continue-on-error` or move them to a
  `schedule` — keep the check.
- **Keep the deploy gate.** If `deploy.yml` triggers on the CI `workflow_run`
  for `push`, do not remove the `push` trigger from CI.
- **Only share a build across jobs when their build env is identical.** Reusing
  an artifact built with different secrets/flags (prod env, QA build stamps)
  ships or tests the wrong bundle.
- **Update branch protection when renaming/merging jobs.** If a required status
  check's job name changes, `PATCH` `required_status_checks.contexts` in the
  same change or merges hang. Verify:
  `gh api repos/<owner>/<repo>/branches/<main>/protection/required_status_checks --jq '.contexts'`
- **Verify with live runs.** After pushing, confirm no `startup_failure`
  (YAML parses) and that intended jobs skip/run:
  `gh run view <id> --json jobs --jq '.jobs[]|"\(.conclusion // .status)  \(.name)"'`

## Account backstops (one-time, GitHub UI)

UI-only at the time of writing — check whether the settings API now covers
them before telling the user it is manual.

- **Default artifact/log retention** → Settings → Actions → General → drop from
  90 days to ~14 (applies to all repos, including future ones).
- **Spending budget** → Settings → Billing → Budgets → set an Actions budget
  with 75/90/100% alerts; keep "Stop usage" off so production deploys never
  hard-break.
- **Rotate any secret leaked in a workflow/remote** (the user must revoke;
  you can only strip it from configs).

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Evidenced** — workflow YAML or `gh` count, not "CI feels expensive"
2. **Reproducible** — same trigger/`runs-on` still present
3. **Severity justified** — ranked by `$` × runner multiplier
4. **Right owner** — silent bypass / ratchet → `audit-gate-logic`; hosting bill → `audit-infra-cost`
5. **No-false-safety** — no test deleted or skipped to save minutes; storage delete confirmed

## Output: CI/CD Cost Audit Report

```markdown
## CI/CD Audit: [owner]

### Spend snapshot
- Actions billable: ~$X/mo (private repos exhaust the included minutes)
- Top spenders: [repo — ~$Y, driver], ...
- Storage: [X GB artifacts / Y GB caches]

### Findings (prioritized)
| # | Repo | Workflow | Anti-pattern | Fix | Impact |
|---|------|----------|--------------|-----|--------|
| 1 | repo | build-mobile.yml | macOS on every push | dispatch/tag-only | ~10x |

### Already healthy
- [repos/workflows already using concurrency, gated runners, path filters]

### Manual actions (user-only)
- [ ] Default artifact/log retention → 14 days
- [ ] Actions spending budget + alerts
- [ ] Rotate leaked secret(s), if any

### Expected outcome
~$A → ~$B/mo, no loss of test coverage or deploy safety.
```

## Related

- `audit-gate-logic` — does the gate actually stop what it claims (bypass / ratchet)
- `audit-infra-cost` — hosting / DB / egress (not Actions minutes)
- `test-visual-regression` — screenshot CI artifact retention
- `audit-security` / `deploy-verify` / `workflow-pr` / `create-hook`

