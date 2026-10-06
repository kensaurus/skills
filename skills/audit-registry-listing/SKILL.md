---
name: audit-registry-listing
description: >
  Read-only audit of where a repo is found: README first screen, npm/PyPI
  metadata and tarball, GitHub topics, social preview, plugin manifests. Use
  when "audit our npm listing", "README as landing page", or "why nobody finds
  the package". Fix → enhance-readme.
license: MIT
effort: high
---

# audit-registry-listing — The registry is the landing page

**Degree of freedom: MIXED.** What the first screen should say
`[HIGH freedom]`; the metadata checklist and the tarball check
`[LOW freedom — run exactly]`.

Read-only. For a package, plugin, skill pack, or CLI, discovery happens in a
registry and the README's first ten lines are the hero. This skill checks
every surface a stranger sees before the repo, reports gaps with evidence,
and hands fixes to the owning skills.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-registry-listing** (this) | Findings on README hero, registry metadata, GitHub surface, manifests, install path |
| `enhance-readme` | Hero image, tour grid, screenshots — the fix |
| `docs-writer` | README prose, quickstart wording |
| `deploy-npm` | The publish itself; `files`/`publishConfig` changes ship through it |
| `plan-aso` | App Store / Play listings |
| `enhance-web-seo` | The website, not the registry |
| `plan-dependency-provenance` | Whether *dependencies* are real — not this package's listing |

Do **not** fire for "make the README prettier" → `enhance-readme`.

## How to reason

1. **Surface** — which registry or page does a stranger hit first for this repo?
2. **Ten lines** — can they say what it is, for whom, and how to install, before scrolling?
3. **Metadata** — does the registry card (name, description, keywords, homepage, repo, license) say the same thing?
4. **Tarball** — does the published artifact contain what the README promises and nothing it should not?
5. **Path** — install to first success in under a minute, on a clean machine?

## Worked example

> **Surface:** npm page + skills.sh card + GitHub repo.
> **Ten lines:** README opens with a logo and a count ("145 skills · 57 commands"); the outcome appears in paragraph 3.
> **Metadata:** npm description repeats the count; GitHub description empty; 4 topics; no social preview; `homepage` points at skills.sh (good).
> **Tarball:** `npm pack --dry-run` shows `docs/screenshots/` (12 MB) shipping; `llms.txt` present.
> **Path:** `npx @kensaurus/skills --all` works; first-run message tells the user to restart Cursor — good.
> **Findings:** hero leads with counts (major → `enhance-readme`/`docs-writer`); GitHub description + preview missing (minor → repo settings); screenshots bloat the tarball (minor → `deploy-npm` `files`).

## Self-critique before reporting

- **Evidence** — every finding quotes the line, field, or `npm pack` output
- **Stranger test** — the ten-line verdict comes from a fresh-context subagent given only the README's first ten lines and the registry card, nothing else from the repo; this is the one place delegation pays here, because once you have read the repo your own read is no longer a stranger's
- **No fixes applied** — findings and owners only
- **Right owner** — visuals → `enhance-readme`; prose → `docs-writer`; `files` → `deploy-npm`; store → `plan-aso`

---

## Checklist  [LOW freedom — run exactly]

### A · README first screen
- Line 1–10: name, one outcome sentence (not a count), who it is for, install one-liner, one screenshot or terminal GIF.
- Badges: version, license, one live proof (installs/downloads); no broken or stale badges.
- Quickstart to first success ≤ 5 steps; a "what it is not" line.

### B · Registry metadata (npm / PyPI / crates / gems)
- `name`, `description` (outcome-first, ≤ 140 chars), `keywords` (the queries people type), `homepage`, `repository`, `bugs`, `license`, `engines`.
- README rendered on the registry equals the repo README (or a deliberate short version).
- `npm pack --dry-run` / `python -m build` listing: everything promised present; no `.env*`, keys, screenshots, tests, or 10 MB+ assets unless intended; `files` whitelist present.
- `bin` names match the README; `npx <pkg>` runs without a global install.
- Provenance / trusted publishing badge if available.

### C · GitHub surface
- Repo description (outcome, ≤ 120 chars), website URL, ≥ 5 topics that match the keywords, social preview image set (1280×640), releases with notes, pinned issue or discussion for feedback, `SECURITY.md`, license detected.

### D · Ecosystem manifests
- skills.sh / Cursor / Claude / Codex / Gemini plugin manifests: version in sync with the package, description in sync, install command correct on each surface, listing status honest (submitted ≠ listed).
- MCP registry only if the repo ships a runnable server.

### E · Install path
- On a clean profile (temp HOME): install one-liner → first successful action; note every prompt, restart, or missing-key stop; time it.

## Report template

```markdown
# Registry Listing Audit — <package>

## Surfaces checked
| Surface | URL | Fetched |

## Ten-line verdict (stranger read)
What it is: … · For whom: … · How to install: … · Missing: …

## Findings
| # | Surface | Gap | Evidence | Sev | Owner skill |

## Tarball
`npm pack --dry-run` — N files, X MB; unexpected: …

## Install path
Steps … · Time … · Stops …

## Handoff
`enhance-readme` (hero/screenshots) · `docs-writer` (prose) · `deploy-npm` (`files`, metadata) · repo settings (description, topics, preview)
```

## Guardrails

- **Read-only.** No README, manifest, or repo-settings edits here.
- **No count-led heroes.** Recommend the outcome sentence; counts go in a badge.
- **Honest listing status.** "Submitted" and "listed" are different words.

## Chains with

- **`plan-gtm`** → for repo-as-product, this is Phase 1 evidence.
- **`enhance-readme`** / **`docs-writer`** → apply the findings.
- **`deploy-npm`** → ship metadata and `files` fixes.
- **`docs-launch-kit`** → announce the refreshed listing.
