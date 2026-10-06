# Heuristics & Laws of UX — Quick Reference

The canonical references the agent maps every pain point against. Source-of-truth links are
at the bottom. Keep this lean — the goal is fast lookup, not a textbook.

---

## NN/g 10 Usability Heuristics (Nielsen, 1994; updated 2024)

### #1 Visibility of System Status

The system always tells the user what is happening, via appropriate feedback in reasonable
time.

**On screen:** loading spinners, progress bars, "saved" toasts, inline status chips
("AI解析済", "連携済", "未処理"), breadcrumbs showing where you are, badges that count
unread items, real-time validation under form fields.

**Common violations:** async work runs invisibly (AI extraction, autosave, sync); state
that affects routing decisions (linked vs. unlinked) is hidden one click deep; nav doesn't
show selection.

---

### #2 Match Between System and Real World

Speak the user's language. Use words, phrases, concepts familiar to them. Follow real-world
conventions, natural ordering.

**On screen:** "Empty trash" not "Purge resource"; receipt icon for receipts, plane icon
for travel; date in the user's locale; sort orders that match how the domain actually
thinks (newest first for messages, alphabetical for files, status-grouped for tasks).

**Common violations:** engineering jargon in user-facing labels (`fileStatus=unlinked`),
generic icons for domain-specific entities, unfamiliar mental models forced on users.

---

### #3 User Control & Freedom

Users make mistakes — provide a clearly marked emergency exit. Support undo and redo.

**On screen:** Cancel buttons on every modal, Undo toasts after destructive actions,
breadcrumb to step out, browser-back honoured, multi-step forms remember progress on back.

**Common violations:** modals with only "OK"; bulk delete with no undo; form abandonment
loses all input; no way to back out of an irreversible workflow step.

---

### #4 Consistency & Standards

Same things look the same, different things look different. Follow platform conventions
(Jakob's Law: users spend most of their time on OTHER products).

**On screen:** primary-action button looks the same on every page; destructive actions
are red everywhere; date format consistent; same icon = same meaning across views;
keyboard shortcuts (`Cmd+K`, `Esc`, `?`) match platform norms.

**Common violations:** two different "Submit" buttons styled differently; the same status
shown as "✓", "OK", and "完了" in three places; clickable items that don't look clickable.

---

### #5 Error Prevention

Better than a good error message: a design that prevents the error.

**On screen:** disabled state on submit until the form is valid; date pickers (not free
text); type-safe enums (not free strings); confirmation step on irreversible bulk
operations; auto-save on long forms.

**Common violations:** free-text fields that should be enums; destructive actions a single
mis-click away; forms that submit on Enter inside textarea; copy-paste of formatted text
silently mangling input.

---

### #6 Recognition Rather Than Recall

Make options visible. Don't make users remember information from one screen to use it on
another.

**On screen:** breadcrumbs showing the path; recent searches autocompleted; field labels
always visible (not just placeholder); icon + text labels; keyboard shortcuts listed in
menus next to actions; "you saw this 5 mins ago" markers.

**Common violations:** placeholder-only labels that disappear on focus; cryptic icon-only
toolbars; forms across multiple steps that don't summarise prior input; "remember which
tab you were on" expected of the user.

---

### #7 Flexibility & Efficiency of Use

Shortcuts speed up expert use. Allow users to tailor frequent actions.

**On screen:** keyboard shortcuts; bulk actions; saved filters / views; multi-select with
shift-click; right-click menus; quick command palette (`Cmd+K`); customisable columns;
power-user features hidden behind a `Show advanced` toggle.

**Common violations:** every action is N clicks deep; no keyboard alternative; no way to
batch a repeated action; expert workflow forces novice flow.

---

### #8 Aesthetic & Minimalist Design

Interfaces should not contain information that is irrelevant or rarely needed. Every extra
unit of information competes with the relevant ones.

**On screen:** empty cells removed (not just left blank); progressive disclosure (`Show
more`); collapsing sections; default-collapsed advanced settings; no decorative noise.

**Common violations:** empty `Amount` and `Size` columns for folder rows; "Tip:" boxes
that never go away; instruction rows above every list; logo + nav + breadcrumb + tab bar
+ section header all stacked.

---

### #9 Help Users Recognize, Diagnose, and Recover from Errors

Plain language, precise problem, constructive solution.

**On screen:** "Email is required" under the field, not "Validation failed"; "File too
large (12 MB) — max 10 MB. Compress or split it." with a Compress button; 404 pages
with search; failure toasts that include a Retry button.

**Common violations:** error codes without explanation; "Something went wrong"; errors
that vanish before reading; field-level errors floating in a global toast.

---

### #10 Help and Documentation

Best is no docs needed; if needed, easy to search, focused on the user's task, listing
concrete steps.

**On screen:** in-context tooltips on icon-only buttons; a `?` link near complex fields;
empty states that explain what the section will contain and how to populate it; first-run
checklists.

**Common violations:** docs in a separate site requiring auth; tooltips that explain the
icon's name not its action; no empty state at all.

---

## Laws of UX (supporting principles)

### Jakob's Law

> Users spend most of their time on OTHER sites. They expect yours to work the same way.

**Implication:** copy patterns from category leaders. A file explorer should look like
Drive / Dropbox / Mega. A code editor should look like VS Code / IntelliJ. Don't reinvent
where convention exists.

### Hick's Law

> Time to make a decision = log₂(N+1) of options.

**Implication:** group related actions; collapse rarely-used options under "More"; never
show all 12 filters at once if 3 cover 90% of use. Applies only when options must be
weighed; looking up a known item in an ordered list (a country, a prefecture) is search,
so give it typeahead instead of trimming it.

### Fitts's Law

> Time to acquire a target ∝ distance / size.

**Implication:** primary actions should be large and stable; toolbar buttons must not
shrink to 24px on hover; click targets at least 44×44 px on touch; destructive actions
NOT immediately adjacent to common ones.

### Miller's Law

> The average person can hold ~7 ± 2 items in working memory; later work puts it nearer 4
> (Cowan, 2001).

**Implication:** it is about what the user must *hold in mind*, not how many items a screen
shows. A visible menu is read, not memorised, so this law sets no cap on menu length. Do:
keep labels visible while fields are filled, show earlier choices instead of making users
remember them, group long codes in 3–4s with Copy, split long forms into labelled groups of
3–5 fields, show running totals. For a measured pass on one flow, use `enhance-ux-laws`.

### Tesler's Law (Law of Conservation of Complexity)

> Every system has irreducible complexity. The question is who absorbs it — designer,
> developer, or user.

**Implication:** if the user keeps asking "which folder had AI done?", the complexity is
currently absorbed by the user. Move it to the system: show an inline AI chip. Cost the
designer / dev time, save every user every time forever.

### Doherty Threshold

> Productivity skyrockets when the system responds in <400 ms.

**Implication:** optimistic UI updates; skeleton loaders; pre-fetch on hover; never let
the user wait without feedback (see #1).

### Postel's Law

> Be liberal in what you accept, conservative in what you produce.

**Implication:** accept dates in many formats, normalise on display; trim whitespace;
parse "1,234.56" and "1234.56" the same; case-insensitive search.

### Aesthetic-Usability Effect

> Users perceive aesthetically pleasing design as easier to use.

**Implication:** spacing, typography, and visual rhythm are not "polish" — they are
usability. Don't ship raw functionality without applying the design system.

### Peak-End Rule

> People judge an experience by its peak (best/worst moment) and its end.

**Implication:** make sure the success-state of any flow (form submitted, payment done,
file uploaded) feels good — confetti, micro-celebration, summary, clear next step. Don't
just dump them back to the list view with no acknowledgement.

---

## Mapping Heuristics to Common UI Symptoms

| Symptom | First check | Second check |
|---------|-------------|--------------|
| User asks "which one is X?" | #6 Recognition | #2 Match Real World |
| User asks "did it work?" | #1 Visibility | Doherty Threshold |
| User asks "how do I undo?" | #3 Control & Freedom | #5 Error Prevention |
| Two screens look subtly different | #4 Consistency | Jakob's Law |
| Page feels crowded / heavy | #8 Minimalist | Hick's Law, Miller's Law |
| Buttons too small / wrap / overflow | Fitts's Law | #4 Consistency |
| Async result hidden / discoverable | #1 Visibility | Tesler's Law |
| Power user complains it's slow to use | #7 Flexibility | Hick's Law |
| Error looks like a system stack trace | #9 Recover from Errors | #2 Match Real World |
| Empty page with no explanation | #10 Help & Docs | Peak-End Rule |

---

## Sources

- [NN/g — 10 Usability Heuristics for User Interface Design](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [NN/g — 10 Usability Heuristics Applied to Complex Applications](https://www.nngroup.com/articles/usability-heuristics-complex-applications/)
- [Laws of UX](https://lawsofux.com/)
- [Tognazzini — First Principles of Interaction Design](https://asktog.com/atc/principles-of-interaction-design/)
