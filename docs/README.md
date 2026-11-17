# Documentation index

Quick map of `docs/` — start with [GETTING-STARTED.md](GETTING-STARTED.md) if you're new to Cursor.

| File | Purpose |
|:-----|:--------|
| [GETTING-STARTED.md](GETTING-STARTED.md) | First-time install, typical session, first phrases |
| [CATALOG.md](CATALOG.md) | Full skill/command reference + highest-impact composition patterns |
| [TRIGGER-CHEATSHEET.md](TRIGGER-CHEATSHEET.md) | "Say X → skill Y" lookup table |
| [PLAN-LOOPS.md](PLAN-LOOPS.md) | How to chain the 23 `plan-*` skills (grouped loops) |
| [THIRD-PARTY-SKILLS.md](THIRD-PARTY-SKILLS.md) | Vendored upstream skills (`thirdparty-*`), attribution, update policy |
| [AGENTS.template.md](AGENTS.template.md) | Project constitution template (mission / stack / roadmap / agent discipline) |
| [MODEL-AND-EFFORT.md](MODEL-AND-EFFORT.md) | Default model per host, how to set effort, the pack's effort routing table, what changed for Opus 5.5 |
| [examples/](examples/) | Sample `plan-*.md` audit outputs |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Skill authoring, validation, PR expectations |
| [PROMPT-ENHANCEMENT-PLAYBOOK.md](PROMPT-ENHANCEMENT-PLAYBOOK.md) | T1–T8 prompt craft via `enhance-skill-prompts` (how a skill instructs, not what it does; T7 = effort declaration, T8 = volume and shape) |
| [PROMOTION.md](PROMOTION.md) | Checklist for listing on skills.sh, cursor.directory, Claude plugin, etc. |
| [DISTRIBUTION.md](DISTRIBUTION.md) | Install surfaces, directory listings, discovery links |
| [PUBLISHING.md](PUBLISHING.md) | Maintainer release guide (OIDC npm publish) |
| [HOUSEKEEP-REPORT.md](HOUSEKEEP-REPORT.md) | Historical (1.4.2 / 2026-06-24) — not current install truth |
| [PLAN-SKILL-PACK-ENHANCEMENT.md](PLAN-SKILL-PACK-ENHANCEMENT.md) | Historical executed plan (94-skill inventory) |

Repo root also has [README.md](../README.md) (install + overview + capability cards), [llms.txt](../llms.txt) (AI/crawler index), and [CHANGELOG.md](../CHANGELOG.md). `.github/` holds [SECURITY.md](../.github/SECURITY.md) (secrets + MCP hygiene) and [CONTRIBUTING.md](../.github/CONTRIBUTING.md) (short form). Screenshot sources for the README hero/tour live in [screenshots/](screenshots/).

**Skill count:** run `npm run check:skills` — the number in README, `package.json`, and this catalog is derived from `skills/*/SKILL.md`, not hand-edited.

**Third-party skills:** directories prefixed `thirdparty-*` are upstream-maintained — see [THIRD-PARTY-SKILLS.md](THIRD-PARTY-SKILLS.md) before editing.
