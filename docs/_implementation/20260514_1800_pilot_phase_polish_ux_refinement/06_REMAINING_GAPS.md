# Remaining Gaps - Pilot-Phase Polish & UX Refinement Sprint

## 1. Advanced CAPA Workflow Dashboards
- **Gap:** The current implementation integrates CAPA initialization directly into the Indicator Detail screen. However, a dedicated global "CAPA Board" or "My CAPA Tasks" view (as requested in the initial plan) is still required for high-level management review.
- **Recommendation:** Implement a dedicated `/projects/:projectId/capa-board` route in a fast-follow sprint.

## 2. Notification System
- **Gap:** No active notifications (email or in-app alerts) for overdue CAPAs or recurring requirements.
- **Recommendation:** Post-pilot feature for broader operational rollout.

## 3. Production Media Storage Configuration
- **Gap:** The application currently relies on local disk storage (`/media`) for exports and uploaded evidence.
- **Recommendation:** Configure S3 (or equivalent) object storage integration for secure, distributed media management in production.
