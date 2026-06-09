#!/usr/bin/env bash
# Koda/Claude PreToolUse hook: require referenced Dasher tasks to be Testing or Done before git commit.
set -euo pipefail

INPUT=$(cat)
COMMAND=$(HOOK_INPUT="$INPUT" node -e 'try { const payload = JSON.parse(process.env.HOOK_INPUT || "{}"); process.stdout.write(payload.tool_input?.command || ""); } catch { process.stdout.write(""); }')

if ! echo "$COMMAND" | grep -qE '(^|[[:space:]])git[[:space:]]+commit\b'; then
  exit 0
fi

GUARD="/Users/kanjikawanabe/LocalProjects/claude-team-config/scripts/ensure-task-closeout.mjs"
if [ ! -f "$GUARD" ]; then
  exit 0
fi

node "$GUARD" --repo-dir "$CLAUDE_PROJECT_DIR" --command "$COMMAND"
