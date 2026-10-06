---
name: enhance-web-landing
description: >
  Build landing pages, portfolios, and marketing sites that don't look
  AI-generated. Use for "landing page", "portfolio", "marketing site",
  "anti-slop", "Awwwards-style", "premium frontend", or a design that needs a
  point of view.
license: MIT
---

> Surface router: `/uiux`. You are here: `enhance-web-landing`. Native iOS/Android (SwiftUI / Compose, no web layer) is out of scope — use Apple HIG / Material directly.

# enhance-web-landing — Anti-Slop Landing Pages

**Degree of freedom: MIXED.** Design-read and dials `[HIGH freedom]`; dependency check, contrast, and preflight hard rules `[LOW freedom — run exactly]`.

> Landing pages, portfolios, and redesigns. Not dashboards, not data tables, not multi-step product UI.
> Every rule below is **contextual**. None of it fires automatically. First read the brief, then pull only what fits.

## How to reason

1. **Read** — page kind, vibe words, audience, existing brand, quiet constraints
2. **Dial** — VARIANCE / MOTION / DENSITY from the read (not the LLM default)
3. **System** — official package if the brief is a system; one system per project
4. **Preflight** — hero-in-viewport, contrast, no slop defaults, real images

## Worked example

> **Read:** B2B SaaS landing for technical buyers; user said "Linear-style"; no brand serif.
> **Dial:** 5 / 3 / 3 — clean, low motion, airy.
> **System:** Tailwind v4 + Geist; not Inter + purple mesh; shadcn only if already owned.
> **Preflight:** split hero (not centered), one accent, real product shot, CTA unwrapped.

## Self-critique before reporting

- **Design read stated** — one line before code; no silent default aesthetic
- **Anti-default** — no Inter + purple gradient + three equal cards unless the read asks
- **Hard rules** — hero fits first viewport; button contrast AA; one CTA intent
- **Right owner** — dashboards/product UI → `enhance-web-ui`; existing-app polish → `enhance-web-redesign`

---

## 0. BRIEF INFERENCE (Read the Room Before Anything Else)  [HIGH freedom]

Before touching code or tweaking dials, **infer what the user actually wants**: page kind, vibe words, reference signals, audience, brand assets that already exist, quiet constraints (accessibility-first, public-sector, regulated, kids). Constraints override aesthetic preference.
Before any code, state in one line: **"Reading this as: \<page kind> for \<audience>, with a \<vibe> language, leaning toward \<design system or aesthetic family>."**
If the design read genuinely diverges, ask exactly **one** clarifying question; if you can infer from context, do not ask.
**Anti-Default Discipline:** do not default to AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism, infinite micro-animations, Inter / Roboto + slate-900, a cream page background, an italic accent word in every headline, "01 / 02 / 03" labels, mono eyebrows, pill buttons on every control. After a first pass, add whatever default the result reached for to this list.
Signal list, example reads, and the full anti-default list: [references/brief-dials-stack.md](references/brief-dials-stack.md) §0.

## 1. THE THREE DIALS (Core Configuration)  [HIGH freedom]

After the design read, set `DESIGN_VARIANCE` (1 symmetry → 10 chaos), `MOTION_INTENSITY` (1 static → 10 cinematic), `VISUAL_DENSITY` (1 airy → 10 cockpit). **Baseline `8 / 6 / 4`** unless the read overrides; overrides happen conversationally, never by editing this file.
Use these exact variable names throughout; never invent aliases like `LAYOUT_VARIANCE` or `ANIM_LEVEL`.
Dial-inference table (signal → values) and use-case presets: [references/brief-dials-stack.md](references/brief-dials-stack.md) §1.

## 2. BRIEF → DESIGN SYSTEM MAP  [HIGH freedom]

If the brief reads as a real system (Fluent, Material 3, Carbon, Polaris, Atlaskit, Primer, GOV.UK, USWDS, Bootstrap 5.3, Radix Themes, shadcn/ui, Tailwind v4), install and use the **official** package. Do not recreate its CSS by hand or import its tokens and override 90% of them.
**One system per project.** No Fluent + Carbon in one tree, no shadcn inside a Material 3 app.
If the brief is an aesthetic (glassmorphism, bento, brutalism, editorial, dark tech, aurora, kinetic type, Apple Liquid Glass) there is no official package: native CSS + Tailwind + a maintained component library, and label approximations honestly. There is no official `liquid-glass.css`.
Both mapping tables: [references/brief-dials-stack.md](references/brief-dials-stack.md) §2.

## 3. DEFAULT ARCHITECTURE & CONVENTIONS  [HIGH freedom]

Unless Section 2.A picked a system: React / Next.js with Server Components, Tailwind v4 (`@tailwindcss/postcss`, not the `tailwindcss` PostCSS plugin), Motion imported from `motion/react`, `next/font` or self-hosted `@font-face` + `font-display: swap`. Motion, scroll, and pointer code lives in isolated `'use client'` leaves.
**Never** track continuous input values (mouse, scroll, magnetic hover) in `useState`; use `useMotionValue` / `useTransform` / `useScroll`.
Icons: `@phosphor-icons/react` → `hugeicons-react` → `@radix-ui/react-icons` → `@tabler/icons-react`; `lucide-react` only when asked or already a dependency; one family per project; never hand-roll SVG icons. Emoji discouraged unless the user asks for a playful vibe.
Layout: breakpoints `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`; contain with `max-w-[1400px] mx-auto` or `max-w-7xl`; `min-h-[100dvh]` heroes, never `h-screen`; CSS Grid over flex percentage math.
**3.F Dependency verification [LOW freedom — run exactly]:** check `package.json` before importing any 3rd-party library; if missing, output the install command first. **Never** assume a library exists.
Full stack, state, icon, emoji, and layout rules: [references/brief-dials-stack.md](references/brief-dials-stack.md) §3.

## 4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)  [HIGH freedom]

Override LLM clichés proactively; every rule has a context-aware override path. Covered: typography (sans display by default; serif only when the brand names one or the aesthetic is genuinely editorial / luxury / heritage; `Fraunces` and `Instrument_Serif` banned as defaults; italic descender clearance), color (max 1 accent, saturation < 80%, the lila rule, premium-consumer beige + brass + espresso ban, color consistency lock), layout (no centered hero when `DESIGN_VARIANCE > 4`), materiality and shape consistency lock, interactive states, forms (label above, never placeholder-as-label), image strategy (image-gen tool → real photos → labelled placeholder slots; div-based fake screenshots banned; real SVG logos), content density (headline ≤ 8 words, sub ≤ 25 words; no data-dump sections; copy self-audit; fake-precise numbers flagged), quotes (max 3 lines, no em-dashes), page theme lock.
**4.7 Layout Discipline [LOW freedom — run exactly]:** hero fits the initial viewport (headline ≤ 2 lines, subtext ≤ 20 words, max 4 text elements, top padding ≤ `pt-24`); logo wall under the hero, never inside; single-line nav ≤ 80px; bento rhythm and exact cell count; each layout family at most once per page, ≥ 4 families per 8 sections; max 2 consecutive image+text zigzags; max 1 eyebrow per 3 sections (mechanical check: `uppercase tracking` count > ceil(sections / 3) fails); split-header banned as default; bento needs 2–3 visually varied cells; explicit `< 768px` collapse per section.
Pre-Flight Fails: button or form contrast below WCAG AA, CTA label wrapping at desktop, two CTAs with the same intent.
Full directives 4.1–4.11 verbatim: [references/design-directives.md](references/design-directives.md).

## 5. CONTEXT-AWARE PROACTIVITY  [HIGH freedom]

Tools, not defaults. **None fire automatically.** Liquid Glass only for premium consumer / Apple-adjacent / luxury, with inner border, inner shadow, and a `prefers-reduced-transparency` fallback. Magnetic micro-physics and perpetual micro-interactions only when `MOTION_INTENSITY > 5` and the section benefits; spring physics (`type: "spring", stiffness: 100, damping: 20`), no linear easing.
**Motion claimed, motion shown:** if `MOTION_INTENSITY > 4` the page must actually move (hero entry, scroll-reveal, CTA hover physics); if you cannot ship working motion, drop the dial to 3 and ship static. Every animation needs a one-sentence reason. **Marquee: max one per page.**
Sticky-stack and horizontal-pan must be real pins: `start: "top top"`, pin the wrapper, scrub the inner track.
Full bullet list and canonical GSAP skeletons (5.A Sticky-Stack, 5.B Horizontal-Pan, 5.C Scroll-Reveal Stagger, 5.D forbidden patterns): [references/details.md](references/details.md) §5.

## 6–14. GUARDRAILS, TELLS, REDESIGN, PRE-FLIGHT

Performance & accessibility guardrails, dial definitions, dark mode protocol, AI tells (incl. §9.F production-test tells and §9.G em-dashes), reference vocabulary, redesign protocol, block library contract, out of scope, and the final pre-flight checklist: [references/details.md](references/details.md) §6–14. Appendices A–C hold install commands, canonical sources, and the Liquid Glass approximation.

## Further reading

- [Brief read, dials, system map, stack conventions (Sections 0–3)](references/brief-dials-stack.md)
- [Design engineering directives (Section 4)](references/design-directives.md)
- [Motion skeletons, guardrails, AI tells, redesign protocol, pre-flight, appendices (Sections 5–14)](references/details.md)
