# 0015. Skill writing follows the 2026-10 authoring guidance, with gates where a check can hold the line

Status: Accepted            Date: 2026-10-19

## Context

Anthropic's skill-authoring guidance
(https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
and the Claude Code skills reference (https://code.claude.com/docs/en/skills),
both read 2026-10-19, say more than the pack's playbook encoded in 2026-09:

- a description states what the skill does **and** when to use it, with the
  key terms a user would type, because Claude picks among 100+ skills from
  the listing alone;
- a reference file over 100 lines opens with a table of contents, because
  Claude previews long files with `head -100`; references stay **one level
  deep** from `SKILL.md`, because a file linked only from another reference
  tends to be read partially or not at all;
- complex workflows carry a checklist Claude can copy into its response, so
  a validation step is not skipped;
- skill bodies avoid time-sensitive text (dates, "before/after version X"),
  keeping history in a collapsed "old patterns" block instead;
- Claude Code reads `argument-hint` for the `/` menu and `when_to_use` as an
  extension of the description in the listing.

Measured on 2026-10-19 before this change: 158 of 161 skills declared a
degree of freedom and carried a worked example, none exceeded 500 lines, all
cross-references resolved, but 18 descriptions had no trigger clause, 75
skills with routing overlap had no neighbors table (22 more had no overlap),
11 `workflow-*` skills had no checklist, four reference files over 100 lines
had no contents list, one skill linked three reference files only from a
reference, and no skill used `argument-hint`.

## Decision

1. **Descriptions carry a trigger clause** (`Use when "…", "…"`), key use case
   first, within the 320-character house budget (ADR-0002).
2. **A neighbors table ("This skill vs neighbors") is added only where routing
   overlaps**: the description names another skill, or another skill's
   description names it. Isolated skills do not get one; the context window is
   shared and a table with no neighbors is padding.
3. **Every `workflow-*` skill carries a copyable checklist** whose steps index
   the skill's own phases in the skill's own words.
4. **Reference files are gated** by `scripts/check-reference-toc.mjs` in
   `npm test`: a Contents list over 100 lines, links one level deep from
   `SKILL.md`, and every relative Markdown link resolving. `--fix` inserts a
   missing Contents list from the H2 headings.
5. **`argument-hint` is set on skills that read arguments**; nothing else
   gains it.
6. **`when_to_use` is not adopted.** It is appended to the description in the
   listing and counts toward the same budget; the pack's ratchet
   (`LISTING_MAX_CHARS`, ADR-0010) is at its measured ceiling, so trigger
   phrases go in the description instead.
7. **No dated reads in skill bodies.** "Read 2026-10-19" belongs in commit
   messages, ADRs and the research skill's *output*, not in instructions that
   should still read as current next year.

## Consequences

- The playbook gains T9 (progressive-disclosure hygiene) and T10 (copyable
  checklist) and points here.
- A new reference file over 100 lines fails `npm test` until it has a
  Contents list; a reference that links a sibling fails until `SKILL.md`
  links that sibling too.
- The three `thirdparty-*` skills keep their upstream text verbatim and are
  exempt from the degree-of-freedom line and the neighbors table.

## Rejected

- **A neighbors table in every skill.** 22 skills have no routing neighbor;
  a table there would list only the skill itself.
- **`when_to_use` for trigger phrases.** Doubles listing growth against a
  ratchet that may not be raised (ADR-0010).
- **Dating sources inside skills.** The guidance's "avoid time-sensitive
  information" outranks the research protocol's grounding contract, which
  applies to research output.
