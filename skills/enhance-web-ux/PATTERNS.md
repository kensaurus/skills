# Anti-Pattern → Replacement Library

## Contents

- [1. Generic Icon for Every Item Type](#1-generic-icon-for-every-item-type)
- [2. Empty Cells in a Data Grid](#2-empty-cells-in-a-data-grid)
- [3. Always-On Hint / Instruction Row](#3-always-on-hint-instruction-row)
- [4. Toolbar Button Labels Wrap to 2 Lines](#4-toolbar-button-labels-wrap-to-2-lines)
- [5. Status Badge Wraps Inside a Narrow Column](#5-status-badge-wraps-inside-a-narrow-column)
- [6. No Indicator for Async / Computed Results (AI, Link, Sync)](#6-no-indicator-for-async-computed-results-ai-link-sync)
- [7. Identical Visual Weight for Empty vs. Populated Rows](#7-identical-visual-weight-for-empty-vs-populated-rows)
- [8. Generic 3-Column Card Grid Used as Default Layout](#8-generic-3-column-card-grid-used-as-default-layout)
- [9. Date Shown in Two Places on the Same Row](#9-date-shown-in-two-places-on-the-same-row)
- [10. Mixed Icon Libraries in the Same View](#10-mixed-icon-libraries-in-the-same-view)
- [11. "Just an Empty State" — No Guidance, No Next Step](#11-just-an-empty-state-no-guidance-no-next-step)
- [12. Destructive Action Adjacent to Common Action](#12-destructive-action-adjacent-to-common-action)
- [13. Free-Text Field That Should Be an Enum / Picker](#13-free-text-field-that-should-be-an-enum-picker)
- [14. No Keyboard Shortcuts on a Power-User Surface](#14-no-keyboard-shortcuts-on-a-power-user-surface)
- [15. "Stacked" Status Indicators That Don't Compose](#15-stacked-status-indicators-that-dont-compose)
- [How to Use This File](#how-to-use-this-file)

A living catalogue of "smells" found on real pages and the design-system-respecting
replacements. Each entry links the smell to its NN/g heuristic and gives a concrete code
shape for the fix. Add entries every time the agent runs an enhancement and discovers a new
pattern worth remembering.

---

## 1. Generic Icon for Every Item Type

**Smell:** every folder / row / card uses the same `<Folder>` icon. The user must read
the title to discriminate type.

**Heuristic:** #6 Recognition over Recall, #2 Match Real World, Miller's Law

**Replacement:** introduce a small pure-function helper that maps an item to a
`{ Icon, label, tone }` object. Icon comes from the icon library already in use.
Label is a short Japanese / English domain noun. Tone references existing semantic tokens
(`signal-warn`, `ai`, `brand`, `muted`).

```tsx
// helpers/get-folder-category.tsx
export interface FolderCategory {
  label: string
  Icon: LucideIcon
  iconColorClass: string  // text-* token
  iconBgClass: string     // bg-*/n token
  chipClass: string       // border + bg + text token tuple
}

export const getFolderCategory = (item: TreeItem): FolderCategory => {
  if (item.data?.isDocumentLinked) return { label: "連携", Icon: Link2, ... }
  if (/notice|通知|e-gov/.test(haystack)) return { label: "通知書", Icon: BellRing, ... }
  if (/template|雛形/.test(haystack))      return { label: "雛形", Icon: LayoutTemplate, ... }
  // … one branch per domain category, default last
  return { label: "フォルダ", Icon: Folder, ... }
}
```

Then in the renderer:

```tsx
const cat = getFolderCategory(item)
<span className={cn("h-7 w-7 rounded-sm flex items-center justify-center", cat.iconBgClass)}>
  <cat.Icon size={14} className={cat.iconColorClass} />
</span>
<span className={cn("text-[11px] px-1.5 py-0.5 rounded-sm border whitespace-nowrap", cat.chipClass)}>
  {cat.label}
</span>
```

**Why it's better than ad-hoc inline icons:** new categories are one branch in one file;
icon + label + tone always travel together (no chance of an orange icon with a blue label);
unit-testable.

---

## 2. Empty Cells in a Data Grid

**Smell:** a folder row in a "Files" grid shows blank `Amount` and `Size` columns because
folders don't have those scalars. Whole columns are wasted whitespace for half the rows.

**Heuristic:** #8 Aesthetic & Minimalist Design

**Replacement:** EITHER (a) compute a meaningful aggregate (sum of contained file
amounts, sum of contained file sizes, count of contained files), OR (b) merge the column
with another for that row type.

```tsx
// helpers/get-folder-aggregates.ts
export interface FolderAggregates {
  fileCount: number
  aiAnalyzedCount: number
  unlinkedCount: number
  totalAmount: number
  totalSizeBytes: number
}
export const getFolderAggregates = (files: UploadedFile[], folderId: string): FolderAggregates => { ... }
```

```tsx
// renderer
{ item.type === "folder" ? (
  <>
    <span className="text-right tabular-nums">{formatJpy(agg.totalAmount)}</span>
    <span className="text-right tabular-nums">{formatBytesShort(agg.totalSizeBytes)}</span>
  </>
) : (
  <>
    <span className="text-right tabular-nums">{formatJpy(file.amount)}</span>
    <span className="text-right tabular-nums">{formatBytesShort(file.size)}</span>
  </>
)}
```

**Bonus:** dim the cell to muted when the value is zero. Don't render `0` loud — render
`—` muted. Renders empty rows visually subordinate to populated ones.

---

## 3. Always-On Hint / Instruction Row

**Smell:** above every list there is a row that reads "☐ チェックで選択 / Shift+クリック /
Ctrl+A: すべて". It is repeated forever and consumes a row of vertical real estate that
never goes away.

**Heuristic:** #6 Recognition over Recall, #8 Aesthetic & Minimalist Design

**Replacement:** show the hint *only when the affordance is in use*. The rest of the time,
collapse to a discreet `?` with a tooltip.

```tsx
{/* Tiny `?` glyph in column header */}
<div title="クリックで選択・Shift+クリックで範囲選択・Ctrl+Aですべて選択"
     className="flex items-center justify-center text-muted-foreground/60 cursor-help">
  <span className="text-[10px] leading-none">?</span>
</div>

{/* Live hint bar — only when N rows selected */}
{selected.size > 0 && (
  <div className="px-3 py-1 bg-signal-in border-b border-signar-in text-xs">
    <span className="font-medium whitespace-nowrap">{selected.size}件選択中</span>
    <span className="whitespace-nowrap text-brand/60">Esc: 解除</span>
  </div>
)}
```

**Why:** affordances should be discoverable, not constantly recited. Once a user has
selected a row, the hint about HOW to select becomes useless and the hint about WHAT to do
NEXT becomes useful.

---

## 4. Toolbar Button Labels Wrap to 2 Lines

**Smell:** at certain widths a button label like `通知書ZIP` or `アップロード` wraps and
breaks the toolbar's visual rhythm. The button suddenly takes 2 lines of vertical space.

**Heuristic:** #4 Consistency, Fitts's Law

**Replacement:** combination of `whitespace-nowrap`, `flex-shrink-0`, and **progressive
label visibility** based on Tailwind breakpoints — show full label only when there is room
for it; collapse to icon-only otherwise. Always keep a tooltip with the full label.

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        size="sm"
        className="h-9 flex-shrink-0 whitespace-nowrap px-2.5"
        aria-label="通知書ZIPを取り込む"
      >
        <BellRing size={16} />
        <span className="hidden lg:inline ml-1.5 whitespace-nowrap">通知書ZIP</span>
      </Button>
    </TooltipTrigger>
    <TooltipContent>e-Gov・e-Tax・eLTAXの通知書ZIPを取り込む</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

Conventional breakpoints for label visibility:

- `default → lg` (icon-only) for tertiary actions (`通知書ZIP`)
- `default → md` (icon-only) for secondary actions (`フォルダ`)
- `always` for primary CTAs (`アップロード`)

**NEVER** let a label wrap. If you can't fit it, hide the text and rely on the tooltip.

---

## 5. Status Badge Wraps Inside a Narrow Column

**Smell:** a 64px column shows a `Badge` with the label `未処理`. The badge wraps to render
`未処` on one line and `理` on the next.

**Heuristic:** #4 Consistency

**Replacement:** at the **primitive** level, add `whitespace-nowrap` to the Badge variants
so this never happens again anywhere. As a fallback (if you don't own the primitive), pass
`className="whitespace-nowrap"` at every call site AND widen the column to fit the natural
chip width.

If you have multiple chips for one row that don't fit horizontally (e.g. AI marker + status
badge), STACK THEM VERTICALLY (`flex-col gap-0.5`). Never let them try to fit horizontally
in a column that doesn't have the room.

```tsx
{/* Status column — stacks vertically when both AI + status exist */}
<div className="flex flex-col items-center justify-center gap-0.5">
  {file.aiData && <span className="… AI chip …">AI</span>}
  {file.status === "unlinked" && (
    <Badge variant="destructive" size="xs" className="whitespace-nowrap px-1.5">
      <AlertTriangle size={9} /> 未処理
    </Badge>
  )}
</div>
```

---

## 6. No Indicator for Async / Computed Results (AI, Link, Sync)

**Smell:** the system ran AI extraction or linked a file to a journal entry, but the row
gives no visual marker. The user has to click in to find out.

**Heuristic:** #1 Visibility of System Status, Tesler's Law

**Replacement:** an inline chip on the row, themed with a dedicated semantic token
(`bg-ai-soft text-ai`, `bg-signal-in text-signal-in`). For folder rows, count and show:
`AI×3` means "3 of the files in here have AI metadata". For file rows, just `AI`.

```tsx
{file.aiData && (
  <span
    className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-sm
               border border-ai/40 bg-ai-soft px-1 py-0.5 text-[10px] font-medium
               leading-none text-ai"
    title="AIで内容が解析されています"
  >
    <Sparkles size={8} />
    AI
  </span>
)}
```

**Why a chip and not a dot or an icon?** Recognition: a labelled chip needs no key.

---

## 7. Identical Visual Weight for Empty vs. Populated Rows

**Smell:** a folder with 0 files and a folder with 12 files look exactly the same.

**Heuristic:** #8 Minimalist (don't fight for attention), #6 Recognition

**Replacement:** apply `opacity-70` (or muted variant) to the empty row's container.
Don't hide it — the user still needs to see the count — but stop letting it compete.

```tsx
const folderIsEmpty = item.type === "folder" && (folderData.fileCount ?? 0) === 0
<div className={cn("…", folderIsEmpty && "opacity-70")}>…</div>
```

---

## 8. Generic 3-Column Card Grid Used as Default Layout

**Smell:** every "section" of a page is the same icon → title → 1-line description card,
laid out in a uniform 3-column grid. This is the most reliable AI-tell.

**Heuristic:** #4 Consistency (broken — it's the SAME consistency to a fault), Aesthetic-
Usability Effect

**Replacement:** vary layout by section purpose. Hero gets a generous full-bleed asymmetric
layout. Stats get a compact horizontal strip with tabular numbers. Long-form content gets
a max-width column. Action lists get a vertical stack with leading icons. The page should
have visual rhythm, not pattern repetition.

Concrete checklist:

- Different `py-*` per section type (hero generous, form tight, footer minimal)
- Different number of columns per section (1 / 2 / 3 / asymmetric)
- Different border-radius semantics (pill for tags, rounded for cards, sharp for tables)

---

## 9. Date Shown in Two Places on the Same Row

**Smell:** the row shows `2024/04/18` inline under the name AND in a dedicated `Date`
column, both saying the same thing.

**Heuristic:** #8 Minimalist

**Replacement:** delete one. Choose the one that aligns vertically with peers (the column
form), so the eye can scan dates top-to-bottom without re-fixating per row.

---

## 10. Mixed Icon Libraries in the Same View

**Smell:** the same view uses some icons from `lucide-react`, some from `@heroicons`, some
custom SVGs.

**Heuristic:** #4 Consistency

**Replacement:** pick one icon library per project. If you must use multiple, scope by
context: e.g. all *navigation* uses one library, all *content* icons use another, never
mixed within a single visual unit.

---

## 11. "Just an Empty State" — No Guidance, No Next Step

**Smell:** an empty list shows "No items" or worse, just nothing.

**Heuristic:** #10 Help & Documentation, Peak-End Rule (the first interaction is the empty
state)

**Replacement:** every empty state should answer three questions:

1. **What goes here?** ("Upload your first invoice…")
2. **Why doesn't it have anything yet?** ("Drop a PDF or…")
3. **How do I add one?** With a CTA button matching the page's primary action.

Optional: a small illustration that matches the brand voice (NOT generic stock).

---

## 12. Destructive Action Adjacent to Common Action

**Smell:** `Save` and `Delete` are next to each other in the same toolbar, same size, same
colour family.

**Heuristic:** #5 Error Prevention, Fitts's Law

**Replacement:** physical separation (move destructive into an overflow menu), visual
separation (destructive uses `signal-out` colour), confirmation step (a typed
"DELETE" or a double-click for irreversibles).

---

## 13. Free-Text Field That Should Be an Enum / Picker

**Smell:** a date or category field is a free `<input>`, accepting anything the user types.

**Heuristic:** #5 Error Prevention, Postel's Law

**Replacement:** a `<DatePicker>` or `<Combobox>` that constrains values. If you must
accept free text (e.g. tags), normalize on blur and offer an autocomplete based on
existing values.

---

## 14. No Keyboard Shortcuts on a Power-User Surface

**Smell:** a list view that an operator uses 100 times a day requires mouse for everything.

**Heuristic:** #7 Flexibility & Efficiency, Hick's Law

**Replacement:** add at minimum:

- `j/k` or arrow keys to move selection
- `Enter` to open
- `Esc` to close / deselect
- `Cmd+A` to select all
- `Cmd+K` for command palette / search
- `?` to show a shortcut overlay

Document them in a `?` overlay (recognition over recall).

---

## 15. "Stacked" Status Indicators That Don't Compose

**Smell:** the row has icons / dots / chips for AI, link, error, processing — and they're
all rendered inline, fighting for the same horizontal slot, no clear semantic ordering.

**Heuristic:** #8 Minimalist, #4 Consistency

**Replacement:** define a status priority and render *one primary chip per row* (the most
urgent state) plus a small cluster of *micro-chips* for orthogonal facts (AI marker, lock,
favourite). Group like with like; don't randomly intersperse.

---

## How to Use This File

1. When the agent finds a smell on a page, search this file for the closest match.
2. Apply the replacement pattern, adapting tokens to the project's design system.
3. If the smell is *new* (no match), document it here as a new entry once the fix lands.
4. Reference the entry number in the enhancement write-up so future readers can trace the
   reasoning.
