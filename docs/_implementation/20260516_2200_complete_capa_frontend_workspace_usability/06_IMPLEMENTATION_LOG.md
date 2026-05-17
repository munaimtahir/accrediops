# Implementation Log

1. **Sprint Initialized:** Created all baseline markdown documents and ran backend/frontend verification tests. All baseline tests passed.
2. **UI Architecture & Journeys:** Designed route structure in `02_CAPA_UI_INFORMATION_ARCHITECTURE.md` and user flows in `03_CAPA_USER_JOURNEYS.md`.
3. **API Contracts:** Reviewed existing API definitions in `/api/projects/{projectId}/capas/`, `/api/projects/{projectId}/gaps/`, `/api/projects/{projectId}/capa-summary/`.
4. **Types Update:** Added `Gap` and `GapStatus` to `frontend/types/index.ts`.
5. **Hooks:** Implemented `useProjectGaps` in `frontend/lib/hooks/use-capa.ts` using `SWR`/`React-Query`.
6. **Open Gaps View:** Added an `OpenGapsView` tab directly within the `ProjectCapaWorkspaceScreen` component to display active gaps and allow initialization of CAPA.
7. **Indicator Detail Integration:** Modified the `RequiredEvidencePanel` mapping inside `IndicatorDetailScreen` to show inline tags indicating gap and CAPA statuses.
8. **Readiness Screen Integration:** Extended `ProjectReadinessScreen` to fetch CAPA blockers and display a list of CAPAs blocking the final export, as well as a warning metric.
9. **Export Screen Integration:** Extended `ProjectExportHistoryScreen` to disable governing export generation if CAPA export blockers exist. Added an informative CAPA report to the bottom of the history list.
10. **Testing & QA:**
    - Applied data-testids as requested across the UI surfaces (`gap-capa-dashboard`, `open-gaps-table`, `gap-row`, `capa-board`, `capa-card`, `capa-status-badge`, `capa-severity-badge`, `capa-export-blocker-badge`, `create-capa-button`, `submit-capa-button`, `close-capa-button`, `reject-capa-button`, `capa-detail-drawer`, `capa-blocker-list`, `readiness-capa-section`, `print-pack-capa-section`).
    - Verified functionality with backend (125/125 passing), frontend (54/54 passing), and E2E suites.
