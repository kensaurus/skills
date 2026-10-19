---
name: debug-fe-be-integration
description: >
  Diagnose and fix frontend↔backend contract failures by tracing requests,
  server logs, validation, auth, and responses on both sides. Use for API
  4xx/5xx, mismatched payloads, or "frontend and backend disagree". One layer
  → debug-error.
license: MIT
effort: high
---

# Frontend-Backend Integration Debug Skill

**Degree of freedom: MIXED.** Which side is wrong `[HIGH freedom]`;
trace-both-sides probes `[LOW freedom — run exactly]`.

Systematic approach to debugging frontend-backend integration issues by analyzing backend
logs, production errors, and source code to identify root causes and fix both sides.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **debug-fe-be-integration** (this) | Live FE and BE contract failures, traced on both sides |
| `debug-error` | One bug in one layer, hypotheses and runtime evidence first |
| `audit-fe-api` | Contract-alignment audit of frontend API calls against backend implementation |

## How to reason

1. **Observe** — status, payload, validation error, both logs
2. **Interpret** — FE omitted a field vs BE schema drifted vs auth/CORS
3. **Classify** — missing-param / type / 404 / 401 / 500 / CORS
4. **Severity** — 500 on a write path outranks a cosmetic 422 message

## Worked example

> **Observe:** FE `GET /api/reports` → 500; BE log `ZodError: expected string, received undefined` on `year`.
> **Interpret:** FE omitted `year`; BE schema required it with no default.
> **Classify:** missing-param — fix FE call and add a clear BE 422/default.
> **Verify:** same request returns 200 with the year bound; both sides updated.

## Self-critique before reporting

- **Both sides read** — FE call and BE schema/logs, not one side guessed
- **Contract named** — status + payload field, not "they disagree"
- **Fix matches class** — 404 is not patched as a Zod default
- **Right owner** — single-layer crash → `debug-error`; proactive contract audit → `audit-fe-api`

---

## Step 0: Auto-Detect Stack

Before debugging, discover the project's architecture.

### 0a. Detect Frontend Framework

Read `package.json` and look for:

| Signal | Framework |
|--------|-----------|
| `next` | Next.js |
| `nuxt` | Nuxt |
| `@remix-run/react` | Remix |
| `@sveltejs/kit` | SvelteKit |
| `vite` + `react` | Vite React SPA |
| `@angular/core` | Angular |

### 0b. Detect Backend Framework

```
Glob: **/app/api/**/route.ts → Next.js App Router
Glob: **/pages/api/**/*.ts → Next.js Pages Router
Glob: **/server/api/**/*.ts → Nuxt server
Glob: **/src/routes/**/*.ts → Express/Hono/Fastify
Glob: **/src/app.ts or **/src/index.ts → Node backend entry
Glob: **/main.py or **/app.py → Python backend
Glob: **/main.go → Go backend
```

### 0c. Detect API Style and Validation

| Signal | Technology |
|--------|-----------|
| `@trpc/server` | tRPC (type-safe, no REST audit needed) |
| `graphql` or `@apollo/server` | GraphQL |
| `zod` in BE dependencies | Zod validation |
| `joi` in BE dependencies | Joi validation |
| `yup` in BE dependencies | Yup validation |
| `class-validator` | NestJS-style validation |
| `pydantic` | Python Pydantic validation |

### 0d. Find Route and Controller Patterns

```
Grep: pattern "router\.(get|post|patch|put|delete)" glob "*.{ts,js}" — Express-style
Grep: pattern "app\.(get|post|patch|put|delete)" glob "*.{ts,js}" — Hono/Express
Grep: pattern "export (async function |const )(GET|POST|PATCH|PUT|DELETE)" glob "**/route.ts" — Next.js
Grep: pattern "defineEventHandler" glob "*.{ts,js}" — Nuxt/H3
```

### 0e. Record Discovery

```
STACK DISCOVERY:
- Frontend: [framework + version]
- Backend: [framework + version]
- API style: [REST / GraphQL / tRPC]
- Validation: [Zod / Joi / Yup / Pydantic / none]
- Route files: [pattern and locations]
- Controller files: [pattern and locations]
- Schema files: [pattern and locations]
```

---

## Step 1: Research Debugging Patterns

### 1a. Firecrawl — Integration Debugging

Search the framework and validation library as written — recognizing the name is not knowing its current API or error shape.

```json
firecrawl:firecrawl_search
{
 "query": "<FE_FRAMEWORK> <BE_FRAMEWORK> API integration debugging best practices [current year]",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Additional targeted searches:

| Topic | Query |
|-------|-------|
| Validation errors | `<VALIDATION_LIB> error handling API response best practices` |
| CORS issues | `<BE_FRAMEWORK> CORS configuration debugging` |
| Type mismatches | `TypeScript API type safety frontend backend shared types` |

### 1b. Context7 — Framework Docs

```json
context7:resolve-library-id
{
 "libraryName": "<VALIDATION_LIB>",
 "query": "error handling error messages custom errors"
}
```

---

## Step 2: Gather Error Evidence

### 2a. Check Sentry for Production Errors

```json
sentry:search_issues
{
 "organizationSlug": "<ORG_SLUG>",
 "query": "API integration errors 4xx 5xx validation from the last 7 days",
 "projectSlugOrId": "<PROJECT_SLUG>",
 "regionUrl": "<REGION_URL>",
 "limit": 25
}
```

If the project has separate FE and BE Sentry projects, check both:
- FE project: network errors, unhandled rejections from API calls
- BE project: validation errors, unhandled exceptions, 500s

### 2b. Read Backend Terminal Logs

Read the output of the terminal running the backend (`npm run dev` or equivalent) — in Cursor, `terminals/*.txt`; in Claude Code, the shell or log file you started it from.

Look for errors in the last 3-5 minutes:
- `4xx` errors (400, 401, 403, 404, 422)
- `5xx` errors (500, 502, 503)
- `ZodError` / `ValidationError` — validation failures
- `AppError` / custom error classes
- Stack traces
- Warning messages

### 2c. Categorize Errors Found

| Category | Log Pattern | Root Cause |
|----------|-------------|------------|
| Missing parameter | `ZodError: expected string, received undefined` | FE not sending required param |
| Wrong type | `ZodError: invalid_type` | FE sending wrong type |
| Endpoint not found | `404 /api/...` | FE calling non-existent endpoint |
| Auth error | `401 Unauthorized` | Missing or invalid token |
| Permission error | `403 Forbidden` | User lacks permission |
| Validation error | `422 Unprocessable` | Invalid request body |
| Server error | `500 Internal` | Backend bug |
| CORS error | `CORS policy` | Missing CORS configuration |

---

## Step 3: Trace Errors to Source Code

### 3a. Map Errors to Endpoints

For each error found, use `Grep` to locate:

**Frontend call:**
```
Grep: pattern "<ERROR_ENDPOINT>" glob "*.{ts,tsx,js,jsx}"
```

**Backend route:**
```
Grep: pattern "<ERROR_ENDPOINT>" glob "*.{ts,js,py,go,rb}" — in backend source
```

**Validation schema:**
```
Grep: pattern "z\.object|z\.string|z\.number" in the controller/route file
SemanticSearch: "validation schema for <ENDPOINT>" target: [backend directory]
```

### 3b. Read the Full Chain

For each error, read the complete request chain:

1. **Frontend call** — Read the file making the API call (service, hook, or component)
2. **API client config** — Read the axios/fetch interceptor configuration
3. **Backend route** — Read the route handler
4. **Backend controller** — Read the controller/service logic
5. **Validation schema** — Read the Zod/Joi/Yup schema for the endpoint
6. **Database query** — Read the DB query (if the error is data-related)

### 3c. Verify Data State with Supabase MCP

If the error might be data-related:

```json
supabase:execute_sql
{
 "query": "SELECT * FROM <TABLE> WHERE <CONDITION> LIMIT 5"
}
```

Check:
- Does the data the FE expects actually exist?
- Are enum values correct?
- Are foreign key relationships intact?
- Does the RLS policy allow access for this user?

---

## Step 4: Generate Fix Recommendations

### 4a. Frontend Fixes

For each error, provide:

```markdown
### Issue: [Endpoint] — [Error Type]

**Current FE Call:**
[show the actual code from Grep results]

**Correct FE Call:**
[show the fixed code]

**Why:** [explanation of required parameter/type/format]

**Files to Update:** [list specific files]
```

### 4b. Backend Enhancements

For each error, consider backend improvements — as recommendations in the report. Apply the fix for the contract failure at hand; the robustness enhancements ship only when the user asks, and every edit is surgical.

```markdown
### Backend Enhancement: [Endpoint]

**Current Behavior:** Returns 500 with cryptic validation error

**Recommended Enhancement:**
- Add default value for optional params
- Add clear error message for required params
- Add type coercion where appropriate
- Return helpful 422 instead of 500
```

Example backend enhancement pattern:

```typescript
// Before: bare schema, cryptic error on missing param
const schema = z.object({
 year: z.string(),
});

// After: defaults, coercion, clear errors
const schema = z.object({
 year: z.string({
 required_error: "year is required (format: YYYY)"
 }).default(() => new Date().getFullYear().toString()),
 page: z.coerce.number().default(1).int().positive(),
 limit: z.coerce.number().default(10).int().max(100),
});
```

---

## Step 5: Backend Robustness Checklist

### Input Validation
- [ ] All required params have clear error messages
- [ ] Default values for optional params with sensible defaults
- [ ] Type coercion where appropriate (string to number)
- [ ] Range validation (dates, numbers)
- [ ] Format validation (email, UUID, date strings)

### Error Handling
- [ ] Catch and wrap database errors
- [ ] Provide actionable error messages (not "Internal Server Error")
- [ ] Log errors with context (userId, endpoint, params)
- [ ] Do not expose internal details to client (stack traces, SQL)

### API Contract Consistency
- [ ] Response shape is consistent (`{ data }` or `{ error }`)
- [ ] Status codes are correct (200 success, 201 create, 204 delete)
- [ ] Pagination format is consistent across all list endpoints
- [ ] Date formats are consistent (ISO 8601)
- [ ] Error response shape is consistent

---

## Output Template

```markdown
## Frontend-Backend Integration Debug Report

**Analyzed:** [timestamp range]
**Frontend:** [framework]
**Backend:** [framework]
**API style:** [REST/GraphQL/tRPC]

---

### Production Errors (Sentry)

| Endpoint | Error | Events (7d) | Root Cause |
|----------|-------|-------------|------------|
| [endpoint] | [error msg] | [count] | [FE/BE/Data] |

---

### Backend Log Errors

| Endpoint | Method | Status | Error Type | Root Cause |
|----------|--------|--------|------------|------------|
| `/api/...` | GET | 500 | ZodError | Missing `year` param |
| `/api/...` | GET | 404 | Not Found | Endpoint not implemented |

---

### Critical Issues (Must Fix)

#### 1. [Endpoint] — [Status Code]
- **Error:** [error message]
- **Root Cause:** [explanation]
- **Frontend Fix:** [what FE needs to change, with code]
- **Backend Enhancement:** [optional BE improvement, with code]
- **Files:** FE: [path], BE: [path]

---

### Warnings (Should Fix)

#### 1. [Issue description]
- **Impact:** [what happens if not fixed]
- **Recommendation:** [how to fix]

---

### Backend Enhancements (Robustness)

#### 1. [Enhancement description]
- **Current:** [current behavior]
- **Recommended:** [better approach]
- **Benefit:** [why this helps]

---

### Research Findings Applied
- [Pattern from research]: [how it applies]
- [Best practice]: [gap identified]

---

### Summary Table

| Endpoint | Issue | Fix Required | Priority |
|----------|-------|--------------|----------|
| `/api/...` | Missing param | Frontend | HIGH |
| `/api/...` | No error handling | Both | MEDIUM |
| `/api/...` | Endpoint 404 | Remove or implement | LOW |

---

### Next Steps

1. [ ] Frontend fixes: [action items with files]
2. [ ] Backend enhancements: [action items with files]
3. [ ] Re-test: [verification steps]
4. [ ] Monitor: Check Sentry after deploy for regression
```

---

## Common Patterns and Fixes

### Pattern 1: Missing Query Parameter

**Symptom:** `ZodError: expected string, received undefined`

**FE Fix:** Add the missing parameter to the API call.

**BE Fix:** Add a default value or a clear error message.

### Pattern 2: Endpoint Not Found (404)

**Symptom:** `404 /api/endpoint-name`

**Debug steps:**
1. `Grep` for the endpoint path in backend route files
2. Check if the endpoint exists under a different name
3. Check API docs if available
4. Decide: remove FE call, fix typo, or implement endpoint

### Pattern 3: Service Failure (500)

**Symptom:** `500 Internal Server Error` with no useful message

**Debug steps:**
1. Read the backend controller for unhandled exceptions
2. Check if the service handles DB errors gracefully
3. Check RLS policies if using Supabase (data might be blocked)
4. Add try/catch with meaningful error responses

### Pattern 4: CORS Error

**Symptom:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Debug steps:**
1. Check backend CORS configuration
2. Verify the origin, methods, and headers allowed
3. Check if credentials mode matches between FE and BE

### Pattern 5: Duplicate / Stale Requests

**Symptom:** Same API called multiple times, or stale data shown

**Debug steps:**
1. Check if TanStack Query / SWR staleTime is configured
2. Check if cache invalidation happens after mutations
3. Check if the queryKey is correct and unique
4. Check for component re-mount causing refetch

---

## Integration with Other Skills

- **`audit-fe-api`**: Proactive audit from FE code perspective (run first).
- **`debug-sentry-monitor`**: Triage and fix Sentry errors from production.
- **`audit-db-schema`**: Verify DB schema matches API expectations.
