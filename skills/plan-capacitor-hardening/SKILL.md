---
name: plan-capacitor-hardening
description: >
  Plan-only Capacitor/Ionic native-layer security audit: WebView, token storage,
  deep links, OAuth, cleartext, exported activities. Use when "is my Capacitor
  app secure?". Store readiness → plan-mobile-readiness.
license: MIT
effort: high
---

# Capacitor Native-Layer Hardening Audit + Remediation Plan

**Degree of freedom: HIGH** — native-layer inventory and plan. Stay
**plan-only**. No config, manifest, or code edits until approved.

## This skill vs neighbors

| Skill | Owns |
|---|---|
| **plan-capacitor-hardening** (this) | Native-layer / WebView security plan |
| `plan-mobile-readiness` | Store submission mechanics |
| `enhance-capacitor-ui` | Hybrid shell UI |

## How to reason (every plan item)

1. **Propose** — config, storage, deep-link, or WebView change
2. **Risk** — what a extracted APK or hijacked scheme actually exposes
3. **Keep-working** — native controls that already hold in production
4. **Phase** — prod-config leaks → tokens → auth → WebView → OTA (do not execute)

## Worked example

> **Propose:** `server.cleartext` and `webContentsDebuggingEnabled` false in prod; move auth tokens off Preferences onto Keychain/Keystore.
> **Risk:** release APK allows remote WebView inspect + plaintext token backup exfil.
> **Keep-working:** iOS ATS already blocks cleartext.
> **Phase:** Phase 1 — strip dev config from prod.

**Role:** Senior mobile security engineer (Capacitor / hybrid WebView surface).

**Task:** Inventory `capacitor.config`, native manifests, token storage, OAuth/deep-links,
and OTA setup against pillars 1–5; build config-vs-production table, phase remediations,
emit `plan-capacitor-hardening.md`. **Audit & plan only — no config, manifest, or code
edits until approved.**

**Audit the native layer the web view hides. Change nothing until approved.**

Capacitor's official guidance: audit **Data, Authentication/Deep-Linking, Network, and
WebView security** — "without proper care, major security issues can crop up which can
prove extremely damaging and expensive." Recurring vibe-coded failures: tokens in plaintext
`localStorage`/`Preferences`, dev config (`cleartext: true`, `webContentsDebuggingEnabled`,
broad `allowNavigation`) in production builds, OAuth on hijackable custom URL schemes, and
Android components left `exported`. **Every finding here is invisible to web-only review.**

---

## When this fires

Trigger phrases: *"is my Capacitor app secure"*, *"harden my hybrid app"*,
*"WebView security"*, *"secure storage for tokens"*, *"deep link / OAuth security"*,
*"cleartext traffic"*, *"allowNavigation"*, *"exported activity"*, *"is my OTA update
safe"*, *"pre-store Capacitor hardening"*.

Do **not** fire for: UI polish (`enhance-capacitor-ui`), RN perf (`mobile-rn-performance`),
or store paperwork (`plan-mobile-readiness` — pairs with this). This owns the *native-layer
security surface*.

---

## Why a dedicated skill

`plan-rls-audit`, `plan-secrets-audit`, and `plan-input-validation` cover backend/web.
None know `capacitor.config`, `AndroidManifest.xml`, `Info.plist`, the WebView bridge, or
Keychain/Keystore. Hybrid-native gaps are invisible if you only review web code.

---

## The audit — four pillars (+ OTA)  [HIGH freedom]

### 1 · Data security
- **Secrets in the bundle** — API keys, tokens hardcoded in JS or build-time env injection.
  Bundle is extractable; move secret-key ops server-side. → `plan-secrets-audit`
- **Plaintext token storage** — auth tokens in `localStorage`, `@capacitor/preferences`,
  IndexedDB, plain SQLite. Wrong. Use memory-only or **iOS Keychain / Android Keystore**
  (`@aparajita/capacitor-secure-storage`, `capacitor-secure-storage-plugin`; both fall back to
  plain `localStorage` on web). Ionic Identity Vault: no new sales since 2025-02.
- **`allowBackup`** (Android) — `android:allowBackup="true"` exfiltrates app data via backups.

### 2 · Authentication & deep linking
- **Custom URL scheme OAuth** — `myapp://` not globally owned; malicious app can intercept.
- **No PKCE** — OAuth2 in native apps **must** use PKCE.
- **Custom scheme vs App/Universal Links** — prefer Universal Links (iOS) / App Links
  (Android) with `assetlinks.json` / AASA. Note silent verification fallback to browser.
- **Exported Android components** — `exported=true` + `BROWSABLE` + no validation = common
  deep-link compromise. Audit every `<intent-filter>`.
- **Deep-link input not validated** — URI params → `WebView.loadUrl`, file access, queries.
  `startsWith` host checks inadequate.

### 3 · Network security
- **Non-HTTPS** — any `http://` in plaintext.
- **`cleartext: true`** in `capacitor.config` — dev/live-reload only; never production.
- **Missing `network_security_config`** (Android) — `usesCleartextTraffic="false"`; pinning
  for high-assurance (note bypass risks).

### 4 · WebView security
- **No / weak CSP** — `Content-Security-Policy` meta tag scoping loads.
- **Broad `allowNavigation`** — untrusted hosts load with native bridge attached; scope to
  trusted API origin(s). Note `getPlatform()` quirk on navigated URLs.
- **`webContentsDebuggingEnabled: true`** in production — remote inspection; gate to dev.
- **`addJavascriptInterface` / bridge exposure** — untrusted content + JS interface =
  Critical RCE vector.
- **`setAllowFileAccess*` / `file://`**, `eval` on user input, insecure `postMessage`.
- **Stale system-bar config** — `StatusBar.setBackgroundColor` / `overlaysWebView: false` are no-ops on Android 16 (Capacitor 8.3.2+ `SystemBars`); not a security hole, but flag it as dead config whose removal is owed to `enhance-mobile-native-feel`.

### 5 · OTA / live-update governance
- **Update channel integrity** — OTA bundles signed/encrypted; unauthenticated path = RCE.
- **Store-policy** — Google permits WebView updates; **Apple: OTA must not alter core
  functionality** (App Store violation independent of security).
- **Rollback / kill switch** — can a bad update be reverted?

Severity aligned with Capsec (`@capgo/capgo-sec`) rules where applicable: CAP001–011,
AND001–010, and the SEC, STO, NET, IOS, AUTH, WEB, CRY, LOG and DBG families.
`npx @capgo/capgo-sec rules` lists the current set.

For each finding: location, gap, exposure, severity, remediation *direction*.

---

## Procedure  [HIGH freedom]

1. **Inventory.** Read `capacitor.config.*`, `AndroidManifest.xml`, `Info.plist`, network
   configs, OAuth/deep-link setup, token storage. State what you couldn't see.
2. **Run pillars 1–5.** Tag **Critical** (bridge/`addJavascriptInterface` to untrusted
   content, hardcoded signing key, plaintext secrets shipped), **High** (cleartext, broad
   `allowNavigation`, exported component, custom-scheme OAuth w/o PKCE, plaintext tokens),
   **Med** (debug flags, allowBackup, weak CSP), **Low** (logging nits).
3. **Config-vs-production table** — dev-only settings live in prod build.
4. **Phase** burndown. Production-config leaks and token storage first.
5. **Emit `plan-capacitor-hardening.md`, then end the turn** with a standalone recap in chat: the two or three highest-impact findings and the first phase to approve. The file is the deliverable — write it before the recap.

---

## Guardrails  [LOW freedom — run exactly]

- **Plan only.** No config, manifest, or storage migration edits.
- **"Works in the browser" hides all of this.** Say so explicitly.
- **Dev config is a production vulnerability.** `cleartext`, `webContentsDebuggingEnabled`,
  broad `allowNavigation` must not ship.
- **In-memory or hardware-backed only** for tokens/keys — not `Preferences`/`localStorage`.
- **Universal/App Links + PKCE** for sensitive OAuth; custom scheme = High even if "works".
- **Cross-hand:** bundle secrets → `plan-secrets-audit`; deep-link validation →
  `plan-input-validation`; submission → `plan-mobile-readiness`.
- **Minimal quoting** of config/manifest.

## Self-critique before the burndown  [LOW freedom — do not skip]

1. **evidenced-not-assumed** — config/manifest path or storage API, not "hybrid apps are risky"
2. **plan-only** — no config, manifest, or storage migration this pass
3. **phase justified** — prod-config leaks and plaintext tokens before OTA polish
4. **right-owner** — bundle secrets → `plan-secrets-audit`; store paperwork → `plan-mobile-readiness`
5. **no-false-safety** — "works in the browser" hides this surface; custom-scheme OAuth is High even if it works

---

## Report template — `plan-capacitor-hardening.md`

```markdown
# Capacitor Native-Layer Hardening Audit — <app>

_Audit-only. Native security. Nothing changes until each phase is approved._
_These findings are invisible to web-only review._

## Scope
- Inspected: capacitor.config ☐ AndroidManifest ☐ Info.plist ☐ token storage ☐ OAuth ☐ OTA ☐
- Platforms: iOS ☐ Android ☐  | Assumptions: …

## Dev-config-in-production
| Setting | Prod value | Risk | Direction |
|---------|------------|------|-----------|
| server.cleartext | true | plaintext HTTP | false |
| webContentsDebuggingEnabled | true | remote inspection | dev-only |
| server.allowNavigation | ["*"] | bridge on untrusted origin | scope to API |

## Verdict
| Pillar | Crit | High | Med | Worst item |
|--------|------|------|-----|-----------|
| Data | n | n | n | tokens in localStorage |
| Auth/Deep-link | n | n | n | custom-scheme OAuth, no PKCE |
| Network | n | n | n | cleartext enabled |
| WebView | n | n | n | bridge exposed |
| OTA | n | n | n | unsigned channel |

## Findings
| # | Pillar | Location | Gap | Sev | Direction |
|---|--------|----------|-----|-----|-----------|

## Phased burndown
- **Phase 1 — Strip dev config from prod** → `mobile-capacitor-platform`
- **Phase 2 — Secure token storage** → `mobile-capacitor-platform` / `plan-secrets-audit`
- **Phase 3 — Auth & deep-link** → PKCE, App/Universal Links, exported review
- **Phase 4 — WebView & network** → CSP, network_security_config, bridge exposure
- **Phase 5 — OTA governance** → sign channel, store-policy, rollback

## Execution handoff
Re-audit native files after each phase; verify secure storage + deep-links on real devices.
```

---

## Chains with

- **Launch gates** — run with `plan-mobile-readiness` before store submit.
- **`plan-secrets-audit`** — bundle secrets cross-hand.
- **`plan-input-validation`** — deep-link / WebView input validation cross-hand.
- **Execution:** `mobile-capacitor-platform`, `backend-patterns`, `mobile-emulator-test`; UI-layer edge-to-edge and chrome → `enhance-mobile-native-feel`.
- **Verify:** real-device secure storage + deep-link test; no dev config in release build.

> Plan at high effort. Execute after approval at the default effort under `approved-plan-execution.mdc` (no reward hacking, no feature deletion).
