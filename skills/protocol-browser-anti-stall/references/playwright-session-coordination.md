# playwright-cli sessions, parallel agents & persisted logins

How to run many agents against browsers at once without collisions, and how to stay signed in
across turns — including the Google sign-in wall that blocks every Playwright-launched browser.

## Contents

- 1. One session per agent
- 2. Persistent profiles = persisted logins
- 3. Google sign-in: the one case that needs real Chrome
- 4. Reusing an app login (non-Google)
- 5. Cleanup & recovery
- 6. Dual-identity exploratory sessions (`test-exploratory`)


```bash
PW="npx --yes @playwright/cli@latest"
```

---

## 1. One session per agent

`-s=<name>` is the whole parallelism story. Each name gets its own browser process and its own
storage, so two agents never share tabs, cookies, or a profile lock.

```bash
# agent A                                     # agent B — simultaneously, zero conflict
$PW -s=audit-ux-home open --headed …          $PW -s=qa-checkout open --headed …
```

**Naming:** use the task or branch (`qa-checkout`, `audit-ux-home`, `feat-login-fix`). Never a
generic name like `test` or `default` — that is how two agents collide.

**Rules**

- Never issue commands against a session name you did not open.
- Never `close-all` / `kill-all` while another agent may be working — close only your own session.
- `$PW list` shows every session with status, `user-data-dir`, and headed flag. Check it before
  assuming a session exists.
- `$PW show` opens a dashboard to watch/control live sessions — useful when agents run in the
  background.

**Defaults worth knowing** (verified on `@playwright/cli@0.1.17`):

| Default | Value | Implication |
|---|---|---|
| `user-data-dir` | `<in-memory>` | Nothing persists unless you pass `--persistent --profile` |
| headed | `false` | Pass `--headed` — this repo's protocol requires a visible browser |
| browser | detected Chrome | Override with `--browser chrome\|firefox\|webkit\|msedge` |

---

## 2. Persistent profiles = persisted logins

Sessions are ephemeral by default. To stay signed in across turns and restarts, give the session a
profile directory on disk:

```bash
$PW -s=work open --headed --browser chrome \
    --persistent --profile "$HOME/.playwright-cli-profiles/<account>" \
    https://app.example.com
```

Everything a real browser stores (cookies, localStorage, device trust) survives `close` and
reopening with the same `--profile`.

**Convention:** one directory per account/environment under
`~/.playwright-cli-profiles/<account-or-env>`. Keep profiles **outside the repo** so every project
reuses one login, and so session cookies never land near version control.

**Never point `--profile` at your everyday Chrome profile**
(`%LOCALAPPDATA%\Google\Chrome\User Data`) — it causes lock conflicts, crashes, and policy errors.
Always use a dedicated automation directory.

### Storage-state files (lighter alternative)

For simple cookie/localStorage auth, skip profiles and use state files:

```bash
$PW -s=qa state-save .playwright-mcp/auth/localhost-3000.json   # after logging in
$PW -s=qa state-load .playwright-mcp/auth/localhost-3000.json   # next run
```

Good for local/staging app logins. Weaker than a profile against modern anti-bot checks, and it
does not carry device-trust signals. Treat these files as secrets — `.playwright-mcp/` is gitignored.

---

## 3. Google sign-in: the one case that needs real Chrome

**You cannot log into a Google account from a Playwright-launched browser.** Google detects that
the browser is driven over the Chrome DevTools Protocol and returns:

> This browser or app may not be secure.

There is no user-agent, header, stealth plugin, or flag that gets past it. Do not waste attempts.

### The working sequence (one time per account)

**Step 1 — log in with real Chrome, no automation, no CDP flags:**

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --user-data-dir="C:\Users\<you>\.playwright-cli-profiles\<account>" \
  --no-first-run --no-default-browser-check \
  "https://accounts.google.com/"
```

The **user** signs in by hand, including 2FA. Never ask for or type their password — hand them the
window. Then close Chrome completely so the profile is unlocked and flushed to disk.

**Step 2 — reuse that profile from playwright-cli forever after:**

```bash
$PW -s=gmail open --headed --browser chrome \
    --persistent --profile "$HOME/.playwright-cli-profiles/<account>" \
    https://mail.google.com
$PW -s=gmail snapshot        # already signed in
```

### Rules

- Omit `--remote-debugging-port` during Step 1 — an active CDP endpoint is the thing Google detects.
- Chrome must be **fully closed** before Step 2; two processes cannot hold one profile.
- Re-run Step 1 only if the session actually expires (rare — it persists for months).
- Same pattern works for any provider with aggressive bot detection, not just Google.

---

## 4. Reusing an app login (non-Google)

Goal: sign in once, by hand, and reuse it across `test-playwright`, `test-qa`, `test-red-team`,
`test-exploratory` (authed session only), and audit skills.

1. **Check first.** Open the session on a **protected route** (`/dashboard`, not `/login`) and
   `snapshot`. Already signed in? Skip the rest.
2. **Log in like a user** in the headed window — click, type, submit. Credentials come from
   `.env.test` / README; never paste secrets into chat.
3. **Persist it** — with `--persistent --profile` you are already done. Otherwise `state-save` to
   `.playwright-mcp/auth/<host>.json`.
4. **Do not log out** at the end of a QA/audit run unless logout is the flow under test.

**Production URLs:** ask before saving auth state to disk; default to localhost/staging.

---

## 5. Cleanup & recovery

```bash
$PW -s=<mine> close     # end of your turn — always
$PW list                # what is still running?
$PW close-all           # only if you own every session
$PW kill-all            # stale/zombie processes that `close` will not clear
```

**If a session misbehaves:**

1. `$PW list` — confirm it exists and check `user-data-dir` / headed flag.
2. `snapshot` — see the real state before assuming.
3. Still wedged → `close` that one session and reopen it (cheap, since profiles persist).
4. Zombie processes after a crash → `kill-all`, then reopen.

**If auth is unexpectedly lost:** confirm you passed the same `--profile` path (a typo silently
creates a fresh in-memory session), then re-run the §4 interactive login (step 2) once.

---

## 6. Dual-identity exploratory sessions (`test-exploratory`)

Guest and authed must never share storage. Use three names, three browsers:

| Session | Storage | Do |
|:--------|:--------|:---|
| `-s=explore-guest` | default in-memory — **no** `--profile`, **no** `state-load` | anonymous wander |
| `-s=explore-authed` | `state-load` or dedicated `--profile` under `~/.playwright-cli-profiles/` | seeded test account |
| `-s=explore-post-logout` | fresh in-memory | prove logout cleared cookies / `localStorage` / `sessionStorage` |

`storageState` does **not** persist `sessionStorage` — inspect it in the page after logout. Never
open the guest session with a persistent profile.
