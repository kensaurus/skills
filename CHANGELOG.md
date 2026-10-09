# Changelog

All notable additions and changes to kenji (`kensaurus/skills`, named `cursor-kenji` before 2.0.0) are listed here.

---

## [Unreleased]

### Added

- **Workflow chains in frontmatter** ([ADR-0014](docs/adr/0014-workflow-chains-in-metadata.md)).
  Mushi Mushi runs a workflow skill as a pipeline of the skills it calls, but
  it found them by scanning the body for `skills/<slug>/SKILL.md` paths, which
  the workflows no longer write, so every workflow ran as one step. Each
  workflow that runs other skills now declares them as
  `metadata.chain: "a b c"`, in run order, inside the Agent Skills spec (string
  values only). Optional steps, routers and "see also" mentions stay out.
  `validate-skills` fails on an unknown or repeated slug.
  - `workflow-build-feature`: `workflow-spec-tdd test-unit test-playwright workflow-pr`
  - `workflow-fix-and-ship`: `debug-error test-playwright workflow-pr`
  - `workflow-quality-gate`: `test-red-team audit-security audit-bundle-size audit-performance test-unit`
  - `workflow-launch-ready`: `enhance-web-seo enhance-pwa audit-bundle-size audit-i18n workflow-quality-gate deploy-verify iterate-post-launch`
  - `workflow-gtm`: the seven-step sequence, `plan-gtm` through `iterate-gtm-weekly`
  - `workflow-release-prep`: `audit-code-review workflow-git-commit workflow-pr`
- **`workflow-mobile-native-uiux`**: the end-to-end native UI/UX run on an
  existing Capacitor, Expo, or React Native app. Baseline screenshots and
  scorecard, then `enhance-capacitor-ui` (hybrid only) →
  `mobile-capacitor-platform` (Capacitor only) → `enhance-mobile-native-feel` →
  `audit-accessibility` → `audit-responsive` → `mobile-emulator-test` →
  `workflow-pr`, on one branch, ending in one PR that says whether a store
  build is needed.

### Changed

- **Mobile skills checked against 2026 primary sources** (Apple HIG, Android 15
  and 16 behavior changes, Google Play target-SDK policy, Capacitor 8 docs and
  changelog, WCAG 2.2, MDN compat data, Expo SDK 54–58 changelogs; read
  2026-10-08). Each skill now owns one job and points to the others:
  - `mobile-capacitor-platform` owns the shell plumbing: a *Native shell
    plumbing* table (SystemBars and safe-area CSS, dead `StatusBar` config,
    keyboard resize, splash, Android back, haptics defaults, large screens),
    each row with a device probe and a done line; Capacitor 8, targetSdk 36,
    and Xcode 26 floors with their dates.
  - `enhance-mobile-native-feel`: Android back is part of the chrome step and a
    scorecard gate; Expo edge-to-edge is mandatory from SDK 54 (was "SDK 53+
    default"); Capacitor's `impact()` defaults to `Heavy`; Liquid Glass stays
    in the control layer; the Capacitor edge-to-edge block moved to its owner.
  - `design-mobile-first`: the WCAG 2.2 rules it lacked — 2.5.8 target-size
    floor (24 px) under the 44 px goal, 2.5.7 tap alternatives for every drag,
    2.4.11 `scroll-padding` under fixed bars; `dvh` sheets with a close button;
    a probe table replaces the one-line validation.
  - `audit-accessibility` claimed WCAG 2.2 AA but checked none of the AA
    criteria new in 2.2. It now probes 2.4.11, 2.5.7, 2.5.8, and 3.3.8 and
    reports them.
  - `plan-mobile-readiness`: a thin web-view app is a Guideline **4.2**
    rejection and app-generator output is **4.2.6**, not 2.5.2 (downloaded
    code, now in `plan-capacitor-hardening`'s OTA pillar). The "25%" figure
    is now cited (Apple Newsroom, May 2025: over 1.9 M of 7.7 M rejected in 2024). Adds targetSdk 36 (Play,
    2026-08-31), the Xcode 26 upload floor (2026-04-28), and age-rating answers.
  - "Capacitor 8.3.2+" was replaced everywhere: SystemBars exists since 8.0.0
    and its inset fixes continued through 8.5.2, so the skills now say "latest 8.x".
  - `audit-responsive` adds phone-landscape and tablet cells for native apps
    (Android 16 ignores orientation locks at ≥ 600dp); `mobile-emulator-test`
    gains adb probes for back, font scale, reduce motion, large screen, and nav
    mode.

### Fixed

- **`scripts/shorten-skill-descriptions.mjs` clipped mid-quote.** A clip inside
  a quoted trigger or a parenthetical left it open (`"tidy.`), and trailing
  `/` or `→` survived (`Motion /.`). It now drops the dangling opener and those
  separators; `--self-test` runs in `validate.yml`.
- `plan-rls-audit`'s description again carries the `service_role key` and
  security-advisor triggers its body and the cheatsheet promise, at no listing
  cost.
- Review copy fixes: `.env.example` lost its orphaned fal.ai note, the
  DISTRIBUTION clone one-liner is copy-pasteable, `mcp/README.md` names
  `SUPABASE_PROJECT_REF`, the trigger cheatsheet lists each skill once, and
  `llms.txt` calls `plan-*` planning skills, not audit skills.

## [2.5.0] — 2026-10-06

A lighter package and a README that shows more than it tells.

### Fixed

- **The npm tarball was 9.8 MB (12.2 MB unpacked, 484 files).** Ten fal.ai
  logo experiments under `assets/candidates/` were tracked and shipped, along
  with every README screenshot. npm's package page loads README images from
  GitHub, not from the tarball, so none of it was needed. `files` now ships the
  pack, `assets/logo.png` and `assets/logo.svg` only: 1.2 MB packed, 3.4 MB
  unpacked, 459 files. Supply-chain scanners score what ships; this is the part
  of the Socket.dev score that was ours to fix. The rest of that score is
  download count and "recently published", which only time changes.

### Added

- **Architecture diagram** under the install command: what gets installed
  (skills, commands, subagents, rules, MCP templates), through
  `npx @kensaurus/skills --all`, into `~/.cursor`, `~/.claude`, `~/.codex`,
  and `~/.gemini`. States the installer's footprint: no install scripts, no
  network, no shell.
- **Pieces strip** replacing the what's-inside table: seven tiles with pixel
  glyphs and counts.
- **Section icons**: twelve 8×8 pixel glyphs rendered from `showcase.html`
  (`?view=icon&name=…`) and placed in the README headings.
- **More from KENSAURUS** rebuilt as cards with the real store listing names
  and links: glot.it (App Store: glot.it; Google Play: glot.it – Learn Thai),
  yen-yen – Expense Tracker, the wanting mind – Living Book, Help Her Take
  Photo (Google Play: help her take photo – Pose Cam), lets-talk – Conversation
  Coach, Solo Boss, Tsumagoi, Mushi Mushi, plus the Google Play developer page.
  Names and links come from the store listings and the portfolio data file,
  not from memory.

### Changed

- `npm run brand:render` covers the new views; `docs/screenshots/README.md`
  lists them.

## [2.4.0] — 2026-10-06

The README reads as a page again, and the biggest skills load in a fraction of
the tokens.

### Changed

- **README rebuilt around two images.** The hero, then a new ladder diagram,
  "How one request lifts the repo" (Orient, Assess, Change, Prove, Ship, each
  rung naming what the repo gains), then install, the "What should I say" table,
  and the tour. Everything after that collapses: install options, commands,
  subagents, MCP servers, rules, shell helpers, upgrading, FAQ. Visible length
  drops from 823 lines to about 150; the source is 420 lines.
- **Skill index moved to `docs/SKILLS.md`.** `generate-skill-index.mjs` now writes
  the full one-line-per-skill list there and only the family counts table into
  the README. `--check` guards both files. The 314-line table that made the
  README a wall is gone from it.
- **22 skills (the 8 largest by prose and the 14 heaviest in inline code) slimmed into reference files**, following Anthropic's
  authoring guide: SKILL.md keeps the reasoning skeleton, one short example per
  concept, and the checks; long code, pattern catalogues, probes, and templates
  move to `references/<topic>.md` with a contents list. Frontmatter and rule
  meaning are unchanged. Their SKILL.md bodies drop 43% in bytes (364 KB to 206 KB, about 49,000 fewer tokens when all are loaded); the largest, enhance-web-landing, goes from 42 KB to 9.5 KB. Twenty-eight older reference files over 100 lines gain a contents list.
- **Plan skills share one execution line.** Ten `plan-*` skills carried the same
  two-sentence execution note; it is now one line each.
- **`/thirdparty-web-interface-guidelines`** delegates to its skill instead of
  carrying a 185-line copy of the rule set.
- `docs/PLAN-LOOPS.md` links to the new README section.

### Added

- `docs/screenshots/ladder-{dark,light}.png` rendered from the `ladder` view in
  `docs/screenshots/src/showcase.html`; `npm run brand:render` covers it.

## [2.3.0] — 2026-10-06

A new brand and a plain-language pass, plus the two methods behind them added
to the skills so other repos can do the same.

### Added

- **Brand built as code.** `docs/screenshots/src/showcase.html` renders every
  shipped image from one source: the README hero (dark and light), the four tour
  cards, the OG image, the logo, and the favicon. The mark is a hand-drawn pixel
  kensaurus (one character per pixel), set in Bricolage Grotesque, Press Start 2P,
  and JetBrains Mono, in lime, yellow, and coral on ink or paper, with 3px borders
  and hard offset shadows. No gradients, glass, or generated art.
  `node scripts/render-brand-assets.mjs` (also `npm run brand:render`) renders all
  eleven files with Playwright and copies the site set; counts come from
  `package.json`.
- **`enhance-readme` brand hero kit.** `references/brand-hero-kit.md` explains the
  system, the npm and GitHub rendering limits (npm shows the hero at half size and
  strips `<picture>`), the build steps, and an anti-slop check.
  `scripts/render-views.mjs` renders any HTML view to PNG.
- **`docs-writer` plain-language reference.** `references/plain-language-ste.md`
  carries the ASD-STE100 rules that transfer to developer docs (20 and 25-word
  limits, one instruction per sentence, active voice, one meaning per word), an
  AI-tell list, rules for alt text, captions, and package descriptions, and a Vale
  prose-lint recipe. `docs-writer`, `enhance-readability`, and `enhance-readme`
  point to it.
- **`research` grounding contract.** Step 5b: cite or abstain, date the query,
  pin the version, quote the primary source, separate observation from
  inference, measure numbers.

### Changed

- **README, npm, and marketplace copy in plain language.** Hero alt text and
  caption, the four tour captions, the npm description template, both plugin
  manifests, the marketplace strings, `llms.txt`, and `site/index.html` now use
  short active sentences. The npm description leads with the inventory and the
  behavior. Keywords grow from 15 to 24 search terms.
- **`site/index.html`** uses the new system and reads its counts from the same
  template as the manifests (`check-skill-count` now checks it).
- `docs/screenshots/README.md` documents the render pipeline.

### Removed

- `scripts/render-brand-assets.py` (Pillow geometric mark), `scripts/gen-brand-assets.mjs`
  and `scripts/gen-brand-candidates.mjs` (fal.ai experiments). The shipped brand no
  longer depends on an image API; `FAL_KEY` leaves `.env.example` and `SECURITY.md`.

## [2.2.0] — 2026-10-06

Adds the app-wide "make this mobile app feel native" pass the pack lacked, and
refreshes the mobile and UX skills against 2026 platform facts: iOS 26 Liquid
Glass tab bars, Android 16 enforced edge-to-edge, Expo SDK 54–58 native tabs,
Reanimated 4, FlashList v2, Capacitor 8.3 system bars. Every fact was pulled
from the vendor docs or maintainer posts dated 2025–2026 and is cited in the
new skill's references.

### Added

- **`enhance-mobile-native-feel`** skill: one coherent pass over an existing
  Expo / React Native or Capacitor app that reads as a website: system tab bar
  and sheets, edge-to-edge insets, virtualized lists, one spring vocabulary on
  the UI thread, haptics by meaning, platform symbols, Dynamic Type, two accent
  roles. Scores ten native-feel checks before and after
  (`references/native-feel-scorecard.md`), names the web-shaped smells it
  removes (`references/anti-patterns.md`), and carries version-gated recipes
  for both stacks (`references/stack-recipes.md`). Routes per-screen polish to
  `mobile-rn-screen` and surface splitting to `enhance-capacitor-ui`.

### Changed

- **Mobile and UX skills refreshed for 2026.** `design-mobile-first` gains a
  native-shell-first section (NativeTabs, Android 16 edge-to-edge, Capacitor
  8.3 safe-area variables, sheets, press feedback) and moves the web drawer
  example to `references/web-nav-drawer.md`. `mobile-rn-screen` adds the
  native-feedback rule and pain classes S19–S20. `mobile-rn-performance`
  states the FlashList v2 (New Architecture, no `estimatedItemSize`) and
  LegendList rules and the Reanimated 4 `react-native-worklets` split.
  `enhance-capacitor-ui` and `plan-capacitor-hardening` record that
  `StatusBar.setBackgroundColor` / `overlaysWebView: false` are no-ops on
  Android 16 and that Capacitor 8.3.2+ handles insets in core.
  `plan-mobile-readiness` adds pillar F (native feel as 2.5.2 evidence).
  `design-motion` and `enhance-motion` add the spring vocabulary (Material 3
  spatial vs effects) and hand native apps to the new skill.
  `audit-ux-journeys` adds IA10–IA12 (tab destinations, one question per
  screen, sheet vs page) with methods in its checklist; `audit-ux` and
  `mobile-emulator-test` score the same signals.
- **Descriptions trimmed** on the twelve skills above (418 chars reclaimed) so
  the new skill fits under the 39,000-char listing ratchet (ADR-0010); the
  ratchet did not move.

### Fixed

- **Phantom modified files on every checkout.** Fourteen tracked files were
  committed with CRLF while `.gitattributes` declares `eol=lf`, so `git status`
  listed them as modified with an empty diff. They are renormalized; content
  is unchanged.
- `enhance-web-web3d` now links its `references/css-canvas-effects.md`, which
  was shipped but unreachable from the skill.

## [2.1.1] — 2026-10-01

### Fixed

- **Installs on Windows survive a briefly held file.** An open editor
  watching `~/.cursor` or `~/.claude`, or an antivirus scan, can hold a file
  for a moment right after it is written. Windows then failed the next copy
  with `EPERM`, which aborted the install and left the target half-copied:
  Cursor failed three runs in a row on a different `SKILL.md` each time. The
  installer now retries a copy, write or delete on `EPERM`, `EBUSY` or
  `EACCES` for up to about 3 seconds per file. If the lock never clears it
  still fails, and says which file is held and that closing the editor fixes
  it. Other platforms are unchanged.

## [2.1.0] — 2026-10-01

UX laws as a measured fix pass, and the Miller misreading removed from the
pack.

### Added

- **`enhance-ux-laws`.** Measure-then-fix pass on one screen or flow against
  seven Laws of UX: Fitts, Hick, Miller, Jakob, Zeigarnik, Goal-Gradient and
  Von Restorff. A browser probe measures tap targets, competing accents,
  choice sets, unlabeled fields and progress cues at phone and desktop widths;
  an eight-check flow walk covers what the DOM cannot show (resume after
  reload, dead controls, pasted codes). Each law states its precondition and
  what it does not say. Progress and resume cues must read real state, and
  drafts never store card numbers or one-time codes.

### Changed

- **Miller and Hick read correctly.** `audit-ux` and `enhance-web-ux` no
  longer cap menus or navigation at seven items: Miller is about what the user
  must hold in mind, and Hick applies only when options must be weighed, not to
  known-item lookups. `audit-ux` gains Von Restorff and
  Goal-Gradient/Zeigarnik rows.
- **Releases are staged.** `npm-publish.yml` runs `npm stage publish
  --provenance`; a version goes live only when the maintainer approves it with
  2FA. CI actions moved to v5 (Node 24).
- Six skill descriptions dropped duplicate trigger phrases so the listing stays
  under its 39,000-character ratchet with the new skill (ADR-0010).

## [2.0.0] — 2026-10-01

**cursor-kenji is now kenji: `kensaurus/skills` on GitHub, `@kensaurus/skills`
on npm, plugin `kenji@kenji`.** Same pack, tool-neutral name. Breaking because
the plugin ID and the `/cursor-kenji:` slash namespace change (ADR-0013).
Upgrade steps: README → "Upgrading from cursor-kenji".

### Changed

- **Renamed.** Repo `kensaurus/cursor-kenji` → `kensaurus/skills` (old URLs
  redirect), npm `@kensaurus/cursor-kenji` → `@kensaurus/skills`, CLI
  `cursor-kenji` → `kenji`, plugin and marketplace `cursor-kenji` → `kenji`,
  Windows shim `cursor-kenji.cmd` → `kenji.cmd`.
- **Existing installs migrate.** The installer replaces a pre-2.0.0
  completion-gate entry (`cursor-kenji-hooks/`) with `kenji-hooks/`, keeps every
  other hook and setting, and removes the orphaned folder. `--restore` also
  reads the legacy `.cursor-kenji-backups/`. Claude plugin installs follow the
  marketplace `renames` map. `CURSOR_KENJI_GATE_STATE_DIR` and
  `CURSOR_KENJI_DIR` still work beside `KENJI_GATE_STATE_DIR` and
  `KENJI_SKILLS_DIR`.
- **Tool-neutral listing.** Descriptions and keywords name Claude Code, Cursor,
  Codex CLI, and Gemini CLI; the homepage is the GitHub README until the new
  skills.sh page is indexed.
- Ten skill descriptions dropped duplicate trigger phrases to keep the skill
  listing under its 39,000-character ratchet (ADR-0010). Every routing pointer
  stays.

### Added

- **`audit-agent-speed`.** Measures, then fixes a slow coding-agent host:
  transcript-parsing status lines, per-call and blocking Stop hooks, AGENTS.md
  skipped under a parent CLAUDE.md, un-ignored worktree folders doubling
  search, global effort and Explore model, worktree pile-up, antivirus,
  indexer and vendor WMI pollers. Ships
  `scripts/stop-typecheck.mjs`, an `asyncRewake` Stop hook that typechecks in
  the background, skips when nothing changed, wakes the agent only on a new
  error set, and summarizes codegen cascades.
- Routing rule: agent or machine slow → `audit-agent-speed`; product slow →
  `audit-performance`.

### Fixed

- `docs/AGENTS.template.md` now says Claude Code skips `AGENTS.md` when a
  `CLAUDE.md` exists in the repo or any parent folder, and how to load both.

## [1.40.1] — 2026-09-29

The completion gate stops looping. In Cursor it ran twice on every stop, and
the copy loaded from the Claude Code config had no cap, so an open checklist
sent the same follow-up for hours, including to sessions that did not own it.

### Fixed

- **The completion gate looped for hours in Cursor.** Cursor also runs Claude
  Code hooks from `~/.claude/settings.json`, with no `loop_limit`, so every
  stop was gated twice and the Claude-config copy never stood aside. Each
  registration now carries `--host=cursor` or `--host=claude`, and inside
  Cursor the Claude-config copy stands aside when the native entry exists
  (ADR-0012).
- **Two agents in one repo restarted each other's loop.** The follow-up budget
  was one workspace counter. It is now per conversation, kept in
  `~/.cache/cursor-kenji/completion-gate/`: three follow-ups while none of the
  items that conversation saw closes. The old
  `.cursor/completion-gate.count.json` is deleted on the next run.
- **The gate pushed work that waits on a person.** Items marked
  `blocked by:`, `blocked on:`, or `waiting on:` no longer gate, and neither
  does a state file untouched for 24 hours. The follow-up now says how to
  stand down: mark an item that waits on a person as blocked, leave a
  checklist another agent owns unchanged, say so in one line, and stop.

## [1.40.0] — 2026-09-29

Ships the `housekeep-files` document organizer, with the Windows script fixed
so it actually runs on the PowerShell it claims to support. The fix came from
running the skill on a real Downloads tree: the bundled script would not parse
under Windows PowerShell 5.1, and an earlier run under a Japanese code page
had copied an access-key bundle that its secret rule should have refused.

### Added

- **`housekeep-files`** skill + `/housekeep-files` command: organize a
  drifted document tree (Downloads, a synced drive) into per-owner homes
  by copy, not move. Bundled `scripts/housekeep-files.ps1` (Windows
  PowerShell 5.1+) and `scripts/housekeep-files.sh` (macOS/Linux bash)
  read the same `plan.tsv` and run inventory (SHA-256 of every source) →
  dry run → apply → verify. Keys, credentials, media over the size cap,
  and installers are cataloged in place, never copied. Vague filenames get
  `{entity}_{area}_{date}_{doc-type}__{original}`; each owner root gets a
  visible `_ai-catalog.jsonl` and `_SEARCH.md`. `verify` re-checks every
  source path and size, re-hashes every copy, recounts untouched media
  folders, and exits non-zero on the first miss. Layout options (root per
  owner, one root with owners inside, PARA-lite) are offered before the
  plan is written. Sources in `references/naming-and-catalog.md`.

### Fixed

- **`housekeep-files.ps1` failed or misbehaved on Windows PowerShell 5.1.**
  The file was UTF-8 without a BOM and held three non-ASCII characters (the
  `アクセスキー` secret pattern and two em dashes). PowerShell 5.1 decodes a
  BOM-less script with the ANSI code page. Under cp1252 an em dash becomes a
  curly quote that ends the string, so the script does not parse. Under cp932
  it parses, but the CJK pattern turns into mojibake, so a file named for an
  access key is copied instead of cataloged in place. The script is now pure
  ASCII, and the pattern is written as a `\uXXXX` regex escape. Verified by
  running the old and new script natively under 5.1 on a folder holding an
  `…アクセスキー…zip`: the old one throws a parse error; the new one marks the
  zip `indexed-in-place:secret`.
- **Guard:** `validate-skills` fails on any shipped `.ps1`, `.psm1`, or
  `.psd1` that contains a non-ASCII byte without a UTF-8 BOM, and reports
  the file and line. Probe: a BOM-less em dash in a scratch `.ps1` fails;
  the same text with a BOM passes.

If you ran `housekeep-files` on Windows before this release, check each
`_ai-catalog.jsonl` for `copied-source-kept` rows whose path contains
`アクセスキー`, and rotate those keys.

## [1.39.0] — 2026-09-23

Closes the last three open items from the Opus 5.5 pass: the always-on
routing rule, facts that went stale, and broken markdown. Each fix was
researched from primary sources (package source, vendor docs, npm) and
checked by an independent verifier before it was applied.

### Changed

- **`skill-workflows.mdc` halved** (3,246 → 1,614 bytes), ADR-0011. Claude
  Code loads it in every session. It now lists only the mappings a skill
  name gets wrong, for example `workflow-release-prep` never merges and
  `workflow-onboard` is not product onboarding. It also keeps the
  multi-phase → workflow principle and the six audit-and-fix exceptions.
  Everything else was already in skill descriptions or the verification
  rule.
- **Supabase MCP calls match current servers.** Current servers (the pinned
  0.12.0 and the hosted one) hide `get_logs` and list `query_logs`, which
  takes ClickHouse SQL filtered by `source`. The skills now use it, with SQL
  taken from the server's own per-service queries. The pack's config is
  project-scoped (`--project-ref`), so calls no longer pass `project_id`,
  and `list_projects` is described as available only on an unscoped server.
  Affected: `deploy-verify`, `iterate-post-launch`, `workflow-fix-and-ship`,
  `workflow-feature-flag`, `workflow-feedback-to-closure`, `mushi-*`,
  `test-*`, `mobile-emulator-test`, `audit-db-schema`, `audit-fe-api`,
  `audit-langfuse-llm`, `debug-fe-be-integration`, `design-prd`, and the
  `full-stack-ship-discipline` rule.
- **Sentry MCP calls match the current server.**
  - `get_issue_breadcrumbs`, `get_issue_tag_values`, and `find_releases` are
    catalog tools, reached through `execute_sentry_tool`; `search_sentry_tools`
    is the fallback.
  - `update_issue` needs the Triage skill on the connection.
  - Relative issue-search dates take a sign (`firstSeen:-1h`).
- **`enhance-pwa`** uses current facts:
  - Next.js caching goes through Serwist; `@ducanh2912/next-pwa` is
    webpack-only.
  - Lighthouse 12 removed its PWA category, so installability is checked in
    DevTools. `workflow-launch-ready` and the catalog no longer ask for a PWA
    score.
  - `navigateFallback` is the SPA shell, not an offline page.
  - `beforeinstallprompt` fires only in Chromium.
- **`enhance-web-instant-nav`** gives the current Speculation Rules eagerness
  defaults and Next.js 16.3 Instant Navigations.
- **`plan-capacitor-hardening`** names the current Capsec package
  (`@capgo/capgo-sec`) and its rule families, and says Ionic Identity Vault
  stopped new sales in 2025-02.
- **No calendar-stamped advice.**
  - Search queries use `[current year]`.
  - "(2026)" labels on current guidance are gone.
  - A cost tier is named as a tier, not a model.
  - Token-cap and streaming-usage fields are named per provider.
  - The OWASP red-team checklist says it maps the 2021 edition.

### Added

- **`scripts/check-md-structure.mjs`**, in `npm test` and CI, fails on a
  nested or unclosed code fence.
- **`check-skill-refs` flags `supabase:get_logs`.**

### Fixed

- **13 code-fence errors in 9 files.** A nested or unclosed fence rendered
  the rest of an output template as live markdown. Affected: `design-prd`,
  `plan-dead-code`, `audit-db-schema`, `audit-langfuse-llm`,
  `audit-uiux-design-system`, `backend-error-handling`, and
  `docs/CONTRIBUTING.md`.
- **Duplicate headings.** The ones in `audit-code-quality` and
  `docs-coauthor` now have distinct names. The catalog's duplicate
  `audit-skill-conflicts` entry is now a pointer to its Audit entry.
- **The README said `audit-*` skills may fix things.** It now says they
  report and stop by default, names the six audit-and-fix skills, and notes
  the few others that end with an explicit apply step.
- **`CITATION.cff`** still said version 1.31.0.

## [1.38.0] — 2026-09-23

Follow-through on 1.37. A section-by-section check of the Opus 5.5 plan
against the repo, run in fresh contexts, found edits that were only half
applied. Reading the Claude Code client showed its skill-listing budget
works differently from what ADR-0008 assumed.

### Changed

- **Skill descriptions trimmed.** 137 descriptions were rewritten to about
  230 chars. The rewrite kept the distinct trigger phrases and the handoffs
  that separate overlapping triggers, and dropped filler, synonyms, and lists
  of chained skills. The pack's Claude Code listing drops about 15%, from
  45,573 to 38,979 chars; every request carries that listing on both hosts.
- **`validate-skills` measures the listing the way the client does**: one
  `- name: description` line per model-invocable skill and command, with
  agents reported separately. It fails above `LISTING_MAX_CHARS` (39,000).
  ADR-0010 supersedes ADR-0008's measure and corrects its facts:
  - the budget is 1% of the context window at 3 chars/token for current
    models, 30,000 chars on a 1M Opus 5.5 session;
  - built-in skills share that budget;
  - over budget, the least-used skills show by name only, and nothing is
    dropped.
- **Keep every description visible on Claude Code** with
  `"skillListingBudgetFraction": 0.02` in `~/.claude/settings.json`. The
  installer prints the installed listing size and this setting; it does not
  change your settings.
- **Authoring surfaces say T1–T8**: `enhance-skill-prompts`,
  `meta-skill-creator`, `audit-skill-conflicts`, CATALOG, and the playbook
  describe T2 as a classification contract and T4 as an evidence rubric.
- **`docs/DISTRIBUTION.md`**: the completion-hook column lists Claude Code and
  the plugin's Stop hook, and warns against running the plugin hook and the
  `--claude` hook together.

### Fixed

- **Leftovers from 1.37.0's mechanical edits.** In about 30 files a passage
  was replaced but its old lines stayed under the new ones:
  - `audit-ux` had a second set of sections 0b–0e;
  - `audit-security` kept its old vulnerability examples;
  - `audit-code-review` kept its DO/DON'T lists after the new review rule;
  - `enhance-web-seo` had broken JSON in its research step;
  - `debug-error` and `debug-sentry-monitor` repeated checklists;
  - `tdd-patterns` had an orphan comment;
  - several paragraphs had fallen into the list or blockquote above them.
- **`backend-realtime` printed secrets.** It told the agent to `cat .env*`,
  which prints secret values; it now lists variable names only.
- **`rules/approved-plan-execution.mdc` had invalid YAML frontmatter**: an
  unquoted `: ` in the description. A strict parser rejects it, which can
  drop the rule's `paths:` scope.
- **Merge installs now prune leftovers from older releases** on both hosts:
  - the renamed `/plan` command, pruned only while it still carries the
    pack's description;
  - the `native-rn-monorepo` command bundle, which older installers copied
    into the global commands folder, registering ten `native-rn-monorepo:*`
    commands in every project.
- **`migrate-to-skills`** skipped creating the skills folders when no
  subagent tool was available.
- **`create-skill` and `meta-skill-creator`** told every skill to repeat the
  always-on update rule. They now say never to suppress it, and to add a
  turn-end line only for unattended skills.
- **`audit-auth-flows` and its annotated exemplar** match again: same effort
  key, same finding-shape wording.
- **Closure runs could not record a verification rung that does not apply.**
  In a headless `/complete-everything` probe on a repo with no typecheck or
  lint, the unchecked rungs made the Stop hook block, and the model invented a
  `[-]` marker that the hook then skipped with no reason required. The skill
  now defines `- [-] <rung> — n/a: <evidence>`. The completion gate counts a
  `[-]` line without an `n/a:` reason as open, and `completion-judge` checks
  the reason. The skill also notes that Claude Code shows "Stop hook error
  occurred" for every Stop-hook block; that is the gate working, not a
  failure.

## [1.37.1] — 2026-09-23

### Fixed

- **`--verify` reported line endings as corruption.** A Windows checkout with
  `core.autocrlf=true` carries CRLF in the working copy while the npm tarball
  (built on Linux) is LF, so an install from a clone followed by
  `npx @kensaurus/cursor-kenji --verify --all` failed on 17 files with
  "content hash mismatch". `bin/install.mjs` now hashes text files with line
  endings normalized; the install smoke test plants a CRLF copy and expects
  `--verify` to pass.

## [1.37.0] — 2026-09-23

An Opus 5.5 pass. Claude Code 2.1.280 made Claude Opus 5.5 the default model
on 2026-09-22, and it changes two assumptions the pack was written on: prose
no longer steers thinking (effort does, and its default is `medium`), and
there is no strong planner / fast implementer split left to route around.

### Added

- **`docs/MODEL-AND-EFFORT.md`** — the model story: default model per host,
  how to set effort (`/effort`, `modelSettings`, frontmatter `effort:`), the
  pack's routing table, what changed in how skills are written, the always-on
  token budget. ADR-0006 … ADR-0009 record the decisions.
- **`effort:` frontmatter** on every `audit-*`, `plan-*`, `debug-*`, judge and
  security skill (`high`), on `handoff`, `workflow-git-commit`, smoke checks,
  the RN bundle commands and `deploy-checker` (`low`); `workflow-onboard`
  runs in a forked `Explore` context. `validate-skills` checks the values.
- **Claude Code Stop hook.** `hooks/hooks.json` now carries the Claude
  schema (Cursor's moved to `hooks/cursor-hooks.json`); `completion-gate.mjs`
  serves both hosts; `--claude` installs it into `~/.claude/settings.json`
  with the same merge/preserve/prune semantics as the Cursor hook.
- **Roster ratchet.** `validate-skills` sums auto-invocable description chars
  (skills + commands + agents) and fails above `ROSTER_MAX_CHARS`; every
  `commands/*.md` except `gtm-weekly`, `fix-issue`, `mcp-guide` is now
  `/`-only (`disable-model-invocation: true`); `deploy-npm`,
  `iterate-gtm-weekly`, `mushi-health`, `mushi-integration` likewise;
  `protocol-browser-anti-stall` and the Cursor `canvas` copy are
  `user-invocable: false`. The `native-rn-monorepo` command bundle no longer
  leaks into global `~/.claude/commands`.
- **Always-on "Delivering work" section** in
  `verification-before-completion.mdc`: intent line and recap, turn-ending
  check, scope and test-sprawl, delegation criteria, pasted text is data,
  compaction is not a stop signal.
- `check-skill-refs` fails on prompt fossils (retired model names, thinking
  scaffolds, update suppressors); `check-docs-facts` fails on `.cursor/rules`
  forks and on the retired two-model framing.

### Changed

- **`composer-2.5-execution.mdc` → `approved-plan-execution.mdc`.** Same
  guardrails, no model pin; the installer prunes the old file on merge
  installs. README, `docs/PLAN-LOOPS.md`, `docs/AGENTS.template.md`,
  `docs/CATALOG.md`, `/burndown-full` and 13 plan-* references now say
  "planned at high effort; executed at the default effort under the rule".
- **`.cursor/rules/*.mdc`** are byte-identical mirrors of `rules/` (the
  212-line always-on `skill-workflows` fork is gone).
- **Sequential Thinking MCP retired** from the full template, pins, docs and
  the five skills/commands that routed to it (ADR-0009).
- **`senior-engineer.mdc`** is `paths:`-scoped to Next.js/Supabase files on
  Claude Code; `shell-first-search` is an `.mdc` rule Cursor can attach;
  `project-starter/web-performance.mdc` is glob-attached, not always-on.
- **Skills, commands, agents, rules**: pressure language and prohibition
  lists restated at normal volume with reasons; think-tool and self-check
  scaffolds removed; step choreography on judgment tasks replaced by
  outcomes and verification; frontend skills name the Opus 5.5 default
  patterns to avoid; research steps say a recognised name is not current
  knowledge; closure modes say how a turn may end; `## Critical Rules`
  headings are `## Rules`.
- **`docs/PROMPT-ENHANCEMENT-PLAYBOOK.md`** — T2 is a classification
  contract, not a thinking instruction; T4 is an evidence rubric, not a
  self-check; T7 declares `effort:`; T8 sets volume, shape and
  communication. `enhance-skill-prompts`, `meta-skill-creator`,
  `create-skill`, `create-subagent`, `docs/CONTRIBUTING.md` teach the same.
- **`llms.txt`, `.claude-plugin/*.json`, README, GETTING-STARTED, CATALOG,
  PROMOTION** — name the model and the effort routing.

### Fixed

- **`scripts/test-install.mjs`** — the Windows shim test ran `cursor-kenji.cmd`
  from the cwd, which hardened shells block with
  `NoDefaultCurrentDirectoryInExePath=1`. The test now clears that variable for
  the child and also exercises the explicit `.\cursor-kenji.cmd` form.

## [1.36.3] — 2026-09-22

A command-surface pass. `/plan` became a host built-in in three of the four
supported tools while we still shipped a file of that name, and four commands
still promised tools the pack stopped shipping. The collision guard now covers
every install target instead of Claude Code only.

### Changed

- **`/plan` → `/plan-mode`, in both command sets.** Claude Code, the Cursor CLI,
  and Gemini CLI each ship a built-in `/plan` that enters Plan mode, so
  `commands/plan.md` duplicated it and `commands-portable/plan.md` shadowed it
  as `~/.gemini/commands/plan.toml`. Both are renamed; the file is the
  procedure, the built-in is the mode switch. Natural-language triggers are
  unchanged. **Restart the host after updating** — Claude Code and Cursor
  register `commands/` at session start.
- **`commands/mcp-guide`** — describes the actual default template (Firecrawl,
  Context7, Supabase) and headed `playwright-cli`. Sequential Thinking and the
  Playwright MCP are full-template only, so nothing routes to them by default.
- **`commands/fix-issue`** — dropped a `SemanticSearch` call and the hardcoded
  `npm run test:unit`. Diagnosis routes to `debug-error`, the ship loop to
  `workflow-fix-and-ship`, and verification runs the repo's own checks.
- **`commands/debug-issue`** — no longer claims Sequential Thinking is part of
  `debug-error`; notes that `/debug` is a built-in in both hosts.
- **`commands/test`** — tagline matches the body: route to the matching test
  skill rather than run one generic suite.
- **`commands-portable/research`** — resynced with `skills/research`: repo
  first, docs for the pinned version, no implementation until asked.
- **`docs/CATALOG.md` `audit-ux`** and **`skills/plan-uiux-unification`** —
  stopped listing Sequential Thinking as available; the skills never called it.
- **`.claude-plugin/marketplace.json`** — listing said 145 skills and 57
  commands; the real counts are 156 and 62.

### Fixed

- **The reserved-command guard only covered one of four hosts.** It scanned
  `commands/` against a Claude Code list, so a `commands-portable/` name could
  collide with a Gemini CLI built-in unnoticed — which is exactly how `/plan`
  survived there. `scripts/validate-skills.mjs` now scans both directories
  against the documented built-ins and aliases of Claude Code, the Cursor CLI,
  and Gemini CLI. Probe: a `commands-portable/tools.md` fails the gate.
- **The count ratchet skipped both Claude Code manifests.** `.claude-plugin/`
  was never checked, which is how its listing drifted 11 skills and 5 commands
  behind. `scripts/check-skill-count.mjs` now covers `plugin.json` and
  `marketplace.json`.

### Known issue

- Codex CLI deprecated custom prompts and stopped loading `~/.codex/prompts`
  (0.117.0), which is where `--codex` writes the portable playbooks. Its merged
  `~/.codex/AGENTS.md` rules are unaffected. Choosing a replacement surface
  touches [ADR 0001](docs/adr/0001-custom-npm-installer-ships-four-tools.md) and
  is deliberately not bundled into this release.

## [1.36.2] — 2026-09-17

A `plan-dead-code` → `housekeep-dead-code` pass on the pack's own
repository, run with the pack's own skills. The JS surface was already
clean; the deliverable is the gate that keeps it that way.

### Removed

- `scripts/migrate-browser-mcp-to-cli.mjs` — the one-off Playwright MCP →
  playwright-cli migration script from 1.2x. Nothing ran it (no npm
  script, workflow, or doc); Knip in default and `--production` mode and a
  repo-wide reference grep agreed. The CHANGELOG line that introduced it
  stays as history; git keeps the file.

### Added

- `knip.jsonc` and `npm run check:dead-code` / `check:dead-code:prod`
  (`npx -y knip@6.36.0 --max-issues 0`, config hints as errors on the
  default run). Entries come from `package.json` bin/scripts and the
  workflow `run:` lines via Knip's plugins, plus the shipped helper scripts
  and the three maintainer-run brand/description tools nothing invokes by
  reference. The two consumer-side imports of
  `skills/enhance-readme/scripts/record-readme-tour.mjs` (`playwright`,
  `@ffmpeg-installer/ffmpeg`) are the single written-back false positive.
  Appended to `npm test` and to the existing job in `validate.yml` and
  `npm-publish.yml` — no new parallel check. Baseline 0 / 0; the number
  only ever goes down. Probes: an unreferenced `scripts/zz-probe.mjs` fails
  the gate; a fresh clone passes `npm test`.
- `docs/examples/plan-audits/cursor-kenji/plan-dead-code.md` — the audit
  (stack, baseline, surfaces Knip cannot see, keep/kill list with evidence,
  ratchet) that approved the deletion and the config.

### Changed

- `docs/PUBLISHING.md` — the `npm test` gate list names the dead-code
  ratchet.

## [1.36.1] — 2026-09-17

### Fixed

- `plan-gtm/references/benchmarks-2026.md` — added the "warm invites
  10–25%" row (nativeviralloop) that `enhance-growth-loops` already quoted.
  The completion judge caught the number as untraceable against the
  reference file's own rule ("quote a number only with its row here"); the
  source was in the research all along, the row was not.

## [1.36.0] — 2026-09-17

The six follow-ups named in the 1.35.0 report, built in one closure pass:
pricing, growth loops, comparison pages, registry listing, the weekly loop,
and lifecycle email. `plan-gtm` and `workflow-gtm` now hand off to them by
name, so the go-to-market sequence has an owner for every step from "what
to charge" to "what did last week's post do".

### Added

- `plan-pricing` — plan-only pricing and packaging audit: inventory of
  plans/gates/metering/price points/trial logic/cost, value-metric scoring
  (value connection, fairness, predictability, scalability, billability)
  simulated on historical accounts, ≤3 good-better-best tiers with a
  right-hand anchor and an enterprise "from" price, free boundary just before
  the activation event's repeat, price corridor via Van Westendorp →
  Gabor-Granger → MaxDiff → conjoint. Emits `plan-pricing.md` with a
  grandfathering row; changes no price, plan enum, Stripe object, or copy.
  Command `/pricing-plan`.
- `enhance-growth-loops` — apply-now badge / shareable artifact / template /
  invite / referral loops, one K-factor per loop; rewards granted
  idempotently on the referred user's *activation*; invites user-initiated
  and single-send with recipient opt-out; badge removable on paid.
- `docs-comparison-pages` — ≤5 honest "X vs Y" / "alternatives to" /
  "migrate from" pages per pass from facts fetched and dated this session;
  fixed shape including "where the alternative wins"; `lastVerified` +
  `reviewEvery` freshness contract; refuses bulk generation.
- `audit-registry-listing` — read-only audit of README first ten lines,
  npm/PyPI metadata and `npm pack --dry-run` contents, GitHub description /
  topics / social preview, plugin and skills.sh manifests, and a timed
  clean-profile install. Findings with an owner skill per row.
- `iterate-gtm-weekly` — thirty-minute weekly loop: funnel by source this
  week vs last, launch Results tables filled, largest *absolute* loss named,
  last experiment attributed with a number, exactly one experiment and one
  post chosen from a levers-by-step table, scorecard row appended. Command
  `/gtm-weekly`.
- `enhance-lifecycle-email` — event-driven sequences (welcome, activation
  nudge, setup stall, habit, trial expiry split by activated vs stalled,
  limit reached, win-back, dunning) with triggers, exits, idempotent
  `(user, sequence, step)` sends, per-email transactional/marketing
  classification, unsubscribe and suppression, quiet hours, daily cap, and
  `email_*` events. Timers only as the fallback for silence.

### Changed

- `plan-gtm` — phased burndown names the new owners: Phase 1 adds
  `audit-registry-listing` for repo-as-product; Phase 2 adds
  `enhance-lifecycle-email`; Phase 3 uses `docs-comparison-pages`; Phase 4
  adds `enhance-growth-loops` and hands the loop to `iterate-gtm-weekly`;
  Phase 5 starts with `plan-pricing`. Neighbor table extended.
- `workflow-gtm` — sequence, step sections, scorecard, and worked example
  route through the same owners; Step 7 is `iterate-gtm-weekly`
  (`iterate-post-launch` keeps production defects).
- `plan-gtm/references/benchmarks-2026.md` — new sections for pricing
  research / value metric and lifecycle email, each row with its URL.
- `docs/CATALOG.md`, `docs/TRIGGER-CHEATSHEET.md`, `docs/PLAN-LOOPS.md` (23
  plan skills, `/pricing-plan` alias, execute-after-approval rows),
  `skills.sh.json`, README ("What should I say?" and commands rows) — the
  six skills and two commands listed with their neighbors.

### Fixed

- The five 1.35.0 GTM skills and the README skill index carried
  double-encoded arrows (`â†’` for `→`) in their descriptions — a shell
  encoding slip during the description trim. Re-encoded to UTF-8; the
  installed copies refresh on `--auto`.

## [1.35.0] — 2026-09-17

Go-to-market for a repo that already works. The pack covered how to build,
prove, and ship a product but had nothing for the part after: who it is for,
how it is paid for, why signups never come back, where to be found, and how
to announce a release without a vote ring. Five skills and three commands
close that gap. Every benchmark quoted was checked against a 2025–2026
source this week (ChartMogul × Kyle Poyar × ProductLed free-to-paid report,
Userpilot activation medians, Show HN / Product Hunt author reports, public
OSS-vendor revenue mix).

### Added

- `plan-gtm` — plan-only go-to-market audit. Greps how the product is sold
  today (billing SDKs, `isPro` gates, license family, hero/meta positioning,
  auth providers and steps to first value, analytics + consent,
  robots/sitemap/llms.txt, registry presence, trust signals), then
  interviews the founder with `workflow-grilling` rules down a fixed ladder
  (90-day metric → ICP → numbers → monetization intent → budget → market →
  alternatives → constraints). Diagnoses in Dunford order, judges the
  monetization model against 2026 conversion rows (freemium 3–5% good /
  8–12% great; card-required trial 25–35%; median 8%; OSS cloud carries
  48–73% of vendor revenue), defines `activated` and one north-star, picks
  ≤2 channels + 1 loop with caveats. Emits `plan-gtm.md`; changes nothing.
  Business decisions (model, price, license, ICP) stay with the founder;
  "unmeasured" is a legal cell value.
- `workflow-gtm` — execution arm. `plan-gtm` ⏸ approve → `audit-analytics`
  → `enhance-web-conversion` (+ `enhance-readme` for repo-as-product) →
  `enhance-onboarding` → `enhance-web-seo` / `plan-aeo-readiness` →
  `docs-launch-kit` → `iterate-post-launch` weekly. Ends with a GTM
  scorecard (funnel before/after, skips named, next week's one fix).
- `enhance-onboarding` — apply-now first session to first value. Defines
  `activated` as an outcome (never signup or tour end), walks landing →
  activation as a stranger and counts steps, cuts fields before value
  (OAuth/magic link, inferred locale, try-before-signup), ships empty-state
  templates / sample data and a ≤5-item checklist ending at activation,
  instruments `signup_started → signup_completed → activated →
  habit_reached` behind the existing consent gate. Defers, never deletes.
- `enhance-web-conversion` — apply-now message / offer / proof / prompt pass
  on landing, pricing, and upgrade paths: five-second hero check with a
  model-matched CTA verb, ≤3 tiers with an anchor and annual toggle,
  explicit free-tier limits, proof ordered by strength, upgrade prompts only
  at value moments, checkout and prompt events. Removes dark patterns; adds
  none. Visual system stays on `enhance-web-landing`.
- `docs-launch-kit` — versioned `docs/launch/<version>.md`: claims table
  every sentence must trace to, one problem-first angle, native copy per
  channel (Show HN, Product Hunt, subreddit-specific Reddit, X/Bluesky/
  LinkedIn, article outline, user-facing release notes), calendar, UTMs,
  Results table filled after 7 days. No vote solicitation, no fabricated
  proof, maker disclosed.
- Commands `/gtm-plan` → `plan-gtm`, `/gtm` → `workflow-gtm`,
  `/launch-kit` → `docs-launch-kit`.

### Changed

- `rules/skill-workflows.mdc` — bundle row "take a shipped product to
  market → `workflow-gtm`".
- `docs/PLAN-LOOPS.md` — `plan-gtm` in the execute-after-approval table, the
  plan skill map (22 plan skills), launch gates, slash aliases, and a
  copy-paste prompt; related-loops row.
- `docs/CATALOG.md`, `docs/TRIGGER-CHEATSHEET.md`, `skills.sh.json`, README
  ("What should I say?" row, commands table, plan → apply callout) — the
  five skills and three commands are listed where their neighbors are.
- MCP pins re-verified against the registries on 2026-09-17
  (`mcp/pinned-versions.json`, both templates, `.mcp.json`, `mcp/VERSIONS.md`,
  `mcp/README.md`): `@upstash/context7-mcp` 3.2.2 → 4.1.1 (v2 SDK, 2026-07-28
  protocol; stdio flags unchanged), `firecrawl-mcp` 3.21.3 → 3.24.0,
  `@supabase/mcp-server-supabase` 0.8.2 → 0.12.0 (`--project-ref` /
  `--read-only` / `--features` still accepted), `chrome-devtools-mcp` 1.3.0 →
  1.9.0, `@playwright/mcp` 0.0.76 → 0.0.81, `@notionhq/notion-mcp-server`
  2.4.1 → 2.5.1, `server-sequential-thinking` 2025.12.18 → 2026.8.31,
  `server-memory` 2026.1.26 → 2026.8.31, `awslabs.lambda-tool-mcp-server`
  2.0.19 → 2.1.1, `awslabs.aws-api-mcp-server` 1.3.45 → 1.5.5,
  `awslabs.cloudwatch-mcp-server` 0.0.8 → 0.2.1. `server-github`, `-postgres`,
  `-redis`, `-slack` had no newer release.
- `scripts/test-install.mjs` reads the expected firecrawl pin from
  `mcp/pinned-versions.json` instead of a hard-coded `3.21.3`, so a pin bump
  cannot pass the pin check and fail the install smoke test for the same fact.

## [1.34.0] — 2026-09-12

A prompt audit of the shipped surface (rules, agents, commands, skills)
against current-model behaviour: instructions written for older, less
steerable models were rewritten at normal volume, facts that had rotted were
corrected, and text the agent cannot act on (memory of previous projects,
"production test" scores) was removed. No skill changed name, trigger, scope,
or stance; no `[LOW freedom]` step lost its exactness.

### Changed

- `skills/backend-patterns` — the Edge Function example uses `Deno.serve`;
  the `deno.land/std@0.168.0/http/server` import it carried is deprecated.
- `agents/perf-monitor` — `npx bundle-phobia <pkg>`; `npx bundlephobia`
  resolves to a package with no CLI and silently does nothing.
- `agents/deploy-checker` — `npm audit --omit=dev` (`--production` is the
  deprecated spelling).
- `agents/db-migrator` — migration files come from `supabase migration new`
  (14-digit timestamp) instead of a hand-written 8-digit date prefix that
  cannot order two same-day migrations.
- `agents/debugger` — dropped "don't explain before acting" and "ship first,
  explain after", which contradicted the agent's own required output format
  (root cause, evidence, verification, prevention).
- `commands/update-deps` — the dated Next.js cadence paragraph ("15 LTS ends
  2026-10-21, current line 16.3.x") is now a check-at-run-time instruction;
  the codemod advice and the `next lint` removal stay.
- `commands-portable/research` §7 — re-synced with `skills/research`: "plan
  before writing code". The portable copy still said "think step-by-step",
  which reasoning models already do and which had drifted from the skill.
- `skills/audit-langfuse-llm` — model examples are tier-based (frontier /
  small) instead of pinned IDs that age; its prompt-improvement suggestions
  recommend the provider's native reasoning mode and `max_tokens` rather than
  "Think step by step" text and word caps in the prompt.
- `skills/enhance-web-landing` — register pass: removed eighteen
  "(mandatory)" tags and the all-caps shouting, the three "most-tested AI tell
  / #1 violated rule in production tests" grader lines, the cross-project
  palette and serif rotation rules (the agent has no memory of previous
  projects), and the one-project "Marrow" references. Every rule and its
  reason is unchanged; the copy-length limits on page content stay because
  they constrain the page, not the reply.
- Seventeen skills — "CRITICAL:" / "MANDATORY:" / "BEFORE X, you MUST:" step
  headings read at normal volume; the `[LOW freedom — run exactly]` tag
  already carries the weight.
- `skills/design-canvas` — "CRITICAL Requirements" → "Quality bar".
- `rules/composer-2.5-execution.mdc` — title and intro no longer pin
  Composer 2.5 or a "200k window"; the body already said it binds any
  implementation model. Filename kept for installer and doc compatibility.
- `rules/shell-first-search.md` — dropped the "Windows hang history" / "this
  Windows host" incident wording from a rule that ships to every consumer.
- `docs/PLAN-LOOPS.md` — the execution rule has been on-demand since v1.15.0,
  not `alwaysApply: true` as the doc claimed; the planning model is no longer
  pinned to Opus 4.8.

## [1.33.1] — 2026-09-10

### Changed

- `housekeep-dead-code/references/supabase-hygiene.md` — dropped
  `supabase inspect db table-record-counts` from the CLI-equivalents line. It
  rested on a single low-confidence doc extraction from a page that
  redirected, and never appeared in the observability guide's documented set;
  a wrong subcommand name in a command position is worse than no name. The
  line now lists only the six confirmed subcommands, says the set has changed
  across releases, and points at `supabase inspect db --help` plus the
  version-independent SQL above it.

## [1.33.0] — 2026-09-10

A second independent implementation of the dead-code pair was written against
the same base commit. Comparing the two surfaced material worth keeping — and
two bugs worth not keeping. Ported the former as reference files; rejected the
latter after checking both against the knip 6.35.1 source.

### Added

- `plan-dead-code/references/residue-greps.md` — the grep pack as a table with
  a count command and a fix column per class, plus the false positives that
  matter: hashed and template-string asset references, and the counting
  convention (`rg -o … | wc -l` for matches vs `rg -c` for lines — mixing them
  makes a ratchet compare nothing). Adds a **bundle-leak probe**
  (`rg -l "service_role" dist`) that stops the pass and routes to
  `plan-secrets-audit`; it is the one check here that can find a live
  credential in shipped output.
- `plan-dead-code/references/output-templates.md` — a filled
  `plan-dead-code.md` with the chain-head row discipline, worked severity ×
  effort rubric, and a root-causes section so the report names the barrel
  rather than its forty symptoms.
- `plan-dead-code/references/preservation-contract.md` — the plan-only
  non-negotiables and the five verdict buckets, matching the
  `plan-perf-audit` convention.
- `housekeep-dead-code/references/ratchet-ci.md` — scripts, tsconfig
  (`noUnusedLocals` enabled *during* the cascade, not after),
  `eslint-plugin-unused-imports` flat config, why Knip belongs in pre-push
  rather than pre-commit, the aggregator's `jq` result check that makes a
  skipped job fail, and a Supabase types-drift CI guard.
- `housekeep-dead-code/references/supabase-hygiene.md` — the schema arm in
  full. Three traps a client-side grep cannot see: RPCs called only from an
  RLS policy, trigger, or `pg_cron` job; Edge Functions targeted by external
  webhooks; and `pg_stat_*` counters too young to mean anything (check
  `stats_reset`). Tables drop in two steps — rename to `_deprecated_<name>`,
  drop a release later — because a rename is reversible.

### Changed

- `plan-dead-code` — chain-head reporting is now explicit (a dead file's
  exports and sole-use dependencies are children of that row, not rows of
  their own, or a three-item plan reads as twenty-seven); severity is paired
  with S/M/L effort; adds the verified `--trace-export` / `--trace-file` /
  `--max-show-issues` flags; and adds a second gate before triage — unresolved
  imports and unlisted dependencies both explained, not just hints clean.
- `housekeep-dead-code` — new Phase 3 proves the ratchet bites: a fresh-clone
  probe (deletions can pass on a warm `node_modules` and fail on `npm ci`) and
  a deliberate-violation probe that must turn the aggregator red, not just the
  job.

### Rejected from the ported material

Both were checked against the knip 6.35.1 source rather than its docs:

- `knip:ci: "knip --production … --treat-config-hints-as-errors"` — inert.
  Knip sets `isDisableConfigHints = --no-config-hints || isProduction`, so the
  flag cannot fire on a production run. It belongs on the default-mode script.
- `rules: { classMembers: "warn" }` in the recommended config — silently
  exempts that issue type from the gate, because `--max-issues` totals only
  rules set to `error`. `ratchet-ci.md` now documents this as the quietest
  ratchet bypass instead of shipping it as a default.
- `$schema: ".../knip@latest/schema.json"` — floats a major version in a file
  whose own text says not to float `latest`. Pinned to `knip@6`.
- `-W` as shorthand for `--workspace`, and a "<50 scans, >5 pages" threshold
  for `supabase inspect db unused-indexes` — neither is in the source or the
  docs. Dropped rather than repeated.

## [1.32.0] — 2026-09-10

Dead-code cleanup was one line inside `workflow-housekeep` (§2d, "npx knip
(if available) or npx ts-prune") — no config, no production mode, no fix
ordering, no ratchet, and `ts-prune` has been in maintenance mode with its
author pointing at Knip. Everything else a vibe-coded repo accretes
(duplication, debug residue, suppression debt, orphan assets, env drift,
dead schema) was scattered across five skills as prose with no tool behind
it. This adds the plan→apply pair that owns it.

### Added

- **`plan-dead-code`** — configuration-first dead-code audit. Authors
  `knip.json` and resolves every configuration hint *before* trusting a
  finding, because on a first run most findings are misconfiguration, not
  dead code. Baselines both `--production` and default runs and reads
  findings files → unresolved → exports → deps (unused files cascade into
  phantom export and dependency findings). Builds a keep-working list for
  glob-imported routes, generated Supabase types, Deno Edge Functions, and
  deliberate `@public` API, then counts the seven surfaces Knip cannot see:
  unused locals, `jscpd` duplication, debug residue, suppression debt,
  orphan assets, env drift, dead schema. Emits `plan-dead-code.md` and
  **deletes nothing**. Slash `/deadcode-plan`.
- **`housekeep-dead-code`** — the execution arm. Deletes per the approved
  keep/kill list one category per commit with typecheck, tests, and build
  between each, and a bisect-the-batch rule on red: files
  (`--fix-type files --allow-remove-files`, pre-reviewed list only) →
  exports/types → unused-locals cascade (`remove-unused-vars`, then re-run
  Knip) → dependencies → residue → assets → suppressions. Duplication is
  measured and ratcheted but handed to `workflow-refactor`, since fixing it
  preserves behavior rather than removing code. Then installs the ratchet:
  `knip` script, CI job pinned at `--max-issues <today>` and only ever
  lowered, wired into the single aggregator gate per `housekeep-gates`.
  Slash `/deadcode`.
- `plan-dead-code/references/knip-config.md` — `knip.json` recipes for
  Vite + React + Supabase, Next.js App Router, and monorepos, each line
  annotated with the `ignore` it replaces; tag usage (`@public`,
  `@internal`, `@alias`); companion-tool table; and the ratchet CI job.
- Brand mark (`assets/logo.svg` + PNG/OG/favicon). Geometric spine + first-line tick; fal.ai candidates were generated and rejected when they drifted.
- Claude Code marketplace manifests: `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`.
- Static landing page in `site/` (canonical stay on skills.sh until an owned host is live).
- `FAL_KEY` documented in `.env.example`; secret scanner now flags fal key-id:secret pairs.

### Changed

- **`workflow-housekeep` §2d now hands off instead of sweeping.** It keeps
  dead *artifacts* (logs, `.bak`, build output, committed screenshots) —
  things dead by inspection — and routes unused source files, exports,
  types, and dependencies to the new pair. The `ts-prune` recommendation is
  gone. Trigger phrase "remove dead code" moved off this skill.
- `plan-dependency-provenance` — boundary drawn: it owns the *manifest*
  fact (does the package exist, is it licensed); the module-graph proof and
  removal of unimported deps go to `plan-dead-code`. Warns against
  hand-verifying with grep, since a dep reached only from a config string
  looks unused and is not.
- `plan-antislop` §3 — boundary drawn against provable unreachability:
  commented-out scaffolding and guards that can't trigger stay slop
  findings (a taste judgment), while counts and deletion move to
  `plan-dead-code`.
- `test-mutation` — "delete dead code" now routes to the pair rather than
  `workflow-housekeep`.
- `workflow-refactor` — the "Dead Code → delete it" smell row was the last
  open side door around the approval contract; it now routes to the pair.
  Duplication findings arrive there; deletions do not leave from there.
- `package.json` homepage is the live skills.sh page.
- Cursor plugin manifest: `displayName`, `logo`, `category`, homepage.
- Distribution / promotion docs: Claude plugin install, localskills reject, Show HN draft. No fake “listed” claims.

## [1.31.0] — 2026-08-29

### Added

- **`enhance-web-instant-nav`** — Speculation Rules (prefetch/prerender with
  a safety contract), bfcache fixes, cross-document View Transitions, 103
  Early Hints. Slash `/instant-nav`. First-load CWV stays on
  `audit-performance`.
- **`web-performance.mdc`** project rule — always-on budgets, LCP priority,
  INP yield, no-`unload`.
- `audit-performance` §Loading Priority & Speculation, field-data Step 0,
  verification protocol, and `references/loading-priority-2026.md`.

### Changed

- `audit-performance`, `audit-bundle-size`: React Compiler first; manual
  memo only with Profiler evidence.
- `plan-perf-audit` scope: Navigation layer and loading-priority lines.
- `enhance-web-seo` §1d hands CWV fixes to `audit-performance`.
- `perf-monitor` agent: LCP-lazy, slow-second-page, bfcache, INP rows.
- Stack currency: Next.js 15 → 16.x (15 LTS EOL 2026-10-21; monthly
  security releases noted in `/update-deps`).
- `check-skill-count` now ratchets the README Project Rules count against
  `rules/project-starter/*.mdc`.

## [1.30.0] — 2026-08-21

### Added

- **`enhance-readability`** — information-design pass for comprehension
  (CLT + Gestalt): CPL / reading level, grouping, deadspace, icons, and
  visuals that replace verbose prose. Slash `/readability`. Breakpoints
  stay on `audit-responsive`; looks-good stays on `enhance-web-ui`.
  CJK 40 CPL from WCAG 2.2 SC 1.4.8.

## [1.29.1] — 2026-08-21

### Fixed

- **T3/T4 headings** — `meta-skill-creator` and `enhance-skill-prompts`
  had T1–T6 tables/phrases but no `## Worked example` / `## Self-critique`.
  `test-exploratory` and `workflow-release-prep` promoted T4 to `##`.
- **Validator** — T3/T4 now require those H2 headings so a table mention
  cannot pass the gate.

## [1.29.0] — 2026-08-21

### Added

- **Family-first naming policy** — `docs/CONTRIBUTING.md` documents
  `<family>-<topic>`, slash aliases, and the four unprefixed exceptions
  (`research`, `handoff`, `complete-everything`, `burndown-full`).
- **`iterate-` family** — registered in the skill index
  (`FAMILY_HEADINGS`, `FAMILY_ORDER`, blurbs).
- **Installer `RENAMED_SKILLS` prune** — deletes old skill directories on
  Cursor, the `~/.agents/skills` mirror, and Claude after a rename.
  Honors `--dry-run`; skipped when `--skill` is scoped. Tests may inject
  pairs via `KENJI_RENAMED_SKILLS`.
- **`OLD_ALIASES` gate** — `check-skill-refs` fails leftover backticks of
  renamed skills except in `CHANGELOG.md`, `docs/CONTRIBUTING.md`, and
  `audit-skill-conflicts`.

### Changed

- **`housekeep-` taxonomy** — CATALOG / CONTRIBUTING / index blurb now
  say "one drifted register (gates / backlog / design tokens)", not
  "design system only".
- **Renames** — `domain-modeling` → `docs-domain-modeling`;
  `grilling` → `workflow-grilling`. `/grill-me` still points at
  `workflow-grilling`. "grill me" and glossary triggers unchanged.
- **Prompt waves (T1–T6)** — remaining first-party families after Wave 7
  (`housekeep`, `docs`, `deploy`, `debug`, then the rest). Validator
  require-list extended per family. `thirdparty-*` skipped.

## [1.28.0] — 2026-08-21

### Added

- **`audit-doctrine`** — read-only audit of custom lint/ratchet *content*:
  is each rule right on the merits (named remedy, reachable token,
  teaching failure, Tier-D practice), not merely enforced. Distinct from
  `audit-gate-logic` (bypass/gaming). Un-remedied axes →
  `housekeep-backlog`. Slash: `/doctrine`.

## [1.27.0] — 2026-08-20

### Added

- **`workflow-release-prep`** — take the local working tree (uncommitted +
  staged + untracked + unpushed) to a merge-ready PR against main.
  Orchestrates `audit-code-review`, `split-to-prs`, `workflow-git-commit`,
  `workflow-pr`, and `babysit`. Does not merge. Slash: `/release-prep`.

### Changed

- **Skill-conflict routing pass** — carved overlapping triggers across the
  PR/release, UI/slop, error-handling, tests, backend, and skill-authoring
  clusters. Completed truncated descriptions (`burndown-full`,
  `backend-patterns`, `mobile-emulator-start`). Moved
  `thirdparty-emil-design-eng` body into `references/`. Validator now fails
  unmatched quotes/parentheses and trailing `i.e.` truncation scars.

## [1.26.0] — 2026-08-20

### Added

- **`research` skill** — the production research protocol is now a first-party
  skill (`skills/research/`) so `npx skills add` and Cursor `/` share the same
  playbook. `/research` is a thin command wrapper (same pattern as
  `complete-everything`).
- **Installer `--verify`** — read-only hash check of every packaged file
  against the destination. Extra personal files are allowed; missing or
  stale packaged files fail closed. Merge install now verifies each copy
  before reporting success.

### Fixed

- **Install-channel docs** — `npx skills add` installs skills only and does
  not write slash commands. `npx @kensaurus/cursor-kenji --all` is the
  full-pack one-liner. The two `--all` flags are not the same.
- **Cursor `/babysit` shadow** — `babysit` is a Cursor-managed builtin.
  The installer no longer copies it into `~/.cursor/skills` and deletes
  stale copies on upgrade (Claude still gets the portable copy).
- **Dual-name CI gate** — `validate-skills` errors on an undeclared
  skill+command pair so new `/` picker duplicates cannot ship unnoticed.

## [1.25.0] — 2026-08-20

### Added

- **`housekeep-backlog`** (`/housekeep-backlog`) — apply-now inventory of
  parked work (unfinished plans, deferred phases, TODO/FIXME, skipped
  tests, open audit findings) into a living `BACKLOG.md` that regenerates
  and diffs (new / done / stale). Collector that feeds
  `complete-everything` / `burndown-full`. The `docs-adr` pattern applied
  to parked work.

## [1.24.0] — 2026-08-19

### Added

- **`enhance-skill-prompts`** — meta-skill to upgrade an existing SKILL.md
  prompt (degrees of freedom, structured CoT, one worked example,
  self-critique rubric, term consistency) without changing what the skill
  does. Playbook: `docs/PROMPT-ENHANCEMENT-PLAYBOOK.md`. Annotated exemplar:
  `skills/enhance-skill-prompts/references/exemplar-audit-auth-flows.md`.
- **Prompt-enhancement playbook** — T1–T6 applied to every first-party
  `audit-*` / `plan-*` / `test-*` skill plus the Wave 4 apply-now set
  (frontmatter and stance unchanged). Live `audit-auth-flows` is the
  reference implementation. Factory (`meta-skill-creator`,
  `docs/CONTRIBUTING.md`) now inherits T1–T6 for new skills.
- **`validate-skills` T1/T3/T4 gate** — first-party audit/plan/test skills
  fail CI if they lack Degree of freedom, a Worked example, or a
  Self-critique rubric.

---

## [1.23.1] — 2026-08-19

### Fixed

- **Windows `npx` from a clone** — `npx @kensaurus/cursor-kenji` from the repo folder failed with `cursor-kenji is not recognized` because npm exec uses the local package and `cmd` looks for a cwd shim that did not exist. Added `cursor-kenji.cmd` plus a `bin/cursor-kenji.js` entry so the same command works from the clone and from any other directory. Registry `npx` from a non-clone folder already worked.

---

## [1.23.0] — 2026-08-19

### Added

- **`test-exploratory`** — unscripted guest vs logged-in wander of a live non-prod app (headed playwright-cli, SBTM charters, guest/auth/post-logout isolation). Discovery only; tickets via `workflow-feedback-to-closure`, lock via `test-playwright`.
- Highest-impact combo pipelines in README, GETTING-STARTED, and CATALOG: `test-exploratory` → `workflow-feedback-to-closure` → `test-playwright`, plus wander-then-`workflow-quality-gate`.

### Changed

- `test-qa` / `test-playwright` / `test-red-team` descriptions no longer claim monkey / guest-vs-authed wander; `/test` and the trigger cheatsheet route those phrases to `test-exploratory`.

---

## [1.22.0] — 2026-08-19

### Added

- **`audit-auth-flows`** (`/auth-flows`) — read-only app-layer auth audit. Route×gate matrix, Supabase `getSession()` vs `getUser()`, middleware-as-only-gate (CVE-2025-29927), refresh-token reuse detection, OAuth/IDOR. Data-layer half stays on `plan-rls-audit`.

### Changed

- `audit-security` / `plan-security-audit` / `plan-rls-audit` no longer own session/route-gate / getSession triggers.

---

## [1.21.0] — 2026-08-18

### Added

- **`housekeep-gates`** (`/housekeep-gates`) — apply-now consolidation of accreted CI gates into one aggregator required check. Execution arm of `audit-gate-logic`.
- **`test-mutation`** (`/test-mutation`) — StrykerJS / mutmut harness; kills assertion-free coverage theater.
- **`enhance-arch-boundaries`** (`/arch-boundaries`) — dependency-cruiser / eslint-boundaries as CI fitness functions.
- **`docs-adr`** (`/adr`) — lightweight ADRs with rejected alternatives; agent-readable INDEX.md.

### Changed

- **`audit-gate-logic`** — Phase 2.5 gate archaeology (duplicate vintages, competing baselines, hook-vs-CI, dead gates) and winner selection for `housekeep-gates`.
- Neighbor carve-outs: `plan-test-coverage` no longer owns mutation execution; `audit-backend-architecture` defers mechanical rules; `plan-docs-sync` / `docs-coauthor` defer decision memory; `test-unit` defers assertion theater.

---

## [1.20.0] — 2026-08-18

### Added

- **`audit-gate-logic`** (`/gate-logic`) — read-only audit of CI/CD *gate logic*: silent bypass, ratchet gaming, conflicting workflow conditions, required-in-name-only checks. Distinct from `audit-cicd` (cost/speed/safety) and `workflow-quality-gate` (which runs gates).
- **`audit-codemod-safety`** (`/codemod-safety`) — read-only audit of a mechanical source transform for behavior-preservation. Distinct from `audit-code-review` (diff quality) and `plan-data-integrity` (SQL/data migrations).

### Changed

- Neighbor descriptions now carve those owners: `audit-cicd`, `workflow-quality-gate`, `audit-code-review`, `plan-data-integrity`, `enhance-agent-guardrails`, `workflow-green-repo`.
- `check-skill-count` now rewrites leftover PROMOTION.md count tokens (`One install, N skills`, article title).

---

## [1.19.1] — 2026-08-18

Routing pass from `audit-skill-conflicts` (no new skills). Description carve-outs
so overlapping triggers pick one owner; `audit-*` is no longer claimed as
universally read-only; dangling `mobile-mobile-*` refs fixed; `/test` and `/uiux`
routers expanded; `check-skill-refs` gate added to `npm test` and CI.

### Changed

- Skill descriptions now name a single owner for LLM quality vs security, RLS/secrets vs the OWASP plan, UI/motion/housekeep, QA vs stubs, and third-party name-gating.
- `audit-*` default remains present-then-stop. Audit-and-fix exceptions: `audit-responsive`, `audit-code-quality`, `audit-performance`, `audit-security`, `audit-i18n`, `audit-bundle-size` (plus `enhance-email-deliverability`).
- `/test` routes `test-load` and `test-visual-regression`. `/uiux` holds the enhance surface router.
- `plan-data-integrity` / `/integrity-plan` no longer own restore drills (those stay on `plan-backup-dr`).
- `workflow-spec-tdd` no longer references `mobile-mobile-*`.

### Added

- **`check-skill-refs`** — CI gate for doubled-prefix typos and the stale `audit-responsive-layout` alias.

---

## [1.19.0] — 2026-08-18

Adds the **ops / launch gap pack** (13 skills): product analytics, UI state matrix, LLM attack surface, IAP, env parity, infra cost, visual + load tests, privacy/DR/ASO plans, email deliverability, and a pack self-audit. Skips the pack's `audit-responsive-layout` — already shipped as `audit-responsive` in 1.18.0. `audit-llm-security` is new (source tarball was missing that file).

### Added

- **`audit-llm-security`** — OWASP LLM Top 10 on *app-facing* AI (not Langfuse quality, not coding-agent policy).
- **`plan-privacy-compliance`** + `/privacy-plan` — collection-vs-claimed, consent, deletion/export, GDPR / APPI / store labels. Cross-linked with `audit-analytics`.
- **`plan-backup-dr`** + `/backup-plan` — restore capability, RPO/RTO, drill evidence (not destructive-op gates).
- **`audit-analytics`** — funnel coverage, taxonomy, consent-gated firing.
- **`audit-ui-states`** — empty / loading / error / offline / overflow matrix.
- **`test-visual-regression`** — Playwright screenshot baselines + CI diffs (playwright-cli, not MCP).
- **`test-load`** — k6/Artillery journeys; never hits prod unsigned.
- **`audit-monetization-iap`** — StoreKit / Play / RevenueCat (not Stripe/web).
- **`plan-aso`** + `/aso-plan` — store listing find + install conversion.
- **`enhance-email-deliverability`** — SPF/DKIM/DMARC + hygiene (kept `enhance-*` beside `design-email`).
- **`audit-env-parity`** — config agreement across envs (local runnability stays on `workflow-environment-ready`).
- **`audit-infra-cost`** — hosting/egress (CI minutes → `audit-cicd`; tokens → `plan-llm-cost-guardrails`).
- **`audit-skill-conflicts`** + `/skill-conflicts` — pack self-audit: contradictory directives, overlapping triggers, stale cross-refs, context bloat. Per-file spec stays on `validate:skills`.

### Changed

- **`design-email`** — no longer claims deliverability / SPF / "why is my email in spam".
- **`plan-data-integrity`** — no longer claims backup drills / disaster recovery; those route to `plan-backup-dr`.
- **Neighbors** — `audit-responsive`, `audit-langfuse-llm`, `plan-llm-cost-guardrails`, `plan-mobile-readiness`, `audit-payment-system`, `audit-cicd`, `workflow-environment-ready`, `iterate-post-launch`, `plan-stub-checker`, `enhance-agent-guardrails`, `test-red-team`, `audit-resilience`, `data-visualization` now point at the new skills.

---

## [1.18.0] — 2026-08-18

Adds **`audit-responsive`**: the missing layout/IA audit for "desktop is a linearized phone." Existing skills covered mobile-up (`design-mobile-first`), cross-page IA (`audit-ux-journeys`), tokens (`audit-uiux-design-system`), and polish (`enhance-web-ui` / `enhance-web-ux`) — none owned the 10 breakpoint anti-patterns + wireframe-then-implement loop.

### Added

- **`audit-responsive`** — detect stack, score 10 layout/IA anti-patterns (`file:line` + severity), extract or propose a token sheet, ASCII wireframes at 375 / 768 / 1440, then implement in reviewable chunks (report-first if scope is large). Live verify via playwright-cli. References: `references/checklist.md`.
- **`/responsive-audit`** — thin slash entry. Optional path scope.

### Changed

- **`design-mobile-first`** — description no longer claims generic "responsive" (that stole this skill). Routes linearized-desktop complaints to `audit-responsive`.
- **Neighbors** — `plan-uiux-unification`, `audit-ux`, `audit-ux-journeys`, `audit-uiux-design-system`, `/uiux`, `docs/PLAN-LOOPS.md`, catalog compositions, and the trigger cheat sheet now point at the new skill.

---

## [1.17.0] — 2026-08-15

Cursor/Claude config housekeep: cut always-on rule weight, stop shipping Cursor builtin skill dupes, slim default MCP, interpolate secrets.

### Changed

- **Skill descriptions** — house budget 320 characters (was 1024). 86 descriptions shortened; bodies unchanged. `paths` on RN/Capacitor skills; `disable-model-invocation` on slash-only `skills-cursor` utilities.
- **Installer** — Cursor skips 11 `skills-cursor` names that Cursor already ships as managed builtins (keeps `babysit`). Claude still gets portable copies. `--no-agents-mirror` and `--quiet` added. `install.sh` is a wrapper around `bin/install.mjs`. `cursor-sync` finds `~/Documents/GitHub/cursor-kenji` and calls the Node installer.
- **Rules** — `full-stack-ship-discipline` is agent-selected (no auto-push). `composer-2.5-execution` drops empty `globs`. `shell-first-search` is a hang-fallback, not a Grep/Glob ban.
- **MCP** — essential template is Firecrawl (authenticated, feedback flags off) + Context7 + Supabase with `${env:NAME}` interpolation. Sequential Thinking and Playwright MCP are full-template only. Research command no longer requires Sequential Thinking MCP.

### Added

- `scripts/shorten-skill-descriptions.mjs` — description budget rewriter used for this release.

---

## [1.16.0] — 2026-08-04

Patterns adopted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) after a full comparison of the two packs: alignment-first interviewing, shared domain language, session handoff, intent-first conflict resolution, and the "writing great skills" verbosity levers.

### Added

- **`grilling` skill + `/grill-me` command** — relentless one-question-at-a-time interview to close the user↔agent alignment gap before any code: recommended answer with each question, facts looked up vs decisions asked, no edits until confirmed, closes with a decision log that feeds `design-prd` / `/plan`.
- **`domain-modeling` skill** — build a `CONTEXT.md` glossary and sparing ADRs (hard-to-reverse + surprising + real trade-off only); challenges conflicting terms, sharpens fuzzy language, cross-references claims against code.
- **`handoff` skill + `/handoff` command** — compact the session into a handoff doc (state, ordered next steps, suggested skills, gotchas) in the OS temp dir; secrets redacted, artifacts referenced not copied, verification claims held to the `verification-before-completion` ladder. `disable-model-invocation: true`, so it costs zero always-on context.
- **`workflow-merge-conflicts` skill** — resolve in-progress merges/rebases by tracing each hunk to its original intent (commits, PRs, issues) before resolving; repo checks re-run before finishing.

### Changed

- **`meta-skill-creator` + `create-skill` (Cursor)** — added the verbosity levers: no-op test (delete lines the model already obeys), positive phrasing over prohibition, leading words ("fast, deterministic, low-overhead" → *tight*), single source of truth, one trigger per branch in descriptions, checkable completion criteria; plus model-invoked vs user-invoked (`disable-model-invocation`) cost guidance.
- **`debug-error`** — Phase 1 now requires a tight feedback loop before any hypothesis: one red-capable, deterministic, fast command already run once, asserting the user's exact symptom; Phase 2 gains repro minimisation (every remaining element load-bearing); Phase 6 requires the loop re-run green and the minimised repro converted to a regression test at a correct seam.
- **`workflow-spec-tdd`** — TDD phase now tests only at pre-agreed seams (named in the plan, confirmed with the user), works in vertical slices (tracer bullets, not all-tests-first), bans tautological tests (expected values from an independent source of truth), and treats refactor-broken tests as implementation coupling to fix at the seam.
- **`.cursor-plugin/plugin.json`** — re-synced version with `package.json` (was left at 1.14.1 by the 1.15.0 release).

## [1.15.0] — 2026-08-02

Always-on rules audit (2026-08-02): the shipped rule set cost ~11k tokens per chat once installed globally, against a ~2–4k healthy budget, and per-project template bundles leaked into every repo. Verified against current Cursor docs (`alwaysApply: true` ignores globs/description; rules ≤500 lines; skills load on demand) and Claude Code docs (CLAUDE.md ≤200 lines; `paths:` frontmatter is the only conditional loader in `.claude/rules/`; hooks for enforcement).

### Changed

- **Installer (`bin/install.mjs`, `install.sh`)** — per-project rule bundles (`native-rn-monorepo/`, `project-starter/`) are no longer copied into global `~/.cursor/rules` or `~/.claude/rules`; they are documented as copy-into-project bundles and their always/glob rules were firing in every repo (e.g. RN no-Mac conventions loading in Vite web projects).
- **`rules/skill-workflows.mdc`** — demoted from a 172-line always-on catalog (~2.1k tokens/chat) to a 46-line agent-requested routing index (`alwaysApply: false`); skills self-describe and load on demand, so the full table was dead weight.
- **`rules/composer-2.5-execution.mdc`** — demoted to agent-requested for Cursor and `paths`-scoped (`**/plan-*.md`, `**/plans/**`) for Claude Code, so plan-execution guardrails load only during plan runs.
- **`rules/senior-engineer.md` → `.mdc`** — cut from 122 lines of generic protocol to 26 lines of stack defaults + security non-negotiables, demoted to agent-requested; renamed because current Cursor ignores plain `.md` rule files.
- **`rules/full-stack-ship-discipline.mdc`** and **`rules/verification-before-completion.mdc`** — kept always-on but rewritten at roughly half the length; intent (deploy-schema-with-UI, evidence-before-completion ladders, completion-judge gate) preserved.
- **`scripts/test-install.mjs`** — asserts the bundle exclusion (no `native-rn-monorepo/` or `project-starter/` in installed rules) and the `.mdc` rename.

Hooks, skills, commands, and subagents are unchanged — on-demand surfaces were not the problem.

---

## [1.14.1] — 2026-07-29

Follow-up audit of every browser-touching file after the 1.14.0 migration. Two classes of leftover slipped through: the prose pass used single-line regexes, so any "Playwright MCP" that wrapped across a line break survived; and the token pass renamed `browser_*` verbs without being able to tell that a block of bare verb names was meant to be *runnable*. All 26 files that reference `playwright-cli` or the anti-stall protocol were re-read by hand.

### Fixed

- **`test-playwright`** — Phase 3, the skill's core per-step interaction loop, was still bare pseudo-code carrying the pre-migration "wait 2s" phrasing. Rewritten as a runnable `$PW $S …` sequence. A stale "hard `goto` reload" also became `reload`.
- **`test-qa/references/details.md`** — the equivalent execution-cycle block, same fix.
- **`audit-langfuse-llm`** — a leftover MCP-shaped ` ```json ` block (`goto` plus a `{ "url": … }` object) is now a real `open --headed` invocation.
- **`audit-uiux-design-system`** — the skill **description** still advertised "browser MCP tools", line-split across the YAML fold. Description text feeds skill triggering, so this was stale metadata, not just prose.
- **`commands/test.md`** — "drive a visible browser through the Playwright / MCP" spanned a line break; now names playwright-cli with the `-s=` and `--headed` form inline.
- **`audit-ux/references/details.md`** — bare arrow-stub keyboard-navigation block converted to real commands.

### Changed

- **`enhance-web-ux`** — the three-viewport pass instructed "always with viewport set BEFORE navigate", written for the MCP. Verified against `@playwright/cli@0.1.17` that `resize` persists across `goto` (a 1024×700 viewport survived navigation intact), so the ordering is sound; the stub is now a runnable loop over the three widths with a comparison table for what each one exposes.

### Notes

Skills showing no `$PW` invocations are intentional, not gaps. Spokes such as `enhance-motion` and `enhance-web-forms` reference commands by name and defer to `protocol-browser-anti-stall` for the invocation form — only the hub carries the `PW=` boilerplate.

---

## [1.14.0] — 2026-07-29

Browser automation moves off the **Playwright MCP** and onto **`playwright-cli`**. The MCP serves one browser per server, and a persistent Chrome profile can only be locked by one process at a time — so several agents on the same repo either contend for the profile lock or fight over each other's tabs. The CLI gives every agent its own isolated browser through `-s=<session>`, runs natively in parallel shells, and costs far fewer tokens (no tool schemas or verbose accessibility trees loaded into context). Verified end-to-end against `@playwright/cli@0.1.17`.

### Changed

- **`protocol-browser-anti-stall`** — rewritten around `playwright-cli`. Mandatory `-s=<session>` naming, `npx --yes @playwright/cli@latest` invocation (a global `npm i -g` is unreliable under `fnm`/`nvm`, whose global prefix is per-shell), and **explicit `--headed`** because the CLI is headless by default where the MCP was headed. Adds a session-lifecycle section (`open`/`goto`/`close`/`list`/`close-all`/`kill-all`), a parallel-agents section replacing the old tab-claiming etiquette, and artifact rules covering both `.playwright-mcp/` (screenshots via `--filename`) and the CLI's auto-written `.playwright-cli/` snapshots. All anti-stall guarantees are preserved: navigation guard, ≤3s waits, max 4 attempts per goal, evidence-before-retry, timeout budget, blocker format.
- **Waiting model** — there is no `wait` command in the CLI. Playwright auto-waits for actionability on `click`/`fill`/`select`; explicit waits become `sleep N` (≤3s) or `run-code` with `waitFor({ timeout })`. Documented in the protocol and the command map.
- **22 skills + `commands/test.md` + README migrated** — 191 tool-token replacements plus 52 prose updates across `test-playwright`, `test-qa`, `test-red-team`, `audit-accessibility`, `audit-uiux-design-system`, `audit-ux`, `audit-langfuse-llm`, `audit-bundle-size`, `audit-i18n`, `audit-realworld`, `deploy-verify`, `iterate-post-launch`, `enhance-readme`, `enhance-web-ux`, `enhance-web-ui`, `enhance-web-forms`, `enhance-web-seo`, `enhance-motion`, `enhance-pwa`, `enhance-capacitor-ui`, `design-email`, `housekeep-design`, `plan-perf-audit`, `plan-stub-checker`, `plan-uiux-unification`. The 19 structural `playwright:browser_*` JSON call sites (axe-core injection, keyboard walks, deploy smoke checks) were rewritten by hand into real shell invocations.
- **`mcp/README.md`** — the Playwright entry now documents the CLI as the supported path, keeping the MCP only as an `--isolated` fallback (which loses saved logins). The pin in `mcp/VERSIONS.md` is retained for that fallback.
- **`.gitignore`** — added `.playwright-cli/` alongside `.playwright-mcp/`.

### Added

- **`references/mcp-to-cli-map.md`** — complete `browser_*` → CLI command map (actions, waiting, evidence, tabs, storage, session management), plus the concepts that no longer apply (`browser_lock`, tab claiming, `session.json`, `--isolated` storage-state injection) and the gotchas that bite in practice.
- **Google sign-in workaround** — `references/playwright-session-coordination.md` documents the one case that needs care: Google detects CDP and blocks sign-in from any Playwright-launched browser with "This browser or app may not be secure." The working sequence is a one-time manual login in **real Chrome** against a dedicated `--user-data-dir` (no `--remote-debugging-port`), then reuse via `open --persistent --profile <dir>`. Verified: Gmail loads straight into the inbox, and the session survives `close` → reopen.
- **`scripts/migrate-browser-mcp-to-cli.mjs`** — the reviewed migration script, kept in-tree as an audit trail of how the rewrite was performed.

---

## [1.13.0] — 2026-07-25

UX journeys audit — a new cross-page skill for the layer `audit-ux` (per-page heuristics) doesn't cover: **can users actually find things and finish their stories?** A site can pass every per-page heuristic and still fail because the feature is buried four clicks deep, the nav mirrors the DB schema, or the checkout dead-ends on mobile. Grounded in the 2026 practitioner consensus: a UX audit derives from user stories, audits IA against mental models, walks the real journeys, and grounds findings in behavioral evidence — never taste presented as data.

### Added

- **`audit-ux-journeys`** — cross-page user-story, task-completion & IA audit (**Skill 110**). **Phase 0** derives 5–10 real stories from routes/nav/CTAs (reuses `design-prd`/`plan-test-coverage` inventories, never invented personas) and scopes depth by audit trigger (KPIs dropping / complaints / redesign / pre-launch-no-data → qualitative, labeled as assumptions). **Phase 1** audits IA structurally (IA1–IA9): click depth per story target, orphan pages, dead ends, label consistency (nav ≈ title ≈ H1), grouping vs mental model, first-click logic, wayfinding, search/filter, URL sanity. **Phase 2** walks every story end-to-end in a headed browser (desktop + 390px mobile) → task-completion matrix with friction logs (hesitation/mislabel/backtrack/surprise/stall) and error-recovery probes (invalid input, Back, refresh mid-flow); a BLOCKED story is automatically a Blocker. **Phase 3** evidence discipline — every finding tagged `[data]` / `[observed]` / `[judgment]`; validates against GA4/PostHog/Clarity/Amplitude funnels when present, otherwise recommends minimal instrumentation so the next audit has evidence. **Phase 4** impact×effort report: quick wins vs roadmap vs deprioritized, neutral language, always names what works. Detailed methods in `skills/audit-ux-journeys/references/checklist.md`.

### Changed

- **`audit-ux`** — description and Step 0c now scope it explicitly to the **per-page experience lens** and hand cross-page journeys/IA to `audit-ux-journeys` (its 0c IA map is context-building, not a structural audit). CATALOG, TRIGGER-CHEATSHEET, README (family table 17→18, full list, Assess bullets, "Start here" row), and `skill-workflows.mdc` updated; skill count 109 → 110.

---

## [1.12.1] — 2026-07-24

Fix broken Tsumagoi image on the npm README (private-repo raw GitHub URL 404'd). Point at the public live-site OG image and drop the private repo link.

### Fixed

- **Tsumagoi ad image** — `src` now `https://tsumagoi.kensaur.us/og-image.png` (public) instead of `raw.githubusercontent.com/...` (404 on the private repo).
- **Also by table** — Tsumagoi row links only to the live site; no GitHub repo link.

---

## [1.12.0] — 2026-07-24

README discoverability overhaul — ELI5 intro, always-visible skill lists with family counts, npm-safe workflow diagram (no mermaid), and a playful Tsumagoi Work&Camp invite. No skill/command behavior changes; counts unchanged.

### Added

- **"Explain it like I'm five"** opener with a use-case table (*you say… → what kicks in*) and an ASCII workflow loop that renders on npm (replaces the mermaid block that showed as raw code).
- **Skill families at a glance** table (counts + one-line blurb per family) plus a full always-visible skill table per family — no collapsed `<details>` you have to click open.
- **Wanna code in the mountains?** — playful ad for [Tsumagoi Work&Camp](https://tsumagoi.kensaur.us) (1,444 m coworking camp) with live-site link + screenshot.

### Changed

- README section order: inventory + full skill list sit **above** the long Quick Start installer details.
- `scripts/generate-skill-index.mjs` emits markdown tables instead of collapsed details; warmer family headings.
- Workflows section simplified to a stage cheat-sheet that points at the top loop diagram.

---

## [1.11.2] — 2026-07-24

Move the auto-generated skill index up so npm/GitHub visitors see every skill right after the inventory table — no 12-screen scroll past Workflows. No skill behavior changes.

### Changed

- **README section order** — `Every skill, in plain English` now sits immediately after `What's Inside` (before `Workflows`), so the skill list is discoverable on the npm Readme tab without deep scrolling.

---

## [1.11.1] — 2026-07-24

README rewrite — the npm/GitHub landing page now lists every skill with a one-line summary, and the prose is warmer throughout. No skill, command, rule, or hook behavior changes; counts unchanged.

### Added

- **Auto-generated skill index in README** — new "Every skill, in plain English" section lists all **121** installable skills (109 agent + 12 Cursor) grouped by family, each with a one-line summary pulled from that skill's `SKILL.md` frontmatter. Collapsed `<details>` groups keep the page scannable.
- **`scripts/generate-skill-index.mjs`** — regenerates the README block between `<!-- SKILL-INDEX:START -->` / `END` markers. `npm run gen:skill-index` writes; `npm run check:skill-index` (wired into `npm test`) fails if the block drifts from the filesystem.

### Changed

- **README tone** — benefit-first intro, shorter sentences, plain-English lead-ins before dense tables, and the giant Workflows "Assess" paragraph broken into scannable sub-bullets. FAQ grammar fix ("A installable" → "It's an installable").

---

## [1.11.0] — 2026-07-24

Payment system audit — a new read-only skill for the code that fails differently from normal CRUD: a retried charge is a **double-charge**, a lost ledger write is **vanished money**, a logged PAN is **PCI liability**, an unverified webhook is a **spoofed "payment succeeded"**. Grounded in the 2026 consensus (idempotency + double-entry ledger + reconciliation, with PCI DSS v4.0.1 as the floor and webhooks as the source of truth). Scope-gated so a Stripe-Checkout shop and an in-house gateway each see only relevant findings, and wired to the Stripe MCP for version-anchored provider checks.

### Added

- **`audit-payment-system`** — read-only, scope-gated audit (**Skill 109**). Phase 0 detects the payment surfaces + provider and classifies the repo (**P0 merchant integrator / P1 platform-marketplace / P2 gateway-PSP-fintech**) so an in-house-ledger control is `N/A` (not "Missing") on a shop that offloads it to Stripe. Phase 2 marks each in-scope control **Implemented/Partial/Missing/N-A** with `file:line` across seven groups: **A** money-movement correctness (idempotency on every mutation + DB unique constraint, dedup/payload-guard, payment state machine / no double-capture, integer minor units, multi-currency+FX), **B** ledger & data integrity (double-entry balanced/sum-zero, append-only immutable, derived balance snapshots, auditability, date partitioning), **C** async & webhooks (sync-auth vs async-everything, HMAC verify, event-id dedup + 200-then-process, atomic state+ledger+outbox, pull-based recovery for stuck payments, refund/dispute/payout saga), **D** reconciliation & settlement (daily 3-way match ledger↔PSP↔bank, break report, discrepancy handling, halt-on-unreconciled brake), **E** fraud/risk/SCA (velocity/geo/device + rules/ML score, 3DS2/SCA + exemptions, fraud-service fail policy, chargeback/VAMP monitoring, AML), **F** PCI DSS v4.0.1 (never store/log PAN or CVV, tokens-only scope reduction, key rotation, access audit), **G** resilience (PSP/bank timeout + breaker, bulkhead, partial-write safety, graceful degradation). Detailed per-control detection in `skills/audit-payment-system/references/checklist.md`.
- **Stripe MCP wiring** — when the PSP is Stripe, Phase 1 uses `search_stripe_documentation` for concepts/best-practice and `stripe_api_search` + `stripe_api_details` for exact API params, anchoring findings to the current API (PaymentIntents, not the legacy Charges API). Non-Stripe providers use `/research` against official docs.

### Changed

- No severity below **Critical** for a double-charge, lost-money, or PAN-exposure finding. Read-only: payment code is a STOP-and-confirm surface, so findings feed a human-reviewed remediation rather than an unattended edit. Delegates without overlap — per-call resilience → `audit-resilience`, PCI/secrets → `audit-security`, ledger schema → `audit-db-schema`, outbox/saga structure → `audit-backend-architecture`. CATALOG, TRIGGER-CHEATSHEET, README, and `skill-workflows.mdc` updated; skill count 108 → 109.

---

## [1.10.0] — 2026-07-24

Decision lens for `audit-backend-architecture` — v1.9.0 answered *"is pattern X present?"* (conformance). This turns it into a **decision advisor** that answers *"which pattern should this codebase adopt next, and which would be over-engineering right now?"* — grounded in the 2026 "start simple, earn every pattern / modular-monolith-first" consensus. No new skill; the existing audit gets a second lens plus three patterns it was missing.

### Added

- **Fit/decision lens (Phase 3)** in `audit-backend-architecture` — for each pattern, classify **Adopt now / Adopt when [trigger] / Defer (premature)** from detected symptoms, with a **maturity ladder** (Stage 0 modular monolith → cache-aside/outbox → async/BFF/CQRS → db-per-service/saga → mesh/cell-based, each gated by a trigger) and a **symptom→pattern decision table**. Over-engineering is now a first-class finding (CQRS without read/write divergence, mesh/microservices below the size threshold, distributed monolith).
- **Core principle — "start simple, earn every pattern"** — modular-monolith-first default; a pattern is only "Missing" when a measurable trigger justifies its cost; decide sync-vs-async **per interaction**; distributed monolith flagged as worse than a monolith.
- **Three patterns added** (audit rows #17–19 + detection in `references/patterns.md`): **communication style** (sync request/response vs async event-driven, per interaction, with a signal table), **cache-aside** (TTL + invalidation + stampede guard), **database-per-service / data ownership** (+ distributed-monolith anti-pattern).
- **`backend-patterns/references/architecture-patterns.md`** — implementation for the three: sync-vs-async decision tree + hybrid/outbox example, cache-aside read+invalidate, and data-ownership (owned schemas at T1, split only under real pressure).

### Changed

- Report template gains **Adopt now / Adopt when / Defer** sections (renumbered to Phase 4). `audit-backend-architecture` description, CATALOG, TRIGGER-CHEATSHEET, README, and `skill-workflows.mdc` now surface the decision lens ("which pattern should I use", "am I over-engineering", "sync vs event-driven"). Skill/command/agent **counts unchanged** (enhancement, not a new skill).

---

## [1.9.0] — 2026-07-24

Backend architecture audit — a new read-only skill that checks a repo's **distributed-systems architecture** (not just per-call resilience), plus an implementation reference so the fixes it delegates actually exist. Answers "is my backend production-grade?" for the patterns agents systematically skip: API gateway, BFF, outbox, saga, bulkhead, hexagonal, service mesh, and more. Topology-gated so a Next.js/Supabase monolith and a Kubernetes fleet each see only relevant findings.

### Added

- **`audit-backend-architecture`** — read-only, topology-gated audit (**Skill 108**). Phase 0 classifies the repo into a tier (T1 serverless/monolith → T2 containers → T3 k8s/microservices/event-driven), then marks each in-scope pattern **Implemented/Partial/Missing/N-A** with `file:line`: **API gateway** (auth, rate-limit, CORS, transform, logging, monitoring, caching), **BFF / API composition / GraphQL federation**, **circuit breaker**, **bulkhead**, **backpressure/load-shedding**, **outbox + CDC** (the dual-write fix), **saga** (orchestration/choreography + compensation + saga-pivot), **CQRS + event sourcing**, **hexagonal / ports-and-adapters**, **anti-corruption layer**, **strangler-fig migration**, **sidecar / service mesh** (incl. ambient/sidecarless), **cell-based architecture**, **zero-trust/mTLS**, **distributed tracing + SLOs**, and **contract testing**. Detailed per-pattern detection lives in `skills/audit-backend-architecture/references/patterns.md`.
- **`skills/backend-patterns/references/architecture-patterns.md`** — implementation guidance + code for the patterns the audit flags (gateway centralization, BFF, bulkhead, circuit-breaker placement, outbox+relay/CDC, saga with the saga-pivot rule, hexagonal/ports-and-adapters, anti-corruption layer, strangler-fig), plus a "when NOT to reach for these" section.

### Changed

- **`audit-resilience` boundary kept clean** — the new architecture audit checks whether *patterns* exist (structural); per-call runtime tuning (timeouts, retry backoff+jitter, idempotency keys, cancellation) still belongs to `audit-resilience`, which the new skill explicitly defers to instead of duplicating.
- **`backend-patterns`** — description gains triggers ("circuit breaker", "outbox pattern", "saga", "bulkhead", "hexagonal architecture", "API gateway", "BFF") and a new "Architecture patterns (distributed systems)" section pointing to the reference; pairs with `audit-backend-architecture`.
- **Routing/docs** — added to `skill-workflows.mdc` (repo + `.cursor`), `docs/CATALOG.md`, `docs/TRIGGER-CHEATSHEET.md`, and `README.md` (Assess stage, use-case table). Counts synced to **108 skills**.

---

## [1.8.3] — 2026-07-23

Command-collision fix — three of our slash commands shared names with Claude Code's own commands. Because Claude Code 2.x **merges `commands/` into the skill namespace**, a file at `commands/<x>.md` creates `/<x>`: when `<x>` matches a built-in it shows a **duplicate**, and when it matches a bundled skill our file **silently overrides** Claude's. Renamed all three and added a CI guard so it can't regress. No other skill, command, rule, or hook behavior changes; command **counts are unchanged**.

### Changed

- **`/mcp` → `/mcp-guide`** — was duplicating Claude Code's built-in `/mcp` (the MCP server manager). Renamed `commands/mcp.md` → `commands/mcp-guide.md`.
- **`/review` → `/review-code`** — was duplicating Claude Code's built-in `/review`. Renamed `commands/review.md` → `commands/review-code.md` (still delegates to `audit-code-review`).
- **`/debug` → `/debug-issue`** — was overriding Claude Code's bundled `/debug`. Renamed `commands/debug.md` → `commands/debug-issue.md` (still delegates to `debug-error`).
- **`README.md` + `docs/CATALOG.md`** — command tables updated to the new names with a note on why each was renamed.

### Added

- **CI guard** in `scripts/validate-skills.mjs` — fails `npm test` if any `commands/*.md` name collides with a known Claude Code built-in command or bundled skill, so future commands can't reintroduce a duplicate/override.

> **Upgrade note:** the natural-language triggers are unchanged (say "debug this", "review my PR", etc. and the underlying skill still fires). Only the explicit slash aliases changed: use `/mcp-guide`, `/review-code`, `/debug-issue`. After updating, **restart Claude Code** — it live-watches skill directories but not `commands/`, so newly added or renamed command files only register on the next session start.

---

## [1.8.2] — 2026-07-23

Documentation-skill release — teach the skills to write the way the 1.8.1 README now reads. Bakes the reader-first, plain-language 5W1H approach into the documentation-authoring skills themselves, so every doc they produce orients a newcomer before diving into reference detail. No other skill, command, rule, or hook behavior changes.

### Changed

- **`docs-writer`** — new **"Core principle — write for the reader's mental model first"** section with a 5W1H table (what/why/who/how/when·where → how to answer each) and the rules that follow (lead with the goal not the implementation, progressive disclosure, beat the curse of knowledge, show-don't-tell). Adds a **"Newcomer on-ramp"** section demonstrating the 3-column plain-language building-blocks glossary, a **"Kill the Jargon"** guideline (plain-first, precise-second), an upgraded README template (plain tagline + why/who + glossary hint), and two new README-checklist items (first-screen what/why/who; jargon defined or glossed).
- **`enhance-readme`** — previously visual-only; adds **"The words matter as much as the pixels"** coupling the hero/screenshot work to `docs-writer`'s principle, defines the ideal first-screen order (name+tagline → hero → why/who → first-win → depth), adds why/who to the hero template, and adds a stop-condition that the first screen must answer what/why/who in plain language.
- **`docs-coauthor`** — adds a guiding-principle line: orient the reader (what/why/who) from the first sentence, not just at the Reader-Testing stage; points to the canonical `docs-writer` rule.

Kept DRY: the full principle lives in `docs-writer`; the other two reference it. `plan-docs-sync` (a drift *audit*, not an authoring skill) intentionally unchanged.

---

## [1.8.1] — 2026-07-23

Documentation-clarity release — same skills, friendlier front door. Rewrites the released-page surfaces (README on npm/GitHub, `llms.txt` for AI crawlers, the Cursor plugin manifest, directory listing copy) so a non-technical newcomer can answer *what / who / why / how* before hitting the counts and taxonomy. No skill, command, rule, or hook behavior changes.

### Changed

- **README newcomer on-ramp** — adds a plain-English hero line, a "New to AI skills?" primer, a "Who it's for" callout, and a five-row **building-blocks glossary** (Skill / Command / Subagent / Rule / MCP server → plain meaning + how you trigger each) directly under the intro, while preserving the full developer depth below.
- **`llms.txt`** — leads with the plain value proposition (ready-made playbooks your editor auto-triggers) before the inventory, improving how AI answer-engines and directory crawlers summarize the project.
- **`.cursor-plugin/plugin.json`** — benefit-first description for the Cursor marketplace / directory listings.
- **`docs/CATALOG.md`** — skill-taxonomy table gains a lifecycle **Stage** column and a `plan-`/`housekeep-` row, with a newcomer pointer to the Getting Started guide.
- **`docs/GETTING-STARTED.md`** — plain-language example rows for the v1.8.0 skills (motion, forms, design consolidation, guardrails, resilience).
- **`docs/TRIGGER-CHEATSHEET.md`** & **`docs/PROMOTION.md`** — first-time-reader pointer and benefit-first listing copy.

---

## [1.8.0] — 2026-07-23

Design, motion, forms, and anti-vibe-coding release. Adds six skills that fill the loop's remaining gaps — full-stack parity (`audit-realworld`), production resilience (`audit-resilience`), coherent motion on an existing system (`enhance-motion`), design-system consolidation to one SSOT (`housekeep-design`), production-quality forms (`enhance-web-forms`), and guardrails-as-code against AI regressions (`enhance-agent-guardrails`). README gains a "mental model" section teaching how the families chain against each other, a by-use-case entry table, and lifecycle-stage tags. Skills 100 → 106.

### Added

- **`audit-realworld` skill** — read-only full-stack gap audit that benchmarks a repo against the [RealWorld](https://github.com/realworld-apps/realworld) ("Conduit") reference: its formal API spec, shared Bruno/Hurl E2E contract suite, and closest-stack reference implementation. Auto-detects strict spec **Conformance** (repo is a RealWorld build) vs **Benchmark** (maps RealWorld's production-relevant patterns onto the repo's own domain), and bows out cleanly on non-CRUD/non-web repos. Reports Implemented/Partial/Missing/Diverges across frontend, backend, and data layer with `file:line` evidence, then delegates real production hardening to `audit-security` / `plan-security-audit` / `plan-perf-audit` / `plan-rls-audit` / `full-stack-ship-discipline` — RealWorld is treated as a completeness/pattern reference, never a production bar. Wired into the Audits routing table, `docs/CATALOG.md`, and `docs/TRIGGER-CHEATSHEET.md`. Skills 100 → 101.
- **`enhance-motion` skill** — audits an existing app's design system and current motion, then applies coherent, `prefers-reduced-motion`-safe, 60fps motion using a right-sized 2026 stack (tw-animate-css for CSS utility transitions, Auto-Animate for zero-config list/layout changes, Motion/motion.dev for component transitions·gestures·presence, GSAP only for complex timelines), with Kinetics as a pattern source. Defines a motion-token SSOT so timing/easing stops fragmenting. Distinct from `design-motion` (from-scratch cookbook); applies changes and verifies via browser MCP.
- **`housekeep-design` skill** — consolidates a design system that has drifted across many vibe-coding sessions and dev handoffs into one source of truth. Detects competing tokens, duplicate components, naming drift, mixed icon libraries, and arbitrary values; reconciles each conflict to a best-of-both canonical form; migrates usages via mechanical codemod (pairs with `burndown-full`); and installs lint guardrails so drift can't recur. Establishes a 3-layer W3C token taxonomy (primitive → semantic → component). The execution arm of `plan-uiux-unification`; the design counterpart of `workflow-housekeep`.
- **`enhance-web-forms` skill** — builds/upgrades web forms to production quality: accessible structure (labels, fieldsets, autocomplete, input types), schema-driven validation with client↔server parity, screen-reader-associated inline errors, complete interaction states (loading/disabled/success/error/empty), multi-step flows, unsaved-changes guards, and optimistic submit feedback. Auto-detects the form + validation stack; applies changes and verifies via browser MCP.
- **`enhance-agent-guardrails` skill** — installs guardrails-as-code so AI/vibe-coding can't keep reintroducing the same problem classes (leaked secrets, injection, off-system styles, untested code, vulnerable deps, destructive ops). Audits existing protection, then sets up agent policy files (`.cursor/rules` + `AGENTS.md`), a pre-commit hook (secret scan + SAST + lint/typecheck), a CI gate that treats agent output as untrusted, and lint-as-policy rules. Verifies the guards block a planted bad pattern; flags merge-blocking CI changes for human review. Grounded in 2026 research on AI-generated-code security debt.
- **`audit-resilience` skill** — read-only audit for the non-functional "20%" agents systematically skip (the "80% problem"): timeouts, retries with backoff+jitter, circuit breakers, idempotency keys, rate limiting, graceful degradation, cancellation, audit logging, and PII handling in logs. Inventories every external call, mutation, webhook, and payment path and marks each concern Implemented/Partial/Missing with `file:line`, severity, and the exact fix skill; delegates remediation to `backend-error-handling` / `backend-patterns` / `backend-observability` / `plan-*`.

All six new skills wired into both `skill-workflows.mdc` routing copies, `docs/CATALOG.md`, and `docs/TRIGGER-CHEATSHEET.md`. Skills 100 → 106.

### Changed

- **README mental-model rewrite** — the Workflows section now opens with a "how the families work against each other" lifecycle diagram (Orient → Assess → Change → Prove → Ship & operate, with always-on Guardrails), a "Start here — by use case" entry table that chains the new skills, and lifecycle-**stage** tags added to the skill-taxonomy table (Assess / Change / Prove / Ship / Operate / Guardrail). Teaches composition, not just the flat skill list.

---

## [1.7.0] — 2026-07-21

Completion-loop release — close the gaps where agents stop early, declare false "done", or leave documented capabilities unwired. Adds an enforcement layer (evidence rule + independent judge + opt-in continuation hook), five closure/ops workflow skills, and repairs every known broken internal reference. Skills 95 → 100, commands 16 → 36, subagents held at 6.

### Added

- **`complete-everything`** skill + **`/complete-everything`** command — close unfinished plan intent and connected work previously parked as out of scope/follow-up/optional, persist observable acceptance evidence in `.cursor/complete-everything-state.md`, and loop the applicable typecheck/lint/test/API/build/browser gates until complete
- **`completion-judge` subagent** — independently reconciles the approved outcome, durable state, full diff, baseline, and fresh evidence before returning `PASS`, `CONTINUE`, or `BLOCKED`
- **`verification-before-completion` rule** — defines evidence-backed completion levels from implemented through observed-stable and forbids claims above the proven level
- **Opt-in Cursor completion hook** — continues only actionable unchecked `complete-everything`/`burndown-full` state; safely merges into existing user hooks and remains inert for completed, errored, or human-gate-only runs
- **Closure-loop workflow skills + commands** — `workflow-green-repo` (`/green-repo`) drives the whole repository to a verified-green baseline; `workflow-ship-and-observe` (`/ship-and-observe`) takes merged code to a monitored production release with a live-revision check and rollback tail; `workflow-feedback-to-closure` (`/feedback-to-closure`) turns raw feedback into deduplicated durable tickets driven to production-verified closure
- **`workflow-environment-ready`** skill — preflights the toolchain, services, and config before a long autonomous run so it does not fail at the finish line on a missing dependency or credential
- **`iterate-agent-harness`** skill — converts an agent failure (premature stop, false done, reward-hacked check, broken handoff) into a durable harness guard plus a regression check that fails before the fix
- **17 `plan-*` pointer commands** — `/uiux-plan`, `/security-plan`, `/rls-plan`, `/secrets-plan`, `/validation-plan`, `/integrity-plan`, `/error-plan`, `/deps-plan`, `/cost-plan`, `/aeo-plan`, `/mobile-plan`, `/capacitor-plan`, `/stub-plan`, `/perf-plan`, `/docs-plan`, `/test-plan`, `/slop-plan` — thin audit-and-plan entries the docs previously referenced but shipped no file for

### Changed

- **Composer execution precedence** — normal plan runs still stop at phase boundaries; explicit closure modes persist the checkpoint and continue. Approved non-destructive schema work on a confirmed target now follows full-stack deployment discipline without a contradictory permission stop.
- **Count synchronization** — skill, command, and subagent totals are all derived from the filesystem.

### Fixed

- **Broken internal skill references** — repaired a doubled `workflow-spec-workflow-spec-tdd` link in four skills, a wrong `references/` path in `workflow-spec-tdd`, dead `mushi-debug` links in `mushi-health`/`mushi-integration` (now the mushi MCP `diagnose_setup` tool), and non-existent `../start-emulator`/`../test-emulator` links in `mobile-rn-screen`. A from-scratch relative-link scan now resolves clean.

## [1.6.0] — 2026-07-18

Universal installer — cursor-kenji now installs to every supported AI coding tool, mapping to what each tool actually loads. Skills-capable tools (Cursor, Claude Code) get the full skills + commands + agents + rules set; context-file tools (Codex CLI, Gemini CLI) get the rules merged into their global instructions file plus portable command ports. Skill count held at 94.

### Added
- **`--auto` detection** — probes `~/.cursor`, `~/.claude`, `~/.codex`, `~/.gemini` and installs the right artifacts to each installed tool (falls back to Cursor if none are found).
- **Codex CLI support (`--codex`)** — merges `rules/` into `~/.codex/AGENTS.md` (auto-loaded) and ports `plan`/`research`/`fix-issue` to `~/.codex/prompts/*.md`.
- **Gemini CLI support (`--gemini`)** — merges `rules/` into `~/.gemini/GEMINI.md` (auto-loaded) and ports the same commands to `~/.gemini/commands/*.toml`.
- **`commands-portable/`** — new single source of truth for the three tool-agnostic playbooks the installer transforms per tool.
- Install smoke test now exercises the Codex/Gemini paths (merged-rules content, command ports, TOML shape, idempotency, `--auto` detection).

### Changed
- **`--all` now targets all four supported tools** (was Cursor + Claude Code). A bare `npx @kensaurus/cursor-kenji` stays Cursor-only for backward compatibility.
- The rules merge deliberately omits the skill-routing index (`skill-workflows.mdc`) — the context-file tools have no skills loader, so it would be dead text. Skills and subagents are not written to Codex/Gemini for the same reason.
- Generated context files are idempotent (byte-identical on re-run) and backed up (`.bak-<stamp>`) before any overwrite.
- `install.sh` gains `--auto`/`--codex`/`--gemini`/`--all`; Codex/Gemini delegate to the Node installer so the merge/port logic has one source of truth.

## [1.5.1] — 2026-07-18

Prompt-engineering quality pass from `docs/PLAN-SKILL-PACK-ENHANCEMENT.md` (Phases 3–5). No new skills; skill count held at 94. Dual-runtime (Cursor + Claude Code) portability, staleness, and licensing hygiene.

### Changed
- **Dual-runtime portability** — skills now refer to each other by bare name (no path assumptions), and MCP calls use portable `ServerName:tool_name` prose instead of runtime-specific fenced tool blocks.
- **Command frontmatter** — added `description` + `argument-hint` to 14 slash commands for discoverability.
- **Progressive disclosure** — relocated bulk inline content to `references/` in `workflow-housekeep`, `backend-realtime`, and `deploy-npm` (`references/example-mushi-mushi.md`); trimmed oversized `plan-*` descriptions and rewrote thin ones to the house standard.
- **Descriptive prose over pseudo-tools** — `audit-ux` and `audit-security` reframe `Glob`/`Grep` fenced blocks (which read as executable calls) as plain guidance.

### Fixed
- **Stale model IDs** — refreshed illustrative model references in `audit-langfuse-llm` to current-generation IDs.
- **Hardcoded counts** — decoupled the style-catalog count from the always-on `thirdparty-ui-ux-pro-max` description.
- **License attribution** — pinned verified upstream MIT licenses (with copyright holders) in `thirdparty-emil-design-eng` and `thirdparty-web-interface-guidelines` `ATTRIBUTION.md`, replacing "See upstream repository" placeholders.

## [1.5.0] — 2026-07-18

### Added

- **npm installer: Claude Code target** — `npx @kensaurus/cursor-kenji --claude` (Claude Code only) and `--all` (Cursor + Claude Code) install skills, commands, agents, and rules to `~/.claude/` with `.mdc` rules converted to `.md`. One-click on any OS, no clone needed. New `npm run install:claude` / `install:all` scripts.
- **install.sh: Claude Code commands** — `~/.claude/commands/` now installed alongside skills/agents/rules.
- **`docs/PLAN-SKILL-PACK-ENHANCEMENT.md`** — full prompt-engineering audit of all 94 skills + 15 commands with a phased enhancement burndown (token usage, progressive disclosure, dual-runtime portability, description standards).
- **Third-party UI skills** (Jun 2026) — `thirdparty-emil-design-eng`, `thirdparty-ui-ux-pro-max`, `thirdparty-web-interface-guidelines` with `ATTRIBUTION.md`, `docs/THIRD-PARTY-SKILLS.md`, and `/thirdparty-web-interface-guidelines` command
- **`burndown-full`** skill + **`/burndown-full`** command — drive partially-executed refactors/migrations to 100% repo coverage via MATCH/DONE patterns, persistent `.cursor/burndown-state.md`, batched execution, and a verification gate (framework-agnostic; works in Cursor and Claude Code)

### Fixed

- **Sentry MCP calls** — `naturalLanguageQuery` → `query` across 15 skill files (matches current Sentry MCP `search_issues`/`search_events` signature).
- **`mobile-emulator-start`** — display default corrected to `1080×2400`; `1080×4000` is now opt-in for scroll-QA with a matching tall skin.
- **`test-red-team`** — description trimmed under the Agent Skills 1024-char frontmatter limit.
- **`design-mobile-first`** — repaired garbled self-referential description.
- **`enhance-web-landing`** — H1 renamed to match the skill (internal codename removed).
- **Privacy/staleness** — private project names removed from `test-qa` and `data-pipeline`; unverifiable CVE numbers and named-incident claims replaced with hedged failure-class descriptions in `plan-input-validation`, `plan-rls-audit`, `plan-data-integrity`, `plan-llm-cost-guardrails`, `plan-secrets-audit`.
- **install.sh** — removed duplicated "Installed N skills" log line.

---

## [1.4.2] — 2026-06-24

### Fixed

- **npm tarball** — `.mcp.json` included in published package (Cursor Marketplace MCP reference)
- **MCP essential 5** — aligned `mcp/mcp.json.template`, `.mcp.json`, and docs on Playwright (was Chrome DevTools in template)

### Changed

- **Anti-slop pass** — skill YAML descriptions, subagent frontmatter, README badges, CATALOG/PROMOTION/GETTING-STARTED copy
- **`docs/DISTRIBUTION.md`** — install channel matrix (Cursor vs Claude Code vs Marketplace)
- **README** — Claude Code labeled bash-only; shell helpers table expanded; project rules count clarified
- **`package.json`** — removed `prepare` git-hooks side effect on consumer `npm install`
- **`.gitignore`** — `*.log`, `*.bak`, `*.old`, `*.tmp`

---

## [1.4.1] — 2026-06-23

### Fixed

- **`package.json` bin** — `cursor-kenji` → `bin/install.mjs` (npm publish no longer strips the bin entry)
- **`repository.url`** — normalized to `git+https://github.com/kensaurus/cursor-kenji.git`

### Changed

- **npm OIDC Trusted Publisher** configured (`kensaurus/cursor-kenji` · workflow `npm-publish.yml`)
- **CI publish** — OIDC-first; `NPM_TOKEN` only used when the secret is set

---

## [1.4.0] — 2026-06-23

### Added

- **`llms.txt`** — machine-readable doc index for answer-engine / AI crawler discoverability
- **`SECURITY.md`** — MCP secrets hygiene, OIDC-first publish guidance, zero-dep policy
- **`scripts/scan-secrets.mjs`** — pre-commit secret pattern scanner (zero-deps)
- **`scripts/check-mcp-pins.mjs`** + **`mcp/pinned-versions.json`** + **`mcp/VERSIONS.md`** — semver-pinned MCP templates
- **README FAQ** — install, skill count, audit vs plan, MCP keys, llms.txt

### Changed

- **MCP templates** — all `@latest` removed; npm + uvx packages pinned; AWS servers migrated to valid PyPI names (`lambda-tool`, `aws-api`, unified `cloudwatch-mcp`)
- **Pre-commit** — runs secret scan before skill validation
- **`npm test`** — includes secret self-test + MCP pin check
- **`docs/PROMOTION.md`** — OIDC-first npm publish; launch copy skill count 90

---

## [1.3.0] — 2026-06-23

### Added

- **Eleven new `plan-*` skills** — security spine, launch gates, antislop, Capacitor hardening, observability/spend (`plan-rls-audit` through `plan-capacitor-hardening`)
- **`docs/AGENTS.template.md`** — project constitution (mission / stack / roadmap / agent discipline)
- **`docs/examples/plan-audits/`** — sample plan burndown outputs; root `/plan-*.md` gitignored

### Changed

- **README** de-duplicated (~340 lines); CATALOG canonical; skill count **90** (17 plan-*)
- **`check-skill-count.mjs`** syncs README, CATALOG, PROMOTION, package.json
- **Pre-commit hook** re-stages all count-sync files on drift
- **`create-skill`** body split — detail in `references/authoring-guide.md` (<500 lines)

---

## [1.2.7] — 2026-06-17

### Added

- **`composer-2.5-execution.mdc`** rule (`alwaysApply: true`) — execution-time guardrails for Composer 2.5 when implementing an approved `plan-*.md`: anti-reward-hacking, anti-feature-deletion, checkpointing, context + terminal discipline, STOP-and-ask on auth/RLS/secrets/payments/migrations
- Documents the two-model workflow (strong model plans, Composer 2.5 executes) in README and `docs/PLAN-LOOPS.md`

### Changed

- Project rules count: 8 → **9**

---

## [1.2.6] — 2026-06-17

### Added

- **`plan-test-coverage`** — user-story-driven coverage audit, traceability matrix, fake-green detection (plan only)
- **`docs/PLAN-LOOPS.md`** — six-skill plan loop: link, chain, prompts, execution mapping

### Changed

- Six-skill plan loop (was five): adds `plan-test-coverage` after stub-checker, before perf/security

---

## [1.2.5] — 2026-06-17

### Added

- **`plan-docs-sync`** — docs drift audit vs code truth; onboarding-drift checks; docs-as-code guardrails (plan only)
- **`plan-perf-audit`** — measure-don't-guess perf audit across web/mobile/backend/data; Lighthouse CI + RUM guardrails (plan only)
- **`plan-security-audit`** — OWASP + Supabase-first (RLS, service_role scan); no destructive testing; secrets location-only (plan only)
- Five-skill plan loop documented in `skill-workflows` and CATALOG

---

## [1.2.4] — 2026-06-17

### Added

- **`plan-stub-checker`** — exhaustive stub/dead-button/fake-component/unwired-handler audit with burndown and phased wiring plan (plan only; no implementation until user approves)

---

## [1.2.3] — 2026-06-16

### Added

- **`plan-uiux-unification`** — exhaustive non-destructive UI/UX + design-system audit that outputs burndown, unification plan, and phased roadmap (plan only; no fixes until user approves)

---

## [1.2.2] — 2026-06-16

### Changed

- **Playwright test skills:** shared signed-in session reuse (Google OAuth, etc.) and multi-agent tab discipline — no fighting over the same browser tab
- New reference: `protocol-browser-anti-stall/references/playwright-session-coordination.md`
- Updated: `test-playwright`, `test-qa`, `test-red-team`, `protocol-browser-anti-stall`

---

## [1.2.1] — 2026-06-12

### Fixed

- npm CI publish: use OIDC trusted publishing (remove empty `NPM_TOKEN` that blocked auth)

---

## [1.2.0] — 2026-06-12

### Added (13 skills since v1.1.0)

- **Red team & quality:** `test-red-team`, `workflow-quality-gate`
- **Post-launch & shipping:** `iterate-post-launch`, `workflow-launch-ready`, `workflow-feature-flag`
- **Enhance & audit:** `enhance-web-seo`, `enhance-pwa`, `audit-bundle-size`, `audit-i18n`, `design-email`
- **Bundled workflows:** `workflow-build-feature`, `workflow-fix-and-ship`, `workflow-onboard`
- **Routing rule:** `rules/skill-workflows.mdc` — capabilities catalog with skill-chaining diagram

### Changed

- Skill count: 60 → **73**
- `test-red-team` trimmed to stay under 500-line spec limit
- `.gitignore`: ignore `.playwright-mcp/` and `.qa-screenshots/` scratch artifacts

### Install

```bash
npx skills add kensaurus/cursor-kenji
# or
npx @kensaurus/cursor-kenji@1.2.0
```

---

## Jun 2026 — Bundled Workflows, Gap-Filling, & Verbosity Trim

### New Bundled Workflow Skills

Orchestrator skills that chain multiple individual skills into a single tracked loop. Inspired by community patterns from `darthlinuxer/Agentic-Skills`, `kscius/KS-Cursor-Orchestrator`, and the Anthropic agent skills ecosystem.

| Skill | What it chains |
|:------|:--------------|
| `workflow-build-feature` | spec → TDD → unit tests → smoke test → PR |
| `workflow-fix-and-ship` | debug → root cause → fix → regression test → smoke → PR → deploy |
| `workflow-quality-gate` | red-team → security → bundle → perf → unit tests → go/no-go verdict |
| `workflow-launch-ready` | SEO + PWA + bundle + i18n + quality gate + deploy smoke + iterate |
| `workflow-onboard` | First-contact orientation — reads codebase, produces 5-minute briefing |

### New `.cursor/rules/skill-workflows.mdc`

Always-on routing index that routes intent to bundled workflows vs individual skills, with a full skill-chaining diagram. Reduces the cognitive load of "which skill do I use?" to a single lookup.

### Improvements

- `test-red-team` trimmed from 515 → 417 lines: security priority table replaced verbose prose sections; Playwright quick-ref removed (already in platform docs).

---

## Jun 2026 — Post-Launch Iteration & Shipping-Quality Skills

### New Skills

| Skill | Why |
|:------|:----|
| `iterate-post-launch` | Closes the post-ship improvement loop — pulls Sentry errors, Supabase slow-query advisors, and live Playwright walkthrough into a ranked backlog, implements fixes, and verifies them against the live app. |
| `enhance-web-seo` | Audits and fixes SEO for any web app: meta tags, OG/Twitter cards, JSON-LD structured data, robots.txt, sitemap, canonical URLs, heading hierarchy, Core Web Vitals. Applies fixes and verifies with Playwright. |
| `audit-bundle-size` | Finds and eliminates JS bundle bloat: detects bundler (Vite/Webpack/Next.js), runs production build with analysis, identifies large chunks/duplicate deps/missing lazy splits, and maps every finding to a specific import. |
| `enhance-pwa` | Adds or upgrades PWA features: Web App Manifest, Workbox service worker with per-asset caching strategies, install prompt, push notifications, offline page. Capacitor-compatible. Lighthouse PWA audit before/after. |
| `workflow-feature-flag` | Feature-flag rollout discipline: design flag contract, gate the feature, stage at 0%→internal→5%→100%, monitor Sentry error rate and Supabase logs at each stage, promote or roll back, then clean up the flag from code. |
| `audit-i18n` | i18n audit with emphasis on **human-readable, natural-sounding copy** — not machine-translated jargon. Finds hardcoded strings, checks translation completeness, rewrites stiff/literal copy to sound like a real person in each locale, fixes date/number/currency formatting. |
| `design-email` | Full-stack transactional email: React Email templates with dark mode, mobile-first layout, inline styles, and copy that sounds like a person wrote it. Covers SPF/DKIM/DMARC deliverability, Resend/SendGrid/SES integration, and Supabase Edge Function triggers. |

---

## Jun 2026 — Adversarial Red-Team Skill

### New Skills

| Skill | Why |
|:------|:----|
| `test-red-team` | Adversarial full-app sweep — feature-first coverage matrix (feature → surfaces → components+states) attacked across 4 dimensions: UI/UX, data pipeline, security (OWASP Top 10 + MASVS), and performance. Drives Playwright browser MCP for web/PWA, Playwright Android WebView attach for Capacitor hybrid apps, and adb tap-walk for native chrome. Cross-references Sentry for production telemetry, Supabase for DB-layer truth and RLS verification, and Firecrawl for current OWASP/MASVS guidance. Produces a severity-ranked defect list with repro steps, evidence, and launch-readiness verdict. Ships with a `references/owasp-attack-checklist.md` payload library covering XSS, SQLi, IDOR, MASVS-PLATFORM, auth attacks, and 2026 performance thresholds. |

---

## Jun 2026 — Installer hardening + spec compliance

### Installer (`bin/install.mjs`)

- **Fixed a shipped bug:** the installer only copied subdirectories, silently
  dropping every top-level `.md`/`.mdc` file — `npx` installs landed 0 subagents,
  only 1 of 14 commands, and no rules files. It now copies files and directories.
- **`--clean` / `--mirror`** — make `~/.cursor` exactly mirror this repo (no
  overlap/duplicates); takes a timestamped backup first (`--no-backup` to skip).
- **`--restore [stamp]`** — restore a previous `--clean` backup.
- **`--only <csv>`** and **`--skill <name>`** — partial installs.
- **`--link`** — dev mode: symlink (junction on Windows) instead of copy.
- MCP template is written only when missing and never overwrites existing keys.

### Quality gates

- `scripts/validate-skills.mjs` — validates every skill against the
  [Agent Skills spec](https://agentskills.io/specification): frontmatter present,
  `name` matches its directory, `description` ≤ 1024 chars, body length warnings.
- `scripts/test-install.mjs` — install smoke test (would have caught the bug above).
- Both run in the pre-commit hook, a new cross-OS `validate` workflow, and before
  `npm publish`.
- Trimmed 4 over-long skill descriptions to ≤ 1024 chars (`audit-ux`,
  `enhance-web-ui`, `enhance-web-ux`, `enhance-capacitor-ui`).
- Added `.gitattributes` to normalize line endings (LF) across machines.

---

## Jun 2026 — Anti-Vibe-Coding Spine + Taste Skills

### New Skills

| Skill | Why |
|:------|:----|
| `workflow-spec-workflow-spec-tdd` | The anti-vibe-coding spine — brainstorm → spec → plan → RED/GREEN/REFACTOR TDD → self-review before "done". Adapted from [obra/superpowers](https://github.com/obra/superpowers) |
| `mobile-mobile-capacitor-platform` | Capacitor platform + pipeline depth — plugins, OTA, deep links, push, native CI, store submission + Apple preflight, security scan, migrations. From [cap-go/capgo-skills](https://github.com/cap-go/capgo-skills) |
| `mobile-mobile-rn-performance` | React Native perf/build/upgrade depth — FPS, Hermes, TTI, bundle size, FlashList, Reanimated, Turbo Modules, 16KB alignment, RN/Expo version upgrades. From [callstack/agent-skills](https://github.com/callstackincubator/agent-skills) |
| `data-pipeline` | Build-time data-pipeline correctness — idempotency, atomic writes, 4-layer staging, windowed backfills, dead-letter, observability. For ETL / edge-function workers / `pg_cron` / queues |
| `backend-observability` | Build-time observability + logging — error↔trace↔log correlation, structured leveled logs, PII/secret redaction, OTel spans, LLM trace capture, alert/SLO design. Vendor-neutral (Sentry + Langfuse + OTel) |
| `enhance-web-landing` | Anti-slop frontend for landing pages, portfolios, and marketing sites — brief inference, variance/motion/density dials. From [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) |
| `enhance-web-redesign` | Audit-first upgrade of existing sites — 60-second AI-tell triage, then scan/diagnose/fix generic AI patterns without breaking functionality |
| `enhance-web-web3d` | Audit-first 3D/WebGL + GSAP cinematic-motion elevation of an existing web app (Three.js / R3F + ScrollTrigger + Motion / React Spring). From [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) |

### Family Rename

`enhance-page-ui` → `enhance-web-ui`, `enhance-page-ux` → `enhance-web-ux`, `enhance-screen-rn` → `mobile-rn-screen`, `enhance-web-mobile-ui` → `enhance-capacitor-ui`. New `enhance-<surface>-<aspect>` convention + a surface-router block added to every enhance skill.

---

## May 2026 — PDCA Browser Testing, npm Release, Native RN Loop

### New Skills

| Skill | Why |
|:------|:----|
| `test-playwright` | Closes the PDCA loop after you ship a change. Drives the live localhost app through the Playwright MCP manually like a real user, and **fixes** pain points/errors as it goes (full-stack: UI/UX + API + DB). Red-teams the work and suggests enhancements |
| `deploy-npm` | End-to-end release workflow for a Changesets + GitHub Actions + npm Trusted Publisher (OIDC) monorepo — green CI → merge release PR → resolve the `github-actions[bot]` anti-loop → dispatch publish → verify on npm and GitHub Releases |
| `mobile-emulator-start` | Boots Metro + Android emulator in the correct order — kills duplicate ports, picks fresh-cache vs fast-iteration, defaults to 1080×4000 for tall QA screenshots, polls `/status` before deeplink to avoid "Cannot connect to Expo CLI" races |
| `enhance-capacitor-ui` | Cross-surface architecture for hybrid PWA + iOS + Android apps. Three orthogonal axes (form factor / platform / pointer) so polish on one surface can't degrade another |

### New Rules

| Rule | Why |
|:-----|:----|
| `full-stack-ship-discipline.mdc` | `alwaysApply: true` — prevents the "local migration file never deployed" failure mode. Forces UI tasks to inventory backend deps in the same chat, deploy via Supabase MCP, and verify against the remote DB |
| `shell-first-search.md` | Workspace-wide rule routing routine search to `Shell` (`grep`/`find`/`ls`) instead of `Grep`/`Glob` tools, which can hang for minutes on some Windows hosts |

### Housekeep Pass

- 11 skills renamed so `name:` frontmatter matches folder names per Cursor spec
- 22 descriptions tightened to direct-tone single-sentence WHAT + concrete trigger list
- 9 commands demoted to skill pointers (no more duplicated playbook)

---

## Apr 2026 — The Enhance Family

| Skill | Why |
|:------|:----|
| `enhance-web-ui` | Composition over decoration — fix hierarchy, grouping, spacing, motion. NN/g + Laws of UX grounded |
| `enhance-web-ux` | Replace generic "stacked" UI with semantic data. Every change cites a Nielsen heuristic, uses existing primitives, verified at 3 viewports via browser MCP |
| `enhance-readme` | Theme-aware hero + tour grid + optional animated GIF via Playwright MCP |
| `audit-ux` | Deep UX audit grounded in NN/g 10 heuristics, Laws of UX, Intuit Content Design, Google HEART |
| `split-to-prs` *(Cursor Skill)* | Slice a single chat / branch / PR into small reviewable PRs with safe snapshot |
| `canvas` *(Cursor Skill)* | Live React canvas beside chat — updated with refreshed SDK primitives |

---

## Earlier 2026

| Addition | Type |
|:---------|:-----|
| `create-hook` | Skill |
| `workflow-spec-workflow-spec-tdd` | Skill |
| `workflow-spec-tdd` | Skill |
| `workflow-workflow-parallel-agents` | Skill |
| `audit-code-review` | Skill |
| 20 new skills (audits, debugging, deploy verification, file handling, PRD, QA, housekeeping) | Skills |
| 6 new cursor-skills (babysit, canvas, create-hook, shell, statusline, update-cli-config) | Cursor Skills |
| `/plan`, `/pr`, `/debug` | Commands |
