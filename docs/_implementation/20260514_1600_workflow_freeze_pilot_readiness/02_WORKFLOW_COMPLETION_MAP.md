# Workflow Completion Map

This document maps the full intended accreditation workflow and its current implementation status.

| Workflow Step | Backend Status | Frontend Status | Test Status | Notes |
|---|---|---|---|---|
| Framework setup | Complete | Mostly complete | Complete | Admin UI exists; seeding verified. |
| Framework indicators | Complete | Complete | Complete | Core data model stable. |
| Evidence requirements | Complete | Mostly complete | Complete | Links to indicators stable. |
| Project creation | Complete | Complete | Complete | Standard project lifecycle stable. |
| Project indicators | Complete | Complete | Complete | Mapping framework to project works. |
| Evidence fulfillment | Complete | Complete | Complete | Multi-source support (Upload, Text, URL). |
| AI Draft Promotion | Complete | Complete | Mostly complete | Promoted drafts link to requirements. |
| Evidence review | Complete | Complete | Complete | Validity/Completeness/Approval cycle. |
| Gap creation | Complete | Partial | Mostly complete | Auto-gap on missing/rejected evidence. |
| CAPA creation | Complete | Partial | Complete | Manual CAPA from Gaps works. |
| CAPA closure | Complete | Partial | Mostly complete | Closure lifecycle verified in backend. |
| Recurring evidence | Complete | Complete | Complete | 15/15 E2E tests passing. |
| Readiness calculation | Complete | Complete | Complete | Blockers correctly identified. |
| Inspection preview | Complete | Complete | Mostly complete | UI shows correct data before export. |
| Final ZIP export | Complete | Complete | Complete | Physical ZIP with real data works. |

## Legend
- **Complete**: Feature is fully functional and verified by tests.
- **Mostly complete**: Feature works but has minor UI or edge-case gaps.
- **Partial**: Core logic exists but needs more UI or integration work.
- **Deferred**: Post-pilot feature.
- **Broken**: Known failure.
- **Unknown**: Needs investigation.
