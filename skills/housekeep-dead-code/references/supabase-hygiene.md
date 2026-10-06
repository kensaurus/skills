# Supabase arm — dead schema, orphan functions, drift

Knip stops at the JavaScript boundary. AI-generated Supabase projects carry
the same debt on the other side: tables created for a feature that was
rewritten, RPCs nobody calls, Edge Functions nobody invokes, forty tiny
migrations, and a `supabase.ts` that no longer matches the schema.

## Contents

- 0. Precondition — how old are the statistics?
- 1. What the code actually touches
- 2. Schema inventory (read-only SQL)
- 3. Cross-reference → candidates
- 4. Function-body hygiene
- 5. Migration sprawl
- 6. Types drift
- 7. Drops — the only writes in this arm
- 8. Advisors, last


**Discovery here is read-only and safe against any target, including
production. Every drop is a migration, requires the approved plan row, and
stops before `db push` unless the plan says push.**

Subcommand names move between CLI versions. Run `supabase inspect db --help`
once and use what your installed version actually has.

## 0. Precondition — how old are the statistics?

```bash
psql "$DB_URL" -c "select datname, stats_reset from pg_stat_database where datname = current_database();"
```

`pg_stat_*` counters accumulate since `stats_reset`. **A table with zero scans
on a database reset yesterday proves nothing.** Require ~30 days, or one known
full traffic cycle, before calling anything dead on usage evidence — and
record the window in the report. Below that, rely on the code cross-reference
alone.

This is also why usage statistics are best read from **production**: a staging
database with no real traffic makes everything look dead.

## 1. What the code actually touches

```bash
rg -o "\.from\(['\"][a-zA-Z0-9_]+['\"]\)"           src supabase/functions | sed -E "s/.*\(['\"]//; s/['\"]\)//" | sort | uniq -c | sort -rn > /tmp/sb-tables
rg -o "\.rpc\(['\"][a-zA-Z0-9_]+['\"]"              src supabase/functions | sed -E "s/.*\(['\"]//; s/['\"]//"   | sort -u > /tmp/sb-rpcs
rg -o "functions\.invoke\(['\"][a-zA-Z0-9_-]+['\"]" src                    | sed -E "s/.*\(['\"]//; s/['\"]//"   | sort -u > /tmp/sb-fns
rg -o "storage\.from\(['\"][a-zA-Z0-9_-]+['\"]"     src supabase/functions | sed -E "s/.*\(['\"]//; s/['\"]//"   | sort -u > /tmp/sb-buckets
rg -o "channel\(['\"][^'\"]+['\"]"                  src                    | sort -u > /tmp/sb-channels
```

A table reached only through a view needs the view name grepped too.

## 2. Schema inventory (read-only SQL)

```sql
-- Usage counters per table
select relname, seq_scan, idx_scan, n_live_tup,
       n_tup_ins + n_tup_upd + n_tup_del as writes
from pg_stat_user_tables where schemaname = 'public'
order by seq_scan + idx_scan, writes;

-- Functions
select p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' order by 1;

-- In-database callers the client grep can never see
select tgname, tgrelid::regclass as tbl, tgfoid::regproc as fn
from pg_trigger where not tgisinternal;
select policyname, tablename, qual, with_check
from pg_policies where schemaname = 'public';
select proname from pg_proc where prosrc ilike '%<candidate_name>%';
select jobname, command from cron.job;          -- only if pg_cron is enabled

select id, public from storage.buckets;
```

That third block is the one people skip. **An RPC called only from an RLS
policy, a trigger, or a `pg_cron` job has zero client references and is
fully alive.** Deleting it silently breaks authorization.

CLI equivalents, documented at the time of writing: `supabase inspect db
unused-indexes`, `seq-scans`, `table-sizes`, `index-sizes`, `cache-hit`,
`bloat`. The set has changed across CLI releases, so confirm with
`supabase inspect db --help` before scripting any of them; the SQL above is
the version-independent path.

## 3. Cross-reference → candidates

| Object | Dead when… | **Not** dead if… |
|---|---|---|
| Table | absent from `/tmp/sb-tables`, unreferenced by any function/trigger/policy body, zero reads and writes across a valid stats window | written by a trigger or cron; read by an Edge Function; a webhook target; an audit/log table by design |
| Function (RPC) | absent from `/tmp/sb-rpcs`, not a trigger function, not in any policy `qual`/`with_check`, not called from another function body | an RLS helper (`is_admin()`, `auth.uid()` wrapper) or a trigger target |
| Edge Function | directory exists, absent from `/tmp/sb-fns` | `verify_jwt = false` in `config.toml`, or a Stripe / GitHub / Resend webhook points at it — **external callers never appear in your grep** |
| Index | reported by `unused-indexes` **and** not backing a PK or unique constraint | it backs a constraint, or supports a query that runs monthly (check the stats window) |
| Bucket | absent from `/tmp/sb-buckets` **and** empty | non-empty — objects are data, not dead code. Escalate as data retention |
| Migration file | every earlier migration is applied in every environment | any environment is behind — do not squash |

Repo-vs-deployed drift: `supabase functions list` shows functions deployed
from someone's laptop that never landed in git. Those are candidates to
**redeploy from git first**, then delete if still unreferenced.

## 4. Function-body hygiene

```bash
supabase db lint --level warning        # add --linked or --db-url for a remote target
```

`plpgsql_check` reports unused variables and arguments, dead code after
`RETURN`, missing returns, hidden casts, and `EXECUTE` strings open to
injection. Fix findings in the function's migration, never in the dashboard —
a dashboard edit is drift the repo cannot see.

## 5. Migration sprawl

Agent sessions produce one migration per thought. Only once every environment
is at the same version:

```bash
ls supabase/migrations | wc -l
supabase migration squash              # squashes local migrations to one file
supabase db reset                      # prove the squashed set builds a clean database
supabase test db                       # pgTAP, if present
```

Keep the squash in its own PR. It is a large diff that says nothing about
behavior, and mixing it with deletions makes both unreviewable.

## 6. Types drift

```bash
supabase gen types typescript --linked > /tmp/supabase.ts
diff -u /tmp/supabase.ts src/types/supabase.ts || echo "DRIFT"
```

Regenerate in the **same commit** as the schema change, and install the CI
guard from [`ratchet-ci.md`](ratchet-ci.md) §8 so it cannot drift again.

## 7. Drops — the only writes in this arm

Ask the human to name the target database first and wait for the reply. Do not
infer it from `.env` or a linked project ref.

- **Tables — two steps.** Migration 1 renames to `_deprecated_<name>`: errors
  surface immediately, the data is intact, and rollback is another rename.
  Migration 2 drops, one release cycle later. A rename is reversible; a drop
  destroys data.
- **Functions / Edge Functions** — direct drop or directory delete. Cheap to
  restore from git.
- **Indexes** — `drop index concurrently`. Never a PK or unique index.
- **Policies** — never dropped here. A table that stays needs RLS →
  `plan-rls-audit`.
- **Buckets holding objects** — never here. Retention is a product decision.

Every migration: `supabase db reset` green locally, `supabase db lint` clean,
types regenerated in the same commit. Then stop.

## 8. Advisors, last

Supabase's advisors (dashboard, or the Supabase MCP) flag RLS-off tables,
unindexed foreign keys, and duplicate or unused indexes. Run them **after**
the drops, since drops change the findings. RLS results belong to
`plan-rls-audit`, not this skill.
