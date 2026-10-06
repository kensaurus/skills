#!/usr/bin/env node
/**
 * Claude Code Stop hook, registered with `asyncRewake: true`: typecheck in the
 * background after a turn, and wake Claude only when there is something new to fix.
 *
 *   {
 *     "hooks": { "Stop": [{ "hooks": [{
 *       "type": "command",
 *       "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/stop-typecheck.mjs\" typecheck",
 *       "asyncRewake": true,
 *       "timeout": 600
 *     }] }] }
 *   }
 *
 * - Skips in ~0.3 s when no TypeScript input changed since the last check.
 * - Exit 2 wakes Claude with the errors (stderr becomes a system reminder).
 *   Exit 0 stays silent. A plain synchronous Stop hook can't do this: its
 *   stdout only reaches the debug log, so Claude never sees the errors.
 * - Re-wakes only when the error set changes, so a pre-existing error can't loop.
 * - Summarizes large error sets (often one missing codegen step) instead of
 *   dumping hundreds of lines.
 * - State, lock and tsbuildinfo live in this worktree's git dir, never in a
 *   node_modules shared across worktrees.
 *
 * Assumes the script (default `typecheck`) runs plain `tsc --noEmit` and accepts
 * `--incremental --tsBuildInfoFile <path>`. Not for `tsc -b` or wrappers that
 * reject extra flags. Package manager is picked from the lockfile.
 *
 * Usage: node stop-typecheck.mjs [script-name]
 */
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const script = process.argv[2] || "typecheck";
const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const git = (...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const sha = (s) => createHash("sha1").update(s).digest("hex");
const STALE_LOCK_MS = 15 * 60 * 1000;

let gitDir;
try {
  gitDir = git("rev-parse", "--path-format=absolute", "--git-dir");
} catch {
  process.exit(0);
}
// Stay silent in a repo without the script rather than waking the agent with
// the package manager's "missing script" error.
try {
  const scripts = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8")).scripts ?? {};
  if (!(script in scripts)) process.exit(0);
} catch {
  process.exit(0);
}

const stateFile = path.join(gitDir, "claude-stop-typecheck.json");
const lockFile = path.join(gitDir, "claude-stop-typecheck.lock");
const buildInfo = path.join(gitDir, "claude-stop-typecheck.tsbuildinfo");

// HEAD plus size and mtime of every changed or untracked TypeScript input.
const status = git("status", "--porcelain", "--untracked-files=all", "--", "*.ts", "*.tsx", "*.mts", "*.cts", "tsconfig*.json", "package.json");
const stamps = status
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const file = line.slice(3).split(" -> ").pop().replace(/^"|"$/g, "");
    try {
      const st = fs.statSync(path.join(cwd, file));
      return `${line}|${st.size}|${st.mtimeMs}`;
    } catch {
      return line;
    }
  });
const fingerprint = sha([git("rev-parse", "HEAD"), ...stamps].join("\n"));

let state = {};
try {
  state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
} catch {}
if (state.fingerprint === fingerprint) process.exit(0);

// One run per worktree at a time; a later turn re-checks anyway.
let lock;
try {
  lock = fs.openSync(lockFile, "wx");
} catch {
  try {
    if (Date.now() - fs.statSync(lockFile).mtimeMs < STALE_LOCK_MS) process.exit(0);
    fs.rmSync(lockFile, { force: true });
    lock = fs.openSync(lockFile, "wx");
  } catch {
    process.exit(0);
  }
}

const runner = fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))
  ? "pnpm run --silent"
  : fs.existsSync(path.join(cwd, "yarn.lock"))
    ? "yarn run --silent"
    : fs.existsSync(path.join(cwd, "bun.lock")) || fs.existsSync(path.join(cwd, "bun.lockb"))
      ? "bun run"
      : "npm run --silent";
const extraArgs = `--incremental --tsBuildInfoFile "${buildInfo}"`;
// npm needs `--` before script args; pnpm, yarn and bun forward them as-is.
const command = runner.startsWith("npm") ? `${runner} ${script} -- ${extraArgs}` : `${runner} ${script} ${extraArgs}`;

let exitCode = 0;
try {
  const run = spawnSync(command, { cwd, shell: true, encoding: "utf8", maxBuffer: 64 << 20 });
  const output = `${run.stdout || ""}${run.stderr || ""}`;
  if (run.status === 0) {
    state = { fingerprint, errorsHash: "" };
  } else {
    const errors = [...new Set(output.split(/\r?\n/).filter((l) => /error TS\d+/.test(l)))];
    const report = errors.length ? errors : output.trim().split(/\r?\n/).slice(-30);
    const errorsHash = sha(report.slice().sort().join("\n"));
    if (errorsHash !== state.errorsHash) {
      process.stderr.write(
        `Background \`${script}\` failed after your last turn (${errors.length || "unknown number of"} error(s)). Fix these before finishing:\n` +
          (errors.length > 50 ? summarize(errors) : report.slice(0, 40).join("\n")) +
          "\n",
      );
      exitCode = 2;
    }
    state = { fingerprint, errorsHash };
  }
  fs.writeFileSync(stateFile, JSON.stringify(state));
} finally {
  fs.closeSync(lock);
  fs.rmSync(lockFile, { force: true });
}
process.exit(exitCode);

// Hundreds of errors usually cascade from one cause, such as missing generated code.
// Summarize so Claude fixes the root cause instead of chasing symptoms.
function summarize(errors) {
  const count = (list, key) => list.reduce((m, l) => ((k) => (k ? m.set(k, (m.get(k) || 0) + 1) : m))(key(l)), new Map());
  const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
  const codes = top(count(errors, (l) => l.match(/error (TS\d+)/)?.[1]), 6).map(([c, n]) => `${c} x${n}`).join(", ");
  const missing = top(count(errors.filter((l) => /TS2307/.test(l)), (l) => l.match(/module '([^']+)'/)?.[1]), 5);
  const lines = [`By code: ${codes}`];
  if (missing.length) {
    lines.push("Most-missing modules:", ...missing.map(([mod, n]) => `  ${mod} (${n} imports)`));
    if (missing.some(([mod]) => /generated|prisma|\.gen\b|codegen/i.test(mod))) {
      lines.push("Generated code is missing in this checkout. Run the repo's codegen first (e.g. `npx prisma generate`), then re-check. Most other errors likely cascade from it.");
    }
  }
  lines.push("First errors:", ...errors.slice(0, 10));
  return lines.join("\n");
}
