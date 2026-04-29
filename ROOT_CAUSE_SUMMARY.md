# Root Cause Summary

## Issue A — Intermittent auth / route guard behavior
- Protected pages were guarded only by a client-side `AuthGuard`.
- Session state was trusted from client query cache, so route rendering and API auth state could drift.
- 401 handling was not centralized, so expired/invalid sessions were discovered late (on action), not at route-entry.
- Result: some protected pages could be reached visually before auth was resolved, and redirect behavior was inconsistent.

## Issue B — Framework import flow failure + 500 behavior
- Frontend import flow used manual framework metadata / CSV text inputs instead of project-bound file upload.
- Import contract was not aligned to project linkage (`project_id` + file), and expected validation outcomes were not consistently modeled as structured import responses.
- Project linkage and conflict handling were not part of the import contract, so import outcomes could be operationally ambiguous.
- Result: import UX was governance-unsafe, and expected bad inputs were not reliably surfaced in actionable, contract-aligned responses.

## Issue C — Django admin inaccessibility
- Django admin is mounted at `/django-admin/`, while `/admin` is used by the Next workbench.
- Path ambiguity caused operational access confusion.
- Result: admin access appeared broken from `/admin/` despite backend admin being healthy on `/django-admin/`.

## Shared vs separate causes
- **Shared surface:** routing/auth boundary management (frontend route protection and path ownership).
- **Separate implementation causes:**  
  1. Issue A was primarily route/auth-state architecture.  
  2. Issue B was frontend/backend contract mismatch in import flow.  
  3. Issue C was path ownership ambiguity between Next admin workspace and Django admin.
