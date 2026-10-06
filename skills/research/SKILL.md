---
name: research
description: >
  Research current practice with Context7, Firecrawl, and official docs before
  a non-trivial change: gap analysis and a file-mapped plan, no
  implementation. Use when "look up current docs" or before anything
  unfamiliar.
license: MIT
effort: high
---

# research — Production research protocol

**Degree of freedom: MIXED.** Repo-first inventory and official-docs
order `[LOW freedom — run exactly]`. Which sources to trust and which
pattern to recommend `[HIGH freedom]`.

Understand the current repo first. Then fetch version-matched official
docs. Then map findings back to specific files. **Do not implement until
the user asks or approves.**
Recognizing a library, tool, or product name is not knowing its current state. Search the name as written and fetch the installed version's docs even when you think you already know the answer — that is the whole point of this skill.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **research** (this) | Current-year, version-matched investigation + gap analysis + plan |
| `plan-*` | Audit → approved burndown (no implementation) |
| `docs-adr` | Decision memory after a choice is made |
| `workflow-onboard` | First-contact repo orientation, not industry research |
| `complete-everything` | Execute an already-approved plan |

## How to reason

1. **Observe** — installed versions, current files, existing pattern
2. **Interpret** — what is actually missing vs what just looks old
3. **Classify** — keep / replace / add / reject (deprecated, CVE, untyped)
4. **Decide** — one recommended approach mapped to concrete files

## Worked example

> **Observe:** consumer asked whether `npx skills add` overwrites slash
> commands; pack ships both `commands/*.md` and `skills/*/`.
> **Interpret:** two installers, two `--all` meanings; Cursor now
> slash-invokes skills so same-name pairs look duplicated.
> **Classify:** docs lie (skills add claimed to install commands); npm
> installer merge-overwrites correctly.
> **Decide:** keep npm installer as the full-pack path; add `--verify`;
> promote this protocol from command-only to a skill.

## Self-critique

Before delivering the plan, fail the run if any of these are true:

- Repo files were not read before the first external search
- Official docs for the *installed* version were skipped when available
- A recommendation has no source, or only one weak blog post
- The plan is not mapped to concrete repo paths
- Implementation started without an explicit user ask

---

## Step 1: Understand the codebase context — before any external search

Before any external research, understand what you're working with.

### 1a. Discover Tech Stack

Read the dependency manifest to get exact library names and versions:

```
package.json          (Node/JS/TS)
requirements.txt      (Python)
pyproject.toml        (Python)
Cargo.toml            (Rust)
go.mod                (Go)
build.gradle          (Java/Kotlin)
Gemfile               (Ruby)
```

Extract: framework, major libraries, their exact versions.

### 1b. Read the Existing Implementation

Read the specific file(s) related to the topic being researched, in full — conventions, limitations, and TODOs live outside the obvious lines. Understand:

- What pattern is currently used?
- What dependencies does it rely on?
- What are the known limitations or TODOs?
- What conventions does the project follow?

### 1c. Formulate Research Questions

Write out explicitly:

```
Current state: [what the project does now]
Gap/goal: [what needs to improve or be added]
Specific questions:
  1. [question about best practice]
  2. [question about alternative approach]
  3. [question about edge cases]
```

---

## Step 2: Context7 — Official Documentation

Fetch current docs for the libraries involved. Use the Context7 MCP (if available).

### Resolve Library ID

```json
context7:resolve-library-id
{
  "libraryName": "<library-name>",
  "query": "<your specific question>"
}
```

### Fetch Documentation

Pick the best match from the resolution results, then:

```json
context7:query-docs
{
  "libraryId": "<selected-id>",
  "query": "<your specific question>"
}
```

Run Context7 for each major library involved. Prefer version-specific IDs when available.

**If Context7 is unavailable**, skip to Step 3 and use Firecrawl to search official documentation sites directly.

---

## Step 3: Firecrawl — Three-Phase Deep Research

Use the `firecrawl` MCP server. The research happens in three phases: broad search, deep scrape, then discovery.

### Phase 1: Broad Search (find what's out there)

Search without scraping first — get URLs and snippets to evaluate:

```json
firecrawl:firecrawl_search
{
  "query": "[library] [topic] best practices [current year]",
  "limit": 5,
  "sources": [{ "type": "web" }]
}
```

Run 2-3 search queries with different angles:

| Angle | Query Pattern |
|-------|---------------|
| Best practices | `[tech] [topic] best practices [current year]` |
| Implementation guide | `[tech] [topic] production implementation guide` |
| Common mistakes | `[tech] [topic] common mistakes pitfalls avoid` |
| Migration/upgrade | `[tech] [topic] migration guide from [old version]` |
| Security | `[tech] [topic] security OWASP [current year]` |
| Performance | `[tech] [topic] performance optimization production` |

Use search operators for precision:

- `site:` to target specific docs sites (e.g., `site:react.dev`, `site:nextjs.org`)
- `""` for exact phrases
- `-` to exclude irrelevant results

### Phase 2: Deep Scrape (read the best sources thoroughly)

From Phase 1 results, pick the 2-3 most authoritative URLs (official docs, maintainer blogs, engineering blogs). Scrape each for full content:

```json
firecrawl:firecrawl_scrape
{
  "url": "<authoritative-url>",
  "formats": ["markdown"],
  "onlyMainContent": true
}
```

For extracting specific data points (config options, API parameters, migration steps):

```json
firecrawl:firecrawl_scrape
{
  "url": "<docs-url>",
  "formats": ["json"],
  "jsonOptions": {
    "prompt": "Extract the recommended configuration options and their default values",
    "schema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "recommended": { "type": "string" },
              "description": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

If a documentation site is large and you're not sure which page has the answer, use `firecrawl_map` first to discover the right page:

```json
firecrawl:firecrawl_map
{
  "url": "https://docs.example.com",
  "search": "[your topic]",
  "limit": 20
}
```

Then scrape the specific page(s) found.

### Phase 3: Discovery (find reference implementations)

Search for real-world codebases that solved the same problem:

```json
firecrawl:firecrawl_search
{
  "query": "[tech] [topic] example implementation github",
  "limit": 5,
  "sources": [{ "type": "web" }]
}
```

Also try:

| Discovery Query | Purpose |
|-----------------|---------|
| `[tech] [topic] open source example` | Find real implementations |
| `[tech] [topic] starter template boilerplate` | Find scaffolded patterns |
| `[tech] [topic] "how we" OR "how I" production` | Find experience reports |
| `site:github.com [tech] [topic] in:readme` | Find repos directly |

Scrape the README or relevant docs of promising repos to extract their architectural decisions.

---

## Step 4: Gap Analysis (the core of research-driven enhancement)

Compare what the project currently does against what research found. Produce a structured gap analysis:

```
## Gap Analysis: [Topic]

### What the project does correctly
- [pattern 1]: aligns with [source] recommendation
- [pattern 2]: follows current best practice

### What the project is missing
- [gap 1]: [source] recommends X, project does Y or nothing
- [gap 2]: [source] warns against current pattern, suggests Z

### Anti-patterns detected
- [anti-pattern 1]: project uses [old pattern], [source] recommends [new pattern] because [reason]

### New capabilities available
- [capability 1]: [library] now supports [feature] as of v[X], not yet adopted
- [capability 2]: [new approach] reduces complexity, project uses legacy pattern
```

---

## Step 5: Fallback — WebSearch + WebFetch

When Firecrawl MCP is unavailable, use built-in tools with the same three-phase approach:

### Phase 1: Broad Search
```
WebSearch(search_term: "[tech] [topic] best practices [current year]")
```

### Phase 2: Deep Read
```
WebFetch(url: "<authoritative-url-from-search>")
```

### Phase 3: Discovery
```
WebSearch(search_term: "[tech] [topic] github example implementation")
```

---

## Step 6: Synthesize and Decide

### Trust Hierarchy (when sources conflict)

1. Official documentation (highest trust)
2. Core maintainer posts / RFCs / changelogs
3. Engineering blogs from major companies (Vercel, AWS, Google, Meta)
4. GitHub discussions on official repos
5. Community articles with high engagement (current year, verified working)

### Conflict Resolution

When two authoritative sources recommend different approaches:

1. Check which source matches the project's installed version
2. Check which approach aligns with the project's existing patterns
3. Check which approach has fewer trade-offs for the project's scale
4. If still tied, prefer the simpler approach

### Validation Gates

| Gate | Check |
|------|-------|
| Fresh | Published current year or previous year, matches installed version |
| Secure | No known CVEs, follows OWASP guidelines |
| Typed | Full TypeScript support, no `any` escape hatches |
| Tested | Can be unit/integration tested, doesn't break existing tests |
| Compatible | Works with the project's other dependencies and patterns |

**Reject a pattern if:** it uses a deprecated API, has known vulnerabilities, skips error handling, requires a major refactor with unclear benefit, or conflicts with the project's architecture.

---

## Step 7: Plan Complex Implementations

Plan multi-file architectural migrations directly in the plan: ordered files, intermediate states, side effects. Thinking is native — the Sequential Thinking MCP is not shipped (ADR-0009) and adds nothing here.

Do **not** add Playwright MCP for research or browser checks — use headed `playwright-cli` per `protocol-browser-anti-stall`. Firecrawl stays authenticated; do not switch to the keyless tool subset just to save tokens.

---

## Step 8: Apply to Codebase

Map every research finding to specific, actionable code changes. Do not implement in this skill.

```
## Implementation Plan

### Changes (ordered by priority)

1. **[file path]** — [what to change and why]
   - Before: [current pattern]
   - After: [recommended pattern]
   - Risk: [low/medium/high] — [explanation]

2. **[file path]** — [what to change and why]
   ...

### New dependencies (if any)
- [package@version] — [why needed]

### Breaking changes
- [description of what breaks and how to migrate]

### Edge cases to handle
- [edge case 1]
- [edge case 2]

### Verification
- [how to verify the change works]
```

---

## Output Template

After completing research, produce this summary:

```markdown
## Research: [Topic]

### Context
- Tech stack: [framework, libraries, versions]
- Current implementation: [brief description]
- Research goal: [what we're trying to learn/improve]

### Findings
[Key patterns and recommendations from research]

### Recommended Approach
[Pattern name] — [one-line why this is best for this project]

### Gap Analysis
- Missing: [what the project should add]
- Replace: [what the project should change]
- Keep: [what the project already does well]

### Implementation Plan
[Ordered list of file changes with before/after]

### Gotchas
- [Edge case or risk 1]
- [Edge case or risk 2]

### Sources
- [URL] — [what it provided]
- [URL] — [what it provided]
```

---

## Pre-Implementation Checklist

- [ ] Codebase context understood (tech stack, current patterns, specific files read)
- [ ] Context7 docs fetched (or skipped if unavailable)
- [ ] Firecrawl broad search completed (2-3 queries)
- [ ] Firecrawl deep scrape completed (2-3 best URLs)
- [ ] Discovery search completed (reference implementations found)
- [ ] Gap analysis produced (current vs recommended)
- [ ] Sources cross-referenced (3+ sources agree)
- [ ] Validation gates passed (fresh, secure, typed, tested, compatible)
- [ ] Implementation plan maps findings to specific files
- [ ] Edge cases identified
