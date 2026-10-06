---
name: debug-sentry-monitor
description: >
  Operate Sentry: triage and fix unresolved issues, cut noise, audit
  instrumentation, monitor after deploy. Use when "check Sentry" or "review
  production errors". One bug → workflow-fix-and-ship. Plan-only audit →
  plan-error-handling.
license: MIT
effort: high
---

# Sentry Monitor

**Degree of freedom: MIXED.** Triage bucket and root cause `[HIGH freedom]`;
resolve-only-after-verify `[LOW freedom — run exactly]`.

Triage, fix, and audit Sentry on any project via the `sentry` MCP. Auto-detects config.

## How to reason

1. **Observe** — issue type, frames, users, first-seen, release
2. **Interpret** — app frame vs extension noise; new vs regression
3. **Classify** — Noise / Code Bug / Data Bug / Performance / Regression / Config Gap
4. **Severity** — regressions and multi-user crashes first; never resolve Performance

## Worked example

> **Observe:** 80 events of `TypeError: undefined.email` on `/account`, started at release `1.14.0`.
> **Interpret:** app frames in the profile card; correlates with the onboarding PR.
> **Classify:** Data Bug + Regression — API null for incomplete profiles.
> **Fix:** handle null at the contract; do not resolve until the fix is committed and the loop is green.

## Self-critique before reporting

- **No resolve without proof** — issue stays unresolved if the fix is unverified
- **No band-aid** — `?.` / swallowed catch is not the sole fix
- **Bucket is one** — Noise is not used to mute an app-frame crash
- **Right owner** — one named bug through PR → `workflow-fix-and-ship`

## Rules

Resolve an issue only with a verified fix — resolving means "this will not happen again"; if you cannot prove that, leave it unresolved.

No band-aid fixes. try/catch wrappers, `?.` chains, and `Array.isArray()` guards suppress the symptom; use defensive code only after the root cause is fixed, to harden against genuinely unpredictable external input.

Research non-trivial bugs before fixing (Step 4d).

---

## Step 0: Auto-Detect Project Configuration

Before making any Sentry MCP calls, discover the project's Sentry setup.

The Sentry MCP lists these tools directly, depending on which Sentry MCP skills (Inspect, Seer, Triage) the connection grants: `find_organizations`, `find_projects`, `search_issues`, `search_events`, `get_sentry_resource`, `analyze_issue_with_seer` (Seer), and `update_issue` (Triage). The other tools this skill uses (`get_issue_breadcrumbs`, `get_issue_tag_values`, `find_releases`) sit in the server's catalog and run through `execute_sentry_tool` with `name` and `arguments`. If a catalog call is rejected, call `search_sentry_tools` with a short description (for example `"find releases"`) to get the current name and argument schema.

### 0a. Find Organization and Project

First, try to detect from local config files. Search for these (in order):

1. `.sentryclirc` — contains `[defaults]` with `org` and `project`
2. `sentry.properties` — contains `defaults.org` and `defaults.project`
3. `.env`, `.env.local`, `.env.production` — look for `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
4. `sentry.client.config.ts`, `sentry.client.config.js` — Next.js Sentry config
5. `sentry.server.config.ts`, `sentry.server.config.js` — Next.js server Sentry config
6. `next.config.js` / `next.config.mjs` — `withSentryConfig()` wrapper
7. `package.json` — check for `@sentry/*` packages to detect SDK

If local detection fails, use the MCP to discover:

```json
sentry:find_organizations
```

Then for the target org:

```json
sentry:find_projects
{
 "organizationSlug": "<ORG_SLUG>",
 "regionUrl": "<REGION_URL>"
}
```

### 0b. Detect Framework and Platform

Read `package.json` (or equivalent) to determine:

| Package | Framework |
|---------|-----------|
| `@sentry/nextjs` | Next.js |
| `@sentry/react` | React SPA |
| `@sentry/vue` | Vue.js |
| `@sentry/svelte` | SvelteKit |
| `@sentry/node` | Node.js backend |
| `@sentry/browser` | Vanilla JS |
| `sentry-sdk` (pip) | Python |
| `sentry_sdk` (pip) | Python |
| `sentry-ruby` | Ruby |
| `@sentry/angular` | Angular |

### 0c. Locate Sentry Config Files

Search for the Sentry initialization and noise filtering:

```
Grep for: Sentry.init, sentryInit, initSentry
Grep for: ignoreErrors, beforeSend, denyUrls
Grep for: ErrorBoundary, error-boundary, errorBoundary
Grep for: logger, logging, winston, pino
Grep for: web-vitals, webVitals, reportWebVitals
```

### 0d. Record Detected Configuration

```
ORG_SLUG: [detected or ask user]
PROJECT_SLUG: [detected or ask user]
REGION_URL: [detected or ask user — typically https://us.sentry.io or https://de.sentry.io]
FRAMEWORK: [detected from packages]
PLATFORM: [browser | server | hybrid]
SENTRY_CONFIG: [path to Sentry.init file]
NOISE_FILTER: [path to file with ignoreErrors/beforeSend]
ERROR_BOUNDARY: [path to error boundary component, if any]
LOGGER: [path to logging utility, if any]
```

If any critical values cannot be detected, ask the user.

---

## Step 1: Fetch Issues

Run these two MCP calls in parallel:

```json
sentry:search_issues
{
 "organizationSlug": "<ORG_SLUG>",
 "projectSlugOrId": "<PROJECT_SLUG>",
 "regionUrl": "<REGION_URL>",
 "query": "all unresolved issues from the last 7 days",
 "limit": 50
}

sentry:search_events
{
 "organizationSlug": "<ORG_SLUG>",
 "projectSlug": "<PROJECT_SLUG>",
 "regionUrl": "<REGION_URL>",
 "query": "count of errors grouped by error type in the last 7 days",
 "limit": 50
}
```

Also check for regressions (issues that were resolved but re-opened):

```json
sentry:search_issues
{
 "organizationSlug": "<ORG_SLUG>",
 "projectSlugOrId": "<PROJECT_SLUG>",
 "regionUrl": "<REGION_URL>",
 "query": "regressed issues in the last 14 days",
 "limit": 20
}
```

If no issues are found, report "No unresolved issues in the last 7 days" and proceed to the Architecture Audit (Step 8).

---

## Step 2: Get Issue Details

For each issue with >1 event or >0 users impacted:

```json
sentry:get_sentry_resource
{
 "organizationSlug": "<ORG_SLUG>",
 "resourceType": "issue",
 "resourceId": "<ISSUE_ID>"
}
```

Issue the detail calls for one round in a single message so they run in parallel.

For hard-to-diagnose issues, also fetch breadcrumbs:

```json
sentry:execute_sentry_tool
{
 "name": "get_issue_breadcrumbs",
 "arguments": {
  "organizationSlug": "<ORG_SLUG>",
  "issueId": "<ISSUE_ID>"
 }
}
```

And optionally use Seer for AI-assisted root cause analysis:

```json
sentry:analyze_issue_with_seer
{
 "organizationSlug": "<ORG_SLUG>",
 "regionUrl": "<REGION_URL>",
 "issueId": "<ISSUE_ID>"
}
```

For understanding issue distribution, check tag values:

```json
sentry:execute_sentry_tool
{
 "name": "get_issue_tag_values",
 "arguments": {
  "organizationSlug": "<ORG_SLUG>",
  "regionUrl": "<REGION_URL>",
  "issueId": "<ISSUE_ID>",
  "tagKey": "browser"
 }
}
```

Common tag keys: `url`, `browser`, `browser.name`, `os`, `environment`, `release`, `device`, `user`.

---

## Step 3: Triage

Classify each issue into exactly one bucket:

| Bucket | Signals | Action |
|--------|---------|--------|
| **Noise** | Extension frames, chunk load errors, browser built-in errors, dev-only environment tag, no app frames in stacktrace | Add noise filter, resolve in Sentry |
| **Code Bug** | TypeError, ReferenceError, unhandled rejection with app frames, missing function/property | Full root cause analysis (Step 4), fix, verify, resolve |
| **Data Bug** | Unexpected null/undefined from API, malformed response, stale cache, race condition | Trace data flow end-to-end (Step 4), fix at source |
| **Performance** | Slow DB query, N+1 API calls, large HTTP payload, high LCP/INP | Do NOT resolve — flag for manual follow-up |
| **Regression** | Previously resolved issue that re-opened | Highest priority — the original fix was incomplete |
| **Config Gap** | Missing Sentry feature (logging, metrics, feedback, replay), bad sampling | Implement in config files, resolve |

Priority order: Regressions first, then Code Bugs and Data Bugs, then Noise, then Config Gaps. Performance is always deferred.

### 3a. Seer AI Analysis for High-Impact Issues

For any issue classified as **Code Bug**, **Data Bug**, or **Regression** that meets either threshold:
- **>10 events** (high frequency)
- **>5 affected users** (high impact)

Run Sentry's AI root-cause analysis before manual investigation:

```json
sentry:analyze_issue_with_seer
{
 "organizationSlug": "<ORG_SLUG>",
 "issueId": "<ISSUE_ID>"
}
```

Seer provides:
- Root cause explanation with code-level detail
- Specific file locations and line numbers where the error originates
- Concrete code fix suggestions you can apply directly

**How to use Seer results:**
- If Seer identifies a clear root cause with a specific fix → **start from that fix** in Step 4, validate it against the codebase, and apply if correct.
- If Seer's analysis is inconclusive or too generic → **proceed with manual root cause analysis** in Step 4 as normal.
- Always include Seer's analysis in the triage report (Step 8) regardless of whether you used the fix.

> **Note:** Seer results are cached — subsequent calls for the same issue return instantly. Analysis for new issues takes ~2-5 minutes.

---

## Step 4: Root Cause Analysis (for Code Bugs and Data Bugs)

### 4a. Read the Full Error Context

From the Sentry issue details, extract:
- **Exception type and message** — the exact error
- **Full stacktrace** — every frame, not just the top
- **Breadcrumbs** — what happened leading up to the error
- **Tags** — browser, OS, URL, user, environment, release
- **Additional data / context** — request payload, state snapshots
- **Event frequency pattern** — when did it start? Does it correlate with a deploy?

### 4b. Check Release Correlation

```json
sentry:execute_sentry_tool
{
 "name": "find_releases",
 "arguments": {
  "organizationSlug": "<ORG_SLUG>",
  "regionUrl": "<REGION_URL>",
  "projectSlug": "<PROJECT_SLUG>"
 }
}
```

If the issue started after a specific release, check what changed in that release:
```bash
git log --oneline <previous-release-tag>..<current-release-tag>
```

### 4c. Trace the Code Path

Read enough of the chain to say where the bad state originates: the crash-site function, every app-code frame above it, and — for unexpected data — its source (query and schema, state setter, input parsing, cache invalidation). `git log --oneline -20 -- <file>` on the culprit files.

### 4d. Research Best Practices Before Fixing

For non-trivial bugs, research the correct fix pattern:

```json
firecrawl:firecrawl_search
{
 "query": "<framework> <error-type> best practice fix <current year>",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Then scrape the most authoritative result:

```json
firecrawl:firecrawl_scrape
{
 "url": "<best-result-url>",
 "formats": ["markdown"],
 "onlyMainContent": true
}
```

### 4e. Formulate the Root Cause

Before writing any fix, state:
1. **What happened**: The specific runtime state that caused the error
2. **Why it happened**: The upstream reason that state was possible
3. **Where to fix it**: The correct layer — usually NOT the crash site, but where bad state originates

### 4f. Validate Against Anti-Patterns

| Anti-Pattern | Why It's Wrong | Do Instead |
|-------------|---------------|------------|
| Adding `?.` to suppress TypeError | Hides the null; downstream gets undefined | Fix why the value is null |
| try/catch that swallows | Error still happens, user sees broken state | Fix the error; if unrecoverable, show user-facing message + re-report |
| `Array.isArray()` guard | Checking consumer instead of fixing producer | Fix the producer |
| `?? []` or `?? {}` fallback | Masks data loading issues | Handle loading/error states explicitly |
| Filtering in `beforeSend` | Muting a real bug | Only filter genuinely external noise |
| Resolving without deploying | Error recurs next session | Only resolve after fix is committed |

---

## Step 5: Apply Fixes

### Noise Fixes

Read the project's Sentry config file (detected in Step 0c). Locate the `ignoreErrors` array or `beforeSend` function.

**Universal noise patterns** (safe to add to any web project):

```javascript
// Browser/extension noise
/^Script error/,
"ResizeObserver loop",
"Non-Error promise rejection captured",
/vid_mate_check/,
/_avast_submit/,

// Network noise (external)
"Failed to fetch",
"Load failed",
"net::ERR_",
"AbortError",
"The operation was aborted",
"cancelled",

// Chunk loading (deployment race)
"ChunkLoadError",
"Loading chunk",
"Failed to fetch dynamically imported module",
```

**Framework-specific noise** (add only if the framework is detected):

React/Next.js:
```javascript
"Hydration failed",
"server rendered HTML didn't match",
"Minified React error #418",
"Minified React error #423",
"Minified React error #425",
```

HMR/Dev-only:
```javascript
"Fast Refresh",
"performing full reload",
"Parsing ecmascript source code failed",
```

Service Worker:
```javascript
"ServiceWorker",
"Failed to register a ServiceWorker",
```

**Noise validation**: classify as noise only when the message does not originate from app code, no app frames appear in the stacktrace, and no real user action can trigger it.

### Code Bug / Data Bug Fixes

1. Fix at the root cause layer identified in Step 4e.
2. Make invalid state unrepresentable where possible.
3. Follow project conventions (read README files, existing patterns).
4. If the fix requires schema changes or infra work, flag for manual follow-up.
5. Fix the issue at hand, surgically. Unrelated bugs you notice go under "Requires Manual Follow-Up", not in the diff.

### Performance Fixes

Leave performance issues unresolved and list them in the summary — they need profiling and a product decision, not a triage-session fix.

### Config Gap Fixes

Implement in the relevant config file based on detected framework.

---

## Step 6: Verify Before Resolving

You may only resolve an issue if ALL of the following are true:

- [ ] Root cause identified (not just the symptom)
- [ ] Fix addresses root cause (not just suppresses the error)
- [ ] Fix does not introduce new issues for other callers
- [ ] For Noise: error genuinely originates outside app code
- [ ] For Code/Data Bugs: full code path read, fix is logically correct
- [ ] You have NOT merely added `?.`, try/catch, or type guards as the sole fix

If any checkbox fails, leave the issue **unresolved** and add it to "Requires Manual Follow-Up."

---

## Step 7: Resolve in Sentry

For each verified fix:

```json
sentry:update_issue
{
 "organizationSlug": "<ORG_SLUG>",
 "regionUrl": "<REGION_URL>",
 "issueId": "<ISSUE_ID>",
 "status": "resolved"
}
```

Issue the resolve calls in one message. Performance issues stay unresolved (Step 5).

`update_issue` needs the Triage skill on the Sentry MCP connection. The hosted server's OAuth sign-in leaves Triage unchecked by default; local stdio and `Sentry-Bearer` connections grant it unless narrowed. If the tool is missing, ask the user to reconnect the Sentry MCP with Triage enabled, or to resolve the issues in the Sentry UI.

---

## Step 8: Architecture Audit (Proactive Enhancement)

After triaging existing issues (or if no issues exist), audit the Sentry setup itself to identify monitoring gaps and architectural shortcomings.

### 8a. SDK Configuration Audit

Read the Sentry config file(s) detected in Step 0c. Check each setting:

| Setting | What to Check | Recommendation |
|---------|--------------|----------------|
| `dsn` | Is it set from env var, not hardcoded? | Use `process.env.SENTRY_DSN` or equivalent |
| `environment` | Is it dynamic? | Must read from env var, not hardcoded |
| `release` | Is it set? | Required for deploy correlation and regression detection |
| `tracesSampleRate` | Is it > 0? Is it < 1.0 in production? | 0.1-0.3 for production, 1.0 for dev |
| `replaysSessionSampleRate` | Is it configured? | 0.1 for production |
| `replaysOnErrorSampleRate` | Is it configured? | 1.0 (capture all error replays) |
| `integrations` | Are framework-appropriate integrations present? | See framework-specific recommendations below |
| `beforeSend` | Is it filtering too aggressively? | Should only filter genuinely external noise |
| `ignoreErrors` | Are patterns appropriate? | Cross-check against universal noise list |

**Framework-specific integration checks:**

| Framework | Expected Integrations |
|-----------|----------------------|
| Next.js | Auto-configured by `@sentry/nextjs` — check `withSentryConfig` in `next.config` |
| React SPA | `BrowserTracing`, `Replay` |
| Node.js | `Http`, `Express`/`Fastify`/`Koa`, `Postgres`/`Prisma` |
| Python | `DjangoIntegration` / `FlaskIntegration`, `SqlalchemyIntegration` |
| Vue | `BrowserTracing`, `Replay`, `Sentry.vueRouterInstrumentation` |

## Further reading

- [8b. Monitoring Coverage Audit and more](references/details.md)

> **Complement:** Sentry catches code-thrown errors. [Mushi Mushi](https://kensaur.us/mushi-mushi) catches user-*felt* friction that never triggers an exception — dead buttons, 12-second screens, broken layouts on one device. Install alongside Sentry: `npx mushi-mushi`.
