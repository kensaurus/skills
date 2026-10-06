# Agent notes — kenji

## Architecture in one breath

This repo **is** the playbook pack: skills + slash commands + agents +
rules. `npx @kensaurus/skills --all` installs Cursor, Claude
Code, Codex CLI, and Gemini CLI; a bare `npx` stays Cursor-only.
`npx skills add` is skills-only.
Default install merges; `--clean` is opt-in. Descriptions cap at 320
chars. Do not submit the Official MCP Registry — we ship templates, not
a server.

**Model story.** One model, routed by effort: deep-reasoning families
declare `effort: high`, mechanical ones `effort: low`, implementation
inherits the default (ADR-0006). There is no "strong planner / fast
executor" split; approved plans run under `approved-plan-execution.mdc`
(ADR-0007). Every description without `disable-model-invocation: true`
rides Claude Code's skill listing; `validate-skills` measures it the way the
client does and fails above `LISTING_MAX_CHARS` (ADR-0010), and commands are
`/`-only while skills keep the auto-route (ADR-0008).
Reasoning depth is effort, never a reasoning MCP server (ADR-0009). Model
and host version facts live in the ADRs, not here.

`docs/AGENTS.template.md` is the constitution **copied into other
repos**. Do not treat it as this pack's own agent notes.

**Decision memory.** Before proposing a change to architecture, dependencies,
conventions, or distribution, read [`docs/adr/INDEX.md`](docs/adr/INDEX.md).
Do not contradict an Accepted ADR silently — surface it, cite the ADR,
and ask. A reversal produces a superseding ADR, by the human, on
purpose. New decisions that meet the bar in the index land as an ADR in
the same PR.

## Support

- **Support / publisher contact:** kensaurus@gmail.com
  (`.claude-plugin` marketplace email).
- Listings and "do not submit" tables: [docs/DISTRIBUTION.md](docs/DISTRIBUTION.md).
