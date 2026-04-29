# 22 — Release Test Results

## Results summary
- Backend: **31 passed**
- Frontend unit: **36 passed**
- Playwright: **26 passed**
- Frontend build: **successful**
- Live auth/workflow smoke on PHC: **successful**

## Live smoke highlights
- Pre-login session unauthenticated state returned correctly.
- Login succeeded and authenticated session state returned.
- Project creation and initialization succeeded in smoke run.
- Worklist, recurring, export history, print-bundle endpoints returned valid responses.
- Logout succeeded and session returned unauthenticated.
- Smoke user/project were removed; final core project count remained zero.

## Evidence
- `production_smoke_output.txt`
- `production_smoke_post_cleanup_check.txt`
- `auth_*` and `production_smoke_*` files in `OUT/release_prep/2026-04-08T07-04-17Z/`
