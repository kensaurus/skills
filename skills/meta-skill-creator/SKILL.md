---
name: meta-skill-creator
description: >
  Create or update a pack SKILL.md (frontmatter, house limits, T1–T8). Use
  when authoring a kenji skill. Prompt-only upgrade →
  enhance-skill-prompts. Cursor skill wizard → create-skill.
license: Apache-2.0
---

# Skill Creator

**Degree of freedom: MIXED.** Authoring judgment is `[HIGH freedom]`;
house limits, frontmatter shape, and the T1–T8 checklist are
`[LOW freedom — do not skip]`.

Guidance for creating effective skills.

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing
specialized knowledge, workflows, and tools. Think of them as "onboarding guides" for specific
domains or tasks—they transform Claude from a general-purpose agent into a specialized agent
equipped with procedural knowledge that no model can fully possess.

### What Skills Provide

1. Specialized workflows - Multi-step procedures for specific domains
2. Tool integrations - working with specific file formats or APIs
3. Domain expertise - Company-specific knowledge, schemas, business logic
4. Bundled resources - Scripts, references, and assets for complex and repetitive tasks

## Core Principles

### Concise is Key

The context window is a public good. Skills share the context window with everything else Claude needs: system prompt, conversation history, other Skills' metadata, and the actual user request.

**Default assumption: Claude is already very smart.** Only add context Claude doesn't already have. Challenge each piece of information: "Does Claude really need this explanation?" and "Does this paragraph justify its token cost?"

Prefer concise examples over verbose explanations.

### Pruning — the verbosity levers

Every line must earn its tokens. Sweep each skill with these tests (adapted from
[mattpocock/skills](https://github.com/mattpocock/skills), MIT):

- **No-op test.** Does the line change behavior versus what the agent already
  does by default? "Be thorough" is a no-op; delete the whole sentence, don't
  trim words from it. A weak intensifier is cured by a stronger word
  (*relentless*), not more prose.
- **Positive phrasing.** Steering by prohibition backfires — "don't think of an
  elephant" names the elephant. State the target behavior so the banned one is
  never spoken; keep a prohibition only as a hard guardrail you can't phrase
  positively, paired with what to do instead.
- **Leading words.** Replace a restated quality with one compact concept the
  model already knows — "fast, deterministic, low-overhead" collapses to a
  *tight* loop. Fewer tokens and a sharper hook for the agent's thinking.
- **Single source of truth.** Each meaning lives in exactly one place; a
  duplicated rule costs maintenance, tokens, and inflates its apparent
  importance.
- **One trigger per branch.** In descriptions, synonyms that rename the same
  trigger are duplication — collapse them; keep only genuinely distinct
  branches.
- **Checkable completion criteria.** End each step on a condition the agent can
  verify ("every modified file accounted for"), not a vibe ("make sure it's
  good") — vague criteria invite premature completion.

### Invocation — who pays the cost

Two modes, trading different costs:

- **Model-invoked** (default): the description sits in context every turn so the
  agent can fire the skill autonomously. Pay this cost only when auto-triggering
  earns it.
- **User-invoked**: set `disable-model-invocation: true`. The description leaves
  the agent's always-on context — zero token cost — but only the user typing its
  name can fire it. Right for compactors, wrappers, and rituals the user always
  initiates deliberately (e.g. `handoff`).

### Set Appropriate Degrees of Freedom

Match the level of specificity to the task's fragility and variability:

**High freedom (text-based instructions)**: Use when multiple approaches are valid, decisions depend on context, or heuristics guide the approach.

**Medium freedom (pseudocode or scripts with parameters)**: Use when a preferred pattern exists, some variation is acceptable, or configuration affects behavior.

**Low freedom (specific scripts, few parameters)**: Use when operations are fragile and error-prone, consistency is critical, or a specific sequence must be followed.

Think of Claude as exploring a path: a narrow bridge with cliffs needs specific guardrails (low freedom), while an open field allows many routes (high freedom).

### Prompt techniques (T1–T8)

New skills should be *born* with these, not retrofitted later. Full procedure:
[docs/PROMPT-ENHANCEMENT-PLAYBOOK.md](../../docs/PROMPT-ENHANCEMENT-PLAYBOOK.md).
Upgrade an *existing* skill's prompt (not its behavior) with
`enhance-skill-prompts`.

| # | Technique | One-line rule |
|---|-----------|---------------|
| T1 | Degrees of freedom | Declare register under the H1; tag fragile phases LOW, interpretive HIGH |
| T2 | Classification contract | One named-stage record of what a finding contains, at judgment points; it never steers thinking ("think step by step") |
| T3 | One worked example | Chain and output shape on one realistic case, labeled illustrative |
| T4 | Self-critique rubric | Evidence conditions the output must satisfy (a command re-run, a form re-searched, a file listed) — never generic "double-check your work" items, which the model does unprompted |
| T5 | Terminology consistency | One term per concept |
| T6 | Conciseness | Cut restatements of trained defaults; never trim a LOW-freedom step's exactness |
| T7 | Effort declaration | `effort: high` for judgment, `low` for mechanical, omit for implementation (Step 4) |
| T8 | Volume, shape, communication | Each rule once at normal volume with its reason; outcomes, not choreography; never suppress updates |

House limits: description ≤320 chars (Claude Code caps description + `when_to_use` at 1,536), body <500 lines, `name` matches dir. Every description rides in every request — roughly 168 skills × 300 chars is 12-15k always-on tokens — so a description earns its length by routing, and a ritual nobody should auto-trigger goes `disable-model-invocation: true`.
Never write the retired layout alias (use `audit-responsive`).

## How to reason

1. **Observe** — the intended trigger, stance, and existing neighbor skills
2. **Interpret** — new skill vs prompt-only upgrade of an existing one
3. **Classify** — family, freedom register, effort tier, T1–T8 that must be born in the file
4. **Severity** — a missing trigger or a wrong family is a routing bug

## Worked example

> **Observe:** user wants a skill for "pin down glossary terms before coding."
> **Interpret:** that is `docs-domain-modeling`, not a new unprefixed name.
> **Classify:** do not author `glossary`; update the existing skill or stop.
> **If truly new:** `docs-<topic>`, T1 under H1, one T3, T4 rubric, description carries the trigger.

## Self-critique before reporting

- **Name matches dir** and the family-first convention
- **T1–T4 present as headings/register**, not only mentioned in a table
- **Description** carries distinct triggers; no clone of a neighbor
- **Right owner** — prompt-only upgrade of an existing skill → `enhance-skill-prompts`

### Anatomy of a Skill

Every skill consists of a required SKILL.md file and optional bundled resources:

```
skill-name/
├── SKILL.md (required)
│ ├── YAML frontmatter metadata (required)
│ │ ├── name: (required)
│ │ └── description: (required)
│ └── Markdown instructions (required)
└── Bundled Resources (optional)
 ├── scripts/ - Executable code (Python/Bash/etc.)
 ├── references/ - Documentation intended to be loaded into context as needed
 └── assets/ - Files used in output (templates, icons, fonts, etc.)
```

#### SKILL.md (required)

Every SKILL.md consists of:

- **Frontmatter** (YAML): `name` and `description` route the skill (Claude Code also reads `when_to_use` and `paths`), so the description must say what the skill does and when it fires; the optional keys listed in Step 4 control effort, invocation, and context.
- **Body** (Markdown): Instructions and guidance for using the skill. Only loaded AFTER the skill triggers (if at all).

#### Bundled Resources (optional)

##### Scripts (`scripts/`)

Executable code (Python/Bash/etc.) for tasks that require deterministic reliability or are repeatedly rewritten.

- **When to include**: When the same code is being rewritten repeatedly or deterministic reliability is needed
- **Example**: `scripts/rotate_pdf.py` for PDF rotation tasks
- **Benefits**: Token efficient, deterministic, may be executed without loading into context
- **Note**: Scripts may still need to be read by Claude for patching or environment-specific adjustments

##### References (`references/`)

Documentation and reference material intended to be loaded as needed into context to inform Claude's process and thinking.

- **When to include**: For documentation that Claude should reference while working
- **Examples**: `references/finance.md` for financial schemas, `references/mnda.md` for company NDA template, `references/policies.md` for company policies, `references/api_docs.md` for API specifications
- **Use cases**: Database schemas, API documentation, domain knowledge, company policies, detailed workflow guides
- **Benefits**: Keeps SKILL.md lean, loaded only when Claude determines it's needed
- **Best practice**: If files are large (>10k words), include grep search patterns in SKILL.md
- **Avoid duplication**: Information should live in either SKILL.md or references files, not both

##### Assets (`assets/`)

Files not intended to be loaded into context, but rather used within the output Claude produces.

- **When to include**: When the skill needs files that will be used in the final output
- **Examples**: `assets/logo.png` for brand assets, `assets/slides.pptx` for PowerPoint templates, `assets/frontend-template/` for HTML/React boilerplate, `assets/font.ttf` for typography
- **Use cases**: Templates, images, icons, boilerplate code, fonts, sample documents that get copied or modified
- **Benefits**: Separates output resources from documentation, enables Claude to use files without loading them into context

#### What to Not Include in a Skill

A skill should only contain essential files that directly support its functionality. Do NOT create extraneous documentation or auxiliary files, including:

- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- etc.

The skill should only contain the information needed for an AI agent to do the job at hand.

### Progressive Disclosure Design Principle

Skills use a three-level loading system to manage context efficiently:

1. **Metadata (name + description)** - Always in context (~100 words)
2. **SKILL.md body** - When skill triggers (<5k words)
3. **Bundled resources** - As needed by Claude (Unlimited because scripts can be executed without reading into context window)

## Skill Creation Process

Skill creation involves these steps:

1. Understand the skill with concrete examples
2. Plan reusable skill contents (scripts, references, assets)
3. Initialize the skill
4. Edit the skill (implement resources and write SKILL.md)
5. Iterate based on real usage

### Step 1: Understanding the Skill with Concrete Examples

To create an effective skill, clearly understand concrete examples of how the skill will be used. This understanding can come from either direct user examples or generated examples that are validated with user feedback.

For example, when building an image-editor skill, relevant questions include:

- "What functionality should the image-editor skill support? Editing, rotating, anything else?"
- "Can you give some examples of how this skill would be used?"
- "I can imagine users asking for things like 'Remove the red-eye from this image' or 'Rotate this image'. Are there other ways you imagine this skill being used?"
- "What would a user say that should trigger this skill?"

Conclude this step when there is a clear sense of the functionality the skill should support.

### Step 2: Planning the Reusable Skill Contents

To turn concrete examples into an effective skill, analyze each example by:

1. Considering how to execute on the example from scratch
2. Identifying what scripts, references, and assets would be helpful when executing these workflows repeatedly

### Step 3: Initializing the Skill

Create the skill directory structure:

```
skill-name/
├── SKILL.md
├── scripts/ (optional)
├── references/ (optional)
└── assets/ (optional)
```

### Step 4: Edit the Skill

When editing the skill, remember that the skill is being created for another instance of Claude to use. Include information that would be beneficial and non-obvious to Claude.

#### Update SKILL.md

**Writing Guidelines:** Imperative/infinitive form. Say exactly what you mean at normal volume and give the reason — MUST/NEVER/CRITICAL over-trigger, and hedges ("try to", "if possible") read as permission to under-deliver. State outcomes, constraints, and how to verify; keep numbered exact steps for fragile operations only (destructive commands, auth, migrations, baseline capture). No "think step by step", "be thorough", or "double-check" scaffolds — effort controls thinking and the model self-verifies; keep evidence-grounding rules ("cite the tool result"). The always-on verification rule already asks for an intent line, load-bearing notes, and a recap — do not repeat it per skill and never suppress it ("no preamble", "hold findings"); skills that run unattended say when the turn may end. Anti-formatting rules strip structure the reader wanted — say when formatting fits (lists for multifaceted content, prose otherwise). Model-agnostic guardrails stay: no deleting or skipping tests to go green, no weakened assertions, no metric gaming.

##### Frontmatter

Write the YAML frontmatter with `name` and `description`:

- `name`: The skill name
- `description`: This is the primary triggering mechanism for your skill, and helps Claude understand when to use the skill.
 - Include both what the Skill does and specific triggers/contexts for when to use it.
 - Include all "when to use" information here - Not in the body. The body is only loaded after triggering, so "When to Use This Skill" sections in the body are not helpful to Claude.

Other fields, all optional and ignored by hosts that do not know them:

- `effort:` — Opus 5.5 defaults to `medium` (earlier models defaulted to `high`), and effort is its only thinking control; prose like "think step by step" or "double-check" does nothing. Declare it by family:

  | Family | `effort` |
  |---|---|
  | audit-*, plan-*, judge/reviewer agents, security, architecture, debug-* | `high` |
  | the hardest planning only, with a measured gain | `xhigh` |
  | ordinary implementation (build, enhance, workflow) | omit (medium) |
  | mechanical / read-only / formatting / handoff / inventory / smoke checks | `low` |

- `disable-model-invocation: true` — user-only rituals (see "Invocation — who pays the cost").
- `user-invocable: false` — reference-only skills that other skills load (protocols, maps); hidden from the menu, still model-loadable.
- `context: fork` + `agent: Explore` — a read-only inventory skill that should not fill the main context.
- `license`.

##### Body

Write using the skill and its bundled resources.

### Step 5: Iterate

After testing the skill, users may request improvements. Often this happens right after using the skill, with fresh context of how the skill performed.

**Iteration workflow:**

1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Identify how SKILL.md or bundled resources should be updated
4. Implement changes and test again

## Related

- `audit-skill-conflicts` — after a batch of skills: contradictions, trigger overlap, stale refs
- `enhance-skill-prompts` — upgrade an existing skill's prompt (T1–T8), not its behavior
- `meta-mcp-builder` — MCP servers, not SKILL.md
- `enhance-agent-guardrails` — app-repo policy, not pack authoring
