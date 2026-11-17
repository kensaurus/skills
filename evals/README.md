# Trigger evals

One case per core route. Each case sends a plain request, the way a user would
type it, and passes when the matching skill is loaded. The cases answer one
question: after a change to a skill description, does the right playbook still
fire?

| Case | Request | Skill that should load |
|:-----|:--------|:-----------------------|
| `route-onboard` | "I just cloned this repo and have never seen it before. Orient me." | `workflow-onboard` |
| `route-grill` | "Grill me before I build a referral program. I have not decided the details." | `workflow-grilling` |
| `route-build-feature` | "Build this feature: users can mute email notifications per project." | `workflow-build-feature` |
| `route-fix-and-ship` | "The login endpoint returns 401 for valid users. Fix this bug and ship it." | `workflow-fix-and-ship` |
| `route-debug-error` | "The checkout page throws TypeError: cannot read properties of undefined. Find out why." | `debug-error` |
| `route-code-review` | "Review my changes on this branch before I open the PR." | `audit-code-review` |
| `route-security` | "Audit this app for security problems." | `audit-security` |
| `route-research` | "Look up the current docs before we upgrade the data-fetching library." | `research` |
| `route-release-prep` | "Prepare my working tree for a PR. Do not merge." | `workflow-release-prep` |
| `route-complete-everything` | "Complete everything in the approved plan. Do not defer anything." | `complete-everything` |
| `route-green-repo` | "Typecheck, lint and tests all fail. Get the whole repo green." | `workflow-green-repo` |
| `route-ship-observe` | "Ship it to production and watch it." | `workflow-ship-and-observe` |

## Run them

```bash
claude plugin eval . --case "route-*" --runs 1   # every route once
claude plugin eval . --case route-security       # one case, three runs
```

Claude Code 2.1.269 or newer. Each run is a real model call on your account,
and by default each case also runs once without the plugin as a baseline. So
this is a maintainer step, not part of `npm test`. Results land in
`results/<timestamp>/` (git-ignored) with a `report.html`.

## When to run

- After you change any `description:` in `skills/`.
- After you add a skill whose job overlaps one of the routes above.
- Before you raise or lower the `effort:` of a routed skill for a new model.

## Add a case

```bash
claude plugin eval init --bare route-<name>
```

Then write the request in `prompt.md` and copy a `graders/fires.md` from a
neighbor, changing the skill name. Keep the request in the user's words: no
skill names, no jargon. Format reference:
https://code.claude.com/docs/en/plugin-evals
