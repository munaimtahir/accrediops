# 02 — Core Workflow Coverage Plan

## Will this help the final objective?
Yes — it targets test additions toward the business rules that protect the accreditation workflow (RBAC, evidence lifecycle, workflow transitions, and AI advisory-only drafting).

## Command evidence (Phase 2)
Raw outputs saved:
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase2_manage_check.txt`
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase2_makemigrations_check_dryrun.txt`
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase2_pytest_cov.txt` (first run; coverage HTML write failed due to permissions)
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase2_pytest_cov_rerun.txt` (rerun; HTML/XML reports generated)

## Baseline summary (from rerun)
- Backend tests: **124 collected / 124 passed**
- Backend total coverage: **83%**
- Coverage artifacts generated:
  - `backend/htmlcov/` (HTML)
  - `backend/coverage.xml` (XML)

## Coverage plan (value-based)

| File / Area | Current coverage | Missing lines | Objective value | Should test? | Test strategy |
|---|---:|---|---|---|---|
| AI document drafting + promotion service | 67% (`apps/ai_actions/services/document_drafting.py`) | 56-60, 80, 108-123, 153, 155, 161, 179-196, 222, 242, 252, 254, 274-288, branches 311->322, 319 | Priority 1 | Yes | Add tests around: demo-mode generation, provider failure/missing key, versioning rules, project/framework mismatch validation, promotion creates evidence but does **not** mark indicator MET, promotion RBAC via API. |
| Evidence service layer | 62% (`apps/evidence/services.py`) | 31, 33, 94-143, 158, 160, 162 | Priority 1 | Yes | Add tests for create/update/review paths: source_type validation, ownership/reviewer permissions via endpoints, versioning/is_current handling if present, and invalid transitions/inputs. |
| Workflow permission helpers | 89% (`apps/workflow/permissions.py`) | 12-14, 82-83, 86-87 | Priority 1 | Yes | Add unit tests for role checks + assignment enforcement edge cases (unauthenticated, wrong role, admin override). |
| Workflow transitions validator | 78% (`apps/workflow/transitions.py`) | 33 | Priority 1 | Yes | Add a focused test that invalid transition raises `ValidationError` and valid transitions pass. |
| Project init from framework | 85% (`apps/projects/services.py`) | 27-39, 108-123, 208-209 + branches | Priority 1 | Yes | Add tests for idempotent initialization, correct counts, and status change DRAFT→ACTIVE; confirm indicators remain framework-owned, and duplicates are prevented via `get_or_create`. |
| ProjectIndicator lifecycle services | 84% (`apps/indicators/services.py`) | 35, 37, 100, 104, 127-142, 339, etc. | Priority 1 | Yes | Add tests for start/send-for-review/mark-met/reopen rules, required assignments, and “service-only” state mutation enforcement. |
| AI classification service | 85% (`apps/ai_actions/services/classification.py`) | 78, 80, 96, 131-132, 166, 168, 183, 185, 187, 217-218, 236-249, 254 | Priority 1 | Yes | Add tests for missing key/provider failure handling, overwrite protections, review status rules, and logging behavior. |
| Admin API view layer | 66% (`apps/api/views/admin.py`) | many | Priority 2 | Selective | Cover with API tests where it enforces workflow-critical policies (RBAC, draft promotion governance). Avoid chasing exhaustive view-line coverage if logic is delegated to services/serializers. |
| System health endpoints | 38% (`apps/api/views/system.py`) | 17-20, 33-38, 55-86 | Priority 2 | Maybe | Add a minimal smoke test for health endpoints only if used by Docker verification and/or Playwright “System health” journey. |
| User/admin listing endpoints | 47% (`apps/api/views/users.py`) | many | Priority 3 | No | Defer unless they block workflow or are required for RBAC assignment UX. |
| Management commands (seed/reset) | 0% (`apps/projects/management/commands/*`) | all | Priority 2/3 | No (now) | Do not test directly; instead stabilize Playwright by improving E2E seed behavior if needed. |

## Immediate Priority-1 next steps (Phase 3)
1. Add tests for `apps/ai_actions/services/document_drafting.py` (generation safety + governed promotion).
2. Add tests for `apps/evidence/services.py` (create/update/review + validation).
3. Add tests for workflow guards/transitions/permissions to prevent unauthorized lifecycle moves.

