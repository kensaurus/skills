#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const hook = join(repoRoot, "hooks", "completion-gate.mjs");
const LOOP_LIMIT = 3;
const sandbox = mkdtempSync(join(tmpdir(), "kenji-gate-"));
const stateDir = join(sandbox, ".cursor");
const statePath = join(stateDir, "complete-everything-state.md");
const home = join(sandbox, "home");
const counters = join(sandbox, "counters");
mkdirSync(stateDir, { recursive: true });
mkdirSync(join(home, ".cursor"), { recursive: true });

const env = { ...process.env, HOME: home, USERPROFILE: home, KENJI_GATE_STATE_DIR: counters };
delete env.CURSOR_VERSION;

let conversations = 0;
const fresh = () => `conv-${++conversations}`;

function exec(script, args, payload) {
  return JSON.parse(execFileSync(process.execPath, [script, ...args], {
    cwd: repoRoot,
    env,
    input: JSON.stringify(payload),
    encoding: "utf8",
  }));
}

// Cursor stop payload. Each call is a new conversation unless one is named.
function run({ status = "completed", conversation = fresh(), args = ["--host=cursor"], script = hook } = {}) {
  return exec(script, args, {
    status,
    loop_count: 0,
    conversation_id: conversation,
    cursor_version: "3.2.0",
    hook_event_name: "stop",
    workspace_roots: [sandbox],
  });
}

// Claude Code Stop payload: cwd (possibly a subdirectory), no cursor_version.
function runClaude(cwd, { conversation = fresh(), args = ["--host=claude"] } = {}) {
  return exec(hook, args, { hook_event_name: "Stop", cwd, session_id: conversation, stop_hook_active: false });
}

function state(body) {
  writeFileSync(statePath, `# State\n\n${body}`);
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  expect(run().followup_message === undefined, "gate continued without a state file");

  state("## Work\n- [x] complete\n");
  expect(run().followup_message === undefined, "gate continued a completed state");

  state("## Work\n- [ ] implement the next item\n");
  const pending = run();
  expect(pending.followup_message?.includes("1 actionable checklist item"), "gate did not continue an actionable state");
  expect(pending.followup_message?.includes("implement the next item"), "gate omitted the pending item");
  expect(pending.followup_message?.includes(`follow-up 1 of ${LOOP_LIMIT}`), "gate did not say how many follow-ups remain");
  expect(pending.followup_message?.includes("blocked by: <who or what>"), "gate did not say how to stand down legitimately");
  expect(pending.followup_message?.includes("another agent owns this checklist, leave the file unchanged"), "gate told a non-owner to mark items in a shared checklist");

  state("## Human gates\n- [ ] production access — question: grant access?\n");
  expect(run().followup_message === undefined, "gate looped on a human-gate-only state");

  state("## Verification ladder\n- [ ] independent completion judge — blocked by: the release merge\n");
  expect(run().followup_message === undefined, "gate looped on an item marked blocked by outside Human gates");

  state("## Work\n- [ ] actionable\n");
  expect(run({ status: "error" }).followup_message === undefined, "gate continued an errored agent turn");

  // `[-]` = not applicable: skipped only with an "n/a:" reason.
  state("## Verification ladder\n- [x] tests\n- [-] typecheck — n/a: no tsconfig.json or typecheck script\n");
  expect(run().followup_message === undefined, "gate blocked a [-] rung that states its n/a reason");
  state("## Verification ladder\n- [x] tests\n- [-] typecheck\n");
  expect(run().followup_message?.includes("typecheck"), "gate let a [-] rung through with no n/a reason");

  // A checklist untouched for a day is abandoned; it must not gate new sessions.
  state("## Work\n- [ ] left over from last week\n");
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  utimesSync(statePath, twoDaysAgo, twoDaysAgo);
  expect(run().followup_message === undefined, "gate continued a stale state file");

  // Claude Code: subdirectory cwd, decision output in both shapes, no Cursor field.
  state("## Work\n- [ ] implement the next item\n");
  const sub = join(sandbox, "packages", "web");
  mkdirSync(sub, { recursive: true });
  const claudeBlock = runClaude(sub);
  expect(claudeBlock.decision === "block" && claudeBlock.hookSpecificOutput?.decision === "block", "Claude Stop did not block an actionable state from a subdirectory cwd");
  expect(claudeBlock.reason?.includes("implement the next item"), "Claude reason omitted the pending item");
  expect(claudeBlock.followup_message === undefined, "Claude branch leaked the Cursor output field");
  state("## Work\n- [x] done\n");
  expect(runClaude(sandbox).decision === undefined, "Claude gate blocked a completed state");

  // The no-progress budget belongs to one conversation.
  state("## Work\n- [ ] ship the batch — acceptance: deploy still building\n- [ ] run the judge\n");
  for (let i = 1; i <= LOOP_LIMIT; i++) {
    expect(run({ conversation: "agent-a" }).followup_message?.includes(`follow-up ${i} of`), `conversation A stood aside early, on follow-up ${i}`);
  }
  expect(run({ conversation: "agent-a" }).followup_message === undefined, "conversation A did not stand aside after its budget");
  expect(run({ conversation: "agent-b" }).followup_message?.includes("follow-up 1 of"), "conversation B inherited conversation A's spent budget");

  // Rewritten evidence or an item another agent added is not progress.
  state("## Work\n- [ ] ship the batch — acceptance: deploy on the S3 sync step\n- [ ] run the judge\n");
  expect(run({ conversation: "agent-a" }).followup_message === undefined, "rewriting evidence after ' — ' restarted conversation A");
  state("## Work\n- [ ] ship the batch\n- [ ] run the judge\n- [ ] a new item from another agent\n");
  expect(run({ conversation: "agent-a" }).followup_message === undefined, "an added item restarted conversation A");

  // Closing an item conversation A saw open is progress and restores its budget.
  state("## Work\n- [x] ship the batch\n- [ ] run the judge\n- [ ] a new item from another agent\n");
  expect(run({ conversation: "agent-a" }).followup_message?.includes("follow-up 1 of"), "a closed item did not restore conversation A's budget");

  // Claude Code counts the same way, per session.
  state("## Work\n- [ ] implement the next item\n");
  for (let i = 0; i < LOOP_LIMIT; i++) runClaude(sandbox, { conversation: "claude-a" });
  expect(runClaude(sandbox, { conversation: "claude-a" }).decision === undefined, "Claude gate did not stand aside after its budget");

  // The workspace-shared counter from earlier releases is removed.
  const legacy = join(stateDir, "completion-gate.count.json");
  writeFileSync(legacy, '{"hash":"x","count":3}\n');
  run();
  expect(!existsSync(legacy), "gate left the legacy workspace counter in place");

  // Cursor runs ~/.claude/settings.json hooks too, with no loop_limit. With the
  // native entry registered, the Claude-config copy stands aside inside Cursor.
  const cursorHooks = join(home, ".cursor", "hooks.json");
  writeFileSync(cursorHooks, JSON.stringify({ version: 1, hooks: { stop: [{ command: "node kenji-hooks/completion-gate.mjs --host=cursor" }] } }));
  expect(run({ args: ["--host=claude"] }).followup_message === undefined, "the Claude-config copy gated a Cursor stop twice");
  expect(run({ args: ["--host=cursor"] }).followup_message?.includes("implement the next item"), "the native Cursor copy stopped gating");
  expect(runClaude(sandbox).decision === "block", "the Claude-config copy stopped gating Claude Code itself");

  // Installs from before --host: a copy under ~/.claude is the Claude-config copy.
  const legacyClaudeCopy = join(home, ".claude", "cursor-kenji-hooks", "completion-gate.mjs");
  mkdirSync(dirname(legacyClaudeCopy), { recursive: true });
  copyFileSync(hook, legacyClaudeCopy);
  expect(run({ args: [], script: legacyClaudeCopy }).followup_message === undefined, "an unflagged ~/.claude copy gated a Cursor stop twice");

  // Without a native Cursor entry, the Claude-config copy is the only gate.
  rmSync(cursorHooks);
  expect(run({ args: ["--host=claude"] }).followup_message?.includes("implement the next item"), "the Claude-config copy stood aside with no native Cursor entry");

  process.stdout.write("✓ completion gate tests passed.\n");
} finally {
  rmSync(sandbox, { recursive: true, force: true });
}
