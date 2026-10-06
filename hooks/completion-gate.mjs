#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const STATE_FILES = [
  ".cursor/complete-everything-state.md",
  ".cursor/burndown-state.md",
];

// Follow-ups one conversation gets while none of the items it was shown has
// closed. Keyed per conversation: two agents in one workspace must not spend,
// or reset, each other's budget.
const NO_PROGRESS_LIMIT = 3;
// A checklist nobody has written to for a day is abandoned, not in flight; it
// must not hijack every later session opened in the same repo.
const STALE_MS = 24 * 60 * 60 * 1000;
const COUNTER_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Workspace-shared counter from earlier releases; every agent in the repo
// shared it, so a second agent's edits restarted the first agent's loop.
const LEGACY_COUNTER = ".cursor/completion-gate.count.json";
// Same shape as a Human gates line; an item waiting on someone is not work.
const BLOCKED = /\b(?:blocked (?:by|on)|waiting on):\s*\S/i;

function parseInput() {
  try {
    const raw = readFileSync(0, "utf8").trim();
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function actionableItems(markdown) {
  let section = "";
  const items = [];

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (heading) {
      section = heading[1];
      continue;
    }

    if (/human gate|blocked on human|blocked on you/i.test(section)) continue;
    const task = line.match(/^\s*-\s*\[\s\]\s+(.+?)\s*$/);
    if (task) {
      if (!BLOCKED.test(task[1])) items.push(task[1]);
      continue;
    }
    // `[-]` marks a rung that does not apply. It is not a pass, so it only
    // stops counting as open work when it states why ("n/a: <evidence>").
    const na = line.match(/^\s*-\s*\[-\]\s+(.+?)\s*$/);
    if (na && !/\bn\/a:\s*\S/i.test(na[1])) items.push(`${na[1]} (marked [-] without an "n/a: <reason>")`);
  }

  return items;
}

function inspectWorkspace(root) {
  const pending = [];

  try {
    rmSync(join(root, LEGACY_COUNTER), { force: true });
  } catch {
    // fail open: a leftover counter is clutter, not a reason to trap a session
  }

  for (const relativePath of STATE_FILES) {
    const absolutePath = join(root, relativePath);
    if (!existsSync(absolutePath)) continue;

    try {
      if (Date.now() - statSync(absolutePath).mtimeMs > STALE_MS) continue;
      const items = actionableItems(readFileSync(absolutePath, "utf8"));
      if (items.length) pending.push({ relativePath, items });
    } catch {
      // Fail open: a hook must not trap a session because a state file vanished
      // or became unreadable between existence check and read.
    }
  }

  return pending;
}

// Evidence appended after " — " is not part of the title: rewriting it every
// turn must not look like a closed item.
function itemTitle(item) {
  return item.split(" — ")[0].trim();
}

// Claude Code sends cwd, which may sit below the workspace root.
function rootsFromCwd(cwd) {
  let dir = cwd;
  for (let depth = 0; depth < 12; depth++) {
    if (STATE_FILES.some((rel) => existsSync(join(dir, rel))) || existsSync(join(dir, ".git"))) return [dir];
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return [cwd];
}

// Which config registered this copy. Installs from before `--host` existed are
// told apart by where the script lives.
function registeredHost() {
  const flag = process.argv.slice(2).find((arg) => arg.startsWith("--host="));
  if (flag) return flag.slice("--host=".length);
  return /[\\/]\.claude[\\/]/.test(fileURLToPath(import.meta.url)) ? "claude" : "cursor";
}

// Cursor puts cursor_version in every hook payload and CURSOR_VERSION in the
// hook environment; Claude Code sends hook_event_name "Stop" and neither.
function runningInCursor(input) {
  return (
    typeof input.cursor_version === "string" ||
    Boolean(process.env.CURSOR_VERSION) ||
    input.hook_event_name !== "Stop"
  );
}

// Cursor also runs Claude Code hooks from ~/.claude/settings.json (Third-Party
// Imports, on by default) and applies no loop_limit to them. When the native
// Cursor entry exists, the Claude-config copy must stand aside or every stop
// is gated twice, once with no cap at all.
function cursorGateRegistered(roots) {
  const configs = [join(homedir(), ".cursor", "hooks.json"), ...roots.map((root) => join(root, ".cursor", "hooks.json"))];
  return configs.some((path) => {
    try {
      const stop = JSON.parse(readFileSync(path, "utf8"))?.hooks?.stop;
      return Array.isArray(stop) && stop.some((entry) => {
        const command = String(entry?.command ?? "");
        return command.includes("completion-gate.mjs") && !command.includes("--host=claude");
      });
    } catch {
      return false;
    }
  });
}

function counterDir() {
  // CURSOR_KENJI_GATE_STATE_DIR is the pre-2.0.0 name, still honored. The
  // default path keeps its pre-rename name on purpose (ADR-0012, ADR-0013).
  return process.env.KENJI_GATE_STATE_DIR || process.env.CURSOR_KENJI_GATE_STATE_DIR || join(homedir(), ".cache", "cursor-kenji", "completion-gate");
}

function pruneCounters(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    try {
      if (Date.now() - statSync(path).mtimeMs > COUNTER_TTL_MS) rmSync(path, { force: true });
    } catch {
      // another hook process pruned it first
    }
  }
}

// Returns the follow-up number to spend (1..NO_PROGRESS_LIMIT), or 0 when this
// conversation has had its follow-ups and none of the items it saw has closed.
function spendFollowUp(root, conversation, titles) {
  const dir = counterDir();
  const key = createHash("sha1").update(`${root}\0${conversation}`).digest("hex").slice(0, 20);
  const path = join(dir, `${key}.json`);
  let previous = null;
  try {
    previous = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    // first stop for this conversation in this workspace
  }
  const seen = Array.isArray(previous?.open) ? previous.open : [];
  const progressed = seen.some((title) => !titles.includes(title));
  let blocks = progressed ? 0 : Number(previous?.blocks) || 0;
  const allowed = blocks < NO_PROGRESS_LIMIT;
  if (allowed) blocks += 1;
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(path, `${JSON.stringify({ root, open: titles, blocks })}\n`);
    pruneCounters(dir);
  } catch {
    // fail open: a hook must not trap a session over a counter file
  }
  return allowed ? blocks : 0;
}

const pass = () => {
  process.stdout.write("{}\n");
  process.exit(0);
};

function main() {
  const input = parseInput();
  const inCursor = runningInCursor(input);

  let roots = [];
  if (!inCursor) roots = rootsFromCwd(input.cwd || process.cwd());
  else if (input.status !== "completed") pass();
  else if (Array.isArray(input.workspace_roots) && input.workspace_roots.length) roots = input.workspace_roots;
  else if (process.env.CURSOR_PROJECT_DIR) roots = [process.env.CURSOR_PROJECT_DIR];
  if (roots.length === 0) pass();

  if (inCursor && registeredHost() === "claude" && cursorGateRegistered(roots)) pass();

  const conversation = String(input.conversation_id || input.session_id || "unknown");
  const gated = roots
    .flatMap((root) => inspectWorkspace(root).map((state) => ({ root, ...state })))
    .map((state) => ({ ...state, followUp: spendFollowUp(state.root, conversation, state.items.map(itemTitle)) }))
    .filter((state) => state.followUp > 0);
  if (gated.length === 0) pass();

  const count = gated.reduce((total, state) => total + state.items.length, 0);
  const followUp = Math.max(...gated.map((state) => state.followUp));
  const sample = gated
    .flatMap((state) =>
      state.items.map(
        (item) => `${relative(process.cwd(), state.root) || "."}/${state.relativePath}: ${item}`,
      ),
    )
    .slice(0, 5)
    .map((item) => `- ${item}`)
    .join("\n");

  const message = [
    `Completion gate: ${count} actionable checklist item${count === 1 ? "" : "s"} remain (follow-up ${followUp} of ${NO_PROGRESS_LIMIT} while nothing closes).`,
    "Re-read the durable state file, continue with the next safe item, record fresh evidence, and update the checklist.",
    sample,
    count > 5 ? `- …and ${count - 5} more` : "",
    'If an item waits on a person, mark it "blocked by: <who or what>" or move it under Human gates. If another agent owns this checklist, leave the file unchanged, because the marker would silence that agent\'s gate too. Either way, say so in one line and stop.',
    "Do not claim completion while actionable items remain. Before the final claim, run the completion-judge gate.",
  ]
    .filter(Boolean)
    .join("\n");

  if (!inCursor) {
    // Current docs nest the decision under hookSpecificOutput; earlier releases
    // read it at the top level. Emit both; exit 0 lets the JSON carry it.
    const block = { decision: "block", reason: message };
    process.stdout.write(`${JSON.stringify({ ...block, hookSpecificOutput: { hookEventName: "Stop", ...block } })}\n`);
    process.exit(0);
  }
  process.stdout.write(`${JSON.stringify({ followup_message: message })}\n`);
}

try {
  main();
} catch {
  pass();
}
