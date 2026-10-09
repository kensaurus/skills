
## Contents

- Phase 6: Edge Case and Stress Testing
- Phase 7: Cleanup
- Phase 8: Report
- QA Test Report — [Project Name]
- Sentry Integration (optional)
- Adapting to Different App Types
- Test Data Guidelines
- Execution Protocol
- Important Rules

### 5d. Data Display Quality

| Check | What to Look For |
|-------|-----------------|
| Formatting | Currency, dates, percentages displayed correctly for locale |
| Raw data leaks | "undefined", "null", "NaN", "[object Object]", "Invalid Date" visible |
| Mock/placeholder | "Lorem ipsum", "TODO", "test@example.com", "John Doe" in production data |
| Number accuracy | Totals match sum of line items. Percentages sum to ~100%. |
| Table headers | Every column has a header. Sort indicators if sortable. |
| Chart labels | Axes labeled, legend present, values readable |

### 5e. Accessibility Basics

| Check | How to Verify |
|-------|--------------|
| Accessible names | Interactive elements have `aria-label`, `aria-labelledby`, or visible text |
| Color contrast | Text readable against background (use screenshot inspection) |
| Focus visible | Tab through the page — can you see where focus is? |
| Form labels | `<label>` elements associated with `<input>` via `for`/`htmlFor` |
| Alt text | Images have `alt` attributes (check via snapshot) |

---

## Phase 6: Edge Case and Stress Testing

### 6a. Input Boundary Testing

For each form field:

| Input Type | Test Values |
|-----------|------------|
| Text | Empty, 1 char, 500 chars, 5000 chars |
| Number | 0, -1, 999999999, 0.001, NaN (type "abc") |
| Email | Missing @, double @, special chars, very long |
| Date | Past (1900-01-01), future (2099-12-31), today |
| URL | No protocol, invalid TLD, very long |
| Select | First option, last option, no selection |

### 6b. Rapid Interaction

1. Double-click submit buttons — does it submit twice? (Check network requests)
2. Click a navigation link 3 times rapidly — does it crash or navigate correctly?
3. Toggle a setting on/off/on/off quickly — does it end in the correct state?

### 6c. Navigation Edge Cases

1. Browser back button from every page — does it go to the right place?
2. Browser forward button after going back — works correctly?
3. Direct URL access to every page (not via navigation) — loads correctly?
4. Bookmark a page, close tab, reopen — same state?

### 6d. Error State Testing

1. Navigate to `/this-page-does-not-exist` → expect proper 404
2. If possible, trigger API errors → expect user-facing error messages
3. Submit invalid data in every form → expect inline validation

---

## Phase 7: Cleanup

Remove all test data created during testing:

1. Delete any items prefixed with `QA-TEST-`
2. Reset any settings changed during testing
3. If DB access available, verify cleanup:

```sql
SELECT * FROM <table> WHERE <name_column> LIKE 'QA-TEST-%';
-- Should return 0 rows
```

4. **Keep auth session** — do not log out; leave the session's `--profile` directory (or
   `state-save` file) intact for the next
   agent/skill unless you were testing logout explicitly.

---

## Phase 8: Report

Produce the final QA report:

```markdown
## QA Test Report — [Project Name]

### Environment
- URL: [url tested]
- Framework: [detected framework + version]
- Auth: [method used or "guest"]
- Date: [date]

### Discovery Summary
- Routes in codebase: [N]
- Pages tested: [N]
- Data entities found: [N]
- CRUD-capable entities tested: [N]

### Test Summary

| Metric | Value |
|--------|-------|
| User stories executed | [N] |
| Individual test steps | [N] |
| CRUD operations performed | [N] |
| Passed | [N] |
| Failed | [N] |
| Blocked | [N] |
| Pass rate | [%] |

### Critical Issues (blocks production release)

| # | Page | Issue | Evidence | Steps to Reproduce |
|---|------|-------|----------|-------------------|
| 1 | [url] | [description] | [screenshot/console ref] | [steps] |

### Major Issues (degrades user experience)

| # | Page | Issue | Evidence | Recommendation |
|---|------|-------|----------|---------------|
| 1 | [url] | [description] | [ref] | [how to fix] |

### Minor Issues (polish for design award)

| # | Page | Issue | Quick Fix |
|---|------|-------|-----------|
| 1 | [url] | [description] | [suggestion] |

### Data Pipeline Issues

| # | Entity | Operation | Issue | Evidence |
|---|--------|-----------|-------|----------|
| 1 | [entity] | [create/update/delete] | [what went wrong] | [network/DB evidence] |

### Dead / Mock Code Detected

| # | Page | Finding |
|---|------|---------|
| 1 | [url] | [dead button / mock data / placeholder text] |

### UX Quality Highlights

#### What Works Well
1. [genuine positive with evidence]
2. [genuine positive with evidence]

#### Design-Award Readiness
- Visual consistency: [score 1-5]
- Interaction feedback: [score 1-5]
- Empty/error states: [score 1-5]
- Data display quality: [score 1-5]
- Accessibility basics: [score 1-5]

### Pages Not Tested

| Page | Reason |
|------|--------|
| [url] | [BLOCKED: auth / SKIPPED: reason] |

### Cleanup Verification
- Test data created: [N items]
- Test data deleted: [N items]
- Orphaned test data: [N — details if any]

### Production Readiness Score

**[N] / 10** — [1-2 sentence justification]

| Score | Meaning |
|-------|---------|
| 9-10 | Ship it. Design-award ready. |
| 7-8 | Ship after fixing critical/major issues. Solid. |
| 5-6 | Needs work. Multiple major issues. |
| 3-4 | Not ready. Fundamental problems. |
| 1-2 | Broken. Major rework needed. |
```

---

## Sentry Integration (optional)

If the project has Sentry configured (detected in Phase 0), check for production errors
related to tested features:

```json
sentry:search_issues
{
  "organizationSlug": "<ORG_SLUG>",
  "query": "unresolved issues from the last 7 days",
  "projectSlugOrId": "<PROJECT_SLUG>",
  "regionUrl": "<REGION_URL>",
  "limit": 30
}
```

Cross-reference Sentry issues with pages tested. If a page you tested has known production
errors, note them in the report under a "Known Production Issues" section.

---

## Adapting to Different App Types

The skill auto-adapts based on what Phase 0 discovers. Here are common patterns:

| App Type | Focus Areas |
|----------|------------|
| **CRUD / SaaS** | Heavy CRUD lifecycle testing, data pipeline verification, form validation |
| **Content / CMS** | Content rendering, search, filtering, pagination, media loading |
| **E-commerce** | Cart operations, checkout flow, pricing accuracy, inventory states |
| **Social** | User interactions, feed rendering, notifications, privacy settings |
| **Language learning** | Lesson flow completion, progress tracking, content accuracy |
| **Dashboard / Analytics** | Chart rendering, data accuracy, filter interactions, export |
| **Mobile-first PWA** | Touch targets, offline states, install prompt, viewport testing |

---

## Test Data Guidelines

When generating test data for CRUD operations:

- **Prefix all test data** with `QA-TEST-` for easy identification and cleanup
- **Use realistic but obviously fake values**: `QA-TEST-Widget-1712345678`, `qa-test@example.com`
- **Never use real personal data** or production credentials
- **Respect domain constraints**: if the app is financial, use realistic but fake numbers
- **Cover multiple data types**: strings, numbers, dates, booleans, selections
- **Test with the app's locale**: if the app is in Japanese, test with Japanese input too

---

## Execution Protocol

For each test step, follow this cycle:

```bash
PW="npx --yes @playwright/cli@latest"; S="-s=qa-<app>"
$PW $S open --headed "<url>"                          # 0. once per run; later pages: $PW $S goto "<url>"
$PW $S snapshot                                       # 1-2. anti-stall: verify loaded + get refs (blank → sleep 2 → snapshot again)
$PW $S click <ref>                                    # 3. interact (click / fill / type / press)
$PW $S snapshot                                       # 4. fresh refs after interaction
$PW $S console                                        # 5. check for errors
$PW $S requests                                       # 6. check for failures
$PW $S screenshot --filename ".playwright-mcp/<step>.png"   # 7. evidence
```

8. Evaluate: PASS or FAIL with evidence.
9. `$PW $S close` when the run is done.

**Timeout budget:**
- Single interaction: 15 seconds max
- Page navigation + verification: 30 seconds max
- Full CRUD lifecycle per entity: 5 minutes max
- Full test suite: 30 minutes max

If any step exceeds its budget, log `[TIMEOUT]` and move on.

---

## Important Rules

1. **Read the codebase first (Phase 0).** Routes, entities, and auth come from the code, not from guessing at the UI.
2. **Use playwright-cli** for all browser interaction: `goto`, `snapshot`, `screenshot`, `click`, `fill`, `type`, `press`, `console`, `requests`, `close`, `find`.
3. **Apply anti-stall protocol** to every interaction. Read `protocol-browser-anti-stall` skill first.
4. **Screenshot every test step.** Every pass and fail needs visual evidence.
5. **Check console and network** after every page load and every mutation.
6. **Clean up test data.** Delete everything prefixed with `QA-TEST-` at the end.
7. **Be binary on findings.** Each check either PASSES or FAILS. No "sort of works."
8. **Report severity honestly.** Critical = blocks release. Major = bad UX. Minor = polish.
9. **Note what works well.** Good QA reports include positives, not just bugs.
10. **Respect time budgets.** Skip stuck steps rather than freezing the entire session.
