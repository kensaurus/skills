---
name: workflow-environment-ready
description: >
  Prove runtimes, installs, tools, services, env names, and the repo's
  verification commands work before a long run. Use when "preflight the repo",
  "set up the environment", or tests cannot start. Failing tests →
  workflow-green-repo.
license: MIT
---

# workflow-environment-ready — Preflight the Working Environment

**Degree of freedom: MIXED.** READY/BLOCKED verdict `[HIGH freedom]`; executed
probes and never echoing secrets `[LOW freedom — run exactly]`.

Long autonomous runs fail most expensively at the end — the work is done, then
the build won't run, a service is down, or a key is missing. This skill front-
loads that risk: prove the environment can build, test, and reach its
dependencies **before** implementation starts.

> **Verify the environment can run the task, don't assume it.** Every check is
> an executed command with observed output, not an inference from a config file.

## How to reason

1. **Detect** — required runtimes, services, env names, gate commands
2. **Probe** — run each check; record observed output
3. **Classify** — cannot-run (env) vs runs-and-fails (code)
4. **Verdict** — READY / READY WITH NOTES / BLOCKED

## Worked example

> **Detect:** Node 22 + pnpm, `supabase/config.toml`, `.env.example` has `NEXT_PUBLIC_SUPABASE_URL`.
> **Probe:** `node -v` 22.4; `pnpm install --frozen-lockfile` ok; `supabase status` not running.
> **Classify:** toolchain ok; local Supabase down is an environment blocker, not a test failure.
> **Verdict:** BLOCKED — start Supabase, then re-run Phase 2; do not start `complete-everything`.

## Self-critique before reporting

- **Executed** — every row is a command + output, not a config inference
- **Secrets** — presence/absence only
- **Cannot-run vs red** — code failures are notes, not BLOCKED
- **Right owner** — commands run but code is red → `workflow-green-repo`; diagnose a hung command → `debug-error`

## Phase 0 — Detect the stack and requirements  [LOW freedom — run exactly]

Read, don't guess:

- **Runtimes/managers:** `package.json` (`engines`, `packageManager`),
  `.nvmrc`, `.tool-versions`, `pyproject.toml`/`requirements.txt`, `go.mod`,
  `Gemfile`, `Cargo.toml`.
- **Verification commands:** scripts in `package.json`/`Makefile`/`justfile`,
  CI workflows, `AGENTS.md`/`CLAUDE.md`, README.
- **Services:** `docker-compose.yml`, `supabase/config.toml`, DB URLs, Redis,
  queues, external APIs.
- **Config contract:** `.env.example` / `.env.sample` — the list of required
  variables (names only).

Produce a requirements checklist before running anything.

## Phase 1 — Verify toolchain and dependencies  [LOW freedom — run exactly]

1. Confirm each required runtime is present at the required version
   (`node -v`, `python --version`, etc.). A mismatch is a blocker to surface
   now, not at hour three.
2. Confirm dependencies are installed and consistent with the lockfile
   (`npm ci` / `pnpm install --frozen-lockfile` / `pip install -r` / etc.).
   Prefer the reproducible/frozen install. Report, don't hide, install errors.
3. Confirm the package manager matches the repo (`packageManager` field / lock
   file) — do not switch managers.

## Phase 2 — Verify services and configuration  [LOW freedom — run exactly]

1. For each required service, confirm reachability with a real check (DB
   connect/ping, `supabase status`, an HTTP health request, container up).
   A required service that is down is a blocker with a precise remedy.
2. Confirm every variable in `.env.example` is present in the environment.
   **Report only presence/absence — never print, log, or echo secret values.**
   Per project rules, `.env*` may be read to understand config but never
   transmitted.
3. Note any variable that is present but obviously placeholder (`YOUR_*`,
   empty) so it fails now rather than mid-run.

## Phase 3 — Prove the verification commands execute  [LOW freedom — run exactly]

Run the cheapest form of each gate to confirm it actually starts and the
harness is wired — not to make it fully green (that is `workflow-green-repo`):

- typecheck: does it run and resolve config? (compile errors are fine to note)
- lint: does the linter start and find the config?
- tests: does the runner discover and start the suite? Run a fast subset.
- build/dev server: does it boot far enough to prove the pipeline works?

Distinguish "the command cannot run" (environment blocker) from "the command
runs and reports code issues" (normal work for the task ahead).

## Phase 4 — Readiness report  [HIGH freedom]

```md
## Environment Readiness — <repo> — <date>
### Verdict: READY | READY WITH NOTES | BLOCKED
### Toolchain
- <runtime>: required <x>, found <y> — ok/mismatch
- dependencies: <install command> → ok/failed
### Services
- <service>: reachable? <how checked> → ok/down
### Configuration
- env vars: <n>/<n> present (names only) — missing: <names or none>
### Verification commands
- typecheck/lint/test/build: runs? <yes/no + note>
### Blockers (must resolve before the long run)
- none | <blocker + one precise ask/remedy>
```

Only declare **READY** when the toolchain installs, required services are
reachable, all config names are present, and each gate command executes. A
missing credential, unreachable service, or absent tool is a genuine blocker —
ask one precise question immediately rather than starting a run that will fail.

## Related

- `workflow-green-repo` — after the environment runs, make every gate pass
- `audit-env-parity` — after local is runnable, check staging/prod agree
- `complete-everything` / `burndown-full` — run this first for long closures
- `workflow-onboard` — orient to an unfamiliar codebase
- `debug-error` — diagnose a command that cannot start
- `audit-agent-speed` — the environment runs but the agent host is slow
  (hooks, status line, CPU hogs, worktree pile-up)
