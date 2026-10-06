### 2a. Coord math (don't skip this — most failed taps come from getting it wrong)

`adb exec-out screencap -p > snap.png` writes a PNG at the device's full
logical resolution (**Phase 0.5 preset: 1080×4000**; stock Pixels often
1080×2400). When the agent reads the PNG it's downsampled for chat display.
Scale taps back using the **ADB-reported size**, not the preview thumbnail:

```
adb shell wm size   # authoritative WxH for coord math
```

To click an element you saw on screen:

```
real_x = display_x * (device_width  / display_width)
real_y = display_y * (device_height / display_height)
```

Pass `real_x real_y` to `adb shell input tap`. If a tap appears to do
nothing, **dump the UI tree** rather than guessing:

```bash
adb shell "uiautomator dump /sdcard/ui.xml && cat /sdcard/ui.xml" \
  | head -200
# Search for the bounds="[x1,y1][x2,y2]" of the element you want.
```

## Contents

- Phase 2.5: Auth area — walk both guest AND signed-in paths
- Phase 3: Full CRUD round-trip with three-layer verification
- Phase 4: The "looks empty even though signed in" failure mode
- Phase 5: Cache-rehydration crashes (`isZero is not a function`)
- Phase 6: Sentry MCP loop
- Phase 7: Edge cases the walk should not skip
- Phase 8: Cleanup
- Phase 9: Report
- Native build QA — <project> on Android emulator
- Anti-pattern catalogue (ship-blockers I want the agent to spot fast)
- Important rules


### 2b. Walk every tab in order

For each tab in the bottom navigation:

1. `adb shell input tap <tab_x> <tab_y>` — switch tab
2. `sleep 5-7` — let the tab's `useFocusEffect` refetch settle
3. `adb exec-out screencap -p > tab-<n>.png`
4. `adb logcat -d ReactNativeJS:V '*:S' | grep -iE 'TypeError|Error|column|exception|isZero|getDate|Render Error|Property' | tail -10`
5. **Read the screenshot.** Look for:
   - Empty state where data should exist (signed-in user, dataset > 0)
   - "—" / "0" / "undefined" / "NaN" in numeric cells
   - Stuck skeleton (no data after 8s)
   - Error boundary fallback
   - Layout overflow / misaligned text
6. **Read logcat.** Any `TypeError`, `column does not exist`, or
   `ErrorBoundary` line is a finding even if the screen looks OK.

### 2c. Drill into one detail row per tab

Tab-level screens hide bugs that only show on item detail. For each tab
that lists items, tap the first real (non-test) row and verify the detail
screen renders without "Couldn't load that entry" or skeleton lock.

---

## Phase 2.5: Auth area — walk both guest AND signed-in paths

> A native budgeting / productivity / journaling app typically supports a
> **guest path** (local-only, no auth) and a **signed-in path** (cloud
> sync). They share UI but route through completely different adapters
> (`localAdapter` vs `cloudAdapter`/PowerSync), so a fix that lands one
> path commonly regresses the other. **Both must be walked every session.**

### 2.5a. Inventory the auth surface

Find the auth entry point and its branches:

```bash
# Expo Router
ls apps/<mobile-app>/app/auth/    # index.tsx, callback.tsx, etc.
# React Navigation
grep -rn "AuthStack\|SignInScreen\|<Stack.Screen.*name=.\"auth" apps/<mobile-app>/src/
```

List every auth entry point: magic-link email, OAuth (Apple/Google/etc.),
passkey, biometric unlock, **and** the guest-mode entry. Note the
SignedOut → SignedIn transition (`session.refresh()` in Zustand,
`onAuthStateChange` in Supabase, etc.).

### 2.5b. Cold-start: signed-out auth screen

```bash
adb shell pm clear <app.id>     # nuclear: wipes session + cache
adb shell am start -n <app.id>/.MainActivity   # or deep-link launcher
sleep 12
adb exec-out screencap -p > auth-cold.png
```

The first screen MUST be the auth landing surface (NOT a stuck splash,
NOT a half-rendered tab bar). Verify visually:
- All advertised auth methods are present (no missing OAuth button)
- "Continue as guest" / equivalent is reachable
- No console warnings about missing OAuth client IDs

### 2.5c. Walk A — guest path

1. Tap "Continue as guest" (`uiautomator dump` for exact bounds, then
   `input tap`).
2. Wait for the home/today tab to paint, `screencap`.
3. Walk every tab as in Phase 2 — confirm guest data flows through the
   local adapter (no Supabase calls in logcat: `adb logcat -d | grep -i
   "supabase\|fetch.*supabase\|GoTrue"` should be empty post-launch).
4. CRUD round-trip (Phase 3) with **`QA-GUEST-`** prefix.
5. Verify the row exists in the on-device store (SQLite / MMKV /
   AsyncStorage), NOT in cloud:
   ```text
   execute_sql(query: "select count(*) from <main_table>
                       where notes ilike 'QA-GUEST-%'")
   ```
   Expect: `0`. (Guest writes must not hit cloud.)
6. Confirm no Sentry events were captured for this guest session that
   reference cloud APIs — if so, a cloud call leaked into the guest path.

### 2.5d. Walk B — signed-in path (via magic link or test creds)

1. From the guest session, find the "Sign in" / "Sync your data" entry
   (often Settings → Sign in, or auth screen → Sign in tab).
2. **Magic-link path:**
   - Enter the test email.
   - Use Supabase MCP to retrieve the link from auth.users:
     ```text
     execute_sql(query: "select id, email, last_sign_in_at,
                                confirmation_sent_at
                         from auth.users
                         where email = '<test@…>'
                         order by created_at desc limit 1")
     ```
   - For local development, magic-link emails are usually intercepted by
     Supabase Inbucket / Mailpit at `http://localhost:54324` — fetch the
     latest message's HTML and extract the `?token_hash=…&type=magiclink`
     URL. Open it via `adb`:
     ```bash
     adb shell am start -W -a android.intent.action.VIEW \
       -d "<deep-link-from-email>"
     ```
   - Watch logcat for `[supabase] auth state change → SIGNED_IN`.
3. **OAuth path (when the test account supports it):**
   - Tap the provider button.
   - Browser intent opens; the in-emulator browser will redirect back via
     the app's deep-link scheme.
   - If the redirect doesn't fire (common on emulators without Play
     Services), record this as a known-failure-on-emulator and use
     magic-link instead.
4. After SIGNED_IN, verify the signed-in path:
   - `screencap` shows the post-auth home with **server-truth data**
     (not the empty-state guest UI).
   - Logcat shows TanStack queries firing against the cloud adapter.
   - Run Phase 4 (sync-empty-state checklist) — this is where the
     PowerSync-disabled bug lives and you must confirm cloud-direct
     fallback engages.
5. CRUD round-trip with **`QA-CLOUD-`** prefix → SQL must show `1` row.

### 2.5e. Walk C — guest-to-cloud migration (if supported)

If the app supports promoting a guest workspace into a cloud workspace
(common in finance / journal / note apps), test it explicitly:

1. Start fresh: `pm clear`, enter guest, create 3 `QA-GUEST-` rows.
2. Sign in (Walk B).
3. Confirm the migration prompt appears ("Bring in your local data?").
4. Tap "Bring it all in".
5. SQL-verify the rows now exist in cloud:
   ```text
   execute_sql(query: "select count(*) from <main_table>
                       where workspace_id = '<new_cloud_ws>'
                         and notes ilike 'QA-GUEST-%'")
   ```
6. Confirm the on-device guest workspace is either deleted or marked
   migrated (and never re-imports on the next launch).

### 2.5f. Walk D — sign-out and re-sign-in

1. From the signed-in state, Settings → Sign out.
2. Confirm the app returns to the auth screen and **all signed-in caches
   are cleared** (no flash of stale data on the next sign-in).
3. Sign back in. Cold-fetch should re-hydrate from cloud, not from a
   stale persisted blob. Watch logcat for any
   `TypeError: x.<method> is not a function` — that means the persister
   served a corrupted post-sign-out cache (Phase 5).

### 2.5g. Auth-area-specific failure modes to look for

| Symptom | Likely cause | Where to look |
|---|---|---|
| Magic-link button tap → nothing | `EXPO_PUBLIC_SUPABASE_URL` missing | `apps/*/.env.local`, `app.config.*` extras |
| OAuth redirect lands on dev launcher, not the app | scheme not registered in `AndroidManifest.xml` | `intent-filter` for `<scheme>://` |
| Biometric gate shown but cancel bricks the app | no escape hatch in BiometricGate | grep `LocalAuthentication` / `BiometricPrompt` for `dismissed` state |
| Signed-in user sees guest UI on first launch | Zustand session restore racing the first render | session bootstrap should set `loading=true` until first `getSession()` resolves |
| Signed-in user sees "No accounts" | sync layer disabled — Phase 4 | Phase 4 cloud-direct fallback |
| Sign-out leaves user on the home tab | navigation reset missing in the auth listener | grep `onAuthStateChange` → look for `router.replace('/auth')` |
| Persisted cache survives sign-out and corrupts the next user | persister not bound to the user id, no clear on SIGNED_OUT | wipe persister in the auth listener |

---

## Phase 3: Full CRUD round-trip with three-layer verification

Pick the app's primary mutation surface (FAB → "New X", or the equivalent).

### 3a. Create

1. Open the FAB / "+" / new-entry sheet.
2. Fill required fields with `QA-TEST-` prefixed text + a memorable amount
   (e.g. `S$ 12345`) so you can grep both UI and DB.
3. Tap Save. Note the timestamp.
4. Watch for the success toast/snackbar in the next `screencap`.

### 3b. Verify in the DB via Supabase MCP

```text
supabase:execute_sql
{
    "query": "select id, amount, currency, posted_at, notes
              from <main_table>
              where workspace_id = '<ws>'
                and (notes ilike '%QA%' or amount = -12345)
              order by created_at desc limit 5;"
  }
```

A row with the exact amount and the `QA-TEST-` payee/note must exist. If
two rows came back, the Save button double-fired — log a P2 finding.

### 3c. Verify it's visible in the list view

Navigate to the list, `screencap`, find the `QA-TEST-` row visually. If the
list cache wasn't invalidated after the mutation, this is the bug — log it
and pull-to-refresh / kill+relaunch to confirm.

### 3d. Edit (when supported)

Tap the row → edit one field → Save → SQL-verify the change → re-open the
detail to confirm the new value persists across a cold render.

### 3e. Delete

Use the in-app delete affordance (swipe / sheet button). Verify:
- snackbar / undo banner appears
- list view no longer contains the row
- SQL: `select count(*) from <main_table> where id = '<id>'` returns 0

If in-app delete is not yet wired, delete via Supabase MCP and verify the
app handles the missing row gracefully ("Couldn't load that entry" empty
state, not a crash).

---

## Phase 4: The "looks empty even though signed in" failure mode

This is the canonical native bug pattern and deserves its own phase.

### Symptoms

- Home shows real net worth / KPIs from a server RPC, but the Accounts /
  Transactions tab shows "No accounts yet" / "No transactions yet"
- The DB has hundreds of rows for this user (verify with Supabase MCP)
- No error in logcat or Sentry — just an empty state painted over real data

### Root cause checklist

1. **Sync layer disabled.** Many RN apps read the local SQLite replica
   (PowerSync / Watermelon / Realm) on the cloud-session path and the cloud
   directly only on the guest path. If the sync URL env var is unset, the
   replica is empty and the screen renders an empty state. Grep:
   ```bash
   grep -rn "POWERSYNC_URL\|isPowerSyncEnabled\|sync.*disabled" apps/*/lib/ packages/*/src/ 2>/dev/null
   ```
   Fix: add a runtime `isSyncEnabled()` check and fall back to the
   adapter's direct cloud fetcher when false.

2. **Missing DB columns.** If `select *` returns the rows but a downstream
   filter (`.eq('parent_account_id', …)`) hits a column that hasn't been
   migrated to cloud, the query returns `[]` silently. Verify with:
   ```text
   list_tables(schemas: ["public"]) → check column list
   ```
   Fix: apply the missing migration via `apply_migration`.

3. **PostgREST OR-syntax against a non-existent column.** Same shape as
   above but the failure is loud (`column foo does not exist`). Surfaces in
   `query_logs` on `source = 'postgres_logs'`.

### Mitigation pattern (works across stacks)

Always provide a "cloud-direct fallback" hook the screen can opt into:

```ts
// pseudo
const useCloudFallback = !isGuest && !isSyncEnabled()
const direct = useTabQuery(['<entity>-direct', wsId], () => listFromCloud(ctx),
                           [wsId], !!ctx && (isGuest || useCloudFallback))
const data = (isGuest || useCloudFallback) ? direct : useSyncReplica(wsId)
```

---

## Phase 5: Cache-rehydration crashes (`isZero is not a function`)

Persistent query caches (`@tanstack/query-sync-storage-persister` + MMKV /
AsyncStorage / Drift) JSON-stringify everything they store. **Class
instances and Date objects lose their prototypes on rehydration**, so on
the next cold boot the first method call (`Money.isZero()`,
`Date.getDate()`) throws inside the React tree and the screen goes blank.

### Diagnosis

`adb logcat -d ReactNativeJS:V` shows lines like:
```
TypeError: x.isZero is not a function (it is undefined)
TypeError: start.getDate is not a function (it is undefined)
```
…always under the same screen's `componentStack`.

### Two complementary fixes

1. **Skip persistence for cache keys that hold non-JSON-safe values.** In
   the persister config:
   ```ts
   dehydrateOptions: {
     shouldDehydrateQuery: (q) =>
       !NON_PERSISTABLE_KEY_PREFIXES.includes(q.queryKey[0] as string)
   }
   ```
   …and bump `buster: 'v2-…'` so existing devices wipe the corrupted blob.

2. **Defensive re-wrap at the consumer.** For Date fields that survive
   round-trips (e.g. weekStart/weekEnd from a chart series):
   ```ts
   const start = f.weekStart instanceof Date ? f.weekStart : new Date(f.weekStart)
   ```

Both belong in the codebase: (1) prevents new corruption, (2) is the
seatbelt for any path that still flows through a persisted cache.

---

## Phase 6: Sentry MCP loop

Run the Sentry MCP **before**, **during**, and **after** the walk.

### Before — baseline

```text
search_issues(organizationSlug, regionUrl,
  query: "issues from <project> in the last 24 hours, sorted by most recent")
```
Note the issue IDs and event counts so post-walk drift is attributable.

### During — confirm new captures

After each crash logged in logcat, search for a matching Sentry title
(`TypeError: x.isZero is not a function` etc.). If Sentry didn't capture it
the SDK isn't initialised on this build path — that itself is a finding.

### After — resolve what you fixed

```text
update_issue(organizationSlug, issueId: "<PROJECT>-<NUM>", status: "resolved")
```
`update_issue` needs the Triage skill on the Sentry MCP connection; if the tool
is missing, resolve the issue in the Sentry UI instead.
Resolve only the IDs whose stack-trace + message exactly match the patch
you shipped this session. Never resolve speculatively — Sentry will
auto-reopen if the same fingerprint reappears.

---

## Phase 7: Edge cases the walk should not skip

| Scenario | How to trigger |
|---|---|
| Cold start with empty cache | `pm clear <app.id>` then relaunch |
| Sign out / sign in | Settings → Sign out → re-auth → verify Today re-hydrates |
| Background → foreground | `adb shell input keyevent KEYCODE_HOME` then relaunch |
| Offline | `adb shell svc wifi disable && svc data disable`, walk one tab, re-enable |
| Biometric gate cancel | When the gate appears, dismiss and verify the escape hatch (Try again / Disable lock) |
| Slow network | `adb shell tc qdisc add dev wlan0 root netem delay 2000ms` (clean up after) |
| Discard dialog from FAB | Open new entry, tap back, expect "Discard this entry?" |

---

## Phase 8: Cleanup

```text
execute_sql(query:
  "delete from <child_table> where <fk> in (select id from <main_table>
                                            where notes ilike 'QA-TEST-%');
   delete from <main_table> where notes ilike 'QA-TEST-%' returning id;")
```
Confirm the returned id list matches what you created. Also delete any test
payees / categories you created if the schema treats them as side rows.

Then leave the app on the home tab so the next session starts clean.

---

## Phase 9: Report

```markdown
## Native build QA — <project> on Android emulator

### Environment
- Stack: <Expo SDK / RN version / Capacitor version>
- Bundler: <metro:8081 ok | dead | restarted>
- Device: <emulator-5554, Android <ver>>, `adb shell wm size` (**expect 1080×4000 if using Phase 0.5 preset**)
- Account: <user@…> (workspace <id>) — <N> rows in primary table
- MCPs available: <supabase, sentry>

### Walk results
| Surface | Render | Logcat | Notes |
|---|---|---|---|
| Today / Home | ✅ | clean | net worth ¥578k, chart W12-W19 |
| Activity | ✅ | clean | 50 rows, IN/OUT/NET correct |
| Accounts | ✅ after fix | (was empty) | required cloud-direct fallback (Phase 4) |
| Plan | ✅ | clean | budgets card "1 active" |
| Insights | ✅ | clean | 8-week money-in/out chart |

### CRUD round-trip
- Created: <id> via FAB → DB row present → list visible → ✅
- Updated: field X — UI ✅, DB ✅, cold re-open ✅
- Deleted: undo banner shown, DB row gone, count(*) = 0

### Patches shipped this session
1. <file:line> — <one-liner>; resolves Sentry <ISSUE-ID>
2. …

### Sentry hygiene
- Resolved: <list of IDs>
- New unresolved: <list, with first-seen timestamps>

### Known follow-ups
- <PowerSync URL not provisioned — cloud fallback in place>
- <migrations 0083–0086 partial; full apply needs CHECK-constraint refactor>
```

---

## Anti-pattern catalogue (ship-blockers I want the agent to spot fast)

| Symptom on screen | Real cause | First fix |
|---|---|---|
| "Nothing changed after my patch" | Stale Metro bundle, stale APK, or stale dev-launcher cache | Run **Phase 1.5** — re-curl bundle, `--clear` Metro, `pm clear` if needed |
| White screen after dev-launcher tap | Metro died OR JS threw before mount | `curl localhost:8081/status` → restart bundler / read logcat for the throw |
| Emulator exits <1s / `adb devices` stays empty (`exit 1`) | Invalid `skin.name` / `skin.path` (often `_no_skin` on newer emulator) | Phase **0.5b–c** — valid SDK skin dir or minimal **1080×4000** custom skin folder |
| `adb shell wm size` shows **`720×1280`** despite `hw.lcd` edits | Stock skin `layout` overriding guest resolution | Phase **0.5c** custom skin with **1080×4000** `device.display`; re-verify **`wm size`** |
| "Error loading app · unexpected end of stream" / Expo cannot connect | `adb reverse` never set, Metro bound after deeplink fired, stale port | **`curl /status`** until running, **`adb reverse tcp:<p> tcp:<p>`**, relaunch deeplink (`Phase 1b–c`); emulator boot **before** one-shot launch scripts (`Phase 0.5`, `§1a`) |
| Blank where data should be (signed-in, populated user) | Sync replica empty; screen reads only from local SQLite | Add `isSyncEnabled()` runtime check + cloud-direct fallback |
| Persistent skeletons that never resolve | `useFocusEffect(refetch)` with an unstable refetch identity → infinite invalidate→refetch loop | Wrap `refetch` in `useCallback` with stable deps |
| `TypeError: x.isZero is not a function` after cold boot | Persisted cache rehydrated a `Money`/`Date` as a plain object | Skip persistence for that key + bump persister `buster` |
| `Property 'X' doesn't exist` ErrorBoundary | Renamed a hook return value, missed downstream callers | Grep the old name across the file before declaring the rename done |
| `column "Y" does not exist` in logcat / Sentry | Mobile shipped a migration that hasn't reached cloud | `list_tables` to confirm, `apply_migration` to ship the missing column |
| Tap does nothing | Wrong real-coord math from downscaled screenshot | `uiautomator dump` → read `bounds="[x1,y1][x2,y2]"` |
| Guest works but signed-in shows empty UI | Sync replica path not reached; cloud-direct fallback missing | Phase 2.5d + Phase 4 |
| Signed-in works but guest crashes / cloud-leaks | Adapter path imports `supabase` at module load instead of behind `if (cloud)` | Lazy-import cloud adapter; gate calls on `ctx.kind === 'cloud'` |
| Sign-out leaves stale data on next sign-in | Persister cache scoped to app, not to user id | Clear persister in `onAuthStateChange('SIGNED_OUT')` |

---

## Important rules

1. **Read the codebase first** — Phase 0 is mandatory. Never test blindly.
2. **Emulator/skin/`wm size` first** — Phase 0.5. If AVD exits instantly (`_no_skin`),
wrong **`Physical size`** (stock skin overriding `hw.lcd`), or adb never sees a device,
fix that loop before blaming Metro / JS.
3. **Verify the build is fresh — Phase 1.5 is mandatory.** Confirm the
   patch is on disk, in the bundle, and on the device before walking.
   Skipping this phase is the #1 source of false "nothing changed"
   reports.
4. **Walk both auth paths every session — Phase 2.5 is mandatory.** Guest
   and signed-in route through different adapters; a fix on one regresses
   the other. Always exercise both, plus the migration path between them.
5. **Prefer `am start -W`** for intents / activities — **`monkey -p` is unreliable**
   and silently no-ops on some dev-client configurations.
6. **Always pair UI screencap with logcat** — a screen can lie, a
   stack-trace cannot.
7. **Verify mutations against the DB**, not just the UI cache.
8. **Bump the persister buster** whenever you change what gets persisted,
   so existing devices wipe corrupted blobs on first cold boot.
9. **Resolve Sentry only what you actually fixed.** Auto-reopens are
   louder than over-eager closures.
10. **Clean up server state at the end** — leave the workspace exactly as
   you found it, minus the bugs you patched.
