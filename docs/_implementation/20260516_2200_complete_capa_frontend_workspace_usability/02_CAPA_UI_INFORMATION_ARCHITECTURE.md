# CAPA UI Information Architecture

## Route Structure
To maintain a cohesive project experience, the entire CAPA workspace will be implemented under a single top-level route with internal tabs:
- **Base Route:** `/projects/[projectId]/gap-capa`

### Tabs
1. **CAPA Dashboard:** High-level summary cards (Open Gaps, In Progress CAPA, Export Blockers, etc.)
2. **Open Gaps:** Table view of all gaps needing attention or conversion to CAPA.
3. **CAPA Board:** Kanban-style or simple column board grouping CAPAs by status (Open, In Progress, Submitted, Closed, Rejected).
4. **My CAPA Tasks:** Focused list of CAPA records assigned to the current user or awaiting their review.

## Component Structure

### Pages
- `app/projects/[projectId]/gap-capa/page.tsx`: The main container managing the state for the active tab and rendering the respective sub-components.

### Components
- **Dashboard:** `components/capa/Dashboard.tsx`
- **Open Gaps Table:** `components/capa/OpenGapsTable.tsx`
- **CAPA Board:** `components/capa/CapaBoard.tsx`
- **My Tasks:** `components/capa/MyCapaTasks.tsx`
- **CAPA Detail Drawer:** `components/capa/CapaDetailDrawer.tsx` (slides in from the right when a CAPA is selected)
- **Modals:**
  - `components/capa/modals/CreateGapModal.tsx`
  - `components/capa/modals/CreateCapaModal.tsx`
  - `components/capa/modals/SubmitCapaModal.tsx`
  - `components/capa/modals/CloseCapaModal.tsx`
  - `components/capa/modals/RejectCapaModal.tsx`
- **Shared UI:**
  - `CapaStatusBadge.tsx`
  - `CapaSeverityBadge.tsx`
  - `ExportBlockerBadge.tsx`

## Integration Points
- **Indicator Detail (`components/projects/ProjectIndicatorDetail.tsx`):** Add Gap/CAPA badges and quick actions to evidence requirement rows.
- **Readiness Screen (`app/projects/[projectId]/readiness/page.tsx`):** Add CAPA blockers section.
- **Print-Pack / Export (`app/projects/[projectId]/export/page.tsx`):** Add CAPA report and disable ZIP generation if blockers exist.
