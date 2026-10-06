#!/usr/bin/env node
/**
 * FILE: render-views.mjs
 * PURPOSE: Render one HTML view to a PNG with Playwright. Used by the brand
 * hero kit (references/brand-hero-kit.md) for heroes, tour cards, OG images,
 * logos, and favicons that are built as code instead of screenshotted.
 *
 * USAGE:
 *   node render-views.mjs <html-path> <out.png> [width=1600] [height=900] [query]
 *   node render-views.mjs docs/screenshots/src/showcase.html docs/screenshots/hero-dark.png 1600 900 "view=hero&theme=dark"
 *
 * Needs `playwright` in the consumer project and a Chromium build
 * (`npx playwright install chromium`). The page's own fonts load first.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [html, out, w = "1600", h = "900", query = ""] = process.argv.slice(2);
if (!html || !out) {
  console.error("usage: render-views.mjs <html-path> <out.png> [width] [height] [query]");
  process.exit(2);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { throw new Error(`page error: ${e.message}`); });
  await page.goto(pathToFileURL(resolve(html)).href + (query ? `?${query}` : ""));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  mkdirSync(dirname(resolve(out)), { recursive: true });
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: +w, height: +h } });
  console.log("wrote", out);
} finally {
  await browser.close();
}
