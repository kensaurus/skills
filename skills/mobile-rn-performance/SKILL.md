---
name: mobile-rn-performance
description: >
  Fix React Native / Expo performance, build, and upgrade issues: jank, slow
  startup, large bundles, memory leaks, Hermes, FlashList, Reanimated, Turbo
  Modules, 16KB alignment, SDK upgrades.
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

# React Native Performance & Build

**Degree of freedom: MIXED.** Which category and fix `[HIGH freedom]`; measure
before/after, 16KB alignment, and upgrade-helper diffs
`[LOW freedom — run exactly]`.

> The performance, bundling, and upgrade layer for React Native / Expo. `mobile-rn-screen` handles screen layout and native feel; this skill handles *speed, size, and version moves*.
>
> Distilled from [Callstack's React Native best-practices skill](https://github.com/callstackincubator/agent-skills) (MIT) and the Ultimate Guide to RN Optimization.

## How to reason

1. **Measure** — RN perf monitor / profiler numbers first
2. **Category** — FPS, bundle, TTI, native, memory, or animation
3. **Fix** — the profiled hotspot only
4. **Re-measure** — before/after on a real low-end device

## Worked example

> **Measure:** feed scroll drops to 38fps; React profiler shows every row re-rendering.
> **Category:** FPS & re-renders — not "add memo everywhere".
> **Fix:** `FlashList` + stable `keyExtractor`; animation stays on Reanimated shared values.
> **Re-measure:** 56fps on a low-end Android; no new storm on the changed screen.

## Self-critique before reporting

- **Not vibes** — a number existed before the patch
- **Hotspot only** — no unprofiled memo/lazy spray
- **Both platforms** — Android measured; iOS-affecting native changes verified on macOS CI
- **Right owner** — layout / safe-area / touch feel → `mobile-rn-screen`; on-device walk → `mobile-emulator-test`; hybrid axes → `enhance-capacitor-ui`

## Diagnose first, then fix  [HIGH freedom]
Never optimize blind. Identify the symptom, then apply the matching category. Measure before/after.

| Symptom | Category | Impact |
|:--------|:---------|:-------|
| Janky scroll/animation, dropped frames | FPS & re-renders | CRITICAL |
| Large download / install size | Bundle size | CRITICAL |
| Slow cold start (high TTI) | TTI / startup | HIGH |
| Slow native operations | Native performance | HIGH |
| Memory grows over time / crashes | Memory management | MED-HIGH |
| Choppy gestures/transitions | Animations | MEDIUM |

## 1. FPS & re-renders (CRITICAL)
- Profile with React DevTools + the RN perf monitor before changing code. Find the component re-rendering, don't guess.
- Memoize hot paths: `React.memo`, `useMemo`, `useCallback` — but only where a profile shows wasted renders (over-memoization adds its own cost).
- Stable references: don't create new objects/arrays/functions inline in props of list rows or memoized children.
- **Lists:** under ~300 simple rows `FlatList` is fine (stable `keyExtractor`, memoized `renderItem`, `getItemLayout` for fixed heights). Beyond that, or with images or blank cells on fling, use `@shopify/flash-list` **v2**: New Architecture only, no `estimatedItemSize`, `getItemType` for mixed rows, and drop `removeClippedSubviews`/`windowSize`. On the old architecture stay on FlashList v1 with `estimatedItemSize`. `@legendapp/list` is the Fabric-only option for chat and media feeds (`recycleItems`, `maintainScrollAtEnd`). A FlatList re-render storm is the #1 RN list perf bug.
- Move continuous values (scroll, gesture, animation) off React state — see Animations.

## 2. Bundle & app size (CRITICAL)
- Enable Hermes (default on modern RN) — smaller, faster startup.
- Audit the bundle: tree-shake, avoid pulling whole libraries for one function, lazy-load heavy screens.
- Ship per-architecture / split APKs; drop unused locales and assets.
- **Android 16KB page-size alignment** — required for Google Play; verify all third-party native libs are aligned or builds get rejected.

## 3. TTI / startup (HIGH)
- Defer non-critical work past first paint (analytics, feature flags, heavy init).
- Lazy-init native modules; don't block the JS thread on startup.
- Measure TTI on a real low-end device, not a flagship or simulator.

## 4. Native performance (HIGH)
- Prefer native (Turbo Modules / JSI) over JS polyfills for hot, frequent operations.
- Minimize bridge traffic: batch calls, avoid chatty per-frame round-trips.
- Profile with Xcode Instruments / Android Studio profiler for native hotspots.

## 5. Memory (MED-HIGH)
- Clean up listeners, timers, and subscriptions in effect cleanup. Leaked listeners are the common JS leak.
- Watch image caches and large in-memory data; page or virtualize.
- Profile native leaks with platform tools when JS looks clean.

## 6. Animations (MEDIUM)
- Use `react-native-reanimated` on the **UI thread** (`useSharedValue` / `useAnimatedStyle` / worklets). Never drive continuous animation through `setState` — it re-renders the tree every frame and collapses FPS.
- Reanimated 4 moves worklets to `react-native-worklets` (peer dependency; import `runOnUI`/`runOnJS` from it) and adds CSS-style `transitionProperty` / `animationName` on `Animated.View`; shared-value code from 3.x keeps working. Gesture-linked motion stays in `react-native-gesture-handler` worklets.
- Use the native driver for `Animated` when staying on the core API.

## React Native / Expo upgrades  [LOW freedom — run exactly]
- Use the official **RN Upgrade Helper** diff for the exact version jump; apply native-side changes (`android/`, `ios/`, Podfile, Gradle) deliberately — these are where upgrades break.
- Bump Expo SDK via `expo install --fix`; align all `expo-*` and third-party native deps to the SDK's supported ranges.
- After upgrade: clean caches (`watchman watch-del`, Metro cache, Pods, Gradle), rebuild, and smoke-test on both platforms via `mobile-emulator-test`.
- For Linux/Windows devs: iOS-affecting upgrade changes verify on **macOS CI**, not locally.

## Definition of done (RN perf)  [LOW freedom — do not skip]
- [ ] Measured before/after on a real device (numbers, not vibes).
- [ ] The fix targets the profiled hotspot, not a guess.
- [ ] No new re-render storms introduced (re-profile the changed screen).
- [ ] Android 16KB alignment holds if native libs changed.
- [ ] Both platforms still build and run.

## Composes with
- `enhance-mobile-native-feel` — app-wide chrome, lists, motion, haptics when the UI itself is web-shaped.
- `mobile-rn-screen` — layout, safe-area, touch-target, native feel.
- `mobile-emulator-start` / `mobile-emulator-test` — boot + on-device verification.
- `workflow-spec-tdd` — spec + test the perf fix so it doesn't regress.
- `enhance-capacitor-ui` — if the app is hybrid rather than bare RN, the axis architecture differs.
