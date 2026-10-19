---
name: protocol-browser-anti-stall
description: >
  playwright-cli guardrail: headed, named -s= sessions, one real action at a
  time, max 4 attempts, then a BLOCKER. Read before browser work, or when
  "the browser is stuck", "playwright hangs", or agents share a browser.
license: MIT
user-invocable: false
---

# Browser Anti-Stall Protocol (playwright-cli)

**Degree of freedom: LOW.** Almost every step is exact. Only "why it
stalled" and the next hypothesis are `[HIGH freedom]`.

This repo drives browsers with **`playwright-cli`**, not the Playwright MCP. The MCP exposes one
browser per server and a persistent profile can only be locked by one process at a time, so
parallel agents on the same repo fight over tabs and profile locks. The CLI gives every agent its
own isolated browser via `-s=<session>`, costs far fewer tokens (no tool schemas or verbose trees
loaded into context), and runs natively in parallel shells.

**Read `references/mcp-to-cli-map.md`** if you encounter old `browser_*` MCP tool calls — it maps
every tool to its CLI command. **Read `references/playwright-session-coordination.md`** before your
first command — session naming, persistent logins (incl. the Google/CDP block), and cleanup.

## How to reason

1. **Observe** — snapshot, screenshot, console, requests, and the session name
2. **Interpret** — stale ref, SPA hydration, pending request, or a real blocker
3. **Classify** — one new-hypothesis retry / 2s sleep-cycle / BLOCKER report
4. **Recover** — one real user action, then look; never `eval` to click

## Worked example

> **Observe:** checkout `click`; URL still `/cart`; console hydration warning; `POST /api/checkout` pending; session `-s=qa-checkout`.
> **Interpret:** SPA not ready + possibly a stale ref — not "the button is missing".
> **Classify:** attempt 2 — `find`/`waitFor` a landmark, fresh `snapshot`, then click. Not `run-code` to submit.
> **Stop at 4:** still stuck → BLOCKER with console + requests + screenshot.

## Self-critique before reporting

- **Headed + `-s=`** — every call; never a shared session name
- **Inspection-only eval** — `eval` / `run-code` never click, type, or submit
- **Evidence before retry** — max 4 attempts, then BLOCKER
- **Right owner** — product QA behavior stays with the calling test/audit skill

---

## Invocation — always this form  [LOW freedom — run exactly]

```bash
PW="npx --yes @playwright/cli@latest"     # portable; survives fnm/nvm version switches
$PW -s=<session> <command> [args]
```

- **`-s=<session>` is mandatory on every call.** Name it after your task or branch
  (`-s=qa-checkout`, `-s=audit-ux-home`). Two agents must never share a session name.
- **Do not rely on a global `npm i -g` install.** Under `fnm`/`nvm` the global prefix is
  per-shell and disappears; `npx` always resolves.
- `--json` / `--raw` are available when you need machine-readable output.

## 0. Manual & headed — never scripted (read first)  [LOW freedom — run exactly]

You are driving a **real, visible browser** to feel what a user feels. A green script proves
nothing about UX — *see the screen* and *watch the logs*.

1. **Headed, always.** The CLI defaults to **headless** — you MUST pass `--headed` on `open`.
   If you cannot see the window, say so rather than proceeding blind.
2. **One real action at a time.** `click`, `type`, `fill`, `select`, `hover`, `press`, `drag`
   exactly as a user would. Never chain a whole flow into one code snippet.
3. **`eval` / `run-code` are inspection-only.** Use them ONLY to *read* state (DOM, computed
   styles, storage, perf) or to wait for an element — never to click, type, navigate, or submit.
   Driving the UI through code bypasses real events and hides the bug you are hunting.
4. **No test files, no runner.** Do not write `*.spec.ts`, run `npx playwright test`, or use
   codegen. You are here to *experience* the flow, not automate past it.
5. **Look after every action.** Fresh `snapshot` + `screenshot` + `console` + `requests`, plus the
   dev-server terminal. Real pain surfaces on screen and in logs, not in an assertion.

## 1. Session lifecycle  [LOW freedom — run exactly]

```bash
$PW -s=qa-checkout open --headed http://localhost:3000    # start (once)
$PW -s=qa-checkout goto http://localhost:3000/cart        # navigate within the session
$PW -s=qa-checkout snapshot                               # get refs
$PW -s=qa-checkout close                                  # end YOUR session when done
$PW list                                                  # see all sessions (status, profile, headed)
$PW close-all                                             # only when you own every session
$PW kill-all                                              # last resort: stale/zombie processes
```

- `open` starts a browser; `goto` navigates an already-open one. Calling `open` twice on the same
  session is wasteful — use `goto`.
- **Close only your own session.** Never `close-all` while another agent may be mid-test.
- Add `--browser chrome|firefox|webkit|msedge`, `--device "iphone 15"`, or `--mobile` on `open`
  when the task calls for it.

## 2. Navigation guard  [LOW freedom — run exactly]

After every `open` / `goto` / `reload`:

1. `snapshot` — confirm the URL changed and the page has content.
2. If blank or unchanged → `sleep 2` → `snapshot` again.
3. **Max 3 cycles (~6s).** Still not loaded → report a blocker (§8) and move on.

Never assume navigation succeeded without a snapshot to confirm it.

## 3. Waiting — there is no `wait` command  [LOW freedom — run exactly]

Playwright **auto-waits** for actionability on `click`/`fill`/`select`, so most explicit waits are
unnecessary. When you genuinely must wait:

| Need | Do this |
|---|---|
| Fixed short pause | `sleep 2` in the shell — **never more than 3s per pause** |
| Wait for text/element | `run-code "async (page) => { await page.getByText('Dashboard').first().waitFor({ timeout: 5000 }); return 'ready'; }"` |
| Wait for something to disappear | `...waitFor({ state: 'hidden', timeout: 5000 })` |
| Poll for content | `find "<text>"` → if no match, `sleep 2` → retry (max 3) |

**Always set an explicit `timeout`** (milliseconds) in `waitFor` — the default 30s is far too long.
Use the incremental pattern instead of one long block:

```
sleep 2 → snapshot → check ↓ not ready
sleep 2 → snapshot → check ↓ not ready
sleep 2 → snapshot → check ↓ still not ready
STOP → report blocker with evidence
```

This handles cold starts, SPA hydration, and slow APIs without ever blocking blindly.

## 4. SPA-specific rules  [LOW freedom — run exactly]

SPAs (React, Next.js, Vue) fire `load` before hydration completes — never trust load events.

- Wait for a **specific UI landmark** that proves the app rendered (`run-code` + `waitFor`, or `find`).
- If a spinner is showing, wait for it to reach `state: 'hidden'` rather than sleeping.

## 5. Anti-loop: max 4 attempts per goal  [LOW freedom — run exactly]

| Attempt | Action |
|---|---|
| 1 | Try the action normally |
| 2 | Alternative approach — re-`snapshot` for a fresh ref, try a CSS selector instead, scroll into view, or `find` the element |
| 3 | Gather evidence: `console` + `requests` |
| 4 | **STOP.** Report what blocked progress, with evidence. |

Never repeat the exact same failing action without new evidence.

**Fresh refs after every state change.** Refs from a stale `snapshot` are invalid after any
navigate/click/fill/hover/key press. Re-`snapshot` before the next interaction. `click` also accepts
a unique CSS selector, which survives state changes better than a ref.

## 6. Evidence before retry  [LOW freedom — run exactly]

When something is not working, gather evidence FIRST, then form a hypothesis:

1. `console` — JS errors, warnings (`console error` to filter by level)
2. `requests` — pending/failed calls; `request <n>` / `response-body <n>` for detail
3. `snapshot` — the actual DOM state, not what you assume
4. `screenshot --filename .playwright-mcp/<name>.png` — visual state

Only retry once you have a new hypothesis grounded in that evidence.

## 7. Timeout budget  [LOW freedom — run exactly]

| Scope | Max time |
|---|---|
| Single interaction (click, fill, select) | 15 seconds |
| Navigation + verification | 30 seconds |
| Multi-page flow | 5 minutes |
| Full session | 15 minutes |

Exceeded? **Skip it** and log `[TIMEOUT] skipped: <step>`. One stuck step must not kill the session.

## 8. Blocker reporting format  [LOW freedom — this shape]

```
BLOCKER:
- Session: [-s= name]
- Page: [current URL]
- Goal: [what I was trying to do]
- Blocked by: [what prevented it]
- Evidence: [console errors / failed requests / screenshot observation]
- Suggestion: [most likely next step or manual action needed]
```

Actionable information beats a silent freeze.

## 9. Artifacts  [LOW freedom — run exactly]

- Screenshots, snapshots, and logs go under **`.playwright-mcp/`** (gitignored):
  `screenshot --filename .playwright-mcp/home-390.png`. Name by route + viewport/step.
- The CLI also auto-writes snapshot `.yml` files to `.playwright-cli/` in the working directory —
  also gitignored, never committed.
- Sweep any stray root-level `*.png` / `*.log` into `.playwright-mcp/` before ending the session.

## 10. Parallel agents  [LOW freedom — run exactly]

Each agent gets its own browser through session isolation:

```bash
# agent A                                  # agent B (simultaneously, no conflict)
$PW -s=audit-ux open --headed …            $PW -s=qa-checkout open --headed …
```

- Never reuse another agent's session name; never `close`/`kill-all` sessions you did not open.
- `list` shows every session with its status, profile, and headed flag — check it before assuming.
- Within one session, multiple tabs are still available (`tab-list`, `tab-new`, `tab-select`,
  `tab-close`); the fresh-refs rule applies after every tab switch.
- Signed-in state is shared through **persistent profiles**, not shared tabs — see
  `references/playwright-session-coordination.md`.
