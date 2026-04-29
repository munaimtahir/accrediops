# Indicator Drawer Model (Primary Update Surface)

## Purpose
Make indicator updates fast and operator-focused from card/worklist context while preserving governed command endpoints and role enforcement.

## Drawer Sections
1. **Summary** — status/priority/recurring snapshot, ownership, due date.
2. **Evidence** — list, approval state semantics, add/review actions.
3. **Recurring** — instance list, submit/approve actions, status semantics.
4. **Comments / Notes** — working-state updates.
5. **Review / Governance** — status history/audit/AI output counts and governance reminders.
6. **Actions** — Start, Send for Review, Mark as Met, Reopen (role/readiness-gated).

## Data Sources
- `useIndicator`
- `useEvidence`
- `useAIOutputs`
- existing mutation hooks for evidence review/add, recurring submit/approve, command actions, working-state updates.

## Governance + Roles
- Command-based transitions preserved (no direct status mutation).
- Reopen remains ADMIN-only.
- Mark as Met gated by role and readiness.
- Evidence/recurring permissions remain role-gated and surfaced via permission hints.

## Fallback Behavior
- Full route `/project-indicators/[id]` remains available for deep audit/history review and support flows.

## User Mental Model
- Select indicator card.
- Update evidence/recurring/notes/action in one side panel.
- Stay in the same workspace context and continue with next indicator quickly.

