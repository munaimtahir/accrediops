# Frontend Classification UI

Route:

- `/admin/frameworks/classification`
- Supports `?framework=<id>`.

Entry points:

- Admin Settings > Framework Setup > Indicator Classification
- Framework management page action button
- Import success toast now prompts users to run classification when ready

Screen features:

- Framework picker
- Summary cards: total, unclassified, needs review, reviewed
- Run AI Classification
- Reclassify Selected
- Reclassify Unreviewed
- Force Reclassify All confirmation panel
- Bulk Approve Selected
- Reset Filters
- Saved-field filters for all four axes plus confidence/status/search/area
- Quick filter chips
- Editable table dropdowns for evidence type, AI assistance, frequency, and primary action
- Row save and approve actions

The screen calls AI only through explicit run/reclassify buttons.
