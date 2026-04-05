#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:18080}"
FAILED=0

check_ok() {
  local name="$1"
  local url="$2"
  if curl -fsS "$url" >/dev/null 2>&1; then
    echo "[PASS] $name -> $url"
  else
    echo "[FAIL] $name -> $url"
    FAILED=1
  fi
}

check_status() {
  local name="$1"
  local url="$2"
  shift 2
  local status
  status="$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)"
  for expected in "$@"; do
    if [[ "$status" == "$expected" ]]; then
      echo "[PASS] $name -> $url (status $status)"
      return 0
    fi
  done
  echo "[FAIL] $name -> $url (status $status; expected one of: $*)"
  FAILED=1
}

check_ok "frontend root" "$BASE_URL/"
check_ok "frontend health" "$BASE_URL/health/frontend"
check_ok "backend health (proxy)" "$BASE_URL/health/backend"
check_ok "backend health (api)" "$BASE_URL/api/health/"
check_ok "projects page" "$BASE_URL/projects"
check_status "api auth session endpoint" "$BASE_URL/api/auth/session/" 200 401 403
check_status "api projects endpoint" "$BASE_URL/api/projects/" 200 401 403

if [[ "$FAILED" -eq 0 ]]; then
  echo "Smoke verify: SUCCESS"
  exit 0
fi

echo "Smoke verify: FAILURE"
exit 1
