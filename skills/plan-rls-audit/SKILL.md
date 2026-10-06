---
name: plan-rls-audit
description: >
  Plan-only audit of Supabase/Postgres Row-Level Security and access-control
  gaps. Use when "RLS", "is my Supabase secure", "anyone can read my data", or
  "lock down my tables". App-layer route gates → audit-auth-flows.
license: MIT
effort: high
---

# RLS & Access-Control Audit + Remediation Plan

**Degree of freedom: MIXED** — access matrix and severity are judgment; table
inventory and policy reads run exactly. Stay **plan-only**. No SQL until approved.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **plan-rls-audit** (this) | Who can read/write which rows |
| `plan-security-audit` | OWASP umbrella (not the first RLS match) |
| `audit-db-schema` | Schema design quality |
| `plan-secrets-audit` | Where `service_role` lives |
| `audit-auth-flows` | App-layer session / route×gate / getSession vs getUser |


**Role:** Senior backend engineer + Supabase security specialist.

**Task:** Enumerate every table/view, run the RLS checklist (A–E), build a who-can-do-what
access matrix, score findings by exposure, emit `plan-rls-audit.md`. **Audit & plan only —
no SQL runs until each phase is approved.**

## How to reason (every plan item)

1. **Propose** — enable RLS, scope a policy, rotate a client `service_role`, or fix inverted logic
2. **Risk** — anon/authed can read or write rows they should not
3. **Keep-working** — tables whose policies already enforce ownership
4. **Phase** — Stop exposure → Ownership → Correctness-perf → Adjacent gates (do not execute)

## Worked example

> **Propose:** enable RLS on `profiles`; replace `USING (true)` on `orders` SELECT with `user_id = (select auth.uid())`.
> **Risk:** anon key (public) reads every profile; every authed user reads every order.
> **Keep-working:** `orders` INSERT already checks owner.
> **Phase:** Phase 1 — Stop active exposure (Critical).
> **Direction:** policy shape only — no SQL in this pass. Client `service_role` → `plan-secrets-audit`.

Missing or misconfigured Row-Level Security is the most documented vibe-coding
catastrophe of the 2025–2026 era. An audit of 50 vibe-coded apps across Lovable,
Bolt, v0, Cursor, and Claude Code found **88% had RLS entirely disabled** — not
misconfigured, *disabled* — meaning the database returned any row to any query.
Public breach reports describe apps leaking millions of API keys and user emails from
exactly this, and a disclosed vulnerability class spanning many production apps where
access control was present but **logically inverted** — authenticated users blocked,
anonymous users granted everything.

This skill is the **audit-and-plan** half of fixing that. Execution is handed to
`backend-patterns` / `db-migrator` / `audit-security` after you approve each phase.

---

## When this fires

Trigger phrases: *"check my RLS"*, *"is my Supabase locked down"*, *"can anyone
read my tables"*, *"audit my database policies"*, *"service_role key"*,
*"Supabase security advisor flagged something"*, *"pre-launch DB hardening"*.

Do **not** fire for: pure query speed (`backend-db-performance`), schema/naming
design (`audit-db-schema`), or broad app-layer OWASP (`plan-security-audit`).
RLS is specifically *who can read/write which rows*, enforced at the database.

---

## Why a dedicated skill (not generic security audit)

RLS failure is *mechanical and table-by-table*. A generic OWASP sweep glances at
it; this enumerates every table and applies a deterministic checklist. Fixing RLS
is the first step when the anon key can read rows it should not.

---

## The audit checklist  [HIGH freedom]

Walk the schema (via Supabase MCP, `pg_tables`, migration files, or the dashboard
security advisor). For **every** table and view:

### A · Is RLS even on?
- Check `relrowsecurity = true` for every table in exposed schemas (`public`
  especially). Any table with RLS **off** is fully readable/writable through the
  anon key. This is finding #1, severity Critical, every time it appears.
- Views: confirm they don't silently bypass RLS (`security_invoker` vs definer).
- Don't forget junction/lookup tables — they leak relationships even when the
  "main" tables are protected.

### B · Are the policies real, or theater?
- **`USING (true)`** (or `WITH CHECK (true)`) on anything user-owned = the table
  is public. The agent writes this to make a "permission denied" error go away;
  it's the single most common dangerous pattern.
- **Inverted logic** (the disclosed inverted-policy class): a policy that *looks* like it
  checks auth but blocks the wrong party. Read each policy's truth table, don't
  trust its name.
- **Missing operation coverage**: a SELECT policy with no INSERT/UPDATE/DELETE
  policy (or vice-versa) — RLS denies by default *only* if RLS is on, so confirm
  each operation the app performs is actually governed.
- **Ownership not enforced**: policy references `auth.uid()` but doesn't tie it to
  a row-owner column (`user_id = auth.uid()`), so any logged-in user reads every
  other user's rows.

### C · Key scoping (the client-side trap)
- Search frontend/client bundles for the **`service_role`** key. It bypasses RLS
  entirely and must never be shipped client-side or in `NEXT_PUBLIC_*`. If found:
  Critical, rotate immediately (hand to `plan-secrets-audit`).
- Confirm the **anon** key is the only Supabase key in client code, and that
  anon access is safe *because RLS holds* — not by accident.
- Edge Functions / server routes using `service_role`: verify they re-check
  authorization in code, since they've opted out of RLS.

### D · Correctness & performance of auth calls
- Supabase's own linter flags `auth.uid()` called per-row. Recommend
  `(select auth.uid())` so Postgres caches it — correctness is unchanged but
  large tables stop timing out (a real fix, not cosmetic).
- Check `auth.jwt()` / custom claims usage for the same per-row trap.

### E · Defaults & adjacent gates
- Storage buckets: public vs RLS-governed; signed-URL usage.
- Realtime: row-level authorization on subscribed channels.
- `pg_policies` cross-checked against the app's actual access matrix — flag any
  table the app reads/writes that has *no* corresponding policy.

For each finding: table/policy, the exact gap, who can currently access what,
severity, and a remediation *direction* (not the SQL — that's execution).

---

## Procedure  [HIGH freedom — plan only]

1. **Inventory.**  [LOW freedom — run exactly] List every table/view in exposed schemas with its
   `relrowsecurity` state and policy set. State how you accessed it (MCP /
   migrations / advisor) and any tables you couldn't see.
2. **Classify.** Run each through checklist A–E. Tag severity:
   **Critical** (RLS off, `USING(true)`, service_role client-side, inverted
   policy), **High** (ownership not enforced, missing operation coverage),
   **Med** (perf-trap auth calls, view bypass), **Low** (hardening nits).
3. **Build the access matrix.** A who-can-do-what table the user can eyeball —
   the deliverable's most useful artifact.
4. **Phase the burndown.** Critical first (data is exposed *right now*), then
   High, then Med/Low. Each phase maps to an execution skill.
5. **Emit `plan-rls-audit.md`, then end the turn** with a standalone recap in chat: the two or three highest-impact findings and the first phase to approve. The file is the deliverable — write it before the recap. **Do not write or run any SQL.**

---

## Guardrails

- **Plan only.** No `ALTER TABLE`, no `CREATE POLICY`, no migrations. The
  deliverable is the report and the access matrix.
- **Never widen access to "verify".** Don't suggest temporarily disabling RLS or
  loosening a policy to test something. Read state; don't mutate it.
- **Assume the anon key is public.** It is — it ships in the browser. The plan's
  job is to confirm RLS makes that safe, not to treat the key as a secret.
- **Severity is about exposure, not effort.** An RLS-off table is Critical even
  if the fix is one line. Rank by what's reachable today.
- **Don't confuse "works in the demo" with "secure".** App-layer filtering
  (`.eq('user_id', currentUser)` in the client query) is *not* RLS; flag it as
  unprotected — anyone can drop the filter in dev tools.
- **Minimal quoting** of policy bodies; identify by table + operation.

## Self-critique before the burndown  [LOW freedom — do not skip]

1. **evidenced-not-assumed** — every table has `relrowsecurity` + policy set from MCP/migrations/advisor; unseen tables listed
2. **plan-only** — no `ALTER TABLE`, no `CREATE POLICY`, no widening access to "verify"
3. **severity/phase justified** — RLS-off / `USING (true)` / inverted / client `service_role` = Critical even if the fix is one line
4. **right-owner** — rotate exposed `service_role` → `plan-secrets-audit`; app-layer session/route gates → `audit-auth-flows`; schema design → `audit-db-schema`
5. **no-false-safety** — client `.eq('user_id', …)` is not RLS; anon key is public; "works in the demo" is not secure

---

## Report template — `plan-rls-audit.md`

```markdown
# RLS & Access-Control Audit — <project>

_Audit-only. No SQL runs until each phase is approved._

## Scope
- Tables/views audited: n  | Source: [Supabase MCP / migrations / advisor]
- Couldn't inspect: …  | Assumptions: …

## Verdict
| Severity | Count | Worst case if shipped |
|----------|-------|-----------------------|
| Critical | n     | full DB readable via anon key |
| High     | n     | cross-user data access |
| Medium   | n     | timeouts / view bypass |
| Low      | n     | hardening |

## Access matrix (current reality)
| Table | RLS on? | anon can | authed (own) | authed (others') | service_role exposed? |
|-------|---------|----------|--------------|------------------|-----------------------|
| profiles | ❌ | read+write all | — | YES ⚠ | — |

## Findings
| # | Table / policy | Gap | Who's exposed | Sev | Direction |
|---|----------------|-----|---------------|-----|-----------|
| R1 | profiles | RLS disabled | everyone, anon | Crit | enable RLS; add owner policy |
| R2 | orders | USING (true) on SELECT | every authed user reads all orders | Crit | scope to user_id = (select auth.uid()) |

## Phased burndown
- **Phase 1 — Stop active exposure** → `db-migrator` / `backend-patterns` — R1, R2…
- **Phase 2 — Enforce ownership** → `db-migrator` — H-tier items
- **Phase 3 — Correctness & perf** → `backend-db-performance` — auth.uid() traps
- **Phase 4 — Adjacent gates** → `audit-security` — storage, realtime

## Execution handoff
Approve a phase to run it. Re-run `plan-rls-audit` after to confirm closure, and
cross-check with Supabase's security advisor.
```

---

## Chains with

- **Security spine** — entry: `plan-input-validation`; credentials:
  `plan-secrets-audit`; data access: **this skill**; blast radius:
  `plan-data-integrity`; observability: `plan-error-handling`.
- **`plan-secrets-audit`** — any exposed `service_role` key found here hands
  straight over (rotation, not relocation).
- **Execution:** `db-migrator`, `backend-patterns`, `backend-db-performance`,
  `audit-security`.
- **Verify:** Supabase security advisor + a second `plan-rls-audit` pass.

> Plan at high effort. Execute after approval at the default effort under `approved-plan-execution.mdc` (no reward hacking, no feature deletion). The plan says *which* tables are exposed; the rule constrains *how* the migration is allowed to touch them.
