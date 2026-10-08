---
description: "Route to the right UI/UX skill: layout, states, tokens, heuristics, polish, or unification plan"
argument-hint: "[route, component, or symptom]"
disable-model-invocation: true
---

# /uiux

> Discover existing system → detect rogue implementations → fix → validate.

This command is a thin entry point. Pick the right skill for the goal:

**Audit (findings; responsive may then fix)**

- **`audit-responsive`** — linearized mobile layout at every breakpoint; desktop is not a wide phone. Prefer `/responsive-audit` when that is the symptom. Audit-and-fix.
- **`audit-ui-states`** — empty / loading / error / offline / overflow matrix. Read-only.
- **`audit-uiux-design-system`** — token compliance, component modularity, design drift.
- **`audit-ux`** — per-page NN/g heuristics and microcopy. Not cross-page flows.
- **`audit-ux-journeys`** — cross-page stories, IA, findability.
- **`audit-accessibility`** — WCAG 2.2 / axe / keyboard.

**Plan vs apply-now cleanup**

- **`plan-uiux-unification`** — full UI/UX + design-system burndown. No code until approved.
- **`housekeep-design`** — apply-now SSOT migration after an approved plan (or explicit "clean it up now").

**Enhance (apply)**

- **`enhance-readability`** — understood (CPL, Gestalt grouping, deadspace, visuals that cut verbosity). Prefer `/readability` when that is the symptom.
- **`enhance-web-instant-nav`** — Speculation Rules, bfcache, View Transitions, 103 Early Hints. Prefer `/instant-nav` when the first page is fast and the next is slow.
- **`enhance-web-ui`** — composition, hierarchy, spacing, type on an existing product page.
- **`enhance-web-ux`** — flows and semantic data wiring; "this page feels AI-generated".
- **`enhance-web-landing`** — marketing / portfolio greenfield.
- **`enhance-web-redesign`** — existing-site upgrade, preserve behavior.
- **`enhance-web-web3d`** — WebGL / cinematic scroll on an existing site.
- **`enhance-web-forms`** — production-quality forms.
- **`enhance-motion`** — coherent motion pass across an existing app.
- **`design-motion`** — one new isolated animation.
- **`enhance-mobile-native-feel`** — an existing Expo / RN / Capacitor app that feels like a website; one pass.
- **`workflow-mobile-native-uiux`** — the same pass plus accessibility, layout, device QA, and a PR.
- **`mobile-rn-screen`** — React Native screen (Expo / bare).
- **`enhance-capacitor-ui`** — Capacitor / hybrid shell, then the web or RN skill.
- **`enhance-readme`** — repo README showcase.

Native iOS/Android (SwiftUI / Compose, no web layer) is out of scope — use Apple HIG / Material directly.

Use `/uiux` to explicitly trigger UI/UX work. Otherwise, describe the symptom and the right skill auto-fires.
