# Playwright MCP → playwright-cli command map

This repo migrated off the Playwright **MCP** (one browser per server, single profile lock, heavy
tool schemas in context) to the **CLI** (`npx --yes @playwright/cli@latest`), which gives every
agent its own isolated browser via `-s=<session>`.

## Contents

- Core actions
- Waiting
- Evidence & inspection
- Tabs
- Storage, auth & network control
- Session management (the parallelism fix)
- Concepts that no longer apply
- Gotchas


Every command below assumes:

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=<session> <command> [args]
```

Verified against `@playwright/cli@0.1.17`.

---

## Core actions

| Old MCP tool | CLI command | Notes |
|---|---|---|
| `browser_navigate({ url })` | `open --headed <url>` (first) / `goto <url>` (after) | CLI is **headless by default** — pass `--headed` on `open` |
| `browser_navigate_back` | `go-back` | also `go-forward`, `reload` |
| `browser_snapshot` | `snapshot [target]` | returns refs; auto-saves a `.yml` under `.playwright-cli/` |
| `browser_find` | `find "<text>"` | `--regex` for patterns; returns matching nodes with refs |
| `browser_click({ ref })` | `click <target> [button]` | `<target>` = ref **or a unique CSS selector**; `--modifiers` supported |
| `browser_type({ text })` | `type <text>` | types into the focused editable element |
| `browser_fill_form` | `fill <target> <text>` | one field at a time (matches "one real action" rule) |
| `browser_select_option` | `select <target> <value>` | |
| `browser_hover` | `hover <target>` | |
| `browser_press_key` | `press <key>` | e.g. `press enter`, `press arrowleft`; also `keydown`/`keyup` |
| `browser_drag` | `drag <startTarget> <endTarget>` | |
| `browser_drop` | `drop <target>` | |
| `browser_file_upload` | `upload <file>` | |
| `browser_handle_dialog` | `dialog-accept [prompt]` / `dialog-dismiss` | |
| `browser_resize` | `resize <w> <h>` | or `open --device "iphone 15"` / `--mobile` |
| `browser_close` | `close` | closes **your** session only |
| *(no equivalent)* | `check` / `uncheck` | checkbox and radio helpers |
| *(no equivalent)* | `dblclick` | |

## Waiting

| Old MCP tool | CLI replacement |
|---|---|
| `browser_wait_for({ time: 2 })` | `sleep 2` in the shell (**≤3s per pause**) |
| `browser_wait_for({ text, timeout })` | `run-code "async (page) => { await page.getByText('<text>').first().waitFor({ timeout: 5000 }); return 'ready'; }"` |
| `browser_wait_for({ textGone, timeout })` | same, with `waitFor({ state: 'hidden', timeout: 5000 })` |

There is **no `wait` command**. Playwright auto-waits for actionability on `click`/`fill`/`select`,
so most explicit waits are unnecessary. Always set an explicit `timeout` when you do wait.

## Evidence & inspection

| Old MCP tool | CLI command | Notes |
|---|---|---|
| `browser_console_messages` | `console [min-level]` | e.g. `console error` |
| `browser_network_requests` | `requests` | numbered list |
| `browser_network_request` | `request <index>` | plus `request-headers`, `request-body`, `response-headers`, `response-body` |
| `browser_take_screenshot({ filename })` | `screenshot --filename .playwright-mcp/<name>.png` | `--full-page`, `--hires` available |
| `browser_evaluate` | `eval <func> [target]` | **read-only** per the protocol |
| `browser_run_code_unsafe` | `run-code "<code>"` | **read-only / waits only** per the protocol |
| *(no equivalent)* | `pdf` | save page as PDF |

## Tabs

| Old MCP tool | CLI command |
|---|---|
| `browser_tabs({ action: "list" })` | `tab-list` |
| `browser_tabs({ action: "new" })` | `tab-new [url]` |
| `browser_tabs({ action: "select", index })` | `tab-select <index>` |
| `browser_tabs({ action: "close", index })` | `tab-close [index]` |

## Storage, auth & network control

| Need | CLI command |
|---|---|
| Save auth state | `state-save [filename]` |
| Restore auth state | `state-load <filename>` |
| Cookies | `cookie-list`, `cookie-get`, `cookie-set`, `cookie-delete`, `cookie-clear` |
| localStorage | `localstorage-list/get/set/delete/clear` |
| sessionStorage | `sessionstorage-list/get/set/delete/clear` |
| Mock a request | `route <pattern>`, `route-list`, `unroute [pattern]` |
| Offline testing | `network-state-set offline` (or `online`) |

## Session management (the parallelism fix)

| Need | CLI command |
|---|---|
| Isolated browser per agent | `-s=<unique-name>` on every call |
| See all sessions | `list` (`--all` across workspaces) |
| Close every session | `close-all` — only when you own them all |
| Kill zombies | `kill-all` |
| Persistent login profile | `open --persistent --profile <dir>` |
| Visual dashboard of live sessions | `show` |
| Attach to an already-running browser | `attach [name]` / `detach` |

## Concepts that no longer apply

| Old concept | Why it's gone |
|---|---|
| `browser_lock` / unlock (cursor-ide-browser MCP) | No shared browser to lock — sessions are isolated |
| Tab-claiming etiquette across agents | Each agent opens its own session instead |
| `session.json` auth-tab pointer | Auth lives in a persistent **profile directory** |
| `--isolated` storage-state injection dance | Persistent profiles are the default path for auth |
| Headed-by-default assumption | CLI is headless by default — pass `--headed` explicitly |

## Gotchas

- **`npm i -g` is unreliable under `fnm`/`nvm`** (per-shell global prefix). Always use `npx --yes @playwright/cli@latest`.
- **Never log into Google from a Playwright-launched browser** — it is blocked at the CDP layer.
  See `playwright-session-coordination.md` for the real-Chrome workaround.
- Snapshot `.yml` artifacts land in `.playwright-cli/`; screenshots should be directed to
  `.playwright-mcp/` with `--filename`. Both are gitignored.
