# Gap Register

| Gap ID | Area | Gap Description | Expected | Current Reality | Severity | Development Phase | Recommended Action |
|---|---|---|---|---|---|---|---|
| GAP-001 | Feature | Laboratory/FMS standard logic missing explicit separation | Lab standards as distinct module/mapping | Generalized Framework models only | High | Phase 3 | Clarify with owner if FMS should be a separate app/model or just a generic Framework instance. |
| GAP-002 | Infra | Real file upload missing | Uploads stored in S3/Blob | Local file path/URL string used only | High | Phase 6 | Configure `django-storages` and AWS S3 bucket. |
| GAP-003 | Feature | Notification logic stubbed | Email/WhatsApp triggers on status change | No notification dispatch in views | Medium | Phase 5 | Implement Celery/Redis or simple synchronous email dispatch for reviewer assignments. |
| GAP-004 | UI | Indicator soft-delete / archive | Ability to archive indicators safely | No obvious archive button for indicators | Low | Phase 0 | Add `is_active` toggle to UI. |
| GAP-005 | Infra | Production Database | PostgreSQL connection | SQLite used locally in docker-compose | High | Phase 6 | Add `docker-compose.prod.yml` with postgres service. |
| GAP-006 | Testing | End-to-end regression | Passing CI pipeline | Playwright tests exist but not in CI | Medium | Phase 7 | Setup GitHub Actions for Playwright tests. |
| GAP-007 | Infra | Backup Strategy | DB auto-backup | `exports/db_backups/` exists but empty/manual | Critical | Phase 6 | Add cronjob for pg_dump. |
| GAP-008 | Feature | Action Center persistence | Apply AI changes directly (if desired) | AI outputs just saved as suggestions | Low | Phase 4 | Clarify if advisory-only is strict, or if 1-click apply is desired. |
