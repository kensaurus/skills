---
name: mobile-capacitor-platform
description: >
  Capacitor work beyond UI: plugins, OTA, deep links, push, offline, native
  CI/CD, store submission, Cordova migration. Use for "add push
  notifications", "deep linking", "OTA update", or "App Store rejection".
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

> The native-runtime and shipping layer for Capacitor apps. `enhance-capacitor-ui` handles cross-surface *layout architecture*; this skill handles *platform features, native builds, store submission, and migrations*.
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
- **Right owner** — form-factor layout → `enhance-capacitor-ui`; listing ASO → `plan-aso`; native-security plan-only → `plan-capacitor-hardening`

## Version discipline (do this first)  [LOW freedom — run exactly]
- Read `package.json`: the Capacitor major (`@capacitor/core`) drives everything. Match plugin majors to it (Capacitor 8 → plugin v8).
- Check `capacitor.config.ts` for `appId`, `webDir`, `server.url` (live-reload vs bundled), and plugin config.
- Confirm the target platforms present (`ios/`, `android/`) before suggesting platform-specific steps.

## Pick the right area  [HIGH freedom]

| Task | Approach |
|:-----|:---------|
| Choose a plugin | Prefer official `@capacitor/*`; for gaps check Capgo's 80+ plugin catalog. Verify the plugin major matches your Capacitor major and has active maintenance. |
| **Deep / universal links** | iOS Associated Domains + `apple-app-site-association`; Android intent filters + `assetlinks.json`. Handle cold-start vs warm via `appUrlOpen` listener. Test both install states. |
| **Push notifications** | `@capacitor/push-notifications` → FCM (Android) + APNs (iOS). Register token, handle foreground vs background, deep-link from tap. Verify entitlements + `GoogleService-Info.plist` / `google-services.json`. |
| **Offline-first** | Cache + queue writes; reconcile on reconnect. Use a real DB plugin (SQLite / Fast SQL), not localStorage, for structured data. Define the conflict-resolution rule explicitly. |
| **Keyboard** | `@capacitor/keyboard` — resize mode, scroll-into-view on focus, accessory bar. The #1 source of "input hidden behind keyboard" bugs. |
| **Safe area / notch** | Use safe-area insets (env vars / plugin), not hardcoded padding. Account for notch, Dynamic Island, home indicator, Android gesture nav. (Pairs with `enhance-capacitor-ui`.) |
| **Splash screen** | Configure via plugin + native assets; hide programmatically after first paint to avoid white flash. |

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

## Composes with
- `enhance-capacitor-ui` — form-factor / platform / pointer layout architecture.
- `workflow-spec-tdd` — spec + TDD spine for the feature itself.
- `full-stack-ship-discipline` — backend deps deployed + verified.
- `enhance-web-*` — the underlying web UI the Capacitor shell renders.
