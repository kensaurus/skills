# AGENTS.md — Project Constitution & Agentic-Engineering Discipline

> Copy to your **project repo root** as `AGENTS.md`. Cursor, Claude Code, Codex, and
> Antigravity read it; Cursor also uses `.cursor/rules/`. Fill the `<PLACEHOLDERS>`.
> Claude Code skips `AGENTS.md` when a `CLAUDE.md` exists in the repo **or any parent
> folder** (for example one beside all your repos). Set user setting
> `pluginConfigs["agents-md@builtin"].options.instructionFiles` to
> `"claude-md-and-agents-md"`, or import it from `CLAUDE.md` with `@AGENTS.md`.
>
> This is the *constitution*: the always-on contract between you and any coding agent.
> The `plan-*` skills produce burndowns; this file governs how every change happens.
>
> Keep it short. A bloated constitution is cognitive debt. Cut rules that aren't earning
> their place.

---

## 1. Mission (the *why*)

- **What this is:** `<ONE SENTENCE — core function.>`
- **Who uses it:** `<PRIMARY USER + main task.>`
- **Non-negotiables:** `<e.g. user data never leaves region X, must work offline,
  solo-founder maintainable.>`

## 2. Tech stack (the *what*)

- **Frontend:** `<Next.js / React / Tailwind / Capacitor …>`
- **Backend:** `<Supabase / Postgres / Edge Functions …>`
- **Payments:** `<Stripe …>`  **Errors:** `<Sentry …>`  **LLM obs:** `<Langfuse …>`
- **Deploy:** `<Vercel / AWS …>`  **Mobile:** `<Capacitor iOS + Android …>`
- **AI dev tools:** Cursor + Claude Code. Plan and audit at high effort;
  implement at the default effort; verify with a fresh-context judge. Approved
  plans run under the pack's execution rule.

## 3. Roadmap (the *when*) — keep current

- **Now:** `<current phase / feature.>`
- **Next:** `<…>`
- **Later:** `<…>`

> **Drift rule:** when code changes, update this section and the relevant spec in the
> *same* change. Stale roadmap = cognitive debt. Re-run `plan-docs-sync` if it slips.

---

## 4. Mode discipline — vibe vs spec

Two modes. Know which you're in; switch as stakes rise.

- **Vibe mode** — exploration, spikes, throwaway prototypes, one-off scripts. Fast,
  freeform, accept-and-iterate. Fine when a wrong answer is cheap.
- **Spec mode** — anything touching **auth, money, user data, migrations, or code
  someone will maintain.** Spec first, then build. Non-negotiable for §1 non-negotiables.

**Convergent pattern:** vibe-code a spike → distill what worked into a spec →
spec-drive the production version. Don't ship a spike. Don't over-spec a Tetris.

**Transition signal (vibe → spec):** the agent *fixes one thing and breaks something it
didn't see* — stop vibing and write the spec. That's context drift; it compounds.

---

## 5. The build loop (every non-trivial change)

1. **Spec in.** Goal, constraints, acceptance criteria, **files in scope.** The
   first spec names those four and stops; detail arrives in follow-ups as each slice needs it.
2. **Plan.** List files and changes *before* editing. For §1 non-negotiables, run the
   relevant `plan-*` skill first; get an approved burndown.
3. **Execute one slice.** One reviewable, independently testable unit — not the whole
   feature in one shot.
4. **Review the diff** before it merges — generated code is often subtly wrong, and the diff is where that shows.
5. **Verify.** Tests/acceptance criteria pass; behavior matches spec.
6. **Ship.** Conventional commit → PR. Update spec/roadmap in the same change.

**Iterate, don't regenerate.** Tell the agent what to fix; don't start over.
The same holds for the agent's edits: change the lines that need changing —
a whole-file rewrite is a regeneration, not an edit.

**Scope.** Deliver what the slice asks. Pre-existing bugs you notice go in the report as
follow-ups, not in the diff. Add tests where the spec asks or the repo already keeps them;
scratch checks stay out of the repo.

---

## 6. Context discipline (drift & cognitive debt)

- **Fresh context per phase.** New session for each plan phase, loaded with what that
  phase needs. The point is review independence, not room: the window is 1M and
  compaction exists, so never wrap a phase up early to save context.
- **Cognitive debt is real debt.** Stale `AGENTS.md`, unreviewed diffs, prompts that
  paper over architecture problems, dead context — pay it down like tech debt.
- **Prefer libraries over rebuilds.** Use a vetted library where one covers the job —
  after verifying it exists (§7). Less code wins.
- **Use live docs.** Pull current docs (e.g. Context7) for the exact library
  version in the manifest. Recognizing a library's name is not knowing its
  current API — look it up as written.

---

## 7. Hard guardrails (always on)

Maps to `plan-*` skills for audit; execution rules for implementation.

| Rule | Skill |
|------|-------|
| Never embed/commit secrets; rotate if ever committed | `plan-secrets-audit` |
| Never install unverified packages (slopsquatting) | `plan-dependency-provenance` |
| RLS on every table; no client `service_role` | `plan-rls-audit` |
| Validate trust boundaries; verify webhook signatures | `plan-input-validation` |
| No autonomous prod destructive ops; backups off blast radius | `plan-data-integrity` |
| No swallowed errors; no PII in Sentry | `plan-error-handling` |
| LLM features: per-user quota, `max_tokens`, daily kill switch | `plan-llm-cost-guardrails` |
| Capacitor: Keychain/Keystore tokens; PKCE + App Links; no dev config in prod | `plan-capacitor-hardening` |
| Store submit: privacy manifest, Data Safety match | `plan-mobile-readiness` |

---

## 8. Definition of done

Done when: diff reviewed, acceptance criteria pass, no §7 regression, observability
shows the new path, spec/roadmap reflect reality. **"The agent stopped editing" is not done.**

---

## 9. Coding conventions (project-specific)

- `<TypeScript strict; Zod at boundaries; …>`
- `<Server Components by default; RLS mandatory; …>`
- `<Conventional commits; PRs ≤ 300 lines; …>`

---

## Using with kenji

Install the full pack (skills + commands): `npx @kensaurus/skills --all`. Skills only: `npx skills add kensaurus/skills`. Re-check: `npx @kensaurus/skills --verify`.

Plan loops: [PLAN-LOOPS.md](https://github.com/kensaurus/skills/blob/main/docs/PLAN-LOOPS.md)

This template ships with kenji at `docs/AGENTS.template.md`.
