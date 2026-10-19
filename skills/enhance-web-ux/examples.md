# Enhancement Walkthroughs

## Contents

- [Example 1 — `/files` (file explorer)](#example-1-files-file-explorer)
- [Example 2 — `/notifications` zip viewer (single notice)](#example-2-notifications-zip-viewer-single-notice)
- [Template — Use This for Future Enhancements](#template-use-this-for-future-enhancements)
- [Enhanced /<route>](#enhanced-route)

Real-world before/after enhancements that follow the SKILL.md workflow. Each walkthrough is
short and shows how RECON → LIVE → PAIN → HEURISTIC → PRIMITIVE → IMPLEMENT → VERIFY plays
out on a concrete page.

---

## Example 1 — `/files` (file explorer)

### Step 1 — Recon

- **Workflow position:** central document hub. Users land here from notifications,
  reimbursement, tax-filing, and from the global breadcrumb.
- **Primary task:** find a file or folder, then either open it, link it to an entry,
  or download.
- **Data domain:** `UploadedFile`, `Folder`, `TreeItem`. Files carry `aiData`,
  `confirmedData`, `fileMetadata`. Folders carry `description`, `linkedDocumentTitle`,
  `linkedDocumentType`, `isDocumentLinked`.
- **Adjacent screens:** `/notifications`, `/reimbursement`, `/tax-compliance`.
- **Component tree:**

  ```
  <FileManagementPage>
  ├── <PageHeader>        — title, breadcrumbs, summary KPIs
  ├── <Toolbar>           — search, "+フォルダ", "アップロード", "通知書ZIP"
  └── <FolderManagement>
      └── <TreeNode>      — file or folder row
  ```

- **Primitives available:** `Badge`, `Button`, `AnimatedButton`, `Tooltip`, `Card`.
  Tokens: `signal-warn`, `signal-out`, `signal-in`, `ai`, `ai-soft`, `brand`, `muted`.
  Helpers: `getFileIcon`, `getFileStatus`, `getFolderFileCount`, `formatFileSize`,
  `formatFileCount`.

### Step 2 — Live (3 viewports)

| Viewport | Observation |
|----------|-------------|
| 1440 | Toolbar fits, but every folder uses the same blue `<Folder>` icon. `金額` and `サイズ` columns are blank for all folder rows. |
| 1024 | `通知書ZIP` button label competes for space; about to wrap. Always-on hint row "☐ チェックで選択 / Shift+クリック / Ctrl+A" repeats above every list. |
| 800 | Toolbar buttons wrap to 2 lines. Category labels (`経費`, `通知書`) wrap under names. |
| Expand notice folder | `未処理` status badge inside 64px column wraps to `未処` / `理`. |

### Step 3 — Pain inventory

| # | Source | Pain | Viewport |
|---|--------|------|----------|
| 1 | user | "Hard to see which were document link" | all |
| 2 | user | "Which folder had AI analysis" | all |
| 3 | user | "Which folder were linked to other document types" | all |
| 4 | user | Buttons overflow text in 2 lines | 1024 |
| 5 | live | All folder icons identical | all |
| 6 | live | Empty `金額` / `サイズ` columns for folder rows | desktop |
| 7 | live | `未処理` badge wraps to 2 lines | desktop |
| 8 | live | Always-on hint row consumes vertical space | all |
| 9 | live | Date duplicated (under name AND in column) | all |
| 10 | live | Empty (0件) folders look identical to populated ones | all |

### Step 4 — Heuristic mapping

| # | Heuristic | Why |
|---|-----------|-----|
| 1, 3, 5 | #1 Visibility, #6 Recognition, #2 Match Real World, Miller's | linked / categorised state hidden in label text |
| 2 | #1 Visibility, Tesler's | AI is an expensive async result rendered invisibly |
| 4, 7 | #4 Consistency, Fitts's | Japanese 2-character labels in a fixed column without nowrap |
| 6, 9 | #8 Minimalist | empty / duplicate cells fight for attention |
| 8 | #6 Recognition, #8 Minimalist | repeating affordance hint = recall, wastes a row forever |
| 10 | #8 Minimalist | populated rows should dominate |

### Step 5 — Primitive match

| # | Fix | Primitive / token |
|---|-----|-------------------|
| 1, 5 | category-aware icon + chip | new `getFolderCategory` helper → `Badge` + `lucide-react` icons + tone tokens |
| 2 | AI chip | `Badge`-style chip with `bg-ai-soft text-ai` |
| 3 | linked-document chip | `Link2` icon + `bg-signal-in/10 text-signal-in` |
| 4 | toolbar buttons | `whitespace-nowrap flex-shrink-0`, progressive `md:inline / lg:inline` labels, Tooltip with full label |
| 6 | folder aggregates | new `getFolderAggregates` → cells render `formatJpy` + `formatBytesShort` |
| 7 | non-wrapping status | pass `whitespace-nowrap` per call site, widen status column 64→78 |
| 8 | drop hint, add `?` tooltip | `Tooltip` on column header |
| 9 | drop inline date | delete inline date in `TreeNode` |
| 10 | dim empty folders | `opacity-70` |

### Step 6 — Plan

| Pri | File | Change | Risk |
|-----|------|--------|------|
| 1 | `helpers/get-folder-category.tsx` (NEW) | category → `{ Icon, label, tone }` | low |
| 2 | `helpers/get-folder-utils.tsx` | add `getFolderAggregates(files, folderId)` | low |
| 3 | `components/tree-node.tsx` | use category icon, drop empty cells, AI chip, nowrap | med |
| 4 | `components/folder-management.tsx` | drop hint row, retitle columns, sticky `?` | low |
| 5 | `pages/file-management-page.tsx` | toolbar nowrap + progressive labels | low |
| 6 | `tree-node.tsx` (grid) | status column 64→78, count 60→56 | low |

### Step 7 — Implement

Land helpers first; component refactor next; page-level toolbar last. After each diff,
lint the touched files (ReadLints in Cursor; the repo's lint script in Claude Code). Comment the *intent* only — e.g.:

```tsx
// Status column widened 64→78px so stacked AI+status chips never collide
// with the count column. Count column tightened 60→56px to compensate.
export const FILE_ROW_GRID_COLS = "… sm:grid-cols-[… 78px 56px 28px]"
```

### Step 8 — Verify

Re-screenshot at 1440 / 1024 / 800. Click into the same notice folder. Confirm:

- folder icons differentiated by category
- AI / 未処理 / 連携 chips inline on rows
- toolbar buttons single-line at all widths (icon-only at narrow)
- status badges single-line; AI + 未処理 stacked vertically when both present
- empty folders at `opacity-70`
- always-on hint replaced by `?` tooltip; live hint only when selecting

### Step 9 — Write-up table

| Pain | Heuristic | Fix | Primitive |
|------|-----------|-----|-----------|
| Hard to see linked-document folders | #1, #6 | `Link2` chip + linked tone | `Badge`, `signal-in` |
| Which folders had AI | #1 | inline `AI` chip on folder + file | `Badge`, `ai`/`ai-soft` |
| Generic folder icons | #6, #2 | `getFolderCategory` per-domain icon + tone | helper + Lucide |
| Toolbar wrap | #4, Fitts's | `whitespace-nowrap` + progressive labels | `Button` + `Tooltip` |
| Empty `金額` / `サイズ` | #8 | folder aggregates | `getFolderAggregates` |
| Status badge wrap | #4 | `whitespace-nowrap` + widened column | `Badge` + grid |
| Always-on hint row | #6, #8 | `?` tooltip; live hint only when selecting | `Tooltip` |
| Empty folders compete | #8 | `opacity-70` | utility class |

---

## Example 2 — `/notifications` zip viewer (single notice)

### Step 1 — Recon

- **Workflow position:** terminal — user opens a single notification document received
  from e-Gov / e-Tax / eLTAX.
- **Primary task:** read the notice content; understand which file inside the zip is
  the meaningful one.
- **Data domain:** `Notice` with attached files (`xml`, `xsl`, `kagami` cover sheet,
  `zip` original). `xsl` files contain the styled view; `xml` files contain the data.
- **Adjacent screens:** `/notifications` list (back), `/files` (where the zip is stored).

### Step 2 — Live

| Viewport | Observation |
|----------|-------------|
| 1440 | Single document panel takes full width. The other zip files are nowhere visible. Clicking on `kagami.xsl` triggers download instead of view. |
| 1024 | Same — no way to navigate between files inside the zip. |
| 800 | Same. |

### Step 3 — Pain

| # | Pain |
|---|------|
| 1 | Other files in the zip are invisible — user can't browse them |
| 2 | Click on .xsl/.xml/.zip downloads instead of previewing |
| 3 | XML / XSL preview is raw monospace dump — unreadable |
| 4 | Labels `適用結果`, `成形結果` are jargon — user doesn't understand which to read |

### Step 4 — Heuristic

| # | Heuristic | Why |
|---|-----------|-----|
| 1 | #1 Visibility, #6 Recognition | siblings inside the zip are hidden |
| 2 | #2 Match Real World | a "view" intent should not download |
| 3 | #8 Minimalist, #4 Consistency | raw dump is not human-friendly |
| 4 | #2 Match Real World | engineering jargon in a user surface |

### Step 5 — Primitive match

| # | Fix | Primitive |
|---|-----|-----------|
| 1 | left tree-list of all files inside the zip | `TreeView` primitive (or extend `<FolderManagement>`) |
| 2 | inline reader instead of download | `<NoticeFileReadableView>` component |
| 3 | XSL-styled rendering for `.xml`+`.xsl`, syntax-highlighted for raw `.xml` | use `xslt-processor` or `xmldom`; primitives: `<CodeBlock>` for fallback |
| 4 | rename labels `適用結果`→`通知書（読みやすく整形）`, `成形結果`→… | content fix |

### Step 6 — Plan

| Pri | File | Change |
|-----|------|--------|
| 1 | `notice-file-tree.tsx` (NEW) | left-panel tree of files inside zip |
| 2 | `notice-file-readable-view.tsx` (NEW) | inline reader component |
| 3 | `notice-detail-panel.tsx` | merge tree + reader, drop download-on-click |
| 4 | (content) | rename jargon labels |

### Step 7 — Implement

(Already shipped in the codebase — see `src/features/notice-document/components/`.)

---

## Template — Use This for Future Enhancements

When this skill runs, end the session with a write-up in this format. The user should be
able to scan it in 30 seconds:

```markdown
## Enhanced /<route>

### What changed
- [primitive] [behaviour change] — heuristic #N
- …

### Files changed
- `<path>` — [one-line purpose]

### Verified
- 1440 / 1024 / 800 viewport screenshots — no wrap, no overflow, no collision
- Lint clean
- Console clean

### Pain → Heuristic → Fix
| Pain | Heuristic | Fix | Primitive |
|------|-----------|-----|-----------|
| … | … | … | … |
```

Add the latest enhancement here (Example 3, 4, …) every time this skill ships changes,
so future runs can mine concrete past patterns.
