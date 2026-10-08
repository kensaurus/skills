---
name: mobile-capacitor-platform
description: >
  Capacitor native layer: system bars, keyboard, back, plugins, push, deep
  links, OTA, native CI. Use for "keyboard covers the input", "status bar
  overlaps", "add push", or "OTA update".
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

# Capacitor Platform & Pipeline

**Degree of freedom: MIXED.** Which area to tackle `[HIGH freedom]`; Capacitor
major matching, `cap sync`, secrets, and store preflight
`[LOW freedom — run exactly]`.

> The native-runtime and shipping layer for Capacitor apps. This skill owns the
> shell plumbing every other mobile skill points to: system bars and insets,
> keyboard, splash, Android back, haptics defaults.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **mobile-capacitor-platform** (this) | Native config and plugins: system bars, keyboard, splash, back, push, deep links, OTA, CI, migrations |
| `enhance-capacitor-ui` | One codebase on web + iOS + Android: form factor vs platform vs pointer |
| `enhance-mobile-native-feel` | App-wide native-feel pass: chrome, IA, lists, motion, haptic meaning |
| `plan-capacitor-hardening` | Native-layer security plan (plan-only) |
| `plan-mobile-readiness` | Store submission audit (plan-only) |
>
> Distilled from [cap-go/capgo-skills](https://github.com/cap-go/capgo-skills) (MIT). For deep per-task playbooks, install the full pack: `npx skills add Cap-go/capgo-skills` or `claude plugin marketplace add Cap-go/capgo-skills`.

## How to reason

1. **Version** — `@capacitor/core` major; plugin majors must match
2. **Choose** — plugin, deep link, push, offline, OTA, CI, or store
3. **Wire** — entitlements, config, and native files for that capability
4. **Prove** — both platforms or CI iOS; secrets never in the JS bundle

## Worked example

> **Version:** Capacitor 8 in `package.json`; `@capacitor/push-notifications` is still v5.
> **Choose:** push — FCM + APNs, not an OTA problem.
> **Wire:** bump plugin to v8, `npx cap sync`, APNs entitlement, `google-services.json`.
> **Prove:** emulator tap opens the deep-linked screen; no keystore in git.

## Self-critique before reporting

- **Majors match** — every plugin major equals the Capacitor major
- **Native config present** — entitlements / usage strings / plist-or-json for the capability
- **Secrets out of band** — CI/Keychain only; never committed or bundled
- **Plumbing proved** — each shell row touched has its probe result (screenshot or command output), iOS marked `not run` when no Mac was available
- **Right owner** — form-factor layout → `enhance-capacitor-ui`; native-feel design → `enhance-mobile-native-feel`; listing ASO → `plan-aso`; native-security plan-only → `plan-capacitor-hardening`

## Version discipline (do this first)  [LOW freedom — run exactly]
- Read `package.json`: the Capacitor major (`@capacitor/core`) drives everything. Match plugin majors to it (Capacitor 8 → plugin v8).
- Check `capacitor.config.ts` for `appId`, `webDir`, `server.url` (live-reload vs bundled), and plugin config.
- Confirm the target platforms present (`ios/`, `android/`) before suggesting platform-specific steps.

```bash
grep -E '"@capacitor/[a-z-]+"' package.json                       # every major equal?
grep -nE 'targetSdkVersion|compileSdkVersion|minSdkVersion' android/variables.gradle
grep -n "IPHONEOS_DEPLOYMENT_TARGET" ios/App/App.xcodeproj/project.pbxproj | head -2
```

Capacitor 8 floor (`capacitorjs.com/docs/updating/8-0`): Node 22+, Xcode 26+,
iOS 15 deployment target, `minSdkVersion 24`, `compileSdkVersion`/`targetSdkVersion 36`.
Google Play has required `targetSdkVersion 36` for new apps and updates since
2026-08-31; Apple has required the iOS 26 SDK (Xcode 26) for uploads since
2026-04-28. Stay on the latest 8.x: SystemBars inset fixes landed through 8.5.2.
Capacitor 7 or older → run `npx cap migrate` before any UI work below.

## Pick the right area  [HIGH freedom]

| Task | Approach |
|:-----|:---------|
| Choose a plugin | Prefer official `@capacitor/*`; for gaps check Capgo's 80+ plugin catalog. Verify the plugin major matches your Capacitor major and has active maintenance. |
| **Deep / universal links** | iOS Associated Domains + `apple-app-site-association`; Android intent filters + `assetlinks.json`. Handle cold-start vs warm via `appUrlOpen` listener. Test both install states. |
| **Push notifications** | `@capacitor/push-notifications` → FCM (Android) + APNs (iOS). Register token, handle foreground vs background, deep-link from tap. Verify entitlements + `GoogleService-Info.plist` / `google-services.json`. |
| **Offline-first** | Cache + queue writes; reconcile on reconnect. Use a real DB plugin (SQLite / Fast SQL), not localStorage, for structured data. Define the conflict-resolution rule explicitly. |
| **System bars, keyboard, splash, back, haptics** | See *Native shell plumbing* below — each has a probe and a done line. |

## Native shell plumbing  [LOW freedom — run exactly]

Each row: what to set, how to prove it on a device, what "done" means. Run the
probes on an Android 16 emulator (`mobile-emulator-test`) and an iOS 26+
simulator; on a host without macOS, report iOS as `not run`.

| Area | Set | Probe | Done |
|---|---|---|---|
| **Edge-to-edge** | `viewport-fit=cover` in the viewport meta; core `SystemBars` (`import { SystemBars, SystemBarsStyle } from '@capacitor/core'`), `plugins.SystemBars.insetsHandling` left at `'css'`; pad chrome with `var(--safe-area-inset-top, env(safe-area-inset-top, 0px))` (and bottom/left/right) | Screenshot a scrolled list on Android 16 (gesture nav and 3-button) and on a Dynamic Island iPhone | Content scrolls under both bars; header and tab bar clear the status bar, cutout and home indicator; no white or black band |
| **Bar style** | `SystemBars.setStyle({ style: SystemBarsStyle.Dark })` for a dark UI (light icons), `.Light` for a light UI; switch with the app theme. iOS needs `UIViewControllerBasedStatusBarAppearance = YES` in `Info.plist` | Toggle the app theme on both platforms | Bar icons stay legible in both themes |
| **Dead bar config** | Delete `StatusBar.setBackgroundColor`, `setOverlaysWebView`, and the `overlaysWebView` / `backgroundColor` config: they have no effect on Android 15+ with `targetSdkVersion 36`. `android.adjustMarginsForEdgeToEdge` was removed in Capacitor 8 | `rg -n -e "StatusBar\.setBackgroundColor" -e setOverlaysWebView -e overlaysWebView -e adjustMarginsForEdgeToEdge -g "!node_modules" -g "!android" -g "!ios" .` | Zero hits, and `plugins.StatusBar` in `capacitor.config.*` has no `backgroundColor`; bar color comes from an element painted under the bar |
| **Keyboard** | iOS: `plugins.Keyboard.resize` (`native` resizes the whole WebView and changes `vh`; `body` resizes `<body>` only; `ionic`; `none`). Android: the WebView resizes the visual viewport (WebView 139+); `resizeOnFullScreen: true` only for a full-screen app | Focus the lowest input on the longest form, on both platforms, with a hardware-keyboard-off emulator | Focused input and its submit button stay visible above the keyboard; nothing jumps when it closes |
| **Splash** | `launchAutoHide: false`, then `SplashScreen.hide()` after the first meaningful paint. Android 12+ ignores `backgroundColor`, `showSpinner`, `splashFullScreen`, `splashImmersive` at launch; use `launchFadeOutDuration` | Cold-start 3 times (`adb shell am force-stop <appId>` then launch) | No white flash between splash and first screen |
| **Android back** | `App.addListener('backButton', ({ canGoBack }) => canGoBack ? history.back() : App.minimizeApp())`; close an open sheet or dialog first. A listener replaces the default handling | `adb shell input keyevent KEYCODE_BACK` on a nested route, with a sheet open, and on the root route. Then, with gesture navigation on, swipe slowly from the left edge at the root (`adb shell input swipe 5 1200 600 1200 800`; read the screen size with `adb shell wm size`) | Nested → previous route; sheet → closes; root → app backgrounds. A key event never shows the back preview, only the gesture does: record whether the back-to-home preview appears. An app-registered back callback suppresses it on Android 16, so note it, do not guess |
| **Haptics defaults** | `@capacitor/haptics` `impact()` defaults to `ImpactStyle.Heavy`; always pass `style`. Only `Light` / `Medium` / `Heavy` exist (no Rigid/Soft) | `rg -n "Haptics\.impact\(\s*\)" src` | Zero hits; meanings follow `enhance-mobile-native-feel` |
| **Large screens** | Android 16 ignores orientation and resizability locks on displays ≥ 600dp for apps targeting 36; `@capacitor/screen-orientation` `lock()` has no effect there | Run the tablet or unfolded-foldable AVD in landscape | Layout reflows; nothing is a stretched portrait phone (`audit-responsive`) |

## Shipping pipeline  [LOW freedom — run exactly]

### Live / OTA updates (the Capacitor superpower)
- Push JS/HTML/CSS instantly without store review (Capgo or equivalent). **Native code changes still require a store build.**
- Gate updates by channel (production / beta), run compatibility checks, and keep a rollback path. Never OTA a bundle that assumes a newer native plugin than the installed binary.

### Native build CI/CD
- GitHub Actions / GitLab CI / Fastlane for signed iOS + Android artifacts. iOS signing needs certs + provisioning profiles in CI secrets (never commit `*.keystore`, `*.p12`, `local.properties`).
- Standard chain: `npm ci` → web build → `npx cap sync` → native build (xcodebuild / Gradle) → sign → upload (TestFlight / Play internal track).
- For Linux/Windows devs: iOS builds run on **macOS CI runners**, not locally — declare "ready for CI", never "iOS verified" locally.

### Store submission
- **Apple preflight before every submit:** privacy manifest (`PrivacyInfo.xcprivacy`), ATT prompt if tracking, permission usage strings, no private APIs, account-deletion path if there are accounts. Most rejections are preflightable.
- Play Store: target API level current, data-safety form, 16KB page-size alignment for native libs.

### Security
- Run a Capacitor security scan (Capsec: `npx @capgo/capgo-sec scan --ci`) — catches hardcoded secrets, insecure storage, network security, auth weaknesses. Wire into CI to fail on high/critical.

## Migrations
| From | To | Notes |
|:-----|:---|:------|
| Web app / PWA | Capacitor | `npx cap init` → add platforms → wire plugins for native bits → store-ready. |
| Cordova / PhoneGap | Capacitor | Map plugins to Capacitor equivalents; many Cordova plugins still work but prefer native Capacitor ones. |
| CocoaPods | Swift Package Manager | iOS dependency migration; check each plugin supports SPM. |
| SQLite plugin | Fast SQL | Performance migration for data-heavy apps. |

## Definition of done (Capacitor)  [LOW freedom — do not skip]
- [ ] Plugin majors match the Capacitor major; `npx cap sync` run after any native dep change.
- [ ] Feature tested on a real device or emulator for **both** iOS and Android (or CI for iOS).
- [ ] Permissions / entitlements / native config present for any native capability used.
- [ ] Secrets are in CI/Keychain, never in the repo or the JS bundle.
- [ ] If OTA: the bundle is compatible with the shipped native binary.
- [ ] Shell plumbing rows touched pass their probe; the dead-bar-config grep returns zero hits.

## Composes with
- `enhance-capacitor-ui` — form-factor / platform / pointer layout architecture.
- `enhance-mobile-native-feel` — the native-feel design pass that uses this plumbing.
- `mobile-emulator-test` — the Android device loop the probes run in.
- `workflow-spec-tdd` — spec + TDD spine for the feature itself.
- `full-stack-ship-discipline` — backend deps deployed + verified.
- `enhance-web-*` — the underlying web UI the Capacitor shell renders.
