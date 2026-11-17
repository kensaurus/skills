#!/usr/bin/env node
/**
 * FILE: render-walkthrough.mjs
 * PURPOSE: Write the animated session walkthroughs shown in the README and
 * docs/GETTING-STARTED.md as self-contained animated SVG files.
 *
 * USAGE:
 *   node scripts/render-walkthrough.mjs
 *
 * Why SVG and not GIF: no browser, no ffmpeg, no dependency. Each file is a
 * few KB of text, stays sharp at any width, and GitHub renders it from an
 * <img> tag. The animation is plain CSS opacity keyframes; viewers who ask
 * for reduced motion get the final frame with every line visible.
 *
 * Each scene is a list of lines. A line is [kind, text, holdSeconds]:
 *   you   what the user types            say   the agent's plain reply
 *   run   the playbook that starts       step  a step that completes
 *   done  the result                     gap   an empty line
 *
 * OUTPUTS: docs/screenshots/walkthrough-<name>.svg, and site/ copies.
 */
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SCENES = {
  kenji: {
    title: "One command to remember",
    lines: [
      ["you", "/kenji the login page is broken for some users", 1.6],
      ["say", "That is a bug to fix and ship. One playbook fits.", 1.2],
      ["run", "workflow-fix-and-ship", 1.0],
      ["step", "Reproduced: session cookie dropped on Safari", 0.9],
      ["step", "Failing test written, then the fix", 0.9],
      ["step", "Checked in a real browser", 0.9],
      ["done", "Tests green. PR opened. Nothing merged without you.", 3.2],
    ],
  },
  build: {
    title: "Ask first, test first",
    lines: [
      ["you", "grill me before I build a referral program", 1.6],
      ["say", "Reward on signup or on first payment? I'd pick first payment.", 1.4],
      ["you", "first payment", 1.0],
      ["step", "Decision log saved. You approved it.", 1.0],
      ["you", "build it from those decisions", 1.2],
      ["run", "workflow-build-feature", 1.0],
      ["step", "Spec, then a failing test", 0.9],
      ["step", "Smallest change that passes", 0.9],
      ["done", "Smoke test passed. PR opened.", 3.2],
    ],
  },
  audit: {
    title: "Findings you can check",
    lines: [
      ["you", "is this app safe to launch?", 1.6],
      ["run", "audit-security", 1.0],
      ["step", "High: admin route has no auth check  api/admin/route.ts:14", 1.1],
      ["step", "Medium: user table readable by anyone  migrations/0007.sql:3", 1.1],
      ["step", "Low: stack trace shown to users  lib/errors.ts:41", 1.1],
      ["say", "Three findings, each with a file and line. Fix them now?", 1.4],
      ["you", "yes", 0.8],
      ["done", "Fixed, re-tested, and listed in the report.", 3.2],
    ],
  },
};

const W = 880;
const PAD = 28;
const BAR = 44;
const LINE = 30;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const STYLE = {
  you: { prefix: "you  ", prefixFill: "#a3e635", fill: "#f4f4f5", weight: 600 },
  say: { prefix: "     ", prefixFill: "#71717a", fill: "#d4d4d8", weight: 400 },
  run: { prefix: "run  ", prefixFill: "#38bdf8", fill: "#7dd3fc", weight: 600 },
  step: { prefix: "  ✓  ", prefixFill: "#4ade80", fill: "#d4d4d8", weight: 400 },
  done: { prefix: "done ", prefixFill: "#a3e635", fill: "#a3e635", weight: 600 },
};

function render(name, scene) {
  const total = scene.lines.reduce((t, l) => t + l[2], 0) + 0.6;
  const height = BAR + PAD + scene.lines.length * LINE + PAD;
  let at = 0.4;
  const css = [];
  const rows = scene.lines.map(([kind, text, hold], i) => {
    const style = STYLE[kind];
    const start = ((at / total) * 100).toFixed(2);
    const shown = (((at + 0.25) / total) * 100).toFixed(2);
    at += hold;
    css.push(`@keyframes l${i}{0%,${start}%{opacity:0}${shown}%,97%{opacity:1}100%{opacity:0}}`);
    css.push(`.l${i}{animation:l${i} ${total.toFixed(1)}s linear infinite}`);
    const y = BAR + PAD + i * LINE + 6;
    return `<text class="l${i}" x="${PAD}" y="${y}" font-weight="${style.weight}"><tspan fill="${style.prefixFill}">${esc(style.prefix)}</tspan><tspan fill="${style.fill}">${esc(text)}</tspan></text>`;
  });
  const label = `${scene.title}. ` + scene.lines
    .map(([kind, text]) => (kind === "you" ? `You say: ${text}.` : kind === "run" ? `The ${text} playbook runs.` : `${text}.`))
    .join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${height}" width="${W}" height="${height}" role="img" aria-label="${esc(label).replace(/"/g, "&quot;")}">
<title>${esc(scene.title)}</title>
<style>
text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;font-size:17px;white-space:pre}
.t{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:14px;font-weight:600;fill:#a1a1aa}
${css.join("\n")}
@media (prefers-reduced-motion:reduce){text{animation:none!important;opacity:1!important}}
</style>
<rect width="${W}" height="${height}" rx="14" fill="#18181b"/>
<rect width="${W}" height="${BAR}" rx="14" fill="#27272a"/>
<rect y="${BAR - 14}" width="${W}" height="14" fill="#27272a"/>
<circle cx="24" cy="22" r="6" fill="#52525b"/><circle cx="44" cy="22" r="6" fill="#52525b"/><circle cx="64" cy="22" r="6" fill="#52525b"/>
<text class="t" x="${W / 2}" y="27" text-anchor="middle">${esc(scene.title)}</text>
${rows.join("\n")}
</svg>
`;
  const out = join(root, "docs", "screenshots", `walkthrough-${name}.svg`);
  writeFileSync(out, svg);
  mkdirSync(join(root, "site"), { recursive: true });
  copyFileSync(out, join(root, "site", `walkthrough-${name}.svg`));
  return { out, bytes: Buffer.byteLength(svg), seconds: total };
}

for (const [name, scene] of Object.entries(SCENES)) {
  const r = render(name, scene);
  console.log(`✓ ${r.out} (${r.bytes} bytes, ${r.seconds.toFixed(1)} s loop)`);
}
