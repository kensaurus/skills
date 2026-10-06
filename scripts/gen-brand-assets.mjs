#!/usr/bin/env node
/**
 * Optional fal.ai generation. Reads FAL_KEY from .env. Never prints the key.
 *
 * Recraft/Flux have drifted off the mark (squircles, check badges, organic
 * SVG noise). Shipped assets are the geometric renderer:
 *   python scripts/render-brand-assets.py
 *
 *   node scripts/gen-brand-assets.mjs
 *   node scripts/gen-brand-candidates.mjs
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadFalKey() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) throw new Error(".env missing (copy .env.example)");
  const hit = readFileSync(envPath, "utf8").match(/^FAL_KEY=(.+)$/m);
  const key = (process.env.FAL_KEY || hit?.[1] || "").trim();
  if (!key || key.includes("keyid:keysecret")) throw new Error("FAL_KEY unset");
  return key;
}

async function subscribe(model, payload, key) {
  const res = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${model} HTTP ${res.status}: ${text.slice(0, 280)}`);
  }
  const json = JSON.parse(text);
  const url = json.images?.[0]?.url || json.image?.url;
  if (!url) throw new Error(`${model}: no image url in response`);
  return url;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

const NEGATIVE =
  "robot, android, brain, neural net, sparkle, glitter, neon, gradient mesh, 3D bevel, chrome, glassmorphism, stock photo, person, face, keyboard, IDE screenshot, cursor logo clone, Circled C, word salad, misspelled text, watermark, mockup";

const JOBS = [
  {
    file: "assets/logo.png",
    model: "fal-ai/recraft-v3",
    payload: {
      prompt:
        "App icon, perfect square. Flat print graphic on solid charcoal #111111. One thick off-white vertical bar (a playbook spine) with a single short cobalt-blue horizontal tick crossing it near the top — a first line checked off. 8px inner white frame. No letters, no words, no mascot. Swiss graphic design, high contrast, matte ink. Background plate fills the square.",
      style: "digital_illustration",
      image_size: { width: 1024, height: 1024 },
      negative_prompt: NEGATIVE,
    },
  },
  {
    file: "assets/logo-light.png",
    model: "fal-ai/recraft-v3",
    payload: {
      prompt:
        "App icon, perfect square. Flat print graphic on warm off-white #F4F1EA. One thick charcoal vertical bar (a playbook spine) with a single short cobalt-blue horizontal tick crossing it near the top. Thin charcoal inner frame. No letters, no words, no mascot. Swiss graphic design, matte ink. Background plate fills the square.",
      style: "digital_illustration",
      image_size: { width: 1024, height: 1024 },
      negative_prompt: NEGATIVE,
    },
  },
  {
    file: "assets/og.png",
    model: "fal-ai/ideogram/v3",
    payload: {
      prompt:
        "16:9 Open Graph poster. Solid charcoal #111111 field. Left: a thick off-white vertical playbook spine with one cobalt-blue tick. Right of the spine, huge tight grotesk type in white: YOU SAY THE JOB. Under it, smaller: THE PLAYBOOK RUNS. Bottom-left micro-label: kenji. No photos, no robots, no UI, no glow. Print poster.",
      image_size: "landscape_16_9",
      rendering_speed: "QUALITY",
      style: "DESIGN",
      expand_prompt: false,
      negative_prompt: NEGATIVE,
    },
  },
];

const key = loadFalKey();
mkdirSync(join(root, "assets"), { recursive: true });

for (const job of JOBS) {
  const dest = join(root, job.file);
  process.stdout.write(`${job.file}… `);
  try {
    const url = await subscribe(job.model, job.payload, key);
    await download(url, dest);
    console.log("ok");
  } catch (err) {
    if (job.model === "fal-ai/recraft-v3" || job.model === "fal-ai/ideogram/v3") {
      const fallback = "fal-ai/flux/schnell";
      process.stdout.write(`retry ${fallback}… `);
      const url = await subscribe(
        fallback,
        {
          prompt: job.payload.prompt,
          image_size:
            job.file.includes("og") ? "landscape_16_9" : "square_hd",
          num_images: 1,
          output_format: "png",
          enable_safety_checker: true,
        },
        key,
      );
      await download(url, dest);
      console.log("ok");
    } else {
      throw err;
    }
  }
}
