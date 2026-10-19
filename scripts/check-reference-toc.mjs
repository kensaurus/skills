#!/usr/bin/env node
/**
 * Progressive-disclosure hygiene for skill reference files, after Anthropic's
 * skill-authoring guidance (platform.claude.com/docs/en/agents-and-tools/
 * agent-skills/best-practices, "Progressive disclosure patterns"):
 *
 *   1. A reference file longer than 100 lines opens with a "## Contents" list,
 *      so a partial read (head -100) still shows the whole scope.
 *   2. References stay one level deep: a Markdown file inside a skill that a
 *      reference file links to is also linked from that skill's SKILL.md.
 *   3. A relative Markdown link from any file in a skill resolves to a file.
 *
 *   node scripts/check-reference-toc.mjs             # report; exit 1 on findings
 *   node scripts/check-reference-toc.mjs --fix       # insert missing Contents lists
 *   node scripts/check-reference-toc.mjs --self-test # exercise the checks on a fixture
 */
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = process.argv.includes("--fix");
const SELF_TEST = process.argv.includes("--self-test");
// The guidance's own threshold: Claude previews long files with head -100.
const TOC_MIN_LINES = 100;
const TOC_HEADING = /^##\s+(Contents|Table of contents)\b/i;
const MD_LINK = /\]\(([^)\s#]+\.md)(?:#[^)]*)?\)/g;

function walkMd(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === ".git") continue;
      walkMd(p, out);
    } else if (name.endsWith(".md")) {
      out.push(p);
    }
  }
  return out;
}

function skillDirs(root) {
  const dirs = [];
  for (const group of ["skills", "skills-cursor"]) {
    const base = join(root, group);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base)) {
      const dir = join(base, name);
      if (statSync(dir).isDirectory() && existsSync(join(dir, "SKILL.md"))) dirs.push(dir);
    }
  }
  return dirs;
}

/** Markdown with fenced blocks and inline code removed: links shown as examples are not references. */
function prose(text) {
  return text.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "").replace(/`[^`\n]*`/g, "");
}

/** Relative .md link targets of one file, resolved to absolute paths. */
function linkTargets(file) {
  const targets = new Set();
  for (const m of prose(readFileSync(file, "utf8")).matchAll(MD_LINK)) {
    const raw = m[1];
    if (/^[a-z]+:/i.test(raw) || raw.startsWith("/")) continue; // URLs and absolute paths
    targets.add(resolve(dirname(file), raw));
  }
  return targets;
}

/** GitHub-style anchor for a heading. */
function slug(heading) {
  return heading
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Insert a "## Contents" list built from the H2 headings, one blank line after the H1. */
function insertToc(file) {
  const lines = readFileSync(file, "utf8").split("\n");
  const h2s = lines
    .filter((l) => /^##\s+/.test(l) && !TOC_HEADING.test(l))
    .map((l) => l.replace(/^##\s+/, "").trim());
  if (h2s.length < 2) return false; // nothing worth indexing
  const toc = ["## Contents", "", ...h2s.map((h) => `- [${h}](#${slug(h)})`), ""];
  let anchor = lines.findIndex((l) => /^#\s+/.test(l));
  if (anchor === -1 && lines[0] === "---") anchor = lines.indexOf("---", 1); // after frontmatter
  let at = anchor + 1;
  while (at < lines.length && lines[at].trim() === "") at++;
  lines.splice(at, 0, ...(anchor === -1 ? toc : ["", ...toc]));
  if (anchor !== -1) lines.splice(anchor + 1, at - anchor - 1); // exactly one blank line after the anchor
  writeFileSync(file, lines.join("\n"));
  return true;
}

function check(root) {
  const findings = [];
  let files = 0;
  for (const dir of skillDirs(root)) {
    const skillMd = join(dir, "SKILL.md");
    const skillLinks = linkTargets(skillMd);
    const refs = walkMd(dir).filter((f) => f !== skillMd);
    for (const f of [skillMd, ...refs]) {
      for (const t of linkTargets(f)) {
        if (!existsSync(t)) findings.push({ kind: "broken", file: f, detail: `links ${relative(dir, t)}, which does not exist` });
      }
    }
    for (const f of refs) {
      files++;
      const lines = readFileSync(f, "utf8").split("\n");
      if (lines.length > TOC_MIN_LINES && !lines.some((l) => TOC_HEADING.test(l))) {
        findings.push({ kind: "toc", file: f, detail: `${lines.length} lines and no "## Contents" list` });
      }
      for (const t of linkTargets(f)) {
        // Other skills' files, template placeholders and broken paths are not nesting.
        if (!existsSync(t) || t === skillMd || !t.startsWith(dir + sep)) continue;
        if (!skillLinks.has(t)) {
          findings.push({ kind: "nested", file: f, detail: `links ${relative(dir, t)}, which SKILL.md does not link (keep references one level deep)` });
        }
      }
    }
  }
  return { findings, files };
}

function run(root, { fix = false, quiet = false } = {}) {
  let result = check(root);
  if (fix) {
    let fixed = 0;
    for (const f of result.findings.filter((x) => x.kind === "toc")) if (insertToc(f.file)) fixed++;
    if (!quiet && fixed) console.log(`  inserted a Contents list in ${fixed} file(s)`);
    result = check(root);
  }
  return result;
}

function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), "kenji-reftoc-"));
  const refs = join(tmp, "skills", "demo", "references");
  mkdirSync(refs, { recursive: true });
  writeFileSync(join(tmp, "skills", "demo", "SKILL.md"),
    "---\nname: demo\ndescription: d\n---\n\n# demo\n\nSee [a](references/a.md) and [gone](references/missing.md).\n\n```md\nA template: [docs](./docs/api.md) is an example, not a reference.\n```\n");
  writeFileSync(join(refs, "a.md"),
    ["# A reference", "", "## One", ...Array(60).fill("x"), "## Two", ...Array(60).fill("y"), "See [b](b.md)."].join("\n"));
  writeFileSync(join(refs, "b.md"), "# b\n");
  const errors = [];
  const kinds = run(tmp, { quiet: true }).findings.map((f) => f.kind).sort().join(",");
  if (kinds !== "broken,nested,toc") errors.push(`expected broken,nested,toc; got ${kinds || "(none)"}`);
  const after = run(tmp, { fix: true, quiet: true }).findings;
  if (after.some((f) => f.kind === "toc")) errors.push("--fix did not insert the Contents list");
  const fixedHead = readFileSync(join(refs, "a.md"), "utf8").split("\n").slice(0, 7).join("\n");
  const wantHead = "# A reference\n\n## Contents\n\n- [One](#one)\n- [Two](#two)\n";
  if (fixedHead !== wantHead) errors.push(`Contents list malformed:\n${fixedHead}`);
  if (after.filter((f) => f.kind === "nested").length !== 1) errors.push("the nested-reference finding should survive --fix");
  if (after.filter((f) => f.kind === "broken").length !== 1) errors.push("the broken-link finding should survive --fix");
  rmSync(tmp, { recursive: true, force: true });
  if (errors.length) {
    console.error("✗ check-reference-toc self-test failed:");
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log("✓ check-reference-toc self-test passed");
}

if (SELF_TEST) {
  selfTest();
} else {
  const { findings, files } = run(repoRoot, { fix: FIX });
  if (findings.length) {
    console.error(`✗ reference files: ${findings.length} finding(s) across ${files} file(s)`);
    for (const f of findings) console.error(`  - ${relative(repoRoot, f.file)}: ${f.detail}`);
    console.error('  Fix: add a "## Contents" list (or run with --fix), link the file from SKILL.md, or repair the path.');
    process.exit(1);
  }
  console.log(`✓ reference files: ${files} checked; Contents list present over ${TOC_MIN_LINES} lines, links one level deep and resolving.`);
}
