# enhance-web-landing — design engineering directives

Full text of Section 4 (4.1–4.11): the bias-correction rules, their override paths, and the hard layout rules that fail pre-flight.

## Contents

- 4.1 Typography
- 4.2 Color calibration
- 4.3 Layout diversification
- 4.4 Materiality, shadows, cards
- 4.5 Interactive UI states
- 4.6 Data & form patterns
- 4.7 Layout discipline (hard rules)
- 4.8 Image & visual asset strategy
- 4.9 Content density
- 4.10 Quotes & testimonials
- 4.11 Page theme lock

## 4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)  [HIGH freedom]

LLMs default to clichés. Override these defaults proactively. Each rule has a context-aware override path.

### 4.1 Typography
* **Display / Headlines:** Default `text-4xl md:text-6xl tracking-tighter leading-none`.
* **Body / Paragraphs:** Default `text-base text-gray-600 leading-relaxed max-w-[65ch]`.
* **Sans font choice:**
 * **Discouraged as default:** `Inter`. Pick `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, or a brand-appropriate serif first.
 * **Override:** Inter is acceptable when the user explicitly asks for a neutral / standard / Linear-style feel, or when the brief is a public-sector / accessibility-first site.
* **Pairings to know:** `Geist` + `Geist Mono`, `Satoshi` + `JetBrains Mono`, `Cabinet Grotesk` + `Inter Tight`, `GT America` + `IBM Plex Mono`.

* **Serif discipline (discouraged as default):**
 * Serif is **discouraged as the default font for any project.** "It feels creative / premium / editorial" is not a reason to reach for serif; "creative brief = serif" is the most recognisable AI tell on a landing page.
 * **Serif is only acceptable when one of these is explicitly true:**
 - The brand brief literally names a serif font, or
 - The aesthetic family is genuinely editorial / luxury / publication / manuscript / heritage / vintage and you can articulate why this specific serif fits this specific brand
 * For everything else (creative agency, design studio, modern brand, premium consumer, portfolio, lifestyle), **default sans-serif display** (Geist Display, ABC Diatype, Söhne Breit, Cabinet Grotesk Display, Migra Sans, GT Walsheim, Inter Display, PP Neue Montreal). Sans display fonts are not "boring" — they are the default for the same reason black is the default in fashion.
 * **Emphasis rule (related):** To emphasize a word inside a headline, use italic or bold of the SAME font — never a serif word dropped into a sans headline (mixed-family emphasis is amateur). Use it once per page at most: an italic accent word in every headline is itself a model default and reads as a tell.
 * **Specifically banned as defaults:** `Fraunces` and `Instrument_Serif` (the two LLM-favorite display serifs).
 * **If a serif is justified** (rare, per the above), choose from this pool by brand fit: PP Editorial New, GT Sectra Display, Cardinal Grotesque, Reckless Neue, Tiempos Headline, Recoleta, Cormorant Garamond, Playfair Display, EB Garamond, IvyPresto, Migra, Editorial Old, Saol Display, Söhne Breit Kursiv, Domaine Display, Canela, Schnyder, Tobias, NB Architekt, ITC Galliard.

* **Italic descender clearance:** When italic is used in display type and the word contains a descender letter (`y g j p q`), `leading-[1]` or `leading-none` will clip the descender. Use `leading-[1.1]` minimum and add `pb-1` or `mb-1` reserve on the wrapping element. Audit every italic word in display headlines before shipping.

### 4.2 Color Calibration
* Max 1 accent color. Saturation < 80% by default.
* **The lila rule:** The "AI Purple / Blue glow" aesthetic is discouraged as a default. No automatic purple button glows, no random neon gradients. Use neutral bases (Zinc / Slate / Stone) with high-contrast singular accents (Emerald, Electric Blue, Deep Rose, Burnt Orange, etc.).
* **Override:** if the brand or brief explicitly asks for purple / violet / lila, embrace it. But execute with intent: consistent palette, harmonised neutrals, restrained gradients. Not generic AI gradient slop.
* **One palette per project.** Do not fluctuate between warm and cool grays within the same project.
* **Color consistency lock:** Once an accent color is chosen for a page, it is used on the whole page. A warm-grey site does not suddenly get a blue CTA in section 7. A rose-accented site does not get a teal status badge in the footer. Pick one accent, lock it, audit every component before shipping.

* **Premium-consumer palette ban:**
 * For premium-consumer briefs (cookware, wellness, artisan, luxury, heritage craft, DTC home goods, etc.) the LLM default is **warm beige/cream + brass/clay/oxblood/ochre + espresso/ink dark text**. Concretely banned hex families as default backgrounds and accents:
 - Backgrounds: `#f5f1ea`, `#f7f5f1`, `#fbf8f1`, `#efeae0`, `#ece6db`, `#faf7f1`, `#e8dfcb` (all "warm paper / cream / chalk / bone")
 - Accents: `#b08947`, `#b6553a`, `#9a2436`, `#9c6e2a`, `#bc7c3a`, `#7d5621` (all "brass / clay / oxblood / ochre")
 - Text: `#1a1714`, `#1a1814`, `#1b1814` (all "espresso / warm near-black")
 * This palette is banned as the default for premium-consumer briefs: it is the LLM default for the category, so a brand that uses it reads as generic and becomes invisible.
 * **Default alternatives (pick by brand read):**
 - **Cold Luxury:** silver-grey + chrome + smoke (think Tesla, Apple Watch Hermes-without-the-leather)
 - **Forest:** deep green + bone + amber accent (think Filson, Patagonia premium)
 - **Black and Tan:** true off-black + warm tan, sharp contrast, no beige
 - **Cobalt + Cream:** saturated blue against a single neutral, no brass
 - **Terracotta + Slate:** warm rust against cool grey, no brass
 - **Olive + Brick + Paper:** muted olive plus brick-red accent
 - **Pure monochrome + single saturated pop:** off-white + off-black + one bright accent (electric blue, emerald, hot pink, etc.)
 * Choose the family from the brand read; the product category alone never selects a palette.
 * **Override:** the beige+brass+espresso palette is acceptable only when the brand brief explicitly names those colors, or when the brand identity is genuinely vintage / artisan / warm-craft and you can articulate why this specific palette fits this specific brand. Default-reaching for it because "this is a cookware brief" is banned.

### 4.3 Layout Diversification
* **Anti-center bias:** Centered Hero / H1 sections are avoided when `DESIGN_VARIANCE > 4`. Force "Split Screen" (50/50), "Left-aligned content / right-aligned asset", "Asymmetric white-space", or scroll-pinned structures.
* **Override:** centered hero is OK for editorial / manifesto / launch-announcement briefs where the message itself is the design.

### 4.4 Materiality, Shadows, Cards
* Use cards only when elevation communicates real hierarchy. Otherwise group with `border-t`, `divide-y`, or negative space.
* When a shadow is used, tint it to the background hue. No pure-black drop shadows on light backgrounds.
* For `VISUAL_DENSITY > 7`: generic card containers are banned. Data metrics breathe in plain layout.
* **Shape consistency lock:** Pick one corner-radius scale for the page and stick to it. Options: all-sharp (radius 0), all-soft (radius 12-16px), all-pill (full radius for interactive). Mixed systems are allowed only when there is a documented rule (e.g. "buttons are full-pill, cards are 16px, inputs are 8px") and that rule is followed everywhere. Round buttons in a square layout, or square cards on a pill-button page, is broken design.

### 4.5 Interactive UI States
LLMs default to "static successful state only." Always implement full cycles:
* **Loading:** Skeletal loaders matching the final layout's shape. Avoid generic circular spinners.
* **Empty States:** Beautifully composed; indicate how to populate.
* **Error States:** Clear, inline (forms), or contextual (toasts only for transient).
* **Tactile Feedback:** On `:active`, use `-translate-y-[1px]` or `scale-[0.98]` to simulate a physical push.
* **Button contrast check (a11y):** Before shipping any button, verify the button text is readable against the button background. White button + white text, `bg-white` CTA with `text-white` label, transparent button against the page background with no border → all banned. Audit every CTA: contrast ratio WCAG AA min (4.5:1 for body, 3:1 for large text 18px+). Same rule applies to ghost buttons over photographic backgrounds (use a backdrop, scrim, or stroke).
* **CTA button wrap ban:** Button text must fit on one line at desktop. If a label like "VIEW SELECTED WORK" wraps to 2 or 3 lines, the button is broken. Fix by either shortening the label (3 words max for primary CTAs, ideally 1-2) or widening the button (do not artificially constrain `max-width` on CTAs). Wrapped CTAs at desktop are a Pre-Flight Fail.
* **No duplicate CTA intent:** Two CTAs with the same intent on one page is a Pre-Flight Fail. Examples of same intent: "Get in touch" + "Contact us" + "Let's talk" + "Start a project" + "Start something" + "Reach out" = all "contact" intent → pick one label and use it everywhere on the page (nav, hero, footer). Same for "Try free" + "Get started" + "Sign up free" (all "signup" intent) and "View work" + "See selected work" + "Browse projects" (all "portfolio" intent). One label per intent.
* **Form contrast check (a11y):** Form inputs, placeholder text, focus rings, helper text, and error text all pass WCAG AA contrast against the section background. Light placeholders on a near-white form, white form on white page section, form labels grayer than 4.5:1 contrast → all banned. Audit every form before shipping.

### 4.6 Data & Form Patterns
* Label ABOVE input. Helper text optional but present in markup. Error text BELOW input. Standard `gap-2` for input blocks.
* No placeholder-as-label. Ever.

### 4.7 Layout Discipline (Hard Rules. Failing any of these is shipping broken work)  [LOW freedom — run exactly]

* **Hero must fit in the initial viewport.** Headline max 2 lines on desktop, subtext max **20 words** and max 3-4 lines, CTAs visible without scroll. If the copy is too long: reduce font scale or cut copy. If you cannot describe the value-prop in 20 words of subtext, the value-prop is unclear, not the rule too tight. Never let the hero overflow and force scroll to find the CTA.
* **Hero font-scale discipline.** Plan font size and image size *together*. If the hero asset is large and the headline is more than 6 words, do not start at `text-7xl/text-8xl`. Default sensible range: `text-4xl md:text-5xl lg:text-6xl` for most heroes; `text-6xl md:text-7xl` only when the headline is 3-5 words. A 4-line hero headline is always a font-size error, never a copy-length error.
* **Hero top padding cap:** Hero top padding max `pt-24` (≈6rem) at desktop. More than that means the hero content floats halfway down the viewport and reads as a layout bug, not as intentional space. If your hero needs more breathing room, increase font scale or asset size, not top padding.
* **Hero stack discipline (max 4 text elements).** The hero is a single moment, not a feature list. Allowed text elements, max 4 in total:
 1. Eyebrow (small uppercase label) or brand strip or neither - pick zero or one
 2. Headline (max 2 lines, see above)
 3. Subtext (max 20 words, max 4 lines)
 4. CTAs (1 primary + max 1 secondary)
 - **banned in the hero:** tiny tagline below CTAs ("Works with GitHub, GitLab, and self-hosted Git"), trust micro-strip ("Used by engineering teams at..."), pricing teaser ("Free for solo, $10/user for teams"), feature bullet list, social-proof avatar row. All of those move to dedicated sections directly below the hero.
 - If you have an eyebrow and a tagline below CTAs in the same hero, drop the tagline. If you have a brand strip and a tagline, drop the tagline. One small text element per hero, max.
* **"Used by" / "Trusted by" logo wall belongs UNDER the hero, never inside it.** The hero is for the value prop and primary CTA. The logo wall is a separate section directly below. Do not stuff trust logos into the same flex row as the hero copy.
* **Navigation must render on a single line on desktop.** If items don't fit at `lg` (1024px), condense labels, drop secondary items, or move to a hamburger. A two-line nav at desktop is broken design.
* **Navigation height cap: 80px max desktop, default 64-72px.** No huge "agency" nav bars that eat 15% of the viewport.
* **Bento grids must have rhythm, not one-sided repetition.** Do not stack 6 left-image / right-text rows. Vary the composition: alternate full-width feature rows, asymmetric tile sizes, vertical breaks.
* **Bento cell count rule:** A bento grid has exactly as many cells as you have content for. 3 items → 3 cells (1+2 split, or 2+1, or asymmetric trio). 5 items → 5 cells (2+3, 3+2, hero+4, etc.). If your grid has an empty cell in the middle or at the end, you planned wrong. Re-shape the grid; do not paste a blank tile.
* **Section-Layout-Repetition Ban.** Once you use a layout family for a section (e.g., 3-column-image-cards, full-width-quote, split-text-image), that family can appear at most once on the page. "Selected commissions" must not look like "What we do." A landing page with 8 sections must use at least 4 different layout families.
* **Zigzag alternation cap.** Alternating "left-image + right-text" then "left-text + right-image" zigzag layout = banal. Max 2 sections in a row with this image+text-split pattern. The 3rd consecutive image+text split is a Pre-Flight Fail. Break the pattern with a full-width section, a vertical-stack section, a bento grid, a marquee, or a different layout family.
* **Eyebrow restraint.** An "eyebrow" is the small uppercase wide-tracking label sitting above a section headline (e.g. `FOUR COLORWAYS`, `SELECTED WORK`, `THE HARDWARE`, `Git-native task management`). Typical CSS signature: `text-[11px] uppercase tracking-[0.18em]`, `font-mono text-[10.5px] uppercase tracking-[0.22em]`. Every AI-built site puts an eyebrow above EVERY section header, producing the same templated rhythm. Hard rule:
 - **Maximum 1 eyebrow per 3 sections.** Hero counts as 1. So a page with 9 sections may use at most 3 eyebrows total.
 - If section A has an eyebrow, the next 2 sections cannot have one.
 - **Pre-Flight Check is mechanical:** count instances of `uppercase tracking` (or similar small-caps mono labels above headlines) across all section components. If count > ceil(sectionCount / 3), the output fails.
 - **What to do instead of an eyebrow:** drop it entirely. The headline alone is enough. If you need to categorize a section, the section's location on the page already categorizes it; no label needed.
* **Split-header ban.** The pattern "left big headline + right small explainer paragraph" as a section header (left col-span-7/8, right col-span-4/5 with a small body paragraph floating in the right column) is **banned as default**. Sections should have one focused message. If you genuinely need both a headline and an explainer paragraph, stack them vertically (headline on top, body below, max-width 65ch). Reach for the split-header pattern only when there is a real compositional reason (e.g., the right column carries a visual or interactive element, not just filler text).
* **Bento background diversity.** Bento and feature-grid sections cannot be 6 white-on-white cards with text inside. At least 2-3 cells in any multi-cell grid need real visual variation: a real image, a brand-appropriate gradient (not AI-purple), a pattern, a tinted background. A cream-on-cream bento with only typography inside reads as boring AI default, even when the rest of the page is good.
* **Mobile collapse must be explicit per section.** For every multi-column layout, declare the `< 768px` fallback in the same component. No "it'll work, Tailwind handles it" assumptions.

### 4.8 Image & Visual Asset Strategy

Landing pages and portfolios are **visual products**. Text-only pages with fake-screenshot divs are slop.

**Priority order for visual assets:**
1. **Image-generation tool first.** When an image-gen tool is available (`generate_image`, an MCP image tool, IDE-integrated gen), use it for section-specific assets — hero photography, product shots, texture backgrounds, mood images — at the section's aspect ratio. Hand-rolled CSS is not a substitute for a real image.
2. **Real web images second.** When no gen tool is available, use real photography sources. Acceptable defaults:
 * `https://picsum.photos/seed/{descriptive-seed}/{w}/{h}` for placeholder photography (seed should describe the section, e.g. `artisan-cookware-kitchen`)
 * Actual stock or brand URLs when the brief provides them
 * Open-license sources (Unsplash via direct URL, Pexels) if explicitly allowed
3. **Last resort: tell the user.** If neither is possible, do not fill the page with hand-rolled SVG illustrations or div-based "fake screenshots." Instead, leave clearly-labeled placeholder slots (`<!-- TODO: hero product photo, 1600x1200 -->`) and at the end of the response say: *"This page needs real images at: \[list of placements\]. Please generate or provide them."*

**Even minimalist sites need real images.** A pure-text page is not minimalism. It is incomplete work. Even an editorial Linear-style site needs at least 2-3 real images (hero, one product/lifestyle shot, one supporting image). Generate B&W minimalist photography if the brief is restrained; do not skip images entirely because the dial is low.

**Real company logos for social proof.** When the brief calls for a "Trusted by / Used by / Customers" logo wall, do not default to plain text wordmarks (`<span>Acme Co</span>` styled in a row). Use real SVG logos:
* **Source: Simple Icons** (`https://cdn.simpleicons.org/{slug}/ffffff` for any color, or `simple-icons` npm package). Covers most known brands.
* **Alternative: devicon** for tech-stack logos (`@svgr/cli` or CDN).
* **Make-up the brand name? Then make-up an SVG mark too.** Generate a simple monogram (one letter in a circle, two-letter ligature, abstract glyph) rendered as an inline `<svg>` matching the page style. Plain text wordmarks for invented brand names look generic.
* **Always** ensure logos render in both light and dark mode (white-on-dark, black-on-light, or single-color theme variable).
* **Logo-only rule:** logo wall = logos and nothing else. Do not print industry / category labels below each logo (no `Vercel` + `hosting` underneath, no `Stripe` + `payments`, no `Cloudflare` + `infra`). The logo is the credibility, the label adds nothing the user does not already know. Optional: brand name as alt-text for screen readers, optional link to the brand's site. That is it.

**Hand-rolled illustrations:**
* SVG icons from libraries: fine (see Section 3.C).
* Hand-rolled decorative SVGs (custom illustrations, logos, marks): **strongly discouraged**, never as default. Acceptable only when:
 - The brief explicitly calls for it ("draw me an SVG logo")
 - It's a single, simple geometric mark (a square, a circle, a wordmark in display type)
 - You're confident in the output quality

**Div-based fake screenshots are banned.** A "hand-built product preview" rendered with `<div>` rectangles, fake task lists, fake dashboards, fake terminal windows is a Tell. If you need to show a product:
* Use a real screenshot URL if one exists
* Generate one via image tool
* Use a real component preview (an actual mini-version of the UI inside the page)
* Or skip the preview entirely and use editorial photography

**Hero needs a real visual.** Text + gradient blob is not a hero - it's a placeholder.

### 4.9 Content Density

Landing pages live on the **first impression**, not the full read. Cut ruthlessly.

* **Default content shape per section:** short headline (≤ 8 words) + short sub-paragraph (≤ 25 words) + one visual asset or one CTA. Anything more must be justified by the section's job.
* **No data-dump sections.** A 20-row publication table, a 30-row award list, a giant pricing matrix on a marketing page = wrong layout. Use:
 - Top 3-5 highlights + "View full list" link
 - Marquee / carousel for breadth
 - Different page entirely if the data is the product
* **Long lists need a different UI component, not a longer list.** Default `<ul>` with bullets / `divide-y` rows is the lazy choice. If you have > 5 items, reach for one of these instead:
 - 2-column split with grouped items
 - Card grid with image + label per item
 - Tabs / accordion if items are categorisable
 - Horizontal scroll-snap pills
 - Carousel for breadth-heavy lists (testimonials, logos, capabilities)
 - Marquee for "lots-of-things-that-don't-need-individual-attention"
 A spec sheet with 10 rows + a hairline under every row is the worst default. Either group rows into 2-3 chunks with sparse dividers, or move to a card-per-spec layout.
* **Spec sheets specifically (the long spec-table pattern).** A long product specification table with `border-b` on every row is the AI default for cookware / hardware / apparel / artisan-goods briefs. Banned. Concrete alternatives:
 - **2-col card grid:** each spec gets its own card with the spec name, the value (large display number), and a one-line "why it matters" body. Cards arranged 2-col on desktop, 1-col mobile.
 - **Scroll-snap horizontal pills:** each spec is a pill, user can flick through.
 - **Grouped chunks:** group 10 specs into 3 logical clusters (e.g. "Materials", "Cooking", "Warranty"), each cluster gets one soft divider and a cluster heading.
 - **Featured-vs-rest:** 3-4 hero specs visualised as large display tiles, the rest collapsed under a "View full specifications" disclosure.

* **Copy self-audit (before ship):** Before declaring any task done, re-read every visible string on the page (headlines, subheads, eyebrows, button labels, body copy, captions, alt text, footer text, error messages). Flag any string that is:
 - **Grammatically broken** ("free on its past", "two plans but one is honest", "to put it on the table" out of context)
 - **Has unclear referents** ("we plan to stay that way" without prior context)
 - **Sounds like AI hallucination** (cute-but-wrong wordplay, forced metaphors that don't track, "elegant nothing" phrases)
 - **Reads like an LLM trying to sound thoughtful** (passive-aggressive humility, fake-craftsman labels, mock-poetic micro-meta)
 Rewrite every flagged string. If unsure whether a string makes sense, replace it with a plain functional sentence. AI-generated cute copy is worse than boring copy.
* **Fake-precise numbers are flagged.** Numbers like `92%`, `4.1×`, `48k`, `5.8 mm`, `13.4 lb` either:
 - Come from real data (brief, brand guidelines, public metrics) - fine
 - Are explicitly labeled as mock (`<!-- mock -->`, "example", "sample data") - fine
 - Are AI-invented spec aesthetics - banned. Don't fake engineering precision the brand doesn't claim.
* **One copy register per page.** Don't mix technical mono ("47 tasks · 0.6 ctx-switches/day"), editorial prose, and marketing punch in the same composition unless the brand voice explicitly calls for it.

### 4.10 Quotes & Testimonials

* **Max 3 lines** of quote body. Never 6. If the original quote is longer → cut it. A landing-page quote is a snippet, not the full review.
* For very small font sizes (e.g. footer-style testimonials), the line cap can stretch slightly. Spirit: "fits in a glance."
* **No em-dashes inside the quote text** as design flourish (long pauses, kinetic em-dashes, em-dash-bullets) — an em-dash-heavy quote reads as generated, the same tell as in body copy (full rule: Section 9.G).
* Attribution: name + role + (optionally) company. Never name only ("- Sarah").
* Quote marks: use real typographic quotes ( " " ) or none at all. Not straight ASCII ( " ).

### 4.11 Page Theme Lock (Light / Dark Mode Consistency)

The page has one theme. Sections do not invert.

* If the page is dark mode, all sections are dark mode. No light-mode-warm-paper section sandwiched between dark sections (or vice versa). The user must not feel they walked into a different website mid-scroll.
* The exception: if the brief explicitly calls for a "Color Block Story" or "Theme Switch on Scroll" device and that is a deliberate composition (one full theme switch with a strong transition, not random alternation), it is allowed once per page.
* Default behaviour: pick light, dark, or auto (`prefers-color-scheme`) at the page level and lock it. Section-level background tints within the same theme family are fine (`bg-zinc-950` next to `bg-zinc-900`); flipping to `bg-amber-50` in the middle of a `bg-zinc-950` page is broken.
* When using a design system with built-in theming (Radix Themes, shadcn/ui with `<Theme>`), set the theme once in `layout.tsx` or the page root. Do not let individual sections override.
