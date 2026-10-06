# Attribution — thirdparty-ui-ux-pro-max

| Field | Value |
|-------|-------|
| **Upstream** | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| **Install tool** | [uipro-cli](https://www.npmjs.com/package/uipro-cli) (`npx uipro-cli init --ai cursor`) |
| **License** | MIT |
| **Local name** | `thirdparty-ui-ux-pro-max` |
| **Curated in** | [kensaurus/skills](https://github.com/kensaurus/skills) |

## Bundled assets

This skill includes upstream `data/` CSV databases and `scripts/search.py` (Python 3.x required).

## Update policy

1. In a temp directory: `npx uipro-cli@latest init --ai cursor`
2. Copy `data/` and `scripts/` from the generated `.cursor/skills/ui-ux-pro-max/`.
3. Merge `SKILL.md` changes; preserve `thirdparty-` prefix, attribution, and script paths pointing to `~/.cursor/skills/thirdparty-ui-ux-pro-max/`.
4. Run `./install.sh` or `cursor-sync`.

Do **not** add Kenji-specific "Check Existing First" sections to upstream content.
