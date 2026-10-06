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

Save the probe as `ux-laws-probe.js` in a scratch directory outside the repo
and work from there: the CLI writes its `.playwright-cli/` folder, the JSON,
and the screenshots into the current directory. Evaluate the probe in the
live page at a phone width and a desktop width. Resize before navigating so
the page lays out at the target width from first paint. With the pack
installed, follow `protocol-browser-anti-stall` for browser sessions.

```bash
PW="npx --yes @playwright/cli@latest"; S="-s=ux-laws"
$PW $S open "<app-url>"
for wh in "390 844" "1440 900"; do
  $PW $S resize $wh && $PW $S goto "<route>"
  $PW $S eval "$(cat ux-laws-probe.js)" --filename "before-${wh// /x}.json" > /dev/null
  $PW $S screenshot --filename "before-${wh// /x}.png" --full-page
done
$PW $S close
```

Read the JSON files. The probe measures the state the page is in, so repeat
it for each state that matters — filled, error, menu open, every step of a
flow — by driving the same session there (`fill`, `click`) and evaluating
again to a new file. Any driver that evaluates JavaScript in the page works
as well: Playwright `page.evaluate`, a DevTools or browser-automation script
tool, or pasting `(<probe>)()` into the console.

```js
() => {
  const vw = innerWidth, vh = innerHeight, cap = a => a.slice(0, 12);
  const R = el => el.getBoundingClientRect(), CS = el => getComputedStyle(el);
  const vis = el => { const r = R(el), s = CS(el);  // checkVisibility also catches closed <details> and hidden ancestors
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && +s.opacity > 0.05 &&
      (!el.checkVisibility || el.checkVisibility()); };
  const label = el => (el.getAttribute('aria-label') || (el.tagName === 'SELECT' ? el.name : el.innerText) ||
    el.value || el.placeholder || el.name || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 32);
  const SEL = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],' +
    '[role=link],[role=tab],[role=menuitem],[role=checkbox],[role=switch],[role=radio]';
  const targets = [...document.querySelectorAll(SEL)].filter(vis);
  const inFold = el => { const r = R(el); return r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0; };
  // Hit area = element box, extended by its <label> when it has one.
  const hit = el => { let r = R(el), b = { l: r.left, t: r.top, r: r.right, b: r.bottom };
    for (const lb of el.labels || []) { const q = R(lb);
      b = { l: Math.min(b.l, q.left), t: Math.min(b.t, q.top), r: Math.max(b.r, q.right), b: Math.max(b.b, q.bottom) }; }
    return { ...b, w: Math.round(b.r - b.l), h: Math.round(b.b - b.t) }; };
  // Links inside a sentence are exempt from WCAG 2.5.8: their size follows the line of text.
  const inline = el => el.tagName === 'A' && CS(el).display === 'inline' && !!el.closest('p,li,dd,td,blockquote,figcaption') &&
    [...el.parentElement.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 12);
  const gap = (a, b) => Math.round(Math.max(a.l - b.r, b.l - a.r, a.t - b.b, b.t - a.b, 0));
  const hits = targets.filter(el => !inline(el)).map(el => ({ el, ...hit(el) }));

  // FITTS — size, spacing, position of the main action
  const small = hits.filter(t => Math.min(t.w, t.h) < 44);
  const tiny = small.filter(t => Math.min(t.w, t.h) < 24);
  const sized = t => ({ name: label(t.el), w: t.w, h: t.h });
  const crowded = [];
  hits.forEach((a, i) => hits.slice(i + 1).forEach(b => {
    if (Math.min(a.w, a.h, b.w, b.h) >= 44 || a.el.contains(b.el) || b.el.contains(a.el)) return;
    const g = gap(a, b); if (g < 8) crowded.push({ a: label(a.el), b: label(b.el), gapPx: g }); }));
  crowded.sort((p, q) => p.gapPx - q.gapPx);

  // VON RESTORFF — filled, saturated controls competing in the first fold
  const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
  const filled = el => { const [r, g, b, a = 1] = rgb(CS(el).backgroundColor);
    return a > 0.5 && (Math.max(r, g, b) - Math.min(r, g, b)) > 60; };
  const pointerRoots = [...document.querySelectorAll('body *')].filter(el => vis(el) &&
    CS(el).cursor === 'pointer' && CS(el.parentElement).cursor !== 'pointer' &&
    !el.matches(SEL + ',label') && !el.closest(SEL + ',label'));
  const accents = {};
  [...targets, ...pointerRoots].filter(el => inFold(el) && filled(el)).forEach(el => {
    const k = CS(el).backgroundColor; (accents[k] = accents[k] || []).push(label(el)); });

  // HICK — sets of options offered at once
  const choiceSets = [];
  document.querySelectorAll('nav,[role=navigation],[role=tablist],[role=toolbar],[role=menu],[role=radiogroup]')
    .forEach(c => { const n = [...c.querySelectorAll(SEL)].filter(vis).length;
      if (n) choiceSets.push({ set: c.getAttribute('aria-label') || c.tagName.toLowerCase(), options: n,
        grouped: !!c.querySelector('h2,h3,h4,h5,[role=group],hr,ul ul,details') }); });
  document.querySelectorAll('select').forEach(s => { if (vis(s)) choiceSets.push({ set: 'select:' + label(s),
    options: s.options.length, grouped: !!s.querySelector('optgroup') }); });
  const radios = {};
  document.querySelectorAll('input[type=radio][name]').forEach(r => {
    if (vis(r) || [...(r.labels || [])].some(vis)) (radios[r.name] = radios[r.name] || []).push(r); });
  Object.entries(radios).forEach(([name, rs]) => choiceSets.push({ set: 'radio:' + name, options: rs.length,
    preselected: rs.some(r => r.checked) }));
  const byLabel = {};
  targets.filter(el => /^(BUTTON|A)$/.test(el.tagName) || el.getAttribute('role') === 'button')
    .forEach(el => { const k = label(el); byLabel[k] = (byLabel[k] || 0) + 1; });
  const repeatedActions = Object.entries(byLabel).filter(([, n]) => n >= 3).map(([name, count]) => ({ name, count }));

  // MILLER — things the user has to hold in their head
  const inputs = targets.filter(el => /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !/^(submit|button|reset|image)$/.test(el.type));
  const named = el => (el.labels && el.labels.length) || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.title;
  const forms = [...document.forms].map(f => { const fs = inputs.filter(el => f.contains(el));
    return { form: f.getAttribute('aria-label') || f.getAttribute('name') || f.getAttribute('action') || 'form',
      fields: fs.filter(el => el.type !== 'radio').length + new Set(fs.filter(el => el.type === 'radio').map(el => el.name)).size,
      groups: [...f.querySelectorAll('fieldset,[role=group],h2,h3,h4')].filter(vis).length,
      required: fs.filter(el => el.required).length }; });
  const longNumericInputs = inputs.filter(el => el.tagName === 'INPUT' && (el.inputMode === 'numeric' || el.type === 'tel' ||
    /cc-number|one-time-code/.test(el.autocomplete) || /card|otp|code|iban|account/i.test(el.name + el.id)))
    .map(el => ({ name: label(el), maxLength: el.maxLength }));
  const longCodes = cap([...new Set((document.body.innerText.match(/\b(?=[A-Z0-9]*\d{4})[A-Z0-9]{10,}\b/g) || []))]);

  // GOAL-GRADIENT + ZEIGARNIK — is progress visible, and is this a multi-step flow?
  const stepWords = /^(next|continue|back|previous)\b|^(次へ|戻る|進む|続ける)/i;
  const progressText = (document.body.innerText.match(
    /(step|ステップ)\s*\d+\s*(of|\/|／)\s*\d+|\d+\s*(of|\/|／)\s*\d+\s*(steps?|complete|done|完了)|\d{1,3}\s*%\s*(complete|done|完了)/gi) || []);
  const progress = { indicators: document.querySelectorAll('progress,meter,[role=progressbar],[aria-current=step]').length,
    text: cap(progressText), stepButtons: targets.filter(el => stepWords.test(label(el))).map(label) };

  // JAKOB — conventions users bring from every other product
  const isHome = a => { try { const u = new URL(a.href); return u.origin === location.origin && u.pathname === '/'; } catch { return false; } };
  const jakob = {
    homeLink: [...document.querySelectorAll('header a[href],[role=banner] a[href]')].some(isHome),
    search: !!document.querySelector('input[type=search],[role=search],[role=searchbox]'),
    fakeControls: cap(pointerRoots.map(el => el.tagName.toLowerCase() + ':' + label(el))),
    inlineLinksNoUnderline: cap(targets.filter(el => inline(el) && CS(el).textDecorationLine === 'none').map(label)),
    inputsUnder16px: inputs.filter(el => !/^(radio|checkbox|range|color|file)$/.test(el.type) && parseFloat(CS(el).fontSize) < 16).length,
    noAutocomplete: inputs.filter(el => el.tagName === 'INPUT' && !el.autocomplete &&
      (/^(email|tel|password)$/.test(el.type) || /name|mail|phone|tel|postal|zip|addr|card/i.test(el.name + el.id))).map(label),
  };
  const primary = hits.filter(t => inFold(t.el) && filled(t.el)).sort((a, b) => b.w * b.h - a.w * a.h)[0];

  return {
    viewport: { vw, vh, touch: matchMedia('(pointer: coarse)').matches },
    fitts: { targets: hits.length, under24: tiny.length, under44: small.length,
      smallest: cap(small.sort((a, b) => Math.min(a.w, a.h) - Math.min(b.w, b.h)).map(sized)),
      crowdedPairs: crowded.length, tightest: cap(crowded),
      primaryGuess: primary ? { ...sized(primary), xPct: Math.round(100 * (primary.l + primary.w / 2) / vw),
        yPct: Math.round(100 * (primary.t + primary.h / 2) / vh) } : null },
    hick: { targetsInFold: targets.filter(inFold).length, choiceSets: choiceSets.filter(c => c.options > 4), repeatedActions },
    vonRestorff: { accentsInFold: Object.entries(accents).map(([bg, names]) => ({ bg, count: names.length, names: cap(names) })),
      loopingAnimations: cap([...document.querySelectorAll('body *')].filter(el => vis(el) &&
        CS(el).animationName !== 'none' && CS(el).animationIterationCount === 'infinite').map(label)) },
    miller: { forms, placeholderOnly: cap(inputs.filter(el => !named(el) && el.placeholder).map(label)),
      unlabeled: cap(inputs.filter(el => !named(el) && !el.placeholder).map(label)), longNumericInputs, longCodes },
    progress, jakob,
  };
}
```

The probe reports candidates. Confirm each one against the page before it
becomes a finding:

- It measures element boxes. A hit area extended by a pseudo-element or a padded parent handler reads smaller than it is
- `touch` reflects the device running the probe, not the resized width. Decide touch from the product
- `primaryGuess` is the largest filled control in the fold. When `accentsInFold` holds several, the guess is arbitrary — which is the Von Restorff finding. `null` means no filled action is visible before scrolling
- `fakeControls` relies on `cursor: pointer`. Click handlers without it need a code search (`onClick` on `div`/`span`). A real `<button>` that does nothing passes; flow walk 7 catches it
- `choiceSets` and `repeatedActions` count options (the same label on three or more buttons is usually a picker). Whether they need evaluating is the Hick precondition, judged in Step 3
- `longNumericInputs` lists fields to try by hand in flow walk 8; the DOM does not show how a field formats what is typed
- `longCodes` reads text content, so a code grouped only by CSS spacing still appears. Confirm by eye

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