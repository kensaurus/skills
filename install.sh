#!/usr/bin/env bash
set -euo pipefail

# Thin wrapper — the Node installer is the SSOT (skills-cursor skip, hooks merge,
# --clean backups). This script exists so `./install.sh` and `cursor-sync` keep working.
#
# Default with no args: Cursor + Claude Code (historical install.sh behavior).
# `node bin/install.mjs` with no args remains Cursor-only.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "kenji: Node.js is required to install." >&2
  exit 1
fi

if [ "$#" -eq 0 ]; then
  exec node "$SCRIPT_DIR/bin/install.mjs" --cursor --claude
fi

exec node "$SCRIPT_DIR/bin/install.mjs" "$@"
