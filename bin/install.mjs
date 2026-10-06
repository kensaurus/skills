#!/usr/bin/env node
/**
 * kenji installer
 *
 * Usage:
 *   npx @kensaurus/skills                  Merge-install into ~/.cursor/ AND ~/.agents/skills/
 *   npx @kensaurus/skills --auto           Detect installed tools and install to each
 *   npx @kensaurus/skills --claude         Install for Claude Code (~/.claude/) instead
 *   npx @kensaurus/skills --codex          Install for Codex CLI (~/.codex/AGENTS.md + prompts)
 *   npx @kensaurus/skills --gemini         Install for Gemini CLI (~/.gemini/GEMINI.md + commands)
 *   npx @kensaurus/skills --all            Install for all four supported tools
 *   npx @kensaurus/skills --clean          Mirror: make target paths match this repo exactly
 *   npx @kensaurus/skills --only skills     Install only some groups (csv)
 *   npx @kensaurus/skills --skill audit-ux  Install a single skill
 *   npx @kensaurus/skills --link           Dev mode: symlink instead of copy
 *   npx @kensaurus/skills --restore [stamp] Restore a previous --clean backup
 *   npx @kensaurus/skills --dry-run        Preview without changing anything
 *   npx @kensaurus/skills --verify         Hash-check dests against this package (no writes)
 *   npx @kensaurus/skills --help
 *
 * Why two Cursor paths?
 *   ~/.cursor/skills/   — read by the Cursor agent at runtime
 *   ~/.agents/skills/   — historically indexed by the Cursor Skills UI panel
 *   Default still mirrors both. Pass --no-agents-mirror to skip the UI copy.
 *   skills-cursor names that Cursor already ships as managed builtins are not
 *   copied into ~/.cursor/skills (Claude still gets the portable copies).
 *   RENAMED_SKILLS prunes old skill directories after a rename so existing
 *   installs do not keep two near-identical copies. Honors --dry-run; skipped
 *   when --skill is scoped. RENAMED_RULES does the same for renamed rule files.
 *
 * Claude Code paths:
 *   ~/.claude/skills/    — global skills, appear as /slash-commands
 *   ~/.claude/commands/  — custom slash commands
 *   ~/.claude/agents/    — subagent definitions
 *   ~/.claude/rules/     — rules (.mdc sources installed as .md)
 *   ~/.claude/settings.json — merged completion Stop hook (same script as Cursor)
 */

import {
  existsSync, mkdirSync, cpSync as cpSyncOnce, rmSync as rmSyncOnce, symlinkSync,
  readdirSync, statSync, readFileSync, writeFileSync as writeFileSyncOnce,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve, dirname } from 'node:path';
import { homedir, platform } from 'node:os';
import { fileURLToPath } from 'node:url';

// ---- transient Windows file locks -----------------------------------------
// An open editor watching ~/.cursor or ~/.claude, or an antivirus scan, can
// hold a file for a moment right after it is written. Windows then fails the
// next copy over it with EPERM or EBUSY, and one held file used to abort the
// run with the target half-copied. Retry the same codes graceful-fs retries on
// Windows, with a bounded backoff (about 2.75 s per file). symlinkSync stays
// unwrapped: its EPERM means "no symlink privilege" and place() must fall back
// to a copy at once.
const LOCK_CODES = new Set(['EPERM', 'EBUSY', 'EACCES']);
const LOCK_RETRIES = 10;
const sleepSync = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function retryLocked(fn) {
  if (platform() !== 'win32') return fn;
  return (...args) => {
    for (let attempt = 1; ; attempt++) {
      try {
        return fn(...args);
      } catch (err) {
        if (!LOCK_CODES.has(err.code)) throw err;
        if (attempt > LOCK_RETRIES) {
          console.error(`\n  ${err.code}: another program is holding ${err.dest ?? err.path ?? 'a destination file'}.`);
          console.error('  Usually an open editor (Cursor, VS Code) or an antivirus scan. Close it and run the installer again.\n');
          throw err;
        }
        sleepSync(50 * attempt);
      }
    }
  };
}
const cpSync = retryLocked(cpSyncOnce);
const rmSync = retryLocked(rmSyncOnce);
const writeFileSync = retryLocked(writeFileSyncOnce);

const __dir = fileURLToPath(new URL('..', import.meta.url));
const argv = process.argv.slice(2);

// ---- tiny arg parser (supports `--flag`, `--key value`, `--key=value`) ----
const flags = new Set();
const opts = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith('--')) continue;
  const [k, inlineVal] = a.slice(2).split('=');
  if (inlineVal !== undefined) { opts[k] = inlineVal; continue; }
  const next = argv[i + 1];
  if (next && !next.startsWith('--')) { opts[k] = next; i++; } else { flags.add(k); }
}
const has = (...names) => names.some((n) => flags.has(n) || n in opts);

if (has('help', 'h')) {
  console.log(`
kenji installer

Usage:
  npx @kensaurus/skills                   Merge-install into ~/.cursor/ + ~/.agents/skills/
  npx @kensaurus/skills --auto            Detect installed tools and install to each
  npx @kensaurus/skills --claude          Install for Claude Code (~/.claude/) instead
  npx @kensaurus/skills --codex           Install for Codex CLI (~/.codex/AGENTS.md)
  npx @kensaurus/skills --gemini          Install for Gemini CLI (~/.gemini/GEMINI.md)
  npx @kensaurus/skills --all             Install for all four supported tools
  npx @kensaurus/skills --clean           Mirror: wipe and rebuild target paths from this repo
  npx @kensaurus/skills --only skills      Install only some groups (skills,commands,agents,rules,hooks)
  npx @kensaurus/skills --skill <name>     Install one skill by name
  npx @kensaurus/skills --link            Dev mode: symlink repo into ~/.cursor (live edits)
  npx @kensaurus/skills --restore [stamp]  Restore a previous --clean backup (latest if omitted)
  npx @kensaurus/skills --dry-run         Preview without changing anything
  npx @kensaurus/skills --verify          Hash-check dests against this package (no writes)

Flags:
  --auto              Detect installed tools (~/.cursor, ~/.claude, ~/.codex, ~/.gemini) and
                      install to each; falls back to Cursor if none are found.
  --cursor            Target Cursor explicitly (same as the bare default).
  --claude            Target Claude Code (~/.claude/) instead of Cursor.
  --codex             Target Codex CLI — merged rules → ~/.codex/AGENTS.md + prompt ports.
  --gemini            Target Gemini CLI — merged rules → ~/.gemini/GEMINI.md + command ports.
  --all               Target all four supported tools in one run.
  --clean, --mirror   Wipe managed dirs first so target paths exactly mirror this repo.
  --no-backup         Skip the timestamped backup taken before a --clean wipe.
  --only <csv>        Limit to a subset of: skills, commands, agents, rules, hooks.
  --skill <name>      Install a single skill (implies --only skills).
  --link              Symlink (junction on Windows) instead of copying — for repo dev.
  --restore [stamp]   Copy a backup under <target>/.kenji-backups/ back into place.
  --typecheck-hook [script]
                      Run from a repo root: add a background typecheck Stop hook
                      (asyncRewake) to ./.claude/settings.json. Script defaults to
                      typecheck or type-check. See skill audit-agent-speed.
  --dry-run           Show what would happen; make no changes.
  --verify            Read-only: fail if any packaged file is missing or
                      hash-mismatched at the destination (merge-compatible:
                      extra personal files are allowed).
  --quiet             Suppress install logs (errors still print).
  --no-agents-mirror  Skip copying skills to ~/.agents/skills.

What gets installed (Cursor):
  ~/.cursor/skills/       ← agent skills at runtime (skills/ + non-builtin skills-cursor/)
  ~/.agents/skills/       ← optional Skills UI mirror (same content; skip with --no-agents-mirror)
  ~/.cursor/commands/     ← slash commands
  ~/.cursor/agents/       ← subagent definitions
  ~/.cursor/rules/        ← project rules starter pack
  ~/.cursor/hooks.json    ← merged completion stop hook (preserves existing hooks)
  ~/.cursor/mcp.json      ← MCP server template (only if missing; never overwritten)

What gets installed (Claude Code, with --claude or --all):
  ~/.claude/skills/       ← global skills (appear as /slash-commands)
  ~/.claude/commands/     ← custom slash commands
  ~/.claude/agents/       ← subagent definitions
  ~/.claude/rules/        ← rules (.mdc installed as .md)
  ~/.claude/settings.json ← merged completion Stop hook (preserves existing hooks)

What gets installed (Codex CLI / Gemini CLI — no skills system):
  ~/.codex/AGENTS.md      ← rules merged into one context file (auto-loaded)
  ~/.codex/prompts/       ← portable commands as custom prompts (plan, research, fix-issue)
  ~/.gemini/GEMINI.md     ← rules merged into one context file (auto-loaded)
  ~/.gemini/commands/     ← portable commands as TOML commands
  These tools have no skills loader, so skills/agents are not written there.
  Existing AGENTS.md/GEMINI.md is backed up (.bak-<stamp>) before an update.
  `.trim());
  process.exit(0);
}

if (has('quiet', 'q')) {
  console.log = () => {};
}

const isDryRun = has('dry-run');
const isVerifyOnly = has('verify');
const isClean = has('clean', 'mirror', 'force');
const noBackup = has('no-backup');
const useLink = has('link');
const noAgentsMirror = has('no-agents-mirror');
const verifyFailures = [];

/** Cursor already ships these as managed builtins. Do not copy into
 *  ~/.cursor/skills — a same-name user copy shadows the builtin and
 *  shows up twice in the `/` picker. Claude still gets portable copies. */
const CURSOR_MANAGED_BUILTIN_SKILLS = new Set([
  'babysit',
  'canvas',
  'create-hook',
  'create-rule',
  'create-skill',
  'create-subagent',
  'migrate-to-skills',
  'shell',
  'split-to-prs',
  'statusline',
  'update-cli-config',
  'update-cursor-settings',
]);

/** Old skill directory → new skill directory. Empty until a rename ships.
 *  Tests may inject pairs via KENJI_RENAMED_SKILLS=old:new,old2:new2. */
const RENAMED_SKILLS = {
  'domain-modeling': 'docs-domain-modeling',
  'grilling': 'workflow-grilling',
};

function renamedSkillMap() {
  const map = { ...RENAMED_SKILLS };
  const extra = process.env.KENJI_RENAMED_SKILLS;
  if (!extra) return map;
  for (const pair of extra.split(',')) {
    const [oldName, newName] = pair.split(':').map((s) => s.trim());
    if (oldName && newName) map[oldName] = newName;
  }
  return map;
}

function shouldPruneRenamedSkills() {
  if (skillName) return false;
  if (onlyGroups && !onlyGroups.has('skills')) return false;
  return true;
}

function pruneRenamedSkills(skillsDest, label) {
  if (!shouldPruneRenamedSkills() || !skillsDest) return;
  const map = renamedSkillMap();
  for (const [oldName, newName] of Object.entries(map)) {
    const stale = join(skillsDest, oldName);
    if (!existsSync(stale)) continue;
    if (isDryRun) {
      console.log(`  [dry-run] prune renamed ${label} skill ${oldName} → ${newName}`);
      continue;
    }
    rmSync(stale, { recursive: true, force: true });
  }
}

/** Old rule file → new rule file. Pruned in ~/.cursor/rules (.mdc) and
 *  ~/.claude/rules (.md) on merge installs, mirroring RENAMED_SKILLS. */
const RENAMED_RULES = {
  'composer-2.5-execution.mdc': 'approved-plan-execution.mdc',
};

function pruneRenamedRules(rulesDest, label, { renameMdc = false } = {}) {
  if (skillName || (onlyGroups && !onlyGroups.has('rules')) || !rulesDest) return;
  for (const [oldName, newName] of Object.entries(RENAMED_RULES)) {
    const file = renameMdc ? oldName.replace(/\.mdc$/, '.md') : oldName;
    const stale = join(rulesDest, file);
    if (!existsSync(stale)) continue;
    if (isDryRun) { console.log(`  [dry-run] prune renamed ${label} rule ${file} → ${newName}`); continue; }
    rmSync(stale, { force: true });
  }
}

/** Old command file → new name. A stale copy is pruned only while it still
 *  carries a description this pack shipped, so a user's own file of the same
 *  name stays. */
const RENAMED_COMMANDS = {
  'plan.md': {
    to: 'plan-mode.md',
    descriptions: [
      'Research, clarify requirements, and produce an approved implementation plan before writing code (Cursor Plan Mode)',
    ],
  },
};

// Merge installs never delete, so leftovers from older releases stay unless
// pruned: renamed commands, and per-project command bundles that older
// installers copied into the global commands dir (where they register as
// /<bundle>:<name> in every project). Only files this pack ships are removed.
function pruneStaleCommands(commandsDest, label) {
  if (skillName || (onlyGroups && !onlyGroups.has('commands')) || !commandsDest || !existsSync(commandsDest)) return;
  for (const [oldName, { to, descriptions }] of Object.entries(RENAMED_COMMANDS)) {
    const stale = join(commandsDest, oldName);
    if (!existsSync(stale)) continue;
    const { description } = parseFrontmatter(readFileSync(stale, 'utf8'));
    if (!descriptions.includes(description)) continue;
    if (isDryRun) { console.log(`  [dry-run] prune renamed ${label} command ${oldName} → ${to}`); continue; }
    rmSync(stale, { force: true });
  }
  for (const bundle of PROJECT_RULE_BUNDLES) {
    const src = resolve(__dir, 'commands', bundle);
    const dest = join(commandsDest, bundle);
    if (!existsSync(src) || !existsSync(dest) || !statSync(dest).isDirectory()) continue;
    for (const f of readdirSync(src)) {
      const p = join(dest, f);
      if (!existsSync(p)) continue;
      if (isDryRun) { console.log(`  [dry-run] prune per-project ${label} command ${bundle}/${f}`); continue; }
      rmSync(p, { force: true });
    }
    if (!isDryRun && readdirSync(dest).length === 0) rmSync(dest, { recursive: true, force: true });
  }
}

// ---- target resolution -----------------------------------------------------
// Backward compatible: a bare invocation still installs Cursor only.
//   --auto           detect installed tools (~/.cursor, ~/.claude, ~/.codex, ~/.gemini)
//                    and install to each; falls back to Cursor if none are found.
//   --all            force all four supported targets, installed or not.
//   --cursor/--claude/--codex/--gemini   explicit target(s); combine freely.
const codexBase = join(homedir(), '.codex');    // Codex CLI reads ~/.codex/AGENTS.md
const geminiBase = join(homedir(), '.gemini');  // Gemini CLI reads ~/.gemini/GEMINI.md
const cursorBase = join(homedir(), '.cursor');
const agentsBase = join(homedir(), '.agents');   // Cursor Skills UI reads ~/.agents/skills/
const claudeBase = join(homedir(), '.claude');

const explicitTargets = ['cursor', 'claude', 'codex', 'gemini'].filter((t) => has(t));
let targets;
if (has('all')) {
  targets = new Set(['cursor', 'claude', 'codex', 'gemini']);
} else if (has('auto')) {
  targets = detectTools();
  if (targets.size === 0) targets = new Set(['cursor']);
} else if (explicitTargets.length) {
  targets = new Set(explicitTargets);
} else {
  targets = new Set(['cursor']); // backward-compatible default
}
const wantCursor = targets.has('cursor');
const wantClaude = targets.has('claude');
const wantCodex = targets.has('codex');
const wantGemini = targets.has('gemini');

if (has('auto')) {
  console.log(`Auto-detected targets: ${[...targets].join(', ') || '(none — defaulting to Cursor)'}`);
}

const ALL_DIRS = [
  { src: 'skills',        dest: 'skills'   },
  { src: 'skills-cursor', dest: 'skills'   },  // merge cursor-specific skills
  { src: 'commands',      dest: 'commands' },
  { src: 'agents',        dest: 'agents'   },
  { src: 'rules',         dest: 'rules'    },
];

// Per-project bundles: copied into a specific repo's .cursor/rules and
// .cursor/commands by the user (see each bundle's README), never into the
// global dirs — their always/glob rules would fire in every project, and a
// global commands copy registers the bundle's README.md as /<bundle>:README.
const PROJECT_RULE_BUNDLES = new Set(['native-rn-monorepo', 'project-starter']);

// Installed folder names. Releases before 2.0.0 shipped as cursor-kenji and
// used the legacy names; installs migrate them (ADR-0013).
const HOOK_DIR = 'kenji-hooks';
const LEGACY_HOOK_DIR = 'cursor-kenji-hooks';
const BACKUPS_DIR = '.kenji-backups';
const LEGACY_BACKUPS_DIR = '.cursor-kenji-backups';
// Matches the managed completion-gate entry under either folder name.
const MANAGED_GATE = /(?:cursor-)?kenji-hooks[\\/]completion-gate\.mjs/;

// ---- typecheck-hook mode: per-repo background typecheck (audit-agent-speed) --
// Writes into the current repo only, never a global config: a global Stop hook
// would run in every repo, including ones without the script.
if (has('typecheck-hook')) {
  const repo = process.cwd();
  const pkgPath = join(repo, 'package.json');
  if (!existsSync(join(repo, '.git')) || !existsSync(pkgPath)) {
    console.error('--typecheck-hook: run it from a repo root that has .git and package.json.');
    process.exit(1);
  }
  const scripts = JSON.parse(readFileSync(pkgPath, 'utf8')).scripts ?? {};
  const script = typeof opts['typecheck-hook'] === 'string'
    ? opts['typecheck-hook']
    : ['typecheck', 'type-check'].find((name) => name in scripts);
  if (!script || !(script in scripts)) {
    console.error(`--typecheck-hook: package.json has no ${script ? `"${script}"` : '"typecheck" or "type-check"'} script. Pass the name: --typecheck-hook <script>.`);
    process.exit(1);
  }

  const source = resolve(__dir, 'skills', 'audit-agent-speed', 'scripts', 'stop-typecheck.mjs');
  const destScript = join(repo, '.claude', 'hooks', 'stop-typecheck.mjs');
  const settingsPath = join(repo, '.claude', 'settings.json');
  let settings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
    } catch {
      console.error(`--typecheck-hook: ${settingsPath} is not valid JSON; nothing changed.`);
      process.exit(1);
    }
  }
  if (!settings.hooks || typeof settings.hooks !== 'object') settings.hooks = {};
  const managed = /stop-typecheck\.mjs/;
  const groups = (Array.isArray(settings.hooks.Stop) ? settings.hooks.Stop : [])
    .map((group) => ({ ...group, hooks: (group?.hooks ?? []).filter((h) => !managed.test(String(h?.command ?? ''))) }))
    .filter((group) => group.hooks.length > 0);
  const blocking = groups.flatMap((g) => g.hooks).filter((h) => !h.async && !h.asyncRewake && /typecheck|type-check|tsc\b/.test(String(h.command ?? '')));
  settings.hooks.Stop = [
    ...groups,
    { hooks: [{ type: 'command', command: `node "$CLAUDE_PROJECT_DIR/.claude/hooks/stop-typecheck.mjs" ${script}`, asyncRewake: true, timeout: 600 }] },
  ];

  if (isDryRun) {
    console.log(`  [dry-run] ${source} → ${destScript}`);
  } else {
    mkdirSync(dirname(destScript), { recursive: true });
    writeFileSync(destScript, readFileSync(source));
  }
  const status = writeManagedFile(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log(`${isDryRun ? '[dry-run] ' : '✓ '}Background typecheck Stop hook (${script}) → ${settingsPath} (${status})`);
  for (const h of blocking) {
    console.log(`  [!] A blocking typecheck Stop hook is still registered: ${h.command}\n      Remove it; the background hook replaces it.`);
  }
  process.exit(0);
}

// ---- restore mode ----------------------------------------------------------
if (has('restore')) {
  const restoreBase = wantClaude && !wantCursor ? claudeBase : cursorBase;
  const backupsRoot = [BACKUPS_DIR, LEGACY_BACKUPS_DIR]
    .map((dir) => join(restoreBase, dir))
    .find((dir) => existsSync(dir)) ?? join(restoreBase, BACKUPS_DIR);
  const stamp = typeof opts.restore === 'string'
    ? opts.restore
    : (existsSync(backupsRoot)
        ? readdirSync(backupsRoot).filter((n) => statSync(join(backupsRoot, n)).isDirectory()).sort().pop()
        : null);
  if (!stamp) { console.error('No backups found under ' + backupsRoot); process.exit(1); }
  const snap = join(backupsRoot, stamp);
  if (!existsSync(snap)) { console.error('Backup not found: ' + snap); process.exit(1); }

  let restored = 0;
  for (const dest of readdirSync(snap)) {
    const from = join(snap, dest);
    const to = join(restoreBase, dest);
    if (isDryRun) {
      console.log(`  [dry-run] restore ${from} → ${to}`);
    } else {
      rmSync(to, { recursive: true, force: true });
      cpSync(from, to, { recursive: true });
    }
    restored++;
  }
  console.log(`${isDryRun ? '[dry-run] ' : '✓ '}Restored ${restored} dir(s) from ${snap}`);
  process.exit(0);
}

// ---- selection (--only / --skill) ------------------------------------------
const skillName = typeof opts.skill === 'string' ? opts.skill : null;
let onlyGroups = null;
if (typeof opts.only === 'string') onlyGroups = new Set(opts.only.split(',').map((s) => s.trim()).filter(Boolean));
if (skillName) onlyGroups = new Set(['skills']);

const DIRS = ALL_DIRS.filter((d) => !onlyGroups || onlyGroups.has(d.dest));
const managedDests = [...new Set(DIRS.map((d) => d.dest))];

// Text files are hashed with line endings normalized: a Windows checkout with
// core.autocrlf=true carries CRLF while the npm tarball (built on Linux) is
// LF, and --verify must not report identical content as a mismatch.
const TEXT_EXT = /\.(md|mdc|mjs|js|cjs|ts|tsx|json|jsonc|txt|toml|ya?ml|sh|cmd|svg|css|html)$/i;
function fileHash(p) {
  const buf = readFileSync(p);
  const data = TEXT_EXT.test(p) ? buf.toString('utf8').replace(/\r\n/g, '\n') : buf;
  return createHash('sha256').update(data).digest('hex');
}

function walkRelFiles(root) {
  const out = [];
  const walk = (rel) => {
    const p = rel ? join(root, rel) : root;
    if (!existsSync(p)) return;
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const name of readdirSync(p).sort()) {
        walk(rel ? `${rel}/${name}` : name);
      }
      return;
    }
    out.push(rel.replace(/\\/g, '/'));
  };
  walk('');
  return out;
}

/** Source tree must be a subset of dest with matching file hashes. Extra dest files are allowed (merge). */
function treesMatch(src, dest) {
  if (!existsSync(dest)) return { ok: false, reason: 'missing destination' };
  const sDir = statSync(src).isDirectory();
  const dDir = statSync(dest).isDirectory();
  if (sDir !== dDir) return { ok: false, reason: 'file/directory type mismatch' };
  if (!sDir) {
    return fileHash(src) === fileHash(dest)
      ? { ok: true }
      : { ok: false, reason: 'content hash mismatch' };
  }
  for (const rel of walkRelFiles(src)) {
    const from = join(src, rel);
    const to = join(dest, rel);
    if (!existsSync(to)) return { ok: false, reason: `missing ${rel}` };
    if (statSync(to).isDirectory()) return { ok: false, reason: `${rel} is a directory at dest` };
    if (fileHash(from) !== fileHash(to)) return { ok: false, reason: `content hash mismatch in ${rel}` };
  }
  return { ok: true };
}

function listInstallItems({ renameMdc = false, skipCursorBuiltins = false } = {}) {
  const items = [];
  for (const { src, dest } of DIRS) {
    const srcPath = resolve(__dir, src);
    if (!existsSync(srcPath)) continue;
    for (const item of readdirSync(srcPath)) {
      if (skillName && item !== skillName) continue;
      if (
        skipCursorBuiltins &&
        src === 'skills-cursor' &&
        dest === 'skills' &&
        CURSOR_MANAGED_BUILTIN_SKILLS.has(item) &&
        item !== skillName
      ) {
        continue;
      }
      const itemSrc = join(srcPath, item);
      const isDir = statSync(itemSrc).isDirectory();
      if (isDir && PROJECT_RULE_BUNDLES.has(item) && (dest === 'rules' || dest === 'commands')) continue;
      if (!renameMdc && dest === 'rules' && !isDir && item.endsWith('.md')) continue;
      let outName = item;
      if (renameMdc && dest === 'rules' && !isDir && item.endsWith('.mdc')) {
        outName = item.slice(0, -4) + '.md';
      }
      items.push({ dest, outName, itemSrc, isDir });
    }
  }
  return items;
}

function recordVerify(src, dest, label) {
  const match = treesMatch(src, dest);
  if (!match.ok) verifyFailures.push(`${label}: ${match.reason}`);
  return match.ok;
}

function dualSkillCommandNames() {
  const skillNames = new Set();
  for (const group of ['skills', 'skills-cursor']) {
    const dir = resolve(__dir, group);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) skillNames.add(name);
  }
  const cmdDir = resolve(__dir, 'commands');
  if (!existsSync(cmdDir)) return [];
  return readdirSync(cmdDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.slice(0, -3))
    .filter((n) => skillNames.has(n))
    .sort();
}

function assertNoCursorBuiltins(skillsDir) {
  if (!existsSync(skillsDir)) return;
  for (const name of CURSOR_MANAGED_BUILTIN_SKILLS) {
    if (skillName && name === skillName) continue;
    if (existsSync(join(skillsDir, name))) {
      verifyFailures.push(`skills/${name}: Cursor-managed builtin still present (should be absent)`);
    }
  }
}

function verifyTarget(base, opts, label) {
  for (const it of listInstallItems(opts)) {
    recordVerify(it.itemSrc, join(base, it.dest, it.outName), `${label} ${it.dest}/${it.outName}`);
  }
  if (opts.skipCursorBuiltins) assertNoCursorBuiltins(join(base, 'skills'));
}

function failIfUnverified(context) {
  if (!verifyFailures.length) return;
  console.error(`✗ ${context} failed:`);
  for (const f of verifyFailures) console.error(`  - ${f}`);
  process.exit(1);
}

// ---- placement helper (copy or symlink) ------------------------------------
let linkFallbacks = 0;
function place(src, dest, isDir) {
  if (isDryRun) { console.log(`  [dry-run] ${useLink ? 'link' : 'copy'} ${src} → ${dest}`); return; }
  if (useLink) {
    rmSync(dest, { recursive: true, force: true });
    try {
      const type = isDir ? (platform() === 'win32' ? 'junction' : 'dir') : 'file';
      symlinkSync(src, dest, type);
    } catch {
      cpSync(src, dest, { recursive: true }); // file symlinks may need privileges on Windows
      linkFallbacks++;
    }
  } else {
    cpSync(src, dest, { recursive: true });
  }
  recordVerify(src, dest, dest);
}

// ---- mirror mode: back up, then wipe managed dirs under a target base ------
function backupAndWipe(base) {
  let wiped = 0;
  let backupRoot = null;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  backupRoot = join(base, BACKUPS_DIR, stamp);
  for (const dest of managedDests) {
    const p = join(base, dest);
    if (!existsSync(p)) continue;
    if (isDryRun) {
      console.log(`  [dry-run] backup ${p} → ${join(backupRoot, dest)}`);
      console.log(`  [dry-run] wipe   ${p}`);
    } else {
      if (!noBackup) { mkdirSync(backupRoot, { recursive: true }); cpSync(p, join(backupRoot, dest), { recursive: true }); }
      rmSync(p, { recursive: true, force: true });
    }
    wiped++;
  }
  return { wiped, backupRoot };
}

// ---- copy / link one target base -------------------------------------------
// renameMdc: Claude Code reads .md rules; .mdc sources are installed as .md.
function installDirs(base, opts = {}) {
  let copiedDirs = 0;
  let copiedFiles = 0;
  const ensured = new Set();
  for (const it of listInstallItems(opts)) {
    const destPath = join(base, it.dest);
    if (!isDryRun && !ensured.has(destPath)) {
      mkdirSync(destPath, { recursive: true });
      ensured.add(destPath);
    }
    place(it.itemSrc, join(destPath, it.outName), it.isDir);
    if (it.isDir) copiedDirs++; else copiedFiles++;
  }
  return { copiedDirs, copiedFiles };
}

// ============================================================================
// Codex CLI + Gemini CLI — tools with NO skills system.
// They read a single global context/instructions file, so we map:
//   rules/ (minus the skill-routing index) → one merged Markdown file
//   commands-portable/ → per-tool custom prompt/command files
// No SKILL.md dirs are written — nothing in these tools would load them.
// ============================================================================

// Detect installed tools by their home-dir config footprint.
function detectTools() {
  const found = new Set();
  if (existsSync(cursorBase)) found.add('cursor');
  if (existsSync(claudeBase)) found.add('claude');
  if (existsSync(codexBase)) found.add('codex');
  if (existsSync(geminiBase)) found.add('gemini');
  return found;
}

// Rules merged into the global context file. The skill-routing index is
// excluded — it points at skills these tools cannot load (would be dead text).
const RULES_EXCLUDE = new Set(['skill-workflows.mdc']);
const RULES_ORDER = [
  'senior-engineer.mdc',
  'full-stack-ship-discipline.mdc',
  'approved-plan-execution.mdc', // renamed from composer-2.5-execution.mdc
  'shell-first-search.mdc',      // was .md; now agent-requested in Cursor too
];

// Strip a leading `--- ... ---` YAML frontmatter block, returning the body.
function stripFrontmatter(text) {
  if (!text.startsWith('---')) return text;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return text;
  const after = text.indexOf('\n', end + 1);
  return text.slice(after + 1).replace(/^\s+/, '');
}

// Parse `description:` out of frontmatter and return { description, body }.
function parseFrontmatter(text) {
  let description = '';
  if (text.startsWith('---')) {
    const end = text.indexOf('\n---', 3);
    if (end !== -1) {
      const m = text.slice(3, end).match(/description:\s*"?(.*?)"?\s*$/m);
      if (m) description = m[1];
    }
  }
  return { description, body: stripFrontmatter(text) };
}

// Concatenate top-level rule files (non-recursive — skips project-starter/ etc.)
// into one deterministic Markdown document. No timestamp → regeneration is
// idempotent, so re-running the installer produces byte-identical output.
function buildMergedRules(toolLabel, loadPath) {
  const rulesDir = resolve(__dir, 'rules');
  for (const name of RULES_ORDER) {
    if (!existsSync(join(rulesDir, name))) {
      throw new Error(`RULES_ORDER names a missing rule: rules/${name} — update the list after a rename`);
    }
  }
  const files = readdirSync(rulesDir)
    .filter((f) => (f.endsWith('.md') || f.endsWith('.mdc'))
      && !RULES_EXCLUDE.has(f)
      && statSync(join(rulesDir, f)).isFile())
    .sort((a, b) => {
      const ia = RULES_ORDER.indexOf(a); const ib = RULES_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
    });
  const header = `<!-- Generated by kenji — https://github.com/kensaurus/skills
     Merged from rules/. The skill-routing index is omitted (this tool has no skills loader).
     Applies to: ${toolLabel} — loaded automatically from ${loadPath}.
     Regenerate: npx @kensaurus/skills --auto -->\n\n`;
  const body = files
    .map((f) => stripFrontmatter(readFileSync(join(rulesDir, f), 'utf8')).trim())
    .join('\n\n---\n\n');
  return header + body + '\n';
}

// Load the tool-agnostic portable commands (single source of truth).
function portableCommands() {
  const dir = resolve(__dir, 'commands-portable');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const { description, body } = parseFrontmatter(readFileSync(join(dir, f), 'utf8'));
      return { name: f.replace(/\.md$/, ''), description, body: body.trim() };
    });
}

// Wrap a portable command as a Gemini TOML command. Uses a literal ''' string
// so shell backslashes/quotes pass through verbatim; fails loud if the body
// would collide with the delimiter rather than silently corrupting output.
function toGeminiToml({ name, description, body }) {
  if (body.includes("'''")) {
    throw new Error(`portable command '${name}' contains ''' — cannot wrap as a TOML literal string`);
  }
  const desc = String(description).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `description = "${desc}"\n\nprompt = '''\n${body}\n'''\n`;
}

// Write a single managed file. Idempotent (skips identical content), backs up
// on overwrite unless --no-backup, and honours --dry-run.
function writeManagedFile(destPath, content) {
  if (isDryRun) { console.log(`  [dry-run] write ${destPath}`); return 'dry-run'; }
  mkdirSync(dirname(destPath), { recursive: true });
  if (existsSync(destPath)) {
    if (readFileSync(destPath, 'utf8') === content) return 'unchanged';
    if (!noBackup) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      cpSync(destPath, `${destPath}.bak-${stamp}`);
    }
    writeFileSync(destPath, content);
    return 'updated';
  }
  writeFileSync(destPath, content);
  return 'created';
}

// Install the opt-in completion gate as a user hook. The hook itself is inert
// unless the active workspace has an unfinished durable closure-state file.
// Existing user hooks are preserved and this managed entry is replaced
// idempotently on upgrades.
// The managed entry now points at HOOK_DIR, so a pre-2.0.0 LEGACY_HOOK_DIR copy
// is orphaned. Remove it only when it holds nothing but the gate script.
function removeLegacyHookDir(base) {
  const legacyDir = join(base, LEGACY_HOOK_DIR);
  if (!existsSync(legacyDir)) return;
  const entries = readdirSync(legacyDir);
  if (entries.some((name) => name !== 'completion-gate.mjs')) return;
  if (isDryRun) {
    console.log(`  [dry-run] remove legacy ${legacyDir}`);
    return;
  }
  rmSync(legacyDir, { recursive: true, force: true });
}

function installCursorCompletionHook() {
  const sourceScript = resolve(__dir, 'hooks', 'completion-gate.mjs');
  const hookDir = join(cursorBase, HOOK_DIR);
  const destScript = join(hookDir, 'completion-gate.mjs');
  const configPath = join(cursorBase, 'hooks.json');
  if (!existsSync(sourceScript)) return 'source-missing';

  if (isDryRun) {
    console.log(`  [dry-run] ${sourceScript} → ${destScript}`);
  } else {
    mkdirSync(hookDir, { recursive: true });
    place(sourceScript, destScript, false);
  }

  let config = { version: 1, hooks: {} };
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, 'utf8'));
    } catch {
      console.warn(`  [!] Skipped completion hook: ${configPath} is not valid JSON.`);
      return 'skipped-invalid-config';
    }
  }

  if (!config || typeof config !== 'object' || Array.isArray(config)) config = {};
  if (!config.hooks || typeof config.hooks !== 'object' || Array.isArray(config.hooks)) {
    config.hooks = {};
  }
  if (!('version' in config)) config.version = 1;

  const existing = Array.isArray(config.hooks.stop) ? config.hooks.stop : [];
  const preserved = existing.filter(
    (entry) => !MANAGED_GATE.test(String(entry?.command ?? '')),
  );
  config.hooks.stop = [
    ...preserved,
    {
      command: `node ${HOOK_DIR}/completion-gate.mjs --host=cursor`,
      timeout: 5,
      loop_limit: 12,
      failClosed: false,
    },
  ];

  const status = writeManagedFile(configPath, JSON.stringify(config, null, 2) + '\n');
  removeLegacyHookDir(cursorBase);
  return status;
}

// Claude Code reads Stop hooks from ~/.claude/settings.json. Same script,
// Claude schema; the managed entry is replaced idempotently and user hooks
// in other groups are preserved. Cursor loads this file too (Third-Party
// Imports), so `--host=claude` lets the script stand aside there when the
// native Cursor entry exists.
function installClaudeCompletionHook() {
  const sourceScript = resolve(__dir, 'hooks', 'completion-gate.mjs');
  const hookDir = join(claudeBase, HOOK_DIR);
  const destScript = join(hookDir, 'completion-gate.mjs');
  const settingsPath = join(claudeBase, 'settings.json');
  if (!existsSync(sourceScript)) return 'source-missing';

  if (isDryRun) {
    console.log(`  [dry-run] ${sourceScript} → ${destScript}`);
  } else {
    mkdirSync(hookDir, { recursive: true });
    place(sourceScript, destScript, false);
  }

  let settings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
    } catch {
      console.warn(`  [!] Skipped completion hook: ${settingsPath} is not valid JSON.`);
      return 'skipped-invalid-config';
    }
  }
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) settings = {};
  if (!settings.hooks || typeof settings.hooks !== 'object' || Array.isArray(settings.hooks)) settings.hooks = {};

  const existing = Array.isArray(settings.hooks.Stop) ? settings.hooks.Stop : [];
  const preserved = existing
    .map((group) => ({
      ...group,
      hooks: (Array.isArray(group?.hooks) ? group.hooks : []).filter(
        (h) => !MANAGED_GATE.test(String(h?.command ?? '')),
      ),
    }))
    .filter((group) => group.hooks.length > 0);
  settings.hooks.Stop = [
    ...preserved,
    { hooks: [{ type: 'command', command: `node "${destScript.replace(/\\/g, '/')}" --host=claude`, timeout: 5 }] },
  ];
  const status = writeManagedFile(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  removeLegacyHookDir(claudeBase);
  return status;
}

// Install a context-file tool (Codex / Gemini). `spec` describes its layout.
function installContextTool(spec) {
  const { label, base, rulesFile, rulesLoadPath, commandsDir, commandExt, render } = spec;
  console.log(`\n${isDryRun ? '[dry-run] ' : ''}${label} → ${base}`);

  // --skill / --only skills has no meaning here (no skills loader).
  const doRules = !onlyGroups || onlyGroups.has('rules');
  const doCommands = (!onlyGroups || onlyGroups.has('commands')) && !skillName;
  if (!doRules && !doCommands) {
    console.log('  (no skills loader — nothing to install for the selected groups)');
    return;
  }

  let rulesStatus = 'skipped';
  if (doRules) {
    rulesStatus = writeManagedFile(join(base, rulesFile), buildMergedRules(label, rulesLoadPath));
  }
  let cmdCount = 0;
  if (doCommands) {
    for (const cmd of portableCommands()) {
      writeManagedFile(join(base, commandsDir, `${cmd.name}${commandExt}`), render(cmd));
      cmdCount++;
    }
  }
  if (!isDryRun) {
    const parts = [];
    if (doRules) parts.push(`${rulesFile} ${rulesStatus}`);
    if (doCommands) parts.push(`${cmdCount} command(s) → ${commandsDir}/`);
    console.log(`  ✓ ${parts.join(', ')}`);
  }
}

function verifyContextTool(spec) {
  const { label, base, rulesFile, rulesLoadPath, commandsDir, commandExt, render } = spec;
  const doRules = !onlyGroups || onlyGroups.has('rules');
  const doCommands = (!onlyGroups || onlyGroups.has('commands')) && !skillName;
  if (doRules) {
    const dest = join(base, rulesFile);
    const expected = buildMergedRules(label, rulesLoadPath);
    if (!existsSync(dest)) verifyFailures.push(`${label} ${rulesFile}: missing destination`);
    else if (readFileSync(dest, 'utf8') !== expected) verifyFailures.push(`${label} ${rulesFile}: content hash mismatch`);
  }
  if (doCommands) {
    for (const cmd of portableCommands()) {
      const dest = join(base, commandsDir, `${cmd.name}${commandExt}`);
      const expected = render(cmd);
      if (!existsSync(dest)) verifyFailures.push(`${label} ${cmd.name}: missing destination`);
      else if (readFileSync(dest, 'utf8') !== expected) verifyFailures.push(`${label} ${cmd.name}: content hash mismatch`);
    }
  }
}

if (isVerifyOnly) {
  if (wantCursor) {
    verifyTarget(cursorBase, { skipCursorBuiltins: true }, 'Cursor');
    if (!noAgentsMirror && (!onlyGroups || onlyGroups.has('skills'))) {
      const agentsSkillsDest = join(agentsBase, 'skills');
      for (const it of listInstallItems({ skipCursorBuiltins: true })) {
        if (it.dest !== 'skills') continue;
        recordVerify(it.itemSrc, join(agentsSkillsDest, it.outName), `Agents ${it.outName}`);
      }
      assertNoCursorBuiltins(agentsSkillsDest);
    }
    if (!onlyGroups || onlyGroups.has('hooks')) {
      const hookSrc = resolve(__dir, 'hooks', 'completion-gate.mjs');
      const hookDest = join(cursorBase, HOOK_DIR, 'completion-gate.mjs');
      if (existsSync(hookSrc)) recordVerify(hookSrc, hookDest, 'Cursor completion-gate.mjs');
    }
  }
  if (wantClaude) {
    verifyTarget(claudeBase, { renameMdc: true }, 'Claude');
    if (!onlyGroups || onlyGroups.has('hooks')) {
      const hookSrc = resolve(__dir, 'hooks', 'completion-gate.mjs');
      const hookDest = join(claudeBase, HOOK_DIR, 'completion-gate.mjs');
      if (existsSync(hookSrc)) recordVerify(hookSrc, hookDest, 'Claude completion-gate.mjs');
    }
  }
  if (wantCodex) {
    verifyContextTool({
      label: 'Codex CLI (OpenAI)',
      base: codexBase,
      rulesFile: 'AGENTS.md',
      rulesLoadPath: '~/.codex/AGENTS.md',
      commandsDir: 'prompts',
      commandExt: '.md',
      render: (cmd) => (cmd.body.endsWith('\n') ? cmd.body : cmd.body + '\n'),
    });
  }
  if (wantGemini) {
    verifyContextTool({
      label: 'Gemini CLI',
      base: geminiBase,
      rulesFile: 'GEMINI.md',
      rulesLoadPath: '~/.gemini/GEMINI.md',
      commandsDir: 'commands',
      commandExt: '.toml',
      render: toGeminiToml,
    });
  }
  failIfUnverified('install verify');
  console.log('✓ install verify passed — every packaged file matches the destination.');
  process.exit(0);
}

const results = [];

// ---- Cursor ----------------------------------------------------------------
if (wantCursor) {
  const clean = isClean ? backupAndWipe(cursorBase) : null;
  const counts = installDirs(cursorBase, { skipCursorBuiltins: true });
  if (!skillName && !isDryRun) {
    const cursorSkills = join(cursorBase, 'skills');
    for (const name of CURSOR_MANAGED_BUILTIN_SKILLS) {
      const stale = join(cursorSkills, name);
      if (existsSync(stale)) rmSync(stale, { recursive: true, force: true });
    }
    assertNoCursorBuiltins(cursorSkills);
  }
  pruneRenamedSkills(join(cursorBase, 'skills'), 'Cursor');
  pruneRenamedRules(join(cursorBase, 'rules'), 'Cursor');
  pruneStaleCommands(join(cursorBase, 'commands'), 'Cursor');
  const hookStatus =
    !onlyGroups || onlyGroups.has('hooks')
      ? installCursorCompletionHook()
      : 'skipped';

  if (skillName && counts.copiedDirs + counts.copiedFiles === 0) {
    console.error(`✗ Skill '${skillName}' not found in skills/ or skills-cursor/.`);
    process.exit(1);
  }

  // Also write skills to ~/.agents/skills/ (Cursor Skills UI historically reads here).
  if (!noAgentsMirror && (!onlyGroups || onlyGroups.has('skills'))) {
    const agentsSkillsDest = join(agentsBase, 'skills');
    const cursorSkillsSrc = join(cursorBase, 'skills');
    if (isDryRun) {
      console.log(`  [dry-run] sync ${cursorSkillsSrc} → ${agentsSkillsDest}`);
    } else if (existsSync(cursorSkillsSrc)) {
      if (isClean) rmSync(agentsSkillsDest, { recursive: true, force: true });
      mkdirSync(agentsSkillsDest, { recursive: true });
      for (const item of readdirSync(cursorSkillsSrc)) {
        if (skillName && item !== skillName) continue;
        const from = join(cursorSkillsSrc, item);
        const to = join(agentsSkillsDest, item);
        cpSync(from, to, { recursive: true });
        recordVerify(from, to, `Agents ${item}`);
      }
      if (!skillName) {
        for (const name of CURSOR_MANAGED_BUILTIN_SKILLS) {
          const stale = join(agentsSkillsDest, name);
          if (existsSync(stale)) rmSync(stale, { recursive: true, force: true });
        }
        assertNoCursorBuiltins(agentsSkillsDest);
      }
      pruneRenamedSkills(agentsSkillsDest, 'Agents');
    }
  }

  // MCP config template (only if missing; never overwritten).
  const mcpDest = join(cursorBase, 'mcp.json');
  const mcpTemplate = resolve(__dir, 'mcp', 'mcp.json.template');
  let mcpInstalled = false;
  if (!onlyGroups && existsSync(mcpTemplate) && !existsSync(mcpDest)) {
    if (isDryRun) console.log(`  [dry-run] ${mcpTemplate} → ${mcpDest}`);
    else { mkdirSync(cursorBase, { recursive: true }); cpSync(mcpTemplate, mcpDest); }
    mcpInstalled = true;
  }

  results.push({ target: 'Cursor', base: cursorBase, ...counts, clean, mcpInstalled, hookStatus });
}

// ---- Claude Code -----------------------------------------------------------
if (wantClaude) {
  const clean = isClean ? backupAndWipe(claudeBase) : null;
  const counts = installDirs(claudeBase, { renameMdc: true });
  pruneRenamedSkills(join(claudeBase, 'skills'), 'Claude');
  pruneRenamedRules(join(claudeBase, 'rules'), 'Claude', { renameMdc: true });
  pruneStaleCommands(join(claudeBase, 'commands'), 'Claude');
  const hookStatus = !onlyGroups || onlyGroups.has('hooks') ? installClaudeCompletionHook() : 'skipped';

  if (skillName && counts.copiedDirs + counts.copiedFiles === 0) {
    console.error(`✗ Skill '${skillName}' not found in skills/ or skills-cursor/.`);
    process.exit(1);
  }

  if (!isDryRun) {
    // Claude Code lists every model-invocable skill and command as
    // "- name: description" against 1% of the context window at 3 chars/token
    // for current models (30,000 chars on a 1M Opus 5.5 session), shared with
    // built-in skills; over budget the least-used entries drop to name only
    // (client 2.1.280, ADR-0010).
    let listingChars = 0;
    let entries = 0;
    const addEntry = (name, file) => {
      const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
      const end = text.startsWith('---') ? text.indexOf('\n---', 3) : -1;
      if (end === -1) return;
      const front = text.slice(3, end);
      if (/^disable-model-invocation:\s*true\s*$/m.test(front)) return;
      const lines = front.split('\n');
      const s = lines.findIndex((l) => /^description:/.test(l));
      if (s === -1) return;
      const buf = [];
      const head = lines[s].slice('description:'.length).trim();
      if (head && !/^[>|][-+0-9]*$/.test(head)) buf.push(head);
      for (let j = s + 1; j < lines.length && !/^[A-Za-z0-9_-]+:/.test(lines[j]); j++) buf.push(lines[j].trim());
      const desc = buf.join(' ').replace(/\s+/g, ' ').replace(/^["']|["']$/g, '').trim();
      listingChars += name.length + 4 + Math.min(desc.length, 1536) + 1;
      entries++;
    };
    const skillsDir = join(claudeBase, 'skills');
    for (const d of existsSync(skillsDir) ? readdirSync(skillsDir) : []) {
      const f = join(skillsDir, d, 'SKILL.md');
      if (existsSync(f)) addEntry(d, f);
    }
    const cmdDir = join(claudeBase, 'commands');
    for (const f of existsSync(cmdDir) ? readdirSync(cmdDir) : []) {
      const p = join(cmdDir, f);
      if (f.endsWith('.md') && statSync(p).isFile()) addEntry(f.slice(0, -3), p);
    }
    console.log(`  Claude Code skill listing from ~/.claude (all packs): ${entries} entries, ${listingChars} chars.`);
    console.log('  The default budget is 1% of the context window (30,000 chars on a 1M Opus 5.5 session), shared with built-in skills;');
    console.log('  over budget the least-used skills show by name only. To keep every description, set "skillListingBudgetFraction": 0.02 in ~/.claude/settings.json.');
  }

  results.push({ target: 'Claude Code', base: claudeBase, ...counts, clean, mcpInstalled: false, hookStatus });
}

// ---- Codex CLI (context file + prompt ports) -------------------------------
if (wantCodex) {
  installContextTool({
    label: 'Codex CLI (OpenAI)',
    base: codexBase,
    rulesFile: 'AGENTS.md',
    rulesLoadPath: '~/.codex/AGENTS.md',
    commandsDir: 'prompts',
    commandExt: '.md',
    render: (cmd) => (cmd.body.endsWith('\n') ? cmd.body : cmd.body + '\n'),
  });
}

// ---- Gemini CLI (context file + TOML command ports) ------------------------
if (wantGemini) {
  installContextTool({
    label: 'Gemini CLI',
    base: geminiBase,
    rulesFile: 'GEMINI.md',
    rulesLoadPath: '~/.gemini/GEMINI.md',
    commandsDir: 'commands',
    commandExt: '.toml',
    render: toGeminiToml,
  });
}

// ---- summary ---------------------------------------------------------------
const mode = `${isClean ? 'mirror' : 'merge'}${useLink ? '+link' : ''}${skillName ? `:skill=${skillName}` : ''}`;
const verb = useLink ? 'linked' : 'copied';

if (!isDryRun) failIfUnverified('post-install verify');

if (isDryRun) {
  for (const r of results) {
    console.log(
      `\n[dry-run] ${r.target} (${mode})` +
      (r.clean ? ` — would back up + wipe ${r.clean.wiped} managed dir(s)` : '') +
      `\n[dry-run] Would ${useLink ? 'link' : 'copy'} ${r.copiedDirs} directories and ${r.copiedFiles} files to ${r.base}` +
      (r.mcpInstalled ? ' (plus mcp.json template)' : '')
    );
  }
  console.log('Run without --dry-run to apply.');
} else {
  for (const r of results) {
    if (r.clean && r.clean.backupRoot && !noBackup && r.clean.wiped > 0) {
      console.log(`✓ Backed up previous ${r.base}/{${managedDests.join(',')}} → ${r.clean.backupRoot}`);
    }
    console.log(`\n✓ kenji installed for ${r.target} (${mode}) — ${r.copiedDirs} directories and ${r.copiedFiles} files ${verb} to ${r.base}`);
    if (r.target === 'Cursor' && (!onlyGroups || onlyGroups.has('skills'))) {
      const agentsCount = existsSync(join(agentsBase, 'skills')) ? readdirSync(join(agentsBase, 'skills')).length : 0;
      console.log(`✓ Skills synced to ${join(agentsBase, 'skills')} (${agentsCount} skills — Cursor UI path)`);
    }
    if (r.mcpInstalled) console.log(`✓ MCP template written to ${join(r.base, 'mcp.json')} — edit it to add your API keys.`);
    if (r.hookStatus && !r.hookStatus.startsWith('skip')) {
      const where = r.target === 'Cursor' ? 'hooks.json' : 'settings.json';
      console.log(`✓ Opt-in completion gate ${r.hookStatus} in ${join(r.base, where)}.`);
    }
  }
  if (linkFallbacks) console.log(`  (note: ${linkFallbacks} file(s) copied instead of linked — symlinks need elevated rights on this OS)`);
  const dual = dualSkillCommandNames();
  if (dual.length) {
    console.log(`Note: these names exist as both a skill and a /command (the picker may show two /entries): ${dual.join(', ')}`);
  }
  console.log('Re-check anytime with: npx @kensaurus/skills --verify');
  if (wantCursor) console.log('Restart Cursor to activate skills, commands, and agents.');
  if (wantClaude) console.log('Restart any active claude sessions — skills appear as /slash-commands.');
  if (wantCodex) console.log('Codex CLI loads ~/.codex/AGENTS.md automatically; prompts appear via the / picker.');
  if (wantGemini) console.log('Gemini CLI loads ~/.gemini/GEMINI.md automatically; run /memory refresh in an active session.');
}
