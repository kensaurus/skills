---
name: design-prd
description: >
  Generate Product Requirements Documents through structured conversation for any project.
  Use when starting a new feature, documenting requirements, creating specs before
  implementation, or needing clarity on scope and success criteria.
license: MIT
effort: high
---

# Generate PRD Skill

**Degree of freedom: MIXED.** Clarifying questions, scope, and requirements
`[HIGH freedom]`; stack/feature/schema detection `[LOW freedom — run exactly]`.

Create detailed, actionable Product Requirements Documents through structured conversation,
informed by codebase analysis and competitive research.

## How to reason

1. **Discover** — stack, features, schema, existing PRDs
2. **Clarify** — only what is unclear, numbered with lettered options
3. **Scope** — P0/P1/P2 plus explicit non-goals
4. **Specify** — testable requirements, not implementation

## Worked example

> **Discover:** Next.js + Supabase; `notifications` table missing; no `prd-*.md`.
> **Clarify:** in-app vs email vs push? (user: 1A in-app only). MVP vs polish? (2A MVP).
> **Scope:** P0 in-app bell + read state; non-goal: email/push (`design-email` / `mobile-capacitor-platform`).
> **Specify:** FR-1 "unread count on the header within 2s of insert" — not "feel realtime".

## Self-critique before reporting

- **Context recorded** — stack, features, schema, and existing PRDs were listed first
- **Questions minimal** — only what was unclear, lettered; coding did not start first
- **Testable FRs** — no "should be fast" without a number
- **Right owner** — ready to implement → `workflow-build-feature`; UI from scratch → `design-frontend`; RLS matrix → `plan-rls-audit`

---

## Step 0: Auto-Detect Project Context  [LOW freedom — run exactly]

Before writing any PRD, understand the project from its source code.

### 0a. Detect Tech Stack

Read `package.json` (or equivalent) to extract:

- **Framework**: Next.js, Remix, SvelteKit, Nuxt, Django, Rails, etc.
- **UI library**: React, Vue, Svelte, Angular
- **Database**: Supabase, Prisma, Drizzle, raw SQL
- **Auth**: Supabase Auth, NextAuth, Clerk, Auth0
- **State management**: TanStack Query, Zustand, Redux, Pinia
- **CSS**: Tailwind, CSS Modules, Styled Components

### 0b. Discover Existing Features

```
Glob: **/app/**/page.tsx → Next.js routes (features)
Glob: **/features/*/ → Feature directories
Glob: **/src/routes/**/*.tsx → Route-based features
Grep: pattern "export default" glob "**/page.tsx" output_mode "files_with_matches"
```

Read feature READMEs if they exist:
```
Glob: **/*README*.md → Feature docs
Glob: **/docs/*.md → Documentation
```

### 0c. Discover Data Model

```
Glob: **/supabase/migrations/*.sql → SQL migrations
Glob: **/prisma/schema.prisma → Prisma schema
Glob: **/drizzle/schema.ts → Drizzle schema
Glob: **/types/*.ts → TypeScript type definitions
```

### 0d. Check for Existing PRDs

```
Glob: **/tasks/prd-*.md → Existing PRDs
Glob: **/docs/prd-*.md → Existing PRDs (alt location)
Glob: **/specs/*.md → Spec documents
```

### 0e. Record Context

```
PROJECT CONTEXT:
- Framework: [name + version]
- Database: [type + ORM]
- Existing features: [list of routes/feature dirs]
- Existing PRDs: [list or none]
- Data entities: [list from schema]
- Auth system: [provider]
```

---

## Step 1: Research Before Writing  [HIGH freedom]

### 1a. Competitive Research (Firecrawl)

When the user describes a feature, research how others have solved it:

```json
firecrawl:firecrawl_search
{
 "query": "<FEATURE_TYPE> UX patterns best practices [current year]",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Feature-type search queries (CRUD, dashboard, onboarding, e-commerce, social, CMS, search, settings): [references/research-and-questions.md](references/research-and-questions.md) §Feature-type search queries.

Scrape the most relevant result for detailed patterns. Competitor rows in section 7 come from fetched pages, not memory — recognizing a product name is not knowing its current feature set; search the name as written:

```json
firecrawl:firecrawl_scrape
{
 "url": "<BEST_RESULT_URL>",
 "formats": ["markdown"],
 "onlyMainContent": true
}
```

### 1b. Technical Feasibility (Context7)

Check if the framework supports what the feature needs:

```json
context7:resolve-library-id
{
 "libraryName": "<FRAMEWORK>",
 "query": "<FEATURE_CAPABILITY> support"
}
```

```json
context7:query-docs
{
 "libraryId": "<RESOLVED_ID>",
 "query": "<FEATURE_CAPABILITY> implementation guide"
}
```

### 1c. Data Model Feasibility (Supabase MCP)

If the feature involves data, check the existing schema:

```json
supabase:list_tables
{
 "schemas": ["public"],
 "verbose": true
}
```

Or for specific tables:

```json
supabase:execute_sql
{
 "query": "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '<RELEVANT_TABLE>' ORDER BY ordinal_position"
}
```

Determine:
- Can existing tables support this feature?
- What new tables/columns are needed?
- What relationships need to be added?
- Do RLS policies need updating?

---

## Step 2: Understand the Request  [HIGH freedom]

When the user describes a feature, sort what is clear from what is unclear before writing anything:

- Clear: problem statement, target user, basic functionality
- Unclear: scope boundaries, success metrics, edge cases, technical constraints

### Check for Similar Functionality

```
SemanticSearch: "How does the app currently handle <FEATURE_AREA>?" target: []
Grep: pattern "<FEATURE_KEYWORDS>" glob "*.{ts,tsx,js,jsx}"
```

If similar functionality already exists, the PRD should extend it rather than duplicate.

---

## Step 3: Ask Clarifying Questions  [HIGH freedom]

### Rules

1. **Ask only what is truly unclear** — usually a handful; if nothing is, say so and proceed
2. **Number all questions** (1, 2, 3...)
3. **Provide lettered options** (A, B, C, D) for easy response
4. **Make responding easy** — user can reply "1A, 2C, 3B"

### Question Categories

| Category | Ask When... |
|----------|-------------|
| Problem / Goal | The "why" is unclear |
| Core Functionality | The "what" is vague |
| Scope Boundaries | Request is broad |
| Target User | Multiple user types possible |
| Success Criteria | No clear definition of "done" |

### Example Format


Numbered questions, lettered A–D options, closing with `Reply with selections (e.g., "1B, 2A, 3B")`: [references/research-and-questions.md](references/research-and-questions.md) §Clarifying questions.

---

## Step 4: Generate PRD  [HIGH freedom]

### Template

Ten sections, in order: Overview (problem, proposed solution) → Goals table with success metrics → User Stories (primary + edge case) → Functional Requirements as P0/P1/P2 checkboxes → Non-Goals → Technical Feasibility (existing vs new infrastructure, complexity table) → Competitive Analysis table from the Firecrawl research → UI/UX Considerations (screens, borrowed patterns, accessibility) → Data Model (tables used, SQL for new tables, RLS policies) → Open Questions.

Full template: [references/prd-template.md](references/prd-template.md).

---

## Step 5: Iterate  [HIGH freedom]

Present the PRD, take the user's edits, resolve the open questions, and confirm it is ready to save before writing the file.

---

## Step 6: Save  [LOW freedom — run exactly]

**Location:** `tasks/prd-[feature-name].md`

**Naming:**
- All lowercase
- Use hyphens for spaces
- Examples: `prd-dark-mode.md`, `prd-export-csv.md`, `prd-user-onboarding.md`

---

## Writing Guidelines

Target audience: a **junior developer** should understand this.

- Clear, simple language
- Define acronyms on first use
- Be explicit — no implied knowledge
- Every requirement is testable ("fast" is vague; "loads in under 200ms" is testable)
- Use tables for structured comparisons
- Include "Not doing" section to prevent scope creep

---

## Anti-Patterns

- Starting to code before asking questions
- Asking questions the repo or the request already answers
- Writing implementation details (PRD = WHAT/WHY, not HOW)
- Vague requirements ("should be fast" -> "response time under 200ms")
- Skipping competitive research (leads to reinventing the wheel)
- Skipping technical feasibility (leads to impossible requirements)
- Not checking existing codebase (leads to duplicate features)
