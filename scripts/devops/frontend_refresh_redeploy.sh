#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[accrediops] rebuilding frontend/backend for UI refresh..."
docker compose build frontend backend
docker compose up -d frontend backend caddy

echo "[accrediops] waiting for service readiness..."
sleep 5
./scripts/devops/status_check.sh
