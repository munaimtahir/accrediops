# Remaining Gaps

## GAP-CL-001 — ESLint warnings remain
- Category: Lint gap
- Severity: Low
- Evidence: `_frontend_lint_output.txt` shows 9 warnings (0 errors), exit 0.
- Affected files: (from lint output)
  - `frontend/components/screens/admin-frameworks-screen.tsx`
  - `frontend/components/screens/indicator-drawer.tsx`
  - `frontend/components/screens/project-worklist-screen.tsx`
  - `frontend/components/screens/project-workspace-board.tsx`
- Recommended fix: Address unused vars and hook dependency warnings (no behavior change expected).
- Suggested verification command: `cd frontend && npm run lint`
- Blocks full GO? No

## GAP-CL-002 — Contract check is structural, not route-diff aware
- Category: Contract gap
- Severity: Medium
- Evidence: `03_CONTRACT_COMPLETENESS_CHECK.md` limitation section.
- Affected files: `scripts/check_contract_docs.py`
- Recommended fix: Enhance checker to compare documented API routes against `backend/apps/api/urls.py` (and/or OpenAPI) and FE routes against Next route list.
- Suggested verification command: `python3 scripts/check_contract_docs.py`
- Blocks full GO? No (current gate meets “not empty / no placeholders” requirement)

## GAP-CL-003 — Data field contract not comprehensive
- Category: Contract gap
- Severity: Medium
- Evidence: `02_CONTRACT_FILES_REVIEW.md` marks `05_DATA_FIELD_CONTRACT.md` as PARTIAL.
- Affected files: `docs/_contracts/20260430_2003_frontend_backend_contract_update/05_DATA_FIELD_CONTRACT.md`
- Recommended fix: Extend to cover key API payload fields used by major screens (projects, indicators, evidence, queue rows).
- Suggested verification command: `python3 scripts/check_contract_docs.py`
- Blocks full GO? No

## GAP-CL-004 — Frontend npm audit reports vulnerabilities
- Category: Package/dependency gap
- Severity: Medium
- Evidence: `_npm_audit_output.txt` reports 2 moderate vulnerabilities (postcss via next dependency); exit 1.
- Affected files: `frontend/package-lock.json`
- Recommended fix: Evaluate safe dependency upgrade path (avoid breaking downgrade suggested by `npm audit fix --force`).
- Suggested verification command: `cd frontend && npm audit --omit=dev`
- Blocks full GO? No (but should be tracked)

## GAP-CL-005 — Reset command test gap (from foundation verification)
- Category: Test gap
- Severity: Medium
- Evidence: Prior pack `docs/_verification/20260501_0819_final_foundation_verification/` documented missing/limited tests around reset safety.
- Affected files: `backend/apps/projects/management/commands/reset_lab_state.py` (and missing tests if still absent)
- Recommended fix: Add/strengthen `backend/apps/projects/tests/test_reset_lab_state.py` covering dry-run/confirm safety.
- Suggested verification command: `cd backend && pytest backend/apps/projects/tests/test_reset_lab_state.py`
- Blocks full GO? No (for this contract/lint/build scope), but blocks full “foundation hardening” confidence.
