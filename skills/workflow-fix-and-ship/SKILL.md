---
name: workflow-fix-and-ship
description: >
  One bug-fix lifecycle: triage, reproduce, debug, regression test, fix, live
  check, PR, optional deploy verify. Use when "fix this bug and close the
  ticket", "patch this and ship", or a named production error. Many reports →
  workflow-feedback-to-closure.
license: MIT
metadata:
  chain: "debug-error test-playwright workflow-pr"
---

# workflow-fix-and-ship — Bug Fix Lifecycle

**Degree of freedom: MIXED.** Root-cause and surgical fix `[HIGH freedom]`;
reproduce-before-edit, regression test, and PR evidence
`[LOW freedom — run exactly]`.

Triage → fix → verify → ship. Every step leaves evidence.

## How to reason

1. **Reproduce** — exact local steps before any edit
2. **Isolate** — one-sentence root cause, not the crash site
3. **Fix** — smallest change plus a test that would have caught it
4. **Prove** — same repro is green; nearby flows still work

## Worked example

> **Reproduce:** checkout 500s when the cart has a deleted SKU; Sentry shows `TypeError` in `quoteCart`.
> **Isolate:** `quoteCart` assumes every line item still exists; deleted SKU yields undefined price.
> **Fix:** treat missing SKU as an invalid line + regression test with a deleted product id.
> **Prove:** Playwright retries the deleted-SKU cart → inline error, not 500; pay-happy-path still completes.

## Self-critique before reporting

- **Reproduced first** — steps were stated before the first edit
- **Root named** — "X because Y", not "it was broken"
- **Regression test** — a test that fails on the old code exists
- **Right owner** — many reports → `workflow-feedback-to-closure`; FE↔BE contract → `debug-fe-be-integration`

---

## Phase sequence  [LOW freedom — run exactly]

```
1. TRIAGE     → pull Sentry + logs, reproduce locally
2. ROOT CAUSE → debug-error (isolate, identify, understand)
3. FIX        → surgical change, matching tests
4. VERIFY     → test-playwright (confirm fix, catch regressions)
5. PR         → workflow-pr
6. POST-SHIP  → deploy-verify (optional if deploy is immediate)
```
The turn ends at the Done criteria (Phase 6 only when a deploy is in scope) or at a real gate — a decision only the user can make, a missing credential, a failing service. A phase summary is a progress note, not a stopping point.

---

## Phase 1: Triage  [HIGH freedom]

Pull signals before touching code:

```json
sentry:search_issues
{
  "organizationSlug": "<ORG>",
  "query": "<describe the bug>",
  "projectSlugOrId": "<PROJECT>",
  "regionUrl": "<REGION_URL>",
  "limit": 5
}
```

Then pull Supabase logs if the bug may be data-related:
```json
supabase:query_logs
{
  "sql": "select timestamp, event_message, log_attributes['request.method'] as method, log_attributes['request.path'] as path, log_attributes['response.status_code'] as status_code from logs where source = 'edge_logs' order by timestamp desc limit 100"
}
```

**Reproduce locally before any code change.** State the exact repro steps.

---

## Phase 2: Root cause (read debug-error)  [HIGH freedom]

> Read the `debug-error` skill and follow it.

Required output: one-sentence root cause statement — "The bug is X because Y."

---

## Phase 3: Fix  [HIGH freedom]

Rules:
- Surgical change only — do not refactor unrelated code
- Add a regression test that would have caught this bug
- If the fix requires a schema change, apply via Supabase MCP and write the migration file
- A pre-existing bug you notice on the way is a follow-up in the PR description, not part of this fix
- The regression test is the only test this change adds unless the repo already keeps others for this path; scratch repro scripts stay out of the repo

---

## Phase 4: Verify (read test-playwright)  [LOW freedom — hand off]

> Read the `test-playwright` skill and follow it.

Drive the live app through the exact repro scenario. Confirm the fix resolves it. Check that nearby flows still work (regression scope = files touched ± 1 level).

---

## Phase 5: PR (read workflow-pr)  [LOW freedom — hand off]

> Read the `workflow-pr` skill and follow it.

PR description must include:
- Root cause (one sentence)
- Sentry issue link or repro steps
- Screenshot/recording showing the fix working

---

## Phase 6: Post-deploy smoke (optional — read deploy-verify)  [LOW freedom — hand off]

If deploying immediately after merge, read the `deploy-verify` skill.

Resolve the Sentry issue after confirming the fix is live in production.

---

## Done criteria  [LOW freedom — do not skip]

- [ ] Reproduced locally with exact steps
- [ ] Root cause identified (not just "it was broken")
- [ ] Regression test added
- [ ] Smoke test confirms fix and no new breakage
- [ ] PR open with root cause + evidence
- [ ] Sentry issue resolved (after deploy confirmation)
