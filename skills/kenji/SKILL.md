---
name: kenji
description: >-
  Pick and start the right kenji playbook from a plain request. User-invoked
  via /kenji; the argument is the job in your own words. Use when "which skill
  do I use", "what can kenji do", "where do I start", or "help me pick".
argument-hint: "[the job, in your own words]"
disable-model-invocation: true
license: MIT
---

# kenji: say the job, get the playbook

**Degree of freedom: MIXED.** The routing table and the one-question limit
`[LOW freedom — run exactly]`. Which playbook fits an unusual request
`[HIGH freedom]`.

The user should not have to remember skill names. They type `/kenji` and the
job. You name the one playbook that fits, say why in one line, and run it.

## How to route

1. **Read the job.** It is the argument, or the user's last message. With no
   job at all, show the menu below and ask what they want to do.
2. **Match it to one playbook.** Use the menu first. When nothing there fits,
   read [references/index.md](references/index.md): one line per skill, by family.
3. **Two playbooks fit?** Ask one question that separates them, with your
   recommended answer first. Ask at most one question, then decide.
4. **Say the route in one line**, in plain words: the playbook's name, what it
   will do, and what the user gets at the end.
5. **Run it.** Load that skill and carry out the job with it in this turn.
   Routing is not the result; the playbook's output is.

A few playbooks are rituals only the user can start: `handoff`, `deploy-npm`,
`iterate-gtm-weekly`, `mushi-health`, and `mushi-integration`. You cannot load
those. Name the one that fits and tell the user to type `/<name>`.

A playbook that changes code after an audit (`plan-*` and most `audit-*`)
stops for approval on its own. Do not add a second approval step in front.

## The menu

| The user wants to… | Playbook | They get |
|:--|:--|:--|
| Understand a repo they just opened | `workflow-onboard` | A short tour and the commands that work |
| Decide what to build before any code | `workflow-grilling` | One question at a time, then a decision log |
| Look up current docs before a change | `research` | A sourced gap analysis and a file-mapped plan |
| Build a feature | `workflow-build-feature` | Spec, failing test, code, smoke test, PR |
| Fix a bug and ship the fix | `workflow-fix-and-ship` | Root cause, fix with a test, PR, deploy check |
| Find out why something errors | `debug-error` | The cause with evidence, then the fix |
| Get a diff or PR reviewed | `audit-code-review` | Findings with file and line |
| Check security | `audit-security` | OWASP-style findings, then fixes |
| Make a page look and read better | `enhance-web-ui` | One polished page: hierarchy, spacing, type |
| Fix how a page works for users | `enhance-web-ux` | Flow and density fixes on one page |
| Make a mobile app feel native | `enhance-mobile-native-feel` | Native tabs, sheets, haptics, motion |
| Prove a change works in the browser | `test-playwright` | A headed test pass on this session's diff |
| Get every check green | `workflow-green-repo` | Typecheck, lint, tests, and build passing |
| Finish a plan with nothing parked | `complete-everything` | Every item closed and judged done |
| Turn the working tree into a PR | `workflow-release-prep` | A merge-ready PR; it does not merge |
| Deploy and watch it | `workflow-ship-and-observe` | Live revision confirmed, rollback if it breaks |
| Get users for a shipped product | `workflow-gtm` | A go-to-market plan, then the work |
| Stop for today | `handoff` (the user types `/handoff`) | A handoff file for the next session |

## When the playbook is not installed

A profile install (`--profile core`) leaves some skills out. If the skill you
picked is not available in this session, say so plainly, name the profile that
holds it (`web`, `backend`, `mobile`, `growth`, or `maintain`), and give the one
command that adds it: `npx @kensaurus/skills --auto --profile <name>`. Then do
the job with the closest installed playbook, or without one, and say which.

## Worked example

> **Job:** "/kenji the signup page looks cheap and people leave"
> **Match:** two fit. `enhance-web-ui` fixes how it looks; `enhance-onboarding`
> fixes why people leave after signing up.
> **One question:** "Is the problem the page itself, or what happens after
> signup? I'd start with the page."
> **Route:** "Running `enhance-web-ui` on the signup page. You get one polished
> page with before and after screenshots."

## Self-critique

Fail the run if any of these is true:

- You listed several skills and left the choice to the user
- You asked more than one question before routing
- You named a playbook and stopped without running it
- You described the route in skill jargon the user did not use
