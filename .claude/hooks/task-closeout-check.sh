#!/usr/bin/env bash
# Koda/Claude PreToolUse hook: require referenced Dasher tasks to be Testing or Done before git commit.
set -euo pipefail

INPUT=$(cat)
# Pure-bash pre-filter before anything that can fail: with onFailure: block, a missing or
# broken node would otherwise block every Bash call. Only input naming both git and commit
# (a superset of every commit form, even git<TAB>commit, which is 	 in the JSON) goes on.
if [[ "$INPUT" != *git* || "$INPUT" != *commit* ]]; then
  exit 0
fi
COMMAND=$(HOOK_INPUT="$INPUT" node -e 'try { const payload = JSON.parse(process.env.HOOK_INPUT || "{}"); process.stdout.write(payload.tool_input?.command || ""); } catch { process.stdout.write(""); }')

# A bash pattern, not an echo | grep -q pipeline: under pipefail an early grep exit can
# fail the pipeline, and with onFailure: block a spurious failure would block every Bash call.
COMMIT_RE='(^|[[:space:]])git[[:space:]]+commit([^[:alnum:]_-]|$)'
if [[ ! "$COMMAND" =~ $COMMIT_RE ]]; then
  exit 0
fi

GUARD="/Users/kanjikawanabe/LocalProjects/claude-team-config/scripts/ensure-task-closeout.mjs"
if [ ! -f "$GUARD" ]; then
  echo "task-closeout: guard not installed at $GUARD; commit not checked" >&2
  exit 0
fi

node "$GUARD" --repo-dir "$CLAUDE_PROJECT_DIR" --command "$COMMAND"
