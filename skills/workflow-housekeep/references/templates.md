# Housekeep Templates

Reusable templates for `workflow-housekeep`: the README skeleton, the summary
report, and the per-ecosystem command cheatsheet. Adapt each to the project's
detected stack.

## Contents

- README Template (adapt to project)
- Tech Stack
- Getting Started
- Project Structure
- Deployment
- Scripts
- Housekeep Report Template
- Housekeep Report — [Project Name]
- Quick Reference: Common Cleanup Commands


---

## README Template (adapt to project)

```markdown
# Project Name

Brief description from package manifest + actual functionality.

## Tech Stack

[List ONLY what's in the dependency manifest — framework, UI lib, DB, auth, etc.]

## Getting Started

### Prerequisites
[Node version from .nvmrc/engines, other requirements]

### Installation
[Exact commands from package.json scripts]

### Environment Variables
[List from .env.example with descriptions]

### Development
[Dev server command, test command, lint command]

## Project Structure
[Actual directory tree, 2 levels deep]

## Deployment
[From CI/CD config — where it deploys, how]

## Scripts
[All scripts from package.json with descriptions]
```

---

## Housekeep Report Template

Produce this at the end of a housekeep run, filling in real values.

```markdown
## Housekeep Report — [Project Name]

### Configuration
- Ecosystem: [Node.js / Python / etc.]
- Package Manager: [npm / pnpm / yarn / etc.]
- Framework: [Next.js / React / Django / etc.]

### Phase 1: README Sync
- [x] Root README updated: [list of sections changed]
- [x] Folder READMEs updated: [list]
- Stale sections removed: [list]
- New sections added: [list]

### Phase 2: Dead File Cleanup
| File | Category | Action |
|------|----------|--------|
| path/to/file.log | Log | Deleted |
| path/to/screenshot.png | Screenshot | Deleted |

- .gitignore updated: [patterns added]
- Dead exports found: [list or "none"]

### Phase 3: Dependency Updates
- Vulnerabilities fixed: [count] ([critical/high/moderate])
- Packages updated: [count]
 - Patch: [list]
 - Minor: [list]
 - Major: [list with migration notes]
- Build verified: [pass/fail]
- Tests verified: [pass/fail/no tests]

### Phase 4: General Cleanup
- Config files updated: [list]
- Scripts cleaned: [list]
- .gitignore modernized: [yes/no]
- Env vars audited: [findings]

### Files Modified
- [path] — [description]

### Files Deleted
- [path] — [reason]

### Requires Manual Follow-Up
- [item] — [why it cannot be automated]
```

---

## Quick Reference: Common Cleanup Commands

| Ecosystem | Outdated | Audit | Update | Build Verify |
|-----------|----------|-------|--------|--------------|
| npm | `npm outdated` | `npm audit` | `npm update && npm audit fix` | `npm run build` |
| pnpm | `pnpm outdated` | `pnpm audit` | `pnpm update && pnpm audit --fix` | `pnpm build` |
| yarn | `yarn outdated` | `yarn audit` | `yarn upgrade` | `yarn build` |
| pip | `pip list --outdated` | `pip-audit` | `pip install -U <pkg>` | `python -m pytest` |
| cargo | `cargo outdated` | `cargo audit` | `cargo update` | `cargo build` |
| go | `go list -m -u all` | `govulncheck ./...` | `go get -u ./...` | `go build ./...` |
