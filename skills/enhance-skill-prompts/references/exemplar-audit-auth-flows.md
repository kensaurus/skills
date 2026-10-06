> Teaching copy of `audit-auth-flows` with technique annotations (`<!-- TECHNIQUE -->`).
> Live shipped file (comments stripped; pack frontmatter unchanged):
> `skills/audit-auth-flows/SKILL.md`.

---
name: audit-auth-flows
description: >
  Read-only audit of app-layer auth: route×gate matrix, session lifecycle,
  OAuth, provider traps (getSession vs getUser, middleware-only gates,
  CVE-2025-29927). Use when "audit our auth" or "check middleware protection".
  RLS → plan-rls-audit.
license: MIT
effort: high
---

<!-- TECHNIQUE: effort routing. A security audit is judgment work, so the
frontmatter declares `effort: high`; the model default is medium. Claude Code
honors the key, Cursor ignores it. Mechanical fixed-sequence skills declare
`effort: low`. Read-only does not mean low: audits are read-only and high. -->

# audit-auth-flows — Middleware is edge routing, not a security boundary


## Contents

- Degree of freedom: MIXED — declared per phase
- How to reason in this audit
- Worked example
- This skill vs neighbors
- Phase 0 — Detect the auth stack  [HIGH freedom]
- Phase 1 — Route × gate coverage matrix  [HIGH freedom — the centerpiece]
- Phase 2 — Provider and framework traps  [HIGH freedom, except the grep = LOW]
- Phase 3 — Session lifecycle  [HIGH freedom]
- Phase 4 — Credentials, OAuth, authorization  [HIGH freedom]
- Phase 5 — Live probes  [LOW freedom — run each, in order, non-prod]
- Self-critique before reporting  [LOW freedom — do not skip]
- Definition of Done
- Output format

## Degree of freedom: MIXED — declared per phase

<!-- TECHNIQUE: T1 degree-of-freedom declaration (Anthropic official). The
skill states its register up front and per phase, so the agent knows where
to reason freely and where to follow exact steps. It pairs with the `effort:`
key above: the register line says where to reason freely; the effort key says
how deep. This header is the single most important addition. -->

- Phases 0–4 (discovery, judgment): **[HIGH freedom]** — reason about what
  you find; checklists prompt investigation, they are not tick-scripts.
- Phase 5 (live probes) and the getSession grep: **[LOW freedom — run
  exactly]** — a skipped probe is an unproven claim, not a saved step.

Read-only. Map the auth surface and prove, route by route, that identity is
verified where it matters. Then stop. Hand fixes to a follow-up session.

**2026 consensus (official, post CVE-2025-29927):** Next.js middleware
runs before cache and routing. Vercel: *"We do not recommend Middleware
to be the sole method of protecting routes in your application."* An
audit that only reads `middleware.ts` and declares the app safe has
missed the point. Defense in depth: edge + route handler / server action
+ data layer. Each layer covers a different part of the request path.

## How to reason in this audit

<!-- TECHNIQUE: T2 named-stage chain (not "think step by step"). Thinking is
always on for the model and `effort` in frontmatter sets its depth, so this
is not a reasoning script: it is the record shape every finding carries, so
no finding can be written without its evidence, its meaning, its bucket, and
a justified severity. Placed once, referenced by each phase. -->

Every finding is recorded in this shape, in this order:

1. **Observe** — what does the code/probe actually show? (quote the line or the response)
2. **Interpret** — what does that mean for who can reach what? (don't assume intent)
3. **Classify** — real exposure / defense-in-depth-gap / correct-as-is / needs-a-probe
4. **Severity** — by blast radius: unauth data access & auth bypass = critical;
   everything else justified against what an attacker actually gains.

If you cannot complete Interpret from static code, it is a **needs-a-probe**
item for Phase 5, not a conclusion.

## Worked example

<!-- TECHNIQUE: T3 one worked example, shown in the chain's order AND the
finding-row shape. Examples pin format — the model matches their length and
structure — so label it illustrative, keep it realistic, and add a second only
where it varies the judgment (a different Classify outcome), not a second
tutorial. The output-format section carries the rest. -->

> **Observe:** `middleware.ts` matcher is `['/dashboard/:path*']`. The route
> `/api/orders/[id]` has no check in the handler.
> **Interpret:** API routes are not under the matcher, so middleware never
> runs on them; the order endpoint is reachable without auth. Layout-level
> checks don't cover direct API calls.
> **Classify:** real exposure (not merely a defense-in-depth gap — data is
> actually reachable).
> **Severity:** critical — unauthenticated data access.
> **Finding row:** `/api/orders/[id]` | edge+route | critical | matcher
> excludes /api; handler has no `getUser()` check | probe P5-a confirmed
> 200 while logged out.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **audit-auth-flows** (this) | Session lifecycle, route×gate matrix, OAuth, provider traps |
| `audit-security` | OWASP checklist (injection, headers, deps) — may fix inline |
| `plan-security-audit` | Plan-only hardening burndown |
| `plan-rls-audit` | Data-layer who-can-read-which-rows |
| `plan-secrets-audit` | Where `service_role` / keys live |
| `plan-privacy-compliance` | Consent / policy vs collection — not session gates |
| `backend-patterns` | Building the middleware / guard fixes after this audit |
| `test-exploratory` | Live guest vs logged-in probe (runtime complement to this static matrix) |

---

## Phase 0 — Detect the auth stack  [HIGH freedom]

Identify: provider (Supabase Auth / NextAuth / Clerk / Auth0 / custom),
framework protection (Next.js middleware + `matcher`, route guards,
server-action checks), session transport (cookie vs `localStorage` vs
`Authorization` header), token model (JWT vs server session). Enumerate
pages, API routes, server actions, edge functions, admin areas. Record
the pinned framework version — auth CVEs are version-gated.

---

## Phase 1 — Route × gate coverage matrix  [HIGH freedom — the centerpiece]

Every protected route / action, one row. Apply the reasoning chain per row.

| route/action | intended access | gate that protects it | verified server-side? | data-layer backstop? |

Hunt the gaps this exposes:

- **Matcher holes** — `config.matcher` misses a protected path. API
  routes and server actions often bypass page middleware — each needs
  its own check.
- **Layout-only protection** — a layout/wrapper is a client-side
  illusion. It does not gate data fetches or direct API/action calls.
- **Middleware-as-only-gate** — the CVE-2025-29927 class. Any route
  where middleware is the *sole* authorization layer is a finding
  **regardless of framework version or host**. Patching the CVE is not
  defense in depth.
- **Server action exposure** — Next.js server actions are POST
  endpoints callable directly. Each mutating action must check identity
  itself.
- **Unlisted routes** — grep the router; do not trust the matcher list.

---

## Phase 2 — Provider and framework traps  [HIGH freedom, except the grep = LOW]

**Supabase (check first on this stack):**

- **[LOW freedom — run exactly]** `grep -rn "getSession(" <server-code-paths>`.
  <!-- TECHNIQUE: T1 applied to the fragile bit. Promoted from advisory
  prose to an explicit "run exactly" step so the agent cannot reason past
  the grep. -->
  Treat every server-side hit as a finding until proven client-side-only.
  Official JS docs: cookie/storage values *may not be authentic*;
  `getSession()` is strongly advised against for authorization.
  `getUser()` performs a network request to the Auth server and *can* be
  used to base authorization rules. Newer SSR guides also use
  `getClaims()` to *refresh* cookies — that is not a substitute for
  verifying identity at the handler.
- Service-role key on any client-exposed path → `plan-secrets-audit`.
  RLS assumed but not enforcing → `plan-rls-audit` (data-layer
  backstop; this skill is the app layer above it).
- `autoRefreshToken` disabled without manual refresh; JWT expiry
  absurdly short (<300s) hammering refresh.

**Next.js CVE-2025-29927** (GHSA-f82v-jwr5-mffw, critical): bypass
authorization if the check occurs only in middleware, via the internal
`x-middleware-subrequest` header. **Patched:** 12.3.5 / 13.5.9 /
14.2.25 / 15.2.3. **Impacted:** self-hosted `next start` and
`output: 'standalone'`. Vercel-hosted apps were incidentally
protected; Netlify and Cloudflare Workers were not affected. Workaround
if unpatched: drop `x-middleware-subrequest` before it hits Next.
If below the fix → P0 *and* a defense-in-depth finding. Also sweep
later Next.js auth CVEs (do not treat 29927 as the only one).

**General rule:** any "the framework enforces auth at the edge"
assumption is a finding, whatever the framework.

**NextAuth / Clerk / Auth0** — session strategy (JWT vs database),
callback / redirect validation, and whether `auth()` / session checks
actually run server-side per protected operation.

---

## Phase 3 — Session lifecycle  [HIGH freedom]

**Cookies** — `HttpOnly`, `Secure`, `SameSite` (Lax min, Strict for
sensitive); scoped path/domain; not readable by JS. Token in
`localStorage` is XSS-exfiltratable — flag it; CSRF-vs-XSS must be a
deliberate choice.

**Logout that actually logs out** — a stateless JWT stays valid until
expiry if logout only clears the client. Confirm server-side
invalidation (Supabase `signOut` revokes the refresh token). Probe it
(Phase 5). Official sessions FAQ: access tokens can still be presented
after sign-out unless the app also checks revocation / uses
`getUser()`.

**Rotation & timeouts** — rotate on privilege change (login, role
elevation) to kill fixation; idle timeout and absolute-max lifetime
both present. Current norm: short access tokens, longer **rotated**
refresh tokens with reuse detection, capped absolute session.

**Refresh-token rotation + reuse detection** — official Supabase
sessions docs: a refresh token is single-use, with two exceptions
(default **10s reuse interval** — do not widen; parent-token retry for
lost responses). Outside those exceptions the **whole session family
is revoked**. Disabling that in Advanced Settings is "generally not
recommended" — flag if widened or disabled.

---

## Phase 4 — Credentials, OAuth, authorization  [HIGH freedom]

**OAuth / OIDC** — `state` (CSRF on the callback), PKCE for public
clients, redirect-URI allowlist exact-match, provider `email_verified`
checked before trust, account-linking collisions handled.

**Credential flows** — reset tokens single-use + expiring + not leaked
in URL/referrer; **user enumeration** via differing error text or
timing on login/reset/signup; rate limiting on auth endpoints
specifically; MFA state cannot be skipped mid-flow.

**Authorization above the data layer** — not just "is logged in" but
"is allowed"; IDOR on API params (`/api/orders/:id` scoped to caller?);
admin routes gated by role server-side. Name which layer each control
lives in. `plan-rls-audit` owns the data-layer half.

---

## Phase 5 — Live probes  [LOW freedom — run each, in order, non-prod]

<!-- TECHNIQUE: T1 low-freedom exact steps for the fragile part. These are
not suggestions; each is a labeled probe whose result is evidence. The
reasoning chain's "needs-a-probe" items resolve here. -->

Force the failures rather than only reading code. Log each as
`P5-x | expected | actual | evidence`:

- **P5-a** Hit each protected route / API / action **unauthenticated** →
  expect deny (not a redirect that still returns data).
- **P5-b** Replay a **logged-out** session token → expect reject.
- **P5-c** Tamper the session cookie / swap another user's identifier →
  reject.
- **P5-d** IDOR: as user A, request user B's object by id → deny.
- **P5-e** If Next.js is version-vulnerable or self-hosted: send
  `x-middleware-subrequest` and confirm WAF/edge *and* a route-handler
  check still stop it.
- **P5-f** User-enumeration: compare wrong-password vs nonexistent-user
  (text + timing).

Do not run these against production. Do not write exploit PoCs into
the repo.

---

## Self-critique before reporting  [LOW freedom — do not skip]

<!-- TECHNIQUE: T4 evidence check before output. Opus 5.5 self-verifies
without being told, so this is not a "double-check your work" step — every
item names a specific piece of evidence (quote, probe, layer) a finding must
carry, and findings without it are dropped or downgraded. Add items that
name evidence; never generic "verify" lines. -->

Challenge every finding against this rubric; drop or downgrade any that fail:

1. **Evidenced, not assumed** — quoted line or probe result? If it rests on
   "the code probably…", mark unconfirmed or run the probe.
2. **Reproducible** — did the probe succeed twice, or once? Flaky ≠ finding.
3. **Severity justified** — "critical" requires actual unauth access or
   bypass, not theoretical risk.
4. **Right layer** — app-layer (yours) or data-layer (→ `plan-rls-audit`)?
5. **No false safety** — did you confirm a gate *works*, or only that it
   *exists*? A check a probe bypassed is critical, not a pass.

---

## Definition of Done

- [ ] Auth stack + framework version recorded
- [ ] Degree-of-freedom respected: Phase 5 probes and the getSession grep
      run exactly, in order
- [ ] Route×gate matrix complete; every row reasoned
      Observe→Interpret→Classify→Severity
- [ ] Matcher holes, layout-only, middleware-as-sole-gate, unprotected
      server actions surfaced
- [ ] `getSession()`-for-authz grepped; `getUser()` confirmed on every
      server gate
- [ ] CVE-2025-29927 (and later auth CVEs) checked against the pinned version
- [ ] Cookie flags, localStorage exposure, CSRF pairing assessed
- [ ] Server-side logout invalidation confirmed by probe; rotation +
      idle/absolute timeouts present
- [ ] Refresh reuse interval not widened; family revocation not disabled
- [ ] OAuth state / PKCE / redirect-allowlist / email_verified checked
- [ ] User-enumeration, reset tokens, auth-endpoint rate limits, MFA-skip
      checked
- [ ] App-layer authorization (roles, IDOR, admin) split from the RLS half
- [ ] Live probes run non-prod; each logged pass/fail
- [ ] Self-critique rubric applied; unevidenced/flaky findings dropped or
      downgraded
- [ ] Read-only — findings presented, not patched

## Output format

1. **Route × gate matrix** — the table, gaps highlighted
2. **Findings** — issue | layer (edge/route/data) | severity (critical =
   unauth access / auth bypass) | file:line or probe | fix shape — each
   finding in the worked-example shape
3. **Provider-trap list** — exact call to change (`getSession` →
   `getUser`, etc.)
4. **Probe log** — P5-x | expected | actual | evidence
5. **Fix plan** — auth-bypass and getSession-authz first, then session
   lifecycle, then enumeration/OAuth. Handoffs: `plan-rls-audit`,
   `plan-secrets-audit`, `plan-security-audit`, `backend-patterns`.
   Present and stop.

<!-- TECHNIQUE: T5 terminology — this file uses finding (not issue/problem),
gate (not check/guard) for the auth layer, and probe for live evidence.
T6 conciseness — neighbor table kept (routing), official CVE/getSession/
getClaims/10s facts kept (not restated twice). Teaching comments live only
in this exemplar; strip them from the live SKILL.md. -->
