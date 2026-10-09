#!/usr/bin/env node
/**
 * FILE: check-skill-refs.mjs
 * PURPOSE: Fail CI on doubled-prefix skill typos (`mobile-mobile-*`), the
 * stale `audit-responsive-layout` alias, renamed-skill leftovers in
 * OLD_ALIASES, and prompt fossils (retired model names, thinking scaffolds,
 * update suppressors, retired MCP tool calls). Does not attempt a full unknown-name scan (session
 * names like `audit-ux-home` collide with that heuristic).
 * SCOPE: skills/, skills-cursor/, commands/, agents/, rules/ and .cursor/rules
 * only (SCAN_DIRS). README, docs/ and CHANGELOG are not scanned.
 *
 * USAGE:
 *   node scripts/check-skill-refs.mjs
 *   node scripts/check-skill-refs.mjs --self-test
 */
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const selfTest = process.argv.includes("--self-test");

const GROUPS = ["skills", "skills-cursor"];
const SCAN_DIRS = ["skills", "skills-cursor", "commands", "agents", "rules", ".cursor/rules"];
const OLD_ALIAS_DOC_DIRS = ["docs"];
const OLD_ALIAS_DOC_FILES = ["CHANGELOG.md", "README.md"];

/** Documented old names — allowed only inside audit-skill-conflicts. */
const STALE_ALIASES = new Set(["audit-responsive-layout"]);

/** Renamed skills. Historical mentions allowed only in CHANGELOG.md,
 *  docs/CONTRIBUTING.md, this file, and audit-skill-conflicts. */
const OLD_ALIASES = {
  "domain-modeling": "docs-domain-modeling",
  "grilling": "workflow-grilling",
};

function isOldAliasAllowed(rel) {
  return (
    rel === "CHANGELOG.md" ||
    rel === "docs/CONTRIBUTING.md" ||
    rel === "scripts/check-skill-refs.mjs" ||
    rel.includes("audit-skill-conflicts")
  );
}

/** Prompt fossils (Anthropic prompt-audit signals, Group 1b/1d). On Opus 5.5
 *  effort — not prose — controls thinking, update suppressors make it go
 *  silent, and a retired model name dates every sentence after it. A quoted
 *  mention ("think step by step" named as an anti-pattern) is not a hit. */
const FOSSIL_PATTERNS = [
  { name: "retired model name", re: /\b(?:claude[- ]?(?:2|3(?:\.[57])?|instant)|gpt-?4o|(?:opus|sonnet|haiku)[- ]4(?:\.\d)?|composer[- ]2\.5)\b/i },
  { name: "thinking scaffold", re: /(?<!["'“‘])(?:\bthink step[- ]by[- ]step\b|\btake a deep breath\b|\bthink (?:harder|less)\b|\bdon'?t overthink\b|\bultrathink\b|<scratchpad>|<thinking>)/i },
  { name: "update suppressor", re: /(?<!["'“‘])(?:\bhold (?:all )?(?:findings|results)\b|\bdon'?t narrate\b|\bno (?:interim|preamble)\b)/i },
  // Supabase MCP servers hide get_logs once query_logs exists (0.12.0 and hosted).
  { name: "retired MCP tool", re: /\bsupabase:get_logs\b/ },
];
/** Files that discuss these patterns by name, and vendored upstream text. */
function fossilAllowed(rel) {
  return rel.includes("audit-skill-conflicts") || /\/thirdparty-/.test(rel);
}
function checkFossils(rel, text) {
  if (fossilAllowed(rel)) return [];
  const errors = [];
  text.split("\n").forEach((line, i) => {
    for (const { name, re } of FOSSIL_PATTERNS) {
      const m = line.match(re);
      if (m) errors.push(`${rel}:${i + 1}: ${name} '${m[0]}' — state the outcome, or set effort: in frontmatter`);
    }
  });
  return errors;
}

const TICK_RE = /`([a-z][a-z0-9]+(?:-[a-z0-9]+)+)`/g;

function liveSkillNames() {
  const names = new Set();
  for (const group of GROUPS) {
    const base = join(repoRoot, group);
    if (!existsSync(base)) continue;
    for (const dir of readdirSync(base)) {
      if (existsSync(join(base, dir, "SKILL.md"))) names.add(dir);
    }
  }
  return names;
}

/** mobile-mobile-capacitor-platform → mobile-capacitor-platform */
function collapseDoubledPrefix(name) {
  const parts = name.split("-");
  if (parts.length >= 3 && parts[0] === parts[1]) {
    return [parts[0], ...parts.slice(2)].join("-");
  }
  return null;
}

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".git") continue;
      walkFiles(p, out);
    } else if (/\.(md|mdc)$/.test(ent.name)) {
      out.push(p);
    }
  }
  return out;
}

function checkText(rel, text, names, oldAliases = OLD_ALIASES) {
  const errors = [];
  const allowStale = rel.includes("audit-skill-conflicts");
  for (const m of text.matchAll(TICK_RE)) {
    const ref = m[1];
    if (names.has(ref)) continue;
    if (Object.prototype.hasOwnProperty.call(oldAliases, ref)) {
      if (!isOldAliasAllowed(rel)) {
        errors.push(`${rel}: stale skill alias \`${ref}\` — use ${oldAliases[ref]}`);
      }
      continue;
    }
    if (STALE_ALIASES.has(ref)) {
      if (!allowStale) errors.push(`${rel}: stale skill alias \`${ref}\` — use audit-responsive`);
      continue;
    }
    const collapsed = collapseDoubledPrefix(ref);
    if (collapsed && names.has(collapsed)) {
      errors.push(`${rel}: doubled prefix \`${ref}\` — did you mean \`${collapsed}\`?`);
    }
  }
  return errors;
}

function main() {
  if (selfTest) {
    const collapsed = collapseDoubledPrefix("mobile-mobile-capacitor-platform");
    const collapsed2 = collapseDoubledPrefix("mobile-capacitor-platform");
    const fail = [];
    if (collapsed !== "mobile-capacitor-platform") {
      fail.push(`collapseDoubledPrefix: got ${collapsed}`);
    }
    if (collapsed2 !== null) fail.push("collapseDoubledPrefix should be null without a double");
    const names = new Set(["mobile-capacitor-platform", "audit-responsive"]);
    const hits = checkText(
      "skills/workflow-spec-tdd/SKILL.md",
      "see `mobile-mobile-capacitor-platform` and `audit-responsive`",
      names,
    );
    if (!hits.some((h) => h.includes("mobile-mobile-capacitor-platform"))) {
      fail.push("self-test missed doubled prefix");
    }
    if (hits.some((h) => h.includes("`audit-responsive`"))) {
      fail.push("self-test false-positive on live skill");
    }
    const fakeOld = { "legacy-probe-skill": "audit-responsive" };
    const oldHits = checkText(
      "skills/workflow-spec-tdd/SKILL.md",
      "see `legacy-probe-skill`",
      names,
      fakeOld,
    );
    if (!oldHits.some((h) => h.includes("legacy-probe-skill") && h.includes("audit-responsive"))) {
      fail.push("self-test missed OLD_ALIASES hit");
    }
    const allowedOld = checkText("CHANGELOG.md", "see `legacy-probe-skill`", names, fakeOld);
    if (allowedOld.length) fail.push("self-test rejected OLD_ALIASES in CHANGELOG.md");
    const allowedDocs = checkText("docs/CONTRIBUTING.md", "see `legacy-probe-skill`", names, fakeOld);
    if (allowedDocs.length) fail.push("self-test rejected OLD_ALIASES in docs/CONTRIBUTING.md");
    const allowedAudit = checkText(
      "skills/audit-skill-conflicts/SKILL.md",
      "see `legacy-probe-skill`",
      names,
      fakeOld,
    );
    if (allowedAudit.length) fail.push("self-test rejected OLD_ALIASES in audit-skill-conflicts");
    const fossilHits = checkFossils("skills/workflow-spec-tdd/SKILL.md", "Think step by step. Tuned for Composer 2.5. Hold all findings for the end.");
    if (fossilHits.length !== 3) fail.push(`self-test expected 3 fossil hits, got ${fossilHits.length}`);
    const quoted = checkFossils("skills/meta-skill-creator/SKILL.md", 'not generic "think step by step"');
    if (quoted.length) fail.push("self-test flagged a quoted mention of a scaffold");
    const retiredTool = checkFossils("skills/deploy-verify/SKILL.md", "supabase:get_logs\n{}");
    if (retiredTool.length !== 1) fail.push("self-test missed a retired Supabase MCP tool call");
    const vendored = checkFossils("skills/thirdparty-web-interface-guidelines/SKILL.md", "No preamble.");
    if (vendored.length) fail.push("self-test flagged vendored upstream text");
    if (fail.length) {
      for (const f of fail) console.error(`✗ ${f}`);
      process.exit(1);
    }
    console.log("✓ check-skill-refs self-test passed");
    return;
  }

  const names = liveSkillNames();
  const errors = [];
  for (const dir of SCAN_DIRS) {
    for (const file of walkFiles(join(repoRoot, dir))) {
      const rel = relative(repoRoot, file).replaceAll("\\", "/");
      const text = readFileSync(file, "utf8");
      errors.push(...checkText(rel, text, names), ...checkFossils(rel, text));
    }
  }
  const aliasFiles = [];
  for (const dir of OLD_ALIAS_DOC_DIRS) {
    walkFiles(join(repoRoot, dir), aliasFiles);
  }
  for (const extra of OLD_ALIAS_DOC_FILES) {
    const p = join(repoRoot, extra);
    if (existsSync(p)) aliasFiles.push(p);
  }
  for (const file of aliasFiles) {
    const rel = relative(repoRoot, file).replaceAll("\\", "/");
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(TICK_RE)) {
      const ref = m[1];
      if (names.has(ref)) continue;
      if (!Object.prototype.hasOwnProperty.call(OLD_ALIASES, ref)) continue;
      if (isOldAliasAllowed(rel)) continue;
      errors.push(`${rel}: stale skill alias \`${ref}\` — use ${OLD_ALIASES[ref]}`);
    }
  }
  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(`\n✗ ${errors.length} dangling skill-ref(s) / prompt fossil(s).`);
    process.exit(1);
  }
  console.log("✓ Skill cross-refs resolve; no doubled prefixes, stale aliases, retired model names, or thinking scaffolds.");
}

main();
