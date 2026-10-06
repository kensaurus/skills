<div align="center">

<img src="assets/logo.png" width="72" height="72" alt="cursor-kenji mark">

# cursor-kenji

**You say the job. The playbook runs.**

158 agent skills · 63 slash commands · 16 MCP servers · 12 Cursor skills · 6 subagents — for React / Next.js / Supabase, usable on almost any stack.

<p>
  <a href="https://www.npmjs.com/package/@kensaurus/cursor-kenji"><img src="https://img.shields.io/npm/v/@kensaurus/cursor-kenji?style=flat-square&color=cb3837&logo=npm" alt="npm version" /></a>
  <a href="https://www.skills.sh/kensaurus/cursor-kenji"><img src="https://skills.sh/b/kensaurus/cursor-kenji" alt="skills.sh installs" /></a>
  <img src="https://img.shields.io/github/license/kensaurus/cursor-kenji?style=flat-square&color=444" alt="License" />
</p>

<a href="docs/GETTING-STARTED.md" title="First-time guide">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/hero-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="docs/screenshots/hero-light.png">
    <img alt="You say fix this bug and ship it — workflow-fix-and-ship triages, tests, verifies, and opens the PR" src="docs/screenshots/hero-dark.png" width="100%">
  </picture>
</a>

<sub>↑ what happens after install · follows your GitHub theme · not a hosted app</sub>

</div>

**Why it exists** — Coding agents skip the unglamorous parts: interview you first, write the failing test, watch production, refuse “done” with leftovers. These playbooks don’t skip.

**Who it’s for** — People shipping in Cursor, Claude Code, Codex CLI, or Gemini CLI. Tuned for React / Next.js / Supabase. Works on other stacks.

**What it’s not** — A Cursor replacement, a prompt paste-bin, or 157 names to memorize. Install once. Talk like a teammate.

## Install (30 seconds)

```bash
npx @kensaurus/cursor-kenji --all
```

That merge-installs skills **and** slash commands (and agents/rules) into every tool it supports, then hash-checks the copies. Restart Cursor. Done.

> Skills only (no `/commands`)? `npx skills add kensaurus/cursor-kenji` — Vercel skills CLI, project-local by default (`-g` for `~/.cursor/skills`). Its `--all` means “all skills to all agents”, not Cursor+Claude+Codex+Gemini.
>
> No Cursor yet? **[Download it](https://cursor.com)**. Claude Code plugin: `/plugin marketplace add kensaurus/cursor-kenji` then `/plugin install cursor-kenji@cursor-kenji`. Flag list and clone install → [Quick Start](#quick-start). Brand new? **[Plain-language guide →](docs/GETTING-STARTED.md)**.

## What should I say?

| You say… | What kicks in | What you get |
|:---------|:--------------|:-------------|
| *"orient me"* | `workflow-onboard` | A short tour of the codebase |
| *"grill me before I build"* | `workflow-grilling` | One question at a time until you're aligned |
| *"build this feature"* | `workflow-build-feature` | Spec → tests → code → smoke → PR |
| *"fix this bug and ship it"* | `workflow-fix-and-ship` | Debug → fix → verify → PR → deploy |
| *"audit my security"* | `audit-security` | OWASP-style findings with file:line |
| *"is this production-ready?"* | `audit-resilience` + `audit-realworld` | Timeouts, retries, parity checks |
| *"complete everything"* | `complete-everything` | No parked leftovers — judge verifies "done" |
| *"ship it and watch it"* | `workflow-ship-and-observe` | Deploy → verify live → observe / rollback |
| *"take this to market"* | `workflow-gtm` | Interview + GTM plan → approve → analytics, hero, onboarding, SEO, launch kit, weekly loop |
| *"what should I charge?"* | `plan-pricing` | Value metric, tiers, price corridor, research plan — no price changes until you approve |

Highest-impact combo: `monkey-test as guest and logged-in, ticket every real bug, then lock a Playwright pass on the worst ones` → `test-exploratory` → `workflow-feedback-to-closure` → `test-playwright`.

Full menu → [Every skill](#every-skill-in-plain-english). Trigger phrases → [docs/CATALOG.md](docs/CATALOG.md). Combos → [docs/CATALOG.md — Skill Composition](docs/CATALOG.md#skill-composition-patterns).

## Tour

Four rooms. Same rule: you talk, a named playbook runs.

<table>
  <tr>
    <td width="50%" align="center">
      <a href="docs/GETTING-STARTED.md#a-typical-session">
        <img alt="workflow-grilling — one question at a time before any code" src="docs/screenshots/grill-dark.png" width="100%">
      </a>
      <br>
      <sub><b>Grill</b> · <code>workflow-grilling</code> — one question at a time until you share a decision log</sub>
    </td>
    <td width="50%" align="center">
      <a href="docs/CATALOG.md#workflow-build-feature">
        <img alt="workflow-build-feature — spec, failing test, code, PR" src="docs/screenshots/build-dark.png" width="100%">
      </a>
      <br>
      <sub><b>Build</b> · <code>workflow-build-feature</code> — spec → failing test → code → smoke → PR</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <a href="docs/CATALOG.md#audit-security">
        <img alt="audit-security findings with file and line" src="docs/screenshots/audit-dark.png" width="100%">
      </a>
      <br>
      <sub><b>Audit</b> · <code>audit-security</code> — OWASP-style findings with file:line, not a vibe check</sub>
    </td>
    <td width="50%" align="center">
      <a href="docs/CATALOG.md#workflow-ship-and-observe">
        <img alt="workflow-ship-and-observe — live revision then a watch window" src="docs/screenshots/ship-dark.png" width="100%">
      </a>
      <br>
      <sub><b>Ship</b> · <code>workflow-ship-and-observe</code> — confirm the live SHA, watch, rollback if it breaks</sub>
    </td>
  </tr>
</table>

## The building blocks

| Thing | What it is | How you use it |
|:------|:-----------|:---------------|
| **Skill** | A playbook for one job | Describe the job in chat |
| **Command** | A shortcut | Type `/commit`, `/pr`, `/plan-mode` |
| **Subagent** | A helper that peels off one task | Say *"review this PR"* |
| **Rule** | A house rule the AI always obeys | Drop a `.mdc` into your project |
| **MCP server** | A connection to your database / GitHub / browser | Copy a template + set env vars |

Everything follows the [Agent Skills spec](https://agentskills.io/specification) and is checked on every commit (`npm test` covers all **170** installable skills). MCP templates pin exact versions against [package-hallucination attacks](https://cloudsecurityalliance.org/blog/product-news/2025/03/06/slopsquatting-ai-code-assistants-and-package-hallucinations).

## How it works

Look → change → prove → ship, with guardrails on the whole time:

```text
   Orient          Assess           Change           Prove            Ship
(get to know) → (measure first) → (build/fix) → (test for real) → (go live)
```

| Stage | Skill families |
|:------|:---------------|
| **Orient** | `workflow-onboard`, `/research` |
| **Assess** | `audit-*`, `plan-*`, `/grill-me` |
| **Change** | `design-*`, `enhance-*`, `backend-*`, `housekeep-*` |
| **Prove** | `test-*`, `complete-everything`, `completion-judge` |
| **Ship** | `workflow-ship-and-observe`, `deploy-*`, `debug-*` |
| **Guardrails** | rules, completion hook, `enhance-agent-guardrails`, `/handoff` |

Assess before you change. Prove before you ship.

The 23 `plan-*` skills audit first and wait for your approval. See [docs/PLAN-LOOPS.md](docs/PLAN-LOOPS.md).

## What's Inside

| | Count | What it does |
|:--|------:|:-------------|
| **Skills** | 158 | Auto-triggering playbooks (audit, enhance, debug, test, build, plan) |
| **Cursor Skills** | 12 | IDE tools (canvas, hooks, rules, PR splitter) |
| **Commands** | 63 | Slash shortcuts (`/commit`, `/pr`, `/burndown-full`, …) |
| **Subagents** | 6 | Background helpers (code-reviewer, debugger, db-migrator…) |
| **Completion hook** | 1 | Opt-in stop gate: continues only unfinished durable closure state |
| **MCP Servers** | 16 | Full template: Supabase · GitHub · Playwright · AWS · Slack (essential is 3) |
| **Project Rules** | 7 | Drop-in `.mdc` for `.cursor/rules/` (plus 5 global, 5 RN bundle optional) |
| **Notepads** | 2 | Context templates (architecture, design tokens) |
| **Shell Aliases** | 8 | `newskill`, `cursor-sync`, `gc`, `gp` |

Trigger phrases → **[docs/CATALOG.md](docs/CATALOG.md)** · quick lookup → **[docs/TRIGGER-CHEATSHEET.md](docs/TRIGGER-CHEATSHEET.md)**.

---

## Quick Start

| Method | Command | What it installs |
|:-------|:--------|:-----------------|
| **npm installer** (full pack) | `npx @kensaurus/cursor-kenji --all` | Skills + commands + agents + rules. `--all` = Cursor + Claude + Codex + Gemini |
| **skills.sh** (skills only) | `npx skills add kensaurus/cursor-kenji` | `SKILL.md` folders only. Default is the current project; add `-g` for `~/.cursor/skills`. Does **not** write `~/.cursor/commands` |
| **Clone** | `git clone … && ./install.sh` | Same as the npm installer (`--cursor --claude` with no args) |
| **Claude Code plugin** | `/plugin marketplace add kensaurus/cursor-kenji` then `/plugin install cursor-kenji@cursor-kenji` | This repo as a marketplace. Not the Anthropic community catalog until they list it |

**npm installer modes:**

```bash
npx @kensaurus/cursor-kenji            # merge — add/overwrite this repo's items (Cursor)
npx @kensaurus/cursor-kenji --auto     # detect installed tools and install to each
npx @kensaurus/cursor-kenji --claude   # install for Claude Code (~/.claude/) instead
npx @kensaurus/cursor-kenji --codex    # install for Codex CLI (~/.codex/AGENTS.md + prompts)
npx @kensaurus/cursor-kenji --gemini   # install for Gemini CLI (~/.gemini/GEMINI.md + commands)
npx @kensaurus/cursor-kenji --all      # install for all four supported tools in one run
npx @kensaurus/cursor-kenji --clean    # mirror ~/.cursor to match this repo (backup first)
npx @kensaurus/cursor-kenji --dry-run  # preview
npx @kensaurus/cursor-kenji --verify   # hash-check dests against this package (no writes)
npx @kensaurus/cursor-kenji --skill audit-ux   # single skill
npx @kensaurus/cursor-kenji --link     # dev: symlink for live skill authoring
```

More flags (`--restore`, `--only`, `--no-agents-mirror`): `npx @kensaurus/cursor-kenji --help`.

**Use more than one AI tool? Reach for `--auto`.** It checks `~/.cursor`, `~/.claude`, `~/.codex`, and `~/.gemini`, then installs the right files to each one it finds. The bare command stays Cursor-only.

From a clone: `npm run install:cursor` · `node bin/install.mjs --all` · `npm test` validates skills + count + install smoke test.

From any folder: `npx @kensaurus/cursor-kenji --all`. From a clone, `node bin/install.mjs --all` also works (Windows ships `cursor-kenji.cmd` so `npx` from the repo folder works too).

**Optional — [Mushi Mushi](https://github.com/kensaurus/mushi-mushi)** bug-report triage (pairs with `mushi-health`, `test-playwright`):

```bash
npx skills add kensaurus/mushi-mushi
```

**After install:** (1) Restart Cursor (2) Copy `mcp/mcp.json.template` → `~/.cursor/mcp.json` and set `FIRECRAWL_API_KEY`, `CONTEXT7_API_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` (3) Describe any task — skills match on keywords.

**Authoring skills?** Each skill must pass [Agent Skills spec](https://agentskills.io/specification) validation (`npm run validate:skills`): `name` matches directory, `description` ≤ 320 chars (house budget; spec max 1024), body < 500 lines.

### Claude Code

```bash
npx @kensaurus/cursor-kenji --claude   # Claude Code only
npx @kensaurus/cursor-kenji --all      # all four supported tools
```

All skills, commands, agents, and rules install to Claude Code (`~/.claude/`), with `.mdc` rules installed as `.md`. Skills appear as `/slash-commands`.

From a clone:

```bash
./install.sh --claude    # Claude Code only
./install.sh             # Cursor + Claude Code (default)
```

```bash
# Inside Claude Code
/workflow-build-feature
/debug-error the login endpoint returns 401
/plan-security-audit
```

Skills are read from `~/.claude/skills/<name>/SKILL.md`. No restart required when you re-run the installer — Claude Code picks up file changes at the start of each new session.

**Model and effort.** Claude Code 2.1.280+ defaults to Claude Opus 5.5 (`opus` alias). Its effort default is `medium` — the level Anthropic measured at or above Opus 5 `high` on agentic coding, in fewer steps and about half the tokens — and thinking cannot be switched off, so effort is the only thinking control. The top-level `effortLevel` setting does not apply to it; set effort with `/effort <low|medium|high|xhigh|max>`, per-model `modelSettings`, or a skill's `effort:` frontmatter key. Pack convention: audit, plan, judge, debug and security skills at `high`; ordinary implementation at the `medium` default; read-only inventory, formatting, and `/handoff` at `low`. Cursor ignores the `effort:` key. Full story → [docs/MODEL-AND-EFFORT.md](docs/MODEL-AND-EFFORT.md).

### Codex CLI & Gemini CLI

Codex CLI and Gemini CLI don't have a skills system yet. Each reads a single global context file instead:

```bash
npx @kensaurus/cursor-kenji --codex    # Codex CLI
npx @kensaurus/cursor-kenji --gemini   # Gemini CLI
```

| | Codex CLI | Gemini CLI |
|:--|:--|:--|
| **Rules → context file** | `~/.codex/AGENTS.md` | `~/.gemini/GEMINI.md` |
| **Portable commands** | `~/.codex/prompts/*.md` | `~/.gemini/commands/*.toml` |

Your `rules/` get merged into that one auto-loaded file (the skill-routing index is skipped). Three standalone playbooks — `plan-mode`, `research`, and `fix-issue` — ship as native prompts/commands. Skills and subagents aren't written out, because neither tool can load them. Existing `AGENTS.md` or `GEMINI.md` is backed up as `.bak-<stamp>` first.

> The bash `install.sh --codex`/`--gemini` delegates to the Node installer (needs Node ≥ 18).

### Manual install

```bash
git clone https://github.com/kensaurus/cursor-kenji.git && cd cursor-kenji && ./install.sh
```

<details>
<summary>One-liner (curl)</summary>

```bash
curl -sSL https://raw.githubusercontent.com/kensaurus/cursor-kenji/main/install.sh | bash
```

</details>

**Keep fresh:** `npx @kensaurus/cursor-kenji --all && npx @kensaurus/cursor-kenji --verify --all` or `git pull && ./install.sh`

---

## Every skill, in plain English

You don't memorize names — describe the job in chat. Exact trigger phrases → **[docs/CATALOG.md](docs/CATALOG.md)**. Prefix / stage table → **[docs/CATALOG.md — Skill Taxonomy](docs/CATALOG.md#skill-taxonomy)**.

<!-- SKILL-INDEX:START -->

_Auto-generated from each skill's `SKILL.md` — run `npm run gen:skill-index` after adding a skill. **170 skills** listed below._

_Skills marked `/name only` are user-invoked rituals; `reference only` skills are loaded by other skills; every other skill auto-routes from a plain request._

#### Skill families at a glance

| Family | Count | In one sentence |
|:-------|------:|:----------------|
| Audit — inspect; some then fix | **31** | Check the codebase — security, UX, analytics, IAP, the skill pack… |
| Plan — audit first, change only after you approve | **23** | Write a fix plan you approve before any code changes |
| Enhance — improve what already exists | **22** | Polish UI, forms, motion, SEO, PWA, email deliverability |
| Design — build something new | **10** | Create new UI, APIs, emails, themes from scratch |
| Backend — server & data patterns | **5** | Auth, caching, queues, realtime, observability |
| Mobile — React Native / Capacitor | **5** | RN screens, emulators, Capacitor, App Store prep |
| Data — charts & pipelines | **2** | Charts, dashboards, ETL / cron jobs |
| Docs — write it down clearly | **6** | READMEs, PRDs, RFCs with a reader-first voice |
| Housekeeping — consolidate or clear one drifted register | **5** | Consolidate one drifted register (gates, backlog, design tokens, dead code) |
| Workflows — multi-step recipes | **21** | End-to-end recipes (build, fix, ship, green the repo) |
| Test & QA — prove it works | **8** | Unit, Playwright, visual regression, load, red-team |
| Deploy — ship & verify | **2** | npm release + post-deploy smoke tests |
| Debug — find & fix what's broken | **3** | Errors, Sentry, frontend↔backend mismatches |
| Iterate — close the loop after launch | **3** | Post-launch feedback loops and agent-harness iteration |
| Mushi Mushi — bug triage helpers | **2** | Integrate the Mushi Mushi bug-report pipeline |
| Protocols — session guardrails | **1** | Keep browser automation from freezing |
| Authoring — build skills & MCP | **2** | Author new skills or MCP servers |
| Third-party (upstream-maintained) | **3** | Vendored upstream skills (Emil, UI/UX Pro Max, Vercel WIG) |
| Core & cross-cutting | **4** | Close everything, burndown, research, handoff |
| Cursor IDE skills | **12** | Canvas, hooks, rules, PR splitter, CLI helpers |
| **Total** | **170** | |

#### Full list (every skill)

### Audit — inspect; some then fix (31)

| Skill | What it does |
|:------|:-------------|
| `audit-accessibility` | WCAG 2.2 audit via playwright-cli: crawl every page, inject axe-core, test keyboard nav, contrast, ARIA labels, heading order |
| `audit-analytics` | Read-only audit of product-analytics events (PostHog, Amplitude, Mixpanel, GA4): taxonomy, funnels, consent-gated firing, dead or duplicate… |
| `audit-auth-flows` | Read-only audit of app-layer auth: route×gate matrix, session lifecycle, OAuth, provider traps (getSession vs getUser, middleware-only… |
| `audit-backend-architecture` | Read-only backend-architecture audit and pattern advisor, gated by stack |
| `audit-bundle-size` | Analyse and shrink a web app's JavaScript bundle |
| `audit-cicd` | Audit GitHub Actions CI/CD for cost, speed, and safety |
| `audit-code-quality` | Detect and fix repo-wide anti-patterns and consistency drift (naming, organisation, repeated smells) |
| `audit-code-review` | Review a PR or diff for correctness, security, and maintainability |
| `audit-codemod-safety` | Read-only check that a codemod or bulk transform preserved behavior — compiling is not proof |
| `audit-db-schema` | Audit a database schema for consistency, constraints, naming, indexes, and migrations |
| `audit-doctrine` | Read-only audit of custom lint and ratchet rules: is each rule right on the merits, not just enforced |
| `audit-env-parity` | Read-only audit of config parity across dev, staging, and prod: missing or misnamed vars, drifted flags, hardcoded values, reused secrets |
| `audit-fe-api` | Audit frontend API calls against backend implementation for contract alignment and network shape |
| `audit-gate-logic` | Read-only audit of CI gate logic: silent bypass, ratchet gaming, required-but-not, duplicate gates |
| `audit-i18n` | Audit and fix internationalisation in web or mobile apps |
| `audit-infra-cost` | Read-only audit of hosting, database, storage, egress, and serverless spend (Supabase, Vercel, S3/R2, edge) |
| `audit-langfuse-llm` | PDCA quality audit of LLM features: traces, prompts, costs, evals, grounding, hallucination |
| `audit-llm-security` | Read-only OWASP LLM Top 10 audit of app-facing AI: prompt injection, data leakage, unsafe output or agency, RAG risks, unbounded spend |
| `audit-monetization-iap` | Read-only audit of mobile IAP and subscriptions (StoreKit 2, Play Billing, RevenueCat): receipt validation, restore, lifecycle sync, grace… |
| `audit-payment-system` | Read-only audit of payment and money-movement code, scoped from Stripe Checkout to in-house ledgers |
| `audit-performance` | Audit and fix runtime performance (Core Web Vitals, load priority) |
| `audit-realworld` | Read-only conformance audit of a full-stack app against RealWorld ("Conduit"): API spec, shared E2E suite, closest-stack reference |
| `audit-registry-listing` | Read-only audit of where a repo is found: README first screen, npm/PyPI metadata and tarball, GitHub topics, social preview, plugin… |
| `audit-resilience` | Read-only production-resilience audit: timeouts, bounded retries, circuit breakers, idempotency, rate limits, graceful degradation, PII in… |
| `audit-responsive` | Audit and fix layouts at every breakpoint — desktop is not a wide phone |
| `audit-security` | Audit and fix app code against OWASP (injection, headers, dependencies) |
| `audit-skill-conflicts` | Read-only audit of a skill pack for contradictory directives, overlapping triggers, stale cross-refs, and context bloat |
| `audit-ui-states` | Read-only audit of unhappy-path UI states — empty, loading, error, offline, zero-results, permission, overflow — then a fix plan |
| `audit-uiux-design-system` | Audit visual-system coherence: tokens, component variants, color, type, spacing, dark mode |
| `audit-ux` | Per-page UX audit with NN/g heuristics, microcopy review, and Google HEART |
| `audit-ux-journeys` | Cross-page UX audit of user stories, task completion, and IA |

### Plan — audit first, change only after you approve (23)

| Skill | What it does |
|:------|:-------------|
| `plan-aeo-readiness` | Plan-only audit of answer-engine (AEO/GEO) citation readiness for ChatGPT, Perplexity, and AI Overviews |
| `plan-antislop` | Plan-only authenticity / AI-slop audit across prose, UI, code, and IA |
| `plan-aso` | Plan-only ASO audit of App Store and Google Play listings: keywords, localized metadata, screenshots, ratings prompts |
| `plan-backup-dr` | Plan-only audit of whether a project can actually recover from data loss, not just whether backups exist |
| `plan-capacitor-hardening` | Plan-only Capacitor/Ionic native-layer security audit: WebView, token storage, deep links, OAuth, cleartext, exported activities |
| `plan-data-integrity` | Plan-only audit of destructive-operation and migration safety |
| `plan-dead-code` | Plan-only dead-code audit: Knip baseline for unused files, exports, and deps, plus duplication, debug residue, suppressions, orphan assets,… |
| `plan-dependency-provenance` | Plan-only audit of dependencies for hallucinated or slopsquatted packages, supply-chain risk, and license gaps |
| `plan-docs-sync` | Plan-only audit of documentation against actual code behavior |
| `plan-error-handling` | Plan-only audit of silent failures and observability gaps (Sentry, Langfuse) |
| `plan-gtm` | Plan-only GTM audit: monetization, positioning, activation funnel, SEO/AEO, distribution, and a founder interview |
| `plan-input-validation` | Plan-only trust-boundary audit for missing validation, injection, XSS, and forged requests across forms, APIs, and webhooks |
| `plan-llm-cost-guardrails` | Plan-only audit of an LLM app's runaway-cost and quota-abuse exposure |
| `plan-mobile-readiness` | Plan-only App Store / Google Play submission audit for Capacitor and React Native: manifests, permissions, privacy, signing |
| `plan-perf-audit` | Plan-only performance audit across web, mobile, backend, and data; measures first, fixes nothing |
| `plan-pricing` | Plan-only pricing audit: value metric, tiers, price points, free-tier boundary, annual and enterprise anchors, and a willingness-to-pay… |
| `plan-privacy-compliance` | Plan-only audit mapping real personal-data flows to the privacy policy, GDPR, Japan APPI, and store labels |
| `plan-rls-audit` | Plan-only audit of Supabase/Postgres Row-Level Security and access-control gaps |
| `plan-secrets-audit` | Plan-only scan of the working tree and git history for exposed or mis-scoped keys, then a rotate-vs-relocate plan |
| `plan-security-audit` | Plan-only OWASP Top 10 and Supabase-first hardening burndown |
| `plan-stub-checker` | Plan-only sweep for stubs, dead buttons, fake components, unwired handlers, and dead links, then a wiring plan |
| `plan-test-coverage` | Plan-only, user-story-driven test coverage audit |
| `plan-uiux-unification` | Plan-only UI/UX and design-system audit that emits a unification burndown; no code until a phase is approved |

### Enhance — improve what already exists (22)

| Skill | What it does |
|:------|:-------------|
| `enhance-agent-guardrails` | Install guardrails as code so AI sessions cannot reintroduce leaked secrets, injection, or untested code |
| `enhance-arch-boundaries` | Enforce architecture boundaries in CI with dependency-cruiser or eslint-boundaries: layer direction, feature isolation, forbidden imports |
| `enhance-capacitor-ui` | Separate desktop and mobile UI in hybrid apps shipped as PWA + iOS + Android (Capacitor, Tauri, Expo Web, Ionic) |
| `enhance-email-deliverability` | Audit and fix email deliverability: SPF, DKIM, DMARC, reputation, bounces and complaints, list hygiene, unsubscribe compliance |
| `enhance-growth-loops` | Add growth loops to a live product: a "powered by" badge, shareable artifacts, invites and referral credit, each with K-factor events |
| `enhance-lifecycle-email` | Lifecycle email from product events: activation nudges, trial expiry by activated vs stalled, limit-reached upgrades, win-back, with exits… |
| `enhance-mobile-native-feel` | Make an existing Expo/RN or Capacitor app feel native, not web: system tabs and sheets, edge-to-edge, haptics, spring motion, virtualized… |
| `enhance-motion` | Audit an existing web app's motion, then apply one coherent, reduced-motion- safe pass |
| `enhance-onboarding` | Activation pass: define the activation event, cut steps to first value, add templates, sample data, a short checklist, and signup →… |
| `enhance-pwa` | Add or upgrade PWA features: manifest, service worker, offline mode, install prompt, push, background sync |
| `enhance-readability` | Audit and fix how easily content is understood: line length (CPL), reading level, grouping, deadspace, icons or tables that cut verbosity |
| `enhance-readme` | Enhance an existing README: theme-aware hero, feature tour, screenshots or GIF, accurate badges, synced content |
| `enhance-skill-prompts` | Upgrade how an existing SKILL.md instructs, not what it does: freedom, a classification contract, one worked example, an evidence rubric,… |
| `enhance-web-conversion` | Conversion pass for landing, pricing, and upgrade paths: positioned hero, one CTA, real proof, anchored tiers, upgrade prompts at value… |
| `enhance-web-forms` | Build or upgrade web forms: accessible structure, schema-driven validation, client↔server parity |
| `enhance-web-instant-nav` | Instant in-site navigation: Speculation Rules, View Transitions, bfcache, 103 Early Hints |
| `enhance-web-landing` | Build landing pages, portfolios, and marketing sites that don't look AI-generated |
| `enhance-web-redesign` | Upgrade an existing site/app to premium quality |
| `enhance-web-seo` | Audit and fix SEO for a web app |
| `enhance-web-ui` | Polish an existing page's hierarchy, spacing, type, and visual personality |
| `enhance-web-ux` | NN/g-grounded fix of one existing page's flows |
| `enhance-web-web3d` | Add purposeful 3D/WebGL and scroll choreography to an existing site with Three.js/R3F, GSAP, or Motion |

### Design — build something new (10)

| Skill | What it does |
|:------|:-------------|
| `design-api` | Design REST and GraphQL APIs: naming, versioning, error shapes, auth |
| `design-canvas` | Create museum-quality visual art as .png or .pdf: posters, infographics, certificates, badges, banners, social graphics, print |
| `design-email` | Design and build transactional and marketing email templates |
| `design-frontend` | Create a new production-grade UI from scratch, not a polish pass |
| `design-generative-art` | Create algorithmic visuals with p5.js, Canvas, or SVG using seeded randomness and interactive controls |
| `design-mobile-first` | Design a new touch-first UI: targets, safe areas, gestures, then enhance up |
| `design-motion` | Build one new animation (micro-interaction, page transition, scroll, hover) with Motion, CSS, or GSAP |
| `design-prd` | Generate Product Requirements Documents through structured conversation for any project |
| `design-system` | Build a new design system (tokens, variants, theming) |
| `design-theme` | Apply one of 11 preset themes (colors, fonts) to slides, docs, or landing pages |

### Backend — server & data patterns (5)

| Skill | What it does |
|:------|:-------------|
| `backend-db-performance` | Optimize slow queries, indexes, and N+1s |
| `backend-error-handling` | Implement error-handling patterns: boundaries, toasts, one API error shape |
| `backend-observability` | Implement correlated errors, traces, and structured logs with PII redaction |
| `backend-patterns` | Apply backend patterns — queues, caching, rate limits, serverless/edge |
| `backend-realtime` | Implement real-time features with WebSockets, Supabase Realtime, or Server-Sent Events |

### Mobile — React Native / Capacitor (5)

| Skill | What it does |
|:------|:-------------|
| `mobile-capacitor-platform` | Capacitor work beyond UI: plugins, OTA, deep links, push, offline, native CI/CD, store submission, Cordova migration |
| `mobile-emulator-start` | Boot the Android emulator and Metro (Expo or bare RN) in order: check terminals, kill stale ports, pick an AVD |
| `mobile-emulator-test` | QA a native Android or Expo dev-client build end to end on the emulator: UI, Supabase, Sentry per CRUD step |
| `mobile-rn-performance` | Fix React Native / Expo performance, build, and upgrade issues: jank, slow startup, large bundles, memory leaks, Hermes, FlashList,… |
| `mobile-rn-screen` | Polish one existing React Native screen so it feels native |

### Data — charts & pipelines (2)

| Skill | What it does |
|:------|:-------------|
| `data-pipeline` | Wire ETL, ingestion, cron, and queue jobs with idempotency, atomic writes, data contracts, and dead-letters |
| `data-visualization` | Build interactive, accessible charts and dashboards with Recharts, D3, or Victory |

### Docs — write it down clearly (6)

| Skill | What it does |
|:------|:-------------|
| `docs-adr` | Create and maintain lightweight Architecture Decision Records as agent-readable decision memory: what was decided, why, and what was… |
| `docs-coauthor` | Co-author structured documents (specs, PRDs, RFCs, proposals) in three stages: gather context, draft, reader-test |
| `docs-comparison-pages` | Write honest "X vs Y", "alternatives to X", and "migrate from X" pages from verified facts, each unique and dated for review |
| `docs-domain-modeling` | Build a project's domain model: a CONTEXT.md glossary and ubiquitous language |
| `docs-launch-kit` | Versioned launch kit from the repo's real features: Show HN, Product Hunt, Reddit/X/LinkedIn posts, release notes, a calendar with UTM links |
| `docs-writer` | Write developer docs: README content, API references, code comments, changelog entries |

### Housekeeping — consolidate or clear one drifted register (5)

| Skill | What it does |
|:------|:-------------|
| `housekeep-backlog` | Inventory parked work — unfinished plans, deferred phases, TODO/FIXME, skipped tests, open findings — into a living BACKLOG.md that diffs… |
| `housekeep-dead-code` | Remove dead code by category — one commit each, typecheck and tests between, bisect on red — then add a Knip ratchet |
| `housekeep-design` | Consolidate a drifted design system into one token and component source of truth |
| `housekeep-files` | Copy-not-move organizer for document trees: hash inventory, dry run, labeled copies, search catalog, verify every source survived |
| `housekeep-gates` | Consolidate accreted CI gates, ratchets, and hooks into one required aggregator check |

### Workflows — multi-step recipes (21)

| Skill | What it does |
|:------|:-------------|
| `workflow-build-feature` | Build a feature end to end: spec and TDD, implement, unit tests, Playwright check, PR |
| `workflow-coding-discipline` | Guardrails for writing, editing, refactoring, or debugging code: surface assumptions, simplicity first, surgical changes |
| `workflow-environment-ready` | Prove runtimes, installs, tools, services, env names, and the repo's verification commands work before a long run |
| `workflow-feature-flag` | Plan and run a feature-flag rollout |
| `workflow-feedback-to-closure` | Turn raw feedback — bug reports, review comments, Sentry, QA, audit output — into deduplicated tickets and drive each to verified closure |
| `workflow-fix-and-ship` | One bug-fix lifecycle: triage, reproduce, debug, regression test, fix, live check, PR, optional deploy verify |
| `workflow-git-commit` | Create one conventional commit from an already-scoped change: stage the named files or hunks, write the message, commit, never push |
| `workflow-green-repo` | Drive a repository to a green baseline — typecheck, lint, tests, and build passing from a clean checkout — when fixing is authorized |
| `workflow-grilling` | Interview the user about a plan, decision, or idea one question at a time until you agree |
| `workflow-gtm` | Take a shipped repo to market: plan-gtm audit and interview, approval, then measure, message, activate, get found, launch, and a weekly loop |
| `workflow-housekeep` | Repository maintenance: sync the README, remove confirmed dead artifacts, update dependencies safely |
| `workflow-launch-ready` | Launch-preparation sweep for a new app or major release |
| `workflow-merge-conflicts` | Resolve an in-progress merge or rebase conflict by tracing each side back to its intent |
| `workflow-onboard` | First-contact orientation for an unfamiliar codebase |
| `workflow-parallel-agents` | Run multiple agents in parallel via git worktrees, cloud agents, or multi-model comparison |
| `workflow-pr` | Manage an existing PR lifecycle — review, bot feedback, conflicts, merge |
| `workflow-quality-gate` | Pre-release quality gate across red-team, security, bundle size, performance, and unit tests |
| `workflow-refactor` | Scoped, behavior-preserving refactor: map dependencies, change structure, run affected tests |
| `workflow-release-prep` | Take the local working tree to a merge-ready PR against main: review, split if needed, commit, push, open the PR, drive CI green; never… |
| `workflow-ship-and-observe` | Take merged, green code to a verified, monitored production release |
| `workflow-spec-tdd` | A spec → plan → TDD loop before writing a line |

### Test & QA — prove it works (8)

| Skill | What it does |
|:------|:-------------|
| `test-exploratory` | Headed exploratory QA of a live app as guest, then logged in, with junk input and navigation abuse |
| `test-load` | Design and run a k6 or Artillery load profile: throughput, latency percentiles, error rate, breaking point |
| `test-mutation` | Run mutation testing (StrykerJS, mutmut) to measure whether tests assert behavior, not just execute lines |
| `test-playwright` | Close the PDCA loop on this session's diff |
| `test-qa` | Web-app CRUD and story QA when no project-specific skill applies |
| `test-red-team` | Red-team a running web, React Native, or Capacitor app |
| `test-unit` | Write unit and integration tests for a named module or change |
| `test-visual-regression` | Set up Playwright screenshot baselines and CI diffing so UI changes fail pixel by pixel instead of by eye |

### Deploy — ship & verify (2)

| Skill | What it does |
|:------|:-------------|
| `deploy-npm` | Release an npm package: version, CHANGELOG, publish, verify — `/deploy-npm` only |
| `deploy-verify` | Post-deploy smoke test across browser, Sentry, Supabase, Langfuse, and the public web |

### Debug — find & fix what's broken (3)

| Skill | What it does |
|:------|:-------------|
| `debug-error` | Diagnose one bug with hypotheses and runtime evidence before fixing |
| `debug-fe-be-integration` | Diagnose and fix frontend↔backend contract failures by tracing requests, server logs, validation, auth, and responses on both sides |
| `debug-sentry-monitor` | Operate Sentry: triage and fix unresolved issues, cut noise, audit instrumentation, monitor after deploy |

### Iterate — close the loop after launch (3)

| Skill | What it does |
|:------|:-------------|
| `iterate-agent-harness` | Turn an agent failure (premature stop, false completion, gamed check, missed file) into a rule, hook, or CI guard with a regression test |
| `iterate-gtm-weekly` | Weekly go-to-market review for a shipped product: funnel by source, activation cohort, top drop-off, launch results, then one experiment… — `/iterate-gtm-weekly` only |
| `iterate-post-launch` | Close the feedback loop on a live app: read production signals, rank the top issues, fix, verify live, repeat |

### Mushi Mushi — bug triage helpers (2)

| Skill | What it does |
|:------|:-------------|
| `mushi-health` | Pass/fail health check across every Mushi Mushi pipeline component — CLI credentials, API reachability, edge functions, BYOK key pool, QA… — `/mushi-health` only |
| `mushi-integration` | Full end-to-end Mushi Mushi integration smoke test: bug capture → AI triage → story mapping → TDD test generation → approval → execution →… — `/mushi-integration` only |

### Protocols — session guardrails (1)

| Skill | What it does |
|:------|:-------------|
| `protocol-browser-anti-stall` | Guardrail for Playwright CLI sessions: headed, named, isolated; prevents parallel collisions and recovers stalls without scripted shortcuts _(reference only)_ |

### Authoring — build skills & MCP (2)

| Skill | What it does |
|:------|:-------------|
| `meta-mcp-builder` | Build Model Context Protocol (MCP) servers that expose services, APIs, and data as typed tools for agents |
| `meta-skill-creator` | Create or update a pack SKILL.md (frontmatter, house limits, T1–T8) |

### Third-party (upstream-maintained) (3)

| Skill | What it does |
|:------|:-------------|
| `thirdparty-emil-design-eng` | Third-party skill — Emil Kowalski's design-engineering notes (animation craft, Sonner-style components) |
| `thirdparty-ui-ux-pro-max` | Third-party skill — searchable style catalog, palettes, typography, and UX guidelines via Python scripts |
| `thirdparty-web-interface-guidelines` | Third-party skill — Vercel Web Interface Guidelines compliance (focus, forms, animation, copy) |

### Core & cross-cutting (4)

| Skill | What it does |
|:------|:-------------|
| `burndown-full` | Drive a planned mechanical change to 100% repo coverage after a run stopped early |
| `complete-everything` | Closure mode for one approved plan: finish every open item and connected deferral, verify each acceptance criterion, require… |
| `handoff` | Compact the current conversation into a handoff document a fresh agent can pick up — `/handoff` only |
| `research` | Research current practice with Context7, Firecrawl, and official docs before a non-trivial change: gap analysis and a file-mapped plan, no… |

### Cursor IDE skills (12)

| Skill | What it does |
|:------|:-------------|
| `babysit` | Keep an already-open PR merge-ready: triage comments, resolve clear conflicts, fix CI |
| `canvas` | Create a live React canvas beside chat for standalone analytical artifacts that benefit from visual layout: quantitative/security/… _(reference only)_ |
| `create-hook` | Create Cursor hooks — `/create-hook` only |
| `create-rule` | Create Cursor rules for persistent AI guidance — `/create-rule` only |
| `create-skill` | Guide users through creating effective Agent Skills for Cursor — `/create-skill` only |
| `create-subagent` | Create custom subagents for specialized AI tasks — `/create-subagent` only |
| `migrate-to-skills` | Convert 'Applied intelligently' Cursor rules (.cursor/rules/*.mdc) and slash commands (.cursor/commands/*.md) to Agent Skills format… — `/migrate-to-skills` only |
| `shell` | Run the rest of a /shell request as a literal shell command — `/shell` only |
| `split-to-prs` | Split current work into small reviewable PRs — `/split-to-prs` only |
| `statusline` | Configure a custom status line in the CLI — `/statusline` only |
| `update-cli-config` | View and modify Cursor CLI configuration in ~/.cursor/cli-config.json — `/update-cli-config` only |
| `update-cursor-settings` | Modify Cursor/VSCode user settings in settings.json — `/update-cursor-settings` only |

<!-- SKILL-INDEX:END -->

---

## How to Use

| Primitive | Invoke | Example |
|:----------|:-------|:--------|
| **Skill** | Describe the task | "audit my security" → `audit-security` |
| **Command** | `/name` in chat | `/commit`, `/research`, `/pr` |
| **Subagent** | Mention trigger keyword | "review this PR" → `code-reviewer` |
| **Rule** | Copy `.mdc` into project | Always-on conventions |

**Force a skill:** *"use `enhance-web-ux` on `/dashboard`"*

> **Plan → apply pairs.** `housekeep-design` is the execution arm of
> `plan-uiux-unification`; `housekeep-dead-code` is the execution arm of
> `plan-dead-code`; `workflow-gtm` is the execution arm of `plan-gtm`. The
> `plan-*` half audits and stops; the apply half changes the repo only
> against an approved list.
>
> **Third-party skills:** prefixed `thirdparty-*` with `ATTRIBUTION.md` — see **[docs/THIRD-PARTY-SKILLS.md](docs/THIRD-PARTY-SKILLS.md)**.
>
> Anthropic `file-docx/pdf/pptx/xlsx` skills are not in this public repo.

**Cursor-specific skills (12):** `babysit`, `canvas`, `create-hook`, `create-rule`, `create-skill`, `split-to-prs`, … — see [CATALOG.md](docs/CATALOG.md).

---

## Commands (63)

Type `/` in chat to see them all.

| Command | When | What |
|:--------|:-----|:-----|
| `/burndown-full` | Partial refactor stopped early | Drive plan to 100% repo coverage via MATCH/DONE + verification gate |
| `/complete-everything` | Plan marked done with deferrals | Close planned, parked, and discovered work; run the full applicable test ladder |
| `/green-repo` | Whole-repo debt cleanup (authorized) | Drive typecheck/lint/test/build to green from a fresh run |
| `/ship-and-observe` | Deploy to production | Verify the live revision, observe the stability window, roll back if needed |
| `/feedback-to-closure` | Incoming reports/QA/Sentry | Dedupe into durable tickets → fix → production-verified closure |
| `/plan-mode` | Before coding | Research + approved plan (`/plan` is the host mode switch) |
| `/commit` | After coding | Lint, typecheck, commit |
| `/pr` | Ready to ship | Push + open PR |
| `/fix-issue [#]` | Bug reports | Issue → fix → PR |
| `/debug-issue` | Tricky bugs | Hypothesis, then runtime evidence |
| `/review-code` | Before merge | Agent + manual review |
| `/test` | Before commit | Route to the matching test skill |
| `/update-deps` | Maintenance | Safe dep updates |
| `/research` | Before coding | Firecrawl doc research |
| `/readme` | End of session | Sync READMEs |
| `/refactor` | Long files | Modular split |
| `/mcp-guide` | MCP workflow | Tool reference (renamed to avoid Claude Code's built-in `/mcp`) |
| `/uiux` | UI review | Design-system enforcement |
| `/readability` | Dense / hard to read | CPL, Gestalt grouping, visuals that cut verbosity |
| `/instant-nav` | Fast first page, slow next | Speculation Rules, bfcache, Early Hints |
| `/responsive-audit` | Desktop looks like a phone | Breakpoint / linearized-layout audit |
| `/deadcode` | Repo full of unused files/exports/deps | Configured Knip baseline, then delete by category behind a shrink-only ratchet |
| `/gtm` | Shipped, works, nobody comes | GTM plan → approve → measure, message, activate, be found, launch, weekly loop |
| `/gtm-weekly` | Every Monday after launch | Funnel by source → one experiment → one post → scorecard row |
| `/launch-kit` | Announcing a release | Show HN / Product Hunt / Reddit / X copy from verified claims, calendar, UTMs |
| `/skill-conflicts` | Wrong skill fired / just added skills | Pack contradictions, overlapping triggers, stale refs |
| `/thirdparty-web-interface-guidelines` | Vercel UI audit | Review files against [Web Interface Guidelines](https://vercel.com/design/guidelines) |
| `/*-plan` (23 aliases) | Audit before changing | Thin pointers to the `plan-*` skills (`/uiux-plan`, `/privacy-plan`, `/backup-plan`, `/aso-plan`, …) — audit + plan only. See [CATALOG](docs/CATALOG.md#pointer-delegates-to-skill) |

**RN monorepo bundle:** copy `commands/native-rn-monorepo/` + `rules/native-rn-monorepo/` into your project (iOS builds on CI, not locally).

---

## Subagents (6)

| Agent | Triggers on | Output |
|:------|:------------|:-------|
| `code-reviewer` | "review", code changes | Quality, security, types |
| `debugger` | Errors, exceptions | Root cause + fix |
| `db-migrator` | "migration", "new table" | SQL, RLS, indexes |
| `deploy-checker` | "deploy", "ship it" | Pre-deploy validation |
| `perf-monitor` | "slow", "optimize" | Perf audit |
| `completion-judge` | Plan/burndown closure claim | PASS / CONTINUE / BLOCKED against plan, state, diff, and fresh evidence |

`complete-everything` also uses a packaged Cursor stop hook. On Claude Code 2.1.139+ you can kick off the same run with `/goal`.

---

## MCP servers (16)

```bash
cp ~/cursor-kenji/mcp/mcp.json.template ~/.cursor/mcp.json      # essential 3
cp ~/cursor-kenji/mcp/mcp-full.json.template ~/.cursor/mcp.json  # all 16
```

Set `FIRECRAWL_API_KEY`, `CONTEXT7_API_KEY`, `SUPABASE_ACCESS_TOKEN`, and `SUPABASE_PROJECT_REF` in the environment. Slack/Notion in the full template still use `YOUR_*`. Setup → **[mcp/README.md](mcp/README.md)**

| Tier | Servers | Keys? |
|:-----|:--------|:------|
| Essential | Firecrawl, Context7, Supabase | Firecrawl + Context7 + Supabase |
| Dev | GitHub, GitHub Official, Playwright, Postgres, Memory, Chrome DevTools | PAT / conn string |
| Cloud | AWS Lambda, S3, CloudWatch, Redis | AWS profile / URL |
| Productivity | Slack, Notion | Bot token / API key |

---

## Project rules

```bash
cp ~/cursor-kenji/rules/project-starter/*.mdc your-project/.cursor/rules/
```

| Rule | Enforces |
|:-----|:---------|
| `supabase.mdc` | Typed clients, RLS, migrations |
| `typescript.mdc` | No `any`, Zod, ActionResult |
| `components.mdc` | Primitives, Server Components, a11y |
| `tailwind.mdc` | Tokens, mobile-first |
| `data-fetching.mdc` | TanStack Query, RSC prefetch, `'use cache'` |
| `web-performance.mdc` | LCP priority, INP yield, bfcache, budgets |
| `git.mdc` | Conventional commits, no secrets |

Global rules installed by the pack: `full-stack-ship-discipline.mdc`, `approved-plan-execution.mdc`, `skill-workflows.mdc`, `senior-engineer.mdc`, `verification-before-completion.mdc`, `shell-first-search.mdc`.

> **Plan at high effort, execute at medium, judge in a fresh context.** One model does all three — Claude Opus 5.5 is the Claude Code default and a Cursor agent model — so the old strong-planner / fast-implementer split is an effort split. Run the 23 `plan-*` skills at high (`/effort high`, or the skill's `effort:` key on Claude Code); implement approved plans at the medium default under `approved-plan-execution.mdc` (anti-reward-hacking, anti-deletion, checkpoints — model-agnostic); let `completion-judge` verify at high in a separate context. Details → [docs/MODEL-AND-EFFORT.md](docs/MODEL-AND-EFFORT.md).

**Project constitution:** copy [docs/AGENTS.template.md](docs/AGENTS.template.md) to your app repo as `AGENTS.md`.

---

## Shell helpers

```bash
source ~/cursor-kenji/shell-aliases/cursor-helpers.sh
```

| Command | Action |
|:--------|:-------|
| `newskill <name>` | Create skill template |
| `lsskills` | List installed skills |
| `cursor-sync` | Pull repo + reinstall |
| `cursor-dev` | Open Chrome (debug port) + Cursor |
| `newrule <name>` | Create project rule template |
| `newagent <name>` | Create subagent template |
| `gc <type> <msg>` | Conventional commit |
| `gp` | Push current branch |

Full definitions in [shell-aliases/cursor-helpers.sh](shell-aliases/cursor-helpers.sh) (clone-only; not in npm tarball).

---

## Repository layout

```
cursor-kenji/
├── skills/           # 158 Agent Skills (SKILL.md each)
├── skills-cursor/    # 12 Cursor-specific skills
├── commands/         # 63 slash commands
├── agents/           # 6 subagents
├── hooks/            # opt-in completion stop gate
├── rules/            # Global + project-starter rules
├── mcp/              # MCP templates
├── docs/             # CATALOG, PLAN-LOOPS, GETTING-STARTED, …
├── notepads/         # Context templates (clone-only)
├── shell-aliases/    # Bash helpers (clone-only)
├── scripts/          # validate-skills, check-skill-count, install tests
└── bin/install.mjs   # npm installer
```

---

## Contributing

```bash
mkdir -p skills/my-skill && vim skills/my-skill/SKILL.md
npm run test   # validate + count + install smoke
```

See [CONTRIBUTING.md](CONTRIBUTING.md), [docs/README.md](docs/README.md), [docs/DISTRIBUTION.md](docs/DISTRIBUTION.md), [llms.txt](llms.txt), [docs/CATALOG.md](docs/CATALOG.md), [docs/TRIGGER-CHEATSHEET.md](docs/TRIGGER-CHEATSHEET.md).

---

## FAQ

**What is cursor-kenji?**
You say the job in chat; a playbook runs. [Agent Skills](https://agentskills.io) plus slash commands, subagents, and MCP templates. One command installs them into `~/.cursor/` and `~/.agents/skills/`.

**How do I install?**
`npx @kensaurus/cursor-kenji --all` for skills **and** slash commands. `npx skills add kensaurus/cursor-kenji` installs skills only. Claude Code as a plugin: `/plugin marketplace add kensaurus/cursor-kenji`. Restart Cursor after install. Re-check with `npx @kensaurus/cursor-kenji --verify --all`.

**How many skills?**
**158** agent skills in `skills/` plus **12** Cursor-specific skills in `skills-cursor/` (**170** total). Counts come from the filesystem via `npm run check:skills`. See the [family counts table](#skill-families-at-a-glance).

**How do skills trigger?**
You talk normally. Cursor matches your words to each skill's YAML `description`. To force one: *"use \`audit-security\` on this repo"*. Full trigger list: [docs/CATALOG.md](docs/CATALOG.md).

**What's the difference between `audit-*` and `plan-*`?**
`audit-*` reports findings and stops by default. Six audit-and-fix skills (`audit-responsive`, `audit-code-quality`, `audit-performance`, `audit-security`, `audit-i18n`, `audit-bundle-size`) fix what they find, and a few others end with an explicit apply step, such as `audit-langfuse-llm`'s prompt-improvement cycle and `audit-cicd`'s confirmed cache cleanup. `plan-*` only writes a `plan-{name}.md` burndown — **you** approve each phase before any code changes. See [docs/PLAN-LOOPS.md](docs/PLAN-LOOPS.md).

**Where do MCP API keys go?**
Copy `mcp/mcp.json.template` to `~/.cursor/mcp.json` and set the env vars above — never commit real keys. See [SECURITY.md](SECURITY.md) and [mcp/README.md](mcp/README.md).

**Is there machine-readable docs for AI crawlers?**
Yes — [llms.txt](llms.txt) at the repo root.

---

## Alternatives

- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) — curated rules collections
- [skills.sh](https://www.skills.sh/kensaurus/cursor-kenji) — this pack’s live skills page
- [SkillsMP](https://skillsmp.com/creators/kensaurus/cursor-kenji) — aggregator crawl of this repo
- [agentskills.io](https://agentskills.io) — Agent Skills spec (not a skill catalog)

cursor-kenji ships executable skills, MCP configs, commands, and subagents in one installable package — not static rules alone. What is actually listed vs submitted → **[docs/DISTRIBUTION.md](docs/DISTRIBUTION.md)**.

---

## More from KENSAURUS

| | App | What it is |
|---|---|---|
| <img src="https://kensaur.us/glot-it/icon-512.png" width="28" height="28" alt=""> | [Glot It](https://kensaur.us/glot-it/?utm_source=github&utm_medium=readme) | Learn Thai — bite-size lessons, smart flashcards, and an AI tutor |
| <img src="https://kensaur.us/yen-yen/icon.svg" width="28" height="28" alt=""> | [yen-yen](https://kensaur.us/yen-yen/?utm_source=github&utm_medium=readme) | Where did the money go? Now you'll know. A kakeibo for households |
| <img src="https://kensaur.us/the-wanting-mind/pwa-512x512.png" width="28" height="28" alt=""> | [The Wanting Mind](https://kensaur.us/the-wanting-mind/?utm_source=github&utm_medium=readme) | How the Battle Between Extraction and Generation Is Reshaping Our World — a 147,000-word interactive webbook with 268 concepts, 242 citations, and original illustrations |
| <img src="https://kensaur.us/help-her-take-photo/assets/apple-touch-icon.png" width="28" height="28" alt=""> | [Help Her Take Photo](https://kensaur.us/help-her-take-photo/?utm_source=github&utm_medium=readme) | Pair phones, direct the pose, nail the photo |
| <img src="https://talk.kensaur.us/pwa-192.png" width="28" height="28" alt=""> | [Cooler Heads](https://talk.kensaur.us/?utm_source=github&utm_medium=readme) | Practice hard conversations before you have them |
| <img src="https://solo-boss.kensaur.us/apple-touch-icon.png" width="28" height="28" alt=""> | [一人社長 Solo Boss](https://solo-boss.kensaur.us/?utm_source=github&utm_medium=readme) | Bookkeeping and tax-filing co-pilot for one-person companies in Japan |
| <img src="https://tsumagoi.kensaur.us/apple-touch-icon.png" width="28" height="28" alt=""> | [Tsumagoi Work&Camp 嬬恋牧場](https://tsumagoi.kensaur.us/?utm_source=github&utm_medium=readme) | Coworking camp at 1,444 m — [Instagram](https://www.instagram.com/tsumagoicamp/) · [Facebook](https://www.facebook.com/profile.php?id=61592113053042) · [Maps](https://maps.app.goo.gl/JCNnTfsdQVHCS1FA7) |
| <img src="https://kensaur.us/mushi-mushi/admin/favicon.svg" width="28" height="28" alt=""> | [mushi-mushi](https://github.com/kensaurus/mushi-mushi) | Open-source in-app bug reporting SDK |
| <img src="https://kensaur.us/favicon.svg" width="28" height="28" alt=""> | [KENSAURUS](https://kensaur.us/?view=portfolio&utm_source=github&utm_medium=readme) | Everything else built under the same roof |

All apps live under [kensaur.us](https://kensaur.us).

---

<p align="center">
  <strong>MIT License</strong> · Apache-2.0 portions noted in <a href="NOTICE">NOTICE</a><br/>
  <em><a href="https://github.com/kensaurus">@kensaurus</a> · <a href="CHANGELOG.md">Changelog</a> · <a href="https://github.com/kensaurus/cursor-kenji/discussions">Discussions</a></em>
</p>
