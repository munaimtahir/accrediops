# Browser Workflow Verification

Verified via Playwright E2E test suite running against the local Docker environment.

| Journey | PASS/FAIL | Evidence | Notes |
|---|---|---|---|
| Login page loads | PASS | `00_runtime_and_auth.spec.ts` | Initial load verified. |
| Admin login works | PASS | `00_runtime_and_auth.spec.ts` | Seeded `pw_admin` credentials used. |
| Dashboard opens | PASS | `18_simplified_navigation.spec.ts` | Homepage navigation verified. |
| Admin/settings page opens | PASS | `12_admin_surfaces.spec.ts` | Access to admin dashboard confirmed. |
| Framework list opens | PASS | `01_lab_framework_integrity.spec.ts` | List of frameworks retrieved. |
| Framework detail opens | PASS | `01_lab_framework_integrity.spec.ts` | Detail view and analysis verified. |
| Framework indicator list opens | PASS | `01_lab_framework_integrity.spec.ts` | Indicators associated with framework visible. |
| AI Classification page opens | PASS | `20_indicator_classification_workflow.spec.ts` | Classification UI navigable. |
| Project list opens | PASS | `02_project_create_and_initialize.spec.ts` | Projects surface navigable. |
| Project detail opens | PASS | `02_project_create_and_initialize.spec.ts` | Specific project dashboard visible. |
| Project worklist opens | PASS | `04_worklist_core.spec.ts` | Table of project indicators visible. |
| Indicator drawer/detail opens | PASS | `05_indicator_detail_and_actions.spec.ts` | Drawer opens on click. |
| Evidence fields are visible | PASS | `06_evidence_lifecycle.spec.ts` | Evidence management panel verified. |
| Status/action buttons appear | PASS | `13_role_visibility.spec.ts` | Buttons filtered by capabilities. |
| Submit workflow works | PASS | `07_review_and_approval_lifecycle.spec.ts` | Transition to PENDING_REVIEW works. |
| Reviewer/approver workflow works | PASS | `07_review_and_approval_lifecycle.spec.ts` | Transition to MET verified. |
| Document draft page opens | PASS | `09_ai_advisory_non_mutation.spec.ts` | AI drafting UI verified. |
| Promote draft to evidence works | PASS | `06_evidence_lifecycle.spec.ts` | Evidence creation verified. |
| Print pack/export page opens | PASS | `10_readiness_inspection_exports.spec.ts` | Export management screens verified. |
| System health page opens | PASS | `00_runtime_and_auth.spec.ts` | `/healthz` verified at browser level. |

## Conclusion
The browser-level workflows are structurally sound and functionally verified against the core product requirements.
