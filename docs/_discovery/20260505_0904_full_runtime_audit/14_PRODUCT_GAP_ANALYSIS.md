# Product Gap Analysis

| Intended capability | Current status | Evidence found | Gap | Priority | Recommended next step |
|---|---|---|---|---|---|
| Framework-level indicator templates | COMPLETE | `Framework`, `Indicator` models | None | Low | - |
| Project linked to framework | COMPLETE | `ProjectIndicator` model | None | Low | - |
| Project-specific working indicator records | COMPLETE | `ProjectIndicator` model | None | Low | - |
| Evidence status tracking | COMPLETE | `EvidenceItem` model | None | Low | - |
| Evidence links/uploads | COMPLETE | `EvidenceItem` model | None | Low | - |
| Owner assignment | COMPLETE | `ProjectIndicator.owner` field | None | Low | - |
| Reviewer/approver workflow | COMPLETE | `workflow` app | None | Low | - |
| Status history | COMPLETE | `ProjectIndicatorStatusHistory` | None | Low | - |
| Comments/notes | COMPLETE | `ProjectIndicatorComment` | None | Low | - |
| AI classification | COMPLETE | `ai_actions` app | None | Low | - |
| AI document drafting | COMPLETE | `DocumentDraft` model | None | Low | - |
| AI usage log | COMPLETE | `AIUsageLog` model | None | Low | - |
| Master data management | COMPLETE | `MasterValue` model | None | Low | - |
| Policy decisions stored in DB | COMPLETE | `PolicyDecision` model | None | Low | - |
| Dashboard summary | COMPLETE | `dashboard.py` view | None | Low | - |
| Reports/exports | COMPLETE | `ExportJob` model | None | Low | - |
| Health checks | COMPLETE | `/api/system/health/` | None | Low | - |
| RBAC | COMPLETE | custom permissions | None | Low | - |
| Playwright coverage | COMPLETE | `tests/e2e/` folder | None | Low | - |
| Deployment readiness | PARTIAL | `docker-compose.yml` | Frontend build occurs at runtime, tests hang | High | Stabilize Docker setup, mock AI tests |

## Analysis
The core functionality is complete. The application possesses all the structural requirements to serve as an accreditation workbench. The only gaps relate to infrastructure optimization and test suite robustness (specifically AI test timeouts).
