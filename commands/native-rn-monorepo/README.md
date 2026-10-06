# Native RN-monorepo commands (Cursor)

Slash-command bundle for an RN + Web monorepo where the developer
is on **Linux/Windows (no Mac)** and iOS verification happens on
**GitHub Actions** macOS runners with TestFlight as the install
target.

## What's here

| Command | Domain | What it does |
|---|---|---|
| `/android-build` | local | Build debug APK locally |
| `/android-install` | local | Install + launch on device/emulator |
| `/android-logcat` | local | Tail filtered Android logs |
| `/ios-ci-trigger` | CI | `gh workflow run …` for iOS |
| `/ios-ci-status` | CI | Check latest iOS CI run |
| `/ios-ci-logs` | CI | Diagnose failed iOS CI run |
| `/rn-verify` | local | Smoke test: TS + lint + Android compile + web typecheck |
| `/rn-reset` | local | Full local cache reset |
| `/rn-ship-ios` | combined | Verify → push → trigger iOS CI → watch |

## Install into a project

```bash
mkdir -p <project>/.cursor/commands
cp ~/skills/commands/native-rn-monorepo/*.md <project>/.cursor/commands/
```

(Skip this `README.md` — it's documentation, not a slash command.)

## Customisation required after install

1. Run `gh workflow list` in the project and replace `ios.yml` in
   `ios-ci-trigger.md`, `ios-ci-status.md`, `ios-ci-logs.md`, and
   `rn-ship-ios.md` with the actual iOS workflow filename.
2. If your monorepo uses nested paths (e.g. `apps/mobile/android/`),
   replace `android` with the correct path in `/android-build`,
   `/android-install`, `/android-logcat`, and `/rn-verify`.
3. Verify `gh` is authenticated (`gh auth status`) — every iOS
   command depends on it.
4. Confirm the iOS workflow accepts a `workflow_dispatch` trigger
   with the inputs you reference (most commonly `platform`,
   `track`, or `clear-cache`).

## The shipping loop

```
edit
  ↓
/rn-verify              (TS + lint + Android Kotlin compile)
  ↓
/android-build          (full debug APK + install on emulator)
  ↓
test on Android emulator
  ↓
/rn-ship-ios            (verify → push → CI → TestFlight)
  ↓
TestFlight installs build on iPhone (Apple processing ~5–30 min)
  ↓
/ios-ci-logs            (only if anything failed)
```

## Why these commands?

- **iOS macOS runners cost ~10× Linux runners.** The
  verify-locally-first gate in `/rn-ship-ios` exists to avoid
  shipping known-broken code to a 15-minute build.
- **Apple processing is asynchronous.** The status / logs commands
  are explicit that workflow `success` ≠ "TestFlight available."
- **Logcat without a filter is unusable.** `/android-logcat` scopes
  to the package PID and surfaces only the categories that matter
  for RN apps (`ReactNative*`, `AndroidRuntime`, `ANR`, `FATAL`).

## Companion rules

The matching `.mdc` rule bundle lives at
`~/skills/rules/native-rn-monorepo/`. Install both together
so the agent has both the *what* (rules) and the *how* (commands).
