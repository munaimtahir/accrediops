# 03 — Release Risks

## Identified risks
1. **Playwright reseeding risk**
   - `frontend/tests/e2e/global-setup.cjs` seeds E2E users/framework/profile each run.
   - Risk: test data can reappear in production-like DB if e2e is run against live DB without post-run cleanup.
   - Mitigation: strict cleanup pass and post-smoke cleanup are now documented/applied.

2. **Proxy-vs-Django HTTPS policy split**
   - Django deploy checks still warn on `SECURE_HSTS_SECONDS` and `SECURE_SSL_REDIRECT`.
   - Risk: policy split can drift if proxy policy changes.
   - Mitigation: currently enforced at Caddy with strict transport header and HTTPS edge routing.

3. **Shared host topology complexity**
   - Multiple products are hosted on the same Caddy instance.
   - Risk: accidental route overlap or future config drift.
   - Mitigation: PHC domain routes explicitly mapped to AccrediOps reverse-proxy target.

4. **Admin log residue**
   - `django_admin_log` retains 5 historical rows.
   - Risk: low; not user-facing operational data, but not a fully blank historical admin table.
   - Mitigation: classified as retained history, not blocker.
