# 0013. Rename cursor-kenji to kensaurus/skills, plugin `kenji`

Status: Accepted            Date: 2026-10-01

## Context

The pack installs into Claude Code, Cursor, Codex CLI, and Gemini CLI
(ADR-0001), but its name said Cursor. Most installs and searches now come from
tool-neutral channels, and "CURSOR" has a pending trademark application by
Anysphere. On the skills.sh leaderboard the dominant pattern is `<owner>/skills`
(anthropics/skills, vercel-labs/skills, mattpocock/skills), and `agent-skills`
is the largest GitHub topic (27.8k repos) while `cursor-skills` has 279.

A pack name is five identifiers that need not match: the GitHub repo, the npm
package, the Claude marketplace `name`, the plugin `name` (also the slash
namespace), and the CLI command.

## Decision

- Repo `kensaurus/skills`; npm `@kensaurus/skills` from 2.0.0; marketplace and
  plugin `kenji` (install `kenji@kenji`, namespace `/kenji:`); command `kenji`.
  Prose brand: **kenji**.
- Breaking release **2.0.0**, because the plugin ID and slash namespace change.
- `marketplace.json` carries `"renames": { "cursor-kenji": "kenji" }` so
  existing plugin installs migrate (Claude Code 2.1.193+). Keep it forever;
  the map is append-only history.
- The installer migrates its own footprint: the managed completion-gate entry
  is matched under `cursor-kenji-hooks/` or `kenji-hooks/` and replaced, and an
  orphaned `cursor-kenji-hooks/` holding only the gate script is removed.
  `--restore` reads `.kenji-backups/`, then the legacy `.cursor-kenji-backups/`.
  A pre-2.0.0 upgrade case lives in `scripts/test-install.mjs`.
- Old env names keep working (`CURSOR_KENJI_GATE_STATE_DIR`,
  `CURSOR_KENJI_DIR`) beside the new ones. The gate's counter folder keeps its
  ADR-0012 path `~/.cache/cursor-kenji/completion-gate/`: it is internal, and
  moving it would reset live budgets for no user benefit.
- `@kensaurus/cursor-kenji` gets a final 1.41.0 whose only job is to forward the
  `cursor-kenji` command to `kenji`, and is then deprecated with a pointer. The
  new package does not claim the `cursor-kenji` command.
- History stays as written: past CHANGELOG entries, ADRs 0001–0012, and
  `docs/examples/plan-audits/cursor-kenji/`.
- Never create a repo named `cursor-kenji` again; it would break GitHub's
  redirect for every old link and clone.

## Rejected

- **Keep the marketplace name `cursor-kenji`** (rename only the plugin).
  Existing users would migrate silently, but "cursor" would stay in every
  install ID forever.
- **`agent-skills` as the marketplace name.** Reserved by Claude Code for
  Anthropic's own marketplace.
- **Unscoped npm names** (`kenji` is taken; `kenji-skills` was free). The scope
  keeps the package next to the owner's other packages and matches the repo.
- **A descriptive name without the brand** (`vibe-playbooks`). It discards the
  install history and recognition the kenji name already has.

## Consequences

- Claude plugin users who want the clean ID re-add the marketplace once (README
  "Upgrading from cursor-kenji").
- skills.sh keys listings by `owner/repo`; the old listing and its install
  count move only through a request on vercel-labs/skills.
- npm trusted publishing must be configured for `@kensaurus/skills` after its
  first publish.
