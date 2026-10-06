---
name: docs-writer
description: >
  Write developer docs: README content, API references, code comments,
  changelog entries. Use when "write docs", "document this API", or "explain
  for contributors". README visuals → enhance-readme. Co-authored specs →
  docs-coauthor.
license: MIT
---

# Documentation Writer Skill

**Degree of freedom: MIXED.** Voice and structure `[HIGH freedom]`;
pre-documentation checks and the verification statement
`[LOW freedom — run exactly]`.

Create clear, useful documentation for developers.

## Core principle — write for the reader's mental model first

Documentation rarely fails because it's *incomplete*. It fails because the reader can't build a mental model fast enough to care. So before any reference detail, answer the questions the reader is silently asking — in their words, in this order:

| The reader is silently asking… | Answer it with… |
|:--|:--|
| **What** is this? | One plain-English sentence — what it *does*, not how it's built |
| **Why** should I care? | The problem it solves / the pain it removes |
| **Who** is it for? | The audience + stack, so a wrong-fit reader can leave early |
| **How** do I start? | The shortest path to a first win: install → one command → result |
| **When / where** do I use it? | The situations it fits — and its boundaries (what it's *not*) |

Rules that follow from this:

- **Lead with the goal, not the implementation.** *"Turn a CSV into a chart"* beats *"A streaming transform pipeline built on X."*
- **Progressive disclosure.** Newcomer on-ramp first (plain language + one example), reference depth below. A pro scrolls past the primer in two seconds; a newcomer can't skip *to* it if it was never written.
- **Beat the curse of knowledge.** You know the jargon; the reader may not. Define a term on first use, or add a plain-language glossary when the project leans on 3+ domain terms (pattern below).
- **Show, don't just tell.** Every abstract capability gets a concrete, copy-pasteable example.
- **Write the sentence you'd say out loud** to a smart colleague who's never seen the project. Mannered prose is the anti-pattern — sentences that perform writing instead of saying something: throat-clearing openers, stacked hedges, "it's worth noting", triplets for rhythm, a closing line that restates the paragraph. One plain sentence per idea.

Everything else in this skill (templates, API docs, comments) serves this principle — structure and polish never substitute for orienting the reader first.

## How to reason

1. **Observe** — existing README/docs, the code being documented, the audience
2. **Interpret** — which silent reader questions (what / why / who / how / when) are unanswered
3. **Classify** — README / API reference / comments / architecture — match the repo's pattern
4. **Verify** — signatures and examples match the code you read

## Worked example

> **Observe:** "document createUser"; `src/users.ts` is `createUser({ email, role }) → Promise<User>`; README links `docs/api.md` with signature tables.
> **Interpret:** the reader needs the signature, errors, and a copy-paste call — not another project README.
> **Classify:** API reference in the existing table pattern.
> **Write only after:** "Pre-documentation check: existing docs read: README.md, docs/api.md; pattern: signature tables; code verified: src/users.ts"

## Self-critique before reporting

- **Pre-doc check stated** — existing docs and code listed, not assumed
- **First screen** — what / why / who in plain language
- **Examples run** — copy-pasteable; signatures match the file you read
- **Right owner** — visual README makeover → `enhance-readme`; docs/code drift plan → `plan-docs-sync`; long-form collab → `docs-coauthor`

## Pre-documentation checks  [LOW freedom — run exactly]

**Before writing any documentation:**

### 1. Read Existing Documentation
```
README.md (project root)
docs/ (existing docs)
src/[domain]/@_[domain]-README.md (feature-specific READMEs)
```

### 2. Check Documentation Patterns
Use `Glob` to find existing README files:
```
Glob: "**/*README.md" to find all READMEs
Glob: "**/*.md" in docs/ to find documentation patterns
```

### 3. Verify Code Matches Documentation
Read the actual code being documented to ensure accuracy:
- Check function signatures match documentation
- Verify example code actually works
- Confirm database schema matches any data documentation

### 4. Verification statement — so the docs rest on files you read, not assumptions
Before writing docs, state:
```
"Pre-documentation check:
- Existing docs read: [list]
- Documentation pattern identified: [pattern from existing READMEs]
- Code verified: [files read to ensure accuracy]"
```

---

## README Template  [HIGH freedom]

```markdown
# Project Name

> One plain-English sentence: what it does and who it's for — no jargon.

**Why it exists** — the problem it solves, in one line.
**Who it's for** — the audience + stack, so a wrong-fit reader leaves early.

<!--
Newcomer on-ramp: if the project is novel or uses 3+ domain-specific terms,
add a plain-language glossary here (see "Newcomer on-ramp" pattern below) so the
features and options that follow aren't cryptic. Omit it when the domain is common.
-->

## Features

- Feature 1
- Feature 2
- Feature 3

## Quick Start

\`\`\`bash
# Install
npm install

# Run
npm start
\`\`\`

## Installation

### Prerequisites

- Node.js >= 18
- npm or pnpm

### Setup

\`\`\`bash
# Clone repository
git clone https://github.com/user/project.git
cd project

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev
\`\`\`

## Usage

### Basic Example

\`\`\`typescript
import { Widget } from 'project';

const widget = new Widget({ option: 'value' });
widget.render();
\`\`\`

### Advanced Configuration

See [Configuration Guide](./docs/configuration.md)

## API Reference

See [API Documentation](./docs/api.md)

## Contributing

See [Contributing Guide](./CONTRIBUTING.md)

## License

MIT
```

---

## Newcomer on-ramp (novel or jargon-heavy projects)  [HIGH freedom]

When a project introduces its own concepts, the reader can't parse the feature list until they know the vocabulary. Add a compact **building-blocks glossary** high in the README — plain meaning + how the reader actually uses each thing. This is the single highest-leverage block for making docs land with non-experts:

```markdown
**The building blocks** — what the terms below actually mean:

| Building block | In plain English | You use it by… |
|:--|:--|:--|
| **Widget** | A self-contained unit that does one job | dropping it into a page |
| **Pipeline** | The path your data takes from input to output | pointing it at a source |
| **Adapter** | A connector to an outside service | adding its key to config |
```

Guidelines:

- **Three columns beat prose.** Term → plain meaning → how you trigger/use it. Use concrete verbs ("drop in", "point at", "add a key"), not dictionary definitions.
- Put it *above* the counts, options, or API — it's the decoder ring for everything below it.
- **Drop it when the domain is already familiar.** Don't gloss `useState` for a React audience; do gloss a term you invented.

---

## Documentation Types  [HIGH freedom]

### 1. API Documentation

```markdown
## createUser

Create a new user account.

### Signature

\`\`\`typescript
function createUser(params: CreateUserParams): Promise<User>
\`\`\`

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | User's display name |
| email | string | Yes | Valid email address |
| role | 'admin' \| 'user' | No | User role (default: 'user') |

### Returns

`Promise<User>` - The created user object

### Example

\`\`\`typescript
const user = await createUser({
 name: 'John Doe',
 email: 'john@example.com',
 role: 'admin'
});
\`\`\`

### Errors

| Error | Cause |
|-------|-------|
| `ValidationError` | Invalid email format |
| `ConflictError` | Email already exists |
```

### 2. Code Comments

```typescript
/**
 * Calculate the total price including tax and discounts.
 *
 * @param items - Array of cart items
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @param discount - Optional discount code
 * @returns Total price in cents
 *
 * @example
 * const total = calculateTotal(items, 0.1, 'SAVE10');
 */
function calculateTotal(
 items: CartItem[],
 taxRate: number,
 discount?: string
): number {
 // Sum up item prices
 const subtotal = items.reduce((sum, item) => sum + item.price, 0);

 // Apply discount if valid
 const discountAmount = discount ? getDiscountAmount(discount, subtotal) : 0;

 // Calculate tax on discounted amount
 const taxableAmount = subtotal - discountAmount;
 const tax = Math.round(taxableAmount * taxRate);

 return taxableAmount + tax;
}
```

### 3. Architecture Documentation

```markdown
# Architecture Overview

## System Components

\`\`\`
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Client │────▶│ API │────▶│ Database │
│ (React) │ │ (Node) │ │ (Postgres) │
└─────────────┘ └─────────────┘ └─────────────┘
 │
 ▼
 ┌─────────────┐
 │ Cache │
 │ (Redis) │
 └─────────────┘
\`\`\`

## Data Flow

1. Client sends request to API
2. API checks cache for data
3. If cache miss, query database
4. Store result in cache
5. Return response to client

## Key Decisions

### Why PostgreSQL?
- ACID compliance for financial data
- JSON support for flexible schemas
- Strong ecosystem

### Why Redis?
- Fast read performance
- Session storage
- Pub/sub for real-time features
```

---

## Writing Guidelines  [HIGH freedom]

### Be Concise

```markdown
# ❌ Too verbose
This function is responsible for taking an array of user objects
and filtering them based on the active status property, returning
only those users who have an active status of true.

# ✅ Concise
Filter users by active status.
```

### Use Examples

```markdown
# ❌ Abstract description
The function accepts configuration options.

# ✅ With example
Configure the logger:
\`\`\`typescript
const logger = createLogger({
 level: 'info',
 format: 'json',
 output: 'stdout'
});
\`\`\`
```

### Structure Information

Format by content shape: a list, table, or numbered steps when the content is multifaceted (options, parameters, an ordered setup); prose when it is one idea. Headings only where a reader would scan for them.

```markdown
# ❌ Wall of text
To install the package you need to run npm install, then create
a .env file with your configuration, then run the migrations...

# ✅ Structured steps
## Setup

1. Install dependencies
 \`\`\`bash
 npm install
 \`\`\`

2. Configure environment
 \`\`\`bash
 cp .env.example .env
 \`\`\`

3. Run migrations
 \`\`\`bash
 npm run migrate
 \`\`\`
```

### Kill the Jargon (beat the curse of knowledge)

```markdown
# ❌ Assumes the reader shares your context
Configure the RLS policy on the tenant-scoped RPC before hydrating the store.

# ✅ Plain first, precise second
Set who's allowed to read each row (a "policy") before the app loads its data.
(Supabase calls row rules "RLS"; loading data into the app is "hydrating the store.")
```

Lead with the plain-language version; put the precise term in parentheses or right after it. Never make a newcomer look up three words just to parse one sentence.

---

## Documentation Checklist  [LOW freedom — do not skip]

### README
- [ ] Opens by answering **what / why / who** in the first screen (plain language)
- [ ] Clear project description
- [ ] Quick start (< 5 steps)
- [ ] Prerequisites listed
- [ ] Installation instructions
- [ ] Basic usage example
- [ ] Jargon defined on first use, or a glossary added for 3+ domain terms
- [ ] Link to detailed docs

### API Docs
- [ ] All public functions documented
- [ ] Parameters and return types
- [ ] Usage examples
- [ ] Error cases documented

### Code Comments
- [ ] Complex logic explained
- [ ] "Why" not just "what"
- [ ] JSDoc for public APIs
- [ ] No obvious comments

### Architecture
- [ ] System overview diagram
- [ ] Component relationships
- [ ] Key decisions documented
- [ ] Data flow explained

---

## Helpful Diagrams  [HIGH freedom]

### Mermaid Flowchart

```markdown
\`\`\`mermaid
flowchart LR
 A[User] --> B[Frontend]
 B --> C[API]
 C --> D[Database]
 C --> E[Cache]
\`\`\`
```

### Sequence Diagram

```markdown
\`\`\`mermaid
sequenceDiagram
 User->>+API: POST /login
 API->>+DB: Verify credentials
 DB-->>-API: User data
 API-->>-User: JWT token
\`\`\`
```

---

## Keep Docs Updated  [HIGH freedom]

```markdown
# In PR template:
## Documentation
- [ ] README updated (if needed)
- [ ] API docs updated (if endpoints changed)
- [ ] Code comments added (for complex logic)
```
