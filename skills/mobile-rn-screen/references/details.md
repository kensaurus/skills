
## Contents

- Step 7 — Enhancement Plan
- Step 8 — Implement (smallest possible diffs)
- Step 9 — Verify
- Hidden Failure Modes — RN-Specific (N1–N15)
- Pattern Library
- Motion Rules
- Quick Sanity Checks Before You Stop
- When Not To Use This Skill
- Companion Skills
- Research Anchors

## Step 7 — Enhancement Plan

A single, reviewable table ordered by impact / risk:

```
| Pri | File | Change | Heuristic | Risk |
|-----|------|--------|-----------|------|
| 1   | components/layout/ScreenContainer.tsx | Audit: confirm it handles all four safe-area edges | #1 | low |
| 2   | screens/home/HomeScreen.tsx | Remove duplicate streak display in footer | #8 | low |
| 3   | screens/home/HomeScreen.tsx | Add contentInset={{ bottom: tabBarHeight }} to FlatList | #1 | low |
| 4   | components/ui/Button.tsx | Add numberOfLines={1} to label; abbreviate if > 18 chars on compact | #4 | low |
| 5   | components/orchard/ToneCard.tsx | Bump bg tint /8 → /20, add ring-tone/30 | #1, #6 | low |
```

---

## Step 8 — Implement (smallest possible diffs)

Rules during implementation:

1. **Safe area first.** Audit the wrapper chain before any visual work. Getting
   the safe area right unlocks the rest of the layout.
2. **One concern per edit.** Layout change separate from colour change separate
   from animation change.
3. **No hex literals.** Use `theme.colors.*`, `withAlpha(theme.colors.X, n)`,
   or named constants from `@org/design-tokens`. The ESLint
   `no-restricted-syntax` rule should catch violations.
4. **Platform shadows in both props.** Every `View` that should cast a shadow
   needs both the iOS `shadow*` props AND `elevation` for Android:
   ```tsx
   style={{
     // iOS
     shadowColor: theme.colors.shadow,
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.12,
     shadowRadius: 8,
     // Android
     elevation: 4,
   }}
   ```
5. **`hitSlop` not visual inflation.** Touch targets ≥ 44×44pt achieved via
   `hitSlop`, negative-margin wrappers, or a pressable region sized for the
   thumb — never by making the visible element 44×44.
6. **`useNativeDriver: true` on every Animated call.** Unless the animation
   changes layout properties (width, height, padding — which are JS-only),
   always add `useNativeDriver: true`. This moves the animation to the UI
   thread and prevents jank.
7. **`numberOfLines` + `ellipsizeMode` on all single-line labels.** Prevents
   wrapping at compact screen widths.
8. **Match colour saturation to domain tier.** Tier A/B needs `/15–/25` tints
   with `/30–/40` rings to read as semantic categories at a squint. See
   `§1.5 Domain Colour Tier`.
9. **Collapse conditional slots when empty.** `{slot && <Wrapper>{slot}</Wrapper>}`.
   Never pay vertical real estate for absent content.
10. **Delete duplicate datums; replace with complementary data.** When the same
    number appears twice on one screen, keep the most actionable placement and
    replace the other with a sibling datum.
11. **`accessibilityLabel` and `accessibilityRole` on all interactive elements.**
    VoiceOver (iOS) and TalkBack (Android) need explicit labels for non-text
    Pressables. `role="button"` on custom Pressables.
12. **Respect `ReduceMotion` in every animation.**
    ```tsx
    const { reduceMotionEnabled } = useReduceMotion(); // or useAnimatedStyle
    const animValue = withTiming(to, {
      duration: reduceMotionEnabled ? 0 : 300,
    });
    ```

After every meaningful edit: run the repo's typecheck and lint scripts (e.g. `rn:typecheck` / `rn:lint` in a monorepo) on
modified files. Fix anything you introduced before moving on.

---

## Step 9 — Verify

### 9a. Three-device re-screenshot

Re-take the screenshots from Step 3a. Compare side-by-side with the originals.
Check: no wrapped labels, no clipped content, no overlapping elements,
safe area correct on notched device.

### 9b. Re-run the device forensics gates

| Gate | What to re-check | Pass criterion |
|------|-----------------|----------------|
| Measurement | `onLayout` widths of every repeated element you fixed | Spread ≤ 2dp per group |
| Conditional slot | Zero-state render of every slot you touched | No `minHeight` reservation for absent content |
| Dup-datum | Each screen | Every datum appears exactly once |
| Category squint | Standard-phone screenshot at 10–15px blur | Tier-A/B: distinct colour blobs. Tier-C/D: near-uniform achromatic |
| Large text | Enable Accessibility → max font size | No overflow, no clipped labels |
| Keyboard | Tap every input | Active field stays above keyboard |
| Safe area | Screenshot at top and bottom edges | No content under status bar or home indicator |

### 9c. iOS CI gate

For any change that affects a screen's layout, navigation, or safe-area
handling, trigger the repo's iOS CI workflow
and install via TestFlight. Do NOT claim "iOS verified" from the Android
emulator alone.

---

## Hidden Failure Modes — RN-Specific (N1–N15)

These are the "difficult-to-spot" patterns for React Native screens. When
feedback is vague-but-visceral ("button is too far down", "can't reach that",
"jank", "looks like a web page"), walk this list first.

### N1. Safe area inset violation

**Symptom:** Content hidden under the status bar, Dynamic Island, or home
indicator. Users can't tap the top CTA. Text is partially invisible.

**Detection:** Take a screenshot on a notched device (iPhone 14 Pro or
later, any Dynamic Island model) or an Android phone with a status bar.
Does the top of the content region start *below* the status bar? Does the
bottom CTA sit *above* the home indicator (iOS) or system navigation bar (Android)?

**Fix shape:** Wrap the screen root in `<SafeAreaView edges={['top','bottom']}>` or
consume `useSafeAreaInsets()` at the layout root. In repos with a
`ScreenContainer` primitive, verify it applies all four edges. Do NOT add
insets a second time inside the content — see N13.

---

### N2. Touch target below platform minimum

**Symptom:** Users mis-tap icon buttons, especially on smaller phones. Reported
as "hard to press" or silently as abandoned actions. Most common on close/dismiss
icons, navigation arrows, and inline quick-action buttons.

**Detection:** Add a temporary `onLayout` to the `Pressable` and log its
`width × height`. Apple HIG minimum: 44×44pt. M3 minimum: 48×48dp.
Visual icons are typically 20–28dp — they almost always need `hitSlop`.

**Fix shape:**
```tsx
// Wrong — visual chrome sized for the touch target
<Pressable style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: ... }}>
  <Icon size={20} />
</Pressable>

// Correct — icon is visually correct; touch area extended invisibly
<Pressable
  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
  style={{ width: 24, height: 24 }}
>
  <Icon size={20} />
</Pressable>
```

Or use a Pressable region sized for the thumb (44×44) with `alignItems/justifyContent: 'center'`
and a smaller visual indicator inside. The point is: **visual chrome ≠ touch target**.

---

### N3. Keyboard occlusion on input screens

**Symptom:** Tapping a text input on a form screen causes the keyboard to
slide up and cover the input. User must scroll manually or cannot see what
they're typing.

**Detection:** Open the screen, tap the first input, observe whether the
active field is above the keyboard.

**Fix shape:** Wrap the screen content in `KeyboardAvoidingView`:
```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <ScrollView keyboardShouldPersistTaps="handled">
    {/* inputs here */}
  </ScrollView>
</KeyboardAvoidingView>
```

For complex nested scrolls: `react-native-keyboard-controller` (preferred for New
Architecture) or `react-native-keyboard-aware-scroll-view`. Ensure the
`ScrollView` has `keyboardShouldPersistTaps="handled"` so tapping a button
above the keyboard doesn't dismiss it unexpectedly.

---

### N4. Tab bar obscuring bottom content

**Symptom:** The last row of a FlatList or the bottom section of a
ScrollView is permanently hidden behind the tab bar. Users can't reach
the last card.

**Detection:** Scroll to the very bottom of the list. If the last item
is only 50% visible, the scroll content is not accounting for the tab
bar height.

**Fix shape:**
```tsx
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

function ScreenWithList() {
  const tabBarHeight = useBottomTabBarHeight();
  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      contentInset={{ bottom: tabBarHeight }}           // iOS
      contentContainerStyle={{ paddingBottom: tabBarHeight }} // Android
      scrollIndicatorInsets={{ bottom: tabBarHeight }}
    />
  );
}
```

Or apply via `ScreenContainer`'s `scrollInset` prop if your repo abstracts
this. Fix once at the shared list primitive so all screens benefit.

---

### N5. Text truncation at large dynamic type sizes

**Symptom:** On iOS with Accessibility → Display & Text Size → Larger Text
enabled (or on Android with a very large system font size), row labels wrap
to 2 lines, containers clip content, and grid cards overflow their bounds.

**Detection:** Enable the largest system font size in Settings (iOS:
Accessibility → Larger Text → max slider; Android: Settings → Font size
→ largest). Reload the app. Screenshot every screen.

**Fix shape:**
- Never set a fixed height on a `View` that contains `Text` that users type
  or that comes from data (variable length).
- For labels that *must* stay on one line: `numberOfLines={1}` +
  `ellipsizeMode="tail"` + `adjustsFontSizeToFit={true}` (iOS) or cap
  with `maxFontSizeMultiplier` on the `Text`:
  ```tsx
  <Text numberOfLines={1} maxFontSizeMultiplier={1.5}>
    {label}
  </Text>
  ```
- For icons next to labels: use a `flexShrink: 1` on the text container so
  it yields space to a fixed-width icon, not the other way around.

---

### N6. Platform shadow inconsistency (iOS vs Android)

**Symptom:** Cards appear lifted on iOS but flat on Android (or vice versa),
making the visual hierarchy differ between platforms.

**Detection:** Compare iOS and Android screenshots of the same screen. If
card depth / elevation reads differently, the shadow props are incomplete.

**Fix shape:** Always apply both the iOS shadow set AND `elevation` for Android:
```tsx
const cardShadow = {
  // iOS
  shadowColor: theme.colors.shadow, // use the token, never '#000'
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.10,
  shadowRadius: 6,
  // Android
  elevation: 3,
};
```
Note: `elevation` on Android also creates a clipping region. If the card has
rounded corners, add `overflow: 'hidden'` to prevent the elevation shadow
from leaking past the rounded boundary on older Android versions.

---

### N7. Gesture conflict (horizontal swipe vs vertical scroll)

**Symptom:** Trying to swipe a row action (delete, archive) also triggers
vertical scrolling. Or: the React Navigation swipe-back gesture conflicts
with an in-screen horizontal PanGestureHandler.

**Detection:** Wrap a `PanGestureHandler` (or `SwipeableRow`) inside a
`ScrollView` and test: does swiping horizontally also scroll the list?
Does the iOS swipe-back gesture (from the left edge) conflict with
an in-screen swipe?

**Fix shape — list row swipe:**
```tsx
<PanGestureHandler
  activeOffsetX={[-10, 10]}   // must move 10dp horizontally before gesture activates
  failOffsetY={[-5, 5]}        // fail if user moves vertically first (yields to scroll)
>
  <Animated.View>...</Animated.View>
</PanGestureHandler>
```

**Fix shape — navigation swipe-back conflict:**
Use `gestureEnabled: false` on the screen that owns the conflicting gesture,
or use `simultaneousHandlers` to let both fire and filter in the gesture
handler's `onGestureEvent`.

---

### N8. Missing press feedback on Android

**Symptom:** Tapping a `Pressable` on Android produces no visual feedback.
The action fires but there's no ripple or press state. Users can't tell if
the tap registered.

**Detection:** Tap any tappable element on the Android emulator with the
touch indicator overlay on (Developer Options → Show tap locations). Does a
ripple or press state appear? If not, `android_ripple` is missing or `null`.

**Fix shape:**
```tsx
<Pressable
  android_ripple={{ color: withAlpha(theme.colors.primary, 0.12), borderless: false }}
  style={({ pressed }) => [
    styles.item,
    pressed && Platform.OS === 'ios' && { opacity: 0.7 }, // iOS press state
  ]}
>
  {children}
</Pressable>
```

If your repo has a `TouchablePrimitive`, add these defaults once there.

---

### N9. Back button / swipe-back leaves stale screen state

**Symptom:** Navigate to a screen, fill a form, tap Android hardware back.
Return to the same screen — the form is not reset. Or: a counter that should
reset on `focus` still shows the old value.

**Detection:** Navigate to the screen, mutate state, press back, re-navigate
to the screen. Does the screen show fresh data?

**Fix shape:**
```tsx
// Subscribe to focus events to reset or re-fetch
useFocusEffect(
  useCallback(() => {
    // reset form or refetch data
    return () => { /* cleanup on blur */ };
  }, [])
);
```

Note: `useEffect(() => {}, [])` runs only on mount — it does NOT re-run when
navigating back to the screen. Always use `useFocusEffect` for screen-scoped
side effects that should run on every visit.

---

### N10. JS-thread animation jank

**Symptom:** Animations stutter or drop frames, especially when they run
concurrently with a heavy JS operation (list render, API fetch, state update).
Visible as choppy transitions, spring animations that lag behind touch input.

**Detection:** Toggle the Perf Monitor in the developer menu (Shake → Perf
Monitor or `adb shell input keyevent 82`). Does the JS FPS drop to < 50fps
during the animation? If yes, the animation is running on the JS thread.

**Fix shape:**
1. Add `useNativeDriver: true` to all `Animated.spring` / `Animated.timing`
   calls that only animate `transform` and `opacity` (not layout props).
2. For layout animations, use `LayoutAnimation.configureNext()` (runs on UI
   thread for the next single layout pass).
3. For complex, gesture-driven animations: migrate to Reanimated 3
   worklets — these run entirely on the UI thread and are immune to JS jank.

```tsx
// Avoid
Animated.spring(anim, { toValue: 1, useNativeDriver: false }); // JS thread

// Prefer
Animated.spring(anim, { toValue: 1, useNativeDriver: true });  // UI thread

// Best for gesture-driven
const anim = useSharedValue(0);
const style = useAnimatedStyle(() => ({
  transform: [{ translateX: anim.value * 100 }],
}));
// anim.value = 100; (worklet, runs on UI thread)
```

---

### N11. FlatList / SectionList re-rendering every row on scroll

**Symptom:** Scrolling a list is janky. Profiling shows every row
re-rendering on each scroll event, not just the rows entering the viewport.

**Detection:** In React DevTools Profiler (or add `console.log('row rendered', item.id)`
inside the row component), scroll the list. If all rows log on every scroll,
renderItem is not memoized.

**Fix shape:**
```tsx
// Memoize the row component
const Row = React.memo(({ item }) => <View>...</View>);

// Memoize renderItem
const renderItem = useCallback(
  ({ item }) => <Row item={item} />,
  []  // stable reference; no deps unless renderItem logic depends on something
);

// Stable keyExtractor
const keyExtractor = useCallback((item) => item.id.toString(), []);

// For very long lists, consider FlashList (Shopify) instead of FlatList —
// it recycles cells and dramatically reduces re-render cost.
```

Also: avoid inline anonymous functions in `renderItem` and `keyExtractor` —
they create new references on every render and defeat memoization.

---

### N12. Skia / GPU component re-renders unnecessarily

**Symptom:** An animated or Skia-rendered component (background gradient,
canvas drawing, particle system) updates on every parent state change,
causing unnecessary GPU repaints and battery drain.

**Detection:** Wrap the Skia component in `React.memo` and add a
`console.log('skia re-render')` inside. Does it log on every keystroke in
an input above it? If yes, it's not properly isolated.

**Fix shape:**
- Wrap the component in `React.memo` with a custom comparator if the
  props are complex objects.
- Drive Skia parameters via Reanimated `SharedValue` — changes to a
  `SharedValue` do NOT cause React re-renders. Only the Skia canvas
  re-paints.
- Gate expensive GPU effects behind `PerformanceProvider` — only render
  them when the device is capable (check `useDeviceCapabilities()`).

```tsx
// Drive animation without causing React re-render
const progress = useSharedValue(0);
// progress.value = 0.8;  ← no re-render, just repaints the Skia canvas

const SkiaBackground = React.memo(() => (
  <Canvas style={StyleSheet.absoluteFill}>
    <AnimatedRect progress={progress} />
  </Canvas>
));
```

---

### N13. Double safe-area inset (the wrapper-chain trap)

**Symptom:** Unexpected large gap at the top of the screen. A custom header
sits too far below the status bar. `ScreenBackButton` appears in the wrong
position. Reported as "the back button is too low" or "why is there so much
empty space at the top?"

**Detection:** Walk the wrapper chain from the top-level navigator screen
option down to the child view. Count how many of these are in the chain:
`useSafeAreaInsets()`, `<SafeAreaView>`, `<SafeAreaProvider>`,
`useSafeAreaFrame()`, a `ScreenContainer` that applies `paddingTop: insets.top`.

If the count is ≥ 2 and they both affect the same edge, you have double-counting.

**Fix shape:** Pick ONE place to apply safe-area insets per edge — typically
the outermost `ScreenContainer` or layout wrapper. Children must not apply
their own insets unless they explicitly need to handle an edge the parent
does *not* cover.

Concretely: if `ScreenContainer` already pads `top: insets.top`, then
`ScreenBackButton` must use `top: 8` — NOT `top: 8 + insets.top`. Document
this in the `ScreenContainer` component header.

---

### N14. Deep link navigates to wrong stack depth

**Symptom:** Opening a deep link from cold start lands on the correct screen
but the back button does nothing (pops to blank), or navigates to an unrelated
screen. Swiping back from the deep-linked screen exits the app entirely.

**Detection:** Kill the app completely. Trigger the deep link via ADB:
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "yourscheme://screen/id123"
```
Press back. Where do you land?

**Fix shape:** Deep links must initialise the full navigation stack above
the target screen. In React Navigation's linking config, use `initialRouteNames`
or provide the `screens` nesting that mirrors the full stack shape:

```ts
// linking.ts
const linking = {
  screens: {
    HomeStack: {
      screens: {
        StudyScreen: {
          path: 'study/:lessonId',
          // Deep-linking here initialises HomeStack so back works correctly
        },
      },
    },
  },
};
```

Validate with a test — see `linking-coverage.test.ts` in repos that enforce this.

---

### N15. Tab-switch animation competing with screen entrance animation

**Symptom:** Switching tabs shows a flash of blank before the incoming screen
appears, or two animations run simultaneously producing a double-fade or
z-index conflict.

**Detection:** Rapidly switch between tabs. Does the incoming screen flash
white before its content appears? Does the transition look "doubled"?

**Fix shape:** React Navigation's native stack (`react-native-screens`) handles
the screen entrance animation at the OS level. Do NOT add a JS-side
`Animated.View` or Reanimated entrance animation to the screen's root View —
this creates two simultaneous animations on the same layer.

If a screen needs a content-reveal animation (e.g. staggered list items),
trigger it in `useFocusEffect`, not in a `useEffect([], [])` mount effect.
Mount effects run once and don't re-trigger when a tab is revisited.

---

## Pattern Library

### Safe Area Wrapper Chain (correct)

```
Navigator (headerShown: false)
└── ScreenContainer (applies insets.top + insets.bottom)
    ├── BlurHeader (top: 0 — ScreenContainer already padded)
    ├── ScrollView (contentInsetAdjustmentBehavior: 'automatic' on iOS)
    └── FloatingCTA (bottom: 16 — ScreenContainer already padded)
```

ScreenBackButton: `top: 8` flat. NOT `top: 8 + insets.top`.

### Correct Touch Target Shape

```tsx
// Visual: 24×24 icon
// Touch: 44×44pt via hitSlop
<Pressable
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  onPress={onPress}
  android_ripple={{ color: withAlpha(theme.colors.primary, 0.12) }}
>
  <Icon name="close" size={24} color={theme.colors.foreground} />
</Pressable>
```

### FlatList with Tab Bar Clearance

```tsx
const tabBarHeight = useBottomTabBarHeight();

<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  contentInset={{ bottom: tabBarHeight }}
  contentContainerStyle={{ paddingBottom: tabBarHeight }}
  scrollIndicatorInsets={{ bottom: tabBarHeight }}
  removeClippedSubviews   // Android performance
  maxToRenderPerBatch={10}
  initialNumToRender={12}
/>
```

### Platform-Correct Shadow

```ts
const shadow = StyleSheet.create({
  card: {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
});
```

### Reanimated 3 Reduced Motion

```tsx
import { useReducedMotion } from 'react-native-reanimated';

function AnimatedChip({ active }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{
      scale: withSpring(active ? 1.04 : 1, {
        duration: reduceMotion ? 0 : 300,
      }),
    }],
  }));

  return <Animated.View style={[styles.chip, style]} />;
}
```

---

## Motion Rules

- **Direct feedback** (tap confirmation, toggle): 100–180ms
- **Small state change** (counter increment, pill swap): 180–260ms
- **Screen entrance / large spatial transition**: 220–360ms (or defer to native stack)
- **Prefer `withSpring`** for anything the user drags (gesture-driven).
- **Prefer `withTiming` ease-out** for programmatic state changes.
- **Never animate layout props** (`width`, `height`, `padding`, `margin`) with
  `useNativeDriver: true` — they require the JS thread. Use `LayoutAnimation`
  or Reanimated `useAnimatedStyle` with `transform` equivalents instead.
- **Always check `useReducedMotion()`** (Reanimated) or
  `AccessibilityInfo.isReduceMotionEnabled()` and set `duration: 0` when true.
- Motion must answer at least one question:
  - Did my action work? (tap feedback)
  - What changed? (state transition)
  - Where did this come from / go? (spatial relationship)
  - What can I interact with? (affordance signal)

---

## Quick Sanity Checks Before You Stop

- [ ] Safe-area wrapper chain audited; insets applied exactly once per edge.
- [ ] Every `Pressable` / `TouchableOpacity` has a minimum 44×44pt touch area
      (via `hitSlop` or explicit size; NOT by inflating visual chrome).
- [ ] Every text input screen tested with keyboard open; active field visible.
- [ ] FlatList bottom content not clipped by tab bar (`contentInset` applied).
- [ ] Large-text (Accessibility max font size) tested; no overflow or clipping.
- [ ] Platform shadow applied in both iOS `shadow*` props AND Android `elevation`.
- [ ] Every `Animated.spring/timing` has `useNativeDriver: true` (or justified exception).
- [ ] Every `Pressable` on Android has `android_ripple` (or justified exception).
- [ ] `useFocusEffect` used for screen-scoped data fetching / form resets (not `useEffect([], [])`).
- [ ] `renderItem` memoized with `useCallback`; row component wrapped in `React.memo`.
- [ ] `useReducedMotion()` / `AccessibilityInfo.isReduceMotionEnabled()` respected.
- [ ] `accessibilityLabel` and `accessibilityRole` set on all non-text Pressables.
- [ ] Domain colour tier identified (A/B/C/D) and applied consistently.
- [ ] Primary content obvious at a hierarchy squint (first eye target).
- [ ] Tier-A/B: categories distinguishable at a category squint (colour alone).
- [ ] No datum (number, word, date, status) appears more than once on the same screen.
- [ ] Every conditional slot tested in zero-state; no dead `minHeight` floors.
- [ ] At least one piece of trailing/right-anchored metadata per stacked card row.
- [ ] Repeated-element `onLayout` measurements within 2dp of each other.
- [ ] Repeating bug patched at the shared primitive, not every consumer screen.
- [ ] The repo's typecheck and lint scripts (e.g. `rn:typecheck` / `rn:lint` in a monorepo) pass on all modified files.
- [ ] Android emulator screenshots taken at 360×800, 412×917, 430×932 (or platform equivalent).
- [ ] iOS CI triggered for any change affecting layout, safe area, or navigation.

### Hidden failure-mode audit (RN-specific)

- [ ] **N1 safe area**: content starts below status bar; home indicator not covered.
- [ ] **N2 touch target**: every `Pressable` ≥ 44×44pt via `hitSlop` or size.
- [ ] **N3 keyboard**: active input visible above keyboard on all input screens.
- [ ] **N4 tab bar**: FlatList last item scrollable above tab bar.
- [ ] **N5 large text**: no overflow or clipping at max system font size.
- [ ] **N6 shadow**: card depth consistent on iOS and Android.
- [ ] **N7 gesture conflict**: `activeOffsetX` / `failOffsetY` on swipeable rows inside scroll views.
- [ ] **N8 Android ripple**: every `Pressable` has `android_ripple` or documents why not.
- [ ] **N9 stale screen state**: `useFocusEffect` used (not `useEffect([])`); data resets on re-visit.
- [ ] **N10 JS-thread animation**: `useNativeDriver: true` on all `Animated` calls.
- [ ] **N11 FlatList re-renders**: `renderItem` and row component memoized; logged render count ≤ visible rows.
- [ ] **N12 Skia / GPU**: Skia components wrapped in `React.memo`; driven by `SharedValue`, not state.
- [ ] **N13 double safe-area inset**: wrapper chain has insets applied exactly once per edge.
- [ ] **N14 deep link stack depth**: back after cold-start deep link lands on correct parent screen.
- [ ] **N15 tab-switch animation**: no JS entrance animation on the screen root competing with native stack transition.

### Repo health

- [ ] Lint and typecheck pass for all touched files.
- [ ] Three-config screenshots show no clipping, no overlap, no wrapped labels.
- [ ] Write-up table maps each pain → heuristic → primitive → file → after behaviour.

---

## When Not To Use This Skill

- **Web / PWA surface (Next.js, browser)** → use `enhance-web-ui` + `enhance-web-ux`.
- **Hybrid web app (Capacitor, Ionic, RN-Web)** with web and native surfaces → use
  `enhance-capacitor-ui` first (separates the axis architecture), then this skill
  for the native-specific polish.
- **Pure UX audit (no code changes)** → use `audit-ux` or `audit-uiux-design-system`.
- **Brand-new screen from scratch** → use `design-frontend` for the web equivalent;
  there is no dedicated "native greenfield" skill — start from the repo's `HubScreen`
  / `ScreenContainer` primitive and the design tokens.
- **Single-line bug fix** (e.g. wrong colour on one element) → just fix it.
- **Performance profiling and optimisation** beyond the basics in N10–N12 →
  use Flipper / Android Studio Profiler / Xcode Instruments directly.

---

## Companion Skills

- [`mobile-emulator-start`](../../mobile-emulator-start/SKILL.md) — bring up the Android emulator
  dev loop cleanly; run this first before taking screenshots.
- [`mobile-emulator-test`](../../mobile-emulator-test/SKILL.md) — full QA walk on the emulator;
  use after this skill to verify the enhanced screen end-to-end.
- [`enhance-web-ui`](../../enhance-web-ui/SKILL.md) — web companion for the same
  composition and colour-tier principles. The H1–H16 hidden failure modes there
  catalogue *web-specific* bugs; many of the underlying principles (active-state
  mass, brand-color budget, monochromatic tier mismatch, information duplication,
  left-anchored stacks) apply to RN with adapted detection probes.
- [`enhance-web-ux`](../../enhance-web-ux/SKILL.md) — web companion for heuristic-
  driven task-flow improvements. The NN/g heuristic framework and content-rank
  methodology apply identically to RN screens.
- [`enhance-capacitor-ui`](../../enhance-capacitor-ui/SKILL.md) — prerequisite for
  hybrid apps (Capacitor / Ionic / RN-Web) that ship both a web PWA and a native
  shell from the same codebase. Establishes the three-axis architecture (form
  factor / platform / pointer) before per-surface polish.

---

## Research Anchors

- **Apple Human Interface Guidelines — Layout and Adaptivity**:
  44×44pt minimum touch target, safe-area handling, Dynamic Island insets,
  adaptive layout patterns for iPhone and iPad.
  <https://developer.apple.com/design/human-interface-guidelines/layout>
- **Apple Human Interface Guidelines — Accessibility**:
  `accessibilityLabel`, `accessibilityRole`, Dynamic Type, Reduce Motion,
  minimum legibility sizes.
  <https://developer.apple.com/design/human-interface-guidelines/accessibility>
- **Material Design 3 — NavigationBar spec**: active indicator is a 64×32
  `cornerFull` pill in `SecondaryContainer` colour wrapping the icon — never
  a full-cell fill. Reference for N-S13 active-state mass.
  <https://m3.material.io/components/navigation-bar/overview>
- **Material Design 3 — Touch Targets**: 48×48dp minimum for all interactive
  controls; use a 48×48dp `box` with padding to achieve target size without
  changing visual size.
  <https://m3.material.io/foundations/interaction/states/overview>
- **React Native — Reanimated 3 — useReducedMotion**:
  `useReducedMotion()` hook returns `true` when the user has enabled Reduce
  Motion; animations should set `duration: 0` or skip entirely.
  <https://docs.swmansion.com/react-native-reanimated/docs/device/useReducedMotion>
- **React Native — New Architecture (Fabric) — Layout**:
  `useSafeAreaInsets()` via `react-native-safe-area-context` is the correct
  way to consume safe-area data in Fabric; direct `SafeAreaView` can cause
  double-inset in nested navigators.
  <https://reactnative.dev/docs/the-new-architecture/landing-page>
- **React Navigation — Linking**:
  Deep-link config must mirror the full nested navigator shape so cold-start
  links initialise the correct parent stack.
  <https://reactnavigation.org/docs/deep-linking>
- **React Navigation — `useFocusEffect`**:
  Runs on every screen focus (not just mount). Use for data re-fetching,
  form resets, and analytics events that must fire on every visit.
  <https://reactnavigation.org/docs/use-focus-effect>
- **Shopify — FlashList**:
  `RecyclerListView`-based replacement for `FlatList` with significantly
  reduced re-render count and memory footprint for large lists.
  <https://shopify.github.io/flash-list/>
- **Shopify — react-native-skia**:
  Skia-based drawing surface that runs on both the JS thread and a dedicated
  GPU thread. Drive parameters via Reanimated `SharedValue` to avoid React
  re-renders. Reference for N12.
  <https://shopify.github.io/react-native-skia/>
- **NN/g — Visual Hierarchy in UX**:
  Contrast, scale, grouping, and whitespace guide focus; squint with 5–10 px
  blur to verify intended hierarchy. Platform-agnostic; applies to native
  screens exactly as to web pages.
  <https://www.nngroup.com/articles/visual-hierarchy-ux-definition/>
- **NN/g — Recognition over Recall (#6)**:
  Users should not need to remember information — category colour, icon
  shape, and position should signal meaning without reading labels.
  Primary reason for tier-A vibrant palettes on learning apps.
  <https://www.nngroup.com/articles/ten-usability-heuristics/>
- **Duolingo — Core Tabs Redesign + Gamification as Design Language**:
  Reference for tier-A vibrant semantic palettes (green=correct, red=hearts,
  orange=streak). Each colour carries system meaning; muted palettes undermine
  the gamification signal. Canonical tier-A reference for §1.5.
  <https://blog.duolingo.com/core-tabs-redesign/>
