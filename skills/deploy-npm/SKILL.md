---
name: deploy-npm
description: >
  Release an npm package: version, CHANGELOG, publish, verify. Use when
  "publish this package", "release to npm", or "ship a new npm version".
  Running-app production deploy → workflow-ship-and-observe.
license: MIT
disable-model-invocation: true
---

# deploy-npm — Full release workflow

**Degree of freedom: MIXED.** Semver/changeset judgment `[HIGH freedom]`;
git/gh/npm publish steps `[LOW freedom — run exactly]`. Never `pnpm publish`
locally when the repo uses Trusted Publisher.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **deploy-npm** (this) | Releasing an npm package: version, CHANGELOG, publish, verify |
| `workflow-ship-and-observe` | Taking merged, green app code to a verified, monitored production release |

## How to reason

1. **Observe** — branch, dirty tree, open PRs, pending changesets, release.yml trigger
2. **Interpret** — is this a changeset-ready release or a no-op?
3. **Classify** — proceed / stop-and-ask (dirty tree, conflicting PRs, no changeset)
4. **Severity** — publishing the wrong bump or skipping verify is a user-facing break

## Worked example

> **Observe:** feature PR green; one minor changeset; Version PR opened by the bot; required checks never fired.
> **Interpret:** GitHub anti-loop suppressed CI on the bot branch.
> **Classify:** empty-commit to trigger CI (Phase 4), then merge Version PR.
> **Verify:** `npm view` shows the new version; do not publish from the laptop.

## Self-critique before reporting

- **Phase order** — no publish before version PR + green CI
- **Verify** — `npm view` (and GH Release) ran after publish, not assumed
- **No local publish** — Trusted Publisher path only
- **Right owner** — running app deploy → `workflow-ship-and-observe`

This skill is opinionated for repos that use:

- `pnpm` + `turbo` monorepo
- `@changesets/cli` + `@changesets/action` for versioning and changelog generation
- A GitHub Actions workflow named `Release` (`.github/workflows/release.yml`) that runs `changeset version` + `changeset publish` on push to `master`
- npm Trusted Publisher (OIDC) with provenance — no long-lived `NPM_TOKEN`
- `step-security/harden-runner` blocking some runner writes (notably git tag refs)

Adapt the package / branch / workflow names if the target repo differs, but keep the **phase order** — every phase blocks on the previous one.

---

## Quick Start

Copy this checklist into the conversation and tick boxes as you go:

```
Release progress:
- [ ] Phase 0: Discover repo state (branch, open PRs, pending changesets)
- [ ] Phase 1: Author / verify the changeset
- [ ] Phase 2: Green the feature PR
- [ ] Phase 3: Merge feature PR to master
- [ ] Phase 4: Wait for & green the changesets Version PR
- [ ] Phase 5: Merge Version PR → trigger publish
- [ ] Phase 6: Handle github-actions[bot] anti-loop if push trigger didn't fire
- [ ] Phase 7: Verify on npm (npm view) and on GitHub Releases
- [ ] Phase 8: Create per-package GitHub Release notes if harden-runner blocked tags
```

---

## Phase 0 — Discover repo state

Before doing anything destructive, understand what's open:

```bash
cd <repo-root>

# Current branch + dirty state
git status --short
git log --oneline -5

# Open PRs
gh pr list --state open --json number,title,headRefName

# Pending changesets (anything not yet versioned)
ls .changeset/*.md 2>/dev/null | grep -v README

# Release workflow definition (so you know the trigger semantics)
cat .github/workflows/release.yml | head -80
```

**Confirm with the user before continuing if**:
- There are uncommitted local changes (`git status` is non-empty)
- More than one feature PR is open and they conflict
- No changesets exist (`changeset publish` would be a no-op)

---

## Phase 1 — Author / verify the changeset

A changeset is a markdown file under `.changeset/` with a YAML preamble listing affected packages + bump type:

```markdown
---
'@scope/web': minor
'@scope/cli': minor
'@scope/node': patch
---

One-paragraph summary of what users get.

## @scope/web
- Feature bullet 1
- Feature bullet 2

## @scope/cli
- ...
```

**Bump rules** (follow semver strictly):
- `major` — breaking API change
- `minor` — additive feature, no breakage
- `patch` — bug fix only, no API surface change

**Common mistake**: leaving sibling packages out when their consumer was bumped. If `@scope/react` re-exports `@scope/core` and `core` got a feature, `react` typically needs at least a `patch` so users on the new core get a fresh react tarball.

Run `pnpm changeset status` (or `npx changeset status`) to preview the version graph before pushing.

---

## Phase 2 — Green the feature PR

Push the branch, open the PR, then iterate on CI until every required check is green:

```bash
git push -u origin <branch>
gh pr create --title "..." --body "..."

# Poll status
gh pr checks <pr-number>

# Watch a specific failing job to its conclusion
gh run watch <run-id> --exit-status
```

**Typical fix loops.** Version-specific CI recipes from past releases (Next.js `next lint` removal, ESLint 10 unknown-rule directives, Nextra schema patch, `size-limit` bumps, MDX import order) live in [`references/example-mushi-mushi.md`](references/example-mushi-mushi.md) — read the matching entry when a check fails. Bump a `size-limit` only after confirming the growth is intentional (`pnpm --filter <pkg> exec size-limit --why`).

**CodeQL informational findings**: The `CodeQL` (GitHub Advanced Security) summary check often shows alerts that pre-existed but get re-flagged because the PR is large. The `CodeQL (javascript-typescript)` workflow run itself is what actually gates merge. Don't conflate the two.

---

## Phase 3 — Merge feature PR to master

```bash
gh pr merge <pr-number> --squash --admin --subject "release: <one-line summary>"
```

`--admin` is needed if the user has admin rights and a required status check is stuck (e.g., `CodeQL` alert summary showing failure when the actual scan workflow passed).

Immediately after merge, the `Release` workflow fires on `push` to `master`. Watch it:

```bash
sleep 10
gh run list --branch master --workflow Release --limit 1
gh run watch <run-id> --exit-status
```

This first run will either:
- **Open the changesets "Version Packages" PR** (most common — leaves your changes unpublished until you merge it), OR
- **Publish directly** (only if `changeset version` was already run on the merged branch)

If you see a new PR titled `chore: version packages` from `app/github-actions`, continue to Phase 4.

---

## Phase 4 — Wait for & green the changesets Version PR

```bash
gh pr list --state open --json number,title,headRefName --jq '.[] | select(.headRefName == "changeset-release/master")'
```

**Critical gotcha**: workflows triggered by `github-actions[bot]` commits are suppressed by GitHub's anti-loop protection. The Version PR will exist with `mergeStateStatus: BLOCKED` because required checks (e.g., `Build & Test`) never fired.

Trigger CI manually with an empty commit on the bot's branch:

```bash
git fetch origin changeset-release/master
git checkout changeset-release/master
git commit --allow-empty -m "chore: trigger CI for version packages PR"
git push origin changeset-release/master
git checkout - # back to your previous branch

sleep 10
gh run list --branch changeset-release/master --limit 3
gh run watch <new-run-id> --exit-status
```

---

## Phase 5 — Merge Version PR → trigger publish

Once CI is green:

```bash
gh pr merge <version-pr-number> --squash --admin --subject "chore: version packages (release <month> <year>)"
```

Wait ~10 seconds, then check whether the `Release` workflow auto-fired:

```bash
sleep 10
gh run list --branch master --workflow Release --limit 2
```

---

## Phase 6 — Handle the github-actions[bot] anti-loop

If the latest `Release` run timestamp on master is older than the Version PR merge time, the **same anti-loop problem suppressed the publish trigger** (squash-merge attributed to `github-actions[bot]` doesn't fire downstream workflows).

The published `release.yml` should declare `workflow_dispatch:` for exactly this case. Dispatch it manually:

```bash
gh workflow run Release --ref master
sleep 8
gh run list --workflow Release --branch master --limit 1
gh run watch <new-run-id> --exit-status
```

Watch for the "Version & Publish" job. Look in its log for either:
- `🦋 info publishing @scope/pkg@x.y.z` (success)
- `🦋 warn @scope/pkg is not being published because version x.y.z is already published on npm` (means an earlier run already shipped it — fine)
- `404 Not Found - "<pkg>@<version>" is not in this registry` (this is npm's misleading error for **OIDC trusted-publisher mismatch**, not a missing package — see "OIDC gotcha" below)

---

## Phase 7 — Verify on npm + GitHub Releases

Confirm every package landed on the public registry:

```bash
for pkg in <space-separated-package-names>; do
 echo -n "$pkg: "
 npm view "$pkg" version dist-tags.latest 2>&1 | tr '\n' ' '
 echo
done
```

Each line should print `version = 'x.y.z' dist-tags.latest = 'x.y.z'`.

Check GitHub Releases:

```bash
gh release list --limit 10
gh api repos/<owner>/<repo>/releases/latest --jq '.tag_name,.name,.html_url'
```

The `Latest` badge should be on the new release. If it's on the wrong one:

```bash
gh release edit <correct-tag> --latest
```

---

## Phase 8 — Manual GitHub Releases when harden-runner blocks tags

If `step-security/harden-runner` blocks the runner from writing `.git/refs/tags/*.lock` (you'll see `[Source code overwritten]` lines in the post-run log), `changesets/action` will fail to push tags, which means **no GitHub Release pages are created** even though npm publish succeeded.

Recover by creating tags + releases via the GitHub API targeting the current `master` SHA:

```bash
# Get the published master SHA from the Version PR's merge commit
MASTER_SHA=$(gh api repos/<owner>/<repo>/commits/master --jq '.sha')

# Create each tag
for tag in "main-pkg@x.y.z" "@scope/cli@x.y.z" "@scope/core@x.y.z" ...; do
 gh api -X POST repos/<owner>/<repo>/git/refs \
 -f ref="refs/tags/$tag" \
 -f sha="$MASTER_SHA"
done

# Write the umbrella release notes once
cat > /tmp/release-notes.md <<'EOF'
## <Project> — <Month Year> release

[1-paragraph high-level summary]

## What's published to npm

| Package | New version |
|---------|-------------|
| `main-pkg` | `x.y.z` |
| `@scope/cli` | `x.y.z` |
...

## Highlights

### Feature group 1
- bullet
- bullet

[etc — pull straight from the changeset markdown]

## Migration notes

[breaking changes with diff blocks]

## Install

\`\`\`bash
npm install @scope/web@x.y.z @scope/core@x.y.z
\`\`\`
EOF

# Create the umbrella release (marked Latest)
gh release create "main-pkg@x.y.z" \
 --title "<Project> — <Month Year> release (<3-word highlight>)" \
 --notes-file /tmp/release-notes.md \
 --latest --target master

# Create per-package release stubs that link back
for tag in "@scope/cli@x.y.z" "@scope/core@x.y.z" ...; do
 gh release create "$tag" --title "$tag" \
 --notes "Part of the [<Project> <Month Year> release](https://github.com/<owner>/<repo>/releases/tag/main-pkg%40x.y.z). See the umbrella release for full notes.

\`\`\`bash
npm install $tag
\`\`\`" \
 --target master
done

# Clean up
rm /tmp/release-notes.md
```

**Important**: `--latest` only applies to the most recent `gh release create` / `gh release edit` invocation. After creating the per-package stubs, re-mark the umbrella as latest:

```bash
gh release edit "main-pkg@x.y.z" --latest
```

---

## OIDC Trusted-Publisher gotchas

If `changeset publish` fails with `404 Not Found - "<pkg>@<version>" is not in this registry` and your provenance config is on, the issue is almost always:

1. **Old npm CLI**: `setup-node@v4` with `node-version: 22` ships npm 10, which has a broken OIDC handshake. **Bump `node-version: 24`** in the Release workflow — Node 24 ships npm 11.5+ with the fix.
2. **Missing Trusted Publisher rule**: every publishable package needs a rule on `npmjs.com → Package → Settings → Trusted Publishers` pointing at exactly `<owner>/<repo>/.github/workflows/release.yml` on branch `master`.
3. **Branch mismatch**: the workflow runs on `release/feature` but the Trusted Publisher rule pins `master`. Either restrict workflow to master or add a rule per branch.

---

## Anti-patterns to avoid

1. **Editing `.changeset/*.md` after `changeset version` ran** — those files are deleted by `version` and re-creating them won't re-bump. Make a new changeset for follow-up changes.
2. **Force-pushing the changesets-release/master bot branch** — the bot owns it and will overwrite next push to master. Empty commits are fine; rewrites are not.
3. **Manually editing `CHANGELOG.md`** — Changesets owns it. Edit the changeset markdown before `version`, or write a follow-up changeset.
4. **Publishing without `--admin` to bypass CodeQL alert summary** — only acceptable when the workflow CodeQL (`javascript-typescript`) actually passed and you've reviewed the alerts to confirm they're informational. Document the call in the umbrella release notes under "Known follow-ups".
5. **Running `pnpm publish` locally** — circumvents provenance, breaks Trusted Publisher chain. Always go through the workflow.

---

## Verification commands (cheat sheet)

```bash
# Did npm get the new version?
npm view <pkg> version

# Is the umbrella GH release marked Latest?
gh api repos/<owner>/<repo>/releases/latest --jq '.tag_name'

# Are all expected tags pushed?
git ls-remote --tags origin | grep -E '<pkg>@x\.y\.z'

# Did any workflow fail in the release window?
gh run list --branch master --created ">$(date -u -d '1 hour ago' +%FT%TZ)" --json conclusion,name | jq

# What did the Version & Publish step actually publish?
gh run view <run-id> --log | grep -E "🦋.*info publishing|warn.*already published"
```

---

## When to deviate from this skill

- Repo doesn't use Changesets → use whatever it uses (`semantic-release`, manual `npm version` + tag, `release-please`), but keep Phases 0/2/7 verbatim.
- Repo publishes a single package, not a monorepo → skip Phase 8's per-package stubs.
- Repo doesn't use OIDC Trusted Publisher → drop the OIDC gotchas section, but **never** add a long-lived `NPM_TOKEN` without flagging the security trade-off to the user first.

To re-trigger a publish, use the workflow-dispatch path (Phase 6) rather than re-merging or rewriting history — `workflow_dispatch` is idempotent for changeset publish (already-published versions become warnings, not errors).

---

> **Reference implementation:** For an annotated example of this workflow applied to a real monorepo (Changesets + OIDC + per-package GitHub Releases), see [`references/example-mushi-mushi.md`](references/example-mushi-mushi.md).
