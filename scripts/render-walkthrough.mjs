#!/usr/bin/env node
/**
 * FILE: render-walkthrough.mjs
 * PURPOSE: Write the animated captures and the gate diagram used in the
 * README, docs/GETTING-STARTED.md, the site, and launch articles.
 *
 * USAGE:
 *   node scripts/render-walkthrough.mjs                  # the SVG files
 *   node scripts/render-walkthrough.mjs --frames <dir>   # also one static SVG per frame
 *
 * The captures replay REAL output. Each scene's lines were copied from a run
 * of the command it shows (the date is in the scene). Lines are wrapped to
 * fit and temp paths are shortened; nothing else is edited. A line marked
 * `claim` is the one illustrative line: what an agent typically says before
 * the gate answers.
 *
 * Why SVG first: no browser and no dependency, a few KB each, sharp at any
 * width, and GitHub renders it from an <img> tag. Viewers who ask for reduced
 * motion get the final frame.
 *
 * GIF copies (for sites that do not take SVG: Zenn, note, X) are built from
 * the frame files with a browser screenshot per frame and ffmpeg. The recipe
 * is in docs/screenshots/README.md.
 *
 * Line kinds:
 *   cmd    a command the user or the host runs      out   command output
 *   ok     output that means "pass"                 stop  output that means "blocked"
 *   claim  what the agent says (illustrative)       gap   an empty line
 *
 * OUTPUTS: docs/screenshots/{capture-*.svg, gate-diagram-{en,ja}.svg} and site/ copies.
 */
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const framesAt = process.argv.indexOf("--frames");
const framesDir = framesAt === -1 ? null : process.argv[framesAt + 1];

const SCENES = {
  // hooks/completion-gate.mjs --host=claude, run 2026-11-17 against a state
  // file with two open items, then again with every item checked.
  gate: {
    title: "The completion gate",
    lines: [
      ["cmd", "cat .cursor/complete-everything-state.md", 1.2],
      ["out", "- [x] Invite link API", 0.3],
      ["out", "- [x] Failing test written first", 0.3],
      ["out", "- [ ] Error message for an expired link", 0.3],
      ["out", "- [ ] Re-run typecheck, lint and tests after the last edit", 1.4],
      ["gap", "", 0.2],
      ["claim", "All done. The feature is complete.", 1.6],
      ["gap", "", 0.2],
      ["cmd", "node completion-gate.mjs --host=claude    (the Stop hook)", 1.0],
      ["stop", "decision: block", 0.6],
      ["stop", "Completion gate: 2 actionable checklist items remain", 0.3],
      ["stop", "(follow-up 1 of 3 while nothing closes).", 0.6],
      ["out", "- Error message for an expired link", 0.3],
      ["out", "- Re-run typecheck, lint and tests after the last edit", 0.3],
      ["out", "Do not claim completion while actionable items remain.", 2.2],
      ["gap", "", 0.2],
      ["cmd", "node completion-gate.mjs --host=claude    (both items now checked)", 1.0],
      ["ok", "{}    nothing left, so the agent may stop", 3.4],
    ],
  },
  // claude -p "/kenji" from a local install of 2.8.0, run 2026-11-17.
  kenji: {
    title: "/kenji with no job shows the menu",
    lines: [
      ["cmd", "/kenji", 1.2],
      ["out", "What do you want to do? Say the job in your own words and", 0.2],
      ["out", "I'll pick the playbook and run it.", 1.0],
      ["gap", "", 0.2],
      ["out", "Understand a repo you just opened     workflow-onboard", 0.35],
      ["out", "Decide what to build before any code  workflow-grilling", 0.35],
      ["out", "Build a feature                       workflow-build-feature", 0.35],
      ["out", "Fix a bug and ship the fix            workflow-fix-and-ship", 0.35],
      ["out", "Find out why something errors         debug-error", 0.35],
      ["out", "Get a diff or PR reviewed             audit-code-review", 0.35],
      ["out", "Check security                        audit-security", 0.35],
      ["out", "Get every check green                 workflow-green-repo", 0.35],
      ["out", "Finish a plan with nothing parked     complete-everything", 0.35],
      ["out", "...and 9 more", 3.2],
    ],
  },
  // node bin/install.mjs --list-profiles at v2.8.1, run 2026-11-17.
  profiles: {
    title: "Install only what you need",
    lines: [
      ["cmd", "npx @kensaurus/skills --list-profiles", 1.2],
      ["out", "Profiles for --profile <name>[,<name>]. core is part of every profile.", 0.8],
      ["gap", "", 0.1],
      ["out", "core      Core — 31 skills. The daily loop: orient, grill, build, fix,", 0.1],
      ["out", "          review, test, ship.", 0.5],
      ["out", "web       Web UI — 44 skills. Design, polish, and audit web front ends.", 0.5],
      ["out", "backend   Backend and data — 35 skills. APIs, databases, auth,", 0.1],
      ["out", "          resilience, LLM features.", 0.5],
      ["out", "mobile    Mobile — 16 skills. React Native, Capacitor, emulators.", 0.5],
      ["out", "growth    Growth — 22 skills. Go to market, onboarding, SEO, pricing.", 0.5],
      ["out", "maintain  Maintain — 28 skills. CI gates, dead code, docs sync.", 0.5],
      ["out", "all       Everything in skills/. The default.", 1.6],
      ["gap", "", 0.1],
      ["cmd", "npx @kensaurus/skills --auto --profile core", 3.2],
    ],
  },
};

const W = 920;
const PAD = 28;
const BAR = 44;
const LINE = 27;
const FONT = 'ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace';
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const STYLE = {
  cmd: { prefix: "$ ", prefixFill: "#a3e635", fill: "#f4f4f5", weight: 600 },
  out: { prefix: "  ", prefixFill: "#71717a", fill: "#d4d4d8", weight: 400 },
  ok: { prefix: "  ", prefixFill: "#4ade80", fill: "#4ade80", weight: 600 },
  stop: { prefix: "  ", prefixFill: "#fbbf24", fill: "#fbbf24", weight: 600 },
  claim: { prefix: "agent  ", prefixFill: "#38bdf8", fill: "#bae6fd", weight: 400 },
  gap: { prefix: "", prefixFill: "#000", fill: "#000", weight: 400 },
};

function chrome(title, height, inner, style, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${height}" width="${W}" height="${height}" role="img" aria-label="${esc(label).replace(/"/g, "&quot;")}">
<title>${esc(title)}</title>
<style>
text{font-family:${FONT};font-size:16px;white-space:pre}
.t{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:14px;font-weight:600;fill:#a1a1aa}
${style}
</style>
<rect width="${W}" height="${height}" rx="14" fill="#18181b"/>
<rect width="${W}" height="${BAR}" rx="14" fill="#27272a"/>
<rect y="${BAR - 14}" width="${W}" height="14" fill="#27272a"/>
<circle cx="24" cy="22" r="6" fill="#52525b"/><circle cx="44" cy="22" r="6" fill="#52525b"/><circle cx="64" cy="22" r="6" fill="#52525b"/>
<text class="t" x="${W / 2}" y="27" text-anchor="middle">${esc(title)}</text>
${inner}
</svg>
`;
}

function row(kind, text, i, cls) {
  if (kind === "gap") return "";
  const style = STYLE[kind];
  const y = BAR + PAD + i * LINE + 4;
  return `<text${cls ? ` class="${cls}"` : ""} x="${PAD}" y="${y}" font-weight="${style.weight}"><tspan fill="${style.prefixFill}">${esc(style.prefix)}</tspan><tspan fill="${style.fill}">${esc(text)}</tspan></text>`;
}

function renderScene(name, scene) {
  const total = scene.lines.reduce((t, l) => t + l[2], 0) + 0.6;
  const height = BAR + PAD + scene.lines.length * LINE + PAD - 8;
  let at = 0.4;
  const css = [];
  const frames = [];
  const rows = scene.lines.map(([kind, text, hold], i) => {
    const start = ((at / total) * 100).toFixed(2);
    const shown = (((at + 0.2) / total) * 100).toFixed(2);
    at += hold;
    css.push(`@keyframes l${i}{0%,${start}%{opacity:0}${shown}%,97%{opacity:1}100%{opacity:0}}`);
    css.push(`.l${i}{animation:l${i} ${total.toFixed(1)}s linear infinite}`);
    frames.push({ upTo: i, hold });
    return row(kind, text, i, `l${i}`);
  });
  const label = `${scene.title}. ` + scene.lines
    .filter(([kind]) => kind !== "gap")
    .map(([kind, text]) => (kind === "cmd" ? `Command: ${text}.` : kind === "claim" ? `The agent says: ${text}` : text))
    .join(" ");
  css.push("@media (prefers-reduced-motion:reduce){text{animation:none!important;opacity:1!important}}");
  const svg = chrome(scene.title, height, rows.join("\n"), css.join("\n"), label);
  const out = join(root, "docs", "screenshots", `capture-${name}.svg`);
  writeFileSync(out, svg);
  copyFileSync(out, join(root, "site", `capture-${name}.svg`));

  if (framesDir) {
    // One static SVG per step, plus a list ffmpeg's concat demuxer reads.
    const dir = join(framesDir, name);
    mkdirSync(dir, { recursive: true });
    const list = [];
    const shown = frames.filter((f) => scene.lines[f.upTo][0] !== "gap" || f.upTo === 0);
    shown.forEach((f, n) => {
      const inner = scene.lines.slice(0, f.upTo + 1).map(([kind, text], i) => row(kind, text, i, "")).join("\n");
      const file = `f${String(n).padStart(2, "0")}`;
      writeFileSync(join(dir, `${file}.svg`), chrome(scene.title, height, inner, "", scene.title));
      // A gap line's pause belongs to the frame before it.
      let hold = f.hold;
      for (let k = f.upTo + 1; k < scene.lines.length && scene.lines[k][0] === "gap"; k++) hold += scene.lines[k][2];
      list.push(`file '${file}.png'`, `duration ${hold.toFixed(2)}`);
    });
    list.push(`file 'f${String(shown.length - 1).padStart(2, "0")}.png'`);
    writeFileSync(join(dir, "frames.txt"), list.join("\n") + "\n");
    writeFileSync(join(dir, "size.txt"), `${W} ${height}\n`);
  }
  return { out, bytes: Buffer.byteLength(svg), seconds: total };
}

// ---- gate diagram: three parts and the loop between them --------------------
const DIAGRAM = {
  en: {
    title: "How the completion gate decides the work is done",
    font: 'system-ui,-apple-system,"Segoe UI",sans-serif',
    boxes: [
      ["1", "State file", ["The checklist, written to disk.", "It survives context compaction."]],
      ["2", "Stop hook", ["Runs when the agent tries to stop.", "Open items? Send it back."]],
      ["3", "Judge", ["A second agent, fresh context.", "Request, diff, and test evidence."]],
    ],
    back: "open items remain: keep working (3 tries with no progress, then give up)",
    forward: ["agent tries to stop", "all items checked"],
    verdicts: ["PASS: done", "CONTINUE: back to work", "BLOCKED: a person must act"],
  },
  ja: {
    title: "完了ゲートが「終わった」と判断するまで",
    font: '"Hiragino Sans","Yu Gothic UI","Meiryo","Noto Sans JP",system-ui,sans-serif',
    boxes: [
      ["1", "状態ファイル", ["チェックリストをディスクに書く。", "文脈が圧縮されても残る。"]],
      ["2", "Stop フック", ["エージェントが止まる瞬間に動く。", "未完了があれば差し戻す。"]],
      ["3", "判定役", ["別のエージェントが新しい文脈で、", "依頼・差分・検証結果を照合する。"]],
    ],
    back: "未完了が残っている: 作業を続ける(進展なしが3回続いたら諦める)",
    forward: ["止まろうとする", "全項目チェック済み"],
    verdicts: ["PASS: 完了", "CONTINUE: 作業に戻る", "BLOCKED: 人の対応が必要"],
  },
};

function renderDiagram(lang) {
  const d = DIAGRAM[lang];
  const DW = 1200;
  const DH = 470;
  const bw = 300;
  const bh = 150;
  const gap = 110;
  const x0 = (DW - (bw * 3 + gap * 2)) / 2;
  const y0 = 120;
  const xs = [0, 1, 2].map((i) => x0 + i * (bw + gap));
  const boxes = d.boxes.map(([n, name, lines], i) => `
<rect x="${xs[i]}" y="${y0}" width="${bw}" height="${bh}" rx="14" fill="#fff" stroke="#18181b" stroke-width="2"/>
<circle cx="${xs[i] + 34}" cy="${y0 + 38}" r="16" fill="#a3e635" stroke="#18181b" stroke-width="2"/>
<text x="${xs[i] + 34}" y="${y0 + 44}" text-anchor="middle" font-size="17" font-weight="700" fill="#18181b">${n}</text>
<text x="${xs[i] + 62}" y="${y0 + 45}" font-size="22" font-weight="700" fill="#18181b">${esc(name)}</text>
${lines.map((t, k) => `<text x="${xs[i] + 22}" y="${y0 + 88 + k * 26}" font-size="16" fill="#3f3f46">${esc(t)}</text>`).join("\n")}`).join("");
  const mid = y0 + bh / 2;
  const arrows = [0, 1].map((i) => {
    const a = xs[i] + bw + 8;
    const b = xs[i + 1] - 8;
    return `<line x1="${a}" y1="${mid}" x2="${b - 10}" y2="${mid}" stroke="#18181b" stroke-width="2.5" marker-end="url(#a)"/>
<text x="${(a + b) / 2}" y="${mid - 14}" text-anchor="middle" font-size="14" fill="#3f3f46">${esc(d.forward[i])}</text>`;
  }).join("\n");
  // The loop back from the hook to the work, drawn under the first two boxes.
  const ly = y0 + bh + 54;
  const loop = `<path d="M ${xs[1] + bw / 2} ${y0 + bh + 8} V ${ly} H ${xs[0] + bw / 2} V ${y0 + bh + 18}" fill="none" stroke="#b45309" stroke-width="2.5" stroke-dasharray="7 6" marker-end="url(#b)"/>
<text x="${(xs[0] + xs[1] + bw) / 2}" y="${ly + 26}" text-anchor="middle" font-size="15" fill="#92400e">${esc(d.back)}</text>`;
  const vx = xs[2] + 22;
  const verdicts = d.verdicts.map((t, k) => {
    const fill = ["#15803d", "#b45309", "#b91c1c"][k];
    return `<text x="${vx}" y="${y0 + bh + 46 + k * 28}" font-size="16" font-weight="600" fill="${fill}">${esc(t)}</text>`;
  }).join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${DW} ${DH}" width="${DW}" height="${DH}" role="img" aria-label="${esc(d.title)}. ${d.boxes.map(([n, name, lines]) => `${n}. ${name}: ${lines.join(" ")}`).join(" ")} ${esc(d.back)}. ${d.verdicts.join(". ")}.">
<title>${esc(d.title)}</title>
<defs>
<marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#18181b"/></marker>
<marker id="b" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#b45309"/></marker>
</defs>
<style>text{font-family:${d.font}}</style>
<rect width="${DW}" height="${DH}" rx="18" fill="#fafaf9"/>
<text x="${DW / 2}" y="66" text-anchor="middle" font-size="26" font-weight="700" fill="#18181b">${esc(d.title)}</text>
${boxes}
${arrows}
${loop}
${verdicts}
</svg>
`;
  const out = join(root, "docs", "screenshots", `gate-diagram-${lang}.svg`);
  writeFileSync(out, svg);
  copyFileSync(out, join(root, "site", `gate-diagram-${lang}.svg`));
  if (framesDir) {
    mkdirSync(join(framesDir, "diagram"), { recursive: true });
    writeFileSync(join(framesDir, "diagram", `gate-diagram-${lang}.svg`), svg);
  }
  return { out, bytes: Buffer.byteLength(svg) };
}

mkdirSync(join(root, "site"), { recursive: true });
for (const [name, scene] of Object.entries(SCENES)) {
  const r = renderScene(name, scene);
  console.log(`✓ ${r.out} (${r.bytes} bytes, ${r.seconds.toFixed(1)} s loop)`);
}
for (const lang of Object.keys(DIAGRAM)) {
  const r = renderDiagram(lang);
  console.log(`✓ ${r.out} (${r.bytes} bytes)`);
}
if (framesDir) console.log(`✓ frame files in ${framesDir}`);
