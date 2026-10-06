# Contributing to kenji

Thanks for wanting to improve this toolkit. Every contribution — a better skill description, a new command, a bug fix, or a new MCP config — helps everyone who uses Cursor.

---

## Quick Links

- [Full contribution guide](docs/CONTRIBUTING.md) — detailed instructions for adding skills, commands, and rules
- [Skill catalog](docs/CATALOG.md) — full reference with all trigger phrases
- [AGENTS.template.md](docs/AGENTS.template.md) — copy to consumer projects as root `AGENTS.md`
- [Open an issue](https://github.com/kensaurus/skills/issues) — report a bug or request a skill

---

## What You Can Contribute

| Type | Where | Description |
|:-----|:-------|:------------|
| **Skill** | `skills/<name>/SKILL.md` | A new agent capability with trigger keywords |
| **Cursor Skill** | `skills-cursor/<name>/SKILL.md` | IDE-specific extension (hooks, canvas, rules) |
| **Command** | `commands/<name>.md` | A slash command workflow |
| **Rule** | `rules/` | A project-level AI guidance file (`.mdc`) |
| **MCP config** | `mcp/` | A new MCP server template |
| **Subagent** | `agents/<name>.md` | An autonomous background agent |
| **Shell alias** | `shell-aliases/` | A terminal productivity helper |

---

## The 30-Second Workflow

```bash
# 1. Fork & clone
git clone https://github.com/<you>/skills.git
cd skills

# 2. Create your skill
mkdir -p skills/my-new-skill
# Write skills/my-new-skill/SKILL.md (see template below)

# 3. Verify skill count
npm run check:skills

# 4. Run full test gate (spec + secrets + MCP pins + install smoke)
npm run test
# Add an entry to docs/CATALOG.md + docs/TRIGGER-CHEATSHEET.md
# (README skill index is generated: npm run gen:skill-index)
# After a batch of skills, run audit-skill-conflicts in Cursor

# 5. Commit + PR
git checkout -b feat/my-new-skill
git add .
git commit -m "feat(skills): add my-new-skill"
git push origin feat/my-new-skill
# Open a PR — description template is pre-filled
```

---

## Skill File Template

Every skill is a `SKILL.md` with YAML frontmatter:

```markdown
---
name: my-skill-name
description: >
  One-sentence summary. Use when the user mentions "keyword1", "keyword2",
  or asks to "do specific task". Trigger: mentions of X, Y, Z.
---

# My Skill Name

Brief purpose statement.

**Degree of freedom: MIXED.** What is judgment `[HIGH freedom]`; what must run exactly `[LOW freedom]`.

## When to Use

- Trigger phrase 1
- Trigger phrase 2

## Steps

1. Step one
2. Step two

## Worked example

> Illustrative: one input, the classification, and the action taken.

## Self-critique before reporting

- [ ] Check 1
- [ ] Check 2

## Related Skills

- `other-skill` — how it complements this one
```

A skill whose name starts with a family prefix (`audit-`, `plan-`, `data-`, `workflow-`, …) fails `npm test` without the **Degree of freedom** line, `## Worked example`, and `## Self-critique`. Every skill's `description` also counts toward a fixed skill-listing budget ([ADR-0010](docs/adr/0010-measure-the-skill-listing-like-the-client.md)). If a new skill pushes it over, shorten descriptions or mark a user-only ritual `disable-model-invocation: true`; never raise the cap.

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for the full quality checklist.

---

## Style Rules

- **Names:** `lowercase-hyphen` only — `data-pipeline`, not `DataPipeline`
- **TypeScript:** strict, no `any` without a justification comment
- **No placeholders:** every code example must be copy-pasteable and run
- **Trigger keywords:** description must include at least 3 natural-language triggers so Cursor auto-selects the skill correctly
- **No duplicate skills:** check `docs/CATALOG.md` before creating a new skill

---

## Code of Conduct

Be kind. Criticism of the skills is welcome; personal criticism is not. See [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## Questions?

Open an issue or start a Discussion. PRs with any improvement — even a typo fix — are welcome.
