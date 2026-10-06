---
name: enhance-mobile-native-feel
description: >
  Make an existing Expo/RN or Capacitor app feel native, not web: system tabs
  and sheets, edge-to-edge, haptics, spring motion, virtualized lists, type +
  icons, decluttered home. Use when "feels like a website", "not native", "add
  haptics", "immersive full screen", or "declutter the home screen".
license: MIT
---

# enhance-mobile-native-feel — App-Wide Native Feel for an Existing Mobile App

**Degree of freedom: MIXED.** Stack detection, the scorecard, and the verify gate
`[LOW freedom — run exactly]`. Which fixes to apply per screen `[HIGH freedom]`.

The app already ships. It compiles, it works, and it looks like a website wrapped in an
app shell: a header + footer drawn in JS, one long scrolling page per section, buttons
with no press response, five accent colors, 12px body text, no motion, no haptics.
This skill runs **one coherent pass** over the whole app so it reads as native on iOS 26
and Android 16, using the platform's own chrome wherever it exists.

The failure mode this prevents: fixing one screen's padding while the navigation
model, list rendering, and feedback language stay web-shaped.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **enhance-mobile-native-feel** (this) | App-wide pass on an existing mobile app: chrome, IA, lists, motion, haptics, type/icon/color |
| `mobile-rn-screen` | One React Native screen, pixel-level polish after this pass |
| `enhance-capacitor-ui` | Hybrid apps where the same code also ships a desktop web surface |
| `design-mobile-first` | A new touch-first UI from scratch |
| `mobile-rn-performance` | Jank, startup, bundle, memory when the UI is already native-shaped |
| `enhance-motion` | Web motion pass (Framer/Motion, CSS, GSAP) |
| `plan-mobile-readiness` | Store submission audit, plan-only |

## How to reason

1. **Observe** — stack and versions from the manifest; one screenshot per top-level screen
2. **Score** — ten native-feel checks, pass/fail with evidence (`references/native-feel-scorecard.md`)
3. **Fix in order** — chrome → IA → lists → motion → haptics → type/icon/color
4. **Verify** — emulator or device screenshots, reduced motion, targets, contrast, fling

## Worked example

> **Observe:** Expo SDK 54, Reanimated 4, Expo Router with a custom `View`-based tab
> bar; Capacitor absent. Home = one `ScrollView` with 14 cards; "Orders" = 600-row
> `FlatList`; buttons are `TouchableOpacity`; no `expo-haptics`; six accent colors.
> **Score:** 2/10 (safe areas and dark mode pass).
> **Fix:** `NativeTabs` with 4 destinations + Search; home cut to 4 cards and a sheet
> for the rest; Orders → FlashList v2 with `getItemType`; `Pressable` + `withSpring`
> scale 0.97; `Haptics.selectionAsync` on tab change, `notificationAsync(Success)` on
> order placed; two accent roles; body 16sp with Dynamic Type.
> **Verify:** 9/10 (Android nav-bar tint still pending); fling has no blank cells;
> reduced motion removes travel; every target ≥ 44pt.

## Self-critique before reporting

- **Chrome is native** — tab bar / sheets come from the platform where the SDK allows it; no JS tab bar on iOS 26
- **IA shrank** — the home screen answers one question; secondary flows moved to sheets
- **Lists virtualize** — nothing over ~300 rows is a `ScrollView` or `FlatList` with blank cells on fling
- **Feedback is consistent** — each haptic keeps its documented meaning; none on routine taps
- **Reduced motion honored** — spatial motion drops, opacity feedback stays
- **Right owner** — one screen's pixel polish → `mobile-rn-screen`; desktop surface regressions → `enhance-capacitor-ui`

---

## Check Existing First  [LOW freedom — run exactly]

Do not add a second navigation, sheet, list, or haptics library when one is installed.

```bash
# Stack + versions (the recipes in references/ are version-gated)
grep -E '"(expo|react-native|react-native-reanimated|@shopify/flash-list|@legendapp/list|@gorhom/bottom-sheet|expo-haptics|expo-symbols|react-native-safe-area-context|@capacitor/core|@capacitor/haptics)"' package.json
# Navigation model
rg -n "NativeTabs|unstable-native-tabs|createBottomTabNavigator|<Tabs" -g "*.{tsx,ts}" | head
# Chrome drawn in JS
rg -n "position: ?'absolute'.*bottom: ?0|tabBarStyle|headerShown" -g "*.{tsx,ts}" -c
# Feedback today
rg -n "TouchableOpacity|TouchableHighlight|Pressable|Haptics\.|impactAsync|selectionAsync" -g "*.{tsx,ts}" -c
# Long pages and lists
rg -n "<ScrollView|<FlatList|<FlashList|<LegendList|<SectionList" -g "*.{tsx,ts}" -c
# Capacitor edge-to-edge state
rg -n "viewport-fit=cover|safe-area-inset|SystemBars|StatusBar\.setBackgroundColor" -g "*.{html,css,ts,tsx}"
```

Record `STACK · NAV · LISTS · FEEDBACK · CHROME` in five lines before any edit.

## Phase 0 — Observe  [LOW freedom — run exactly]

- Boot the app on a tall handset (`mobile-emulator-start`); screenshot every top-level
  screen in light and dark mode. Keep the set as the "before".
- Count per screen: cards above the fold, taps to the primary action, rows in the
  longest list, distinct accent colors, body font size.
- Read `references/anti-patterns.md` and mark each smell present.

## Phase 1 — Scorecard  [LOW freedom — run exactly]

Fill `references/native-feel-scorecard.md` (10 checks) with pass/fail and the
screenshot or grep that proves it. The score is the baseline the report compares against.

## Phase 2 — Fix order  [HIGH freedom]

Work the whole app in this order; each step builds on the previous one. Pull the
exact API for the installed stack from `references/stack-recipes.md`.

1. **Chrome.** System tab bar (3–5 destinations; a Search tab when the app has search),
   native stack headers, sheets for secondary flows, edge-to-edge with safe-area insets.
   Delete JS-drawn bars and opaque status-bar hacks.
2. **IA.** Home answers one question; keep 3–5 cards above the fold; move the rest behind
   progressive disclosure (sheet, segmented control, or a secondary screen). Primary
   action lives in the thumb zone. One long page becomes sections, a sheet, or a list.
3. **Lists.** Anything beyond ~300 rows or with images virtualizes (FlashList v2 /
   LegendList / FlatList by the decision table). Mixed rows declare an item type.
   Pull-to-refresh and end-of-list loading are native components.
4. **Motion.** One spring vocabulary on the UI thread: spatial springs may overshoot,
   color/opacity springs never do. Press scale 0.96–0.98. Shared-element or zoom
   transitions only where the platform provides them. Reduced motion removes travel.
5. **Haptics.** `selection` for pickers and tab changes, `impact` for snaps and drops,
   `notification` for success/warning/error. Nothing on plain taps. Pair each haptic
   with the motion it accompanies and keep a user setting to turn them off.
6. **Type, icon, color.** One or two families, body ≥ 16sp, honors Dynamic Type /
   `fontScale`. Platform symbol set (SF Symbols on iOS, Material Symbols on Android),
   filled variants in bars. Two accent roles (primary, destructive) plus semantic status.
   Contrast ≥ 4.5:1 for body text in both modes.

Preserve all existing data flow and handlers. This pass is additive to behavior.

## Phase 3 — Verify  [LOW freedom — do not skip]

- Re-shoot every top-level screen (same device set, light + dark). Compare with "before".
- Fling the longest list: no blank cells, 60 fps in the profiler.
- Toggle reduced motion in system settings: travel disappears, feedback remains.
- Targets ≥ 44×44 pt (iOS) / 48×48 dp (Android), measured on the screenshot grid.
- Haptic on confirm fires once; none on scroll or plain tap (device check; emulators may not vibrate).
- Capacitor: content sits under the bars with correct insets on Android 16 and iOS 26.
- Run the repo's typecheck and tests. Re-score the card.

Report format:

```markdown
## Native-feel pass — report
**Stack:** [Expo SDK n / RN n / Reanimated n | Capacitor n] · **Score:** [before]/10 → [after]/10
**Chrome:** [NativeTabs | native stack | sheets] replaced [JS tab bar, header]
**IA:** home [14 → 4] cards; [n] flows moved to sheets; primary action in thumb zone
**Lists:** [screen] → [FlashList v2 | LegendList] · fling clean ✓
**Motion:** one spring set · reduced motion ✓ · **Haptics:** [events] · setting ✓
**Type/icon/color:** body [16sp] · [symbol set] · accents [6 → 2] · contrast ✓
**Verification:** before/after screenshots [paths] · typecheck ✓ · tests ✓
**Open:** [what is still failing on the card and why]
```

Finish the whole fix order before the report. A step that cannot be applied (SDK too
old, dependency missing) is listed under **Open** with the upgrade that unblocks it.

## Related

- `references/stack-recipes.md` — version-gated Expo/RN and Capacitor APIs for each step
- `references/native-feel-scorecard.md` — the ten checks and their sources
- `references/anti-patterns.md` — the web-shaped smells this pass removes
- `mobile-rn-screen` — per-screen polish after this pass
- `mobile-rn-performance` — if lists still drop frames after virtualization
- `enhance-capacitor-ui` — when a desktop web surface shares the code
- `mobile-emulator-test` — the QA loop used in Phase 3
