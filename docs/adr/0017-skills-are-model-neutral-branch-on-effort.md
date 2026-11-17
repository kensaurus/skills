# 0017. Skills are model-neutral; branch on effort, never on a model name

Status: Accepted            Date: 2026-11-17

## Context

The pack was tuned for Claude Opus 5.5 in 2026-09 and named it in five skill
files, the model guide, the manifests, and `llms.txt`. By 2026-11 the lineup is
Fable 5.2, Opus 5.5, Sonnet 5.5, and Haiku 5.5, and the owner asked for the
pack to detect the model and adapt.

Checked 2026-11-17 against https://code.claude.com/docs/en/skills,
https://code.claude.com/docs/en/model-config, and
https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2:

- **A skill cannot read the running model.** No substitution exposes the model
  ID. `${CLAUDE_EFFORT}` exposes the effort level. Frontmatter `model:` sets a
  model; it does not read one. The status line JSON carries `model.id` and
  `effort.level`.
- Claude Code runs all four models at `medium` by default. The same effort
  level buys a different amount of thinking on each model.
- Fable 5.2 ends turns early more often at `low` and `medium`, follows
  "never" rules as written, ignores "think less" prose from `medium` up, and
  restructures code when told it owns the codebase.
- Other hosts (Cursor, Codex CLI, Gemini CLI, Antigravity) ignore `effort:`
  and run their own models.

## Decision

1. **No skill, rule, command, or agent names a model.** Model facts live in
   `docs/MODEL-AND-EFFORT.md` and the ADRs, with the date they were checked.
2. **Depth is routed by effort** (ADR-0006 stands). Where a step should differ
   by depth, a skill branches on `${CLAUDE_EFFORT}`.
3. **The status line shows model and effort**, so the user can see both and
   lower effort before switching model.
4. **The always-on verification rule separates an ordinary obstacle from a
   deliberate blocker**, the distinction Anthropic's Fable 5.2 guidance gives
   for early stops. The long "finish the task" text is not added: Anthropic
   measured about 30% more output tokens with it, and the closure skills
   already use a Stop hook.
5. **No ownership sentence.** The pack runs in the user's repository and keeps
   its scope rule.
6. **Effort levels are not re-tuned by guess.** The routing was measured on
   Opus 5.5; per-model changes wait for eval results.

## Consequences

- `docs/MODEL-AND-EFFORT.md` is a per-model table with sources.
- Manifests and `llms.txt` no longer say "effort-routed for Opus 5.5".
- `check-docs-facts` fails when any manifest version differs from
  `package.json`.

## Rejected

- **Detecting the model in a hook and injecting model-specific text.** Hook
  input carries the model only on some events, and injected text costs tokens
  every session for a difference effort already covers.
- **Pinning `model:` per skill.** It overrides the user's choice and rots at
  the next release (`validate-skills` already warns on full model IDs).
- **Per-model copies of skills.** Three or four copies of 162 skills would
  drift, and the listing cannot hold them.
