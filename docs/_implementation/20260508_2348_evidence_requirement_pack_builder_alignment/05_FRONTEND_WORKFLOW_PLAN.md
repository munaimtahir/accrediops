# 05 — Frontend Workflow Plan

## Goals
- Show requirement-row level data, not only indicator-level evidence text/counts.
- Keep current screens and strengthen them.

## Planned UI updates
1. Extend types with `EvidenceRequirement` and `ProjectEvidenceRequirement`.
2. Add hooks for requirement CRUD and fulfillment updates.
3. Indicator detail:
   - Render requirement list rows in Required Evidence panel.
   - Show per-row status and requirement flags.
4. Evidence form:
   - Allow optional linkage to a requirement row.
5. Draft surfaces:
   - Show/link requirement row where applicable.
6. Readiness/pack screens:
   - Include requirement totals: approved/missing/partial/submitted/rejected.

