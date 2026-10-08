# Promotion Checklist

Checklist for external listings and launch copy. Repo-side requirements (plugin manifest, docs, npm OIDC) are done. External listings may take manual review.

**Do not invent “listed” status.** Live vs submitted vs login-blocked is in [DISTRIBUTION.md](DISTRIBUTION.md). Maintainer releases: [PUBLISHING.md](PUBLISHING.md).

**Human gates left (2026-09-09):** cursor.directory security-agent unflag (listing still `noindex`); Skills Directory submit is blocked by *their* Supabase auth (HTTP 402 egress quota); philipbankier / travisvn awesome lists need ≥10 GitHub stars. Cursor Marketplace + explainx + AgenticSkills are submitted and awaiting *their* review — not listed yet. Claude community catalog: submit at https://platform.claude.com/plugins/submit after this repo’s `.claude-plugin/` is on `main`.

---

## 1. cursor.directory

**URL:** https://cursor.directory/plugins/new

**What to fill in:**
- Repository URL: `https://github.com/kensaurus/skills`
- The site auto-detects skills from `skills/*/SKILL.md`, rules from `rules/`, agents from `agents/`, MCP config from `.mcp.json`
- No extra config needed — the repo structure matches the Open Plugins standard

**Status:** Page exists — https://cursor.directory/plugins/cursor-kenji — still **flagged / hidden** (`robots: noindex`, banner: “Hidden from the directory pending manual review”). Signed in with Google (`kensaurus@gmail.com`) 2026-09-09. Description, homepage (skills.sh), and keywords updated via **Edit your plugin** (POST `/plugins/cursor-kenji/edit` → 200). Component inventory on that page is still their older import (76 skills / 14 rules / 5 agents / 5 MCP). A full GitHub re-scan (234 components including skill bodies) was **rejected HTTP 413** — too large for their submit endpoint. Not discoverable in browse until they unflag it.

---

## 2. skills.sh listing

**URL:** https://skills.sh

**Install command already works (skills only — this is the skills.sh channel):**
```bash
npx skills add kensaurus/skills
```

Full pack (skills + slash commands): `npx @kensaurus/skills --all`. That CLI's `--all` is not the skills.sh `--all`.

**Issue opened:** https://github.com/vercel-labs/skills/issues/1499

**Status:** **Live** — https://www.skills.sh/kensaurus/skills (new page, created by a fresh install 2026-10-01). The old https://www.skills.sh/kensaurus/cursor-kenji (3.4K installs) stays until [vercel-labs/skills#2352](https://github.com/vercel-labs/skills/issues/2352) merges the listings and drops the retired skill names. Stale #1499 closed.

---

## 3. awesome-cursorrules

**URL:** https://github.com/PatrickJS/awesome-cursorrules

**How:** Open a PR adding kenji to the Directories section.

**PR copy:**
```markdown
- [kensaurus/skills](https://github.com/kensaurus/skills) — ready-made AI playbooks your editor auto-triggers: 161 agent skills,
  63 slash commands, 6 subagents, and MCP configs for React/Next.js/Supabase development.
  `npx skills add kensaurus/skills`
```

**Status:** [x] PR opened — https://github.com/PatrickJS/awesome-cursorrules/pull/320

---

## 4. npm publish

**Prerequisite:** npm account in the `@kensaurus` org.

**Preferred — Trusted Publishing (OIDC):** configured ✅

- Publisher: `kensaurus/skills` · workflow `npm-publish.yml` · permission `npm publish`
- Create a GitHub Release (tag `vX.Y.Z` matching `package.json`) → `.github/workflows/npm-publish.yml` publishes with `--provenance`

**Fallback — `NPM_TOKEN` secret:** optional; CI uses OIDC when the secret is unset.

**Verify at:** https://www.npmjs.com/package/@kensaurus/skills

**Status:** Pending — `@kensaurus/skills@2.5.0` (tarball 9.8 MB → 1.2 MB; README with architecture and pieces diagrams, section icons, real store listings). Previous: `2.4.0`, `2.3.0`, `2.2.0`, all approved 2026-10-06.

---

## 5. Cursor Marketplace (official)

**URL:** https://cursor.com/marketplace/publish

**Repo requirement:** [`.cursor-plugin/plugin.json`](../.cursor-plugin/plugin.json) at repo root ✅

Submit the GitHub repo URL; Cursor reviews manually.

**Status:** **Submitted, not listed.** Signed in with Google (`kensaurus@gmail.com`) via Cursor authenticator 2026-09-09. Publisher application sent from https://cursor.com/marketplace/publish (org/handle `kensaurus`, contact `kensaurus@gmail.com`, repo `https://github.com/kensaurus/cursor-kenji`). Confirmation page: “Thanks for applying” / they will follow up at marketplace-publishing@cursor.com. Do not treat as listed until a marketplace plugin page exists.

---

## 6. CursorList / Enterprise DNA directory

**URLs:**
- https://cursorlist.com
- https://enterprisedna.co/directories/submit (alternative submission form)

**One-liner description:**
> 161 Cursor agent skills for React/Next.js/Supabase — installs in one command.

**Status:** Re-checked 2026-09-09. cursorlist.com is a **`.cursorrules` dump**, not a skill-pack catalog. “Submit Rule” goes to a Youform for individual rule files. **Not submitted** — listing a 155-skill pack there would be the wrong category. Do not treat as listed.

---

## 7. agentskills.io

**URL:** https://agentskills.io

All skills validate against the [Agent Skills specification](https://agentskills.io/specification) in CI.

**Showcase request:** https://github.com/agentskills/agentskills/issues/432

**Status:** [x] Submitted — [Issue #432](https://github.com/agentskills/agentskills/issues/432) closed 2026-06-30 with no listing confirmation. Do not treat as listed.

---

## 8. AgenticSkills directory (not the spec site)

**URL:** https://agenticskills.io/submit

Different site from the Agent Skills *spec* at agentskills.io. Curated catalog (selected, not crawled).

**Submitted 2026-09-09** via the public form (name `cursor-kenji`, repo URL, category Web Development, author kenji, contact `kensaurus@gmail.com` from https://kensaur.us/yen-yen/privacy). UI said “Skill Submitted!” and linked https://github.com/Korona7x17/agenticskills/issues/158 — that issue URL returns **404** to the public GitHub API, so treat as **submitted, not listed**, until a public catalog page exists.

**Do not** use their “Submit MCP” form — this pack is MCP *templates*, not a server.

---

## 9. VoltAgent / awesome-agent-skills

**URL:** https://github.com/VoltAgent/awesome-agent-skills

**Status:** [x] PR opened — https://github.com/VoltAgent/awesome-agent-skills/pull/1034 (open 2026-09-09)

---

## 10. spencerpauly / awesome-cursor-skills

**URL:** https://github.com/spencerpauly/awesome-cursor-skills

**Status:** [x] PR opened — https://github.com/spencerpauly/awesome-cursor-skills/pull/72 (open 2026-09-09). Entry says we are **not** on Cursor Marketplace.

---

## 11. Skills Directory / explainx / Awesome Skills

| Site | Submit path | Status 2026-09-09 |
|------|-------------|-------------------|
| https://www.skillsdirectory.com/submit | GitHub OAuth (Supabase) | Sign-in attempted 2026-09-09. Their auth project returned **HTTP 402** (`exceed_egress_quota`). No listing (`/skills/kensaurus-cursor-kenji` is a 404 page). Retry after *they* restore Auth. |
| https://explainx.ai/submit | dashboard after magic link | **Submitted, pending review** (dashboard: Skills 1, live 0). Not publicly listed yet. |
| https://awesomeskill.ai/ | crawl + blog “submit to the directory” | No public submit form found. No search hit for this pack. |

---

## 12. philipbankier / awesome-agent-skills

**URL:** https://github.com/philipbankier/awesome-agent-skills

CONTRIBUTING requires **≥10 GitHub stars**. This repo had **9** on 2026-09-09. Do not open a PR until that bar is met.

---

## 13. MCP catalogs (do not submit)

Official MCP Registry, Smithery, mcp.so, PulseMCP, and AgenticSkills “Submit MCP” are for **MCP servers** (`server.json`, a runnable package or remote URL). This repo ships `mcp/*.json.template` only. Submitting would be false.

---

## 15. Claude Code plugin (this repo + community catalog)

**This repo is already a marketplace.** Users do not wait for Anthropic:

```
/plugin marketplace add kensaurus/skills
/plugin install kenji@kenji
```

Validate before any catalog submit:

```bash
claude plugin validate .
```

**Community catalog (separate):** https://platform.claude.com/plugins/submit — public GitHub URL. Review pins a SHA into `anthropics/claude-plugins-community`. **Not listed** until that catalog shows `kenji`. Do not treat local marketplace install as official listing.

---

## 16. Do not submit

| Surface | Why |
|---------|-----|
| Official MCP Registry / Smithery / mcp.so / PulseMCP / AgenticSkills “Submit MCP” | This pack ships MCP *templates*, not a server |
| cursorlist.com | `.cursorrules` dump, wrong category |
| ClawHub | Not a skill-pack catalog for this repo |
| **localskills `--target cursor`** | Writes `.cursor/rules/{slug}.mdc`, not Cursor skills. Wrong installer for this pack |
| travisvn / philipbankier awesome lists | Star gate (≥10). This repo had **9** on 2026-09-09 |
| cursor.directory full re-scan | Their endpoint returned HTTP 413 on a 234-component body |

---

## Launch copy drafts

### Show HN / technical post (preferred angle)

Do not lead with “143 skills”. Lead with the completion gate.

```
Title: Show HN: a completion gate that refuses “done” while unchecked work remains

Coding agents call the work done when the diff compiles. This pack’s
complete-everything loop writes a durable checklist, keeps going through
phase checkpoints, and a second agent (completion-judge) reads the tree
and the evidence — not the model’s confidence.

Install: npx @kensaurus/skills --all
skills.sh: https://www.skills.sh/kensaurus/skills
```

### Reddit (r/cursor, r/ClaudeAI) — short

```
Title: Playbooks that will not call a PR done

I got tired of agents skipping the interview, the failing test, and the
live check. kenji is installable playbooks: you say the job, a
named skill runs, and “done” has to survive a judge.
Skills declare effort for Opus 5.5: audits and plans at high, implementation
at the medium default, handoff at low.

npx @kensaurus/skills --all
https://github.com/kensaurus/skills
```

### X / Twitter

```
You say the job. The playbook runs.

Not a prompt paste-bin. A completion gate that keeps going until the
checklist is empty.

npx @kensaurus/skills --all
```

### Article outline (one piece, not a listicle)

```
Title: Agents lie about “done.” Make them prove it.

1. The gap: 3.6k npm downloads, almost no stars — people install, they don’t bookmark
2. What a completion gate actually checks (state file, not vibes)
3. One session: grill → spec → failing test → PR → judge
4. Install paths (npm / skills.sh / Claude plugin) and what each omits
5. What this pack is not (hosted app, MCP server, Marketplace-listed)
```

---

## 14. Cross-promote via Mushi Mushi

Mushi Mushi's README already mentions kenji skills:
> "Install Mushi skills in your Cursor or Claude Code project"
> `npx skills add kensaurus/mushi-mushi`

Reciprocal links are live in kenji's README ("More from KENSAURUS" section).

**Optional:** Add a note to Mushi's GitHub Issues template pointing users to kenji's `debug-sentry-monitor` skill for Sentry triage from Cursor.

**Status:** [x] Done (reciprocal links live)

---

## Post-launch tracking

- Watch GitHub stars (badge in README)
- Watch npm download count: https://www.npmjs.com/package/@kensaurus/skills
- Check skills.sh install count (if they expose it)
- Monitor GitHub Issues for user feedback
- Directory status table: [DISTRIBUTION.md](DISTRIBUTION.md)
