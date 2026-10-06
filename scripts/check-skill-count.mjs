#!/usr/bin/env node
/**
 * Single source of truth for skill and top-level command counts across README,
 * CATALOG, PROMOTION, and package.json. Plan-* count tokens in README are also
 * derived.
 *
 * Derived from filesystem: `skills/<name>/SKILL.md` directories.
 *
 *   node scripts/check-skill-count.mjs        # verify; exit 1 on mismatch
 *   node scripts/check-skill-count.mjs --fix  # rewrite tokens to the true count
 */
import { readdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(repoRoot, "skills");
const cursorSkillsDir = join(repoRoot, "skills-cursor");
const commandsDir = join(repoRoot, "commands");
const agentsDir = join(repoRoot, "agents");
const projectRulesDir = join(repoRoot, "rules", "project-starter");
const readmePath = join(repoRoot, "README.md");
const catalogPath = join(repoRoot, "docs", "CATALOG.md");
const promotionPath = join(repoRoot, "docs", "PROMOTION.md");
const packagePath = join(repoRoot, "package.json");
const pluginPath = join(repoRoot, ".cursor-plugin", "plugin.json");
const claudePluginPath = join(repoRoot, ".claude-plugin", "plugin.json");
const marketplacePath = join(repoRoot, ".claude-plugin", "marketplace.json");
const llmsPath = join(repoRoot, "llms.txt");
const gettingStartedPath = join(repoRoot, "docs", "GETTING-STARTED.md");
const docsReadmePath = join(repoRoot, "docs", "README.md");
const fix = process.argv.includes("--fix");

const count = readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(skillsDir, d.name, "SKILL.md")))
  .length;

const cursorSkillCount = readdirSync(cursorSkillsDir, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() &&
      existsSync(join(cursorSkillsDir, entry.name, "SKILL.md")),
  )
  .length;

const totalSkillCount = count + cursorSkillCount;

const planCount = readdirSync(skillsDir, { withFileTypes: true })
  .filter(
    (d) =>
      d.isDirectory() &&
      d.name.startsWith("plan-") &&
      existsSync(join(skillsDir, d.name, "SKILL.md")),
  ).length;

const commandCount = readdirSync(commandsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
  .length;

const agentCount = readdirSync(agentsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
  .length;

const projectRuleCount = existsSync(projectRulesDir)
  ? readdirSync(projectRulesDir, { withFileTypes: true }).filter(
      (entry) => entry.isFile() && entry.name.endsWith(".mdc"),
    ).length
  : 0;

/** @param {string} src */
function applyReadmeRules(src) {
  const rules = [
    { name: "badge anchor", re: /#skills-\d+/g, to: `#skills-${count}` },
    { name: "badge label", re: /-\d+_Skills-/g, to: `-${count}_Skills-` },
    { name: "badge alt", re: /alt="\d+ Skills"/g, to: `alt="${count} Skills"` },
    { name: "pie slice", re: /"Skills \(\d+\)" : \d+/g, to: `"Skills (${count})" : ${count}` },
    { name: "graph node", re: /SK\["Skills \(\d+\)"\]/g, to: `SK["Skills (${count})"]` },
    { name: "install step", re: /Install \d+ skills/g, to: `Install ${count} skills` },
    { name: "installs all", re: /Installs all \d+ skills/g, to: `Installs all ${count} skills` },
    { name: "section heading", re: /^## Skills \(\d+\)/gm, to: `## Skills (${count})` },
    { name: "mindmap root", re: /root\(\(\d+ Skills\)\)/g, to: `root((${count} Skills))` },
    {
      name: "hero tagline",
      re: /\d+ agent skills ·/g,
      to: `${count} agent skills ·`,
    },
    {
      name: "intro ships",
      re: /ships \*\*\d+ Cursor agent skills\*\*/g,
      to: `ships **${count} Cursor agent skills**`,
    },
    {
      name: "intro toolkit",
      re: /toolkit of \d+ Cursor agent skills/g,
      to: `toolkit of ${count} Cursor agent skills`,
    },
    {
      name: "installable skill total",
      re: /\*\*\d+\*\* installable skills/g,
      to: `**${totalSkillCount}** installable skills`,
    },
    {
      name: "faq primary skill count",
      re: /\*\*\d+\*\* agent skills in `skills\/`/g,
      to: `**${count}** agent skills in \`skills/\``,
    },
    {
      name: "faq cursor skill count",
      re: /plus \*\*\d+\*\* Cursor-specific skills/g,
      to: `plus **${cursorSkillCount}** Cursor-specific skills`,
    },
    {
      name: "faq total skill count",
      re: /\(\*\*\d+\*\* total\)/g,
      to: `(**${totalSkillCount}** total)`,
    },
    {
      name: "intro picks",
      re: /agent now has \d+ skills it picks/g,
      to: `agent now has ${count} skills it picks`,
    },
    {
      name: "whats inside table",
      re: /\| \*\*Skills\*\* \| \d+ \|/g,
      to: `| **Skills** | ${count} |`,
    },
    {
      name: "command tagline",
      re: /\d+ slash commands/g,
      to: `${commandCount} slash commands`,
    },
    {
      name: "whats inside commands",
      re: /\| \*\*Commands\*\* \| \d+ \|/g,
      to: `| **Commands** | ${commandCount} |`,
    },
    {
      name: "command section heading",
      re: /^## Commands \(\d+\)/gm,
      to: `## Commands (${commandCount})`,
    },
    {
      name: "command tree comment",
      re: /# \d+ slash commands/g,
      to: `# ${commandCount} slash commands`,
    },
    {
      name: "subagent tagline",
      re: /\d+ subagents/g,
      to: `${agentCount} subagents`,
    },
    {
      name: "subagent section heading",
      re: /^## Subagents \(\d+\)/gm,
      to: `## Subagents (${agentCount})`,
    },
    {
      name: "whats inside subagents",
      re: /\| \*\*Subagents\*\* \| \d+ \|/g,
      to: `| **Subagents** | ${agentCount} |`,
    },
    {
      name: "whats inside project rules",
      re: /\| \*\*Project Rules\*\* \| \d+ \|/g,
      to: `| **Project Rules** | ${projectRuleCount} |`,
    },
    {
      name: "subagent tree comment",
      re: /# \d+ subagents/g,
      to: `# ${agentCount} subagents`,
    },
    {
      name: "tree comment",
      re: /# \d+ Agent Skills/g,
      to: `# ${count} Agent Skills`,
    },
    {
      name: "plan skill count",
      re: /The \d+ `plan-\*` skills/g,
      to: `The ${planCount} \`plan-*\` skills`,
    },
    {
      name: "plan skill count generic",
      re: /\d+ `plan-\*` skills/g,
      to: `${planCount} \`plan-*\` skills`,
    },
    {
      name: "plan skill count bold",
      re: /\*\*\d+ `plan-\*` skills\*\*/g,
      to: `**${planCount} \`plan-*\` skills**`,
    },
    {
      name: "plan prefix taxonomy",
      re: /burndowns \(\d+ skills\)/g,
      to: `burndowns (${planCount} skills)`,
    },
    {
      name: "plan taxonomy execute count",
      re: /approve before execute \(\d+\)/g,
      to: `approve before execute (${planCount})`,
    },
    {
      name: "plan slash alias count",
      re: /\/\*-plan` \(\d+ aliases\)/g,
      to: `/*-plan\` (${planCount} aliases)`,
    },
  ];

  const mismatches = [];
  for (const { name, re, to } of rules) {
    for (const hit of src.match(re) || []) {
      if (hit !== to) mismatches.push({ file: "README.md", name, hit, to });
    }
    src = src.replace(re, to);
  }
  return { src, mismatches };
}

/** @param {string} path @param {string} label @param {Array<{name: string, re: RegExp, to: string, required?: boolean}>} rules */
function applyFileRules(path, label, rules) {
  if (!existsSync(path)) return { src: "", mismatches: [] };
  let src = readFileSync(path, "utf8");
  const mismatches = [];
  for (const { name, re, to, required } of rules) {
    const hits = src.match(re) || [];
    // A `required` rule guards a public listing: if a copy edit removes the
    // anchor phrase, the count silently stops being checked there.
    if (required && hits.length === 0) {
      mismatches.push({ file: label, name, hit: "(anchor phrase missing)", to });
    }
    for (const hit of hits) {
      if (hit !== to) mismatches.push({ file: label, name, hit, to });
    }
    src = src.replace(re, to);
  }
  return { src, mismatches };
}

const readmeResult = applyReadmeRules(readFileSync(readmePath, "utf8"));

const catalogResult = applyFileRules(catalogPath, "docs/CATALOG.md", [
  { name: "catalog heading", re: /^## Skills \(\d+\)/m, to: `## Skills (${count})` },
  {
    name: "catalog command heading",
    re: /^## Commands \(\d+\)/m,
    to: `## Commands (${commandCount})`,
  },
]);

const promotionResult = applyFileRules(promotionPath, "docs/PROMOTION.md", [
  {
    name: "promotion issue body",
    re: /\d+ Cursor agent skills for React/g,
    to: `${count} Cursor agent skills for React`,
  },
  {
    name: "promotion pr copy",
    re: /\d+ production-ready agent skills/g,
    to: `${count} production-ready agent skills`,
  },
  {
    name: "promotion generic skill count",
    re: /\d+ agent skills,/g,
    to: `${count} agent skills,`,
  },
  {
    name: "promotion slash commands",
    re: /\d+ slash commands/g,
    to: `${commandCount} slash commands`,
  },
  {
    name: "promotion inventory",
    re: /kenji \(\d+ skills, \d+ commands, \d+ subagents\)/g,
    to: `kenji (${count} skills, ${commandCount} commands, ${agentCount} subagents)`,
  },
  {
    name: "promotion auto-activate",
    re: /One install, \d+ skills auto-activate/g,
    to: `One install, ${count} skills auto-activate`,
  },
  {
    name: "promotion article title",
    re: /Title: \d+ Cursor AI Skills That Match/g,
    to: `Title: ${count} Cursor AI Skills That Match`,
  },
  {
    name: "promotion reddit title count",
    re: /\d+ Cursor AI skills/g,
    to: `${count} Cursor AI skills`,
  },
  {
    name: "promotion reddit body that",
    re: /\d+ agent skills that/g,
    to: `${count} agent skills that`,
  },
  {
    name: "promotion subagents",
    re: /\d+ subagents/g,
    to: `${agentCount} subagents`,
  },
]);

let packageResult = { src: "", mismatches: [] };
if (existsSync(packagePath)) {
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  const nextDesc = `You say the job; the playbook runs. ${count} agent skills, ${commandCount} slash commands, ${agentCount} subagents, and MCP templates for Claude Code, Cursor, Codex CLI, and Gemini CLI. Tuned for React / Next.js / Supabase; works on most stacks.`;
  if (pkg.description !== nextDesc) {
    packageResult.mismatches.push({
      file: "package.json",
      name: "description",
      hit: pkg.description,
      to: nextDesc,
    });
    pkg.description = nextDesc;
    packageResult.src = JSON.stringify(pkg, null, 2) + "\n";
  }
}

const pluginResult = applyFileRules(pluginPath, ".cursor-plugin/plugin.json", [
  {
    name: "plugin description",
    re: /\d+ agent skills, \d+ slash commands, \d+ subagents/g,
    to: `${count} agent skills, ${commandCount} slash commands, ${agentCount} subagents`,
    required: true,
  },
]);

// Both Claude Code manifests advertise the inventory in prose. They are the
// marketplace listing, so a stale count there is a public claim.
const claudeCountRules = [
  {
    name: "claude plugin inventory",
    re: /\d+ agent skills, \d+ slash commands, \d+ subagents/g,
    to: `${count} agent skills, ${commandCount} slash commands, ${agentCount} subagents`,
    required: true,
  },
];
const claudePluginResult = applyFileRules(
  claudePluginPath,
  ".claude-plugin/plugin.json",
  claudeCountRules,
);
const marketplaceResult = applyFileRules(
  marketplacePath,
  ".claude-plugin/marketplace.json",
  claudeCountRules,
);

const llmsResult = applyFileRules(llmsPath, "llms.txt", [
  {
    name: "llms inventory",
    re: /\d+ agent skills, \d+ slash commands, \d+ subagents/g,
    to: `${count} agent skills, ${commandCount} slash commands, ${agentCount} subagents`,
    required: true,
  },
  {
    name: "llms plan count",
    re: /\d+ `plan-\*` audit skills/g,
    to: `${planCount} \`plan-*\` audit skills`,
  },
]);

const gettingStartedResult = applyFileRules(gettingStartedPath, "docs/GETTING-STARTED.md", [
  {
    name: "getting-started plan count bold",
    re: /\*\*\d+ `plan-\*` skills\*\*/g,
    to: `**${planCount} \`plan-*\` skills**`,
  },
  {
    name: "getting-started planning skills",
    re: /chain the \d+ planning skills/g,
    to: `chain the ${planCount} planning skills`,
  },
]);

const docsReadmeResult = applyFileRules(docsReadmePath, "docs/README.md", [
  {
    name: "docs readme plan count",
    re: /chain the \d+ `plan-\*` skills/g,
    to: `chain the ${planCount} \`plan-*\` skills`,
  },
]);

const allMismatches = [
  ...readmeResult.mismatches,
  ...catalogResult.mismatches,
  ...promotionResult.mismatches,
  ...packageResult.mismatches,
  ...pluginResult.mismatches,
  ...claudePluginResult.mismatches,
  ...marketplaceResult.mismatches,
  ...llmsResult.mismatches,
  ...gettingStartedResult.mismatches,
  ...docsReadmeResult.mismatches,
];

if (fix) {
  writeFileSync(readmePath, readmeResult.src);
  if (catalogResult.src) writeFileSync(catalogPath, catalogResult.src);
  if (promotionResult.src) writeFileSync(promotionPath, promotionResult.src);
  if (packageResult.src) writeFileSync(packagePath, packageResult.src);
  if (pluginResult.src) writeFileSync(pluginPath, pluginResult.src);
  if (claudePluginResult.src) writeFileSync(claudePluginPath, claudePluginResult.src);
  if (marketplaceResult.src) writeFileSync(marketplacePath, marketplaceResult.src);
  if (llmsResult.src) writeFileSync(llmsPath, llmsResult.src);
  if (gettingStartedResult.src) writeFileSync(gettingStartedPath, gettingStartedResult.src);
  if (docsReadmeResult.src) writeFileSync(docsReadmePath, docsReadmeResult.src);
  console.log(
    `✓ Normalized to ${count} skills (${planCount} plan-*), ${commandCount} commands, and ${agentCount} subagents.`,
  );
  process.exit(0);
}

if (allMismatches.length) {
  console.error(`✗ Skill count out of sync. True count: ${count} (${planCount} plan-*).`);
  for (const m of allMismatches) {
    console.error(`  [${m.file} · ${m.name}] "${m.hit}" -> "${m.to}"`);
  }
  console.error(`\nRun: node scripts/check-skill-count.mjs --fix`);
  process.exit(1);
}

console.log(
  `✓ Counts match filesystem (${count} skills, ${planCount} plan-*, ${commandCount} commands, ${agentCount} subagents).`,
);
