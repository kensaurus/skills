#!/usr/bin/env node
/**
 * Generate the skill index from frontmatter and write it to two places:
 *   README.md     — the family counts table only, between
 *                   <!-- SKILL-INDEX:START --> / <!-- SKILL-INDEX:END -->
 *   docs/SKILLS.md — the full one-line-per-skill list (whole file)
 *
 * Source of truth: the directory name (validate-skills requires it to equal the
 * `name` frontmatter) + the `description` frontmatter of every
 * skills/<name>/SKILL.md and skills-cursor/<name>/SKILL.md. The one-liner is the
 * summary sentence of each description (the part before the "Use when…" triggers),
 * so this never drifts from the installed skills.
 *
 *   node scripts/generate-skill-index.mjs           # print both to stdout (preview)
 *   node scripts/generate-skill-index.mjs --write   # write README block + docs/SKILLS.md
 *   node scripts/generate-skill-index.mjs --check    # exit 1 if either is stale
 */
import { readdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const readmePath = join(repoRoot, "README.md");
const skillsDocPath = join(repoRoot, "docs", "SKILLS.md");
const START = "<!-- SKILL-INDEX:START -->";
const END = "<!-- SKILL-INDEX:END -->";

/** Family prefix → display heading. Anything unmatched falls into "Core & cross-cutting". */
const FAMILY_HEADINGS = {
  audit: "Audit — inspect; some then fix",
  plan: "Plan — audit first, change only after you approve",
  enhance: "Enhance — improve what already exists",
  design: "Design — build something new",
  backend: "Backend — server & data patterns",
  mobile: "Mobile — React Native / Capacitor",
  data: "Data — charts & pipelines",
  docs: "Docs — write it down clearly",
  housekeep: "Housekeeping — consolidate or clear one drifted register",
  workflow: "Workflows — multi-step recipes",
  test: "Test & QA — prove it works",
  deploy: "Deploy — ship & verify",
  debug: "Debug — find & fix what's broken",
  iterate: "Iterate — close the loop after launch",
  mushi: "Mushi Mushi — bug triage helpers",
  protocol: "Protocols — session guardrails",
  meta: "Authoring — build skills & MCP",
  thirdparty: "Third-party (upstream-maintained)",
  _other: "Core & cross-cutting",
  cursor: "Cursor IDE skills",
};
const FAMILY_ORDER = [
  "audit", "plan", "enhance", "design", "backend", "mobile", "data", "docs",
  "housekeep", "workflow", "test", "deploy", "debug", "iterate", "mushi", "protocol",
  "meta", "thirdparty", "_other",
];

/** Extract frontmatter name + a clean one-line summary from a SKILL.md file. */
function parseSkill(dir, name) {
  const raw = readFileSync(join(dir, name, "SKILL.md"), "utf8")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const block = fm[1];
  const lines = block.split("\n");

  const descLine = lines.findIndex((l) => /^description:/.test(l));
  if (descLine === -1) return { name, summary: "" };

  let description = lines[descLine].replace(/^description:[ \t]*/, "").trim();
  // Folded / literal block scalar (`>`, `>-`, `|`, `|-`) — gather indented lines.
  if (/^[>|][+-]?$/.test(description) || description === "") {
    const out = [];
    for (let i = descLine + 1; i < lines.length; i++) {
      if (/^[A-Za-z_][\w-]*:/.test(lines[i])) break; // next top-level key
      out.push(lines[i].trim());
    }
    description = out.join(" ");
  }
  description = description.replace(/^["']|["']$/g, "").replace(/\s+/g, " ").trim();

  // Roster flags: a user-only ritual leaves the always-on description roster;
  // a reference-only skill is hidden from the / menu.
  const slashOnly = /^disable-model-invocation:\s*true\s*$/m.test(block);
  const refOnly = /^user-invocable:\s*false\s*$/m.test(block);
  return { name, summary: summarize(description), slashOnly, refOnly };
}

/** First sentence / clause of the description, before the trigger list; capped. */
function summarize(desc) {
  if (!desc) return "";
  let s = desc;
  // Cut at the trigger boilerplate that follows the summary.
  const cut = s.search(/\s(?:Use when|Use for|Use this|Use to|Use PROACTIVELY|Triggers?:|Auto-detects|Detects the user)/i);
  if (cut > 0) s = s.slice(0, cut);
  // Keep only the first sentence, unless it is too short (40 chars or less) to
  // stand alone; then the following sentence stays too.
  const period = s.indexOf(". ");
  if (period > 40) s = s.slice(0, period);
  s = s.replace(/[.\s—-]+$/, "").trim();
  if (s.length > 140) {
    s = s.slice(0, 140).replace(/\s+\S*$/, "") + "…";
  }
  return s;
}

function collect(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, "SKILL.md")))
    .map((d) => parseSkill(dir, d.name))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function familyOf(name) {
  const prefix = name.split("-")[0];
  return FAMILY_ORDER.includes(prefix) ? prefix : "_other";
}

function renderGroup(title, items) {
  const lines = items.map((s) => {
    const tag = s.refOnly ? " _(reference only)_" : s.slashOnly ? ` — \`/${s.name}\` only` : "";
    return `| \`${s.name}\` | ${s.summary}${tag} |`;
  });
  return [
    `### ${title} (${items.length})`,
    "",
    "| Skill | What it does |",
    "|:------|:-------------|",
    ...lines,
  ].join("\n");
}

function build() {
  const skills = collect(join(repoRoot, "skills"));
  const cursorSkills = collect(join(repoRoot, "skills-cursor"));

  const buckets = new Map(FAMILY_ORDER.map((f) => [f, []]));
  for (const s of skills) buckets.get(familyOf(s.name)).push(s);

  const familyRows = [];
  for (const fam of FAMILY_ORDER) {
    const items = buckets.get(fam);
    if (!items.length) continue;
    familyRows.push({ fam, title: FAMILY_HEADINGS[fam], count: items.length, items });
  }
  if (cursorSkills.length) {
    familyRows.push({
      fam: "cursor",
      title: FAMILY_HEADINGS.cursor,
      count: cursorSkills.length,
      items: cursorSkills,
    });
  }

  const total = familyRows.reduce((n, r) => n + r.count, 0);

  const blurbs = {
    audit: "Check the codebase: security, UX, analytics, IAP, the skill pack",
    plan: "Write a fix plan you approve before any code changes",
    enhance: "Polish UI, forms, motion, SEO, PWA, email deliverability",
    design: "Create new UI, APIs, emails, themes from scratch",
    backend: "Auth, caching, queues, realtime, observability",
    mobile: "RN screens, emulators, Capacitor, App Store prep",
    data: "Charts, dashboards, ETL / cron jobs",
    docs: "READMEs, PRDs, RFCs with a reader-first voice",
    housekeep: "Consolidate one drifted register (gates, backlog, design tokens, dead code)",
    workflow: "End-to-end recipes (build, fix, ship, green the repo)",
    test: "Unit, Playwright, visual regression, load, red-team",
    deploy: "npm release + post-deploy smoke tests",
    debug: "Errors, Sentry, frontend-backend mismatches",
    iterate: "Post-launch feedback loops and agent-harness iteration",
    mushi: "Integrate the Mushi Mushi bug-report pipeline",
    protocol: "Keep browser automation from freezing",
    meta: "Author new skills or MCP servers",
    thirdparty: "Vendored upstream skills (Emil, UI/UX Pro Max, Vercel WIG)",
    _other: "Close everything, burndown, research, handoff",
    cursor: "Canvas, hooks, rules, PR splitter, CLI helpers",
  };

  const table = [
    "| Family | Count | In one sentence |",
    "|:-------|------:|:----------------|",
    ...familyRows.map((row) => `| [${row.title}](docs/SKILLS.md#${slug(`${row.title} (${row.count})`)}) | **${row.count}** | ${blurbs[row.fam] || ""} |`),
    `| **Total** | **${total}** | [Every skill, one line each](docs/SKILLS.md) |`,
  ].join("\n");

  const readmeBlock = [
    START,
    "",
    "#### Skill families at a glance",
    "",
    table,
    "",
    `_Generated from each skill's \`SKILL.md\` by \`npm run gen:skill-index\`. **${total} skills.** The full list is [docs/SKILLS.md](docs/SKILLS.md); trigger phrases are in [docs/CATALOG.md](docs/CATALOG.md)._`,
    "",
    END,
  ].join("\n");

  const doc = [
    "# Every skill, in plain English",
    "",
    `_Generated from each skill's \`SKILL.md\` by \`npm run gen:skill-index\`. Do not edit by hand. **${total} skills.**_`,
    "",
    "You do not memorize names. Describe the job in chat and the matching skill runs. Exact trigger phrases are in [CATALOG.md](CATALOG.md); the prefix and stage table is in [CATALOG.md — Skill Taxonomy](CATALOG.md#skill-taxonomy).",
    "",
    "Skills marked `/name only` are user-invoked rituals; `reference only` skills are loaded by other skills; every other skill auto-routes from a plain request.",
    "",
    "## Families",
    "",
    table.replaceAll("docs/SKILLS.md#", "#").replace("[Every skill, one line each](docs/SKILLS.md)", ""),
    "",
    ...familyRows.flatMap((row) => [renderGroup(row.title, row.items), ""]),
  ].join("\n");

  return { readmeBlock, doc };
}

/** GitHub-style heading anchor. */
function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

const { readmeBlock, doc } = build();

if (process.argv.includes("--write") || process.argv.includes("--check")) {
  const readme = readFileSync(readmePath, "utf8");
  const re = new RegExp(`${START}[\\s\\S]*?${END}`);
  if (!re.test(readme)) {
    console.error(`✗ Markers ${START} … ${END} not found in README.md. Add them where the family table should live.`);
    process.exit(1);
  }
  const nextReadme = readme.replace(re, readmeBlock);
  const currentDoc = existsSync(skillsDocPath) ? readFileSync(skillsDocPath, "utf8") : "";
  if (process.argv.includes("--check")) {
    if (nextReadme !== readme || currentDoc !== doc) {
      console.error("✗ Skill index is stale (README.md family table or docs/SKILLS.md). Run: npm run gen:skill-index");
      process.exit(1);
    }
    console.log("✓ Skill index is in sync (README.md + docs/SKILLS.md).");
    process.exit(0);
  }
  writeFileSync(readmePath, nextReadme);
  writeFileSync(skillsDocPath, doc);
  const n = (doc.match(/^\| `[a-z0-9-]+` \|/gm) || []).length;
  console.log(`✓ Wrote the family table to README.md and ${n} skills to docs/SKILLS.md.`);
} else {
  console.log(readmeBlock);
  console.log("\n---\n");
  console.log(doc);
}
