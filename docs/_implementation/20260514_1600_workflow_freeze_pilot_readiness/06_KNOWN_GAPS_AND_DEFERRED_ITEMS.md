# Known Gaps and Deferred Items

This document categorizes remaining items that were not completed during the primary workflow sprints.

## A. Must fix before Pilot
*None identified as critical blockers.* The system is stable and the core workflow is fully functional.

## B. Should fix during Pilot (Fast-follow)
1. **Frontend CAPA creation modals**: While the backend supports manual CAPA creation from Gaps, the frontend UI for this could be more intuitive.
2. **Audit Log UI**: An admin-facing audit log UI exists, but it could be enhanced for better filtering and readability.
3. **Data-testid Hardening**: Add more `data-testid` attributes to key UI elements to further stabilize E2E tests against CSS/structure changes.

## C. Can defer after Pilot
1. **Advanced CAPA Analytics**: Trend analysis and risk dashboards for CAPAs.
2. **Notification System**: Reminders for overdue evidence and recurring work.
3. **Production Security Hardening**: Final review of media storage policies (e.g., S3 integration).
4. **Large-scale performance**: Optimization for projects with >500 indicators.

## D. Future Advanced Features
1. **Automated AI Evidence Matching**: Using AI to suggest which evidence files fulfill which requirements.
2. **Multi-framework cross-mapping**: mapping one piece of evidence to indicators in different frameworks.
