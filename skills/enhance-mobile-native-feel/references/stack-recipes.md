# Stack recipes — version-gated APIs for each fix step

Read the installed versions first (`package.json`). Every recipe names the version it
needs. When the app is below that version, list the upgrade under **Open** rather than
emulating the native component in JS.

## Contents

- Expo / React Native
- Capacitor (web stack shipped as iOS + Android)
- Sources


## Expo / React Native

### Chrome

| Need | API | Gate |
|---|---|---|
| System tab bar (Liquid Glass on iOS 26, Material on Android) | `import { NativeTabs } from 'expo-router/native-tabs'` | Expo SDK 58+. SDK 54–57: `expo-router/unstable-native-tabs` |
| Tab icon | `<NativeTabs.Trigger name="index"><Icon sf="house.fill" md="home" /><Label>Home</Label></NativeTabs.Trigger>` | SDK 55+ (`md` prop for Material Symbols) |
| Search tab | `<NativeTabs.Trigger name="search" role="search" />` | iOS 26 draws it at the trailing end |
| Scroll-to-top on tab re-tap | built into `NativeTabs`; delete custom scroll-to-top code | SDK 54+ |
| Native stack header + toolbar | `expo-router` `Stack` with `Stack.Toolbar` | SDK 55+ |
| Form sheet | `<Stack.Screen options={{ presentation: 'formSheet', sheetAllowedDetents: [0.5, 1] }} />` | SDK 54+; give the root view `flex: 1` |
| Edge-to-edge insets | `react-native-safe-area-context` `useSafeAreaInsets()`; `SafeAreaView` only at screen root | Android 16 enforces edge-to-edge; Expo SDK 53+ enables it by default |
| Status / nav bar style | `expo-status-bar` `<StatusBar style="auto" />`; `expo-navigation-bar` for Android button-nav devices | — |

Rule: do not draw a tab bar with `View` + `position: 'absolute'` on iOS 26. The system bar
floats, minimizes on scroll, and adopts Liquid Glass; a JS copy dates the app on day one.
Bars prefer symbols over text (WWDC25). If the content layer is colorful, keep the bar
monochrome or pick one accent with clear contrast (HIG: Tab bars).

### Sheets

| Need | API | Gate |
|---|---|---|
| Sheet with snap points and a scrollable list | `@gorhom/bottom-sheet` v5: `snapPoints={['40%','90%']}`, `BottomSheetFlatList`, `enableDynamicSizing`, `keyboardBehavior="interactive"` | Reanimated 3+ and `react-native-gesture-handler` 2+; wrap the app in `GestureHandlerRootView` and `BottomSheetModalProvider` |
| Simple open/close sheet in an Expo-managed app | `expo-bottom-sheet` (wraps Gorhom) | Expo SDK 54+ |
| Android keyboard inside a sheet | `android_keyboardInputMode="adjustResize"` via `expo-build-properties` | — |

Sheets replace: web modals, "More" pages, filter pages, and the bottom third of a long
form. Add a visible close control; screen-reader users cannot pan to dismiss.

### Lists

| Rows | Pick | Notes |
|---|---|---|
| < ~300, simple rows | `FlatList` | stable `keyExtractor`, memoized `renderItem`, `getItemLayout` for fixed heights |
| ≥ 300, or images, or blank cells on fling | `@shopify/flash-list` **v2** | New Architecture only; no `estimatedItemSize`; `getItemType` for mixed rows; drop `removeClippedSubviews` / `windowSize` props |
| Chat, media feed, product-critical scroll on a Fabric app | `@legendapp/list` | New Architecture only; `recycleItems`, `maintainScrollAtEnd`; reset item state from props on recycle |
| Still on the old architecture | FlashList **v1** | keep `estimatedItemSize`; plan the New Architecture upgrade |

Pull-to-refresh: `RefreshControl` (FlatList/FlashList `refreshing` + `onRefresh`).
End-of-list: `onEndReached` + `ListFooterComponent` spinner. Never a "Load more" button.

### Motion

| Need | API | Gate |
|---|---|---|
| Press feedback | `Pressable` + `useAnimatedStyle` + `withSpring(pressed ? 0.97 : 1, { damping: 18, stiffness: 220 })` | Reanimated 3+ |
| Spring vocabulary | two springs: **spatial** (position, size, radius; may overshoot) and **effects** (color, opacity; critically damped, no overshoot); three speeds fast/default/slow | Material 3 motion-physics system |
| CSS-style transitions | Reanimated 4 `transitionProperty` / `transitionDuration` on `Animated.View`; `@keyframes`-style `animationName` | Reanimated 4 (`react-native-worklets` is a peer dependency; import worklet helpers from it) |
| Gesture-driven motion | `react-native-gesture-handler` `Gesture.Pan()` + shared values; runs on the UI thread | RNGH 2+ |
| Zoom transition into detail | Expo Router `Link` zoom transition on iOS 26 | SDK 55+ |
| Reduced motion | `useReducedMotion()` from Reanimated, or `AccessibilityInfo.isReduceMotionEnabled()`; drop travel, keep opacity | — |

Anything that animates on every frame runs as a worklet on the UI thread. JS-thread
`Animated` for layout-heavy motion is the single biggest source of "feels like a web view".

### Haptics

`expo-haptics` (SDK 57: `~57.0.3`). Mapping follows the HIG meanings; keep each meaning
fixed across the app.

| Moment | Call | Android |
|---|---|---|
| Tab change, picker tick, segmented control | `Haptics.selectionAsync()` | `performAndroidHapticsAsync(AndroidHaptics.Segment_Tick)` |
| Snap into place, drag drop, sheet detent reached | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` or `.Medium` | `Drag_Start` / `Gesture_End` |
| Order placed, saved, paid | `Haptics.notificationAsync(NotificationFeedbackType.Success)` | `Confirm` |
| Validation failed, destructive confirm | `notificationAsync(Warning)` or `(Error)` | `Reject` |

iOS plays nothing in Low Power Mode, with the camera or dictation active, or when the
user disabled system haptics; design so nothing depends on the haptic. Expose a
"Haptics" switch in settings. For custom patterns use the Pulsar SDK (Software Mansion),
not `Vibration.vibrate`.

### Type, icons, color

- Icons: `expo-symbols` `<SymbolView name={{ ios: 'cart.fill', android: 'shopping_cart' }} />`;
  filled variants in bars; one symbol set per platform, never a third icon font.
- Type: body ≥ 16sp, `allowFontScaling` on (default), test at the largest accessibility
  size (`mobile-rn-screen` step 3.5e). One family for UI; a second only for display.
- Color: two accent roles plus semantic status tokens; `PlatformColor('label')` on iOS
  for dynamic label colors under Liquid Glass; check 4.5:1 in both modes.

## Capacitor (web stack shipped as iOS + Android)

### Edge-to-edge and system bars

Capacitor **8.3.2+** ships edge-to-edge on both platforms without a plugin.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

```css
/* Injected --safe-area-inset-* first (correct on Android WebView < 140), env() fallback */
.app-header { padding-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px)); }
.app-tabbar { padding-bottom: var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)); }
```

```ts
// capacitor.config.ts — leave insetsHandling at its "css" default
plugins: { SystemBars: { style: "DARK" } }   // DARK icons for a light app, LIGHT for dark
```

```ts
import { SystemBars, SystemBarsStyle, SystemBarType } from "@capacitor/core";
await SystemBars.setStyle({ bar: SystemBarType.StatusBar, style: SystemBarsStyle.Light });
```

- `StatusBar.setBackgroundColor()` and `overlaysWebView: false` are **no-ops on Android 16**.
  Color the bar area with an HTML element plus safe-area padding instead.
- Android three-button navigation bar color: `@capawesome/capacitor-navigation-bar` `setColor`.
- Immersive media screens on iOS: `@capawesome/capacitor-home-indicator` to hide the indicator.
- Tailwind: `tailwindcss-safe-area` (`pt-safe`, `pb-safe-or-8`, `h-dvh-safe`) uses `env()`
  only; hand-roll the `var()`/`env()` pair on critical elements if WebView < 140 matters.
- Capacitor 7 or older: upgrade first; the `@capawesome/capacitor-android-edge-to-edge-support`
  plugin is the fallback only for apps that must opt out of edge-to-edge.

### Chrome, sheets, lists, motion, haptics on the web stack

- Tab bar: Ionic `ion-tab-bar` or a bottom bar with `pb-safe`; 3–5 items; filled icons for
  the active tab; never a hover state as the only feedback.
- Sheets: `ion-modal` with `breakpoints` / `initialBreakpoint`, or a `<dialog>` with a
  spring transform; backdrop tap closes; visible close button.
- Lists: virtualize beyond ~300 rows (`@tanstack/virtual`, Ionic `ion-infinite-scroll`);
  images lazy and sized; `content-visibility: auto` for long static sections.
- Motion: `transform`/`opacity` only; `@media (prefers-reduced-motion: reduce)` zeros travel;
  `:active { transform: scale(0.97) }` for press feedback; `-webkit-tap-highlight-color`
  transparent plus the active state, so taps are not web-blue.
- Haptics: `@capacitor/haptics` `Haptics.impact({ style: ImpactStyle.Light })`,
  `Haptics.notification({ type: NotificationType.Success })`, `Haptics.selectionChanged()`;
  same meaning table as Expo above.
- Icons/type: Ionicons or Material Symbols (one set); body ≥ 16px to also stop iOS
  zoom-on-focus in inputs; `font-size` with `clamp()` for display text.

## Sources

- Expo docs: Native tabs (SDK gates), Haptics (SDK 57), Symbols; Expo blog, Jan 2026 (worklet-thread libraries)
- Software Mansion: Reanimated 3 → 4 migration (CSS animations, `react-native-worklets`)
- Shopify Engineering: FlashList v2 (New Architecture rewrite, no size estimates)
- Gorhom Bottom Sheet v5 docs; PkgPulse 2026 list and sheet comparisons
- Material Design 3: Motion physics system (spring tokens)
- Apple HIG: Tab bars (2026-06), Materials, Playing haptics; WWDC25 "Get to know the new design system"
- Capacitor docs: System Bars API (v8); Capawesome, May 2026: Edge-to-Edge & Safe Areas guide
