#!/usr/bin/env node
/**
 * Status line for Claude Code.
 *
 * Claude Code runs this after every assistant message (debounced at 300 ms)
 * with one JSON object on stdin and shows the first line of stdout under the
 * prompt (https://code.claude.com/docs/en/statusline, read 2026-10-19).
 * It prints:
 *
 *   Opus 5.5 │ tsumagoi (feat/kiosk) │ ctx 42% │ $1.23 │ 5h 31% │ release-b
 *
 * model · folder (git branch) · context used · session cost · five-hour
 * usage · session name. Fields the payload does not carry are left out.
 *
 * It must stay fast, because a slow script blocks the status line until it
 * finishes. So it spawns nothing: the branch is read from .git/HEAD (through
 * the gitdir file in a worktree) instead of `git branch`, and there is no
 * cache file to manage. Colours are plain ANSI and degrade to text.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}

/** Branch name from .git/HEAD without running git. Walks up from `dir`. */
function gitBranch(dir) {
  try {
    let cur = resolve(dir);
    for (let i = 0; i < 40; i++) {
      const dotGit = join(cur, ".git");
      if (existsSync(dotGit)) {
        let gitDir = dotGit;
        if (statSync(dotGit).isFile()) {
          const m = readFileSync(dotGit, "utf8").match(/^gitdir:\s*(.+)$/m);
          if (!m) return "";
          gitDir = resolve(cur, m[1].trim());
        }
        const head = readFileSync(join(gitDir, "HEAD"), "utf8").trim();
        const ref = head.match(/^ref:\s*refs\/heads\/(.+)$/);
        return ref ? ref[1] : head.slice(0, 7);
      }
      const parent = dirname(cur);
      if (parent === cur) return "";
      cur = parent;
    }
  } catch {
    /* no repo, unreadable HEAD: show no branch */
  }
  return "";
}

const useColor = !("NO_COLOR" in process.env);
const c = (code, s) => (useColor ? `\u001b[${code}m${s}\u001b[0m` : s);
const dim = (s) => c("2", s);
const pct = (n) => `${Math.round(n)}%`;
const heat = (n) => (n >= 85 ? c("31", pct(n)) : n >= 65 ? c("33", pct(n)) : c("32", pct(n)));

const d = readStdin();
const parts = [];

const model = d.model?.display_name || d.model?.id;
if (model) parts.push(c("1", model) + (d.fast_mode ? " ⚡" : ""));

const dir = d.workspace?.current_dir || d.cwd || process.cwd();
const branch = d.worktree?.branch || gitBranch(dir);
parts.push(basename(dir) + (branch ? dim(` (${branch})`) : ""));

const used = d.context_window?.used_percentage;
if (typeof used === "number") parts.push(`ctx ${heat(used)}`);

const cost = d.cost?.total_cost_usd;
if (typeof cost === "number" && cost > 0) parts.push(`$${cost.toFixed(2)}`);

const fiveHour = d.rate_limits?.five_hour?.used_percentage;
if (typeof fiveHour === "number") parts.push(`5h ${heat(fiveHour)}`);

const week = d.rate_limits?.seven_day?.used_percentage;
if (typeof week === "number" && week >= 50) parts.push(`7d ${heat(week)}`);

if (d.session_name) parts.push(c("36", d.session_name));
if (d.agent?.name) parts.push(dim(`agent:${d.agent.name}`));

process.stdout.write(parts.join(dim(" │ ")) + "\n");
