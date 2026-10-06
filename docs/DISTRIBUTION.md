# Distribution & discovery

Where kenji is published and how users find it.

> **Renamed in 2.0.0.** `kensaurus/cursor-kenji` (npm `@kensaurus/cursor-kenji`, plugin
> `cursor-kenji@cursor-kenji`) became `kensaurus/skills` (npm `@kensaurus/skills`, plugin
> `kenji@kenji`). Old GitHub URLs redirect; never create a repo named `cursor-kenji` again or the
> redirect breaks. Why and what was rejected: [ADR-0013](adr/0013-rename-to-kensaurus-skills.md).

## Install (always works)

| Channel | Command |
|---------|---------|
| **npm** (full pack) | `npx @kensaurus/skills --all` |
| **skills.sh** (skills only) | `npx skills add kensaurus/skills` |
| **Clone (four tools)** | `git clone … && node bin/install.mjs --all` |
| **Clone (Cursor + Claude)** | `git clone https://github.com/kensaurus/skills.git && cd skills && ./install.sh` |
| **Claude Code plugin** | `/plugin marketplace add kensaurus/skills` then `/plugin install kenji@kenji` |

`npx skills add --all` is **not** the same as `npx @kensaurus/skills --all`. The skills CLI `--all` means “every skill to every detected agent”. The kenji installer `--all` means Cursor + Claude Code + Codex + Gemini, including slash commands.

Current npm version: see [npm package page](https://www.npmjs.com/package/@kensaurus/skills) or `npm view @kensaurus/skills version`.

## Official listings

| Directory | URL | Status |
|-----------|-----|--------|
| **npm** | https://www.npmjs.com/package/@kensaurus/skills | **Live** — 2.0.0 published 2026-10-01 by the maintainer (no provenance for this release; configure the trusted publisher so CI publishes with provenance from 2.0.1) |
| **npm (old name)** | https://www.npmjs.com/package/@kensaurus/cursor-kenji | Versions ≤1.40.1 **deprecated** 2026-10-01. Final 1.41.0 forwards the `cursor-kenji` command to `kenji` (verified from the registry); its own deprecation is pending an owner 2FA run (`npm deprecate @kensaurus/cursor-kenji@1.41.0 … --prefer-online`) |
| **GitHub** | https://github.com/kensaurus/skills | Source of truth. Renamed from `cursor-kenji` on 2026-10-01; old URLs redirect |
| **Cursor Marketplace** | https://cursor.com/marketplace | **Not listed.** Publisher application submitted 2026-09-09 (awaiting Cursor review) |
| **Claude Code plugin (this repo)** | `/plugin marketplace add kensaurus/skills` | Installable from the public GitHub repo. Existing `cursor-kenji` installs migrate through the `renames` map. **Not** in Anthropic’s community catalog until they accept a submit |
| **Claude community marketplace** | https://platform.claude.com/plugins/submit | **Not submitted until this commit is on `main`.** Validate locally with `claude plugin validate .` |
| **cursor.directory** | https://cursor.directory/plugins/cursor-kenji | Page exists but **flagged / hidden** (`noindex`). Description updated 2026-09-09; full re-scan hit HTTP 413 |
| **skills.sh** | https://www.skills.sh/kensaurus/skills | **Live** 2026-10-01 (first install from the new name). Listing merge requested: [vercel-labs/skills#2352](https://github.com/vercel-labs/skills/issues/2352) |
| **skills.sh (old name)** | https://www.skills.sh/kensaurus/cursor-kenji | Old listing (3.4K installs on 2026-10-01) until #2352 merges it; stale [#1499](https://github.com/vercel-labs/skills/issues/1499) closed |
| **SkillsMP** | https://skillsmp.com/creators/kensaurus/cursor-kenji | **Live crawl** under the old slug (the new `/creators/kensaurus/skills` 404s until SkillsMP re-crawls; checked 2026-10-01) — pack page (they report 153 skills; our ratchet is 155). No submit form |
| **LobeHub** | https://lobehub.com/skills/kensaurus-cursor-kenji-backend-patterns | **Live crawl** of individual skills (no pack page) |
| **AgenticSkills catalog** | https://agenticskills.io/submit | Form accepted 2026-09-09; **not listed** yet. Review issue URL is not publicly resolvable |
| **awesome-cursorrules** | https://github.com/PatrickJS/awesome-cursorrules | [PR #320](https://github.com/PatrickJS/awesome-cursorrules/pull/320) **open**; entry updated to kensaurus/skills 2026-10-01 |
| **VoltAgent awesome-agent-skills** | https://github.com/VoltAgent/awesome-agent-skills | Listed via merged [PR #1034](https://github.com/VoltAgent/awesome-agent-skills/pull/1034) (old name); rename update [PR #1133](https://github.com/VoltAgent/awesome-agent-skills/pull/1133) **open** |
| **awesome-cursor-skills** | https://github.com/spencerpauly/awesome-cursor-skills | [PR #72](https://github.com/spencerpauly/awesome-cursor-skills/pull/72) **open**; entry updated to kensaurus/skills 2026-10-01 |
| **Agent Skills spec** | https://agentskills.io | Spec + client showcase only — **not a skill catalog**. [Issue #432](https://github.com/agentskills/agentskills/issues/432) closed with no listing |
| **Official MCP Registry** | https://registry.modelcontextprotocol.io/ | **Do not submit** — this pack ships MCP *templates*, not an MCP server ([registry about](https://modelcontextprotocol.io/registry/about)) |
| **Skills Directory** | https://www.skillsdirectory.com/submit | Not listed; their GitHub OAuth (Supabase) returned HTTP 402 egress quota 2026-09-09 |
| **explainx.ai** | https://explainx.ai/submit | Submitted 2026-09-09; **pending review** (not live) |
| **Awesome Skills** | https://awesomeskill.ai/ | No public submit form; no listing found |
| **Enterprise DNA Skills dir** | https://enterprisedna.co/directories/submit | Older notes claimed a submit — **not re-verified** 2026-09-09 |

Track submission URLs and review status in [PROMOTION.md](PROMOTION.md).

## Machine-readable index

- **[llms.txt](../llms.txt)** — AI/crawler map of canonical docs
- **[skills.sh.json](../skills.sh.json)** — groups the live skills.sh repo page ([docs](https://www.skills.sh/docs/customize))
- **[docs/CATALOG.md](CATALOG.md)** — full skill list + trigger phrases
- **[docs/TRIGGER-CHEATSHEET.md](TRIGGER-CHEATSHEET.md)** — quick lookup

## What gets installed

### By install channel

| Channel | Cursor skills | Claude Code | Commands | Agents | Rules | Completion hook | MCP config |
|---------|:------:|:-----------:|:--------:|:------:|:-----:|:---------------:|:----------:|
| `npx skills add kensaurus/skills` | Yes (project `.agents/skills` by default; `-g` → `~/.cursor/skills`) | only with `-a claude-code` | No | No | No | No | No |
| `npx @kensaurus/skills` (`--claude` / `--all` / `--auto`) | Yes | Yes (`--claude` / `--all` / `--auto`) | Yes | Yes | Yes | Cursor + Claude Code | Template copy if missing |
| `./install.sh` (clone) | Yes | Yes | Yes | Yes | Yes | Cursor + Claude Code | Template copy if missing |
| Cursor Marketplace / cursor.directory | Yes | No | Yes | Yes | Yes | Plugin stop hook (`hooks/cursor-hooks.json`) | `.mcp.json` at repo root |
| Claude Code `/plugin marketplace add kensaurus/skills` | No | Yes (plugin-namespaced skills) | Yes | Yes | No | Plugin Stop hook (`hooks/hooks.json`) | No |

Use one Claude Code channel for the completion hook: the plugin's Stop hook
and the one `--claude` merges into `~/.claude/settings.json` run the same
gate, so installing both blocks twice per stop and halves the loop cap.

Re-check a kenji install without writing: `npx @kensaurus/skills --verify` (add `--all` to include Claude/Codex/Gemini dests). Extra personal files are allowed; missing or hash-mismatched packaged files fail.

The installer merges into:

- `~/.cursor/skills/` and `~/.agents/skills/` — agent skills (runtime)
- `~/.cursor/commands/` — slash commands
- `~/.cursor/agents/` — subagents
- `~/.cursor/hooks.json` + `~/.cursor/kenji-hooks/` — safely merged (2.0.0+ migrates a pre-2.0.0 `cursor-kenji-hooks/`)
  opt-in completion gate; inert unless a closure state file has actionable
  unchecked items
- `~/.claude/skills/`, `~/.claude/commands/`, `~/.claude/agents/`, `~/.claude/rules/` — Claude Code (`npx @kensaurus/skills --claude` or `./install.sh --claude`; `.mdc` rules installed as `.md`); `~/.claude/settings.json` gets the same completion Stop hook, merged

Claude Code 2.1.139+ provides the equivalent independent continuation evaluator
through `/goal`; the `complete-everything` skill includes the recommended goal
condition.

MCP templates live in the repo under `mcp/` — copy `mcp/mcp.json.template` to `~/.cursor/mcp.json` and set `FIRECRAWL_API_KEY`, `CONTEXT7_API_KEY`, `SUPABASE_ACCESS_TOKEN`, and `SUPABASE_PROJECT_REF` in the environment. Slack/Notion in the full template still use `YOUR_*`. See [mcp/README.md](../mcp/README.md).

## Maintainer release path

See [PUBLISHING.md](PUBLISHING.md) — GitHub Release → OIDC npm publish (no token required).
