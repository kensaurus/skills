---
name: iterate-post-launch
description: >
  Close the feedback loop on a live app: read production signals, rank the top
  issues, fix, verify live, repeat. Use when "post-launch polish", "fix the
  top production issues", "iterate on feedback", or "what should I fix next
  after launch?".
license: MIT
---

# iterate-post-launch — Production Signal → Prioritised Fix Loop

**Degree of freedom: MIXED.** Triage and sprint plan `[HIGH freedom]`;
signal pulls, confirmation-before-edit, and live verify
`[LOW freedom — run exactly]`.

**You shipped. That is the beginning, not the end.** Real users hit real paths
you did not test. Sentry, Supabase logs, and the live UI tell you exactly what
to fix next — if you know how to read them. This skill turns those signals into
a ranked, actionable improvement plan and then implements it.

> **Plan → Signal → Triage → Fix → Verify.** Do not guess what to improve.
> Let production data point to the highest-impact work first.

**Before ANY browser action, read `protocol-browser-anti-stall`.**

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **iterate-post-launch** (this) | Production signals ranked, fixed, and verified live in a loop |
| `iterate-gtm-weekly` | Weekly growth review: funnel, drop-off, one experiment, one post |
| `workflow-launch-ready` | Launch-preparation sweep before going live |

## How to reason

1. **Observe** — Sentry, Supabase logs/advisors, and a headed walkthrough in parallel
2. **Interpret** — impact × effort from those signals, not a guessed redesign
3. **Classify** — Critical / High / Medium / Low; present the sprint before editing
4. **Verify** — live Playwright (or the failing query) before resolving the Sentry issue

## Worked example

> **Observe:** Sentry `TypeError` on `/checkout` 2.4k events / 14d; advisor missing index on `orders(user_id)`; live empty cart has no message.
> **Interpret:** checkout crash blocks paying users — outranks the index and the empty state.
> **Classify:** Critical = crash fix; High = index; Medium = empty-cart copy. Present that sprint; do not start a homepage rewrite.
> **Verify:** headed `-s=post-launch` replay of checkout → 2xx; then `sentry:update_issue` resolved.

## Self-critique before reporting

- **Signal-backed** — every fix traces to Sentry, logs, advisors, or the walkthrough
- **Live before resolve** — Playwright or the query, then Sentry resolved
- **Rows ask first** — asked-for schema ships; DELETE/UPDATE on real rows waits
- **Right owner** — one named bug → `workflow-fix-and-ship`

---

## Phase 0: Context  [LOW freedom — run exactly]

Read the stack before pulling any signals:

```
package.json → framework, Sentry SDK, Supabase client version
.env.local    → SENTRY_ORG, SENTRY_PROJECT, SUPABASE_PROJECT_ID (name only)
README        → any known issues the team is tracking
```

Confirm available MCPs: `sentry`, `supabase`,
`firecrawl`, `playwright`.

---

## Phase 1: Pull production signals  [LOW freedom — pull these sources]

Run all signal sources in parallel, then synthesise.

### 1a. Sentry — errors and performance

Look up the tool schemas first.

```json
sentry:search_issues
{
  "organizationSlug": "<ORG>",
  "query": "unresolved issues last 14 days sorted by frequency",
  "projectSlugOrId": "<PROJECT>",
  "regionUrl": "<REGION_URL>",
  "limit": 25
}
```

For each top-5 issue, get root-cause analysis:
```json
sentry:analyze_issue_with_seer
{
  "organizationSlug": "<ORG>",
  "issueId": "<ISSUE_ID>",
  "regionUrl": "<REGION_URL>"
}
```

Record per issue: title, frequency (events/users), first/last seen, component.

### 1b. Supabase — query performance and API failures

```json
supabase:query_logs
{
  "sql": "select timestamp, event_message, log_attributes['request.method'] as method, log_attributes['request.path'] as path, log_attributes['response.status_code'] as status_code from logs where source = 'edge_logs' order by timestamp desc limit 100"
}
```

```json
supabase:query_logs
{
  "sql": "select timestamp, event_message, log_attributes['parsed.error_severity'] as error_severity from logs where source = 'postgres_logs' order by timestamp desc limit 100"
}
```

```json
supabase:get_advisors
{
  "type": "security"
}
```

```json
supabase:get_advisors
{
  "type": "performance"
}
```

`query_logs` (read-only ClickHouse SQL over one `logs` table, filtered by
`source`) replaces `get_logs` on current servers. It reads the last 24 hours
unless you pass `iso_timestamp_start` / `iso_timestamp_end`.

Flag:
- API: repeated 5xx, slow responses (>1 s), CORS errors, RLS denies
- Postgres: sequential scans on large tables, missing indexes, bloated RLS policies
- Advisors: ERROR-level items = immediate action; WARN = scheduled

### 1c. Live UX walkthrough (Playwright)

Navigate the app's 3–5 most-used flows as a real user. Look for:
- Anything that is obviously broken, slow, or confusing
- Empty/error states that have no message
- Console errors and network failures during normal use

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=post-launch open --headed "<app-url>"     # then `goto` each primary page
$PW -s=post-launch console                        # capture errors
$PW -s=post-launch requests                       # capture 4xx/5xx
$PW -s=post-launch screenshot --filename ".playwright-mcp/post-launch-<page>.png"
```

### 1d. Research best practices for flagged areas

For each signal category that surfaced issues:
```json
firecrawl:firecrawl_search
{
  "query": "<framework> <issue-type> fix best practices <current year>",
  "limit": 3,
  "sources": [{ "type": "web" }]
}
```

---

## Phase 2: Triage — rank by impact × effort  [HIGH freedom]

Build an improvement backlog. For each finding:

| Field | What to fill |
|-------|-------------|
| Source | Sentry / Supabase logs / Advisor / Live walkthrough |
| Finding | One sentence describing what is wrong |
| Affected users | High (blocks most users) / Medium (hits some) / Low (edge case) |
| Effort | S (< 1 h) / M (half day) / L (multi-day, consider splitting) |
| Priority | Critical / High / Medium / Low |

**Priority mapping**:
- Critical: production crash or data loss affecting real users
- High: broken feature, significant UX failure, missing index on hot query
- Medium: degraded experience, slow query, console error not shown to user
- Low: cosmetic issue, info-only log noise, minor UX annoyance

Sort the backlog: Critical first, then by impact ÷ effort (quick wins above hard ones).

---

## Phase 3: Plan the improvement sprint  [HIGH freedom]

For the top 5–10 items, map each to specific code:

```
Improvement: [title]
Root cause: [1 sentence]
Fix: [file path + what to change]
Verify: [how to confirm it is fixed]
Risk: [low / medium — explain if medium+]
```

Present the plan to the user. Get confirmation before making changes.

---

## Phase 4: Implement fixes  [LOW freedom — surgical]

Work through the approved list one by one, following
`workflow-coding-discipline` principles:

1. Read the file before editing. Understand the existing pattern.
2. Make the surgical change. No refactoring unrelated code.
3. Run the repo's lint/typecheck after each edit (Cursor: `ReadLints`). Fix introduced errors.
4. For Supabase schema fixes (missing index, RLS policy):
   - Deploy via MCP: `apply_migration` for DDL, `execute_sql` for data fixes
   - Write the matching versioned migration file under `supabase/migrations/`
   - Verify the object exists: query `information_schema` / `pg_indexes` / `pg_policies`

---

## Phase 5: Verify each fix  [LOW freedom — run exactly]

After each fix, drive the specific flow that was broken:

```bash
$PW -s=post-launch goto "<affected-page>"
$PW -s=post-launch snapshot                       # confirm page renders correctly
# … reproduce the original scenario as a real user …
$PW -s=post-launch console                        # green (no new errors)
$PW -s=post-launch requests                       # 2xx where it was failing
$PW -s=post-launch screenshot --filename ".playwright-mcp/fixed-<flow>.png"
```

For Supabase fixes, re-run the failing query with `execute_sql` and confirm
the performance improvement or policy correction.

For Sentry issues: mark as resolved only after live verification confirms the
fix, not before:
```json
sentry:update_issue
{
  "organizationSlug": "<ORG>",
  "issueId": "<ISSUE_ID>",
  "status": "resolved",
  "regionUrl": "<REGION_URL>"
}
```

`update_issue` needs the Triage skill on the Sentry MCP connection; if the tool
is missing, resolve the issue in the Sentry UI instead.

---

## Phase 6: Improvement report  [LOW freedom — this shape]

```markdown
## Post-Launch Improvement Report — [App] — [Date]

### Signal sources checked
- Sentry: [issue count, date range]
- Supabase logs: [service, date range]
- Supabase advisors: [ERROR count / WARN count]
- Live walkthrough: [pages tested]

### Improvements implemented
| # | Source | Finding | Fix (file) | Verified |
|---|--------|---------|-----------|---------|
| 1 | Sentry | [error] | [file:line] | ✅ |

### Deferred (needs more investigation or is out of scope)
| # | Finding | Why deferred | Recommendation |
|---|---------|-------------|----------------|

### Remaining Sentry noise
- [issues that are known / won't-fix / need tracking ticket]

### Before / after summary
- Errors resolved: [count]
- Queries improved: [count, estimated ms saved]
- UX issues fixed: [count]
```

---

## Guardrails

- **No speculative improvements** — only act on signal from production data.
- **Ask before deleting or restructuring** — fixes should be surgical.
- **Schema the user asked for ships; DELETE/UPDATE on real rows asks first.**
- **Re-test every fix live** — a fix is not done until Playwright confirms it.

## Related

- `audit-analytics` — prove the funnel events this loop iterates on actually fire
- `test-red-team` / `deploy-verify` / `debug-sentry-monitor` / `test-playwright`

