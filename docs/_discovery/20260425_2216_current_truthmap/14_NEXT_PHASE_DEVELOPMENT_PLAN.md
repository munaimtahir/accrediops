# Next Phase Development Plan

## Phase 0: Stabilization and truth alignment
- **Goal:** Fix broken tests and clarify blockers.
- **Features:** 
  - Fix `pytest` coverage module permission errors locally.
  - Update any outdated documentation if found.
  - Confirm Caddy / production domain routing with owner.

## Phase 1: Core tracker completion (COMPLETED)
- Indicator registry, Dashboard, Indicator detail, Create/Edit exist.

## Phase 2: Evidence closure workflow (COMPLETED)
- Evidence links, Status transitions, Review/Approval exist.

## Phase 3: Laboratory/FMS standards module
- **Goal:** Add and separate the FMS standard set.
- **Features:**
  - Create separate models or explicit domain filters for Lab FMS.
  - Ensure previous frameworks are untainted.
- **Dependencies:** Clarification from owner on data model distinction.

## Phase 4: Action Center
- **Goal:** Harden the AI workflow.
- **Features:**
  - Solidify how `GeneratedOutput` is mapped to final `EvidenceItem` or Indicator notes.
- **Risks:** Over-automation breaking governance rules.

## Phase 5: Reporting and exports (MOSTLY COMPLETED)
- **Goal:** Finish reports.
- **Features:**
  - Readiness report exists. Add Department/domain PDF exports if missing.
  - Email notification triggers for reports.

## Phase 6: Deployment hardening
- **Goal:** Production ready.
- **Features:**
  - Config PostgreSQL in `docker-compose.prod.yml`.
  - Add S3 storage backend for Evidence uploads.
  - Setup DB backup cron.
  - Configure `apk.alshifalab.pk` in Caddy.

## Phase 7: QA automation
- **Goal:** CI/CD integration.
- **Features:**
  - GitHub Actions for `pytest` and Playwright.

---
## Recommended Immediate Next 5 Tasks
1. Verify FMS vs Generic Framework architecture with the owner.
2. Implement S3 Bucket configuration for file uploads.
3. Establish Production Postgres compose file.
4. Integrate email dispatch for Reviewer assignment.
5. Setup GitHub Actions for CI.

**What not to do yet:** Do not rewrite the UI; the Next.js App Router implementation is solid and advanced.
