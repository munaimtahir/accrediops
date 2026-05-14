# E2E Seed Requirement Analysis

## Background

The previous sprint's E2E tests (`global-setup.cjs`) failed with an `ImportError` because `ProjectEvidenceRequirementDetailView` could not be imported from `apps.api.views.project_evidence_requirements`. This stemmed from an incomplete fix where the class definition was missing or malformed, preventing the module from being loaded correctly by Django during the E2E setup phase. Additionally, the `seed_e2e_state.py` command failed because it expected the "PHC LAB" framework to exist, but it was not being seeded deterministically.

## Investigation and Fixes

1.  **E2E Setup `ImportError`:**
    *   **Issue:** `global-setup.cjs` failed to import `ProjectEvidenceRequirementDetailView`, indicating a problem with the backend view module.
    *   **Root Cause:** The Python file `backend/apps/api/views/project_evidence_requirements.py` was missing the correct class definition for `ProjectEvidenceRequirementDetailView`. Previous edits had inadvertently removed or corrupted it.
    *   **Fix:** The file `backend/apps/api/views/project_evidence_requirements.py` was rewritten to restore the complete and correct class definition for `ProjectEvidenceRequirementDetailView`, ensuring it inherits from `generics.RetrieveUpdateAPIView`, uses standard serializer handling via `get_serializer_class`, and has simplified `get_permissions`. The incorrect import of `ensure_project_viewer_access` was also corrected to `ensure_project_reviewer_access` in `ProjectEvidenceRequirementListView`.

2.  **Seeding Failure (`seed_e2e_state.py`):**
    *   **Issue:** The E2E seed command failed with `CommandError: PHC LAB framework does not exist.`
    *   **Root Cause:** Standard migrations and existing seed commands did not create the "PHC LAB" framework required by the E2E tests. The framework data was not readily available in a committed fixture or script.
    *   **Fix:** A new management command, `backend/apps/frameworks/management/commands/seed_phc_lab_framework.py`, was created. This command is idempotent and seeds the "PHC LAB" framework with representative components (framework, areas, standards, indicators, evidence requirements) using `update_or_create`.
    *   **Integration:** The `seed_e2e_state.py` command was modified to call `seed_phc_lab_framework` at the beginning of its execution, ensuring the framework is always present in a clean database.

3.  **Backend API Approval Fix:**
    *   **Issue:** E2E tests for approving `ProjectEvidenceRequirement`s failed with a 500 error or stale `MISSING` status in a 200 OK response.
    *   **Root Cause:** Debugging revealed that the backend service `update_project_evidence_requirement` was not correctly persisting the `APPROVED` status. Despite the API returning 200 OK, the response data was stale. This was traced to a subtle issue in how the service handled updates, possibly related to the save operation within the transaction.
    *   **Fix:** The `update_project_evidence_requirement` service was modified to explicitly set fields from `validated_data` and was decorated with `@transaction.atomic` to ensure atomic saving. Additionally, the `ProjectEvidenceRequirementDetailView` was refactored to correctly use DRF's default `serializer.save()` mechanism, which implicitly calls the service after validation and permission checks.

## Conclusion

The E2E environment setup is now deterministic, thanks to the creation and integration of `seed_phc_lab_framework.py`. The core backend API logic for approving `ProjectEvidenceRequirement`s has been fixed, and the E2E tests targeting this flow are now passing. The recurring workflow and AI documentation tests remain outstanding, as they were identified as out-of-scope for this sprint's primary fixes.
