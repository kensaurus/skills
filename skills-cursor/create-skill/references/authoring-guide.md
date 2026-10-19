# Skill Authoring Guide (reference)

## Contents

- [Common Patterns](#common-patterns)
- [Report structure](#report-structure)
- [Executive summary](#executive-summary)
- [Key findings](#key-findings)
- [Recommendations](#recommendations)
- [Commit message format](#commit-message-format)
- [Utility Scripts](#utility-scripts)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
- [Skill Creation Workflow](#skill-creation-workflow)
- [Complete Example](#complete-example)
- [What a review covers](#what-a-review-covers)
- [Additional Resources](#additional-resources)
- [Summary Checklist](#summary-checklist)

Extended patterns, workflows, and checklists for `create-skill`. Read when drafting
non-trivial skills.

---

## Common Patterns

### Template Pattern

Provide output format templates:

```markdown
## Report structure

Use this template:

# [Analysis Title]

## Executive summary
[One-paragraph overview of key findings]

## Key findings
- Finding 1 with supporting data

## Recommendations
1. Specific actionable recommendation
```

### Examples Pattern

For skills where output quality depends on seeing examples:

```markdown
## Commit message format

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

### Workflow Pattern

Use numbered steps with a checklist only where order is load-bearing (migrations, auth flows, destructive ops, baseline capture). For judgment work, state the outcome, the constraints, and how to verify - the agent's own plan beats a hand-written script:

```markdown
Task Progress:
- [ ] Step 1: Analyze the form
- [ ] Step 2: Create field mapping
- [ ] Step 3: Validate mapping
```

### Conditional Workflow Pattern

Guide through decision points — creation vs editing branches.

### Feedback Loop Pattern

For quality-critical tasks: edit → validate script → fix → re-validate before proceeding.

---

## Utility Scripts

Pre-made scripts offer advantages over generated code:
- More reliable than generated code
- Save tokens (no code in context)
- Ensure consistency across uses

Make clear whether the agent should **execute** the script (most common) or **read** it as reference.

---

## Anti-Patterns to Avoid

### 1. Windows-Style Paths
- ✅ Use: `scripts/helper.py`
- ❌ Avoid: `scripts\helper.py`

### 2. Too Many Options
Provide a default with one escape hatch, not a menu of equals.

### 3. Time-Sensitive Information
Use "Current method" + collapsible "Old patterns (deprecated)" instead of dates in prose.

### 4. Inconsistent Terminology
Choose one term and use it throughout (e.g. always "API endpoint").

### 5. Vague Skill Names
- ✅ Good: `processing-pdfs`, `analyzing-spreadsheets`
- ❌ Avoid: `helper`, `utils`, `tools`

---

## Skill Creation Workflow

### Phase 1: Discovery

Gather: purpose, storage location, trigger scenarios, constraints, existing patterns.

### Phase 2: Design

1. Draft skill name (lowercase, hyphens, max 64 chars)
2. Write specific third-person description
3. Outline main sections
4. Identify supporting files or scripts

### Phase 3: Implementation

1. Create directory structure
2. Write SKILL.md with frontmatter (`name`, `description`; when the skill also ships to Claude Code, add `effort: high` for audit / plan / security / judge work and `effort: low` for mechanical fixed-sequence work - the model default is medium, Claude Code honors the key, Cursor ignores it)
3. Create reference files
4. Create utility scripts if needed

### Phase 4: Verification

1. SKILL.md under 500 lines
2. Description specific with trigger terms
3. Consistent terminology
4. File references one level deep
5. Test discovery and application

---

## Complete Example

**Directory structure:**

```
code-review/
├── SKILL.md
├── STANDARDS.md
└── examples.md
```

**SKILL.md skeleton:**

```markdown
---
name: code-review
description: Review code for quality, security, and maintainability. Use when reviewing PRs or when the user asks for a code review.
---

# Code Review

## What a review covers
Correctness and edge cases, security, readability, and whether the tests
prove the change. Report each finding as file:line, the defect, and the
input that triggers it.

## Additional Resources
- [STANDARDS.md](STANDARDS.md)
- [examples.md](examples.md)
```

---

## Summary Checklist

### Core Quality
- [ ] Description is specific and includes key terms
- [ ] Description includes both WHAT and WHEN
- [ ] Written in third person
- [ ] SKILL.md body is under 500 lines
- [ ] Consistent terminology throughout
- [ ] Examples are concrete, not abstract

### Structure
- [ ] File references are one level deep
- [ ] Progressive disclosure used appropriately
- [ ] Numbered steps only where order is load-bearing; outcomes and constraints elsewhere
- [ ] No time-sensitive information

### If Including Scripts
- [ ] Scripts solve problems rather than punt
- [ ] Required packages are documented
- [ ] Error handling is explicit and helpful
- [ ] No Windows-style paths
