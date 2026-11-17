#!/usr/bin/env node
/**
 * FILE: check-md-structure.mjs
 * PURPOSE: Fail CI on markdown whose code fences render wrong in CommonMark:
 *   - a fence left open to the end of the file;
 *   - a fence line with an info string (```json) inside an open fence of the
 *     same character and length. It cannot close that fence, so the next bare
 *     fence closes the OUTER block early and the rest renders as live markdown.
 *     Use a longer outer fence (````markdown) for examples that contain fences.
 * Scans every shipped .md/.mdc file except vendored thirdparty-* skills.
 *
 * USAGE:
 *   node scripts/check-md-structure.mjs
 *   node scripts/check-md-structure.mjs --self-test
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["skills", "skills-cursor", "commands", "commands-portable", "agents", "rules", "docs", "hooks", "mcp", ".cursor/rules"];
const FILES = ["README.md", "AGENTS.md", "CHANGELOG.md", ".github/SECURITY.md", ".github/CONTRIBUTING.md"];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(md|mdc)$/.test(name)) out.push(p);
  }
  return out;
}

/** Return structure errors for one file's text. */
export function checkFences(rel, text) {
  const errors = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let open = null;
  let inFrontmatter = lines[0] === "---";
  lines.forEach((line, i) => {
    if (inFrontmatter) {
      if (i > 0 && line === "---") inFrontmatter = false;
      return;
    }
    const m = line.match(/^( {0,3})(`{3,}|~{3,})(.*)$/);
    if (!m) return;
    const ch = m[2][0];
    const len = m[2].length;
    const info = m[3].trim();
    if (!open) {
      open = { ch, len, line: i + 1, info };
      return;
    }
    if (ch !== open.ch || len < open.len) return; // literal content inside the open fence
    if (info === "") {
      open = null;
      return;
    }
    errors.push(
      `${rel}:${i + 1}: fence "${m[2]}${info}" inside the ${open.ch.repeat(open.len)}${open.info} block from line ${open.line}; the next bare fence closes the outer block — lengthen the outer fence`,
    );
  });
  if (open) errors.push(`${rel}:${open.line}: fence ${open.ch.repeat(open.len)}${open.info} is never closed`);
  return errors;
}

function selfTest() {
  const fail = [];
  const nested = checkFences("t.md", "```markdown\n# T\n```json\n{}\n```\nafter\n```\n");
  if (!nested.some((e) => e.includes("lengthen the outer fence"))) fail.push("missed a nested fence");
  const longer = checkFences("t.md", "````markdown\n```json\n{}\n```\n````\n");
  if (longer.length) fail.push(`flagged a correctly lengthened outer fence: ${longer.join("; ")}`);
  const unclosed = checkFences("t.md", "text\n```bash\nls\n");
  if (!unclosed.some((e) => e.includes("never closed"))) fail.push("missed an unclosed fence");
  const front = checkFences("t.md", "---\nname: x\n---\n```\nok\n```\n");
  if (front.length) fail.push("flagged frontmatter or a balanced fence");
  if (fail.length) {
    for (const f of fail) console.error(`✗ ${f}`);
    process.exit(1);
  }
  console.log("✓ check-md-structure self-test passed");
}

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  const files = DIRS.flatMap((d) => walk(join(repoRoot, d)));
  for (const f of FILES) if (existsSync(join(repoRoot, f))) files.push(join(repoRoot, f));
  const errors = [];
  for (const file of files) {
    const rel = relative(repoRoot, file).replace(/\\/g, "/");
    if (rel.includes("/thirdparty-")) continue;
    errors.push(...checkFences(rel, readFileSync(file, "utf8")));
  }
  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(`\n✗ ${errors.length} markdown fence error(s).`);
    process.exit(1);
  }
  console.log(`✓ Markdown fences balanced in ${files.length} files.`);
}
