---
name: enhance-ux-laws
description: >
  Measured fix pass on one screen or flow against seven Laws of UX: Fitts,
  Hick, Miller, Jakob, Zeigarnik, Goal-Gradient, Von Restorff. Use when "too
  many choices", "hard to tap", or "users drop off mid-flow". NN/g pass →
  enhance-web-ux.
license: MIT
---

# Enhance UX with the Laws of UX

**Degree of freedom: MIXED.** Probe run, thresholds, and re-measure
`[LOW freedom — run exactly]`; scoping, diagnosis, law conflicts, and fix
design `[HIGH freedom]`.

Takes one screen or flow and improves it against seven behavioural laws, using
measured values in place of impressions. Each law answers one question about
the person using the screen:

| Question | Law | Lever |
|---|---|---|
| Can they hit it? | Fitts | target size and travel distance |
| Can they decide? | Hick | number and weight of simultaneous choices |
| Do they see what matters? | Von Restorff | one distinct element per view |
| Can they hold it in mind? | Miller | chunking; nothing carried between screens |
| Does it work the way they expect? | Jakob | conventions from products they already use |
| Will they come back and finish? | Zeigarnik | visible, resumable unfinished work |
| Will they push through to the end? | Goal-Gradient | visible, honest progress |

Fix by default. When the request is for a review only, stop after the
findings table.

## How to reason

1. **Scope** — one screen or flow, its primary task, who uses it (first-time or daily), pointer type per layout
2. **Measure** — probe at phone and desktop widths, then the flow walk for what the DOM cannot show
3. **Diagnose** — each finding = law + measured value + threshold + why the law's precondition holds here
4. **Resolve** — where two laws pull apart, pick by the conflict table and say so
5. **Fix** — repair a broken flow first, then the smallest change at the shared component or token, driven by real product state
6. **Verify** — re-run the probe and the flow walk; report before → after per metric

## Worked example

Illustrative. Probe values are from a real run against a test booking page.

> **Scope:** `/book`, phone (touch) and desktop. Primary task: pick a site type and pay. First-time visitors.
> **Measure @390×844:** `under24` 17 of 38 targets; Edit/Delete 23×14 and 39×14, 2px apart; `accentsInFold` 8 filled blue; `repeatedActions` Choose ×6; nav 14 flat links; form 11 fields, 0 groups, 8 `placeholderOnly`, 3 `unlabeled`; `longCodes` one 16-digit reference; `stepButtons` Back/Next with 0 `indicators`; `fakeControls` `div:Pay now`; `homeLink` false. Flow walk: reload at step 2 empties the form; Next does nothing; a pasted card number with spaces is cut short.
> **Diagnose:** Jakob — "Pay now" is a `div` that submits nothing and the keyboard cannot reach (blocker). Zeigarnik — reload wipes the form (blocker). Fitts — Delete is 14px tall, 2px from Edit: destructive mis-tap (blocker). Von Restorff + Hick — 8 equal accents, six equally weighted plans (major). Miller — labels vanish on typing; reference must be retyped by hand (major). Goal-Gradient — no position in a 3-step flow (major).
> **Not a finding:** the prefecture select has 21 options, but people look up a known answer in a conventional order, so Hick does not apply. Left as is.
> **Resolve:** hiding three plans under "More site types" adds a tap (Hick vs Fitts); accepted because those three are 8% of bookings.
> **Fix:** `<button type="submit">` and working steps first; `Button` primitive gets a 44px min height and 8px gap; Delete moves away from Edit, behind a confirm; three plans visible, one preselected "Most booked"; one filled CTA per view, the rest outline; persistent labels in three fieldsets; reference rendered `8842 0193 7745 1206` with Copy; "Step 2 of 3" from the real step index; draft saved per field, card number excluded.
> **Verify:** `under24` 17 → 0, `accentsInFold` 8 → 1, `placeholderOnly` 8 → 0, `fakeControls` 1 → 0, `indicators` 0 → 1; reload at step 2 restores input; the pasted card number is kept whole.
> **Contract change:** `/book` now receives a `plan` field; the plan was never submitted before.

## Self-critique before reporting

- **Measured** — every finding carries a probe value or a flow-walk observation, and its after-value from a re-run
- **Precondition stated** — each finding says why the law applies here (Hick: the options need evaluating; Miller: the user must hold the item in memory)
- **Real state** — every progress, draft, or completeness cue reads product data; the report names the field
- **Nothing sensitive stored** — drafts exclude card numbers, security codes, passwords, and one-time codes; the report lists what is persisted and for how long
- **One accent** — `accentsInFold` shows one filled accent action per view at both widths
- **Primitive-first** — a finding that repeats is fixed in the shared component or token, with the call sites listed
- **Conflicts named** — where two laws disagreed, the report says which won and why
- **Right owner** — full WCAG sweep → `audit-accessibility`; breakpoints → `audit-responsive`; NN/g page pass → `enhance-web-ux`

## What each law claims, and what it does not

Most damage done in the name of these laws comes from applying one outside its precondition. Check the claim, the "applies when" condition, and the "it does not say" column before writing a finding: [references/thresholds-and-fixes.md](references/thresholds-and-fixes.md) §What each law claims.

## Step 1 — Scope  [HIGH freedom]

Read the route file and its top-level components. Record:

- **Primary task** — the one thing a person comes to this screen to do, and the action that completes it
- **Users** — first-time, occasional, or daily. Daily users tolerate density and want speed; first-time users need conventions and guidance
- **Pointer** — touch, mouse, or both per layout. Touch thresholds apply to every layout a phone or tablet will see
- **Flow** — steps before and after this screen, and whether the task can span sessions
- **Primitives and tokens** — the shared `Button`, `Input`, `Field`, `Badge`, progress component, colour tokens
- **Real state available** — step index, completion flags, timestamps, draft storage, usage counts per option. Progress and resume cues are built from these

## Step 2 — Measure  [LOW freedom — run exactly]

### 2a. Probe

Save the probe as `ux-laws-probe.js` in a scratch directory outside the repo and work from there: the CLI writes its `.playwright-cli/` folder, the JSON, and the screenshots into the current directory. Evaluate it in the live page at a phone width and a desktop width, resizing before navigating; repeat for each state that matters (filled, error, menu open, every step) by driving the same session there and evaluating again to a new file. With the pack installed, follow `protocol-browser-anti-stall` for browser sessions.
Run loop, probe script, and the candidate-confirmation notes (what the probe cannot see): [references/probe.md](references/probe.md).

### 2b. Flow walk

Eight checks the DOM cannot answer. Record one line each.

1. **Leave and return** — fill half the flow, reload, press Back, close and reopen. What survives? Is there a cue on return that work is waiting?
2. **Promise vs delivery** — count the steps the flow announces and the steps it takes. Note any step that appears after the announced last one
3. **Carry-over** — at each step, list what the user needs from an earlier screen: a code, a price, an instruction, a selection
4. **Travel** — trace the pointer or thumb through the primary task. Note long jumps between consecutive actions (last field bottom-left, submit top-right)
5. **Keyboard** — Tab through. Every target reachable, in visual order, with Enter and Esc doing what they do elsewhere
6. **Evaluate or look up** — for each choice set over 4, does the user weigh options or find a known one?
7. **Dead controls** — press every button and link on the primary path. Note any that does nothing, and any choice that never reaches the submitted data
8. **Type and paste** — in each long numeric field, type a value and paste one with spaces (`4242 4242 4242 4242`). Is it kept whole and grouped?

## Step 3 — Diagnose  [LOW freedom thresholds, HIGH freedom judgment]

One row per finding: law, evidence, threshold, why the precondition holds,
severity. Thresholds marked *house* are working targets, adjustable for a
dense professional tool with a stated reason.

Threshold table — law | evidence | threshold | basis, with WCAG, HIG, Material, and *house* targets: [references/thresholds-and-fixes.md](references/thresholds-and-fixes.md) §Thresholds.

**Severity.** *Blocker*: the task fails or work is lost (a primary target
under 24px, a control that does nothing or that the keyboard cannot reach,
input wiped on Back or reload). *Major*: the primary task is measurably
slower or misleading (several equal accents, placeholder-only labels on a
long form, a 5-step flow with no position). *Minor*: secondary paths and
polish.

## Step 4 — Resolve conflicts  [HIGH freedom]

The laws optimise different things, so a fix for one can break another.

| Conflict | Resolution |
|---|---|
| Hick vs Fitts — hiding options adds taps and travel | Keep the top 3–5 options by real usage visible; hide only the long tail. One extra tap costs more than two extra options |
| Hick vs Jakob — trimming an item users expect to find | Conventional items stay (search, cart, account, back). Trim what is specific to this product |
| Von Restorff vs Jakob — a distinct control that no longer reads as a control | Differ in colour, size, or position; keep the conventional shape and behaviour |
| Fitts vs density — larger targets push content off screen and into memory | On dense desktop tools, enlarge the hit area with padding or a pseudo-element while the visible control stays compact |
| Miller vs Goal-Gradient — more, smaller steps lengthen the road | Split until each step holds one decision or 3–5 fields, then show position and total |
| Zeigarnik and Goal-Gradient vs calm — every cue is a demand on attention | One open-loop cue per surface, tied to real state, with a way to finish it or dismiss it |

When no row applies, order by what fails hardest: can't hit or can't operate
→ breaks an expectation → too many choices → weak emphasis → weak motivation.
The first two stop the task; the rest slow it.

## Step 5 — Fix  [HIGH freedom]

Repair a broken flow before tuning it: no law helps a task that cannot
complete. Dead controls get behaviour or get removed, and a choice the user
makes has to reach the submitted data. Record every resulting change to what
the backend receives.

Then fix in the shared component or token when a finding repeats, and use the
design system's existing variants. Progress, drafts, and completeness cues
read real state; when the state does not exist, add the smallest persistence
that makes the cue true, or propose it.

Per-law fix catalogue (Fitts, Hick, Von Restorff, Miller, Jakob, Zeigarnik, Goal-Gradient): [references/thresholds-and-fixes.md](references/thresholds-and-fixes.md) §Fixes.

Cues with no state behind them are out of scope as fixes: unread badges for
nothing, a meter that cannot reach 100%, a bar driven by a timer, a head
start that was not earned. They work once and cost the product its
credibility.

## Step 6 — Verify  [LOW freedom — run exactly]

1. Re-run the probe at the same widths and states; save `after-*.json` and `after-*.png`
2. Repeat the flow-walk checks that produced findings
3. Fill the before → after column for every finding. A metric still over threshold stays in the report with its reason
4. Run the repo's lint, typecheck, and tests for the touched components. Where none exist, script the flow walk and report that

## Output format

1. **Scope** — route, primary task, users, pointer types, widths and states measured
2. **Measurements** — law | metric | threshold | before (phone / desktop) | after (phone / desktop)
3. **Flow walk** — check | before | after
4. **Findings** — # | law | evidence | precondition | severity | fix | file
5. **Not findings** — probe candidates dismissed, with the precondition that failed
6. **Conflicts** — which laws disagreed, which won, why
7. **Changes** — files touched, primitive-level changes first; then contract changes: fields the backend now receives differently, new required or optional decisions, what is persisted and for how long
8. **Open items** — metrics still over threshold with the reason; state or data that must exist before a cue can be built; handoffs

## Other surfaces

- **Native (React Native, SwiftUI, Compose)** — the probe is web-only. Measure with layout callbacks or the inspector; thresholds are 44pt on iOS and 48dp on Android. With the pack installed, `mobile-rn-screen` owns the screen
- **Mockup or screenshot only** — run the same pass by estimating from the image, and mark every value "estimated"

## Related

- `enhance-web-ux` — NN/g heuristics and DOM forensics for one page
- `audit-ux` — heuristic report without fixes
- `audit-accessibility` — full WCAG sweep; this skill uses a few criteria as thresholds
- `enhance-web-forms` — validation, schema parity, form structure
- `enhance-onboarding` — activation event and steps to first value
- `enhance-web-conversion` — pricing and landing-page persuasion
- `audit-responsive` — breakpoint layout