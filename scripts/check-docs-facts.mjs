#!/usr/bin/env node
/**
 * Living-doc facts that the count/MCP-pin ratchets do not cover.
 *
 *   node scripts/check-docs-facts.mjs
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function read(rel) {
  const path = join(root, rel);
  if (!existsSync(path)) {
    errors.push(`missing file: ${rel}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

const pkg = JSON.parse(read("package.json"));
const version = pkg.version;
const essential = JSON.parse(read("mcp/mcp.json.template"));
const essentialServers = Object.keys(essential.mcpServers || {});

const readme = read("README.md");
const security = read("SECURITY.md");
const promotion = read("docs/PROMOTION.md");
const publishing = read("docs/PUBLISHING.md");
const gettingStarted = read("docs/GETTING-STARTED.md");
const planLoops = read("docs/PLAN-LOOPS.md");

if (security.includes("npm run prepare")) {
  errors.push("SECURITY.md: must not tell contributors to run `npm run prepare`");
}

for (const forbidden of ["Sequential Thinking", "Playwright"]) {
  const essentialBlock = readme.match(/\| Essential \|([^|]+)\|/);
  if (essentialBlock && essentialBlock[1].includes(forbidden)) {
    errors.push(`README.md: Essential MCP row must not list ${forbidden}`);
  }
}

if (!essentialServers.includes("firecrawl") || essentialServers.length !== 3) {
  errors.push(
    `mcp/mcp.json.template: expected 3 essential servers (firecrawl, context7, supabase); got ${essentialServers.join(", ")}`,
  );
}

if (!readme.includes("essential 3") && !readme.includes("Essential | Firecrawl, Context7, Supabase")) {
  errors.push("README.md: essential MCP copy must describe the 3-server template");
}

if (/\b128\b/.test(promotion) && /I packaged 128|I built 128|collection of 128/.test(promotion)) {
  errors.push("docs/PROMOTION.md: leftover 128 skill-count in launch copy");
}

if (publishing.includes("v1.4.2")) {
  errors.push("docs/PUBLISHING.md: must not use hardcoded v1.4.2 as the release example");
}

const promoPinned = promotion.match(/@kensaurus\/skills@(\d+\.\d+\.\d+)/);
if (promoPinned && promoPinned[1] !== version) {
  errors.push(
    `docs/PROMOTION.md: published version @${promoPinned[1]} does not match package.json ${version}`,
  );
}

if (gettingStarted.includes("#also-by-kensaurus")) {
  errors.push("docs/GETTING-STARTED.md: dead heading #also-by-kensaurus");
}

if (planLoops.includes("#skill-chaining----improve--iterate-any-repo")) {
  errors.push("docs/PLAN-LOOPS.md: dead README heading #skill-chaining----improve--iterate-any-repo");
}

if (gettingStarted.includes("#more-from-kensaurus") && !/^## More from KENSAURUS/m.test(readme)) {
  errors.push("README.md: missing ## More from KENSAURUS (GETTING-STARTED links to it)");
}

// Repo-local Cursor rules are mirrors of rules/. They load for every Cursor
// session in this repo, so a fork means the pack's own agents run on stale rules.
const localRules = join(root, ".cursor", "rules");
for (const name of existsSync(localRules) ? readdirSync(localRules) : []) {
  if (!name.endsWith(".mdc")) continue;
  if (!existsSync(join(root, "rules", name))) {
    errors.push(`.cursor/rules/${name}: no rules/${name} to mirror — delete it or add the canonical file`);
    continue;
  }
  if (read(`.cursor/rules/${name}`) !== read(`rules/${name}`)) {
    errors.push(`.cursor/rules/${name} differs from rules/${name} — copy rules/${name} over it (mirror, not fork)`);
  }
}

// One model plans and executes at different effort levels. Fail if the retired
// two-model framing returns to the living docs; CHANGELOG keeps the history.
for (const [label, text] of [["README.md", readme], ["docs/PLAN-LOOPS.md", planLoops], ["docs/GETTING-STARTED.md", gettingStarted]]) {
  const m = text.match(/execute with Composer 2\.5|fast implementation model|Composer 2\.5/i);
  if (m) errors.push(`${label}: retired two-model framing '${m[0]}' — describe effort routing (plan at high, execute at medium, judge fresh at high)`);
}

if (errors.length) {
  console.error("✗ Docs facts check failed:");
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}

console.log(`✓ Docs facts match package ${version} and essential MCP ${essentialServers.join(", ")}.`);
