#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[accrediops] building containers..."
docker compose build
echo "[accrediops] starting stack..."
docker compose up -d
echo "[accrediops] current status:"
docker compose ps
