---
name: mobile-emulator-start
description: >
  Boot the Android emulator and Metro (Expo or bare RN) in order: check
  terminals, kill stale ports, pick an AVD. Use when "start Metro", "start
  emulator", "Cannot connect to Expo", or a stuck dev loop. QA →
  mobile-emulator-test.
license: MIT
effort: low
---

# mobile-emulator-start — Metro + Android emulator in a sane order

**Degree of freedom: MIXED.** Reuse vs fresh Metro `[HIGH freedom]`; port kill,
boot, reverse, `/status`, then intent `[LOW freedom — run exactly]`.

Deliver a **working dev loop** (emulator online → tunnel → bundler ready → app intent)
without burning time on duplicate Metros, stale caches, or racing the dev client ahead of
`/status`.

> Pair with **`mobile-emulator-test`** for full QA; this skill focuses on **bring-up + terminal hygiene**.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **mobile-emulator-start** (this) | Emulator and Metro bring-up in order; port and terminal hygiene |
| `mobile-emulator-test` | QA of the native build: UI, Supabase, Sentry per CRUD step |

## How to reason

1. **Inspect** — existing terminals, `curl /status`, `adb devices`
2. **Decide** — reuse a healthy Metro vs one explicit fresh wipe
3. **Order** — free ports → boot AVD → reverse → Metro → wait `/status`
4. **Launch** — intent only after `packager-status:running`

## Worked example

> **Inspect:** two terminals on 8081; `adb devices` empty; last intent was `ECONNREFUSED`.
> **Decide:** kill both Metros (not a cache wipe — user asked to start, not "stale bundle").
> **Order:** boot AVD → `adb reverse` → one `expo start --dev-client` → poll `/status`.
> **Launch:** `am start` the scheme deeplink; logcat has no immediate refused-to-Metro.

## Self-critique before reporting

- **One Metro** — no second cwd serving the wrong graph
- **Order held** — emulator in `adb devices` before reverse; `/status` before intent
- **Size expected** — `wm size` is 1080×2400 unless scroll-QA was requested
- **Right owner** — guest/signed-in QA walk → `mobile-emulator-test`; crash after start → `debug-error`

---

## Critical ordering (why this skill exists)  [LOW freedom — run exactly]

1. **Emulator attached to `adb`** before trusting `adb reverse` (or reverse again when the serial appears).
2. **`curl http://127.0.0.1:<PORT>/status`** shows **`packager-status:running`** before `am start` / dev-client deeplink (avoids “Cannot connect to Expo CLI” / `127.0.0.1` refused).
3. Helpers that **enumerate devices once at startup** may skip `--launch` / reverse if the emulator booted late — **re-run reverse + intent** after `adb devices` shows `device`.

---

## Phase A: Read existing terminals first  [HIGH freedom]

Before spawning duplicate processes, **inspect what is already running**.

### A.1 Cursor / VS Code–style terminal metadata

If the workspace exposes a `terminals/` folder (often under the project’s `.cursor/projects/.../terminals/` or similar), read **`*.txt` headers**:

- **`command:`** — already running `expo start`, `metro`, `emulator`, `gradle`?
- **`pid:`**, **`cwd:`** — avoid second Metro from the wrong package root.
- **Output tail** — bundle errors, port-in-use, `ENOENT`, `SyntaxError` in the app (fix code before restarting blindly).

Prefer **reusing** a healthy Metro session when the user wants speed; only **kill + restart** when stuck, on wrong port, or after selecting the **fresh** path (Phase C).

### A.2 Quick health probe (non-destructive)

```bash
# Metro default
curl -sSf "http://127.0.0.1:8081/status" | head -c 120 || true
adb devices
```

If Metro responds and an **`emulator-* device`** exists, you may only need **`adb reverse`** + reload — not a full reboot.

---

## Phase B: Fresh instance vs fast iteration  [HIGH freedom]

| Goal | Do this | Avoid |
|---|---|---|
| **Fast / Hot Reload** | Start Metro **without** wiping `node_modules/.cache` / `.expo` every time; reuse Metro if healthy | Chaining `clean` + full cache wipe before every edit |
| **Fresh / “weird Metro”** | One explicit cold wipe (repo script or `expo start --clear`, delete `.expo`, etc.), then start Metro | Assuming “fresh” without killing the old Metro on the same port |

**Heuristic:** if the user says *“stale bundle / nothing changed / white screen after hours of dev”* → lean **fresh** once, confirm **Phase 1.5-style bundle checks** from `mobile-emulator-test`. If they say *“just start my session”* → prefer **fast**.

---

## Phase C: Free the ports and orphaned processes  [LOW freedom — run exactly]

### C.1 Ports (adjust to the repo’s Metro port)

Common: **`8081`** (Metro), **`19000`–`19002`** (Expo). Discover from `package.json` scripts or prior terminal output.

- **Windows:** `netstat -ano | findstr :8081` → `taskkill /PID <pid> /F`
- **macOS/Linux:** `lsof -i :8081` → `kill -9 <pid>` (or `fuser -k 8081/tcp`)

Kill **orphan `adb.exe`** only when transport is stuck (symptom: `adb devices` hangs / `offline` spam). Pattern that works but is heavy-handed on Windows: `taskkill /IM adb.exe /F /T` then `adb start-server`.

### C.2 Duplicate Metro in another repo / cwd

Starting Metro from the **wrong `cwd`** serves the wrong graph — always `cd` into the **mobile app root** the project uses (`apps/mobile`, `packages/app-mobile`, etc.) before `npx expo start` / `react-native start`.

---

## Phase D: Emulator display resolution  [LOW freedom — run exactly]

### D.0 Which resolution to use?

| Goal | Resolution | Why |
|---|---|---|
| **Standard tap / interaction QA** (default) | **`1080×2400`** | Standard phone size. Reliable on Windows/Capacitor hosts, easier coordinate math for `adb shell input tap`. **Use this by default.** |
| **Full-screen scroll-screenshot QA** (opt-in) | `1080×4000` | Tall virtual display for single long screenshots. Only when the user explicitly asks for scroll QA — and never `wm size 1080x4000` without a matching tall skin, or the AVD skin clamps/garbles the display (see `mobile-emulator-test` Phase 0.5). |

**Default: start at `1080×2400`; switch to `1080×4000` only on explicit scroll-QA request with a matching skin.**

To switch resolution without rebooting the AVD:

```bash
adb shell wm size 1080x2400 # default (standard phone)
adb shell wm size 1080x4000 # opt-in tall screenshots (requires matching tall skin)
adb shell wm size reset # restore to AVD default
adb shell wm size # verify
```

Scale factor for coordinate math when screenshots are displayed at ~294px wide in chat:

```
device_x = display_x × (device_width  / display_image_width_px)
device_y = display_y × (device_height / display_image_height_px)
# device_width/height from `adb shell wm size` (1080×2400 default, 1080×4000 tall skin)
```

Example — button at display position (147, 600) in a 294×653-px chat image of the default 1080×2400 device:
- `device_x = 147 × (1080/294) ≈ 540`
- `device_y = 600 × (2400/653) ≈ 2205`

### D.1 Boot sequence

```bash
emulator -list-avds
# Then:
emulator -avd "<AVD_NAME>" -netdelay none -netspeed full
```

Use `%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe` on Windows if `emulator` is not on `PATH`.

After boot, immediately set the target resolution:

```bash
adb shell wm size 1080x2400 # default for tap QA
```

### D.2 Display truth

After boot:

```bash
adb shell wm size
adb shell wm density
```

Expect **`Physical size: 1080x2400`** for the default tap-QA preset (or `1080x4000` if scroll QA was requested). If you see `720×1280` or another unintended size, the AVD `skin.path` is overriding `hw.lcd.*` — use `adb shell wm size 1080x2400` to override at runtime, or apply the minimal custom skin workflow in **`mobile-emulator-test` Phase 0.5**.

### D.3 `_no_skin` failure

If the emulator exits immediately with **`unknown skin name '_no_skin'`**, remove/replace **`skin.name=_no_skin`** in the AVD **`config.ini`** — see **`mobile-emulator-test`** Phase **0.5b–c**.

---

## Phase E: `adb` attach + reverse  [LOW freedom — run exactly]

```bash
adb start-server
adb wait-for-device
# Wait until boot_completed if scripts are flaky:
adb shell getprop sys.boot_completed # expect 1

METRO_PORT=8081 # or repo-specific
adb reverse tcp:${METRO_PORT} tcp:${METRO_PORT}
```

Re-apply **`adb reverse`** after **new emulator session**, **`adb kill-server`**, or **USB reconnect**.

---

## Phase F: Start Metro (background-friendly)  [LOW freedom — run exactly]

From the **correct app cwd**:

```bash
# Expo dev client (common)
npx expo start --dev-client --port 8081

# Bare React Native (example)
npx react-native start --port 8081
```

Run long-lived processes in the **background** when the agent must continue other work; otherwise the user’s terminal owns the foreground process.

**Fresh-start variant** (slow, clears Metro’s world — use sparingly):

- `npx expo start --dev-client --clear --port 8081`, or repo script equivalent (`dev-fresh`, `start:clean`, etc.).

---

## Phase G: Block until Metro is actually ready  [LOW freedom — run exactly]

```bash
METRO_PORT=8081
# Bash-style loop; cap total wait ~120–180s on cold cache wipes
while ! curl -sSf "http://127.0.0.1:${METRO_PORT}/status" | grep -q "running"; do sleep 3; done
```

Only **then** trigger the app (Phase H). This removes the classic race where the emulator shows **Cannot connect** / **`ECONNREFUSED`** even though Metro appears a few seconds later.

---

## Phase H: Launch the app  [LOW freedom — run exactly]

### H.1 Expo dev client (generic)

Discover **`scheme`** from `app.json` / `app.config.*` (and **Android** `intent-filter` if native-linked). Pattern:

```text
<scheme>://expo-development-client/?url=http%3A%2F%2Flocalhost%3A<PORT>
```

```bash
adb shell am start -W -a android.intent.action.VIEW \
 -d "<scheme>://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"
```

### H.2 Installed debug APK / Kotlin (no Expo)

```bash
adb shell am start -W -n <applicationId>/.<MainActivityName>
```

### H.3 Hot Reload after Metro is up

- Shake menu / `adb shell input keyevent 82` (menu) and enable Fast Refresh, or
- `curl -X POST http://localhost:8081/reload` when supported.

---

## Debugging cheat sheet

| Symptom | Likely cause | First move |
|---|---|---|
| Metro terminal shows `EADDRINUSE` | Old Metro on same port | Phase **C** kill port owner; restart **one** Metro |
| `Error loading app · unexpected end of stream` | Missing `adb reverse` or Metro not up yet | Phase **E** + **G**, then relaunch |
| Emulator never in `adb devices` | AVD skin crash / HW issue | Check emulator stdout; **`mobile-emulator-test` 0.5** |
| `Physical size` wrong | Stock skin clobbering `hw.lcd` | `adb shell wm size 1080x2400` overrides at runtime; persistent fix → **`mobile-emulator-test` 0.5** |
| `Cannot connect to Expo CLI` / `127.0.0.1:8081` | Deeplink before `/status` ready | **Always Phase G → H** |
| Two Metro instances | Two terminals / two repos | Read **Phase A** headers; kill stray PID |
| Stale JS after fix | Cache / wrong cwd | **Fresh** path once + `expo start --clear` |

---

## Performance notes (keep fast)

- Prefer **one** Metro per machine per app root; extra instances waste RAM and confuse watchman.
- **Do not** chain cache-hungry “fresh” scripts before every save — that kills Hot Reload wins.
- On Linux, if file watchers exhaust, bump `fs.inotify.max_user_watches` (rare; only when Metro logs watcher errors).

---

## Optional repo integration

Many monorepos expose:

```text
node scripts/dev-android.mjs --launch --port 8081
```

If such a script **polls `/status`** and sets **`adb reverse`**, prefer it **after** the emulator is already listed in `adb devices`. If the script bails early with **no device**, start the emulator first **or** manually run Phase **E–H** once online.

---

## Verification checklist (short)  [LOW freedom — do not skip]

- [ ] **One** Metro listening; `curl /status` = **running**
- [ ] `adb devices` shows **`device`**, not `offline`
- [ ] `adb reverse tcp:<PORT> tcp:<PORT>` executed for that Metro port
- [ ] `adb shell wm size` matches expected **1080×2400** (default) or **1080×4000** (if scroll QA was requested with a matching skin)
- [ ] App intent succeeds **after** `/status` OK — logcat has no immediate **`ECONNREFUSED`** to Metro

---

## Cross-links

- **`mobile-emulator-test`** — AVD **`layout`** template, guest/sign-in walks, DB/Sentry loops.
- **`debug-error`** — systematic JS/native failure isolation if the bundle crashes after start.
