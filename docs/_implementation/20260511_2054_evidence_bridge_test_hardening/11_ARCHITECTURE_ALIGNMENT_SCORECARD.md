# Architecture Alignment Scorecard

| Criterion | Status | Evidence | Risk | Recommendation |
|---|---|---|---|---|
| Framework is separate from project | PASS | Framework and project models remain separate | Low | Keep separation |
| Framework indicators are reusable | PASS | `Indicator` remains framework-linked and reusable | Low | Maintain |
| Project indicators are working records, not framework definitions | PASS | `ProjectIndicator` stores runtime status | Low | Maintain |
| EvidenceRequirement is first-class | PASS | Canonical model in `indicators` | Low | Maintain |
| Project fulfillment exists at requirement level | PASS | `ProjectEvidenceRequirement` model and migration exist | Low | Maintain |
| Generated documents link to indicators/requirements | PARTIAL | `DocumentDraft` links to project indicator and fulfillment linkage is present but not universal | Medium | Extend carefully only if needed |
| Uploaded evidence links to indicators/requirements | PASS | `EvidenceItem` has project evidence requirement linkage | Low | Maintain |
| Missing/partial evidence affects readiness | PASS | Readiness service uses requirement-level statuses | Low | Maintain |
| Review/approval is human-governed | PASS | Review actions remain explicit | Low | Maintain |
| AI remains advisory only | PASS | Suggestion state is separate and non-approval | Low | Maintain |
| Physical/site evidence is represented | PASS | Evidence item fields and tests cover physical evidence | Low | Maintain |
| CAPA exists or is clearly documented as pending | NOT IMPLEMENTED | Placeholder only | Medium | Keep honest until modeled |
| Readiness summary uses requirement-level data | PASS | `calculate_project_evidence_readiness` now returns real counts | Low | Maintain |
| Final export/preview uses framework structure | PASS | Print bundle groups by area and standard | Low | Maintain |
| Dynamic standard-wise inspection pack is implemented or planned | PARTIAL | Preview bundle exists; final ZIP export still pending | Medium | Defer to export sprint |
| RBAC/capability checks exist | PASS | Workflow permissions and API guards are present | Low | Maintain |
| Audit trail exists or is documented as pending | PASS | Audit events are logged in export and workflow paths | Low | Maintain |
| Tests cover the evidence bridge | PASS | Targeted backend bridge suite is green | Low | Maintain |
| Frontend exposes the workflow clearly | PARTIAL | Core flows exist, but requirement rows are not yet explicit enough | Medium | Do the frontend alignment sprint next |
| The app has not drifted into a simple SOP generator | PASS | Indicator-first, evidence-based workflow remains intact | Low | Maintain |

