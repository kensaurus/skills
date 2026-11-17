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

**Status:** **Live** — https://www.skills.sh/kensaurus/skills, 3.7K installs (checked 2026-11-17). The old `/kensaurus/cursor-kenji` URL now redirects there. The page still lists 33 retired skill names; a follow-up on [vercel-labs/skills#2352](https://github.com/vercel-labs/skills/issues/2352) (2026-11-17) asks for them to be dropped. New skills (`kenji`, `workflow-mobile-native-uiux`) appear on the page after their first install through `npx skills add`.

---

## 3. awesome-cursorrules

**URL:** https://github.com/PatrickJS/awesome-cursorrules

**How:** Open a PR adding kenji to the Directories section.

**PR copy:**
```markdown
- [kensaurus/skills](https://github.com/kensaurus/skills) — ready-made AI playbooks your editor auto-triggers: 162 agent skills,
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

**Status:** **Live** — `@kensaurus/skills@2.8.1`, published 2026-11-17 (the `/kenji` router, install profiles, Antigravity target, model-neutral skill text, trigger evals, animated walkthroughs; ADR-0016 and ADR-0017). Previous: `2.7.0` live 2026-10-19 (Claude Code desktop Notification hook, status line and skill-listing budget from the installer; skill writing pass per the 2026-10 authoring guidance, ADR-0015). Not tagged or released yet. Previous: `2.6.0` live 2026-10-11; `2.5.0`, `2.4.0`, `2.3.0`, `2.2.0` live 2026-10-06.

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
> 162 Cursor agent skills for React/Next.js/Supabase — installs in one command.

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

**Community catalog (separate):** https://claude.ai/directory/manage (parked: it needs a paid plan on a personal account; run `claude plugin validate . --strict` first; the older https://platform.claude.com/plugins/submit form is superseded) — public GitHub URL. Review pins a SHA into `anthropics/claude-plugins-community`. **Not listed** until that catalog shows `kenji`. Do not treat local marketplace install as official listing.

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

## Launch posts

Published 2026-11-17: [note](https://note.com/kensaurus/n/nef10cbeb3b1f) (3,948 characters) and [X](https://x.com/sakuramotokenji/status/2122553394279964837). [Zenn](https://zenn.dev/kensaurus/articles/204fa193b93031) ([source](articles/completion-gate.ja.md)), published the same day. Hacker News and Reddit: none yet. The facts, the rules of each channel, the objections to answer, and an order of work are in [LAUNCH-KIT.md](LAUNCH-KIT.md). Write each post yourself: Hacker News requires text written by a person, and several subreddits remove AI-written posts.

---

## 17. Listings found 2026-11-17

| Channel | What it needs | Status |
|:--------|:--------------|:-------|
| [github/awesome-copilot external plugins](https://github.com/github/awesome-copilot/blob/main/CONTRIBUTING.md#adding-external-plugins) (the built-in marketplace in VS Code, Copilot CLI and the Copilot app) | The issue form, a root Agent Plugins `plugin.json`, a release tag and commit SHA, a clean `vally lint`. No star gate | Submitted after the v2.8.1 tag. Find the issue with `gh issue list -R github/awesome-copilot --author kensaurus --state all` |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | The web issue form, filled in by a person; submissions through the `gh` tool or a PR are refused | Owner step |
| claudemarketplaces.com, claudepluginhub.com | Sign in with GitHub and paste the repo URL; both also crawl `marketplace.json` repos | Owner step (a new sign-in on each site) |
| [hashgraph-online/awesome-ai-plugins](https://github.com/hashgraph-online/awesome-ai-plugins), [BehiSecc/awesome-claude-skills](https://github.com/BehiSecc/awesome-claude-skills) | One line in the README by PR | See open PRs: `gh search prs --author kensaurus --state open kenji` |
| OpenAI plugin directory, Antigravity plugin marketplace, ComposioHQ/awesome-claude-skills | n/a | Skip for now: limited to selected publishers, vendor-led, and 1,666 unmerged PRs respectively |

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
