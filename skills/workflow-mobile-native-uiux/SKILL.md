---
name: workflow-mobile-native-uiux
description: >
  Run the whole native UI/UX pass on an existing Capacitor, Expo, or RN app:
  plumbing, native feel, a11y, layout, device QA, PR. Use for "fix our mobile
  UI/UX end to end".
license: MIT
metadata:
  chain: "enhance-capacitor-ui mobile-capacitor-platform enhance-mobile-native-feel audit-accessibility audit-responsive mobile-emulator-test workflow-pr"
---

# workflow-mobile-native-uiux — Existing app → native feel → verified PR

**Degree of freedom: MIXED.** Which fixes each screen gets `[HIGH freedom]`;
step order, skip rules, device probes, and the PR evidence
`[LOW freedom — run exactly]`.

The app ships and works, but it reads as a website in a shell. This workflow
runs the mobile skills in the order their outputs depend on each other: separate
the surfaces, fix the shell plumbing, run the native-feel pass, then prove it
with accessibility, layout, and device checks before one PR.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **workflow-mobile-native-uiux** (this) | The end-to-end run: every step below, one branch, one PR |
| `enhance-mobile-native-feel` | The design pass alone (step 3), no verification sweep or PR |
| `mobile-rn-screen` | One React Native screen |
| `plan-mobile-readiness` | Store submission audit, plan-only; run it after this if a release is next |
| `plan-capacitor-hardening` | Native-layer security, plan-only |
| `design-mobile-first` | A new touch-first UI, not an existing app |

## How to reason

1. **Baseline** — stack, versions, before-screenshots, scorecard
2. **Order** — surfaces → plumbing → native feel; each later step assumes the earlier one
3. **Prove** — a11y, layout, and device probes with evidence, not "looks fine"
4. **Ship** — one PR carrying before/after, the scorecard, and the probe table

## Worked example

> Illustrative.
> **Baseline:** Capacitor 8.1, React + Ionic, PWA and both stores from one codebase;
> `targetSdkVersion 35`; JS tab bar; scorecard 3/10.
> **Order:** step 1 splits `useIsMobile` into form factor / platform / pointer; step 2
> moves to `targetSdkVersion 36`, `SystemBars`, deletes `StatusBar.setBackgroundColor`,
> adds the back listener; step 3 moves secondary flows to sheets and fixes haptic styles.
> **Prove:** 2.5.8 probe finds 11 icon buttons at 20 px; fixed on touched screens, 3 left
> on the untouched settings page go in the report. Tablet AVD landscape was a stretched
> phone; fixed. Back from a nested route exited the app; fixed.
> **Ship:** scorecard 3 → 9/10; PR notes a store build is needed (native config changed).

## Self-critique before reporting

- **Order kept** — no native-feel edits before the plumbing they depend on
- **Skips named** — every skipped step has its reason in the report
- **Fixes scoped** — a11y fixes stayed on the screens this pass touched; the rest are listed
- **Device evidence** — back, font scale, reduce motion, large screen each have a screenshot or output; iOS is `not run` when no Mac was available
- **Store build flagged** — the PR says whether any change needs a native build
- **Right owner** — store paperwork → `plan-mobile-readiness`; security → `plan-capacitor-hardening`

---

## Sequence  [LOW freedom — run exactly]

```
0. BASELINE      → versions, before-screenshots, scorecard (no skill)
1. SURFACES      → enhance-capacitor-ui        (only if one codebase also ships to the web)
2. PLUMBING      → mobile-capacitor-platform   (Capacitor only: § Native shell plumbing)
3. NATIVE FEEL   → enhance-mobile-native-feel  (chrome, IA, lists, motion, haptics, type)
4. ACCESSIBILITY → audit-accessibility         (WCAG 2.2 AA, incl. 2.5.8 / 2.4.11 / 2.5.7)
5. LAYOUT        → audit-responsive            (phone landscape, tablet, foldable)
6. DEVICE QA     → mobile-emulator-test        (walk + native-feel probes on Android 16)
7. PR            → workflow-pr                 (before/after, scorecard, probe table)
```

Skip step 1 when the app has no web surface, and step 2 for Expo / React Native
(their shell recipes live in `enhance-mobile-native-feel`). Name every skip in the
report. Work on one branch and commit after each step (`workflow-git-commit`
format), so step 7 starts from a committed branch.

The turn ends at the step-7 PR or at a real gate: a decision only the user can
make, a missing credential, a device that will not boot. A step summary is a
progress note, not a stopping point.

---

## Step 0: Baseline  [LOW freedom — run exactly]

```bash
grep -E '"(expo|react-native|@capacitor/core|@ionic/react|@ionic/angular)"' package.json
grep -nE 'targetSdkVersion|compileSdkVersion' android/variables.gradle android/app/build.gradle 2>/dev/null
git switch -c feat/native-uiux
```

Boot an Android 16 AVD (Expo / RN: `mobile-emulator-start`; Capacitor:
`npx cap run android`). Screenshot every top-level screen in light and dark, and
fill the `enhance-mobile-native-feel` scorecard. These are the "before" set.

## Step 1: Surfaces (read enhance-capacitor-ui)  [HIGH freedom]

> Read the `enhance-capacitor-ui` skill and follow it.

Done when no `useIsMobile` answers platform or pointer, chrome visibility is
CSS-gated, and the six-cell matrix was viewed.

## Step 2: Plumbing (read mobile-capacitor-platform)  [LOW freedom — run exactly]

> Read the `mobile-capacitor-platform` skill and follow its *Version discipline*
> and *Native shell plumbing* sections only.

Done when every plumbing row has its probe result and the dead-bar-config grep
returns zero hits.

## Step 3: Native feel (read enhance-mobile-native-feel)  [HIGH freedom]

> Read the `enhance-mobile-native-feel` skill and follow it.

Run the whole fix order. Done when the re-scored card and the reduced-motion,
target-size, and back gates pass.

## Step 4: Accessibility (read audit-accessibility)  [HIGH freedom]

> Read the `audit-accessibility` skill and follow it.

That skill reports first. Here, the request to fix the app's UI/UX approves fixing
Level A and AA findings on the screens steps 1–3 touched; list the rest in the
report with their SC. Capacitor: audit the web build at a 390×844 viewport.
Expo / RN with no web build: axe does not apply; check `accessibilityLabel`,
`accessibilityRole`, and hit areas in code, run the device probes in step 6, and
mark the axe rows `not run`.

## Step 5: Layout (read audit-responsive)  [HIGH freedom]

> Read the `audit-responsive` skill and follow it.

Include the native cells (`844 390` and `1024 768`). Done when no screen is a
stretched portrait phone in landscape or on a tablet.

## Step 6: Device QA (read mobile-emulator-test)  [LOW freedom — hand off]

> Read the `mobile-emulator-test` skill and follow it.

Run the walk plus its *Native-feel probes* (back, font scale 2.0, reduce motion,
large screen, gesture vs 3-button nav). iOS needs a Mac with a simulator;
otherwise report iOS as `not run`, never as passed.

## Step 7: PR (read workflow-pr)  [LOW freedom — hand off]

> Read the `workflow-pr` skill and follow it.

The PR description carries: before/after screenshots per top-level screen, the
scorecard before → after, the probe table from step 6, the skipped steps with
reasons, and whether a store build is needed (any change under `ios/`,
`android/`, `capacitor.config.*`, or `app.json` native keys needs one; JS, CSS,
and assets alone can ship over the air where the app uses OTA). Merge only if
the user asked.

---

## Report  [LOW freedom — run exactly]

```markdown
## Native UI/UX pass — <app> — <date>
**Stack:** <Capacitor n | Expo SDK n / RN n> · targetSdk <n> · **Score:** <before>/10 → <after>/10
| Step | Result | Evidence |
|---|---|---|
| 1 Surfaces | done / skipped (<reason>) | |
| 2 Plumbing | done / skipped (<reason>) | probe outputs |
| 3 Native feel | done | before/after paths |
| 4 Accessibility | n fixed · n listed | SC per finding |
| 5 Layout | done | landscape + tablet shots |
| 6 Device QA | Android ✓ · iOS ✓ / not run | probe table |
| 7 PR | <url> | store build: yes / no |
**Open:** <what still fails and why>
```
