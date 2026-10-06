# 0012. The completion gate runs once per host and budgets per conversation

Status: Accepted            Date: 2026-09-29

## Context

The installer registers `completion-gate.mjs` twice: in `~/.cursor/hooks.json`
for Cursor and in `~/.claude/settings.json` for Claude Code. Cursor also loads
Claude Code hooks from `~/.claude/settings.json` (Third-Party Imports, on by
default) and applies no `loop_limit` to them. So every Cursor stop ran the gate
twice, and the Claude-config copy, which skipped its own cap under Cursor, sent
the same follow-up after every stop for hours.

The cap that did exist was one counter file per workspace
(`.cursor/completion-gate.count.json`). Two agents in one repo shared it, so
one agent's checklist edits restarted the other agent's loop. The gate also
fired for any session in the repo, including one only asked a status question,
and for items that waited on a person but sat outside the Human gates section.

## Decision

- Each registration names its config with `--host=cursor` or `--host=claude`.
  Inside Cursor, the Claude-config copy stands aside when a native Cursor
  entry is registered. Unflagged installs are told apart by the script's path.
- The follow-up budget is per conversation (`conversation_id`, or Claude
  Code's `session_id`), stored outside the repo in
  `~/.cache/cursor-kenji/completion-gate/`. A conversation gets three
  follow-ups while none of the items it saw closes. Closing one restores
  them. Rewritten evidence and items added by someone else do not.
- Items marked `blocked by:`, `blocked on:`, or `waiting on:` are not
  actionable, wherever they sit.
- A state file untouched for 24 hours does not gate.
- The follow-up tells the agent how to stand down legitimately. An item that
  waits on a person is marked blocked or moved under Human gates. A checklist
  another agent owns is left unchanged, because the marker is shared and
  would silence that agent's gate too. Either way the agent says so in one
  line and stops.

## Rejected alternatives

- **Stop installing the Claude Code hook when Cursor is present** — rejected:
  Claude Code users on the same machine would lose the gate.
- **Rely on Cursor's `loop_limit`** — rejected: it does not apply to hooks
  loaded from Claude Code config, and it restarts with each user message.
- **Reset the budget whenever the set of open items changes** — rejected: that
  was the shipped behaviour, and a second agent's edits kept reviving the loop
  in the first agent's session.

## Consequences

One gate per stop in Cursor. An umbrella item that cannot close without a
human stops being pushed after three follow-ups in that conversation. The
leftover workspace counter is deleted on the next run.
