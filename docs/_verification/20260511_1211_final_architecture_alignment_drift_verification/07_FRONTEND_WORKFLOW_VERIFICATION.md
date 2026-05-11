# Frontend Workflow Verification

| Frontend Capability | Screen/File | Status | Risk | Recommendation |
|---|---|---|---|---|
| User can see evidence/worklist workflow for a project | `frontend/components/screens/project-worklist-screen.tsx`, `frontend/components/worklist/*` | PASS | Low | Keep this as the main execution surface. |
| User can see evidence requirements for a framework indicator | `frontend/components/screens/indicator-detail-screen.tsx` | PARTIAL | Medium | Add explicit requirement-row surfaces if the backend bridge is to be operationally obvious. |
| User can create/update evidence requirements if authorized | Frontend hooks/views around indicator admin surfaces | PARTIAL | Medium | Current UI is not clearly centered on requirement CRUD. |
| User can see requirement-level fulfillment rows on project indicator detail | `frontend/components/screens/indicator-detail-screen.tsx` | FAIL | High | Add the requirement matrix to the indicator detail page. |
| User can see requirement status | Worklist/indicator detail | PARTIAL | Medium | Status is visible at indicator level, not clearly at requirement level. |
| User can submit/approve/reject fulfillment if authorized | Indicator actions / review components | PASS | Low | Human-governed action flow is present. |
| User can link generated draft to requirement | Draft review screen | PARTIAL | Medium | Draft review exists, but requirement-level linkage is not obvious in the UI. |
| User can link uploaded evidence to requirement | Evidence screens and hooks | PARTIAL | Medium | Back-end linkage exists; UI is not explicit enough. |
| Readiness summary shows requirement-level counts | `frontend/components/screens/project-readiness-screen.tsx` | PARTIAL | Medium | Show requirement counts and blockers more directly. |
| UI shows missing mandatory evidence | Readiness/inspection screens | PARTIAL | Medium | Missing/blocked evidence is surfaced, but not consistently at requirement level. |
| UI avoids implying AI output is final approved compliance | `frontend/components/screens/document-draft-review-screen.tsx`, indicator detail AI sections | PASS | Low | The draft/review language is appropriately advisory. |
| Sidebar/navigation exposes correct major workflows | `frontend/components/layout/sidebar.tsx`, `frontend/components/layout/topbar.tsx` | PASS | Low | Navigation is understandable. |
| UI remains understandable for non-technical accreditation users | Worklist/readiness/inspection pages | PASS | Medium | Good operational framing, but requirement bridge needs a dedicated visual matrix. |

### Frontend Assessment

The frontend is aligned to the workflow family:

- projects
- worklist
- readiness
- inspection
- print-pack
- exports

But it still reads as an indicator-centric execution app, not a fully explicit evidence-requirement fulfillment console. That is the main UI gap remaining.

