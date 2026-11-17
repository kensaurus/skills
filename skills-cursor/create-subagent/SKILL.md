---
name: create-subagent
description: Create custom subagents for specialized AI tasks. Use when the user wants to create a new type of subagent, set up task-specific agents, configure code reviewers, debuggers, or domain-specific assistants with custom prompts.
disable-model-invocation: true
---
# Creating Custom Subagents

This skill guides you through creating custom subagents for Cursor. Subagents are specialized AI assistants that run in isolated contexts with custom system prompts.

## When to Use Subagents

Subagents help you:
- **Preserve context** by isolating exploration from your main conversation
- **Specialize behavior** with focused system prompts for specific domains
- **Reuse configurations** across projects with user-level subagents

Delegate when the track is sizeable and independent, or when its output is verbose and the main context does not need it; launch independent subagents in one message. A handful of tool calls is cheaper inline. Brief each subagent precisely once and commit to the delegation.

### Inferring from Context

If you have previous conversation context, infer the subagent's purpose and behavior from what was discussed. Create the subagent based on specialized tasks or workflows that emerged in the conversation.

## Subagent Locations

| Location | Scope | Priority |
|----------|-------|----------|
| `.cursor/agents/` | Current project | Higher |
| `~/.cursor/agents/` | All your projects | Lower |

When multiple subagents share the same name, the higher-priority location wins.

**Project subagents** (`.cursor/agents/`): Ideal for codebase-specific agents. Check into version control to share with your team.

**User subagents** (`~/.cursor/agents/`): Personal agents available across all your projects.

## Subagent File Format

Create a `.md` file with YAML frontmatter and a markdown body (the system prompt):

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | Unique identifier (lowercase letters and hyphens only) |
| `description` | When to delegate to this subagent (be specific!) |

### Optional fields (Claude Code)

Claude Code reads the same format from `.claude/agents/` and `~/.claude/agents/` and honors these; Cursor ignores keys it does not know.

| Field | Use |
|-------|-----|
| `effort` | `low` / `medium` / `high` / `xhigh` / `max`. Omit it to use the session's level; set `high` for reviewer, judge, security, and architecture agents, `low` for read-only inventory or handoff agents. Prose like "think carefully" does nothing — this is the control. |
| `model` | Pin a model alias (`opus`, `sonnet`, `haiku`); omit to inherit. |
| `tools` | Restrict the tool set (read-only reviewers get no edit tools). |
| `maxTurns` | Cap turns for bounded jobs. |
| `memory`, `isolation`, `omitClaudeMd` | Persistent memory, worktree isolation, skip loading CLAUDE.md. |

## Writing Effective Descriptions

The description is **critical** - the AI uses it to decide when to delegate.

```yaml
# ❌ Too vague
description: Helps with code

# ✅ Specific and actionable
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
```

Say when delegating pays — a sizeable, independent track, or verbose output the main context does not need. Add "use proactively" only when the agent visibly under-delegates; current models delegate readily, and a blanket booster pulls small tasks into subagents.

## Example Subagents

### Code Reviewer

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review for correctness and requirement gaps: logic errors, unhandled failure paths, exposed secrets or keys, missing input validation, and behavior the task asked for that is absent. Mention style only where it hides a bug. Tie each finding to a file and line and say what input or state makes it fail.

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)

Include specific examples of how to fix issues.
```

### Debugger

```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

Debugging process:
- Analyze error messages and logs
- Check recent code changes
- Form and test hypotheses
- Add strategic debug logging
- Inspect variable states

For each issue, provide:
- Root cause explanation
- Evidence supporting the diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations

Focus on fixing the underlying issue, not the symptoms.
```

### Data Scientist

```markdown
---
name: data-scientist
description: Data analysis expert for SQL queries, BigQuery operations, and data insights. Use proactively for data analysis tasks and queries.
---

You are a data scientist specializing in SQL and BigQuery analysis.

When invoked:
1. Understand the data analysis requirement
2. Write efficient SQL queries
3. Use BigQuery command line tools (bq) when appropriate
4. Analyze and summarize results
5. Present findings clearly

Key practices:
- Write optimized SQL queries with proper filters
- Use appropriate aggregations and joins
- Include comments explaining complex logic
- Format results for readability
- Provide data-driven recommendations

For each analysis:
- Explain the query approach
- Document any assumptions
- Highlight key findings
- Suggest next steps based on data

Always ensure queries are efficient and cost-effective.
```

## Subagent Creation Workflow

### Step 1: Decide the Scope

- **Project-level** (`.cursor/agents/`): For codebase-specific agents shared with team
- **User-level** (`~/.cursor/agents/`): For personal agents across all projects

### Step 2: Create the File

```bash
# For project-level
mkdir -p .cursor/agents
touch .cursor/agents/my-agent.md

# For user-level
mkdir -p ~/.cursor/agents
touch ~/.cursor/agents/my-agent.md
```

### Step 3: Define Configuration

Write the frontmatter with the required fields (`name` and `description`).

### Step 4: Write the System Prompt

The body becomes the system prompt. Be specific about:
- What the agent should do when invoked
- Outcomes, constraints, and how to verify (exact steps only for fragile operations); reviewer and judge agents flag only correctness and requirement gaps
- Output format and structure
- Any constraints or guidelines

### Step 5: Test the Agent

Ask the AI to use your new agent:

```
Use the my-agent subagent to [task description]
```

## Best Practices

1. **Design focused subagents**: Each should excel at one specific task
2. **Write detailed descriptions**: Include trigger terms so the AI knows when to delegate
3. **Check into version control**: Share project subagents with your team
4. **Describe when delegation pays**: the description is what the main agent reads to decide; state the track size and independence it needs, not a blanket "use proactively"

## Troubleshooting

### Subagent Not Found
- Ensure file is in `.cursor/agents/` or `~/.cursor/agents/`
- Check file has `.md` extension
- Verify YAML frontmatter syntax is valid
