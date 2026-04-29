# User Journey Map

## Journey 1 — Create project → initialize → open
- **Entry point:** `/projects` → top header CTA + sticky “Primary action” panel.
- **Flow:** Open create modal → fill project + framework → submit → redirected to `/projects/{id}`.
- **Required role:** ADMIN/LEAD (create); others view-only.
- **UI clarity:** **Clear**
- **Missing affordances:** None critical after sticky CTA + disabled rationale.
- **Errors/dead ends:** Non-privileged users blocked by disabled CTA and inline message.
- **Cognitive load:** **Low**

## Journey 2 — Navigate project → indicators → perform actions
- **Entry point:** `/projects/{id}` → “Go to worklist”, then indicator tile.
- **Flow:** Open worklist → open indicator detail → section nav (Readiness/Summary/Actions/Evidence/Recurring/AI/Governance) → execute command dialogs.
- **Required role:** Mixed by action (OWNER/REVIEWER/APPROVER/ADMIN gates).
- **UI clarity:** **Moderate → Clear** after section ordering and role hints.
- **Missing affordances:** Needed stronger status/allowed-action framing per section (implemented).
- **Errors/dead ends:** Disabled commands without reason were a prior risk; now addressed inline.
- **Cognitive load:** **Medium**

## Journey 3 — Evidence upload → review → approval
- **Entry point:** Indicator detail → Evidence section.
- **Flow:** Add evidence modal → list updates → review modal (validity/completeness/approval) → save.
- **Required role:** Add/Edit OWNER/LEAD/ADMIN; Review REVIEWER/APPROVER/LEAD/ADMIN.
- **UI clarity:** **Clear**
- **Missing affordances:** Added evidence approval semantic badge and role hints.
- **Errors/dead ends:** Permission denial handled through disabled control + explanatory hint.
- **Cognitive load:** **Medium**

## Journey 4 — Recurring submission → approval/rejection
- **Entry point:** `/projects/{id}/recurring` or indicator Recurring section.
- **Flow:** Submit instance (text + evidence link) → approve/reject via indicator.
- **Required role:** Submit OWNER/LEAD/ADMIN; Approve REVIEWER/APPROVER/LEAD/ADMIN.
- **UI clarity:** **Clear**
- **Missing affordances:** Indicator recurring used to rely on numeric evidence IDs; dropdown now present.
- **Errors/dead ends:** Role-gated controls now consistently explained.
- **Cognitive load:** **Medium**

## Journey 5 — Admin override → audit visibility
- **Entry point:** Indicator Actions (Reopen), then `/admin/overrides` and `/admin/audit`.
- **Flow:** Reopen via reason-required command → verify state transition → verify audit rows.
- **Required role:** Reopen ADMIN only; audit/override screens admin-only nav visibility.
- **UI clarity:** **Clear**
- **Missing affordances:** Needed stricter admin navigation separation from non-admin paths (implemented).
- **Errors/dead ends:** Non-admin denied by disabled controls and route-level messaging.
- **Cognitive load:** **Medium**

## Journey 6 — Export → history → status reflection
- **Entry point:** `/projects/{id}/exports` via project overview.
- **Flow:** Select export type → generate → history row shows status/warnings.
- **Required role:** Generate ADMIN/LEAD; others can view with guidance.
- **UI clarity:** **Clear**
- **Missing affordances:** Added lifecycle guidance and role rationale inline.
- **Errors/dead ends:** Unauthorized users now see explicit restriction guidance.
- **Cognitive load:** **Low**
