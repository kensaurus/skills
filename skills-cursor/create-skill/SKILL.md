---
name: create-skill
description: Guide users through creating effective Agent Skills for Cursor. Use when user wants to create, write, update, or debug a skill, or asks about SKILL.md format, skill structure, ~/.cursor/skills/, or skill best practices.
disable-model-invocation: true
---
# Creating Skills in Cursor

This skill guides you through creating effective Agent Skills for Cursor. Skills are markdown files that teach the agent how to perform specific tasks: reviewing PRs using team standards, generating commit messages in a preferred format, querying database schemas, or any specialized workflow.

## Check existing first

**Before creating a skill, check:**

1. **Check for existing skills:**
```bash
ls -la ~/.cursor/skills/*/SKILL.md 2>/dev/null
ls -la .cursor/skills/*/SKILL.md 2>/dev/null
```

2. **Check for similar functionality:**
```bash
grep -r "description:" ~/.cursor/skills/*/SKILL.md 2>/dev/null
```

3. **Consider extending vs creating:**
- Could an existing skill be enhanced?
- Would a rule be more appropriate than a skill?

**Why:** Avoid skill duplication. Skills should have clear, distinct purposes.

## Before You Begin: Gather Requirements

Before creating a skill, gather essential information from the user about:

1. **Purpose and scope**: What specific task or workflow should this skill help with?
2. **Target location**: Should this be a personal skill (~/.cursor/skills/) or project skill (.cursor/skills/)?
3. **Trigger scenarios**: When should the agent automatically apply this skill?
4. **Key domain knowledge**: What specialized information does the agent need that it wouldn't already know?
5. **Output format preferences**: Are there specific templates, formats, or styles required?
6. **Existing patterns**: Are there existing examples or conventions to follow?

### Inferring from Context

If you have previous conversation context, infer the skill from what was discussed. You can create skills based on workflows, patterns, or domain knowledge that emerged in the conversation.

### Gathering Additional Information

If you need clarification, use the AskQuestion tool when available:

```
Example AskQuestion usage:
- "Where should this skill be stored?" with options like ["Personal (~/.cursor/skills/)", "Project (.cursor/skills/)"]
- "Should this skill include executable scripts?" with options like ["Yes", "No"]
```

If the AskQuestion tool is not available, ask these questions conversationally.

---

## Skill File Structure

### Directory Layout

Skills are stored as directories containing a `SKILL.md` file:

```
skill-name/
├── SKILL.md              # Required - main instructions
├── reference.md          # Optional - detailed documentation
├── examples.md           # Optional - usage examples
└── scripts/              # Optional - utility scripts
    ├── validate.py
    └── helper.sh
```

### Storage Locations

| Type | Path | Scope |
|------|------|-------|
| Personal | ~/.cursor/skills/skill-name/ | Available across all your projects |
| Project | .cursor/skills/skill-name/ | Shared with anyone using the repository |

**IMPORTANT**: Never create skills in `~/.cursor/skills-cursor/`. This directory is reserved for Cursor's internal built-in skills and is managed automatically by the system.

### SKILL.md Structure

Every skill requires a `SKILL.md` file with YAML frontmatter and markdown body:

```markdown
---
name: your-skill-name
description: Brief description of what this skill does and when to use it
---

# Your Skill Name

## Instructions
Outcomes, constraints, and how to verify. Numbered steps only where order is load-bearing (destructive ops, auth, migrations).

## Examples
Concrete examples of using this skill.
```

### Required Metadata Fields

| Field | Requirements | Purpose |
|-------|--------------|---------|
| `name` | Max 64 chars, lowercase letters/numbers/hyphens only | Unique identifier for the skill |
| `description` | Max 320 chars in kenji (spec max 1024), non-empty | Helps agent decide when to apply the skill |

### Optional fields

Cursor ignores keys it does not list; Claude Code honors all of these. Any other key goes under `metadata`.

| Field | Hosts | Use |
|-------|-------|-----|
| `disable-model-invocation: true` | Cursor, Claude Code | User-initiated rituals. Also keeps the description out of the always-on skill roster that every request pays for. |
| `user-invocable: false` | Claude Code | Reference-only skill; hides the `/` entry. |
| `effort` | Claude Code | `low` / `medium` / `high` / `xhigh` / `max`. Opus 5.5 defaults to `medium`; declare `high` for audit, plan, judge, security, and architecture skills, `low` for mechanical, read-only, or handoff skills. Effort is the thinking control — prose cannot raise or lower it. |
| `context: fork` + `agent: <name>` | Claude Code | Run in a forked context so the output stays out of the main conversation; `agent: Explore` for read-only inventory. |
| `model`, `allowed-tools` | Claude Code | Pin a model; restrict tools. |
| `paths` | Cursor, Claude Code | Globs; the skill applies when matching files are in play. |

---

## Writing Effective Descriptions

The description is **critical** for skill discovery. The agent uses it to decide when to apply your skill.

### Description Best Practices

1. **Write in third person** (the description is injected into the system prompt):
   - ✅ Good: "Processes Excel files and generates reports"
   - ❌ Avoid: "I can help you process Excel files"
   - ❌ Avoid: "You can use this to process Excel files"

2. **Be specific and include trigger terms**:
   - ✅ Good: "Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction."
   - ❌ Vague: "Helps with documents"

3. **Include both WHAT and WHEN**:
   - WHAT: What the skill does (specific capabilities)
   - WHEN: When the agent should use it (trigger scenarios)

### Description Examples

```yaml
# PDF Processing
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.

# Excel Analysis
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.

# Git Commit Helper
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.

# Code Review
description: Review code for quality, security, and best practices following team standards. Use when reviewing pull requests, code changes, or when the user asks for a code review.
```

---

## Core Authoring Principles

### 1. Concise is Key

The context window is shared with conversation history, other skills, and requests. Every token competes for space.

**Default assumption**: The agent is already very smart. Only add context it doesn't already have.

Challenge each piece of information:
- "Does the agent really need this explanation?"
- "Can I assume the agent knows this?"
- "Does this paragraph justify its token cost?"

**Good (concise)**:
```markdown
## Extract PDF text

Use pdfplumber for text extraction:

\`\`\`python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
\`\`\`
```

**Bad (verbose)**:
```markdown
## Extract PDF text

PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing, but we
recommend pdfplumber because it's easy to use and handles most cases well...
```

### 2. Keep SKILL.md Under 500 Lines

For optimal performance, the main SKILL.md file should be concise. Use progressive disclosure for detailed content.

### 3. Progressive Disclosure

Put essential information in SKILL.md; detailed reference material in separate files that the agent reads only when needed.

```markdown
# PDF Processing

## Quick start
[Essential instructions here]

## Additional resources
- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)
```

**Keep references one level deep** - link directly from SKILL.md to reference files. Deeply nested references may result in partial reads.

### 4. Prune with the verbosity levers

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT):

- **No-op test** — if a sentence doesn't change behavior versus the agent's
  default ("be thorough"), delete the whole sentence. Do not swap in an
  intensifier (*relentless*); on current models emphasis over-triggers — name
  the concrete behavior and its reason instead.
- **Positive phrasing** — state the target behavior instead of prohibiting the
  bad one; keep prohibitions only as hard guardrails, paired with what to do
  instead.
- **Leading words** — collapse restated qualities into one compact concept the
  model already knows ("fast, deterministic, low-overhead" → a *tight* loop).
- **One trigger per branch** — in descriptions, synonyms of the same trigger are
  duplication; keep only genuinely distinct branches.
- **Checkable completion criteria** — end steps on a condition the agent can
  verify, not a vibe; vague criteria invite premature completion.

### 5. Set Appropriate Degrees of Freedom

Match specificity to the task's fragility:

| Freedom Level | When to Use | Example |
|---------------|-------------|---------|
| **High** (text instructions) | Multiple valid approaches, context-dependent | Code review guidelines |
| **Medium** (pseudocode/templates) | Preferred pattern with acceptable variation | Report generation |
| **Low** (specific scripts) | Fragile operations, consistency critical | Database migrations |

### 6. Write for current models

- **Effort, not prose, sets thinking.** Leave out "think step by step", "think hard", and "double-check your work"; set `effort:` and state the outcome to verify. Keep evidence rules ("tie every finding to a tool result") — they target fabricated progress, not thinking.
- **Normal volume, with the reason.** MUST/NEVER/CRITICAL over-trigger; "try to" and "if possible" read as permission to skip. Say it once and say why.
- **Describe success, not the grader.** State every requirement; leave out how the output will be scored or tested by a reader.
- **Do not suppress updates.** The always-on verification rule asks for an intent line, load-bearing notes and a recap; never add "no preamble" or "hold findings". A skill that runs unattended says when the turn may end.
- **Frontend skills name the defaults to avoid** (cream backgrounds, italic accent words, "01/02/03" labels, pill buttons, Inter/Roboto, purple gradients, three equal cards); "avoid a generic look" swaps one default for another.

---

## Skill creation workflow (summary)

1. **Discovery** — purpose, location, triggers, constraints
2. **Design** — name, description, sections, supporting files
3. **Implement** — `SKILL.md` + `references/` + `scripts/` as needed
4. **Verify** — in kenji run `npm run validate:skills`; description ≤320 chars, body <500 lines

## Additional resources

- Patterns, anti-patterns, full workflow, example, checklist → [references/authoring-guide.md](references/authoring-guide.md)

