---
name: workflow-housekeep
description: >
  Repository maintenance: sync the README, remove confirmed dead artifacts,
  update dependencies safely. Use when "housekeep", "clean up repo", "update
  README", or "update dependencies". Unused exports → plan-dead-code. Parked
  work → housekeep-backlog.
license: MIT
---

# Repo Housekeep

**Degree of freedom: MIXED.** What is dead vs still referenced `[HIGH freedom]`;
delete-only-after-proof and dependency bump commands `[LOW freedom — run exactly]`.

Copy this checklist and tick items as you go:

```
- [ ] Step 1: Auto-detect project configuration: stack, manager, paths
- [ ] Step 2: README sync: cross-check every section against reality
- [ ] Step 3: Dead file cleanup: validate before deleting; fix .gitignore
- [ ] Step 4: Dependency updates: research the changelog before a major bump
- [ ] Step 5: Verify build, lint, and tests after updates
- [ ] Step 6: Research-driven general cleanup; commit each phase separately
- [ ] Step 7: Summary report from the Housekeep Report template
```

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **workflow-housekeep** (this) | README sync, confirmed dead artifacts removed, safe dependency updates |
| `housekeep-dead-code` | Remove dead code by category, one commit each, then a Knip ratchet |
| `plan-dead-code` | Plan-only Knip audit of unused files, exports, deps; deletes nothing |
| `housekeep-backlog` | Inventory parked work into a living BACKLOG.md |
| `housekeep-files` | Copy-not-move organizer for document trees, not repos |

## How to reason

1. **Observe** — README drift, unused files, outdated deps
2. **Interpret** — unused by search, or only unused in this package?
3. **Classify** — sync docs / delete / bump / leave
4. **Severity** — deleting a file still imported is a break

## Worked example

> **Observe:** `OldButton.tsx` has zero imports; README still lists a removed script; patch bump available.
> **Interpret:** file is dead; README is stale; bump is safe if tests pass.
> **Classify:** delete the file after `rg` + import check; sync README; bump patch.
> **Do not** delete `housekeep-design` token work — that is another skill.

## Self-critique before reporting

- **Proven unused** — imports, refs, config, git history checked
- **README matches** — scripts and paths in the README actually exist
- **Tests after bump** — dependency update was not a silent break
- **Right owner** — unused files/exports/deps → `plan-dead-code`; parked work → `housekeep-backlog`; token SSOT → `housekeep-design`; CI gates → `housekeep-gates`

Full-cycle repository maintenance: documentation sync, dead file removal, dependency updates, and research-driven cleanup.
Works with **any project** — auto-detects tech stack, package manager, and structure.

## Rules  [LOW freedom — do not skip]

> **Delete a file only after proving it unused.**
> Check imports, references, git blame, and config entries first — a file that is still imported breaks the build when it goes.

> **Research the changelog before any major-version bump.**
> Majors carry breaking changes; a blind upgrade turns maintenance into an outage.

> **README must reflect reality, not aspiration.**
> Only document what currently exists in the codebase.

> **Commit each phase separately.**
> Documentation, cleanup, and dependency updates are independent concerns.

> **Parked-work register is a different skill.**
> Unfinished plans, TODOs, skipped tests → `housekeep-backlog`. This skill
> does README / dead files / deps. A housekeep pass may *schedule* a
> backlog regeneration; it does not invent the register.

> **Module-graph dead code is a different skill.**
> This skill deletes *artifacts* — logs, `.bak` files, build output,
> committed screenshots — things dead by inspection. **Unused source
> files, exports, types, and dependencies belong to `plan-dead-code`
> (audit) and `housekeep-dead-code` (delete + ratchet)**, because proving
> those dead needs a configured module graph, not a `rg` pass.

---

## Step 0: Auto-Detect Project Configuration  [LOW freedom — run exactly]

### 0a. Detect Tech Stack

Read the dependency manifest to determine the ecosystem:

| File | Ecosystem | Package Manager |
|------|-----------|-----------------|
| `package.json` + `package-lock.json` | Node.js | npm |
| `package.json` + `pnpm-lock.yaml` | Node.js | pnpm |
| `package.json` + `yarn.lock` | Node.js | yarn |
| `package.json` + `bun.lockb` | Node.js | bun |
| `requirements.txt` / `pyproject.toml` | Python | pip / poetry / uv |
| `Cargo.toml` | Rust | cargo |
| `go.mod` | Go | go mod |
| `Gemfile` | Ruby | bundler |
| `build.gradle` / `pom.xml` | Java/Kotlin | gradle / maven |
| `pubspec.yaml` | Dart/Flutter | pub |
| `composer.json` | PHP | composer |

### 0b. Detect Project Structure

```
Glob("README*")
Glob("**/*readme*")
Glob("**/CHANGELOG*")
Glob("**/.env*")
Glob("**/*.log")
Glob("**/dist/**")
Glob("**/build/**")
Glob("**/*.screenshot*")
Glob("**/*.png", in test/debug/temp folders)
```

### 0c. Record Configuration

```
ECOSYSTEM: [Node.js / Python / Rust / Go / etc.]
PKG_MANAGER: [npm / pnpm / yarn / bun / pip / poetry / cargo / etc.]
MANIFEST: [package.json / requirements.txt / Cargo.toml / etc.]
LOCKFILE: [package-lock.json / yarn.lock / etc.]
README_PATH: [README.md or detected path]
SRC_DIR: [src/ / app/ / lib/ / etc.]
BUILD_DIR: [dist/ / build/ / .next/ / out/ / etc.]
FRAMEWORK: [Next.js / React / Vue / Django / FastAPI / etc.]
```

---

## Phase 1: README Sync  [HIGH freedom]

Update the root README (and any folder-level READMEs) to reflect the **current** architecture.

### 1a. Discover Current Architecture

Read these files to understand what actually exists:

```
- Package manifest (package.json, etc.) — dependencies, scripts, name, description
- Entry point (src/index.ts, app/layout.tsx, main.py, etc.)
- Config files (next.config.*, vite.config.*, tsconfig.json, etc.)
- CI/CD (.github/workflows/*, vercel.json, netlify.toml, Dockerfile, etc.)
- Environment files (.env.example, .env.local) — list expected env vars
- Folder structure (top-level ls, then 2-level deep ls of src/)
```

### 1b. Cross-Check README Against Reality

For each section in the existing README, verify:

| README Section | Verify Against |
|---------------|----------------|
| Project description | `package.json` name/description, actual functionality |
| Tech stack | Installed dependencies in manifest |
| Getting started / Setup | Actual scripts in `package.json`, required env vars |
| Folder structure | Real directory listing |
| API endpoints | Route files, API handlers |
| Features list | Actual implemented features (not planned/removed) |
| Environment variables | `.env.example` or config files |
| Deployment | CI/CD config, hosting config |
| Contributing | Linter config, test setup, pre-commit hooks |

### 1c. Rewrite Stale Sections

For each discrepancy found:
- **Missing feature in README**: Add it with accurate description
- **Removed feature still in README**: Delete the section
- **Outdated instructions**: Update to match current setup
- **Missing sections**: Add standard sections (see template below)

### 1d. README Template (adapt to project)

Use the README skeleton in [`references/templates.md`](references/templates.md)
and adapt each section to the detected stack.

### 1e. Folder READMEs

Check for any `*_readme.md` or `README.md` files in subdirectories. Update them if the folder contents have changed.

---

## Phase 2: Dead File Cleanup  [LOW freedom — run exactly]

Remove files that serve no purpose in the repository.

### 2a. Scan for Candidates

Search for these categories of dead files:

**Logs and debug output:**
```
Glob("**/*.log")
Glob("**/npm-debug.log*")
Glob("**/yarn-debug.log*")
Glob("**/yarn-error.log*")
Glob("**/debug.log")
Glob("**/.pnpm-debug.log*")
```

**Screenshots and temp images:**
```
Glob("**/screenshot*")
Glob("**/Screenshot*")
Glob("**/*.png", in root or non-asset directories)
Glob("**/*.jpg", in root or non-asset directories)
Glob("**/temp/**")
Glob("**/tmp/**")
```

**Build artifacts committed by mistake:**
```
Glob("**/dist/**")
Glob("**/build/**")
Glob("**/.next/**")
Glob("**/node_modules/**")
Glob("**/__pycache__/**")
Glob("**/*.pyc")
Glob("**/target/debug/**") (Rust)
```

**Deprecated / dead code:**
```
Glob("**/*.bak")
Glob("**/*.old")
Glob("**/*.orig")
Glob("**/*deprecated*")
Glob("**/*DEPRECATED*")
Glob("**/*.backup")
Glob("**/*_old.*")
Glob("**/*_backup.*")
Glob("**/*.tmp")
```

**IDE and OS artifacts:**
```
Glob("**/.DS_Store")
Glob("**/Thumbs.db")
Glob("**/*.swp")
Glob("**/*.swo")
```

**Stale config files:**
```
Glob("**/.env.local") (should not be committed)
Glob("**/.env.production") (check if contains secrets)
```

### 2b. Validate Before Deleting

For each candidate file:

1. **Check git blame**: When was it last modified? By whom?
2. **Check imports/references**: Is any code importing or referencing this file?
 ```
 Grep for the filename across the codebase
 ```
3. **Check .gitignore**: Should this file type already be ignored?
4. **Check CI/CD**: Does any workflow reference this file?

**Classification:**

| Category | Action |
|----------|--------|
| Log files | Delete + add to `.gitignore` |
| Screenshots in non-asset dirs | Delete (or move to docs/ if referenced) |
| Build artifacts | Delete + verify in `.gitignore` |
| `.bak` / `.old` / `.orig` files | Delete (git has history) |
| IDE/OS artifacts | Delete + add to `.gitignore` |
| Secret files committed | Delete + rotate secrets + add to `.gitignore` |
| Deprecated code files | Verify unused → delete |

### 2c. Update .gitignore

After cleanup, ensure `.gitignore` prevents reoccurrence:

```
Check existing .gitignore covers:
- logs/ *.log
- build output dist/ build/ .next/ out/
- env files .env.local .env.production
- OS files .DS_Store Thumbs.db
- IDE files .idea/ .vscode/ (unless project uses shared settings)
- temp files *.tmp *.bak *.swp
- dependencies node_modules/ __pycache__/ target/
```

### 2d. Dead Exports / Unused Code → hand off

**Do not run a dead-code sweep from this skill.** Unused source files,
exports, types, and dependencies are a module-graph question: on a first
run most findings are misconfiguration, and deleting them is how a cleanup
becomes an outage.

| Stack | Owner |
|-------|-------|
| TypeScript / JavaScript | `plan-dead-code` → `housekeep-dead-code` (`/deadcode`) |
| Python | `vulture` — same discipline: baseline and review before deleting |

`ts-prune` is in maintenance mode; its author points to Knip. Do not add it
to a project.

What this skill still owns here: noting that the handoff is needed, and
scheduling it. Record the finding and move on.

---

## Phase 3: Dependency Updates  [HIGH freedom]

### 3a. Audit Current State

**Node.js:**
```bash
npm outdated # see what's behind
npm audit # check vulnerabilities
```

**Python:**
```bash
pip list --outdated
pip-audit # or safety check
```

**Rust:**
```bash
cargo outdated
cargo audit
```

**Go:**
```bash
go list -m -u all
govulncheck ./...
```

### 3b. Classify Updates

| Update Type | Risk | Action |
|-------------|------|--------|
| Patch (1.2.3 → 1.2.4) | Low | Auto-update |
| Minor (1.2.3 → 1.3.0) | Low-Medium | Auto-update, verify build |
| Major (1.2.3 → 2.0.0) | High | Research changelog first |
| Security fix (any) | Critical | Update immediately |

### 3c. Update Strategy

**Step 1: Fix vulnerabilities first**
```bash
npm audit fix # safe fixes only
npm audit fix --force # ONLY if safe fixes insufficient, review changes
```

**Step 2: Update patch + minor**
```bash
npm update # updates within semver range
```

Or for more control:
```bash
npx npm-check-updates -u -t minor # update package.json to latest minor
npm install # install updated versions
```

**Step 3: Research major updates**

For each major version bump available:

```json
firecrawl:firecrawl_search
{
 "query": "<package-name> v<new-major> migration guide changelog breaking changes",
 "limit": 3,
 "sources": [{ "type": "web" }]
}
```

Recognizing the package is not knowing this major's changes — read the fetched changelog as written rather than answering from memory. Only apply major updates if:
- The migration is straightforward (no breaking API changes affecting this project)
- The current major version is EOL or has known security issues
- The project has tests to verify nothing breaks

**Step 4: Verify after updates**
```bash
npm run build # or equivalent
npm run lint # or equivalent
npm test # if tests exist
```

### 3d. Lock File Hygiene

- Ensure lock file is committed and up to date
- If lock file has conflicts or corruption: delete and regenerate
- Verify lock file matches the package manager in use

---

## Phase 4: Research-Driven General Cleanup  [HIGH freedom]

### 4a. .gitignore Best Practices

Research the recommended `.gitignore` for the detected ecosystem:

```json
firecrawl:firecrawl_search
{
 "query": "<framework> gitignore best practices <current year>",
 "limit": 3,
 "sources": [{ "type": "web" }]
}
```

Cross-check with https://github.com/github/gitignore templates.

### 4b. Config File Audit

Check for stale or redundant config:

| Config | Check |
|--------|-------|
| `tsconfig.json` | Target and lib match Node/browser version in use |
| `eslint` config | Not using deprecated rules or legacy config format |
| `prettier` config | Exists and is consistent with eslint |
| `.nvmrc` / `engines` | Matches current LTS or team's Node version |
| `browserslist` | Not targeting dead browsers |
| CI/CD config | Not using deprecated actions or outdated Node versions |

### 4c. Script Audit

Review all scripts in `package.json` (or equivalent):
- Remove scripts that reference deleted files or tools
- Verify all scripts actually work
- Add missing standard scripts (dev, build, lint, test, typecheck)

### 4d. Environment Variable Audit

- Verify `.env.example` lists all required vars
- Check no `.env` files with real secrets are committed
- Ensure env var names are consistent with usage in code

### 4e. TypeScript / Lint Config Modernization

If the project uses TypeScript:
- Check for `any` type usage that could be tightened
- Verify `strict` mode settings
- Check for unused `@ts-ignore` or `@ts-expect-error` comments

### 4f. License and Metadata

- `package.json`: verify `name`, `version`, `description`, `license`, `repository` are accurate
- `LICENSE` file: exists and matches `package.json` license field
- `CONTRIBUTING.md`: exists if the project accepts contributions

---

## Phase 5: Summary Report  [LOW freedom — do not skip]

Produce a summary using the **Housekeep Report template** in
[`references/templates.md`](references/templates.md), filling in real values for
each phase.

---

## Quick Reference: Common Cleanup Commands

See the per-ecosystem command cheatsheet (outdated / audit / update / build
verify for npm, pnpm, yarn, pip, cargo, go) in
[`references/templates.md`](references/templates.md).
