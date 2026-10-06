# enhance-ux-laws — laws, thresholds and fixes

The claim and precondition of each law, the Step 3 threshold table (law, evidence, threshold, basis), and the Step 5 per-law fix catalogue.

## Contents

- What each law claims, and what it does not
- Thresholds
- Fixes

## What each law claims, and what it does not

Most damage done in the name of these laws comes from applying one outside its
precondition. Check the middle column before writing a finding.

| Law | Claim | Applies when | It does not say |
|---|---|---|---|
| **Fitts** (1954) | Time to acquire a target grows with distance and shrinks with size: `T = a + b·log₂(D/W + 1)` | The user points at something: tap, click, drag | "Bigger is always better" — the gain is logarithmic, and size should track frequency and importance |
| **Hick–Hyman** (1952) | Decision time grows with the log of the number of equally likely options | Options must be read and weighed: plans, actions, filters, unfamiliar categories | Anything about looking up a known item in an ordered list (countries, prefectures) — that is search, so give it typeahead |
| **Miller** (1956) | Working memory holds about 7 ± 2 chunks; later work puts it nearer 4 (Cowan, 2001) | The user must hold something in mind: a code, a value from another screen, instructions | "Menus may have at most 7 items" — a visible menu is read, not memorised |
| **Jakob** (Nielsen, 2000) | People spend most of their time in other products and expect yours to work the same | A convention exists for this pattern on this platform and in this locale | "Copy the market leader" — a convention is what users already do, including name order, address order, and date format for the locale |
| **Zeigarnik** (1927) | Unfinished tasks stay on the mind more than finished ones; replications are mixed, so treat it as a design heuristic | Work spans interruptions or sessions | "Create open loops" — invented incompleteness is a dark pattern |
| **Goal-Gradient** (Hull, 1932; Kivetz et al., 2006) | Effort rises as the goal gets closer; a head start raises completion (Nunes & Drèze, 2006: 34% vs 19%) | A multi-step goal with a visible end | "Any progress bar helps" — slow early progress raises abandonment (Conrad et al., 2010) |
| **Von Restorff** (1933) | The item that differs from its neighbours is noticed and remembered | One item should win attention in this view | "Highlight the important things" — distinctiveness is a budget of one; a second accent spends it |

## Thresholds

| Law | Evidence | Threshold | Basis |
|---|---|---|---|
| Fitts | `under24`, `smallest` | 0 targets under 24×24 CSS px, unless a 24px circle around each stays clear, the link sits in a sentence, or the control is an unstyled native default | WCAG 2.2 SC 2.5.8 (AA) |
| Fitts | `under44` on touch layouts | primary and frequent targets ≥ 44×44 CSS px (48 on Android) | Apple HIG 44pt, Material 48dp, WCAG 2.5.5 (AAA) |
| Fitts | `tightest` | ≥ 8px between targets when either is under 44; a destructive action never within 8px of a frequent one | Material spacing; *house* |
| Fitts | flow walk 4, `primaryGuess.yPct` | the completing action sits directly after the last input; on phones, within thumb reach or in a sticky bottom bar | *house* |
| Hick | `choiceSets`, flow walk 6 | choice sets over 7 that need evaluating are grouped, staged, or given a default | *house* |
| Hick | `repeatedActions`, `radio:` sets | pickers show ≤ 4 options with one recommended and preselected, when usage data supports the choice | *house* |
| Von Restorff | `accentsInFold` | one filled accent action per view | *house* |
| Von Restorff | `loopingAnimations` | nothing loops past 5s without a pause control; `prefers-reduced-motion` honoured | WCAG 2.2.2 (A) |
| Von Restorff | emphasis channels | emphasis uses colour plus size, weight, icon, or position, at ≥ 3:1 against neighbours | WCAG 1.4.1, 1.4.11 |
| Miller | `placeholderOnly`, `unlabeled` | 0 — every field keeps a visible label while filled | WCAG 3.3.2; *house* |
| Miller | `longCodes`, flow walk 8 | strings of 7+ characters shown in groups of 3–4 with Copy; inputs accept spaces and dashes | *house* |
| Miller | `forms[].fields` vs `groups` | forms over 7 fields split into labelled groups of 3–5 | *house* |
| Miller | flow walk 3 | nothing must be remembered from an earlier screen; entered data is reused | WCAG 3.3.7 (A) |
| Jakob | `fakeControls`, flow walk 5 and 7 | 0 — every control is a native element, or carries role, name, and keyboard support, and does something | WCAG 4.1.2, 2.1.1 |
| Jakob | `homeLink`, `search`, `inlineLinksNoUnderline`, `noAutocomplete` | logo links home; sentence links differ by more than colour; standard `autocomplete` tokens set | WCAG 1.4.1, 1.3.5 |
| Jakob | `inputsUnder16px` on phone layouts | 0 — iOS zooms the page when a focused field's text is under 16px | platform behaviour |
| Goal-Gradient | `progress`, flow walk 2 | flows of 3+ steps show position and total; the indicator never moves backward; the total never grows after start | *house* |
| Zeigarnik | flow walk 1 | input survives reload and Back; the return screen offers a way to resume | *house* |

## Fixes

**Fitts**
- Raise the minimum height and padding on the `Button`, `IconButton`, and row-action primitives; add gap tokens between adjacent targets
- Extend hit areas without enlarging chrome: padding, a wrapping `<label>`, or an inset pseudo-element
- Shorten travel: submit directly under the last field, row actions on the row, the next step where the last one ended. On phones, a sticky bottom action bar clear of the safe area
- Screen edges are effectively infinite targets for a mouse only when the control touches the edge with no margin; touch gets no such benefit
- Separate destructive from frequent actions by distance. Offer undo where the server can reverse the action; otherwise confirm

**Hick**
- Recommend one option: preselected, labelled with a reason that is true ("Most booked")
- Disclose progressively: frequent options visible, the rest behind "More" or an advanced section
- Stage decisions one per step when each depends on the last
- Group related options under headings; replace long known-item lists with typeahead
- Fill defaults from real data: last used, locale, the account's plan
- Without usage data, keep every option visible, group them, preselect nothing, and list the missing data as an open item. A recommendation needs a true reason

**Von Restorff**
- Give one action per view the filled accent variant; move the others to outline, ghost, or text variants
- Isolate with whitespace and position as well as colour
- Spend the accent on the user's task, not on promotion; emphasis styled like an advert gets ignored
- Stop looping animation after the first cycle or on interaction

**Miller**
- Add persistent labels; move help text beside the field it explains; show errors inline at the field
- Format long strings in groups and add Copy; accept any spacing on input
- Keep earlier choices in view: a summary panel, selected filters as chips, a review step before commit
- Put compared items in one view, side by side
- Group long forms into labelled fieldsets of 3–5 fields

**Jakob**
- Replace `div`/`span` controls with `<button>`, `<a>`, `<select>`, `<label>`
- Put the logo, navigation, search, account, and cart where the platform puts them; use the words users already know ("Sign in", "Cart", "Settings")
- Keep Enter, Esc, Back, and swipe-back doing what they do everywhere else; Back preserves input
- Set `autocomplete` tokens so the browser fills what it knows
- Compare against two or three products the target users open daily, in their locale. When a deviation is worth it, make one and teach it
- For a redesign of a product people already use, their expectations come from the old version: stage the change or offer a preview

**Zeigarnik**
- Autosave drafts per field or per step; restore on return
- Add a resume entry where returning users land: "Continue your booking"
- Show what remains as a short checklist built from real completion flags
- Every cue offers a way to finish and a way to dismiss
- Drafts never hold card numbers, security codes, passwords, or one-time codes; they expire; and the draft and its cue are cleared when the task completes

**Goal-Gradient**
- Show position and total ("Step 2 of 3"), or time remaining when length varies
- Count completed prerequisites as progress: an account already created is step 1 done
- Make the first step quick so progress is felt early; announce every step up front
- Break long goals into sub-goals so a finish line is always near; near the end, show what is left ("1 step left")
- Make steps behave like pages: each gets a history entry so Back moves one step, focus moves to the step heading, and validation runs per step
