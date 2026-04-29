# Rerun And Overwrite Policy

Default mode: `unclassified_only`.

Behavior:

- `UNCLASSIFIED`: can be classified by default.
- `AI_SUGGESTED`: can be reclassified with `unreviewed_only` or `selected`.
- `NEEDS_REVIEW`: can be reclassified with `unreviewed_only` or `selected`.
- `HUMAN_REVIEWED`: protected by default.
- `MANUALLY_CHANGED`: protected by default.

Force overwrite:

- Requires `mode=force_all`.
- Requires `confirm_force=true`.
- Human-reviewed/manually changed rows are still protected unless `overwrite_human_reviewed=true`.
- `overwrite_human_reviewed=true` with force mode is ADMIN-only.

The frontend default checkbox for overwriting human-reviewed/manually changed classifications is unchecked.
