---
name: test-playwright
description: >
  Close the PDCA loop on this session's diff. Headed playwright-cli, fix as
  you go. Use when "test my changes", "PDCA this". Pixel diffs →
  test-visual-regression. Story CRUD → test-qa. Monkey / guest vs logged-in
  → test-exploratory.
license: MIT
---

# test-playwright — Develop → Test → Fix (PDCA)

**Degree of freedom: MIXED** — blast-radius and UX judgment `[HIGH freedom]`;
session, anti-stall, and live re-test after each fix `[LOW freedom — run exactly]`.
Driver is **playwright-cli**, never Playwright MCP.

The job is not done when the code compiles. It is done when you have driven the live app as a user, found what's broken or clunky, and **fixed it** — Check and Act are the deliverable.

> **Plan** = the change you just made. **Do** = already in the code.
> **Check** = drive the live app (this skill). **Act** = fix every pain
> point in the same turn.

Your turn ends after Phase 7, or at a BLOCKED item that needs the user's decision — not with PAIN found and unfixed, and not with a fix that has not been re-driven live.

Read `protocol-browser-anti-stall` before any browser action — Rule 0
(manual & headed), navigation guard, ≤3s waits, fresh `snapshot` after every
state change, max-4-attempts-per-goal, tab discipline, and persisted auth
(`references/playwright-session-coordination.md`).

## This skill vs neighbors

| Skill | Owns |
|:------|:-----|
| **test-playwright** (this) | This-diff + blast radius; **fix as you go** |
| `test-qa` | Full-app story/CRUD smoke — not this session's diff |
| `test-exploratory` | Unscripted **guest vs authed** wander (do not reclaim) |
| `test-red-team` | Hostile feature×dimension matrix; report first |
| `test-visual-regression` | Pixel baselines |

## How to reason (each surface)

1. **Observe** — screenshot + console + network vs this session's diff
2. **Interpret** — broken / data-wrong / pipeline / friction / visual / a11y
3. **Classify** — PASS / PAIN (fix now) / BLOCKED (needs decision)
4. **Severity** — ship-blocker vs polish; Act now unless risky/out-of-scope

## Worked example

> **Observe:** create item → toast "Saved"; `requests` shows POST 500; list
> empty after `reload`. Diff touched the create action.
> **Interpret:** optimistic UI over a failed write.
> **Classify:** PAIN — pipeline lie. Fix the action, then re-drive.
> **Severity:** ship-blocker.
> **Act:** fix the handler; re-test until 2xx + persist + clean console.

## Core principles

- **Drive a visible browser by hand, never a script.** Headed (never
  `--headless`). One real action at a time. `eval` / `run-code`
  inspection-only; no `*.spec.ts`, no `npx playwright test`.
- **Test only what this session changed — plus its blast radius.** Not a
  full-app crawl (`test-qa`). Not guest-vs-logged-in wander
  (`test-exploratory`).
- **Fix as you go — full-stack.** Bug, 500, dead button, ugly layout →
  root cause now, then re-test. Don't batch "later".
- **Evidence or it didn't happen.** Finding = screenshot + console +
  network. Fix = live re-test against the real backend.
- **Red-team your own work.** Assume the change is subtly wrong. Try to
  break it.

---

## Workflow checklist

```
PDCA Progress:
- [ ] Phase 1: Scope — what did this session change? (blast radius)
- [ ] Phase 2: Environment — dev server up, app loads, authenticated
- [ ] Phase 3: Walk the changed flows as a real user
- [ ] Phase 4: Fix pain points + errors as you find them (full-stack)
- [ ] Phase 5: Backend truth-check (Sentry / Supabase / logs)
- [ ] Phase 6: Red-team + critique + enhancement ideas
- [ ] Phase 7: Re-test everything you fixed; report
```

---

## Phase 1: Scope the session changes  [HIGH freedom]

Scope is this session's diff plus its blast radius; full-app coverage belongs to `test-qa`.

1. **Get the diff** (each workspace repo root if needed):

```bash
git status --short
git diff --stat HEAD
git diff HEAD --name-only
```

2. **Map files → user-facing surfaces.**
   - Page/route → test that page.
   - Shared component/hook/util → every importer (`grep -rl "ComponentName" src/`) — the **blast radius**.
   - API / controller / service → every UI flow that calls it.
   - Migration / schema / RLS → read AND write paths, as the client's role.
   - Config / env / pricing / prompt → the feature it drives.

3. **Stack & dev URL** (only what you need): `scripts.dev` port; auth +
   test credentials (`.env.local`, `.env.test`, README — ask once if none);
   backend MCPs this session: Supabase, Sentry, Firecrawl.

4. **Write the test plan** before opening the browser:

```
SESSION SCOPE:
- Repos touched: [list]
- Changed surfaces (pages/flows): [list]
- Blast radius (shared code → consumers): [list]
- Backend paths touched (APIs/tables/RPCs): [list]
- Dev URL: http://localhost:[port] Auth: [method / test account]
- User journeys to drive: [ordered list of 2–6 real flows]
```

---

## Phase 2: Environment verification  [LOW freedom — session exact]

Read `protocol-browser-anti-stall/references/playwright-session-coordination.md`
before opening the browser.

```bash
PW="npx --yes @playwright/cli@latest"
```

1. Check `terminals/` for a running dev server. If none, start it
   (`block_until_ms` sized to startup) or tell the user and stop.
2. Name the session after the task (`-s=qa-<feature>`). Never reuse another
   agent's name.
3. `$PW -s=qa-<feature> open --headed <dev-url>` — add
   `--persistent --profile "$HOME/.playwright-cli-profiles/<app>"` when
   login is needed.
4. Anti-stall: `sleep 2` → `snapshot` → verify content rendered.
5. `console` + `requests` → baseline before the changed feature.
6. **Auth (log in once, by hand — it persists):**
   - Protected route → already signed in? continue. `--persistent --profile`
     survives turns.
   - Else complete login **in the visible window**. Verify a protected route.
   - **Google accounts cannot sign in from a Playwright-launched browser** —
     one-time real-Chrome login in the coordination reference.
   - Lighter alternative: `state-save` / `state-load`
     `.playwright-mcp/auth/<host>.json`.
   - Do **not** log out unless testing logout.
7. `$PW -s=qa-<feature> close` when the run is done.

---

## Phase 3: Walk the changed flows as a real user  [HIGH freedom; cycle = LOW]

For each Phase 1 journey, live it. Per step (anti-stall throughout):

```bash
S="-s=qa-<feature>"
$PW $S goto "<url>"
$PW $S snapshot             # navigation guard: blank → sleep 2 → snapshot again
$PW $S screenshot --filename ".playwright-mcp/<step>.png"
$PW $S click <ref>          # one action: click / type / fill / select / …
$PW $S snapshot             # FRESH refs after every interaction
$PW $S console
$PW $S requests
```

Then judge: WORK + feel GOOD? PASS or PAIN POINT.

| Category | Look for |
|----------|----------|
| **Broken** | Blank, error boundary, 404/500, stuck spinner, dead button, no-op submit |
| **Data wrong** | `undefined` / `null` / `NaN` / `[object Object]` / `Invalid Date`, bad totals, stale after mutation |
| **Pipeline** | UI shows change but API failed; create missing until refresh; deleted item returns; optimistic never confirms |
| **Validation** | Empty/invalid submit silent; no inline errors; silent backend reject |
| **UX friction** | Confusing copy, no loading/success/error, hidden primary, too many clicks |
| **Visual** | Overflow, cramped/wasted space, broken images/icons, dark-mode, layout shift |
| **A11y basics** | Unlabeled inputs, unnamed controls, invisible focus, low contrast |

**Mutations E2E:** after create/update/delete confirm (a) network 2xx, (b) UI
reflects it, (c) survives hard `reload`, (d) if Supabase MCP — the row
changed. Prefix test data `QA-TEST-` and clean it up.

---

## Phase 4: Fix pain points and errors — as you go  [HIGH freedom; re-test = LOW]

Fix the root cause before moving on.

1. **Diagnose to root cause** — don't patch symptoms.
   - Frontend → component/hook/state.
   - 4xx/5xx → payload + backend log; controller/service/validation.
     FE↔BE mismatch → `debug-fe-be-integration` mindset.
   - `relation does not exist` / missing column → migration not deployed.
     **Deploy via Supabase MCP** (`apply_migration` for DDL, `execute_sql`
     for data) AND keep the versioned file on disk. (`full-stack-ship-discipline`
     — requested schema ships; `DELETE`/`UPDATE`/`TRUNCATE` on real rows asks.)
   - RLS → verify as the client's role (`SET ROLE anon;` / `authenticated;`),
     fix policy, re-verify.
   - Config/env/CORS → fix and note other environments.
2. **Apply** surgically — change the lines the fix needs, not whole files. Run diagnostics on the files you edited (`ReadLints` in Cursor; the repo's lint/typecheck in Claude Code).
3. **Re-drive the same flow** — green console, 2xx, correct UI, persisted
   data. A fix is not done until re-tested live.
4. Genuinely out of scope or risky → STOP and surface it; don't silently
   ship a broken flow.

```
FIX LOG:
- [surface] [symptom] → root cause: [...] → fix: [file(s)] → re-test: PASS/▢
```

---

## Phase 5: Backend truth-check (full-stack)  [HIGH freedom]

Don't trust the UI alone. Look up MCP schemas first.

**Sentry** — new/related production errors on touched surfaces:

```json
sentry:search_issues
{
 "organizationSlug": "<ORG>", "query": "unresolved issues in the last 7 days",
 "projectSlugOrId": "<PROJECT>", "regionUrl": "<REGION_URL>", "limit": 25
}
```

`analyze_issue_with_seer` on anything that maps to your change. Resolve
(`update_issue`) only AFTER a verified fix; it needs the Triage skill on the
Sentry MCP connection, so resolve in the Sentry UI if the tool is missing.

**Supabase** — `list_tables`, `execute_sql`, `query_logs` (API:
`source = 'edge_logs'`; Postgres: `source = 'postgres_logs'`), `get_advisors`.
New ERROR advisors from your change are in scope. Confirm
deployed migrations on the remote (`information_schema` / `pg_proc` / `pg_policies`).

**App logs / terminal** — server stack traces that never reached the browser.

---

## Phase 6: Red-team and critique  [HIGH freedom]

Skeptical reviewer + demanding user, **on the changed surfaces only**.
Full-app hostile matrix → `test-red-team`. Guest wander → `test-exploratory`.

- **Break it:** double-submit, rapid toggle, back/forward, deep links, empty
  states, huge inputs, special chars (`<script>`, `'; DROP TABLE`, emoji),
  slow/failed network.
- **Question the UX:** primary action obvious in 3s? Feedback immediate?
  Would a real user get stuck? Deep polish → `enhance-web-ux` / `enhance-web-ui`.
- **Question the design:** match existing tokens/patterns, or drift?
- **Research when unsure:** Firecrawl `firecrawl_search` for current
  pattern/feature best practices; map back to concrete changes.

Capture **enhancement ideas** — concrete: what, why, effort. Distinguish
"fix now" (Phase 4) from "suggested next" (report).

---

## Phase 7: Re-test and report  [LOW freedom — do not skip]

1. Re-drive every fixed flow end to end. Confirm green.
2. Clean up `QA-TEST-` data; reset settings; verify cleanup in DB if applicable.
3. Report:

```markdown
## PDCA Test Report — [feature / session summary]

### Scope (what this session changed)
- Repos: [...] Surfaces tested: [...] Backend paths: [...]
- Dev URL: [...] Auth: [...]

### Flows driven (as a user)
| # | Journey | Result | Evidence |
|---|---------|--------|----------|
| 1 | [...] | PASS / FIXED / BLOCKED | [screenshot/console/network] |

### Fixed this turn (Act)
| # | Surface | Symptom | Root cause | Fix (files) | Re-tested |
|---|---------|---------|-----------|-------------|-----------|
| 1 | [...] | [...] | [FE/BE/DB/config] | [...] | ✅ |

### Still broken / out of scope (needs decision)
| # | Surface | Finding | Why not fixed | Recommendation |
|---|---------|-------|---------------|----------------|

### Backend truth-check
- Sentry: [new/related issues + status]
- Supabase: [schema/data/logs/advisors — migration deployed? Y/N]

### Red-team findings
| # | Surface | Severity | Finding | Evidence |
|---|---------|----------|---------|----------|

### Enhancement suggestions (Plan the next cycle)
1. [concrete idea] — why it helps — rough effort

### Verdict
**Ship / Ship after fixes / Not ready** — [1–2 sentence justification]
Console clean: [Y/N] · All flows green on re-test: [Y/N] · Test data cleaned: [Y/N]
```

## Self-critique before reporting  [LOW freedom — do not skip]

1. **Scope** — this-diff + blast radius, not full-app (`test-qa`) or guest wander
2. **Driver** — playwright-cli, headed, named session; never Playwright MCP
3. **Act** — every PAIN fixed or explicitly blocked; live re-test after each fix
4. **Evidence** — finding = screenshot+console+network; fix = green re-drive
5. **Honest verdict** — red console or unfixed PAIN ≠ Ship

---

## playwright-cli commands

`PW="npx --yes @playwright/cli@latest"`, then `$PW -s=<session> <command>`.
Snapshot/ref-based; sessions are isolated — re-`snapshot` after each state
change. **Headless by default — pass `--headed` on `open`.**

**Drive:** `open --headed`, `goto`, `go-back`, `click`, `type`, `fill`,
`select`, `check`, `uncheck`, `hover`, `drag`, `drop`, `press`, `upload`,
`dialog-accept`, `resize`.

**Observe:** `snapshot`, `find`, `screenshot --filename .playwright-mcp/<name>.png`,
`console`, `requests`, `request <n>`.

**Wait:** `sleep N` (shell, ≤3s) or
`run-code "async (page) => { await page.getByText('X').first().waitFor({ timeout: 5000 }); }"`.

**Inspection-only:** `eval`, `run-code`.

Old MCP → CLI map: `protocol-browser-anti-stall/references/mcp-to-cli-map.md`.

---

## Guardrails

1. **Manual & headed, never scripted** — visible browser; no `*.spec.ts`,
   no `npx playwright test`. Anti-stall Rule 0.
2. **Scope discipline** — session changes + blast radius. Full-app → `test-qa`.
3. **Own your session** — every command `-s=<task>`; never `close-all` /
   `kill-all` sessions you didn't open.
4. **Auth reuse** — log in once into `--persistent --profile`; don't log out
   unless testing logout.
5. **Anti-stall always** — never block >3s; max 4 attempts; `[TIMEOUT]` and skip.
6. **Fix the root cause, full-stack** — UI, API, DB, config; re-test live.
7. **Schema in sync** — MCP changes get a versioned migration file; verify remote.
8. **Ask before mutating real data** — requested DDL ships; prod row
   `DELETE`/`UPDATE`/`TRUNCATE` asks first.
9. **No secrets in chat** — `.env*` by name only.
10. **Evidence** — screenshot + console + network + a green re-test.
11. **Honest verdict** — don't declare done with a red console or unfixed PAIN.
