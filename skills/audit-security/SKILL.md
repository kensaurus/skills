---
name: audit-security
description: >
  Audit and fix app code against OWASP (injection, headers, dependencies). Use
  when "review security" or "check vulnerabilities". Auth gates →
  audit-auth-flows. Plan-only → plan-security-audit. RLS → plan-rls-audit. LLM
  → audit-llm-security.
license: MIT
effort: high
---

# Security Audit Skill

**Degree of freedom: MIXED** — Steps 0–4 judgment `[HIGH freedom]`;
dependency and secret scans `[LOW freedom — run exactly]`. Never write
exploit PoCs.

> **Audit-and-fix exception.** May fix inline. Plan-only burndown → `plan-security-audit`.
> When fixing inline: patch the evidenced sink only, in place; unrelated weaknesses you notice go in the report as findings, not fixes. Add a test only where the repo already keeps security tests or the task asks. Auth behavior, RLS, secrets rotation, payments, and migrations stay STOP-and-confirm.

OWASP static review (injection, headers, deps). Session / route×gate /
`getSession()` → `audit-auth-flows`. Next.js 16: grep `middleware.ts` **and**
`proxy.ts` — a route gate can live in either file, and the proxy layer has its own bypass class.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-security** (this) | OWASP static review of app code; may fix the evidenced sink inline |
| `audit-auth-flows` | Read-only app-layer auth: route gate matrix, session lifecycle, OAuth, provider traps |
| `plan-security-audit` | Plan-only OWASP Top 10 and Supabase-first hardening burndown |
| `plan-rls-audit` | Plan-only Supabase/Postgres RLS and access-control audit |
| `audit-llm-security` | Read-only OWASP LLM Top 10 audit of app-facing AI |
| `workflow-quality-gate` | Pre-release gate across red-team, security, bundle, performance, unit tests |

## How to reason

1. **Observe** — quote the sink or missing check (`file:line`)
2. **Interpret** — can untrusted input reach a query, HTML, or object-id?
3. **Classify** — injection / IDOR / secret / header / dep-CVE / hand-off
4. **Severity** — exploitable data access or hardcoded secret = Critical

## Worked example

> **Observe:** `GET /documents/:id` loads by id only (`api/docs/route.ts:18`).
> **Interpret:** any caller who can hit the route reads another user's doc.
> **Classify:** IDOR.
> **Severity:** Critical.
> **Finding:** IDOR | `/documents/:id` | add `userId` predicate.
> Matcher / `getSession()` on that route → `audit-auth-flows`, not this checklist.

## Step 0: Understand the Project  [HIGH freedom]

Before auditing, discover the tech stack and attack surface:

1. Read `package.json` / `requirements.txt` / `go.mod` to identify:
 - Auth library (next-auth, passport, supabase-auth, django-auth, etc.)
 - Database ORM (Prisma, Sequelize, SQLAlchemy, etc.)
 - HTTP framework (Express, Fastify, Django, Flask, etc.)
 - Any security-specific packages (helmet, cors, csurf, rate-limit, etc.)

2. Identify the auth pattern:
 - Session-based vs JWT vs OAuth
 - Where tokens are stored (cookies, localStorage, headers)
 - How permissions/roles are enforced

3. Identify the data flow:
 - Where user input enters the system
 - How data is validated and sanitized
 - How data reaches the database

---

## Step 1: Research Current Threats  [HIGH freedom]

Fetch current OWASP and security best practices for the detected stack:

```json
firecrawl:firecrawl_search
{
 "query": "<framework> security best practices OWASP <current year>",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

Scrape the OWASP Top 10 for the relevant platform:

```json
firecrawl:firecrawl_scrape
{
 "url": "https://owasp.org/Top10/",
 "formats": ["markdown"],
 "onlyMainContent": true
}
```

Also check for known CVEs in dependencies:

```json
firecrawl:firecrawl_search
{
 "query": "<package-name> CVE vulnerability <current year>",
 "limit": 5,
 "sources": [{ "type": "web" }]
}
```

---

## Step 2: Check Production Security Errors (Sentry)  [HIGH freedom]

If Sentry is configured, check for security-related production errors:

```json
sentry:search_issues
{
 "organizationSlug": "<ORG_SLUG>",
 "query": "401 unauthorized OR 403 forbidden OR CORS OR CSP violation in last 30 days",
 "projectSlugOrId": "<PROJECT_SLUG>",
 "regionUrl": "<REGION_URL>",
 "limit": 20
}
```

Patterns that indicate security findings:
- Frequent 401/403 errors → possible auth bypass attempts
- CORS errors from unexpected origins → misconfigured CORS
- CSP violations → potential XSS vectors
- Rate limit errors → possible brute force

---

## Step 3: Automated Code Scan  [HIGH freedom]

### Authentication Audit

- [ ] Passwords hashed with bcrypt/argon2/scrypt (not MD5/SHA1/SHA256 for passwords)
- [ ] Session tokens are cryptographically random
- [ ] Sessions expire appropriately (idle timeout + absolute timeout)
- [ ] Password reset tokens are single-use and expire quickly
- [ ] MFA available for sensitive accounts
- [ ] Login rate limiting implemented
- [ ] Account lockout after repeated failed attempts
- [ ] OAuth state parameter validated (CSRF protection for OAuth flows)
- [ ] JWT secret is strong and stored in env vars (not hardcoded)
- [ ] JWT expiry is reasonable (access: 15min, refresh: 7d)

### Authorization Audit

- [ ] Every API endpoint checks permissions (not just authentication)
- [ ] No direct object references without ownership/permission check (IDOR)
- [ ] Role-based access properly enforced at the API layer (not just UI)
- [ ] Principle of least privilege followed
- [ ] Admin functions require elevated auth
- [ ] Row-Level Security (RLS) enabled for multi-tenant databases
- [ ] API keys scoped to minimum required permissions

### Input Validation Audit

- [ ] All user input validated server-side (client validation is UX only)
- [ ] Input sanitized before use in queries, HTML, commands
- [ ] File uploads validated: type (MIME + magic bytes), size, filename
- [ ] JSON/XML parsing has depth/size limits
- [ ] URL parameters decoded and validated
- [ ] No raw SQL concatenation (parameterized queries only)
- [ ] No `eval()`, `Function()`, `innerHTML` with user input
- [ ] No `dangerouslySetInnerHTML` without DOMPurify

### Data Protection Audit

- [ ] Sensitive data encrypted at rest
- [ ] TLS/HTTPS enforced (no HTTP fallback)
- [ ] Secrets not in code, git history, or logs
- [ ] PII handled according to applicable regulations (GDPR, CCPA)
- [ ] Database connections encrypted (SSL)
- [ ] API responses don't leak internal data (stack traces, SQL errors, file paths)
- [ ] Password fields use `type="password"` and `autocomplete="new-password"`

### Security Headers Audit

- [ ] `Strict-Transport-Security` (HSTS) with long max-age
- [ ] `Content-Security-Policy` (CSP) configured (not just `default-src *`)
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` or `SAMEORIGIN`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` or stricter
- [ ] `Permissions-Policy` restricting unnecessary browser features
- [ ] CORS `Access-Control-Allow-Origin` is NOT `*` for authenticated endpoints
- [ ] Cookies: `HttpOnly`, `Secure`, `SameSite=Strict` (or `Lax`)

### Dependency Audit  [LOW freedom — run exactly]

```bash
npm audit # Node.js
pip-audit # Python
cargo audit # Rust
govulncheck ./... # Go
bundle audit # Ruby
```

- [ ] No known high/critical CVEs
- [ ] Dependencies reasonably up to date
- [ ] Lock file committed (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- [ ] No unnecessary dependencies (smaller surface area)

---

## Step 4: Common Vulnerability Patterns  [HIGH freedom]

Grep for the sinks, then read each hit in context:

- **SQL injection** — string interpolation into a query (`` `SELECT … ${ ``, `+ userId +`); parameterized or ORM calls pass
- **XSS** — `dangerouslySetInnerHTML` / `innerHTML` fed user input without `DOMPurify.sanitize`
- **IDOR** — a load by `req.params.id` with no owner predicate (`userId: req.user.id`) on the query
- **Sensitive data exposure** — `res.json(user)`-style whole-record responses instead of an explicit field pick

---

## Step 5: Environment and Secrets  [LOW freedom — names/prefixes only]

### Scan for Hardcoded Secrets

Search the codebase for potential leaked secrets. Patterns to look for:

- Generic secret names: `api_key`, `apiKey`, `secret`, `password`, `token`, `credentials`, `private_key`
- Key prefixes: `sk-`, `pk-`, `ghp_`, `gho_`, `xox[bpsa]-`, `AKIA`
- Private key headers: `-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----`

### Verify .gitignore

```
.env, .env.local, .env.production
*.pem, *.key, *.p12
credentials.json, service-account.json
.sentryclirc (if it contains auth tokens)
```

### Validate Environment Variables

```typescript
import { z } from 'zod';

const envSchema = z.object({
 DATABASE_URL: z.string().url(),
 API_KEY: z.string().min(1),
 JWT_SECRET: z.string().min(32),
 SENTRY_DSN: z.string().url().optional(),
});

const env = envSchema.parse(process.env);
```

---

## Self-critique before applying fixes  [LOW freedom — do not skip]

1. **Evidenced** — `file:line` or audit output, not "this might be injectable"
2. **Reproducible** — same sink still present; no exploit PoC written
3. **Severity justified** — Critical = demonstrated data access or leaked secret
4. **Right owner** — session/route×gate/`getSession` → `audit-auth-flows`; RLS → `plan-rls-audit`; LLM → `audit-llm-security`
5. **No-false-safety** — headers or middleware alone ≠ authorization

## Output: Security Audit Report

```markdown
## Security Audit: [Project Name]

### Tech Stack
- Framework: [name + version]
- Auth: [library + pattern]
- Database: [ORM + provider]
- Security packages: [list]

### Critical Issues (must fix)
| # | Category | Finding | File | Recommendation |
|---|----------|---------|------|----------------|
| 1 | Auth | JWT secret hardcoded | config.ts:12 | Move to env var |

### High Risk (should fix soon)
| # | Category | Finding | File | Recommendation |
|---|----------|---------|------|----------------|

### Medium Risk (improve when possible)
| # | Category | Finding | File | Recommendation |
|---|----------|---------|------|----------------|

### Passed Checks
- [list of security areas that are properly implemented]

### Dependencies
- Critical CVEs: [count] — [details]
- High CVEs: [count]
- Outdated packages: [count]

### Research Sources
- [URL] — [what it confirmed or revealed]
```

Session / route×gate / `getSession()` findings belong on `audit-auth-flows`,
not in this OWASP checklist.
