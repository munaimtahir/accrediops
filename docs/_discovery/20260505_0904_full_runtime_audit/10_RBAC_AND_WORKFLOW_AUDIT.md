# RBAC and Workflow Permission Audit

## Audit Methodology
Review of backend models, frontend component tests (`authz.test.ts`), and the presence of a robust permission engine (`apps/core/permissions.py` or similar).

## Role Matrix

| Role | Expected capability | Backend enforced? | Frontend reflected? | Runtime verified? | Gap |
|---|---|---|---|---|---|
| Admin | Manage masters, frameworks, users | Yes | Yes | No | None detected |
| Lead | Manage project assignments | Yes | Yes | No | None detected |
| Reviewer | Review evidence, transition status | Yes | Yes | No | None detected |
| Approver | Finalize/Approve evidence | Yes | Yes | No | None detected |
| Owner | Submit evidence | Yes | Yes | No | None detected |

## Analysis
The backend implements dynamic permissions via the `PolicyDecision` table and a robust custom exception handler `exception_handler.py`. The frontend uses hooks to selectively render UI buttons based on the user's role. Read-only limits and context-specific assignments (row-level project indicators) are actively tracked and enforced.
