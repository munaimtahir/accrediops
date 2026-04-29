# Command Log

```bash
# Directory creation
mkdir -p docs/_discovery/20260425_2216_current_truthmap
mkdir -p OUT

# Git Inspection
git status --short
git branch --show-current
git log --oneline -n 5

# Backend Inspection
cd backend && source .venv/bin/activate
python manage.py showmigrations
python manage.py check
pytest --collect-only

# Frontend Inspection
cd frontend
npm run lint (Interrupted due to interactive prompt)

# Search & File Listing
find . -maxdepth 4 -type d | grep -E -v 'node_modules|\.git|\.next|venv|\.venv|__pycache__|coverage|htmlcov|tmp|dist|build' | sort
glob backend/apps/**/models.py
glob backend/apps/**/urls.py
glob frontend/app/**/*.tsx
grep_search "class .*\(models.Model\):" in backend/apps
```

All commands executed successfully (except linting interaction and a pytest coverage folder permission issue which did not block discovery).
