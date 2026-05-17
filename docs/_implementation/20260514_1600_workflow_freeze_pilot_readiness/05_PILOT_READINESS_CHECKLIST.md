# Pilot Readiness Checklist

This checklist assesses the system's readiness for a controlled pilot or demo.

| Category | Item | Status | Notes |
|---|---|---|---|
| **Core Workflow** | End-to-end indicator lifecycle | Ready | Verified by `30_phc_lab_framework_full_workflow.spec.ts`. |
| | Multi-role enforcement (Admin/Lead/Owner/Reviewer/Approver) | Ready | RBAC logic verified in backend and E2E. |
| **Evidence Management** | Multi-source support (Upload, Text, URL) | Ready | All sources functional and verified. |
| | Linking evidence to explicit requirements | Ready | Fixed bug in `create_evidence_item` during this sprint. |
| | Review and Approval status tracking | Ready | Fixed bug in `review_evidence_item` during this sprint. |
| **Gaps & CAPA** | Automated Gap creation | Ready | Works for missing/rejected mandatory evidence. |
| | CAPA lifecycle (Open -> Submitted -> Closed) | Mostly ready | Backend stable; Frontend MVP works but needs polish. |
| **Recurring Work** | Recurring instance generation | Ready | Verified with DAILY frequency in PHC LAB seed. |
| | Submission/Approval in queue | Ready | 15/15 targeted E2E tests passing. |
| **Readiness & Export** | Readiness logic (blockers/flags) | Ready | Accurately reflects evidence/CAPA/recurring state. |
| | Final ZIP Inspection Pack generation | Ready | Real data included; folder structure standardized. |
| **Testing** | Backend unit/integration coverage | Ready | 141 tests passing (83% total, 79% stmts). |
| | Frontend unit/integration coverage | Ready | 54 tests passing. |
| | Playwright E2E coverage | Ready | 80 tests passing (100% success rate). |
| **Demo Readiness** | Deterministic seed data (PHC LAB) | Ready | `seed_e2e_state` command is stable. |
| | Operator guidance/toasts/UI clarity | Mostly ready | Toasts optimized; guidance text verified. |

## Pilot Demo Script

1. **Setup**: Run `python3 manage.py seed_e2e_state --password x --clean-e2e-records --ensure-client --ensure-project --initialize-project`.
2. **Login**: Login as `pw_admin`.
3. **Overview**: Navigate to the "E2E Lab Project". Show the overview with status counts.
4. **Worklist**: Open the "Project worklist". Show indicators grouped by Area and Standard.
5. **Indicator Work**:
    - Open `IND-001`.
    - Add evidence (Text Note) for the mandatory requirement.
    - Start the indicator.
    - Switch role or use Admin override to Review and Approve the evidence.
    - Mark the indicator as MET.
6. **Recurring**: Open the "Recurring evidence queue". Show the DAILY instances for `IND-004`. Submit one.
7. **Readiness**: Open the "Readiness" view. Show how blockers (e.g. `IND-002` missing evidence) are listed.
8. **Export**: Navigate to "Exports". Try to generate a ZIP (will be blocked if blockers remain). Fulfill blockers and then generate.
9. **Verification**: Download the ZIP and show the structured folders and CSV/Markdown reports.
