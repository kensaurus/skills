---
name: workflow-grilling
description: >
  Interview the user about a plan, decision, or idea one question at a time
  until you agree. Use when "grill me", "stress-test this plan", "interview me
  about this", "poke holes in this", "challenge my thinking", or before a
  non-trivial design.
license: MIT
effort: high
---

# Grilling

**Degree of freedom: MIXED.** Which branch to walk and how hard to challenge
`[HIGH freedom]`; one-question-at-a-time, recommend-an-answer, and
no-act-until-confirmed `[LOW freedom — run exactly]`.

> The most common failure mode in software work is misalignment: the agent builds
> what it *thinks* was asked. A grilling session closes that gap before any work
> starts. Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).

Interview the user relentlessly about every aspect of the plan, decision, or idea
until you reach a shared understanding. Walk down each branch of the decision
tree, resolving dependencies between decisions one by one.

Copy this checklist and tick items as you go:

```
- [ ] Step 1: Read repo, docs, git history, tickets before the first question
- [ ] Step 2: Resolve dependencies in order; upstream decision first
- [ ] Step 3: Ask one question at a time, with a recommended answer and why
- [ ] Step 4: Challenge vague terms; propose a precise one
- [ ] Step 5: Do not act until the user confirms shared understanding
- [ ] Step 6: Close with the decision log in the user's words; hand off
```

## How to reason

1. **Surface** — what decision or vague term is actually in play?
2. **Depend** — which upstream choice must land before this one?
3. **Recommend** — your answer and why, in one sentence
4. **Confirm** — wait; log the user's words, not yours

## Worked example

> **Surface:** "add AI chat to the dashboard" — "AI" and "dashboard" are both overloaded.
> **Depend:** audience (internal ops vs customers) gates model, retention, and auth.
> **Recommend:** internal ops assistant on existing `/dashboard` — cheapest test of the idea.
> **Confirm:** user picks customers instead; log that, then ask the next downstream (retention vs ephemeral).

## Self-critique before reporting

- **One question** — the last turn asked exactly one thing
- **Recommendation present** — every question included a default the user can accept
- **Facts looked up** — nothing askable from the repo was asked
- **Right owner** — session over → `design-prd` / `workflow-spec-tdd` / a `plan-*`; do not start building here

## Rules of the session  [LOW freedom — run exactly]

1. **One question at a time.** Ask a single question, then wait for the answer
   before continuing. Asking multiple questions at once is bewildering.
2. **Recommend an answer with every question.** State your recommended answer and
   why, so the user can accept it with a single word or push back.
3. **Facts are yours; decisions are theirs.** If a *fact* can be found by
   exploring the environment (filesystem, git history, docs, running commands),
   look it up instead of asking. *Decisions* belong to the user — put each one to
   them and wait. Before the first question, read the relevant sources broadly —
   repo, docs, git history, tickets — so the first question is already a
   decision, not a fact.
4. **Resolve dependencies in order.** When one decision hinges on another,
   surface the upstream decision first.
5. **Challenge vague terms.** When the user uses an overloaded or fuzzy word,
   propose a precise one (see `docs-domain-modeling` when the vocabulary itself needs
   fixing).
6. **Do not act until confirmed.** No edits, no scaffolding, no "getting a head
   start". The session ends when the user confirms shared understanding — then
   summarize the decisions made and hand off to the appropriate skill
   (`workflow-spec-tdd`, `design-prd`, `plan-*`).

## Output  [LOW freedom — run exactly]

Close the session with a compact decision log: each decision on one line, in the
user's confirmed vocabulary. This log is the input to the spec or plan that
follows — offer to carry it into `design-prd` or `/plan-mode`.
