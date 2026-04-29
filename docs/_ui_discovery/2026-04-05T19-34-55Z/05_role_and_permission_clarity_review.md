# Role and Permission Clarity Review

## Issues identified
- Disabled actions could appear broken when role restrictions applied.
- Non-admin routes/actions were gated correctly, but explanation was inconsistent across surfaces.

## Improvements implemented
- Added permission rationale text/titles for role-restricted actions:
  - create/manage/clone/project retrieval/export and indicator workflow controls.
- Added role guidance copy on key pages (projects/export/indicator/worklist).
- Preserved backend/API enforcement and existing denial behaviors.

## Allow/Deny clarity status
- **Allow paths:** clearer through explicit role context and grouped navigation.
- **Deny paths:** clearer through explanatory disabled-state cues and route-level guidance.

## Remaining gap
- Some denied actions still rely on title hover for explanation; dedicated inline helper text near every restricted control can be expanded in future work.
