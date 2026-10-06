---
name: plan-input-validation
description: >
  Plan-only trust-boundary audit for missing validation, injection, XSS, and
  forged requests across forms, APIs, and webhooks. Use when "validate my
  inputs", "is my app injection-safe?", "check my forms", or "can someone
  forge requests?".
license: MIT
effort: high
---

# Input-Validation & Trust-Boundary Audit + Hardening Plan

**Degree of freedom: HIGH** — map trust boundaries, score gaps, emit a plan.
Stay **plan-only**. No Zod, sanitizers, or webhook edits until approved.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **plan-input-validation** (this) | Trust-boundary / injection plan |
| `enhance-web-forms` | Apply production form quality |
| `plan-security-audit` | OWASP umbrella burndown |


**Role:** Senior application security engineer (trust-boundary lens).

**Task:** Map every point untrusted data enters, score validate/sanitize/authenticate
gaps, phase remediations, emit `plan-input-validation.md`. **Audit & plan only — no
code changes until each phase is approved.**

**Walk every boundary. Find what's trusted that shouldn't be. Change nothing until approved.**

## How to reason (every plan item)

1. **Propose** — schema, sanitize, signature verify, or allowlist
2. **Risk** — forgeable money/data, stored XSS, or injection
3. **Keep-working** — boundaries that already validate + authenticate
4. **Phase** — Forgeable paths → XSS → Schema pass → Uploads (do not execute)

## Worked example

> **Propose:** verify the Stripe webhook with `constructEvent` on the raw body; reject empty secrets; return 400 on bad signatures.
> **Risk:** empty-signing-secret bypass — anyone can forge `invoice.paid` and credit quota.
> **Keep-working:** checkout session creation already uses the server-side secret.
> **Phase:** Phase 1 — Forgeable money/data paths.
> **Note:** origin proof ≠ safe to interpolate into SQL/HTML.

AI agents write code that works on the inputs you showed them. Two signature patterns
recur: `dangerouslySetInnerHTML` without DOMPurify (XSS), and webhook handlers without
real signature verification — the reported empty-signing-secret bypass class, where an
empty secret lets any attacker forge valid signatures and credit unlimited quota
without payment.

This skill is the **audit-and-plan** half. Execution goes to `backend-patterns` /
`backend-error-handling` / `audit-security` after you approve each phase.

---

## When this fires

Trigger phrases: *"validate my inputs"*, *"is this injection-safe"*, *"check my
forms / API"*, *"XSS"*, *"dangerouslySetInnerHTML"*, *"my Stripe webhook"*, *"can
requests be forged"*, *"sanitize user content"*, *"pre-launch input hardening"*.

Do **not** fire for: row-level access (`plan-rls-audit`), credential exposure
(`plan-secrets-audit`), or broad architecture review (`plan-security-audit`).
This skill owns the *boundary where untrusted data enters*.

---

## The four boundary classes  [HIGH freedom]

### 1 · Form & API input
- **No schema validation** — bodies/params/query without Zod (or equivalent).
- **Type-coerced trust** — `Number(req.body.amount)` with no bounds.
- **Missing field-level checks** — email format, length caps, enum membership.
- **Mass assignment** — spreading `req.body` into DB insert/update (`role`,
  `is_admin`, `credits`).
- **SQL/RPC injection** — string-interpolated queries or raw user input into SQL.

### 2 · Rendered untrusted content (XSS)
- **`dangerouslySetInnerHTML` / `v-html` / `innerHTML`** without DOMPurify.
- **URL/attribute injection** — `javascript:` URIs, unvalidated redirects.
- **Stored XSS** — content saved now, rendered raw later.

### 3 · Webhooks & forged requests *(Stripe-aware)*
- **Signature not verified** — or verified against **empty secret**
  (empty-secret bypass class).
- **Raw-body mistake** — `JSON.stringify(req.body)` instead of raw bytes.
- **No idempotency** — Stripe at-least-once retries double-process.
- **Cross-gateway trust** — fulfilling without checking callback source.
- **Missing timestamp tolerance** — replay window open.
- **Returns 500 not 400** on bad signature → infinite Stripe retries.

### 4 · File uploads & other boundaries
- **No type/size/MIME validation**; trusting client content-type.
- **Path traversal** in filenames; **SSRF** in user-supplied URLs.
- **Concurrency** — read-modify-write races without DB constraints.

---

## Procedure  [HIGH freedom — plan only]

1. **Map boundaries.** Enumerate every untrusted entry point. Skip absent ones.
2. **Test each.** For every boundary: validated? sanitized? authenticated?
3. **Score.** Severity = reachability × impact.
4. **Phase** into shippable groups mapped to execution skills.
5. **Emit `plan-input-validation.md`, then end the turn** with a standalone recap in chat: the two or three highest-impact findings and the first phase to approve. The file is the deliverable — write it before the recap. **Do not edit code.**

---

## Guardrails

- **Plan only.** No Zod schemas, sanitizers, or webhook config changes.
- **Validate at the boundary, not after.**
- **Signature ≠ safety.** Origin proof ≠ safe to interpolate into SQL/HTML.
- **Don't trust the client copy.** Browser-only checks are UX, not security.
- **Stack-specific raw-body note.** Call out Next.js + Stripe raw-body requirement.
- **Minimal quoting** of source.

## Self-critique before the burndown  [LOW freedom — do not skip]

1. **evidenced-not-assumed** — every boundary cites path:line; skip classes that do not exist
2. **plan-only** — no Zod schemas, DOMPurify, or webhook config
3. **severity/phase justified** — unauthenticated write / forgeable money is Critical
4. **right-owner** — RLS row access → `plan-rls-audit`; leaked keys → `plan-secrets-audit`; OWASP umbrella → `plan-security-audit`
5. **no-false-safety** — browser-only checks are UX; signature ≠ sanitization; empty webhook secret is a bypass

---

## Report template — `plan-input-validation.md`

```markdown
# Input-Validation & Trust-Boundary Audit — <repo>

_Audit-only. Nothing changes until each phase is approved._

## Scope
- Boundaries found: forms / API / webhooks / uploads / rendered content
- Stack: Supabase ☐  Stripe ☐  Next.js ☐  | Assumptions: …

## Verdict
| Boundary class | Findings | Critical | Unauthenticated write reachable? |
|----------------|----------|----------|----------------------------------|
| Form & API     | n | n | … |
| Rendered (XSS) | n | n | … |
| Webhooks       | n | n | … |
| Uploads/other  | n | n | … |

## Findings
| # | Boundary | path:line | Missing: validate/sanitize/authenticate | Sev | Direction |
|---|----------|-----------|-----------------------------------------|-----|-----------|
| I1 | Stripe webhook | api/webhooks/stripe.ts:12 | authenticate (no constructEvent) | Crit | verify raw body against secret; 400 on fail |
| I2 | comment render | Comment.tsx:30 | sanitize (dangerouslySetInnerHTML) | High | DOMPurify before render |
| I3 | profile update | actions/profile.ts:8 | validate (mass assignment) | High | Zod allowlist; drop role/credits |

## Phased burndown
- **Phase 1 — Forgeable money/data paths** → `backend-patterns` — webhooks, mass-assign
- **Phase 2 — XSS / rendered content** → `backend-error-handling` / `enhance-web-ux` — I2…
- **Phase 3 — Schema validation pass** → `backend-patterns` — Zod at every boundary
- **Phase 4 — Uploads & concurrency** → `audit-security` — files, races

## Execution handoff
Approve a phase to run it. Re-run after; for webhooks, verify with Stripe CLI
fixtures (real signed events) not mocked payloads.
```

---

## Chains with

- **Security spine** — entry layer (**this skill**); data access: `plan-rls-audit`;
  credentials: `plan-secrets-audit`.
- **Execution:** `backend-patterns`, `backend-error-handling`, `audit-security`,
  `audit-fe-api`.
- **Verify:** `test-red-team` + Stripe CLI signed webhook fixtures.

> Plan at high effort. Execute after approval at the default effort under `approved-plan-execution.mdc` (no reward hacking, no feature deletion). The plan says *which* boundaries are open; the rule constrains *how* they're closed.
