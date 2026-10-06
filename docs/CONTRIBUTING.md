# Contributing to kenji

Guide for adding, updating, and maintaining skills and commands.

---

## Adding a New Skill

### 1. Create the Directory

```bash
mkdir -p skills/my-skill-name
```

Naming: family-first `<family>-<topic>`, lowercase, hyphens only. Family is
**stance / lifecycle** (when you reach for it), not the subject. Slash
commands may drop the family (`/doctrine` → `audit-doctrine`) or keep it
when it is the distinctive word (`/housekeep-gates`).

| Prefix | Purpose |
|:-------|:--------|
| `audit-` | Findings; default present-then-stop. Audit-and-fix exceptions: `audit-responsive`, `audit-code-quality`, `audit-performance`, `audit-security`, `audit-i18n`, `audit-bundle-size` |
| `plan-` | Audit + burndown — **no edits until the user approves** |
| `backend-` | Server-side patterns (DB, observability, realtime) |
| `data-` | Pipelines, ETL, visualization |
| `debug-` | Reproduce → isolate → fix failures |
| `deploy-` | Release, publish, post-deploy verify |
| `design-` | Create new visual/API surfaces |
| `docs-` | Write or co-author documentation |
| `enhance-` | Improve existing web/mobile UI, UX, SEO, readability, email deliverability |
| `housekeep-` | Apply-now consolidation of **one** drifted register (gates / backlog / design tokens / dead code) |
| `iterate-` | Close the loop after launch (post-launch feedback, agent-harness iteration) |
| `meta-` | Skills and MCP authoring |
| `mobile-` | React Native, Capacitor, emulator |
| `protocol-` | Session guardrails used by other skills |
| `test-` | QA, unit tests, load, visual regression |
| `workflow-` | Multi-phase process (git, refactor, PR, spec-TDD, housekeep-the-repo) |

`workflow-housekeep` stays in `workflow-` — it is a multi-phase repo cleanup,
not one-register consolidation. That is why "housekeep" appears at the
**front** on `housekeep-gates` / `housekeep-backlog` / `housekeep-design` /
`housekeep-dead-code` and at the **back** on `workflow-housekeep`.

**Documented unprefixed exceptions** (do not rename without a dedicated
migration):

| Name | Why it stays unprefixed |
|:-----|:------------------------|
| `research` | User-invoked protocol; `/research` is the picker entry |
| `handoff` | `disable-model-invocation: true` — only `/handoff` matters |
| `complete-everything` | Stop hook + `.cursor/complete-everything-state.md` are path-coupled |
| `burndown-full` | Stop hook + `.cursor/burndown-state.md` are path-coupled |

Examples: `audit-performance`, `backend-realtime`, `mobile-rn-screen`.

**Third-party / upstream skills** use the `thirdparty-` prefix (e.g. `thirdparty-emil-design-eng`). Each must include:

- `ATTRIBUTION.md` with upstream URL, license, and update policy
- A **Source** footer in `SKILL.md` pointing to upstream
- A callout block after the title: `> **Third-party skill** (upstream-maintained)`

Do not mix Kenji "Check Existing First" sections into third-party skill bodies — keep them faithful to upstream; wrap only with attribution metadata.

### 2. Create SKILL.md

Every skill needs a `SKILL.md` with YAML frontmatter:

````markdown
---
name: my-skill-name
description: Clear description with trigger words. Use when user mentions "keyword1", "keyword2", or wants "specific task".
license: MIT
effort: high   # Claude Code only — high for audit/plan/judge/security/debug, low for mechanical work; delete the line for ordinary implementation (medium default)
---

# My Skill Name

One-line purpose.

## Check existing first

Look for what already exists before adding anything:

1. **Check for existing patterns:**
```bash
rg "relevant-pattern" --type ts
ls -la relevant/directories/ 2>/dev/null
```

**Why:** [Reason not to duplicate]

## Core Content

### Pattern 1
[Code examples, explanations]

### Pattern 2
[Code examples, explanations]

## Related Skills

- `skill-a` — How it relates
- `skill-b` — How it relates

## Validation

After using this skill:

1. **Check 1** → What to verify
2. **Check 2** → What to verify
3. **Check 3** → What to verify
````

### 3. Quality Checklist

Every **first-party** (Kenji-authored) skill MUST have:

- [ ] **Frontmatter** with `name` and `description` (include trigger keywords)
- [ ] **"Check Existing First"** section at the top (skip for `thirdparty-*`)
- [ ] **Production-ready code examples** (no placeholders)
- [ ] **TypeScript** in all code examples (strict, no `any`)
- [ ] **Related Skills** section for cross-referencing
- [ ] **Validation** section with post-implementation checks
- [ ] **Effort declared** where the medium default is wrong: `effort: high` for judgment (audit, plan, judge, security, architecture, debug), `effort: low` for mechanical or read-only work (inventory, formatting, handoff). Claude Code reads it; Cursor ignores it. User-only rituals add `disable-model-invocation: true`; reference-only skills add `user-invocable: false`
- [ ] **Prompt enhancement (T1–T8)** — freedom declared, one classification contract (what counts as a finding, not how to think), one worked example labeled illustrative, an evidence rubric (not a generic self-check), effort declared, normal volume; see [PROMPT-ENHANCEMENT-PLAYBOOK.md](PROMPT-ENHANCEMENT-PLAYBOOK.md) / `enhance-skill-prompts` (existing skills) or `meta-skill-creator` (new)

### 4. Description Guidelines

The `description` field is critical — it's how Cursor decides when to use the skill.

**Rules:**
- Open with an action verb (`Fix`, `Wire`, `Build`, `Audit`, `Release` …)
- Keep ≤320 characters (same folding as `scripts/validate-skills.mjs`) — every description rides in every request, ~168 of them, so each character is always-on context
- Include 3-6 trigger keywords/phrases users actually type
- Never write "This skill provides…" or "This skill should be used when…"
- No AI-tells: avoid `leverage`, `seamless`, `robust`, `powerful`, `elevate`, `cutting-edge`, `delve`, `comprehensive solution`

**Good:**
```yaml
description: Fix slow Postgres queries and N+1 problems. Use when asked about "slow query", "add index", "database timeout", "optimize query", schema design, or RLS policies.
```

**Bad:** <!-- intentional anti-pattern — do not copy -->
```yaml
description: This comprehensive skill leverages powerful AI capabilities to seamlessly help with database stuff.
```

### 5. Voice & tone

- Imperative, direct: "Fix X", "Wire Y", "Run Z"
- No hedging: ~~"This might help with…"~~ → "Use when…"
- No filler: ~~"In order to…"~~ → "To…"
- Body prose: short sentences. Tables and bullets for reference data (commands, matrices, checklists); prose for behavioral guidance, so each rule keeps its reason beside it

### 6. Language

- `SKILL.md` bodies: English only (SEO + Cursor intent matching)
- `references/*.md` detail files: English tight prose (reference files are link-only, not auto-loaded; Japanese would save zero tokens for typical sessions)

---

## Adding a New Command

### 1. Create the File

```bash
touch commands/my-command.md
```

### 2. Structure

Commands are markdown with YAML frontmatter (`description`, optional `argument-hint`, `disable-model-invocation: true` on every command except the `MODEL_INVOCABLE_COMMANDS` allowlist, and on Claude Code an optional `effort:` — `low` for mechanical shortcuts, `high` for review and plan pointers). They're triggered via `/my-command` in Cursor and Claude Code.

```markdown
---
description: "One-line summary of what this command does"
argument-hint: "[optional hint]"
disable-model-invocation: true
---

# Command Title

## Purpose
One-line description of what this command does.

## Process

### 1. First Step
- Action items
- Commands to run

### 2. Second Step
[...]

## Checklist
- [ ] Verification step 1
- [ ] Verification step 2
```

### 3. Command Design Principles

- **Actionable** — Each step produces a concrete output
- **Sequential where order matters** — numbered steps for fragile sequences (auth, destructive ops, release); judgment steps state the outcome and how to verify it
- **Verifiable** — Includes a checklist at the end
- **Self-contained** — Doesn't require external context

---

## Updating Existing Skills

### When to Update

- Library API changed (React 19, Next.js 16+, etc.)
- New patterns emerged as best practice
- Missing coverage for common use case
- Code examples have bugs or are outdated

### Update Process

1. Read the existing skill fully
2. Identify what needs changing
3. Make targeted edits (don't rewrite everything)
4. Ensure backward compatibility
5. Update "Related Skills" if new cross-references exist
6. Test code examples are syntactically valid

### Renaming a skill

A rename does **not** change routing (activation matches `description`). It
does leave duplicate directories on existing installs unless the installer
prunes the old name.

1. Add `old-name: new-name` to `RENAMED_SKILLS` in `bin/install.mjs`.
2. Add the same pair to `OLD_ALIASES` in `scripts/check-skill-refs.mjs`.
   Historical mentions stay only in `CHANGELOG.md`, this file, the alias
   table, and `audit-skill-conflicts`.
3. Rename the directory and the `name:` frontmatter together.
4. Prove the prune with `node scripts/test-install.mjs` (rename-orphan case).

Never rewrite historical `CHANGELOG.md` lines that still use the old name.

Shipped rename map: `domain-modeling` → `docs-domain-modeling`, `grilling` →
`workflow-grilling`. Slash `/grill-me` still points at `workflow-grilling`.

### Version Tracking

Use git commit messages to track skill evolution:

```
feat(skills): add React 19 use() patterns to data-visualization
fix(skills): update design-motion for Framer Motion v11 API
docs(skills): add cross-references to enhance-web-web3d
```

---

## Style Guide

### Code Examples

- Use TypeScript, strict mode
- Include type annotations
- Show complete, copy-pasteable examples
- Add comments for non-obvious code
- Use existing project conventions (`@/` imports, `cn()` utility)

### Formatting

- Use tables for comparisons and checklists
- Use code blocks with language tags
- Keep paragraphs short (2-3 sentences max)
- Use headers to create scannable structure
- Avoid filler words

### Naming

| Element | Convention | Example |
|---------|------------|---------|
| Skill name | lowercase-hyphen | `data-visualization` |
| Command name | lowercase | `commit.md` |
| Directory | lowercase-hyphen | `skills/design-mobile-first/` |
| Code identifiers | Follow TypeScript conventions | `useMediaQuery`, `ButtonProps` |

---

## Testing Skills

### Quick Validation

1. **Syntax check:** Ensure YAML frontmatter is valid
2. **Code check:** Code examples should compile (no syntax errors)
3. **Completeness:** Has all required sections
4. **Accuracy:** Code patterns match current library versions

### In Cursor

1. Copy skill to `~/.cursor/skills/` or run `./install.sh`
2. Start a conversation that should trigger the skill
3. Verify Cursor uses the skill appropriately
4. Check that code suggestions match the skill's patterns

---

## Repository Maintenance

### Git hooks (clone contributors)

After cloning, enable pre-commit validation:

```bash
git config core.hooksPath .githooks
```

This is not run automatically on `npm install` — only set it when working from a git clone.

### Regular Tasks

- [ ] Quarterly: Check all skills against latest library versions
- [ ] Monthly: Review git log for skill-related commits
- [ ] On major release: Update affected skills (React, Next.js, Tailwind, etc.)

### Adding to CATALOG.md

When adding a new skill, also update:
- `docs/CATALOG.md` — entry, trigger phrases, related skills
- `docs/TRIGGER-CHEATSHEET.md` — "say this → skill" row
- `docs/PLAN-LOOPS.md` + a `/…-plan` command if it is a `plan-*` skill
- `docs/GETTING-STARTED.md` / README use-case table if a newcomer would type that phrase

Then say **"audit my skills"** (`audit-skill-conflicts`) so overlapping descriptions and stale handoffs get caught. Per-file spec lint (`npm run validate:skills`) cannot see those. `npm run check:skill-refs` fails CI on doubled-prefix typos (`mobile-mobile-*`) and stale `audit-responsive-layout` aliases.

### Updating README.md

When adding a new skill:

1. Run `npm run gen:skill-index` (do not hand-edit the `<!-- SKILL-INDEX -->` block)
2. Run `npm run check:skills` (or `npm run fix:skills`) so counts stay derived
3. Add CATALOG / TRIGGER-CHEATSHEET rows as above

Third-party skills: also update [THIRD-PARTY-SKILLS.md](./THIRD-PARTY-SKILLS.md).

---

## Third-Party Skills (summary)

Full guide: [THIRD-PARTY-SKILLS.md](./THIRD-PARTY-SKILLS.md)

| Requirement | Detail |
|-------------|--------|
| Directory prefix | `thirdparty-` (e.g. `thirdparty-emil-design-eng`) |
| Frontmatter `name` | Must match directory name |
| `ATTRIBUTION.md` | Upstream URL, license, update steps |
| Skill body | Upstream content only — no Kenji "Check Existing First" |
| Pipeline | Included automatically by `./install.sh` |
