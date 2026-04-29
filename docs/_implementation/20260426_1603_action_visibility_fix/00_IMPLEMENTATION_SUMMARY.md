# Action Visibility Fix Summary

- Implementation folder: `docs/_implementation/20260426_1603_action_visibility_fix/`
- Scope: first-pass usability and permission-alignment fixes from the truth map only
- No changes made to Caddy, DNS, comments API, evidence delete, notifications, uploads, or Lab/FMS

## Delivered

- Added visible `Open full detail` and `Open AI Action Center` entry points inside `IndicatorDrawer`.
- Added `?panel=ai` deep-link support on `/project-indicators/:id`.
- Kept AI advisory-only. No workflow mutation was added to AI generation or AI acceptance.
- Added backend-derived indicator `capabilities` so the frontend stops using broad role-only action gating on indicator detail and drawer screens.
- Restricted print-pack and project client-profile project pages to the same effective role model already enforced by backend APIs.
- Changed admin overrides so `LEAD` can still view the page/history but cannot see execution controls that backend denies.
- Removed the misleading duplicate `Return` action from indicator detail and retained the single admin-only `Reopen` workflow.

## Outcome

- AI visibility status moved from `INVISIBLE_UI` to `MATCHED_E2E` for the primary worklist flow.
- Assignment-aware permission mismatches were reduced on the indicator drawer and indicator detail surfaces.
- Page-level role mismatches for print pack, client profile, and admin overrides were corrected in visible UI.
