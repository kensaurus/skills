# Every skill, in plain English

_Generated from each skill's `SKILL.md` by `npm run gen:skill-index`. Do not edit by hand. **173 skills.**_

You do not memorize names. Describe the job in chat and the matching skill runs. Exact trigger phrases are in [CATALOG.md](CATALOG.md); the prefix and stage table is in [CATALOG.md — Skill Taxonomy](CATALOG.md#skill-taxonomy).

Skills marked `/name only` are user-invoked rituals; `reference only` skills are loaded by other skills; every other skill auto-routes from a plain request.

## Families

| Family | Count | In one sentence |
|:-------|------:|:----------------|
| [Audit — inspect; some then fix](#audit-inspect-some-then-fix-32) | **32** | Check the codebase: security, UX, analytics, IAP, the skill pack |
| [Plan — audit first, change only after you approve](#plan-audit-first-change-only-after-you-approve-23) | **23** | Write a fix plan you approve before any code changes |
| [Enhance — improve what already exists](#enhance-improve-what-already-exists-23) | **23** | Polish UI, forms, motion, SEO, PWA, email deliverability |
| [Design — build something new](#design-build-something-new-10) | **10** | Create new UI, APIs, emails, themes from scratch |
| [Backend — server & data patterns](#backend-server-data-patterns-5) | **5** | Auth, caching, queues, realtime, observability |
| [Mobile — React Native / Capacitor](#mobile-react-native-capacitor-5) | **5** | RN screens, emulators, Capacitor, App Store prep |
| [Data — charts & pipelines](#data-charts-pipelines-2) | **2** | Charts, dashboards, ETL / cron jobs |
| [Docs — write it down clearly](#docs-write-it-down-clearly-6) | **6** | READMEs, PRDs, RFCs with a reader-first voice |
| [Housekeeping — consolidate or clear one drifted register](#housekeeping-consolidate-or-clear-one-drifted-register-5) | **5** | Consolidate one drifted register (gates, backlog, design tokens, dead code) |
| [Workflows — multi-step recipes](#workflows-multi-step-recipes-22) | **22** | End-to-end recipes (build, fix, ship, green the repo) |
| [Test & QA — prove it works](#test-qa-prove-it-works-8) | **8** | Unit, Playwright, visual regression, load, red-team |
| [Deploy — ship & verify](#deploy-ship-verify-2) | **2** | npm release + post-deploy smoke tests |
| [Debug — find & fix what's broken](#debug-find-fix-whats-broken-3) | **3** | Errors, Sentry, frontend-backend mismatches |
| [Iterate — close the loop after launch](#iterate-close-the-loop-after-launch-3) | **3** | Post-launch feedback loops and agent-harness iteration |
| [Mushi Mushi — bug triage helpers](#mushi-mushi-bug-triage-helpers-2) | **2** | Integrate the Mushi Mushi bug-report pipeline |
| [Protocols — session guardrails](#protocols-session-guardrails-1) | **1** | Keep browser automation from freezing |
| [Authoring — build skills & MCP](#authoring-build-skills-mcp-2) | **2** | Author new skills or MCP servers |
| [Third-party (upstream-maintained)](#third-party-upstream-maintained-3) | **3** | Vendored upstream skills (Emil, UI/UX Pro Max, Vercel WIG) |
| [Core & cross-cutting](#core-cross-cutting-4) | **4** | Close everything, burndown, research, handoff |
| [Cursor IDE skills](#cursor-ide-skills-12) | **12** | Canvas, hooks, rules, PR splitter, CLI helpers |
| **Total** | **173** |  |

### Audit — inspect; some then fix (32)

| Skill | What it does |
|:------|:-------------|
| `audit-accessibility` | WCAG 2.2 AA audit via playwright-cli: axe-core, keyboard, contrast, target size, focus, ARIA |
| `audit-agent-speed` | Measure and fix a slow coding-agent setup: status line, hooks, instruction bloat, effort, worktree pile-up, antivirus and indexer scans |
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
| `audit-responsive` | Audit and fix layouts at every breakpoint; desktop is not a wide phone |
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
| `plan-capacitor-hardening` | Plan-only Capacitor native-layer security audit: WebView, token storage, deep links, OAuth, cleartext, exported activities |
| `plan-data-integrity` | Plan-only audit of destructive-operation and migration safety |
| `plan-dead-code` | Plan-only dead-code audit: Knip baseline for unused files, exports, and deps, plus duplication, debug residue, suppressions, orphan assets,… |
| `plan-dependency-provenance` | Plan-only audit of dependencies for hallucinated or slopsquatted packages, supply-chain risk, and license gaps |
| `plan-docs-sync` | Plan-only audit of documentation against actual code behavior |
| `plan-error-handling` | Plan-only audit of silent failures and observability gaps (Sentry, Langfuse) |
| `plan-gtm` | Plan-only GTM audit: monetization, positioning, activation funnel, SEO/AEO, distribution, and a founder interview |
| `plan-input-validation` | Plan-only trust-boundary audit for missing validation, injection, XSS, and forged requests across forms, APIs, and webhooks |
| `plan-llm-cost-guardrails` | Plan-only audit of an LLM app's runaway-cost and quota-abuse exposure |
| `plan-mobile-readiness` | Plan-only App Store / Google Play submission audit for Capacitor and RN: privacy, permissions, signing, target SDK |
| `plan-perf-audit` | Plan-only performance audit across web, mobile, backend, and data; measures first, fixes nothing |
| `plan-pricing` | Plan-only pricing audit: value metric, tiers, price points, free-tier boundary, annual and enterprise anchors, and a willingness-to-pay… |
| `plan-privacy-compliance` | Plan-only audit mapping real personal-data flows to the privacy policy, GDPR, Japan APPI, and store labels |
| `plan-rls-audit` | Plan-only audit of Supabase/Postgres Row-Level Security and access-control gaps |
| `plan-secrets-audit` | Plan-only scan of the working tree and git history for exposed or mis-scoped keys, then a rotate-vs-relocate plan |
| `plan-security-audit` | Plan-only OWASP Top 10 and Supabase-first hardening burndown |
| `plan-stub-checker` | Plan-only sweep for stubs, dead buttons, fake components, unwired handlers, and dead links, then a wiring plan |
| `plan-test-coverage` | Plan-only, user-story-driven test coverage audit |
| `plan-uiux-unification` | Plan-only UI/UX and design-system audit that emits a unification burndown; no code until a phase is approved |

### Enhance — improve what already exists (23)

| Skill | What it does |
|:------|:-------------|
| `enhance-agent-guardrails` | Install guardrails as code so AI sessions cannot reintroduce leaked secrets, injection, or untested code |
| `enhance-arch-boundaries` | Enforce architecture boundaries in CI with dependency-cruiser or eslint-boundaries: layer direction, feature isolation, forbidden imports |
| `enhance-capacitor-ui` | Separate desktop and mobile UI in hybrid apps shipped as PWA + iOS + Android (Capacitor, Tauri, Expo Web, Ionic) |
| `enhance-email-deliverability` | Audit and fix email deliverability: SPF, DKIM, DMARC, reputation, bounces and complaints, list hygiene, unsubscribe compliance |
| `enhance-growth-loops` | Add growth loops to a live product: a "powered by" badge, shareable artifacts, invites and referral credit, each with K-factor events |
| `enhance-lifecycle-email` | Lifecycle email from product events: activation nudges, trial expiry by activated vs stalled, limit-reached upgrades, win-back, with exits… |
| `enhance-mobile-native-feel` | Make an existing Expo/RN or Capacitor app feel native: system tabs, sheets, edge-to-edge, back, haptics, springs, lists |
| `enhance-motion` | Audit an existing web app's motion, then apply one coherent, reduced-motion-safe pass |
| `enhance-onboarding` | Activation pass: define the activation event, cut steps to first value, add templates, sample data, a short checklist, and signup →… |
| `enhance-pwa` | Add or upgrade PWA features: manifest, service worker, offline mode, install prompt, push, background sync |
| `enhance-readability` | Audit and fix how easily content is understood: line length (CPL), reading level, grouping, deadspace, icons or tables that cut verbosity |
| `enhance-readme` | Enhance an existing README: theme-aware hero, feature tour, screenshots or GIF, accurate badges, synced content |
| `enhance-skill-prompts` | Upgrade how an existing SKILL.md instructs, not what it does: freedom, a classification contract, one worked example, an evidence rubric,… |
| `enhance-ux-laws` | Measured fix pass on one screen or flow against seven Laws of UX: Fitts, Hick, Miller, Jakob, Zeigarnik, Goal-Gradient, Von Restorff |
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
| `mobile-capacitor-platform` | Capacitor native layer: system bars, keyboard, back, plugins, push, deep links, OTA, native CI |
| `mobile-emulator-start` | Boot the Android emulator and Metro (Expo or bare RN) in order: check terminals, kill stale ports, pick an AVD |
| `mobile-emulator-test` | QA a native Android or Expo dev-client build on the emulator: UI, Supabase, Sentry per CRUD step |
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

### Workflows — multi-step recipes (22)

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
| `workflow-mobile-native-uiux` | Full native UI/UX run on a Capacitor, Expo, or RN app: plumbing, native feel, a11y, device QA, PR |
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
