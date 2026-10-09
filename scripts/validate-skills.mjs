#!/usr/bin/env node
/**
 * Validate every skill against the Agent Skills specification.
 * Spec: https://agentskills.io/specification
 *
 *   node scripts/validate-skills.mjs        # verify; exit 1 on any error
 *   node scripts/validate-skills.mjs --json  # machine-readable output
 *
 * Checks (errors fail CI; warnings don't):
 *   - SKILL.md exists with YAML frontmatter delimited by `---`
 *   - `name` present, matches the parent directory, lowercase a-z/0-9/-,
 *     no leading/trailing hyphen, no consecutive `--`, <= 64 chars
 *   - `description` present, non-empty, <= 320 chars (house budget; spec max 1024)
 *   - `description` has balanced quoted trigger phrases and no truncation scar
 *   - (warn) `description` stays below 315 chars so edits retain budget headroom
 *   - (warn) SKILL.md body <= 500 lines (move detail to references/)
 *   - first-party families on the prompt require-list declare Degree of
 *     freedom plus heading-level `## Worked example` and `## Self-critique`
 *     (a table cell that names the technique does not count)
 *   - Claude Code routing keys, when present, hold documented values:
 *     `effort` ∈ low/medium/high/xhigh/max (skills, agents, commands),
 *     `context` = fork, `agent` only with fork, booleans are true/false,
 *     agents' `memory`/`isolation`/`color`/`maxTurns` in their sets, `effort`
 *     never nested under `metadata:`; (warn) `model` pinning a full `claude-*`
 *     ID; description + when_to_use <= 1536 chars. Cursor ignores these keys.
 *   - `metadata.chain`, when present, is one double-quoted string of
 *     space-separated slugs, each an existing skills/ directory, no repeats,
 *     not the skill itself (ADR-0014)
 *   - every top-level commands/*.md is `disable-model-invocation: true` unless
 *     listed in MODEL_INVOCABLE_COMMANDS; commands-portable/ carries no
 *     Claude-only keys (install.mjs strips portable frontmatter)
 *   - every shipped .ps1/.psm1/.psd1 is ASCII or starts with a UTF-8 BOM
 *     (Windows PowerShell 5.1 decodes BOM-less scripts with the ANSI code page)
 *   - the pack's Claude Code skill listing (skills + skills-cursor + top-level
 *     model-invocable commands, measured as the client measures it) <=
 *     LISTING_MAX_CHARS, a ratchet (ADR-0010); agent descriptions are
 *     reported separately
 */
import { readdirSync, existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const groups = ["skills", "skills-cursor"];
const asJson = process.argv.includes("--json");

const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // lowercase, hyphen-separated, no -- or edge -
const DESC_MAX = 320;
const DESC_HEADROOM_WARN = 315;
const BODY_WARN = 500;

// Claude Code frontmatter extensions (code.claude.com/docs/en/skills →
// "Frontmatter reference"; sub-agents → "Supported frontmatter fields").
// Cursor ignores unknown keys, so a bad value here is invisible until a
// Claude Code session silently loses the routing.
const EFFORT_LEVELS = new Set(["low", "medium", "high", "xhigh", "max"]);
const BOOL_KEYS = ["disable-model-invocation", "user-invocable", "background"];
const CLAUDE_CODE_CAP = 1536; // description + when_to_use
const AGENT_ENUMS = {
  memory: new Set(["user", "project", "local"]),
  isolation: new Set(["worktree"]),
  color: new Set(["red", "blue", "green", "yellow", "purple", "orange", "pink", "cyan"]),
};
// Skill-listing measure (ADR-0010, superseding ADR-0008's measure). Claude
// Code 2.1.280 lists every model-invocable skill and command as
// "- name: description" (description + " - " + when_to_use, capped at 1,536),
// one per line, against contextWindow x chars/token x
// skillListingBudgetFraction (0.01). It counts 3 chars/token for current
// models, so a 1M Opus 5.5 session has 30,000 chars, shared with built-in
// skills (~11k). Over budget the least-used skills show by name only;
// "skillListingBudgetFraction": 0.02 keeps every pack description.
// Re-verify at each client release.
const LISTING_DEFAULT_BUDGET_CHARS = 30_000; // Opus 5.5, 1M context: 1,000,000 x 3 x 0.01
const LISTING_MAX_CHARS = 39_000;            // ratchet: measured total rounded up to 500; lower, never raise
const LISTING_DESC_CAP = 1536;
// Commands are the `/` surface; the skill twin carries the auto-route.
const MODEL_INVOCABLE_COMMANDS = new Set(["gtm-weekly", "fix-issue", "mcp-guide"]);
const listing = { skills: 0, "skills-cursor": 0, commands: 0 };
let listingEntries = 0;
let agentDescChars = 0;
/** One listing line as the client renders it: "- " + name + ": " + text. */
function listingEntry(name, desc, front) {
  const whenToUse = fmScalar(front, "when_to_use");
  const text = whenToUse ? `${desc} - ${whenToUse}` : desc;
  listingEntries++;
  return name.length + 4 + Math.min(text.length, LISTING_DESC_CAP);
}

const errors = [];
const warnings = [];
let total = 0;

/** Top-level scalar frontmatter value for `key`, unquoted; null if absent. */
function fmScalar(front, key) {
  const m = front.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
}
function frontmatterOf(raw) {
  const m = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---/);
  return m ? m[1] : null;
}
/** Validate Claude Code routing keys — values, not presence. */
function checkRoutingKeys(id, front, desc, { agent = false } = {}) {
  const effort = fmScalar(front, "effort");
  if (effort !== null && !EFFORT_LEVELS.has(effort)) {
    errors.push(`${id}: effort '${effort}' not one of ${[...EFFORT_LEVELS].join("/")}`);
  }
  if (/^metadata:/m.test(front) && /^\s+effort:/m.test(front)) {
    errors.push(`${id}: effort belongs at the top level of the frontmatter, not under metadata:`);
  }
  const context = fmScalar(front, "context");
  if (context !== null && context !== "fork") errors.push(`${id}: context '${context}' — the only documented value is 'fork'`);
  if (fmScalar(front, "agent") !== null && context !== "fork") warnings.push(`${id}: 'agent' is ignored without 'context: fork'`);
  if (context === "fork" && fmScalar(front, "agent") === null) warnings.push(`${id}: context: fork without agent: — Claude Code will use the default subagent, not Explore`);
  for (const key of BOOL_KEYS) {
    const v = fmScalar(front, key);
    if (v !== null && v !== "true" && v !== "false") errors.push(`${id}: ${key} must be true or false (got '${v}')`);
  }
  const model = fmScalar(front, "model");
  if (model !== null && /^claude-/i.test(model)) warnings.push(`${id}: model '${model}' pins a full model ID — use opus/sonnet/haiku/inherit so the pin does not rot`);
  const whenToUse = fmScalar(front, "when_to_use");
  if (whenToUse !== null && desc && desc.length + whenToUse.length > CLAUDE_CODE_CAP) {
    errors.push(`${id}: description + when_to_use ${desc.length + whenToUse.length} chars > ${CLAUDE_CODE_CAP} (Claude Code cap)`);
  }
  if (agent) {
    for (const [key, allowed] of Object.entries(AGENT_ENUMS)) {
      const v = fmScalar(front, key);
      if (v !== null && !allowed.has(v)) errors.push(`${id}: ${key} '${v}' not one of ${[...allowed].join("/")}`);
    }
    const maxTurns = fmScalar(front, "maxTurns");
    if (maxTurns !== null && !/^\d+$/.test(maxTurns)) errors.push(`${id}: maxTurns must be an integer`);
  }
}

// `metadata.chain` (ADR-0014): the skills a workflow runs, in order, as one
// quoted string of space-separated slugs. The spec allows only string values
// under `metadata`, and Mushi's skill-sync reads it to build a pipeline, so a
// stale slug silently drops a step there.
const SKILL_DIRS = new Set(
  readdirSync(join(repoRoot, "skills")).filter((d) => statSync(join(repoRoot, "skills", d)).isDirectory()),
);
function checkChain(id, dir, front) {
  const lines = front.split("\n");
  const start = lines.findIndex((l) => /^metadata:/.test(l));
  if (start === -1) return;
  for (let j = start + 1; j < lines.length && /^\s+\S/.test(lines[j]); j++) {
    const m = lines[j].match(/^\s+chain:[ \t]*(.*)$/);
    if (!m) continue;
    const value = m[1].trim();
    if (!/^"[^"]*"$/.test(value)) {
      errors.push(`${id}: metadata.chain must be one double-quoted string of space-separated slugs (got ${value || "nothing"})`);
      return;
    }
    const slugs = value.slice(1, -1).trim().split(/\s+/).filter(Boolean);
    if (!slugs.length) errors.push(`${id}: metadata.chain is empty — remove it instead`);
    const seen = new Set();
    for (const slug of slugs) {
      if (slug === dir) errors.push(`${id}: metadata.chain lists the skill itself`);
      else if (!SKILL_DIRS.has(slug)) errors.push(`${id}: metadata.chain slug '${slug}' is not a directory under skills/`);
      if (seen.has(slug)) errors.push(`${id}: metadata.chain repeats '${slug}'`);
      seen.add(slug);
    }
  }
}

/** Extract the YAML frontmatter description value, folded to a single line. */
function readDescription(front) {
  const lines = front.split("\n");
  const start = lines.findIndex((l) => /^description:/.test(l));
  if (start === -1) return null;

  const buf = [];
  // Inline value on the `description:` line (skip a lone block-scalar indicator > or |).
  const head = lines[start].slice("description:".length).trim();
  if (head && !/^[>|][-+0-9]*$/.test(head)) buf.push(head);
  // Continuation lines run until the next top-level `key:` (column 0, unindented).
  for (let j = start + 1; j < lines.length; j++) {
    if (/^[A-Za-z0-9_-]+:/.test(lines[j])) break;
    buf.push(lines[j].trim());
  }
  return buf.join(" ").replace(/\s+/g, " ").replace(/^["']|["']$/g, "").trim();
}

for (const group of groups) {
  const base = join(repoRoot, group);
  if (!existsSync(base)) continue;

  for (const dir of readdirSync(base)) {
    const dirPath = join(base, dir);
    if (!statSync(dirPath).isDirectory()) continue;
    const skillFile = join(dirPath, "SKILL.md");
    const id = `${group}/${dir}`;

    if (!existsSync(skillFile)) {
      errors.push(`${id}: missing SKILL.md`);
      continue;
    }
    total++;

    const raw = readFileSync(skillFile, "utf8").replace(/\r\n/g, "\n");
    const fm = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!fm) {
      errors.push(`${id}: no YAML frontmatter (must start with --- ... ---)`);
      continue;
    }
    const front = fm[1];
    const body = fm[2] || "";

    // name
    const nameMatch = front.match(/^name:\s*(.+)$/m);
    const name = nameMatch ? nameMatch[1].trim().replace(/^["']|["']$/g, "") : null;
    if (!name) {
      errors.push(`${id}: missing 'name' field`);
    } else {
      if (name !== dir) errors.push(`${id}: name '${name}' != directory '${dir}'`);
      if (name.length > 64) errors.push(`${id}: name > 64 chars (${name.length})`);
      if (!NAME_RE.test(name))
        errors.push(`${id}: name '${name}' must be lowercase a-z/0-9/-, no leading/trailing or double hyphen`);
    }

    // description
    const desc = readDescription(front);
    if (!desc) {
      errors.push(`${id}: missing or empty 'description'`);
    } else {
      if (desc.length > DESC_MAX) {
        errors.push(`${id}: description ${desc.length} chars > ${DESC_MAX} (house max)`);
      } else if (desc.length >= DESC_HEADROOM_WARN) {
        warnings.push(
          `${id}: description ${desc.length} chars leaves < ${DESC_MAX - DESC_HEADROOM_WARN + 1} chars headroom`,
        );
      }
      const doubleQuotes = [...desc].filter((char) => char === '"').length;
      if (doubleQuotes % 2 !== 0) {
        errors.push(`${id}: description has an unmatched double quote (likely truncated trigger)`);
      }
      if (/→\./.test(desc)) {
        errors.push(`${id}: description contains truncated handoff '→.'`);
      }
      const opens = [...desc].filter((char) => char === "(").length;
      const closes = [...desc].filter((char) => char === ")").length;
      if (opens !== closes) {
        errors.push(`${id}: description has unmatched parentheses (likely truncated)`);
      }
      if (/\bi\.e\.\s*$/.test(desc)) {
        errors.push(`${id}: description ends in 'i.e.' (truncated)`);
      }
    }

    checkRoutingKeys(id, front, desc);
    checkChain(id, dir, front);
    if (desc && fmScalar(front, "disable-model-invocation") !== "true") listing[group] += listingEntry(dir, desc, front);

    // body length (warning only)
    const lines = body.split("\n").length;
    if (lines > BODY_WARN) {
      warnings.push(`${id}: SKILL.md body ${lines} lines > ${BODY_WARN} (consider references/)`);
    }

    // First-party families on the prompt-enhancement require-list must
    // carry T1 + T3 + T4. Extend only after that family is upgraded.
    // thirdparty-* is excluded.
    if (
      group === "skills" &&
      /^(audit|plan|test|housekeep|deploy|debug|docs|meta|protocol|iterate|backend|design|enhance|workflow|mobile|data|mushi)-/.test(dir) &&
      !dir.startsWith("thirdparty-")
    ) {
      if (!/\bDegree of freedom\b/i.test(body)) {
        errors.push(`${id}: missing T1 "Degree of freedom" declaration`);
      }
      if (!/^## Worked example\b/m.test(body)) {
        errors.push(`${id}: missing T3 "## Worked example" heading`);
      }
      if (!/^## Self-critique\b/m.test(body)) {
        errors.push(`${id}: missing T4 "## Self-critique" heading`);
      }
    }
  }
}

// ---- Command-name collisions with host built-ins ----
// A file name becomes a slash command on every target:
//   commands/<x>.md          → /<x> in Cursor and Claude Code (Claude merges
//                              commands into the skill namespace)
//   commands-portable/<x>.md → ~/.gemini/commands/<x>.toml → /<x> in Gemini CLI,
//                              and ~/.codex/prompts/<x>.md for Codex
// A name that matches a host built-in ships as a duplicate entry, or silently
// overrides the host's own command. Reserve every documented built-in so a
// collision fails CI (1.8.3 renamed /mcp, /review, /debug; 2026-09-22 renamed
// /plan, which had become a built-in in three of the four hosts).
//
// Snapshot 2026-09-22 — primary names and documented aliases from:
//   https://code.claude.com/docs/en/commands
//   https://cursor.com/docs/cli/reference/slash-commands
//   https://geminicli.com/docs/reference/commands/
// Names since dropped from those tables (migrate-installer, todos) stay
// reserved so an older host does not regress.
const RESERVED_COMMANDS = new Set([
  "about", "add-dir", "advisor", "agents", "android", "app", "artifacts", "ask",
  "auth", "auto-mode-setup", "auto-run", "autocompact", "autofix-pr", "background",
  "bashes", "batch", "bedrock", "bg", "branch", "btw", "bug", "cd", "chat",
  "checkpoint", "checkup", "chrome", "claude-api", "clear", "code-review", "color",
  "commands", "compact", "compress", "config", "context", "continue", "copy",
  "copy-conversation-id", "copy-request-id", "cost", "cursor", "dataviz", "debug",
  "deep-research", "design", "design-login", "design-sync", "desktop", "diff",
  "dir", "directory", "docs", "doctor", "editor", "effort", "exit", "export",
  "extensions", "fast", "feedback", "fewer-permission-prompts", "focus", "fork",
  "goal", "heapdump", "help", "hooks", "ide", "import", "init", "insights",
  "install-github-app", "install-slack-app", "ios", "keybindings", "line-numbers",
  "list-agents", "login", "logout", "logs", "loop", "max-mode", "mcp", "memory",
  "migrate-installer", "mobile", "model", "new", "new-chat", "newchat", "open",
  "output-style", "passes", "permissions", "plan", "plugin", "policies", "powerup",
  "pr-comments", "privacy", "privacy-settings", "proactive", "quit", "radio",
  "rate-limit-options", "rc", "recap", "release-notes", "reload-plugins",
  "reload-skills", "remote-control", "remote-env", "rename", "reset", "restore",
  "resume", "review", "rewind", "routines", "run", "run-everything",
  "run-skill-generator", "sandbox", "schedule", "scroll-speed", "security-review",
  "settings", "setup-bedrock", "setup-github", "setup-terminal", "setup-vertex",
  "sh", "share", "shell", "shells", "show-thinking", "simplify", "skill-doctor",
  "skills", "stats", "status", "status-indicators", "statusline", "stickers",
  "stop", "subtask", "summarize", "tasks", "team-onboarding", "teleport",
  "terminal-setup", "theme", "todos", "tools", "tui", "ultraplan", "ultrareview",
  "undo", "update", "update-config", "upgrade", "usage", "usage-credits", "verify",
  "vim", "voice", "web-setup", "workflow-authoring", "workflows",
]);
const commandNames = [];
for (const group of ["commands", "commands-portable"]) {
  const dir = join(repoRoot, group);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md") || f === "README.md") continue;
    const cmd = f.slice(0, -3);
    if (group === "commands") commandNames.push(cmd);
    if (RESERVED_COMMANDS.has(cmd)) {
      errors.push(
        `${group}/${f}: '/${cmd}' collides with a built-in in Cursor, Claude Code, Codex, or Gemini CLI — rename it (e.g. /${cmd}-guide)`,
      );
    }
  }
}

// Same-name skill + command is intentional for a small allowlist (thin
// /slash wrapper → skill). Cursor and Claude both slash-invoke skills, so
// a new undeclared pair ships as two /entries. Fail CI instead of drifting.
const INTENTIONAL_SKILL_COMMAND_PAIRS = new Set([
  "burndown-full",
  "complete-everything",
  "handoff",
  "housekeep-backlog",
  "housekeep-files",
  "housekeep-gates",
  "research",
  "test-mutation",
  "thirdparty-web-interface-guidelines",
]);
const skillNames = new Set();
for (const group of groups) {
  const base = join(repoRoot, group);
  if (!existsSync(base)) continue;
  for (const dir of readdirSync(base)) {
    if (statSync(join(base, dir)).isDirectory()) skillNames.add(dir);
  }
}
for (const cmd of commandNames) {
  if (skillNames.has(cmd) && !INTENTIONAL_SKILL_COMMAND_PAIRS.has(cmd)) {
    errors.push(
      `commands/${cmd}.md: undeclared dual name with skills/${cmd} — add it to INTENTIONAL_SKILL_COMMAND_PAIRS or rename one side`,
    );
  }
}
for (const name of INTENTIONAL_SKILL_COMMAND_PAIRS) {
  if (!skillNames.has(name) || !commandNames.includes(name)) {
    errors.push(
      `INTENTIONAL_SKILL_COMMAND_PAIRS contains '${name}' but that pair is no longer on disk — remove it from the allowlist`,
    );
  }
}

// ---- Agents and commands: same routing keys; commands are `/`-only (ADR-0008) ----
function listCommandFiles(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...listCommandFiles(p));
    else if (f.endsWith(".md") && f !== "README.md") out.push(p);
  }
  return out;
}
{
  const agentsDir = join(repoRoot, "agents");
  for (const f of existsSync(agentsDir) ? readdirSync(agentsDir) : []) {
    if (!f.endsWith(".md") || f === "README.md") continue;
    const rel = `agents/${f}`;
    const front = frontmatterOf(readFileSync(join(agentsDir, f), "utf8"));
    if (!front) { errors.push(`${rel}: no YAML frontmatter`); continue; }
    const desc = readDescription(front);
    if (!desc) errors.push(`${rel}: missing 'description'`);
    checkRoutingKeys(rel, front, desc, { agent: true });
    // Agents are described in the Agent tool, not the skill listing.
    if (desc) agentDescChars += desc.length;
  }
  const commandsDir = join(repoRoot, "commands");
  for (const file of existsSync(commandsDir) ? listCommandFiles(commandsDir) : []) {
    const rel = `commands/${file.slice(commandsDir.length + 1).replace(/\\/g, "/")}`;
    const topLevel = !rel.slice("commands/".length).includes("/");
    const front = frontmatterOf(readFileSync(file, "utf8"));
    if (!front) { errors.push(`${rel}: no YAML frontmatter`); continue; }
    const desc = readDescription(front);
    if (!desc) errors.push(`${rel}: missing 'description'`);
    checkRoutingKeys(rel, front, desc);
    const dmi = fmScalar(front, "disable-model-invocation");
    const name = rel.replace(/^commands\//, "").replace(/\.md$/, "");
    if (topLevel && dmi !== "true" && !MODEL_INVOCABLE_COMMANDS.has(name)) {
      errors.push(`${rel}: add \`disable-model-invocation: true\` — commands are the / surface and the skill twin carries the auto-route (ADR-0008); list it in MODEL_INVOCABLE_COMMANDS only if the model must invoke it`);
    }
    if (topLevel && desc && dmi !== "true") listing.commands += listingEntry(name, desc, front);
  }
  const portableDir = join(repoRoot, "commands-portable");
  for (const file of existsSync(portableDir) ? listCommandFiles(portableDir) : []) {
    const rel = `commands-portable/${file.slice(portableDir.length + 1).replace(/\\/g, "/")}`;
    const front = frontmatterOf(readFileSync(file, "utf8")) || "";
    for (const key of ["effort", "disable-model-invocation", "user-invocable", "context", "agent"]) {
      if (fmScalar(front, key) !== null) errors.push(`${rel}: Claude-only key '${key}' in portable frontmatter (install.mjs strips it — dead text)`);
    }
  }
}
// ---- Shipped PowerShell must survive Windows PowerShell 5.1 ----
// 5.1 decodes a BOM-less script with the ANSI code page: on cp1252 a UTF-8 em
// dash yields a curly quote that ends the string (parse error); on cp932 a CJK
// literal turns into mojibake and a pattern silently stops matching.
{
  const walk = (dir) => {
    const out = [];
    for (const f of existsSync(dir) ? readdirSync(dir) : []) {
      const p = join(dir, f);
      if (f === "node_modules" || f === ".git") continue;
      if (statSync(p).isDirectory()) out.push(...walk(p));
      else if (/\.ps(m|d)?1$/i.test(f)) out.push(p);
    }
    return out;
  };
  for (const base of ["skills", "skills-cursor", "hooks", "bin", "scripts", "commands", "rules"]) {
    for (const file of walk(join(repoRoot, base))) {
      const bytes = readFileSync(file);
      const bom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
      const at = bytes.findIndex((b) => b > 0x7f);
      if (at !== -1 && !bom) {
        const rel = file.slice(repoRoot.length + 1).replace(/\\/g, "/");
        const line = bytes.subarray(0, at).toString("latin1").split("\n").length;
        errors.push(`${rel}:${line}: non-ASCII byte in a BOM-less PowerShell script — Windows PowerShell 5.1 reads it as the ANSI code page; write it as ASCII (regex \\uXXXX for CJK)`);
      }
    }
  }
}

const listingTotal =
  Object.values(listing).reduce((a, b) => a + b, 0) + Math.max(0, listingEntries - 1);
const listingLine = Object.entries(listing).map(([k, v]) => `${k} ${v}`).join(", ");
if (listingTotal > LISTING_MAX_CHARS) {
  errors.push(`skill listing: ${listingTotal} chars > ${LISTING_MAX_CHARS} (${listingLine}) — shorten descriptions or flip user-only rituals to disable-model-invocation: true; never raise the cap (ADR-0010)`);
}

if (asJson) {
  console.log(JSON.stringify({ total, errors, warnings, listing, listingTotal, listingEntries, agentDescChars }, null, 2));
} else {
  for (const w of warnings) console.warn(`⚠ ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(`\n✗ ${errors.length} error(s) (validated ${total} skills, plus command and listing checks).`);
  } else {
    console.log(`✓ All ${total} skills valid against the Agent Skills spec` +
      (warnings.length ? ` (${warnings.length} warning(s)).` : ".") +
      ` Skill listing: ${listingTotal} chars, ${listingEntries} entries (ratchet ${LISTING_MAX_CHARS};` +
      ` Claude Code's default budget on a 1M Opus 5.5 session is ${LISTING_DEFAULT_BUDGET_CHARS}, shared with built-ins);` +
      ` agents ${agentDescChars} chars.`);
  }
}

process.exit(errors.length ? 1 : 0);
