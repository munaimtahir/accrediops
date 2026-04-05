#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

./scripts/testing/run_backend_tests.sh

cd "$ROOT_DIR/frontend"
npm install
# Compose/dev containers can leave root-owned files in .next on bind mounts.
# Use an isolated local dist dir for host-side checks to avoid permission collisions.
export NEXT_DIST_DIR=".next_local_checks"
rm -rf "$NEXT_DIST_DIR"
mkdir -p "$NEXT_DIST_DIR"
npm run build
npm run test
PLAYWRIGHT_BASE_URL="${PLAYWRIGHT_BASE_URL:-http://127.0.0.1:18080}" npm run test:e2e
