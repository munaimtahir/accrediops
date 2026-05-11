# Architecture Alignment Scorecard

| Criterion | Status | Evidence | Risk | Recommendation |
|---|---|---|---|---|
| Framework is separate from project | PASS | `frameworks` and `projects` remain separate models and workflows | Low | Keep separation strict. |
| Framework indicators are reusable | PASS | Indicator definitions remain framework-scoped | Low | No change needed. |
| Project indicators are working records, not framework definitions | PASS | `ProjectIndicator` stores project execution state | Low | Preserve this boundary. |
| EvidenceRequirement is first-class | PASS | `EvidenceRequirement` model and CRUD exist | Low | Keep requirement as the central unit of work. |
| Project fulfillment exists at requirement level | PASS | `ProjectEvidenceRequirement` model and lifecycle services exist | Low | Expose this more clearly in UI. |
| Generated documents link to indicators/requirements | PASS | `DocumentDraft.project_evidence_requirement` exists | Medium | Keep linkage explicit in review screens. |
| Uploaded evidence links to indicators/requirements | PASS | `EvidenceItem.project_evidence_requirement` exists | Medium | Surface the linkage in project views. |
| Missing/partial evidence affects readiness | PASS | `validate_project_indicator_readiness` and `project_readiness` use evidence state | Medium | Replace placeholder export gating with real readiness. |
| Review/approval is human-governed | PASS | Owner/reviewer/approver service checks are present | Low | Maintain separation. |
| AI remains advisory only | PASS | AI disclaimer and suggestion models are advisory | Medium | Keep approval paths human-only. |
| Physical/site evidence is represented | PASS | `EvidenceItem` stores physical location, file label, copy availability | Low | Keep these fields visible in export/inspection views. |
| CAPA exists or is clearly documented as pending | NOT IMPLEMENTED | Export/readiness logic only exposes placeholders | High | Plan a dedicated CAPA sprint. |
| Readiness summary uses requirement-level data | PARTIAL | Requirement counts exist, but export eligibility still uses mock readiness | High | Remove placeholder readiness data. |
| Final export/preview uses framework structure | PARTIAL | Print bundle groups by area/standard/indicator | Medium | Finish final archive/export engine. |
| Dynamic standard-wise inspection pack is implemented or planned | PARTIAL | Structured preview exists, final pack is not proven | Medium | Treat as preview until final export is built. |
| RBAC/capability checks exist | PASS | `workflow.permissions` and permissioned views exist | Low | Keep permission boundaries tight. |
| Audit trail exists or is documented as pending | PASS | Audit model and logging services exist | Low | Continue logging bridge actions. |
| Tests cover the evidence bridge | PARTIAL | Backend bridge tests exist, but export/inspection still fail | High | Harden tests around export and inspection. |
| Frontend exposes the workflow clearly | PARTIAL | Worklist/readiness/inspection/print-pack exist, but no explicit requirement matrix | Medium | Add requirement-level UI. |
| The app has not drifted into a simple SOP generator | PASS | Framework/project/evidence bridge is still intact | Medium | Keep evidence and readiness central. |

