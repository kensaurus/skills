# Skill & Command Catalog

Skill and command index with trigger phrases.

Effort on Claude Code: each skill's `effort:` key sets how hard Opus 5.5 thinks — audit / plan / judge high, implementation medium, inventory / handoff low; Cursor ignores the key. See [MODEL-AND-EFFORT.md](MODEL-AND-EFFORT.md).

---

## Skill Taxonomy

Every skill carries a **family** (the prefix) and belongs to a **lifecycle stage** (when in a project you reach for it). New here? The [Getting Started guide](GETTING-STARTED.md) explains skills in plain language first.

| Prefix | Stage | Purpose |
|:-------|:------|:--------|
| `audit-` | Assess | Read-only assessment that produces a structured report |
| `plan-` | Assess | Audit + phased burndown you approve **before** any code changes |
| `enhance-` | Change | Improve existing web UI/UX, motion, forms, SEO, PWA, email deliverability |
| `design-` | Change | Create something new (UI, system, API, spec, art) |
| `backend-` | Change | Server / data-layer engineering patterns |
| `mobile-` | Change | Native / React Native / emulator / Capacitor |
| `data-` | Change | Data visualization & pipeline correctness |
| `docs-` | Change | Documentation authoring |
| `housekeep-` | Change | Apply-now consolidation of **one** drifted register (gates / backlog / design tokens / dead code) |
| `iterate-` | Operate | Close the loop after launch (post-launch feedback, agent-harness iteration) |
| `test-` | Prove | Write/run tests & QA |
| `deploy-` | Ship | Release & post-deploy verification |
| `debug-` | Operate | Diagnose & fix a specific failure |
| `workflow-` | Spans stages | Dev process (git, PR, release-prep, refactor, spec-TDD, housekeep) |
| `meta-` | Author | Authoring skills & MCP servers |
| `protocol-` | Guardrail | Session-level protocols used by other skills |
| `mushi-` | Operate | Mushi Mushi SDK integration and health checks |
| `thirdparty-` | Change | Upstream-maintained skills vendored as-is, each with `ATTRIBUTION.md` (see [THIRD-PARTY-SKILLS.md](THIRD-PARTY-SKILLS.md)) |

---

## Skills (161)

### Enhance

#### `enhance-readability`
**Triggers:** "hard to read", "too dense", "reading level", "cognitive load", "turn this prose into a table", "CPL", "CJK line length"
**What it does:** Information-design pass for *comprehension* — Cognitive Load Theory + Gestalt across six channels (text, separation, grouping, icons/graphics, deadspace, tone). Measures CPL (80 Latin / 40 CJK). Generates a visual only when it reduces load. Breakpoints stay on `audit-responsive`; looks-good stays on `enhance-web-ui`.
**Related:** `enhance-web-ui`, `audit-responsive`, `audit-accessibility`, `plan-antislop`, `audit-uiux-design-system`

#### `enhance-web-ui`
**Triggers:** "make this page nicer", "more polished", "more beautiful", "less crowded", "better laid out", "typography", "visual hierarchy", "empty/dead space", "fades", "microinteractions", "density"
**What it does:** Composition before decoration — fix hierarchy, grouping, alignment, rhythm. Subtract clutter, group related items, soften scroll cuts, animate purposefully. Generic across web stacks. Understanding / reading measure → `enhance-readability`.
**Related:** `enhance-web-ux`, `enhance-readability`, `audit-responsive`, `audit-uiux-design-system`, `design-frontend`

#### `enhance-web-ux`
**Triggers:** "enhance this page", "make /xxx better", "fix UX of /xxx", "improve information density", "icons all look the same", "buttons wrap to 2 lines", "empty columns"
**What it does:** Replaces generic / "stacked" UI with semantic data wired to real backend state. Maps every pain point to an NN/g heuristic, fixes at the helper / token level. Verified live at multiple viewports via playwright-cli.
**Related:** `enhance-web-ui`, `enhance-ux-laws`, `audit-responsive`, `audit-ux`, `audit-uiux-design-system`, `plan-antislop`

#### `enhance-ux-laws`
**Triggers:** "apply UX laws", "too many choices", "hard to tap", "users drop off mid-flow", "CTA doesn't stand out", "no progress indicator"
**What it does:** Measure-then-fix pass on one screen or flow against seven Laws of UX (Fitts, Hick, Miller, Jakob, Zeigarnik, Goal-Gradient, Von Restorff). A browser probe measures tap targets, competing accents, choice sets, unlabeled fields and progress cues at phone and desktop widths; an eight-check flow walk covers what the DOM cannot show (resume after reload, dead controls, pasted codes). Each law carries its precondition and what it does not say, so it will not cap menus at seven or apply Hick to a lookup list. Progress and resume cues must read real state; drafts never store card numbers or codes. Reports before → after per metric.
**Related:** `enhance-web-ux`, `audit-ux`, `audit-accessibility`, `enhance-web-forms`, `enhance-onboarding`, `enhance-web-conversion`, `audit-responsive`

#### `enhance-web-landing`
**Triggers:** "build a landing page", "portfolio", "marketing site", "anti-slop", "Awwwards-style", "premium frontend", "make it not look AI-generated", "taste"
**What it does:** Anti-slop frontend skill for landing pages, portfolios, and marketing sites. Tunes variance / motion / density dials. Hard em-dash ban, canonical motion skeletons, strict pre-flight check.
**Related:** `enhance-web-redesign`, `design-frontend`, `enhance-web-ui`

#### `enhance-web-redesign`
**Triggers:** "redesign this site", "upgrade UI to premium", "remove AI slop patterns", "redesign audit", "make this existing site feel premium"
**What it does:** Audit-first upgrade of an existing web project. Starts with a 60-second AI-tell triage, then scans codebase and applies targeted fixes — no rewrites.
**Related:** `enhance-web-landing`, `enhance-web-ui`, `audit-uiux-design-system`, `plan-antislop`, `design-frontend`

#### `enhance-web-web3d`
**Triggers:** "add 3D", "add a WebGL hero", "make it cinematic", "scroll-driven 3D", "three.js scene", "React Three Fiber", "GSAP scroll animation", "product configurator", "3D model viewer", "pinned scroll storytelling", "wow factor"
**What it does:** Audit-first elevation of an existing web app with 3D + cinematic motion (Three.js / R3F + GSAP ScrollTrigger + Motion). Ships with performance budget, mobile + no-WebGL fallbacks, reduced-motion support, SSR safety.
**Related:** `enhance-web-ui`, `enhance-motion`, `enhance-web-redesign`, `enhance-web-landing`, `audit-performance`

#### `enhance-capacitor-ui`
**Triggers:** "improved one surface and broke the other", "looks great on web but cramped on mobile", "ad-hoc useIsMobile branches", "Capacitor / Tauri / Expo Web cross-surface issues", "hover-only affordances on touch"
**What it does:** Cross-surface UIUX separation for hybrid PWA + iOS + Android. Establishes three orthogonal axes — form factor, platform, pointer capability — and a three-layer architecture (context hook, mode tokens, container-query primitives).
**Related:** `enhance-web-ui`, `enhance-web-ux`, `design-mobile-first`

#### `enhance-mobile-native-feel`
**Triggers:** "feels like a website", "not native", "HTML-like mobile app", "add haptics", "immersive full screen", "declutter the home screen", "long page on mobile"
**What it does:** One app-wide pass that makes an existing Expo / React Native or Capacitor app read as native on iOS 26+ and Android 16: system tab bar and sheets, edge-to-edge insets, Android back, virtualized lists (FlashList v2 / LegendList), one spring vocabulary on the UI thread, haptics by meaning, platform symbols, Dynamic Type, two accent roles. Scores ten native-feel checks plus reduced-motion, target-size, and back gates before and after; version-gated recipes for Expo SDK 54–58 and Capacitor 8 (shell plumbing from `mobile-capacitor-platform`). For the full run with accessibility, device QA, and a PR → `workflow-mobile-native-uiux`.
**Related:** `mobile-rn-screen`, `enhance-capacitor-ui`, `design-mobile-first`, `mobile-rn-performance`, `mobile-emulator-test`

#### `enhance-readme`
**Triggers:** "enhance README", "make README prettier", "add screenshots to README", "add hero image", "make README more fun", "add animated demo to README", "record a tour GIF"
**What it does:** Theme-aware hero + tour grid + optional autoplay GIF via playwright-cli. Captures live screenshots at 1600×1000 in dark and light mode with `<picture>` auto theme-swap.
**Related:** `docs-writer`, `plan-docs-sync`, `test-playwright`

#### `enhance-onboarding`
**Triggers:** "improve onboarding", "users sign up and leave", "time to value", "first-run experience", "activation rate", "empty state templates"
**What it does:** Apply-now first-session pass: defines the `activated` event as the first real outcome (not signup or tour end), walks landing → activation as a stranger and counts steps, cuts fields and screens before value (OAuth/magic link, inferred locale, try-before-signup), adds empty-state templates or sample data and a ≤5-item checklist that ends at activation, instruments `signup_started → signup_completed → activated → habit_reached` behind the app's consent gate. Judged against median B2B activation 37% and TTV over 24 h collapsing activation below 25%. Defers fields — deletes nothing.
**Related:** `plan-gtm`, `enhance-web-ux`, `audit-ui-states`, `enhance-web-forms`, `audit-analytics`, `enhance-web-conversion`, `design-email`, `test-playwright`

#### `enhance-growth-loops`
**Triggers:** "referral program", "viral loop", "powered by badge", "get users to invite", "growth loop", "share button that brings users"
**What it does:** Apply-now growth loops on an existing product, one or two at a time, each with its own K-factor: powered-by badge on free-plan output (0.5–3% conversion, near-total exposure; removable on paid), shareable artifact pages rendered logged-out with a one-tap "try it" into the ungated path, template galleries, invite flows inside the value moment, referral credit granted idempotently on the *referred user's activation* (SaaS referral rate ~4.75%, referred conversion ~7.9%). Value before signup on every landing side (2–5× referred conversion). Events `badge_*`, `share_*`, `invite_*`, `referral_*`, `loop_signup { loop }`. Anti-spam rules: user-initiated single-send invites with recipient opt-out, rate limits, per-referrer caps, no pre-checked "invite all".
**Related:** `plan-gtm`, `enhance-onboarding`, `enhance-web-conversion`, `backend-patterns`, `audit-analytics`, `enhance-web-seo`, `test-playwright`

#### `enhance-lifecycle-email`
**Triggers:** "onboarding emails", "trial expiry emails", "drip sequence", "win-back email", "lifecycle email", "activation nudge email", "dunning emails"
**What it does:** Apply-now lifecycle email driven by product events, with timers only as the fallback for silence. Sequence table: welcome, activation nudge (no `activated` within TTV × 3), setup stall, habit (day-3/7 keyed to what they built), trial expiry at −3d / −1d / 0 / +3d **split by activated vs stalled** (help, not a discount, for an empty account), limit-reached upgrade, win-back, dunning. Every email names its trigger and exit; sends keyed `(user, sequence, step)` so retries cannot double-send; transactional vs marketing classified per email with one-click unsubscribe and suppression list; quiet hours and a daily cap; events `email_sent … email_converted { goal_event }`. Behavior-triggered sends report roughly 3× the click-through of calendar drips (vendor-reported). Uses the ESP already in the repo. Templates → `design-email`; inbox placement → `enhance-email-deliverability`.
**Related:** `enhance-onboarding`, `design-email`, `enhance-email-deliverability`, `data-pipeline`, `plan-privacy-compliance`, `iterate-gtm-weekly`, `audit-analytics`

#### `enhance-web-conversion`
**Triggers:** "pricing page", "improve conversion", "free to paid", "upgrade prompts", "paywall UX", "hero copy", "call to action"
**What it does:** Apply-now message-offer-proof-prompt pass on landing, pricing, and in-app upgrade paths. Five-second hero check (who / what / why-not-the-alternative / one CTA whose verb matches the monetization model), ≤3-tier packaging with an anchor and annual toggle, explicit free-tier limits, proof ordered by strength (live numbers → named quotes → logos → real screenshots), upgrade prompts only at value moments, events `pricing_viewed / plan_selected / checkout_started / checkout_completed / upgrade_prompt_*`. Judged against 2026 free-to-paid benchmarks (freemium 3–5% good, card-required trial 25–35%). Dark patterns are removed, never added. Visual system stays on `enhance-web-landing`.
**Related:** `plan-gtm`, `enhance-web-landing`, `enhance-onboarding`, `audit-payment-system`, `audit-monetization-iap`, `plan-antislop`, `enhance-web-seo`

#### `enhance-web-instant-nav`
**Triggers:** "instant navigation", "prerender next page", "speculation rules", "early hints", "back button reloads", "second page is slow", "prefetch links"
**What it does:** Apply-now Speculation Rules (prefetch/prerender with a GET-side-effect safety contract), bfcache eligibility, cross-document View Transitions, 103 Early Hints. First-load CWV stays on `audit-performance`.
**Related:** `audit-performance`, `audit-bundle-size`, `audit-accessibility`, `enhance-pwa`

#### `enhance-web-seo`
**Triggers:** "improve SEO", "add meta tags", "fix search ranking", "add structured data", "sitemap", "canonical URLs", "Open Graph", "Google indexing", "rich results", "SEO audit", "why is my site not ranking"
**What it does:** Full SEO audit and fix for any web app. Checks meta tags, OG/Twitter Card, JSON-LD structured data, robots.txt, sitemap, canonical URLs, heading hierarchy, and image alt text. Records CWV field p75; hands LCP/INP/CLS root cause to `audit-performance`, JS weight to `audit-bundle-size`, instant nav to `enhance-web-instant-nav`.
**Related:** `audit-performance`, `audit-bundle-size`, `enhance-web-ui`, `plan-aso`

#### `enhance-email-deliverability`
**Triggers:** "emails go to spam", "set up SPF/DKIM/DMARC", "check email deliverability", "handle bounces", "why is my email in spam"
**What it does:** Audit-and-fix inbox placement — SPF/DKIM/DMARC + alignment, bounce/complaint suppression, list hygiene, one-click unsubscribe, US/JP legal footer. Applies DNS/config on approval. Templates stay on `design-email`.
**Related:** `design-email`, `plan-privacy-compliance`, `audit-analytics`, `backend-patterns`

#### `enhance-pwa`
**Triggers:** "make it a PWA", "offline support", "install prompt", "push notifications", "service worker", "add to home screen", "background sync", "app-like experience", "installable", "works offline"
**What it does:** Adds or upgrades PWA features: Web App Manifest, Workbox service worker with per-asset caching strategies (CacheFirst / NetworkFirst / StaleWhileRevalidate), install prompt, push notifications, offline page. Capacitor-compatible. Verifies installability and offline behavior in Chrome DevTools (Lighthouse 12 removed its PWA category).
**Related:** `enhance-capacitor-ui`, `mobile-capacitor-platform`, `audit-performance`

#### `enhance-motion`
**Triggers:** "motion pass", "animate the app", "add micro-interactions across the app", "enhance-motion"
**What it does:** Audits the existing design system + current motion, then applies coherent, reduced-motion-safe, 60fps motion using the right-sized 2026 stack — CSS/tw-animate-css for utility transitions, Auto-Animate for zero-config list/layout changes, Motion (motion.dev) for component transitions/gestures/presence, GSAP only for complex timelines. Defines a motion-token SSOT (durations/easings). Distinct from `design-motion` (from-scratch cookbook). Applies changes and verifies via playwright-cli.
**Related:** `design-motion`, `audit-uiux-design-system`, `audit-performance`, `audit-accessibility`, `housekeep-design`

#### `housekeep-design`
**Triggers:** "clean up the design system now", "migrate to one button", "resolve token conflicts", "housekeep-design"
**What it does:** Consolidates a design system that has drifted across many sessions/devs into one source of truth. Detects competing tokens, duplicate components, naming drift, mixed icon libraries, and arbitrary values; reconciles each conflict to a best-of-both canonical form; migrates all usages via mechanical codemod; and installs lint guardrails so drift can't recur. Establishes a 3-layer W3C token taxonomy. The execution arm of `plan-uiux-unification`; the design counterpart of `workflow-housekeep`.
**Related:** `plan-uiux-unification`, `audit-uiux-design-system`, `enhance-agent-guardrails`, `burndown-full`, `enhance-motion`, `design-system`, `housekeep-gates`

#### `housekeep-gates`
**Triggers:** "clean up our CI checks", "consolidate the workflows", "we have three lint jobs", "make one quality gate", "fix the required checks", "/housekeep-gates"
**What it does:** Apply-now execution arm of `audit-gate-logic`. Builds one aggregator job that `needs:` every real check and fails on failed **or skipped** dependencies, makes that job the only required status check, ports unique value from duplicate losers then **deletes** them (not disable), restores hook/CI parity, and normalizes ratchets to auto-tighten with reviewed resets. Proves consolidation with deliberate-violation + skip-path probes. Net enforcement strictly ≥ before. Branch-protection changes always get explicit confirmation.
**Related:** `audit-gate-logic`, `audit-cicd`, `enhance-agent-guardrails`, `workflow-green-repo`, `test-mutation`, `enhance-arch-boundaries`, `audit-doctrine`

#### `housekeep-dead-code`
**Triggers:** "delete the dead code", "remove unused files", "remove unused exports", "wire up Knip", "clean up dead code", "/deadcode"
**What it does:** Apply-now execution arm of `plan-dead-code`. Deletes per the approved keep/kill list one category per commit — files (`--fix-type files --allow-remove-files`, pre-reviewed list only, JSON-diffed before the fix) → exports/types → unused-locals cascade (piped `eslint … -f json | remove-unused-vars`, then re-run Knip) → dependencies → residue → assets → suppressions — with typecheck, tests, and build between each, and a bisect-the-batch rule on red. Then installs the ratchet: `knip` script, CI job pinned at `--max-issues <today>` (lowered only), wired into the one aggregator gate. Duplication is measured and ratcheted but handed to `workflow-refactor`. Names every way a count can drop without code leaving — `ignore*`, `--exclude`, `--no-exit-code`, a `rules: warn` downgrade — and refuses all of them, plus commenting-out, deleting a skipped test, and any `DROP` without a human-named target.
**Related:** `plan-dead-code`, `housekeep-gates`, `workflow-refactor`, `workflow-housekeep`, `burndown-full`, `db-migrator`, `plan-data-integrity`, `workflow-green-repo`

#### `housekeep-files`
**Triggers:** "organize my Downloads", "sort my company folders", "file my receipts", "tidy my Drive", "/housekeep-files"
**What it does:** Apply-now organizer for a drifted document tree (Downloads, a synced drive, receipts in three places). Offers a layout (root per owner / one root with owners inside / PARA-lite), writes a `plan.tsv`, then runs bundled PowerShell and bash twins through inventory (SHA-256 of every source) → dry run → apply → verify. Copies only when the destination is absent, hashes the copy, refuses to copy keys, credentials, media over the cap, or installers (cataloged in place instead), prefixes vague filenames as `{entity}_{area}_{date}_{doc-type}__{original}`, and writes a visible `_ai-catalog.jsonl` + `_SEARCH.md` at each owner root. `verify` re-checks every source path and size, re-hashes every copy, recounts untouched media folders, and exits non-zero on the first miss. No delete, move, or `robocopy /MIR` anywhere.
**Related:** `workflow-housekeep`, `housekeep-backlog`, `plan-secrets-audit`, `plan-data-integrity`

#### `housekeep-backlog`
**Triggers:** "what's left behind", "inventory TODOs", "consolidate the backlog", "parked work register", "living BACKLOG.md", "/housekeep-backlog"
**What it does:** Apply-now collector for parked work. Scans unfinished plan/burndown docs, deferred phases, TODO/FIXME/HACK markers, skipped tests, open audit findings, commented-out blocks, and unfinished feature flags; dedups so one real piece of work is one `BL-` row; writes a living `docs/BACKLOG.md` that regenerates and diffs (new / done / newly-stale). Inventories only — high-priority items hand off to `complete-everything` / `burndown-full`. The `docs-adr` pattern applied to parked work.
**Related:** `complete-everything`, `burndown-full`, `docs-adr`, `plan-stub-checker`, `workflow-feature-flag`, `workflow-housekeep`, `workflow-release-prep`, `enhance-agent-guardrails`, `audit-doctrine`

#### `enhance-web-forms`
**Triggers:** "improve this form", "form validation", "accessible form", "multi-step form", "form error handling", "the form UX is bad", "enhance-web-forms"
**What it does:** Builds/upgrades web forms to production quality: accessible structure (labels, fieldsets, autocomplete, input types), schema-driven validation with client↔server parity, screen-reader-associated inline errors, complete interaction states (loading/disabled/success/error/empty), multi-step flows, unsaved-changes guards, and optimistic submit feedback. Auto-detects the form + validation stack. Applies changes and verifies via playwright-cli.
**Related:** `audit-accessibility`, `audit-ux`, `audit-fe-api`, `backend-error-handling`, `design-motion`, `enhance-web-ux`

#### `enhance-agent-guardrails`
**Triggers:** "set up guardrails", "stop vibe-coding regressions", "add pre-commit security checks", "protect the repo from AI mistakes", "add CI security gates", "governance for AI code", "enhance-agent-guardrails"
**What it does:** Installs guardrails-as-code so AI/vibe-coding can't keep reintroducing the same problem classes (leaked secrets, injection, off-system styles, untested code, vulnerable deps, destructive ops). Audits existing protection, then sets up agent policy files (`.cursor/rules` + `AGENTS.md`), a pre-commit hook (secret scan + SAST + lint/typecheck), a CI gate that treats agent output as untrusted, and lint-as-policy rules. Verifies the guards actually block a planted bad pattern; flags merge-blocking CI changes for human review.
**Related:** `audit-gate-logic`, `housekeep-gates`, `test-mutation`, `docs-adr`, `audit-security`, `plan-security-audit`, `plan-secrets-audit`, `plan-dependency-provenance`, `plan-data-integrity`, `housekeep-design`

#### `enhance-arch-boundaries`
**Triggers:** "enforce module boundaries", "stop spaghetti imports", "agents keep importing across features", "add architecture rules", "dependency-cruiser", "/arch-boundaries"
**What it does:** Converts intended architecture into CI-enforced fitness functions (dependency-cruiser / eslint-boundaries): layer direction, feature isolation via public surfaces, no cycles, forbidden edges (client → server-only / service-role). Recovers the model from the repo and confirms it — does not invent one. Grandfathers existing violations into a shrink-only baseline. Wires into the `housekeep-gates` aggregator. Records the model via `docs-adr`. `audit-backend-architecture` advises; this enforces.
**Related:** `audit-backend-architecture`, `housekeep-gates`, `docs-adr`, `enhance-agent-guardrails`, `plan-rls-audit`, `plan-secrets-audit`, `audit-doctrine`

#### `enhance-skill-prompts`
**Triggers:** "enhance this skill's prompts", "upgrade skill authoring", "apply the prompt playbook", "degrees of freedom", "worked example", T1–T8
**What it does:** Upgrades *how* an existing SKILL.md instructs (degrees of freedom, a classification contract, one worked example, an evidence rubric, term consistency, effort declaration, normal-volume phrasing) without changing *what* the skill does. Routing stays put; the only frontmatter change is an `effort:` key. New skill from scratch → `meta-skill-creator`. Playbook: [PROMPT-ENHANCEMENT-PLAYBOOK.md](PROMPT-ENHANCEMENT-PLAYBOOK.md).
**Related:** `meta-skill-creator`, `audit-skill-conflicts`

---

### Design

#### `design-frontend`
**Triggers:** "build this UI", "design this page", "new dashboard layout"
**What it does:** New production-grade UI from scratch. Polish existing → `enhance-web-ui`. Landing → `enhance-web-landing`. Redesign existing → `enhance-web-redesign`.
**Related:** `design-system`, `design-motion`, `design-theme`, `enhance-web-ui`, `enhance-web-landing`, `enhance-web-redesign`

#### `design-system`
**Triggers:** "create a design system", "component library from scratch"
**What it does:** Build a new design system (tokens, variants, theming). Drifted existing system → `housekeep-design`. Plan-only unification → `plan-uiux-unification`.
**Related:** `design-frontend`, `audit-uiux-design-system`, `housekeep-design`, `plan-uiux-unification`

#### `design-api`
**Triggers:** "API", "endpoint", "REST", "GraphQL", "route handler", "request/response", "HTTP methods"
**What it does:** RESTful resource design, request/response schemas, HTTP status codes, pagination (offset/cursor), filtering/sorting, versioning, authentication patterns, Server Actions vs Route Handlers decision matrix.
**Related:** `backend-patterns`, `backend-error-handling`

#### `design-prd`
**Triggers:** "PRD", "product requirements", "write a spec", "new feature spec", "feature requirements", "scope a feature"
**What it does:** Generate PRDs via structured conversation. Auto-detects tech stack, features, data model. Uses Firecrawl for competitive research, Context7 for feasibility, Supabase MCP for data model verification.
**Related:** `docs-coauthor`, `workflow-spec-tdd`

#### `workflow-grilling` *(adapted from mattpocock/skills, MIT)*
**Triggers:** "grill me", "stress-test this plan", "interview me about this", "poke holes in this", "challenge my thinking"
**What it does:** Relentless one-question-at-a-time interview until shared understanding is reached. Recommends an answer with each question, looks up facts itself, puts every decision to the user, and writes no code until confirmed. Ends with a compact decision log to feed `design-prd` or `/plan-mode`.
**Related:** `docs-domain-modeling`, `design-prd`, `workflow-spec-tdd`

#### `docs-domain-modeling` *(adapted from mattpocock/skills, MIT)*
**Triggers:** "pin down terminology", "ubiquitous language", "glossary", "the agent uses the wrong words"
**What it does:** Actively build and sharpen the project's domain model: a `CONTEXT.md` glossary and ubiquitous language. Challenges conflicting terms, sharpens fuzzy language, stress-tests boundaries with concrete scenarios, and cross-references claims against the code. Repo decision-memory system → `docs-adr`.
**Related:** `workflow-grilling`, `design-prd`, `docs-coauthor`, `docs-adr`

#### `plan-uiux-unification`
**Triggers:** "UI/UX unification plan", "design system audit plan", "UI burndown", "unify the design system", "plan UI overhaul", "design system consolidation", "IA audit before redesign", "audit UI without fixing", "UI/UX unification"
**What it does:** Exhaustive, non-destructive UI/UX + design-system audit that produces a burndown and unification plan — **no code changes in this pass**. IA-first (hierarchy before layout), preservation contract, full surface inventory, violation log, prioritized burndown with risk column, phased roadmap, guardrails. Enhances existing DS; does not replace it. Optional playwright-cli for evidence; Firecrawl for current-year best practices.
**Related:** `audit-responsive`, `audit-uiux-design-system`, `audit-ux`, `enhance-web-ux`, `enhance-web-ui`, `design-system`

#### `plan-antislop`
**Triggers:** "looks like AI slop", "reads like ChatGPT", "authenticity burndown", "de-slop", "generic/templated/soulless", "voice pass"
**What it does:** Audit-and-plan for machine-generated tells across four surfaces — prose (cadence, filler vocab, hedge-and-pad), visual/UI (default palette, card-grid monotony, centered-everything), code (placeholder residue, comment slop, over-abstraction), structure/IA (listicle-brain, symmetrical scaffolding, README slop). Scores findings by recognizability × effort; emits `plan-antislop.md` phased burndown — **no rewrites until each phase is approved**. Recommends directions, never ghost-written replacements.
**Related:** `enhance-web-ux`, `enhance-web-ui`, `enhance-web-landing`, `design-frontend`, `audit-i18n`, `docs-writer`, `plan-uiux-unification`

#### `plan-rls-audit`
**Triggers:** "RLS", "row level security", "is my Supabase secure", "anyone can read my data", "check my database policies", "lock down my tables", "service_role key", "Supabase security advisor"
**What it does:** Table-by-table Supabase/Postgres RLS audit — relrowsecurity, permissive/inverted policies (CVE-2025-48757 class), service_role client-side, auth.uid() perf. Produces access matrix + `plan-rls-audit.md` — **no SQL until approved**.
**Related:** `plan-secrets-audit`, `plan-security-audit`, `audit-db-schema`, `db-migrator`, `audit-auth-flows`

#### `plan-error-handling`
**Triggers:** "errors aren't showing in Sentry", "fail silently", "empty catch blocks", "observability", "check my Langfuse", "LLM tracing"
**What it does:** Audits silent failures across Sentry (swallowed catches, PII in events, coverage holes) and Langfuse (untraced calls, missing evals, prompt versioning). Emits `plan-error-handling.md` — **no code until approved**.
**Related:** `backend-observability`, `audit-langfuse-llm`, `debug-sentry-monitor`, `plan-test-coverage`, `backend-error-handling`

#### `plan-input-validation`
**Triggers:** "validate my inputs", "XSS", "dangerouslySetInnerHTML", "Stripe webhook", "forge requests", "injection-safe", "sanitize user content"
**What it does:** Trust-boundary audit — forms/API (Zod gaps, mass assignment), rendered content (XSS), webhooks (CVE-2026-41432, raw-body, idempotency), uploads. Emits `plan-input-validation.md` — **no hardening until approved**.
**Related:** `plan-rls-audit`, `plan-secrets-audit`, `plan-security-audit`, `audit-fe-api`

#### `plan-secrets-audit`
**Triggers:** "hardcoded secrets", "did I commit a key", "secret scan", "rotate keys", "are my API keys exposed", "is my .env safe"
**What it does:** Credential scan + **rotate vs relocate** judgment (git-history permanence trap). Classifies anon vs service_role, NEXT_PUBLIC_ leaks, Vercel/AWS env. Emits `plan-secrets-audit.md` — **no rotation until approved**.
**Related:** `plan-rls-audit`, `create-hook`, `audit-security`

#### `plan-data-integrity`
**Triggers:** "is my migration safe", "could I lose data", "agent might delete prod", "destructive operations", "safe schema changes"
**What it does:** Destructive-op and migration safety audit — unguarded DELETE/DROP, backfill-before-drop, backup blast radius (same-volume wipe), overprivileged agent/CI tokens, confirmation gates. Emits `plan-data-integrity.md` — **no migrations/tokens until approved**. Restore drills / RPO/RTO → `plan-backup-dr`. Source-code transforms → `audit-codemod-safety`.
**Related:** `plan-backup-dr`, `plan-secrets-audit`, `plan-rls-audit`, `audit-db-schema`, `db-migrator`, `audit-codemod-safety`

#### `plan-dead-code`
**Triggers:** "find dead code", "is this code used", "unused exports", "unused files", "unused dependencies", "run knip", "audit dead code", "/deadcode-plan"
**What it does:** Configuration-first dead-code audit. Authors `knip.json` and resolves every configuration hint **before** trusting a single finding — on a first vibe-coded run most findings are misconfiguration, not dead code — then baselines both `--production` and default runs, reading files → unresolved → exports → deps because unused files cascade. Builds a keep-working list for glob-imported routes, generated types, Deno Edge Functions and deliberate `@public` API, then counts the seven surfaces Knip cannot see: unused locals, jscpd duplication, debug residue (`console.*`, `.only`), suppression debt, orphan assets, env drift, dead schema. Emits `plan-dead-code.md` — baseline, keep/kill list with evidence, phases, ratchet — and **deletes nothing**.
**Related:** `housekeep-dead-code`, `plan-stub-checker`, `plan-antislop`, `plan-dependency-provenance`, `audit-code-quality`, `enhance-arch-boundaries`, `plan-test-coverage`, `audit-db-schema`

#### `plan-dependency-provenance`
**Triggers:** "check my dependencies", "slopsquatting", "is this package real", "supply chain audit", "license check", "SBOM", "did the AI hallucinate a package"
**What it does:** Supply-chain audit — existence/slopsquatting (CSA 2026 ~20% hallucinated deps), lockfile integrity, license/provenance, transitive bloat. Provenance table + `plan-dependency-provenance.md` — **never install suspect packages to verify**.
**Related:** `plan-secrets-audit`, `create-hook`, `workflow-housekeep`, `/update-deps`

#### `plan-llm-cost-guardrails`
**Triggers:** "cap my AI costs", "LLM bill could blow up", "token budget", "runaway agent loop", "per-user AI limits", "drain my API quota"
**What it does:** 3-layer guardrail audit — token-bucket limits, cost-velocity circuit breakers, fallback chain (cheaper model → cache → 503). Complements Langfuse observability. Emits `plan-llm-cost-guardrails.md`.
**Related:** `audit-langfuse-llm`, `audit-llm-security`, `audit-infra-cost`, `plan-input-validation`, `backend-patterns`

#### `plan-aeo-readiness`
**Triggers:** "AEO", "GEO", "do AI engines cite me", "llms.txt", "blocking AI crawlers", "ChatGPT/Perplexity visibility"
**What it does:** Answer-engine citation audit — crawler access (Cloudflare AI-bot defaults), SSR/extractability, schema, Princeton GEO levers (quotes +41%, stats +30%). Google/AI overlap <20%. Emits `plan-aeo-readiness.md`.
**Related:** `enhance-web-seo`, `docs-writer`, `plan-antislop`

#### `plan-mobile-readiness`
**Triggers:** "App Store ready", "Google Play reject", "privacy manifest", "data safety form", "pre-submission", "Guideline 2.5.2"
**What it does:** Store submission audit — privacy manifests, Data Safety ↔ permissions, IAP via billing, demo account, 2.5.2 thin-app risk, Android closed-test gate. Emits `plan-mobile-readiness.md`.
**Related:** `mobile-capacitor-platform`, `enhance-capacitor-ui`, `plan-stub-checker`, `plan-capacitor-hardening`, `plan-privacy-compliance`, `plan-aso`, `audit-monetization-iap`

#### `plan-privacy-compliance`
**Triggers:** "privacy compliance", "what data do we collect", "App Store privacy labels", "GDPR", "APPI", "consent gating"
**What it does:** Maps real personal-data flows vs the written policy and store labels (GDPR / Japan APPI). Consent timing, deletion/export, retention, SDK leakage. **Plan only.** Consent-gated analytics firing is shared with `audit-analytics` — run both.
**Related:** `audit-analytics`, `plan-mobile-readiness`, `plan-rls-audit`, `plan-error-handling`, `enhance-email-deliverability`

#### `plan-backup-dr`
**Triggers:** "can we recover if the DB dies", "audit our backups", "what's our RPO/RTO", "disaster recovery"
**What it does:** Proves restore capability — PITR, drill evidence, storage/secrets recovery, SPOF. **Plan only.** Preventing wipe stays on `plan-data-integrity`.
**Related:** `plan-data-integrity`, `audit-env-parity`, `audit-infra-cost`, `plan-secrets-audit`

#### `plan-aso`
**Triggers:** "optimize our app store listing", "improve app downloads", "ASO", "app store keywords"
**What it does:** App Store / Play listing audit — keywords, locales, screenshots, ratings prompts — then a prioritized find/install plan. **Plan only.** Submission mechanics → `plan-mobile-readiness`.
**Related:** `plan-mobile-readiness`, `plan-privacy-compliance`, `audit-monetization-iap`, `enhance-web-seo`, `design-frontend`

#### `plan-gtm`
**Triggers:** "GTM", "go-to-market plan", "get more users", "grow traffic", "should this be freemium", "how do I market this repo", "/gtm-plan"
**What it does:** Plan-only go-to-market audit of a shipped repo. Step A greps how the product is sold today — billing SDKs and `isPro` gates, license family, README/hero/meta positioning, auth providers and steps to first value, analytics SDK and consent, robots/sitemap/llms.txt, registry and directory presence, trust signals, real numbers or **unmeasured**. Step B interviews the founder with `workflow-grilling` rules (one question, a recommended answer, facts never asked) down a fixed ladder: 90-day metric → ICP → current numbers → monetization intent → budget → market → alternatives → constraints. Step C diagnoses in Dunford order (alternatives → attributes → value → customers → category), judges the monetization model against 2026 free-to-paid benchmarks (freemium 3–5% good / 8–12% great; card-required trial 25–35%; OSS cloud carries 48–73% of vendor revenue), defines `activated` and one north-star, picks ≤2 channels + 1 loop with caveats (Show HN 5–30k visits on a hit; Product Hunt 1–2% B2B signup). Emits `plan-gtm.md` with a decision log, positioning statement, funnel table, and a five-phase burndown mapped to execution skills. **Changes nothing.**
**Related:** `workflow-gtm`, `enhance-web-conversion`, `enhance-onboarding`, `docs-launch-kit`, `enhance-web-seo`, `plan-aeo-readiness`, `audit-analytics`, `plan-aso`, `enhance-readme`, `iterate-post-launch`, `workflow-grilling`

#### `plan-pricing`
**Triggers:** "pricing strategy", "what should I charge", "value metric", "seat vs usage", "are we underpriced", "pricing tiers", "/pricing-plan"
**What it does:** Plan-only pricing and packaging audit. Inventories plans, gates, metering, price points, trial logic, per-action cost, and owned willingness-to-pay evidence (upgrade/downgrade events, "too expensive" in support). Scores candidate value metrics 1–5 on value connection, fairness, predictability, scalability, billability and simulates them on real historical accounts; picks one primary metric ("our customer receives more value when ___ increases") and adds a usage component only where a variable cost is uncovered. Designs ≤3 good-better-best tiers from the outside in with a recommended middle, right-hand anchor, enterprise "from" price, free boundary just before the activation event's repeat, annual stated as months free. Price corridor via Van Westendorp → Gabor-Granger → MaxDiff → conjoint, in that order. Emits `plan-pricing.md` with a grandfathering row. **No prices, plan enums, Stripe objects, or copy change.**
**Related:** `plan-gtm`, `enhance-web-conversion`, `audit-payment-system`, `audit-monetization-iap`, `plan-llm-cost-guardrails`, `audit-analytics`, `docs-coauthor`

#### `plan-capacitor-hardening`
**Triggers:** "Capacitor app secure", "harden hybrid app", "WebView security", "secure storage tokens", "deep link OAuth", "cleartext traffic", "allowNavigation", "exported activity", "OTA update safe"
**What it does:** Capacitor four-pillar native audit (Data, Auth/Deep-Link, Network, WebView) + OTA store-policy — Keychain vs localStorage, PKCE, App/Universal Links, dev config in prod. Invisible to web-only review. Emits `plan-capacitor-hardening.md`.
**Related:** `plan-secrets-audit`, `plan-input-validation`, `plan-mobile-readiness`, `mobile-capacitor-platform`

#### `plan-stub-checker`
**Triggers:** "find dead buttons", "stub checker", "fake components", "unwired handlers", "dead links", "orphaned components", "plan stub wiring", "what's not connected", "mock data in prod", "buttons that do nothing", "stub audit"
**What it does:** Exhaustive audit for stubs, dead buttons, fake/placeholder components, unwired handlers, dead links, orphans, and severed integrations. Traces intended backend, Supabase, Sentry, and pipeline targets; conservative false-positive filtering. Burndown + phased wiring plan — **no implementation until user approves**. Optional Playwright, Sentry, and Supabase MCP.
**Related:** `debug-fe-be-integration`, `audit-fe-api`, `test-qa`, `debug-sentry-monitor`, `workflow-fix-and-ship`

#### `plan-perf-audit`
**Triggers:** "performance audit plan", "perf burndown", "measure before optimize", "bundle size audit plan", "LCP slow plan", "N+1 audit plan", "plan performance improvements", "Core Web Vitals audit"
**What it does:** Measure-don't-guess performance audit across web, mobile, backend, and data. Burndown + optimization plan — **no fixes in this pass**. No fabricated metrics; baselines or `[NEEDS PROFILING]`. Research-backed proposals: React code-split/memo/virtualization, RN Hermes/JSI/cold start, EXPLAIN-verified indexes, Lighthouse CI budgets + RUM. Mobile thresholds stricter than web CWV.
**Related:** `audit-performance`, `audit-bundle-size`, `backend-db-performance`, `mobile-rn-performance`

#### `plan-security-audit`
**Triggers:** "security audit plan", "OWASP audit plan", "hardening plan", "plan security fixes", "security burndown"
**What it does:** OWASP Top 10 + Supabase-first hardening burndown. Plan only — no patches, no destructive testing. App-layer auth flows → `audit-auth-flows`. Table RLS → `plan-rls-audit`. Key rotation → `plan-secrets-audit`. App LLM attacks → `audit-llm-security`.
**Related:** `audit-security`, `audit-auth-flows`, `plan-rls-audit`, `plan-secrets-audit`, `test-red-team`

#### `plan-docs-sync`
**Triggers:** "docs drift", "sync docs with code", "audit documentation", "stale README", "onboarding docs broken", "doc sync plan", "phantom docs", "docs out of date"
**What it does:** Audit docs vs actual code behavior. Drift taxonomy (stale/missing/phantom/contradictory/onboarding-breaking/inline-rot/API-contract). Code-as-source-of-truth; onboarding-drift check vs `.env.example` + CLI `--help`. Docs-as-code guardrails. **Plan only — no rewrites until approved.** Never aspirational or invented behavior.
**Related:** `docs-writer`, `workflow-housekeep`, `plan-stub-checker`, `docs-adr`

#### `plan-test-coverage`
**Triggers:** "test coverage plan", "coverage audit", "traceability matrix", "fake-green tests", "uncovered user stories", "plan tests for critical flows", "what's not tested"
**What it does:** User-story-driven coverage audit from real code — traceability matrix, multi-lens coverage (branch/path/risk/integration), fake-green detection. **Plan only — no test writing until approved.** Mutation harness / assertion theater → `test-mutation`.
**Related:** `test-unit`, `test-mutation`, `workflow-spec-tdd`, `test-playwright`, `plan-stub-checker`

#### `design-motion`
**Triggers:** "add one animation", "hover effect on this button", "page transition on this screen", "isolated micro-interaction". Existing-app pass → `enhance-motion`.
**What it does:** Framer Motion, CSS animations, GSAP. Covers entrance/exit, staggered lists, scroll-triggered effects, layout animations. Includes delight patterns (bouncy buttons, magnetic elements, confetti, Konami code). Always respects `prefers-reduced-motion`.
**Related:** `design-frontend`, `enhance-web-web3d`

#### `design-mobile-first`
**Triggers:** "mobile", "touch", "PWA", "mobile-first", "small screen", "tablet", "swipe", "gesture", "safe area"
**What it does:** Touch-optimized navigation, bottom sheets, swipe-to-delete, pull-to-refresh, responsive tables/grids, 44px touch targets, safe area handling, PWA install prompts. Linearized desktop / responsive audit → `audit-responsive`.
**Related:** `audit-responsive`, `design-frontend`, `audit-performance`

#### `design-theme`
**Triggers:** "apply theme", "color palette", "brand colors", "styling slides", "presentation design", "visual identity"
**What it does:** Pre-set visual themes with curated colors and fonts. Apply cohesive styling across artifacts.
**Related:** `design-system`, `design-frontend`

#### `design-email`
**Triggers:** "build an email template", "transactional email", "welcome email", "password reset email", "email design", "React Email", "MJML", "dark mode email", "email copy review"
**What it does:** Full-stack transactional and marketing email templates. Detects React Email / MJML / plain HTML and Resend / SendGrid / Postmark / SES. Builds mobile-first templates (600px, inline styles, dark mode), reviews copy, wires Edge Function triggers. Inbox placement / SPF DKIM DMARC → `enhance-email-deliverability`.
**Related:** `enhance-email-deliverability`, `design-frontend`, `backend-patterns`, `workflow-feature-flag`

#### `design-generative-art` *(Apache-2.0, adapted from Anthropic)*
**Triggers:** "generative art", "procedural art", "flow fields", "particle systems", "creative coding", "noise patterns", "mathematical visualizations", "art from code", "generate visuals", "interactive animation"
**What it does:** Seeded randomness, flow fields, recursive subdivision, circle packing, L-systems, animation loops. React component pattern with controllable parameters and PNG/SVG export.
**Related:** `data-visualization`, `design-frontend`, `enhance-web-web3d`, `design-motion`

#### `design-canvas` *(Apache-2.0, adapted from Anthropic)*
**Triggers:** "poster", "visual design", "infographic", "certificate", "badge", "banner", "social media graphic", "print design", "create artwork", "design graphic"
**What it does:** Museum-quality visual design through named design philosophies ("Brutalist Joy", "Chromatic Silence"). Creates .md philosophy files and .pdf/.png visual artifacts.
**Related:** `design-frontend`, `design-theme`

---

### Backend

#### `backend-patterns`
**Triggers:** "queue jobs", "caching layer", "rate limiting", "server actions", "edge function"
**What it does:** Apply queues, caching, rate limits, serverless/edge. Architecture decision / over-engineering → `audit-backend-architecture`.
**Related:** `design-api`, `backend-db-performance`, `backend-error-handling`, `audit-backend-architecture`

#### `backend-db-performance`
**Triggers:** "slow query", "database performance", "add an index", "N+1", "query optimization"
**What it does:** N+1 query detection and fixes, index strategy (single, composite, partial, GIN), EXPLAIN ANALYZE interpretation, Prisma/Supabase query patterns, pagination (offset vs cursor), batch operations, RLS performance.
**Related:** `backend-patterns`, `audit-db-schema`, `audit-performance`, `plan-rls-audit`

#### `backend-realtime`
**Triggers:** "real-time", "live updates", "WebSocket", "notifications", "chat", "collaborative", "presence", "live data", "instant sync"
**What it does:** Supabase Realtime subscriptions, Server-Sent Events, WebSocket patterns, presence tracking, live data synchronization.
**Related:** `backend-patterns`, `data-visualization`

#### `backend-error-handling`
**Triggers:** "error boundary", "try/catch", "error state", "toast notification", "form validation error", "API error handling"
**What it does:** Standard error types, Server Action error patterns, form error display (React 19 `useActionState`), error boundaries, API route error handling, TanStack Query error handling, monitoring/logging.
**Related:** `design-api`, `backend-patterns`, `plan-error-handling`, `debug-sentry-monitor`

#### `backend-observability`
**Triggers:** "add logging", "instrument this", "why can't I debug prod", "no observability", "correlate the error to the trace", "redact PII from logs", "set up alerts/SLOs", wiring Sentry / Langfuse / structured logs
**What it does:** Build-time observability — shared request/trace ID across every log line, Sentry scope, and Langfuse trace. Structured logging, PII redaction, OTel-conventional span design, LLM trace capture, symptom-based alerts/SLOs. Vendor-neutral.
**Related:** `debug-sentry-monitor`, `plan-error-handling`, `audit-langfuse-llm`, `debug-error`

#### `data-pipeline`
**Triggers:** "build an ingestion pipeline", "sync X into Y", "nightly aggregation", "process this queue", "backfill", "this cron double-counts", "dedupe", "the numbers are wrong after a retry"
**What it does:** Build-time correctness for ETL / ingestion / edge-function workers / cron / queue consumers. Bakes in idempotency, atomicity, data contracts, delivery semantics, observability, and a 4-layer staging architecture.
**Related:** `audit-db-schema`, `backend-observability`, `workflow-spec-tdd`

#### `data-visualization`
**Triggers:** "chart", "graph", "visualization", "dashboard", "analytics", "D3", "Recharts", "data display", "metrics", "statistics"
**What it does:** Recharts (line, bar, area, pie/donut), sparklines, stat cards with trends, real-time chart updates, D3.js custom visualizations. Includes accessibility patterns for charts.
**Related:** `design-frontend`, `design-system`, `audit-analytics`

---

### Audit

#### `audit-code-quality`
**Triggers:** "code smell", "anti-pattern", "technical debt", "inconsistent", "standardize", "conventions", "cleanup codebase", "why different patterns", "cleanup", "why is this slow/broken"
**What it does:** Two-in-one: (1) detect and fix React/TypeScript/state anti-patterns that cause bugs and performance issues; (2) audit codebase for naming, organisation, and pattern consistency. Produces a structured coherency report.
**Related:** `workflow-refactor`, `audit-code-review`

#### `audit-code-review`
**Triggers:** "code review", "review this PR", "review this code", "review changes"
**What it does:** Thorough code review — correctness, security, performance, a11y, maintainability. Uses Sentry MCP for production error context, Firecrawl for current best practices. Bulk mechanical-transform semantics → `audit-codemod-safety`.
**Related:** `audit-code-quality`, `workflow-pr`, `workflow-release-prep`, `audit-codemod-safety`

#### `audit-cicd`
**Triggers:** "CI/CD cost", "GitHub Actions bill", "Actions minutes", "runner cost", "workflow cost", "CI is expensive", "slow CI", "audit my workflows", "artifact/cache storage", "reduce Actions spend"
**What it does:** Audits GitHub Actions workflows for cost, speed, and safety via the `gh` CLI (live billing, run volume, runner types, artifact/cache storage). Flags double-billing triggers, missing concurrency, macOS/large runners on push, missing path filters, doomed jobs, and long artifact retention — then proposes fixes (concurrency, dispatch-gated runners, retention limits, caching, storage cleanup) that never delete tests or break deploys. Includes account-level backstops (retention default, spending budget). Gate *logic* (bypass, ratchet gaming, required-but-not) → `audit-gate-logic`.
**Related:** `audit-gate-logic`, `audit-security`, `deploy-verify`, `workflow-pr`, `create-hook`, `audit-infra-cost`

#### `audit-gate-logic`
**Triggers:** "can our CI gates be bypassed", "audit the quality-gate logic", "is our coverage ratchet sound", "why did a regression pass CI", "check for conflicting workflows", "is this required check actually required", "/gate-logic"
**What it does:** Read-only audit of the *logic* of CI/CD gates and ratchets — not pipeline cost/speed. Catches silent bypass (`continue-on-error`, `|| true`, skipped-required counting as passed), path filters that skip the files that needed the gate, two workflows whose conditions both fire or both skip, `pull_request_target` / fork bypass, and ratchet traps (same-PR baseline overwrite, exclusion gaming, slack threshold, backwards comparison). Phase 2.5 maps accreted duplicate gates / competing baselines / hook-vs-CI divergence / dead workflows and names a winner per cluster. Phase 3 looks for regressions that already shipped green. Highest-value required-vs-actual checks need branch-protection / rulesets; if those are invisible, it says so and audits the YAML alone. Consolidation → `housekeep-gates`.
**Related:** `housekeep-gates`, `audit-cicd`, `workflow-quality-gate`, `enhance-agent-guardrails`, `burndown-full`, `workflow-green-repo`, `audit-codemod-safety`, `test-mutation`, `audit-doctrine`

#### `audit-doctrine`
**Triggers:** "is this lint rule wrong", "the ratchet banned a legitimate pattern", "audit our guardrail doctrine", "appease the regex", "does this rule match Stripe/Docusaurus", "/doctrine"
**What it does:** Read-only audit of custom lint/ratchet *content* — not whether the gate can be bypassed. Judges each axis against the governance contract: named remedy, reachable sanctioned token, teaching failure output, agreement with Tier-D practice (Stripe / Linear / GitHub / Docusaurus; burden of proof on the rule), exceptions expire and baselines only shrink. Classifies correctness vs taste; taste rules need a remedy and token or they generate restyle-to-appease-the-regex. Remedy-coverage stated as N of M; un-remedied axes → `housekeep-backlog`. Enforcement/bypass stays on `audit-gate-logic`.
**Related:** `audit-gate-logic`, `housekeep-gates`, `housekeep-design`, `housekeep-backlog`, `docs-adr`, `enhance-arch-boundaries`

#### `audit-codemod-safety`
**Triggers:** "did this codemod break anything", "audit this bulk refactor", "verify the migration mod", "check the mass find-replace", "jscodeshift / ts-morph / ast-grep audit", "/codemod-safety"
**What it does:** Read-only audit of a mechanical source transform for behavior-preservation. "Compiles and lints" is not "behaves the same." Hunts semantic traps (`||`→`??`, missing parens, async error-drop, import-default swaps), regex hits inside strings/comments, formatting bundled with logic, surviving old-pattern instances, inconsistent application, and orphans. If size defeated review and syntax defeated linters, also a finding for `audit-gate-logic`.
**Related:** `audit-code-review`, `plan-data-integrity`, `plan-test-coverage`, `test-visual-regression`, `audit-gate-logic`, `burndown-full`

#### `audit-performance`
**Triggers:** "slow page", "LCP/INP/CLS", "optimize performance", "Web Vitals", "lighthouse score", "fetchpriority", "bfcache"
**What it does:** Audit-and-fix runtime performance (Core Web Vitals, loading priority, long tasks). JS payload → `audit-bundle-size`. Instant navigations (implement) → `enhance-web-instant-nav`. Concurrent breaking point → `test-load`. Timeouts/retries → `audit-resilience`.
**Related:** `audit-bundle-size`, `enhance-web-instant-nav`, `test-load`, `audit-resilience`, `backend-db-performance`

#### `audit-security`
**Triggers:** "review security", "check vulnerabilities", "OWASP", "security headers"
**What it does:** Static OWASP review of app code (injection, headers, deps). May fix inline. Session / route×gate / getSession → `audit-auth-flows`. Plan-only burndown → `plan-security-audit`. Table RLS → `plan-rls-audit`. Key rotation → `plan-secrets-audit`. LLM attacks → `audit-llm-security`.
**Related:** `audit-auth-flows`, `plan-security-audit`, `plan-rls-audit`, `plan-secrets-audit`, `audit-llm-security`

#### `audit-auth-flows`
**Triggers:** "audit our auth", "check middleware protection", "is getSession safe", "route gate coverage", "CVE-2025-29927", "/auth-flows"
**What it does:** Read-only app-layer auth audit. Centerpiece is the route×gate matrix (every protected route/API/action → the gate that actually covers it, server-side verified). Middleware is not a security boundary — sole-gate is a finding even after CVE-2025-29927 is patched (official Vercel postmortem). Supabase `getSession()` for server-side authz is critical (`getUser()` is the network-verified call). Session lifecycle, refresh-token reuse detection (default 10s; do not widen), OAuth/PKCE, IDOR/admin gates. Live probes non-prod only. Data-layer half → `plan-rls-audit`.
**Related:** `audit-security`, `plan-rls-audit`, `plan-secrets-audit`, `plan-security-audit`, `backend-patterns`, `test-exploratory`

#### `audit-accessibility`
**Triggers:** "accessible", "WCAG", "ADA", "a11y", "screen reader", "disability"
**What it does:** WCAG 2.1 AA compliance audit — WCAG 2.2 automated via axe. Form labels, color contrast, keyboard navigation, focus management, alt text, dynamic content announcements, skip links, accessible modals/tables/forms.
**Related:** `design-frontend`, `audit-uiux-design-system`

#### `audit-db-schema`
**Triggers:** "schema review", "database audit", "naming conventions", "migration check", "index audit", "constraint check"
**What it does:** Audit database schema for consistency, validation, and industry standards. Auto-detects database type, ORM, migration tool. Uses Supabase MCP for live inspection, Firecrawl for best practices, Context7 for ORM docs.
**Related:** `backend-db-performance`, `audit-security`

#### `audit-fe-api`
**Triggers:** "API audit", "frontend API", "API mismatch", "request optimization", "API contract", "network requests"
**What it does:** Audit frontend API calls against backend implementation. Validates endpoints exist, parameters match, types align, caching configured, error handling present. Uses Sentry MCP for production API errors.
**Related:** `debug-fe-be-integration`, `design-api`

#### `audit-registry-listing`
**Triggers:** "audit our npm listing", "README as landing page", "GitHub topics", "why nobody finds the package", "social preview", "npm description", "check the tarball"
**What it does:** Read-only audit of every surface a stranger sees before the repo. README first ten lines (outcome sentence, who it is for, install one-liner, one screenshot — not a count), badges that are live, quickstart ≤5 steps; registry metadata (name, description ≤140 chars, keywords, homepage, repository, license, engines) and `npm pack --dry-run` / build listing for missing promises or leaked `.env*`, keys, screenshots, 10 MB+ assets; GitHub description, ≥5 topics, 1280×640 social preview, releases, `SECURITY.md`; plugin / skills.sh manifests in version and description sync with honest listing status; a timed clean-profile install to first success. Findings with evidence and an owner skill per row; changes nothing.
**Related:** `enhance-readme`, `docs-writer`, `deploy-npm`, `plan-gtm`, `docs-launch-kit`, `plan-aso`

#### `audit-realworld`
**Triggers:** "audit against realworld", "compare my app to realworld", "conduit conformance", "is my full-stack app complete", "full-stack gap check", "what's missing to reach production"
**What it does:** Audits a full-stack app against the RealWorld ("Conduit") reference — its formal API spec, shared Bruno/Hurl E2E suite, and closest-stack reference implementation. Auto-detects strict spec conformance (repo is a RealWorld build) vs benchmarking the repo's own domain against RealWorld's production-relevant patterns, and bows out on non-CRUD/non-web repos. Read-only: produces a prioritized Implemented/Partial/Missing/Diverges gap report across FE/BE/data, then delegates real production hardening to `audit-security` / `plan-*`. RealWorld is a completeness/pattern reference, not a production bar.
**Related:** `audit-fe-api`, `debug-fe-be-integration`, `audit-ux-journeys`, `audit-security`, `plan-perf-audit`, `plan-rls-audit`, `complete-everything`, `full-stack-ship-discipline`

#### `audit-resilience`
**Triggers:** "is this production-ready", "resilience audit", "will this survive real traffic", "audit retries/timeouts/idempotency", "reliability review", "the 80% problem"
**What it does:** Read-only audit for the non-functional "20%" agents skip: timeouts, retries with backoff+jitter, circuit breakers, idempotency keys, rate limiting, graceful degradation, cancellation, audit logging, and PII handling in logs. Inventories every external call, mutation, webhook, and payment path and marks each concern Implemented/Partial/Missing with `file:line`, severity, and the exact fix skill. Delegates remediation to backend-* and plan-* skills.
**Related:** `backend-error-handling`, `backend-patterns`, `backend-observability`, `audit-realworld`, `plan-llm-cost-guardrails`, `plan-input-validation`, `complete-everything`

#### `audit-backend-architecture`
**Triggers:** "audit backend architecture", "which pattern should I use", "is my backend production-grade", "am I over-engineering", "sync vs event-driven", "cache-aside/CQRS/saga/db-per-service", "microservices resilience review", "lift the backend to production"
**What it does:** Read-only audit **and decision advisor** for backend/distributed-systems architecture. Topology-gated so a serverless/monolith and a Kubernetes fleet each see only relevant findings. **Two lenses:** (1) *conformance* — marks each pattern Implemented/Partial/Missing/N-A with `file:line`; (2) *fit/decision* — following "start simple, earn every pattern" (modular-monolith-first), recommends which to **adopt now / adopt-when-[trigger] / defer as premature**, with a maturity ladder + symptom→pattern table, flagging over-engineering and the **distributed-monolith** anti-pattern just as loudly as real gaps. Covers communication style (sync request/response vs async event-driven, per interaction), cache-aside, database-per-service, API gateway, BFF / API composition / GraphQL federation, circuit breaker, bulkhead, backpressure/load-shedding, outbox + CDC, saga (compensation + saga-pivot), CQRS + event sourcing, hexagonal / ports-and-adapters, anti-corruption layer, strangler-fig, sidecar / service mesh (incl. ambient/sidecarless), cell-based, zero-trust/mTLS, distributed tracing + SLOs, and contract testing. Defers per-call runtime resilience to `audit-resilience` (no overlap); delegates fixes to `backend-patterns` (see its `references/architecture-patterns.md`).
**Related:** `audit-resilience`, `backend-patterns`, `design-api`, `audit-security`, `backend-observability`, `audit-db-schema`, `workflow-refactor`, `complete-everything`, `enhance-arch-boundaries`

#### `audit-payment-system`
**Triggers:** "audit payment system", "payment gateway audit", "double charge / idempotency", "double-entry ledger", "reconciliation / settlement", "webhook signature / 3DS / SCA", "PCI DSS", "is my payment flow safe", "audit-payment-system"
**What it does:** Read-only audit for payment/money-movement systems — the code that fails differently from normal CRUD (a retried charge is a double-charge, a lost ledger write is vanished money, a logged PAN is PCI liability, an unverified webhook is a spoofed "payment succeeded"). **Scope-gated (P0 merchant integrator / P1 platform-marketplace / P2 gateway-PSP-fintech)** so a simple Stripe-Checkout site and an in-house ledger each see only relevant findings — never flags "no double-entry ledger" on a shop that offloads it to Stripe. Checks the 2026 pillars (idempotency + double-entry ledger + reconciliation, with PCI DSS v4.0.1 as the floor and webhooks as source of truth) across seven groups: **A** money-movement correctness (idempotency on every mutation + DB unique constraint, dedup, payment state machine / no double-capture, integer minor units, multi-currency+FX); **B** ledger & data integrity (double-entry balanced/sum-zero, append-only immutable, derived balance snapshots, auditability, date partitioning); **C** async & webhooks (sync-auth vs async-everything, HMAC verify, event-id dedup + 200-then-process, atomic state+ledger+outbox, pull-based recovery for stuck payments, refund/dispute/payout saga); **D** reconciliation & settlement (daily 3-way match ledger↔PSP↔bank, break report, discrepancy handling, halt-on-unreconciled brake); **E** fraud/risk/SCA (velocity/geo/device + rules/ML score, 3DS2/SCA + exemptions, fraud-service fail policy, chargeback/VAMP monitoring, AML); **F** PCI/compliance (never store/log PAN or CVV, tokens-only, key rotation, access audit); **G** resilience (PSP/bank timeout + breaker, bulkhead, partial-write safety, graceful degradation). When the PSP is Stripe and the Stripe MCP is connected (it is not bundled in this pack), uses it for version-anchored provider checks; otherwise `/research` against Stripe's official docs. Every finding cites `file:line`; no severity below Critical for a double-charge, lost-money, or PAN-exposure gap. Read-only and payment code is a STOP-and-confirm surface — findings feed a human-reviewed remediation, not an unattended edit.
**Related:** `audit-resilience`, `audit-security`, `audit-db-schema`, `audit-backend-architecture`, `plan-data-integrity`, `plan-secrets-audit`, `backend-patterns`, `data-pipeline`, `audit-monetization-iap`, `complete-everything`

#### `audit-langfuse-llm`
**Triggers:** "audit LLM quality", "check Langfuse", "audit prompts", "check AI quality", "LLM PDCA", "audit AI costs", "check traces", "audit eval scores", "check hallucination"
**What it does:** PDCA quality audit for LLM/AI features via Langfuse CLI, Sentry, Supabase, Playwright, and Firecrawl. Audits traces, prompts, costs, evals. Performs live verification and grounding/hallucination checks.
**Related:** `deploy-verify`, `debug-sentry-monitor`, `backend-observability`, `audit-llm-security`, `plan-llm-cost-guardrails`

#### `audit-llm-security`
**Triggers:** "audit LLM security", "prompt injection", "jailbreak my chatbot", "is my AI safe", "OWASP LLM"
**What it does:** Read-only OWASP LLM Top 10 audit of *app-facing* AI features — injection, disclosure, supply chain, poisoning, unsafe output, excessive agency, system-prompt leak, RAG/embedding, misinformation, unbounded consumption. Quality/evals → `audit-langfuse-llm`. Coding-agent policy → `enhance-agent-guardrails`.
**Related:** `audit-langfuse-llm`, `plan-llm-cost-guardrails`, `plan-input-validation`, `enhance-agent-guardrails`, `test-red-team`, `audit-security`

#### `audit-agent-speed`
**Triggers:** "Claude is slow", "CPU is pinned with several agents", "speed up my agent setup", "why are my hooks slow"
**What it does:** Measures before blaming, then fixes the local side of a slow coding-agent host: transcript-parsing status lines, per-call and blocking Stop hooks (ships an `asyncRewake` background typecheck hook), AGENTS.md not loading under a parent CLAUDE.md, un-ignored worktree folders doubling search, global effort and Explore model, worktree pile-up, antivirus, indexer and vendor WMI pollers. App runtime speed → `audit-performance`.
**Related:** `audit-performance`, `workflow-environment-ready`, `iterate-agent-harness`, `housekeep-files`

#### `audit-analytics`
**Triggers:** "audit our analytics", "are we tracking the right events", "funnel instrumentation", "dead events", "consent-gated analytics"
**What it does:** Read-only product-event audit — intended funnel vs instrumented events, taxonomy consistency, dead/duplicate/phantom fires, PII in properties, consent-gated SDK init. **Run with `plan-privacy-compliance`** when consent is in play. Charts → `data-visualization`.
**Related:** `plan-privacy-compliance`, `iterate-post-launch`, `audit-ux-journeys`, `data-visualization`

#### `audit-ui-states`
**Triggers:** "check empty/error states", "audit loading states", "what happens when this fails", "offline state", "zero-results"
**What it does:** Read-only per-screen matrix of empty / loading / error / offline / zero-results / permission / overflow. Happy-path-only UI is the vibe-code tell. Dead buttons → `plan-stub-checker`. Breakpoints → `audit-responsive`.
**Related:** `plan-stub-checker`, `audit-resilience`, `audit-responsive`, `audit-ux`, `test-visual-regression`, `test-exploratory`

#### `audit-monetization-iap`
**Triggers:** "audit our IAP", "check subscriptions", "are purchases validated", "restore purchases broken"
**What it does:** Read-only StoreKit 2 / Play Billing / RevenueCat audit — server receipt validation, restore, store notifications, lifecycle (trial/grace/refund), cross-platform entitlement. Web Stripe/ledgers → `audit-payment-system`.
**Related:** `audit-payment-system`, `plan-mobile-readiness`, `plan-aso`, `plan-privacy-compliance`

#### `audit-env-parity`
**Triggers:** "works locally but not in prod", "check env var config", "audit our environments", "config drift"
**What it does:** Read-only env/config parity across local / staging / prod — referenced-but-unset, naming drift, public-prefix leaks, staging pointing at prod. Never prints secret values. Local runnability → `workflow-environment-ready`. Exposure → `plan-secrets-audit`.
**Related:** `workflow-environment-ready`, `plan-secrets-audit`, `plan-data-integrity`, `plan-backup-dr`

#### `audit-infra-cost`
**Triggers:** "why is my hosting bill high", "cut infra costs", "audit cloud spend", "reduce Supabase/Vercel costs"
**What it does:** Read-only hosting/DB/storage/egress/serverless spend audit. CI minutes → `audit-cicd`. Model tokens → `plan-llm-cost-guardrails`. Consumes `test-load` numbers. Never cuts backups.
**Related:** `audit-cicd`, `plan-llm-cost-guardrails`, `test-load`, `plan-backup-dr`, `audit-bundle-size`

#### `audit-skill-conflicts`
**Triggers:** "audit my skills", "check for conflicting skills", "why did the wrong skill trigger", "which skills overlap", "after adding a batch of skills"
**What it does:** Read-only self-audit of the *skill pack* — contradictory directives (especially always-on rules vs skills), overlapping trigger descriptions, stale cross-refs, duplicated guidance, context-budget bloat. Per-file spec stays on `validate:skills`. Authoring how-to → `meta-skill-creator`. Expected to flag the UI-audit cluster (`audit-ux` / `audit-responsive` / `audit-ui-states` / …) and leftover `audit-responsive-layout` / `responsive-audit` names.
**Related:** `meta-skill-creator`, `enhance-agent-guardrails`, `plan-docs-sync`, `audit-responsive`, `audit-ux`, `audit-ui-states`

#### `audit-uiux-design-system`
**Triggers:** "design system audit", "UI consistency", "token compliance", "design drift", "component audit", "visual coherency"
**What it does:** Audits visual-system coherence: tokens, component variants, color/type/spacing, dark mode, and duplicate primitives. Per-page usability is `audit-ux`; breakpoints are `audit-responsive`; unhappy states are `audit-ui-states`; plan-only unification is `plan-uiux-unification`.
**Related:** `design-system`, `audit-accessibility`, `audit-ux`, `audit-responsive`, `audit-ui-states`, `plan-uiux-unification`

#### `audit-ux`
**Triggers:** "UX audit", "usability review", "heuristic evaluation", "content audit", "UX quality", "check cognitive load", "audit microcopy"
**What it does:** Research-driven UX audit — Nielsen Norman Group's 10 heuristics, Laws of UX, Intuit Content Design, Google HEART metrics. playwright-cli for live walkthrough, Firecrawl for research. Per-page experience lens — for cross-page journeys use `audit-ux-journeys`; for linearized desktop / breakpoint layout use `audit-responsive`.
**Related:** `audit-ux-journeys`, `audit-responsive`, `audit-uiux-design-system`, `audit-accessibility`, `enhance-web-ux`

#### `audit-ux-journeys`
**Triggers:** "audit user flows", "user story audit", "information architecture audit", "IA audit", "can users find X", "users get lost", "navigation audit", "funnel drop-off", "task completion", "audit-ux-journeys"
**What it does:** Cross-page UX audit for **user stories, task completion, and information architecture** — the layer `audit-ux` (per-page heuristics) doesn't cover. A site can pass every per-page heuristic and still fail because users can't *find* the feature or *finish* the story. **Phase 0** derives 5–10 real user stories from routes/nav/CTAs (reusing `design-prd` / `plan-test-coverage` inventories — never invented personas) and scopes depth by audit trigger (KPIs dropping → targeted funnel; complaints → thematic; redesign → comprehensive; pre-launch → qualitative walkthroughs labeled as assumptions). **Phase 1** audits IA structurally: click depth per story target (money pages ≤2–3), orphan pages, dead ends, label consistency (nav ≈ title ≈ H1, one concept = one word), grouping vs user mental model (not DB schema), first-click logic, wayfinding (breadcrumbs, `aria-current`), search/filter presence, URL sanity. **Phase 2** walks every story end-to-end in a headed browser (desktop + 390px mobile) producing a task-completion matrix: steps-to-goal, friction log (hesitation/mislabel/backtrack/surprise/stall), error-recovery probes (invalid input, Back, refresh mid-flow), success-moment clarity — a BLOCKED story is automatically a Blocker finding. **Phase 3** enforces evidence discipline: every finding tagged `[data]` (analytics/funnels/drop-offs from GA4/PostHog/Clarity/etc.), `[observed]` (reproduced), or `[judgment]` (assumption to validate) — never presents taste as data; with no analytics, recommends minimal funnel instrumentation as a roadmap item. **Phase 4** reports impact×effort: quick wins vs roadmap vs deprioritized, neutral behavior-grounded language, always names what works. Delegates per-page fixes to `enhance-web-ux`, forms to `enhance-web-forms`, WCAG to `audit-accessibility`, heuristics depth to `audit-ux`.
**Related:** `audit-ux`, `audit-responsive`, `audit-analytics`, `enhance-web-ux`, `enhance-web-forms`, `audit-accessibility`, `audit-performance`, `audit-realworld`, `plan-test-coverage`, `design-prd`, `test-playwright`, `test-exploratory`

#### `audit-responsive`
**Triggers:** "responsive audit", "desktop looks like a phone", "linearized layout", "no max-width", "stacked at 1440", "stretched buttons on desktop", "breakpoint gaps", "audit-responsive"
**What it does:** Finds and fixes the anti-pattern where every breakpoint is a linearized mobile layout — stacked, left-aligned, full-width, no hierarchy. **Desktop is not a wide phone.** Detects the stack, scores 10 layout/IA anti-patterns with `file:line`, extracts or proposes a token sheet, draws ASCII wireframes at 375 / 768 / 1440, then implements in reviewable chunks (report-first if scope is large). Verifies live via playwright-cli. Distinct from `design-mobile-first` (touch / mobile-up) and `audit-ux-journeys` (cross-page IA).
**Related:** `design-mobile-first`, `plan-uiux-unification`, `audit-uiux-design-system`, `audit-ux`, `audit-ux-journeys`, `audit-ui-states`, `enhance-web-ui`, `enhance-web-ux`, `housekeep-design`, `audit-accessibility`, `test-playwright`, `test-visual-regression`

#### `audit-bundle-size`
**Triggers:** "reduce bundle size", "analyse bundle", "tree shaking", "lazy loading", "code splitting", "slow initial load", "large JS", "chunk size", "why is the bundle so big", "first load JS too large", "LCP caused by JS"
**What it does:** Finds and eliminates JS bundle bloat. Detects bundler (Vite/Webpack/Next.js/Rollup). Runs production build with analysis (rollup-plugin-visualizer, @next/bundle-analyzer), identifies largest chunks, duplicate deps, non-tree-shakeable imports, missing code-splitting. Maps every finding to a specific file and import with before/after size estimates.
**Related:** `audit-performance`, `enhance-web-seo`, `workflow-refactor`

#### `audit-i18n`
**Triggers:** "audit i18n", "fix translations", "add locale", "natural language", "translation quality", "hardcoded strings", "localisation", "the Japanese feels like Google Translate", "translations sound robotic", "add language support"
**What it does:** i18n audit with emphasis on **natural, human-sounding copy** — not machine-translated jargon. Finds hardcoded strings, checks translation completeness across all locales, rewrites stiff/literal copy to sound like a real person, fixes date/number/currency locale formatting, walks the live app in each locale via Playwright. Works with react-i18next, next-intl, vue-i18n, lingui, and any other library.
**Related:** `audit-ux`, `audit-code-quality`, `enhance-web-ux`

---

### Debug

#### `debug-error`
**Triggers:** "debug", "error", "bug", "broken", "not working", "exception", "crash", "investigate"
**What it does:** Diagnoses one error with hypotheses and runtime evidence: reproduce → isolate → root cause → fix → verify → prevent. FE↔BE contract failures, Sentry operations, and full bug-to-PR lifecycles have dedicated skills.
**Related:** `debug-fe-be-integration`, `debug-sentry-monitor`, `workflow-fix-and-ship`

#### `debug-fe-be-integration`
**Triggers:** "API error", "4xx error", "5xx error", "validation error", "integration issue", "backend error", "FE-BE mismatch"
**What it does:** Traces client requests, server logs, validation, auth, and responses to diagnose and fix frontend↔backend contract failures on both sides.
**Related:** `audit-fe-api`, `debug-error`

#### `debug-sentry-monitor`
**Triggers:** "check Sentry", "fix Sentry errors", "triage errors", "production errors", "monitoring", "error tracking", "run sentry check"
**What it does:** Monitor, triage, fix, and enhance Sentry error monitoring. Auto-detects org, project, framework, config. Seer AI root cause analysis, code fixes, noise filters, monitoring architecture audit.
**Related:** `debug-error`, `workflow-fix-and-ship`, `deploy-verify`, `backend-observability`, `plan-error-handling`

---

### Test

#### `test-unit`
**Triggers:** "write unit tests", "add tests for this function", "unit test", "Vitest", "pytest"
**What it does:** Write effective unit tests. Auto-detects framework (Vitest/Jest/pytest/Go/etc.), researches patterns via Firecrawl, fetches docs via Context7. Uses Sentry MCP to identify production errors lacking test coverage.
**Related:** `workflow-spec-tdd`, `test-qa`, `test-mutation`

#### `test-mutation`
**Triggers:** "add mutation testing", "are our tests real", "check test quality not coverage", "can our test suite be gamed", "Stryker", "assertion theater", "/test-mutation"
**What it does:** Installs and runs mutation testing (StrykerJS / mutmut) so tests must *kill* deliberate bugs, not just execute lines. Never starts whole-repo — scopes to money/auth/entitlements first, incremental mode from day one. Triages survivors into missing-assertion / untested-branch / dead-code / equivalent. Wires a per-PR incremental job + scheduled full run + score ratchet. Closes the coverage-gaming hole `audit-gate-logic` maps.
**Related:** `plan-test-coverage`, `test-unit`, `housekeep-gates`, `audit-gate-logic`, `enhance-agent-guardrails`

#### `test-qa`
**Triggers:** "QA the app", "test the app", "test before release", "run QA", "test CRUD", "test data pipeline", "pre-release testing", "smoke test"
**What it does:** Full-app QA via playwright-cli. Auto-discovers pages, features, data entities, auth patterns. Performs real CRUD with data pipeline verification (FE → API → DB → FE), audits UX quality, tests edge cases. Not a monkey test.
**Related:** `test-unit`, `test-playwright`, `test-exploratory`, `protocol-browser-anti-stall`

#### `test-exploratory`
**Triggers:** "monkey test the app", "exploratory QA", "wander the app", "wander like a confused user", "guest vs logged in", "click everything and see what breaks"
**What it does:** Unscripted headed wander of a live non-prod app — junk inputs, double-submit, nav abuse — run twice as **GUEST** then **LOGGED-IN** in isolated playwright-cli sessions, plus a post-logout isolation pass. Centerpiece is the **guest-vs-authed diff table**. Discovery only; tickets go to `workflow-feedback-to-closure`, then lock with `test-playwright`.
**Related:** `test-qa`, `test-red-team`, `test-playwright`, `audit-auth-flows`, `workflow-feedback-to-closure`, `protocol-browser-anti-stall`

#### `test-playwright`
**Triggers:** "test this with playwright", "test my changes", "test on localhost like a user", "PDCA this", "did you actually test it", "red-team this feature", "verify the work end-to-end"
**What it does:** Closes the PDCA loop after an implementation. Scopes to the current session's diff, drives the live localhost app through playwright-cli manually like a real user, and **fixes** pain points — full-stack (UI/UX + API + DB).
**Related:** `test-qa`, `test-exploratory`, `protocol-browser-anti-stall`, `debug-fe-be-integration`

#### `test-red-team`
**Triggers:** "red team this app", "attack my app", "break it", "find all the defects", "adversarial test", "pre-launch hardening", "pentest the app", "full app QA", "security + perf + UX sweep", "try to break it"
**What it does:** Adversarial full-app sweep driven by a **feature-first coverage matrix**: each feature decomposed to surfaces, sub-pages, components, and states, attacked across 4 dimensions — UI/UX, data pipeline, security (OWASP Top 10 + MASVS), and performance. Drives playwright-cli (web), Playwright Android WebView attach (Capacitor), or adb tap-walk (native chrome). Cross-references Sentry + Supabase + Firecrawl. Produces a severity-ranked defect list with repro evidence and a launch-readiness verdict.
**Related:** `test-playwright`, `test-qa`, `test-exploratory`, `audit-security`, `iterate-post-launch`, `audit-llm-security`, `test-load`

#### `test-visual-regression`
**Triggers:** "add visual regression tests", "catch UI regressions", "screenshot testing"
**What it does:** Playwright screenshot baselines + CI diff artifacts. Locks `audit-responsive` / `audit-ui-states` fixes. Functional clicks stay on `test-playwright`.
**Related:** `audit-responsive`, `audit-ui-states`, `test-playwright`, `protocol-browser-anti-stall`, `audit-cicd`

#### `test-load`
**Triggers:** "load test this", "will it handle launch traffic", "find the breaking point", "test under concurrency"
**What it does:** k6/Artillery journeys with smoke → load → stress → spike. Reports p50/p95/p99, error types, breaking resource. Never hits prod unsigned. Feeds `audit-infra-cost`.
**Related:** `audit-resilience`, `audit-infra-cost`, `backend-db-performance`, `backend-patterns`, `audit-performance`

#### `protocol-browser-anti-stall`
**Triggers:** (protocol — used by other skills before browser automation sessions); also "parallel browser agents", "playwright session", "browser keeps stalling"
**What it does:** Standardizes browser work on `playwright-cli` (`npx --yes @playwright/cli@latest`) with named sessions (`-s=<name>`) so parallel agents each get an isolated browser instead of fighting over the single-instance Playwright MCP. Prevents freezing: navigation guards with snapshot verification, max 3-second waits, incremental wait pattern, max 4 attempts per goal, SPA rules, fresh refs after state changes. Ships an MCP→CLI command map and persistent-login setup (including the Google/CDP sign-in workaround).
**Related:** `test-qa`, `test-playwright`, `test-exploratory`, `deploy-verify`

---

### Mobile

#### `mobile-rn-screen`
**Triggers:** "this screen looks off", "feels clunky on iOS", "Android version looks wrong", "jank when scrolling", "button is unreachable", "polish this React Native screen", "safe area", "keyboard covers input", "FlatList re-renders"
**What it does:** Polishes an existing React Native screen to feel intentional and native. Catches safe-area violations, sub-minimum touch targets, keyboard occlusion, JS-thread animation jank, gesture conflicts, FlatList re-render storms.
**Related:** `enhance-capacitor-ui`, `mobile-emulator-start`, `mobile-emulator-test`

#### `mobile-rn-performance`
**Triggers:** "janky scroll", "slow startup", "huge bundle", "memory leak", "frame drops", "FlashList", "upgrade React Native", "bump Expo SDK"
**What it does:** React Native / Expo performance, build, and upgrade depth — FPS & re-renders, Hermes, TTI/startup, bundle & app size, FlashList, memory, Reanimated UI-thread animation, Turbo Modules, Android 16KB page alignment.
**Related:** `mobile-rn-screen`, `mobile-emulator-start`, `mobile-emulator-test`

#### `mobile-capacitor-platform`
**Triggers:** "keyboard covers the input", "status bar overlaps the header", "add push notifications", "deep linking", "ship an OTA update", "set up native build CI", "submit to the App Store", "fix an App Store rejection", "make the app work offline", "migrate my web app to Capacitor"
**What it does:** Capacitor platform + pipeline depth. Owns the native shell plumbing other mobile skills point to — core `SystemBars` and safe-area CSS, dead `StatusBar` config, keyboard resize, splash, Android back, haptics defaults, large-screen orientation — each with a device probe and a done line; plus Capacitor 8 / targetSdk 36 / Xcode 26 floors, plugin selection, OTA/live updates, deep/universal links, push (FCM/APNs), offline-first, native build CI/CD, store submission, Capsec scan.
**Related:** `enhance-capacitor-ui`, `enhance-mobile-native-feel`, `workflow-mobile-native-uiux`, `workflow-spec-tdd`

#### `mobile-emulator-start`
**Triggers:** "start emulator", "start Metro", "restart dev loop", "fix Cannot connect to Expo", "spin up new terminal instance", "stuck bundler", "align emulator geometry"
**What it does:** Boots Metro + Android emulator in the right order — kills duplicate ports, picks fresh-cache vs fast-iteration, defaults to a 1080×2400 display (1080×4000 opt-in for scroll-QA with a matching tall skin), polls `/status` before deeplink to avoid connection races.
**Related:** `mobile-emulator-test`, `mobile-rn-screen`

#### `mobile-emulator-test`
**Triggers:** "test on emulator", "QA Android build", "verify native build", "white screen", "cache rehydration", "RN sync empty state", "Expo dev-client QA"
**What it does:** Native build QA on Android emulator — three-layer CRUD verification (UI / API / DB), build-freshness + dual-auth phases, fixes for white-screen / cache-rehydration / sync-empty-state. Pairs Metro/adb walk with Supabase + Sentry MCPs.
**Related:** `mobile-emulator-start`, `test-qa`, `debug-fe-be-integration`

---

### Deploy

#### `deploy-verify`
**Triggers:** "verify deploy", "post-deploy check", "smoke test production", "ship or rollback", "deploy health check", "post-release check"
**What it does:** Post-deploy smoke test combining Sentry + Supabase + Langfuse + Playwright + Firecrawl. Checks for new errors, verifies migration health, confirms trace pipeline, runs browser smoke test. Binary SHIP/ROLLBACK/MONITOR verdict.
**Related:** `debug-sentry-monitor`, `audit-langfuse-llm`, `workflow-ship-and-observe`, `deploy-npm`

#### `iterate-post-launch`
**Triggers:** "improve the app after launch", "fix the top issues", "post-launch polish", "what should I fix next", "production issues", "iterate on feedback", "post-release improvements", "what is broken in prod", "ship a polish pass", "make it better based on real usage"
**What it does:** Closes the post-ship improvement loop. Pulls Sentry top errors (with Seer AI root-cause), Supabase slow-query and API logs, advisor warnings, and a live Playwright walkthrough into a ranked improvement backlog (impact × effort). Implements the approved fixes full-stack and verifies each one live. Resolves confirmed Sentry issues.
**Related:** `test-red-team`, `deploy-verify`, `debug-sentry-monitor`, `workflow-fix-and-ship`, `test-playwright`, `audit-analytics`

#### `iterate-gtm-weekly`
**Triggers:** "weekly growth review", "what should we do this week for growth", "GTM check-in", "growth standup", "/gtm-weekly"
**What it does:** Thirty-minute weekly loop after `workflow-gtm`. Pulls Visit → Signup → Activated → Habit → Paid → Refer by source, this week vs last; fills launch-kit Results tables older than 7 days; names the step with the largest *absolute* loss; attributes last week's experiment with a number (or "unmeasured"); chooses exactly one experiment (metric + stop date, owner skill from a levers-by-step table) and one post; appends a scorecard row and schedules next week. Production defects stay on `iterate-post-launch`; blind funnel cells go to `audit-analytics` first.
**Related:** `workflow-gtm`, `iterate-post-launch`, `audit-analytics`, `enhance-onboarding`, `enhance-web-conversion`, `enhance-lifecycle-email`, `enhance-growth-loops`, `docs-comparison-pages`, `docs-launch-kit`

#### `deploy-npm`
**Triggers:** "publish this package", "release to npm", "ship a new npm version"
**What it does:** End-to-end release workflow for a Changesets + GitHub Actions + npm Trusted Publisher (OIDC) monorepo with per-package GitHub Releases.
**Related:** `deploy-verify`, `workflow-pr`, `workflow-ship-and-observe`

#### `workflow-ship-and-observe`
**Triggers:** "ship it", "deploy to production", "release this", "go live", "roll this out", "promote to prod", "cut a release", "/ship-and-observe"
**What it does:** Take merged, green code to a verified, monitored production release for any app stack. Confirms the target and exact source revision, deploys the intended revision (with backend dependencies), proves the deployed build equals that revision (not just a 200), smoke-tests critical flows against production, watches error/latency signals through a defined stability window, then confirms stable or executes an explicit rollback/hotfix. Completion is `deployed-verified` after the live check and `observed-stable` only after the window passes.
**Related:** `deploy-verify`, `deploy-npm`, `full-stack-ship-discipline`, `iterate-post-launch`, `workflow-feedback-to-closure`, `verification-before-completion`

---

### Workflow

#### `workflow-spec-tdd`
**Triggers:** "spec first", "TDD", "do it properly", "this keeps breaking", "make it right"
**What it does:** Anti-vibe-coding spine: brainstorm → spec → plan → TDD. End-to-end feature through PR → `workflow-build-feature`. One named bug → `workflow-fix-and-ship`.
**Related:** `workflow-coding-discipline`, `test-unit`, `test-playwright`, `workflow-build-feature`

#### `workflow-refactor`
**Triggers:** "refactor", "split file", "extract", "cleanup", "reorganize", "too big", "technical debt"
**What it does:** Applies a scoped behavior-preserving refactor after mapping dependencies, then runs affected tests. Repo-wide smell cleanup and mechanical whole-repo transforms have dedicated owners.
**Related:** `audit-code-quality`, `burndown-full`, `audit-codemod-safety`, `workflow-spec-tdd`

#### `workflow-git-commit`
**Triggers:** "commit my changes", "write a commit message", "conventional commit"
**What it does:** Deliberately stages named files/hunks and creates one conventional commit for an already-scoped change; never pushes. Working-tree → merge-ready PR is `workflow-release-prep`.
**Related:** `workflow-pr`, `workflow-release-prep`

#### `workflow-pr`
**Triggers:** "create PR", "pull request", "merge PR", "PR review", "PR checks", "merge criteria"
**What it does:** PR lifecycle for an already-committed branch or an open PR — validations, template, bot feedback, merge criteria. Uncommitted working tree reviewed-then-opened as a merge-ready PR is `workflow-release-prep`.
**Related:** `workflow-git-commit`, `audit-code-review`, `workflow-release-prep`

#### `burndown-full`
**Triggers:** "finish the burndown", "it stopped halfway", "apply this everywhere", "complete the refactor across all files", "make sure nothing was missed", "ran out of steam", "half-migrated repo", "/burndown-full"
**What it does:** Drive a planned change to 100% coverage when a prior agent run stopped early. Defines MATCH/DONE searchable patterns, enumerates the full repo-wide worklist (not the plan's file list), executes in small batches with persistent `.cursor/burndown-state.md`, and loops a verification gate (fresh grep → zero hits, typecheck, lint, test, build) until provably complete. Framework-agnostic — discovers project verification commands from package.json/Makefile/AGENTS.md.
**Related:** `complete-everything`, `approved-plan-execution`, `audit-gate-logic`, `audit-codemod-safety`, `plan-*` skills (audit-only), `workflow-refactor`

#### `research`
**Triggers:** "/research", "look up current docs", "what does the industry recommend", "research this before we implement", "current best practices"
**What it does:** Repo-first, version-matched research before a non-trivial change. Reads the current implementation, fetches official docs (Context7 when available), runs Firecrawl broad search → deep scrape → discovery, then writes a gap analysis and a file-mapped plan. Does not implement until asked.
**Related:** `workflow-onboard`, `plan-*`, `docs-adr`, `complete-everything`

#### `complete-everything`
**Triggers:** "complete everything", "don't defer", "fix out of scope too", "finish the whole plan", "close every TODO", "finish all follow-ups", "no deferrals", "/complete-everything"
**What it does:** Close an approved plan's intent, behavior, and verification gaps. Recovers unfinished plan items plus connected work parked as out of scope/follow-up/optional, writes observable acceptance criteria and durable progress to `.cursor/complete-everything-state.md`, implements in independently verifiable milestones, routes API/FE-BE/performance/UI work to the matching skills, and loops the full applicable verification ladder until every closure item has fresh evidence. The packaged Cursor stop hook continues actionable unchecked state; Claude Code 2.1.139+ can use `/goal`. Final closure requires an independent `completion-judge` PASS at the claimed evidence level.
**Related:** `completion-judge`, `verification-before-completion`, `burndown-full`, `test-unit`, `audit-fe-api`, `debug-fe-be-integration`, `audit-performance`, `test-playwright`

#### `workflow-green-repo`
**Triggers:** "make the repo green", "get CI passing", "fix all the failing tests", "clear the typecheck errors", "zero lint errors", "make the build pass", "clean up the baseline", "/green-repo"
**What it does:** Drive an entire repository to a verified-green baseline — typecheck, lint, tests, and build all passing from a clean run — when fixing pre-existing debt is explicitly authorized. Discovers the real gate commands, captures the baseline, enumerates every failure into `.cursor/green-repo-state.md`, fixes root causes in batches (never skip/`.only`/`@ts-ignore`/blanket-snapshot to force green), and proves green with a fresh from-scratch run. Distinct from `complete-everything` (one plan's scope) and `burndown-full` (one searchable pattern).
**Related:** `complete-everything`, `burndown-full`, `audit-gate-logic`, `verification-before-completion`, `completion-judge`, `debug-error`

#### `workflow-feedback-to-closure`
**Triggers:** "triage this feedback", "turn these reports into tickets", "process the bug backlog", "handle these review comments", "close the loop on QA findings", "manage incoming issues", "/feedback-to-closure"
**What it does:** Turn raw feedback — bug reports, complaints, review comments, Sentry issues, QA/audit findings — into deduplicated, durable, trackable tickets and drive each to production-verified closure. Normalizes and clusters signals, dedupes against existing issues, writes reproducible tickets to `.cursor/feedback-closure-state.md` (and the tracker), prioritizes by impact, fixes via the right skill with a regression test, and closes only after the fix is verified where the user hit it — not when a PR merges.
**Related:** `workflow-fix-and-ship`, `complete-everything`, `iterate-post-launch`, `workflow-ship-and-observe`, `debug-sentry-monitor`, `verification-before-completion`, `test-exploratory`

#### `workflow-environment-ready`
**Triggers:** "set up the environment", "is this ready to run", "before we start the big task", "preflight the repo", "why won't the tests run", start of any long/autonomous run
**What it does:** Prove the working environment is actually runnable before a long or autonomous task, so a multi-hour run doesn't fail at the finish line on a missing tool, dependency, service, or credential. Detects the stack, verifies runtimes and reproducible installs, confirms required services are reachable and every `.env.example` variable is present (names only — never printing secrets), and confirms each verification command executes. Emits a READY / READY WITH NOTES / BLOCKED verdict.
**Related:** `workflow-green-repo`, `complete-everything`, `burndown-full`, `workflow-onboard`, `debug-error`

#### `iterate-agent-harness`
**Triggers:** "the agent stopped early again", "it said done but wasn't", "it gamed the test", "improve the skills so this doesn't recur", "add a guard for this", "close the loop on that failure"
**What it does:** Turn an agent's own failure — premature stop, false "done", reward-hacked check, missed file, broken handoff — into a durable improvement to the harness (skills, rules, hooks, subagents, verification scripts) plus a regression check that would have caught it. Classifies the failure mode, locates the harness gap, adds a guard that fails before the fix, makes the smallest durable fix, validates, and records the lesson. Operates on this toolkit itself.
**Related:** `verification-before-completion`, `completion-judge`, `complete-everything`, `burndown-full`, `create-skill`, `create-rule`, `create-hook`, `meta-skill-creator`

#### `workflow-housekeep`
**Triggers:** "housekeep", "clean up repo", "update README", "update dependencies", "fix vulnerabilities", "remove dead code", "tidy up", "repo maintenance", "spring clean", "declutter"
**What it does:** Full-cycle repository maintenance: README sync, dead file cleanup (logs, screenshots, deprecated code), dependency updates (audit, classify, update with research), config/script/env audit.
**Related:** `workflow-refactor`, `docs-writer`, `audit-code-review`, `housekeep-backlog`, `housekeep-design`

#### `workflow-parallel-agents`
**Triggers:** "run agents in parallel", "parallel worktrees", "multi-model", "best-of-N", "compare approaches"
**What it does:** Run agents in parallel via git worktrees, cloud agents, or multi-model comparison. Covers isolation, merge strategies, result evaluation.
**Related:** `workflow-spec-tdd`

#### `workflow-coding-discipline`
**Triggers:** "coding guidelines", "LLM discipline", "avoid vibe-coding", "think before coding", "simplicity first", "Karpathy guidelines"
**What it does:** Behavioral guardrails for writing, editing, refactoring, debugging, or reviewing code. Reduces LLM mistakes — overcomplication, drive-by edits, hidden assumptions, weak success criteria. Adapted from Karpathy's observations.
**Related:** `workflow-spec-tdd`, `audit-code-quality`

#### `workflow-feature-flag`
**Triggers:** "add a feature flag", "gradual rollout", "staged release", "kill switch", "dark launch", "flag cleanup", "canary release", "rollback plan", "safe feature release", "deploy without switching on", "LaunchDarkly", "PostHog flags", "GrowthBook"
**What it does:** Disciplined feature-flag rollout. Detects existing flag infrastructure (LaunchDarkly, Flagsmith, GrowthBook, Unleash, PostHog, or env-var gates). Designs flag contract (name, targeting, kill-switch path), implements the gate, stages rollout (0% → internal → 5% → 100%), monitors Sentry error rate + Supabase logs at each stage, promotes or rolls back, then schedules cleanup from code.
**Related:** `workflow-spec-tdd`, `deploy-verify`, `iterate-post-launch`

#### `workflow-onboard`
**Triggers:** "I'm new to this repo", "orient me", "explain this codebase", "what does this do?", "onboard me", "first day on this project", "catch me up on the codebase", "help me understand this project"
**What it does:** First-contact orientation for any codebase. Reads package manifests, entry points, routing, data layer, auth, env vars, and recent git history. Produces a concise briefing: what the app does, how it's structured, how to run it, and the top 3 areas to understand first.
**Related:** `workflow-build-feature`, `docs-writer`

#### `workflow-merge-conflicts` *(adapted from mattpocock/skills, MIT)*
**Triggers:** "resolve the conflicts", "fix this merge", "the rebase is stuck", conflict markers left in the tree
**What it does:** Resolve an in-progress merge/rebase by tracing each conflicting hunk back to its original intent (commits, PRs, issues), preserving both intents where possible, then running the repo's real checks before finishing the operation. Never resolves on textual appearance alone; never aborts without instruction.
**Related:** `workflow-git-commit`, `workflow-pr`

#### `handoff` *(adapted from mattpocock/skills, MIT; user-invoked via `/handoff`)*
**Triggers:** `/handoff` only — `disable-model-invocation: true`, so it costs zero always-on context
**What it does:** Compact the current conversation into a handoff document (state, ordered next steps, suggested skills, gotchas) saved to the OS temp directory, with secrets redacted, artifacts referenced by path instead of copied, and verification claims held to the `verification-before-completion` ladder.
**Related:** `verification-before-completion`, `workflow-parallel-agents`, `docs-adr`

---

### Bundled Workflows

Orchestrator skills that sequence multiple individual skills into a tracked, phase-gated loop. **Use these first** — they eliminate the need to manually chain skills.

#### `workflow-build-feature`
**Triggers:** "build a feature", "implement this", "add X", "ship a new capability", "build this end to end", "implement from scratch"
**What it does:** End-to-end feature build: spec (`workflow-spec-tdd`) → implement → unit tests (`test-unit`) → smoke test (`test-playwright`) → PR (`workflow-pr`). Enforces spec-before-code discipline and full-stack verification. Done criteria: spec written, RED test was failing, GREEN after implementation, smoke test passed, PR open with evidence.
**Chain:** `workflow-spec-tdd` → `test-unit` → `test-playwright` → `workflow-pr`
**Related:** `workflow-spec-tdd`, `test-unit`, `test-playwright`, `workflow-pr`, `complete-everything`, `workflow-fix-and-ship`

#### `workflow-fix-and-ship`
**Triggers:** "fix this bug and ship it", "patch this and close the ticket", "fix this Sentry issue", "bug report from user", "fix and deploy", "triage and fix"
**What it does:** Complete bug-fix lifecycle: triage Sentry/logs → reproduce locally → root cause (`debug-error`) → surgical fix + regression test → smoke test (`test-playwright`) → PR (`workflow-pr`) → optional post-deploy smoke (`deploy-verify`) → resolve Sentry issue. Leaves evidence at every step.
**Chain:** `debug-error` → `test-playwright` → `workflow-pr` → `deploy-verify`
**Related:** `debug-error`, `debug-sentry-monitor`, `test-playwright`, `workflow-pr`, `deploy-verify`, `workflow-feedback-to-closure`

#### `workflow-quality-gate`
**Triggers:** "is this ready to ship?", "quality gate", "pre-release checklist", "what do I need to fix before launch?", "ship-readiness check", "run the quality gate"
**What it does:** Pre-release go/no-go. Optional live identity probe (`test-exploratory`) then: adversarial red team (`test-red-team`) → static security review (`audit-security`) → bundle size (`audit-bundle-size`) → Core Web Vitals (`audit-performance`) → unit test coverage (`test-unit`). Produces a single GO / NO-GO / GO WITH CONDITIONS verdict with a ranked defect list. Does not commit or open a PR — that is `workflow-release-prep`.
**Chain:** (`test-exploratory`) → `test-red-team` → `audit-security` → `audit-bundle-size` → `audit-performance` → `test-unit`
**Related:** `test-exploratory`, `test-red-team`, `audit-security`, `audit-bundle-size`, `audit-performance`, `test-unit`, `audit-gate-logic`, `workflow-release-prep`

#### `workflow-release-prep`
**Triggers:** "prepare this for a PR", "get my working tree merge-ready", "release prep this branch", "review everything uncommitted and open a PR", "/release-prep"
**What it does:** Capstone for one developer's dirty tree. Snapshots uncommitted + staged + untracked + unpushed as one release unit, reviews via `audit-code-review` plus a release lens (coherence, debug residue, accidental inclusions, migration/flag safety), self-critiques (complete / clean / coherent / tested / safe), splits via `split-to-prs` if needed, commits via `workflow-git-commit`, opens the PR via `workflow-pr`, and hands to `babysit` until merge-ready. Refuses to run on main. **Does not merge.** Product launch sweep stays on `workflow-launch-ready`.
**Chain:** snapshot → `audit-code-review` → (`split-to-prs`) → `workflow-git-commit` → `workflow-pr` → `babysit`
**Related:** `audit-code-review`, `workflow-git-commit`, `workflow-pr`, `workflow-quality-gate`, `workflow-launch-ready`, `housekeep-backlog`, `docs-adr`, `split-to-prs`, `babysit`

#### `workflow-launch-ready`
**Triggers:** "prepare for launch", "launch week", "everything before going live", "is the app launch-ready?", "pre-launch sweep", "ship it to the world", "launch prep"
**What it does:** Full launch preparation sweep. Sequences: SEO (`enhance-web-seo`) → PWA (`enhance-pwa`) → bundle (`audit-bundle-size`) → i18n (`audit-i18n`) → quality gate (`workflow-quality-gate`) → deploy smoke (`deploy-verify`) → day-1 iteration (`iterate-post-launch`). Produces a launch checklist with go/no-go verdict. Local dirty-tree PR prep is `workflow-release-prep`.
**Chain:** `enhance-web-seo` → `enhance-pwa` → `audit-bundle-size` → `audit-i18n` → `workflow-quality-gate` → `deploy-verify` → `iterate-post-launch`
**Related:** `workflow-quality-gate`, `iterate-post-launch`, `deploy-verify`, `workflow-release-prep`

#### `workflow-mobile-native-uiux`
**Triggers:** "fix our mobile UI/UX", "fix our mobile UI/UX end to end", "native pass to a PR", "feel native and ship", "make the app feel native and ship it"
**What it does:** End-to-end native UI/UX run on an existing Capacitor, Expo, or React Native app, on one branch: baseline screenshots + scorecard → separate web/native surfaces (hybrid only) → Capacitor shell plumbing (Capacitor only) → the native-feel pass → WCAG 2.2 AA accessibility (fixes on touched screens) → native layout cells (landscape, tablet) → Android 16 device QA with back / font-scale / reduce-motion / large-screen probes → one PR with before/after, scorecard, probe table, and a store-build flag.
**Chain:** `enhance-capacitor-ui` → `mobile-capacitor-platform` → `enhance-mobile-native-feel` → `audit-accessibility` → `audit-responsive` → `mobile-emulator-test` → `workflow-pr`
**Related:** `enhance-mobile-native-feel`, `mobile-capacitor-platform`, `plan-mobile-readiness`, `plan-capacitor-hardening`, `mobile-rn-screen`

#### `workflow-gtm`
**Triggers:** "go to market", "grow users", "increase traffic and visibility", "market this repo", "get this in front of users", "/gtm"
**What it does:** Go-to-market sequence for a product that already works. Step 1 runs `plan-gtm` (inventory + founder interview + `plan-gtm.md`) and **stops for approval**; approved phases then run in the order that compounds: measure (`audit-analytics`) → message (`enhance-web-conversion`; repo-as-product: `audit-registry-listing` then `enhance-readme`) → activate (`enhance-onboarding`, `enhance-lifecycle-email`) → be found (`enhance-web-seo`, `docs-comparison-pages`, `plan-aeo-readiness`) → launch (`docs-launch-kit`, `enhance-growth-loops`) → weekly loop (`iterate-gtm-weekly`). Monetize phase: `plan-pricing` ⏸ approve → `enhance-web-conversion` (pricing) + `enhance-lifecycle-email` (trial expiry). Ends with a GTM scorecard: funnel table before/after, each step's status or skip reason, next week's one fix. Technical launch readiness (PWA, bundle, quality gate) stays on `workflow-launch-ready`.
**Chain:** `plan-gtm` ⏸ → `audit-analytics` → `enhance-web-conversion` → `enhance-onboarding` + `enhance-lifecycle-email` → `enhance-web-seo` / `docs-comparison-pages` / `plan-aeo-readiness` → `docs-launch-kit` + `enhance-growth-loops` → `iterate-gtm-weekly`
**Related:** `plan-gtm`, `plan-pricing`, `audit-analytics`, `audit-registry-listing`, `enhance-web-conversion`, `enhance-onboarding`, `enhance-lifecycle-email`, `enhance-web-seo`, `docs-comparison-pages`, `plan-aeo-readiness`, `docs-launch-kit`, `enhance-growth-loops`, `iterate-gtm-weekly`, `workflow-launch-ready`, `plan-aso`

---

### Docs

#### `docs-launch-kit`
**Triggers:** "launch post", "Show HN post", "Product Hunt listing", "announce this release", "launch copy", "write the launch tweet", "/launch-kit"
**What it does:** Writes `docs/launch/<version>.md` from the repo's real features: a claims table (claim → source → verified) that every sentence must trace to, one problem-first angle, native copy per channel (Show HN title + first comment in sober technical tone; Product Hunt tagline ≤60 chars + gallery + maker comment; subreddit-specific Reddit posts with the rules quoted; X/Bluesky/LinkedIn hook + demo; dev.to/blog article outline with canonical URL; user-facing release notes), a launch calendar (existing users → Show HN Tue–Thu 12–17 UTC → communities → Product Hunt a week later → article), UTM links per channel, and a Results table filled after 7 days. No vote solicitation, no fabricated proof, maker disclosed. Launch is a cadence — one kit per meaningful release.
**Related:** `plan-gtm`, `enhance-readme`, `docs-writer`, `plan-antislop`, `enhance-web-seo`, `iterate-post-launch`, `deploy-npm`

#### `docs-comparison-pages`
**Triggers:** "comparison page", "vs page", "alternatives to", "competitor page", "migration guide from", "X vs Y page"
**What it does:** Writes ≤5 honest bottom-funnel pages per pass — `<product> vs <alt>`, `<alt> alternatives`, `migrate from <alt>` — from facts fetched and dated this session (competitor pricing/limits with URL + date in a source block; product facts from the repo). Fixed shape: two-sentence verdict, 6–10-row table with checked-on dates, where the alternative wins, where this product wins with a real artifact, migration steps and code, 3–5 objection FAQs, sources. Frontmatter `lastVerified` + `reviewEvery: 90d` and a visible "checked on" line; a page past review is re-verified or unpublished. Comparison pages took 78% of clicks from 28% of pages in one 162-page test; bulk templated batches are the Google scaled-content target, so this skill refuses them. Meta/schema → `enhance-web-seo`.
**Related:** `plan-gtm`, `enhance-web-seo`, `plan-aeo-readiness`, `docs-writer`, `plan-antislop`, `docs-launch-kit`, `test-playwright`

#### `docs-writer`
**Triggers:** "write documentation", "README", "API docs", "document this", "create docs", "architecture docs"
**What it does:** Writes developer-facing README content, API references, code comments, changelog entries, and architecture docs. Visual README makeovers and docs/code drift plans have dedicated owners.
**Related:** `docs-coauthor`, `design-prd`, `docs-adr`, `enhance-readme`, `plan-docs-sync`

#### `docs-adr`
**Triggers:** "record this decision", "set up ADRs", "why did we choose X", "the agent keeps suggesting Y again", "/adr"
**What it does:** Lightweight Architecture Decision Records as agent-readable memory — `docs/adr/` + INDEX.md, one page each, **Rejected alternatives** required, supersede-not-edit. Agent rules load the index and forbid silent contradiction of Accepted ADRs. Backfill the decisions every new agent tries to "fix" first. Complements `plan-docs-sync` (what the code is) and `/handoff` (session state).
**Related:** `plan-docs-sync`, `handoff`, `docs-writer`, `docs-coauthor`, `enhance-arch-boundaries`, `enhance-agent-guardrails`, `workflow-housekeep`, `housekeep-backlog`

#### `docs-coauthor`
**Triggers:** "write a doc", "draft proposal", "help me document", "create spec", "design document", "PRD", "RFC"
**What it does:** Three-stage workflow: Context Gathering (questions, info dump), Refinement & Structure (brainstorm, curate, draft per section), Reader Testing (predict questions, verify answers, fix gaps). Repo decision-memory system → `docs-adr`.
**Related:** `docs-writer`, `design-prd`, `docs-adr`

---

### Meta

The pack self-audit, [`audit-skill-conflicts`](#audit-skill-conflicts), is listed under Audit; run it after adding a batch of skills.

#### `meta-skill-creator` *(Apache-2.0, adapted from Anthropic)*
**Triggers:** "author a kenji skill", "SKILL.md format", "skill structure", "skill best practices"
**What it does:** Guide for creating effective AI agent skills with proper frontmatter, descriptions, progressive disclosure structure, and concise body. New skills inherit T1–T8, including the `effort:` declaration (see [PROMPT-ENHANCEMENT-PLAYBOOK.md](PROMPT-ENHANCEMENT-PLAYBOOK.md)).
**Related:** `audit-skill-conflicts`, `enhance-skill-prompts`, `meta-mcp-builder`, `create-skill`

#### `meta-mcp-builder`
**Triggers:** "MCP", "Model Context Protocol", "AI tools", "LLM integration", "agent tools", "build MCP server"
**What it does:** Four-phase MCP server development: Research & Planning, Implementation (TypeScript/Python SDK), Review & Test, Create Evaluations.

---

## Subagents (6)

| Agent | Trigger | Output |
|-------|---------|--------|
| `code-reviewer` | Code changes, review request | Severity-ranked quality/security/type findings |
| `completion-judge` | Approved-plan, burndown, or wide-change completion claim | `PASS`, `CONTINUE`, or `BLOCKED` after reconciling outcome, state, diff, and fresh evidence |
| `db-migrator` | Migration, schema, new table | SQL/RLS/index guidance |
| `debugger` | Error, exception, unexpected behavior | Root cause and verified fix |
| `deploy-checker` | Deploy, ship, production | Pre-deploy readiness verdict |
| `perf-monitor` | Slow, laggy, optimize | Performance findings and priorities |

On Claude Code each agent's frontmatter `effort:` sets its depth; `completion-judge` and `code-reviewer` run at `high` in a fresh context and flag only correctness and requirement gaps.

---

## Commands (63)

Commands fall into two groups: **standalone** (full playbook in the file) and **pointer** (thin slash entry delegating to a skill).

### Standalone

| Command | File | Quick Reference |
|---------|------|-----------------|
| `/plan-mode` | `plan-mode.md` | Research, clarify, and approve a plan before coding (renamed from `/plan`; host `/plan` enters Plan mode) |
| `/fix-issue` | `fix-issue.md` | Fetch GitHub issue → `debug-error` / `workflow-fix-and-ship` → PR |
| `/mcp-guide` | `mcp-guide.md` | Essential MCP set plus playwright-cli (renamed from `/mcp`; host `/mcp` manages servers) |

### Pointer (delegates to skill)

| Command | Points to | Notes |
|---------|-----------|-------|
| `/burndown-full` | `burndown-full` | Finish a partial refactor/migration to 100% repo coverage (MATCH/DONE + verification gate) |
| `/research` | `research` | Three-phase Firecrawl deep research → gap analysis → implementation plan |
| `/complete-everything` | `complete-everything` | Close connected deferrals and prove the whole approved outcome with fresh tests |
| `/green-repo` | `workflow-green-repo` | Drive the whole repo to green (typecheck/lint/test/build) — authorized debt cleanup |
| `/ship-and-observe` | `workflow-ship-and-observe` | Deploy, verify the live revision, observe the stability window, roll back if needed |
| `/feedback-to-closure` | `workflow-feedback-to-closure` | Feedback → deduped durable tickets → fix → production-verified closure |
| `/commit` | `workflow-git-commit` | One conventional commit from an already-scoped change; no push |
| `/debug-issue` | `debug-error` | Hypothesis, then runtime evidence (renamed from `/debug`; host `/debug` is the bundled debugger) |
| `/pr` | `workflow-pr` | Validate and open/manage PR from an already-committed branch |
| `/release-prep` | `workflow-release-prep` | Dirty working tree → reviewed, merge-ready PR — do not merge |
| `/readme` | `enhance-readme`, `docs-writer` | Visual showcase + content sync |
| `/refactor` | `workflow-refactor` | Analyze → split → extract → verify behavior |
| `/review-code` | `audit-code-review` | Agent review + manual checklist (renamed from `/review` to avoid Claude Code's built-in `/review`) |
| `/test` | `test-unit`, `test-playwright`, `test-qa`, `test-exploratory`, `test-visual-regression`, `test-load`, `mobile-emulator-test` | Route to the test skill that matches the target |
| `/uiux` | `audit-responsive`, `audit-ui-states`, `audit-uiux-design-system`, `audit-ux`, `enhance-readability`, `enhance-web-instant-nav`, `enhance-web-ui`, `enhance-web-ux` | Audit + enhance UI/UX |
| `/readability` | `enhance-readability` | Comprehension — CPL, Gestalt grouping, visuals that cut verbosity |
| `/instant-nav` | `enhance-web-instant-nav` | Speculation Rules, bfcache, View Transitions, 103 Early Hints |
| `/responsive-audit` | `audit-responsive` | Linearized layout / breakpoint IA — desktop is not a wide phone |
| `/skill-conflicts` | `audit-skill-conflicts` | Pack self-audit — contradictions, trigger overlap, stale refs |
| `/gate-logic` | `audit-gate-logic` | CI gate logic — silent bypass, ratchet gaming, conflicting conditions |
| `/doctrine` | `audit-doctrine` | Custom lint/ratchet *content* — is the rule right, not merely enforced |
| `/codemod-safety` | `audit-codemod-safety` | Codemod / bulk-transform behavior-preservation |
| `/housekeep-gates` | `housekeep-gates` | Consolidate accreted CI gates into one aggregator |
| `/housekeep-backlog` | `housekeep-backlog` | Living BACKLOG.md of parked work — inventory, do not implement |
| `/test-mutation` | `test-mutation` | Mutation testing — do tests actually assert? |
| `/arch-boundaries` | `enhance-arch-boundaries` | Mechanically-enforced architecture boundaries |
| `/adr` | `docs-adr` | Architecture Decision Records as agent-readable memory |
| `/auth-flows` | `audit-auth-flows` | App-layer auth — route×gate, getSession vs getUser, middleware-as-only-gate |
| `/uiux-plan` | `plan-uiux-unification` | Full UI/UX unification plan (audit only, no fixes) |
| `/grill-me` | `workflow-grilling` | One-question-at-a-time interview to align before building |
| `/handoff` | `handoff` | Compact the conversation into a handoff doc for a fresh session |
| `/slop-plan` | `plan-antislop` | AI slop / authenticity audit + de-slop burndown (plan only) |
| `/rls-plan` | `plan-rls-audit` | Supabase RLS + access-control audit (plan only) |
| `/secrets-plan` | `plan-secrets-audit` | Secrets scan + rotate-vs-relocate plan (plan only) |
| `/validation-plan` | `plan-input-validation` | Input-validation + trust-boundary audit (plan only) |
| `/integrity-plan` | `plan-data-integrity` | Data-integrity + destructive-op safeguard plan (plan only) |
| `/error-plan` | `plan-error-handling` | Error-handling + observability audit (plan only) |
| `/deps-plan` | `plan-dependency-provenance` | Dependency provenance + slopsquatting audit (plan only) |
| `/deadcode-plan` | `plan-dead-code` | Dead-code audit + Knip baseline and ratchet plan (plan only) |
| `/deadcode` | `plan-dead-code`, `housekeep-dead-code` | Audit then delete by category behind a ratchet |
| `/cost-plan` | `plan-llm-cost-guardrails` | LLM cost guardrails audit (plan only) |
| `/aeo-plan` | `plan-aeo-readiness` | Answer-engine / AEO readiness audit (plan only) |
| `/gtm-plan` | `plan-gtm` | Go-to-market audit + founder interview → phased GTM plan (plan only) |
| `/gtm` | `workflow-gtm` | Plan → approve → measure → message → activate → be found → launch → weekly loop |
| `/launch-kit` | `docs-launch-kit` | Versioned launch kit — Show HN, Product Hunt, Reddit, X/LinkedIn, article, release notes, calendar, UTMs |
| `/pricing-plan` | `plan-pricing` | Value metric, tiers, price corridor, research plan (plan only) |
| `/gtm-weekly` | `iterate-gtm-weekly` | Weekly funnel read → one experiment → one post → scorecard row |
| `/mobile-plan` | `plan-mobile-readiness` | App Store / Play submission audit (plan only) |
| `/capacitor-plan` | `plan-capacitor-hardening` | Capacitor native-layer security audit (plan only) |
| `/privacy-plan` | `plan-privacy-compliance` | Privacy / GDPR / APPI / store-label audit (plan only) |
| `/backup-plan` | `plan-backup-dr` | Backup + DR capability audit (plan only) |
| `/aso-plan` | `plan-aso` | App Store / Play listing ASO plan (plan only) |
| `/stub-plan` | `plan-stub-checker` | Stub/dead-link/fake-component audit + wiring plan (no fixes) |
| `/perf-plan` | `plan-perf-audit` | Performance audit + optimization plan (no fixes) |
| `/security-plan` | `plan-security-audit` | Security/OWASP hardening plan (no fixes; RLS → `/rls-plan`) |
| `/docs-plan` | `plan-docs-sync` | Docs drift audit + sync plan (no rewrites) |
| `/test-plan` | `plan-test-coverage` | User-story test coverage audit + plan (no tests written) |
| `/update-deps` | `workflow-housekeep` (Phase 3) | Audit and update dependencies safely |

---

## Skill Composition Patterns

> **Prefer bundled workflows** (`workflow-build-feature`, `workflow-fix-and-ship`, `workflow-quality-gate`, `workflow-launch-ready`) for multi-phase tasks. Use individual skills when the request is scoped to one phase.

### Highest-impact combos (copy into chat)

These are the loops that move a product the most. Paste the phrase; the pack chains the rest.

| You want… | Paste this | What it chains |
|-----------|------------|----------------|
| Find real breaks as a confused user, then lock them | `monkey-test as guest and logged-in, ticket every real bug, then lock a Playwright pass on the worst ones` | `test-exploratory` → `workflow-feedback-to-closure` → `test-playwright` |
| Pre-release go/no-go with a live identity probe | `wander the app as guest vs logged-in, then run the quality gate` | `test-exploratory` → `workflow-quality-gate` |
| Build a feature end-to-end | `build this feature` | `workflow-build-feature` (spec → TDD → `test-playwright` → PR) |
| Fix a bug and ship it | `fix this bug and ship it` | `workflow-fix-and-ship` |
| Close a plan with nothing parked | `complete everything` | `complete-everything` |
| Ship and watch it | `ship it and watch it` | `workflow-ship-and-observe` |

### Bundled workflows (start here)

| Intent | Bundled skill | What it chains |
|--------|--------------|----------------|
| Close a plan with no connected deferrals | `complete-everything` | durable closure set → conditional specialists → full verification → completion judge |
| Build a feature end-to-end | `workflow-build-feature` | spec → TDD → unit tests → smoke → PR |
| Fix a bug and ship it | `workflow-fix-and-ship` | debug → fix → smoke → PR → deploy |
| Pre-release quality check | `workflow-quality-gate` | (optional explore) → red-team → security → bundle → perf → unit tests |
| Full launch preparation | `workflow-launch-ready` | SEO + PWA + bundle + i18n + quality gate + deploy + iterate |
| Make an existing mobile app feel native, verified | `workflow-mobile-native-uiux` | surfaces → Capacitor plumbing → native feel → a11y → layout → device QA → PR |
| Take a shipped product to market | `workflow-gtm` | plan-gtm ⏸ approve → analytics → conversion → onboarding + lifecycle email → SEO / comparison pages / AEO → launch kit + loops → `iterate-gtm-weekly` |
| Green the whole repository (authorized) | `workflow-green-repo` | discover gates → enumerate failures → batch fix → prove green from scratch |
| Deploy to production and observe | `workflow-ship-and-observe` | preflight → deploy → verify live revision → observe → stable/rollback |
| Feedback → tracked → verified closed | `workflow-feedback-to-closure` | gather → dedupe → tickets → fix → verify live → close |

### Chaining diagram

```
workflow-build-feature
  └─ workflow-spec-tdd → test-unit → test-playwright → workflow-pr

workflow-fix-and-ship
  └─ debug-error → test-playwright → workflow-pr → deploy-verify

workflow-quality-gate
  └─ (optional live probe) test-exploratory
     → test-red-team → audit-security → audit-bundle-size → audit-performance → test-unit

test-exploratory → workflow-feedback-to-closure → test-playwright
  └─ guest+authed wander → durable tickets → lock the worst bugs

workflow-launch-ready
  └─ enhance-web-seo → enhance-pwa → audit-bundle-size → audit-i18n
     → workflow-quality-gate → deploy-verify → iterate-post-launch

workflow-mobile-native-uiux
  └─ (hybrid) enhance-capacitor-ui → (Capacitor) mobile-capacitor-platform
     → enhance-mobile-native-feel → audit-accessibility → audit-responsive
     → mobile-emulator-test → workflow-pr

workflow-ship-and-observe
  └─ preflight (green) → deploy → verify live revision → observe window
     → stable OR rollback/hotfix

workflow-gtm
  └─ plan-gtm (inventory + interview) ⏸ approve
     → audit-analytics → enhance-web-conversion → enhance-onboarding (+ enhance-lifecycle-email)
     → enhance-web-seo / docs-comparison-pages / plan-aeo-readiness
     → docs-launch-kit (+ enhance-growth-loops) → iterate-gtm-weekly
     monetize: plan-pricing ⏸ approve → enhance-web-conversion (pricing)

workflow-feedback-to-closure
  └─ gather → dedupe → durable tickets → fix (workflow-fix-and-ship /
     complete-everything) → verify live → close
```

### Specialist compositions (individual skills)

#### Exploratory QA → tickets → lock (guest vs logged-in)
`test-exploratory` → `workflow-feedback-to-closure` → `test-playwright`

Optional pre-gate: `test-exploratory` → `workflow-quality-gate` (wander first; red-team still owns the hostile matrix).

#### Full Feature Build (manual)
`workflow-spec-tdd` → `backend-patterns` + `design-api` + `backend-error-handling` + `audit-security`

#### Six-Skill Plan Loop (audit → approve → execute)

See **[docs/PLAN-LOOPS.md](PLAN-LOOPS.md)** for diagrams, prompts, and execution mapping.

```
plan-uiux-unification → plan-antislop (optional) → plan-stub-checker → plan-test-coverage
  → plan-perf-audit ∥ plan-security-audit → plan-docs-sync
```

After approval: `enhance-web-ux`, `docs-writer`, `audit-i18n`, `debug-fe-be-integration`, `test-unit`, `audit-performance`, `audit-security`, `docs-writer`, `test-playwright`

#### Anti-Slop / Authenticity Pass
`plan-antislop` → user approval per phase → `docs-writer` / `audit-i18n` (copy) → `enhance-web-ui` (visual) → `enhance-web-ux` (IA) → `test-playwright` → re-run `plan-antislop`

#### Security Spine (layered pre-launch)
See **[docs/PLAN-LOOPS.md](PLAN-LOOPS.md)** — five layers with cross-hand references:

```
plan-input-validation → plan-secrets-audit → plan-rls-audit → plan-data-integrity → plan-error-handling
```

After approval: `backend-patterns`, `db-migrator`, `backend-observability`, provider rotation, infra gates → `test-playwright` + `test-red-team`

#### Observability & Spend Loop
`plan-error-handling` + `plan-llm-cost-guardrails` → approval → `backend-observability`, `audit-langfuse-llm`, `backend-patterns` · hosting bill → `audit-infra-cost` · LLM attacks → `audit-llm-security`

#### Launch Gates
`plan-capacitor-hardening` → `plan-mobile-readiness` (Capacitor pre-store) · `plan-privacy-compliance` · `plan-aso` · `plan-aeo-readiness` → `enhance-web-seo` / `docs-writer`

#### Go-to-market loop (shipped product, wants users)
`plan-gtm` → founder approval per phase → `audit-analytics` (measure) → `enhance-web-conversion` (hero) → `enhance-onboarding` + `enhance-lifecycle-email` (activate) → `enhance-web-seo` + `docs-comparison-pages` + `plan-aeo-readiness` (be found) → `docs-launch-kit` + `enhance-growth-loops` (launch) → `iterate-gtm-weekly` · monetize: `plan-pricing` → `enhance-web-conversion` (pricing) · repo-as-product adds `audit-registry-listing` → `enhance-readme` · mobile adds `plan-aso`

#### Stub & Wiring Audit
`plan-stub-checker` → user approval → `debug-fe-be-integration` → `workflow-fix-and-ship` → `test-playwright`

#### Performance Fix
`audit-performance` → `backend-db-performance` + `audit-code-quality` + `workflow-refactor`

#### Design System Sprint
`plan-uiux-unification` → user approval → `audit-responsive` + `enhance-web-ux` + `enhance-web-ui` → `audit-accessibility` + `design-mobile-first` + `design-theme`

#### LLM Quality Cycle
`audit-langfuse-llm` → `debug-sentry-monitor` → `deploy-verify`

#### UX Polish
`audit-ux` → `enhance-web-ux` → `enhance-web-ui` → `/commit`

#### Responsive layout / breakpoint IA
`audit-responsive` → `enhance-web-ui` / `enhance-web-ux` → `test-playwright`

#### Lock UI after layout + state audits
`audit-responsive` + `audit-ui-states` → `test-visual-regression`

#### LLM security (app-facing)
`audit-llm-security` → `plan-input-validation` / `plan-llm-cost-guardrails`

#### Consumer launch (privacy → store)
`plan-privacy-compliance` → `audit-analytics` → `audit-ui-states` → `audit-responsive` → `plan-aso`

#### Disaster recovery
`plan-backup-dr` → `plan-data-integrity`

#### Product analytics → iterate
`audit-analytics` → `iterate-post-launch`

#### Traffic + spend
`test-load` → `audit-infra-cost` → `backend-patterns`

#### Paid mobile app
`audit-monetization-iap` → `audit-payment-system`

#### Prod config drift
`audit-env-parity` → `plan-secrets-audit`

#### Email inbox placement
`enhance-email-deliverability` + `design-email`

#### After adding a batch of skills
`audit-skill-conflicts` → `meta-skill-creator` (description rewrites first)

#### Gate soundness vs pipeline cost
`audit-gate-logic` (does the gate stop what it claims) × `audit-cicd` (is the pipeline cheap/fast/safe to run)

#### Doctrine vs enforcement
`audit-doctrine` (is the rule *right*) × `audit-gate-logic` (is it enforced) → `housekeep-gates` (consolidate) / `housekeep-backlog` (un-remedied axes). Token SSOT → `housekeep-design`. Divergence → `docs-adr`.

#### Accreted gates → one aggregator
`audit-gate-logic` (Phase 2.5 archaeology) → `housekeep-gates` (consolidate, delete losers, prove)

#### Dead weight → proven dead → ratcheted
`plan-test-coverage` (lock behavior first) → `plan-dead-code` (config, baseline, keep/kill) → `housekeep-dead-code` (delete by category, install `--max-issues`) → `housekeep-gates` (one aggregator). Duplication → `workflow-refactor`. Schema drops → `plan-data-integrity` / `db-migrator`.

#### Parked work → living register → execute
`housekeep-backlog` (inventory + diff) → `complete-everything` / `burndown-full` (one plan or one mechanical change). Decisions → `docs-adr`. Flag debt → `workflow-feature-flag`.

#### Pre-release trio
`housekeep-backlog` (what's not done) → `workflow-release-prep` (what's done, onto a merge-ready PR) → `docs-adr` (decisions along the way)

#### Anti-entropy stack
`audit-gate-logic` / `housekeep-gates` (soundness) → `test-mutation` (assertion strength) → `enhance-arch-boundaries` (structure) → `docs-adr` (memory)

#### Auth defense in depth
`audit-auth-flows` (app layer: route×gate, session, getSession) → `plan-rls-audit` (data layer) → `plan-secrets-audit` (keys)

#### Bulk transform slipped past CI
`audit-codemod-safety` → `audit-gate-logic` (if size defeated review) → `plan-test-coverage` / `test-visual-regression`

#### Native RN Ship Loop
`mobile-emulator-start` → `mobile-emulator-test` → `workflow-pr` → `deploy-verify`

#### Cross-Surface UI Architecture
`enhance-capacitor-ui` → `enhance-web-ui` → `enhance-web-ux`

#### Repo Maintenance
`workflow-housekeep` → `docs-writer` + `workflow-refactor` + `audit-code-review`

#### Third-Party UI Pipeline
`thirdparty-ui-ux-pro-max` (design system) → implement → `thirdparty-emil-design-eng` (motion) → `thirdparty-web-interface-guidelines` (Vercel compliance) → `/commit`

See [THIRD-PARTY-SKILLS.md](./THIRD-PARTY-SKILLS.md) for attribution and update policy.

---

## Third-Party Skills (Adapted)

Upstream-maintained skills vendored with `thirdparty-` prefix. Each includes `ATTRIBUTION.md`. See [CONTRIBUTING.md](./CONTRIBUTING.md) for update policy.

#### `thirdparty-emil-design-eng`
**Triggers:** "emil-design-eng", "emil design", "thirdparty-emil-design-eng", "Sonner-style components"
**What it does:** Emil Kowalski's design-engineering notes (animation craft, Sonner-style components). Name-gated — not a generic UI or motion pass.
**Upstream:** [emilkowalski/skills](https://github.com/emilkowalski/skills)
**Related:** `thirdparty-web-interface-guidelines`, `design-motion`, `enhance-web-ui`

#### `thirdparty-ui-ux-pro-max`
**Triggers:** "ui-ux-pro-max", "thirdparty-ui-ux-pro-max", "look up a palette from the pro-max catalog"
**What it does:** Generates tailored design systems via Python search scripts (`scripts/search.py`). 67 styles, palettes, typography, stack-specific guidelines.
**Upstream:** [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
**Related:** `design-system`, `design-frontend`, `thirdparty-web-interface-guidelines`

#### `thirdparty-web-interface-guidelines`
**Triggers:** "Vercel guidelines", "web interface guidelines", "thirdparty-web-interface-guidelines"
**What it does:** Reviews UI code against Vercel Web Interface Guidelines — accessibility, focus, forms, animation, performance, navigation, copy. Terse file:line output.
**Upstream:** [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) · [vercel.com/design/guidelines](https://vercel.com/design/guidelines)
**Related:** `audit-accessibility`, `audit-uiux-design-system`, `thirdparty-emil-design-eng`

**Slash command:** `/thirdparty-web-interface-guidelines <file>` — installed by `./install.sh` to `~/.cursor/commands/`.

---

## Cursor-Specific Skills (12)

These extend Cursor itself — stored in `~/.cursor/skills-cursor/`.

| Skill | What it does |
|:------|:-------------|
| `babysit` | Keep an already-open PR merge-ready — comments, conflicts, CI. Do not merge. Dirty tree → `workflow-release-prep` |
| `canvas` | Live React canvas beside chat — rich data visualizations, interactive tools |
| `create-hook` | Create Cursor hooks — scripts/prompts for before/after agent events |
| `create-rule` | Create `.cursor/rules/` files for persistent AI guidance |
| `create-skill` | Create new Agent Skills in `~/.cursor/skills/` |
| `create-subagent` | Create custom subagents in `.cursor/agents/` |
| `migrate-to-skills` | Convert rules/commands to Skills format |
| `shell` | Direct shell execution without interpretation |
| `split-to-prs` | Slice one pile into reviewable PRs. Whole dirty tree to one merge-ready PR → `workflow-release-prep` |
| `statusline` | Configure CLI status line — model, context, git info |
| `update-cli-config` | Modify CLI settings — permissions, sandbox, vim mode |
| `update-cursor-settings` | Modify Cursor/VSCode `settings.json` |
