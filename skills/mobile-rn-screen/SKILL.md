---
name: mobile-rn-screen
description: >
  Polish one existing React Native screen so it feels native. Use for "this
  screen looks off", "clunky on iOS", "Android looks wrong", "jank when
  scrolling", or "button is unreachable".
license: MIT
paths:
  - "**/ios/**"
  - "**/android/**"
  - "**/app.json"
  - "**/app.config.*"
  - "**/capacitor.config.*"
  - "**/*.gradle"
  - "**/Podfile"
---

> Surface router: `/uiux`. You are here: `mobile-rn-screen`. Native iOS/Android (SwiftUI / Compose, no web layer) is out of scope — use Apple HIG / Material directly.

# Enhance Screen — React Native

**Degree of freedom: MIXED.** Pain, tier, and heuristic mapping
`[HIGH freedom]`; recon, screenshots, no-hex, and ReduceMotion
`[LOW freedom — run exactly]`.

Turn an existing RN screen into a composed, native-feeling interface:
calmer hierarchy, correct platform idioms, tight safe-area and keyboard
handling, purposeful motion, and component primitives that work on both
iOS and Android without forking.

## How to reason

1. **Recon** — screen file, tree, tokens, safe-area chain
2. **Rank** — primary / secondary / metadata / actions
3. **Forensics** — 3 sizes + keyboard + silent pains
4. **Primitive** — fix the shared wrapper; no hex in the screen

## Worked example

> **Recon:** Home uses `ScreenContainer` + extra `useSafeAreaInsets().top` on the back button.
> **Rank:** title is primary; streak count is metadata — it appears twice.
> **Forensics:** 360px back overlaps title (S1/S18); streak ×2 (S10).
> **Primitive:** drop the child inset; keep the hero streak; no new hex.

## Self-critique before reporting

- **Compose first** — hierarchy/safe-area/targets before color or motion
- **Both platforms** — iOS shadow + Android elevation/ripple were both written
- **Tokens only** — no hex literals; ReduceMotion falls back to instant
- **Right owner** — FPS / bundle / Hermes → `mobile-rn-performance`; emulator down → `mobile-emulator-start`

> **Vague-but-visceral native feedback ("button is weirdly big", "text
> gets cut off on my phone", "scrolling feels janky", "can't tap that",
> "looks like a web page") almost always maps to one of the Hidden
> Failure Modes (N1–N15) below — start there, not at decoration.**

> Before taking any screenshots, follow `mobile-emulator-start` SKILL.md to
> bring up a working dev loop on the Android emulator. For iOS, trigger
> a CI build and install via TestFlight; the JS layer is verified on
> Android first (90%+ of "iOS bugs" are platform-agnostic RN/JS bugs).

---

## Rules

> **Compose before decorating.** Fix hierarchy, grouping, alignment,
> safe-area handling, and touch targets before adding colour, motion, blur,
> or shadows. An overlapping status bar is worse than a dull palette.

> **iOS and Android are co-equal targets.** Every change must be verified
> on both platforms. Shadow props are platform-split (iOS: `shadow*`; Android:
> `elevation`). Haptics are iOS-first. Ripple is Android-first. Write both.

> **No hex literals in screen/component code.** Route all colours through the
> design-token system (`theme.colors.*`, `withAlpha`, named constants from
> `@<org>/design-tokens`). Hard-coded hex values bypass dark/high-contrast
> mode support and make tier-A → tier-B colour scaling impossible.

> **Touch targets: 44×44 pt (iOS HIG) / 48×48 dp (M3) minimum.** A 16 dp
> icon inside a 40×40 dp Pressable is too small. Extend invisibly with
> `hitSlop` or a negative-margin Pressable wrapper; do not inflate the
> visual chrome to achieve the target.

> **Safe area is ScreenContainer's job — never add it twice.** If
> `ScreenContainer` (or your repo's equivalent) already applies
> `useSafeAreaInsets()`, adding insets again in a child component produces
> a double-counted gap. `ScreenBackButton` uses `top: 8`, not
> `top: 8 + insets.top`, for exactly this reason.

> **Primitive-first patch.** When a layout, colour, or wrap bug appears on
> multiple screens, fix the shared primitive — not every consumer site.
> A `HubRowItem` with wrong spacing fixed in one place heals every screen
> that uses it.

> **Never ship mock, dead, or rogue UI.** Visual feedback must be backed by
> real data contracts, backend state, or domain helpers. Don't fake progress
> bars, streak counts, or status chips in the component; wire them to the
> real source or add the smallest schema extension needed.

> **Respect `ReduceMotion`.** Every animation must check
> `AccessibilityInfo.isReduceMotionEnabled()` (or your repo's
> `ReduceMotionContext`) and fall back to an instant state change. This is
> non-negotiable; it is required by both Apple HIG and Android accessibility
> guidelines.

> **Use the local design system.** The repo's token system and component
> primitives exist for a reason. Extend an existing primitive before
> inventing a one-off `<View style={{...}}>`.

> **Feedback is native, not web.** Tappables are `Pressable` with a UI-thread
> spring (Reanimated `withSpring`, scale 0.96–0.98) plus Android ripple; never
> a bare `TouchableOpacity`. Haptics carry one meaning each (`expo-haptics`:
> selection for pickers and tabs, impact for snaps, notification for
> success/error) and never fire on plain taps. A two-field secondary flow is
> a sheet with snap points, not a new page. When these smells cover the whole
> app, run `enhance-mobile-native-feel` first and return here per screen.

---

## Workflow Checklist  [LOW freedom — do not skip]

Copy and track:

```
RN ENHANCE /<ScreenName>
- [ ] 0. PLATFORM TIER: domain class → colour-tier (A vibrant / B expressive /
 C productive / D restrained) — see §1.5
- [ ] 1. RECON: screen file, component tree, navigation type, data shape, tokens,
 primitives, ScreenContainer/safe-area wrapper chain
- [ ] 2. CONTENT RANK: primary / secondary / metadata / actions / ambient
- [ ] 3. LIVE READ: screenshots at 3 device configs (small / standard / large phone)
 + tablet if relevant; inspect safe area, keyboard behaviour, landscape
- [ ] 3.5 DEVICE FORENSICS: onLayout measurements for repeated elements, conditional-
 slot zero-state, dup-datum scan per screen, accessibility large-text probe
- [ ] 4. PAIN INVENTORY: user-reported + silent issues from forensics pass
- [ ] 5. HEURISTIC MAP: each pain → NN/g # + RN-specific failure mode
- [ ] 6. PRIMITIVE MATCH: each fix → existing component / token / helper
- [ ] 7. IMPLEMENT: primitive-level fixes first, smallest per-screen diffs after
- [ ] 8. VERIFY: re-screenshot at 3 configs + keyboard up + large-text + dark/light +
 Android + iOS (TestFlight or CI screenshot)
- [ ] 9. WRITE-UP: pain → heuristic → fix → before/after
```

---

## Step 1 — Recon: Understand the Screen Before Touching It  [LOW freedom — run exactly]

### 1a. Read the screen file

```
Glob: **/screens/**/<ScreenName>.tsx   # adapt to the repo layout (apps/mobile/src, src/screens, app/); same for the api/core/design-tokens reads below
Read: the screen file in full
```

Extract:

- **Navigation context**: native stack / modal / bottom sheet / tab root?
 What presents this screen, what does it navigate to?
- **Primary task**: the ONE thing a user comes here to do.
- **Data shape**: entities displayed, all fields available (not just shown).
- **ScreenContainer / SafeAreaView chain**: which wrapper handles safe-area
 insets? Is `headerShown: false`? Are there nested scroll containers?

### 1b. Map the component tree

Build a small ASCII tree:

```
<ScreenContainer>
├── <BlurHeader> — title + back button
├── <EditorialScrollView> — main scrollable body
│ ├── <HubRowItem> — list rows (repeated)
│ └── <FooterBand> — stats / actions
└── <FloatingCTA> — primary action
```

Also note every **wrapper in the layout chain** from the outer safe-area
provider down to the leaf Pressable. This is where double-inset bugs and
gesture conflicts hide.

### 1c. Inventory the data shape

For every entity rendered, list ALL fields available — including unused ones.
Many enhancement opportunities are "we already have this data, we just don't
show it" (e.g. `lastStudied`, `masteryPercent`, `streakCount`).

```
Read: packages/api/src/<entity>/index.ts
Read: apps/mobile/src/state/<entity>.ts
Read: packages/core/src/<entity>/ helpers
```

### 1d. Inventory primitives + tokens (NON-NEGOTIABLE)

```
Glob: apps/mobile/src/components/ui/*.tsx
Glob: apps/mobile/src/components/layout/*.tsx
Read: packages/design-tokens/src/ — semantic colour tokens, grove tokens,
 market-card constants, shadow tokens
Read: apps/mobile/src/lib/theme.ts (or your repo's theme hook)
```

Write the token/primitive list down. Every fix in Step 7 must reference one
of these — never invent a one-off `{backgroundColor: '#2C2C2E'}`.

### 1e. Check forbidden patterns

```
Grep: "DO NOT|FORBIDDEN|avoid|deprecated" in the screen file + component headers
Grep: hex literals in apps/mobile/src/ (ESLint no-restricted-syntax should catch these)
```

---

## Step 1.5 — Domain Colour & Density Tier  [HIGH freedom]

Before touching any colour, name the product class. The same `/8` tint that
reads "premium and restrained" on a B2B dashboard reads "monochromatic and
dead" on a learning app.

| Tier | Examples | Surface bg tint | Accent fill | Categorical hue use |
|------|----------|-----------------|-------------|---------------------|
| **A — Vibrant / Gamified** | Duolingo, language learning, fitness, casual games | `/15–/25` + ring `/30–/40` | solid token, white-on-solid | every meaningful category has a distinct hue (correct/error/streak/xp/premium) |
| **B — Expressive Consumer** | Spotify, Notion playful, lifestyle apps | `/10–/18` + ring `/20–/28` | semi-solid | 3–5 semantic hues, decorative palette restrained |
| **C — Productive / Pro Tools** | Linear, GitHub Mobile, design tools | `/6–/12` tint + ring `/15` | one accent + 4 semantic states | accent for primary action only |
| **D — Restrained / Data-Dense** | Finance, analytics, healthcare, admin | mostly neutral; `/4–/8` on status only | one accent for CTA | colour reserved for data signal |

**How to detect tier:**
1. Read the app's onboarding — "play, streak, level, fun, journey, master" → A/B; "workspace, dashboard, report, audit, pipeline" → C/D.
2. Look at the primary CTA: solid saturated with chunky shadow → A; solid muted → B/C; outline/ghost → D.
3. Count semantic hues in the token set. More than 5 with brand meaning (xp, streak, premium, tone-1..6, correct, error) → tier A.

**Tier mismatch is the top hidden cause of "looks dull" feedback on consumer apps.**
A tier-A app with tier-D `/8` tints will look washed-out even though every
token is technically "correct".

---

## Step 2 — Content Rank Before Layout  [HIGH freedom]

Classify every visible element:

| Rank | Meaning | Default treatment in RN |
|------|---------|--------------------------|
| Primary | What the screen is about | largest `fontSize`, strongest contrast, most vertical space |
| Secondary | Helps interpret primary | near primary, smaller, grouped |
| Metadata | Dates, counts, stats, status | bottom row of a card, trailing Text in a row |
| Actions | What user can do | stable `Pressable` hit area, no overlap with keyboard |
| Ambient | Brand, mood, decorative | background, low-opacity, non-tappable |

Rules:
- If everything is primary, nothing is primary.
- Never stack metadata above the headline; pin it to the row's trailing edge or a card footer.
- If an action has `numberOfLines={1}` and still wraps on a small phone, abbreviate it.
- If a grid has dead space, adjust `numColumns`, card `flex`, or aspect ratio before adding more content.

---

## Step 3 — Live Read: Screenshot on Real Devices  [LOW freedom — run exactly]

### 3a. Three-device-config pass

Use the `mobile-emulator-start` SKILL.md to bring up the Android emulator.
Take screenshots at these three configs (change with `adb shell wm size`):

```
360×800 compact phone (Android S, older iPhones at ~375pt)
412×917 standard phone (Pixel 7 / iPhone 16 default) — PRIMARY test target
430×932 large phone (iPhone 16 Plus / large Android)
```

For tablet-relevant screens add:
```
768×1024 tablet portrait (iPad / Android medium tablet)
```

Screenshot commands:
```bash
adb shell screencap -p /sdcard/sc.png && adb pull /sdcard/sc.png ./screenshot-360.png
adb shell wm size 412x917 && adb shell screencap -p /sdcard/sc.png && adb pull /sdcard/sc.png ./screenshot-412.png
adb shell wm size 430x932 && adb shell screencap -p /sdcard/sc.png && adb pull /sdcard/sc.png ./screenshot-430.png
adb shell wm size reset
```

### 3b. What to note per screenshot

For each config, write 2–3 lines:

```
360×800 — "XP bar truncates label to 2 lines; bottom CTA hidden behind tab bar"
412×917 — "Layout looks clean; streak count duplicated in header AND in hero card"
430×932 — "Dead space in the 2-up grid; right card 40px wider than left"
```

### 3c. Keyboard probe

Tap the first text input on any screen that has one. Note:
- Does `KeyboardAvoidingView` / `KeyboardAwareScrollView` scroll the focused input into view?
- Does the primary CTA remain tappable above the keyboard?
- On Android: `behavior='height'`. On iOS: `behavior='padding'`.

### 3d. Squint test — two passes

Run both; the second is the one most enhancers skip:

| Pass | Question | Failure |
|------|----------|---------|
| **Hierarchy squint** | "Where is my eye pulled first?" | Multiple elements equally loud — primary not chosen |
| **Category squint** | "Can I tell related items apart by colour alone, without reading?" | All tiles same neutral → must read every label (NN/g #6 violation) |

---

## Step 3.5 — Device Forensics (catch the silent bugs)  [LOW freedom — run exactly]

Screenshots show *what looks wrong*. Device forensics shows *why*. Run this
before declaring the screen understood.

### 3.5a — Repeated-element measurement gate

For every group that should render with uniform widths/heights — grid cards,
tab bar items, stat chips, row cells — measure them with `onLayout`:

```tsx
// Drop this temporarily on any repeated component to measure it:
<View onLayout={e => console.log('MEASURE', e.nativeEvent.layout)} />
```

Or use a quick probe in the JS console (Metro/Hermes debugger):

```js
// In Metro remote debugger / React DevTools
// Add onLayout logging to the repeated element, trigger a render,
// read the Metro output for { x, y, width, height } per instance.
```

Expected: widths within 1–2dp of each other for elements in the same row or grid.
Width spread > 4dp on elements that *should* be equal → Yoga flex bug (see N-F1).

### 3.5b — Conditional-slot zero-state probe

For every optional region (media slot, illustration, `aside`, `footerBand`,
`secondaryCTA`), test with the smallest realistic content (empty account,
zero streak, no achievements). Look for:

- A `minHeight` floor reserving space when the slot's content is absent.
- A `View` that renders an empty container with visible padding.
- A card that is ≥ 120 dp tall but contains only an icon and "0".

Fix: conditionally render the wrapper (`{slot && <Region>{slot}</Region>}`)
or collapse the floor on compact screens.

### 3.5c — Information-duplication scan per screen

List every datum (number, percentage, status word, streak count) visible on
the screen and how many times it appears:

```
HomeScreen @ 412×917:
- "12 words today" ×3 (hero chip, progress bar label, footer row)
- streak "5d" ×2 (hero badge, streak section title)
- "68%" ×2 (progress bar, Today metric tile)
```

Anything appearing ≥2× on the same screen is a duplicate. Pick the most
actionable placement; delete the others. Each delete is a hierarchy upgrade
for what stays. (NN/g #8 Aesthetic & Minimalist.)

### 3.5d — Category-squint colour pass

For a tier-A/B product, take the standard-phone screenshot and apply a
10–15px blur. A 3-up or 4-up of category tiles should show as 3–4 *distinct*
colour blobs. If they blur to the same neutral → token tints are the wrong
tier (see H15 in this skill's Hidden Failure Modes).

### 3.5e — Large dynamic type probe

In the emulator: Settings → Accessibility → Font size → set to the largest
option. Reload the app and screenshot. Look for:

- Text overflowing its container (fixed-height Views with Text inside).
- Row items wrapping to 2 lines when they should stay on one.
- Buttons that clip their label.

Fix: remove fixed heights on Text containers; use `numberOfLines={1}` +
`adjustsFontSizeToFit` for labels that must stay on one line;
`maxFontSizeMultiplier={2}` on critical UI labels.

---

## Step 4 — Pain Inventory  [HIGH freedom]

Maintain a single table. Include user-reported pains AND silent ones from Step 3.5.

| # | Source | Pain | Config | Notes |
|---|--------|------|--------|-------|
| 1 | user | "Back button overlaps the header title" | 390pt | double safe-area inset |
| 2 | user | "Streak number shows up twice on the home screen" | all | dup-datum — H14 |
| 3 | live | Tab bar clips last row of FlatList | 360px | missing contentInset |
| 4 | live | CTA wraps to 2 lines on 360px | compact | label too long — S9 |
| 5 | live | All 3 tone cards blur to same neutral | 412px | tier-A with tier-D tints |

**Do not skip silent pains.** The user reports the loudest issue; the worst ones
are often invisible to them.

### 4b — Silent-Pain Catalogue for RN (always check these)

| # | Pain class | Where to look | NN/g | Symptom |
|---|-----------|---------------|------|---------|
| S1 | Safe area violation | Screenshot on notched device; check top/bottom edges | #1 Visibility | Status bar overlaps content; home indicator covers CTA |
| S2 | Sub-minimum touch target | `onLayout` on Pressable; < 44×44pt (iOS) / 48×48dp (Android) | Fitts's, #4 | Users mis-tap; icon buttons always affected |
| S3 | Keyboard occlusion | Tap input, keyboard opens; is the field visible? | #1 Visibility | Active input hidden behind keyboard |
| S4 | Tab bar content clipping | Scroll FlatList to last item | #8 Minimalist | Bottom card partially hidden behind tab bar |
| S5 | Large text breakage | Enable Accessibility → largest font size | #4 Consistency | Labels wrap; containers clip; icons misalign |
| S6 | Platform shadow mismatch | Compare iOS and Android screenshots | #4 Consistency | Cards flat on Android, lifted on iOS (or vice versa) |
| S7 | Gesture conflict | Try swipe on a SwipeRow inside a ScrollView | #3 User Control | Swipe opens but also scrolls; one gesture cancels the other |
| S8 | JS-thread jank | Trigger animation while scrolling a long list | #1 Visibility | Animation stutters; 60fps drops below 30fps |
| S9 | Wrapping label / CTA | Screenshot at 360×800 | #4 Consistency, Fitts's | Button text breaks to 2 lines at compact width |
| S10 | Information duplication | Step 3.5c scan | #8 Minimalist | Same count/status shown 2–3× on one screen |
| S11 | Wrapper-collapsed tiles | Step 3.5a onLayout measurements | #4 Consistency | Grid tiles uneven; some narrower than expected |
| S12 | Dead conditional slot | Step 3.5b zero-state probe | #8 Minimalist | Reserved space for absent illustration/media |
| S13 | Active-state mass mismatch | Compare active vs inactive tab/dock items | #4 Consistency | Active tab uses full-cell background fill — looks 1.5× heavier |
| S14 | Brand-color competition | Count brand-tinted elements per zone | Visual hierarchy | Multiple brand-colored surfaces in one region; CTA loses scent |
| S15 | Monochromatic surface | Step 3.5d category squint | #1 Visibility, #6 Recognition | Tier-A app with tier-D /5–/8 tints; tiles all same neutral |
| S16 | Left-anchored stacked cards | Screenshot | #4 Consistency | Every card full-width, every label left; no horizontal balance |
| S17 | Missing Android ripple | Tap Pressable on Android with ripple=null | #1 Visibility | No visual feedback on Android tap |
| S18 | Double safe-area inset | Check wrapper chain for 2× useSafeAreaInsets | #4 Consistency | Extra gap at top/bottom; ScreenBackButton appears too low |
| S19 | Web-shaped feedback | Grep `TouchableOpacity`, `Vibration.vibrate`; tap on device | #1 Visibility, #4 | Opacity-only press, no ripple, haptic on every tap or none on confirm |
| S20 | JS-drawn tab bar on iOS 26 | `position: 'absolute'` bar in a layout file | #4 Consistency | Bar ignores Liquid Glass, does not minimize on scroll, dates the app |

---

## Step 5 — Heuristic Map  [HIGH freedom]

For each pain, name the violated heuristic. A pain that cannot be tied to
a heuristic is probably a personal taste call — defer it.

| # | Pain | NN/g # | RN failure mode | Why it violates |
|---|------|--------|-----------------|-----------------|
| 1 | Back button overlaps title | #4 Consistency | N13 (double inset) | Two inset additions produce layout inconsistency |
| 2 | Streak shown twice | #8 Minimalist | S10 (info duplication) | Redundant copies fragment attention |
| 3 | Tab bar clips FlatList | #1 Visibility | N4 (tab bar clipping) | System-status element (tab bar) hides content |
| 4 | CTA wraps at 360px | #4 Consistency, Fitts | S9 (wrapping CTA) | Hit-target shape unstable across screen widths |
| 5 | All tone cards same neutral | #1 Visibility, #6 Recognition | S15 (monochromatic) | Category signal hidden; user must read every label |

---

## Step 6 — Primitive Match (no inventions)  [HIGH freedom]

For each fix, match an existing primitive or token:

| # | Fix | Primitive / token | File |
|---|-----|-------------------|------|
| 1 | Remove double inset | ScreenContainer already applies insets; remove the extra `useSafeAreaInsets().top` from the child | ScreenName.tsx |
| 2 | Delete duplicate streak display | Remove the footer strip; keep the hero badge (most actionable placement) | HomeScreen.tsx |
| 3 | Add `contentInsetAdjustmentBehavior` or `contentInset` to FlatList | `FlatList` prop | ScreenName.tsx |
| 4 | Abbreviate CTA label or use `numberOfLines={1}` + icon | existing `Button` primitive | ScreenName.tsx |
| 5 | Bump tile tint from `/8` to `/20` + ring | design-token constants from `@org/design-tokens` | tile component |

**If a fix would add a new primitive, stop and ask: "could this be a variant on
an existing component?" Almost always: yes.**

### 6b — Primitive-First Patch Decision

Same rule as `enhance-web-ui` — fix the wrapper, not the consumer:

```
Does the bug appear on more than one screen?
├── Yes → Walk UP the component tree. Find the first shared component
│ that hosts the bug. If ≥ 3 screens use it → fix at the primitive.
└── No → Fix at the consumer. Document: "if a 2nd screen reuses this
 pattern, move the fix to the primitive."
```

Concrete RN cues that the primitive is broken:

- `FlatList` on 3 screens all missing `contentInset` → add it to a shared `ScreenList` wrapper.
- Every `Pressable` in the codebase has `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`
 copy-pasted → make it the default in a `TouchablePrimitive` wrapper.
- Every screen's `Text` for metadata has `fontSize: 12, color: theme.colors.secondary` inline
 → create a `MetaText` primitive.

---

## Further reading

- [Step 7 — Enhancement Plan and more](references/details.md)
- `enhance-mobile-native-feel` — app-wide chrome, IA, lists, motion, haptics before per-screen polish
