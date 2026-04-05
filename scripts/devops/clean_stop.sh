#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[accrediops] stopping stack (volumes preserved)..."
docker compose down --remove-orphans
echo "[accrediops] stack stopped."
