#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:18080}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "== docker compose ps =="
docker compose ps
echo
echo "== health checks =="
curl -fsS "$BASE_URL/health/frontend" | cat
echo
curl -fsS "$BASE_URL/health/backend" | cat
echo
curl -fsS "$BASE_URL/api/health/" | cat
echo
echo "Base URL: $BASE_URL"
