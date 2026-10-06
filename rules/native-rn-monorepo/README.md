# Native RN-monorepo rules (Cursor)

Drop-in rules for a React Native + Web monorepo where the developer
is on **Linux/Windows (no Mac)** and iOS verification is **CI-only**.

## What's here

| Rule | Auto-attaches when |
|---|---|
| `_project.mdc` | always (`alwaysApply: true`) — declares the no-Mac dev env |
| `native-android.mdc` | `android/**`, `*.kt`, `*.kts`, `*.gradle`, `AndroidManifest.xml` |
| `native-ios.mdc` | `ios/**`, `*.swift`, `*.m`, `*.mm`, `*.h`, `Podfile`, `Info.plist` |
| `react-native-js.mdc` | `src/**/*.{ts,tsx}`, `App.tsx`, `index.{js,ts}`, Metro/Babel configs |
| `web.mdc` | `web/**`, `packages/web/**` |

## Install into a project

```bash
mkdir -p <project>/.cursor/rules
cp ~/skills/rules/native-rn-monorepo/*.mdc <project>/.cursor/rules/
```

Rename the files to match the project's existing naming if needed
(e.g. prefix `rn-monorepo-` to avoid collisions).
Claude Code reads `.claude/rules/*.md` instead of `.cursor/rules/`.
Copy the same files there with a `.md` extension; leave `_project`
without frontmatter so it loads at session start, and translate each
`globs:` line into `paths:` frontmatter so the target-specific rules
load only when a matching file is read.

## Customisation required after install

Open each rule and:

1. Replace path globs to match the actual repo layout (e.g.
   `apps/mobile/android/` instead of `android/` if you use a
   nested-package monorepo).
2. Fill in `<FILL IN>` placeholders in `react-native-js.mdc` (state
   library, networking client, styling approach) and `web.mdc`
   (framework, styling, state).
3. Adjust the iOS workflow filename references in any companion
   commands you also install.

## Why these rules?

Most RN agent guidance assumes the developer can build iOS locally.
This bundle inverts that assumption:

- iOS edits route through CI (`gh workflow run …`) instead of
  Xcode.
- Verification happens via `/rn-verify` (TS + lint + Android Kotlin
  compile) before triggering the expensive macOS runner.
- TestFlight is the install target for iOS — there's no simulator
  in the dev loop.

This is the cheapest, fastest path for a solo / small-team RN
project that doesn't justify dedicated Mac hardware.

## Companion commands

The matching slash-command bundle lives at
`~/skills/commands/native-rn-monorepo/`. Install both
together for the full workflow.
