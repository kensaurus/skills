# OWASP Attack Checklist & Payload Library

Reference for Phase 4 (Security red team) of `test-red-team`. Load this file
when you need exhaustive payloads or the full OWASP mapping table.

## Contents

- OWASP Top 10:2021 — Red-team mapping
- XSS payloads (confirm with benign effect only)
- SQL injection probes (safe read-only)
- Path traversal probes
- SSRF probes (for URL-accepting inputs)
- Authentication attack checklist
- IDOR test procedure (per resource type)
- Tenant-boundary test procedure (multi-tenant apps)
- File upload attack checklist
- Security headers checklist
- MASVS-PLATFORM checks (Capacitor / hybrid apps)
- Performance benchmark thresholds


---

## OWASP Top 10:2021 — Red-team mapping

IDs follow the 2021 edition; check https://owasp.org/www-project-top-ten/ for
the current edition before citing an ID.

| ID | Name | Red-team action |
|----|------|----------------|
| A01 | Broken Access Control | IDOR, tenant-boundary, privilege escalation, RLS bypass |
| A02 | Cryptographic Failures | PII in responses/localStorage, HTTP vs HTTPS, weak token entropy |
| A03 | Injection | XSS, SQLi, template injection, path traversal, SSRF |
| A04 | Insecure Design | Business-logic abuse, workflow skip, missing rate limits |
| A05 | Security Misconfiguration | Security headers, CORS, error messages leaking stack traces |
| A06 | Vulnerable Components | `npm audit`, outdated deps with known CVEs |
| A07 | Auth Failures | Brute force, session fixation, JWT tampering, account takeover |
| A08 | Software & Data Integrity | Supply-chain, unverified file uploads, unsafe deserialization |
| A09 | Logging Failures | Sentry blind spots, missing audit logs for sensitive actions |
| A10 | SSRF | URLs in user input used for backend fetch |

---

## XSS payloads (confirm with benign effect only)

```
<script>document.title='XSS-CONFIRM'</script>
<img src=x onerror="document.title='XSS-CONFIRM'">
<svg onload="document.title='XSS-CONFIRM'">
javascript:document.title='XSS-CONFIRM'
"><script>document.title='XSS-CONFIRM'</script>
' onmouseover='document.title="XSS-CONFIRM"
{{constructor.constructor('document.title="XSS-CONFIRM"')()}}
${7*7}                          (template literal check — expect 49)
<%= 7*7 %>                      (ERB / EJS check)
#{7*7}                          (Ruby ERB)
```

A hit is confirmed when: the injected string appears un-escaped in the DOM,
`document.title` changes, or the expression is evaluated server-side (49 appears).
Never use `alert()` — use `document.title` to avoid browser popups.

---

## SQL injection probes (safe read-only)

```
'                               (single quote — triggers syntax error)
' OR '1'='1                     (classic always-true)
' OR 1=1--                      (comment-out rest of query)
'; SELECT pg_sleep(2)--         (time-based blind — expect 2s delay)
' UNION SELECT null,null--      (column count probe)
" OR ""="                       (double-quote variant)
\x00                            (null byte)
1; DROP TABLE users--           (never actually run — shows intent, blocked by parameterized queries)
```

Confirm by: syntax error in response, unusual delay (blind SQLi), unexpected
data in response. A parameterized-query app will return a normal 400/422.

---

## Path traversal probes

```
../../etc/passwd
..%2F..%2Fetc%2Fpasswd
....//....//etc/passwd
%2e%2e%2f%2e%2e%2fetc%2fpasswd
/etc/passwd%00.jpg              (null byte truncation for file ext bypass)
```

---

## SSRF probes (for URL-accepting inputs)

```
http://localhost/
http://127.0.0.1/
http://169.254.169.254/latest/meta-data/   (AWS metadata)
http://metadata.google.internal/
http://[::1]/
file:///etc/passwd
```

---

## Authentication attack checklist

- [ ] Password reset token entropy: generate 2 reset tokens, are they sequential/guessable?
- [ ] Password reset token reuse: use the same token twice — second use must be rejected.
- [ ] Password reset token expiry: wait >15 min, use old token — must be expired.
- [ ] Login brute force: 10 rapid attempts with wrong password — rate limit or lockout?
- [ ] JWT `alg: none` bypass: send JWT with `"alg":"none"` and no signature.
- [ ] JWT secret: try weak secrets (`secret`, `password`, `changeme`) via jwt.io debugger.
- [ ] JWT payload tampering: decode, change `role` to `admin` or `user_id` to another user.
- [ ] Session cookie flags: `HttpOnly`, `Secure`, `SameSite=Strict`/`Lax` required.
- [ ] Token storage: tokens must NOT be in `localStorage` (XSS-accessible); use HttpOnly cookies.
- [ ] OAuth state: state param present, validated server-side (CSRF protection for OAuth).

---

## IDOR test procedure (per resource type)

1. Create resource as **User A** (get its ID from the response or URL).
2. Log in as **User B** (different account, same or lower role).
3. Access the resource directly:
   - `GET /api/resource/<id>`
   - `PUT /api/resource/<id>` with modified payload
   - `DELETE /api/resource/<id>`
4. Expected: 404 or 403. **DEFECT** if: data returned, mutation succeeds, or
   error leaks the resource exists (200 with "not found" message = info leak).
5. Verify at DB: `SELECT * FROM resource WHERE id = '<id>'` — should be User A's row.

---

## Tenant-boundary test procedure (multi-tenant apps)

1. Create records in **Org A** context.
2. Switch to **Org B** context (URL param, header, or UI switcher).
3. Navigate to the same feature. **DEFECT** if Org A's data is visible.
4. Directly call the API with Org A's resource IDs while authenticated as Org B user.
5. Verify RLS via Supabase MCP: `SET ROLE authenticated; SET LOCAL request.jwt.claims = '{"sub":"<org_b_user_id>","role":"authenticated"}'; SELECT * FROM org_resources WHERE org_id = '<org_a_id>'` — must return 0 rows.

---

## File upload attack checklist

- [ ] Upload a file with a `.php`, `.js`, `.py`, `.sh` extension. Expect rejection.
- [ ] Upload an SVG with embedded `<script>`. If served back, XSS vector.
- [ ] Upload a file with MIME type `text/html` but `.jpg` extension (MIME sniffing).
- [ ] Upload a 100 MB file. Expect file-size rejection, not server crash.
- [ ] Upload a ZIP bomb (if archive uploads accepted).
- [ ] Upload a file with a path-traversal filename: `../../evil.sh`.
- [ ] Upload a valid image with embedded EXIF data containing XSS payload.

---

## Security headers checklist

| Header | Required value | Defect if missing/wrong |
|--------|---------------|------------------------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | High |
| `Content-Security-Policy` | Specific directives, not `default-src *` | High |
| `X-Content-Type-Options` | `nosniff` | Medium |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Medium |
| `Referrer-Policy` | `strict-origin-when-cross-origin` or stricter | Low |
| `Permissions-Policy` | Restrict unnecessary browser features | Low |
| `CORS Access-Control-Allow-Origin` | Must NOT be `*` for authenticated endpoints | High |

---

## MASVS-PLATFORM checks (Capacitor / hybrid apps)

| Control | MASVS ID | What to check |
|---------|----------|--------------|
| WebView allows all file access | MASVS-PLATFORM-2 | `allowFileAccessFromFileURLs`, `allowUniversalAccessFromFileURLs` in `AndroidManifest.xml` / `MainViewController.swift` — must be false |
| JavaScript enabled on untrusted content | MASVS-PLATFORM-2 | WebView that loads remote URLs must not also bridge to native file system |
| JS-to-native bridge exposed | MASVS-PLATFORM-2 | All Capacitor plugins must validate input before calling native APIs |
| Deep-link scheme abuse | MASVS-PLATFORM-1 | Can an external app trigger a deep link with crafted params? Validate all deep-link params. |
| Exported activities | MASVS-PLATFORM-1 | `android:exported="true"` activities must not expose sensitive functionality |
| Screenshot prevention | MASVS-PLATFORM-3 | `FLAG_SECURE` set for screens showing PII? |
| Keyboard cache | MASVS-PLATFORM-3 | Password fields use `inputType=textPassword` (disables autocorrect cache) |
| Clipboard leakage | MASVS-PLATFORM-3 | Sensitive fields should not be copyable |

---

## Performance benchmark thresholds

| Metric | Target | DEFECT threshold |
|--------|--------|-----------------|
| Time to First Byte (TTFB) | < 200 ms | > 600 ms = High |
| Largest Contentful Paint (LCP) | < 2.5 s | > 4 s = High |
| Cumulative Layout Shift (CLS) | < 0.1 | > 0.25 = Medium |
| Total Blocking Time (TBT) | < 200 ms | > 600 ms = High |
| API response (list endpoint) | < 300 ms | > 1000 ms = Medium |
| API response (single item) | < 100 ms | > 500 ms = Medium |
| JS bundle (initial) | < 200 KB gzip | > 500 KB = Medium |
| Largest single network payload | < 500 KB | > 1 MB = Medium |

Measure LCP/CLS with:
```javascript
// eval
const entries = performance.getEntriesByType('paint');
const lcp = await new Promise(resolve => {
  new PerformanceObserver(list => resolve(list.getEntries().at(-1)?.startTime))
    .observe({ type: 'largest-contentful-paint', buffered: true });
});
```
