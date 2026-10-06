# MCP Server Configuration

Model Context Protocol (MCP) servers extend Cursor's AI with external tools and services.

## Templates

| File | Description |
|------|-------------|
| `mcp.json.template` | **Essential** — Firecrawl (authenticated) + Context7 + Supabase. Prefer Cursor plugins for Context7 / Supabase / Sentry / Stripe when those are already connected. |
| `mcp-full.json.template` | **Full suite** — optional extras: Playwright MCP fallback, Chrome DevTools, AWS, GitHub, Postgres, Redis, Slack, Notion, Memory |

Copy your preferred template:

```bash
# Essential (recommended to start)
cp mcp/mcp.json.template ~/.cursor/mcp.json

# Full suite (pick what you need)
cp mcp/mcp-full.json.template ~/.cursor/mcp.json
```

Then set `FIRECRAWL_API_KEY`, `CONTEXT7_API_KEY`, and `SUPABASE_ACCESS_TOKEN` in the environment (Cursor interpolates `${env:NAME}`). Do not paste live keys into `mcp.json`. Prefer Cursor's `envFile` pointing at a chmod-restricted file such as `~/.cursor/mcp.env`.

Claude Code live config (`~/.claude.json`) uses `${NAME}` (no `env:` prefix). Never put `${env:…}` inside Claude `settings.json` `env` — that block is real environment values. `claude mcp list` reads `~/.claude.json`, not an `mcpServers` block in `settings.json`.

---

## Server Reference

### Tier 1: Essential (defaults)

| Server | API Key? | What it Does |
|--------|----------|-------------|
| **Firecrawl** | Yes | Web scraping for research ([firecrawl.dev](https://firecrawl.dev)). Keep authenticated. Set `FIRECRAWL_NO_SEARCH_FEEDBACK=1` and `FIRECRAWL_NO_ENDPOINT_FEEDBACK=1` to skip unused feedback tools. |
| **Context7** | Yes (API key) | Live library documentation. Skip this stdio server if the Context7 Cursor plugin is already connected. |
| **Supabase** | Yes | Direct DB access, auth, storage, migrations. Skip if the Supabase Cursor plugin is already connected. |

**Not in the default template:** Playwright MCP (skills use **headed `playwright-cli`**, not the MCP). Reasoning depth is set with effort (`/effort`, or a skill's `effort:` frontmatter), not with a reasoning server — see ADR-0009.

Chrome DevTools MCP is in the full template — attach to Chrome with `--remote-debugging-port=9222` (see below).

### Tier 2: Development servers

| Server | API Key? | What it Does |
|--------|----------|-------------|
| **GitHub** | Yes (PAT) | Repos, issues, PRs, code search, reviews |
| **GitHub Official** | Yes (PAT) | Official Go-based server (Docker, more features) |
| **Chrome DevTools** | No* | Attach to running Chrome for console checks, screenshots |
| **Postgres** | Yes (conn) | Direct PostgreSQL queries, schema inspection |
| **Memory** | No | Persistent memory across sessions |

### Tier 3: Cloud & Infrastructure

| Server | API Key? | What it Does |
|--------|----------|-------------|
| **AWS Lambda** | Yes (profile) | Lambda functions, deployments, logs |
| **AWS S3** | Yes (profile) | Bucket management, file operations |
| **AWS CloudWatch** | Yes (profile) | Log queries, metrics, alarms |
| **Redis** | Yes (URL) | Key-value store operations |

### Tier 4: Productivity

| Server | API Key? | What it Does |
|--------|----------|-------------|
| **Slack** | Yes (bot) | Read/send messages, manage channels |
| **Notion** | Yes | Search/manage pages, databases |

---

## Setup Guides

### GitHub MCP Server

The most useful addition after the essentials. Two options:

**Option A: npm-based (simpler)**
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_PERSONAL_ACCESS_TOKEN}"
    }
  }
}
```

**Option B: Official Docker-based (more features)**
```json
{
  "github-official": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_PERSONAL_ACCESS_TOKEN}"
    }
  }
}
```

**Get a token:** [github.com/settings/tokens](https://github.com/settings/tokens) → Fine-grained → Permissions: Repository (Contents, Issues, PRs, Admin), User (Read-only)

**What you can do:**
- "Search for all open issues labeled `bug` in my repo"
- "Create a PR from current branch with a summary"
- "What changed in the last 5 commits?"
- "Review PR #42 for security issues"

---

### AWS MCP Servers

Requires AWS CLI configured with credentials (`aws configure`).

```bash
# Install Python-based AWS MCP servers
pip install uvx  # or use pipx
```

```json
{
  "aws-lambda": {
    "command": "uvx",
    "args": ["awslabs.lambda-tool-mcp-server@2.1.1"],
    "env": {
      "AWS_PROFILE": "default",
      "AWS_REGION": "ap-northeast-1"
    }
  }
}
```

**What you can do:**
- "List all Lambda functions in my account"
- "Check CloudWatch logs for errors in the last hour"
- "Upload this file to my S3 bucket"
- "What's the invocation count for my API function?"

---

### Playwright — use the CLI, not the MCP

> **The skills in this repo drive browsers with `playwright-cli`, not the Playwright MCP.**
> The MCP serves one browser per server and a persistent profile can only be locked by one
> process at a time, so parallel agents collide over tabs and profile locks. The CLI gives every
> agent an isolated browser via `-s=<session>` and costs far fewer tokens (no tool schemas or
> accessibility trees loaded into context).

No MCP entry required. Install nothing globally — the skills invoke it through `npx`:

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=agent1 open --headed http://localhost:3000
$PW -s=agent2 open --headed https://example.com   # separate browser, zero conflict
$PW list                                          # see every session
$PW close-all                                     # tear down
```

See `skills/protocol-browser-anti-stall/` for the full protocol, the
[MCP→CLI command map](../skills/protocol-browser-anti-stall/references/mcp-to-cli-map.md), and
persistent-login setup (including the Google sign-in workaround).

**Optional fallback** — if you specifically need the MCP, run it isolated so parallel servers
don't fight over one profile (you lose saved logins):

```json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@playwright/mcp@0.0.81", "--isolated"]
  }
}
```

Pinned versions: see [VERSIONS.md](VERSIONS.md) and [pinned-versions.json](pinned-versions.json). CI fails on `@latest` drift.

**What you can do:**
- "Open localhost:3000 and take a screenshot"
- "Fill in the login form and submit"
- "Check if the dashboard loads correctly"
- "Run accessibility checks on the signup page"

No need to launch Chrome separately (unlike Chrome DevTools MCP).

---

### Chrome DevTools MCP

Requires Chrome running with remote debugging:

```bash
# Linux
google-chrome --remote-debugging-port=9222

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

Or use the shell alias:
```bash
source ~/skills/shell-aliases/cursor-helpers.sh
cursor-dev  # Opens Chrome + Cursor together
```

---

### Memory MCP Server

Persistent memory that survives across sessions:

```json
{
  "memory": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-memory"]
  }
}
```

**What you can do:**
- AI remembers architecture decisions from past conversations
- Stores user preferences and project context
- Recalls past debugging sessions and solutions

---

## Recommended Configurations

### Solo Developer (Web App)
```
firecrawl + context7-or-plugin + supabase-or-plugin + github (optional)
```
Browser QA: `playwright-cli`, not Playwright MCP.

### Team / Full-Stack
```
All of above + postgres + memory + slack
```

### AWS Cloud Development
```
firecrawl + context7 + aws-lambda + aws-s3 + aws-cloudwatch + github
```

### Content / Product
```
firecrawl + context7 + github + notion + slack + memory
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Server not starting | Check `npx` is available: `which npx` |
| "Bad credentials" | Regenerate token, check permissions |
| Chrome DevTools fails | Ensure Chrome running with `--remote-debugging-port=9222` |
| AWS servers fail | Run `aws sts get-caller-identity` to verify credentials |
| Slow startup | Remove servers you don't use (each spawns a process) |

**Performance tip:** Only enable servers you actively use. Each server is a background process. The essential three (Firecrawl + Context7 + Supabase) is a good baseline; add others as needed.
