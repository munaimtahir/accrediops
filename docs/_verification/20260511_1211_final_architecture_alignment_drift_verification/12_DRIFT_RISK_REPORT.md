# Drift Risk Report

| Drift Issue | Severity | Evidence | Why It Matters | Required Fix | Blocks Next Sprint? |
|---|---|---|---|---|---|
| Export eligibility is still driven by placeholder readiness data | Critical | `backend/apps/exports/services.py` hard-codes a mock readiness dictionary in `export_eligibility_report` | It can block or misclassify exports independently of real project state | Replace placeholder readiness with real project readiness | Yes |
| Duplicate `EvidenceRequirementSuggestion` model exists in two apps | High | Model appears in both `backend/apps/indicators/models/indicator.py` and `backend/apps/ai_actions/models/evidence_requirement_suggestion.py` | Produces migration drift and conceptual duplication | Consolidate the model into one canonical app | Yes |
| Inspection view still returns 500 in targeted test | High | `test_inspection_view_returns_only_met_indicators` fails with 500 | Read-only inspection cannot be trusted if it errors | Trace and fix the inspection dependency path | Yes |
| Print-pack export returns 403 in targeted test setup | High | `test_print_pack_returns_structured_sections_with_evidence` and `test_evidence_pack_returns_structured_sections_with_enhanced_data` fail with 403 | A ready project cannot reach governed export preview | Fix export gating to use real readiness state | Yes |
| Frontend does not expose requirement-row fulfillment clearly | Medium | Search of frontend finds no `project_evidence_requirements` surface | Users cannot manage the core unit of work directly | Add requirement matrix to indicator/project detail UI | No |
| CAPA remains placeholder-level | Medium | Export/readiness logic includes only placeholder counts/reports | CAPA cannot be counted as operational workflow | Build CAPA workflow in its own sprint | No |
| Final ZIP export is not verified | Medium | Only preview/readiness screens are proven | Inspection-ready delivery may still be incomplete | Build/verify final archive export | No |
| E2E command is environment-blocked | Low | `npm run test:e2e` fails because backend service is not running | Limits end-to-end confidence in this environment | Start backend service or use repo-specific test harness | No |

