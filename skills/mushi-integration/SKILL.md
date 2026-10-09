---
name: mushi-integration
description: >-
  Full end-to-end Mushi Mushi integration smoke test: bug capture → AI triage
  → story mapping → TDD test generation → approval → execution → PDCA cycle.
  Use when "test mushi integration", "verify full pipeline", "mushi e2e check",
  "does mushi work end-to-end", "smoke test mushi", or after deploying changes.
license: MIT
disable-model-invocation: true
effort: low
---

# Mushi Integration Smoke Test

**Degree of freedom: MIXED.** Pass/fail judgment `[HIGH freedom]`;
Stages 1–6 probes and DB verifies `[LOW freedom — run exactly]`.

## How to reason

1. **Observe** — each stage's CLI output and DB row
2. **Interpret** — stage failed vs still-pending vs expected-failure (test detected friction)
3. **Classify** — capture / triage / map / gen / run / pdca
4. **Severity** — `classify-report` down outranks optional Stage 7 dashboard drift

## Worked example

> **Observe:** `mushi test` → `rep_…`; DB still `pending` at 70s; `mushi doctor` was green.
> **Interpret:** capture wrote; `classify-report` did not.
> **Classify:** Stage 2 fail — check `query_logs`; do not start story mapping.
> **Verify:** summary marks Stage 2 ❌; later stages skipped; `diagnose_setup` next.

## Self-critique before reporting

- **Health first** — `mushi doctor` green before Stage 1
- **DB verify** — each stage checked the row, not only CLI text
- **Expected fail ok** — Stage 5 `failed` still counts if the test executed
- **Right owner** — component down → `mushi-health`; targeted diagnosis → `diagnose_setup`

Exercises every stage of the Mushi pipeline end-to-end. Run after setup,
after a deploy, or any time you need proof that the whole loop works.

## Prerequisites  [LOW freedom — run exactly]

- `mushi doctor` passes (all green) — run [`mushi-health`](../mushi-health/SKILL.md) first if unsure.
- At least one BYOK key for `anthropic` and `firecrawl` is active.
- You have the app URL you want to map stories from.

---

## Stage 1 — Bug capture  [LOW freedom — run exactly]

Send a real test report through the SDK pipeline:

```bash
mushi test
```

Expected: `Test report submitted — id: rep_...`

**Verify in DB** (Supabase MCP):

```sql
SELECT id, status, severity, category, created_at
FROM reports
ORDER BY created_at DESC LIMIT 1;
```

Expected: a row with `status` = `classified` and a non-null `severity` within ~30 seconds.  
If still `pending` after 60 s: `classify-report` edge function failed — check its console output with `query_logs` on `source = 'function_logs'`.

---

## Stage 2 — AI triage  [LOW freedom — run exactly]

Confirm the classifier ran:

```bash
mushi reports list --limit 1
```

Expected output includes `severity`, `category`, and `blast_radius`.

**Verify via MCP:**

```
get_report_detail(reportId)
```

Confirm `classification.severity` and `classification.category` are set.

---

## Stage 3 — Story mapping  [LOW freedom — run exactly]

Map user stories from a live URL:

```bash
mushi stories map --url https://your-app.com --wait
```

`--wait` polls until the crawl finishes (usually 30–90 s). Expected terminal output:

```
✓  Crawled 12 pages
✓  Claude drafted 8 user stories
✓  Proposal created: prop_...
Open in console → Inventory → Discovery → Past proposals
```

**Verify in DB:**

```sql
SELECT id, source, status, pages_crawled, created_at
FROM inventory_proposals
ORDER BY created_at DESC LIMIT 1;
```

Expected: `source = 'live_crawl'`, `status = 'pending_review'`.

**Accept the proposal** in the Mushi console (Inventory → Discovery → Past proposals → Accept),
or via CLI when the accept command is available.

---

## Stage 4 — TDD test generation  [LOW freedom — run exactly]

Pick a story id from the accepted inventory and generate a Playwright test:

```bash
# List available stories from the accepted inventory
mushi tdd pending

# Generate a test (review mode — goes to approval queue)
mushi tdd gen <story-id> --mode review
```

Expected output:

```
✓  Test generated: qa_...
✓  Draft PR opened: https://github.com/.../pull/...
   Waiting for approval — run: mushi tdd approve qa_...
```

**Verify in DB:**

```sql
SELECT id, title, approval_status, source, automation_mode, created_at
FROM qa_stories
ORDER BY created_at DESC LIMIT 1;
```

Expected: `source = 'test_gen_from_story'`, `approval_status = 'pending_review'`.

**Via MCP:**

```
list_pending_review_stories(projectId)
```

---

## Stage 5 — Approval and execution  [LOW freedom — run exactly]

Approve the generated test:

```bash
mushi tdd approve <qa-story-id>
```

Trigger a manual run immediately:

```bash
mushi tdd run <qa-story-id>
```

**Verify in DB:**

```sql
SELECT id, status, latency_ms, provider_session_url, created_at
FROM qa_story_runs
WHERE qa_story_id = '<qa-story-id>'
ORDER BY created_at DESC LIMIT 1;
```

Expected: `status = 'completed'` (or `failed` — a failure here is fine; it means the test ran and detected real friction).

**Via MCP:**

```
run_qa_story(projectId, qaStoryId)
```

---

## Stage 6 — PDCA improvement cycle  [LOW freedom — run exactly]

If Stage 5 produced a failure, trigger the PDCA improver:

```bash
mushi tdd improve
```

Expected: Claude analyzes the failure, writes an improved test, and queues it for review.

**Verify:**

```sql
SELECT id, title, source, parent_story_id, approval_status, created_at
FROM qa_stories
WHERE source = 'pdca'
ORDER BY created_at DESC LIMIT 3;
```

Expected: at least one row with `source = 'pdca'` and a `parent_story_id` pointing to the original.

---

## Stage 7 — Evolution loop (optional)  [HIGH freedom]

Check the full PDCA dashboard to confirm the loop is converging:

**Via MCP resource:**

```
project://dashboard
```

Look for:
- Rising `judge_scores` over time.
- Falling `recurrence_rate` (same bugs re-appearing).
- `fix_attempts` with `status = 'completed'` outpacing `failed`.

---

## Pass/Fail Summary  [LOW freedom — do not skip]

| Stage | What ran | Status | Notes |
|-------|----------|--------|-------|
| 1. Bug capture | `mushi test` → `reports` row | ✅ / ❌ | |
| 2. AI triage | `classify-report` → severity/category | ✅ / ❌ | |
| 3. Story mapping | `story-mapper` → `inventory_proposals` | ✅ / ❌ | |
| 4. TDD generation | Mushi edge fn `test-gen-from-story` → `qa_stories` | ✅ / ❌ | |
| 5. Approval + run | `qa-story-runner` → `qa_story_runs` | ✅ / ❌ | |
| 6. PDCA improve | `pdca-runner` → `qa_stories (source=pdca)` | ✅ / ❌ | |

All ✅ → Mushi is fully operational end-to-end.  
Any ❌ → the relevant edge function failed. Run the mushi MCP `diagnose_setup` tool for targeted diagnosis when the Mushi MCP server is configured (the `@mushi-mushi/mcp` package; this pack does not bundle it). Without it, run `mushi doctor` and follow `debug-error` on the failing edge function.

---

## Tips  [HIGH freedom]

- **Fastest smoke test:** Stages 1–2 only. Takes ~60 s and confirms bug capture + triage is alive.
- **Story map only:** Stage 3. Useful after changing the Firecrawl key or updating the `story-mapper` function.
- **TDD-only check:** Stages 4–6. Run this after changing the Mushi edge functions `test-gen-from-story` or `pdca-runner`.
- **Browserbase vs Firecrawl:** Stage 5 uses `firecrawl_actions` by default. To test Browserbase: set `provider = 'browserbase'` on the QA story in the console first.
