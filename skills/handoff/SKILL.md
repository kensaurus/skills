---
name: handoff
description: >-
  Compact the current conversation into a handoff document for a fresh agent:
  state, next steps, suggested skills, gotchas, saved to the OS temp dir.
  User-invoked via /handoff; an optional argument sets the next session focus.
  Use when "write a handoff", "hand off to a new session", or before ending a
  long session.
disable-model-invocation: true
license: MIT
effort: low
---

# Handoff

**Degree of freedom: LOW.** Contents, redaction, and temp-dir save
`[LOW freedom — run exactly]`. What to emphasize for the next session
`[HIGH freedom]`.

> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).

## How to reason

1. **Observe** — what is done, verified, and still open
2. **Interpret** — which claims are implemented vs scoped-verified vs assumed
3. **Classify** — include / point-at-artifact / omit (already in an ADR)
4. **Severity** — a false "green" in the handoff is worse than a missing detail

## Worked example

> **Observe:** auth UI landed; RLS migration is a local file only; tests not run.
> **Interpret:** UI is implemented, backend is not deployed-verified.
> **Classify:** write "implemented, not verified"; point at the migration path; do not say SHIP.
> **Save:** OS temp file, print the path; do not commit the handoff into the repo.

## Self-critique before writing

- **Ladder honest** — no upgraded verification claim
- **No secrets** — keys/tokens/PII redacted
- **Pointers not copies** — ADRs and plans referenced by path
- **Right owner** — permanent decisions → `docs-adr`, not this file

Write a handoff document summarizing the current conversation so a fresh agent
can continue the work. Save it to the OS temporary directory — **not** the
current workspace — and print the path.

## Contents

- **State**: what was attempted, what is done, what is verified vs merely edited.
- **Next steps**: the concrete remaining work, in order, with file paths.
- **Suggested skills**: which skills the next agent should invoke, and for what.
- **Pointers, not copies**: do not duplicate content already captured in other
  artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path
  or URL instead.
- **Gotchas**: anything non-obvious the next agent would otherwise rediscover the
  hard way (flaky tests, env quirks, decisions already ruled out).

## Rules

1. Redact sensitive information: API keys, passwords, tokens, PII.
2. If the user passed an argument, treat it as the next session's focus and
   tailor the document accordingly.
3. Be honest about verification state — use the ladder from
   `verification-before-completion`: implemented → scoped verified → repository
   green → PR green → deployed verified. Never upgrade a claim in a handoff.
4. Permanent decisions (stack, layering, rejected alternatives) belong in
   `docs-adr`, not in the handoff. Point at `docs/adr/INDEX.md` if it exists;
   do not re-copy those records here.
