#!/usr/bin/env bash
# ============================================================
# Cursor Helper Aliases & Functions
# Add to ~/.bashrc or ~/.zshrc:
#   source ~/skills/shell-aliases/cursor-helpers.sh
# ============================================================

# --- Skill Management ---

# Create a new skill
newskill() {
  local name="$1"
  if [ -z "$name" ]; then
    echo "Usage: newskill <skill-name>"
    return 1
  fi
  mkdir -p ~/.cursor/skills/"$name"
  cat > ~/.cursor/skills/"$name"/SKILL.md << EOF
---
name: $name
description: [Description with trigger keywords]
---

# $(echo "$name" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')

## CRITICAL: Check Existing First

**Before ANY action, verify:**
\`\`\`bash
# Check for existing patterns
\`\`\`

## Core Content

[Your skill content here]

## Validation

After using this skill:
1. **Check 1** → What to verify
EOF
  echo "Created skill: ~/.cursor/skills/$name/SKILL.md"
  ${EDITOR:-cursor} ~/.cursor/skills/"$name"/SKILL.md
}

# List all installed skills
lsskills() {
  echo "=== Global Skills (Kenji-curated) ==="
  ls -1 ~/.cursor/skills/ 2>/dev/null | while read d; do
    case "$d" in thirdparty-*) continue ;; esac
    if [ -f ~/.cursor/skills/"$d"/SKILL.md ]; then
      desc=$(grep "^description:" ~/.cursor/skills/"$d"/SKILL.md | head -1 | sed 's/description: //')
      printf "  %-35s %s\n" "$d" "${desc:0:60}"
    fi
  done

  echo ""
  echo "=== Global Skills (third-party, upstream-maintained) ==="
  ls -1 ~/.cursor/skills/ 2>/dev/null | while read d; do
    case "$d" in thirdparty-*) ;; *) continue ;; esac
    if [ -f ~/.cursor/skills/"$d"/SKILL.md ]; then
      desc=$(grep "^description:" ~/.cursor/skills/"$d"/SKILL.md | head -1 | sed 's/description: //')
      printf "  %-35s %s\n" "$d" "${desc:0:60}"
    fi
  done
  
  if [ -d .cursor/skills ]; then
    echo ""
    echo "=== Project Skills ==="
    ls -1 .cursor/skills/ 2>/dev/null | while read d; do
      if [ -f .cursor/skills/"$d"/SKILL.md ]; then
        printf "  %s\n" "$d"
      fi
    done
  fi
}

# --- Sync ---

# Sync skills from the kensaurus/skills repo (cursor-kenji before 2.0.0)
cursor-sync() {
  local repo_dir="${KENJI_SKILLS_DIR:-${CURSOR_KENJI_DIR:-}}"
  if [ -z "$repo_dir" ]; then
    for candidate in \
      "$HOME/Documents/GitHub/skills" \
      "$HOME/skills" \
      "$HOME/Documents/GitHub/cursor-kenji" \
      "$HOME/cursor-kenji" \
      "$HOME/cursor_kenji"; do
      if [ -d "$candidate" ]; then
        repo_dir="$candidate"
        break
      fi
    done
  fi
  if [ -z "$repo_dir" ] || [ ! -d "$repo_dir" ]; then
    echo "kensaurus/skills repo not found. Set KENJI_SKILLS_DIR or clone to ~/Documents/GitHub/skills"
    return 1
  fi
  cd "$repo_dir" && git pull origin main && node ./bin/install.mjs --cursor --claude --quiet
  cd - > /dev/null
  echo "Skills synced."
}

# --- Development ---

# Open Cursor with Chrome DevTools ready
cursor-dev() {
  google-chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check &>/dev/null &
  sleep 1
  cursor "${@:-.}"
}

# Quick project rule creation
newrule() {
  local name="$1"
  if [ -z "$name" ]; then
    echo "Usage: newrule <rule-name>"
    return 1
  fi
  mkdir -p .cursor/rules
  cat > .cursor/rules/"$name".mdc << EOF
---
description: [When should this rule apply?]
globs: "**/*.ts,**/*.tsx"
alwaysApply: false
---

# $name

[Rule content here]
EOF
  echo "Created rule: .cursor/rules/$name.mdc"
  ${EDITOR:-cursor} .cursor/rules/"$name".mdc
}

# Quick subagent creation
newagent() {
  local name="$1"
  if [ -z "$name" ]; then
    echo "Usage: newagent <agent-name>"
    return 1
  fi
  mkdir -p .cursor/agents
  cat > .cursor/agents/"$name".md << EOF
---
name: $name
description: [What this agent does and when to use it]
---

You are a specialist in [domain].

## When Invoked
1. [First action]
2. [Second action]

## Process
[Detailed instructions]

## Output Format
[Expected output structure]
EOF
  echo "Created agent: .cursor/agents/$name.md"
  ${EDITOR:-cursor} .cursor/agents/"$name".md
}

# --- Git Shortcuts ---

# Conventional commit shortcut
gc() {
  local type="$1"
  local msg="$2"
  if [ -z "$type" ] || [ -z "$msg" ]; then
    echo "Usage: gc <type> <message>"
    echo "Types: feat fix docs style refactor perf test chore ci"
    return 1
  fi
  git add -A && git commit -m "$type: $msg"
}

# Quick push to current branch
gp() {
  git push origin "$(git branch --show-current)"
}

# --- Info ---
echo "Cursor helpers loaded. Commands: newskill, lsskills, cursor-sync, cursor-dev, newrule, newagent, gc, gp"
