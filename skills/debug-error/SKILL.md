---
name: debug-error
description: >
  Diagnose one bug with hypotheses and runtime evidence before fixing. Use
  when "debug this error" or behavior is unexpected. FE↔BE mismatch →
  debug-fe-be-integration. Bug to PR → workflow-fix-and-ship. Sentry backlog
  → debug-sentry-monitor.
license: MIT
effort: high
---

# Debug Error Skill

**Degree of freedom: MIXED.** Root-cause judgment `[HIGH freedom]`; the red
feedback loop and verify-green re-run `[LOW freedom — run exactly]`.

Systematic approach to debugging errors and unexpected behavior. Works with any project.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **debug-error** (this) | Diagnose one bug with hypotheses and runtime evidence before fixing |
| `debug-fe-be-integration` | Frontend-backend contract failures traced on both sides: 4xx/5xx, mismatched payloads |
| `workflow-fix-and-ship` | One bug-fix lifecycle: triage, reproduce, debug, regression test, fix, PR |
| `debug-sentry-monitor` | Operate Sentry: triage unresolved issues, cut noise, monitor after deploy |

## How to reason

1. **Observe** — exact symptom, stack, environment, first-seen
2. **Interpret** — crash site vs producer; FE / BE / integration / data
3. **Classify** — null-access / contract / env / race / unknown
4. **Severity** — prod-wide auth break outranks a single-user edge

## Worked example

> **Observe:** `TypeError: Cannot read property 'email' of undefined` on `/account` after signup.
> **Interpret:** crash is in the profile card; API returns `null` for incomplete onboarding.
> **Classify:** data bug — producer returns null, consumer assumes an object.
> **Fix:** handle the onboarding-null at the producer contract + UI empty state; do not `?.` the crash site only.

## Self-critique before reporting

- **Red loop first** — a failing command existed before the hypothesis
- **Root, not symptom** — no `?.` / swallowed catch as the sole fix
- **Green loop** — the same command was re-run and passed
- **Right owner** — FE↔BE mismatch → `debug-fe-be-integration`; Sentry backlog → `debug-sentry-monitor`

## Pre-debug checks

**Before debugging:**

### 1. Read Relevant Documentation
```
README.md (project overview)
src/[domain]/@_[domain]-README.md (domain-specific behavior)
docs/ (system documentation)
```

### 2. Check for Sentry Context (if production error)

If the error is from production and Sentry is configured, fetch the full context:

```json
sentry:search_issues
{
 "organizationSlug": "<ORG_SLUG>",
 "query": "<error message or description>",
 "projectSlugOrId": "<PROJECT_SLUG>",
 "regionUrl": "<REGION_URL>",
 "limit": 5
}
```

Then get details for the matching issue:

```json
sentry:get_sentry_resource
{
 "organizationSlug": "<ORG_SLUG>",
 "resourceType": "issue",
 "resourceId": "<ISSUE_ID>"
}
```

Extract: stacktrace, breadcrumbs, tags (browser, OS, URL, release), event frequency.

### 3. Check Database State (if data-related)

If data is involved, verify expectations against reality using Supabase MCP or direct queries.

### 4. Verification statement — so the diagnosis rests on what you read and fetched

Before diving into debug, state:
```
"Pre-debug check:
- README/docs read: [list]
- Sentry context: [YES with details / NO — not production / not configured]
- Database state verified: [YES/NO — findings]
- Backend API checked: [YES/NO — status]
- Error scope identified: [FE only / BE only / Integration / Data]"
```

---

## Debug Process

```
1. Reproduce → 2. Isolate → 3. Research → 4. Identify → 5. Fix → 6. Verify → 7. Prevent
```

---

## Phase 1: Reproduce

### Build a tight feedback loop first

**This is the skill — everything after is mechanical.** Before reading code to
build a theory, construct one command that goes red on *this* bug and will go
green when it's fixed (adapted from
[mattpocock/skills](https://github.com/mattpocock/skills), MIT). In rough order
of preference: a failing test at the nearest seam → a curl/HTTP script against
the dev server → a CLI invocation with a fixture input → a headless browser
script → replaying a captured trace/payload through the code path in isolation.

The loop is done when it is:

- [ ] **Red-capable** — asserts the user's exact symptom, not "runs without erroring"
- [ ] **Deterministic** — same verdict every run (flaky bugs: loop the trigger to raise the reproduction rate until debuggable)
- [ ] **Fast** — seconds, not minutes
- [ ] **Already run once** — you can paste the invocation and its red output

If you catch yourself forming a hypothesis before this command exists, stop —
that is the exact failure this phase prevents. If you genuinely cannot build a
loop, say so explicitly, list what you tried, and ask for a captured artifact
(HAR, log dump, recording) instead of proceeding blind.

### Gather Information

```markdown
Error Report:
- What happened: [description]
- Expected behavior: [what should happen]
- Steps to reproduce:
 1. [step]
 2. [step]
- Environment: [browser/OS/Node version]
- Error message: [exact message]
- Stack trace: [if available]
- First seen: [when — correlate with deploys]
```

### Questions to Determine Scope
- Can you reproduce it consistently?
- When did it start happening? (check `git log` for recent changes)
- Does it happen for all users or specific ones? (check Sentry tag distribution)
- Is it environment-specific? (dev vs staging vs production)

---

## Phase 2: Isolate

### Narrow Down the Problem

```
Works in: Fails in:
├─ Production? ├─ Production?
├─ Staging? ├─ Staging?
├─ Local? ├─ Local?
├─ All browsers? ├─ Specific browser?
├─ All users? ├─ Specific user?
└─ All data? └─ Specific data?
```

### Trace the Data Flow

For data-related bugs, trace the full pipeline:
```
User Action → Frontend Handler → API Call → Backend Controller → Database → Response → State Update → Render
```

Identify where the data goes wrong by checking each boundary.

### Minimise the repro

Once the feedback loop is red, shrink the repro to the smallest scenario that
still goes red: cut inputs, callers, config, and data one at a time, re-running
the loop after each cut. Done when every remaining element is load-bearing —
removing any one makes the loop go green. A minimal repro shrinks the hypothesis
space and becomes the regression test in Phase 6.

---

## Phase 3: Research the error pattern before fixing

For non-trivial errors, research the correct fix before implementing. Recognizing the framework or the error is not knowing its current behavior — search the exact error string and read the current docs even when you think you know the fix:

```json
firecrawl:firecrawl_search
{
 "query": "<framework> <exact error message> fix best practice",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Then scrape the most relevant result:

```json
firecrawl:firecrawl_scrape
{
 "url": "<best-result-url>",
 "formats": ["markdown"],
 "onlyMainContent": true
}
```

Also check official docs via Context7 if the error relates to a library:

```json
context7:resolve-library-id
{
 "libraryName": "<library>",
 "query": "<error description>"
}
```

**Trust hierarchy**: Official docs > maintainer posts > engineering blogs > Stack Overflow (current year, high votes).

---

## Phase 4: Identify Root Cause

### Root Cause Formulation

Before writing any fix, state:
1. **What happened**: The specific runtime state that caused the error
2. **Why it happened**: The upstream reason that state was possible
3. **Where to fix it**: The correct layer — usually NOT the crash site

---

## Phase 5: Fix

### Anti-Pattern Checklist

Do NOT apply these as the sole fix:
- Adding `?.` to suppress a TypeError → fix why the value is null
- Wrapping in try/catch and swallowing → fix the underlying error
- Adding `?? []` fallback → handle loading/error states explicitly
- Adding `if` guards at the consumer → fix the producer

### Fix Principles

1. Fix at the root cause layer, not the crash site (unless they're the same)
2. Make invalid state unrepresentable
3. Follow existing project conventions
4. If the fix touches a shared function, verify all callers
5. Fix this bug only. Pre-existing bugs you notice go in the report as follow-ups, not in the diff. The feedback-loop script stays out of the repo unless it becomes the Phase-6 regression test in a place the repo already keeps tests. Edit surgically; do not rewrite files.

---

## Phase 6: Verify

### Test the Fix

- [ ] Phase 1 feedback loop re-run and now green (paste the invocation + output)
- [ ] Minimised repro converted into a regression test at a correct seam — one
      that exercises the real bug pattern; if no correct seam exists, document
      that as an architectural finding instead of writing a false-confidence test
- [ ] Test suite run where one exists, output pasted

### Regression Check

```bash
# Run tests
npm test
# Or framework-specific
pytest
cargo test
go test ./...
```

---

## Phase 7: Prevent

### Add Monitoring

If the bug could recur in a different form, add monitoring:
- Custom Sentry context for the affected code path
- Breadcrumbs for key user actions
- Structured logging for data flow checkpoints

### Document Non-Obvious Fixes

If the bug was caused by a non-obvious interaction, add a comment explaining the constraint:
```typescript
// Profile can be null for users who haven't completed onboarding.
// The API returns null (not 404) in this case. See: ISSUE-123.
```

---

## Debug Checklist

```markdown
## Bug Investigation: [Title]

**Pre-Debug:**
- [ ] Docs/README read
- [ ] Sentry context fetched (if applicable)
- [ ] Database state checked (if data-related)
- [ ] Error scope identified

**Investigation:**
- [ ] Can reproduce locally (or have Sentry reproduction)
- [ ] Isolated to specific component/function/layer
- [ ] Research completed (Firecrawl/Context7)
- [ ] Root cause identified and stated

**Fix:**
- [ ] Fix addresses root cause (not symptoms)
- [ ] No anti-patterns used as sole fix
- [ ] Side effects checked (other callers)
- [ ] Tests pass

**Prevention:**
- [ ] Monitoring added (if applicable)
- [ ] Documentation updated (if non-obvious)
```
