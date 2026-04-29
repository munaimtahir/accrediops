#!/usr/bin/env bash

# AccrediOps Jules Environment Setup
# Purpose:
# - Prepare Python + Node environment for Jules
# - Install backend/frontend dependencies
# - Create safe local env files
# - Keep AI in demo mode
# - Run diagnostics without blocking setup snapshot
#
# Important:
# This script does NOT run destructive reset commands.
# It does NOT modify deployment, Caddy, DNS, SSL, or production routing.

set -u
set -o pipefail

echo "============================================================"
echo "AccrediOps Jules Environment Setup"
echo "============================================================"

ROOT_DIR="$(pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
SETUP_LOG="$ROOT_DIR/jules_setup_diagnostics.log"

echo "Repo root: $ROOT_DIR"
echo "Diagnostics log: $SETUP_LOG"

: > "$SETUP_LOG"

log() {
  echo "$1" | tee -a "$SETUP_LOG"
}

run_required() {
  log ""
  log "==> REQUIRED: $*"
  "$@" 2>&1 | tee -a "$SETUP_LOG"
  local status=${PIPESTATUS[0]}
  if [ "$status" -ne 0 ]; then
    log "ERROR: Required command failed: $*"
    exit "$status"
  fi
}

run_optional() {
  log ""
  log "==> DIAGNOSTIC ONLY: $*"
  "$@" 2>&1 | tee -a "$SETUP_LOG"
  local status=${PIPESTATUS[0]}
  if [ "$status" -ne 0 ]; then
    log "WARNING: Diagnostic command failed but setup will continue: $*"
  else
    log "OK: $*"
  fi
}

# ------------------------------------------------------------
# 1. Repository structure check
# ------------------------------------------------------------

log ""
log "==> Checking repository structure..."

if [ ! -d "$BACKEND_DIR" ]; then
  log "ERROR: backend/ directory not found. Run this script from repo root."
  exit 1
fi

if [ ! -f "$BACKEND_DIR/manage.py" ]; then
  log "ERROR: backend/manage.py not found. Expected Django backend."
  exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
  log "WARNING: frontend/ directory not found. Backend setup will continue."
fi

log "Repository structure looks valid."

# ------------------------------------------------------------
# 2. Tool versions
# ------------------------------------------------------------

log ""
log "==> Tool versions"

run_optional python3 --version
run_optional python --version
run_optional node --version
run_optional npm --version
run_optional git --version

PYTHON_BIN="$(command -v python3 || command -v python || true)"

if [ -z "$PYTHON_BIN" ]; then
  log "ERROR: Python not found."
  exit 1
fi

# ------------------------------------------------------------
# 3. Python virtual environment
# ------------------------------------------------------------

log ""
log "==> Setting up Python virtual environment..."

cd "$ROOT_DIR"

if [ ! -d ".venv" ]; then
  run_required "$PYTHON_BIN" -m venv .venv
else
  log ".venv already exists; reusing it."
fi

# shellcheck disable=SC1091
source "$ROOT_DIR/.venv/bin/activate"

run_required python -m pip install --upgrade pip setuptools wheel

# ------------------------------------------------------------
# 4. Backend dependencies
# ------------------------------------------------------------

log ""
log "==> Installing backend dependencies..."

if [ -f "$BACKEND_DIR/requirements.txt" ]; then
  run_required pip install -r "$BACKEND_DIR/requirements.txt"
elif [ -f "$ROOT_DIR/requirements.txt" ]; then
  run_required pip install -r "$ROOT_DIR/requirements.txt"
elif [ -f "$BACKEND_DIR/pyproject.toml" ]; then
  run_required pip install -e "$BACKEND_DIR"
elif [ -f "$ROOT_DIR/pyproject.toml" ]; then
  run_required pip install -e "$ROOT_DIR"
else
  log "WARNING: No requirements.txt or pyproject.toml found."
  log "Installing common Django development dependencies."
  run_required pip install django djangorestframework pytest pytest-django python-dotenv
fi

# ------------------------------------------------------------
# 5. Safe backend .env
# ------------------------------------------------------------

log ""
log "==> Preparing safe backend .env..."

BACKEND_ENV="$BACKEND_DIR/.env"

if [ ! -f "$BACKEND_ENV" ]; then
  if [ -f "$BACKEND_DIR/.env.example" ]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_ENV"
    log "Created backend/.env from backend/.env.example"
  elif [ -f "$ROOT_DIR/.env.example" ]; then
    cp "$ROOT_DIR/.env.example" "$BACKEND_ENV"
    log "Created backend/.env from root .env.example"
  else
    touch "$BACKEND_ENV"
    log "Created empty backend/.env"
  fi
else
  log "backend/.env already exists; preserving it."
fi

append_env_if_missing() {
  local key="$1"
  local value="$2"

  if ! grep -q "^${key}=" "$BACKEND_ENV"; then
    echo "${key}=${value}" >> "$BACKEND_ENV"
    log "Added ${key} to backend/.env"
  else
    log "${key} already exists; preserving existing value."
  fi
}

append_env_if_missing "DEBUG" "true"
append_env_if_missing "DJANGO_DEBUG" "true"
append_env_if_missing "SECRET_KEY" "jules-local-dev-secret-key-not-for-production"
append_env_if_missing "DJANGO_SECRET_KEY" "jules-local-dev-secret-key-not-for-production"
append_env_if_missing "ALLOWED_HOSTS" "localhost,127.0.0.1,0.0.0.0"
append_env_if_missing "CSRF_TRUSTED_ORIGINS" "http://localhost:3000,http://127.0.0.1:3000"
append_env_if_missing "AI_DEMO_MODE" "true"
append_env_if_missing "AI_PROVIDER" "gemini"
append_env_if_missing "AI_MODEL" "gemini-2.5-flash"
append_env_if_missing "GEMINI_API_KEY" "jules-demo-key-not-real"

# Export safe values for current shell too
export DEBUG=true
export DJANGO_DEBUG=true
export SECRET_KEY="jules-local-dev-secret-key-not-for-production"
export DJANGO_SECRET_KEY="jules-local-dev-secret-key-not-for-production"
export AI_DEMO_MODE=true
export AI_PROVIDER=gemini
export AI_MODEL=gemini-2.5-flash
export GEMINI_API_KEY="jules-demo-key-not-real"

# ------------------------------------------------------------
# 6. Backend diagnostics
# These are intentionally non-fatal because the repo may currently
# contain syntax/import errors that Jules is being asked to repair.
# ------------------------------------------------------------

log ""
log "==> Backend diagnostic checks..."

cd "$BACKEND_DIR"

compile_if_exists() {
  local file="$1"
  if [ -f "$file" ]; then
    run_optional python -m py_compile "$file"
  else
    log "Skipping missing file: $file"
  fi
}

compile_if_exists "apps/api/views/projects.py"
compile_if_exists "apps/api/views/project_indicators.py"
compile_if_exists "apps/api/urls.py"
compile_if_exists "apps/api/serializers/admin.py"
compile_if_exists "apps/ai_actions/services/document_drafting.py"

run_optional python manage.py check
run_optional python manage.py makemigrations --check --dry-run

# Do NOT run destructive cleanup.
log ""
log "Safety note:"
log "This setup does NOT run reset_lab_state --confirm."
log "Only run reset_lab_state manually after reviewing --dry-run."

# Optional migration attempt.
# Non-fatal because database configuration may differ in Jules.
run_optional python manage.py migrate --noinput

# Targeted tests as diagnostics only
if command -v pytest >/dev/null 2>&1; then
  [ -f "apps/api/tests/test_indicator_classification.py" ] && run_optional pytest apps/api/tests/test_indicator_classification.py -q
  [ -f "apps/api/tests/test_frameworks_api.py" ] && run_optional pytest apps/api/tests/test_frameworks_api.py -q
  [ -f "apps/api/tests/test_ai_generation_gemini.py" ] && run_optional pytest apps/api/tests/test_ai_generation_gemini.py -q
  [ -f "apps/api/tests/test_document_drafting.py" ] && run_optional pytest apps/api/tests/test_document_drafting.py -q
else
  log "pytest not available; skipping backend tests."
fi

# ------------------------------------------------------------
# 7. Frontend setup
# ------------------------------------------------------------

if [ -d "$FRONTEND_DIR" ]; then
  log ""
  log "==> Setting up frontend..."

  cd "$FRONTEND_DIR"

  if ! command -v node >/dev/null 2>&1; then
    log "ERROR: Node.js is not available."
    exit 1
  fi

  if ! command -v npm >/dev/null 2>&1; then
    log "ERROR: npm is not available."
    exit 1
  fi

  log "Node: $(node --version)"
  log "npm: $(npm --version)"

  FRONTEND_ENV="$FRONTEND_DIR/.env.local"

  if [ ! -f "$FRONTEND_ENV" ]; then
    if [ -f "$FRONTEND_DIR/.env.example" ]; then
      cp "$FRONTEND_DIR/.env.example" "$FRONTEND_ENV"
      log "Created frontend/.env.local from frontend/.env.example"
    else
      cat > "$FRONTEND_ENV" <<'EOF'
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_APP_ENV=jules
EOF
      log "Created basic frontend/.env.local"
    fi
  else
    log "frontend/.env.local already exists; preserving it."
  fi

  if [ -f "package-lock.json" ]; then
    run_required npm ci
  else
    run_required npm install
  fi

  # Frontend build is diagnostic only because backend schema may be mid-repair.
  run_optional npm run build

  if npm run | grep -qE " test"; then
    run_optional npm test -- --run
  else
    log "No npm test script detected; skipping frontend tests."
  fi
else
  log ""
  log "frontend/ directory missing; skipped frontend setup."
fi

# ------------------------------------------------------------
# 8. Final instructions
# ------------------------------------------------------------

cd "$ROOT_DIR"

log ""
log "============================================================"
log "Jules setup finished."
log "============================================================"
log ""
log "Diagnostics saved to:"
log "$SETUP_LOG"
log ""
log "Next recommended Jules repair commands:"
log ""
log "source .venv/bin/activate"
log "cd backend"
log "python -m py_compile apps/api/views/projects.py"
log "python -m py_compile apps/api/views/project_indicators.py"
log "python -m py_compile apps/api/urls.py"
log "python -m py_compile apps/api/serializers/admin.py"
log "python manage.py check"
log ""
log "After backend import/syntax health is restored:"
log "python manage.py makemigrations --check --dry-run"
log "pytest -q"
log "cd ../frontend && npm run build"
log ""
log "Reminder:"
log "- Keep AI_DEMO_MODE=true in Jules."
log "- Do not touch DNS/Caddy/deployment."
log "- Do not run destructive reset commands without dry-run review."
