---
name: plan-secrets-audit
description: >
  Plan-only scan of the working tree and git history for exposed or mis-scoped
  keys, then a rotate-vs-relocate plan. Use when "hardcoded secrets", "did I
  commit a key", "secret scan", "is my .env safe", or "rotate keys".
license: MIT
effort: high
---

# Secrets & Key-Scope Audit + Rotation Plan

**Degree of freedom: MIXED** — prefix scan is exact; rotate-vs-relocate
is judgment. Stay **plan-only**. Never print secret values.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **plan-secrets-audit** (this) | Rotate vs relocate leaked keys |
| `plan-security-audit` | OWASP umbrella (not the first secrets match) |
| `plan-rls-audit` | Table access control |
| `audit-env-parity` | Env/config drift |

## How to reason (every plan item)

1. **Propose** — rotate, relocate, or hygiene — say which, never print the value
2. **Risk** — who can use the key if it stays live (history counts)
3. **Keep-working** — keys that are scoped correctly and not in history
4. **Phase** — rotate → relocate → hygiene → optional scrub (do not execute)

## Worked example

> **Propose:** rotate the Stripe secret at `api/pay.ts` (last-4 only in the report); history presence means rotate, not `.env` move.
> **Risk:** `sk_` in committed history stays valid forever after a relocate.
> **Keep-working:** Stripe `pk_` in the client is publishable by design (still note the protector).
> **Phase:** Phase 1 — rotate exposed never-client secrets.
> **Redaction:** type + path + last 4 — never the secret.

**Role:** Senior security engineer (credential exposure + key scoping).

**Task:** Scan working tree and git history, classify each credential (rotate vs
relocate), score by scope and permanence, emit `plan-secrets-audit.md`. **Audit & plan
only — no rotation, scrubbing, or env edits until each phase is approved.**

**Find every leaked key. Decide rotate vs relocate. Change nothing until approved.**

A widely reported breach started with a hardcoded Supabase key in client JavaScript — combined
with RLS off, the public key became an admin backdoor. **A secret committed even once
lives in git history forever.** Moving it to `.env` later does nothing; the only real
fix is **rotation**.

---

## When this fires

Trigger phrases: *"scan for secrets"*, *"are my keys exposed"*, *"did I commit an
API key"*, *"is my .env safe"*, *"rotate keys"*, *"about to open-source this"*,
*"pre-launch secret check"*.

Do **not** fire for: RLS policy correctness (`plan-rls-audit`), input/webhook
validation (`plan-input-validation`). This skill owns *credential exposure and
key scoping* specifically.

---

## Why a dedicated skill

A grep finds strings. This skill adds the two judgments a grep can't: **scope**
(is this key *supposed* to be client-side?) and **permanence** (is it in history,
making relocation insufficient?).

---

## The audit

### A · Pattern scan (working tree)  [LOW freedom — run exactly]
Search outside `.env*` and server-only contexts for:
- Prefixes: `sk_`, `pk_`, `whsec_`, `service_role`, `eyJ...`, `AKIA`, `API_KEY`,
  `SECRET`, `TOKEN`, long random blobs.
- Supabase: anon vs `service_role`.
- Any key in files that ship to the browser.

### B · Scope classification  [HIGH freedom]
- **Safe client-side:** Supabase **anon**, Stripe **publishable** (`pk_`), public
  analytics keys — note the protector dependency (RLS, Stripe design).
- **Never client-side (Critical if exposed):** **service_role**, Stripe **secret**
  (`sk_`), **webhook secret** (`whsec_`), AWS secrets, DB URLs.
- **`NEXT_PUBLIC_` / `VITE_` / `EXPO_PUBLIC_` trap** — bundled into client.

### C · Git history (rotate vs relocate)  [HIGH freedom]
- Ever in committed history → **rotate** (relocation is theater).
- Scrubbing (filter-repo/BFG) is secondary — rotation first.

### D · Deployment env config (Vercel / AWS)  [HIGH freedom]
- Secrets in platform env store, not baked into build.
- `.env.example` not committed with real values.
- No secrets as build args (persist in image layers).

### E · `.gitignore` & hygiene  [HIGH freedom]
- `.env*` ignored; no secrets in README, comments, test fixtures.

---

## Procedure  [HIGH freedom]

1. **Scan** working tree (A), classify scope (B).
2. **Check history** for every credential (C).
3. **Review deploy + hygiene** (D, E).
4. **Score.** Never-client in client bundle or history = Critical.
5. **Phase.** **Emit `plan-secrets-audit.md`, then end the turn** with a standalone recap in chat: the two or three highest-impact findings (type + location + last 4, never the value) and the first phase to approve. The file is the deliverable — write it before the recap.

---

## Guardrails  [LOW freedom — run exactly]

- **Plan only.** No rotation, history rewriting, or env edits.
- **Never print the secret.** Type + location + last 4 chars at most.
- **Rotate beats relocate — always say which.**
- **Don't assume safe-client keys are fine.** Hand anon-key + no-RLS to
  `plan-rls-audit`.
- **Order:** rotate → update env store → redeploy → (optional) scrub history.

## Self-critique before the burndown  [LOW freedom — do not skip]

1. **evidenced-not-assumed** — type + location + last 4; never the secret value
2. **plan-only** — no rotation, scrub, or env edit this pass
3. **phase justified** — history → rotate is Phase 1, not "move to `.env`"
4. **right-owner** — anon-key + no-RLS → `plan-rls-audit`; generic OWASP → `plan-security-audit`
5. **no-false-safety** — relocate-without-rotate is theater; safe-client still needs its protector

---

## Report template — `plan-secrets-audit.md`

```markdown
# Secrets & Key-Scope Audit — <repo>

_Audit-only. No key is rotated, moved, or scrubbed until each phase is approved._

## Scope
- Scanned: working tree ☐  git history ☐  deploy env (Vercel/AWS) ☐
- Assumptions / not inspected: …

## Verdict
| Severity | Count | Worst case |
|----------|-------|-----------|
| Critical | n | never-client secret exposed / in history |
| High     | n | committed .env values, public-prefix leak |
| Medium   | n | shared-env keys, hygiene |

## Findings
| # | Key type | Location | Scope bucket | In history? | Action | Sev |
|---|----------|----------|--------------|-------------|--------|-----|
| S1 | Supabase service_role | lib/admin.ts:4 | never-client | YES | ROTATE now | Crit |
| S2 | Stripe secret sk_ | api/pay.ts:2 | never-client | YES | ROTATE now | Crit |
| S3 | Supabase anon | client.ts:6 | safe-client | n/a | OK if RLS holds → plan-rls-audit | — |
| S4 | DB URL | .env.example | never-client | YES | ROTATE + remove from example | High |

## Phased burndown
- **Phase 1 — Rotate exposed never-client secrets** → dashboard rotation + Vercel/AWS env update (grace window)
- **Phase 2 — Relocate clean secrets** → move to env store, fix NEXT_PUBLIC_ leaks
- **Phase 3 — Hygiene** → .gitignore, remove committed examples, CI secret scanner
- **Phase 4 — (optional) Scrub history** → filter-repo/BFG, after rotation

## Execution handoff
Approve a phase to run it. Cross-hand safe-client keys to `plan-rls-audit`.
Add a pre-commit secret scanner (`create-hook`) so this can't regress.
```

---

## Chains with

- **Security spine** — credentials layer (**this skill**); cross-hand to
  `plan-rls-audit` for anon-key safety.
- **`create-hook`** — pre-commit secret-scanning hook as regression guard.
- **Execution:** provider dashboards, Vercel/AWS env, `audit-security`.
- **Verify:** re-scan working tree + history; confirm rotated keys are dead.

> Plan at high effort. Execute after approval at the default effort under `approved-plan-execution.mdc` (no reward hacking, no feature deletion). Rotation is irreversible-ish — the plan says *which* keys; the rule constrains *how* and *in what order*.
