#!/usr/bin/env node
/**
 * FILE: sync-family.mjs
 * PURPOSE: Keep every "More from kensaurus" list in this repo in step with the
 * one source of truth, https://kensaur.us/apps.json: names, taglines, icons,
 * links. It rewrites three blocks:
 *   README.md        the table under "## More from KENSAURUS"
 *   llms.txt         the list under "## More from kensaurus"
 *   site/index.html  the <ul class="apps"> list (this pack's `related` apps)
 *
 * USAGE:
 *   node scripts/sync-family.mjs            # rewrite the three blocks
 *   node scripts/sync-family.mjs --check    # exit 1 if any block is stale
 *   node scripts/sync-family.mjs --links    # also request every URL and icon
 *
 * It needs the network, so it is a maintainer step and not part of `npm test`.
 * Run it before a release, and whenever an app's name, icon, or tagline changes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "https://kensaur.us/apps.json";
const SELF = "kenji-skills";
const check = process.argv.includes("--check");
const links = process.argv.includes("--links");

const res = await fetch(SOURCE);
if (!res.ok) {
  console.error(`✗ ${SOURCE} returned ${res.status}`);
  process.exit(1);
}
const data = await res.json();
// Paused apps are left out; prototypes are listed and labelled.
const apps = data.apps.filter((a) => a.id !== SELF && a.status !== "paused");
const self = data.apps.find((a) => a.id === SELF);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const utm = (url, source, medium) => {
  if (!/^https:\/\/([a-z-]+\.)?kensaur\.us\//.test(url)) return url;
  const [base, hash = ""] = url.split("#");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}utm_source=${source}&utm_medium=${medium}&utm_campaign=kensaurus-family${hash ? `#${hash}` : ""}`;
};
const tagline = (a) => a.tagline.en + (a.status === "prototype" ? " (prototype)" : "");

// ---- README table ------------------------------------------------------------
function readmeCell(a, first) {
  const out = [];
  const page = a.pages?.[0];
  if (page) out.push(`<a href="${esc(utm(page.url, "github", "readme"))}">${esc(page.label.en)}</a>`);
  if (a.stores?.ios) out.push(`<a href="${esc(a.stores.ios)}">App Store</a>`);
  if (a.stores?.android) out.push(`<a href="${esc(a.stores.android)}">Google Play</a>`);
  if (a.url !== a.repo) out.push(`<a href="${esc(utm(a.url, "github", "readme"))}">Web</a>`);
  if (a.repo) out.push(`<a href="${esc(a.repo)}">GitHub</a>`);
  if (a.story?.en) out.push(`<a href="${esc(utm(a.story.en, "github", "readme"))}">Story</a>`);
  return [
    `    <td${first ? ' width="50%"' : ""} valign="top">`,
    `      <img src="${esc(a.icon)}" width="56" height="56" alt="" align="left" style="margin-right:12px">`,
    `      <b>${esc(a.name.en)}</b> · ${esc(tagline(a))}.<br>`,
    `      <sub>${out.join(" · ")}</sub>`,
    "    </td>",
  ].join("\n");
}
const rows = [];
for (let i = 0; i < apps.length; i += 2) {
  const pair = apps.slice(i, i + 2).map((a) => readmeCell(a, i === 0));
  if (pair.length === 1) pair.push('    <td valign="top"></td>');
  rows.push(`  <tr>\n${pair.join("\n")}\n  </tr>`);
}
const readmeBlock = [
  "## More from KENSAURUS",
  "",
  "<table>",
  ...rows,
  "</table>",
  "",
  `All apps on Google Play: [kensaurus developer page](https://play.google.com/store/apps/developer?id=kensaurus). Everything else: [kensaur.us](${utm("https://kensaur.us/", "github", "readme")}).`,
  "",
  "The list comes from https://kensaur.us/apps.json. `npm run sync:family` rewrites it; do not edit it by hand.",
  "",
].join("\n");

// ---- llms.txt list -----------------------------------------------------------
const llmsBlock = [
  "## More from kensaurus",
  "",
  ...apps.map((a) => `- [${a.name.en}](${a.url}): ${tagline(a)}`),
  "- [All apps as JSON](https://kensaur.us/apps.json)",
  "- [kensaurus](https://kensaur.us/)",
  "",
].join("\n");

// ---- site list: the apps this pack names as related --------------------------
const related = (self?.related ?? []).map((id) => data.apps.find((a) => a.id === id)).filter(Boolean);
const siteBlock = [
  '<ul class="apps">',
  ...related.map((a) => `      <li><a href="${esc(utm(a.url, "kenji-skills", "referral"))}">${esc(a.name.en)}</a> <span>${esc(tagline(a))}</span></li>`),
  `      <li><a href="${esc(utm("https://kensaur.us/", "kenji-skills", "referral"))}">All our apps &rarr;</a></li>`,
  "    </ul>",
].join("\n");

function replaceBetween(text, startRe, endRe, block, file) {
  const s = text.search(startRe);
  if (s === -1) throw new Error(`${file}: start of the family block not found`);
  const rest = text.slice(s);
  const e = rest.search(endRe);
  if (e === -1) throw new Error(`${file}: end of the family block not found`);
  return text.slice(0, s) + block + rest.slice(e);
}

const targets = [
  ["README.md", /^## More from KENSAURUS$/m, /^---$/m, readmeBlock + "\n"],
  ["llms.txt", /^## More from kensaurus$/m, /$(?![\s\S])/, llmsBlock],
  ["site/index.html", /<ul class="apps">/, /(?<=<\/ul>)/, siteBlock],
];
let stale = 0;
for (const [file, startRe, endRe, block] of targets) {
  const path = join(root, file);
  const before = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const after = replaceBetween(before, startRe, endRe, block, file);
  if (after === before) continue;
  stale++;
  if (check) console.error(`✗ ${file}: the kensaurus list is out of date. Run: npm run sync:family`);
  else {
    writeFileSync(path, after);
    console.log(`✓ ${file} updated`);
  }
}
if (!stale) console.log(`✓ kensaurus lists match ${SOURCE} (${apps.length} apps, updated ${data.updated ?? "n/a"})`);

if (links) {
  const urls = new Set();
  for (const a of data.apps) {
    urls.add(a.url);
    urls.add(a.icon);
    if (a.repo) urls.add(a.repo);
    if (a.story?.en) urls.add(a.story.en);
    if (a.story?.ja) urls.add(a.story.ja);
    for (const p of a.pages ?? []) urls.add(p.url);
    for (const s of Object.values(a.stores ?? {})) urls.add(s);
  }
  let bad = 0;
  for (const url of urls) {
    try {
      const r = await fetch(url, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (link check)" } });
      if (!r.ok) {
        bad++;
        console.error(`✗ ${r.status} ${url}`);
      }
    } catch (err) {
      bad++;
      console.error(`✗ ${err.cause?.code ?? err.message} ${url}`);
    }
  }
  console.log(`${bad ? "✗" : "✓"} ${urls.size} URLs requested, ${bad} failed`);
  if (bad) process.exitCode = 1;
}
if (check && stale) process.exit(1);
