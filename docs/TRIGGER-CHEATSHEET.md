# Trigger Cheat Sheet

Say any phrase in the left column → the skill in the right column fires.

You don't have to type the skill name. Just describe the task in plain language.

> **First time here?** The [Getting Started guide](GETTING-STARTED.md) explains what skills, commands, and subagents are in plain language before you dive into this lookup table.

---

## Bundled workflows (start here for multi-phase tasks)

| Say this in chat | Skill |
|:-----------------|:------|
| "complete everything", "don't defer", "fix out of scope too", "finish the whole plan", "close every TODO" | `complete-everything` |
| "finish the burndown", "it stopped halfway", "apply this everywhere", "complete the refactor", "half-migrated", "make sure nothing was missed" | `burndown-full` |
| "build a feature", "implement this", "add X end-to-end", "ship a new capability" | `workflow-build-feature` |
| "fix this bug and ship it", "patch this and close the ticket", "fix and deploy" | `workflow-fix-and-ship` |
| "is this ready to ship?", "quality gate", "pre-release checklist", "ship-readiness" | `workflow-quality-gate` |
| "prepare this for a PR", "get my working tree merge-ready", "release prep this branch", "review everything uncommitted and open a PR" | `workflow-release-prep` |
| "prepare for launch", "launch week", "everything before going live", "pre-launch sweep" | `workflow-launch-ready` |
| "fix our mobile UI/UX", "native pass to a PR", "feel native and ship" | `workflow-mobile-native-uiux` |
| "go to market", "grow users", "increase traffic and visibility", "market this repo", "get this in front of users" | `workflow-gtm` |
| "I'm new to this repo", "orient me", "explain this codebase", "onboard me" | `workflow-onboard` |

---

## Audits & code quality

| Say this in chat | Skill |
|:-----------------|:------|
| "audit accessibility", "WCAG audit", "check a11y", "check keyboard nav" | `audit-accessibility` |
| "reduce bundle size", "why is the bundle so big", "tree shaking", "code splitting" | `audit-bundle-size` |
| "code smell", "anti-pattern", "naming conventions", "tech debt" | `audit-code-quality` |
| "audit our npm listing", "README as landing page", "GitHub topics", "why nobody finds the package", "check the tarball" | `audit-registry-listing` |
| "code review", "review this PR", "review this function" | `audit-code-review` |
| "did this codemod break anything", "audit this bulk refactor", "verify the migration mod", "check the mass find-replace" | `audit-codemod-safety` |
| "audit database schema", "check my DB design", "naming conventions in DB" | `audit-db-schema` |
| "audit my API calls", "check frontend API", "FE-BE contract" | `audit-fe-api` |
| "CI/CD cost", "GitHub Actions bill", "Actions minutes", "runner cost", "workflow cost", "slow CI", "audit my workflows" | `audit-cicd` |
| "can our CI gates be bypassed", "audit the quality-gate logic", "is our coverage ratchet sound", "why did a regression pass CI", "check for conflicting workflows", "we have too many overlapping checks" | `audit-gate-logic` |
| "is this lint rule wrong", "the ratchet banned a legitimate pattern", "audit our guardrail doctrine", "appease the regex" | `audit-doctrine` |
| "clean up our CI checks", "we have three lint jobs", "make one quality gate", "consolidate the workflows" | `housekeep-gates` |
| "find dead code", "is this code used", "unused exports", "unused files", "run knip", "why is this file here" | `plan-dead-code` |
| "delete the dead code", "remove unused files", "wire up Knip", "stop dead code coming back" | `housekeep-dead-code` |
| "what's left behind", "inventory TODOs", "consolidate the backlog", "parked work register" | `housekeep-backlog` |
| "organize my Downloads", "sort my company folders", "file my receipts", "tidy my Drive" | `housekeep-files` |
| "audit i18n", "fix translations", "the Japanese feels like Google Translate", "hardcoded strings" | `audit-i18n` |
| "audit LLM quality", "check Langfuse", "audit prompts", "check AI quality", "check traces" | `audit-langfuse-llm` |
| "audit LLM security", "prompt injection", "jailbreak my chatbot", "is my AI safe", "OWASP LLM" | `audit-llm-security` |
| "audit our analytics", "are we tracking the right events", "funnel instrumentation", "consent-gated analytics" | `audit-analytics` |
| "check empty/error states", "audit loading states", "what happens when this fails", "zero-results" | `audit-ui-states` |
| "audit our IAP", "check subscriptions", "restore purchases broken", "are purchases validated" | `audit-monetization-iap` |
| "works locally but not in prod", "audit our environments", "config drift", "check env var config" | `audit-env-parity` |
| "hosting bill is high", "cut infra costs", "audit cloud spend", "reduce Supabase/Vercel costs" | `audit-infra-cost` |
| "audit my skills", "conflicting skills", "wrong skill triggered", "which skills overlap" | `audit-skill-conflicts` |
| "performance audit", "optimize performance", "slow page", "Web Vitals", "fetchpriority", "bfcache" | `audit-performance` |
| "instant navigation", "prerender next page", "speculation rules", "early hints", "back button reloads", "second page is slow" | `enhance-web-instant-nav` |
| "audit against realworld", "compare to realworld", "conduit conformance", "full-stack gap check", "what's missing to reach production" | `audit-realworld` |
| "resilience audit", "is this production-ready", "will it survive real traffic", "retries/timeouts/idempotency", "the 80% problem" | `audit-resilience` |
| "audit backend architecture", "which pattern should I use", "is my backend production-grade", "am I over-engineering", "sync vs event-driven", "cache-aside/CQRS/saga/db-per-service", "microservices resilience review" | `audit-backend-architecture` |
| "enforce module boundaries", "stop spaghetti imports", "add architecture rules", "agents keep importing across features" | `enhance-arch-boundaries` |
| "audit payment system", "payment gateway audit", "double charge / idempotency", "double-entry ledger", "reconciliation / settlement", "webhook signature / 3DS / SCA", "PCI DSS", "is my payment flow safe" | `audit-payment-system` |
| "audit security", "check for vulnerabilities", "OWASP", "security review" | `audit-security` |
| "audit our auth", "check middleware protection", "is getSession safe", "route gate coverage" | `audit-auth-flows` |
| "audit design system", "check token compliance", "design consistency" | `audit-uiux-design-system` |
| "UX audit", "usability review", "heuristic evaluation", "UX quality" | `audit-ux` |
| "audit user flows", "user story audit", "information architecture / IA audit", "can users find X", "users get lost", "navigation audit", "funnel drop-off", "task completion" | `audit-ux-journeys` |
| "responsive audit", "desktop looks like a phone", "linearized layout", "no max-width", "stacked at 1440", "stretched buttons on desktop", "breakpoint gaps" | `audit-responsive` |
| "set up guardrails", "stop vibe-coding regressions", "pre-commit security checks", "CI security gates", "governance for AI code" | `enhance-agent-guardrails` |

---

## Backend & data

| Say this in chat | Skill |
|:-----------------|:------|
| "slow query", "add index", "N+1", "database timeout", "optimize query" | `backend-db-performance` |
| "error boundary", "error toast", "standardize API errors" | `backend-error-handling` |
| "add logging", "instrument this", "why can't I debug prod", "set up alerts" | `backend-observability` |
| "queue jobs", "caching layer", "rate limiting", "server actions", "edge function" | `backend-patterns` |
| "real-time", "live updates", "WebSocket", "chat", "collaborative", "presence" | `backend-realtime` |
| "build a pipeline", "sync X into Y", "nightly aggregation", "cron double-counts", "dedupe" | `data-pipeline` |
| "chart", "graph", "dashboard", "D3", "Recharts", "data visualization" | `data-visualization` |

---

## Debugging

| Say this in chat | Skill |
|:-----------------|:------|
| "debug this error", "fix this bug", "something isn't working" | `debug-error` |
| "API error", "4xx/5xx", "frontend-backend mismatch", "request is wrong" | `debug-fe-be-integration` |
| "check Sentry", "fix Sentry errors", "triage errors", "production errors" | `debug-sentry-monitor` |

---

## Deploying & releasing

| Say this in chat | Skill |
|:-----------------|:------|
| "publish this package", "release to npm", "ship a new npm version" | `deploy-npm` |
| "verify deploy", "post-deploy check", "smoke test production", "ship or rollback" | `deploy-verify` |
| "ship it", "ship it and watch it", "deploy to production", "go live", "roll this out", "promote to prod", "release this" | `workflow-ship-and-observe` |
| "post-launch polish", "what should I fix next", "iterate on prod feedback", "make it better based on real usage" | `iterate-post-launch` |
| "weekly growth review", "what should we do this week for growth", "GTM check-in", "growth standup" | `iterate-gtm-weekly` |
| "triage this feedback", "turn these reports into tickets", "process the bug backlog", "close the loop on QA findings" | `workflow-feedback-to-closure` |

---

## Design & UI creation

| Say this in chat | Skill |
|:-----------------|:------|
| "design an API", "create endpoints", "REST API design", "GraphQL schema" | `design-api` |
| "create a poster", "design an infographic", "make a banner", "social graphic" | `design-canvas` |
| "build an email template", "transactional email", "welcome email", "email copy review" | `design-email` |
| "emails go to spam", "set up SPF/DKIM", "check email deliverability", "handle bounces" | `enhance-email-deliverability` |
| "build a component", "new UI page", "make this look good" | `design-frontend` |
| "generative art", "creative coding", "flow fields", "particle system" | `design-generative-art` |
| "mobile design", "touch UI", "small screen", "swipe", "safe area" | `design-mobile-first` |
| "add one animation", "hover effect on this button", "isolated micro-interaction" | `design-motion` |
| "write a PRD", "product requirements", "spec this feature", "what should we build" | `design-prd` |
| "grill me", "grill me before I build", "stress-test this plan", "interview me about this", "poke holes in this", "challenge my thinking" | `workflow-grilling` |
| "pin down terminology", "ubiquitous language", "glossary", "you're using the wrong words" | `docs-domain-modeling` |
| "UI/UX unification plan", "design system audit plan", "UI burndown", "unify design system", "plan UI overhaul", "audit UI without fixing" | `plan-uiux-unification` |
| "looks like AI slop", "reads like ChatGPT", "authenticity burndown", "de-slop" | `plan-antislop` |
| "RLS audit", "check my RLS", "row level security", "is my Supabase secure", "anyone can read my data", "service_role key", "lock down my tables" | `plan-rls-audit` |
| "errors aren't showing in Sentry", "fail silently", "empty catch blocks", "check my Langfuse", "observability before launch" | `plan-error-handling` |
| "validate my inputs", "XSS", "dangerouslySetInnerHTML", "Stripe webhook", "forge requests", "injection-safe" | `plan-input-validation` |
| "hardcoded secrets", "did I commit a key", "secret scan", "rotate keys", "are my API keys exposed" | `plan-secrets-audit` |
| "is my migration safe", "could I lose data", "agent might delete prod", "destructive operations" | `plan-data-integrity` |
| "can we recover if the DB dies", "audit our backups", "what's our RPO/RTO", "disaster recovery" | `plan-backup-dr` |
| "privacy compliance", "what data do we collect", "GDPR", "APPI", "App Store privacy labels" | `plan-privacy-compliance` |
| "optimize our app store listing", "improve app downloads", "ASO", "app store keywords" | `plan-aso` |
| "check my dependencies", "slopsquatting", "is this package real", "supply chain audit", "did the AI hallucinate a package" | `plan-dependency-provenance` |
| "cap my AI costs", "LLM bill could blow up", "token budget", "runaway agent loop", "per-user AI limits" | `plan-llm-cost-guardrails` |
| "AEO", "GEO", "do AI engines cite me", "llms.txt", "am I blocking AI crawlers", "ChatGPT visibility" | `plan-aeo-readiness` |
| "GTM", "go-to-market plan", "get more users", "grow traffic", "should this be freemium", "how do I market this repo" | `plan-gtm` |
| "pricing strategy", "what should I charge", "value metric", "seat vs usage", "are we underpriced" | `plan-pricing` |
| "App Store ready", "will Google Play reject", "privacy manifest", "data safety form", "pre-submission check" | `plan-mobile-readiness` |
| "Capacitor app secure", "WebView security", "secure storage tokens", "cleartext traffic", "allowNavigation", "OTA update safe" | `plan-capacitor-hardening` |
| "find dead buttons", "stub checker", "fake components", "unwired handlers", "dead links", "buttons that do nothing", "stub audit" | `plan-stub-checker` |
| "docs drift", "sync docs with code", "stale README", "onboarding docs broken", "phantom docs" | `plan-docs-sync` |
| "record this decision", "set up ADRs", "why did we choose X", "the agent keeps suggesting Y again" | `docs-adr` |
| "performance audit plan", "perf burndown", "measure before optimize", "plan performance improvements" | `plan-perf-audit` |
| "security audit plan", "OWASP audit", "hardening plan", "security burndown" | `plan-security-audit` |
| "test coverage plan", "traceability matrix", "fake-green tests", "what's not tested" | `plan-test-coverage` |
| "add mutation testing", "are our tests real", "can our test suite be gamed", "assertion theater" | `test-mutation` |
| "create a design system", "component library from scratch" | `design-system` |
| "apply brand colors", "consistent styling", "color palette", "apply theme" | `design-theme` |

---

## Documentation

| Say this in chat | Skill |
|:-----------------|:------|
| "help me write a spec", "co-author a doc", "write a proposal", "draft an RFC" | `docs-coauthor` |
| "write a README", "document this API", "write docs", "create documentation" | `docs-writer` |
| "launch post", "Show HN post", "Product Hunt listing", "announce this release", "launch copy", "write the launch tweet" | `docs-launch-kit` |
| "comparison page", "vs page", "alternatives to", "competitor page", "migration guide from" | `docs-comparison-pages` |

---

## Enhancing existing UI/UX

| Say this in chat | Skill |
|:-----------------|:------|
| "make this Capacitor/Ionic app work on all screen sizes" | `enhance-capacitor-ui` |
| "feels like a website", "not native", "add haptics", "immersive full screen", "declutter the home screen" | `enhance-mobile-native-feel` |
| "make it a PWA", "offline support", "service worker", "install prompt", "add to home screen" | `enhance-pwa` |
| "improve my README", "add screenshots to README", "make README prettier" | `enhance-readme` |
| "improve onboarding", "users sign up and leave", "time to value", "first-run experience", "activation rate" | `enhance-onboarding` |
| "pricing page", "improve conversion", "free to paid", "upgrade prompts", "paywall UX", "hero copy" | `enhance-web-conversion` |
| "referral program", "viral loop", "powered by badge", "get users to invite", "growth loop" | `enhance-growth-loops` |
| "onboarding emails", "trial expiry emails", "drip sequence", "win-back email", "lifecycle email" | `enhance-lifecycle-email` |
| "improve SEO", "add meta tags", "sitemap", "Open Graph", "Google indexing", "rich results" | `enhance-web-seo` |
| "emails go to spam", "set up SPF/DKIM", "check email deliverability", "handle bounces" | `enhance-email-deliverability` |
| "make this landing page look premium", "anti-slop design", "portfolio design" | `enhance-web-landing` |
| "redesign this page", "remove AI slop", "make this look hand-crafted" | `enhance-web-redesign` |
| "hard to read", "too dense", "reading level", "cognitive load", "turn this prose into a table" | `enhance-readability` |
| "make this page nicer", "better layout", "improve spacing", "polish UI" | `enhance-web-ui` |
| "improve UX", "this page feels bad", "fix user flow", "better information density" | `enhance-web-ux` |
| "add 3D", "WebGL hero", "Three.js scene", "cinematic scroll", "GSAP animation" | `enhance-web-web3d` |
| "motion pass", "animate the app", "micro-interactions across the app" | `enhance-motion` |
| "add one animation", "hover effect on this button" | `design-motion` |
| "clean up the design system now", "migrate to one button", "resolve token conflicts" | `housekeep-design` |
| "audit UI without fixing", "UI burndown", "IA audit before redesign" | `plan-uiux-unification` |
| "improve this form", "form validation", "accessible form", "multi-step form", "form error handling" | `enhance-web-forms` |

---

## Third-party (upstream-maintained)

| Say this in chat | Skill / command |
|:-----------------|:----------------|
| "emil-design-eng", "emil design", "Sonner-style components" | `thirdparty-emil-design-eng` |
| "ui-ux-pro-max", "look up a palette from the pro-max catalog" | `thirdparty-ui-ux-pro-max` |
| "Vercel guidelines", "web interface guidelines", "/thirdparty-web-interface-guidelines" | `thirdparty-web-interface-guidelines` or `/thirdparty-web-interface-guidelines <file>` |

Attribution and update policy → [THIRD-PARTY-SKILLS.md](./THIRD-PARTY-SKILLS.md)

---

## Meta (skill & MCP authoring)

| Say this in chat | Skill |
|:-----------------|:------|
| "build an MCP server", "integrate external API into Cursor" | `meta-mcp-builder` |
| "create a skill", "write a SKILL.md", "how do I make a skill" | `meta-skill-creator` |
| "enhance this skill's prompts", "upgrade skill authoring", "apply the prompt playbook" | `enhance-skill-prompts` |
| "audit my skills", "conflicting skills", "wrong skill triggered", "which skills overlap" | `audit-skill-conflicts` |

---

## Mobile (React Native & Capacitor)

| Say this in chat | Skill |
|:-----------------|:------|
| "keyboard covers the input", "status bar overlaps", "Capacitor push notifications", "deep linking", "OTA update", "App Store submission" | `mobile-capacitor-platform` |
| "fix our mobile UI/UX", "native pass to a PR", "feel native and ship" | `workflow-mobile-native-uiux` |
| "start emulator", "boot Metro", "Android emulator", "Expo dev-client" | `mobile-emulator-start` |
| "test on emulator", "QA Android build", "white screen", "adb reverse" | `mobile-emulator-test` |
| "React Native jank", "frame drops", "slow startup", "RN bundle too big" | `mobile-rn-performance` |
| "polish this RN screen", "this iOS screen looks off", "fix RN layout" | `mobile-rn-screen` |

---

## Protocol & guardrails

| Say this in chat | Skill |
|:-----------------|:------|
| "/research", "look up current docs", "what does the industry recommend", "research this before we implement" | `research` |
| "browser automation", "Playwright", "page navigation" (as pre-session setup) | `protocol-browser-anti-stall` |
| "parallel browser agents", "playwright session", "browser keeps stalling", "stay logged in for browser tests" | `protocol-browser-anti-stall` |

---

## Testing & QA

| Say this in chat | Skill |
|:-----------------|:------|
| "test this with Playwright", "test like a real user", "PDCA this" | `test-playwright` |
| "QA the app", "test CRUD", "test before release", "smoke test" | `test-qa` |
| "monkey test the app", "exploratory QA", "wander like a confused user", "guest vs logged in", "click everything" | `test-exploratory` |
| "red team this app", "attack my app", "break it", "find all the defects", "pre-launch hardening" | `test-red-team` |
| "write unit tests", "add test coverage", "write tests for this function" | `test-unit` |
| "add visual regression tests", "catch UI regressions", "screenshot testing" | `test-visual-regression` |
| "load test this", "will it handle launch traffic", "find the breaking point" | `test-load` |

Highest-impact combo: `test-exploratory` → `workflow-feedback-to-closure` → `test-playwright`. Pre-release: wander first, then `workflow-quality-gate`.

---

## Workflow & dev process

| Say this in chat | Skill |
|:-----------------|:------|
| "complete everything", "don't defer", "fix out of scope too", "finish the whole plan", "close every TODO" | `complete-everything` |
| "finish the burndown", "it stopped halfway", "apply this everywhere", "complete the refactor across all files", "make sure nothing was missed" | `burndown-full` |
| "make the repo green", "get CI passing", "fix all the failing tests", "clear the typecheck errors", "make the build pass" | `workflow-green-repo` |
| "is this ready to run", "set up the environment", "preflight the repo", "before we start the big task", "why won't the tests run" | `workflow-environment-ready` |
| "the agent stopped early again", "it said done but wasn't", "it gamed the test", "add a guard so this doesn't recur" | `iterate-agent-harness` |
| "think before coding", "simplicity first", "stop overcomplicating" | `workflow-coding-discipline` |
| "add a feature flag", "gradual rollout", "kill switch", "dark launch", "canary release" | `workflow-feature-flag` |
| "commit my changes", "write a commit message" | `workflow-git-commit` |
| "resolve the conflicts", "fix this merge", "the rebase is stuck" | `workflow-merge-conflicts` |
| `/handoff` (user-invoked only) — compact the session into a handoff doc | `handoff` |
| "clean up the repo", "update README", "update dependencies", "delete the log files" | `workflow-housekeep` |
| "I'm new to this repo", "orient me", "explain this codebase", "catch me up" | `workflow-onboard` |
| "run agents in parallel", "best-of-N", "compare approaches", "multi-model" | `workflow-parallel-agents` |
| "create a PR", "write pull request", "manage PR review", "merge PR" | `workflow-pr` |
| "prepare this for a PR", "get my working tree merge-ready", "release prep this branch" | `workflow-release-prep` |
| "refactor this", "clean up code", "reduce duplication", "improve readability" | `workflow-refactor` |
| "build this properly", "spec first", "TDD", "stop vibe-coding" | `workflow-spec-tdd` |
