---
name: audit-agent-speed
description: >
  Measure and fix a slow coding-agent setup: status line, hooks, instruction
  bloat, effort, worktree pile-up, antivirus and indexer scans. Use when
  "Claude is slow" or "CPU is pinned". App speed → audit-performance.
license: MIT
effort: high
---

# audit-agent-speed — Make the agent setup fast again

**Degree of freedom: MIXED** — measurement commands `[LOW freedom — run
exactly]`; which fixes to recommend `[HIGH freedom]`.

> **Audit-and-fix exception.** Report first, then fix. Apply local, reversible
> fixes right away. Ask before anything that needs admin rights, touches
> committed config, deletes data, or changes a user preference (effort, model).

Most of an agent's turn is model time on the provider's servers, and no local
tuning changes that. This skill wins back the **local** part: hooks, tools,
builds, git, terminal rendering, and a CPU that other processes keep pinned.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-agent-speed** (this) | The agent host: Claude Code/Cursor config, hooks, status line, worktrees, OS scanners |
| `audit-performance` | The product's runtime speed (Core Web Vitals, bundles, queries) |
| `workflow-environment-ready` | Proving tools and verify commands work before a long run |
| `iterate-agent-harness` | Turning an agent failure into a guard with a regression test |

## How to reason

1. **Observe**: measure CPU per process before blaming anything. Quote the numbers.
2. **Interpret**: per-call cost × call rate × concurrent sessions. A 100 ms hook
   on every tool call across 3 agents matters; a 2 s Stop hook that runs once doesn't.
3. **Classify**: fix now (local, reversible) / ask (admin, committed, preference) / leave.
4. **Verify**: re-measure after each fix and report each change's effect separately.

## Worked example

> **Observe:** total CPU 100% with 3 sessions. Per-process sampling: `ccusage`
> ×5 at 49%, `wmiprvse` 8%, `MsMpEng` 3%.
> **Interpret:** the status line runs `ccusage statusline` every 10 s per
> session; each run re-reads ~10 GB of transcripts, and slow runs pile up.
> **Classify:** fix now. Remove the widget (back up the config first).
> **Verify:** no `ccusage` spawned in 2 min; total 53–72% → later ~30% as agent
> jobs finished (report the workload change separately from the fix).

---

## Phase 0 — Measure (run exactly)

Windows (includes protected processes such as Defender):

```powershell
$c = Get-Counter '\Process(*)\% Processor Time' -SampleInterval 5 -MaxSamples 1 -ErrorAction SilentlyContinue
$cores = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors
$c.CounterSamples | Where-Object { $_.InstanceName -notin '_total','idle' -and $_.Status -eq 0 } |
  Group-Object { $_.InstanceName -replace '#\d+$','' } |
  ForEach-Object { [pscustomobject]@{ Name=$_.Name; Count=$_.Count; Cpu=[math]::Round((($_.Group | Measure-Object CookedValue -Sum).Sum)/$cores,1) } } |
  Sort-Object Cpu -Descending | Select-Object -First 15
```

macOS / Linux: `ps -eo pcpu,comm --sort=-pcpu | head -20` (macOS: `ps -Ao pcpu,comm -r | head -20`).

Take 3–4 samples over ~30 s. Avoid heavy `Get-CimInstance Win32_Process`
loops while measuring; they inflate `wmiprvse` themselves.

## Phase 1 — Status line

- A status line runs on every assistant message (debounced at 300 ms).
  `statusLine.refreshInterval` **adds** timed runs on top; leave it unset
  unless a widget needs a clock.
- Widgets that re-read transcripts on every render (`ccusage statusline`,
  transcript-parsing HUDs) scale with transcript volume × sessions. Prefer
  widgets that only read the JSON Claude Code passes on stdin (cost,
  context window, rate limits). Keep `ccusage` as an on-demand CLI.
- Cache slow git calls (ccstatusline: `gitCacheTtlSeconds` ≥ 30).
- Source: https://code.claude.com/docs/en/statusline

## Phase 2 — Hooks

Inventory every hook in `~/.claude/settings.json` and each repo's
`.claude/settings.json`, then time each one (`echo '{}' | <command>`).

- **Per-tool-call hooks** (`PreToolUse` with matcher `*`, `PostToolUse` on
  `Edit|Write`) spawn a process per call. Narrow with `matcher` or the `if`
  field (permission-rule syntax) so non-matching calls never spawn.
- **Per-edit lint/format** that blocks for seconds duplicates `lint-staged` at
  commit and rewrites files under the agent (forcing re-reads). Remove it when
  pre-commit already runs `eslint --fix`.
- **Synchronous Stop typecheck is invisible cost.** For most events, including
  Stop, plain stdout goes to the debug log only, so the agent never sees the
  errors while every turn waits. Replace it with
  [scripts/stop-typecheck.mjs](scripts/stop-typecheck.mjs) registered with
  `asyncRewake: true`: background, skip-if-unchanged, wakes the agent only on a
  new error set. Copy it to `<repo>/.claude/hooks/` and pass the repo's
  typecheck script name.
- Source: https://code.claude.com/docs/en/hooks (Exit code 0, `async`, `asyncRewake`, `if`)

## Phase 3 — Instruction files and search scope

- **AGENTS.md is skipped when any CLAUDE.md exists in the working directory or
  above it**, which includes a parent folder holding all your repos. Load both
  with user settings
  `"pluginConfigs": { "agents-md@builtin": { "options": { "instructionFiles": "claude-md-and-agents-md" } } }`
  (ignored in project settings). Source: https://code.claude.com/docs/en/memory
- Keep each CLAUDE.md under ~200 lines; `@imports` load at launch and don't
  save context. Run `/doctor prompt-audit` to find bloat.
- **Worktree folders inside the repo that are not gitignored** (`.worktrees/`)
  make every Grep/Glob walk each copy and return duplicate hits. Add them to
  `.git/info/exclude` (local, no commit) or `.gitignore`. Check:
  `git check-ignore -v .worktrees/x` and compare `rg --files | wc -l` before and after.

## Phase 4 — Effort and models

- Lower effort is faster and cheaper; Opus 5.5 defaults to `medium`. A global
  `xhigh` slows every routine turn. Suggest `high` (or the default) with
  `/effort xhigh` for hard tasks. On Opus 5.5, changing effort keeps the prompt cache.
- The built-in Explore agent inherits the main model. A user agent named
  `Explore` with `model: haiku` overrides it for fast, cheap searches.
- Fast mode (`/fast`): up to 2.5× faster output at a higher per-token price,
  billed from usage credits on subscriptions; enable at session start.
- These are preferences: recommend, then ask. Sources:
  https://code.claude.com/docs/en/model-config, https://code.claude.com/docs/en/sub-agents, https://code.claude.com/docs/en/fast-mode

## Phase 5 — Worktree pile-up

Agents create worktrees faster than anyone removes them. Inventory with
`git worktree list --porcelain` per repo and classify:

- **KEEP**: uncommitted changes, locked, path in a running process's command
  line, or activity in the last 24 h. Measure activity from `HEAD` and
  `logs/HEAD` mtimes in the worktree's git dir, **not** `index`: `git status`
  rewrites the index and makes every worktree look fresh.
- **SAFE**: clean, idle, and either merged into the default branch or its PR
  branch is `[gone]` on the remote (squash merges).
- **REVIEW**: clean, but holds commits not on the default branch.

Report the counts and list; remove SAFE ones only on approval, with
`git worktree remove` (never `--force`).

## Phase 6 — Operating system (Windows examples)

- **Antivirus:** prefer a Dev Drive with Defender performance mode over
  exclusions. Process exclusions (`node.exe`, `git.exe`) skip scanning of
  everything those processes write, so flag them as risk, not as a speed fix.
  Source: https://learn.microsoft.com/en-us/windows/dev-drive/
- **Search indexer:** exclude the repos folder via Settings → Privacy &
  security → Searching Windows → Add an excluded folder. The
  `PreventIndexingCertainPaths` policy key was observed to be ignored on
  Windows 11 Home; verify any exclusion with a probe file.
- **Vendor utilities that query WMI on every process start** (observed:
  Alienware Command Center's `AWCC.SCSubAgent`, ~8% CPU) scale with agent
  process churn. Attribute `wmiprvse` load by enabling the
  `Microsoft-Windows-WMI-Activity/Trace` channel for ~20 s (admin) and
  grouping `ClientProcessId`. Killing the sub-agent doesn't stick if a
  service respawns it; the fix is uninstalling the utility, which is the owner's call.
- Power plan on AC and Best performance; background terminals are throttled
  harder on battery.

## Self-critique

Before reporting, fail the run if any of these are true:

- A cause was named without a per-process measurement behind it
- A fix was credited with a drop that a workload change explains
- A hook or setting was changed without timing it before and after
- A worktree, exclusion, or user preference was changed without approval
- An exclusion or policy was reported as working without a probe that proves it

## Report

```
| # | Finding | Measured | Fix | Status (fixed / ask / leave) |
```

Then a before/after CPU table, the list of changed files with backups, and
what's left for the owner (admin prompts, committed config, preferences).
