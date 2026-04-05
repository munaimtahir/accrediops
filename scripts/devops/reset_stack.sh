#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

REMOVE_IMAGES="${REMOVE_IMAGES:-false}"

echo "[accrediops] resetting stack..."
docker compose down --remove-orphans

if [[ "$REMOVE_IMAGES" == "true" ]]; then
  echo "[accrediops] removing app images..."
  docker compose down --rmi local --remove-orphans
fi

docker compose build
docker compose up -d
docker compose ps
