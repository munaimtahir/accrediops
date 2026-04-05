#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "WARNING: This will stop the stack, remove containers, and remove app volumes."
echo "Type EXACTLY 'HARD-RESET-ACCREDIOPS' to continue:"
read -r CONFIRM

if [[ "$CONFIRM" != "HARD-RESET-ACCREDIOPS" ]]; then
  echo "Aborted."
  exit 1
fi

docker compose down --volumes --remove-orphans
docker compose build
docker compose up -d
docker compose ps
