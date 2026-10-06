---
name: plan-data-integrity
description: >
  Plan-only audit of destructive-operation and migration safety. Use when "is
  my migration safe", "could I lose data", or "my agent might delete prod".
  Restore drills, RPO/RTO → plan-backup-dr. Code transforms →
  audit-codemod-safety.
license: MIT
effort: high
---

# Data-Integrity & Destructive-Op Audit + Safeguard Plan

**Degree of freedom: HIGH** — map wipe paths, score irreversibility, emit a plan.
Stay **plan-only**. No migrations, tokens, or destructive commands until approved.

**Role:** Senior platform engineer (destructive-op + migration safety).

**Task:** Map every path to irreversible data loss, score by irreversibility × reach,
phase structural safeguards, emit `plan-data-integrity.md`. **Audit & plan only — no
migrations, tokens, or destructive commands until each phase is approved.**

**Find what could wipe prod. Gate it. Change nothing until approved.**

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **plan-data-integrity** (this) | Prevent irreversible loss — unguarded deletes, unsafe migrations, backups the agent can also wipe |
| `plan-backup-dr` | Can you restore? RPO/RTO, drill evidence |
| `audit-db-schema` | Schema design quality |
| `plan-rls-audit` | Who can read/write which rows |

## How to reason (every plan item)

1. **Propose** — gate, blast-radius split, backfill-before-drop, or token scope
2. **Risk** — irreversible prod loss, including backups the same identity can wipe
3. **Keep-working** — already-gated, transactional, isolated paths
4. **Phase** — Gates & isolation → Migration safety → Backup blast-radius → Least-privilege (do not execute)

## Worked example

> **Propose:** scope the agent token to non-destructive; move backups off the prod volume; split `0007_drop_legacy.sql` into backfill → verify → drop.
> **Risk:** same identity can `DROP` prod *and* the backups — restore is theater.
> **Keep-working:** additive migrations already wrap in a transaction.
> **Phase:** Phase 1 — Gates & isolation (Critical).
> **Restore proof:** `plan-backup-dr`, never this skill.

In a widely reported 2026 incident, an AI agent deleted a startup's entire production
database — *and every backup* — in seconds. Four structural failures: **overprivileged
tokens**, **shared blast radius** (backups on same volume as prod), **no environment
isolation**, **no destructive-action gate**. Written rules were ignored. Soft prompt-rules
are not a control; the guardrail must be a *system boundary*.

---

## When this fires

Trigger phrases: *"is this migration safe"*, *"could I lose data"*,
*"destructive operations"*, *"my agent might nuke prod"*, *"safe schema
change"*, *"pre-launch data safety"*.

Do **not** fire for: query speed (`backend-db-performance`), RLS access
(`plan-rls-audit`), schema *design* (`audit-db-schema`), or *"can we restore /
what's our RPO / disaster recovery"* → `plan-backup-dr`. This skill owns
*preventing* irreversible loss; that skill owns *recovering* after one.

---

## Why a dedicated skill

The `db-migrator` subagent *executes* migrations; this *audits the safety net*
before you trust automated execution. Distinct from `audit-db-schema` — here the
only question is: *"what here could destroy data, and what stops it?"*

---

## The audit  [HIGH freedom]

### A · Destructive operations in code & migrations
- **Unguarded `DELETE` / `UPDATE` without `WHERE`** — or WHERE that matches all.
- **`TRUNCATE`, `DROP TABLE`, `DROP COLUMN`** in migrations — confirm intent.
- **Column drops/renames without backfill** — silent data loss.
- **Cascade reach** — `ON DELETE CASCADE` further than intended.
- **Destructive verbs in agent/CI scope** — `drop`, `truncate`, `destroy`, `rm -rf`.

### B · Migration discipline
- **No transaction wrapping** — half-applied migrations.
- **No down/rollback path.**
- **Run straight against prod** — no staging dry-run.
- **Supabase specifics** — prod-linked CLI without branch/preview check.

### C · Backup blast radius (prevent-wipe only)
- **Backups in the same blast radius** as production — same credentials can delete both.
- Hand restore drills, RPO/RTO, and "can we recover" to `plan-backup-dr`. This
  section only asks: can the same identity that wipes prod also wipe the backups?

### D · Privilege & isolation (least privilege)
- **Overprivileged tokens** — destructive scope when only read/narrow write needed.
- **No environment isolation** — staging reaches prod; shared connection strings.
- **Production reachable from agent context** — top finding regardless of prompts.

### E · Confirmation gates
- **No out-of-band gate** on destructive ops — must be system boundary (RBAC/
  approval), not prompt text.
- **No kill switch / audit log** for agent operations.

---

## Procedure  [HIGH freedom — plan only]

1. **Inventory destructive surface.** Migrations, SQL, scripts, agent/CI scopes.
2. **Trace each to impact.** Reversible? gated? backed up outside blast radius?
3. **Score.** "Agent can delete prod, backups share volume" = Critical, top of list.
4. **Phase** — gates and blast-radius separation first.
5. **Emit `plan-data-integrity.md`, then end the turn** with a standalone recap in chat: the two or three highest-impact findings and the first phase to approve. The file is the deliverable — write it before the recap. **Do not edit anything.**

---

## Guardrails

- **Plan only.** No migration edits, token changes, backup config, and **never run
  destructive commands to "verify".**
- **System boundaries over prompt-rules.** Recommend structural gates, not more
  agent instructions.
- **Least privilege is the cheapest win.**
- **Backups outside the blast radius or they don't count.**
- **Backfill before drop.** One-step column drops on populated data = data loss.

## Self-critique before the burndown  [LOW freedom — do not skip]

1. **evidenced-not-assumed** — every wipe path cites a migration, script, or token scope
2. **plan-only** — no SQL, no token edits, **never** a destructive "verify"
3. **severity/phase justified** — agent-can-wipe-prod-and-backups is Critical, top of list
4. **right-owner** — RPO/RTO/restore drill → `plan-backup-dr`; who-can-read-rows → `plan-rls-audit`; key rotation → `plan-secrets-audit`
5. **no-false-safety** — prompt-rules are not a gate; backups in the same blast radius do not count

---

## Report template — `plan-data-integrity.md`

```markdown
# Data-Integrity & Destructive-Op Audit — <repo>

_Audit-only. No migration, token, or backup config changes until approved._
_No destructive command is run for any reason._

## Scope
- Audited: migrations ☐  SQL/scripts ☐  agent/CI token scopes ☐  backup config ☐
- Stack: Supabase ☐  Railway ☐  Vercel ☐  AWS ☐  | Assumptions: …

## Verdict
| Severity | Count | Worst case |
|----------|-------|-----------|
| Critical | n | irreversible prod loss, no gate, backups in blast radius |
| High     | n | unbackfilled drop, over-scoped token |
| Medium   | n | no rollback path |

## Findings
| # | Operation / location | Data at risk | Reversible? | Gated? | Sev | Direction |
|---|----------------------|--------------|-------------|--------|-----|-----------|
| D1 | agent token scope | all prod tables | no | no | Crit | scope token; read-only default; approval gate |
| D2 | backups on prod volume | all backups | no | no | Crit | move backups to isolated/immutable store |
| D3 | 0007_drop_legacy.sql | users.legacy_id | no | no | High | backfill→verify→drop in separate migration |

## Phased burndown
- **Phase 1 — Gates & isolation** → infra/RBAC config — D1, D2 (make catastrophe impossible)
- **Phase 2 — Migration safety** → `db-migrator` — backfill steps, transactions, rollbacks
- **Phase 3 — Backup blast-radius gates** → isolate backups from the agent identity; restore drills / RPO stay on `plan-backup-dr`
- **Phase 4 — Least-privilege sweep** → infra + `plan-secrets-audit` — token scoping

## Execution handoff
Approve a phase to run it. Confirm the agent identity cannot delete backups.
Restore proof is `plan-backup-dr`, never this skill.
```

---

## Chains with

- **Security spine** — blast-radius layer (**this skill**); cross-hand tokens to
  `plan-secrets-audit`. Recoverability → `plan-backup-dr`.
- **Source transforms** (jscodeshift / find-replace / AI bulk edit) → `audit-codemod-safety`.
- **Execution:** `db-migrator`, `backend-patterns`, infra config, `create-hook`.
- **Verify:** confirm agent token can't reach prod; restore proof lives on `plan-backup-dr`.

> Planned at high effort; executed at the default effort under the approved-plan execution rule (`approved-plan-execution.mdc`). Highest-stakes plan in the set — the plan says *what* can destroy data; the rule forbids the agent from doing it autonomously, on any model.
