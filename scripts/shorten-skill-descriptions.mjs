#!/usr/bin/env node
/**
 * Rewrite SKILL.md description frontmatter to the house budget (320 chars).
 * Preserves the first summary sentence and a clipped "Use when/for/to" trigger
 * list. Does not touch skill bodies.
 *
 *   node scripts/shorten-skill-descriptions.mjs         # dry-run
 *   node scripts/shorten-skill-descriptions.mjs --write
 *   node scripts/shorten-skill-descriptions.mjs --self-test  # clip() cases (CI)
 */
import { readdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");
const DESC_MAX = 320;

const MOBILE_PATHS = [
  "**/ios/**",
  "**/android/**",
  "**/app.json",
  "**/app.config.*",
  "**/capacitor.config.*",
  "**/*.gradle",
  "**/Podfile",
];

const PATH_SKILLS = new Set([
  "mobile-rn-screen",
  "mobile-rn-performance",
  "mobile-capacitor-platform",
  "enhance-capacitor-ui",
]);

const SLASH_ONLY_CURSOR_SKILLS = new Set([
  "canvas",
  "create-hook",
  "create-rule",
  "create-skill",
  "create-subagent",
  "migrate-to-skills",
  "shell",
  "split-to-prs",
  "statusline",
  "update-cli-config",
  "update-cursor-settings",
]);

function readDescription(front) {
  const lines = front.split("\n");
  const start = lines.findIndex((l) => /^description:/.test(l));
  if (start === -1) return null;
  const buf = [];
  const head = lines[start].slice("description:".length).trim();
  if (head && !/^[>|][-+0-9]*$/.test(head)) buf.push(head);
  for (let j = start + 1; j < lines.length; j++) {
    if (/^[A-Za-z0-9_-]+:/.test(lines[j])) break;
    buf.push(lines[j].trim());
  }
  return buf.join(" ").replace(/\s+/g, " ").replace(/^["']|["']$/g, "").trim();
}

function clip(text, max) {
  if (text.length <= max) return text;
  let cut = text.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  if (sp > Math.floor(max * 0.55)) cut = cut.slice(0, sp);
  // A clip inside a quoted trigger or a parenthetical leaves it open
  // ("tidy.  /  (add CI.): drop the opener and what follows it.
  if ((cut.match(/"/g) ?? []).length % 2) cut = cut.slice(0, cut.lastIndexOf('"'));
  if (cut.lastIndexOf("(") > cut.lastIndexOf(")")) cut = cut.slice(0, cut.lastIndexOf("("));
  // Trailing separators ("Motion /.", "→.") and a dangling "or" / "and".
  let prev;
  do {
    prev = cut;
    cut = cut.replace(/[,:;.\s—–\-/→|&+]+$/, "").replace(/\s(?:or|and)$/i, "");
  } while (cut !== prev);
  return cut + ".";
}

function firstSentence(text, min = 24, max = 180) {
  const period = text.search(/\.\s/);
  if (period >= min && period + 1 <= max) return text.slice(0, period + 1);
  if (text.length <= max) return text;
  return clip(text, max);
}

function shorten(desc) {
  const s = desc.replace(/\s+/g, " ").trim();
  if (s.length <= DESC_MAX) return s;

  const triggerRe =
    /\s((?:Use when|Use for|Use this|Use to|Use PROACTIVELY|Triggers?:)[\s\S]*)/i;
  const m = s.match(triggerRe);
  const summary = firstSentence(m ? s.slice(0, m.index).trim() : s);
  let trigger = "";
  if (m) {
    trigger = m[1].trim();
    const tp = trigger.search(/\.\s/);
    if (tp > 20) trigger = trigger.slice(0, tp + 1);
  }

  if (trigger) {
    const joined = `${summary} ${trigger}`.replace(/\s+/g, " ").trim();
    if (joined.length <= DESC_MAX) return joined;
    const budget = DESC_MAX - summary.length - 1;
    if (budget >= 48) return `${summary} ${clip(trigger, budget)}`.trim();
    return clip(summary, DESC_MAX);
  }
  return clip(s, DESC_MAX);
}

function foldDescription(text) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > 88 && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return ["description: >", ...lines.map((l) => `  ${l}`)].join("\n");
}

function parseEntries(front) {
  const lines = front.split("\n");
  const entries = [];
  let current = null;
  for (const line of lines) {
    if (/^[A-Za-z0-9_-]+:/.test(line)) {
      if (current) entries.push(current);
      current = { key: line.split(":")[0], lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) entries.push(current);
  return entries;
}

function rebuildFront(entries) {
  return entries.map((e) => e.lines.join("\n")).join("\n");
}

function setKey(entries, key, block) {
  const idx = entries.findIndex((e) => e.key === key);
  const lines = block.replace(/\n$/, "").split("\n");
  if (idx >= 0) entries[idx] = { key, lines };
  else entries.push({ key, lines });
}

function hasKey(entries, key) {
  return entries.some((e) => e.key === key);
}

if (process.argv.includes("--self-test")) {
  const cases = [
    ['Use when "housekeep", "clean up repo", or "tidy the repo".', 50, 'Use when "housekeep", "clean up repo".'],
    ["Three.js/R3F, GSAP, or Motion / scroll choreography", 32, "Three.js/R3F, GSAP, or Motion."],
    ["Fix the bug and ship → the deploy verifier", 26, "Fix the bug and ship."],
    ["Install guardrails (secrets, injection, add CI checks) now", 40, "Install guardrails."],
    ["Short enough already.", 80, "Short enough already."],
  ];
  let bad = 0;
  for (const [input, max, want] of cases) {
    const got = clip(input, max);
    if (got !== want) {
      bad++;
      console.error(`clip(${JSON.stringify(input)}, ${max}) = ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
    }
  }
  console.log(bad ? `self-test: ${bad} failure(s)` : `self-test: ${cases.length} clip cases pass`);
  process.exit(bad ? 1 : 0);
}

let changed = 0;
let shortened = 0;
const stillLong = [];

for (const group of ["skills", "skills-cursor"]) {
  const base = join(repoRoot, group);
  for (const dir of readdirSync(base)) {
    const skillFile = join(base, dir, "SKILL.md");
    if (!existsSync(skillFile)) continue;
    const raw = readFileSync(skillFile, "utf8").replace(/\r\n/g, "\n");
    const fm = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!fm) continue;
    const entries = parseEntries(fm[1]);
    const desc = readDescription(fm[1]);
    if (!desc) continue;

    let dirty = false;
    const nextDesc = shorten(desc);
    if (nextDesc !== desc) {
      setKey(entries, "description", foldDescription(nextDesc));
      dirty = true;
      shortened++;
    }
    if (nextDesc.length > DESC_MAX) stillLong.push(`${group}/${dir}:${nextDesc.length}`);

    if (PATH_SKILLS.has(dir) && !hasKey(entries, "paths")) {
      setKey(
        entries,
        "paths",
        ["paths:", ...MOBILE_PATHS.map((p) => `  - "${p}"`)].join("\n"),
      );
      dirty = true;
    }

    if (
      group === "skills-cursor" &&
      SLASH_ONLY_CURSOR_SKILLS.has(dir) &&
      !hasKey(entries, "disable-model-invocation")
    ) {
      setKey(entries, "disable-model-invocation", "disable-model-invocation: true");
      dirty = true;
    }

    if (!dirty) continue;
    changed++;
    const next = `---\n${rebuildFront(entries)}\n---\n${fm[2]}`;
    if (WRITE) writeFileSync(skillFile, next);
  }
}

console.log(
  `${WRITE ? "Wrote" : "Would write"} ${changed} skill(s); shortened ${shortened} description(s).`,
);
if (stillLong.length) {
  console.error("Still over budget:\n" + stillLong.map((s) => "  " + s).join("\n"));
  process.exit(1);
}
