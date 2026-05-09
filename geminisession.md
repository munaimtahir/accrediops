# Gemini Session Handoff Block - Evidence Pack Builder and Inspection Pack Generator Sprint

This document tracks the detailed plan and progress of the "Evidence Pack Builder and Inspection Pack Generator Sprint". It serves as a handoff block, enabling a new agent to seamlessly take over from the last completed task.

## Current Phase: Phase 4: Backend Evidence Pack Service (Debugging)

**Last Action:** Commented out the `assigned_owner`, `assigned_reviewer`, and `assigned_approver` fields in `backend/apps/exports/services.py` as a diagnostic step to debug a `500 Internal Server Error` in backend tests. The next step is to re-run the tests to see if this resolves the issue.

---

## Sprint Plan - To-Dos

### Phase 0 — OBJECTIVE FIT REPORT
- [x] Create `docs/_implementation/YYYYMMDD_HHMM_evidence_pack_builder_sprint/`
- [x] Create `00_OBJECTIVE_FIT_CHECK.md` and populate it.

### Phase 1 — BASELINE RECHECK AND REMAINING E2E CLEANUP
- [x] Run Backend checks (`python manage.py check`, `python manage.py makemigrations --check --dry-run`).
- [x] Run Frontend checks (`npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`).
- [x] Run Docker checks (`docker compose config`, `docker compose up -d --build`, `docker compose ps`, `curl` health endpoints).
- [x] Run Playwright tests (`npx playwright test`).
- [x] Create `01_BASELINE_RECHECK.md` and populate it with results.
- [x] Fix E2E issue: Admin override reopens MET indicator (`core-journeys.spec.ts`).
- [x] Fix E2E issue: Workflow guidance recurring heading/visibility (`workflow-guidance.spec.ts`).
- [ ] Fix E2E issue: App-flow route timing (this test was found to be passing).
- [ ] Fix E2E issue: Non-admin reopen protection flakiness (found to be resolved by other fixes).
- [x] Re-run Playwright tests to verify fixes (all passed).
- [x] Create `02_REMAINING_E2E_STABILITY_FIXES.md` and populate it with details.

### Phase 2 — EVIDENCE PACK CURRENT STATE AUDIT
- [x] Review current implementation for: Print pack page, Export history, Evidence export APIs, Project indicator readiness data, Evidence model, DocumentDraft model, Draft promotion logic, Framework indicator ordering, Domain/category/standard grouping, File naming support, Existing report/export utilities, Current frontend print/export screens, Current tests around print/export.
- [x] Create `03_CURRENT_EVIDENCE_PACK_AUDIT.md` and populate it with findings.

### Phase 3 — DESIGN TARGET EVIDENCE PACK STRUCTURE
- [x] Create `04_TARGET_EVIDENCE_PACK_DESIGN.md` and define the ideal inspection pack structure as specified.

### Phase 4 — BACKEND EVIDENCE PACK SERVICE
- [x] Understand `DocumentDraft` model (`backend/apps/ai_actions/models/document_draft.py`).
- [x] Enhance `build_print_bundle` in `backend/apps/exports/services.py` to:
    - [x] Include project-level summary data (framework name, client info, date generated, overall readiness score).
    - [x] Fetch `DocumentDraft` objects and categorize as advisory/promoted.
    - [x] Enhance `EvidenceItem` details with reviewer/reviewed_at.
    - [ ] Include indicator-level `assigned_owner`, `assigned_reviewer`, `assigned_approver`. (Currently commented out for debugging)
    - [x] Add `readiness_summary` using `classify_indicator_risk`.
    - [x] Add consolidated lists for missing, partial, AI drafts for review.
    - [x] Re-fetch `project_indicators` within `build_print_bundle` to ensure fresh relationships (fix queryset caching).
- [x] Create `backend/apps/api/tests/test_evidence_pack.py` with comprehensive tests for new functionality.
- [x] Fix `AttributeError` in `test_evidence_pack.py` (caused by `self.now` -> `timezone.now()`).
- [x] Fix `AssertionError: 403 != 200` in `test_evidence_pack.py` (caused by project not being fully eligible; ensure all indicators are MET).
- [x] Fix `AttributeError: 'NoneType' object has no attribute 'get_full_name'` in `backend/apps/exports/services.py` (caused by incorrect `recurring_requirement` access, fixed by changing to `project_indicator.indicator.recurring_requirement`).
- [ ] Debug persistent `AttributeError: 'NoneType' object has no attribute 'get_full_name'` or `500 Internal Server Error` related to `assigned_owner`/`reviewer`/`approver` access in `build_print_bundle`. (Currently at this step: assigned users fields commented out as diagnostic).
- [ ] Create `05_BACKEND_EVIDENCE_PACK_IMPLEMENTATION.md`.

### Phase 5 — FRONTEND INSPECTION PACK UI
- [ ] Implement or complete frontend UI.
- [ ] Create `06_FRONTEND_INSPECTION_PACK_IMPLEMENTATION.md`.

### Phase 6 — EXPORT FORMAT
- [ ] Implement at least one practical export format.
- [ ] Create `07_EXPORT_FORMAT_AND_HISTORY.md`.

### Phase 7 — TESTS
- [ ] Run and add/update tests (Backend, Frontend, Playwright).
- [ ] Create `08_TEST_RESULTS.md`.

### Phase 8 — FINAL WORKFLOW ACCEPTANCE
- [ ] Create `09_WORKFLOW_ACCEPTANCE_CHECK.md`.

### Phase 9 — FINAL VERIFICATION
- [ ] Run final verification steps.
- [ ] Create `10_FINAL_VERIFICATION_RESULTS.md`.

### Phase 10 — FINAL GO/NO-GO VERDICT
- [ ] Create `11_FINAL_GO_NO_GO_VERDICT.md`.

### Phase 11 — NEXT WORK ORDER PROMPT
- [ ] Create `12_NEXT_WORK_ORDER_PROMPT.md`.
