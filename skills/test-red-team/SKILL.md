---
name: test-red-team
description: >
  Red-team a running web, React Native, or Capacitor app. Use when "red team
  this app", "attack my app", "break it", "pentest the app", or "pre-launch
  hardening". Monkey test → test-exploratory.
license: MIT
effort: high
---

# test-red-team — Adversarial Full-App Defect Sweep

**Degree of freedom: MIXED** — matrix and severity `[HIGH freedom]`; ROE,
harness, and benign-payload confirmation `[LOW freedom — run exactly]`.
Web driver is **playwright-cli**. Do not write exploit PoCs into the repo.

A hostile, skeptical pass across UI/UX, data pipeline, security, and
performance. Default output is a **severity-ranked defect list**, not inline
fixes (`test-playwright` is the fix-as-you-go PDCA). Offer to fix after the
report; ask which defects to prioritize.
Your turn ends with the Phase 7 report and a matrix with no blank cells — each cell PASS, DEFECT, or N-A with a reason — not with the matrix printed and the sweep still owed.

Read `protocol-browser-anti-stall` before any browser action (Rule 0: manual
& headed) and `references/playwright-session-coordination.md`.

> **Attack through the visible UI, by hand.** One real action at a time.
> `eval` / CDP / WebView attach may **set a condition** (throttle, kill a
> request, emulate) or **inspect** — never perform the click/type/submit
> under test. The defect must be reachable the way a real attacker reaches it.

## This skill vs neighbors

| Skill | Owns |
|:------|:-----|
| **test-red-team** (this) | Adversarial feature×dimension matrix; report first |
| `test-exploratory` | Naive **guest vs authed** wander (do not reclaim) |
| `test-qa` | Story/CRUD smoke — not a hostile matrix |
| `test-playwright` | This-diff PDCA + **fixes** |
| `audit-llm-security` | Product LLM / prompt-injection depth |
| `test-load` | Concurrency breaking point (not headed UI) |
| `audit-security` | Static OWASP checklist |

## How to reason (every cell / finding)

1. **Observe** — screenshot + console + network + DB (for mutations)
2. **Interpret** — reachable defect vs expected deny vs untested (N-A)
3. **Classify** — PASS / DEFECT / N-A; chain if two cells combine
4. **Severity** — Critical/High/Medium/Low/Info by impact × likelihood

## Worked example

> **Observe:** User B `GET /api/docs/A-id` → 200 + A's body. `SET ROLE
> authenticated` + `user_id != auth.uid()` also returns the row.
> **Interpret:** IDOR; handler has no ownership check.
> **Classify:** DEFECT (Security / A01). Chain with weak session = takeover.
> **Severity:** Critical — cross-user data leak.
> **Evidence:** screenshot + network + SQL. Payload was a read, not a dump/DROP.

---

## Coverage model

This is not a blind DOM crawl (`test-qa`) or an unscripted guest-vs-logged-in wander (`test-exploratory`). Traverse a **coverage matrix**:

```
feature/capability
  → surfaces (routes, sub-pages, API endpoints, RPCs, tables)
    → components + states (forms, tables, modals, empty/error/loading, roles)
      → 4 attack dimensions: UI/UX · data pipeline · security · performance
```

Each cell (`feature × surface × component-state × dimension`) is **PASS /
DEFECT / N-A**. The matrix is the plan and the audit trail.

**Graceful fallback:** no discernible features (pure marketing) → route →
component structural traversal.

---

## Phase 0: Scope & rules of engagement  [LOW freedom — ROE exact]

### 0a. Detect the stack

`package.json` → framework, auth, ORM, RN/Expo, port.
`capacitor.config.ts/.json` → Capacitor hybrid.
`app.json` / `app.config.*` → Expo / RN. `android/` → native Android.

Record: target type (web / RN/Expo / Capacitor / mixed); dev URL/port;
auth pattern; test credentials (`.env.local`, `.env.test`, README);
backend MCPs (Supabase, Sentry, Firecrawl).

### 0b. Pick the automation driver

| Target | Driver |
|--------|--------|
| Web / PWA / Next.js / SvelteKit / Remix | playwright-cli (`npx --yes @playwright/cli@latest`) |
| Capacitor WebView on Android emulator | Playwright `_android` WebView attach over ADB (Phase 0c) |
| Native chrome: system dialogs, sheets, permissions | `adb shell input tap` (`mobile-emulator-test`) |
| Pure-native iOS/Android (Swift/Kotlin UI) | **Out of scope** — Appium; document as limitation |

### 0c. Capacitor WebView attach (when target includes Capacitor)

**Exception to Rule 0:** a native WebView can't be driven by snapshot-ref
tools, so attaching is the only option. Once attached, still interact like
a user — don't script the flow end-to-end.

```javascript
const { _android } = require('playwright');
const [device] = await _android.devices();
// ADB online, Chrome ≥ 87, WebView debuggable
const webview = await device.webView({ pkg: 'com.your.app.id' });
const page = await webview.page();
// standard Playwright Page API — not playwright-cli verbs
```

Native chrome outside the WebView: `adb shell input tap` with coordinates
from `adb shell uiautomator dump`.

### 0d. Rules of engagement

- Test data prefixed `RT-TEST-` for cleanup
- Do NOT mutate production data; ask before any non-reversible operation
- Confirm with **benign** evidence; no destructive PoCs against real rows;
  **do not write exploit PoCs into the repo**
- Secrets by name only — never printed

### 0e. Browser session (before Phases 2–5)

1. Own session — never share or claim another agent's:

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=rt-<app> open --headed --persistent \
    --profile "$HOME/.playwright-cli-profiles/<app>" "<app-url>"
```

2. Reuse the signed-in session (`--profile`, or `state-save` /
   `state-load .playwright-mcp/auth/<host>.json`). Google needs the one-time
   real-Chrome login in the coordination reference.
3. Never `close-all` / `kill-all`; close only `-s=rt-<app>` when done.
4. Do not log out between attack phases unless testing logout/fixation.

---

## Phase 1: Recon & build the coverage matrix  [HIGH freedom]

Build the matrix from source **before** opening the browser.

### 1a. Enumerate features / capabilities

| Source | What to extract |
|--------|----------------|
| `src/app/**/page.tsx` (Next.js App Router) | Routes → feature groupings |
| `src/routes/**/*.tsx` (Remix / RN Router) | Route tree |
| `features/*/`, `modules/*/`, `src/*/` | Feature boundary names |
| `supabase/migrations/*.sql`, `prisma/schema.prisma` | Entities + relationships |
| `src/app/api/**`, `supabase/functions/**` | API endpoints + RPCs |
| README / feature docs | Business capability names |
| Nav / sidebar / tab bar | User-visible feature map |

### 1b. For each feature, decompose

```
Feature: [name]
  Surfaces: routes/pages, deep links, API/RPCs, DB tables
  Components + states: default/empty/loading/error/role-A/role-B; forms;
    modals; file uploads
  Roles / tenants: anon, user, admin, org-member, …
  Input surfaces: fields, URL params, query strings, headers, file content
```

### 1c. Output the matrix

Print before Phases 2–5. Fill ✅ PASS / ❌ DEFECT(#N) / — N-A as you go.

```
COVERAGE MATRIX
| Feature   | Surface/Component+State        | UI/UX | Pipeline | Security | Perf |
|-----------|--------------------------------|-------|----------|----------|------|
| Auth      | Login form / empty             |       |          |          |      |
| Auth      | Login form / error             |       |          |          |      |
| Documents | List / empty · 100+ · create · share/other-user |       |          |          |      |
```

---

## Phase 2: UI/UX red team (per matrix cell)  [HIGH freedom]

**Driver:** playwright-cli — `goto`, `snapshot`, `screenshot`, `click`,
`type`, `fill`, `console`, `requests`, `resize`.

| Attack | What to do |
|--------|-----------|
| 3-second clarity | Cold navigate. Purpose obvious in 3 s? |
| Primary action | CTA obvious, above the fold, 1 tap? |
| Empty / loading / error | Fresh account; throttle (`eval`/CDP); kill API. Human-readable states? |
| Dead buttons | Every button/link produces a visible response |
| Form labels | Every `<input>` has a visible label or `aria-label` |
| Responsive | `resize` 1280×800, 768×1024, 375×812 — no break |
| Dark mode | Toggle if supported. No white flash / invisible text |
| Role variant | Same surface as each role — different data/controls |
| Overflow | 200-char strings, fat numbers — no clip without ellipsis |

`screenshot` every DEFECT. Note the component path if identifiable.

---

## Phase 3: Data pipeline red team (per matrix cell)  [LOW freedom — 3-layer verify]

Every mutation surface (create / update / delete / upload). Verify at
**(1) UI (2) network (3) DB**. Look up Supabase schemas first, then:

```json
supabase:execute_sql
{
  "query": "SELECT * FROM <table> WHERE <col> LIKE 'RT-TEST-%' ORDER BY created_at DESC LIMIT 10"
}
```

RLS (what the client can actually read/write):

```json
supabase:execute_sql
{
  "query": "SET ROLE authenticated; SELECT * FROM <table> WHERE user_id != auth.uid() LIMIT 5"
}
```

Also `list_tables`, `query_logs` (`source = 'edge_logs'` or
`'postgres_logs'`), `get_advisors`.
Unexpected 5xx, unhandled exceptions, RLS denies, and new ERROR advisors
are pipeline defects.

| Attack | How |
|--------|-----|
| Double-submit dupe | Click submit twice. Duplicate row? |
| Optimistic-update lie | Submit → immediately check DB. Row landed? |
| Stale cache | Mutate in one tab, reload the other |
| Ghost delete | Delete, reload. Reappears? |
| Race / partial write | Two conflicting mutations; kill network mid-request (`eval` `fetch` override). Consistent? |
| Idempotency | Replay the same request. Safe? |
| Relationship integrity | Delete parent. Orphans cleaned or guarded? |
| Pagination consistency | Create while on page 2. Right position? |

---

## Phase 4: Security red team (per matrix cell, OWASP-mapped)  [HIGH freedom; payloads = LOW]

Full payload tables: `references/owasp-attack-checklist.md`. Confirm with
**benign** payloads (`document.title='XSS'`, `SELECT 1`) — never `DROP TABLE`,
never real exfil, **never commit an exploit PoC**.

Priority (highest real-world impact first):

| # | Class (OWASP) | Key test |
|---|---------------|----------|
| 1 | Authorization / IDOR (A01) | User B reads/mutates User A's resource by ID; verify at DB with `SET ROLE authenticated` |
| 2 | Authentication (A07) | Reset-token reuse, session fixation, JWT tampering, missing lockout |
| 3 | Injection (A03) | XSS / SQLi / path traversal in every input — benign confirm only |
| 4 | Sensitive data (A02) | API leaks `password`/`token`/PII? Tokens in `localStorage`? Env in bundle? |
| 5 | Security headers | Missing CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` |
| 6 | Capacitor MASVS | `allowUniversalAccessFromFileURLs`? Unvalidated bridge? XSS → native plugin? |

Correlate with Sentry (401/403/CSP, last 30 days) and current OWASP via Firecrawl.

---

## Phase 5: Performance red team (per matrix cell)  [HIGH freedom; throttle setup = LOW]

Condition-setup only — then drive load/scroll/submit by hand.

```javascript
const client = await page.context().newCDPSession(page);
await client.send('Network.emulateNetworkConditions', {
  offline: false, downloadThroughput: 50 * 1024 / 8,
  uploadThroughput: 20 * 1024 / 8, latency: 300
});
```

Capacitor/Android: `adb shell tc qdisc add dev wlan0 root netem delay 300ms`.

| Attack | What to look for |
|--------|-----------------|
| Cold load (hard refresh) | TTI > 3 s on simulated 3G? Layout shift? |
| Large list (50+) | Scroll jank? Virtualize or render all nodes? |
| Pagination / infinite scroll | Dupes or missing items at the boundary? |
| Payload size | `requests` → list response > 500 KB? |
| Memory growth | Large list, scroll bottom↔top × 5. Unbounded heap? |
| Simultaneous requests | Rapid nav. Loading-state races? |
| Supabase N+1 | `query_logs` on `source = 'postgres_logs'` after the feature. Repeated identical queries? |

Same `get_advisors` as Phase 3: missing indexes, seq scans, bloated RLS =
Medium–High perf defects.

---

## Phase 6: Finding-chaining & triage  [HIGH freedom]

Scan DEFECT cells for chains before the report:

- Two Mediums often combine into High/Critical (reflected input + missing
  CSP = stored XSS).
- Auth weakness + IDOR = account takeover.
- Stale cache + no optimistic revert = silent corruption.

| Field | Options |
|-------|---------|
| Severity | Critical / High / Medium / Low / Info |
| Likelihood | High (trivial) / Medium (needs access) / Low (theoretical) |
| Impact | Data loss / takeover / PII leak / UX degradation / perf SLA |
| Affected component | `src/components/Foo.tsx`, `supabase/functions/bar`, … |
| Remediation | File/function-level fix, not vague advice |

---

## Phase 7: Defect report (the deliverable)  [LOW freedom — this shape]

```markdown
## Red-Team Defect Report — [App / Repo] — [Date]

### Scope
- Target type: [web | RN | Capacitor | mixed]
- Dev URL: [...]  Auth: [...]
- Features red-teamed: [list]
- Coverage matrix: [link or inline]

### Critical Defects (fix before any release)
| # | Feature | Surface / Component+State | Finding | Evidence | File | Remediation |
|---|---------|--------------------------|---------|----------|------|-------------|
| 1 | Auth | Login / error | IDOR: B reads A via GET /api/docs/:id | Screenshot+network | src/app/api/docs/[id]/route.ts | `WHERE user_id = auth.uid()` |

### High / Medium / Low / Info
Same columns. Group by severity.

### Attack chains identified
1. [Finding #N] + [Finding #M] → [combined impact and path]

### Coverage matrix (final)
| Feature | Surface/Component+State | UI/UX | Pipeline | Security | Perf |
|---------|------------------------|-------|----------|----------|------|

### Backend truth-check
- Sentry: [new/related — count + highest severity]
- Supabase: [advisors, logs, RLS results]

### Launch-readiness verdict
**Ready / Ready after Critical fixes / Not ready** — [2-sentence justification]

### Test data cleanup
- RT-TEST-* rows deleted: [Y/N / N-A]
```

## Self-critique before reporting  [LOW freedom — do not skip]

1. **No exploit PoC** — benign confirm only; nothing committed to the repo
2. **Every DEFECT evidenced** — screenshot + console + network (+ DB for mutations)
3. **Untested ≠ PASS** — untested cells are N-A with why
4. **Right owner** — guest wander → `test-exploratory`; LLM inject →
   `audit-llm-security`; load → `test-load`
5. **Report first** — fix only after the user picks Critical/High

---

## Guardrails

1. **Manual & headed, never scripted** — attack through the visible UI;
   code execution is condition-setup/inspection only; no `*.spec.ts`, no
   `npx playwright test`.
2. **Anti-stall always** — never block >3 s; max 4 attempts; `[TIMEOUT]` and move on.
3. **Evidence for every DEFECT** — screenshot + console + network + DB.
   "It looked broken" is not a defect.
4. **No destructive PoCs** — benign payloads only; never `DROP TABLE` or
   real exfil; do not write exploit PoCs into the repo.
5. **Ask before mutating production rows** — requested DDL may ship;
   `DELETE`/`UPDATE`/`TRUNCATE` on real prod data asks first.
6. **Secrets by name only.**
7. **Honest verdict** — untested cells are N-A, not PASS.
8. **Offer to fix after the report** — then `test-playwright` PDCA.
9. **MCP schemas first** — read the server's tool schema before any MCP call.
10. **Pure-native iOS/Android out of scope** — say so in the report.

## Related

- `audit-llm-security` — product LLM / prompt-injection depth
- `test-load` — concurrency breaking point (not a headed UI attack)
- `test-playwright` / `test-qa` / `audit-security` / `iterate-post-launch`
