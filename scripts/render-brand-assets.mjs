#!/usr/bin/env node
/**
 * FILE: render-brand-assets.mjs
 * PURPOSE: Render every shipped brand image from one HTML source
 * (docs/screenshots/src/showcase.html) with Playwright, then copy the
 * site set. Deterministic; no image-generation API.
 *
 * USAGE:
 *   node scripts/render-brand-assets.mjs            # all views
 *   node scripts/render-brand-assets.mjs hero og    # a subset
 *
 * Needs the `playwright` package and a Chromium build
 * (`npx playwright install chromium`). Fonts load from Google Fonts at
 * render time, so the first run needs network.
 *
 * OUTPUTS:
 *   docs/screenshots/hero-{dark,light}.png        1600×900
 *   docs/screenshots/ladder-{dark,light}.png      1600×760
 *   docs/screenshots/{grill,build,audit,ship}-dark.png  1200×700
 *   assets/og.png                                  1200×630
 *   assets/logo.png · logo-light.png · logo-dark.png   1024×1024
 *   assets/favicon.png                             64×64
 *   assets/logo.svg                                vector head mark
 *   site/{logo.png,favicon.png,og.png}             copies
 */
import { chromium } from "playwright";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = pathToFileURL(join(root, "docs/screenshots/src/showcase.html")).href;
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const counts = {
  skills: (pkg.description.match(/(\d+) agent skills/) || [])[1] || "160",
  commands: (pkg.description.match(/(\d+) slash commands/) || [])[1] || "63",
};

const JOBS = [
  { view: "hero", theme: "dark", w: 1600, h: 900, out: "docs/screenshots/hero-dark.png" },
  { view: "hero", theme: "light", w: 1600, h: 900, out: "docs/screenshots/hero-light.png" },
  { view: "ladder", theme: "dark", w: 1600, h: 760, out: "docs/screenshots/ladder-dark.png" },
  { view: "ladder", theme: "light", w: 1600, h: 760, out: "docs/screenshots/ladder-light.png" },
  { view: "grill", theme: "dark", w: 1200, h: 700, out: "docs/screenshots/grill-dark.png" },
  { view: "build", theme: "dark", w: 1200, h: 700, out: "docs/screenshots/build-dark.png" },
  { view: "audit", theme: "dark", w: 1200, h: 700, out: "docs/screenshots/audit-dark.png" },
  { view: "ship", theme: "dark", w: 1200, h: 700, out: "docs/screenshots/ship-dark.png" },
  { view: "og", theme: "dark", w: 1200, h: 630, out: "assets/og.png" },
  { view: "logo", theme: "dark", w: 1024, h: 1024, out: "assets/logo.png" },
  { view: "logo-light", theme: "light", w: 1024, h: 1024, out: "assets/logo-light.png" },
  { view: "logo-dark", theme: "dark", w: 1024, h: 1024, out: "assets/logo-dark.png" },
  { view: "favicon", theme: "dark", w: 64, h: 64, out: "assets/favicon.png" },
];
const only = process.argv.slice(2);
const jobs = only.length ? JOBS.filter((j) => only.includes(j.view)) : JOBS;

const browser = await chromium.launch();
try {
  for (const job of jobs) {
    const page = await browser.newPage({ viewport: { width: job.w, height: job.h }, deviceScaleFactor: 1 });
    page.on("pageerror", (e) => { throw new Error(`${job.view}: ${e.message}`); });
    const q = new URLSearchParams({ view: job.view, theme: job.theme, ...counts });
    await page.goto(`${src}?${q}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const outPath = join(root, job.out);
    mkdirSync(dirname(outPath), { recursive: true });
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: job.w, height: job.h } });
    if (job.view === "logo") {
      // The same head mark as a vector, on its lime square.
      const svg = await page.evaluate(() => {
        const s = document.querySelector("svg");
        const w = s.getAttribute("width"), h = s.getAttribute("height");
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#9BE31A"/><g transform="translate(${(1024 - w) / 2} ${(1024 - h) / 2})">${s.innerHTML}</g></svg>\n`;
      });
      writeFileSync(join(root, "assets/logo.svg"), svg);
    }
    await page.close();
    console.log("✓", job.out);
  }
} finally {
  await browser.close();
}
for (const f of ["logo.png", "favicon.png", "og.png"]) {
  if (jobs.some((j) => j.out === `assets/${f}`)) copyFileSync(join(root, "assets", f), join(root, "site", f));
}
console.log("✓ site copies synced");
