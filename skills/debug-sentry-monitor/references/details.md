
## Contents

- Step 9: Summary Report
- Sentry Monitor Report — [Project Name]
- Decision Tree: Is This Noise or a Bug?

### 8b. Monitoring Coverage Audit

Check what IS and IS NOT being monitored:

**Error Monitoring:**
- [ ] Global error handler configured (browser: `window.onerror`; Node: `process.on('unhandledRejection')`)
- [ ] Error boundaries catch all component trees (React) / global error handler (Vue/Angular)
- [ ] API error responses are captured with context
- [ ] Background job/worker errors are captured

**Performance Monitoring:**
- [ ] `tracesSampleRate > 0` (performance monitoring is ON)
- [ ] Key transactions instrumented (API routes, DB queries, external calls)
- [ ] Web Vitals being reported (LCP, INP, CLS)
- [ ] Custom spans for business-critical operations

**Session Replay:**
- [ ] Replay SDK installed and configured
- [ ] `replaysOnErrorSampleRate` set to 1.0 (capture replays when errors occur)
- [ ] Privacy masking configured appropriately

**Contextual Data:**
- [ ] User identity set (`Sentry.setUser()` after auth)
- [ ] Custom tags for business context (feature flags, plan tier, locale)
- [ ] Breadcrumbs rich enough (not just defaults — custom breadcrumbs for key user actions)
- [ ] Structured context (`Sentry.setContext()`) for debugging

**Source Maps:**
- [ ] Source maps uploaded during build (check for `@sentry/webpack-plugin`, `@sentry/cli`, or framework-specific upload)
- [ ] Verify stacktraces in Sentry show original source, not minified code
- [ ] `.sentryclirc` or auth token configured for uploads

### 8c. Research Current Best Practices

Search for the latest Sentry recommendations for the detected framework:

```json
firecrawl:firecrawl_search
{
  "query": "<FRAMEWORK> sentry best practices configuration <current year>",
  "limit": 5,
  "sources": [{ "type": "web" }]
}
```

Scrape the Sentry official docs for the framework:

```json
firecrawl:firecrawl_scrape
{
  "url": "https://docs.sentry.io/platforms/<platform>/",
  "formats": ["markdown"],
  "onlyMainContent": true
}
```

Platform paths: `javascript/nextjs`, `javascript/react`, `javascript/vue`, `python/django`, `python/flask`, `node`, `go`, `java/spring-boot`, `ruby/rails`.

### 8d. Alerting Audit

Check if alert rules exist and are useful:
- Are there alerts for error spikes? (e.g., >10x normal rate in 5 min)
- Are there alerts for new issue types?
- Are there alerts for regression (previously resolved issue re-opening)?
- Are there alerts for performance degradation (p95 response time)?

Recommend alert rules if none exist.

---

## Step 9: Summary Report

Output this report after all work is complete:

```markdown
## Sentry Monitor Report — [Project Name]

### Configuration Detected
- Organization: [org slug]
- Project: [project slug]
- Framework: [framework]
- Platform: [browser/server/hybrid]
- Sentry Config: [file path]

### Issues Addressed

| Issue ID | Title | Events | Users | Bucket | Root Cause | Fix Applied | Status |
|----------|-------|--------|-------|--------|-----------|-------------|--------|
| XX-123 | ... | N | N | Bug | "query returns null when..." | "added explicit empty state..." | resolved |
| XX-124 | ... | N | N | Noise | "browser extension injects..." | "added ignoreErrors pattern" | resolved |

### Seer AI Analysis

| Issue ID | Seer Root Cause | Seer Suggested Fix | Used? | Notes |
|----------|----------------|--------------------|-------|-------|
| XX-123 | [Seer's root cause explanation] | [Seer's code fix summary] | Yes/No | [why used or why overridden] |

### Root Cause Analysis Details

For each Code Bug / Data Bug:

**XX-123: [Title]**
- **Seer analysis**: [summary of Seer's findings, or "N/A — below threshold"]
- **What happened**: [runtime state that caused the crash]
- **Why it happened**: [upstream reason — the actual root cause]
- **Fix location**: [file(s) changed and what was changed]
- **Why this fix is correct**: [1-2 sentences]
- **Blast radius check**: [other callers verified unaffected]

### Architecture Audit

#### SDK Configuration
- Current: [what's configured]
- Gaps: [what's missing or suboptimal]
- Recommended changes: [specific code changes]

#### Monitoring Coverage
- Covered: [what's being monitored]
- Blind spots: [what's NOT being monitored but should be]
- Recommended instrumentation: [specific additions]

#### Alerting
- Current alerts: [if any]
- Recommended alerts: [with thresholds]

#### Source Maps
- Status: [working / broken / not configured]
- Fix: [if needed]

### Files Modified
- [path] — [description]

### Requires Manual Follow-Up
- XX-125: [Title] — [why it cannot be fixed automatically]
```

---

## Decision Tree: Is This Noise or a Bug?

```
1. Does the stacktrace contain ANY frame from your app code?
   YES → likely a Bug, go to 2
   NO  → likely Noise, go to 5

2. Does the error reference a variable, function, or component YOU wrote?
   YES → Code Bug (proceed to Root Cause Analysis)
   NO  → go to 3

3. Is the error triggered by a user action in your app?
   YES → Code Bug or Data Bug (your code should handle this)
   NO  → go to 4

4. Does the error only happen in specific browsers/OS or with specific extensions?
   YES → likely Noise (browser/extension incompatibility)
   NO  → treat as Code Bug to be safe

5. Is the error from a browser extension, ad blocker, or third-party script?
   YES → Noise (add to ignoreErrors)
   NO  → go to 6

6. Is the error a known framework issue (React hydration, HMR, chunk loading)?
   YES → Noise (add framework-specific filter)
   NO  → treat as Code Bug to be safe (investigate before filtering)
```
