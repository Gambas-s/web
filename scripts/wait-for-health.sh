#!/usr/bin/env bash
# Polls a health URL until it returns HTTP 200 with body containing status:"ok",
# or the timeout elapses.
#
# Usage:
#   scripts/wait-for-health.sh <full-health-url> [interval_seconds] [timeout_seconds]
#
# Defaults: interval=10s, timeout=180s.
# Exit codes: 0 = healthy, 1 = timed out, 2 = usage error.

set -euo pipefail

URL="${1:?usage: $0 <full-health-url> [interval] [timeout]}"
INTERVAL="${2:-10}"
TIMEOUT="${3:-180}"

start=$(date +%s)
attempt=0

while :; do
  attempt=$((attempt + 1))
  elapsed=$(( $(date +%s) - start ))

  if [ "$elapsed" -ge "$TIMEOUT" ]; then
    echo "::error::health check timed out after ${elapsed}s (${attempt} attempts) for ${URL}"
    exit 1
  fi

  response=$(curl -fsS --max-time 5 "$URL" 2>/dev/null || true)
  if [ -n "$response" ] && echo "$response" | grep -qE '"status"[[:space:]]*:[[:space:]]*"ok"'; then
    echo "health check passed after ${elapsed}s (${attempt} attempts)"
    echo "response: ${response}"
    exit 0
  fi

  echo "attempt ${attempt} (${elapsed}s elapsed): not ready, sleeping ${INTERVAL}s..."
  sleep "$INTERVAL"
done
