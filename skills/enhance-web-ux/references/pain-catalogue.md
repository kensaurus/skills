# enhance-web-ux — pain catalogue

The Step 3 pain inventory example and Silent-Pain Catalogue S1–S18, plus the worked Step 4 heuristic map and Step 5 primitive match tables.

## Step 3 — Pain inventory

Maintain a single table. Include user-reported pains AND silent ones you discovered.

| # | Source | Pain | Viewport | Notes |
|---|--------|------|----------|-------|
| 1 | user | Can't tell linked-document folders from regular | all | "many doc types" |
| 2 | user | Can't see which folders had AI analysis | all | inline chip needed |
| 3 | user | Toolbar button text wraps to 2 lines | 1024 | `通知書ZIP` |
| 4 | live | `金額` and `サイズ` columns are EMPTY for folder rows | desktop | wasted real estate |
| 5 | live | `未処理` status badge wraps 未処/理 inside 64px column | desktop | column too narrow |
| 6 | live | Hint row "☐チェックで選択 …" repeats forever above every list | all | violates #8 minimal |
| 7 | live | All folder icons are the same blue folder glyph | all | violates #6 recognition |

**Do not skip silent pains.** The user reports the loudest issue but rarely the worst one.

### 3b — Silent-Pain Catalogue (always check these)

The most damaging UX pains are usually *not* user-reported because users
don't have the vocabulary to describe them. After the user-reported
pains are listed, walk this catalogue and add every match as a separate
row in the inventory table:

| # | Silent pain class | Where to look | NN/g | Symptom example |
|---|-------------------|---------------|------|-----------------|
| S1 | **Wrapper-collapsed tiles** | Step 2.5a (rect widths) | #4 Consistency, #8 Minimalist | 3-up of equal tiles renders 80px / 80px / 80px in a 358px row, huge gaps between |
| S2 | **Dead conditional slot** | Step 2.5b (zero-state probe) | #8 Aesthetic & Minimalist | 160px-tall hero `media` slot containing only "0%" + an icon |
| S3 | **Information duplication per fold** | Step 2.5c (dup-datum scan) | #8 Aesthetic & Minimalist | "0/10 words today" appears in eyebrow + pill + footer strip |
| S4 | **Monochromatic surface (tier mismatch)** | Step 2.5d (category squint) | #1 Visibility, #6 Recognition | tier-A product with `/5–/8` tints; tiles blur to one neutral hue |
| S5 | **Left-anchored stack** | Live screenshot | #4 Consistency | every card full-width, every label left, no right-side anchors → "templated" feel |
| S6 | **Helper-row recall load** | Live screenshot | #6 Recognition over Recall | always-on hint row above every list ("☐ check to select…") |
| S7 | **Generic icon stack** | Live screenshot | #2 Match real world, #6 Recognition | every category uses the same `Folder` / `File` / `Item` glyph |
| S8 | **Async result invisible** | Read state contracts in step 1c | #1 Visibility of System Status | AI summary, link, sync, error happened but no UI signal |
| S9 | **Wrapping CTA / wrapping label** | Step 2c (3-viewport notes) | #4 Consistency, Fitts's | button text breaks to 2 lines at 1024px |
| S10 | **Empty column / zero cell stuck on screen** | Live screenshot at desktop | #8 Aesthetic & Minimalist | `Amount` / `Size` columns rendered for folder rows that don't have one |
| S11 | **Library-vs-CSS specificity war** | DevTools `Computed → width` on `<th>`/`<td>` at every viewport; check whether your responsive rule is crossed-out in favor of `element.style` | #4 Consistency, #8 Minimalist | TanStack Table / AG-Grid / MUI DataGrid emits inline `style="width:150px"` from `header.getSize()`; your `[data-priority="primary"]{width:auto}` rule loses without `!important` or `table-layout:fixed`. Symptom: "wasted space + truncation" at tablet widths only. |
| S12 | **Active-state mass mismatch** | Compare bounding boxes of active vs inactive sibling tabs / dock cells / nav items at the same viewport; squint test | #4 Consistency, NN/g *Navigation: You Are Here* | Active tab uses full-cell `bg-brand-soft` while siblings have transparent bg → active reads as 1.5× heavier even at identical layout dimensions. Symptom: "clunky", "weirdly big", "heights are incoherent". |
| S13 | **Chrome tautology on root / index route** | Open `/` (or the app root); count chrome zones that say the same word as the page H1 | #8 Aesthetic & Minimalist, NN/g *Visibility* | `🏠 › Home` breadcrumb under a header that already has a Home dock-active and a "Home" H1 → 3 instances of the same word in one fold. Symptom: "atrocious", "redundant", "useless row". |
| S14 | **Card-on-card chrome** | Inspect every chip / pill / badge — does it sit on a row whose own background is already a tonal recess? | #8 Aesthetic & Minimalist | Active breadcrumb chip with `bg-card border-brand/25 shadow-sm` sits on a row already painted `bg-muted/40` → two distinct elevations within 6 px. Symptom: chrome "feels heavy", "stuck on", "buttoned-up". |
| S15 | **Hover-only affordance with no touch fallback** | Grep `group-hover:opacity-100`, `opacity-0 hover:opacity-100`, `md:opacity-0` and check the parent for `focus-within:` / always-visible alternative below the pointer breakpoint | #6 Recognition over Recall, #7 Flexibility & Efficiency | Row action buttons (delete, archive, edit) only appear on `:hover`; on a touch device the user can't tap them. Symptom: silent — user never reports it because they don't know the action exists. |
| S16 | **Brand-color competition** | In a single viewport screenshot, count surfaces tinted in the brand color (border / fill / ring / text) within one zone; subtract the intended primary CTA + meaningful status chips | NN/g *Visual Hierarchy*, #4 Consistency | Brand-mint border on the breadcrumb home icon + brand-mint border on active page chip + brand-mint primary CTA → user's eye can't find the primary action. Symptom: "noisy even though it's clean", "I can't tell what to click". |
| S17 | **Hit area baked into visual chrome** | Inspect icon buttons; is the *visible* surface (background, border, padding) sized for the touch target (`w-11 h-11`) instead of the icon's optical weight? | NN/g *Visual Hierarchy*, Fitts's | A 14 px icon sits in a 44 px bordered card; the chrome is sized for the thumb, not the eye. Symptom: "icon button feels chunky" / "buttons everywhere". |
| S18 | **Inverted responsive visibility** | List every column's `hideBelowMd`/`mobile:hidden`/className per viewport in a table; look for columns that appear at one breakpoint and disappear at the next *up* | #4 Consistency | Column tagged `hideBelowMd: true` but rendered via `sm:hidden` → appears on `sm`, hides on `md+`. Symptom: "missing column at wide viewport" / "duplicate column on mobile". |

A good enhancement plan typically catches **2–4 silent pains per
user-reported pain.** If your final pain inventory has *only* user-reported
rows, you skipped Step 2.5.

## Step 4 — Heuristic map (worked table)

For each pain, name the violated heuristic. Use `HEURISTICS.md` for the canonical list.
A pain that cannot be tied to a heuristic is probably a personal taste call — defer it.

| # | Pain | NN/g # | Law of UX | Why it violates |
|---|------|--------|-----------|-----------------|
| 1 | linked-doc folders look like all others | #1 Visibility, #6 Recognition | Hick's | system state hidden, user must read names to discriminate |
| 2 | no AI marker | #1 Visibility | — | hides the result of an async, expensive operation |
| 3 | button wraps to 2 lines | #4 Consistency, #8 Minimalist | Fitts's | breaks rhythm; hit target shape unstable across widths |
| 4 | empty cells in `金額` / `サイズ` | #8 Aesthetic & Minimalist | — | "every extra unit of information competes with the relevant ones" |
| 5 | status badge wraps onto two lines | #4 Consistency | — | Japanese 2-character labels need `whitespace-nowrap` + sized column |
| 6 | always-on hint row | #6 Recognition over Recall, #8 Minimalist | — | repeated affordance hint = recall, not recognition; wastes a row forever |
| 7 | all folders same icon | #2 Match real world, #6 Recognition | Miller's | mental categories collapse; cognitive load to scan |

## Step 5 — Primitive match (worked table)

For each fix, match an existing primitive. If none fits, extend the closest one — never
reach for a raw `<div>` styled inline.

| # | Fix idea | Primitive / token | Where it lives |
|---|----------|-------------------|----------------|
| 1 | category-aware folder icon + chip | `Badge` (variant=outline) + `lucide-react` icon | new helper `getFolderCategory` |
| 2 | "AI" chip on folder + file | `Badge` size=xs + token `bg-ai-soft text-ai` | extend `tree-node.tsx` |
| 3 | toolbar buttons one-line | `AnimatedButton` + `whitespace-nowrap flex-shrink-0` + progressive `md:inline / lg:inline` | `<route>-page.tsx` |
| 4 | replace empty `金額` with folder total | aggregate helper `getFolderAggregates` (compute) + tabular-num cell | new helper |
| 5 | non-wrapping status badge | `Badge` + `whitespace-nowrap px-1.5` | `tree-node.tsx`; consider patching `Badge` base |
| 6 | drop the always-on hint row | delete + replace with `Tooltip` on column header `?` glyph | `folder-management.tsx` |
| 7 | category icon stack | switch on category, render `Icon` + bg tint via token | `getFolderCategory.tsx` |

If a fix would add a new primitive, first ask whether it can be a variant of an existing one — it almost always can.
