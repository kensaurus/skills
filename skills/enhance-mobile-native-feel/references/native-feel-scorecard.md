# Native-feel scorecard — 10 checks

Score each check pass/fail with one piece of evidence (screenshot path or grep line).
Record the score before Phase 2 and again after Phase 3.

| # | Check | Pass when | Source rule |
|---|---|---|---|
| 1 | **System chrome** | Tab bar and stack headers come from the platform (NativeTabs / native stack / `ion-tab-bar` with safe-area padding); no `position: absolute` bar in JS on iOS 26+ | HIG Tab bars; Expo Native tabs |
| 2 | **Edge-to-edge** | Content extends under status and navigation bars; insets applied via safe-area API or `var(--safe-area-inset-*, env(...))`; no opaque status-bar hack | Android 15/16 enforcement; Capacitor 8 SystemBars; Expo SDK 54 |
| 3 | **Tab count and labels** | 3–5 destinations, one-word labels, filled symbols, bar visible in every section (modals excepted) | HIG Tab bars |
| 4 | **Home answers one question** | ≤ 5 cards above the fold; primary action in the thumb zone; secondary flows behind progressive disclosure | NN/g Progressive disclosure |
| 5 | **Sheets over pages** | Filters, pickers, "more" and confirmations open as sheets with snap points and a visible close; no full-page detours for a two-field task | HIG Sheets; Gorhom v5 |
| 6 | **Lists virtualize** | Every list over ~300 rows or with images uses FlashList v2 / LegendList / virtualizer; fling shows no blank cells; pull-to-refresh and end-of-list loading are native | FlashList v2; PkgPulse 2026 |
| 7 | **Press feedback and motion** | Every tappable element responds within one frame (scale 0.96–0.98 or ripple); one spring vocabulary on the UI thread; no hover-only states | M3 motion physics; Reanimated 4 |
| 8 | **Haptics with meaning** | Selection / impact / notification used by their documented meaning; none on plain taps; a settings switch exists | HIG Playing haptics |
| 9 | **Type and icons** | Body ≥ 16sp, honors Dynamic Type / `fontScale`; ≤ 2 families; one platform symbol set, filled in bars | HIG Typography; expo-symbols |
| 10 | **Color and contrast** | Two accent roles plus semantic status; body contrast ≥ 4.5:1 in light and dark; bars monochrome or one accent when content is colorful | HIG Color (Liquid Glass); WCAG 1.4.3 |

## Reduced-motion addendum (gate, not a point)

Toggle the system reduce-motion setting. Spatial travel must disappear; opacity and
state feedback stay. A fail here blocks the report regardless of score.

## Target-size addendum (gate, not a point)

Every control ≥ 44 × 44 pt on iOS (HIG default size; the HIG minimum is 28 pt) and
≥ 48 × 48 dp on Android, measured on the screenshot grid, including list-row chevrons
and close buttons on sheets. WCAG 2.5.8 (AA) sets 24 × 24 CSS px as the floor; this gate
is stricter on purpose.

## Back addendum (gate, not a point, Android)

`adb shell input keyevent KEYCODE_BACK` on a nested route, with a sheet open, and on the
root route: the route pops, the sheet closes, the app leaves. A back that exits from a
nested route, or does nothing, blocks the report.
