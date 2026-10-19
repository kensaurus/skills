---
name: workflow-onboard
description: >
  First-contact orientation for an unfamiliar codebase. Use when "I'm new to this repo",
  "orient me", "explain this codebase", "what does this do?", "onboard me", "first day on
  this project", or "catch me up on the codebase".
license: MIT
context: fork
agent: Explore
---

# workflow-onboard — Codebase Orientation

**Degree of freedom: MIXED.** Briefing synthesis `[HIGH freedom]`; which files
to read and never printing env values `[LOW freedom — run exactly]`.

Orient to any repo in under 5 minutes. Read first, explain second.

Copy this checklist and tick items as you go:

```
- [ ] Step 1: Stack and entry points: manifest, README, root, routes
- [ ] Step 2: Data and auth layer: schema, client init, env names only
- [ ] Step 3: Recent context: git log and recent diff stat
- [ ] Step 4: Orientation briefing: eight sections, scannable
- [ ] Step 5: Guardrails: no env values; missing files said out loud
```

## How to reason

1. **Read** — manifests, routes, schema, auth — don't guess
2. **Map** — stack, features, data, how-to-run
3. **Gap** — missing README/schema said out loud
4. **Brief** — scannable; top-3 complexity called out

## Worked example

> **Read:** `package.json` is Next.js 16 + Supabase; `src/app/(app)/*` has dashboard, billing, settings; latest migration adds `organizations`.
> **Map:** B2B dashboard; session via middleware + `getUser()`; run `pnpm dev`.
> **Gap:** no README scripts section; `.env.example` lists `STRIPE_SECRET_KEY`.
> **Brief:** purpose + stack + route map + 4 tables + auth + `pnpm dev` + env names + "start in `src/lib/billing`".

## Self-critique before reporting

- **Files read** — briefing cites files, not folklore
- **Secrets safe** — env names only, never values
- **Gaps explicit** — missing schema/README is stated, not invented
- **Right owner** — preflight commands/services → `workflow-environment-ready`; parked work → `housekeep-backlog`

---

## Step 1: Stack & entry points  [LOW freedom — run exactly]

Read these (grep finds fragments; the briefing needs the whole file). The table is the floor, not the ceiling: when the repo does not match it (monorepo, unusual framework, no `src/app`), follow what the manifest and top-level tree point to before writing anything:

| File | What to extract |
|------|-----------------|
| `package.json` / `pyproject.toml` / `Cargo.toml` | Runtime, framework, key deps, scripts |
| `README.md` | Stated purpose, setup steps, architecture notes |
| `src/app/layout.tsx` / `pages/_app.tsx` / `App.tsx` | Root component, providers, global context |
| `src/app/**/page.tsx` / `src/routes/**` / `app/routes/**` | Route tree → feature map |
| `capacitor.config.*` / `app.json` / `app.config.*` | Mobile targets (Expo/RN/Capacitor) |
| `android/` / `ios/` presence | Native targets |

---

## Step 2: Data & auth layer  [LOW freedom — run exactly]

| File | What to extract |
|------|-----------------|
| `supabase/migrations/*.sql` (latest 3) | Schema, tables, relationships |
| `prisma/schema.prisma` / `drizzle/*.ts` | ORM model |
| `src/lib/supabase.*` / `src/lib/db.*` | Client init, auth helper |
| `.env.example` / `.env.local` (names only, never values) | Required env vars |
| `middleware.ts` / `auth.ts` / `src/lib/auth.*` | Auth guard pattern |

---

## Step 3: Recent context  [LOW freedom — run exactly]

```bash
git log --oneline -15          # recent work direction
git diff HEAD~5 --stat         # files changed recently
```

---

## Step 4: Orientation briefing  [HIGH freedom]

Produce a structured briefing covering:

1. **What it is** — one sentence on the product's purpose
2. **Tech stack** — framework + DB + auth + mobile targets
3. **Feature map** — top-level routes grouped by capability
4. **Data model** — the entities and relationships the feature map depends on, not the whole schema
5. **Auth pattern** — how sessions work and who the roles are
6. **How to run** — exact commands from `package.json` scripts
7. **Environment** — required env vars (names only) and where to find values
8. **Top 3 to understand first** — the areas with the most business logic or complexity

Format as a scannable briefing, not a wall of text. Use short tables where helpful.

---

## Guardrails  [LOW freedom — do not skip]

- Never print `.env` values — names only
- If the codebase is a monorepo, scope the briefing to the specific app/package the user is working in (ask if unclear)
- If critical files are missing (no README, no schema), say so explicitly rather than guessing
