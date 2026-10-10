# Model and effort

How the pack runs on Claude Opus 5.5 and how to set effort per task. Facts here come from Anthropic's Opus 5.5 announcement and the Claude Code docs (checked 2026-09-23); re-verify at the next model release.

## Default model

| Host | Model | Notes |
|:-----|:------|:------|
| Claude Code 2.1.280+ | Claude Opus 5.5 (`opus` alias, ID `claude-opus-5-5`) | Default on Pro, Max, Team, Enterprise, API, Bedrock, Vertex |
| Cursor | Claude Opus 5.5 selectable as the agent model | All tools, 1M context at flat pricing; works as a coordinator for subagents |
| Codex CLI, Gemini CLI | Their own models | Skills (in `~/.agents/skills`), merged rules, and portable commands install there; the `effort:` key is ignored |

Pricing: $4 / $20 per MTok; cache reads $0.20 (60% cheaper than Opus 5); fast mode $8 / $40. 1M context (native, no `[1m]` suffix), 128K max output.

## Effort is the only thinking control

Opus 5.5 defaults to `medium` effort (every other model defaults to `high`). Anthropic's numbers: medium matches or beats Opus 5 at high on agentic coding, in fewer steps and about half the tokens. Thinking is always on and cannot be disabled — `MAX_THINKING_TOKENS=0` and "don't think" prompts do nothing. Effort is the lever; prose is not.

| Set it for | How |
|:-----------|:----|
| This session | `/effort low` · `medium` · `high` · `xhigh` · `max` |
| One model, persistently | per-model `modelSettings` in Claude Code settings |
| One skill, command, or subagent | `effort:` in its frontmatter |

The top-level `effortLevel` setting does **not** apply to Opus 5.5. Cursor skips unknown frontmatter keys, so `effort:` is a no-op there and the skill runs at whatever the model picker is set to. `${CLAUDE_EFFORT}` exposes the current level inside a skill body.

## How the pack routes effort

| Work | Effort | Why |
|:-----|:-------|:----|
| Judgment: `audit-*`, `plan-*`, `debug-*`, `completion-judge`, `code-reviewer`, security and architecture review, verdict skills (`deploy-verify`, `workflow-quality-gate`, `workflow-release-prep`), `research`, grilling and PRDs | `high` | Recall and severity calls are where medium leaves findings on the table |
| Hardest planning only (a one-time whole-repo burndown) | `xhigh` | Every turn thinks longer than Opus 5 did; use it for a measured gain, not by habit |
| Implementation: `enhance-*`, `backend-*`, `design-*`, `workflow-build-feature`, `workflow-fix-and-ship`, closure modes | `medium` (omit the key) | Anthropic's measured sweet spot for agentic coding |
| Mechanical and read-only: `handoff`, `workflow-git-commit`, smoke checks, scripted bring-up, `deploy-checker`, settings edits | `low` | Exact steps and pass/fail reads need no more; Anthropic's vision numbers show low on Opus 5.5 beating Opus 5 at max on dense charts at a tenth of the tokens |

Each skill's frontmatter is the source of truth; this table is the convention it follows (ADR-0006).

**Retired framing:** "plan with a strong model, execute with Composer 2.5." One model does both, so plan → execute → judge is high → medium → high-in-a-fresh-context. `approved-plan-execution.mdc` (anti-reward-hacking, anti-deletion, checkpoints, STOP-and-ask on auth / RLS / secrets / payments / migrations) stays — its guardrails never depended on the model (ADR-0007).

## What changed in how the skills are written

- **Prose does not steer thinking.** "Think step by step", "think harder", "double-check", "be thorough" are no-ops or harmful; effort replaces them. Evidence rules ("cite path:line", "report outcomes faithfully") stay — they target fabricated progress, not thinking depth.
- **Normal volume.** MUST / NEVER / CRITICAL over-trigger; "try to" and "if possible" are read as permission to under-deliver. Skills state the rule and its reason once.
- **Progress notes are wanted.** The always-on verification rule asks for one line of intent before the first tool call, brief notes on load-bearing findings, and a standalone recap at the end — never "no preamble" or "don't narrate". Unattended runs say how a turn may end.
- **Scope stays put.** Pre-existing bugs go in the report as follow-ups; tests are added where the task asks or the repo already keeps them; scratch checks stay out of the repo; edits are surgical, not whole-file rewrites.
- **Delegation has criteria.** Subagents pay for independent, sizeable, parallel tracks or verbose output the main context does not need — not for a handful of tool calls. A fresh-context judge stays.
- **A name is not knowledge.** Research skills search a product or library name as written instead of answering from memory, and run at higher effort.
- **Lists where content is multifaceted, prose otherwise.** No "never use bullets" rules; 5.x models under-format when told to.
- **Frontend direction names the defaults to avoid** (cream backgrounds, italic accent words in headlines, "01/02/03" section labels, monospace labels, pill buttons, Inter/Roboto, purple gradients, three equal cards) — "avoid a generic AI look" swaps one default for another.
- **No countdowns, no grader talk.** 1M context and compaction exist, so nothing tells the model to wrap up early. Opus 5.5 often suspects it is being evaluated; skills describe requirements, never the scorer.

## Token budget

Skill descriptions ride in every request. Claude Code lists each model-invocable skill as `- name: description` against 1% of the context window, counted at 3 chars/token for current models: 30,000 chars on a 1M Opus 5.5 session, shared with built-in skills (about 11k). Over budget, the least-used skills show by name only (client 2.1.280; ADR-0010). The pack's listing is about 39k chars; `validate-skills` measures it the same way and fails above its ratchet. To keep every pack description, set `"skillListingBudgetFraction": 0.02` in `~/.claude/settings.json` (60,000 chars; the pack plus built-ins measured 49,218). `/skills` (or `skillOverrides`) turns individual skills off or to name-only.

Cache reads cost 0.05×, so stable prefixes matter — always-on rules stay few, short, and byte-stable (no dates or counters). `disable-model-invocation: true` drops a user-only ritual from the listing; `user-invocable: false` hides a reference-only skill from the menu while other skills can still load it.
