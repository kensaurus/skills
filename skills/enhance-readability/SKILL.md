---
name: enhance-readability
description: >
  Audit and fix how easily content is understood: line length (CPL), reading
  level, grouping, deadspace, icons or tables that cut verbosity. Use when
  "hard to read", "too dense", "reading level", "cognitive load", or "turn
  this prose into a table".
license: MIT
---

> Surface router: `/uiux`. You are here: `enhance-readability`. Native iOS/Android (SwiftUI / Compose, no web layer) is out of scope — use Apple HIG / Material directly.

# enhance-readability — Make content understood

**Degree of freedom: MIXED.** Text-metric measurement `[LOW freedom — run exactly]`;
grouping, iconography, and tone `[HIGH freedom]`.

Audit-and-fix. The goal is **comprehension**: the least mental effort for the
reader to understand the content. `enhance-web-ui` makes it look good;
`audit-responsive` makes it fit the screen; this makes it *understood*.

The backbone is **Cognitive Load Theory** (working memory is small — cut
extraneous load) and **Gestalt** (the brain auto-groups visual elements —
design with that). A consequence of CLT / information overload: showing
*more* information can raise extraneous load and lower understanding. Replacing
a dense paragraph with one table or diagram is a comprehension win **only when
the visual reduces total load** versus the text it replaces — never decoration.

## How to reason

1. **Observe** — what makes this effortful? (dense text / no hierarchy / wall of prose / no whitespace / wrong register)
2. **Diagnose** — which of the six channels, and which Gestalt / CLT principle
3. **Classify load** — extraneous (bad presentation — always cut) vs intrinsic (inherent complexity — restructure / chunk) vs germane (productive — keep)
4. **Lever** — cheapest channel that removes that load
5. **Severity** — how much it blocks understanding on the primary path

## Worked example

> **Observe:** a pricing section is 3 dense paragraphs comparing 4 plans, 105 CPL, one grey block.
> **Diagnose:** dim 4 (comparison is a table), dim 3 (no proximity grouping), dim 1 (CPL 105 > 80), dim 5 (no whitespace).
> **Classify:** extraneous (prose form) + intrinsic (4-way comparison → chunk into a table).
> **Lever:** generate a 4-column comparison table; cap surrounding text at 66ch; icon per tier.
> **Handoff:** table collapse on mobile → `audit-responsive`; table tokens → `audit-uiux-design-system`.

## Self-critique before reporting

- **Load reduced** — each change names extraneous vs intrinsic; "looks cleaner" is not the test
- **Right owner** — breakpoints → `audit-responsive`; personality → `enhance-web-ui`; WCAG floor → `audit-accessibility`; voice authenticity → `plan-antislop`; tokens → `audit-uiux-design-system`
- **Language-correct** — CJK judged at 40 CPL (WCAG 2.2 SC 1.4.8)
- **Visuals earn their place** — generated graphic reduces load vs the text it replaces
- **Voice intact** — tone lowers effort without flattening the author

## The six channels (one goal: lower cognitive load)

1. **Text** — legibility and reading level (measurable).
2. **Separation** — Gestalt figure-ground + similarity (weight / color / rule).
3. **Layout** — proximity + chunking (~4 working-memory units) + hierarchy.
4. **Iconography & graphics** — icons paired with text; generate a visual only if load drops.
5. **Deadspace** — negative space that directs focus. "Is space aiding understanding," not "fix the 1440px grid."
6. **Tone & accent** — register/rhythm for the audience. Authenticity / AI-tells → `plan-antislop`.

Each is sized per form factor as *comprehension judgment*, not breakpoint CSS.

## Boundary — what this skill does NOT own

- **Breakpoint layout / matcher / CSS grid / "desktop = stretched phone"** → `audit-responsive`
- **Visual personality, brand, aesthetic composition** → `enhance-web-ui`
- **WCAG pass/fail contrast/size floor** → `audit-accessibility` (this skill treats the floor as the minimum)
- **Voice authenticity / anti-slop** → `plan-antislop`
- **Design-token / system coherence** → `audit-uiux-design-system`

Note and hand off. Do not duplicate.

## Text thresholds (Phase 1)  [LOW freedom — run exactly]

Sentence limits come from ASD-STE100: 20 words in a procedure, 25 in descriptive text, one instruction per sentence. Full rules and the Vale recipe: `../docs-writer/references/plain-language-ste.md`.

House targets, measured not eyeballed. CPL/CJK and line-height come from
[WCAG 2.2 SC 1.4.8 Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)
(AAA *mechanism* criterion; we use the numbers as authoring targets):

- **CPL / measure**: 50–75, ~66 sweet spot; hard limit **80 Latin**, **40 CJK** (日本語).
- **Line-height**: 1.5–1.8 body. **Font**: body ≥16px (16–18 optimal). **Paragraphs**: 2–4 lines.
- **Contrast**: WCAG AA floor is the minimum, not the goal — flag pale secondary text.
- **Alignment**: left-align *running text* (do not justify). Opposite of `audit-responsive`'s left-stacked-*layout* anti-pattern.
- **Reading level**: Flesch-Kincaid ≤8 for general UI (plain-language house target, not WCAG); sentences <~20 words; front-load; chunk.

## Phase 0 — Scope the content surfaces  [HIGH freedom]

Identify where *understanding* is the job: article/doc bodies, comparisons,
dashboards, onboarding, help/FAQ, dense forms, data-heavy views, empty/error
copy. Note language(s) (CJK vs Latin) and the primary comprehension goal
("decide between plans", "learn the concept", "complete the task").

## Phase 1 — Measure text legibility  [LOW freedom — run exactly]

Per surface, measure rendered values: CPL at real width, line-height, body/caption
px, paragraph length, contrast, alignment, reading level. Record value-vs-threshold.

## Phase 2 — Visual channels (2, 3, 5) against Gestalt  [HIGH freedom]

- **Separation (2):** distinct types look distinct, or one undifferentiated stream?
- **Grouping (3):** related close, unrelated apart? Chunked to working-memory size? Clear first-look target?
- **Deadspace (5):** whitespace separates and focuses, or everything is crammed and left-stacked? (Use of space for comprehension — not the breakpoint grid.)

## Phase 3 — Iconography & graphics (4)  [HIGH freedom]

Where prose carries a load a visual would carry better, propose (and generate if
the environment supports it) a comparison table, flow/step diagram, scan-anchor
icons, or a chart. Test: does it *reduce* total load vs the text it replaces?
If not, do not add it. Existing icons: paired with text and consistent, or noise?
(NN/g: almost no icon is universal without a label.)

## Phase 4 — Tone (6), then fix in the system  [HIGH freedom]

Register right for audience and goal (short + direct for tasks; warmer for
onboarding). Preserve author voice. Fixes use the repo's design tokens and type
scale — never one-off values; systemic gaps → `audit-uiux-design-system`.
Generated visuals follow the design system. Keep diffs to comprehension.

## Definition of Done

- [ ] Surfaces scoped with per-surface comprehension goal; language(s) noted
- [ ] Text measured value-vs-threshold (CPL incl. CJK, line-height, px, paragraph, contrast, align, reading level)
- [ ] Separation, grouping, and deadspace assessed against Gestalt / CLT
- [ ] Iconography/graphics assessed; visuals generated only if load drops
- [ ] Tone assessed; author voice preserved
- [ ] Findings classified by channel + load type + severity
- [ ] Fixes use tokens/scale; systemic gaps flagged
- [ ] Boundary respected (responsive / web-ui / a11y / antislop / design-system)
- [ ] Self-critique applied; every change names the load it removes

## Output format

1. **Text measurement table** — surface | CPL | line-height | px | paragraph | contrast | align | reading level | vs threshold
2. **Channel findings** — surface | channel (1–6) | Gestalt/CLT principle | load type | severity | fix
3. **Proposed/generated visuals** — load-reduction rationale
4. **Fixes applied** — token CSS + regrouping + visuals + copy/tone, before/after
5. **Handoffs** — breakpoints / personality / WCAG / voice / tokens

## Related

- `enhance-web-ui` — looks good (composition / personality)
- `audit-responsive` — container reflow per breakpoint
- `audit-accessibility` — WCAG pass/fail floor
- `plan-antislop` — voice authenticity / AI tells
- `audit-uiux-design-system` — tokens / component SSOT
- `enhance-web-ux` — flows / IA / information density of the *task*, not reading measure
