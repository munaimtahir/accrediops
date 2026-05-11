# Implementation Log

## Completed fixes

1. Canonicalized `EvidenceRequirementSuggestion`
   - Added `backend/apps/indicators/migrations/0005_evidencerequirementsuggestion.py`
   - Converted `apps.ai_actions.models.evidence_requirement_suggestion` into a shim re-export

2. Stabilized export readiness
   - Replaced mock placeholder export readiness with requirement-level readiness
   - Kept export blockers deterministic and testable

3. Stabilized print bundle / inspection paths
   - Removed bad prefetch assumptions from `build_print_bundle`
   - Kept inspection/print preview from crashing on incomplete projects

4. Hardened backend tests
   - Fixed `test_evidence_pack` to use a real client profile and the current response contract
   - Kept AI suggestion tests advisory-only

5. Verified frontend and E2E
   - Frontend lint/typecheck/build/vitest passed
   - Playwright executed against live backend/frontend containers

