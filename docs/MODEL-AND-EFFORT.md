# Model and effort

How the pack behaves on each current Claude model, and how to set effort per task. Facts here come from Anthropic's model pages and the Claude Code docs (checked 2026-11-17; sources at the end). Re-verify at the next model release.

## The short version

- **The skills are written for any current model.** No skill names a model, and none needs one.
- **A skill cannot read which model runs it.** Claude Code exposes the effort level to a skill (`${CLAUDE_EFFORT}`), not the model ID. So the pack routes by effort, and you choose the model.
- **Lower effort before you switch model.** On every current Claude model, effort sets how much the model thinks, how many tool calls it makes, and what a turn costs.
- **The status line shows both.** After `--claude`, the line under the prompt reads like `Opus 5.5 medium │ …`, so you always see the model and effort in force.

## Models

| Model | Context | Effort default (API / Claude Code) | Price per MTok (in / out) | Use it for |
|:------|:--------|:-----------------------------------|:--------------------------|:-----------|
| Claude Fable 5.2 (`fable`) | 1M | high / medium | $8 / $40 | The hardest long runs: a whole-repo burndown, a tangled bug, a large plan |
| Claude Opus 5.5 (`opus`) | 1M | medium / medium | $4 / $20 | The default. Everyday building, fixing, auditing |
| Claude Sonnet 5.5 (`sonnet`) | 1M | high / medium | $2 / $10 | Fast everyday coding; a cheaper worker under a planner |
| Claude Haiku 5.5 (`haiku`) | 1M | medium in Claude Code | $0.10 / $0.50 up to 100K tokens | Search, inventory, and other read-only subagent work |

Claude Code's default model is Opus 5.5 on every plan. Fable 5.2 is never the default; pick it with `/model fable` (Claude Code 2.1.321 or newer). All four support effort `low`, `medium`, `high`, `xhigh`, and `max`, and none of them lets you switch thinking off in Claude Code.

The `sonnet` and `haiku` aliases point at older models on some cloud providers (for example Haiku 4.5 on Amazon Bedrock). Check `/model` there.

**Other hosts.** Cursor ignores the `effort:` key and runs each skill at whatever its model picker is set to. Codex CLI, Gemini CLI, and other agents that read `SKILL.md` use their own models and also ignore the key. The skill text is the same everywhere.

## Setting effort

| Set it for | How |
|:-----------|:----|
| This session | `/effort low` · `medium` · `high` · `xhigh` · `max` |
| One model, persistently | per-model `modelSettings` in Claude Code settings |
| One skill, command, or subagent | `effort:` in its frontmatter |
| Every subagent | `CLAUDE_CODE_SUBAGENT_EFFORT` (Claude Code 2.1.316 or newer) |

Prose does not set thinking depth. "Think step by step", "think harder", and "answer without deliberating" do nothing on these models, and on Fable 5.2 a "think less" line is ignored from `medium` up. Change the effort level.

## How the pack routes effort

| Work | Effort | Why |
|:-----|:-------|:----|
| Judgment: `audit-*`, `plan-*`, `debug-*`, `completion-judge`, `code-reviewer`, security and architecture review, verdict skills, `research`, grilling and PRDs | `high` | Recall and severity calls are where a lower level leaves findings behind |
| Hardest planning only (a one-time whole-repo burndown) | `xhigh` | Costs many more tokens; use it for a measured gain |
| Implementation: `enhance-*`, `backend-*`, `design-*`, `workflow-build-feature`, `workflow-fix-and-ship`, closure modes | the session's level (key omitted) | `medium` is Claude Code's default and the measured sweet spot for agentic coding |
| Mechanical and read-only: `handoff`, `workflow-git-commit`, smoke checks, scripted bring-up, `deploy-checker` | `low` | Exact steps and pass/fail reads need no more |

Each skill's frontmatter is the source of truth; this table is the convention it follows (ADR-0006).

This routing was tuned on Opus 5.5. The same level buys a different amount of thinking on each model, so the numbers below are the honest guide until the pack's evals are run per model (see [Measuring](#measuring)):

- **Fable 5.2.** Most of its gain arrives by `high`; `xhigh` and `max` cost far more for a small, uneven gain. A `high` skill runs noticeably longer and costs twice Opus 5.5 per token. For routine work, stay at `medium` or use Opus 5.5.
- **Sonnet 5.5.** Its levels were recalibrated. Anthropic's guidance is `medium` for agentic coding and `low` for chat.
- **Haiku 5.5.** Good for the pack's read-only inventory skills and for subagents that only search.

## What the newer models change in how skills are written

These hold for every skill in the pack and for the ones you add.

- **Finish the task.** The newer models sometimes end a turn with work still owed, more often at `low` and `medium`. The always-on verification rule says what counts as an ordinary obstacle (work through it) and what counts as a deliberate blocker (leave it and report). The closure skills add a Stop hook, because text alone does not prevent an early stop.
- **Rules carry their scope and reason.** "Never" rules are followed as written, so a broad one blocks routine work. A rule names the exact action it covers and says when to ask first.
- **No reasoning in the output.** A skill does not ask the model to write out its reasoning; that can be declined. It asks for the evidence a finding rests on.
- **Normal volume.** MUST / NEVER / CRITICAL over-trigger; "try to" and "if possible" are read as permission to under-deliver. Skills state the rule and its reason once.
- **Progress notes are wanted.** One line of intent before the first tool call, brief notes on load-bearing findings, and a standalone recap at the end. No "no preamble" or "don't narrate" rules.
- **Scope stays put.** Pre-existing bugs go in the report as follow-ups. The pack does not tell the model it owns your codebase, because that line makes Fable 5.2 restructure code nobody asked it to touch.
- **Delegation has a cost.** A subagent is a second context that returns only a summary. Skills delegate independent, sizeable tracks, not a handful of tool calls.
- **A name is not knowledge.** Research skills search a product or library name as written instead of answering from memory.
- **Frontend direction names the defaults to avoid** (cream backgrounds, italic accent words, "01/02/03" labels, pill buttons, purple gradients, three equal cards). "Avoid a generic AI look" only swaps one default for another.
- **No countdowns, no grader talk.** Nothing tells the model to wrap up early or describes how it is scored.

## Token budget

Skill descriptions ride in every request, so they are the pack's standing cost.

- **Claude Code** lists each model-invocable skill as `- name: description` against 1% of the context window. Over budget, the least-used skills show by name only. The full pack's listing is about 39,000 characters, and `validate-skills` fails above that ratchet (ADR-0010). A full install sets `"skillListingBudgetFraction": 0.03` when you have not set it.
- **Codex CLI** gives the skill list 2% of context and shortens descriptions before it drops skills. **Cursor** and **Zed** also truncate long listings. This is why every description states the job in its first clause.
- **Install less to pay less.** `npx @kensaurus/skills --auto --profile core` installs the 31 skills of the daily loop, whose listing is about 7,200 characters. Add `web`, `backend`, `mobile`, `growth`, or `maintain` when you need them. See [Profiles](../README.md#install-a-profile).
- **The router costs nothing until you use it.** `/kenji` is user-invoked, so it is not in the listing.
- **Tokenizers differ.** The same text counts as about 30% more tokens on Fable 5.2, Opus 5.5, and Haiku 5.5 than on Sonnet 4.6 and older models. Budgets measured in characters hold; budgets remembered in tokens do not.

Cache reads are cheap, so stable prefixes matter: always-on rules stay few, short, and byte-stable (no dates or counters). `disable-model-invocation: true` drops a user-only ritual from the listing.

## Measuring

Claude Code can now measure what a skills pack costs and whether it helps:

| Tool | What it tells you |
|:-----|:------------------|
| `/skill-doctor` | Per-skill listing cost and which skills were never invoked |
| `claude plugin details kenji` | Always-on token cost per component of the plugin |
| `claude plugin eval .` | Each eval case run with and without the plugin, with a score delta |
| `/context` | The listing size after the budget is applied |

The pack ships trigger evals in [`evals/`](../evals/README.md): one case per core route, each checking that the right skill fires. Run them after any change to a description. An eval run spends real tokens, so it is a maintainer step, not part of `npm test`.

## Sources

- Claude Code model configuration: https://code.claude.com/docs/en/model-config
- Claude Code skills (frontmatter, listing budget, `${CLAUDE_EFFORT}`): https://code.claude.com/docs/en/skills
- Plugin evals and measurement: https://code.claude.com/docs/en/plugin-evals, https://code.claude.com/docs/en/plugins/measure
- Prompting Claude Fable 5.2: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2
- Prompting Claude Opus 5.5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
- Pricing: https://platform.claude.com/docs/en/about-claude/pricing
- Codex skill listing budget: https://learn.chatgpt.com/docs/build-skills
