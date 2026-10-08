---
name: mobile-emulator-test
description: >
  QA a native Android or Expo dev-client build on the emulator: UI, Supabase,
  Sentry per CRUD step. Use for "test on emulator", "QA Android build", "white
  screen", or "adb reverse".
license: MIT
---

# mobile-emulator-test — Native build QA on Android emulator + MCP loop

**Degree of freedom: MIXED.** Walk judgment and findings `[HIGH freedom]`;
bring-up, Phase 1.5 freshness, and three-layer CRUD
`[LOW freedom — run exactly]`.

End-to-end verification of any native mobile build through a real Android
emulator session, with backend truth (Supabase MCP) and crash telemetry
(Sentry MCP) wired into the same loop. Catches the failure modes that pure
unit tests and CI bundle builds miss: white screens, prototype-stripped
cache rehydration, missing migrations, sync-disabled empty states, infinite
refetch loops, and silent error swallows.

## How to reason

1. **Discover** — stack, tabs, MCP, signed-in test account
2. **Freshness** — source + Metro bundle + device (Phase 1.5)
3. **Walk** — guest AND signed-in; every tab
4. **Three-layer** — UI success + DB row + cold refetch; evidence per finding

## Worked example

> **Discover:** Expo router; five tabs; Supabase MCP live; Sentry MCP missing (mark BLOCKED).
> **Freshness:** user said "nothing changed"; bundle `grep` of the patch string = 0 → `--clear` Metro, then reload.
> **Walk:** guest create fails closed; signed-in create shows toast.
> **Three-layer:** toast yes, `execute_sql` finds the row, kill/reopen still shows it. Finding: guest path only.

## Self-critique before reporting

- **Fresh build** — source, bundle, and screencap all show the patched string
- **Both identities** — guest and signed-in walks ran; empty-state is not the only path
- **Three layers** — no mutation called "tested" on UI toast alone
- **Right owner** — bring-up only → `mobile-emulator-start`; store/plugins/OTA → `mobile-capacitor-platform`

## Rules

> **Test as a real signed-in user AND as a brand-new guest.**
> Walk the app the way a paying customer would — sign in, browse every tab,
> add a real entry, edit it, delete it — AND the way a new user would —
> open the app fresh, hit the guest path, drive a CRUD round-trip without
> any account. Both paths exercise different code (sync replica vs cloud
> direct vs local-only adapter) and both regress independently. While
> walking, watch logcat, Sentry, and the DB at the same time.

> **Always verify the build under test is the latest source.**
> A "nothing changed" report is almost always a stale build: Metro served
> a cached bundle, the dev launcher cached a JS-bundle URL, or the
> emulator is running a previously-installed APK while the new one sits
> in `android/app/build/outputs/`. Phase 1.5 is non-negotiable.

> **Every mutation gets verified at three layers.**
> A create/edit/delete is not "tested" until: (1) the app shows success,
> (2) the row exists/changes/disappears in the DB via Supabase MCP, and
> (3) re-opening the screen reflects the same state from a cold fetch.

> **Evidence for every finding.**
> Each bug needs: `screencap` PNG, last 30 lines of `logcat ReactNativeJS`,
> the failing Sentry issue ID (if captured), and the exact reproduction taps.

> **Don't trust a "white screen".**
> A blank surface is almost always one of three things: Metro died, the
> bundle threw inside the React tree (caught by ErrorBoundary into Sentry),
> or the persisted cache hydrated a class instance as a plain object.
> Diagnose, don't restart blindly.

> **Score native feel while you walk.**
> System tab bar, insets, press response, fling, plus the back / font-scale /
> reduce-motion / large-screen adb probes in
> [references/details.md § Native-feel probes](references/details.md#native-feel-probes).
> Fails route to `enhance-mobile-native-feel`; haptics are a device check.

> **Clean up server state.**
> Anything you POST during the walk gets deleted before you finish, via the
> same Supabase MCP that verified it.

---

## Phase 0: Codebase + Environment Discovery  [HIGH freedom]

Before launching anything, understand the build.

### 0a. Detect the native stack

| Signal | Stack |
|---|---|
| `apps/*/app.json` or `apps/*/app.config.{js,ts}` + `expo` in deps | **Expo / React Native** |
| `react-native` in deps but no `expo` | **bare React Native** |
| `capacitor.config.{ts,json}` + a `web/` or `dist/` build | **Capacitor** |
| `pubspec.yaml` with `flutter:` block | **Flutter** |
| `src-tauri/` with `tauri.conf.json` | **Tauri mobile** |
| `android/app/src/main/AndroidManifest.xml` only | **native Android** |

Read the dependency manifest (`package.json`, `pubspec.yaml`, etc.) to extract:
- bundler / dev server (Metro, Vite, Capacitor Live Reload, Flutter daemon)
- bundler port (Metro defaults to 8081; check `scripts.start` / `expo start --port`)
- backend client (Supabase, Firebase, Amplify, custom REST)
- error tracker (Sentry, Bugsnag, Crashlytics) — needed for Phase 5
- offline/sync layer (PowerSync, Watermelon, Realm) — needed for Phase 4 fallback
- query cache (TanStack Query, RTK Query, SWR) — needed for Phase 6 cache audit

### 0b. Inventory routes / tabs / mutation surfaces

| Stack | Where routes live |
|---|---|
| Expo Router | `app/**/*.{tsx,ts}` (file-based) |
| React Navigation | grep `createNativeStackNavigator`, `Tab.Screen`, `Stack.Screen` |
| Capacitor + React Router | `src/App.tsx` route table |
| Flutter | `lib/**/router.dart`, `MaterialApp.routes` |

For each route record: path, dynamic params, auth guard, primary CRUD entity.
Also list the **bottom tabs** explicitly — they are the spine of the walk.

### 0c. Discover backend + telemetry config

```bash
# Supabase project ref
grep -r "EXPO_PUBLIC_SUPABASE_URL\|SUPABASE_URL" .env .env.local apps/*/app.config.* 2>/dev/null
# Sentry DSN + project slug
grep -r "EXPO_PUBLIC_SENTRY_DSN\|SENTRY_DSN" .env .env.local 2>/dev/null
# PowerSync (or other sync) URL
grep -r "POWERSYNC_URL\|FIREBASE_DATABASE_URL" .env .env.local 2>/dev/null
```

Also list available MCP servers:
- **supabase** → `list_tables`, `execute_sql`, `apply_migration`, `query_logs`, `get_advisors`
- **sentry** → `find_organizations`, `search_issues`, `get_sentry_resource`, `update_issue`

If either MCP is missing, mark that verification path BLOCKED but keep walking.

### 0d. Test account

Find or ask for a **real signed-in user** with a non-trivial dataset. The
empty-state path is its own test (Phase 7), but the main walk MUST exercise
populated screens — that is where the cache-corruption, FX-conversion, and
sync-empty-state bugs live.

---

## Phase 0.5: Tall-handset AVD + skin/display truth (any Android app)  [LOW freedom — run exactly]

Use this whenever layout QA benefits from extra vertical runway (multi-section
homes, drawers, FAB stacks) or whenever the emulator exits immediately / shows
the wrong logical resolution after editing `hw.lcd.*`.

### 0.5a. Target profile (recommended debug geometry)

Goal: **`Physical size: 1080x4000`** (or `4000x1080` in landscape — verify with
`adb shell wm size` after boot).

Typical knobs live in **`%USERPROFILE%\.android\avd\<Something>.avd\config.ini`**
(or `~/Library/Android/avd/` on macOS). Set at least:

- `hw.lcd.width=1080`
- `hw.lcd.height=4000`
- `hw.lcd.density=<match your production class, often 420–480>`
- `showDeviceFrame=no` *(optional but keeps focus on pixels, not chrome)*

**Authoritative display check** (never trust the window chrome alone):

```bash
adb shell wm size
adb shell wm density
```

### 0.5b. The `_no_skin` / invalid-skin trap (recent emulator builds)

Older templates or blog posts recommend `skin.name=_no_skin` and
`skin.path=_no_skin` to silence device frames on custom resolutions. Current
Studio / emulator builds often terminate with **`unknown skin name '_no_skin'`**
and **`exit_code: 1`** — so the emulator never joins `adb devices`, and helper
scripts that wait for reverse / intent time out.

**Rule:** Pick a skin path that resolves to an **existing** SDK skin directory,
or ship a **minimal custom skin** next to the AVD.

### 0.5c. Minimal custom skin folder (generic pattern for any app)

Problem: pointing `skin.path` at a stock skin like `WXGA720` can force the guest
framebuffer to **`720×1280`** even when `config.ini` declares `hw.lcd.*`;
`adb shell wm size` will disagree with what you configured.

Mitigation:

1. Create e.g.
 **`%USERPROFILE%\.android\avd\<YourAvdFolder>\emulator_skin_1080x4000/`**
 (name is arbitrary; keep it alphanumeric + underscores).
2. Copy **all PNG + `hardware.ini`** from any stock SDK skin (for example
 `platforms/android-*/skins/WXGA720/`) so background assets exist — the emulator
 parser expects referenced files.
3. Replace **`layout`** in that folder with a definition whose `device.display`
 block matches **1080×4000** and whose **portrait** canvas includes small
 margins (≈ 27 px gutters mirror stock skins):

```txt
parts {
 portrait {
 background { image background_port.png }
 }
 landscape {
 background { image background_land.png }
 }

 device {
 display {
 width 1080
 height 4000
 x 0
 y 0
 }
 }
}

layouts {
 portrait {
 width 1134 # 1080 + 27*2 gutters
 height 4054 # 4000 + 27*2 gutters
 color 0xe0e0e0
 event EV_SW:0:1
 part1 { name portrait; x 0; y 0 }
 part2 { name landscape; x 4000; y 0 } # parked off-screen; adjust if emulator complains
 part3 { name device; x 27; y 27 }
 }

 landscape {
 width 4055 # swapped-ish canvas — tune if rotating AVD heavily
 height 1175
 color 0xe0e0e0
 event EV_SW:0:0
 dpad-rotation 3
 part1 { name portrait; x 4000; y 0 }
 part2 { name landscape; x 0; y 0 }
 part3 {
 name device
 x 26
 y 26
 rotation 3
 }
 }
}

keyboard { charmap qwerty2 }
network { speed full; delay none }
```

4. Update **`config.ini`**:

```
skin.dynamic=no
skin.name=emulator_skin_1080x4000
skin.path=C:\\Users\\<you>\\.android\\avd\\<YourAvdFolder>\\emulator_skin_1080x4000
```

Reboot the AVD after edits. Expect first boot warnings about **unable to resume
snapshot** after geometry/skin changes (`default_boot`) — cold boot once is OK.

### 0.5d. adb / emulator ergonomics reminders

| Issue | Typical fix |
|------|-------------|
| Stuck transports / duplicate `adb.exe` orphans on Windows | `taskkill /IM adb.exe /F /T` then `adb start-server` (prefer one supervised helper than many shells) |
| Need to recycle guest without wiping data | `adb emu kill`, relaunch same AVD |
| Ensure bundler reachable from emulator | `adb reverse tcp:<metroPort> tcp:<metroPort>` *per device attachment* |

These apply equally to RN, Flutter, Compose, Kotlin XML, Cordova/Ionic shells,
and Expo dev-client builds — only the URLs / ports change.

---

## Phase 1: Bring the loop online  [LOW freedom — run exactly]

### 1a. Verify the emulator + adb

```bash
adb devices
# Expect: emulator-5554 device (transport_id ...)
```

If no device appears **within the script’s polling window**:

- Boot/repair the AVD (Phase 0.5 if emulator exits instantly or wrong `wm size`).
- Re-run **`adb reverse tcp:<port> tcp:<port>` after the serial shows `device`** — reverse mappings do not magically backfill when a late emulator attaches.

If an automation script enumerated devices **once at startup**, it may skip
reverse + deeplink when the emulator was offline. Prefer **polling** or a
manual second step: reverse + intent once `adb devices` is non-empty.

### 1b. Confirm the bundler is alive *(and reachable from the emulator)*

```bash
METRO_PORT=8081
curl -sf "http://localhost:${METRO_PORT}/status"
# PASS: contains "packager-status:running" (Metro/Expo) or HTTP 200 with running flag
```

**Other stacks:**

- Capacitor / Vite: usually `5173` / dev server ping you choose (`curl /`).
- Flutter: tool-specific (often aggregator on `localhost`).

If dead, boot the bundler in the background, then **poll aggressively** (`2–5s`
backoff up to **`~180s` on cold cache wipes**):

```bash
while ! curl -sf "http://127.0.0.1:${METRO_PORT}/status" | grep -q running; do sleep 4; done
```

Only after **`/status`** is green should you fire a dev-client deeplink /
reload — launching first produces logcat variants of **Cannot connect** /
**ECONNREFUSED** to **`127.0.0.1:<port>`** even when Metro comes up seconds later.

When the emulator is attached:

```bash
adb reverse tcp:${METRO_PORT} tcp:${METRO_PORT}
```

Re-run whenever `adb reconnect` / `adb kill-server` / new emulator session clears
the tunnel.

### 1c. Launch the app *(scheme-agnostic placeholders)*

| Stack | Intent pattern |
|---|---|
| Expo dev client | Replace `<SCHEME>` with `app.json`/`app.config.*` **`scheme`** (often **without** literal `exp+` unless using classic Expo Go tokens — follow the repo’s deeplink snippet). Typical shape: `"<SCHEME>://expo-development-client/?url=http%3A%2F%2Flocalhost%3A<PORT>"` |
| Bare RN Android | `adb shell am start -W -n <applicationId>/.MainActivity` (+ dev menu attach if configured) |
| Flutter | `adb shell am start -W -n <bundleId>/<activity>` or `flutter run` |
| Capacitor / WebView shells | `-n <appId>/.MainActivity` plus ensure dev server URL reachable (reverse or LAN IP in config) |

**Example (substitute placeholders):**

```bash
adb shell am start -W -a android.intent.action.VIEW \
 -d "<SCHEME>://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"
```

If `am start` reports the intent delivered to an already-running activity,
that is OK — Metro may still hot-reload afterward.

After launch, wait `~12-15s` for the JS bundle (longer cold start), then
`screencap` to disk.

### 1d. Health-check the first paint

The first screen MUST be:
1. Not pure white (= Metro died OR JS threw before mount)
2. Not the dev launcher's "Error loading app · unexpected end of stream"
 (= bundler unreachable from device — fix `adb reverse`, wrong port, **or**
 dev client opened before `curl /status` showed running — see Phase `1b`)
3. Not the dev launcher's "last time you tried to open … crashed" warning
 left as the only content (= a recent change crashed before mount)

If any of those: collect logcat, fix, relaunch — do **not** start walking
on a half-broken app.

```bash
# Tail JS errors only
adb logcat -d ReactNativeJS:V '*:S' | tail -50
# Or for Capacitor / Cordova:
adb logcat -d Capacitor:V SystemWebChromeClient:V '*:S' | tail -50
```

---

## Phase 1.5: Build-freshness verification  [LOW freedom — run exactly]

> A "nothing changed" report is almost never the patch failing — it is the device running yesterday's bytecode — so this phase runs before any walk.

The fundamental risk: **three separate caches** can each serve stale code
to the device. They must each be invalidated explicitly, in order, before
trusting any walkthrough finding.

### 1.5a. Source freshness — does the file on disk reflect the patch?

```bash
# Confirm the change you "just made" is actually saved
git diff --stat HEAD -- <changed_file>
# Or grep for a unique string from the patch
grep -n "<unique_string_from_patch>" <changed_file>
```

If the file shows no change, the editor lost the buffer or the StrReplace
silently no-op'd. Re-apply the patch before going further.

### 1.5b. Bundler freshness — is Metro/Vite serving the new source?

For Metro:
```bash
# Hit the bundle URL the device uses; the body should contain the unique
# string from the patch. Use the device's bundle URL, NOT just /status.
curl -s "http://localhost:8081/index.bundle?platform=android&dev=true" \
 | grep -c "<unique_string_from_patch>"
# Expect: ≥1
```

If the count is 0, Metro served a cached bundle. Restart Metro with a
hard cache wipe:

```bash
# Kill the Metro process holding port 8081
lsof -i :8081 -t | xargs -r kill -9 # macOS / Linux
# Windows / Git-Bash:
netstat -ano | grep :8081 | awk '{print $5}' | sort -u | xargs -r -I{} taskkill //F //PID {}

# Restart with cache wipe (Expo example; adapt for bare RN / Capacitor)
( cd apps/<mobile-app> && npx expo start --clear --port 8081 ) &
```

Wait for Metro to print `Bundling complete` then re-curl the bundle to
confirm the unique string is now present.

### 1.5c. Device freshness — is the device running the new bundle?

The dev launcher caches the bundle URL between sessions. Even with fresh
Metro, the device may still hold the old JS in memory. Force a reload:

```bash
# Method 1: Metro reload endpoint (best — works without device interaction)
curl -s -X POST http://localhost:8081/reload && echo "reload triggered"

# Method 2: Send the React Native dev-menu R+R shortcut
adb shell input keyevent 46 # send 'R' once
sleep 0.1
adb shell input keyevent 46 # send 'R' twice → reload

# Method 3: Force-stop the app and re-launch via deep link
adb shell am force-stop <app.id>
adb shell am start -W -a android.intent.action.VIEW \
 -d "exp+<scheme>://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"

# Method 4 (nuclear): Wipe app data, including persisted query cache
adb shell pm clear <app.id>
# Then relaunch — note this also signs the user out
```

After reload, wait `~10s` and `screencap`. The unique change you patched
should be visible.

### 1.5d. Native-code freshness — for changes that touch `android/`

If the patch modified anything under `android/`, `ios/`, or any native
module (`react-native-*` with autolinked native code), Metro reload is
**not enough**. The Hermes bytecode and the APK both need rebuilding:

```bash
# Bare RN
( cd android && ./gradlew installDebug )
adb shell am force-stop <app.id>
adb shell am start -n <app.id>/.MainActivity

# Expo dev client
npx expo run:android --variant debug --no-install # build only
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am force-stop <app.id>
adb shell monkey -p <app.id> 1
```

### 1.5e. Verify-by-evidence

The build is "fresh" only when ALL of the following are true:
- ✅ Source file on disk contains the patched string (`git diff` shows it)
- ✅ Bundle served by Metro contains the patched string (curl + grep ≥1)
- ✅ A unique on-screen marker from the patch is visible in `screencap`
- ✅ Logcat shows the new bundle hash in the `Running application` line

If any of those fails, do not start Phase 2 — the walk will report stale
behaviour and waste cycles.

### 1.5f. Stale-build smell tests

Run these whenever the user says "nothing changed" or a fix appears not
to have landed:

| Smell | Likely cause | Fix |
|---|---|---|
| Same screen pixels after patch | Metro served cached bundle | 1.5b restart with `--clear` |
| Patch visible in some sessions only | Two Metro instances on different ports | `lsof -i :8081 -i :19000 -i :19001`, kill all, restart one |
| Hot reload silently broken | File-watcher hit OS handle limit | Restart Metro; on Linux `sysctl fs.inotify.max_user_watches=524288` |
| New Sentry capture has old source-map line numbers | Sentry source-maps not re-uploaded for the dev build | Acceptable for dev; flag for release builds |
| Native module change doesn't take effect | APK still old | 1.5d full Gradle build |
| `pm clear` didn't fix it either | Wrong `app.id` (release vs debug variant) | `adb shell pm list packages \| grep <project>` |

---

## Phase 2: Tap-driven walk of every tab  [HIGH freedom]

## Further reading

- [2a. Coord math (don't skip this — most failed taps come from getting it wrong) and more](references/details.md)
