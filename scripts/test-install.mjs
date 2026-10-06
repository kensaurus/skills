#!/usr/bin/env node
/**
 * Install smoke test — would have caught the original "files silently skipped" bug.
 *
 * Runs bin/install.mjs against a throwaway HOME and asserts that every group
 * (skills, commands, agents, rules) actually lands, including top-level .md files.
 *
 *   node scripts/test-install.mjs   # exit 0 on pass, 1 on failure
 */
import { execFileSync, execSync, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  rmSync,
  existsSync,
  readdirSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const installer = join(repoRoot, "bin", "install.mjs");
const sandbox = mkdtempSync(join(tmpdir(), "kenji-test-"));

const fail = [];
const expect = (cond, msg) => { if (!cond) fail.push(msg); };
const countDir = (p) => (existsSync(p) ? readdirSync(p).length : 0);

try {
  // Run the installer with HOME/USERPROFILE pointed at the sandbox.
  execFileSync(process.execPath, [installer], {
    env: { ...process.env, HOME: sandbox, USERPROFILE: sandbox },
    stdio: "pipe",
  });

  const cur = join(sandbox, ".cursor");

  // Expected source counts from the repo.
  const cursorBuiltinDupes = new Set([
    "babysit", "canvas", "create-hook", "create-rule", "create-skill", "create-subagent",
    "migrate-to-skills", "shell", "split-to-prs", "statusline",
    "update-cli-config", "update-cursor-settings",
  ]);
  const repoGeneralSkills = countDir(join(repoRoot, "skills"));
  const repoCursorExtra = readdirSync(join(repoRoot, "skills-cursor"))
    .filter((name) => !cursorBuiltinDupes.has(name)).length;
  const repoCursorSkills = repoGeneralSkills + repoCursorExtra;
  const repoClaudeSkills = repoGeneralSkills + countDir(join(repoRoot, "skills-cursor"));
  // Per-project command bundles (directories) are excluded from global installs.
  const repoCommands = readdirSync(join(repoRoot, "commands"))
    .filter((f) => !statSync(join(repoRoot, "commands", f)).isDirectory()).length;
  const repoAgents = countDir(join(repoRoot, "agents"));
  // Per-project rule bundles (directories) are excluded from global installs.
  const repoRuleFiles = readdirSync(join(repoRoot, "rules"))
    .filter((f) => !statSync(join(repoRoot, "rules", f)).isDirectory());
  const repoCursorRules = repoRuleFiles.filter((f) => !f.endsWith(".md")).length;
  const repoClaudeRules = repoRuleFiles.length;

  expect(countDir(join(cur, "skills")) === repoCursorSkills,
    `cursor skills: expected ${repoCursorSkills}, got ${countDir(join(cur, "skills"))}`);
  expect(existsSync(join(cur, "skills", "research")), "missing skills/research");
  expect(existsSync(join(cur, "commands", "research.md")), "missing commands/research.md");
  expect(!existsSync(join(cur, "skills", "babysit")),
    "Cursor builtin babysit should not be copied into ~/.cursor/skills");
  expect(!existsSync(join(cur, "skills", "create-skill")),
    "Cursor builtin create-skill should not be copied into ~/.cursor/skills");
  expect(countDir(join(cur, "commands")) === repoCommands,
    `commands: expected ${repoCommands}, got ${countDir(join(cur, "commands"))}`);
  expect(countDir(join(cur, "agents")) === repoAgents,
    `agents: expected ${repoAgents}, got ${countDir(join(cur, "agents"))}`);
  expect(countDir(join(cur, "rules")) === repoCursorRules,
    `cursor rules: expected ${repoCursorRules}, got ${countDir(join(cur, "rules"))}`);

  // Top-level .md files must survive (the bug class we are guarding against).
  expect(existsSync(join(cur, "agents", "code-reviewer.md")), "missing agents/code-reviewer.md");
  expect(existsSync(join(cur, "commands", "commit.md")), "missing commands/commit.md");
  expect(existsSync(join(cur, "rules", "senior-engineer.mdc")), "missing rules/senior-engineer.mdc");
  expect(!existsSync(join(cur, "rules", "native-rn-monorepo")),
    "per-project bundle native-rn-monorepo leaked into global rules");
  expect(!existsSync(join(cur, "rules", "project-starter")),
    "per-project bundle project-starter leaked into global rules");
  expect(!existsSync(join(cur, "commands", "native-rn-monorepo")),
    "per-project bundle native-rn-monorepo leaked into global commands");
  expect(!existsSync(join(cur, "rules", "shell-first-search.md")),
    "Claude-only .md rule leaked into Cursor rules");
  expect(existsSync(join(cur, "rules", "shell-first-search.mdc")),
    "Cursor should receive shell-first-search.mdc");
  expect(existsSync(join(cur, "kenji-hooks", "completion-gate.mjs")),
    "missing completion hook script");

  const hooksPath = join(cur, "hooks.json");
  expect(existsSync(hooksPath), "missing Cursor hooks.json");
  const hooksConfig = JSON.parse(readFileSync(hooksPath, "utf8"));
  const stopHooks = hooksConfig.hooks?.stop ?? [];
  expect(stopHooks.some((entry) => entry.command?.includes("completion-gate.mjs")),
    "completion stop hook was not registered");
  expect(stopHooks.some((entry) => entry.command?.includes("completion-gate.mjs --host=cursor")),
    "Cursor completion hook does not declare --host=cursor");

  // Reinstall must preserve unrelated user hooks and replace our entry once.
  stopHooks.unshift({ command: "node user-owned-hook.mjs" });
  writeFileSync(hooksPath, JSON.stringify(hooksConfig, null, 2) + "\n");
  execFileSync(process.execPath, [installer], {
    env: { ...process.env, HOME: sandbox, USERPROFILE: sandbox },
    stdio: "pipe",
  });
  const reinstalledHooks = JSON.parse(readFileSync(hooksPath, "utf8")).hooks.stop;
  expect(reinstalledHooks.some((entry) => entry.command === "node user-owned-hook.mjs"),
    "installer removed an unrelated user hook");
  expect(
    reinstalledHooks.filter((entry) => entry.command?.includes("completion-gate.mjs")).length === 1,
    "installer duplicated the completion hook",
  );

  // MCP template should be written when none exists.
  expect(existsSync(join(cur, "mcp.json")), "missing mcp.json template");
  const installedMcp = readFileSync(join(cur, "mcp.json"), "utf8");
  // Pin comes from mcp/pinned-versions.json so a bump there cannot silently
  // leave the installed template on an old version.
  const pinnedFirecrawl = JSON.parse(
    readFileSync(join(repoRoot, "mcp", "pinned-versions.json"), "utf8"),
  ).npm["firecrawl-mcp"];
  expect(
    typeof pinnedFirecrawl === "string" && installedMcp.includes(`firecrawl-mcp@${pinnedFirecrawl}`),
    `mcp template missing pinned firecrawl (firecrawl-mcp@${pinnedFirecrawl})`,
  );
  expect(!installedMcp.includes("sequential-thinking"), "essential mcp template still lists sequential-thinking");
  expect(!installedMcp.includes("@playwright/mcp"), "essential mcp template still lists Playwright MCP");

  // --skill should install exactly one skill into a fresh sandbox.
  const sandbox2 = join(sandbox, "single");
  mkdirSync(sandbox2, { recursive: true });
  execFileSync(process.execPath, [installer, "--skill", "audit-ux"], {
    env: { ...process.env, HOME: sandbox2, USERPROFILE: sandbox2 },
    stdio: "pipe",
  });
  expect(existsSync(join(sandbox2, ".cursor", "skills", "audit-ux")), "--skill did not install audit-ux");
  expect(countDir(join(sandbox2, ".cursor", "skills")) === 1, "--skill installed more than one skill");

  // --- Codex + Gemini context-file tools (no skills system) ----------------
  // A fresh sandbox auto-detects nothing, so force both paths with explicit flags.
  const sandbox3 = join(sandbox, "context-tools");
  mkdirSync(sandbox3, { recursive: true });
  execFileSync(process.execPath, [installer, "--codex", "--gemini"], {
    env: { ...process.env, HOME: sandbox3, USERPROFILE: sandbox3 },
    stdio: "pipe",
  });

  const codexRules = join(sandbox3, ".codex", "AGENTS.md");
  const geminiRules = join(sandbox3, ".gemini", "GEMINI.md");
  expect(existsSync(codexRules), "missing ~/.codex/AGENTS.md");
  expect(existsSync(geminiRules), "missing ~/.gemini/GEMINI.md");

  const portableNames = readdirSync(join(repoRoot, "commands-portable"))
    .filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  expect(portableNames.length > 0, "commands-portable/ has no .md sources");
  for (const name of portableNames) {
    expect(existsSync(join(sandbox3, ".codex", "prompts", `${name}.md`)),
      `missing ~/.codex/prompts/${name}.md`);
    expect(existsSync(join(sandbox3, ".gemini", "commands", `${name}.toml`)),
      `missing ~/.gemini/commands/${name}.toml`);
  }

  // Merged rules must include a real rule and exclude the skill-routing index.
  const codexText = readFileSync(codexRules, "utf8");
  expect(codexText.includes("Senior Engineer"), "AGENTS.md missing senior-engineer rule content");
  expect(!codexText.includes("Skill Routing Index"),
    "AGENTS.md leaked the skill-routing index (should be excluded)");
  expect(!/^---\s*$/m.test(codexText.split("\n").slice(0, 3).join("\n")),
    "AGENTS.md still has raw .mdc frontmatter at the top");

  // Gemini TOML must be well-formed: description line + literal prompt block.
  const geminiToml = readFileSync(join(sandbox3, ".gemini", "commands", `${portableNames[0]}.toml`), "utf8");
  expect(/^description = "/.test(geminiToml), "gemini command missing description line");
  expect(geminiToml.includes("prompt = '''"), "gemini command missing prompt literal block");

  // Idempotency: a second identical run must not spawn .bak backups.
  execFileSync(process.execPath, [installer, "--codex", "--gemini"], {
    env: { ...process.env, HOME: sandbox3, USERPROFILE: sandbox3 },
    stdio: "pipe",
  });
  const codexBaks = readdirSync(join(sandbox3, ".codex")).filter((n) => n.includes(".bak-"));
  expect(codexBaks.length === 0, `idempotent re-run created backups: ${codexBaks.join(", ")}`);

  // --auto must detect a pre-existing tool dir and install to it.
  const sandbox4 = join(sandbox, "auto");
  mkdirSync(join(sandbox4, ".codex"), { recursive: true });
  execFileSync(process.execPath, [installer, "--auto"], {
    env: { ...process.env, HOME: sandbox4, USERPROFILE: sandbox4 },
    stdio: "pipe",
  });
  expect(existsSync(join(sandbox4, ".codex", "AGENTS.md")), "--auto did not install to detected ~/.codex");

  const sandbox5 = join(sandbox, "claude-skills");
  mkdirSync(sandbox5, { recursive: true });
  execFileSync(process.execPath, [installer, "--claude"], {
    env: { ...process.env, HOME: sandbox5, USERPROFILE: sandbox5 },
    stdio: "pipe",
  });
  expect(countDir(join(sandbox5, ".claude", "skills")) === repoClaudeSkills,
    `claude skills: expected ${repoClaudeSkills}, got ${countDir(join(sandbox5, ".claude", "skills"))}`);
  expect(existsSync(join(sandbox5, ".claude", "skills", "create-skill")),
    "Claude should still receive portable skills-cursor copies");
  expect(existsSync(join(sandbox5, ".claude", "skills", "babysit")),
    "Claude should still receive the portable babysit copy");
  expect(existsSync(join(sandbox5, ".claude", "skills", "research")),
    "Claude should receive skills/research");
  expect(existsSync(join(sandbox5, ".claude", "rules", "shell-first-search.md")),
    "Claude should receive shell-first-search.md");
  expect(countDir(join(sandbox5, ".claude", "rules")) === repoClaudeRules,
    `claude rules: expected ${repoClaudeRules}, got ${countDir(join(sandbox5, ".claude", "rules"))}`);
  expect(existsSync(join(sandbox5, ".claude", "kenji-hooks", "completion-gate.mjs")),
    "missing Claude completion hook script");
  const claudeSettingsPath = join(sandbox5, ".claude", "settings.json");
  expect(existsSync(claudeSettingsPath), "missing ~/.claude/settings.json");
  const claudeSettings = JSON.parse(readFileSync(claudeSettingsPath, "utf8"));
  const stopGroups = claudeSettings.hooks?.Stop ?? [];
  const gateEntries = (groups) => groups.flatMap((g) => g.hooks ?? []).filter((h) => h.command?.includes("completion-gate.mjs"));
  expect(gateEntries(stopGroups).length === 1, "Claude Stop hook was not registered once");
  expect(gateEntries(stopGroups)[0].command.endsWith("--host=claude"),
    "Claude completion hook does not declare --host=claude, so Cursor would run it as a second gate");
  stopGroups.unshift({ hooks: [{ type: "command", command: "node user-owned-stop.mjs" }] });
  claudeSettings.permissions = { allow: ["Bash(npm test)"] };
  writeFileSync(claudeSettingsPath, JSON.stringify(claudeSettings, null, 2) + "\n");
  execFileSync(process.execPath, [installer, "--claude"], {
    env: { ...process.env, HOME: sandbox5, USERPROFILE: sandbox5 },
    stdio: "pipe",
  });
  const reinstalled = JSON.parse(readFileSync(claudeSettingsPath, "utf8"));
  expect(reinstalled.permissions?.allow?.[0] === "Bash(npm test)", "installer dropped unrelated settings.json keys");
  expect((reinstalled.hooks.Stop ?? []).some((g) => (g.hooks ?? []).some((h) => h.command === "node user-owned-stop.mjs")),
    "installer removed a user-owned Claude Stop hook");
  expect(gateEntries(reinstalled.hooks.Stop).length === 1, "installer duplicated the Claude completion hook");

  // Upgrading a pre-2.0.0 (cursor-kenji) install: the legacy managed entries are
  // replaced, user hooks and settings survive, and the orphaned folders go.
  const sandbox6 = join(sandbox, "legacy-upgrade");
  const legacyGate = "completion-gate.mjs";
  for (const tool of [".claude", ".cursor"]) {
    mkdirSync(join(sandbox6, tool, "cursor-kenji-hooks"), { recursive: true });
    writeFileSync(join(sandbox6, tool, "cursor-kenji-hooks", legacyGate), "// legacy copy\n");
  }
  const legacyClaudeCmd = `node "${join(sandbox6, ".claude", "cursor-kenji-hooks", legacyGate).replace(/\\/g, "/")}" --host=claude`;
  writeFileSync(join(sandbox6, ".claude", "settings.json"), JSON.stringify({
    env: { KEEP_ME: "1" },
    hooks: { Stop: [
      { hooks: [{ type: "command", command: "node user-owned-stop.mjs" }] },
      { hooks: [{ type: "command", command: legacyClaudeCmd, timeout: 5 }] },
    ] },
  }, null, 2));
  writeFileSync(join(sandbox6, ".cursor", "hooks.json"), JSON.stringify({
    version: 1,
    hooks: { stop: [
      { command: "node user-owned-cursor-stop.mjs" },
      { command: "node cursor-kenji-hooks/completion-gate.mjs --host=cursor", timeout: 5 },
    ] },
  }, null, 2));
  for (const args of [[], ["--claude"]]) {
    execFileSync(process.execPath, [installer, ...args], {
      env: { ...process.env, HOME: sandbox6, USERPROFILE: sandbox6 },
      stdio: "pipe",
    });
  }
  const upClaude = JSON.parse(readFileSync(join(sandbox6, ".claude", "settings.json"), "utf8"));
  const upClaudeGates = gateEntries(upClaude.hooks.Stop ?? []);
  expect(upClaudeGates.length === 1 && upClaudeGates[0].command.includes("/kenji-hooks/"),
    `legacy Claude gate not migrated to kenji-hooks: ${JSON.stringify(upClaudeGates)}`);
  expect(upClaude.env?.KEEP_ME === "1", "legacy upgrade dropped Claude env");
  expect((upClaude.hooks.Stop ?? []).some((g) => (g.hooks ?? []).some((h) => h.command === "node user-owned-stop.mjs")),
    "legacy upgrade removed a user-owned Claude Stop hook");
  const upCursorStop = JSON.parse(readFileSync(join(sandbox6, ".cursor", "hooks.json"), "utf8")).hooks.stop ?? [];
  const upCursorGates = upCursorStop.filter((e) => String(e.command).includes("completion-gate.mjs"));
  expect(upCursorGates.length === 1 && upCursorGates[0].command === "node kenji-hooks/completion-gate.mjs --host=cursor",
    `legacy Cursor gate not migrated to kenji-hooks: ${JSON.stringify(upCursorGates)}`);
  expect(upCursorStop.some((e) => e.command === "node user-owned-cursor-stop.mjs"), "legacy upgrade removed a user-owned Cursor stop hook");
  for (const tool of [".claude", ".cursor"]) {
    expect(!existsSync(join(sandbox6, tool, "cursor-kenji-hooks")), `legacy ${tool}/cursor-kenji-hooks was not removed`);
    expect(existsSync(join(sandbox6, tool, "kenji-hooks", legacyGate)), `missing ${tool}/kenji-hooks/${legacyGate}`);
  }

  // --typecheck-hook writes a per-repo asyncRewake Stop hook, idempotently,
  // keeps the user's hooks, flags a blocking typecheck hook, and refuses a
  // repo with no typecheck script.
  const repo7 = join(sandbox, "typecheck-repo");
  mkdirSync(join(repo7, ".git"), { recursive: true });
  writeFileSync(join(repo7, "package.json"), JSON.stringify({ name: "probe", scripts: { "type-check": "tsc --noEmit" } }));
  mkdirSync(join(repo7, ".claude"), { recursive: true });
  writeFileSync(join(repo7, ".claude", "settings.json"), JSON.stringify({
    permissions: { allow: ["Bash(npm test)"] },
    hooks: { Stop: [{ hooks: [
      { type: "command", command: "node user-owned-stop.mjs" },
      { type: "command", command: "npm run type-check" },
    ] }] },
  }));
  const runHook = () => execFileSync(process.execPath, [installer, "--typecheck-hook"], { cwd: repo7, stdio: "pipe", encoding: "utf8" });
  const firstRun = runHook();
  runHook();
  const s7 = JSON.parse(readFileSync(join(repo7, ".claude", "settings.json"), "utf8"));
  const s7Hooks = (s7.hooks.Stop ?? []).flatMap((g) => g.hooks ?? []);
  const bg = s7Hooks.filter((h) => String(h.command).includes("stop-typecheck.mjs"));
  expect(bg.length === 1 && bg[0].asyncRewake === true && bg[0].command.endsWith(" type-check"),
    `--typecheck-hook did not register one asyncRewake entry for type-check: ${JSON.stringify(bg)}`);
  expect(s7Hooks.some((h) => h.command === "node user-owned-stop.mjs"), "--typecheck-hook removed a user-owned Stop hook");
  expect(s7.permissions?.allow?.[0] === "Bash(npm test)", "--typecheck-hook dropped unrelated settings keys");
  expect(existsSync(join(repo7, ".claude", "hooks", "stop-typecheck.mjs")), "--typecheck-hook did not copy stop-typecheck.mjs");
  expect(firstRun.includes("blocking typecheck Stop hook is still registered"), "--typecheck-hook did not flag the blocking typecheck hook");
  writeFileSync(join(repo7, "package.json"), JSON.stringify({ name: "probe", scripts: {} }));
  let refused = false;
  try { runHook(); } catch { refused = true; }
  expect(refused, "--typecheck-hook accepted a repo with no typecheck script");

  // Merge must overwrite same-name skills and commands (not leave stale text).
  const marker = "KENJI-OVERWRITE-PROBE-DO-NOT-SHIP";
  const skillProbe = join(cur, "skills", "research", "SKILL.md");
  const cmdProbe = join(cur, "commands", "research.md");
  writeFileSync(skillProbe, marker);
  writeFileSync(cmdProbe, marker);
  execFileSync(process.execPath, [installer], {
    env: { ...process.env, HOME: sandbox, USERPROFILE: sandbox },
    stdio: "pipe",
  });
  expect(!readFileSync(skillProbe, "utf8").includes(marker),
    "merge install did not overwrite a stale skill");
  expect(!readFileSync(cmdProbe, "utf8").includes(marker),
    "merge install did not overwrite a stale command");
  expect(readFileSync(skillProbe, "utf8").includes("name: research"),
    "overwritten research skill is missing frontmatter");

  // --verify passes on a good install and fails closed on corruption.
  execFileSync(process.execPath, [installer, "--verify"], {
    env: { ...process.env, HOME: sandbox, USERPROFILE: sandbox },
    stdio: "pipe",
  });
  // Line endings are not content: a CRLF copy (Windows checkout with
  // core.autocrlf=true) must verify against the LF source in the npm tarball.
  const lfSource = readFileSync(join(repoRoot, "skills", "research", "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
  writeFileSync(skillProbe, lfSource.replace(/\n/g, "\r\n"));
  execFileSync(process.execPath, [installer, "--verify"], {
    env: { ...process.env, HOME: sandbox, USERPROFILE: sandbox },
    stdio: "pipe",
  });
  writeFileSync(skillProbe, marker);
  let verifyFailed = false;
  try {
    execFileSync(process.execPath, [installer, "--verify"], {
      env: { ...process.env, HOME: sandbox, USERPROFILE: sandbox },
      stdio: "pipe",
    });
  } catch {
    verifyFailed = true;
  }
  expect(verifyFailed, "--verify did not fail after dest corruption");

  // Stale Cursor-managed babysit copies must be deleted on reinstall.
  const staleBabysit = join(cur, "skills", "babysit");
  mkdirSync(staleBabysit, { recursive: true });
  writeFileSync(join(staleBabysit, "SKILL.md"), marker);
  execFileSync(process.execPath, [installer], {
    env: { ...process.env, HOME: sandbox, USERPROFILE: sandbox },
    stdio: "pipe",
  });
  expect(!existsSync(staleBabysit), "stale Cursor babysit copy was not deleted");

  // Renamed-skill leftovers must be pruned on Cursor, agents mirror, and Claude.
  const oldName = "kenji-rename-probe-old";
  const plantOld = (skillsDir) => {
    mkdirSync(join(skillsDir, oldName), { recursive: true });
    writeFileSync(join(skillsDir, oldName, "SKILL.md"), marker);
  };
  plantOld(join(cur, "skills"));
  plantOld(join(sandbox, ".agents", "skills"));
  execFileSync(process.execPath, [installer], {
    env: {
      ...process.env,
      HOME: sandbox,
      USERPROFILE: sandbox,
      KENJI_RENAMED_SKILLS: `${oldName}:research`,
    },
    stdio: "pipe",
  });
  expect(!existsSync(join(cur, "skills", oldName)), "Cursor did not prune renamed skill");
  expect(!existsSync(join(sandbox, ".agents", "skills", oldName)), "Agents mirror did not prune renamed skill");
  expect(existsSync(join(cur, "skills", "research")), "rename prune removed the new skill");

  const sandboxSkill = join(sandbox, "rename-skill-scope");
  const scopedSkills = join(sandboxSkill, ".cursor", "skills");
  plantOld(scopedSkills);
  execFileSync(process.execPath, [installer, "--skill", "audit-ux"], {
    env: {
      ...process.env,
      HOME: sandboxSkill,
      USERPROFILE: sandboxSkill,
      KENJI_RENAMED_SKILLS: `${oldName}:research`,
    },
    stdio: "pipe",
  });
  expect(existsSync(join(scopedSkills, oldName)), "--skill scoped install pruned an unrelated renamed dir");

  const sandboxClaude = join(sandbox, "rename-claude");
  mkdirSync(sandboxClaude, { recursive: true });
  execFileSync(process.execPath, [installer, "--claude"], {
    env: { ...process.env, HOME: sandboxClaude, USERPROFILE: sandboxClaude },
    stdio: "pipe",
  });
  plantOld(join(sandboxClaude, ".claude", "skills"));
  execFileSync(process.execPath, [installer, "--claude"], {
    env: {
      ...process.env,
      HOME: sandboxClaude,
      USERPROFILE: sandboxClaude,
      KENJI_RENAMED_SKILLS: `${oldName}:research`,
    },
    stdio: "pipe",
  });
  expect(!existsSync(join(sandboxClaude, ".claude", "skills", oldName)), "Claude did not prune renamed skill");
  expect(existsSync(join(sandboxClaude, ".claude", "skills", "research")), "Claude rename prune removed the new skill");

  // Renamed rule files are pruned on both hosts (RENAMED_RULES).
  writeFileSync(join(cur, "rules", "composer-2.5-execution.mdc"), marker);
  writeFileSync(join(sandboxClaude, ".claude", "rules", "composer-2.5-execution.md"), marker);
  execFileSync(process.execPath, [installer], { env: { ...process.env, HOME: sandbox, USERPROFILE: sandbox }, stdio: "pipe" });
  execFileSync(process.execPath, [installer, "--claude"], { env: { ...process.env, HOME: sandboxClaude, USERPROFILE: sandboxClaude }, stdio: "pipe" });
  expect(!existsSync(join(cur, "rules", "composer-2.5-execution.mdc")), "Cursor did not prune the renamed rule");
  expect(!existsSync(join(sandboxClaude, ".claude", "rules", "composer-2.5-execution.md")), "Claude did not prune the renamed rule");
  expect(existsSync(join(cur, "rules", "approved-plan-execution.mdc")), "renamed rule missing after prune");

  // Leftovers from older releases: the renamed /plan command and the
  // per-project bundle that older installers copied into global commands.
  // Only the pack's own files go; a user's same-named files stay.
  const packPlan = '---\ndescription: "Research, clarify requirements, and produce an approved implementation plan before writing code (Cursor Plan Mode)"\n---\n\n# Plan\n';
  const claudeCmds = join(sandboxClaude, ".claude", "commands");
  writeFileSync(join(cur, "commands", "plan.md"), packPlan);
  writeFileSync(join(claudeCmds, "plan.md"), '---\ndescription: "my own planning prompt"\n---\n');
  mkdirSync(join(cur, "commands", "native-rn-monorepo"), { recursive: true });
  writeFileSync(join(cur, "commands", "native-rn-monorepo", "rn-verify.md"), marker);
  mkdirSync(join(claudeCmds, "native-rn-monorepo"), { recursive: true });
  writeFileSync(join(claudeCmds, "native-rn-monorepo", "rn-verify.md"), marker);
  writeFileSync(join(claudeCmds, "native-rn-monorepo", "my-note.md"), marker);
  execFileSync(process.execPath, [installer], { env: { ...process.env, HOME: sandbox, USERPROFILE: sandbox }, stdio: "pipe" });
  execFileSync(process.execPath, [installer, "--claude"], { env: { ...process.env, HOME: sandboxClaude, USERPROFILE: sandboxClaude }, stdio: "pipe" });
  expect(!existsSync(join(cur, "commands", "plan.md")), "Cursor did not prune the pack's renamed plan.md");
  expect(existsSync(join(claudeCmds, "plan.md")), "installer deleted a user-owned plan.md");
  expect(!existsSync(join(cur, "commands", "native-rn-monorepo")), "Cursor kept the leaked per-project command bundle");
  expect(!existsSync(join(claudeCmds, "native-rn-monorepo", "rn-verify.md")), "Claude kept a leaked bundle command");
  expect(existsSync(join(claudeCmds, "native-rn-monorepo", "my-note.md")), "installer deleted a user file inside the bundle folder");

  const sandboxDry = join(sandbox, "rename-dry");
  plantOld(join(sandboxDry, ".cursor", "skills"));
  execFileSync(process.execPath, [installer, "--dry-run"], {
    env: {
      ...process.env,
      HOME: sandboxDry,
      USERPROFILE: sandboxDry,
      KENJI_RENAMED_SKILLS: `${oldName}:research`,
    },
    stdio: "pipe",
  });
  expect(existsSync(join(sandboxDry, ".cursor", "skills", oldName)), "dry-run deleted a renamed skill");

  const plantNamed = (skillsDir, name) => {
    mkdirSync(join(skillsDir, name), { recursive: true });
    writeFileSync(join(skillsDir, name, "SKILL.md"), marker);
  };
  plantNamed(join(cur, "skills"), "domain-modeling");
  plantNamed(join(cur, "skills"), "grilling");
  plantNamed(join(sandbox, ".agents", "skills"), "domain-modeling");
  plantNamed(join(sandbox, ".agents", "skills"), "grilling");
  execFileSync(process.execPath, [installer], {
    env: { ...process.env, HOME: sandbox, USERPROFILE: sandbox },
    stdio: "pipe",
  });
  expect(!existsSync(join(cur, "skills", "domain-modeling")), "Cursor did not prune domain-modeling");
  expect(!existsSync(join(cur, "skills", "grilling")), "Cursor did not prune grilling");
  expect(!existsSync(join(sandbox, ".agents", "skills", "domain-modeling")), "Agents did not prune domain-modeling");
  expect(!existsSync(join(sandbox, ".agents", "skills", "grilling")), "Agents did not prune grilling");
  expect(existsSync(join(cur, "skills", "docs-domain-modeling")), "docs-domain-modeling missing after rename prune");
  expect(existsSync(join(cur, "skills", "workflow-grilling")), "workflow-grilling missing after rename prune");

  // An editor's file watcher or an antivirus scan can hold a just-written file
  // for a moment; Windows then fails the next copy over it with EPERM. A
  // preload simulates that lock: a short one must be retried through, and one
  // that never clears must still fail, with a hint, instead of hanging.
  if (process.platform === "win32") {
    const shim = join(sandbox, "lock-shim.cjs");
    writeFileSync(shim, [
      'const fs = require("node:fs");',
      'const { syncBuiltinESMExports } = require("node:module");',
      "const copy = fs.cpSync;",
      "let left = Number(process.env.KENJI_TEST_LOCKS); // -1: the lock never clears",
      "let thrown = 0;",
      "fs.cpSync = function (...args) {",
      "  if (left !== 0) {",
      "    left--; thrown++;",
      '    throw Object.assign(new Error("EPERM: operation not permitted, copyfile (simulated lock)"), { code: "EPERM" });',
      "  }",
      "  return copy.apply(this, args);",
      "};",
      "syncBuiltinESMExports();",
      'process.on("exit", () => process.stderr.write(`lock-shim threw ${thrown}\\n`));',
    ].join("\n"));
    const runLocked = (home, locks) => spawnSync(process.execPath, ["--require", shim, installer, "--claude"], {
      env: { ...process.env, HOME: home, USERPROFILE: home, KENJI_TEST_LOCKS: String(locks) },
      encoding: "utf8",
    });

    const sandboxLock = join(sandbox, "lock-brief");
    const brief = runLocked(sandboxLock, 3);
    expect(brief.status === 0, `install failed under a brief lock: ${brief.stderr}`);
    expect(brief.stderr.includes("lock-shim threw 3"), `simulated lock never fired: ${brief.stderr}`);
    const briefVerify = spawnSync(process.execPath, [installer, "--verify", "--claude"], {
      env: { ...process.env, HOME: sandboxLock, USERPROFILE: sandboxLock },
      encoding: "utf8",
    });
    expect(briefVerify.status === 0, `install under a brief lock did not verify: ${briefVerify.stdout}${briefVerify.stderr}`);

    const stuck = runLocked(join(sandbox, "lock-stuck"), -1);
    expect(stuck.status !== 0, "install reported success although every copy was locked");
    expect(stuck.stderr.includes("another program is holding"), `no lock hint on a stuck lock: ${stuck.stderr}`);
  }

  // Official npm bin is the .js wrapper (Windows cmd-shim friendly).
  expect(existsSync(join(repoRoot, "bin", "kenji.js")), "missing bin/kenji.js");
  const wrapperHelp = execFileSync(process.execPath, [join(repoRoot, "bin", "kenji.js"), "--help"], {
    encoding: "utf8",
  });
  expect(wrapperHelp.includes("kenji installer"), "bin/kenji.js --help did not run installer");

  // From a clone on Windows, `npx @kensaurus/skills` becomes `cmd /c kenji`
  // and cmd looks in the current directory. The cwd shim must exist and run.
  expect(existsSync(join(repoRoot, "kenji.cmd")), "missing Windows cwd shim kenji.cmd");
  if (process.platform === "win32") {
    // Hardened shells export NoDefaultCurrentDirectoryInExePath=1, which stops
    // cmd.exe searching the cwd for the shim at all (npx from a clone fails
    // there regardless of this package). Clear it for the child so the test
    // exercises the shim the way a standard Windows shell resolves it.
    const cmdEnv = { ...process.env };
    delete cmdEnv.NoDefaultCurrentDirectoryInExePath;
    const cmdHelp = execFileSync("cmd.exe", ["/c", "kenji.cmd", "--help"], {
      cwd: repoRoot,
      encoding: "utf8",
      env: cmdEnv,
    });
    expect(cmdHelp.includes("kenji installer"), "kenji.cmd --help did not run installer");
    // The explicit-path form must work even under the hardened setting.
    const cmdHelpExplicit = execFileSync("cmd.exe", ["/c", ".\\kenji.cmd", "--help"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    expect(cmdHelpExplicit.includes("kenji installer"), ".\\kenji.cmd --help did not run installer");
  }

  // Packed tarball (what npm publish ships) must expose a working bin.
  const packDir = mkdtempSync(join(tmpdir(), "kenji-pack-"));
  try {
    execSync("npm pack --pack-destination " + JSON.stringify(packDir), {
      cwd: repoRoot,
      stdio: "pipe",
    });
    const tgz = readdirSync(packDir).find((name) => name.endsWith(".tgz"));
    expect(Boolean(tgz), "npm pack did not produce a tarball");
    if (tgz) {
      execSync("tar -xzf " + JSON.stringify(tgz), { cwd: packDir, stdio: "pipe" });
      const packedPkg = JSON.parse(readFileSync(join(packDir, "package", "package.json"), "utf8"));
      expect(packedPkg.bin?.["kenji"] === "bin/kenji.js",
        `packed bin must be bin/kenji.js, got ${packedPkg.bin?.["kenji"]}`);
      const packedHelp = execFileSync(
        process.execPath,
        [join(packDir, "package", "bin", "kenji.js"), "--help"],
        { encoding: "utf8" },
      );
      expect(packedHelp.includes("kenji installer"), "packed bin/kenji.js --help failed");
    }
  } finally {
    rmSync(packDir, { recursive: true, force: true });
  }
} catch (err) {
  fail.push("installer threw: " + (err.stderr?.toString() || err.message));
} finally {
  rmSync(sandbox, { recursive: true, force: true });
}

if (fail.length) {
  console.error("✗ install smoke test FAILED:");
  for (const f of fail) console.error("  - " + f);
  process.exit(1);
}
console.log("✓ install smoke test passed (merge + --skill, files preserved).");
