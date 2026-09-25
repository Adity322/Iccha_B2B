#!/bin/bash
# Triggers the daily retailer-inactivity-deactivation job.
# Meant to be run by the VPS's system crontab (see crontab-setup.txt).
# Also usable directly for local testing: ./deactivate-inactive-retailers-cron.sh

# Load environment variables if this script is run outside a shell that
# already has them. Resolves to the project's .env relative to this script's
# location (scripts/deactivate-inactive-retailers-cron.sh -> ../.env), so it
# works regardless of which directory you run it from.
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

# Reads from .env — falls back to localhost if APP_URL isn't set there,
# so this works out of the box for local testing.
APP_URL="${APP_URL:-http://localhost:3000}"

if [ -z "$CRON_SECRET" ]; then
  echo "ERROR: CRON_SECRET is not set. Check ENV_FILE path or your .env file." >&2
  exit 1
fi

LOG_DIR="$(cd "$(dirname "$0")/.." && pwd)/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_FILE:-$LOG_DIR/deactivate-retailers.log}"

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

RESPONSE=$(curl -s -o /tmp/cron-response.json -w "%{http_code}" \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL}/api/cron/deactivate-inactive-retailers")

echo "[$TIMESTAMP] HTTP $RESPONSE - $(cat /tmp/cron-response.json)" | tee -a "$LOG_FILE"