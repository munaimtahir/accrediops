# Staticfiles/admin graphics root cause and fix

## Root cause

1. Backend settings lacked `STATIC_ROOT`, causing collectstatic failure:
   - `ImproperlyConfigured: ... without having set the STATIC_ROOT setting`.
2. With no collected static bundle, admin and DRF assets under `/static/...` returned 404.
3. Domain `/static/*` is proxied to backend; backend needed production static serving readiness.

## Fixes applied

1. Updated backend settings:
   - `STATIC_URL = "/static/"`
   - `STATIC_ROOT = BACKEND_DIR / "staticfiles"`
   - `MEDIA_URL = "/media/"`
   - `MEDIA_ROOT = BACKEND_DIR / "media"`
2. Added static middleware/storage:
   - `whitenoise.middleware.WhiteNoiseMiddleware`
   - `STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"`
3. Added dependency:
   - `whitenoise>=6.7,<7.0` in `backend/requirements.txt`
4. Ran `python3 manage.py collectstatic --noinput`.
5. Restarted backend user service.

## Verification

- `https://ops.alshifalab.pk/static/admin/css/base.css` returns `200`.
- `https://ops.alshifalab.pk/admin/login/` returns `200` and references hashed static assets.

Evidence files:

- `OUT/runtime_verification/2026-04-03T20-35-30Z/collectstatic_output.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/static_asset_checks.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/admin_after_backend_restart_retry.txt`
