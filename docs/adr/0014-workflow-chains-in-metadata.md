# 0014. Workflow skills declare their chain in `metadata.chain`

Status: Accepted            Date: 2026-10-08

## Context

Mushi Mushi syncs the `SKILL.md` files from this repo into a catalog and runs
"skill pipelines": a root skill, then each skill it chains to, in order. It
used to find the chain by scanning the body for `skills/<slug>/SKILL.md`
paths. The workflow skills stopped writing paths and now say "Read the
`debug-error` skill and follow it", so every workflow synced with an empty
chain and ran as a single step.

The body is the wrong place to parse anyway. It mixes executed steps with
routing notes ("many reports → `workflow-feedback-to-closure`"), neighbor
tables, and guardrail reads such as `protocol-browser-anti-stall`. A parser
cannot tell them apart.

The Agent Skills spec allows only `name`, `description`, `license`,
`compatibility`, `metadata` and `allowed-tools`, and `metadata` maps string
keys to **string** values. A YAML list is outside the spec.

## Decision

A skill that runs other skills as steps declares them in frontmatter:

```yaml
metadata:
  chain: "debug-error test-playwright workflow-pr"
```

- One double-quoted string of space-separated slugs, in execution order,
  excluding the skill itself.
- Every slug is a directory under `skills/` (not `skills-cursor/`, which
  skill-sync does not read).
- A step is in the chain when the skill's sequence block lists it and it runs
  by default, including steps marked "skip if not applicable". Steps marked
  optional or run only on request, per-ticket routers that pick one of several
  skills, guardrail reads, and "see also" mentions stay out.
- The body's phase order must match the chain.

`scripts/validate-skills.mjs` fails on an unquoted value, an unknown or
repeated slug, or a chain that lists its own skill.

## Rejected alternatives

- **A YAML list (`chain: [a, b]`)** — rejected: the spec allows only string
  values under `metadata`; strict validators reject it.
- **A top-level `chain:` key** — rejected: outside the spec's field set.
- **Keep parsing the body** — rejected: prose cannot separate executed steps
  from routing notes, and every rewording of a sentence changes the pipeline.

## Consequences

Seven workflows carry a chain when this branch lands. A new workflow skill adds
`metadata.chain` in the same PR, and a renamed skill fails CI until every
chain that names it is updated.
