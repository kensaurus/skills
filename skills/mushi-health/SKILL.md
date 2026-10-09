---
name: mushi-health
description: >-
  Pass/fail health check across every Mushi Mushi pipeline component — CLI
  credentials, API reachability, edge functions, BYOK key pool, QA cron.
  Use when "is mushi working", "mushi health check", "check mushi pipeline",
  "mushi deploy check", "pipeline not responding", or right after setup.
license: MIT
disable-model-invocation: true
effort: low
---

# Mushi Health Check

**Degree of freedom: MIXED.** First-red diagnosis `[HIGH freedom]`;
Steps 1–6 in order `[LOW freedom — run exactly]`.

## How to reason

1. **Observe** — `doctor`, `deploy check`, keys, logs, cron — in that order
2. **Interpret** — first red is root vs downstream symptom
3. **Classify** — creds / functions-down / keys / logs / cron-missing
4. **Severity** — paused project or invalid API key outranks a quiet QA cron on a new project

## Worked example

> **Observe:** `mushi doctor` green; `mushi deploy check` ✗ `qa-story-runner`; `qa_story_runs` empty for 2h.
> **Interpret:** first red is the runner; empty cron is downstream.
> **Classify:** function-down — check `query_logs` for `qa-story-runner`; do not add keys yet.
> **Verify:** stop at Step 2; fix the runner; continue remaining steps only after it is green.

## Self-critique before reporting

- **In order** — did not skip ahead of the first ❌
- **Evidence** — each row cites command output or a query, not memory
- **Stopped to fix** — first red was remediated before later steps
- **Right owner** — e2e loop proof → `mushi-integration`; targeted diagnosis → `diagnose_setup`

Run these checks in order. Stop and fix at the first ❌ before continuing.

## Component map

| # | Component | How to check |
|---|-----------|-------------|
| 1 | CLI credentials | `mushi doctor` |
| 2 | API + edge functions | `mushi deploy check` |
| 3 | Project overview | `mushi status` |
| 4 | BYOK key pool | `mushi keys list` or MCP `list_byok_keys` |
| 5 | Supabase logs | Supabase MCP `query_logs` |
| 6 | QA cron running | DB query on `qa_story_runs` |

---

## Step 1 — CLI credentials  [LOW freedom — run exactly]

```bash
mushi doctor
```

Expected output — all lines green:

```
✓  ~/.mushirc found
✓  MUSHI_API_KEY valid (mushi_...)
✓  MUSHI_API_ENDPOINT reachable (200 OK)
✓  MUSHI_PROJECT_ID matches a live project
✓  Feature flags fetched
```

**Fix if red:** Re-run `mushi login --api-key mushi_... --endpoint https://<ref>.supabase.co/functions/v1/api --project-id <pid>`.

---

## Step 2 — API + edge functions  [LOW freedom — run exactly]

```bash
mushi deploy check
```

Probes each edge function with a lightweight ping. Healthy output:

```
✓  api
✓  classify-report
✓  fix-worker
✓  story-mapper
✓  test-gen-from-story   # Mushi edge function, not a pack skill
✓  pdca-runner
✓  qa-story-runner
```

A `✗` on any line means that function is down. Check its logs in Step 5.

---

## Step 3 — Project overview  [LOW freedom — run exactly]

```bash
mushi status
```

Confirm:
- Report count is non-zero (or expected zero for a brand-new project).
- `autofix_agent` shows the expected agent (`cursor_cloud`, `mcp`, etc.).
- No `billing: quota_exceeded` warning.

---

## Step 4 — BYOK key pool  [LOW freedom — run exactly]

Via CLI:

```bash
mushi keys list
```

Via MCP (if the Mushi MCP server is active in Cursor):

```
list_byok_keys(projectId)
```

**Healthy:** at least one `anthropic` key with `status=active`, at least one `firecrawl` key with `status=active`.

**Fix:** Add a missing or exhausted key:

```bash
mushi keys add --provider anthropic --key sk-ant-... --label "primary" --priority 100
mushi keys add --provider firecrawl --key fc-...   --label "primary" --priority 100
```

---

## Step 5 — Supabase edge function logs  [LOW freedom — run exactly]

Use the Supabase MCP (requires `SUPABASE_ACCESS_TOKEN` in MCP config):

```
query_logs(sql: "select timestamp, log_attributes['function_id'] as function_id, log_attributes['level'] as level, event_message from logs where source = 'function_logs' order by timestamp desc limit 100", iso_timestamp_start: "<ISO 8601, 15 min ago>")
```

`function_logs` holds console output from inside each function;
`function_edge_logs` holds the invocations and their status codes.
`function_id` is the `id` that `list_edge_functions` returns for each slug.
Look for `ERROR` lines in the last 15 minutes, especially from these
**Mushi edge functions** (not pack skills):
- `story-mapper` — Firecrawl timeout or Claude quota
- `test-gen-from-story` — LLM key exhausted
- `pdca-runner` — failed PDCA cycle
- `qa-story-runner` — Browserbase quota or Firecrawl error

If the Supabase MCP is not wired in Cursor, use the CLI:

```bash
supabase functions logs story-mapper --project-ref <ref>
supabase functions logs qa-story-runner --project-ref <ref>
```

---

## Step 6 — QA cron running  [LOW freedom — run exactly]

Verify scheduled tests are executing (requires Supabase MCP):

```sql
SELECT status, COUNT(*) 
FROM qa_story_runs 
WHERE created_at > NOW() - INTERVAL '2 hours'
GROUP BY status;
```

**Healthy output:** at least one `completed` row in the last 2 hours (if you have enabled stories).

If `qa_story_runs` is empty:
1. Confirm at least one story has `enabled = true` and `approval_status = 'approved'`.
2. Confirm the pg_cron job is registered: `SELECT jobname, schedule FROM cron.job WHERE jobname LIKE 'qa%';`
3. Manually trigger: `mushi tdd run <qa-story-id>` and re-check.

---

## Pass/Fail Summary Template  [LOW freedom — do not skip]

After running all steps, record results:

| Component | Status | Notes |
|-----------|--------|-------|
| CLI credentials | ✅ / ❌ | |
| Edge functions | ✅ / ❌ | Which ones failed? |
| Project overview | ✅ / ❌ | Billing ok? |
| BYOK key pool | ✅ / ❌ | Missing providers? |
| Supabase logs | ✅ / ❌ | Any ERRORs? |
| QA cron | ✅ / ❌ | Last run at? |

If all ✅ → pipeline is healthy.  
If any ❌ → run the mushi MCP `diagnose_setup` tool for targeted diagnosis when the Mushi MCP server is configured (the `@mushi-mushi/mcp` package; this pack does not bundle it). Without it, run `mushi doctor` and follow `debug-error` on the failing component.

---

## Common causes of all-red  [HIGH freedom]

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `mushi doctor` can't reach endpoint | Wrong `MUSHI_API_ENDPOINT` in `~/.mushirc` | Re-run `mushi login --endpoint https://...` |
| All edge functions ❌ | Supabase project paused (free tier) | Restore the project in the Supabase dashboard |
| BYOK keys all `quota_exhausted` | Rate limits hit on all keys | Add a backup key for each provider |
| QA cron never fires | pg_cron job missing | Re-run migration `20260602000003_pdca_qa_improve_cron.sql` |
